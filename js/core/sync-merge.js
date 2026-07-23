/*
 * RP CABINET v79 — очередь пользовательских операций.
 *
 * Firebase хранит каноническое состояние. localStorage хранит только:
 * 1) кэш последнего показанного состояния;
 * 2) операции, которые пользователь реально совершил и которые ещё не
 *    подтверждены облачной транзакцией.
 *
 * Открытие или обновление страницы не создаёт операцию и поэтому никогда не
 * может отправить устаревший локальный снимок поверх более нового облачного.
 */

const PROFILE_SYNC_GROUPS={
  name:['name'],
  style:['style'],
  context:['project','path','org','section','level','configured'],
  pins:['pinnedDepartmentBlocks','pinnedAcademyBlocks'],
  account:['account']
};
const PROFILE_MUTATION_QUEUE_KEY='kiri:rp-cabinet:v79:mutation-queue';
const PROFILE_MUTATION_QUEUE_VERSION=1;

function cloneProfileSyncValue(value){
  if(value===undefined) return undefined;
  try{return JSON.parse(JSON.stringify(value));}catch(e){return value;}
}

function profileSyncGroupSnapshot(state,fields){
  const source=state&&typeof state==='object'?state:{};
  const snapshot={};
  fields.forEach(field=>{
    snapshot[field]=Object.prototype.hasOwnProperty.call(source,field)
      ? cloneProfileSyncValue(source[field])
      : null;
  });
  try{return JSON.stringify(snapshot);}catch(e){return '';}
}

function rememberProfileSyncBaseline(state){
  window.__profileSyncBaselineState=cloneProfileSyncValue(state)||{};
}

function profileMutationId(){
  const device=typeof getCloudDeviceId==='function'?getCloudDeviceId():'device';
  const session=window.__cloudSessionId||'session';
  return `${device}:${session}:${Date.now()}:${Math.random().toString(36).slice(2,10)}`;
}
function emptyProfileMutationQueue(){
  return {version:PROFILE_MUTATION_QUEUE_VERSION,operations:[]};
}
function currentProfileSyncBaseRevision(){
  const revision=Number(window.CloudSync?.lastAppliedRevision||0);
  return Number.isFinite(revision)&&revision>=0?revision:0;
}
function sanitizeProfileMutation(operation){
  if(!operation||typeof operation!=='object'||typeof operation.kind!=='string') return null;
  const clean=cloneProfileSyncValue(operation)||{};
  clean.id=typeof clean.id==='string'&&clean.id?clean.id:profileMutationId();
  clean.createdAt=Number(clean.createdAt||Date.now());
  const suppliedBase=Number(clean.baseRevision);
  clean.baseRevision=Number.isFinite(suppliedBase)&&suppliedBase>=0
    ? suppliedBase
    : currentProfileSyncBaseRevision();
  clean.supersedesIds=Array.isArray(clean.supersedesIds)
    ? [...new Set(clean.supersedesIds.filter(id=>typeof id==='string'&&id&&id!==clean.id))].slice(-40)
    : [];
  return clean;
}
function readPendingProfileSyncPatch(){
  try{
    const parsed=JSON.parse(localStorage.getItem(PROFILE_MUTATION_QUEUE_KEY)||'null');
    if(!parsed||parsed.version!==PROFILE_MUTATION_QUEUE_VERSION||!Array.isArray(parsed.operations)) return emptyProfileMutationQueue();
    return {
      version:PROFILE_MUTATION_QUEUE_VERSION,
      operations:parsed.operations.map(sanitizeProfileMutation).filter(Boolean)
    };
  }catch(e){return emptyProfileMutationQueue();}
}
function writePendingProfileSyncPatch(queue){
  const normalized=queue&&Array.isArray(queue.operations)
    ? {version:PROFILE_MUTATION_QUEUE_VERSION,operations:queue.operations.map(sanitizeProfileMutation).filter(Boolean)}
    : emptyProfileMutationQueue();
  try{
    if(!normalized.operations.length) localStorage.removeItem(PROFILE_MUTATION_QUEUE_KEY);
    else localStorage.setItem(PROFILE_MUTATION_QUEUE_KEY,JSON.stringify(normalized));
  }catch(e){console.warn('Mutation queue save failed',e);}
  return normalized;
}
function profileSyncPatchHasChanges(queue){
  return !!(queue&&Array.isArray(queue.operations)&&queue.operations.length);
}
function profileMutationTargetKey(operation){
  if(!operation) return '';
  if(operation.kind==='group') return `group:${operation.group}`;
  if(operation.kind==='task') return `task:${operation.contextKey}:${operation.task}`;
  if(operation.kind==='level') return `level:${operation.key}`;
  if(operation.kind==='proof') return `proof:${operation.contextKey}:${operation.task}`;
  if(operation.kind==='map') return `map:${operation.field}:${operation.key}`;
  return `${operation.kind}:${operation.id}`;
}
function enqueueProfileMutation(operation){
  const clean=sanitizeProfileMutation(operation);
  if(!clean) return readPendingProfileSyncPatch();
  const queue=readPendingProfileSyncPatch();
  const target=profileMutationTargetKey(clean);
  const next=[];
  let merged=false;
  queue.operations.forEach(existing=>{
    if(profileMutationTargetKey(existing)!==target){
      next.push(existing);
      return;
    }
    if(clean.kind==='group'){
      clean.values=Object.assign({},existing.values||{},clean.values||{});
    }
    clean.supersedesIds=[...new Set([
      ...(clean.supersedesIds||[]),
      existing.id,
      ...(existing.supersedesIds||[])
    ].filter(Boolean))].slice(-40);
    merged=true;
  });
  next.push(clean);
  /* Защита от бесконечного роста при очень долгом офлайне. Операции уже
   * уплотнены по цели, поэтому хвост содержит самое актуальное значение. */
  const compacted=next.length>2000?next.slice(-2000):next;
  return writePendingProfileSyncPatch({version:PROFILE_MUTATION_QUEUE_VERSION,operations:compacted});
}

