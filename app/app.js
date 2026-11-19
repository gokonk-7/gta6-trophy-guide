// Neon Leonida — GTA VI Trophy Guide & Tracker. Offline, no network, stdlib-free browser JS.
// State lives in localStorage under KEY; the trophy list comes from data/trophies.json.
const KEY = 'neon-leonida-gta6-trophies-v1';
const TOTAL_HOURS = 200;

let trophies = [];
let state = { earned: {}, notes: {}, spoiler: true };
let selectedId = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

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
  } catch (e) { /* corrupt save: start fresh */ }
}

function saveState() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isMasked(t) {
  return state.spoiler && t.hidden && !state.earned[t.id];
}

function gradeLabel(g) {
  return g.charAt(0).toUpperCase() + g.slice(1);
}

function kindLabel(k) {
  return { 'platinum': 'Platinum', 'completion': 'Completion', 'story': 'Story', 'activity': 'Activity', 'robbery': 'Robbery', 'collectible': 'Collectible', 'exploration': 'Exploration', 'combat': 'Combat', 'side-story': 'Side story', 'one-off': 'One-off', 'money': 'Money' }[k] || k;
}

function earnedCount() {
  return trophies.filter((t) => state.earned[t.id]).length;
}

function updateProgress() {
  const earned = earnedCount();
  const total = trophies.length || 55;
  $('#earnedCount').textContent = String(earned);
  $('#pct').textContent = Math.round((earned / total) * 100) + '%';
  $('#barFill').style.width = (earned / total) * 100 + '%';
  const hoursLeft = Math.round(TOTAL_HOURS * (total - earned) / total);
  $('#timeLeft').textContent = earned === total ? 'Platinum earned!' : '~' + hoursLeft + 'h to go';
  const byGrade = {};
  trophies.forEach((t) => {
    byGrade[t.grade] = byGrade[t.grade] || { got: 0, total: 0 };
    byGrade[t.grade].total += 1;
    if (state.earned[t.id]) byGrade[t.grade].got += 1;
  });
  $('#gradeBreakdown').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .filter((g) => byGrade[g])
    .map((g) => '<span class="grade-stat"><span class="badge ' + g + '">' + gradeLabel(g) + '</span> ' + byGrade[g].got + '/' + byGrade[g].total + '</span>')
    .join('');
}

function currentFilter() {
  return {
    q: ($('#search').value || '').trim().toLowerCase(),
    grade: $('#fGrade').value,
    kind: $('#fKind').value,
    status: $('#fStatus').value,
  };
}

function matches(t, f) {
  if (f.grade && t.grade !== f.grade) return false;
  if (f.kind && t.kind !== f.kind) return false;
  if (f.status === 'earned' && !state.earned[t.id]) return false;
  if (f.status === 'remaining' && state.earned[t.id]) return false;
  if (f.status === 'missable' && !t.missable) return false;
  if (f.q) {
    const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
    if (!hay.includes(f.q)) return false;
  }
  return true;
}

function renderList() {
  const f = currentFilter();
  const shown = trophies.filter((t) => matches(t, f));
  $('#listCount').textContent = shown.length + ' of ' + trophies.length;
  $('#trophyList').innerHTML = shown.map((t) => {
    const earned = !!state.earned[t.id];
    const masked = isMasked(t);
    const name = masked ? 'Hidden trophy' : esc(t.name);
    const desc = masked ? 'Hidden trophy — earn it to reveal' : esc(t.description);
    const chips = '<span class="badge ' + t.grade + '">' + gradeLabel(t.grade) + '</span>'
      + '<span class="chip">' + kindLabel(t.kind) + '</span>'
      + (t.hidden ? '<span class="chip">Hidden</span>' : '')
      + (t.missable ? '<span class="chip missable-chip">Missable</span>' : '')
      + (t.target ? '<span class="chip">Target: ' + t.target.count + ' ' + esc(t.target.label) + '</span>' : '');
    return '<li class="trophy' + (earned ? ' earned' : '') + '" data-id="' + t.id + '">'
      + '<input type="checkbox"' + (earned ? ' checked' : '') + ' aria-label="Mark ' + (masked ? 'hidden trophy' : esc(t.name)) + ' as earned">'
      + '<div class="t-info"><span class="trophy-name">' + name + '</span>'
      + '<span class="trophy-desc">' + desc + '</span>'
      + '<span class="chips">' + chips + '</span></div></li>';
  }).join('');
}

