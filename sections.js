/* Извлечено из v66. Порядок подключения сохранять. */
/* v49: MP requests keep compact inline content inside restored information frames. */

body.usaf-info-clean #departmentInfoContent>section.usaf-info-section,
#profileRankMaterials section.usaf-info-section{
  margin:0 0 12px!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
body.usaf-info-clean #departmentInfoContent>section.usaf-info-section>details.section-toggle.academy-expand-card,
#profileRankMaterials section.usaf-info-section>details.section-toggle.academy-expand-card{
  margin:0!important;
  padding:0!important;
  border:1px solid rgba(255,255,255,.13)!important;
  border-radius:22px!important;
  background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 7%,transparent),rgba(255,255,255,.022) 58%,rgba(255,255,255,.012)),rgba(12,16,27,.42)!important;
  box-shadow:0 12px 30px rgba(0,0,0,.16)!important;
  overflow:hidden!important;
}
body.usaf-info-clean #departmentInfoContent>section.usaf-info-section>details>summary.academy-section-head-card,
#profileRankMaterials section.usaf-info-section>details>summary.academy-section-head-card{
  position:relative!important;
  display:block!important;
  min-height:0!important;
  margin:0!important;
  padding:18px 72px 18px 18px!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
  list-style:none!important;
  transform:none!important;
  writing-mode:horizontal-tb!important;
}
body.usaf-info-clean #departmentInfoContent>section.usaf-info-section>details>summary::-webkit-details-marker,
#profileRankMaterials section.usaf-info-section>details>summary::-webkit-details-marker{display:none!important;}
body.usaf-info-clean #departmentInfoContent>section.usaf-info-section>details>summary::before,
#profileRankMaterials section.usaf-info-section>details>summary::before{display:none!important;content:none!important;}
body.usaf-info-clean #departmentInfoContent>section.usaf-info-section>details>summary::after,
#profileRankMaterials section.usaf-info-section>details>summary::after{
  content:"4"!important;
  position:absolute!important;
  right:22px!important;
  top:50%!important;
  width:auto!important;
  height:auto!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  color:color-mix(in srgb,var(--accent) 78%,var(--text) 22%)!important;
  font-size:22px!important;
  font-weight:950!important;
  line-height:1!important;
  transform:translateY(-50%)!important;
  writing-mode:horizontal-tb!important;
}
body.usaf-info-clean #departmentInfoContent>section.usaf-info-section>details[open]>summary::after,
#profileRankMaterials section.usaf-info-section>details[open]>summary::after{transform:translateY(-50%) rotate(180deg)!important;}
body.usaf-info-clean #departmentInfoContent>section.usaf-info-section>details>summary h2,
#profileRankMaterials section.usaf-info-section>details>summary h2{
  margin:0 0 8px!important;
  color:var(--text)!important;
  font-family:inherit!important;
  font-size:22px!important;
  font-weight:700!important;
  line-height:normal!important;
  letter-spacing:normal!important;
}
body.usaf-info-clean #departmentInfoContent>section.usaf-info-section>details>summary .section-desc,
#profileRankMaterials section.usaf-info-section>details>summary .section-desc{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:var(--muted)!important;
  font-family:inherit!important;
  font-size:16px!important;
  font-weight:830!important;
  line-height:1.45!important;
}
body.usaf-info-clean #departmentInfoContent>section.usaf-info-section .usaf-expand-content,
#profileRankMaterials section.usaf-info-section .usaf-expand-content{
  margin:0!important;
  padding:18px!important;
  border-top:1px solid rgba(255,255,255,.075)!important;
  background:transparent!important;
  box-shadow:none!important;
}

/* Layout wrappers never draw a panel. */
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(
  .report-board,.ten-dashboard,.ten-hero-row,.ten-directory,.ten-chain,.ten-flow,.ten-tech-strip,
  .protocols-board-v221,.reports-protocol-board-v222,.patrols-report-board-v190
),
#profileRankMaterials .usaf-info-section :is(
  .report-board,.ten-dashboard,.ten-hero-row,.ten-directory,.ten-chain,.ten-flow,.ten-tech-strip,
  .protocols-board-v221,.reports-protocol-board-v222,.patrols-report-board-v190
){
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  gap:14px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
}

/* Exactly the Academy group-card surface. */
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(
  .report-group,.report-memo-group,.usaf-post-subblock-v148,.protocols-group-v221,
  .usaf-route-gallery
),
#profileRankMaterials .usaf-info-section :is(
  .report-group,.report-memo-group,.usaf-post-subblock-v148,.protocols-group-v221,
  .usaf-route-gallery
),
body.usaf-info-clean #departmentInfoContent .usaf-academy-card,
#profileRankMaterials .usaf-academy-card{
  position:relative!important;
  min-width:0!important;
  margin:0!important;
  padding:15px!important;
  border:1px solid color-mix(in srgb,var(--accent) 20%,rgba(255,255,255,.10))!important;
  border-radius:18px!important;
  background:linear-gradient(135deg,rgba(255,255,255,.040),rgba(255,255,255,.018))!important;
  box-shadow:none!important;
  overflow:hidden!important;
}
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(
  .report-group,.report-memo-group,.usaf-post-subblock-v148,.protocols-group-v221,
  .usaf-route-gallery
)::before,
#profileRankMaterials .usaf-info-section :is(
  .report-group,.report-memo-group,.usaf-post-subblock-v148,.protocols-group-v221,
  .usaf-route-gallery
)::before,
body.usaf-info-clean #departmentInfoContent .usaf-academy-card::before,
#profileRankMaterials .usaf-academy-card::before{
  content:""!important;
  display:block!important;
  position:absolute!important;
  left:0!important;
  top:0!important;
  bottom:0!important;
  width:3px!important;
  border-radius:18px 0 0 18px!important;
  background:linear-gradient(180deg,var(--accent),color-mix(in srgb,var(--accent2) 75%,var(--accent)))!important;
  opacity:.85!important;
  pointer-events:none!important;
}

body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(
  .report-group-head,.report-card-top-memo,.usaf-post-head-v148,.protocol-title-v223,
  .usaf-route-gallery-title
),
#profileRankMaterials .usaf-info-section :is(
  .report-group-head,.report-card-top-memo,.usaf-post-head-v148,.protocol-title-v223,
  .usaf-route-gallery-title
){
  margin:0!important;
  padding:0!important;
  border:0!important;
  border-bottom:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
body.usaf-info-clean #departmentInfoContent .usaf-info-section .report-kicker,
#profileRankMaterials .usaf-info-section .report-kicker,
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(
  .report-card-badges,.kiri-global-pill,.report-pill,.author-marker-pill,.usaf-post-pill-v148,.tag,.toggle-muted
),
#profileRankMaterials .usaf-info-section :is(
  .report-card-badges,.kiri-global-pill,.report-pill,.author-marker-pill,.usaf-post-pill-v148,.tag,.toggle-muted
){display:none!important;}

/* Exactly the Academy compact information row. */
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(
  .report-card,.report-memo-card,.usaf-post-card-v148,.protocol-card-v221,.card
),
#profileRankMaterials .usaf-info-section :is(
  .report-card,.report-memo-card,.usaf-post-card-v148,.protocol-card-v221,.card
),
body.usaf-info-clean #departmentInfoContent .usaf-academy-row,
#profileRankMaterials .usaf-academy-row{
  position:relative!important;
  min-width:0!important;
  margin:8px 0 0!important;
  padding:10px 11px!important;
  border:1px solid rgba(255,255,255,.075)!important;
  border-left:3px solid color-mix(in srgb,var(--accent) 72%,white 6%)!important;
  border-radius:13px!important;
  background:rgba(0,0,0,.14)!important;
  box-shadow:none!important;
  overflow:hidden!important;
}
body.usaf-info-clean #departmentInfoContent .usaf-academy-row,
#profileRankMaterials .usaf-academy-row{
  display:grid!important;
  grid-template-columns:110px minmax(0,1fr)!important;
  align-items:center!important;
  gap:10px!important;
}
body.usaf-info-clean #departmentInfoContent .usaf-academy-row>b,
#profileRankMaterials .usaf-academy-row>b,
body.usaf-info-clean #departmentInfoContent .usaf-info-section .report-card-top>strong,
#profileRankMaterials .usaf-info-section .report-card-top>strong{
  color:color-mix(in srgb,var(--accent) 78%,white 16%)!important;
  font-size:13px!important;
  font-weight:950!important;
  line-height:1.25!important;
}
body.usaf-info-clean #departmentInfoContent .usaf-academy-row>span,
#profileRankMaterials .usaf-academy-row>span{
  color:color-mix(in srgb,var(--text) 90%,var(--muted) 10%)!important;
  font-size:13px!important;
  font-weight:820!important;
  line-height:1.36!important;
}

/* Academy-sized grids. */
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(
  .report-grid,.report-memo-grid,.protocols-grid-v221,.reports-protocol-grid-v222,
  .usaf-posts-grid-v148
),
#profileRankMaterials .usaf-info-section :is(
  .report-grid,.report-memo-grid,.protocols-grid-v221,.reports-protocol-grid-v222,
  .usaf-posts-grid-v148
),
body.usaf-info-clean #departmentInfoContent .usaf-academy-grid,
#profileRankMaterials .usaf-academy-grid{
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:14px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
body.usaf-info-clean #departmentInfoContent .usaf-info-section .report-grid-three,
#profileRankMaterials .usaf-info-section .report-grid-three{grid-template-columns:repeat(3,minmax(0,1fr))!important;}
body.usaf-info-clean #departmentInfoContent .usaf-info-section .report-grid-one,
#profileRankMaterials .usaf-info-section .report-grid-one{grid-template-columns:minmax(0,1fr)!important;}

