// Neon Leonida — GTA VI trophy guide & tracker. Static, offline, no network.
// State lives in localStorage under KEY; the trophy list comes from data/trophies.json.
const KEY = 'neon-leonida-gta6-trophies-v1';
const TOTAL_HOURS = 200;

let trophies = [];
let state = { earned: {}, notes: {}, spoiler: true };
let selectedId = null;

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      if (parsed.earned && typeof parsed.earned === 'object') state.earned = parsed.earned;
      if (parsed.notes && typeof parsed.notes === 'object') state.notes = parsed.notes;
      if (typeof parsed.spoiler === 'boolean') state.spoiler = parsed.spoiler;
    }
  } catch (e) { /* a corrupt save starts fresh */ }
}

function saveState() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function $(id) { return document.getElementById(id); }

function earnedCount() {
  return trophies.filter((t) => state.earned[t.id]).length;
}

function isMasked(t) {
  return state.spoiler && (t.hidden || t.story) && !state.earned[t.id];
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return kind.replace('-', ' ');
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

// ---------------------------------------------------------------- list

function matchesFilters(t) {
  const grade = $('fGrade').value;
  const kind = $('fKind').value;
  const status = $('fStatus').value;
  const q = $('search').value.trim().toLowerCase();
  if (grade && t.grade !== grade) return false;
  if (kind && t.kind !== kind) return false;
  if (status === 'earned' && !state.earned[t.id]) return false;
  if (status === 'remaining' && state.earned[t.id]) return false;
  if (status === 'missable' && !t.missable) return false;
  if (q) {
    const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.kind).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderList() {
  const list = $('trophyList');
  list.innerHTML = '';
  const visible = trophies.filter(matchesFilters);
  for (const t of visible) {
    const li = el('li', 'trophy' + (state.earned[t.id] ? ' earned' : '') + (selectedId === t.id ? ' selected' : ''));
    li.dataset.id = String(t.id);

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = !!state.earned[t.id];
    box.setAttribute('aria-label', 'Earned: ' + t.name);
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) state.earned[t.id] = true;
      else delete state.earned[t.id];
      saveState();
      renderAll();
    });
    li.appendChild(box);

    const body = el('div', 'trophy-body');
    const masked = isMasked(t);
    body.appendChild(el('div', 'trophy-name', masked ? 'Hidden trophy' : t.name));
    body.appendChild(el('div', 'trophy-desc', masked ? 'Hidden trophy — earn it to reveal.' : t.description));
    const meta = el('div', 'trophy-meta');
    meta.appendChild(el('span', 'badge ' + t.grade, gradeLabel(t.grade)));
    meta.appendChild(el('span', 'chip', kindLabel(t.kind)));
    if (t.story) meta.appendChild(el('span', 'chip', 'Story'));
    if (t.hidden) meta.appendChild(el('span', 'chip hidden-chip', 'Hidden'));
    if (t.missable) meta.appendChild(el('span', 'chip missable', 'Possibly missable'));
    if (t.target) meta.appendChild(el('span', 'chip', t.target.count + ' ' + t.target.label));
    body.appendChild(meta);
    li.appendChild(body);

    li.addEventListener('click', () => {
      selectedId = t.id;
      renderList();
      renderDetail();
    });
    list.appendChild(li);
  }
  $('listCount').textContent = visible.length + ' of 55 trophies';
}

// ---------------------------------------------------------------- progress

function renderProgress() {
  const earned = earnedCount();
  const pct = Math.round((earned / trophies.length) * 100);
  $('earnedCount').textContent = String(earned);
  $('pct').textContent = pct + '%';
  $('barFill').style.width = pct + '%';
  $('barWrap').setAttribute('aria-valuenow', String(earned));
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] || { total: 0, got: 0 };
    byGrade[t.grade].total++;
    if (state.earned[t.id]) byGrade[t.grade].got++;
  }
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map(
    (g) => gradeLabel(g) + ' ' + byGrade[g].got + '/' + byGrade[g].total
  );
  $('gradeBreak').textContent = parts.join(' · ');
  const left = Math.round((TOTAL_HOURS * (trophies.length - earned)) / trophies.length);
  $('eta').textContent = earned === trophies.length
    ? 'Platinum earned — Leonida Legend.'
    : 'About ' + left + 'h left of ~' + TOTAL_HOURS + 'h to the platinum.';
}

// ---------------------------------------------------------------- detail