function renderDetail() {
  const box = $('#detail');
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    box.innerHTML = '<h3>Select a trophy</h3><p class="detail-empty">Click any trophy in the list to read its full guide, its target, when it can be missed, and its sources.</p>';
    return;
  }
  if (isMasked(t)) {
    box.innerHTML = '<h3>Hidden trophy</h3>'
      + '<p class="detail-empty">Hidden trophy — earn it to reveal. Turn the spoiler setting off to see its name and guide.</p>';
    return;
  }
  const note = state.notes[t.id] || '';
  box.innerHTML = '<h3>' + esc(t.name) + '</h3>'
    + '<p class="detail-meta"><span class="badge ' + t.grade + '">' + gradeLabel(t.grade) + '</span>'
    + '<span class="chip">' + kindLabel(t.kind) + '</span>'
    + (t.hidden ? '<span class="chip">Hidden</span>' : '')
    + (t.target ? '<span class="chip">Target: ' + t.target.count + ' ' + esc(t.target.label) + '</span>' : '') + '</p>'
    + '<p class="detail-desc">' + esc(t.description) + '</p>'
    + (t.missable ? '<p class="missable-warn">⚠ Possibly missable — read the Missables tab before you play past Chapter 1.</p>' : '')
    + '<h4>Guide</h4><p class="guide">' + esc(t.guide) + '</p>'
    + '<h4>Sources</h4><ul class="sources">'
    + t.sources.map((s) => '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a></li>').join('')
    + '</ul>'
    + '<h4>Your note</h4><textarea aria-label="Note for ' + esc(t.name) + '" placeholder="Your own note for this trophy…">' + esc(note) + '</textarea>';
  const ta = box.querySelector('textarea');
  ta.addEventListener('input', () => {
    if (ta.value) state.notes[t.id] = ta.value;
    else delete state.notes[t.id];
    saveState();
  });
}

