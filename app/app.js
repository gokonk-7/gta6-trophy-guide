'use strict';
/* Neon Leonida — GTA VI Trophy Guide & Tracker. Static, offline, no network at run time
   beyond fetching its own data file. Progress lives in localStorage. */

const STORE_KEY = 'neon-leonida-gta6-trophies-v1';
const TOTAL = 55;
const TOTAL_HOURS = 200;
const GRADE_WEIGHT = { platinum: 0, gold: 15, silver: 6, bronze: 2 };

const PHASES = [
  {
    name: 'Phase 1 — Story first',
    blurb: 'Play the story in order and bank the 12 story trophies. Keep one save at the start of every chapter, plus one before the final mission — there is no mission replay and no New Game+.',
    ids: [3, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  },
  {
    name: 'Phase 2 — The 100% grind',
    blurb: 'A Long Road and the big counters: 250 stunts, 42 Shooting Range golds, 5 bank vaults, 39 gang operations, 14 drone-race locations, 100 WAiNK scans. The Progress menu is your checklist — chip away at it after the story.',
    ids: [2, 4, 5, 6, 8, 9, 27, 28, 29, 33, 36, 40, 41, 42, 44, 45],
  },
  {
    name: 'Phase 3 — Strangers & clean-up',
    blurb: 'The eight stranger strands, the six side-story finales, the one-offs — and the platinum itself, which pops when the last straggler falls. Yago\u2019s race and the Chapter 1 balcony meditation belong earlier; everything here can wait until after the story.',
    ids: [1, 7, 21, 22, 23, 24, 25, 26, 30, 31, 32, 34, 35, 37, 38, 39, 43, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
  },
];

const PLANNER_REASONS = {
  activity: 'Grind it in free-roam between missions.',
  robbery: 'Robbery — plan the escape before you strike.',
  collectible: 'Collect as you explore; mop up with the tracker.',
  exploration: 'Exploration — fold it into your travels.',
  combat: 'Combat — best attempted during gang operations.',
  'side-story': 'Finish this stranger\u2019s strand.',
  'one-off': 'One-off — quick to grab when you are nearby.',
  money: 'Money — grows on its own as you play; spend to finish it.',
  completion: 'The big one — the 100% checklist, built up over the whole game.',
  platinum: 'The payoff — earned when everything else is done.',
};

let trophies = [];
let state = { earned: {}, notes: {}, spoiler: true };
let selectedId = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
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
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isEarned(t) { return !!state.earned[t.id]; }
function isMasked(t) { return state.spoiler && (t.hidden || t.story) && !isEarned(t); }
function gradeLabel(g) { return g.charAt(0).toUpperCase() + g.slice(1); }

function displayName(t) { return isMasked(t) ? 'Hidden trophy' : t.name; }
function displayDesc(t) { return isMasked(t) ? 'Hidden trophy — earn it to reveal' : t.description; }

function earnedCount() { return trophies.filter(isEarned).length; }

function renderProgress() {
  const earned = earnedCount();
  const pct = Math.round((earned / TOTAL) * 100);
  document.getElementById('earnedCount').textContent = String(earned);
  document.getElementById('pct').textContent = pct + '%';
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(earned));
  document.getElementById('progressFill').style.width = pct + '%';
  const breakdown = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => {
      const total = trophies.filter((t) => t.grade === g).length;
      const got = trophies.filter((t) => t.grade === g && isEarned(t)).length;
      return gradeLabel(g) + ' ' + got + '/' + total;
    })
    .join(' · ');
  document.getElementById('gradeBreakdown').textContent = breakdown;
  let remainingWeight = 0;
  let totalWeight = 0;
  for (const t of trophies) {
    const w = GRADE_WEIGHT[t.grade] || 0;
    totalWeight += w;
    if (!isEarned(t)) remainingWeight += w;
  }
  const hours = totalWeight === 0 ? 0 : Math.round((TOTAL_HOURS * remainingWeight) / totalWeight);
  document.getElementById('timeLeft').textContent =
    earned === TOTAL ? 'platinum earned — Leonida Legend!' : 'about ' + hours + ' hours to go';
}

function currentFilters() {
  return {
    q: document.getElementById('search').value.trim().toLowerCase(),
    grade: document.getElementById('fGrade').value,
    kind: document.getElementById('fKind').value,
    status: document.getElementById('fStatus').value,
  };
}

function trophyMatches(t, f) {
  if (f.grade && t.grade !== f.grade) return false;
  if (f.kind && t.kind !== f.kind) return false;
  if (f.status === 'earned' && !isEarned(t)) return false;
  if (f.status === 'remaining' && isEarned(t)) return false;
  if (f.status === 'missable' && !t.missable) return false;
  if (f.q) {
    const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
    if (!hay.includes(f.q)) return false;
  }
  return true;
}

