/* Casual-copy deterrent shared by every page on deck.webgraha.com.
   It can't truly stop DevTools (the browser menu, view-source: and disabling JS all still work);
   it blocks the common shortcuts, the right-click menu and media drag/download, and swaps
   the page for an error screen while DevTools is detected open. */
(function () {
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform);

  function blocked(e) {
    // e.code, not e.key: Option on Mac changes the character (Cmd+Opt+I gives 'ˆ')
    var c = e.code || '';
    var mod = isMac ? e.metaKey : e.ctrlKey;
    if (c === 'F12' || e.key === 'F12') return true;
    // DevTools panels: Ctrl+Shift+I/J/C/K (Win/Linux), Cmd+Opt+I/J/C (Mac)
    if (mod && (isMac ? e.altKey : e.shiftKey) && /^Key[IJCK]$/.test(c)) return true;
    // View source, save page
    if (mod && !e.shiftKey && !e.altKey && (c === 'KeyU' || c === 'KeyS')) return true;
    return false;
  }

  window.addEventListener('keydown', function (e) {
    if (blocked(e)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  // Keep the menu in text fields so paste/spellcheck still work
  document.addEventListener('contextmenu', function (e) {
    if (!e.target.closest('input, textarea, [contenteditable="true"]')) e.preventDefault();
  }, true);

  document.addEventListener('dragstart', function (e) {
    if (e.target.closest('img, video, a')) e.preventDefault();
  }, true);

  function lockMedia() {
    var v = document.querySelectorAll('video');
    for (var i = 0; i < v.length; i++) {
      v[i].setAttribute('controlsList', 'nodownload noplaybackrate');
      v[i].disablePictureInPicture = true;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lockMedia);
  else lockMedia();

  /* ---------- DevTools detection → error page ----------
     A `debugger` statement is a no-op while DevTools is closed; when it's open, execution
     pauses there, so a long gap across it means DevTools is open. Each check builds a fresh
     function so "Never pause here" on one of them doesn't silence the next.
     The page stays hidden until the first check passes, so content never shows if DevTools
     was already open on load. To debug the site yourself, comment out this script's tag. */
  var hide = document.createElement('style');
  hide.textContent = 'html{visibility:hidden!important}';
  document.head.appendChild(hide);

  var script = document.currentScript;
  var root = script ? script.src.replace(/assets\/guard\.js.*$/, '') : '/';
  var locked = false, clean = 0;

  function devtoolsOpen() {
    var t = performance.now();
    try { (function () {}).constructor('debugger')(); } catch (e) {}
    return performance.now() - t > 100;
  }

  var MARK = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#fff" transform="translate(15.1,10) scale(.8756)">' +
    '<path d="M55.86 51.5v3.65c-1.97-2.55-5.79-4.34-9.55-4.34-7.41 0-13.14 5.85-13.14 14.18s5.73 14.24 13.14 14.24c3.7 0 7.18-1.56 9.55-4.28v2.84c0 3.18-3.3 5.44-8.22 5.44-3.41 0-6.89-1.1-8.74-2.66l-3.3 6.83c3.07 2.32 8.16 3.99 13.54 3.99 9.72 0 16.55-5.44 16.55-13.14V51.5zm-6.31 19.56c-3.65 0-6.31-2.55-6.31-6.08s2.66-6.02 6.31-6.02c3.7 0 6.31 2.49 6.31 6.02s-2.6 6.08-6.31 6.08z"/>' +
    '<path d="M42.39 27.1c-.24.9-.57 1.96-2.03 1.74-1.01-.15-1.4-1.16-1.91-1.92-.51-.75-.95-1.49-1.46-2.28-.52-.81-1-1.53-1.5-2.33-1.4-2.23-3-4.91-6.93-4.5-2.42.25-3.63 1.86-4.73 2.95l-7.63 7.61c-1.41 1.23-3.65 1.1-4.25-1.95l-2.5-12.73c-.75-3.81-.32-3.6-4.06-3.6-1.27 0-2.56-.02-3.84 0-1.35.02-1.71.82-1.51 2.19 1.32 8.87 2.53 17.85 3.77 26.75.39 2.8.63 3.89 2.27 5.4 1.29 1.19 3.26 2.1 5.68 1.83 2.51-.28 3.71-1.62 4.83-2.8 1.18-1.24 2.53-2.6 3.72-3.85l3.77-3.9c.32-.34.66-.6.98-.94l1.86-1.97c.28-.3.57-.54.93-.9.66-.65 1.65-1.46 2.55-.56l7.55 11.51c4.06 6.26 12.32 3.61 13.23-2.5.32-2.13.36-4.92.51-7.13.17-2.4.33-4.77.49-7.17.09-1.29.31-2.26-.47-3.17-.73-.86-1.56-.83-2.98-.83-2.66 0-4.83-.55-5.54 2.02-.28 1.02-.53 2.02-.8 3.03z"/>' +
    '<path d="M31.15.99c31.88 5.89 49.84 35.76 48.44 64.1-.27 5.53-1.2 10.86-2.67 15.88.69-3.44 1.13-6.99 1.3-10.63C79.61 40.43 59.81 8.82 23.98 2.73 17.53 1.63 10.96 1.44 4.41 2.14 13.18-.24 22.24-.66 31.15.99z"/></g></svg>';

  function lockout() {
    if (locked) return;
    locked = true;
    var media = document.querySelectorAll('video, audio');
    for (var i = 0; i < media.length; i++) { try { media[i].pause(); } catch (e) {} }
    var f = root + 'WebGraha-Service-Deck/assets/fonts/';
    document.documentElement.innerHTML =
      '<head><meta charset="utf-8"><title>Access restricted | WebGraha</title><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><style>' +
      "@font-face{font-family:'Metropolis';src:url(" + f + "metropolis-extra-bold.ttf);font-weight:800}" +
      "@font-face{font-family:'Inter';src:url(" + f + "Inter-Regular.ttf);font-weight:400}" +
      "@font-face{font-family:'JetBrains Mono';src:url(" + f + "JetBrainsMono-Regular.ttf)}" +
      '*{box-sizing:border-box}html,body{margin:0;height:100%}' +
      'body{display:flex;align-items:center;justify-content:center;padding:24px;color:#CBD5E1;font:400 17px/1.6 Inter,system-ui,sans-serif;text-align:center;' +
      'background:radial-gradient(800px 560px at 10% -10%,rgba(91,63,168,.6),transparent 62%),radial-gradient(1px 1px at 20px 30px,#fff,transparent) 0 0/280px 240px,radial-gradient(1px 1px at 190px 150px,rgba(255,255,255,.7),transparent) 0 0/280px 240px,linear-gradient(180deg,#0A1128,#020208)}' +
      '.box{max-width:520px}.mark{width:84px;height:84px;margin:0 auto 32px;border-radius:22px;background:#0A1128;border:1px solid rgba(255,255,255,.18);box-shadow:0 0 0 10px rgba(110,231,183,.06),0 20px 60px rgba(0,0,0,.5)}' +
      '.pill{display:inline-block;font:12px "JetBrains Mono",monospace;letter-spacing:.3em;color:#FCA5A5;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.45);border-radius:999px;padding:8px 18px}' +
      "h1{font:800 clamp(32px,6vw,48px)/1.08 Metropolis,Georgia,serif;color:#fff;margin:22px 0 16px}h1 em{font-style:normal;color:#6EE7B7}" +
      'p{margin:0 auto 30px;max-width:440px}' +
      '.btn{display:inline-block;font:700 15px Inter,sans-serif;color:#0A1128;background:#6EE7B7;border-radius:999px;padding:12px 26px;text-decoration:none}.btn:hover{background:#A7F3D0}' +
      '.foot{margin-top:40px;font:12px "JetBrains Mono",monospace;color:#64748B;letter-spacing:.06em}.foot a{color:#94A3B8;text-decoration:none}' +
      '</style></head><body><main class="box">' +
      '<div class="mark">' + MARK + '</div>' +
      '<span class="pill">ACCESS RESTRICTED</span>' +
      '<h1>Developer tools <em>detected.</em></h1>' +
      '<p>This deck can’t be viewed while developer tools are open. Close them and the page will come back on its own.</p>' +
      '<a class="btn" href="' + location.href.replace(/"/g, '%22') + '">Reload page</a>' +
      '<div class="foot">WebGraha · <a href="https://webgraha.com" target="_blank" rel="noopener">webgraha.com</a></div>' +
      '</main></body>';
  }

  function tick() {
    if (devtoolsOpen()) { clean = 0; lockout(); }
    else if (locked && ++clean >= 2) location.reload();
  }

  function start() {
    tick();
    if (hide.parentNode) hide.parentNode.removeChild(hide);
    setInterval(tick, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
