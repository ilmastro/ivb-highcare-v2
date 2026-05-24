/* ── NAV ─────────────────────────────────────────────────────── */
const TAB_ORDER = ['home', 'team', 'dag', 'regels', 'contact'];
let currentTab = 'home';

function goTo(tab, pushState = true) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  document.getElementById('nav-' + tab).classList.add('active');
  document.getElementById('contentArea').scrollTop = 0;
  currentTab = tab;

  /* Push a history entry so Android back button has somewhere to go */
  if (pushState) {
    history.pushState({ tab }, '', '#' + tab);
  }
}

/* Handle Android/browser back button */
window.addEventListener('popstate', function (e) {
  const tab = e.state && e.state.tab;

  if (tab && TAB_ORDER.includes(tab)) {
    /* Navigate to the popped tab without pushing another history entry */
    goTo(tab, false);
  } else {
    /* No more history — we're at the root, go home */
    goTo('home', false);
  }
});

/* Double-tap back to exit: if user is on home and back is pressed,
   Android will naturally exit the PWA since there's nothing left in history */

/* Seed the initial history entry so the first back press goes home */
history.replaceState({ tab: 'home' }, '', '#home');

/* ── SERVICE WORKER ──────────────────────────────────────────── */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(function () {});
}
