/* Извлечено из v66. Порядок подключения сохранять. */
/* v56: a separate, theme-aware promo carousel below the main navigation. */
.profile-card > .dashboard-tabs{margin-bottom:0!important;}
.profile-card > .profile-promo-carousel{
  position:relative;
  min-width:0;
  margin:14px 0 0;
  border:1px solid color-mix(in srgb,var(--accent) 26%,rgba(255,255,255,.10));
  border-radius:18px;
  overflow:hidden;
  isolation:isolate;
  background:
    radial-gradient(circle at 100% 0%,color-mix(in srgb,var(--accent) 15%,transparent),transparent 55%),
    linear-gradient(145deg,rgba(255,255,255,.055),rgba(2,5,11,.32));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.045);
}
.profile-promo-carousel::before{
  content:"";
  position:absolute;
  inset:0 auto 0 0;
  z-index:2;
  width:3px;
  background:linear-gradient(180deg,var(--accent),var(--accent2));
  opacity:.92;
  pointer-events:none;
}
.profile-stream-banner{
  position:relative;
  z-index:4;
  display:grid;
  grid-template-columns:auto minmax(0,1fr) auto;
  align-items:center;
  gap:8px;
  min-height:38px;
  padding:8px 11px 8px 13px;
  border:0;
  border-bottom:1px solid rgba(255,255,255,.08);
  background:rgba(0,0,0,.16);
  color:var(--muted);
  text-decoration:none;
  font-size:10.5px;
  font-weight:950;
  line-height:1.15;
  letter-spacing:.045em;
  text-transform:uppercase;
  transition:background .2s ease,border-color .2s ease,color .2s ease;
}
.profile-stream-banner:hover{
  background:color-mix(in srgb,var(--accent) 8%,rgba(0,0,0,.16));
  color:var(--text);
}
.profile-stream-banner:focus-visible{
  outline:2px solid color-mix(in srgb,var(--accent) 75%,white 8%);
  outline-offset:-3px;
}
.profile-stream-dot{
  width:9px;
  height:9px;
  border-radius:999px;
  background:rgba(255,255,255,.24);
  box-shadow:none;
  flex:0 0 9px;
}
.profile-stream-text{
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.profile-stream-open{
  color:currentColor;
  font-size:13px;
  line-height:1;
  opacity:.82;
}
.profile-stream-banner.is-checking .profile-stream-dot{
  background:var(--accent);
  box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 45%,transparent);
  animation:profileStreamPulse 1.4s ease-out infinite;
}
.profile-stream-banner.is-offline .profile-stream-dot{
  background:rgba(255,255,255,.30);
}
.profile-stream-banner.is-error .profile-stream-dot{
  background:var(--yellow,#ffd166);
}
.profile-stream-banner.is-local .profile-stream-dot{
  background:var(--yellow,#ffd166);
}
.profile-stream-banner.is-local{
  color:var(--muted);
}
.profile-stream-banner.is-live{
  border-bottom-color:rgba(255,91,116,.48);
  background:linear-gradient(135deg,rgba(255,64,94,.22),rgba(125,43,70,.14));
  color:#fff;
}
.profile-stream-banner.is-live .profile-stream-dot{
  background:#ff405e;
  box-shadow:0 0 14px rgba(255,64,94,.72);
  animation:profileStreamLive 1.15s ease-in-out infinite;
}
.profile-promo-carousel.is-stream-live{
  border-color:rgba(255,64,94,.52);
}
.profile-promo-carousel.is-stream-live::before{
  background:linear-gradient(180deg,#ff405e,var(--accent));
}
.profile-twitch-probe{
  position:fixed!important;
  left:-10000px!important;
  top:-10000px!important;
  width:400px!important;
  height:300px!important;
  overflow:hidden!important;
  opacity:.001!important;
  pointer-events:none!important;
  z-index:-1!important;
}
.profile-twitch-probe iframe{
  width:400px!important;
  height:300px!important;
  border:0!important;
}


.profile-promo-track{display:grid;min-width:0;}
.profile-promo-slide{
  grid-area:1/1;
  min-width:0;
  min-height:142px;
  opacity:0;
  visibility:hidden;
  pointer-events:none;
  transform:translateX(8px);
  transition:opacity .22s ease,transform .22s ease,visibility .22s;
}
.profile-promo-slide.is-active{
  z-index:1;
  opacity:1;
  visibility:visible;
  pointer-events:auto;
  transform:none;
}
.profile-promo-content{
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  width:100%;
  min-width:0;
  min-height:142px;
  padding:15px 15px 38px;
  gap:6px;
  border:0;
  color:var(--text);
  text-decoration:none;
}
a.profile-promo-content:hover{background:color-mix(in srgb,var(--accent) 6%,transparent);}
a.profile-promo-content:focus-visible{
  outline:2px solid color-mix(in srgb,var(--accent) 75%,white 8%);
  outline-offset:-3px;
  border-radius:17px;
}
.profile-promo-kicker{
  display:flex;
  align-items:center;
  gap:7px;
  margin:0;
  color:color-mix(in srgb,var(--accent) 82%,white 12%);
  font-size:10px;
  font-weight:950;
  line-height:1.15;
  letter-spacing:.075em;
  text-transform:uppercase;
}
.profile-promo-kicker svg{
  width:15px;
  height:15px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
  stroke-linejoin:round;
}
.profile-promo-content > strong{
  display:block;
  margin:0;
  color:var(--text);
  font-size:16px;
  font-weight:950;
  line-height:1.18;
  letter-spacing:-.025em;
}
.profile-promo-copy{
  display:block;
  margin:0;
  color:var(--muted);
  font-size:12px;
  font-weight:800;
  line-height:1.32;
}
.profile-promo-action,.profile-promo-status{
  display:inline-flex;
  align-items:center;
  min-height:25px;
  margin-top:2px;
  padding:4px 9px;
  border:1px solid color-mix(in srgb,var(--accent) 35%,rgba(255,255,255,.10));
  border-radius:999px;
  background:color-mix(in srgb,var(--accent) 9%,rgba(0,0,0,.16));
  color:color-mix(in srgb,var(--accent) 82%,white 12%);
  font-size:10.5px;
  font-weight:950;
  line-height:1;
}
.profile-promo-status{
  border-style:dashed;
  background:rgba(255,255,255,.035);
  color:color-mix(in srgb,var(--muted) 78%,var(--text) 22%);
}
.profile-promo-content.is-disabled{cursor:default;}
.profile-promo-controls{
  position:absolute;
  right:11px;
  bottom:10px;
  z-index:4;
  display:flex;
  align-items:center;
  gap:0;
}
.profile-promo-dots{display:flex;align-items:center;gap:1px;}
.profile-promo-dots button{
  box-sizing:border-box;
  display:grid;
  place-items:center;
  width:24px;
  height:24px;
  margin:0;
  padding:0;
  border:0;
  border-radius:8px;
  background:transparent;
  cursor:pointer;
}
.profile-promo-dots button::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:999px;
  background:rgba(255,255,255,.25);
  transition:width .18s ease,background .18s ease;
}
.profile-promo-dots button.is-active::before{width:18px;background:var(--accent);}
.profile-promo-dots button:focus-visible{
  outline:2px solid var(--accent);
  outline-offset:2px;
}
.profile-promo-carousel + #openSettings{margin-top:14px!important;}
.profile-promo-sr-only{
  position:absolute!important;
  width:1px!important;
  height:1px!important;
  padding:0!important;
  margin:-1px!important;
  overflow:hidden!important;
  clip:rect(0,0,0,0)!important;
  white-space:nowrap!important;
  border:0!important;
}
@media(max-width:420px){
  .profile-promo-content{padding:14px 13px 38px;}
  .profile-promo-content > strong{font-size:15px;}
}
@media(prefers-reduced-motion:reduce){
  .profile-promo-slide,.profile-promo-dots button::before{transition:none!important;}
  .profile-stream-dot{animation:none!important;}
}
/* end v56 sidebar promo carousel */