/* Typography copied from Academy cards. */
body.usaf-info-clean #departmentInfoContent .usaf-info-section h3,
#profileRankMaterials .usaf-info-section h3,
body.usaf-info-clean #departmentInfoContent .usaf-academy-card>h3,
#profileRankMaterials .usaf-academy-card>h3{
  margin:0 0 10px!important;
  padding:0 0 10px!important;
  border-bottom:1px solid color-mix(in srgb,var(--accent) 18%,rgba(255,255,255,.08))!important;
  color:var(--text)!important;
  font-family:inherit!important;
  font-size:17px!important;
  font-weight:950!important;
  line-height:1.18!important;
  letter-spacing:-.025em!important;
}
body.usaf-info-clean #departmentInfoContent .usaf-info-section h4,
#profileRankMaterials .usaf-info-section h4{
  margin:0 0 5px!important;
  color:color-mix(in srgb,var(--accent) 78%,white 16%)!important;
  font-family:inherit!important;
  font-size:13px!important;
  font-weight:950!important;
  line-height:1.25!important;
}
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(p,li,.meaning,.text),
#profileRankMaterials .usaf-info-section :is(p,li,.meaning,.text){
  color:color-mix(in srgb,var(--text) 90%,var(--muted) 10%)!important;
  font-family:inherit!important;
  font-size:13px!important;
  font-weight:820!important;
  line-height:1.36!important;
  overflow-wrap:anywhere!important;
}
body.usaf-info-clean #departmentInfoContent .usaf-info-section .report-card-top,
#profileRankMaterials .usaf-info-section .report-card-top{
  margin:0 0 5px!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}

/* Example text is part of the information row, not a third framed card. */
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151),
#profileRankMaterials .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151){
  display:block!important;
  width:100%!important;
  box-sizing:border-box!important;
  margin:8px 0 0!important;
  padding:8px 0 0!important;
  border:0!important;
  border-top:1px solid rgba(255,255,255,.07)!important;
  border-radius:0!important;
  background:transparent!important;
  color:var(--text)!important;
  font-family:inherit!important;
  font-size:12.5px!important;
  font-weight:820!important;
  line-height:1.36!important;
  white-space:pre-wrap!important;
  overflow-wrap:anywhere!important;
  cursor:text!important;
  user-select:text!important;
}
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151):hover,
#profileRankMaterials .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151):hover,
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151).kiri-selected,
#profileRankMaterials .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151).kiri-selected{
  color:color-mix(in srgb,var(--accent) 72%,var(--text) 28%)!important;
  background:color-mix(in srgb,var(--accent) 5%,transparent)!important;
  outline:0!important;
  box-shadow:none!important;
}

/* Flat source subsections use a divider only. */
body.usaf-info-clean #departmentInfoContent .usaf-info-section .usaf-flat-subsection,
#profileRankMaterials .usaf-info-section .usaf-flat-subsection{
  margin:0!important;
  padding:16px 0 0!important;
  border:0!important;
  border-top:1px solid rgba(255,255,255,.075)!important;
  background:transparent!important;
  box-shadow:none!important;
  transform:none!important;
  writing-mode:horizontal-tb!important;
}
body.usaf-info-clean #departmentInfoContent .usaf-info-section .usaf-flat-subsection-head,
#profileRankMaterials .usaf-info-section .usaf-flat-subsection-head{
  margin:0 0 14px!important;
  padding:0!important;
  border:0!important;
}

/* One Academy card around maps; map entries and image wrapper stay frameless. */
body.usaf-info-clean #departmentInfoContent .usaf-route-map-card,
#profileRankMaterials .usaf-route-map-card{
  margin:0!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
body.usaf-info-clean #departmentInfoContent .usaf-route-map-card+.usaf-route-map-card,
#profileRankMaterials .usaf-route-map-card+.usaf-route-map-card{
  margin-top:14px!important;
  padding-top:14px!important;
  border-top:1px solid rgba(255,255,255,.075)!important;
}
body.usaf-info-clean #departmentInfoContent .report-map-wrap-v190,
#profileRankMaterials .report-map-wrap-v190{
  margin:0!important;
  padding:6px!important;
  border:0!important;
  border-radius:13px!important;
  background:#080b12!important;
  box-shadow:none!important;
  overflow:auto!important;
}
body.usaf-info-clean #departmentInfoContent .report-map-img,
#profileRankMaterials .report-map-img{
  display:block!important;
  width:100%!important;
  height:auto!important;
  max-height:780px!important;
  object-fit:contain!important;
  border-radius:10px!important;
}

/* Open frame: theme line only, no glow. */
html body.academy-info-clean #dashboardDepartment #departmentInfoContent>
  :is(#academy-terms,#academy-main,#academy-kpp,#academy-codes,#academy-patrol,#academy-formation,#academy-rules)
  >details.section-toggle.academy-expand-card[open],
html body.usaf-info-clean #dashboardDepartment #departmentInfoContent>section.usaf-info-section
  >details.section-toggle.academy-expand-card[open],
html body.academy-info-clean #profileRankMaterials [data-profile-academy-ref^="academy-"]
  details.section-toggle.academy-expand-card[open]:not(.academy-test-exam-card),
html body.academy-info-clean #profileRankMaterials [data-profile-academy-ref^="usaf-"]
  details.section-toggle.academy-expand-card[open]{
  border:1px solid color-mix(in srgb,var(--accent) 48%,rgba(255,255,255,.18))!important;
  outline:0!important;
  box-shadow:none!important;
}

/* Neutral tests retain Academy question cards and no open glow. */
body.usaf-info-clean #departmentTestsContent .test-highlight-block.usaf-tests-v20,
#profileRankMaterials .test-highlight-block.usaf-tests-v20,
body.academy-info-clean #departmentTestsContent .test-highlight-block.academy-tests-card,
#profileRankMaterials .test-highlight-block.academy-tests-card{
  border-color:color-mix(in srgb,var(--accent) 25%,rgba(255,255,255,.11))!important;
  background:rgba(7,10,17,.46)!important;
  background-image:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.008))!important;
  box-shadow:none!important;
}
body.usaf-info-clean #departmentTestsContent .usaf-tests-v20>details.section-toggle,
#profileRankMaterials .usaf-tests-v20>details.section-toggle{
  border:1px solid color-mix(in srgb,var(--accent) 25%,rgba(255,255,255,.10))!important;
  background:rgba(255,255,255,.015)!important;
  background-image:none!important;
}
body.usaf-info-clean #departmentTestsContent .usaf-tests-v20>details.section-toggle[open],
#profileRankMaterials .usaf-tests-v20>details.section-toggle[open],
html body.academy-info-clean #departmentTestsContent .test-highlight-block.academy-tests-card.kiri-has-open-test,
html body.usaf-info-clean #departmentTestsContent .test-highlight-block.usaf-tests-v20.kiri-has-open-test,
#profileRankMaterials .test-highlight-block.kiri-has-open-test{
  border-color:color-mix(in srgb,var(--accent) 48%,rgba(255,255,255,.18))!important;
  outline:0!important;
  box-shadow:none!important;
}
body:is(.academy-info-clean,.usaf-info-clean) #departmentTestsContent :is(.academy-test-question-card,.academy-test-question-card.card,.qa-card),
#profileRankMaterials :is(.academy-test-question-card,.academy-test-question-card.card,.qa-card){
  position:relative!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.10))!important;
  border-radius:17px!important;
  background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.021))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;
}
body:is(.academy-info-clean,.usaf-info-clean) #departmentTestsContent :is(.academy-test-answer-options,.answer-options) li,
#profileRankMaterials :is(.academy-test-answer-options,.answer-options) li{
  background:rgba(0,0,0,.15)!important;
  background-image:none!important;
}
body:is(.academy-info-clean,.usaf-info-clean) #departmentTestsContent :is(.academy-test-answer-options,.answer-options) li.correct,
#profileRankMaterials :is(.academy-test-answer-options,.answer-options) li.correct{
  border-color:color-mix(in srgb,var(--accent) 46%,rgba(255,255,255,.10))!important;
  border-left-color:color-mix(in srgb,var(--accent) 86%,rgba(255,255,255,.10))!important;
  background:color-mix(in srgb,var(--accent) 10%,rgba(0,0,0,.15))!important;
}

@media(max-width:760px){
  body.usaf-info-clean #departmentInfoContent>section.usaf-info-section>details>summary.academy-section-head-card,
  #profileRankMaterials section.usaf-info-section>details>summary.academy-section-head-card{padding:16px 50px 16px 16px!important;}
  body.usaf-info-clean #departmentInfoContent>section.usaf-info-section .usaf-expand-content,
  #profileRankMaterials section.usaf-info-section .usaf-expand-content{padding:14px!important;}
  body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(
    .report-grid,.report-memo-grid,.protocols-grid-v221,.reports-protocol-grid-v222,
    .usaf-posts-grid-v148
  ),
  #profileRankMaterials .usaf-info-section :is(
    .report-grid,.report-memo-grid,.protocols-grid-v221,.reports-protocol-grid-v222,
    .usaf-posts-grid-v148
  ),
  body.usaf-info-clean #departmentInfoContent .usaf-academy-grid,
  #profileRankMaterials .usaf-academy-grid{grid-template-columns:minmax(0,1fr)!important;gap:12px!important;}
  body.usaf-info-clean #departmentInfoContent .usaf-academy-row,
  #profileRankMaterials .usaf-academy-row{grid-template-columns:92px minmax(0,1fr)!important;gap:8px!important;}
  body.usaf-info-clean #departmentInfoContent .report-map-img,
  #profileRankMaterials .report-map-img{min-width:680px!important;max-height:none!important;}
}


