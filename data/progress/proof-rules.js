/*
 * Правила подтверждений прогресса.
 * Скриншот нужен только для участия в СО и ГМП. Остальные пункты
 * подтверждаются отметкой/тегом в Discord и не требуют загрузки изображения.
 */
window.RP_PROOF_RULES=Object.freeze({
  defaultRequired:false,
  exactNoProof:[],
  exactRequired:[],
  requiredPatterns:[
    /участие[^\n]*[cс][oо](?:\s|—|-|\d|$)/i,
    /участие[^\n]*специальн(?:ой|ых|ые)?\s+операци(?:и|ях|ю)/i,
    /участие[^\n]*гмп/i
  ],
  isRequired(task){
    const title=String(task||'').trim();
    if(this.exactRequired.includes(title)) return true;
    if(this.exactNoProof.includes(title)) return false;
    if(this.requiredPatterns.some(pattern=>pattern.test(title))) return true;
    return false;
  }
});
