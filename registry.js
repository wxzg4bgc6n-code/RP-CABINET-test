.progress-proofs{
  margin-top:24px;
  padding-top:22px;
  border-top:1px solid var(--line);
}
.proof-heading,
.proof-task-head,
.proof-report-actions,
.proof-report-ready{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
}
.proof-heading h3{margin:4px 0 6px;font-size:21px;}
.proof-heading p,
.proof-report-actions p{font-size:13px;line-height:1.5;color:var(--muted);}
.proof-eyebrow,
.proof-status{
  display:block;
  color:var(--accent);
  font-size:11px;
  font-weight:950;
  letter-spacing:.04em;
  text-transform:uppercase;
}
.proof-counter{
  flex:none;
  min-width:70px;
  padding:9px 12px;
  border:1px solid color-mix(in srgb,var(--accent) 45%,var(--line));
  border-radius:12px;
  background:var(--surface-soft,rgba(255,255,255,.035));
  color:var(--text);
  font-weight:950;
  text-align:center;
}
.proof-guidance{
  margin-top:14px;
  padding:12px 14px;
  border:1px solid var(--line);
  border-radius:14px;
  background:rgba(5,9,17,.52);
}
.proof-guidance.is-ready{border-left:4px solid var(--accent);}
.proof-service-note,
.proof-empty{
  margin:0;
  color:var(--muted);
  font-size:12px;
  line-height:1.45;
}
.proof-empty{
  margin-top:5px;
  padding-top:5px;
  border-top:1px solid color-mix(in srgb,var(--line) 68%,transparent);
}
.proof-task-list{display:grid;gap:10px;margin-top:14px;}
.proof-task{
  padding:14px;
  border:1px solid color-mix(in srgb,var(--accent) 34%,var(--line));
  border-left:4px solid var(--accent);
  border-radius:16px;
  background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 7%,transparent),transparent 48%),rgba(12,17,28,.72);
}
.proof-task.no-proof{border-left-color:var(--muted);}
.proof-task h4{margin:4px 0 0;font-size:15px;line-height:1.35;}
.proof-upload{
  position:relative;
  flex:none;
  min-width:174px;
  overflow:hidden;
  border:1px solid color-mix(in srgb,var(--accent) 58%,var(--line));
  border-radius:12px;
  background:color-mix(in srgb,var(--accent) 10%,rgba(7,10,18,.86));
  color:var(--text);
  font-size:12px;
  font-weight:950;
  text-align:center;
  transition:.2s ease;
}
.proof-upload:hover{transform:translateY(-1px);border-color:var(--accent);}
.proof-upload input{position:absolute;inset:0;opacity:0;cursor:pointer;}
.proof-upload span{display:block;padding:10px 12px;}
.proof-upload.is-disabled{opacity:.48;pointer-events:none;}
.proof-done-mark{
  flex:none;
  color:var(--muted);
  font-size:12px;
  font-weight:900;
}
.proof-files{display:grid;gap:8px;margin-top:12px;}
.proof-file{
  display:grid;
  grid-template-columns:88px minmax(0,1fr) 34px;
  align-items:center;
  gap:11px;
  padding:8px;
  border:1px solid var(--line);
  border-radius:13px;
  background:rgba(3,6,12,.72);
}
.proof-file a{display:block;width:88px;height:54px;overflow:hidden;border-radius:8px;background:#03050a;}
.proof-file img{display:block;width:100%;height:100%;object-fit:contain;}
.proof-file b,
.proof-file span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.proof-file b{font-size:12px;}
.proof-file span{margin-top:3px;color:var(--muted);font-size:11px;}
.proof-icon-btn{
  width:32px;
  height:32px;
  border:1px solid color-mix(in srgb,var(--accent) 42%,var(--line));
  border-radius:10px;
  background:transparent;
  color:var(--accent);
  font-size:19px;
  font-weight:900;
}
.proof-report-actions{
  margin-top:16px;
  padding:16px;
  border:1px solid var(--line);
  border-radius:16px;
  background:rgba(5,9,17,.52);
}
.proof-report-actions h4{margin:0 0 4px;font-size:15px;}
.proof-report-actions .btn:disabled{opacity:.42;cursor:not-allowed;}
.proof-report-ready{
  margin-top:10px;
  padding:14px;
  border:1px solid color-mix(in srgb,var(--accent) 45%,var(--line));
  border-radius:16px;
  background:color-mix(in srgb,var(--accent) 7%,rgba(5,9,17,.7));
}
.proof-report-ready>div{min-width:0;}
.proof-report-ready span,
.proof-report-ready small,
.proof-report-ready a{display:block;}
.proof-report-ready span{font-size:11px;font-weight:950;color:var(--accent);text-transform:uppercase;}
.proof-report-ready a{margin:5px 0;overflow:hidden;color:var(--text);font-size:12px;font-weight:800;text-overflow:ellipsis;white-space:nowrap;}
.proof-report-ready small{color:var(--muted);}
.proof-delete-report{
  flex:none;
  border:0;
  background:transparent;
  color:#fb7185;
  font-size:12px;
  font-weight:950;
}
@media (max-width:760px){
  .progress-proofs{margin-top:18px;padding-top:18px;}
  .proof-heading,
  .proof-task-head,
  .proof-report-actions,
  .proof-report-ready{align-items:stretch;flex-direction:column;}
  .proof-heading{position:relative;padding-right:66px;}
  .proof-counter{position:absolute;right:0;top:0;min-width:58px;padding:8px;}
  .proof-upload{width:100%;min-width:0;}
  .proof-file{grid-template-columns:72px minmax(0,1fr) 34px;}
  .proof-file a{width:72px;height:48px;}
  .proof-report-actions .btn,
  .proof-report-ready .btn{width:100%;}
}
