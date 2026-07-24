/* Основное приложение v80. Firebase — единственный источник истины после Google-входа; localStorage используется только как отображаемый кэш. */
window.__profileBootComplete=false;
document.body.classList.add('profile-booting');
let S={ready:false,name:'',project:'GTA5RP',path:'Государственная служба',style:'style-violet',org:'',section:'',level:'',configured:false,tasks:{},progressByContext:{},selectedLevelBySection:{},proofsByContext:{},reportsByContext:{},pinnedDepartmentBlocks:[],pinnedAcademyBlocks:[],premiumSelectedActivities:[],account:{createdAt:0,initialName:''}};
let displayedProgress=0;
let progressAnimationFrame=null;
let progressAnimationTarget=null;
const $=s=>document.querySelector(s);
const PROFILE_CONTEXT_CHECKPOINT_KEY='kiri:rp-cabinet:v80:context-checkpoint';

function profileContextValues(state){
  return {
    project:typeof state?.project==='string'?state.project:'',
    path:typeof state?.path==='string'?state.path:'',
    org:typeof state?.org==='string'?state.org:'',
    section:typeof state?.section==='string'?state.section:'',
    level:typeof state?.level==='string'?state.level:'',
    configured:state?.configured===true
  };
}
function hasCompleteProfileContext(state){
  return !!(state?.org && state?.section && state?.level && state?.configured===true);
}
function readProfileContextCheckpoint(){
  try{
    const parsed=JSON.parse(localStorage.getItem(PROFILE_CONTEXT_CHECKPOINT_KEY)||'null');
    if(!parsed || parsed.version!==1 || !parsed.context || typeof parsed.context!=='object') return null;
    return parsed;
  }catch(e){return null;}
}
function rememberProfileContextCheckpoint(state){
  if(!hasCompleteProfileContext(state)) return false;
  try{
    localStorage.setItem(PROFILE_CONTEXT_CHECKPOINT_KEY,JSON.stringify({
      version:1,
      name:String(state?.name||'').trim(),
      updatedAt:Date.now(),
      context:profileContextValues(state)
    }));
    return true;
  }catch(e){
    console.warn('Profile context checkpoint failed',e);
    return false;
  }
}
function recoverProfileContextState(state,fallbackState){
  const result=Object.assign({},state||{});
  if(hasCompleteProfileContext(result)) return {state:result,recovered:false};
  const checkpoint=readProfileContextCheckpoint();
  const candidates=[
    fallbackState,
    checkpoint?.context
  ].filter(hasCompleteProfileContext);
  const targetName=String(result.name||result?.account?.initialName||'').trim().toLocaleLowerCase('ru-RU');
  const checkpointName=String(checkpoint?.name||'').trim().toLocaleLowerCase('ru-RU');
  const candidate=candidates.find(item=>{
    if(item===checkpoint?.context && targetName && checkpointName && targetName!==checkpointName) return false;
    if(result.project && item.project && result.project!==item.project) return false;
    if(result.path && item.path && result.path!==item.path) return false;
    return true;
  });
  if(!candidate) return {state:result,recovered:false};
  Object.assign(result,profileContextValues(candidate),{configured:true});
  return {state:result,recovered:true};
}

function cleanTaskState(tasks){
  const clean={};
  if(!tasks || typeof tasks!=='object' || Array.isArray(tasks)) return clean;
  Object.keys(tasks).forEach(task=>{
    if(tasks[task]===true) clean[task]=true;
  });
  return clean;
}
function progressContextKeyFor(state){
  if(!state || !state.configured || !state.project || !state.path || !state.org || !state.section || !state.level) return '';
  return [state.project,state.path,state.org,state.section,state.level]
    .map(value=>encodeURIComponent(String(value).trim()))
    .join('::');
}
function ensureProgressStore(state){
  if(!state.progressByContext || typeof state.progressByContext!=='object' || Array.isArray(state.progressByContext)){
    state.progressByContext={};
  }
  return state.progressByContext;
}
function persistProgressForState(state){
  const key=progressContextKeyFor(state);
  if(!key) return;
  ensureProgressStore(state)[key]=cleanTaskState(state.tasks);
}
function restoreProgressForState(state){
  const key=progressContextKeyFor(state);
  const store=ensureProgressStore(state);
  state.tasks=key && Object.prototype.hasOwnProperty.call(store,key)
    ? cleanTaskState(store[key])
    : {};
}
function levelContextKeyFor(state,sectionOverride){
  const section=sectionOverride===undefined ? state?.section : sectionOverride;
  if(!state || !state.project || !state.path || !state.org || !section) return '';
  return [state.project,state.path,state.org,section]
    .map(value=>encodeURIComponent(String(value).trim()))
    .join('::');
}
function ensureSelectedLevelStore(state){
  if(!state.selectedLevelBySection || typeof state.selectedLevelBySection!=='object' || Array.isArray(state.selectedLevelBySection)){
    state.selectedLevelBySection={};
  }
  return state.selectedLevelBySection;
}
function rememberedLevelForSection(state,section){
  const key=levelContextKeyFor(state,section);
  const remembered=key ? ensureSelectedLevelStore(state)[key] : '';
  const allowed=LEVELS[section] || LEVELS.default || [];
  return allowed.includes(remembered) ? remembered : '';
}
function persistSelectedLevelForState(state){
  const key=levelContextKeyFor(state);
  const allowed=LEVELS[state?.section] || LEVELS.default || [];
  if(!key || !allowed.includes(state.level)) return;
  ensureSelectedLevelStore(state)[key]=state.level;
}
function restoreSelectedLevelForState(state){
  const allowed=LEVELS[state?.section] || LEVELS.default || [];
  const remembered=rememberedLevelForSection(state,state?.section);
  state.level=remembered || (allowed.includes(state.level) ? state.level : (allowed[0]||''));
  state.configured=!!(state.org && state.section && state.level);
  return state.level;
}
function changeProgressContext(mutator,restoreSavedLevel=false){
  persistProgressForState(S);
  persistSelectedLevelForState(S);
  mutator();
  if(restoreSavedLevel) restoreSelectedLevelForState(S);
  else persistSelectedLevelForState(S);
  restoreProgressForState(S);
  if(progressAnimationFrame) cancelAnimationFrame(progressAnimationFrame);
  progressAnimationFrame=null;
  progressAnimationTarget=null;
  displayedProgress=0;
}

