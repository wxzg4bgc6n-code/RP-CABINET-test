/*
 * Разрешение конфликтов между устройствами.
 * Профиль синхронизируется логическими группами, поэтому старое имя с телефона
 * больше не должно перезаписывать новый ник с ПК вместе с несвязанным прогрессом.
 */
const PROFILE_SYNC_GROUPS=Object.freeze({
  name:['name'],
  style:['style'],
  context:['project','path','org','section','level','configured'],
  progress:['tasks','progressByContext','selectedLevelBySection'],
  pins:['pinnedDepartmentBlocks','pinnedAcademyBlocks'],
  account:['account']
});

function cloneProfileSyncValue(value){
  if(value===undefined) return undefined;
  try{return JSON.parse(JSON.stringify(value));}
  catch(e){return value;}
}

function profileSyncGroupSnapshot(state,fields){
  const source=state && typeof state==='object' ? state : {};
  return JSON.stringify(fields.map(field=>[field,source[field]]));
}

function profileSyncGroupTime(state,group){
  const own=Number(state?.syncFieldUpdatedAt?.[group]||0);
  if(Number.isFinite(own) && own>0) return own;
  const fallback=Number(state?.updatedAt||0);
  return Number.isFinite(fallback) && fallback>0 ? fallback : 0;
}

function normalizeProfileSyncTimes(target,incoming){
  const source=incoming && typeof incoming==='object' ? incoming : {};
  const raw=source.syncFieldUpdatedAt && typeof source.syncFieldUpdatedAt==='object' && !Array.isArray(source.syncFieldUpdatedAt)
    ? source.syncFieldUpdatedAt
    : {};
  const fallback=Number(source.updatedAt||0);
  const normalized={};
  Object.keys(PROFILE_SYNC_GROUPS).forEach(group=>{
    const own=Number(raw[group]||0);
    normalized[group]=Number.isFinite(own) && own>0
      ? own
      : (Number.isFinite(fallback) && fallback>0 ? fallback : 0);
  });
  target.syncFieldUpdatedAt=normalized;
  return target;
}

function rememberProfileSyncBaseline(state){
  const baseline={};
  Object.entries(PROFILE_SYNC_GROUPS).forEach(([group,fields])=>{
    baseline[group]=profileSyncGroupSnapshot(state,fields);
  });
  window.__profileSyncBaseline=baseline;
  window.__profileSyncBaselineState=cloneProfileSyncValue(state)||{};
}

function touchChangedProfileSyncGroups(state,requestedTime){
  if(!state || typeof state!=='object') return [];
  if(!state.syncFieldUpdatedAt || typeof state.syncFieldUpdatedAt!=='object') state.syncFieldUpdatedAt={};
  const baseline=window.__profileSyncBaseline && typeof window.__profileSyncBaseline==='object'
    ? window.__profileSyncBaseline
    : null;
  const highestKnown=Math.max(
    Number(state.updatedAt||0),
    ...Object.values(state.syncFieldUpdatedAt).map(value=>Number(value||0)).filter(Number.isFinite),
    0
  );
  let stamp=Math.max(Number(requestedTime||0),highestKnown+1,Date.now());
  const changed=[];
  Object.entries(PROFILE_SYNC_GROUPS).forEach(([group,fields])=>{
    const current=profileSyncGroupSnapshot(state,fields);
    if(!baseline || baseline[group]!==current){
      state.syncFieldUpdatedAt[group]=stamp++;
      changed.push(group);
    }
  });
  return changed;
}

function mergeSyncedProfileStates(localState,remoteState){
  const local=cloneProfileSyncValue(localState)||{};
  const remote=cloneProfileSyncValue(remoteState)||{};
  normalizeProfileSyncTimes(local,localState||{});
  normalizeProfileSyncTimes(remote,remoteState||{});
  const merged=cloneProfileSyncValue(remote)||{};
  const mergedTimes={};
  const keptLocalGroups=[];
  const keptRemoteGroups=[];

  Object.entries(PROFILE_SYNC_GROUPS).forEach(([group,fields])=>{
    const localTime=profileSyncGroupTime(local,group);
    const remoteTime=profileSyncGroupTime(remote,group);
    const keepLocal=localTime>remoteTime;
    const source=keepLocal ? local : remote;
    fields.forEach(field=>{
      if(Object.prototype.hasOwnProperty.call(source,field)) merged[field]=cloneProfileSyncValue(source[field]);
      else delete merged[field];
    });
    mergedTimes[group]=keepLocal ? localTime : remoteTime;
    (keepLocal ? keptLocalGroups : keptRemoteGroups).push(group);
  });

  merged.syncFieldUpdatedAt=mergedTimes;
  merged.updatedAt=Math.max(Number(local.updatedAt||0),Number(remote.updatedAt||0),...Object.values(mergedTimes),0);
  return {
    state:merged,
    keptLocal:keptLocalGroups.length>0,
    keptLocalGroups,
    keptRemoteGroups
  };
}