function renderDetail() {
  const pane = $('detail');
  pane.innerHTML = '';
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    pane.appendChild(el('p', 'detail-empty', 'Pick a trophy to see its full guide, target and sources.'));
    return;
  }
  if (isMasked(t)) {
    pane.appendChild(el('h3', null, 'Hidden trophy'));
    pane.appendChild(el('p', 'detail-desc', 'Hidden trophy — earn it to reveal.'));
    pane.appendChild(el('p', 'detail-guide', 'This trophy is hidden on PlayStation until you earn it. Turn spoiler-safe off in the checklist to peek — or just play and let it surprise you.'));
    return;
  }
  pane.appendChild(el('h3', null, t.name));
  pane.appendChild(el('p', 'detail-desc', t.description));
  const meta = el('div', 'trophy-meta');
  meta.appendChild(el('span', 'badge ' + t.grade, gradeLabel(t.grade)));
  meta.appendChild(el('span', 'chip', kindLabel(t.kind)));
  if (t.story) meta.appendChild(el('span', 'chip', 'Story'));
  if (t.hidden) meta.appendChild(el('span', 'chip hidden-chip', 'Hidden'));
  if (t.missable) meta.appendChild(el('span', 'chip missable', 'Possibly missable'));
  pane.appendChild(meta);
  if (t.target) {
    pane.appendChild(el('span', 'target', 'Target: ' + t.target.count + ' ' + t.target.label));
  }
  if (t.missable) {
    pane.appendChild(el('p', 'missable-note', 'Possibly missable — read the Missables tab before you pass Chapter 1.'));
  }
  if (t.guide.indexOf('Not yet pinned down') === 0) {
    pane.appendChild(el('p', 'unconfirmed', 'Not yet pinned down — the exact steps are unconfirmed, so this guide gives only the best reading of the official description and invents nothing.'));
  }
  pane.appendChild(el('p', 'detail-guide', t.guide));
  const noteLabel = el('label', null, 'Your note');
  const note = document.createElement('textarea');
  note.value = state.notes[t.id] || '';
  note.placeholder = 'e.g. where you left off…';
  note.addEventListener('input', () => {
    if (note.value.trim()) state.notes[t.id] = note.value;
    else delete state.notes[t.id];
    saveState();
  });
  noteLabel.appendChild(note);
  pane.appendChild(noteLabel);
  const srcTitle = el('p', null, 'Sources');
  srcTitle.style.fontWeight = '700';
  pane.appendChild(srcTitle);
  const srcList = el('ul', 'sources');
  for (const s of t.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.label;
    a.target = '_blank';
    a.rel = 'noopener';
    li.appendChild(a);
    srcList.appendChild(li);
  }
  pane.appendChild(srcList);
}

// ---------------------------------------------------------------- roadmap

function phaseCount(ids) {
  return ids.filter((id) => state.earned[id]).length + '/' + ids.length;
}

function renderRoadmap() {
  const wrap = $('roadmap');
  wrap.innerHTML = '';
  const story = trophies.filter((t) => t.story).map((t) => t.id);
  const cleanup = trophies.filter((t) => !t.story && (t.kind === 'side-story' || t.kind === 'one-off' || t.kind === 'platinum')).map((t) => t.id);
  const grind = trophies.filter((t) => !t.story && !cleanup.includes(t.id)).map((t) => t.id);
  const phases = [
    {
      title: 'Phase 1 — Story',
      ids: story,
      text: 'Play the story, chapter by chapter. Save at the start of every chapter, do Lucia\u2019s balcony meditation before Chapter 1 ends, and keep a save from just before the final mission.',
    },
    {
      title: 'Phase 2 — The 100% grind',
      ids: grind,
      text: 'A Long Road and everything under it: 250 stunts, 42 Shooting Range golds, 8 vaults, 39 gang operations, 15 Target Decks, 100 WAiNK scans, 200 vehicle scans and 100 animal studies. Most of it is open after the story.',
    },
    {
      title: 'Phase 3 — Strangers & clean-up',
      ids: cleanup,
      text: 'The 8 stranger strands, the six side-story finales, the one-offs, and the platinum itself. Do Yago\u2019s race the moment it appears in Chapter 3 — it is the only time-sensitive strand.',
    },
  ];
  for (const p of phases) {
    const div = el('div', 'phase');
    div.appendChild(el('h3', null, p.title));
    div.appendChild(el('p', 'phase-count', phaseCount(p.ids) + ' earned'));
    div.appendChild(el('p', null, p.text));
    const bar = el('div', 'bar');
    const fill = el('div', 'bar-fill');
    fill.style.width = Math.round((p.ids.filter((id) => state.earned[id]).length / p.ids.length) * 100) + '%';
    bar.appendChild(fill);
    div.appendChild(bar);
    wrap.appendChild(div);
  }
}

// ---------------------------------------------------------------- planner