function profileTimestampMs(value){
  if(!value) return 0;
  let ms=0;
  if(typeof value==='number') ms=value;
  else if(typeof value==='string') ms=Date.parse(value);
  else if(typeof value==='object' && typeof value.toDate==='function') ms=value.toDate().getTime();
  else if(typeof value==='object' && typeof value.seconds==='number') ms=value.seconds*1000;
  const earliestAllowed=Date.UTC(2020,0,1);
  const latestAllowed=Date.now()+86400000;
  return Number.isFinite(ms) && ms>=earliestAllowed && ms<=latestAllowed ? ms : 0;
}
function earliestProfileTimestamp(...values){
  const valid=values.map(profileTimestampMs).filter(Boolean);
  return valid.length ? Math.min(...valid) : 0;
}
function profileCreatedTimestamp(){
  return earliestProfileTimestamp(
    S?.account?.createdAt,
    S?.createdAt,
    S?.profileCreatedAt,
    S?.registeredAt
  );
}
function hasUsableProfileName(state){
  const name=typeof state?.name==='string' ? state.name.trim() : '';
  return !!name;
}
function isUsableProfileState(state){
  return !!(state && typeof state==='object' && state.ready===true && hasUsableProfileName(state));
}
function isRecoverableProfileState(state){
  if(!state || typeof state!=='object') return false;
  const explicitProfileName=[
    state.name,
    state?.account?.initialName
  ].find(value=>typeof value==='string'&&value.trim());
  if(explicitProfileName) return true;
  const googleName=typeof state?.cloud?.googleName==='string'&&state.cloud.googleName.trim();
  if(!googleName) return false;
  return !!(
    state.ready===true
    || state.configured===true
    || state.org
    || state.section
    || Object.keys(state.progressByContext||{}).length
    || Object.keys(state.selectedLevelBySection||{}).length
  );
}
function ensureProfileCreatedAt(){
  if(!S.account || typeof S.account!=='object') S.account={};
  const current=profileCreatedTimestamp();
  if(current){
    S.account.createdAt=current;
    return current;
  }
  return 0;
}
function rememberRealtimeLocalBaseline(state){
  window.__realtimeLocalBaseline=realtimeClone(state)||{};
}
function save(){
  const baseline=realtimeClone(window.__realtimeLocalBaseline||S)||{};
  persistProgressForState(S);
  persistSelectedLevelForState(S);
  const passiveLoad=!!(window.__cloudApplyingRemote||window.__profileHydrating||window.__cloudAttaching||window.__cloudInternalWrite);
  if(!passiveLoad) rememberProfileContextCheckpoint(S);
  const normalized=normalizeProfileData(S);
  if(normalized&&normalized.ready) S=normalized;
  if(!passiveLoad) S.updatedAt=Date.now();

  const data=JSON.stringify(S);
  try{
    if(S.ready){
      localStorage.setItem(KEY,data);
      localStorage.setItem(VERSION_KEY,data);
      localStorage.setItem(PROFILE_BACKUP_KEY,data);
    }else{
      localStorage.setItem(VERSION_KEY,data);
    }
  }catch(error){console.warn('Profile cache save failed',error);}

  /* В v80 save() никогда не отправляет полный профиль. После реального
   * пользовательского изменения строится точечный набор Firestore-путей.
   * Во время загрузки, входящего snapshot и обновления страницы запись
   * запрещена — поэтому старый телефон не может откатить компьютер. */
  if(!passiveLoad&&window.__profileBootComplete&&window.CloudSync?.user&&!window.__cloudSigningOut){
    window.CloudSync.commitDiff(baseline,S);
  }
  rememberRealtimeLocalBaseline(S);
}
function cleanPremiumSelection(list){
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
function readLegacyPremiumSelection(){
  const keys=[
    'kiri:army-panel:v017:reports-premium',
    'kiri:army-panel:v016:reports-premium',
    'kiri:army-panel:v015:reports-premium',
    'kiri:army-panel:v014:reports-premium'
  ];
  for(const key of keys){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) continue;
      const parsed=JSON.parse(raw);
      if(Array.isArray(parsed?.selected)) return cleanPremiumSelection(parsed.selected);
    }catch(error){}
  }
  return [];
}
function readLegacyPinnedSelection(){
  const keys=['rpCabinetPinnedDepartmentBlocks_v1','rpCabinetPinnedAcademyBlocks_v1'];
  for(const key of keys){
    try{
      const raw=localStorage.getItem(key);
      if(raw===null) continue;
      const parsed=JSON.parse(raw||'[]');
      if(!Array.isArray(parsed)) continue;
      return Array.from(new Set(parsed.filter(value=>value&&value!=='__kiri_no_pins__')));
    }catch(error){}
  }
  return [];
}
function normalizeProfileData(d){
  if(!d || typeof d!=='object') return null;
  const wasRecoverableProfile=isRecoverableProfileState(d);
  const merged=Object.assign({}, S, d);




  if(!String(merged.name||'').trim()){
    const recoveredName=[
      d?.account?.initialName,
      d?.cloud?.googleName,
      S?.name,
      S?.account?.initialName,
      S?.cloud?.googleName
    ].find(value=>typeof value==='string'&&value.trim());
    if(recoveredName) merged.name=recoveredName.trim();
  }else{
    merged.name=String(merged.name).trim();
  }
  const hasRealProfile=hasUsableProfileName(merged);
  merged.ready = hasRealProfile && (
    wasRecoverableProfile
    || merged.ready===true
    || merged.configured===true
    || !!merged.org
    || !!merged.section
  );

  if(!merged.project) merged.project='GTA5RP';
  if(!merged.path) merged.path='Государственная служба';
  if(!merged.style) merged.style='style-violet';
  if(!merged.tasks || typeof merged.tasks!=='object' || Array.isArray(merged.tasks)) merged.tasks={};
  merged.tasks=cleanTaskState(merged.tasks);
  const incomingProgress=(d.progressByContext && typeof d.progressByContext==='object' && !Array.isArray(d.progressByContext))
    ? d.progressByContext
    : {};
  merged.progressByContext={};
  Object.keys(incomingProgress).forEach(key=>{
    merged.progressByContext[key]=cleanTaskState(incomingProgress[key]);
  });
  const incomingLevels=(d.selectedLevelBySection && typeof d.selectedLevelBySection==='object' && !Array.isArray(d.selectedLevelBySection))
    ? d.selectedLevelBySection
    : {};
  merged.selectedLevelBySection={};
  Object.keys(incomingLevels).forEach(key=>{
    if(typeof incomingLevels[key]==='string' && incomingLevels[key]) merged.selectedLevelBySection[key]=incomingLevels[key];
  });
  const incomingProofs=(d.proofsByContext && typeof d.proofsByContext==='object' && !Array.isArray(d.proofsByContext))
    ? d.proofsByContext
    : {};
  merged.proofsByContext={};
  Object.entries(incomingProofs).forEach(([contextKey,taskProofs])=>{
    if(!taskProofs || typeof taskProofs!=='object' || Array.isArray(taskProofs)) return;
    merged.proofsByContext[contextKey]={};
    Object.entries(taskProofs).forEach(([task,proof])=>{
      if(!proof || typeof proof!=='object' || Array.isArray(proof)) return;
      const files=Array.isArray(proof.files)
        ? proof.files.filter(file=>file&&typeof file==='object'&&typeof file.url==='string'&&file.url)
        : [];
      if(files.length) merged.proofsByContext[contextKey][task]={files,updatedAt:Number(proof.updatedAt||0)};
    });
  });
  const incomingReports=(d.reportsByContext && typeof d.reportsByContext==='object' && !Array.isArray(d.reportsByContext))
    ? d.reportsByContext
    : {};
  merged.reportsByContext={};
  Object.entries(incomingReports).forEach(([contextKey,report])=>{
    if(!report || typeof report!=='object' || Array.isArray(report) || typeof report.id!=='string') return;
    merged.reportsByContext[contextKey]={
      id:report.id,
      url:typeof report.url==='string'?report.url:'',
      createdAt:Number(report.createdAt||0),
      expiresAt:Number(report.expiresAt||0)
    };
  });
  const hasPinnedField=Object.prototype.hasOwnProperty.call(d,'pinnedDepartmentBlocks')
    || Object.prototype.hasOwnProperty.call(d,'pinnedAcademyBlocks');
  const legacyPins=hasPinnedField?[]:readLegacyPinnedSelection();
  const incomingDepartmentPins=Array.isArray(d.pinnedDepartmentBlocks)
    ? d.pinnedDepartmentBlocks
    : (Array.isArray(d.pinnedAcademyBlocks)?d.pinnedAcademyBlocks:legacyPins);
  const incomingAcademyPins=Array.isArray(d.pinnedAcademyBlocks)
    ? d.pinnedAcademyBlocks
    : incomingDepartmentPins;
  merged.pinnedDepartmentBlocks=Array.from(new Set(incomingDepartmentPins.filter(Boolean)));
  merged.pinnedAcademyBlocks=Array.from(new Set(incomingAcademyPins.filter(Boolean)));
  const hasPremiumField=Object.prototype.hasOwnProperty.call(d,'premiumSelectedActivities');
  merged.premiumSelectedActivities=cleanPremiumSelection(
    hasPremiumField ? d.premiumSelectedActivities : readLegacyPremiumSelection()
  );
  const currentLevelKey=levelContextKeyFor(merged);
  const currentAllowedLevels=LEVELS[merged.section] || LEVELS.default || [];
  const rememberedLevel=currentLevelKey ? merged.selectedLevelBySection[currentLevelKey] : '';
  if(currentAllowedLevels.includes(rememberedLevel)){
    merged.level=rememberedLevel;
    merged.configured=!!(merged.org && merged.section && merged.level);
  }else if(currentLevelKey && currentAllowedLevels.includes(merged.level)){
    merged.selectedLevelBySection[currentLevelKey]=merged.level;
  }
  const currentProgressKey=progressContextKeyFor(merged);
  if(currentProgressKey){
    if(Object.prototype.hasOwnProperty.call(merged.progressByContext,currentProgressKey)){
      merged.tasks=cleanTaskState(merged.progressByContext[currentProgressKey]);
    }else{
      merged.progressByContext[currentProgressKey]=cleanTaskState(merged.tasks);
    }
  }
  if(!merged.account || typeof merged.account!=='object') merged.account={};


  const mergedCreatedAt=earliestProfileTimestamp(
    d?.account?.createdAt,
    d?.createdAt,
    d?.profileCreatedAt,
    d?.registeredAt,
    S?.account?.createdAt
  );
  merged.account.createdAt=mergedCreatedAt || 0;
  if(!merged.account.initialName) merged.account.initialName=merged.name||'';
  if(!merged.updatedAt) merged.updatedAt=Date.now();
  delete merged.syncFieldUpdatedAt;
  if(!merged.cloud || typeof merged.cloud!=='object') merged.cloud={enabled:false,provider:'local',uid:'',lastSync:0};
  return merged;
}
function safeReadProfileKey(key){
  try{
    const raw=localStorage.getItem(key);
    if(!raw) return null;
    return normalizeProfileData(JSON.parse(raw));
  }catch(e){
    return null;
  }
}
function profileStorageScore(data,key){
  if(!data) return -1;
  let score=0;
  if(data.ready) score+=1000;
  if(data.name) score+=120;
  if(data.org) score+=80;
  if(data.section) score+=80;
  if(data.level) score+=60;
  if(data.configured) score+=80;
  if(data.tasks && typeof data.tasks==='object') score+=Object.values(data.tasks).filter(Boolean).length*8;
  if(data.progressByContext && typeof data.progressByContext==='object'){
    const savedTaskCount=Object.values(data.progressByContext).reduce((total,taskState)=>{
      if(!taskState || typeof taskState!=='object') return total;
      return total+Object.values(taskState).filter(Boolean).length;
    },0);
    score+=savedTaskCount*8;
  }
  if(key===KEY) score+=15;
  if(key===VERSION_KEY) score+=10;
  return score;
}
function load(){
  const primaryKeys=[KEY, VERSION_KEY, PROFILE_BACKUP_KEY];
  const legacyKeys=[
    'rp_panel_account_profile_V79_REALTIME',
    'rp_panel_v79_realtime_cache',
    'rp_panel_account_profile_V79_BACKUP',
    'rp_panel_account_profile_V77_STABLE',
    'rp_panel_v77_isolated_state_cache',
    'rp_panel_account_profile_V77_BACKUP',
    'rp_panel_account_profile_STABLE',
    'rp_panel_account_profile_BACKUP_STABLE',
    'rp_panel_v156_fast_boot_safe_cache',
    'rp_panel_v154_cleanup_stage7_final_check',
    'rp_panel_v153_cleanup_stage6_optimize',
    'rp_panel_v152_cleanup_stage5_dead_code',
    'rp_panel_v147_registration_date_settings_only',
    'rp_panel_v034_profile_settings_transfer',
    'rp_panel_v033_profile_export_import_link',
    'rp_panel_v032_storage_fix_academy_cleanup',
    'rp_panel_v030_department_info_tests',
    'rp_panel_v029_dynamic_department_academy',
    'rp_panel_v133_profile_rows_gov_service_pencil_fix',
    'rp_panel_v109_academy_department_fixed',
    'rp_panel_v108_academy_to_department_flow',
    'rp_panel_v105_ring_crop_fix_glow_restore',
    'rp_panel_v104_edit_org_section_ring_fix',
    'rp_panel_v103_persist_unified',
    'rp_panel_v102_level_edit_profile',
    'rp_panel_v101_clean_flow_promotion',
    'rp_panel_v100_clean_base'
  ];

  function bestFrom(keys){
    let best=null;
    let bestKey='';
    let bestContextRank=-1;
    let bestUpdated=-1;
    let bestScore=-1;
    for(const key of keys){
      const data=safeReadProfileKey(key);
      if(!data || !data.ready) continue;
      const contextRank=hasCompleteProfileContext(data)
        ? 2
        : (data.org || data.section || data.level ? 1 : 0);
      const updated=profileTimestampMs(data.updatedAt)||0;
      const score=profileStorageScore(data,key);
      if(
        contextRank>bestContextRank
        || (contextRank===bestContextRank && updated>bestUpdated)
        || (contextRank===bestContextRank && updated===bestUpdated && score>bestScore)
      ){
        best=data;
        bestKey=key;
        bestContextRank=contextRank;
        bestUpdated=updated;
        bestScore=score;
      }
    }
    return {best,bestKey,bestScore,bestUpdated};
  }




  let result=bestFrom(primaryKeys);
  if(!result.best) result=bestFrom(legacyKeys);

  if(result.best && result.best.ready){
    S=result.best;
    const recoveredContext=recoverProfileContextState(S,null);
    if(recoveredContext.recovered){
      S=recoveredContext.state;
    }
    const allRecoveryKeys=[...new Set([...primaryKeys,...legacyKeys])];
    const activeName=String(S.name||'').trim().toLocaleLowerCase('ru-RU');
    const storedDates=[];
    allRecoveryKeys.forEach(key=>{
      try{
        const raw=JSON.parse(localStorage.getItem(key)||'null');
        if(!raw || typeof raw!=='object') return;
        const rawName=String(raw.name||'').trim().toLocaleLowerCase('ru-RU');
        if(activeName && rawName && rawName!==activeName) return;
        [
          raw?.account?.createdAt,
          raw?.createdAt,
          raw?.profileCreatedAt,
          raw?.registeredAt,
          raw?.cloud?.googleCreatedAt
        ].forEach(value=>{
          const timestamp=profileTimestampMs(value);
          if(timestamp) storedDates.push(timestamp);
        });
      }catch(e){}
    });
    const recoveredCreatedAt=earliestProfileTimestamp(S?.account?.createdAt,S?.cloud?.googleCreatedAt,...storedDates);
    if(recoveredCreatedAt){
      if(!S.account || typeof S.account!=='object') S.account={};
      S.account.createdAt=recoveredCreatedAt;
    }
    window.__profileHydrating=true;
    save();
    window.__profileHydrating=false;
    try{localStorage.setItem('rp_panel_last_loaded_from',result.bestKey)}catch(e){}
  }
}
function theme(){
  document.body.classList.toggle('ready',!!S.ready);
  ['style-arctic','style-emerald','style-violet','style-crimson','style-gold','style-monochrome'].forEach(c=>document.body.classList.remove(c));
  document.body.classList.add(S.style||'style-arctic');
}
function sections(){return SECTIONS[S.org] || (S.path==='Государственная служба'?SECTIONS.defaultGov:SECTIONS.defaultCrime)}
function levels(){return LEVELS[S.section] || LEVELS.default}
function tasks(){
  if(PROMO_TASKS[S.section] && PROMO_TASKS[S.section][S.level]) return PROMO_TASKS[S.section][S.level];
  return ['Изучить требования раздела','Закрыть активность','Подготовить отчёт','Проверить условия повышения'];
}
function percent(){
  const list=tasks();
  if(!S.org || !S.section || !S.level || !S.configured || !list.length) return 0;
  return Math.round(list.filter(t=>S.tasks[t]).length/list.length*100);
}

