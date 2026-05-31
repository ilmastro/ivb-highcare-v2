/* ── RENDER ──────────────────────────────────────────────────── */
/* Fetches all data JSONs, renders each panel, and populates     */
/* searchData dynamically for search.js to consume.             */

window.searchData = [];

/* ── HELPERS ─────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Newline-separated text → <p> tags, **bold** → <strong> */
function bodyToHtml(text) {
  if (!text) return '';
  return text
    .split(/\n\n/)
    .map(para => {
      const line = para.trim().replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                               .replace(/\n/g, '<br>');
      return `<p>${line}</p>`;
    })
    .filter(p => p !== '<p></p>')
    .join('');
}

/* BUG FIX 1: template literal was truncated — r.activity ternary was never completed */
function buildSchedule(schedule) {
  if (!schedule || !schedule.length) return '';
  return schedule.map(block => `
    <div class="schedule-block">
      <div class="schedule-day">${escHtml(block.day)}</div>
      ${(block.rows || []).map(r => `
        <div class="schedule-row">
          <span class="s-time">${escHtml(r.time)}</span>
          ${r.activity ? `<span class="s-act">${escHtml(r.activity)}</span>` : ''}
        </div>`).join('')}
    </div>`).join('');
}

function buildTijden(tijden) {
  if (!tijden || !tijden.length) return '';
  return tijden.map(t => `
    <div class="info-row">
      <span class="ir-label">${escHtml(t.label)}</span>
      <span class="ir-value">${escHtml(t.tijd)}</span>
    </div>`).join('');
}

function buildAccCard(card, extraBody = '') {
  return `
    <div class="acc-card" onclick="toggleAcc(this)">
      <div class="acc-header">
        <div class="acc-icon ${escHtml(card.color)}"><i class="ti ${escHtml(card.icon)}"></i></div>
        <div class="acc-meta">
          <div class="acc-title">${escHtml(card.title)}</div>
          <div class="acc-sub">${escHtml(card.subtitle)}</div>
        </div>
        <i class="ti ti-chevron-down acc-chevron"></i>
      </div>
      <div class="acc-body"><div class="acc-body-inner">
        ${bodyToHtml(card.body)}
        ${extraBody}
      </div></div>
    </div>`;
}

/* ── UI STRINGS (language-aware) ─────────────────────────────── */
const UI = {
  nl: {
    questions:    'Vragen?',
    quickNav:     'Snel naar',
    team:         'Behandelteam',
    teamSub:      'Uw behandelaars',
    programma:    'Dagprogramma',
    programmaSub: 'Activiteiten & sport',
    regels:       'Regels & Visie',
    regelsSub:    'Huisregels afdeling',
    contact:      'Contact',
    contactSub:   'Nummers & tijden',
    infomap:      'Informatiemap',
    infomapTitle: 'Wat vindt u in deze gids?',
    infomapSub:   'Overzicht van alle onderwerpen',
    navHome:      'Home',
    navTeam:      'Team',
    navProgramma: 'Programma',
    navRegels:    'Regels',
    navContact:   'Contact',
    pageTeam:     'Behandelteam',
    pageProgramma:'Dagprogramma',
    pageRegels:   'Regels & Visie',
    pageContact:  'Contact',
  },
  en: {
    questions:    'Questions?',
    quickNav:     'Quick access',
    team:         'Treatment Team',
    teamSub:      'Your care providers',
    programma:    'Daily Programme',
    programmaSub: 'Activities & sport',
    regels:       'Rules & Vision',
    regelsSub:    'Ward guidelines',
    contact:      'Contact',
    contactSub:   'Numbers & hours',
    infomap:      'Information guide',
    infomapTitle: 'What will you find here?',
    infomapSub:   'Overview of all topics',
    navHome:      'Home',
    navTeam:      'Team',
    navProgramma: 'Programme',
    navRegels:    'Rules',
    navContact:   'Contact',
    pageTeam:     'Treatment Team',
    pageProgramma:'Daily Programme',
    pageRegels:   'Rules & Vision',
    pageContact:  'Contact',
  }
};

