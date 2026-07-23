/*
 * Правила подтверждений прогресса.
 *
 * По умолчанию выполненный пункт требует скриншот. Пункты сдачи тестов и
 * экзаменов сейчас помечены как не требующие изображения. Когда будет готов
 * окончательный список, достаточно дополнять exactNoProof и exactRequired.
 */
window.RP_PROOF_RULES=Object.freeze({
  defaultRequired:true,
  exactNoProof:[],
  exactRequired:[],
  noProofPatterns:[
    /^сдать\b/i,
    /\bэкзамен\b/i,
    /\bтест\b/i
  ],
  isRequired(task){
    const title=String(task||'').trim();
    if(this.exactRequired.includes(title)) return true;
    if(this.exactNoProof.includes(title)) return false;
    if(this.noProofPatterns.some(pattern=>pattern.test(title))) return false;
    return this.defaultRequired;
  }
});