function fitInfoLevelText(){
  const el=document.getElementById('infoLevel');
  if(!el) return;
  const text=(el.textContent||'').trim();
  el.classList.toggle('level-long-text', text.length>24);
  el.style.whiteSpace='normal';
  el.style.overflow='visible';
  el.style.textOverflow='clip';
  el.style.lineHeight='1.12';
  el.style.fontSize=text.length>24?'11px':'';
  el.style.letterSpacing=text.length>28?'-.025em':'';
}

function render(){
  theme();
  renderProfileIcon();
  $('#profileName').textContent=S.name||'Игрок';
  $('#infoProject').textContent=S.project;
  $('#infoPath').textContent=S.path;
  $('#infoOrg').textContent=S.org||'Нужно выбрать';
  $('#infoSection').textContent=S.configured?(S.section||'—'):'—';
  $('#infoLevel').textContent=S.configured?(S.level||'—'):'—';
  ensureProfileCreatedAt();
  renderAccountStats();
  requestAnimationFrame(fitInfoLevelText);

  $('#orgStep').classList.toggle('show',!S.org);
  $('#setupStep').classList.toggle('show',!!S.org && !S.configured);
  $('#progressStep').classList.toggle('show',!!S.org && S.configured);

  renderOrgs();
  renderSetup();
  renderProgress();
  renderPathDashboard();
  if(typeof window.KiriPremiumSync==='function') window.KiriPremiumSync();
  if(typeof window.KiriPinnedMaterialsSync==='function') window.KiriPinnedMaterialsSync();
  if(typeof renderDynamicDepartmentDashboard==='function') renderDynamicDepartmentDashboard();
  if(typeof applyDashTab==='function') applyDashTab();
}
function renderOrgs(){
  const grid=$('#orgGrid');
  if(!grid) return;
  grid.innerHTML=(ORGS[S.path]||[]).map(org=>`<button class="org-btn ${S.org===org?'active':''}" data-org="${org}">${org}</button>`).join('');
  document.querySelectorAll('[data-org]').forEach(btn=>{
    btn.onclick=()=>{
      changeProgressContext(()=>{
        S.org=btn.dataset.org;
        S.section='';
        S.level='';
        S.configured=false;
      });
      save();
      render();
    };
  });
}
function renderSetup(){
  const sectionSelect=$('#sectionSelect');
  const levelSelect=$('#levelSelect');
  if(!sectionSelect || !levelSelect || !S.org) return;

  const secList=sections();
  const selectedSection = secList.includes(S.section) ? S.section : (secList[0]||'');
  sectionSelect.innerHTML=secList.map(v=>`<option value="${v}" ${selectedSection===v?'selected':''}>${v}</option>`).join('');

  const levelListForSection = LEVELS[selectedSection] || LEVELS.default;
  const rememberedLevel=rememberedLevelForSection(S,selectedSection);
  const selectedLevel = levelListForSection.includes(S.level) ? S.level : (rememberedLevel || levelListForSection[0] || '');
  levelSelect.innerHTML=levelListForSection.map(v=>`<option value="${v}" ${selectedLevel===v?'selected':''}>${v}</option>`).join('');

  sectionSelect.onchange=()=>{
    const list = LEVELS[sectionSelect.value] || LEVELS.default;
    const remembered=rememberedLevelForSection(S,sectionSelect.value);
    const selected=remembered || list[0] || '';
    levelSelect.innerHTML=list.map(v=>`<option value="${v}" ${v===selected?'selected':''}>${v}</option>`).join('');
  };
}
function animateProgressTo(target){
  const ring=$('#ring'), percentEl=$('#percent');
  if(!ring || !percentEl) return;
  const to=Math.max(0,Math.min(100,Number(target)||0));
  if(progressAnimationFrame && progressAnimationTarget===to) return;
  const from=Math.max(0,Math.min(100,Number(displayedProgress)||0));
  if(progressAnimationFrame){
    cancelAnimationFrame(progressAnimationFrame);
    progressAnimationFrame=null;
  }
  if(Math.abs(to-from)<0.01){
    displayedProgress=to;
    progressAnimationTarget=null;
    ring.style.setProperty('--p',to);
    percentEl.textContent=Math.round(to)+'%';
    return;
  }
  progressAnimationTarget=to;
  const start=performance.now();
  const duration=700;
  ring.classList.add('progress-pulse');
  function frame(now){
    const t=Math.min(1,(now-start)/duration);
    const eased=1-Math.pow(1-t,3);
    const current=from+(to-from)*eased;
    const val=Math.round(current);
    displayedProgress=current;
    ring.style.setProperty('--p',val);
    percentEl.textContent=val+'%';
    if(t<1) progressAnimationFrame=requestAnimationFrame(frame);
    else{
      displayedProgress=to;
      progressAnimationFrame=null;
      progressAnimationTarget=null;
      ring.style.setProperty('--p',to);
      percentEl.textContent=to+'%';
      setTimeout(()=>ring.classList.remove('progress-pulse'),220);
    }
  }
  progressAnimationFrame=requestAnimationFrame(frame);
}

function isAcademyFinalCompleted(){
  const list=LEVELS.Academy || [];
  return S.section==='Academy' && S.level===list[list.length-1] && percent()>=100;
}
function chooseDepartmentAfterAcademy(dept){
  changeProgressContext(()=>{
    S.section=dept;
    const list=LEVELS[dept] || LEVELS.default;
    S.level=list[0] || '';
    S.configured=true;
  },true);
  save();
  render();
  showToast('Отдел выбран',`Прогресс начат: ${dept}`);
}
function renderDepartmentUnlock(){
  const box=$('#departmentUnlock');
  const grid=$('#departmentGrid');
  if(!box || !grid) return;
  const show=isAcademyFinalCompleted();
  box.classList.toggle('show',show);
  if(!show){
    grid.innerHTML='';
    return;
  }
  const departments=['MA','USAF','MP','DF','SD','RAP','SAS','ED'];
  grid.innerHTML=departments.map(dep=>`<button class="department-btn" data-dept="${dep}">${dep}</button>`).join('');
  document.querySelectorAll('[data-dept]').forEach(btn=>{
    btn.onclick=()=>chooseDepartmentAfterAcademy(btn.dataset.dept);
  });
}
function renderProgress(){
  if(!S.org || !S.section || !S.level || !S.configured) return;
  const p=percent();
  animateProgressTo(p);

  $('#tasks').innerHTML=tasks().map(t=>`<label class="task ${S.tasks[t]?'done':''}">
    <input type="checkbox" ${S.tasks[t]?'checked':''} data-task="${t}">
    <span><b>${t}</b></span>
  </label>`).join('');
  document.querySelectorAll('[data-task]').forEach(input=>{
    input.onchange=()=>{
      /*
       * Сначала снимаем единый снимок всех видимых галок. Firebase может
       * закончить предыдущую запись между двумя кликами, поэтому сохранение
       * только текущего input иногда возвращало предыдущий пункт к старому
       * состоянию.
       */
      const contextKey=progressContextKeyFor(S);
      const contextTasks=contextKey
        ? Object.assign({},ensureProgressStore(S)[contextKey]||{})
        : {};
      document.querySelectorAll('#tasks input[data-task]').forEach(visibleInput=>{
        if(visibleInput.checked) contextTasks[visibleInput.dataset.task]=true;
        else delete contextTasks[visibleInput.dataset.task];
      });
      if(contextKey) ensureProgressStore(S)[contextKey]=cleanTaskState(contextTasks);
      S.tasks=cleanTaskState(contextTasks); // только зеркало текущего контекста для рендера
      save();
      showToast('Прогресс обновлён',input.checked?'Задача засчитана':'Отметка снята');
      render();
    };
  });

  const academyDone=isAcademyFinalCompleted();
  const next=nextLevel();
  $('#nextBox').classList.toggle('show',p>=100 && !academyDone);
  $('#nextLevelText').textContent=next?`Следующая ступень: ${next}`:'Это последняя ступень выбранного раздела.';
  $('#claimPromotion').style.display=next?'block':'none';
  $('#claimPromotion').onclick=()=>claimPromotion();
  renderDepartmentUnlock();
}

function modalActivePath(){
  return document.getElementById('modalPathSelect')?.value || S.path || 'Государственная служба';
}
function modalSectionsForOrg(org){
  const path=modalActivePath();
  return SECTIONS[org] || (path==='Государственная служба'?SECTIONS.defaultGov:SECTIONS.defaultCrime);
}
function modalLevelsForSection(section){
  return LEVELS[section] || LEVELS.default;
}
function fillOrgSectionModal(){
  const projectSelect=$('#modalProjectSelect');
  const pathSelect=$('#modalPathSelect');
  const orgSelect=$('#modalOrgSelect');
  const sectionSelect=$('#modalSectionSelect');
  const levelSelect=$('#modalOrgLevelSelect');
  if(projectSelect) projectSelect.value=S.project||'GTA5RP';
  if(pathSelect) pathSelect.value=S.path||'Государственная служба';
  const activePath=pathSelect ? pathSelect.value : S.path;
  const orgList=ORGS[activePath]||[];
  const selectedOrg=orgList.includes(S.org)?S.org:(orgList[0]||'');
  orgSelect.innerHTML=orgList.map(v=>`<option value="${v}" ${v===selectedOrg?'selected':''}>${v}</option>`).join('');

  const secList=modalSectionsForOrg(selectedOrg);
  const selectedSection=secList.includes(S.section)?S.section:(secList[0]||'');
  sectionSelect.innerHTML=secList.map(v=>`<option value="${v}" ${v===selectedSection?'selected':''}>${v}</option>`).join('');

  const lvlList=modalLevelsForSection(selectedSection);
  const rememberedLevel=rememberedLevelForSection(S,selectedSection);
  const selectedLevel=lvlList.includes(S.level)?S.level:(rememberedLevel || lvlList[0] || '');
  levelSelect.innerHTML=lvlList.map(v=>`<option value="${v}" ${v===selectedLevel?'selected':''}>${v}</option>`).join('');
}
function openOrgSectionModal(){
  if(!S.ready) return;
  fillOrgSectionModal();
  $('#orgSectionModal').classList.add('open');
}
function closeOrgSectionModal(){
  $('#orgSectionModal').classList.remove('open');
}
function saveOrgSectionModal(){
  const newProject=$('#modalProjectSelect')?.value || S.project;
  const newPath=$('#modalPathSelect')?.value || S.path;
  const newOrg=$('#modalOrgSelect').value;
  const newSection=$('#modalSectionSelect').value;
  const newLevel=$('#modalOrgLevelSelect').value;
  const changedMain = newProject!==S.project || newPath!==S.path;
  const changed = changedMain || newOrg!==S.org || newSection!==S.section || newLevel!==S.level;
  if(changed){
    changeProgressContext(()=>{
      S.project=newProject;
      S.path=newPath;
      S.org=newOrg;
      S.section=newSection;
      S.level=newLevel;
      S.configured=!!(S.org && S.section && S.level);
    });
  }else{
    S.project=newProject;
    S.path=newPath;
    S.org=newOrg;
    S.section=newSection;
    S.level=newLevel;
    S.configured=!!(S.org && S.section && S.level);
  }
  save();
  closeOrgSectionModal();
  render();
  showToast('Выбор обновлён','Прогресс пересчитан');
}
function setLevel(level){
  changeProgressContext(()=>{
    S.level=level;
    S.configured=!!(S.org && S.section && S.level);
  });
  save();
  render();
  showToast('Ступень изменена','Задачи обновлены');
}
function nextLevel(){
  const list=levels();
  const idx=list.indexOf(S.level);
  return idx>=0 && idx<list.length-1 ? list[idx+1] : '';
}
function claimPromotion(){
  const next=nextLevel();
  if(!next) return;
  save();
  setLevel(next);
  showToast('Повышение получено','Открыта следующая ступень');
}