function t(key) {
  const lang = (typeof currentLang !== 'undefined') ? currentLang : 'nl';
  return (UI[lang] && UI[lang][key]) ? UI[lang][key] : (UI.nl[key] || key);
}

/* ── HOME ────────────────────────────────────────────────────── */
function renderHome(data) {
  const panel = document.getElementById('panel-home');
  panel.innerHTML = `
    <div class="home-hero">
      <div class="hero-icon"><i class="ti ti-heart-handshake"></i></div>
      <div class="hero-title">${escHtml(data.hero_title)}</div>
      <div class="hero-ward">${escHtml(data.hero_ward)}</div>
      <div class="hero-body">${escHtml(data.hero_body)}</div>
    </div>

    <div class="notice">
      <i class="ti ti-info-circle"></i>
      <p><strong>${t('questions')}</strong> ${escHtml(data.notice_text)}</p>
    </div>

    <div class="section-label">${t('quickNav')}</div>
    <div class="quick-grid">
      <div class="quick-tile qt-team" onclick="goTo('team')">
        <i class="ti ti-users qt-icon"></i>
        <div class="qt-label">${t('team')}</div><div class="qt-sub">${t('teamSub')}</div>
      </div>
      <div class="quick-tile qt-dag" onclick="goTo('dag')">
        <i class="ti ti-calendar-time qt-icon"></i>
        <div class="qt-label">${t('programma')}</div><div class="qt-sub">${t('programmaSub')}</div>
      </div>
      <div class="quick-tile qt-regels" onclick="goTo('regels')">
        <i class="ti ti-clipboard-list qt-icon"></i>
        <div class="qt-label">${t('regels')}</div><div class="qt-sub">${t('regelsSub')}</div>
      </div>
      <div class="quick-tile qt-contact" onclick="goTo('contact')">
        <i class="ti ti-phone qt-icon"></i>
        <div class="qt-label">${t('contact')}</div><div class="qt-sub">${t('contactSub')}</div>
      </div>
    </div>

    <div class="section-label">${t('infomap')}</div>
    <div class="acc-card" onclick="toggleAcc(this)">
      <div class="acc-header">
        <div class="acc-icon ic-sky"><i class="ti ti-folder-open"></i></div>
        <div class="acc-meta">
          <div class="acc-title">${t('infomapTitle')}</div>
          <div class="acc-sub">${t('infomapSub')}</div>
        </div>
        <i class="ti ti-chevron-down acc-chevron"></i>
      </div>
      <div class="acc-body"><div class="acc-body-inner">
        <p>${escHtml(data.infomap_body)}</p>
        <div class="tag-row">
          <span class="tag tag-pink"><i class="ti ti-users"></i> ${t('navTeam')}</span>
          <span class="tag tag-teal"><i class="ti ti-calendar"></i> ${t('navProgramma')}</span>
          <span class="tag tag-gold"><i class="ti ti-clipboard-list"></i> ${t('navRegels')}</span>
          <span class="tag tag-coral"><i class="ti ti-phone"></i> ${t('navContact')}</span>
        </div>
      </div></div>
    </div>`;
}

/* ── TEAM ────────────────────────────────────────────────────── */
function renderTeam(data) {
  const panel = document.getElementById('panel-team');

  const cards = data.cards.map(card => {
    let extra = '';
    if (card.id === 'begeleiders') {
      extra = `<h4>Zij helpen u onder andere met</h4>
        <div class="tag-row">
          <span class="tag tag-teal">Contact met familie</span>
          <span class="tag tag-sky">Dagbesteding</span>
          <span class="tag tag-purple">Inbreng bij overleg</span>
        </div>`;
    }
    return buildAccCard(card, extra);
  }).join('');

  panel.innerHTML = `<div class="page-title">${t('pageTeam')}</div>${cards}`;

  data.cards.forEach(card => {
    window.searchData.push({
      section: 'Team', tab: 'team', cls: 'sr-team',
      title: card.title,
      snippet: card.subtitle
    });
  });
}

