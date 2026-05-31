/* ── LANGUAGE ────────────────────────────────────────────────── */
/* Manages NL/EN preference, stored in localStorage.            */
/* Exposes: window.currentLang, window.getLangSuffix()          */

(function () {
  var STORAGE_KEY = 'ivb-lang';
  var supported   = ['nl', 'en'];

  /* Read stored preference, default to 'nl' */
  var stored = 'nl';
  try { stored = localStorage.getItem(STORAGE_KEY) || 'nl'; } catch (e) {}
  if (supported.indexOf(stored) === -1) stored = 'nl';

  window.currentLang = stored;

  /* Returns '' for Dutch, '.en' for English — used when fetching JSON */
  window.getLangSuffix = function () {
    return window.currentLang === 'en' ? '.en' : '';
  };

  /* Switch language and reload to re-fetch all content */
  window.setLang = function (lang) {
    if (supported.indexOf(lang) === -1) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    window.location.reload();
  };

  /* Update toggle button appearance to match current lang */
  window.updateLangToggle = function () {
    var btn = document.getElementById('langBtn');
    if (!btn) return;
    var nlSpan = btn.querySelector('.lang-nl');
    var enSpan = btn.querySelector('.lang-en');
    if (!nlSpan || !enSpan) return;
    if (window.currentLang === 'en') {
      nlSpan.classList.remove('lang-active');
      enSpan.classList.add('lang-active');
    } else {
      enSpan.classList.remove('lang-active');
      nlSpan.classList.add('lang-active');
    }
  };
})();