function getGoogleProfilePhoto(){
  const fromUser=window.CloudSync && window.CloudSync.user && window.CloudSync.user.photoURL;
  const fromState=S.cloud && S.cloud.googlePhotoURL;
  const fromAccount=S.account && S.account.googlePhotoURL;
  return fromUser || fromState || fromAccount || '';
}
function rememberGoogleProfileInfo(user){
  if(!user) return;
  if(!S.cloud || typeof S.cloud!=='object') S.cloud={enabled:false,provider:'local',uid:'',lastSync:0};
  if(!S.account || typeof S.account!=='object') S.account={};
  const previousCreatedAt=profileTimestampMs(S.account.createdAt);
  if(user.metadata && user.metadata.creationTime){
    const googleCreated=Date.parse(user.metadata.creationTime);
    if(Number.isFinite(googleCreated) && googleCreated>0){
      S.cloud.googleCreatedAt=googleCreated;
      S.account.createdAt=earliestProfileTimestamp(S.account.createdAt,googleCreated)||googleCreated;
    }
  }
  if(user.photoURL){
    S.cloud.googlePhotoURL=user.photoURL;
    S.account.googlePhotoURL=user.photoURL;
  }
  if(user.email) S.cloud.googleEmail=user.email;
  if(user.displayName) S.cloud.googleName=user.displayName;
  const repairedCreatedAt=profileTimestampMs(S.account.createdAt);
  if(isUsableProfileState(S) && window.__profileBootComplete && !window.__profileHydrating && repairedCreatedAt && repairedCreatedAt!==previousCreatedAt){
  }
}


function renderProfileIcon(){
  const box=document.getElementById('profileInitial');
  if(!box) return;
  const icon=document.getElementById('rankIcon');
  const tag=document.getElementById('rankTier');
  box.querySelectorAll('.google-profile-avatar').forEach(el=>el.remove());
  const photo=getGoogleProfilePhoto();
  if(photo){
    if(icon) icon.textContent='';
    if(tag) tag.textContent='';
    const img=document.createElement('img');
    img.className='google-profile-avatar';
    img.alt='Аватар Google';
    img.referrerPolicy='no-referrer';
    img.src=photo;
    box.prepend(img);
    box.classList.add('has-google-avatar','google-avatar-active');
    box.title='Аватар Google';
  }else{
    box.classList.remove('has-google-avatar','google-avatar-active');
    const name=(S&&S.name?S.name:'RP').trim();
    const letters=(name.split(/\s+/).map(x=>x[0]).join('').slice(0,2)||'RP').toUpperCase();
    if(icon) icon.textContent=letters;
    if(tag) tag.textContent='';
    box.title='Дефолтная аватарка профиля';
  }
}


function formatProfileDate(ts){
  if(!ts) return '—';
  try{
    let ms=0;
    if(typeof ts==='number') ms=ts;
    else if(typeof ts==='string') ms=Date.parse(ts);
    else if(typeof ts==='object' && typeof ts.toDate==='function') ms=ts.toDate().getTime();
    else if(typeof ts==='object' && typeof ts.seconds==='number') ms=ts.seconds*1000;
    if(!Number.isFinite(ms) || ms<=0) return '—';
    return new Date(ms).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});
  }catch(e){return '—'}
}
function renderAccountStats(){const dateText=formatProfileDate(ensureProfileCreatedAt()); const statCreated=$('#statCreated'); if(statCreated){if('value' in statCreated) statCreated.value=dateText; else statCreated.textContent=dateText;} renderProfileIcon();}
function careerIconSvg(step){
  const title=(step && step.title) || '';
  if(title==='Academy'){
    return `<svg class="career-inline-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 8.2 12 4l9 4.2-9 4.2-9-4.2Z"></path><path d="M7.5 10.3v4.1c0 1.6 2 3 4.5 3s4.5-1.4 4.5-3v-4.1"></path><path d="M19 9.2v5.5"></path><path d="M19 16.8v1.4"></path></svg>`;
  }
  if(title==='USAF'){
    return `<svg class="career-inline-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.5 14.3 9l5.9.5-4.5 3.8 1.4 5.7-5.1-3-5.1 3 1.4-5.7-4.5-3.8 5.9-.5L12 3.5Z"></path><path d="M7.2 20.2h9.6"></path></svg>`;
  }
  if(title==='Отдел'){
    return `<svg class="career-inline-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="5" width="14" height="14" rx="3"></rect><path d="M9 9h6v6H9z"></path></svg>`;
  }
  if(step && typeof step.icon==='string' && step.icon.trim().startsWith('<svg')) return step.icon;
  return step && step.icon ? step.icon : '';
}
function careerStepCard(step){
  const cls=['path-card'];
  if(step.active) cls.push('active');
  if(step.locked) cls.push('locked');
  if(step.done) cls.push('done');
  const iconMarkup=careerIconSvg(step);
  const icon=iconMarkup?`<div class="path-step-icon">${iconMarkup}</div>`:'';
  const progress=typeof step.progress==='number'?`<div class="path-mini-progress"><i style="width:${Math.max(0,Math.min(100,step.progress))}%"></i></div>`:'';
  const statusText=String(step.status||'');
  let statusMarkup='';
  if(statusText.includes(' · ')){
    const parts=statusText.split(' · ');
    statusMarkup=`<span class="path-status path-status-split"><span class="path-level-text">${parts[0]}</span><small>${parts.slice(1).join(' · ')}</small></span>`;
  }else{
    statusMarkup=`<span class="path-status">${statusText}</span>`;
  }
  return `<div class="${cls.join(' ')}">${icon}<b>${step.title}</b>${statusMarkup}${progress}</div>`;
}
function buildCareerPathSteps(){
  const p=S.configured?percent():0;
  const steps=[];

  if(!S.org){
    steps.push({title:'Фракция',status:'Нужно выбрать',icon:'★',active:!!S.ready,locked:!S.ready});
    return steps;
  }

  const isArmy=S.org==='ARMY';
  const academyDone=isArmy && !!S.section && S.section!=='Academy';
  if(isArmy){
    const academyActive=S.section==='Academy';
    const academyCompletedButNotCurrent=academyDone && !academyActive;
    steps.push({
      title:'ARMY',
      status:S.section && S.section!=='Academy'?'Фракция активна':(academyActive?'Текущая фракция':'Фракция выбрана'),
      icon:'★',
      active:!!S.org && (!S.configured || S.section===''),
      done:!!S.org
    });
    steps.push({
      title:'Academy',
      status:academyActive?`${S.level||'В процессе'} · ${p}%`: (academyCompletedButNotCurrent?'Завершено':'Нужно выбрать'),
      icon:'🎓',
      done:academyCompletedButNotCurrent,
      active:academyActive,
      locked:!academyActive && !academyCompletedButNotCurrent,
      progress:academyActive?p:(academyCompletedButNotCurrent?100:undefined)
    });
    if(S.configured && S.section && S.section!=='Academy'){
      steps.push({
        title:S.section,
        status:`${S.level||'Ступень не выбрана'} · ${p}% до повышения`,
        icon:'▣',
        active:true,
        progress:p
      });
    }else{
      steps.push({title:'Отдел',status:'Выбор после Academy или вручную',icon:'▢',locked:true});
    }
  }else{
    steps.push({
      title:S.org,
      status:S.configured?'Фракция активна':'Выбери раздел',
      icon:'★',
      active:!!S.org && !S.configured,
      done:!!S.org
    });
    if(S.configured && S.section){
      steps.push({
        title:S.section,
        status:`${S.level||'Ступень не выбрана'} · ${p}% до повышения`,
        icon:'▣',
        active:true,
        progress:p
      });
    }else{
      steps.push({title:'Раздел',status:'Нужно выбрать',icon:'▢',locked:true});
    }
  }
  return steps;
}
function premiumCareerCard(){
  return `<div class="path-card path-premium-card" id="premiumCareerPathCard">
    <div class="path-step-icon premium-path-icon">$</div>
    <b>Премия</b>
    <span>За неделю по отчётам</span>
    <div class="path-premium-stats">
      <div><em>Баллы</em><strong id="profilePremiumPoints">0</strong></div>
      <div><em>Выплата</em><strong id="profilePremiumPay">0$</strong></div>
      <div><em>Лимит</em><strong id="profilePremiumLimit">0$</strong></div>
    </div>
  </div>`;
}
function renderPathDashboard(){
  const wrap=$('#careerPathCards');
  if(!wrap) return;
  const steps=buildCareerPathSteps();
  wrap.innerHTML=steps.map(step=>careerStepCard(step)).join('')+premiumCareerCard();
  if(typeof window.KiriPremiumSync==='function') window.KiriPremiumSync();
}
function showToast(title,text){
  $('#toast').classList.add('show');
  $('#toast b').textContent=title;
  $('#toastText').textContent=text;
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>$('#toast').classList.remove('show'),1700);
}