function normalizedProgressContexts(state){
  const source=state?.progressByContext;
  return source&&typeof source==='object'&&!Array.isArray(source)?source:{};
}
function normalizedSelectedLevels(state){
  const source=state?.selectedLevelBySection;
  return source&&typeof source==='object'&&!Array.isArray(source)?source:{};
}
function normalizedProofContexts(state){
  const source=state?.proofsByContext;
  return source&&typeof source==='object'&&!Array.isArray(source)?source:{};
}
function normalizedReports(state){
  const source=state?.reportsByContext;
  return source&&typeof source==='object'&&!Array.isArray(source)?source:{};
}

function queueProfileGroupSyncMutation(group,values){
  if(!group||!PROFILE_SYNC_GROUPS[group]||!values||typeof values!=='object') return readPendingProfileSyncPatch();
  return enqueueProfileMutation({kind:'group',group,values:cloneProfileSyncValue(values)||{},id:profileMutationId(),createdAt:Date.now()});
}
function queueProfileTaskSyncMutation(state,task,completed){
  const contextKey=typeof progressContextKeyFor==='function'?progressContextKeyFor(state):'';
  if(!contextKey||!task) return readPendingProfileSyncPatch();
  return enqueueProfileMutation({kind:'task',contextKey,task:String(task),value:completed===true,id:profileMutationId(),createdAt:Date.now()});
}
function queueProfileLevelSyncMutation(key,value){
  if(!key) return readPendingProfileSyncPatch();
  return enqueueProfileMutation({kind:'level',key:String(key),value:typeof value==='string'?value:'',id:profileMutationId(),createdAt:Date.now()});
}
function queueProfileProofSyncMutation(contextKey,task,value){
  if(!contextKey||!task) return readPendingProfileSyncPatch();
  return enqueueProfileMutation({kind:'proof',contextKey:String(contextKey),task:String(task),value:value?cloneProfileSyncValue(value):null,id:profileMutationId(),createdAt:Date.now()});
}
function queueProfileMapSyncMutation(field,key,value){
  if(!field||!key) return readPendingProfileSyncPatch();
  return enqueueProfileMutation({kind:'map',field:String(field),key:String(key),value:value===undefined?null:cloneProfileSyncValue(value),id:profileMutationId(),createdAt:Date.now()});
}

