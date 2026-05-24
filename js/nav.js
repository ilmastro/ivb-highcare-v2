/* ── NAV + ANDROID BACK BUTTON ───────────────────────────────── */
const TAB_ORDER = ['home', 'team', 'dag', 'regels', 'contact'];
let currentTab = 'home';
let backPressedOnce = false;

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

/* Keep one extra sentinel entry ahead of home so popstate
   always fires even when on the home tab */
history.pushState({ tab: '__sentinel__' }, '', '#home');

/* Android back button */
window.addEventListener('popstate', function(e) {
  const tab = e.state && e.state.tab;

  if (tab && TAB_ORDER.includes(tab) && tab !== 'home') {
    /* Going back through a real tab */
    goTo(tab, false);
    /* Restore the sentinel so next back from here still fires popstate */
    history.pushState({ tab: '__sentinel__' }, '', '#' + tab);
    return;
  }

  /* We're at home — handle double-back-to-exit */
  if (currentTab === 'home') {
    if (backPressedOnce) {
      /* Second press — actually exit by pushing nothing and letting Android take over */
      window.history.go(-history.length);
      return;
    }
    backPressedOnce = true;
    showExitToast();
    setTimeout(() => { backPressedOnce = false; }, 2000);
    /* Restore sentinel so the next back press fires popstate again */
    history.pushState({ tab: '__sentinel__' }, '', '#home');
    return;
  }

  /* Fallback — go home */
  goTo('home', false);
  history.pushState({ tab: '__sentinel__' }, '', '#home');
});

function showExitToast() {
  let toast = document.getElementById('exitToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'exitToast';
    toast.style.cssText = `
      position:fixed; bottom:90px; left:50%; transform:translateX(-50%);
      background:rgba(30,35,50,0.95); color:#eef1f8;
      padding:10px 20px; border-radius:20px; font-size:13px;
      font-family:'DM Sans',sans-serif; z-index:9999;
      border:1px solid rgba(255,255,255,0.12);
      box-shadow:0 4px 20px rgba(0,0,0,0.4);
      white-space:nowrap; pointer-events:none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = 'Nog een keer terug om af te sluiten';
  toast.style.opacity = '1';
  toast.style.transition = 'opacity 0.3s';
  setTimeout(() => { toast.style.opacity = '0'; }, 1800);
}

/* ── SERVICE WORKER ──────────────────────────────────────────── */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(function() {});
}