const FIREBASE_CONFIG={
  apiKey:"AIzaSyAIOHZIBi2l5aOiivO1q6LlVRXFjicQrhI",
  authDomain:"rp-cabinet.firebaseapp.com",
  projectId:"rp-cabinet",
  storageBucket:"rp-cabinet.firebasestorage.app",
  messagingSenderId:"686693815982",
  appId:"1:686693815982:web:94fd42fdab2ddab6c53f3f",
  measurementId:"G-250D37LHFT"
};
const CLOUD_PROFILE_ID='default_realtime';
const LEGACY_CLOUD_PROFILE_IDS=['default_v79_realtime','default_v77','default'];
const CLOUD_DEVICE_KEY='rp_cabinet_cloud_device_id';
const REMOVED_SYNC_QUEUE_KEYS=[
  'kiri:rp-cabinet:v79:mutation-queue',
  'kiri:rp-cabinet:v78:sync-patch',
  'kiri:rp-cabinet:v77:sync-patch'
];
function clearRemovedSyncQueues(){
  try{REMOVED_SYNC_QUEUE_KEYS.forEach(key=>localStorage.removeItem(key));}catch(error){}
}
function getCloudDeviceId(){
  try{
    let id=localStorage.getItem(CLOUD_DEVICE_KEY);
    if(!id){id='dev_'+Math.random().toString(36).slice(2,10)+'_'+Date.now().toString(36);localStorage.setItem(CLOUD_DEVICE_KEY,id);}
    return id;
  }catch(error){return 'dev_'+Date.now().toString(36);}
}
function deviceLabel(){
  const ua=navigator.userAgent||'';
  if(/Android/i.test(ua)) return 'Android';
  if(/iPhone|iPad/i.test(ua)) return 'iPhone / iPad';
  if(/Windows/i.test(ua)) return 'Windows';
  if(/Mac/i.test(ua)) return 'Mac';
  if(/Linux/i.test(ua)) return 'Linux';
  return 'Браузер';
}
window.__cloudSessionId='session_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);
function cloudPath(uid){return `users/${uid}/profiles/${CLOUD_PROFILE_ID}`;}
function setCloudStatus(mode,title,desc,meta){
  const el=$('#cloudSyncStatus');
  if(el){
    const dot=el.querySelector('.cloud-dot');
    if(dot) dot.className='cloud-dot '+(mode==='on'?'cloud-on':mode==='wait'?'cloud-wait':mode==='error'?'cloud-error':'cloud-off');
    const b=el.querySelector('b'); if(b) b.textContent=title;
    const sm=el.querySelector('small'); if(sm) sm.textContent=desc;
  }
  const m=$('#cloudSyncMeta'); if(m) m.textContent=meta||'';
  const googleBtn=$('#cloudGoogleLogin');
  const logoutBtn=$('#cloudLogout');
  const actions=$('#cloudSyncActions');
  const authenticated=!!(window.CloudSync&&window.CloudSync.user);
  if(googleBtn) googleBtn.classList.toggle('is-hidden',authenticated);
  if(logoutBtn) logoutBtn.classList.toggle('is-hidden',!authenticated);
  if(actions) actions.classList.toggle('cloud-connected',authenticated);
}
function formatSyncTime(ts){
  if(!ts) return 'ещё не было';
  try{return new Date(ts).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});}catch(error){return String(ts);}
}
function renderCloudSyncStatus(){
  const sync=window.CloudSync;
  const authenticated=!!sync?.user;
  document.body.classList.toggle('cloud-auth-ready',!!(sync&&(sync.authChecked||!sync.ready)));
  document.body.classList.toggle('cloud-authenticated',authenticated);
  if(authenticated&&sync.lastError){
    const error=sync.lastError;
    setCloudStatus('error',error.title||'Ошибка синхронизации',error.desc||'Облачные данные не были изменены.',error.meta||'');
    return;
  }
  if(authenticated&&sync.pendingWrites>0){
    setCloudStatus('wait','Сохраняю изменения',`Google: ${sync.user.email||'аккаунт'}. Firestore отправляет точечные изменения.`,`Ожидают подтверждения: ${sync.pendingWrites} · Ревизия: ${sync.lastRevision||0}`);
    return;
  }
  if(authenticated&&sync.serverSnapshotSeen){
    setCloudStatus('on','Синхронизация активна',`Google: ${sync.user.email||'аккаунт'}. Телефон и ПК слушают один профиль Firebase.`,`Серверная ревизия: ${sync.lastRevision||0} · Получено: ${formatSyncTime(sync.lastServerSyncAt)} · ${deviceLabel()}`);
    return;
  }
  if(authenticated){
    setCloudStatus('wait','Получаю данные Firebase','Сначала загружается серверная версия. Локальный кэш ничего не отправляет.',navigator.onLine===false?'Устройство офлайн — показывается последний кэш без обратной записи.':'Ожидаю первый серверный снимок.');
    return;
  }
  if(sync?.ready){
    setCloudStatus('off','Синхронизация выключена','Войди через Google, чтобы использовать один профиль на телефоне и ПК.','Без Google данные остаются только на этом устройстве.');
  }else{
    setCloudStatus('wait','Подготовка Firebase','Проверяю подключение к Firebase.','');
  }
}
function selectLegacyCloudProfileState(cloudDoc){
  if(!cloudDoc||typeof cloudDoc!=='object') return null;
  if(Number(cloudDoc.schemaVersion)===REALTIME_SCHEMA_VERSION&&cloudDoc.core){
    return realtimeCloudDocumentToState(cloudDoc,S);
  }
  const candidates=[cloudDoc.state,cloudDoc.recoveryState].filter(isRecoverableProfileState);
  if(!candidates.length) return null;
  candidates.sort((a,b)=>{
    const ac=hasCompleteProfileContext(a)?1:0;
    const bc=hasCompleteProfileContext(b)?1:0;
    if(ac!==bc) return bc-ac;
    return Number(b.updatedAt||0)-Number(a.updatedAt||0);
  });
  const source=realtimeClone(candidates[0]);
  source.progressByContext=source.progressByContext&&typeof source.progressByContext==='object'?source.progressByContext:{};
  source.selectedLevelBySection=source.selectedLevelBySection&&typeof source.selectedLevelBySection==='object'?source.selectedLevelBySection:{};
  source.proofsByContext=source.proofsByContext&&typeof source.proofsByContext==='object'?source.proofsByContext:{};
  source.reportsByContext=source.reportsByContext&&typeof source.reportsByContext==='object'?source.reportsByContext:{};
  return normalizeProfileData(source);
}
function profileSeedFreshness(state,sourceMeta={}){
  if(!state||typeof state!=='object') return 0;
  const candidates=[
    Number(state.updatedAt||0),
    Number(state?.cloud?.lastCloudUpdatedAt||0),
    Number(state?.cloud?.lastSync||0),
    Number(sourceMeta.updatedAtMs||0),
    profileTimestampMs(sourceMeta.updatedAt)
  ].filter(value=>Number.isFinite(value)&&value>0);
  return candidates.length?Math.max(...candidates):0;
}
function chooseInitialRealtimeSeed(candidates){
  const usable=(candidates||[]).filter(entry=>entry&&isUsableProfileState(entry.state));
  usable.sort((a,b)=>{
    const ac=hasCompleteProfileContext(a.state)?1:0;
    const bc=hasCompleteProfileContext(b.state)?1:0;
    if(ac!==bc) return bc-ac;
    return Number(b.freshness||0)-Number(a.freshness||0);
  });
  return usable[0]?.state||null;
}
function finishProfileBoot(){
  if(window.__profileBootComplete||window.__profileBootFinishing) return;
  window.__profileBootFinishing=true;
  window.__profileBootComplete=true;
  rememberRealtimeLocalBaseline(S);
  render();
  applyDashTab();
  renderCloudSyncStatus();
  const root=document.documentElement;
  root.classList.add('profile-boot-leaving');
  document.body.classList.add('profile-boot-leaving');
  requestAnimationFrame(()=>{
    document.body.classList.remove('profile-booting');
    root.classList.remove('profile-booting');
    setTimeout(()=>{
      root.classList.remove('profile-boot-leaving');
      document.body.classList.remove('profile-boot-leaving');
      window.__profileBootFinishing=false;
    },320);
  });
}