function renderList() {
  const f = currentFilters();
  const list = document.getElementById('trophyList');
  const shown = trophies.filter((t) => trophyMatches(t, f));
  document.getElementById('listCount').textContent = shown.length + ' of ' + TOTAL + ' trophies';
  list.innerHTML = shown
    .map((t) => {
      const earned = isEarned(t);
      const masked = isMasked(t);
      const target = t.target
        ? '<span class="target-chip">' + esc(t.target.count.toLocaleString('en-US')) + ' ' + esc(t.target.label) + '</span>'
        : '';
      const miss = t.missable ? '<span class="flag">Missable</span>' : '';
      const hid = t.hidden && !earned ? '<span class="hidden-chip">Hidden</span>' : '';
      const kind = '<span class="kind-chip">' + esc(t.kind) + '</span>';
      return (
        '<li class="trophy' + (earned ? ' earned' : '') + (selectedId === t.id ? ' selected' : '') + '" data-id="' + t.id + '">' +
        '<label class="check"><input type="checkbox"' + (earned ? ' checked' : '') + ' aria-label="Mark ' + esc(displayName(t)) + ' as earned"><span class="box" aria-hidden="true"></span></label>' +
        '<div class="trophy-body"><div class="trophy-top"><span class="trophy-name">' + esc(displayName(t)) + '</span>' +
        '<span class="grade grade-' + t.grade + '">' + gradeLabel(t.grade) + '</span>' + miss + hid + kind + '</div>' +
        '<p class="trophy-desc">' + esc(displayDesc(t)) + '</p>' + target + '</div></li>'
      );
    })
    .join('');
}

function renderDetail() {
  const pane = document.getElementById('detail');
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    pane.innerHTML =
      '<h3>Pick a trophy</h3>' +
      '<p class="detail-empty">Click any trophy in the list to see its full guide here: what to do, where and how, when it can be missed, and the sources behind each step.</p>';
    return;
  }
  const masked = isMasked(t);
  const earned = isEarned(t);
  let html = '<h3>' + esc(displayName(t)) + '</h3>';
  html += '<p class="detail-meta"><span class="grade grade-' + t.grade + '">' + gradeLabel(t.grade) + '</span> ';
  html += '<span class="kind-chip">' + esc(t.kind) + '</span> ';
  if (t.missable) html += '<span class="flag">Missable</span> ';
  if (t.hidden && !earned) html += '<span class="hidden-chip">Hidden</span> ';
  html += '<span class="earned-state">' + (earned ? '✓ Earned' : 'Not earned yet') + '</span></p>';
  html += '<p class="detail-desc">' + esc(displayDesc(t)) + '</p>';
  if (t.target) {
    html += '<p class="detail-target">Target: <strong>' + esc(t.target.count.toLocaleString('en-US')) + ' ' + esc(t.target.label) + '</strong></p>';
  }
  if (t.missable) {
    html += '<p class="missable-warning">⚠ Possibly missable — read the Missables tab before you finish Chapter 1.</p>';
  }
  if (masked) {
    html += '<p class="detail-guide">Hidden trophy — earn it to reveal its guide.</p>';
  } else {
    html += '<p class="detail-guide">' + esc(t.guide) + '</p>';
  }
  if (!masked && t.sources && t.sources.length) {
    html += '<h4>Sources</h4><ul class="detail-sources">' +
      t.sources.map((s) => '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a></li>').join('') +
      '</ul>';
  }
  html += '<h4>Your note</h4><textarea aria-label="Note for ' + esc(displayName(t)) + '" placeholder="Your own notes for this trophy — saved in this browser.">' +
    esc(state.notes[t.id] || '') + '</textarea>';
  pane.innerHTML = html;
  const ta = pane.querySelector('textarea');
  ta.addEventListener('input', () => {
    const v = ta.value.trim();
    if (v) state.notes[t.id] = v;
    else delete state.notes[t.id];
    saveState();
  });
}

function renderRoadmap() {
  const wrap = document.getElementById('phases');
  wrap.innerHTML = PHASES.map((phase) => {
    const members = phase.ids.map((id) => trophies.find((t) => t.id === id)).filter(Boolean);
    const got = members.filter(isEarned).length;
    const pct = members.length ? Math.round((got / members.length) * 100) : 0;
    const chips = members
      .map((t) => '<li class="' + (isEarned(t) ? 'done' : '') + '">' + esc(displayName(t)) + '</li>')
      .join('');
    return (
      '<div class="phase"><h3>' + esc(phase.name) + ' <span class="phase-count">' + got + '/' + members.length + '</span></h3>' +
      '<div class="bar small"><span style="width:' + pct + '%"></span></div>' +
      '<p>' + esc(phase.blurb) + '</p><ul class="phase-list">' + chips + '</ul></div>'
    );
  }).join('');
}

function plannerRank(t) {
  if (t.missable) return 0;
  if (t.id === 7) return 1;
  if (t.story) return 2 + t.id / 1000;
  if (t.kind === 'side-story') return 3 + t.id / 1000;
  return 4 + t.id / 1000;
}

