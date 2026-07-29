/* v99: встраивает экзамен УАК/ПК в общем визуальном формате тестов USAF. */
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
    if (item.type === "matching") {
      const rows = (item.rows || []).map((row) => `<li>
        <span class="usaf-law-match-prompt">${escapeHtml(row.prompt)}</span>
        <strong>${escapeHtml(row.answer)}</strong>
      </li>`).join("");
      return `<div class="qa-card">
        <div class="question-text">${index + 1}. ${escapeHtml(item.question)}</div>
        <ul class="usaf-law-match-list">${rows}</ul>
      </div>`;
    }
    const correct = new Set(item.correct || []);
    const label = item.answerLabel
      ? ` <span class="muted-title">${escapeHtml(item.answerLabel)}</span>`
      : "";
    const options = item.options.map((option, optionIndex) =>
      `<li${correct.has(optionIndex) ? ' class="correct"' : ""}>${escapeHtml(option)}</li>`
    ).join("");
    return `<div class="qa-card">
      <div class="question-text">${index + 1}. ${escapeHtml(item.question)}${label}</div>
      <ul class="answer-options">${options}</ul>
    </div>`;
  }).join("");

  const exam = `<details class="section-toggle" id="usaf-test-mp-uak-pk" data-test-owner="USAF">
    <summary>${escapeHtml(data.title)}</summary>
    <div class="qa-list">${questionCards}</div>
  </details>`;

  const disabledPattern = /<div id="usaf-test-mp-uak-pk" class="usaf-test-disabled" aria-disabled="true">[\s\S]*?<\/div>/;
  template.markup = template.markup
    .replace(disabledPattern, "")
    .replace('<div class="usaf-locked-tests">', `${exam}<div class="usaf-locked-tests">`);
})();