window.CloudSync={
  ready:false,
  authChecked:false,
  app:null,
  auth:null,
  db:null,
  user:null,
  unsub:null,
  attaching:false,
  documentReady:false,
  serverSnapshotSeen:false,
  lastRevision:0,
  lastServerSyncAt:0,
  pendingWrites:0,
  lastError:null,
  bootFallbackTimer:null,
  async init(){
    clearRemovedSyncQueues();
    try{
      if(!window.firebase) throw new Error('Firebase SDK не загрузился');
      this.app=firebase.apps&&firebase.apps.length?firebase.app():firebase.initializeApp(FIREBASE_CONFIG);
      this.auth=firebase.auth();
      this.db=firebase.firestore();
      try{
        await this.db.enablePersistence({synchronizeTabs:true});
      }catch(error){
        if(!['failed-precondition','unimplemented'].includes(error?.code)) console.warn('Firestore persistence unavailable',error);
      }
      try{await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);}catch(error){console.warn('Auth persistence unavailable',error);}
      this.ready=true;
      renderCloudSyncStatus();
      this.auth.onAuthStateChanged(user=>this.onAuth(user));
    }catch(error){
      console.warn('Firebase init failed',error);
      this.ready=false;
      this.authChecked=true;
      document.body.classList.add('cloud-auth-ready');
      this.lastError={title:'Firebase недоступен',desc:'Панель работает только с локальным кэшем.',meta:String(error.message||error)};
      renderCloudSyncStatus();
      finishProfileBoot();
    }
  },
  async loginGoogle(){
    if(!this.auth) return showToast('Firebase не готов','Подожди несколько секунд');
    try{
      const provider=new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({prompt:'select_account'});
      await this.auth.signInWithPopup(provider);
    }catch(error){
      console.warn('Google login failed',error);
      showToast('Вход не выполнен','Авторизация отменена или заблокирована браузером');
      renderCloudSyncStatus();
    }
  },
  async logout(){
    try{
      window.__cloudSigningOut=true;
      if(this.unsub){this.unsub();this.unsub=null;}
      clearTimeout(this.bootFallbackTimer);
      this.user=null;
      this.documentReady=false;
      this.serverSnapshotSeen=false;
      this.pendingWrites=0;
      await this.auth?.signOut();
      S.cloud={enabled:false,provider:'local',uid:'',lastSync:S.cloud?.lastSync||0};
      window.__profileHydrating=true;
      save();
      window.__profileHydrating=false;
      window.__cloudSigningOut=false;
      render();
      renderCloudSyncStatus();
      showToast('Выход выполнен','Облачная синхронизация отключена на этом устройстве');
    }catch(error){
      window.__cloudSigningOut=false;
      showToast('Не удалось выйти','Попробуй ещё раз');
    }
  },
  async onAuth(user){
    this.authChecked=true;
    document.body.classList.add('cloud-auth-ready');
    this.user=user||null;
    this.lastError=null;
    if(!user){
      if(this.unsub){this.unsub();this.unsub=null;}
      this.documentReady=false;
      this.serverSnapshotSeen=false;
      renderCloudSyncStatus();
      finishProfileBoot();
      return;
    }
    window.__profileHydrating=true;
    rememberGoogleProfileInfo(user);
    window.__profileHydrating=false;
    await this.attachProfile();
  },
  profileRef(){return this.db.doc(cloudPath(this.user.uid));},
  legacyProfileRefs(){return LEGACY_CLOUD_PROFILE_IDS.map(id=>this.db.doc(`users/${this.user.uid}/profiles/${id}`));},
  writer(){return {deviceId:getCloudDeviceId(),sessionId:window.__cloudSessionId,label:deviceLabel()};},
  async readLegacyCloudSeeds(){
    const candidates=[];
    for(const ref of this.legacyProfileRefs()){
      try{
        const snap=await ref.get({source:'server'});
        if(!snap.exists) continue;
        const data=snap.data()||{};
        const source=selectLegacyCloudProfileState(data);
        if(isRecoverableProfileState(source)){
          candidates.push({state:source,freshness:profileSeedFreshness(source,data)});
        }
      }catch(error){console.warn('Legacy cloud read failed',error);}
    }
    return candidates;
  },
  async bootstrapDocument(seedState){
    if(!this.user||!this.db||!isUsableProfileState(seedState)) return null;
    const ref=this.profileRef();
    let result=null;
    await this.db.runTransaction(async transaction=>{
      const current=await transaction.get(ref);
      if(current.exists){result=current.data()||{};return;}
      const normalized=normalizeProfileData(seedState)||seedState;
      const documentData=buildRealtimeCloudDocument(normalized,{
        profileId:CLOUD_PROFILE_ID,
        ownerUid:this.user.uid,
        revision:1,
        writer:this.writer(),
        updatedAtMs:Date.now()
      });
      documentData.updatedAt=firebase.firestore.FieldValue.serverTimestamp();
      transaction.set(ref,documentData,{merge:false});
      result=documentData;
    });
    return result;
  },
  subscribeRealtime(){
    if(!this.user||!this.db) return;
    if(this.unsub){this.unsub();this.unsub=null;}
    this.unsub=this.profileRef().onSnapshot({includeMetadataChanges:true},snapshot=>{
      if(!snapshot.exists){
        this.documentReady=false;
        renderCloudSyncStatus();
        return;
      }
      this.handleSnapshot(snapshot,!snapshot.metadata.fromCache&&!snapshot.metadata.hasPendingWrites);
    },error=>{
      console.warn('Realtime listener failed',error);
      this.lastError={title:'Нет связи с Firebase',desc:'Входящие изменения временно не поступают. Локальный кэш не будет отправлен назад автоматически.',meta:String(error.message||error).slice(0,160)};
      renderCloudSyncStatus();
      if(!window.__profileBootComplete) finishProfileBoot();
    });
  },
  handleSnapshot(snapshot,serverConfirmed=false){
    if(!snapshot?.exists||!this.user) return;
    const data=snapshot.data()||{};
    if(Number(data.schemaVersion)!==REALTIME_SCHEMA_VERSION||!data.core) return;
    const incomingRevision=Number(data.revision||0);
    const previousRevision=this.lastRevision;
    if(incomingRevision<previousRevision) return;
    this.documentReady=true;
    this.lastRevision=Math.max(this.lastRevision,incomingRevision);
    if(serverConfirmed){
      this.serverSnapshotSeen=true;
      this.lastServerSyncAt=Date.now();
      this.lastError=null;
      clearTimeout(this.bootFallbackTimer);
    }
    this.applyCanonicalState(data,{
      fromServer:serverConfirmed,
      hasPendingWrites:!!snapshot.metadata?.hasPendingWrites,
      previousRevision
    });
    if(serverConfirmed&&!window.__profileBootComplete) finishProfileBoot();
  },
  applyCanonicalState(documentData,meta={}){
    const remote=realtimeCloudDocumentToState(documentData,S);
    const normalized=normalizeProfileData(remote)||remote;
    const stableCreatedAt=earliestProfileTimestamp(normalized?.account?.createdAt,S?.account?.createdAt);
    if(stableCreatedAt){
      if(!normalized.account||typeof normalized.account!=='object') normalized.account={};
      normalized.account.createdAt=stableCreatedAt;
    }
    normalized.cloud=Object.assign({},normalized.cloud||{}, {
      enabled:true,
      provider:'google',
      uid:this.user.uid,
      lastSync:Date.now(),
      lastCloudUpdatedAt:Number(documentData.updatedAtMs||Date.now()),
      googlePhotoURL:this.user.photoURL||normalized.cloud?.googlePhotoURL||'',
      googleEmail:this.user.email||normalized.cloud?.googleEmail||''
    });
    restoreProgressForState(normalized);
    const writerDevice=String(documentData?.writer?.deviceId||'');
    const external=writerDevice&&writerDevice!==getCloudDeviceId();
    window.__cloudApplyingRemote=true;
    S=normalized;
    rememberGoogleProfileInfo(this.user);
    save();
    window.__cloudApplyingRemote=false;
    if(window.__profileBootComplete){
      render();
      applyDashTab();
    }
    renderCloudSyncStatus();
    if(meta.fromServer&&external&&Number(documentData.revision||0)>Number(meta.previousRevision||0)&&!meta.hasPendingWrites&&window.__profileBootComplete){
      showToast('Данные синхронизированы',`Изменения получены с устройства: ${documentData?.writer?.label||'другое устройство'}`);
    }
  },
  async attachProfile(){
    if(!this.user||!this.db||this.attaching) return;
    this.attaching=true;
    window.__cloudAttaching=true;
    this.lastError=null;
    this.serverSnapshotSeen=false;
    renderCloudSyncStatus();
    this.subscribeRealtime();
    clearTimeout(this.bootFallbackTimer);
    this.bootFallbackTimer=setTimeout(()=>{
      if(!window.__profileBootComplete){
        this.lastError=navigator.onLine===false
          ? {title:'Офлайн-режим',desc:'Показываю последний кэш. При появлении интернета сервер Firebase будет прочитан первым.',meta:'Обновление страницы не отправляет кэш в облако.'}
          : {title:'Firebase отвечает медленно',desc:'Показываю кэш, но продолжаю ждать серверную версию.',meta:'Старые данные не записываются автоматически.'};
        finishProfileBoot();
      }
      renderCloudSyncStatus();
    },8000);
    try{
      const ref=this.profileRef();
      let snapshot=await ref.get({source:'server'});
      if(!snapshot.exists){
        const legacyCandidates=await this.readLegacyCloudSeeds();
        const localSeed=normalizeProfileData(S);
        const candidates=[...legacyCandidates];
        if(isRecoverableProfileState(localSeed)){
          candidates.push({state:localSeed,freshness:profileSeedFreshness(localSeed)});
        }
        const seed=chooseInitialRealtimeSeed(candidates);
        if(seed){
          await this.bootstrapDocument(seed);
          snapshot=await ref.get({source:'server'});
        }
      }
      if(snapshot.exists){
        this.handleSnapshot(snapshot,true);
      }else{
        this.documentReady=false;
        this.serverSnapshotSeen=true;
        this.lastServerSyncAt=Date.now();
        clearTimeout(this.bootFallbackTimer);
        finishProfileBoot();
      }
    }catch(error){
      console.warn('Cloud attach failed',error);
      this.lastError={title:'Не удалось прочитать Firebase',desc:'Показываю последний кэш без обратной записи. После восстановления сети сервер будет прочитан заново.',meta:String(error.message||error).slice(0,160)};
      try{
        const cached=await this.profileRef().get({source:'cache'});
        if(cached.exists) this.handleSnapshot(cached,false);
      }catch(cacheError){}
      if(!window.__profileBootComplete) finishProfileBoot();
    }finally{
      this.attaching=false;
      window.__cloudAttaching=false;
      renderCloudSyncStatus();
    }
  },
  operationsToFirestoreUpdate(operations){
    const payload={};
    (operations||[]).forEach(operation=>{
      if(!operation?.path) return;
      payload[operation.path]=operation.type==='delete'
        ? firebase.firestore.FieldValue.delete()
        : realtimeClone(operation.value);
    });
    return payload;
  },
  async commitDiff(beforeState,afterState,retry=false){
    if(!this.ready||!this.user||window.__cloudApplyingRemote||window.__cloudAttaching||window.__cloudSigningOut) return;
    const operations=buildRealtimeStateDiff(beforeState,afterState);
    if(!operations.length) return;
    if(!this.documentReady){
      try{
        await this.bootstrapDocument(afterState);
        this.documentReady=true;
      }catch(error){
        this.lastError={title:'Изменение не отправлено',desc:'Не удалось создать облачный профиль. Локальная версия сохранена только как кэш.',meta:String(error.message||error).slice(0,160)};
        renderCloudSyncStatus();
        return;
      }
    }
    const payload=this.operationsToFirestoreUpdate(operations);
    payload.schemaVersion=REALTIME_SCHEMA_VERSION;
    payload.clientVersion=REALTIME_SCHEMA_VERSION;
    payload.profileId=CLOUD_PROFILE_ID;
    payload.ownerUid=this.user.uid;
    payload.revision=firebase.firestore.FieldValue.increment(1);
    payload.updatedAt=firebase.firestore.FieldValue.serverTimestamp();
    payload.updatedAtMs=Date.now();
    payload.writer=this.writer();
    this.pendingWrites+=1;
    this.lastError=null;
    renderCloudSyncStatus();
    try{
      await this.profileRef().update(payload);
      this.documentReady=true;
      this.lastError=null;
    }catch(error){
      if(!retry&&error?.code==='not-found'){
        try{
          await this.bootstrapDocument(afterState);
          this.documentReady=true;
          return await this.commitDiff(beforeState,afterState,true);
        }catch(bootstrapError){error=bootstrapError;}
      }
      console.warn('Realtime field update failed',error);
      this.lastError={title:'Изменение не синхронизировано',desc:'Firebase отклонил точечную запись. Облачный профиль не был заменён локальным снимком.',meta:String(error.message||error).slice(0,160)};
    }finally{
      this.pendingWrites=Math.max(0,this.pendingWrites-1);
      renderCloudSyncStatus();
    }
  },
  async resume(){
    if(!this.user||!this.db||this.attaching) return;
    try{
      const snapshot=await this.profileRef().get({source:'server'});
      if(snapshot.exists) this.handleSnapshot(snapshot,true);
      else await this.attachProfile();
    }catch(error){
      this.lastError={title:'Ожидаю интернет',desc:'Сервер Firebase пока недоступен. Кэш не отправляется автоматически.',meta:String(error.message||error).slice(0,140)};
      renderCloudSyncStatus();
    }
  }
};

function openSettings(){
  $('#settingsName').value=S.name||'';
  document.querySelectorAll('.theme-card').forEach(card=>card.classList.toggle('active',card.dataset.style===S.style));
  renderCloudSyncStatus();
  $('#settingsModal').classList.add('open');
}
function closeSettings(){
  $('#settingsModal').classList.remove('open');
}
function saveSettings(){
  const newName=$('#settingsName').value.trim() || S.name || 'Игрок';
  const active=document.querySelector('.theme-card.active')?.dataset.style || S.style || 'style-arctic';
  S.name=newName;
  S.style=active;
  save();
  closeSettings();
  render();
  showToast('Настройки сохранены','Стиль обновлён');
}
$('#createProfile').onclick=()=>{
  const name=$('#firstName').value.trim();
  if(!name){$('#firstError').classList.add('show');return}
  $('#firstError').classList.remove('show');
  S={ready:true,name,project:$('#firstProject').value,path:document.querySelector('[name="path"]:checked').value,style:'style-violet',org:'',section:'',level:'',configured:false,tasks:{},progressByContext:{},selectedLevelBySection:{},proofsByContext:{},reportsByContext:{},account:{createdAt:Date.now(),initialName:name}};
  save();
  render();
};

$('#saveSetup').onclick=()=>{
  changeProgressContext(()=>{
    S.section=$('#sectionSelect').value;
    S.level=$('#levelSelect').value;
    S.configured=true;
  });
  save();
  render();
};

$('#closeOrgSectionModal').onclick=closeOrgSectionModal;
$('#saveOrgSectionModal').onclick=()=>window.saveOrgSectionModal();
function refreshOrgChoicesForModalPath(){
  const path=$('#modalPathSelect')?.value || S.path;
  const orgList=ORGS[path]||[];
  const orgSelect=$('#modalOrgSelect');
  const oldOrg=orgSelect.value;
  const selectedOrg=orgList.includes(oldOrg)?oldOrg:(orgList[0]||'');
  orgSelect.innerHTML=orgList.map(v=>`<option value="${v}" ${v===selectedOrg?'selected':''}>${v}</option>`).join('');
  refreshSectionChoicesForModalOrg();
}
function refreshSectionChoicesForModalOrg(){
  const org=$('#modalOrgSelect').value;
  const secList=modalSectionsForOrg(org);
  const sectionSelect=$('#modalSectionSelect');
  const oldSection=sectionSelect.value;
  const selectedSection=secList.includes(oldSection)?oldSection:(secList[0]||'');
  sectionSelect.innerHTML=secList.map(v=>`<option value="${v}" ${v===selectedSection?'selected':''}>${v}</option>`).join('');
  const lvlList=modalLevelsForSection(sectionSelect.value);
  const rememberedLevel=rememberedLevelForSection(Object.assign({},S,{org}),selectedSection);
  const selectedLevel=rememberedLevel || lvlList[0] || '';
  $('#modalOrgLevelSelect').innerHTML=lvlList.map(v=>`<option value="${v}" ${v===selectedLevel?'selected':''}>${v}</option>`).join('');
}
function sectionTabIconSvg(section){
  if(section==='USAF') return '<svg viewBox="0 0 24 24"><path d="M2 16l20-8-8 8 1 6-4-4-5 2 2-4-6 0Z"/></svg>';
  if(section==='MP') return '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>';
  if(section==='DF') return '<svg viewBox="0 0 24 24"><path d="M4 20V8l8-4 8 4v12"/><path d="M8 20v-7h8v7"/></svg>';
  if(section==='SD') return '<svg viewBox="0 0 24 24"><path d="M4 17h16"/><path d="M6 17l2-7h8l2 7"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></svg>';
  if(section==='RAP') return '<svg viewBox="0 0 24 24"><path d="M4 9v6"/><path d="M8 7v10"/><path d="M12 5v14"/><path d="M16 7v10"/><path d="M20 9v6"/></svg>';
  if(section==='SAS') return '<svg viewBox="0 0 24 24"><path d="M14.5 4.5 19 9 8 20H4v-4L15 5Z"/><path d="M13 6l5 5"/></svg>';
  if(section==='ED') return '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5Z"/></svg>';
  return '<svg viewBox="0 0 24 24"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3.5 2 8.5 2 12 0v-5"/><path d="M22 10v6"/></svg>';
}