/* ── PROGRAMMA ───────────────────────────────────────────────── */
function renderProgramma(data) {
  const panel = document.getElementById('panel-dag');

  const cards = data.cards.map(card => {
    let extra = '';
    if (card.modules_list && card.modules_list.length) {
      extra += `<div class="tag-row">${card.modules_list.map(m =>
        `<span class="tag tag-purple">${escHtml(m)}</span>`).join('')}</div>`;
    }
    extra += buildSchedule(card.schedule);
    return buildAccCard(card, extra);
  }).join('');

  panel.innerHTML = `<div class="page-title">${t('pageProgramma')}</div>${cards}`;

  data.cards.forEach(card => {
    const snippetParts = [];
    if (card.subtitle) snippetParts.push(card.subtitle);
    if (card.schedule && card.schedule.length) {
      const firstDay = card.schedule[0];
      snippetParts.push(firstDay.day + ': ' + firstDay.rows.map(r => r.time).join(', '));
    }
    window.searchData.push({
      section: 'Programma', tab: 'dag', cls: 'sr-dag',
      title: card.title,
      snippet: snippetParts.join(' — ')
    });
  });
}

/* ── REGELS ──────────────────────────────────────────────────── */
function renderRegels(data) {
  const panel = document.getElementById('panel-regels');

  const cards = data.cards.map(card => {
    let extra = '';

    /* Phases (visie card) */
    if (card.phases && card.phases.length) {
      const dotClasses = ['pd1', 'pd2', 'pd3', 'pd4'];
      extra += card.phases.map((phase, i) => `
        <div class="phase-step">
          <div class="phase-dot ${dotClasses[i] || 'pd1'}">${i + 1}</div>
          <div class="phase-content">
            <div class="phase-title">${escHtml(phase.title)}</div>
            <div class="phase-desc">${escHtml(phase.desc)}</div>
          </div>
        </div>`).join('');
    }

    /* Tijden rows */
    if (card.tijden && card.tijden.length) {
      extra += buildTijden(card.tijden);
    }

    /* Numbered rules list */
    if (card.rules && card.rules.length) {
      extra += `<div class="rule-list">${card.rules.map((rule, i) => `
        <div class="rule-item">
          <div class="rule-num">${i + 1}</div>
          <div class="rule-text">${escHtml(rule)}</div>
        </div>`).join('')}</div>`;
    }

    /* Warning box */
    if (card.warning) {
      extra += `<div class="warn-box">
        <i class="ti ti-alert-triangle"></i>
        <p>${escHtml(card.warning)}</p>
      </div>`;
    }

    return buildAccCard(card, extra);
  }).join('');

  panel.innerHTML = `<div class="page-title">${t('pageRegels')}</div>${cards}`;

  data.cards.forEach(card => {
    window.searchData.push({
      section: 'Regels', tab: 'regels', cls: 'sr-regels',
      title: card.title,
      snippet: card.subtitle
    });
  });
}