/*
 * v69: синхронизация действий вместо сравнения часов устройств.
 *
 * Телефон и ПК могут иметь разное системное время. Поэтому локальная правка
 * сначала превращается в маленькую накопительную операцию: изменённый ник,
 * конкретная галочка конкретной ступени и т.п. В облачной транзакции эта
 * операция накладывается на самую свежую серверную версию профиля. Старый
 * снимок телефона больше не заменяет весь прогресс целиком.
 */
const PROFILE_PENDING_PATCH_KEY='kiri:rp-cabinet:v69:pending-sync-patch';

function emptyProfileSyncPatch(){
  return {version:2,sequence:0,groups:{},progress:{contexts:{},levels:{}}};
}

function readPendingProfileSyncPatch(){
  try{
    const parsed=JSON.parse(localStorage.getItem(PROFILE_PENDING_PATCH_KEY)||'null');
    if(!parsed || parsed.version!==2) return null;
    parsed.groups=parsed.groups&&typeof parsed.groups==='object'?parsed.groups:{};
    parsed.progress=parsed.progress&&typeof parsed.progress==='object'?parsed.progress:{};
    parsed.progress.contexts=parsed.progress.contexts&&typeof parsed.progress.contexts==='object'?parsed.progress.contexts:{};
    parsed.progress.levels=parsed.progress.levels&&typeof parsed.progress.levels==='object'?parsed.progress.levels:{};
    return parsed;
  }catch(e){return null;}
}

function writePendingProfileSyncPatch(patch){
  try{
    if(!patch){
      localStorage.removeItem(PROFILE_PENDING_PATCH_KEY);
      return;
    }
    localStorage.setItem(PROFILE_PENDING_PATCH_KEY,JSON.stringify(patch));
  }catch(e){console.warn('Pending sync patch save failed',e);}
}

function profileSyncPatchHasChanges(patch){
  if(!patch) return false;
  if(Object.keys(patch.groups||{}).length) return true;
  if(Object.keys(patch.progress?.levels||{}).length) return true;
  return Object.values(patch.progress?.contexts||{}).some(tasks=>tasks&&Object.keys(tasks).length);
}

function normalizedProgressContexts(state){
  const source=state?.progressByContext;
  return source&&typeof source==='object'&&!Array.isArray(source)?source:{};
}

function normalizedSelectedLevels(state){
  const source=state?.selectedLevelBySection;
  return source&&typeof source==='object'&&!Array.isArray(source)?source:{};
}

function buildProfileSyncDelta(baselineState,currentState,forceFull=false){
  const before=baselineState&&typeof baselineState==='object'?baselineState:{};
  const after=currentState&&typeof currentState==='object'?currentState:{};
  const patch=emptyProfileSyncPatch();
  const scalarGroups={
    name:['name'],
    style:['style'],
    context:['project','path','org','section','level','configured'],
    pins:['pinnedDepartmentBlocks','pinnedAcademyBlocks'],
    account:['account']
  };

  Object.entries(scalarGroups).forEach(([group,fields])=>{
    if(forceFull || profileSyncGroupSnapshot(before,fields)!==profileSyncGroupSnapshot(after,fields)){
      patch.groups[group]={};
      fields.forEach(field=>{
        patch.groups[group][field]=Object.prototype.hasOwnProperty.call(after,field)
          ? cloneProfileSyncValue(after[field])
          : null;
      });
    }
  });

  const beforeContexts=normalizedProgressContexts(before);
  const afterContexts=normalizedProgressContexts(after);
  const contextKeys=new Set([...Object.keys(beforeContexts),...Object.keys(afterContexts)]);
  contextKeys.forEach(contextKey=>{
    const oldTasks=beforeContexts[contextKey]&&typeof beforeContexts[contextKey]==='object'?beforeContexts[contextKey]:{};
    const newTasks=afterContexts[contextKey]&&typeof afterContexts[contextKey]==='object'?afterContexts[contextKey]:{};
    const taskKeys=new Set([...Object.keys(oldTasks),...Object.keys(newTasks)]);
    taskKeys.forEach(task=>{
      const oldValue=oldTasks[task]===true;
      const newValue=newTasks[task]===true;
      if(forceFull ? newValue : oldValue!==newValue){
        if(!patch.progress.contexts[contextKey]) patch.progress.contexts[contextKey]={};
        patch.progress.contexts[contextKey][task]=newValue;
      }
    });
  });

  const beforeLevels=normalizedSelectedLevels(before);
  const afterLevels=normalizedSelectedLevels(after);
  new Set([...Object.keys(beforeLevels),...Object.keys(afterLevels)]).forEach(key=>{
    const oldValue=typeof beforeLevels[key]==='string'?beforeLevels[key]:'';
    const newValue=typeof afterLevels[key]==='string'?afterLevels[key]:'';
    if(forceFull ? !!newValue : oldValue!==newValue) patch.progress.levels[key]=newValue||null;
  });
  return patch;
}