const DASH_TABS={profile:1,progress:1,department:1,tests:1,reports:1};
const DASH_TAB_KEY='kiri:rp-cabinet:active-tab:'+location.pathname;
let activeDashTab=(function(){try{const tab=localStorage.getItem(DASH_TAB_KEY)||'profile';return DASH_TABS[tab]?tab:'profile';}catch(e){return 'profile';}})();
function setActiveDashTab(tab,persist=true){
  activeDashTab=DASH_TABS[tab]?tab:'profile';
  applyDashTab();
  if(persist){try{localStorage.setItem(DASH_TAB_KEY,activeDashTab);}catch(e){}}
  try{document.dispatchEvent(new CustomEvent('kiri:profile-pins-changed'));}catch(e){}
}
document.addEventListener('click',event=>{
  const target=event.target;
  const btn=target&&target.closest?target.closest('.dash-tab'):null;
  if(!btn||!btn.dataset.dashTab) return;
  event.preventDefault();
  event.stopPropagation();
  if(event.stopImmediatePropagation) event.stopImmediatePropagation();
  setActiveDashTab(btn.dataset.dashTab);
},true);
$('#openSettings').onclick=openSettings;
$('#closeSettings').onclick=closeSettings;
$('#saveSettings').onclick=saveSettings;
$('#settingsModal').onclick=e=>{if(e.target.id==='settingsModal')closeSettings()};
$('#cloudGoogleLogin')?.addEventListener('click',()=>CloudSync.loginGoogle());
$('#cloudLogout')?.addEventListener('click',()=>CloudSync.logout());
$('#orgSectionModal').onclick=e=>{if(e.target.id==='orgSectionModal')closeOrgSectionModal()};
document.querySelectorAll('.theme-card').forEach(card=>{
  card.onclick=()=>{
    document.querySelectorAll('.theme-card').forEach(c=>c.classList.remove('active'));
    card.classList.add('active');
  };
});

(function(){
  const RATE=10000;
  const LIMITS={1:35000,2:50000,3:100000,4:145000,5:180000,6:240000,7:300000,8:340000,9:400000,10:450000,11:500000,12:550000,13:600000,14:650000,15:700000,16:750000};
  const root=document.querySelector('#dashboardReports .reports-premium-card');
  if(!root) return;
  const selectedBox=root.querySelector('.premium-selected-box');
  const selectedList=root.querySelector('.premium-selected-list');
  let selected=[];
  const parsePoints=v=>{const n=parseFloat(String(v??'0').replace(',','.'));return Number.isFinite(n)?Math.max(0,n):0;};
  const norm=v=>Math.max(0,Math.round((Number(v)||0)*10)/10);
  const ptxt=v=>String(norm(v)).replace('.',',');
  const money=v=>new Intl.NumberFormat('ru-RU').format(Math.max(0,Math.round(Number(v)||0)))+'$';
  const keyOf=(name,note,points)=>[name,note,String(norm(points))].join('||');
  const selectedPoints=()=>selected.reduce((sum,item)=>sum+norm(item.points)*Math.max(1,Math.round(Number(item.count)||1)),0);
  const currentRank=()=>{
    const raw=String((typeof S!=='undefined' && S && S.level) ? S.level : '');
    const match=raw.match(/\d+/);
    const n=match ? parseInt(match[0],10) : 1;
    return Math.max(1,Math.min(16,Number.isFinite(n)?n:1));
  };
  const currentRankSource=()=>{
    if(typeof S==='undefined' || !S || !S.configured) return 'Ступень не выбрана';
    return [S.org,S.section,S.level].filter(Boolean).join(' · ');
  };
  const getLimit=()=>LIMITS[currentRank()]||LIMITS[1];
  const updateProfilePremium=vals=>{
    const pts=document.getElementById('profilePremiumPoints');
    const pay=document.getElementById('profilePremiumPay');
    const lim=document.getElementById('profilePremiumLimit');
    if(pts) pts.textContent=ptxt(selectedPoints());
    if(pay) pay.textContent=money(vals.pay||0);
    if(lim) lim.textContent=money(vals.limit||0);
  };
  const update=()=>{
    const rank=currentRank();
    const points=selectedPoints(), limit=getLimit(), raw=points*RATE, pay=Math.min(raw,limit), burn=Math.max(0,raw-limit);
    const vals={raw,limit,pay,burn};
    Object.entries(vals).forEach(([k,v])=>{root.querySelectorAll(`[data-premium-output="${k}"]`).forEach(el=>{el.textContent=money(v);});});
    root.querySelectorAll('[data-premium-output="rank"]').forEach(el=>{el.textContent=rank+' ранг';});
    root.querySelectorAll('[data-premium-output="points"]').forEach(el=>{el.textContent=ptxt(points)+' б.';});
    root.querySelectorAll('[data-premium-output="rank-source"]').forEach(el=>{el.textContent=currentRankSource();});
    root.querySelectorAll('[data-premium-limit-fill]').forEach(el=>{el.style.width=(limit>0?Math.min(100,Math.round(pay/limit*100)):0)+'%';});
    updateProfilePremium(vals);
  };
  const renderSelected=()=>{
    if(!selectedList||!selectedBox)return;
    selected=cleanPremiumSelection(selected).map((item,index)=>Object.assign({},item,{order:index}));
    if(!selected.length){selectedBox.classList.add('is-empty');selectedList.innerHTML='<p class="premium-selected-empty">Выбранные активности появятся здесь.</p>';return;}
    selectedBox.classList.remove('is-empty');
    selectedList.innerHTML=selected.map(item=>`<button class="premium-selected-item" type="button" data-premium-remove="${item.key.replace(/"/g,'&quot;')}" title="Убрать один повтор"><span class="premium-selected-name">${item.name}</span>${item.note?`<span class="premium-selected-note">${item.note}</span>`:''}<strong class="premium-selected-points">+${ptxt(item.points)} б.</strong><span class="premium-selected-count">×${item.count}</span></button>`).join('');
  };
  const commitSelection=()=>{
    selected=cleanPremiumSelection(selected).map((item,index)=>Object.assign({},item,{order:index}));
    S.premiumSelectedActivities=selected.map(item=>Object.assign({},item));
    renderSelected();
    update();
    save();
  };
  const addRow=row=>{
    const points=parsePoints(row.getAttribute('data-premium-add'));
    if(!points)return;
    const name=row.querySelector('.premium-activity-name')?.textContent.trim()||'Активность';
    const note=row.querySelector('.premium-activity-note')?.textContent.trim()||'';
    const key=keyOf(name,note,points);
    const found=selected.find(x=>x.key===key);
    if(found) found.count=Math.max(1,Number(found.count)||1)+1;
    else selected.push({key,name,note,points:norm(points),count:1,order:selected.length});
    commitSelection();
    row.classList.add('premium-row-clicked'); setTimeout(()=>row.classList.remove('premium-row-clicked'),170);
  };
  const removeKey=key=>{
    const item=selected.find(x=>x.key===key); if(!item)return;
    item.count=Math.max(0,(Number(item.count)||1)-1);
    if(item.count<=0) selected=selected.filter(x=>x!==item);
    commitSelection();
  };
  const reset=()=>{selected=[];commitSelection();};
  root.addEventListener('click',e=>{
    const add=e.target.closest('.premium-activity-row[data-premium-add]');
    if(add&&root.contains(add)){e.preventDefault();addRow(add);return;}
    const rem=e.target.closest('.premium-selected-item[data-premium-remove]');
    if(rem&&root.contains(rem)){e.preventDefault();removeKey(rem.getAttribute('data-premium-remove')||'');return;}
    const rst=e.target.closest('.premium-reset-btn');
    if(rst&&root.contains(rst)){e.preventDefault();reset();}
  });
  root.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return; const row=e.target.closest('.premium-activity-row[data-premium-add]'); if(row&&root.contains(row)){e.preventDefault();addRow(row);}});
  window.KiriPremiumSync=()=>{
    selected=cleanPremiumSelection(S?.premiumSelectedActivities).map((item,index)=>Object.assign({},item,{order:index}));
    renderSelected();
    update();
  };
  window.KiriPremiumSync();
})();

function hasActiveSection(){ return !!(S && S.configured && S.section); }
function departmentDisplayName(){ return hasActiveSection() ? S.section : ''; }
function departmentInfoTitle(section){ return (section==='Academy' || section==='USAF') ? section : '▣ '+section; }
function renderDynamicDepartmentDashboard(){
  const has=hasActiveSection();
  document.body.classList.toggle('has-section',has);
  if(!has && (activeDashTab==='department' || activeDashTab==='tests')) activeDashTab='profile';
  const section=departmentDisplayName();
  document.body.classList.toggle('academy-info-clean', section==='Academy' || section==='USAF');
  document.body.classList.toggle('usaf-info-clean', section==='USAF');
  const depLabel=document.getElementById('sectionInfoTabLabel');
  const depIcon=document.getElementById('sectionInfoTabIcon');
  const testsLabel=document.getElementById('sectionTestsTabLabel');
  const testsIcon=document.getElementById('sectionTestsTabIcon');
  if(depLabel) depLabel.textContent=section || 'Отдел';
  if(depIcon) depIcon.innerHTML=sectionTabIconSvg(section || 'Academy');
  if(testsLabel) testsLabel.textContent='Тесты';
  if(testsIcon) testsIcon.innerHTML='<svg viewBox="0 0 24 24"><path d="M9 11l2 2 4-5"/><path d="M20 6 9 17l-5-5"/><path d="M4 20h16"/></svg>';

  const title=document.getElementById('departmentInfoTitle');
  const desc=document.getElementById('departmentInfoDesc');
  const badge=document.getElementById('departmentInfoBadge');
  const content=document.getElementById('departmentInfoContent');
  if(title) title.textContent=has ? departmentInfoTitle(section) : 'Отдел';
  if(desc) desc.textContent=section==='Academy' ? '' : `Информация по отделу ${section}.`;
  if(badge) badge.textContent=section ? section.toUpperCase() : '—';
  if(content){
    if(!has){content.innerHTML='';}
    else if(section==='Academy'){
      const tpl=document.getElementById('academyInfoTemplate');
      content.innerHTML=tpl ? tpl.innerHTML : '';
    }else if(section==='USAF'){
      const tpl=document.getElementById('usafInfoTemplateV20');
      content.innerHTML=tpl ? tpl.innerHTML : '';
    }else{
      const tpl=document.getElementById('genericDepartmentInfoTemplate');
      content.innerHTML=tpl ? tpl.innerHTML : '';
      const h=content.querySelector('[data-department-placeholder-title]');
      if(h) h.textContent=section;
    }
  }

  const testsContent=document.getElementById('departmentTestsContent');
  if(testsContent){
    if(!has){testsContent.innerHTML='';}
    else if(section==='Academy'){
      const tpl=document.getElementById('academyTestsTemplate');
      testsContent.innerHTML=tpl ? tpl.innerHTML : '';
    }else if(section==='USAF'){
      const tpl=document.getElementById('usafTestsTemplateV20');
      testsContent.innerHTML=tpl ? tpl.innerHTML : '';
    }else if(section==='SAS'){
      const tpl=document.getElementById('usafTestsTemplate');
      testsContent.innerHTML=tpl ? tpl.innerHTML : '';
    }else{
      testsContent.innerHTML=`<div class="department-placeholder"><h3>Тесты ${section}</h3><p>Вкладка уже переключается под выбранный отдел. Для этого отдела в старой панели отдельный блок с готовыми тестами пока не найден в текущей сборке, поэтому сюда можно будет перенести вопросы, когда добавим источник.</p></div>`;
    }
  }
}
function applyDashTab(){
  renderDynamicDepartmentDashboard();
  document.body.dataset.activeDashTab=activeDashTab;
  document.querySelectorAll('.dash-tab').forEach(b=>b.classList.toggle('active', b.dataset.dashTab===activeDashTab));
}

