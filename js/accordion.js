/* ── ACCORDION ───────────────────────────────────────────────── */
function toggleAcc(card) {
  const isOpen = card.classList.contains('open');
  card.closest('.panel').querySelectorAll('.acc-card.open').forEach(c => c.classList.remove('open'));
  if (!isOpen) card.classList.add('open');
}