/* ── CONTACT ─────────────────────────────────────────────────── */
function renderContact(data) {
  const panel = document.getElementById('panel-contact');

  const persons = data.persons.map(p => {
    /* Avatar: show photo if avatar_image is set, otherwise fall back to initials circle */
    const avatarHtml = (p.avatar_image && p.avatar_image.trim())
      ? `<div class="avatar ${escHtml(p.avatar_color)} avatar-img">
           <img src="${escHtml(p.avatar_image.trim())}" alt="${escHtml(p.initials)}"
             onerror="this.parentElement.classList.remove('avatar-img');this.remove();">
         </div>`
      : `<div class="avatar ${escHtml(p.avatar_color)}">${escHtml(p.initials)}</div>`;
    return `
    <div class="contact-card">
      ${avatarHtml}
      <div>
        <div class="contact-name">${escHtml(p.name)}</div>
        <div class="contact-role">${escHtml(p.role)}</div>
        <div class="contact-info ${escHtml(p.info_color)}">
          <i class="ti ti-phone"></i>${escHtml(p.info)}
        </div>
      </div>
    </div>`;
  }).join('');

  /* Tijden accordion */
  const tijdenRows = data.tijden.map(t => `
    <div class="info-row">
      <span class="ir-label">${escHtml(t.label)}</span>
      <span class="ir-value">${escHtml(t.tijd)}</span>
    </div>`).join('');

  /* BUG FIX 2: tijden_note ternary was truncated — closing backtick and structure was missing */
  const tijdenAcc = `
    <div class="section-label" style="margin-top:16px">Tijden</div>
    <div class="acc-card" onclick="toggleAcc(this)">
      <div class="acc-header">
        <div class="acc-icon ic-coral"><i class="ti ti-clock-2"></i></div>
        <div class="acc-meta">
          <div class="acc-title">Bezoek- &amp; openingstijden</div>
          <div class="acc-sub">Bezoek en SOP</div>
        </div>
        <i class="ti ti-chevron-down acc-chevron"></i>
      </div>
      <div class="acc-body"><div class="acc-body-inner">
        ${tijdenRows}
        ${data.tijden_note ? `<p style="margin-top:10px;">${escHtml(data.tijden_note)}</p>` : ''}
      </div></div>
    </div>`;

  /* Emergency bar — only rendered when a number is configured */
  const emergencyBar = (data.emergency_number && data.emergency_number.trim())
    ? `<a class="emergency-bar" href="tel:${escHtml(data.emergency_number.trim())}">
        <span class="emergency-bar-pulse"></span>
        <i class="ti ti-phone-call emergency-bar-icon"></i>
        <span class="emergency-bar-label">${escHtml(data.emergency_label || 'Bel verpleegpost direct')}</span>
        <span class="emergency-bar-number">${escHtml(data.emergency_number.trim())}</span>
        <i class="ti ti-chevron-right emergency-bar-arrow"></i>
      </a>`
    : '';

  panel.innerHTML = `<div class="page-title">${t('pageContact')}</div>${emergencyBar}${persons}${tijdenAcc}`;

  data.persons.forEach(p => {
    window.searchData.push({
      section: 'Contact', tab: 'contact', cls: 'sr-contact',
      title: p.name,
      snippet: p.role + ' — ' + p.info
    });
  });
}

/* ── INIT: fetch all JSONs in parallel ───────────────────────── */
async function initApp() {
  /* Pick the right file suffix: '' (Dutch) or '.en' (English) */
  const s = (typeof getLangSuffix === 'function') ? getLangSuffix() : '';

  const errMsg = (s === '.en')
    ? 'Could not load content. Please check your connection and refresh.'
    : 'Kon de inhoud niet laden. Controleer uw verbinding en ververs de pagina.';

  try {
    const [home, team, programma, regels, contact] = await Promise.all([
      fetch(`./data/home${s}.json`).then(r => r.json()),
      fetch(`./data/team${s}.json`).then(r => r.json()),
      fetch(`./data/programma${s}.json`).then(r => r.json()),
      fetch(`./data/regels${s}.json`).then(r => r.json()),
      fetch(`./data/contact${s}.json`).then(r => r.json()),
    ]);

    renderHome(home);
    renderTeam(team);
    renderProgramma(programma);
    renderRegels(regels);
    renderContact(contact);

    /* Update bottom nav labels for current language */
    const navLabels = {
      'nav-home':    t('navHome'),
      'nav-team':    t('navTeam'),
      'nav-dag':     t('navProgramma'),
      'nav-regels':  t('navRegels'),
      'nav-contact': t('navContact'),
    };
    Object.entries(navLabels).forEach(([id, label]) => {
      const el = document.getElementById(id);
      if (el) el.querySelector('span').textContent = label;
    });

    /* Update search placeholder */
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.placeholder = (s === '.en') ? 'Search the guide…' : 'Zoek in de gids…';
    }

    /* Sync lang toggle button state */
    if (typeof updateLangToggle === 'function') updateLangToggle();

    /* Notify search.js that data is ready */
    window.dispatchEvent(new Event('searchDataReady'));

  } catch (err) {
    console.error('IVB render error:', err);
    document.querySelector('.panel.active').innerHTML = `
      <div class="notice" style="margin-top:24px;">
        <i class="ti ti-alert-triangle" style="color:var(--coral)"></i>
        <p>${errMsg}</p>
      </div>`;
  }
}

initApp();