(function(){
  const fieldTitles={project:'Изменить проект',path:'Изменить путь',org:'Изменить организацию',section:'Изменить раздел',level:'Изменить ступень'};
  let activeProfileField='all';

  function opt(value,label,selected){
    return `<option value="${String(value).replaceAll('"','&quot;')}" ${selected?'selected':''}>${label}</option>`;
  }
  function currentPathForModal(){
    return document.getElementById('modalPathSelect')?.value || S.path || '';
  }
  function setFieldVisibility(field){
    const map={
      project:'modalProjectSelect',
      path:'modalPathSelect',
      org:'modalOrgSelect',
      section:'modalSectionSelect',
      level:'modalOrgLevelSelect'
    };
    Object.entries(map).forEach(([key,id])=>{
      const el=document.getElementById(id);
      const wrap=el?.closest('.field');
      if(wrap) wrap.classList.toggle('is-hidden', field!==key && field!=='all');
    });
    const title=document.querySelector('#orgSectionModal h2');
    const desc=document.querySelector('#orgSectionModal h2 + p');
    if(title) title.textContent=fieldTitles[field] || 'Изменить профиль';
    if(desc) desc.textContent='Нажми нужный вариант и сохрани. Остальные поля не меняются.';
  }

  window.modalActivePath=function(){ return currentPathForModal() || S.path || 'Государственная служба'; };
  window.modalSectionsForOrg=function(org){
    const path=modalActivePath();
    return SECTIONS[org] || (path==='Государственная служба'?SECTIONS.defaultGov:SECTIONS.defaultCrime);
  };
  window.modalLevelsForSection=function(section){ return LEVELS[section] || LEVELS.default; };

  window.fillOrgSectionModal=function(field='all'){
    activeProfileField=field;
    const projectSelect=document.getElementById('modalProjectSelect');
    const pathSelect=document.getElementById('modalPathSelect');
    const orgSelect=document.getElementById('modalOrgSelect');
    const sectionSelect=document.getElementById('modalSectionSelect');
    const levelSelect=document.getElementById('modalOrgLevelSelect');

    if(projectSelect){
      const projects=['GTA5RP','Majestic RP'];
      projectSelect.innerHTML=projects.map(v=>opt(v,v,(S.project||'GTA5RP')===v)).join('');
    }
    if(pathSelect){
      const paths=['Государственная служба','Крайм'];
      pathSelect.innerHTML=paths.map(v=>opt(v,v,(S.path||'Государственная служба')===v)).join('');
    }

    const activePath=pathSelect?.value || S.path || '';
    const orgList=activePath ? (ORGS[activePath]||[]) : [];
    const selectedOrg=orgList.includes(S.org)?S.org:'';
    if(orgSelect){
      orgSelect.innerHTML=opt('', 'Не выбрано', !selectedOrg)+orgList.map(v=>opt(v,v,v===selectedOrg)).join('');
    }

    const secList=selectedOrg ? modalSectionsForOrg(selectedOrg) : [];
    const selectedSection=secList.includes(S.section)?S.section:'';
    if(sectionSelect){
      sectionSelect.innerHTML=opt('', 'Не выбрано', !selectedSection)+secList.map(v=>opt(v,v,v===selectedSection)).join('');
    }

    const lvlList=selectedSection ? modalLevelsForSection(selectedSection) : [];
    const rememberedLevel=rememberedLevelForSection(Object.assign({},S,{path:activePath,org:selectedOrg}),selectedSection);
    const selectedLevel=lvlList.includes(S.level)?S.level:(rememberedLevel || '');
    if(levelSelect){
      levelSelect.innerHTML=opt('', 'Не выбрано', !selectedLevel)+lvlList.map(v=>opt(v,v,v===selectedLevel)).join('');
    }
    setFieldVisibility(field);
  };

  window.openOrgSectionModal=function(field='all'){
    if(!S.ready) return;
    activeProfileField=typeof field==='string'?field:'all';
    fillOrgSectionModal(activeProfileField);
    document.getElementById('orgSectionModal')?.classList.add('open');
  };

  window.refreshOrgChoicesForModalPath=function(){
    const path=document.getElementById('modalPathSelect')?.value || '';
    const orgSelect=document.getElementById('modalOrgSelect');
    if(!orgSelect) return;
    const orgList=path ? (ORGS[path]||[]) : [];
    const oldOrg=orgSelect.value;
    const selectedOrg=orgList.includes(oldOrg)?oldOrg:'';
    orgSelect.innerHTML=opt('', 'Не выбрано', !selectedOrg)+orgList.map(v=>opt(v,v,v===selectedOrg)).join('');
    refreshSectionChoicesForModalOrg();
  };
  window.refreshSectionChoicesForModalOrg=function(){
    const org=document.getElementById('modalOrgSelect')?.value || '';
    const sectionSelect=document.getElementById('modalSectionSelect');
    const levelSelect=document.getElementById('modalOrgLevelSelect');
    if(!sectionSelect || !levelSelect) return;
    const secList=org ? modalSectionsForOrg(org) : [];
    const oldSection=sectionSelect.value;
    const selectedSection=secList.includes(oldSection)?oldSection:'';
    sectionSelect.innerHTML=opt('', 'Не выбрано', !selectedSection)+secList.map(v=>opt(v,v,v===selectedSection)).join('');
    const lvlList=selectedSection ? modalLevelsForSection(selectedSection) : [];
    const rememberedLevel=rememberedLevelForSection(Object.assign({},S,{org}),selectedSection);
    const selectedLevel=lvlList.includes(S.level)?S.level:(rememberedLevel || '');
    levelSelect.innerHTML=opt('', 'Не выбрано', !selectedLevel)+lvlList.map(v=>opt(v,v,v===selectedLevel)).join('');
  };

  window.saveOrgSectionModal=function(){
    const old={project:S.project,path:S.path,org:S.org,section:S.section,level:S.level};
    persistProgressForState(S);
    persistSelectedLevelForState(S);
    const field=activeProfileField||'all';
    const project=document.getElementById('modalProjectSelect')?.value || '';
    const path=document.getElementById('modalPathSelect')?.value || '';
    const org=document.getElementById('modalOrgSelect')?.value || '';
    const section=document.getElementById('modalSectionSelect')?.value || '';
    const level=document.getElementById('modalOrgLevelSelect')?.value || '';

    if(field==='project' || field==='all') S.project=project;
    if(field==='path' || field==='all'){
      if(path!==S.path){ S.org=''; S.section=''; S.level=''; S.configured=false; }
      S.path=path;
    }
    if(field==='org' || field==='all'){
      if(org!==S.org){ S.section=''; S.level=''; S.configured=false; }
      S.org=org;
    }
    if(field==='section' || field==='all'){
      if(section!==S.section){ S.level=''; S.configured=false; }
      S.section=section;
    }
    if(field==='level' || field==='all') S.level=level;

    if(!S.path){ S.org=''; S.section=''; S.level=''; }
    if(!S.org){ S.section=''; S.level=''; }
    if(!S.section){ S.level=''; }
    if(S.section && !S.level) restoreSelectedLevelForState(S);
    else S.configured=!!(S.org && S.section && S.level);

    const changed=old.project!==S.project || old.path!==S.path || old.org!==S.org || old.section!==S.section || old.level!==S.level;
    if(changed){ restoreProgressForState(S); displayedProgress=0; }
    persistSelectedLevelForState(S);
    save();
    closeOrgSectionModal();
    render();
    showToast('Выбор обновлён', changed?'Профиль обновлён':'Без изменений');
  };

  function fieldFromRow(row){
    const id=row?.querySelector('b')?.id;
    if(id==='infoProject') return 'project';
    if(id==='infoPath') return 'path';
    if(id==='infoOrg') return 'org';
    if(id==='infoSection') return 'section';
    if(id==='infoLevel') return 'level';
    return 'all';
  }
  document.addEventListener('click',function(e){
    const row=e.target.closest('#dashboardProfileInfo .profile-info > .row');
    if(!row) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    openOrgSectionModal(fieldFromRow(row));
  },true);

  const pathSelect=document.getElementById('modalPathSelect');
  if(pathSelect) pathSelect.onchange=refreshOrgChoicesForModalPath;
  const orgSelect=document.getElementById('modalOrgSelect');
  if(orgSelect) orgSelect.onchange=refreshSectionChoicesForModalOrg;
  const sectionSelect=document.getElementById('modalSectionSelect');
  if(sectionSelect) sectionSelect.onchange=function(){
    const lvlList=this.value ? modalLevelsForSection(this.value) : [];
    const levelSelect=document.getElementById('modalOrgLevelSelect');
    if(levelSelect) levelSelect.innerHTML=opt('', 'Не выбрано', true)+lvlList.map(v=>opt(v,v,false)).join('');
  };

  window.updateProfileTopVisibility=function(){
    const box=document.getElementById('dashboardProfileInfo');
    if(!box) return;
    const rows=[...box.querySelectorAll('.profile-info > .row')];
    rows.forEach(row=>{
      const b=row.querySelector('b');
      const id=b ? b.id : '';
      const value=(b ? b.textContent : '').trim();
      b?.classList.toggle('is-tight', value.length>18);
      let hide=false;
      if(id==='infoProject') hide=!S.project || value==='—';
      if(id==='infoPath') hide=!S.path || value==='—';
      if(id==='infoOrg') hide=!S.org || value==='Нужно выбрать' || value==='—';
      if(id==='infoSection') hide=!S.section || value==='—';
      if(id==='infoLevel') hide=!S.level || value==='—';
      row.classList.toggle('profile-top-hidden', hide);
      row.classList.remove('profile-top-last');
    });
    const visible=rows.filter(row=>!row.classList.contains('profile-top-hidden'));
    if(visible.length) visible[visible.length-1].classList.add('profile-top-last');
  };

  const prevRender=render;
  render=function(){
    prevRender();
    if(document.getElementById('infoProject')) document.getElementById('infoProject').textContent=S.project||'—';
    if(document.getElementById('infoPath')) document.getElementById('infoPath').textContent=S.path||'—';
    if(document.getElementById('infoOrg')) document.getElementById('infoOrg').textContent=S.org||'—';
    if(document.getElementById('infoSection')) document.getElementById('infoSection').textContent=S.section||'—';
    if(document.getElementById('infoLevel')){ document.getElementById('infoLevel').textContent=S.level||'—'; requestAnimationFrame(fitInfoLevelText); }
    updateProfileTopVisibility();
  };
})();

load();

render();
applyDashTab();
renderCloudSyncStatus();
/* При подключённом Google интерфейс остаётся скрытым до чтения Firebase.
 * Поэтому обновление старого телефона не успевает показать или отправить
 * локальный кэш поверх данных, сделанных на компьютере. */
CloudSync.init();
window.addEventListener('online',()=>CloudSync.resume());
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible') CloudSync.resume();
});
