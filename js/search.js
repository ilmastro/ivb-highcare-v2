/* ── SEARCH ──────────────────────────────────────────────────── */
/* searchData is populated dynamically by render.js.             */
/* We listen for 'searchDataReady' before allowing searches,     */
/* but the overlay UI is wired up immediately.                   */

const overlay  = document.getElementById('searchOverlay');
const input    = document.getElementById('searchInput');
const results  = document.getElementById('searchResults');

document.getElementById('searchBtn').addEventListener('click', function () {
  overlay.classList.add('active');
  input.focus();
  renderSearch('');
});

document.getElementById('searchCancel').addEventListener('click', closeSearch);

function closeSearch() {
  overlay.classList.remove('active');
  input.value = '';
  results.innerHTML = '';
}

input.addEventListener('input', function () {
  renderSearch(this.value.trim().toLowerCase());
});

function sectionColor(cls) {
  return {
    'sr-team':    'var(--pink)',
    'sr-dag':     'var(--teal)',
    'sr-regels':  'var(--gold)',
    'sr-contact': 'var(--coral)',
  }[cls] || 'var(--sky)';
}

function renderSearch(q) {
  if (!q) {
    results.innerHTML = '<div class="sr-empty">Typ om te zoeken…</div>';
    return;
  }
  const hits = (window.searchData || []).filter(d =>
    d.title.toLowerCase().includes(q) ||
    d.snippet.toLowerCase().includes(q) ||
    d.section.toLowerCase().includes(q)
  );
  if (!hits.length) {
    results.innerHTML = '<div class="sr-empty">Geen resultaten gevonden.</div>';
    return;
  }
  results.innerHTML = hits.map(h => `
    <div class="search-result ${h.cls}" onclick="goTo('${h.tab}');closeSearch();">
      <div class="sr-section" style="color:${sectionColor(h.cls)}">${h.section}</div>
      <div class="sr-title">${h.title}</div>
      <div class="sr-snippet">${h.snippet}</div>
    </div>`).join('');
}