function queuePendingProfileSyncDelta(baselineState,currentState,forceFull=false){
  const before=baselineState&&typeof baselineState==='object'?baselineState:{};
  const after=currentState&&typeof currentState==='object'?currentState:{};

  Object.entries(PROFILE_SYNC_GROUPS).forEach(([group,fields])=>{
    if(forceFull||profileSyncGroupSnapshot(before,fields)!==profileSyncGroupSnapshot(after,fields)){
      const values={};
      fields.forEach(field=>{
        values[field]=Object.prototype.hasOwnProperty.call(after,field)?cloneProfileSyncValue(after[field]):null;
      });
      queueProfileGroupSyncMutation(group,values);
    }
  });

  const beforeContexts=normalizedProgressContexts(before);
  const afterContexts=normalizedProgressContexts(after);
  new Set([...Object.keys(beforeContexts),...Object.keys(afterContexts)]).forEach(contextKey=>{
    const oldTasks=beforeContexts[contextKey]&&typeof beforeContexts[contextKey]==='object'?beforeContexts[contextKey]:{};
    const newTasks=afterContexts[contextKey]&&typeof afterContexts[contextKey]==='object'?afterContexts[contextKey]:{};
    new Set([...Object.keys(oldTasks),...Object.keys(newTasks)]).forEach(task=>{
      const oldValue=oldTasks[task]===true;
      const newValue=newTasks[task]===true;
      if((forceFull&&newValue)||oldValue!==newValue){
        enqueueProfileMutation({kind:'task',contextKey,task,value:newValue,id:profileMutationId(),createdAt:Date.now()});
      }
    });
  });

  const beforeLevels=normalizedSelectedLevels(before);
  const afterLevels=normalizedSelectedLevels(after);
  new Set([...Object.keys(beforeLevels),...Object.keys(afterLevels)]).forEach(key=>{
    const oldValue=typeof beforeLevels[key]==='string'?beforeLevels[key]:'';
    const newValue=typeof afterLevels[key]==='string'?afterLevels[key]:'';
    if((forceFull&&newValue)||oldValue!==newValue) queueProfileLevelSyncMutation(key,newValue);
  });

  const beforeProofs=normalizedProofContexts(before);
  const afterProofs=normalizedProofContexts(after);
  new Set([...Object.keys(beforeProofs),...Object.keys(afterProofs)]).forEach(contextKey=>{
    const oldProofs=beforeProofs[contextKey]&&typeof beforeProofs[contextKey]==='object'?beforeProofs[contextKey]:{};
    const newProofs=afterProofs[contextKey]&&typeof afterProofs[contextKey]==='object'?afterProofs[contextKey]:{};
    new Set([...Object.keys(oldProofs),...Object.keys(newProofs)]).forEach(task=>{
      const oldValue=oldProofs[task]||null;
      const newValue=newProofs[task]||null;
      if((forceFull&&newValue)||JSON.stringify(oldValue)!==JSON.stringify(newValue)) queueProfileProofSyncMutation(contextKey,task,newValue);
    });
  });

  const beforeReports=normalizedReports(before);
  const afterReports=normalizedReports(after);
  new Set([...Object.keys(beforeReports),...Object.keys(afterReports)]).forEach(key=>{
    const oldValue=beforeReports[key]||null;
    const newValue=afterReports[key]||null;
    if((forceFull&&newValue)||JSON.stringify(oldValue)!==JSON.stringify(newValue)) queueProfileMapSyncMutation('reportsByContext',key,newValue);
  });

  return readPendingProfileSyncPatch();
}

function applyProfileSyncPatch(baseState,queue){
  const result=cloneProfileSyncValue(baseState)||{};
  const operations=queue&&Array.isArray(queue.operations)?queue.operations:[];
  operations.forEach(operation=>{
    if(!operation||typeof operation!=='object') return;
    if(operation.kind==='group'){
      Object.entries(operation.values||{}).forEach(([field,value])=>{
        if(value===null||value===undefined) delete result[field];
        else result[field]=cloneProfileSyncValue(value);
      });
      return;
    }
    if(operation.kind==='task'){
      if(!result.progressByContext||typeof result.progressByContext!=='object'||Array.isArray(result.progressByContext)) result.progressByContext={};
      const tasks=result.progressByContext[operation.contextKey]&&typeof result.progressByContext[operation.contextKey]==='object'
        ? Object.assign({},result.progressByContext[operation.contextKey])
        : {};
      if(operation.value===true) tasks[operation.task]=true;
      else delete tasks[operation.task];
      result.progressByContext[operation.contextKey]=tasks;
      return;
    }
    if(operation.kind==='level'){
      if(!result.selectedLevelBySection||typeof result.selectedLevelBySection!=='object'||Array.isArray(result.selectedLevelBySection)) result.selectedLevelBySection={};
      if(operation.value) result.selectedLevelBySection[operation.key]=operation.value;
      else delete result.selectedLevelBySection[operation.key];
      return;
    }
    if(operation.kind==='proof'){
      if(!result.proofsByContext||typeof result.proofsByContext!=='object'||Array.isArray(result.proofsByContext)) result.proofsByContext={};
      const proofs=result.proofsByContext[operation.contextKey]&&typeof result.proofsByContext[operation.contextKey]==='object'
        ? Object.assign({},result.proofsByContext[operation.contextKey])
        : {};
      if(operation.value) proofs[operation.task]=cloneProfileSyncValue(operation.value);
      else delete proofs[operation.task];
      result.proofsByContext[operation.contextKey]=proofs;
      return;
    }
    if(operation.kind==='map'){
      if(!result[operation.field]||typeof result[operation.field]!=='object'||Array.isArray(result[operation.field])) result[operation.field]={};
      if(operation.value===null||operation.value===undefined) delete result[operation.field][operation.key];
      else result[operation.field][operation.key]=cloneProfileSyncValue(operation.value);
    }
  });

  const currentKey=typeof progressContextKeyFor==='function'?progressContextKeyFor(result):'';
  if(currentKey&&result.progressByContext&&Object.prototype.hasOwnProperty.call(result.progressByContext,currentKey)){
    result.tasks=cloneProfileSyncValue(result.progressByContext[currentKey])||{};
  }
  result.updatedAt=Date.now();
  return result;
}