/* v29: clean USAF-only inner layout. */
body.usaf-info-clean #departmentInfoContent .usaf-info-section .report-group-head>p,
#profileRankMaterials .usaf-info-section .report-group-head>p,
body.usaf-info-clean #departmentInfoContent .usaf-info-section .usaf-route-gallery-title>p,
#profileRankMaterials .usaf-info-section .usaf-route-gallery-title>p,
body.usaf-info-clean #departmentInfoContent .usaf-info-section .usaf-route-map-head>p,
#profileRankMaterials .usaf-info-section .usaf-route-map-head>p{display:none!important;}

body.usaf-info-clean #departmentInfoContent #usaf-posts .usaf-academy-card-wide,
#profileRankMaterials #usaf-posts .usaf-academy-card-wide{grid-column:1/-1!important;}
body.usaf-info-clean #departmentInfoContent #usaf-posts .usaf-post-clean-row>span,
#profileRankMaterials #usaf-posts .usaf-post-clean-row>span{min-width:0!important;}
body.usaf-info-clean #departmentInfoContent #usaf-posts .usaf-post-clean-row .report-command,
#profileRankMaterials #usaf-posts .usaf-post-clean-row .report-command{margin-top:7px!important;padding-top:7px!important;}

body.usaf-info-clean #departmentInfoContent #usaf-protocols .usaf-flat-subsection,
#profileRankMaterials #usaf-protocols .usaf-flat-subsection{
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
body.usaf-info-clean #departmentInfoContent #usaf-protocols .usaf-flat-subsection+.usaf-flat-subsection,
#profileRankMaterials #usaf-protocols .usaf-flat-subsection+.usaf-flat-subsection{margin-top:14px!important;}
body.usaf-info-clean #departmentInfoContent #usaf-protocols .usaf-flat-subsection-head,
#profileRankMaterials #usaf-protocols .usaf-flat-subsection-head{margin:0 0 8px!important;padding:0!important;border:0!important;}
body.usaf-info-clean #departmentInfoContent #usaf-protocols .usaf-flat-subsection-head>h3,
#profileRankMaterials #usaf-protocols .usaf-flat-subsection-head>h3{margin:0!important;padding:0!important;border:0!important;}

body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(
  .report-group,.report-memo-group,.protocols-group-v221,
  .usaf-route-gallery,.usaf-academy-card,.report-card,.report-memo-card,.protocol-card-v221,
  .usaf-academy-row,.card
),
#profileRankMaterials .usaf-info-section :is(
  .report-group,.report-memo-group,.protocols-group-v221,
  .usaf-route-gallery,.usaf-academy-card,.report-card,.report-memo-card,.protocol-card-v221,
  .usaf-academy-row,.card
){box-shadow:none!important;filter:none!important;}



/* v30: only the USAF "Быстрые доклады" topic is changed below. */
body.usaf-info-clean #departmentInfoContent #usaf-quick>details.section-toggle.academy-expand-card[open],
#profileRankMaterials #usaf-quick>details.section-toggle.academy-expand-card[open]{
  background:rgba(12,16,27,.42)!important;
  background-image:linear-gradient(180deg,rgba(255,255,255,.018),rgba(255,255,255,.006))!important;
  box-shadow:none!important;
}
body.usaf-info-clean #departmentInfoContent #usaf-quick>details[open]>summary.academy-section-head-card,
#profileRankMaterials #usaf-quick>details[open]>summary.academy-section-head-card{
  padding-bottom:22px!important;
  background:transparent!important;
  background-image:none!important;
  box-shadow:none!important;
}
body.usaf-info-clean #departmentInfoContent #usaf-quick>details[open]>.usaf-expand-content,
#profileRankMaterials #usaf-quick>details[open]>.usaf-expand-content{
  padding:22px 18px 18px!important;
  background:transparent!important;
  background-image:none!important;
  box-shadow:none!important;
}

body.usaf-info-clean #departmentInfoContent #usaf-quick .report-card,
#profileRankMaterials #usaf-quick .report-card{
  display:grid!important;
  grid-template-columns:max-content minmax(0,1fr)!important;
  align-items:center!important;
  column-gap:10px!important;
  row-gap:8px!important;
}
body.usaf-info-clean #departmentInfoContent #usaf-quick .report-card>.report-card-top,
#profileRankMaterials #usaf-quick .report-card>.report-card-top{
  grid-column:1!important;
  grid-row:1!important;
  align-self:center!important;
  margin:0!important;
  padding:0!important;
}
body.usaf-info-clean #departmentInfoContent #usaf-quick .report-card>.report-card-top>strong,
#profileRankMaterials #usaf-quick .report-card>.report-card-top>strong{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  min-width:58px!important;
  min-height:29px!important;
  margin:0!important;
  padding:5px 9px!important;
  border:1px solid color-mix(in srgb,var(--accent) 38%,rgba(255,255,255,.10))!important;
  border-radius:9px!important;
  background:color-mix(in srgb,var(--accent) 11%,rgba(0,0,0,.16))!important;
  color:color-mix(in srgb,var(--accent) 82%,white 14%)!important;
  font-size:13.5px!important;
  font-weight:950!important;
  line-height:1!important;
  letter-spacing:.01em!important;
  box-shadow:none!important;
}
body.usaf-info-clean #departmentInfoContent #usaf-quick .report-card>h4,
#profileRankMaterials #usaf-quick .report-card>h4{
  grid-column:2!important;
  grid-row:1!important;
  align-self:center!important;
  min-width:0!important;
  margin:0!important;
  padding:0!important;
  color:var(--text)!important;
  font-size:14.5px!important;
  font-weight:950!important;
  line-height:1.25!important;
}
body.usaf-info-clean #departmentInfoContent #usaf-quick .report-card>p,
#profileRankMaterials #usaf-quick .report-card>p{
  grid-column:1/-1!important;
  margin:0!important;
  padding:0!important;
  color:color-mix(in srgb,var(--text) 90%,var(--muted) 10%)!important;
  font-size:13px!important;
  font-weight:820!important;
  line-height:1.4!important;
}
body.usaf-info-clean #departmentInfoContent #usaf-quick .report-card>p>b,
#profileRankMaterials #usaf-quick .report-card>p>b{
  margin-right:4px!important;
  color:color-mix(in srgb,var(--accent) 78%,white 14%)!important;
  font-weight:950!important;
}

@media(max-width:620px){
  body.usaf-info-clean #departmentInfoContent #usaf-quick .report-card,
  #profileRankMaterials #usaf-quick .report-card{column-gap:8px!important;row-gap:7px!important;}
  body.usaf-info-clean #departmentInfoContent #usaf-quick .report-card>.report-card-top>strong,
  #profileRankMaterials #usaf-quick .report-card>.report-card-top>strong{min-width:52px!important;padding:5px 7px!important;font-size:12.5px!important;}
  body.usaf-info-clean #departmentInfoContent #usaf-quick .report-card>h4,
  #profileRankMaterials #usaf-quick .report-card>h4{font-size:13.5px!important;}
}

/* v34: use the exact neutral surface hierarchy from the test question cards. */
body.academy-info-clean #departmentInfoContent .academy-expand-content :is(
  .card,details.code-group,.academy-term-group,.academy-first-persons
),
#profileRankMaterials [data-profile-academy-ref^="academy-"] .academy-expand-content :is(
  .card,details.code-group,.academy-term-group,.academy-first-persons
),
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(
  .report-group,.report-memo-group,.usaf-post-subblock-v148,.protocols-group-v221,
  .usaf-route-gallery,.usaf-academy-card
),
#profileRankMaterials .usaf-info-section :is(
  .report-group,.report-memo-group,.usaf-post-subblock-v148,.protocols-group-v221,
  .usaf-route-gallery,.usaf-academy-card
){
  background:rgba(7,10,17,.46)!important;
  background-image:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.008))!important;
  border-color:color-mix(in srgb,var(--accent) 25%,rgba(255,255,255,.11))!important;
  box-shadow:none!important;
  filter:none!important;
}

body.academy-info-clean #departmentInfoContent .academy-expand-content :is(.qa,.qa-card,.academy-term-row),
#profileRankMaterials [data-profile-academy-ref^="academy-"] .academy-expand-content :is(.qa,.qa-card,.academy-term-row),
body.academy-info-clean #departmentInfoContent .academy-expand-content table tbody td,
#profileRankMaterials [data-profile-academy-ref^="academy-"] .academy-expand-content table tbody td,
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(
  .report-card,.report-memo-card,.usaf-post-card-v148,.protocol-card-v221,.usaf-academy-row
),
#profileRankMaterials .usaf-info-section :is(
  .report-card,.report-memo-card,.usaf-post-card-v148,.protocol-card-v221,.usaf-academy-row
){
  background:rgba(255,255,255,.021)!important;
  background-image:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.021))!important;
  border-color:color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.10))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;
  filter:none!important;
}

/* v35: every internal vertical bar uses the full theme accent, like the first group bar. */
body.academy-info-clean #departmentInfoContent .academy-expand-content :is(.qa,.qa-card,.academy-term-row),
#profileRankMaterials [data-profile-academy-ref^="academy-"] .academy-expand-content :is(.qa,.qa-card,.academy-term-row),
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(
  .report-card,.report-memo-card,.usaf-post-card-v148,.protocol-card-v221,.usaf-academy-row
),
#profileRankMaterials .usaf-info-section :is(
  .report-card,.report-memo-card,.usaf-post-card-v148,.protocol-card-v221,.usaf-academy-row
){
  border-left-color:var(--accent)!important;
}
body.academy-info-clean #departmentInfoContent .academy-expand-content table tbody tr>td:first-child,
#profileRankMaterials [data-profile-academy-ref^="academy-"] .academy-expand-content table tbody tr>td:first-child{
  border-left-color:var(--accent)!important;
}

