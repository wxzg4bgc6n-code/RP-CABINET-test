/* v98: встраивает экзамен УАК/ПК в существующий шаблон тестов USAF. */
(function attachUsafLawExam(){
  const data = window.RP_USAF_LAW_EXAM;
  const registry = window.RPCabinetTemplates || [];
  const template = registry.find((item) => item && item.id === "usafTestsTemplateV20");
  if (!data || !template || typeof template.markup !== "string") return;

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const questionCards = data.questions.map((item, index) => {
    const correct = new Set(item.correct || []);
    const label = item.answerLabel
      ? `<span class="usaf-law-exam-count-v98">${escapeHtml(item.answerLabel)}</span>`
      : "";
    const options = item.options.map((option, optionIndex) =>
      `<li${correct.has(optionIndex) ? ' class="correct"' : ""}>${escapeHtml(option)}</li>`
    ).join("");
    return `<div class="qa-card usaf-law-exam-question-v98">
      <div class="usaf-law-exam-question-head-v98">
        <div class="question-text">${index + 1}. ${escapeHtml(item.question)}</div>${label}
      </div>
      <ul class="answer-options">${options}</ul>
    </div>`;
  }).join("");

  const exam = `<details class="section-toggle usaf-law-exam-v98" id="usaf-test-mp-uak-pk" data-test-owner="USAF">
    <summary>${escapeHtml(data.title)}</summary>
    <div class="usaf-law-exam-intro-v98">
      <strong>${escapeHtml(data.subtitle)}</strong>
      <span>${escapeHtml(data.sourceNote)}</span>
    </div>
    <div class="qa-list usaf-law-exam-list-v98">${questionCards}</div>
  </details>`;

  const disabledPattern = /<div id="usaf-test-mp-uak-pk" class="usaf-test-disabled" aria-disabled="true">[\s\S]*?<\/div>/;
  template.markup = template.markup
    .replace(disabledPattern, "")
    .replace('<div class="usaf-locked-tests">', `${exam}<div class="usaf-locked-tests">`);
})();
