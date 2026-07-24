/*
 * RP CABINET v80 — чистая модель облачного состояния.
 *
 * Важный принцип:
 * - Firebase хранит каноническое состояние;
 * - localStorage — только последний показанный кэш;
 * - открытие/обновление страницы никогда не создаёт облачную запись;
 * - каждое пользовательское изменение записывается точечно в собственный
 *   Firestore-путь, поэтому разные устройства не перетирают несвязанные поля.
 */

const REALTIME_SCHEMA_VERSION=80;
const REALTIME_CORE_FIELDS=[
  'ready','name','project','path','style','org','section','level','configured'
];

function realtimeClone(value){
  if(value===undefined) return undefined;
  try{return JSON.parse(JSON.stringify(value));}catch(error){return value;}
}

function realtimeEncodeKey(value){
  const bytes=new TextEncoder().encode(String(value??''));
  let binary='';
  bytes.forEach(byte=>{binary+=String.fromCharCode(byte);});
  return 'k_'+btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function realtimeDecodeKey(value){
  try{
    const raw=String(value??'').replace(/^k_/,'').replace(/-/g,'+').replace(/_/g,'/');
    const padded=raw+'='.repeat((4-raw.length%4)%4);
    const binary=atob(padded);
    const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }catch(error){return String(value??'');}
}

function realtimeCleanTasks(tasks){
  const result={};
  if(!tasks||typeof tasks!=='object'||Array.isArray(tasks)) return result;
  Object.entries(tasks).forEach(([task,done])=>{if(done===true) result[task]=true;});
  return result;
}

function realtimeCleanPremiumItems(list){
  if(!Array.isArray(list)) return [];
  const seen=new Set();
  const result=[];
  list.forEach((item,index)=>{
    if(!item||typeof item!=='object') return;
    const name=String(item.name||'').trim();
    const note=String(item.note||'').trim();
    const points=Math.max(0,Math.round((Number(item.points)||0)*10)/10);
    const count=Math.max(1,Math.round(Number(item.count)||1));
    if(!name||points<=0||count<=0) return;
    const key=String(item.key||[name,note,String(points)].join('||'));
    if(!key||seen.has(key)) return;
    seen.add(key);
    result.push({key,name,note,points,count,order:Number.isFinite(Number(item.order))?Number(item.order):index});
  });
  return result.sort((a,b)=>(a.order-b.order)||a.key.localeCompare(b.key,'ru'));
}

function realtimePremiumFromState(state){
  const result={};
  realtimeCleanPremiumItems(state?.premiumSelectedActivities).forEach((item,index)=>{
    result[realtimeEncodeKey(item.key)]={...realtimeClone(item),order:index};
  });
  return result;
}

function realtimePremiumToState(source){
  if(!source||typeof source!=='object'||Array.isArray(source)) return [];
  const list=[];
  Object.entries(source).forEach(([encodedKey,item],index)=>{
    if(!item||typeof item!=='object') return;
    list.push({...realtimeClone(item),key:String(item.key||realtimeDecodeKey(encodedKey)),order:Number.isFinite(Number(item.order))?Number(item.order):index});
  });
  return realtimeCleanPremiumItems(list);
}

function realtimeProgressFromState(state){
  const source=state?.progressByContext;
  const result={};
  if(!source||typeof source!=='object'||Array.isArray(source)) return result;
  Object.entries(source).forEach(([contextKey,tasks])=>{
    const clean=realtimeCleanTasks(tasks);
    const encodedTasks={};
    Object.keys(clean).forEach(task=>{
      encodedTasks[realtimeEncodeKey(task)]={task,done:true};
    });
    result[realtimeEncodeKey(contextKey)]={contextKey,tasks:encodedTasks};
  });
  return result;
}

function realtimeSelectedLevelsFromState(state){
  const source=state?.selectedLevelBySection;
  const result={};
  if(!source||typeof source!=='object'||Array.isArray(source)) return result;
  Object.entries(source).forEach(([key,value])=>{
    if(typeof value==='string'&&value) result[realtimeEncodeKey(key)]={key,value};
  });
  return result;
}

function realtimeProofsFromState(state){
  const source=state?.proofsByContext;
  const result={};
  if(!source||typeof source!=='object'||Array.isArray(source)) return result;
  Object.entries(source).forEach(([contextKey,proofs])=>{
    if(!proofs||typeof proofs!=='object'||Array.isArray(proofs)) return;
    const taskMap={};
    Object.entries(proofs).forEach(([task,proof])=>{
      if(!proof||typeof proof!=='object') return;
      const files=Array.isArray(proof.files)?proof.files.map(realtimeClone).filter(Boolean):[];
      if(!files.length) return;
      taskMap[realtimeEncodeKey(task)]={
        task,
        files,
        updatedAt:Number(proof.updatedAt||0)
      };
    });
    if(Object.keys(taskMap).length){
      result[realtimeEncodeKey(contextKey)]={contextKey,tasks:taskMap};
    }
  });
  return result;
}

function realtimeReportsFromState(state){
  const source=state?.reportsByContext;
  const result={};
  if(!source||typeof source!=='object'||Array.isArray(source)) return result;
  Object.entries(source).forEach(([key,value])=>{
    if(value&&typeof value==='object') result[realtimeEncodeKey(key)]={key,value:realtimeClone(value)};
  });
  return result;
}

function buildRealtimeCloudDocument(state,meta={}){
  const core={};
  REALTIME_CORE_FIELDS.forEach(field=>{
    core[field]=Object.prototype.hasOwnProperty.call(state||{},field)
      ? realtimeClone(state[field])
      : null;
  });
  return {
    profileId:String(meta.profileId||''),
    ownerUid:String(meta.ownerUid||''),
    schemaVersion:REALTIME_SCHEMA_VERSION,
    clientVersion:REALTIME_SCHEMA_VERSION,
    revision:Number(meta.revision||1),
    core,
    progress:realtimeProgressFromState(state),
    selectedLevels:realtimeSelectedLevelsFromState(state),
    pins:{
      department:Array.isArray(state?.pinnedDepartmentBlocks)?[...state.pinnedDepartmentBlocks]:[],
      academy:Array.isArray(state?.pinnedAcademyBlocks)?[...state.pinnedAcademyBlocks]:[]
    },
    account:realtimeClone(state?.account&&typeof state.account==='object'?state.account:{}),
    premium:{items:realtimePremiumFromState(state)},
    proofs:realtimeProofsFromState(state),
    reports:realtimeReportsFromState(state),
    updatedAtMs:Number(meta.updatedAtMs||Date.now()),
    writer:realtimeClone(meta.writer||{})
  };
}

function realtimeProgressToState(source){
  const result={};
  if(!source||typeof source!=='object'||Array.isArray(source)) return result;
  Object.entries(source).forEach(([encodedContext,entry])=>{
    if(!entry||typeof entry!=='object') return;
    const contextKey=typeof entry.contextKey==='string'&&entry.contextKey
      ? entry.contextKey
      : realtimeDecodeKey(encodedContext);
    const tasks={};
    const sourceTasks=entry.tasks&&typeof entry.tasks==='object'&&!Array.isArray(entry.tasks)?entry.tasks:{};
    Object.entries(sourceTasks).forEach(([encodedTask,record])=>{
      if(record===true){tasks[realtimeDecodeKey(encodedTask)]=true;return;}
      if(!record||typeof record!=='object'||record.done!==true) return;
      const task=typeof record.task==='string'&&record.task?record.task:realtimeDecodeKey(encodedTask);
      tasks[task]=true;
    });
    result[contextKey]=tasks;
  });
  return result;
}

function realtimeSelectedLevelsToState(source){
  const result={};
  if(!source||typeof source!=='object'||Array.isArray(source)) return result;
  Object.entries(source).forEach(([encodedKey,entry])=>{
    if(typeof entry==='string'){result[realtimeDecodeKey(encodedKey)]=entry;return;}
    if(!entry||typeof entry!=='object'||typeof entry.value!=='string'||!entry.value) return;
    const key=typeof entry.key==='string'&&entry.key?entry.key:realtimeDecodeKey(encodedKey);
    result[key]=entry.value;
  });
  return result;
}

function realtimeProofsToState(source){
  const result={};
  if(!source||typeof source!=='object'||Array.isArray(source)) return result;
  Object.entries(source).forEach(([encodedContext,entry])=>{
    if(!entry||typeof entry!=='object') return;
    const contextKey=typeof entry.contextKey==='string'&&entry.contextKey
      ? entry.contextKey
      : realtimeDecodeKey(encodedContext);
    const tasks={};
    const sourceTasks=entry.tasks&&typeof entry.tasks==='object'&&!Array.isArray(entry.tasks)?entry.tasks:{};
    Object.entries(sourceTasks).forEach(([encodedTask,proof])=>{
      if(!proof||typeof proof!=='object') return;
      const files=Array.isArray(proof.files)?proof.files.map(realtimeClone).filter(Boolean):[];
      if(!files.length) return;
      const task=typeof proof.task==='string'&&proof.task?proof.task:realtimeDecodeKey(encodedTask);
      tasks[task]={files,updatedAt:Number(proof.updatedAt||0)};
    });
    if(Object.keys(tasks).length) result[contextKey]=tasks;
  });
  return result;
}

function realtimeReportsToState(source){
  const result={};
  if(!source||typeof source!=='object'||Array.isArray(source)) return result;
  Object.entries(source).forEach(([encodedKey,entry])=>{
    if(!entry||typeof entry!=='object') return;
    if(Object.prototype.hasOwnProperty.call(entry,'value')){
      const key=typeof entry.key==='string'&&entry.key?entry.key:realtimeDecodeKey(encodedKey);
      if(entry.value&&typeof entry.value==='object') result[key]=realtimeClone(entry.value);
      return;
    }
    result[realtimeDecodeKey(encodedKey)]=realtimeClone(entry);
  });
  return result;
}

function realtimeCloudDocumentToState(documentData,baseState={}){
  const data=documentData&&typeof documentData==='object'?documentData:{};
  const core=data.core&&typeof data.core==='object'?data.core:{};
  const result={
    ready:core.ready===true,
    name:typeof core.name==='string'?core.name:'',
    project:typeof core.project==='string'&&core.project?core.project:'GTA5RP',
    path:typeof core.path==='string'&&core.path?core.path:'Государственная служба',
    style:typeof core.style==='string'&&core.style?core.style:'style-violet',
    org:typeof core.org==='string'?core.org:'',
    section:typeof core.section==='string'?core.section:'',
    level:typeof core.level==='string'?core.level:'',
    configured:core.configured===true,
    tasks:{},
    progressByContext:realtimeProgressToState(data.progress),
    selectedLevelBySection:realtimeSelectedLevelsToState(data.selectedLevels),
    proofsByContext:realtimeProofsToState(data.proofs),
    reportsByContext:realtimeReportsToState(data.reports),
    pinnedDepartmentBlocks:Array.isArray(data?.pins?.department)?[...data.pins.department]:[],
    pinnedAcademyBlocks:Array.isArray(data?.pins?.academy)?[...data.pins.academy]:[],
    premiumSelectedActivities:realtimePremiumToState(data?.premium?.items),
    account:realtimeClone(data.account&&typeof data.account==='object'?data.account:{}),
    cloud:realtimeClone(baseState?.cloud&&typeof baseState.cloud==='object'?baseState.cloud:{}),
    updatedAt:Number(data.updatedAtMs||Date.now())
  };
  return result;
}

function realtimeObjectSnapshot(value){
  try{return JSON.stringify(value===undefined?null:value);}catch(error){return '';}
}

function realtimeProofIdentity(file){
  if(!file||typeof file!=='object') return '';
  return String(file.id||file.pathname||file.url||file.downloadUrl||'');
}

function buildRealtimeStateDiff(beforeState,afterState){
  const before=beforeState&&typeof beforeState==='object'?beforeState:{};
  const after=afterState&&typeof afterState==='object'?afterState:{};
  const operations=[];
  const set=(path,value)=>operations.push({type:'set',path,value:realtimeClone(value)});
  const remove=path=>operations.push({type:'delete',path});

  REALTIME_CORE_FIELDS.forEach(field=>{
    if(realtimeObjectSnapshot(before[field])!==realtimeObjectSnapshot(after[field])){
      set(`core.${field}`,Object.prototype.hasOwnProperty.call(after,field)?after[field]:null);
    }
  });

  const beforeProgress=before.progressByContext&&typeof before.progressByContext==='object'?before.progressByContext:{};
  const afterProgress=after.progressByContext&&typeof after.progressByContext==='object'?after.progressByContext:{};
  new Set([...Object.keys(beforeProgress),...Object.keys(afterProgress)]).forEach(contextKey=>{
    const oldTasks=realtimeCleanTasks(beforeProgress[contextKey]);
    const newTasks=realtimeCleanTasks(afterProgress[contextKey]);
    const encodedContext=realtimeEncodeKey(contextKey);
    new Set([...Object.keys(oldTasks),...Object.keys(newTasks)]).forEach(task=>{
      const oldDone=oldTasks[task]===true;
      const newDone=newTasks[task]===true;
      if(oldDone===newDone) return;
      const path=`progress.${encodedContext}.tasks.${realtimeEncodeKey(task)}`;
      if(newDone) set(path,{task,done:true});
      else remove(path);
    });
  });

  const beforeLevels=before.selectedLevelBySection&&typeof before.selectedLevelBySection==='object'?before.selectedLevelBySection:{};
  const afterLevels=after.selectedLevelBySection&&typeof after.selectedLevelBySection==='object'?after.selectedLevelBySection:{};
  new Set([...Object.keys(beforeLevels),...Object.keys(afterLevels)]).forEach(key=>{
    const oldValue=typeof beforeLevels[key]==='string'?beforeLevels[key]:'';
    const newValue=typeof afterLevels[key]==='string'?afterLevels[key]:'';
    if(oldValue===newValue) return;
    const path=`selectedLevels.${realtimeEncodeKey(key)}`;
    if(newValue) set(path,{key,value:newValue});
    else remove(path);
  });

  const pinPairs=[
    ['pins.department',Array.isArray(before.pinnedDepartmentBlocks)?before.pinnedDepartmentBlocks:[],Array.isArray(after.pinnedDepartmentBlocks)?after.pinnedDepartmentBlocks:[]],
    ['pins.academy',Array.isArray(before.pinnedAcademyBlocks)?before.pinnedAcademyBlocks:[],Array.isArray(after.pinnedAcademyBlocks)?after.pinnedAcademyBlocks:[]]
  ];
  pinPairs.forEach(([path,oldValue,newValue])=>{
    if(realtimeObjectSnapshot(oldValue)!==realtimeObjectSnapshot(newValue)) set(path,newValue);
  });

  if(realtimeObjectSnapshot(before.account||{})!==realtimeObjectSnapshot(after.account||{})){
    set('account',after.account&&typeof after.account==='object'?after.account:{});
  }

  const beforePremium=new Map(realtimeCleanPremiumItems(before.premiumSelectedActivities).map(item=>[item.key,item]));
  const afterPremium=new Map(realtimeCleanPremiumItems(after.premiumSelectedActivities).map(item=>[item.key,item]));
  new Set([...beforePremium.keys(),...afterPremium.keys()]).forEach(key=>{
    const oldItem=beforePremium.get(key)||null;
    const newItem=afterPremium.get(key)||null;
    if(realtimeObjectSnapshot(oldItem)===realtimeObjectSnapshot(newItem)) return;
    const path=`premium.items.${realtimeEncodeKey(key)}`;
    if(newItem) set(path,newItem);
    else remove(path);
  });

  const beforeProofs=before.proofsByContext&&typeof before.proofsByContext==='object'?before.proofsByContext:{};
  const afterProofs=after.proofsByContext&&typeof after.proofsByContext==='object'?after.proofsByContext:{};
  new Set([...Object.keys(beforeProofs),...Object.keys(afterProofs)]).forEach(contextKey=>{
    const oldTasks=beforeProofs[contextKey]&&typeof beforeProofs[contextKey]==='object'?beforeProofs[contextKey]:{};
    const newTasks=afterProofs[contextKey]&&typeof afterProofs[contextKey]==='object'?afterProofs[contextKey]:{};
    const encodedContext=realtimeEncodeKey(contextKey);
    new Set([...Object.keys(oldTasks),...Object.keys(newTasks)]).forEach(task=>{
      const oldProof=oldTasks[task]&&typeof oldTasks[task]==='object'?oldTasks[task]:null;
      const newProof=newTasks[task]&&typeof newTasks[task]==='object'?newTasks[task]:null;
      if(realtimeObjectSnapshot(oldProof)!==realtimeObjectSnapshot(newProof)){
        const path=`proofs.${encodedContext}.tasks.${realtimeEncodeKey(task)}`;
        const files=Array.isArray(newProof?.files)?newProof.files.map(realtimeClone).filter(Boolean):[];
        if(files.length){
          set(path,{task,files,updatedAt:Number(newProof?.updatedAt||Date.now())});
        }else remove(path);
      }
    });
  });

  const beforeReports=before.reportsByContext&&typeof before.reportsByContext==='object'?before.reportsByContext:{};
  const afterReports=after.reportsByContext&&typeof after.reportsByContext==='object'?after.reportsByContext:{};
  new Set([...Object.keys(beforeReports),...Object.keys(afterReports)]).forEach(key=>{
    const oldValue=beforeReports[key]||null;
    const newValue=afterReports[key]||null;
    if(realtimeObjectSnapshot(oldValue)===realtimeObjectSnapshot(newValue)) return;
    const path=`reports.${realtimeEncodeKey(key)}`;
    if(newValue) set(path,{key,value:realtimeClone(newValue)});
    else remove(path);
  });

  return operations;
}

function applyRealtimeOperationsToDocument(documentData,operations){
  const result=realtimeClone(documentData)||{};
  function setPath(path,value){
    const parts=String(path).split('.');
    let target=result;
    for(let i=0;i<parts.length-1;i++){
      const key=parts[i];
      if(!target[key]||typeof target[key]!=='object'||Array.isArray(target[key])) target[key]={};
      target=target[key];
    }
    target[parts[parts.length-1]]=realtimeClone(value);
  }
  function deletePath(path){
    const parts=String(path).split('.');
    let target=result;
    for(let i=0;i<parts.length-1;i++){
      target=target?.[parts[i]];
      if(!target||typeof target!=='object') return;
    }
    delete target[parts[parts.length-1]];
  }
  (operations||[]).forEach(operation=>{
    if(operation?.type==='set') setPath(operation.path,operation.value);
    else if(operation?.type==='delete') deletePath(operation.path);
  });
  return result;
}