/* Examples use the same dark answer surface as test options. */
body.academy-info-clean #departmentInfoContent .academy-expand-content .phrase,
#profileRankMaterials [data-profile-academy-ref^="academy-"] .academy-expand-content .phrase,
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151),
#profileRankMaterials .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151){
  display:block!important;
  width:100%!important;
  box-sizing:border-box!important;
  margin:8px 0 0!important;
  padding:10px 11px!important;
  border:1px solid rgba(255,255,255,.075)!important;
  border-left:3px solid var(--accent)!important;
  border-radius:13px!important;
  background:rgba(0,0,0,.15)!important;
  background-image:none!important;
  color:var(--text)!important;
  box-shadow:none!important;
  cursor:pointer!important;
  user-select:text!important;
  -webkit-user-select:text!important;
}
body.academy-info-clean #departmentInfoContent .academy-expand-content .phrase:hover,
#profileRankMaterials [data-profile-academy-ref^="academy-"] .academy-expand-content .phrase:hover,
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151):hover,
#profileRankMaterials .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151):hover{
  border-color:color-mix(in srgb,var(--accent) 30%,rgba(255,255,255,.10))!important;
  border-left-color:var(--accent)!important;
  background:color-mix(in srgb,var(--accent) 5%,rgba(0,0,0,.15))!important;
}
body.academy-info-clean #departmentInfoContent .academy-expand-content .phrase.kiri-selected,
#profileRankMaterials [data-profile-academy-ref^="academy-"] .academy-expand-content .phrase.kiri-selected,
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151).kiri-selected,
#profileRankMaterials .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151).kiri-selected{
  border-color:color-mix(in srgb,var(--accent) 46%,rgba(255,255,255,.10))!important;
  border-left-color:var(--accent)!important;
  background:color-mix(in srgb,var(--accent) 10%,rgba(0,0,0,.15))!important;
  outline:0!important;
  box-shadow:none!important;
}

/* Quick-report examples keep only their grid placement; their old visual layer was removed. */
body.usaf-info-clean #departmentInfoContent #usaf-quick .report-card>.report-command,
#profileRankMaterials #usaf-quick .report-card>.report-command{
  grid-column:1/-1!important;
  min-width:0!important;
  margin:0!important;
}

/* No dots and no hover bubble; clicking still selects the whole example. */
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151)::before,
#profileRankMaterials .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151)::before,
body.academy-info-clean #departmentInfoContent .academy-expand-content .phrase::before,
#profileRankMaterials [data-profile-academy-ref^="academy-"] .academy-expand-content .phrase::before,
body.usaf-info-clean #departmentInfoContent .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151)::after,
#profileRankMaterials .usaf-info-section :is(.report-command,.usaf-post-copy-command-v151)::after,
body.academy-info-clean #departmentInfoContent .academy-expand-content .phrase::after,
#profileRankMaterials [data-profile-academy-ref^="academy-"] .academy-expand-content .phrase::after{
  display:none!important;
  content:none!important;
}

/* Screenshot timing remains plain reference text. */
body.usaf-info-clean #departmentInfoContent #usaf-quick .report-timing-text,
#profileRankMaterials #usaf-quick .report-timing-text{
  display:block!important;
  margin:3px 0 0!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  color:color-mix(in srgb,var(--text) 90%,var(--muted) 10%)!important;
  font-size:13px!important;
  font-weight:820!important;
  line-height:1.4!important;
  cursor:default!important;
  user-select:text!important;
  box-shadow:none!important;
}

/* v36: opened Academy/USAF blocks keep a neutral surface and never glow. */
html body:is(.academy-info-clean,.usaf-info-clean) #dashboardDepartment
  :is(#departmentInfoContent,#departmentTestsContent) details[open],
html body:is(.academy-info-clean,.usaf-info-clean) #profileRankMaterials details[open]{
  box-shadow:none!important;
  filter:none!important;
}
html body:is(.academy-info-clean,.usaf-info-clean) #dashboardDepartment
  :is(#departmentInfoContent,#departmentTestsContent) details[open]>summary,
html body:is(.academy-info-clean,.usaf-info-clean) #profileRankMaterials details[open]>summary{
  box-shadow:none!important;
  filter:none!important;
  text-shadow:none!important;
}
html body.academy-info-clean #departmentInfoContent>section>details.section-toggle.academy-expand-card[open],
html body.usaf-info-clean #departmentInfoContent>section.usaf-info-section>details.section-toggle.academy-expand-card[open],
html body:is(.academy-info-clean,.usaf-info-clean) #profileRankMaterials details.section-toggle.academy-expand-card[open]:not(.academy-test-exam-card){
  background:rgba(12,16,27,.42)!important;
  background-image:linear-gradient(180deg,rgba(255,255,255,.018),rgba(255,255,255,.006))!important;
  box-shadow:none!important;
  filter:none!important;
}
html body.academy-info-clean #departmentInfoContent>section>details[open]>summary.academy-section-head-card,
html body.usaf-info-clean #departmentInfoContent>section.usaf-info-section>details[open]>summary.academy-section-head-card,
html body:is(.academy-info-clean,.usaf-info-clean) #profileRankMaterials details[open]>summary.academy-section-head-card{
  background:transparent!important;
  background-image:none!important;
  box-shadow:none!important;
}