function plannerReason(t) {
  if (t.missable) return 'Possibly missable — do it before you leave Chapter 1.';
  if (t.id === 7) return 'Yago\u2019s race is time-sensitive in Chapter 3 — do it the moment it appears.';
  if (t.story) return 'Story — next in chapter order.';
  return PLANNER_REASONS[t.kind] || 'Chase it when you are nearby.';
}

function renderPlanner() {
  const remaining = trophies.filter((t) => !isEarned(t)).sort((a, b) => plannerRank(a) - plannerRank(b));
  const top = remaining.slice(0, 12);
  document.getElementById('nextUp').innerHTML = top
    .map((t) => {
      const target = t.target ? ' — ' + t.target.count.toLocaleString('en-US') + ' ' + t.target.label : '';
      return '<li><strong>' + esc(displayName(t)) + '</strong> <span class="grade grade-' + t.grade + '">' + gradeLabel(t.grade) + '</span>' +
        '<span class="next-reason">' + esc(plannerReason(t)) + esc(target) + '</span></li>';
    })
    .join('');
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderPlanner();
}

function switchTab(name) {
  document.querySelectorAll('nav.tabs button[data-tab]').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  document.querySelectorAll('main section.tab').forEach((s) => {
    s.classList.toggle('active', s.id === 'tab-' + name);
  });
}

function exportSave() {
  const payload = { app: 'neon-leonida-gta6-trophies', version: 1, earned: state.earned, notes: state.notes, spoiler: state.spoiler };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'neon-leonida-save.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  document.getElementById('saveStatus').textContent =
    'Exported ' + Object.keys(state.earned).length + ' earned trophies.';
}

function importSave(file) {
  const status = document.getElementById('saveStatus');
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed || typeof parsed !== 'object' || !parsed.earned || typeof parsed.earned !== 'object') {
        throw new Error('bad save');
      }
      state.earned = parsed.earned;
      state.notes = parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {};
      if (typeof parsed.spoiler === 'boolean') state.spoiler = parsed.spoiler;
      saveState();
      document.getElementById('spoiler').checked = state.spoiler;
      renderAll();
      status.textContent = 'Imported ' + Object.keys(state.earned).length + ' earned trophies.';
    } catch (e) {
      status.textContent = 'That file is not a valid Neon Leonida save file.';
    }
  };
  reader.readAsText(file);
}

function init() {
  loadState();
  document.getElementById('spoiler').checked = state.spoiler;

  document.querySelectorAll('nav.tabs button[data-tab]').forEach((b) => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });

  document.getElementById('search').addEventListener('input', renderList);
  document.getElementById('fGrade').addEventListener('change', renderList);
  document.getElementById('fKind').addEventListener('change', renderList);
  document.getElementById('fStatus').addEventListener('change', renderList);
  document.getElementById('spoiler').addEventListener('change', (e) => {
    state.spoiler = e.target.checked;
    saveState();
    renderAll();
  });

  document.getElementById('trophyList').addEventListener('click', (e) => {
    const li = e.target.closest('li.trophy');
    if (!li) return;
    if (e.target.matches('input[type="checkbox"]')) return;
    selectedId = Number(li.dataset.id);
    renderList();
    renderDetail();
  });
  document.getElementById('trophyList').addEventListener('change', (e) => {
    if (!e.target.matches('input[type="checkbox"]')) return;
    const li = e.target.closest('li.trophy');
    const id = Number(li.dataset.id);
    if (e.target.checked) state.earned[id] = true;
    else delete state.earned[id];
    saveState();
    renderProgress();
    renderRoadmap();
    renderPlanner();
    renderDetail();
    li.classList.toggle('earned', e.target.checked);
  });

  document.getElementById('exportBtn').addEventListener('click', exportSave);
  document.getElementById('importFile').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) importSave(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Reset all progress and notes? This cannot be undone.')) return;
    state.earned = {};
    state.notes = {};
    selectedId = null;
    saveState();
    renderAll();
    document.getElementById('saveStatus').textContent = 'Progress reset.';
  });

  document.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    if (e.key === '/') {
      e.preventDefault();
      document.getElementById('search').focus();
    }
    const tabs = ['checklist', 'roadmap', 'missables', 'planner', 'save'];
    const n = Number(e.key);
    if (n >= 1 && n <= 5) switchTab(tabs[n - 1]);
  });

  fetch('data/trophies.json')
    .then((r) => {
      if (!r.ok) throw new Error('trophies.json not found');
      return r.json();
    })
    .then((data) => {
      trophies = (Array.isArray(data) ? data : data.trophies).slice().sort((a, b) => a.id - b.id);
      renderAll();
    })
    .catch((err) => {
      document.getElementById('trophyList').innerHTML =
        '<li class="load-error">Could not load the trophy list: ' + esc(err.message) + '</li>';
    });
}

document.addEventListener('DOMContentLoaded', init);
