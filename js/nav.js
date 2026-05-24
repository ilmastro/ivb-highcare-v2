/* ── NAV + ANDROID BACK BUTTON ───────────────────────────────── */
const TAB_ORDER = ['home', 'team', 'dag', 'regels', 'contact'];
let currentTab = 'home';

function goTo(tab, pushState = true) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  document.getElementById('nav-' + tab).classList.add('active');
  document.getElementById('contentArea').scrollTop = 0;
  currentTab = tab;
  if (pushState) {
    history.pushState({ tab: tab }, '', '#' + tab);
  }
}

/* Seed the initial history entry on page load */
history.replaceState({ tab: 'home' }, '', '#home');

/* Android back button — fires when user presses back */
window.addEventListener('popstate', function(e) {
  const tab = e.state && e.state.tab;
  if (tab && TAB_ORDER.includes(tab)) {
    goTo(tab, false);
  } else {
    goTo('home', false);
  }
});

/* ── SERVICE WORKER ──────────────────────────────────────────── */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(function() {});
}