/* v45: service-first USAF/SAS workbook with separate collapsible references. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten{
  --ten-group-surface:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.008)),rgba(7,10,17,.46);
  --ten-info-surface:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.021));
  --ten-example-surface:rgba(0,0,0,.15);
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .usaf-expand-content{
  padding:20px!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(
  .ten-dashboard,.ten-work-grid,.ten-work-list,.report-grid,.ten-tech-grid,.ten-flow-grid,.ten-mini-grid,
  .ten-directory,.ten-code-list,.ten-note-grid,.ten-reference-stack,.ten-reference-content
){box-sizing:border-box!important;}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-dashboard{
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  gap:18px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
/* One shared semantic-group surface. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .report-group.ten-group{
  position:relative!important;
  min-width:0!important;
  margin:0!important;
  padding:18px!important;
  border:1px solid color-mix(in srgb,var(--accent) 25%,rgba(255,255,255,.11))!important;
  border-radius:18px!important;
  background:var(--ten-group-surface)!important;
  box-shadow:none!important;
  filter:none!important;
  overflow:hidden!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .report-group.ten-group::before{
  content:""!important;
  display:block!important;
  position:absolute!important;
  left:0!important;
  top:0!important;
  bottom:0!important;
  width:3px!important;
  border-radius:18px 0 0 18px!important;
  background:var(--accent)!important;
  opacity:1!important;
  pointer-events:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .report-group.ten-group::after{display:none!important;content:none!important;}

/* Group headings use only real headings and descriptions; legacy kicker labels are removed from HTML. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .report-group-head{
  display:block!important;
  margin:0 0 14px!important;
  padding:0 0 12px!important;
  border:0!important;
  border-bottom:1px solid color-mix(in srgb,var(--accent) 18%,rgba(255,255,255,.08))!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .report-group-head>h3{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:var(--text)!important;
  font-size:17px!important;
  font-weight:950!important;
  line-height:1.22!important;
  letter-spacing:-.02em!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .report-group-head>p{
  display:block!important;
  margin:7px 0 0!important;
  padding:0!important;
  border:0!important;
  color:var(--muted)!important;
  font-size:13px!important;
  font-weight:760!important;
  line-height:1.42!important;
}

/* Plain readable code chains. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-chain,.ten-flow){
  display:flex!important;
  flex-wrap:wrap!important;
  align-items:center!important;
  gap:8px!important;
  margin:14px 0 0!important;
  padding:14px 0 0!important;
  border:0!important;
  border-top:1px solid rgba(255,255,255,.075)!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-step{
  display:inline-flex!important;
  align-items:center!important;
  gap:5px!important;
  min-width:0!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  border-left:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-step>b{
  color:color-mix(in srgb,var(--accent) 84%,white 13%)!important;
  font-size:12.5px!important;
  font-weight:950!important;
  line-height:1.2!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-step>em{
  color:color-mix(in srgb,var(--muted) 80%,var(--text) 20%)!important;
  font-size:12.5px!important;
  font-style:normal!important;
  font-weight:720!important;
  line-height:1.25!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-chain,.ten-flow)>i{
  margin:0!important;
  color:color-mix(in srgb,var(--accent) 68%,var(--muted) 32%)!important;
  font-size:14px!important;
  font-style:normal!important;
  font-weight:950!important;
  line-height:1!important;
}

/* Working codes are split by service situation without adding more outer cards. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-work-grid{
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  align-items:start!important;
  gap:18px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-work-column{
  min-width:0!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-work-column-head{
  margin:0 0 10px!important;
  padding:0 0 9px!important;
  border:0!important;
  border-bottom:1px solid color-mix(in srgb,var(--accent) 16%,rgba(255,255,255,.075))!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-work-column-head>h4{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:var(--text)!important;
  font-size:15px!important;
  font-weight:950!important;
  line-height:1.25!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-work-column-head>p{
  margin:5px 0 0!important;
  padding:0!important;
  border:0!important;
  color:var(--muted)!important;
  font-size:12.5px!important;
  font-weight:720!important;
  line-height:1.38!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-work-list{
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  gap:2px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}

/* Detailed information cards: code and meaning on top, practical note below. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.report-grid,.ten-flow-grid){
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  align-items:start!important;
  column-gap:28px!important;
  row-gap:8px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-code-card,.ten-flow-card){
  position:relative!important;
  min-width:0!important;
  margin:0!important;
  padding:8px 4px!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
  filter:none!important;
  overflow:visible!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-card{
  display:grid!important;
  grid-template-columns:max-content minmax(0,1fr)!important;
  column-gap:10px!important;
  row-gap:2px!important;
  align-items:baseline!important;
  padding:10px 12px!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.10))!important;
  border-left:3px solid var(--accent)!important;
  border-radius:13px!important;
  background:var(--ten-info-surface)!important;
  box-shadow:none!important;
  overflow:hidden!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-flow-card{
  display:block!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-code-card,.ten-flow-card)::before,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-code-card,.ten-flow-card)::after{
  display:none!important;
  content:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-card>.report-card-top{
  position:static!important;
  grid-column:1!important;
  grid-row:1!important;
  align-self:baseline!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-card>.report-card-top>strong{
  display:block!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  color:color-mix(in srgb,var(--accent) 84%,white 13%)!important;
  font-size:13px!important;
  font-weight:950!important;
  line-height:1.25!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-card>h4{
  grid-column:2!important;
  grid-row:1!important;
  margin:0!important;
  color:var(--text)!important;
  font-size:13.5px!important;
  font-weight:950!important;
  line-height:1.28!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-card>p{
  grid-column:1 / -1!important;
  grid-row:2!important;
  box-sizing:border-box!important;
  margin:2px 0 0!important;
  padding:0!important;
  border:0!important;
  color:color-mix(in srgb,var(--muted) 86%,var(--text) 14%)!important;
  font-size:12.25px!important;
  font-weight:650!important;
  line-height:1.36!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-flow-card>h4{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:var(--text)!important;
  font-size:14.5px!important;
  font-weight:950!important;
  line-height:1.25!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-flow-card>.ten-flow{
  margin:7px 0 0!important;
  padding:0!important;
  border:0!important;
  border-top:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-flow-card>.ten-flow>i{
  flex:0 0 4px!important;
  width:4px!important;
  height:4px!important;
  border-radius:50%!important;
  background:color-mix(in srgb,var(--accent) 76%,transparent)!important;
  font-size:0!important;
}

/* Aircraft abbreviations and patrol chains are subsections of the one working-code group. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-patrol-tech-inline,.ten-patrol-flow-inline){
  margin:15px 0 0!important;
  padding:15px 0 0!important;
  border:0!important;
  border-top:1px solid rgba(255,255,255,.075)!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-inline-section-head{
  margin:0 0 10px!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-patrol-tech-inline.ten-tech-strip{
  display:block!important;
  gap:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-tech-grid{
  display:grid!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  column-gap:22px!important;
  row-gap:0!important;
  margin:0!important;
  padding:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-tech-grid>span{
  display:grid!important;
  grid-template-columns:auto minmax(0,1fr)!important;
  column-gap:7px!important;
  align-items:center!important;
  min-width:0!important;
  margin:0!important;
  padding:8px 2px!important;
  border:0!important;
  border-bottom:1px solid rgba(255,255,255,.075)!important;
  border-radius:0!important;
  background:transparent!important;
  color:var(--text)!important;
  font-size:12.5px!important;
  font-weight:780!important;
  line-height:1.3!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-tech-grid>span>b{
  color:color-mix(in srgb,var(--accent) 84%,white 13%)!important;
  font-weight:950!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-tech-grid>span>b::after{
  content:" —"!important;
  color:color-mix(in srgb,var(--accent) 46%,var(--muted) 54%)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-tech-grid>span:last-child{
  grid-column:1 / -1!important;
  color:color-mix(in srgb,var(--muted) 82%,var(--text) 18%)!important;
}

/* USAF and MP call grids. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-mini-grid{
  display:grid!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:10px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-mini-card{
  position:relative!important;
  display:grid!important;
  grid-template-columns:78px minmax(0,1fr)!important;
  column-gap:10px!important;
  row-gap:2px!important;
  align-items:center!important;
  min-width:0!important;
  margin:0!important;
  padding:12px!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.10))!important;
  border-left:3px solid var(--accent)!important;
  border-radius:14px!important;
  background:var(--ten-info-surface)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-mini-card::before,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-mini-card::after{
  display:none!important;
  content:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-mini-card>strong{
  grid-column:1!important;
  grid-row:1!important;
  color:color-mix(in srgb,var(--accent) 84%,white 13%)!important;
  font-size:13.5px!important;
  font-weight:950!important;
  line-height:1.2!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-mini-card>span{
  grid-column:1!important;
  grid-row:2!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  color:var(--muted)!important;
  font-size:11.5px!important;
  font-weight:850!important;
  line-height:1.2!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-mini-card>span::before{
  display:none!important;
  content:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-mini-card>p{
  grid-column:2!important;
  grid-row:1 / 3!important;
  margin:0!important;
  color:color-mix(in srgb,var(--text) 84%,var(--muted) 16%)!important;
  font-size:12.5px!important;
  font-weight:760!important;
  line-height:1.38!important;
}

/* Pilot calls are a compact table-like list: code, destination and purpose stay on one line. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-pilot-group .ten-mini-grid,.ten-mp-grid){
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  column-gap:22px!important;
  row-gap:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-pilot-group .ten-mini-card,.ten-mp-grid .ten-mini-card){
  display:grid!important;
  grid-template-columns:max-content max-content minmax(0,1fr)!important;
  column-gap:7px!important;
  row-gap:0!important;
  align-items:center!important;
  padding:10px 2px!important;
  border:0!important;
  border-bottom:1px solid rgba(255,255,255,.075)!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-pilot-group .ten-mini-card,.ten-mp-grid .ten-mini-card)>strong{
  grid-column:1!important;
  grid-row:1!important;
  font-size:12.75px!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-pilot-group .ten-mini-card,.ten-mp-grid .ten-mini-card)>span{
  grid-column:2!important;
  grid-row:1!important;
  color:var(--text)!important;
  font-size:12.25px!important;
  font-weight:820!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-pilot-group .ten-mini-card,.ten-mp-grid .ten-mini-card)>span::before{
  display:inline!important;
  content:"•"!important;
  margin-right:8px!important;
  color:color-mix(in srgb,var(--accent) 72%,var(--muted) 28%)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-pilot-group .ten-mini-card,.ten-mp-grid .ten-mini-card)>p{
  grid-column:3!important;
  grid-row:1!important;
  color:color-mix(in srgb,var(--muted) 84%,var(--text) 16%)!important;
  font-size:12.25px!important;
  font-weight:650!important;
  line-height:1.34!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-pilot-group .ten-mini-card,.ten-mp-grid .ten-mini-card)>p::before{
  content:"—"!important;
  margin-right:7px!important;
  color:color-mix(in srgb,var(--accent) 42%,var(--muted) 58%)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-mp-grid{
  gap:10px!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-mp-grid .ten-mini-card{
  padding:10px 12px!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.10))!important;
  border-left:3px solid var(--accent)!important;
  border-radius:13px!important;
  background:var(--ten-info-surface)!important;
  box-shadow:none!important;
}

/* Secondary references are collapsed by default and never mix NG, MP and urgent codes. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-stack{
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  gap:12px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-toggle{
  margin:0!important;
  padding:0!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.10))!important;
  border-radius:17px!important;
  background:var(--ten-group-surface)!important;
  background-image:none!important;
  box-shadow:none!important;
  filter:none!important;
  overflow:hidden!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-toggle>summary{
  position:relative!important;
  display:block!important;
  min-height:0!important;
  margin:0!important;
  padding:15px 54px 15px 17px!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
  list-style:none!important;
  cursor:pointer!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-toggle>summary::-webkit-details-marker{
  display:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-toggle>summary::before{
  display:none!important;
  content:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-toggle>summary::after{
  content:"⌄"!important;
  position:absolute!important;
  right:18px!important;
  top:50%!important;
  margin:0!important;
  color:color-mix(in srgb,var(--accent) 82%,var(--text) 18%)!important;
  font-size:18px!important;
  font-weight:950!important;
  line-height:1!important;
  transform:translateY(-50%)!important;
  transition:transform .16s ease!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-toggle[open]>summary::after{
  transform:translateY(-50%) rotate(180deg)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-toggle>summary h3{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:var(--text)!important;
  font-size:16px!important;
  font-weight:950!important;
  line-height:1.25!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-toggle>summary p{
  margin:5px 0 0!important;
  padding:0!important;
  border:0!important;
  color:var(--muted)!important;
  font-size:12.5px!important;
  font-weight:720!important;
  line-height:1.38!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-toggle[open]{
  border-color:color-mix(in srgb,var(--accent) 42%,rgba(255,255,255,.14))!important;
  background:var(--ten-group-surface)!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-toggle[open]>summary{
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-content{
  margin:0!important;
  padding:17px!important;
  border:0!important;
  border-top:1px solid rgba(255,255,255,.075)!important;
  background:transparent!important;
  box-shadow:none!important;
}

/* Full NG directory: one full-width group at a time, compact two-column rows inside. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .usaf-flat-subsection{
  margin:0!important;
  padding:18px 0 0!important;
  border:0!important;
  border-top:1px solid rgba(255,255,255,.075)!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .usaf-flat-subsection-head{
  margin:0 0 14px!important;
  padding:0!important;
  border:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .usaf-flat-subsection-head>h3{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:var(--text)!important;
  font-size:20px!important;
  font-weight:950!important;
  line-height:1.25!important;
  letter-spacing:-.025em!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-directory{
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  gap:14px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-content .ten-directory-group{
  position:relative!important;
  min-width:0!important;
  margin:0!important;
  padding:0 0 16px!important;
  border:0!important;
  border-bottom:1px solid rgba(255,255,255,.075)!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
  overflow:visible!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-content .ten-directory-group:last-child{
  padding-bottom:0!important;
  border-bottom:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-content .ten-directory-group::before,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-reference-content .ten-directory-group::after{
  display:none!important;
  content:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-directory>.ten-directory-head{
  margin:0!important;
  padding:0 0 12px!important;
  border-bottom:1px solid rgba(255,255,255,.075)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-directory-group>h4{
  margin:0 0 12px!important;
  padding:0 0 10px!important;
  border:0!important;
  border-bottom:1px solid color-mix(in srgb,var(--accent) 18%,rgba(255,255,255,.08))!important;
  color:var(--text)!important;
  font-size:16px!important;
  font-weight:950!important;
  line-height:1.25!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-list{
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:9px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-list>span{
  display:grid!important;
  grid-template-columns:112px minmax(0,1fr)!important;
  column-gap:12px!important;
  align-items:center!important;
  min-width:0!important;
  margin:0!important;
  padding:10px 11px!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.10))!important;
  border-left:3px solid var(--accent)!important;
  border-radius:13px!important;
  background:var(--ten-info-surface)!important;
  color:color-mix(in srgb,var(--text) 88%,var(--muted) 12%)!important;
  font-size:12.75px!important;
  font-weight:760!important;
  line-height:1.35!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-list>span::before,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-list>span::after{
  display:none!important;
  content:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-list>span>b{
  color:color-mix(in srgb,var(--accent) 84%,white 13%)!important;
  font-weight:950!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-note-grid{
  display:grid!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:10px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-note-grid>p{
  min-width:0!important;
  margin:0!important;
  padding:11px!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.10))!important;
  border-left:3px solid var(--accent)!important;
  border-radius:13px!important;
  background:var(--ten-info-surface)!important;
  color:color-mix(in srgb,var(--text) 86%,var(--muted) 14%)!important;
  font-size:12.5px!important;
  font-weight:760!important;
  line-height:1.4!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-note-grid>p>b{
  color:color-mix(in srgb,var(--accent) 84%,white 13%)!important;
  font-weight:950!important;
}

@media(max-width:980px){
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-tech-grid{
    grid-template-columns:repeat(2,minmax(0,1fr))!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-tech-grid>span:last-child{
    grid-column:1 / -1!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-mini-grid{
    grid-template-columns:repeat(2,minmax(0,1fr))!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-note-grid{
    grid-template-columns:minmax(0,1fr)!important;
  }
}
@media(max-width:760px){
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .usaf-expand-content{
    padding:15px!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-work-grid,.report-grid,.ten-flow-grid){
    grid-template-columns:minmax(0,1fr)!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-list{
    grid-template-columns:minmax(0,1fr)!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .report-group.ten-group{
    padding:15px!important;
  }
}
@media(max-width:560px){
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-tech-grid,.ten-mini-grid){
    grid-template-columns:minmax(0,1fr)!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-tech-grid>span:last-child{
    grid-column:1!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-card{
    grid-template-columns:max-content minmax(0,1fr)!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-mini-card{
    grid-template-columns:72px minmax(0,1fr)!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten .ten-code-list>span{
    grid-template-columns:82px minmax(0,1fr)!important;
  }
}

@media(max-width:700px){
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-pilot-group .ten-mini-grid,.ten-mp-grid){
    grid-template-columns:minmax(0,1fr)!important;
  }
}
@media(max-width:430px){
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-pilot-group .ten-mini-card,.ten-mp-grid .ten-mini-card){
    grid-template-columns:max-content minmax(0,1fr)!important;
    column-gap:7px!important;
    row-gap:3px!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-pilot-group .ten-mini-card,.ten-mp-grid .ten-mini-card)>strong{
    grid-column:1!important;
    grid-row:1!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-pilot-group .ten-mini-card,.ten-mp-grid .ten-mini-card)>span{
    grid-column:2!important;
    grid-row:1!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-ten :is(.ten-pilot-group .ten-mini-card,.ten-mp-grid .ten-mini-card)>p{
    grid-column:1 / -1!important;
    grid-row:2!important;
    padding-left:0!important;
  }
}



/* v50: USAF posts use the same three-level surface system as ten-codes and quick reports. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts{
  --post-group-surface:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.008)),rgba(7,10,17,.46);
  --post-info-surface:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.021));
  --post-example-surface:rgba(0,0,0,.15);
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts>details.section-toggle.academy-expand-card[open]{
  background:rgba(12,16,27,.42)!important;
  background-image:none!important;
  box-shadow:none!important;
  filter:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts>details[open]>summary.academy-section-head-card{
  background:transparent!important;
  background-image:none!important;
  box-shadow:none!important;
  filter:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-expand-content{
  padding:20px!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-posts-board-v50{
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  gap:15px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .report-group.usaf-post-group-v50{
  position:relative!important;
  min-width:0!important;
  margin:0!important;
  padding:17px!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.10))!important;
  border-radius:18px!important;
  background:var(--post-group-surface)!important;
  background-image:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.008))!important;
  box-shadow:none!important;
  filter:none!important;
  overflow:hidden!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .report-group.usaf-post-group-v50::before{
  content:""!important;
  display:block!important;
  position:absolute!important;
  left:0!important;
  top:0!important;
  bottom:0!important;
  width:3px!important;
  border-radius:18px 0 0 18px!important;
  background:var(--accent)!important;
  opacity:1!important;
  pointer-events:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-group-head-v50{
  margin:0 0 13px!important;
  padding:0 0 12px!important;
  border:0!important;
  border-bottom:1px solid color-mix(in srgb,var(--accent) 18%,rgba(255,255,255,.08))!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-group-head-v50>h3{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:var(--text)!important;
  font-size:17px!important;
  font-weight:950!important;
  line-height:1.2!important;
  letter-spacing:-.02em!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-meta-v50{
  display:flex!important;
  flex-wrap:wrap!important;
  gap:6px 0!important;
  margin:8px 0 0!important;
  padding:0!important;
  color:color-mix(in srgb,var(--muted) 86%,var(--text) 14%)!important;
  font-size:12.5px!important;
  font-weight:740!important;
  line-height:1.35!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-meta-v50>span{
  display:inline-flex!important;
  align-items:center!important;
  min-width:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-meta-v50>span+span::before{
  content:"•"!important;
  margin:0 9px!important;
  color:color-mix(in srgb,var(--accent) 72%,var(--muted) 28%)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-meta-v50 b{
  margin-right:5px!important;
  color:color-mix(in srgb,var(--accent) 82%,white 14%)!important;
  font-weight:950!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-duty-v50{
  margin:0 0 14px!important;
  padding:0 0 13px!important;
  border:0!important;
  border-bottom:1px solid rgba(255,255,255,.075)!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-duty-v50>h4,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-subhead-v50>h4,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-footer-note-v50>h4{
  margin:0 0 5px!important;
  padding:0!important;
  border:0!important;
  color:var(--text)!important;
  font-size:14px!important;
  font-weight:950!important;
  line-height:1.25!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-duty-v50>p,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-footer-note-v50>p{
  margin:0!important;
  padding:0!important;
  color:color-mix(in srgb,var(--muted) 82%,var(--text) 18%)!important;
  font-size:12.75px!important;
  font-weight:720!important;
  line-height:1.42!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-subhead-v50{
  margin:0 0 10px!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-subhead-secondary-v50{
  margin-top:14px!important;
  padding-top:13px!important;
  border-top:1px solid rgba(255,255,255,.075)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts :is(.usaf-post-report-grid-v50,.usaf-post-note-grid-v50,.usaf-post-brief-grid-v50,.usaf-post-check-grid-v50){
  display:grid!important;
  min-width:0!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts :is(.usaf-post-report-grid-v50,.usaf-post-note-grid-v50,.usaf-post-brief-grid-v50){
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:11px!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-grid-v50{
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:11px!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts :is(.report-card.usaf-post-card-v50,.usaf-post-check-card-v50){
  position:relative!important;
  display:block!important;
  min-width:0!important;
  margin:0!important;
  padding:12px 13px!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.10))!important;
  border-left:3px solid var(--accent)!important;
  border-radius:14px!important;
  background:var(--post-info-surface)!important;
  background-image:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.021))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;
  filter:none!important;
  overflow:hidden!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts :is(.report-card.usaf-post-card-v50,.usaf-post-check-card-v50)::before,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts :is(.report-card.usaf-post-card-v50,.usaf-post-check-card-v50)::after{
  display:none!important;
  content:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-card-head-v50{
  display:grid!important;
  grid-template-columns:max-content minmax(0,1fr)!important;
  column-gap:8px!important;
  align-items:baseline!important;
  min-width:0!important;
  margin:0 0 6px!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-card-head-text-v50{
  grid-template-columns:minmax(0,1fr)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-card-head-v50>strong{
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  color:color-mix(in srgb,var(--accent) 84%,white 13%)!important;
  font-size:13.5px!important;
  font-weight:950!important;
  line-height:1.25!important;
  white-space:nowrap!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-card-head-v50>h4,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50>h4{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:var(--text)!important;
  font-size:13.5px!important;
  font-weight:950!important;
  line-height:1.28!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-card-v50>p{
  margin:0!important;
  padding:0!important;
  color:color-mix(in srgb,var(--text) 84%,var(--muted) 16%)!important;
  font-size:12.75px!important;
  font-weight:760!important;
  line-height:1.4!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .report-command{
  display:block!important;
  width:100%!important;
  box-sizing:border-box!important;
  margin:9px 0 0!important;
  padding:8px 10px!important;
  border:1px solid rgba(255,255,255,.075)!important;
  border-left:3px solid var(--accent)!important;
  border-radius:11px!important;
  background:var(--post-example-surface)!important;
  background-image:none!important;
  color:var(--text)!important;
  font-family:inherit!important;
  font-size:12.5px!important;
  font-weight:820!important;
  line-height:1.36!important;
  white-space:pre-wrap!important;
  overflow-wrap:anywhere!important;
  cursor:text!important;
  user-select:text!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .report-command::before,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .report-command::after{
  display:none!important;
  content:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .report-command:hover,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .report-command.kiri-selected{
  border-color:color-mix(in srgb,var(--accent) 42%,rgba(255,255,255,.10))!important;
  border-left-color:var(--accent)!important;
  background:color-mix(in srgb,var(--accent) 9%,var(--post-example-surface))!important;
  color:var(--text)!important;
  outline:0!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-footer-note-v50{
  display:grid!important;
  grid-template-columns:150px minmax(0,1fr)!important;
  column-gap:12px!important;
  align-items:start!important;
  margin:14px 0 0!important;
  padding:13px 0 0!important;
  border:0!important;
  border-top:1px solid rgba(255,255,255,.075)!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-footer-note-v50>h4{
  margin:0!important;
  color:color-mix(in srgb,var(--accent) 82%,white 14%)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50>h4{
  margin:0 0 10px!important;
  padding:0 0 9px!important;
  border-bottom:1px solid rgba(255,255,255,.075)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 :is(ol,dl){
  margin:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 ol{
  padding-left:19px!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 li{
  margin:0 0 7px!important;
  color:color-mix(in srgb,var(--text) 84%,var(--muted) 16%)!important;
  font-size:12.5px!important;
  font-weight:720!important;
  line-height:1.4!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 li:last-child{
  margin-bottom:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 li::marker{
  color:var(--accent)!important;
  font-weight:950!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 li>b{
  color:var(--text)!important;
  font-weight:950!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 dl{
  padding:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 dl>div{
  display:grid!important;
  grid-template-columns:92px minmax(0,1fr)!important;
  column-gap:10px!important;
  margin:0!important;
  padding:8px 0!important;
  border-bottom:1px solid rgba(255,255,255,.075)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 dl>div:first-child{
  padding-top:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 dl>div:last-child{
  padding-bottom:0!important;
  border-bottom:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 :is(dt,dd){
  margin:0!important;
  padding:0!important;
  font-size:12.5px!important;
  line-height:1.38!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 dt{
  color:color-mix(in srgb,var(--accent) 84%,white 13%)!important;
  font-weight:950!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 dd{
  color:color-mix(in srgb,var(--text) 82%,var(--muted) 18%)!important;
  font-weight:720!important;
}
@media(max-width:980px){
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-grid-v50{
    grid-template-columns:minmax(0,1fr)!important;
  }
}
@media(max-width:760px){
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-expand-content{
    padding:15px!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .report-group.usaf-post-group-v50{
    padding:15px!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts :is(.usaf-post-report-grid-v50,.usaf-post-note-grid-v50,.usaf-post-brief-grid-v50){
    grid-template-columns:minmax(0,1fr)!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-footer-note-v50{
    grid-template-columns:minmax(0,1fr)!important;
    row-gap:5px!important;
  }
}
@media(max-width:480px){
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-meta-v50{
    display:grid!important;
    grid-template-columns:minmax(0,1fr)!important;
    gap:4px!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-meta-v50>span+span::before{
    display:none!important;
    content:none!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-posts .usaf-post-check-card-v50 dl>div{
    grid-template-columns:minmax(0,1fr)!important;
    row-gap:3px!important;
  }
}


/* v51: patrols/routes use the v50 post surface hierarchy; maps fill their frames without letterboxing. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols{
  --patrol-group-surface:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.008)),rgba(7,10,17,.46);
  --patrol-info-surface:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.021));
  --patrol-example-surface:rgba(0,0,0,.15);
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols>details.section-toggle.academy-expand-card[open]{
  background:rgba(12,16,27,.42)!important;
  background-image:none!important;
  box-shadow:none!important;
  filter:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols>details[open]>summary.academy-section-head-card{
  background:transparent!important;
  background-image:none!important;
  box-shadow:none!important;
  filter:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-expand-content{
  padding:20px!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-board-v51{
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  gap:15px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .report-group.usaf-patrol-group-v51{
  position:relative!important;
  min-width:0!important;
  margin:0!important;
  padding:17px!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.10))!important;
  border-radius:18px!important;
  background:var(--patrol-group-surface)!important;
  background-image:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.008))!important;
  box-shadow:none!important;
  filter:none!important;
  overflow:hidden!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .report-group.usaf-patrol-group-v51::before{
  content:""!important;
  display:block!important;
  position:absolute!important;
  left:0!important;
  top:0!important;
  bottom:0!important;
  width:3px!important;
  border-radius:18px 0 0 18px!important;
  background:var(--accent)!important;
  opacity:1!important;
  pointer-events:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-group-head-v51{
  margin:0 0 13px!important;
  padding:0 0 12px!important;
  border:0!important;
  border-bottom:1px solid color-mix(in srgb,var(--accent) 18%,rgba(255,255,255,.08))!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-group-head-v51>h3{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:var(--text)!important;
  font-size:17px!important;
  font-weight:950!important;
  line-height:1.2!important;
  letter-spacing:-.02em!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-meta-v51{
  display:flex!important;
  flex-wrap:wrap!important;
  gap:6px!important;
  margin:8px 0 0!important;
  padding:0!important;
  color:color-mix(in srgb,var(--muted) 86%,var(--text) 14%)!important;
  font-size:12.5px!important;
  font-weight:740!important;
  line-height:1.35!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-meta-v51 b{
  margin-right:5px!important;
  color:color-mix(in srgb,var(--accent) 82%,white 14%)!important;
  font-weight:950!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-grid-v51{
  display:grid!important;
  min-width:0!important;
  gap:11px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-grid-three-v51{
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-grid-two-v51{
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .report-card.usaf-patrol-card-v51{
  position:relative!important;
  display:block!important;
  min-width:0!important;
  margin:0!important;
  padding:12px 13px!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.10))!important;
  border-left:3px solid var(--accent)!important;
  border-radius:14px!important;
  background:var(--patrol-info-surface)!important;
  background-image:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.021))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;
  filter:none!important;
  overflow:hidden!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .report-card.usaf-patrol-card-v51::before,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .report-card.usaf-patrol-card-v51::after{
  display:none!important;
  content:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-card-head-v51{
  display:grid!important;
  grid-template-columns:max-content minmax(0,1fr)!important;
  column-gap:8px!important;
  align-items:baseline!important;
  min-width:0!important;
  margin:0 0 6px!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-card-head-v51>strong{
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  color:color-mix(in srgb,var(--accent) 84%,white 13%)!important;
  font-size:13px!important;
  font-weight:950!important;
  line-height:1.25!important;
  white-space:normal!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-card-head-v51>h4{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:var(--text)!important;
  font-size:13.5px!important;
  font-weight:950!important;
  line-height:1.28!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-card-v51>p{
  margin:0!important;
  padding:0!important;
  color:color-mix(in srgb,var(--text) 84%,var(--muted) 16%)!important;
  font-size:12.75px!important;
  font-weight:760!important;
  line-height:1.4!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-command-stack-v51{
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  gap:7px!important;
  margin:9px 0 0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .report-command{
  display:block!important;
  width:100%!important;
  box-sizing:border-box!important;
  margin:0!important;
  padding:8px 10px!important;
  border:1px solid rgba(255,255,255,.075)!important;
  border-left:3px solid var(--accent)!important;
  border-radius:11px!important;
  background:var(--patrol-example-surface)!important;
  background-image:none!important;
  color:var(--text)!important;
  font-family:inherit!important;
  font-size:12.25px!important;
  font-weight:820!important;
  line-height:1.36!important;
  white-space:pre-wrap!important;
  overflow-wrap:anywhere!important;
  cursor:text!important;
  user-select:text!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .report-command::before,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .report-command::after{
  display:none!important;
  content:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .report-command:hover,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .report-command.kiri-selected{
  border-color:color-mix(in srgb,var(--accent) 42%,rgba(255,255,255,.10))!important;
  border-left-color:var(--accent)!important;
  background:color-mix(in srgb,var(--accent) 9%,var(--patrol-example-surface))!important;
  color:var(--text)!important;
  outline:0!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols :is(.usaf-patrol-timing-v51,.usaf-patrol-callout-v51){
  margin:9px 0 0!important;
  padding:8px 10px!important;
  border:1px solid rgba(255,255,255,.075)!important;
  border-left:3px solid var(--accent)!important;
  border-radius:11px!important;
  background:var(--patrol-example-surface)!important;
  color:color-mix(in srgb,var(--text) 84%,var(--muted) 16%)!important;
  font-size:12.25px!important;
  font-weight:760!important;
  line-height:1.38!important;
  box-shadow:none!important;
  cursor:default!important;
  user-select:text!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-timing-v51{
  display:grid!important;
  grid-template-columns:max-content minmax(0,1fr)!important;
  column-gap:6px!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-timing-v51>b{
  color:color-mix(in srgb,var(--accent) 82%,white 14%)!important;
  font-weight:950!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-subhead-v51{
  margin:14px 0 10px!important;
  padding:13px 0 0!important;
  border:0!important;
  border-top:1px solid rgba(255,255,255,.075)!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-subhead-v51>h4{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:var(--text)!important;
  font-size:14px!important;
  font-weight:950!important;
  line-height:1.25!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-route-list-v51{
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  gap:0!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-route-map-v51{
  display:block!important;
  width:100%!important;
  min-width:0!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-route-map-v51+.usaf-route-map-v51{
  margin-top:15px!important;
  padding-top:15px!important;
  border-top:1px solid rgba(255,255,255,.075)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-route-map-v51>figcaption{
  margin:0 0 10px!important;
  padding:0!important;
  color:var(--text)!important;
  font-size:14px!important;
  font-weight:950!important;
  line-height:1.3!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-route-image-frame-v51{
  display:block!important;
  width:100%!important;
  height:auto!important;
  box-sizing:border-box!important;
  margin:0!important;
  padding:0!important;
  border:1px solid color-mix(in srgb,var(--accent) 25%,rgba(255,255,255,.10))!important;
  border-radius:14px!important;
  background:transparent!important;
  line-height:0!important;
  box-shadow:none!important;
  overflow:hidden!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-route-map-img-v51{
  display:block!important;
  width:100%!important;
  height:auto!important;
  max-width:none!important;
  max-height:none!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  object-fit:initial!important;
  object-position:initial!important;
  vertical-align:top!important;
  box-shadow:none!important;
}
@media(max-width:900px){
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-grid-three-v51{
    grid-template-columns:minmax(0,1fr)!important;
  }
}
@media(max-width:760px){
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-expand-content{
    padding:15px!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .report-group.usaf-patrol-group-v51{
    padding:15px!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-grid-two-v51{
    grid-template-columns:minmax(0,1fr)!important;
  }
}
@media(max-width:520px){
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-card-head-v51{
    grid-template-columns:minmax(0,1fr)!important;
    row-gap:3px!important;
  }
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-patrol-timing-v51{
    grid-template-columns:minmax(0,1fr)!important;
    row-gap:3px!important;
  }
}


/* v52: map gallery has two direct titles; the VU map shows only its sharp 1020x925 core. */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-route-gallery-v52{
  padding-top:17px!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-route-gallery-v52>.usaf-route-list-v51{
  margin:0!important;
  padding:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-route-gallery-v52 .usaf-route-title-v52{
  margin:0 0 12px!important;
  padding:0 0 11px!important;
  border:0!important;
  border-bottom:1px solid color-mix(in srgb,var(--accent) 18%,rgba(255,255,255,.08))!important;
  color:var(--text)!important;
  font-size:17px!important;
  font-weight:950!important;
  line-height:1.2!important;
  letter-spacing:-.02em!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-route-gallery-v52 .usaf-route-map-v51+.usaf-route-map-v51{
  margin-top:17px!important;
  padding-top:17px!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-route-gallery-v52 .usaf-route-image-frame-vu-v52{
  position:relative!important;
  display:block!important;
  width:100%!important;
  height:auto!important;
  aspect-ratio:1020 / 925!important;
  padding:0!important;
  overflow:hidden!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-patrols .usaf-route-gallery-v52 .usaf-route-image-frame-vu-v52>.usaf-route-map-img-v51{
  position:absolute!important;
  left:50%!important;
  top:50%!important;
  width:121.568627451%!important;
  height:auto!important;
  max-width:none!important;
  max-height:none!important;
  margin:0!important;
  padding:0!important;
  transform:translate(-50%,-50%)!important;
  transform-origin:center!important;
  object-fit:initial!important;
  object-position:initial!important;
}


/* v53 USAF protocols surface redesign */
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols > details.section-toggle.academy-expand-card[open]{
  background:rgba(12,16,27,.42)!important;
  background-image:none!important;
  border-color:color-mix(in srgb,var(--accent) 45%,rgba(255,255,255,.14))!important;
  box-shadow:none!important;
  filter:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols > details.section-toggle.academy-expand-card[open] > summary.academy-section-head-card{
  background:transparent!important;
  background-image:none!important;
  box-shadow:none!important;
  filter:none!important;
  text-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-content-v53{
  padding:20px!important;
  border-top:1px solid color-mix(in srgb,var(--accent) 36%,transparent)!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-board-v53{
  display:grid!important;
  gap:15px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-group-v53{
  position:relative!important;
  min-width:0!important;
  margin:0!important;
  padding:17px!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.13))!important;
  border-left:3px solid var(--accent)!important;
  border-radius:18px!important;
  background:linear-gradient(145deg,rgba(255,255,255,.034),rgba(255,255,255,.012)),rgba(7,10,17,.46)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;
  overflow:hidden!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-group-head-v53{
  display:block!important;
  margin:0 0 13px!important;
  padding:0 0 12px!important;
  border:0!important;
  border-bottom:1px solid color-mix(in srgb,var(--accent) 22%,rgba(255,255,255,.11))!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-group-head-v53 h3{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:var(--text)!important;
  font-size:17px!important;
  font-weight:950!important;
  line-height:1.25!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols :is(.usaf-protocol-grid-v53,.usaf-protocol-proof-grid-v53){
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  align-items:start!important;
  gap:11px!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols :is(.usaf-protocol-card-v53,.usaf-protocol-proof-card-v53){
  min-width:0!important;
  margin:0!important;
  padding:12px 13px!important;
  border:1px solid color-mix(in srgb,var(--accent) 23%,rgba(255,255,255,.13))!important;
  border-left:3px solid var(--accent)!important;
  border-radius:14px!important;
  background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.021)),rgba(12,16,27,.64)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;
  color:var(--text)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-card-wide-v53{
  width:100%!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-card-head-v53{
  display:flex!important;
  align-items:baseline!important;
  flex-wrap:wrap!important;
  gap:4px 10px!important;
  margin:0 0 8px!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-card-head-v53 h4{
  margin:0!important;
  padding:0!important;
  border:0!important;
  color:color-mix(in srgb,var(--accent) 85%,var(--text) 15%)!important;
  font-size:13.5px!important;
  font-weight:950!important;
  line-height:1.3!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-card-head-v53 span{
  color:var(--text)!important;
  font-size:13.5px!important;
  font-weight:900!important;
  line-height:1.3!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-facts-v53{
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  color:var(--text)!important;
  font-size:12.75px!important;
  font-weight:700!important;
  line-height:1.4!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-facts-v53 p{
  margin:0 0 5px!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-facts-v53 p:last-of-type{margin-bottom:0!important;}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-facts-v53 b{
  color:color-mix(in srgb,var(--accent) 85%,var(--text) 15%)!important;
  font-weight:950!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-facts-v53 ul{
  display:grid!important;
  gap:3px!important;
  margin:8px 0 0 17px!important;
  padding:0!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-facts-v53 li{
  margin:0!important;
  padding:0 0 0 1px!important;
  color:var(--text)!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-facts-v53 li::marker{color:var(--accent)!important;}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .report-command{
  position:relative!important;
  display:block!important;
  width:100%!important;
  min-width:0!important;
  margin:9px 0 0!important;
  padding:8px 10px!important;
  border:1px solid rgba(255,255,255,.12)!important;
  border-left:3px solid var(--accent)!important;
  border-radius:11px!important;
  background:rgba(0,0,0,.15)!important;
  box-shadow:none!important;
  color:var(--text)!important;
  font-size:12.5px!important;
  font-weight:900!important;
  line-height:1.35!important;
  cursor:text!important;
  user-select:text!important;
  transition:background-color .15s ease,border-color .15s ease!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .report-command:is(:hover,.kiri-selected){
  border-color:color-mix(in srgb,var(--accent) 58%,rgba(255,255,255,.14))!important;
  border-left-color:var(--accent)!important;
  background:color-mix(in srgb,var(--accent) 9%,rgba(0,0,0,.18))!important;
  box-shadow:none!important;
  transform:none!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .report-command::before,
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .report-command::after{display:none!important;content:none!important;}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-meaning-v53{
  margin:6px 1px 0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  color:var(--muted)!important;
  font-size:12.25px!important;
  font-weight:700!important;
  line-height:1.4!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-proof-card-v53 header{
  display:flex!important;
  align-items:baseline!important;
  justify-content:space-between!important;
  gap:8px!important;
  margin:0 0 5px!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-proof-card-v53 h4{
  margin:0!important;
  color:var(--text)!important;
  font-size:13.5px!important;
  font-weight:950!important;
  line-height:1.3!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-proof-card-v53 strong{
  flex:0 0 auto!important;
  color:color-mix(in srgb,var(--accent) 85%,var(--text) 15%)!important;
  font-size:12.5px!important;
  font-weight:950!important;
  line-height:1.3!important;
}
html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-proof-card-v53 p{
  margin:0!important;
  color:var(--muted)!important;
  font-size:12.75px!important;
  font-weight:700!important;
  line-height:1.4!important;
}
@media(max-width:760px){
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-content-v53{padding:15px!important;}
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols .usaf-protocol-group-v53{padding:15px!important;}
  html body.usaf-info-clean :is(#departmentInfoContent,#profileRankMaterials) #usaf-protocols :is(.usaf-protocol-grid-v53,.usaf-protocol-proof-grid-v53){grid-template-columns:1fr!important;}
}
/* end v53 USAF protocols surface redesign */