// Roadmap phases: 1 story, 2 the 100% grind, 3 strangers & clean-up.
const PHASES = {
  1: [3, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  2: [2, 4, 5, 6, 8, 9, 26, 28, 29, 33, 36, 40, 41],
  3: [1, 7, 21, 22, 23, 24, 25, 27, 30, 31, 32, 34, 35, 37, 38, 39, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
};

function renderRoadmap() {
  Object.keys(PHASES).forEach((key) => {
    const phase = document.querySelector('.phase[data-phase="' + key + '"]');
    if (!phase) return;
    const ids = PHASES[key];
    const got = ids.filter((id) => state.earned[id]).length;
    phase.querySelector('.phase-count').textContent = got + '/' + ids.length;
    phase.querySelector('.phase-fill').style.width = (got / ids.length) * 100 + '%';
    phase.querySelector('.phase-list').innerHTML = ids.map((id) => {
      const t = trophies.find((x) => x.id === id);
      if (!t) return '';
      return '<li class="' + (state.earned[id] ? 'earned' : '') + '">' + (state.earned[id] ? '✓ ' : '○ ') + esc(t.name) + ' <span class="badge ' + t.grade + '">' + gradeLabel(t.grade) + '</span></li>';
    }).join('');
  });
}

function plannerReason(t) {
  if (t.id === 32) return 'Do the Chapter 1 balcony meditation before Chapter 1 ends — the only possibly-missable trophy.';
  if (t.id === 7) return 'Do Yago’s race the moment it appears in Chapter 3 — it is time-sensitive.';
  if (t.story) return 'Story trophy — comes from playing the main missions in order.';
  if (t.kind === 'side-story') return 'Side-story finale — finish the strand for ' + esc(t.name) + '.';
  if (t.target) return 'Open-world goal — target: ' + t.target.count + ' ' + esc(t.target.label) + '.';
  return 'Open-world goal — available after the story.';
}

function renderPlanner() {
  const remaining = trophies.filter((t) => !state.earned[t.id]);
  const rank = (t) => {
    if (t.id === 32) return 0;
    if (t.id === 7) return 1;
    if (t.story) return 2;
    if (t.kind === 'side-story') return 3;
    return 4;
  };
  remaining.sort((a, b) => (rank(a) - rank(b)) || (a.id - b.id));
  document.querySelector('.nextup').innerHTML = remaining.length
    ? remaining.map((t) => '<li><strong>' + esc(t.name) + '</strong> <span class="badge ' + t.grade + '">' + gradeLabel(t.grade) + '</span><br><span class="nextup-reason">' + plannerReason(t) + '</span></li>').join('')
    : '<li>All 55 earned — Vice Got a Price! is yours. Leonida Legend.</li>';
}

function renderAll() {
  updateProgress();
  renderList();
  renderRoadmap();
  renderPlanner();
  if (selectedId) renderDetail();
}

function switchTab(name) {
  $$('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  $$('.tab-panel').forEach((p) => { p.hidden = p.id !== 'tab-' + name; });
}

function exportSave() {
  const payload = { app: 'neon-leonida-gta6-trophies-v1', version: 1, earned: state.earned, notes: state.notes, spoiler: state.spoiler };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'neon-leonida-save.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  $('#saveStatus').textContent = 'Exported ' + Object.keys(state.earned).length + ' earned trophies.';
}

function importSave(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object' || !data.earned || typeof data.earned !== 'object') throw new Error('bad shape');
      state.earned = data.earned;
      if (data.notes && typeof data.notes === 'object') state.notes = data.notes;
      if (typeof data.spoiler === 'boolean') { state.spoiler = data.spoiler; $('#spoiler').checked = data.spoiler; }
      saveState();
      renderAll();
      $('#saveStatus').textContent = 'Imported ' + Object.keys(state.earned).length + ' earned trophies.';
    } catch (e) {
      $('#saveStatus').textContent = 'That file is not a valid Neon Leonida save file.';
    }
  };
  reader.readAsText(file);
}

async function init() {
  loadState();
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  trophies = data.trophies || data;
  $('#spoiler').checked = state.spoiler;

  $('#trophyList').addEventListener('change', (e) => {
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    const id = Number(li.dataset.id);
    if (e.target.checked) state.earned[id] = true;
    else delete state.earned[id];
    saveState();
    renderAll();
  });
  $('#trophyList').addEventListener('click', (e) => {
    if (e.target.matches('input[type="checkbox"]')) return;
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    selectedId = Number(li.dataset.id);
    renderDetail();
  });
  $('#search').addEventListener('input', renderList);
  $('#fGrade').addEventListener('change', renderList);
  $('#fKind').addEventListener('change', renderList);
  $('#fStatus').addEventListener('change', renderList);
  $('#spoiler').addEventListener('change', (e) => {
    state.spoiler = e.target.checked;
    saveState();
    renderAll();
  });
  $$('.tabs button').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  $('#exportBtn').addEventListener('click', exportSave);
  $('#resetBtn').addEventListener('click', () => {
    if (!window.confirm('Reset all progress and notes? This cannot be undone.')) return;
    state.earned = {};
    state.notes = {};
    selectedId = null;
    saveState();
    renderAll();
    $('#saveStatus').textContent = 'Progress reset.';
  });
  $('#importFile').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) importSave(e.target.files[0]);
    e.target.value = '';
  });
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === '/') { e.preventDefault(); $('#search').focus(); }
    const tabs = ['checklist', 'roadmap', 'missables', 'planner', 'save'];
    if (['1', '2', '3', '4', '5'].includes(e.key)) switchTab(tabs[Number(e.key) - 1]);
  });

  renderAll();
}

init();
