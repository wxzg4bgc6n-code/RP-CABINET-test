/* Живые закрепления материалов. */
(function(){
  var PIN_KEY = "rpCabinetPinnedDepartmentBlocks_v1";
  var LEGACY_PIN_KEY = "rpCabinetPinnedAcademyBlocks_v1";
  var EMPTY_PIN_SENTINEL = "__kiri_no_pins__";
  var raf = 0;
  var sourceTimer = 0;
  var sourceObserver = null;
  var booted = false;
  var startupSettled = false;
  var settleTimer = 0;
  document.documentElement.classList.add("kiri-pins-hydrating");

  function byId(id){ return document.getElementById(id); }
  function txt(id){ var el = byId(id); return el ? (el.textContent || "").trim() : ""; }
  function low(s){ return (s || "").toLowerCase(); }
  function esc(id){ return (window.CSS && CSS.escape) ? CSS.escape(id) : String(id).replace(/"/g, '\\"'); }

  function normalizePins(list){
    return Array.from(new Set((list || []).filter(function(x){ return x && x !== EMPTY_PIN_SENTINEL; })));
  }
  function readLocalPins(){
    try{
      var rawText = localStorage.getItem(PIN_KEY);
      if(rawText === null) rawText = localStorage.getItem(LEGACY_PIN_KEY);
      if(rawText === null) return null;
      var raw = JSON.parse(rawText || "[]");
      if(!Array.isArray(raw)) return [];
      if(raw.indexOf(EMPTY_PIN_SENTINEL) >= 0) return [];
      return normalizePins(raw);
    }catch(e){ return null; }
  }
  var localPinsAtBoot = readLocalPins();
  var initialPins = [];
  try{
    if(typeof S !== "undefined" && S){
      var hasStatePins = Array.isArray(S.pinnedDepartmentBlocks) || Array.isArray(S.pinnedAcademyBlocks);
      var savedPins = Array.isArray(S.pinnedDepartmentBlocks) ? S.pinnedDepartmentBlocks : S.pinnedAcademyBlocks;
      initialPins = hasStatePins ? normalizePins(savedPins) : normalizePins(localPinsAtBoot || []);
      S.pinnedDepartmentBlocks = initialPins.slice();
      S.pinnedAcademyBlocks = initialPins.slice();
    }else{
      initialPins = normalizePins(localPinsAtBoot || []);
    }
  }catch(e){ initialPins = normalizePins(localPinsAtBoot || []); }
  window.__kiriInitialPinnedAcademyBlocks = initialPins.slice();
  function getPinned(){
    if(typeof S !== "undefined" && S && Array.isArray(S.pinnedDepartmentBlocks)){
      return normalizePins(S.pinnedDepartmentBlocks);
    }
    if(typeof S !== "undefined" && S && Array.isArray(S.pinnedAcademyBlocks)){
      return normalizePins(S.pinnedAcademyBlocks);
    }
    if(window.S && Array.isArray(window.S.pinnedDepartmentBlocks)){
      return normalizePins(window.S.pinnedDepartmentBlocks);
    }
    if(window.S && Array.isArray(window.S.pinnedAcademyBlocks)){
      return normalizePins(window.S.pinnedAcademyBlocks);
    }
    return normalizePins(window.__kiriInitialPinnedAcademyBlocks || []);
  }
  function setPinned(list){
    var clean = normalizePins(list);
    window.__kiriInitialPinnedAcademyBlocks = clean.slice();
    try{
      if(typeof S !== "undefined" && S){
        S.pinnedDepartmentBlocks = clean;
        S.pinnedAcademyBlocks = clean;
        if(S.ready && typeof save === "function" && !window.__cloudApplyingRemote && !window.__cloudAttaching){
          save();
        }
      }
    }catch(e){}
  }
  function togglePinned(id){
    var list = getPinned();
    if(list.indexOf(id) >= 0) list = list.filter(function(x){ return x !== id; });
    else list.push(id);
    setPinned(list);
    refreshNow();
  }
  function unpin(id){
    setPinned(getPinned().filter(function(x){ return x !== id; }));
    refreshNow();
  }

  function profileReady(){
    var org = low(txt("infoOrg"));
    var section = low(txt("infoSection"));
    var level = low(txt("infoLevel"));
    return (org && org !== "нужно выбрать" && org !== "—") ||
           (section && section !== "—" && section !== "не выбрано") ||
           (level && level !== "—" && level !== "не выбрано");
  }
  function rankNum(){
    var s = low(txt("infoLevel"));
    var m = s.match(/\[(\d+)\]/) || s.match(/(^|\D)(\d{1,2})(\D|$)/);
    if(m) return Number(m[1] || m[2]);
    if(s.indexOf("рекрут") >= 0) return 1;
    if(s.indexOf("рядовой") >= 0) return 2;
    if(s.indexOf("специалист") >= 0) return 3;
    return 0;
  }
  function isAcademy(){
    var section = low(txt("infoSection"));
    var org = low(txt("infoOrg"));
    var level = low(txt("infoLevel"));
    var path = low(txt("careerPathCards"));
    if(section && section !== "—" && section !== "не выбрано"){
      return section.indexOf("academy") >= 0 || section.indexOf("академ") >= 0;
    }
    return section.indexOf("academy") >= 0 || section.indexOf("академ") >= 0 ||
           org.indexOf("academy") >= 0 || org.indexOf("академ") >= 0 ||
           level.indexOf("рекрут") >= 0 || level.indexOf("рядовой") >= 0 || level.indexOf("специалист") >= 0 ||
           path.indexOf("academy") >= 0 || path.indexOf("академ") >= 0;
  }
  function isUsaf(){
    var section = low(txt("infoSection"));
    return section === "usaf" || section.indexOf("united states air force") >= 0 || section.indexOf("военно-воздуш") >= 0;
  }
  function normalizedLevel(){
    return low(txt("infoLevel")).replace(/\s+/g, "").replace(/[–—]/g, "-").replace(/→/g, "->");
  }
  function hasStage(from, to){
    var level = normalizedLevel();
    return level.indexOf(from + "->" + to) >= 0 || level.indexOf(from + "-" + to) >= 0 || level.indexOf(from + "/" + to) >= 0;
  }
  function isAcademyRankTwoToThree(){
    var level = low(txt("infoLevel"));
    var compact = level
      .replace(/\s+/g, "")
      .replace(/[–—]/g, "-")
      .replace(/→/g, "->");
    return isAcademy() && (
      compact.indexOf("2->3") >= 0 ||
      compact.indexOf("2-3") >= 0 ||
      compact.indexOf("2/3") >= 0
    );
  }

  function autoIds(){
    var level = low(txt("infoLevel"));
    var rank = rankNum();
    if(isUsaf()){
      if(hasStage(3,4)){
        return ["usaf-ten", "usaf-patrols", "usaf-test-aircraft"];
      }
      if(hasStage(4,5)){
        return ["usaf-protocols", "usaf-test-protocols", "usaf-quick"];
      }
      if(hasStage(5,6)){
        return ["usaf-posts", "usaf-patrols", "usaf-test-aircraft", "usaf-test-mp-uak-pk", "usaf-test-sd-driving"];
      }
      if(hasStage(6,7)){
        return ["usaf-ten", "usaf-protocols", "usaf-test-advanced-regulations", "usaf-test-aircraft"];
      }
      if(hasStage(7,8)){
        return ["usaf-ten", "usaf-patrols", "usaf-test-aircraft", "usaf-quick"];
      }
      return ["usaf-quick", "usaf-ten", "usaf-posts"];
    }
    if(isAcademy()){
      if(isAcademyRankTwoToThree()){
        return ["academy-terms", "academy-main", "academy-kpp", "academy-codes"];
      }
      if(level.indexOf("1 → 2") >= 0 || level.indexOf("1 -> 2") >= 0 || level.indexOf("1-2") >= 0 || rank <= 1){
        return ["academy-terms", "academy-main", "academy-codes"];
      }
      return ["academy-terms", "academy-main", "academy-kpp", "academy-codes"];
    }
    return ["academy-main", "academy-codes", "academy-rules"];
  }

  function withMandatoryMaterials(ids){
    var out = (ids || []).filter(Boolean);
    if(isAcademyRankTwoToThree() && out.indexOf("academy-rp-situation") < 0){
      out.push("academy-rp-situation");
    }
    return out;
  }

  function sourceNode(id){
    if(!id) return null;
    if(id === "academy-start"){
      return document.querySelector("#dashboardDepartmentTests #departmentTestsContent .test-highlight-block") ||
             document.querySelector("#departmentTestsContent .test-highlight-block") ||
             byId("academy-start");
    }
    return document.querySelector("#dashboardDepartment #departmentInfoContent #" + esc(id)) ||
           document.querySelector("#departmentInfoContent #" + esc(id)) ||
           document.querySelector("#dashboardDepartmentTests #departmentTestsContent #" + esc(id)) ||
           document.querySelector("#departmentTestsContent #" + esc(id)) ||
           byId(id);
  }
  function validPinned(){
    return getPinned().filter(function(id){ return !!sourceNode(id); });
  }
  function planIds(){
    var pins = validPinned();
    var ids = pins.length ? pins : autoIds().filter(function(id){ return !!sourceNode(id); });
    return withMandatoryMaterials(ids);
  }

  function ensureShell(){
    var existing = byId("profileRankMaterials");
    if(existing) return existing;
    var career = byId("dashboardPathProgress");
    if(!career || !career.parentNode) return null;
    var box = document.createElement("section");
    box.id = "profileRankMaterials";
    box.className = "profile-rank-materials";
    box.innerHTML = '<div class="dash-section-head"><div><h2><span class="profile-rank-materials-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 19h16"></path><path d="M7 16V8"></path><path d="M12 16V5"></path><path d="M17 16v-4"></path><path d="M9 5l3-3 3 3"></path></svg></span> Материалы для повышения</h2></div></div><div class="profile-rank-materials-list" id="profileRankMaterialsList"><div class="profile-materials-source-root" id="profileMaterialsSourceRoot"></div></div>';
    career.insertAdjacentElement("afterend", box);
    return box;
  }

  function removeOldButtons(root){
    if(!root) return;
    root.querySelectorAll(".kiri-pin-profile-btn,.kiri-profile-unpin-btn,.profile-pinned-head-actions,.profile-unpin-inline,.profile-unpin-old,.profile-material-unpin-bottom").forEach(function(n){ n.remove(); });
  }

  function createRpSituationBlock(){
    function rpLine(cmd, text){
      return '<div class="kiri-rp-line"><span class="kiri-rp-command">' + cmd + '</span><span class="kiri-rp-text">' + text + '</span></div>';
    }
    function variant(title, lines){
      return '<details class="section-toggle kiri-rp-variant-card">' +
        '<summary><span class="kiri-rp-variant-title">' + title + '</span></summary>' +
        '<div class="kiri-rp-script">' + lines.join('') + '</div>' +
      '</details>';
    }
    var section = document.createElement("section");
    section.id = "profile-academy-rp-situation";
    section.dataset.profileStaticRef = "academy-rp-situation";
    section.innerHTML = '' +
      '<details class="section-toggle academy-expand-card">' +
        '<summary class="academy-section-head-card">' +
          '<h2>РП-ситуация для повышения</h2>' +
          '<p class="section-desc">Для повышения на 2 → 3 нужно выполнить РП-ситуацию от 10 строк. Ниже 3 готовых варианта — каждый можно раскрыть отдельно.</p>' +
        '</summary>' +
        '<div class="academy-expand-content">' +
          '<div class="grid three academy-rp-situation-grid">' +
            variant('Вариант 1 — Проверка формы и снаряжения', [
              rpLine('/me','внимательно осмотрел форму и проверил нашивку ARMY'),
              rpLine('/do','Форма сидит аккуратно, нашивка закреплена на груди.'),
              rpLine('/me','проверил карманы и наличие служебного снаряжения'),
              rpLine('/do','В карманах лежат аптечки, рация и документы.'),
              rpLine('/me','снял карабин со спины и осмотрел его состояние'),
              rpLine('/do','Карабин исправен, магазин закреплён, предохранитель включён.'),
              rpLine('/me','проверил бронежилет на повреждения и плотность крепления'),
              rpLine('/do','Бронежилет закреплён, видимых повреждений нет.'),
              rpLine('/me','поправил ремень со снаряжением и подготовился к службе'),
              rpLine('/do','Военнослужащий готов к дальнейшему несению службы.')
            ]) +
            variant('Вариант 2 — Дежурство в столовой', [
              rpLine('/me','подошёл к стойке выдачи питания в столовой и осмотрел помещение'),
              rpLine('/do','Столовая чистая, столы расставлены ровно, посторонних предметов нет.'),
              rpLine('/me','проверил наличие чистых подносов, приборов и салфеток'),
              rpLine('/do','Подносы стоят стопкой, приборы разложены по секциям.'),
              rpLine('/me','открыл журнал учёта питания и сверил последние записи'),
              rpLine('/do','В журнале указано время последней проверки и подпись ответственного.'),
              rpLine('/me','проверил температуру готовой еды на линии раздачи'),
              rpLine('/try','убедиться, что питание пригодно к выдаче личному составу'),
              rpLine('/do','Питание выглядит свежим и готовым к раздаче военнослужащим.'),
              rpLine('/me','закрыл журнал, навёл порядок на стойке и доложил о готовности столовой')
            ]) +
            variant('Вариант 3 — Проверка аптечек на складе', [
              rpLine('/me','подошёл к шкафу со служебными аптечками в помещении АК'),
              rpLine('/do','На полке лежат несколько закрытых медицинских наборов.'),
              rpLine('/me','достал одну аптечку и разложил содержимое на чистой поверхности'),
              rpLine('/do','Внутри видны бинты, антисептик и перевязочные материалы.'),
              rpLine('/me','проверил срок годности медикаментов и целостность упаковок'),
              rpLine('/try','найти повреждённые или просроченные элементы в аптечке'),
              rpLine('/do','Повреждённых элементов не обнаружено, набор пригоден к использованию.'),
              rpLine('/me','аккуратно сложил все предметы обратно в аптечку'),
              rpLine('/do','Аптечка закрыта и возвращена на складскую полку.'),
              rpLine('/me','сделал пометку о проверке и подготовил снаряжение к службе')
            ]) +
          '</div>' +
        '</div>' +
      '</details>';
    return section;
  }

  function cloneReference(id){
    if(id === "academy-rp-situation") return createRpSituationBlock();
    var source = sourceNode(id);
    if(!source) return null;
    var section;
    if(source.tagName && source.tagName.toLowerCase() === "details"){
      section = document.createElement("section");
      section.dataset.profileAcademyRef = id;
      section.className = "profile-material-test-section";
      var d = source.cloneNode(true);
      d.open = false;
      d.classList.add("academy-expand-card");
      section.appendChild(d);
    }else{
      section = source.cloneNode(true);
      section.dataset.profileAcademyRef = id;
      var detail = section.querySelector(":scope > details.section-toggle.academy-expand-card") || section.querySelector("details.section-toggle.academy-expand-card");
      if(detail) detail.open = false;
    }
    section.querySelectorAll("script").forEach(function(n){ n.remove(); });
    removeOldButtons(section);
    return section;
  }

  function makeButton(id, mode){
    var btn = document.createElement("button");
    var isUnpin = mode === "unpin";
    var isPinnedNow = isUnpin || getPinned().indexOf(id) >= 0;
    btn.type = "button";
    btn.className = "kiri-pin-profile-btn" + (isUnpin ? " profile-unpin-inline" : "") + (isPinnedNow ? " is-pinned" : "");
    btn.dataset.pinId = id;
    btn.setAttribute("aria-label", isPinnedNow ? "Открепить из профиля" : "Закрепить в профиль");
    btn.title = isPinnedNow ? "Открепить из профиля" : "Закрепить в профиль";
    btn.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      if(isUnpin) unpin(id); else togglePinned(id);
    });
    return btn;
  }

  function labelPin(btn){
    var pinned = getPinned().indexOf(btn.dataset.pinId) >= 0;
    btn.classList.toggle("is-pinned", pinned);
    btn.setAttribute("aria-label", pinned ? "Открепить из профиля" : "Закрепить в профиль");
    btn.title = pinned ? "Открепить из профиля" : "Закрепить в профиль";
  }

  function directPinButtons(container){
    if(!container) return [];
    return Array.prototype.filter.call(
      container.querySelectorAll(".kiri-pin-profile-btn,.kiri-profile-unpin-btn,.profile-unpin-inline"),
      function(n){ return n.parentNode === container; }
    );
  }

  function addButtonToSummary(summary, id, mode){
    if(!summary || !id) return;
    var wantUnpin = mode === "unpin";
    var buttons = directPinButtons(summary);
    var keep = buttons.find(function(btn){
      return btn.dataset && btn.dataset.pinId === id &&
        (!!btn.classList.contains("profile-unpin-inline")) === wantUnpin;
    });
    buttons.forEach(function(btn){ if(btn !== keep) btn.remove(); });
    var created = false;
    if(!keep){
      keep = makeButton(id, mode || "pin");
      summary.appendChild(keep);
      created = true;
    }
    if(wantUnpin){
      if(!keep.classList.contains("profile-unpin-inline")) keep.classList.add("profile-unpin-inline");
      if(!keep.classList.contains("is-pinned")) keep.classList.add("is-pinned");
      if(keep.getAttribute("aria-label") !== "Открепить из профиля") keep.setAttribute("aria-label", "Открепить из профиля");
      if(keep.title !== "Открепить из профиля") keep.title = "Открепить из профиля";
    }else{
      if(keep.classList.contains("profile-unpin-inline")) keep.classList.remove("profile-unpin-inline");
      if(!created) labelPin(keep);
    }
  }

  function ensureTestHead(block){
    if(!block) return null;
    var row = block.querySelector(":scope > .kiri-test-head-row");
    if(row) return row;
    var h2 = block.querySelector(":scope > h2");
    if(!h2) return null;
    row = document.createElement("div");
    row.className = "kiri-test-head-row academy-tests-static-head academy-section-head-card";
    h2.parentNode.insertBefore(row, h2);
    row.appendChild(h2);
    return row;
  }

  function addButtonToHeadRow(row, id, mode){
    if(!row || !id) return;
    var wantUnpin = mode === "unpin";
    var buttons = directPinButtons(row);
    var keep = buttons.find(function(btn){
      return btn.dataset && btn.dataset.pinId === id &&
        (!!btn.classList.contains("profile-unpin-inline")) === wantUnpin;
    });
    buttons.forEach(function(btn){ if(btn !== keep) btn.remove(); });
    if(!keep){
      keep = makeButton(id, mode || "pin");
      row.appendChild(keep);
    }
    if(wantUnpin){
      keep.classList.add("profile-unpin-inline", "is-pinned");
      keep.setAttribute("aria-label", "Открепить из профиля");
      keep.title = "Открепить из профиля";
    }else{
      keep.classList.remove("profile-unpin-inline");
      labelPin(keep);
    }
  }

  function installSourcePins(){
    var infoRoot = document.querySelector("#dashboardDepartment #departmentInfoContent, #departmentInfoContent");
    if(infoRoot){
      infoRoot.querySelectorAll("section[id] > details.section-toggle > summary, section[id] > details.section-toggle.academy-expand-card > summary").forEach(function(summary){
        var section = summary.closest("section[id]");
        if(section) addButtonToSummary(summary, section.id, "pin");
      });
    }

    var testRoot = document.querySelector("#dashboardDepartmentTests #departmentTestsContent, #departmentTestsContent");
    if(testRoot){
      var block = testRoot.querySelector(".test-highlight-block");
      if(block){
        if(!block.id) block.id = "academy-start";
        block.querySelectorAll("details.section-toggle > summary .kiri-pin-profile-btn").forEach(function(n){ n.remove(); });
        var row = ensureTestHead(block);
        if(row){
          addButtonToHeadRow(row, block.id || "academy-start", "pin");
        }
      }
    }
  }

  function installProfileUnpins(){
    var root = byId("profileMaterialsSourceRoot");
    if(!root) return;
    root.querySelectorAll(":scope > [data-profile-academy-ref]").forEach(function(node){
      var id = node.dataset.profileAcademyRef || node.getAttribute("data-profile-academy-ref");
      if(!id || getPinned().indexOf(id) < 0) return;
      if(id === "academy-start" || node.matches(".test-highlight-block") || node.querySelector(":scope > .test-highlight-block, .test-highlight-block")){
        var block = node.matches(".test-highlight-block") ? node : (node.querySelector(":scope > .test-highlight-block") || node.querySelector(".test-highlight-block") || node);
        var row = ensureTestHead(block);
        if(row) addButtonToHeadRow(row, id, "unpin");
        return;
      }
      var summary = node.querySelector(":scope > details.section-toggle > summary, :scope > details.section-toggle.academy-expand-card > summary") ||
                    node.querySelector("details.section-toggle > summary, details.section-toggle.academy-expand-card > summary");
      if(summary) addButtonToSummary(summary, id, "unpin");
    });
  }

  function renderProfileMaterials(){
    var box = ensureShell();
    if(!box) return;
    var root = byId("profileMaterialsSourceRoot");
    if(!root) return;
    if(!profileReady()){
      root.innerHTML = "";
      box.classList.remove("show");
      box.dataset.key = "";
      return;
    }
    var ids = planIds();
    var key = ids.join("|") + "||" + txt("infoOrg") + "||" + txt("infoSection") + "||" + txt("infoLevel") + "||" + getPinned().join("|");
    if(box.dataset.key === key && root.children.length){
      box.classList.add("show");
      installProfileUnpins();
      return;
    }
    root.innerHTML = "";
    ids.forEach(function(id){
      var node = cloneReference(id);
      if(node) root.appendChild(node);
    });
    box.dataset.key = key;
    box.classList.toggle("show", root.children.length > 0);
    installProfileUnpins();
  }

  function closeTestsByDefault(){
    document.querySelectorAll("#dashboardDepartmentTests details.section-toggle[open]").forEach(function(d){ d.open = false; });
  }

  function refreshNow(){
    installSourcePins();
    renderProfileMaterials();
    document.querySelectorAll(".kiri-pin-profile-btn:not(.profile-unpin-inline)").forEach(labelPin);
  }
  function schedule(){
    if(raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function(){ raf = 0; refreshNow(); });
  }

  function isPinMutationNode(node){
    if(!node) return true;
    if(node.nodeType === 3) return !(node.nodeValue || "").trim();
    if(node.nodeType !== 1) return true;
    return node.matches(".kiri-pin-profile-btn,.kiri-profile-unpin-btn,.profile-unpin-inline") ||
      (!!node.closest && !!node.closest(".kiri-pin-profile-btn,.kiri-profile-unpin-btn,.profile-unpin-inline"));
  }
  function hasMeaningfulSourceMutation(records){
    return records.some(function(record){
      if(record.type === "characterData") return !isPinMutationNode(record.target && record.target.parentElement);
      var nodes = Array.from(record.addedNodes || []).concat(Array.from(record.removedNodes || []));
      return nodes.length && nodes.some(function(node){ return !isPinMutationNode(node); });
    });
  }
  function forceSourceRefresh(){
    var box = byId("profileRankMaterials");
    if(box) box.dataset.key = "";
    refreshNow();
  }
  function scheduleSourceRefresh(){
    clearTimeout(sourceTimer);
    sourceTimer = setTimeout(forceSourceRefresh, 90);
  }
  function watchSources(){
    if(sourceObserver) sourceObserver.disconnect();
    var roots = [byId("departmentInfoContent"), byId("departmentTestsContent")].filter(Boolean);
    if(!roots.length) return;
    sourceObserver = new MutationObserver(function(records){
      if(hasMeaningfulSourceMutation(records)) scheduleSourceRefresh();
    });
    roots.forEach(function(root){ sourceObserver.observe(root,{childList:true,subtree:true,characterData:true}); });
  }

  function wrapGlobalRender(){
    if(window.__kiriProfileRenderWrapped) return;
    if(typeof window.render === "function"){
      var original = window.render;
      window.render = function(){
        var res = original.apply(this, arguments);
        schedule();
        return res;
      };
      window.__kiriProfileRenderWrapped = true;
    }
    if(typeof window.renderDynamicDepartmentDashboard === "function"){
      var depOriginal = window.renderDynamicDepartmentDashboard;
      window.renderDynamicDepartmentDashboard = function(){
        var res = depOriginal.apply(this, arguments);
        schedule();
        return res;
      };
    }
  }

  function settleStartupPins(){
    if(startupSettled || settleTimer) return;
    settleTimer = setTimeout(function(){
      refreshNow();
      startupSettled = true;
      settleTimer = 0;
      document.documentElement.classList.remove("kiri-pins-hydrating");
    }, 420);
  }

  function boot(){
    if(booted) return;
    booted = true;
    wrapGlobalRender();
    watchSources();
    closeTestsByDefault();
    refreshNow();
    settleStartupPins();

    [80, 180, 360, 700, 1200].forEach(function(delay){ setTimeout(refreshNow, delay); });
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
  window.addEventListener("load", schedule, {once:true});
  window.addEventListener("storage", function(event){ if(!event || event.key === PIN_KEY || event.key === LEGACY_PIN_KEY) schedule(); });
  document.addEventListener("click", function(e){
    if(e.target && (e.target.matches(".dash-tab") || e.target.closest("#dashboardDepartment") || e.target.closest("#dashboardDepartmentTests") || e.target.closest("#profileRankMaterials"))) schedule();
  }, true);
  document.addEventListener("kiri:profile-pins-changed", schedule);
  document.addEventListener("kiri:source-blocks-updated", function(){ watchSources(); scheduleSourceRefresh(); });
  window.KiriPinnedMaterialsSync = function(){ schedule(); };
})();