function plannerReason(t) {
  if (t.id === 32) return 'Do it before Chapter 1 ends — the balcony meditation spot disappears.';
  if (t.id === 7) return 'Includes Yago\u2019s race in Chapter 3 — do it the moment the hourglass appears.';
  if (t.story) return 'Story trophy — comes naturally as you play the next chapter.';
  if (t.kind === 'side-story') return 'Side-story finale — start the strand as soon as its contact texts you.';
  if (t.target) return 'Grind it in small sessions — ' + t.target.count + ' ' + t.target.label + ' in total.';
  return 'Quick one-off — grab it when you are nearby.';
}

function renderPlanner() {
  const list = $('nextup');
  list.innerHTML = '';
  const remaining = trophies.filter((t) => !state.earned[t.id]);
  const rank = (t) => {
    if (t.id === 32) return 0;
    if (t.id === 7) return 1;
    if (t.story) return 2;
    if (t.kind === 'side-story') return 3;
    return 4;
  };
  remaining.sort((a, b) => rank(a) - rank(b) || a.id - b.id);
  for (const t of remaining.slice(0, 10)) {
    const li = document.createElement('li');
    li.appendChild(el('b', null, isMasked(t) ? 'Hidden trophy' : t.name));
    li.appendChild(el('span', null, plannerReason(t)));
    list.appendChild(li);
  }
  if (remaining.length === 0) {
    const li = document.createElement('li');
    li.appendChild(el('b', null, 'Platinum earned'));
    li.appendChild(el('span', null, 'All 55 trophies done — Leonida Legend.'));
    list.appendChild(li);
  }
}

// ---------------------------------------------------------------- tabs & keys

const TAB_ORDER = ['checklist', 'roadmap', 'missables', 'planner', 'save'];

function showTab(name) {
  for (const n of TAB_ORDER) {
    $('tab-' + n).classList.toggle('active', n === name);
  }
  document.querySelectorAll('.tabs button').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  if (name === 'planner') renderPlanner();
  if (name === 'roadmap') renderRoadmap();
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderPlanner();
}

// ---------------------------------------------------------------- save tab

function exportProgress() {
  const data = { app: 'neon-leonida-gta6', version: 1, earned: state.earned, notes: state.notes };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'neon-leonida-gta6-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('saveStatus').textContent = 'Exported ' + earnedCount() + ' earned trophies.';
}

function importProgress(file) {
  file.text().then((text) => {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      $('saveStatus').textContent = 'That file is not a valid Neon Leonida export.';
      return;
    }
    if (!parsed || typeof parsed !== 'object' || !parsed.earned || typeof parsed.earned !== 'object') {
      $('saveStatus').textContent = 'That file is not a valid Neon Leonida export.';
      return;
    }
    const validIds = new Set(trophies.map((t) => String(t.id)));
    const earned = {};
    let n = 0;
    for (const [id, v] of Object.entries(parsed.earned)) {
      if (validIds.has(id) && v) {
        earned[id] = true;
        n++;
      }
    }
    const notes = {};
    if (parsed.notes && typeof parsed.notes === 'object') {
      for (const [id, v] of Object.entries(parsed.notes)) {
        if (validIds.has(id) && typeof v === 'string') notes[id] = v;
      }
    }
    state.earned = earned;
    state.notes = notes;
    saveState();
    renderAll();
    $('saveStatus').textContent = 'Imported ' + n + ' earned trophies from backup.';
  }).catch(() => {
    $('saveStatus').textContent = 'That file is not a valid Neon Leonida export.';
  });
}

// ---------------------------------------------------------------- boot

loadState();
$('spoiler').checked = state.spoiler;

document.querySelectorAll('.tabs button').forEach((b) => {
  b.addEventListener('click', () => showTab(b.dataset.tab));
});
$('search').addEventListener('input', renderList);
$('fGrade').addEventListener('change', renderList);
$('fKind').addEventListener('change', renderList);
$('fStatus').addEventListener('change', renderList);
$('spoiler').addEventListener('change', () => {
  state.spoiler = $('spoiler').checked;
  saveState();
  renderAll();
});
$('exportBtn').addEventListener('click', exportProgress);
$('importFile').addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) importProgress(file);
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (window.confirm('Reset all progress and notes?')) {
    state.earned = {};
    state.notes = {};
    saveState();
    renderAll();
    $('saveStatus').textContent = 'Progress reset.';
  }
});
document.addEventListener('keydown', (e) => {
  const tag = (e.target && e.target.tagName) || '';
  if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
    e.preventDefault();
    $('search').focus();
  }
  if ((e.key >= '1' && e.key <= '5') && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
    showTab(TAB_ORDER[Number(e.key) - 1]);
  }
});

fetch('data/trophies.json')
  .then((r) => r.json())
  .then((data) => {
    trophies = data.trophies;
    renderAll();
  })
  .catch(() => {
    $('trophyList').innerHTML = '<li class="trophy">Could not load data/trophies.json.</li>';
  });
