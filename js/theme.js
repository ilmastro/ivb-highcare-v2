/* ── THEME ───────────────────────────────────────────────────── */
let isDark = localStorage.getItem('ivb-theme') !== 'light';

function applyTheme() {
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    document.getElementById('themeIcon').textContent = '🌙';
    document.getElementById('themeMetaColor').content = '#0f1117';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    document.getElementById('themeIcon').textContent = '☀️';
    document.getElementById('themeMetaColor').content = '#f2f4f9';
  }
  localStorage.setItem('ivb-theme', isDark ? 'dark' : 'light');
}

applyTheme();

document.getElementById('themeBtn').addEventListener('click', function () {
  isDark = !isDark;
  applyTheme();
});