function mergePendingProfileSyncPatches(previous,next){
  const merged=previous?cloneProfileSyncValue(previous):emptyProfileSyncPatch();
  const incoming=next||emptyProfileSyncPatch();
  merged.version=2;
  merged.sequence=Math.max(Number(merged.sequence||0),Number(incoming.sequence||0))+1;
  merged.groups=Object.assign({},merged.groups||{},cloneProfileSyncValue(incoming.groups)||{});
  merged.progress=merged.progress||{contexts:{},levels:{}};
  merged.progress.contexts=merged.progress.contexts||{};
  Object.entries(incoming.progress?.contexts||{}).forEach(([contextKey,tasks])=>{
    merged.progress.contexts[contextKey]=Object.assign({},merged.progress.contexts[contextKey]||{},cloneProfileSyncValue(tasks)||{});
  });
  merged.progress.levels=Object.assign({},merged.progress.levels||{},cloneProfileSyncValue(incoming.progress?.levels)||{});
  merged.changedAt=Date.now();
  return merged;
}

function queuePendingProfileSyncDelta(baselineState,currentState,forceFull=false){
  const delta=buildProfileSyncDelta(baselineState,currentState,forceFull);
  if(!profileSyncPatchHasChanges(delta)) return readPendingProfileSyncPatch();
  const merged=mergePendingProfileSyncPatches(readPendingProfileSyncPatch(),delta);
  writePendingProfileSyncPatch(merged);
  return merged;
}

function applyProfileSyncPatch(baseState,patch){
  const result=cloneProfileSyncValue(baseState)||{};
  if(!patch) return result;
  Object.values(patch.groups||{}).forEach(values=>{
    Object.entries(values||{}).forEach(([field,value])=>{
      if(value===null || value===undefined) delete result[field];
      else result[field]=cloneProfileSyncValue(value);
    });
  });

  if(!result.progressByContext || typeof result.progressByContext!=='object' || Array.isArray(result.progressByContext)) result.progressByContext={};
  Object.entries(patch.progress?.contexts||{}).forEach(([contextKey,tasks])=>{
    const target=result.progressByContext[contextKey]&&typeof result.progressByContext[contextKey]==='object'
      ? Object.assign({},result.progressByContext[contextKey])
      : {};
    Object.entries(tasks||{}).forEach(([task,value])=>{
      if(value===true) target[task]=true;
      else delete target[task];
    });
    result.progressByContext[contextKey]=target;
  });

  if(!result.selectedLevelBySection || typeof result.selectedLevelBySection!=='object' || Array.isArray(result.selectedLevelBySection)) result.selectedLevelBySection={};
  Object.entries(patch.progress?.levels||{}).forEach(([key,value])=>{
    if(typeof value==='string'&&value) result.selectedLevelBySection[key]=value;
    else delete result.selectedLevelBySection[key];
  });

  const currentKey=typeof progressContextKeyFor==='function'?progressContextKeyFor(result):'';
  if(currentKey&&Object.prototype.hasOwnProperty.call(result.progressByContext,currentKey)){
    result.tasks=cloneProfileSyncValue(result.progressByContext[currentKey])||{};
  }
  const now=Date.now();
  if(!result.syncFieldUpdatedAt || typeof result.syncFieldUpdatedAt!=='object') result.syncFieldUpdatedAt={};
  Object.keys(patch.groups||{}).forEach(group=>{result.syncFieldUpdatedAt[group]=now;});
  if(Object.keys(patch.progress?.contexts||{}).length||Object.keys(patch.progress?.levels||{}).length) result.syncFieldUpdatedAt.progress=now;
  result.updatedAt=now;
  return result;
}

function acknowledgePendingProfileSyncPatch(sentPatch){
  const current=readPendingProfileSyncPatch();
  if(!current) return true;
  if(Number(current.sequence||0)===Number(sentPatch?.sequence||0)){
    writePendingProfileSyncPatch(null);
    return true;
  }
  return false;
}
