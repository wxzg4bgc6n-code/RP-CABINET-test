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