/*
 * Применяет пакет внутри транзакции Firebase с защитой от двух видов отката:
 * 1) повтор уже подтверждённой операции после закрытия вкладки до локального ACK;
 * 2) старая офлайн-операция по той же цели, если эта цель уже менялась в более
 *    новой облачной ревизии.
 *
 * Несвязанные цели не блокируют друг друга: старая операция по задаче A не
 * мешает применить изменение задачи B.
 */
function applyProfileSyncPatchWithGuards(baseState,queue,serverMeta,commitRevision){
  let state=cloneProfileSyncValue(baseState)||{};
  const operations=queue&&Array.isArray(queue.operations)?queue.operations.map(sanitizeProfileMutation).filter(Boolean):[];
  const targetRevisions=Object.assign({},serverMeta?.targetRevisions||{});
  const targetMutationIds=Object.assign({},serverMeta?.targetMutationIds||{});
  const processedOrder=Array.isArray(serverMeta?.processedMutationIds)
    ? serverMeta.processedMutationIds.filter(id=>typeof id==='string'&&id)
    : [];
  const processed=new Set(processedOrder);
  const acceptedIds=[];
  const skippedIds=[];
  const revision=Math.max(1,Number(commitRevision||1));

  operations.forEach(operation=>{
    const target=profileMutationTargetKey(operation);
    if(processed.has(operation.id)){
      skippedIds.push(operation.id);
      return;
    }
    const targetRevision=Math.max(0,Number(targetRevisions[target]||0));
    const baseRevision=Math.max(0,Number(operation.baseRevision||0));
    const lastTargetMutationId=typeof targetMutationIds[target]==='string'?targetMutationIds[target]:'';
    const causallySupersedesLast=!!(lastTargetMutationId&&operation.supersedesIds.includes(lastTargetMutationId));
    if(targetRevision>baseRevision&&!causallySupersedesLast){
      processed.add(operation.id);
      processedOrder.push(operation.id);
      skippedIds.push(operation.id);
      return;
    }
    state=applyProfileSyncPatch(state,{version:PROFILE_MUTATION_QUEUE_VERSION,operations:[operation]});
    targetRevisions[target]=revision;
    targetMutationIds[target]=operation.id;
    processed.add(operation.id);
    processedOrder.push(operation.id);
    acceptedIds.push(operation.id);
  });

  const uniqueProcessed=[];
  const seen=new Set();
  for(let i=processedOrder.length-1;i>=0;i--){
    const id=processedOrder[i];
    if(seen.has(id)) continue;
    seen.add(id);
    uniqueProcessed.push(id);
    if(uniqueProcessed.length>=600) break;
  }
  uniqueProcessed.reverse();
  return {state,targetRevisions,targetMutationIds,processedMutationIds:uniqueProcessed,acceptedIds,skippedIds};
}

function acknowledgePendingProfileSyncPatch(sentQueue){
  const sentIds=new Set((sentQueue?.operations||[]).map(operation=>operation?.id).filter(Boolean));
  if(!sentIds.size) return false;
  const current=readPendingProfileSyncPatch();
  current.operations=current.operations.filter(operation=>!sentIds.has(operation.id));
  writePendingProfileSyncPatch(current);
  return true;
}
