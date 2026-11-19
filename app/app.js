// Neon Leonida — GTA VI Trophy Guide & Tracker.
// Plain script, no modules, no network: it fetches only app/data/trophies.json
// from the same folder and keeps progress in localStorage.
(function () {
  'use strict';

  var STORE_KEY = 'neon-leonida-gta6-trophies-v1';
  var TOTAL_HOURS = 200;

  // Phase membership for the roadmap tab. Every trophy belongs to exactly one phase.
  var PHASES = [
    { name: 'Phase 1 — Story', ids: [3, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      blurb: 'Play the story, save at the start of every chapter. Do Lucia\u2019s balcony meditation before Chapter 1 ends — it may be the only missable spot in the game.' },
    { name: 'Phase 2 — 100% checklist', ids: [2, 4, 5, 6, 8, 9, 28, 29, 33, 36, 40, 41, 42, 43, 44],
      blurb: 'The long grind toward A Long Road: 250 stunts, 42 range golds, 5 bank vaults, 39 gang operations, 15 Target Decks, and the collectibles. Do it after the story, region by region.' },
    { name: 'Phase 3 — Strangers & clean-up', ids: [1, 7, 21, 22, 23, 24, 25, 26, 27, 30, 31, 32, 34, 35, 37, 38, 39, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
      blurb: 'The 8 stranger strands and their finales, the one-offs, and the platinum itself. Yago\u2019s race in Chapter 3 is time-sensitive — do it the moment it appears.' }
  ];

  var trophies = [];
  var byId = {};
  var state = loadState();
  var selectedId = null;

  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return { earned: {}, notes: {}, spoiler: true };
      var parsed = JSON.parse(raw);
      return {
        earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
        notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
        spoiler: parsed.spoiler !== false
      };
    } catch (e) {
      return { earned: {}, notes: {}, spoiler: true };
    }
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  }

  function $(sel) { return document.querySelector(sel); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function isMasked(t) {
    return state.spoiler && (t.hidden || t.story) && !state.earned[t.id];
  }

  function earnedCount() {
    var n = 0;
    for (var k in state.earned) if (state.earned[k]) n++;
    return n;
  }

  function gradeLabel(g) { return g.charAt(0).toUpperCase() + g.slice(1); }

  function renderProgress() {
    var earned = earnedCount();
    var pct = Math.round((earned / trophies.length) * 100);
    $('#earnedCount').textContent = String(earned);
    $('#pct').textContent = pct + '%';
    $('#progressBar').style.width = pct + '%';
    var left = Math.max(0, Math.round(TOTAL_HOURS * (trophies.length - earned) / trophies.length));
    $('#hoursLeft').textContent = earned === trophies.length
      ? 'Platinum earned — Leonida Legend!'
      : '~' + left + 'h to platinum';
    var grades = ['platinum', 'gold', 'silver', 'bronze'];
    var box = $('#gradeBreakdown');
    box.innerHTML = '';
    grades.forEach(function (g) {
      var total = trophies.filter(function (t) { return t.grade === g; }).length;
      var got = trophies.filter(function (t) { return t.grade === g && state.earned[t.id]; }).length;
      var chip = el('span', 'grade-chip grade-' + g, gradeLabel(g) + ' ' + got + '/' + total);
      box.appendChild(chip);
    });
  }

  function trophyMatches(t) {
    var q = ($('#search').value || '').trim().toLowerCase();
    var grade = $('#fGrade').value;
    var kind = $('#fKind').value;
    var status = $('#fStatus').value;
    if (grade && t.grade !== grade) return false;
    if (kind && t.kind !== kind) return false;
    if (status === 'earned' && !state.earned[t.id]) return false;
    if (status === 'remaining' && state.earned[t.id]) return false;
    if (status === 'missable' && !t.missable) return false;
    if (q) {
      var hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.kind).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function renderList() {
    var list = $('#trophyList');
    list.innerHTML = '';
    var shown = 0;
    trophies.forEach(function (t) {
      if (!trophyMatches(t)) return;
      shown++;
      var masked = isMasked(t);
      var li = el('li', 'trophy' + (state.earned[t.id] ? ' earned' : ''));
      li.setAttribute('data-id', String(t.id));

      var check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = !!state.earned[t.id];
      check.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
      check.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (check.checked) state.earned[t.id] = true; else delete state.earned[t.id];
        saveState();
        renderAll();
        if (selectedId === t.id) renderDetail();
      });
      li.appendChild(check);

      var body = el('div', 'trophy-body');
      var name = el('span', 'trophy-name', masked ? 'Hidden trophy' : t.name);
      body.appendChild(name);
      var meta = el('span', 'trophy-meta');
      var badge = el('span', 'badge grade-' + t.grade, gradeLabel(t.grade));
      meta.appendChild(badge);
      if (t.hidden && !masked) meta.appendChild(el('span', 'flag', 'Hidden'));
      if (t.missable) meta.appendChild(el('span', 'flag missable', 'Missable'));
      if (t.target) meta.appendChild(el('span', 'target', t.target.count.toLocaleString('en-US') + ' ' + t.target.label));
      body.appendChild(meta);
      var desc = el('p', 'trophy-desc', masked ? 'Hidden trophy — earn it to reveal.' : t.description);
      body.appendChild(desc);
      li.appendChild(body);

      li.addEventListener('click', function () {
        selectedId = t.id;
        renderDetail();
        var items = list.querySelectorAll('li');
        items.forEach(function (x) { x.classList.remove('selected'); });
        li.classList.add('selected');
      });
      list.appendChild(li);
    });
    $('#listCount').textContent = shown + ' of ' + trophies.length;
  }

  function renderDetail() {
    var pane = $('#detail');
    pane.innerHTML = '';
    var t = byId[selectedId];
    if (!t) {
      pane.appendChild(el('p', 'detail-empty', 'Select a trophy to see its full guide, sources and your note.'));
      return;
    }
    var masked = isMasked(t);
    pane.appendChild(el('h3', null, masked ? 'Hidden trophy' : t.name));
    var meta = el('p', 'detail-meta');
    meta.appendChild(el('span', 'badge grade-' + t.grade, gradeLabel(t.grade)));
    meta.appendChild(document.createTextNode(' ' + t.gamerscore + 'G · ' + (t.hidden ? 'Hidden' : 'Visible')));
    if (t.missable) meta.appendChild(document.createTextNode(' · '));
    if (t.missable) meta.appendChild(el('span', 'flag missable', 'Missable'));
    pane.appendChild(meta);
    pane.appendChild(el('p', 'detail-desc', masked ? 'Hidden trophy — earn it to reveal.' : t.description));
    if (!masked) {
      pane.appendChild(el('p', 'detail-guide', t.guide));
      var srcTitle = el('h4', null, 'Sources');
      pane.appendChild(srcTitle);
      var srcList = el('ul', 'detail-sources');
      t.sources.forEach(function (s) {
        var li = el('li');
        var a = el('a', null, s.label);
        a.href = s.url;
        a.target = '_blank';
        a.rel = 'noopener';
        li.appendChild(a);
        srcList.appendChild(li);
      });
      pane.appendChild(srcList);
    }
    var noteLabel = el('label', 'note-label', 'Your note');
    pane.appendChild(noteLabel);
    var area = document.createElement('textarea');
    area.placeholder = 'e.g. where you left off, a good spot…';
    area.value = state.notes[t.id] || '';
    area.addEventListener('input', function () {
      if (area.value) state.notes[t.id] = area.value; else delete state.notes[t.id];
      saveState();
    });
    pane.appendChild(area);
  }

  function renderRoadmap() {
    var box = $('#roadmap');
    box.innerHTML = '';
    PHASES.forEach(function (ph) {
      var got = ph.ids.filter(function (id) { return state.earned[id]; }).length;
      var pct = Math.round((got / ph.ids.length) * 100);
      var div = el('div', 'phase');
      div.appendChild(el('h3', null, ph.name + ' — ' + got + '/' + ph.ids.length));
      div.appendChild(el('p', null, ph.blurb));
      var bar = el('div', 'bar');
      var fill = el('div', 'phase-fill');
      fill.style.width = pct + '%';
      bar.appendChild(fill);
      div.appendChild(bar);
      var names = ph.ids.map(function (id) {
        var t = byId[id];
        if (!t) return '';
        return (state.earned[id] ? '✓ ' : '○ ') + (isMasked(t) ? 'Hidden trophy' : t.name);
      });
      div.appendChild(el('p', 'phase-list', names.join(' · ')));
      box.appendChild(div);
    });
  }

  function plannerRank(t) {
    if (t.missable) return 0;
    if (t.id === 7) return 1; // Yago's time-sensitive race feeds this one
    if (t.kind === 'story') return 2;
    if (t.kind === 'side-story') return 3;
    if (t.id === 1) return 9; // platinum comes last by definition
    return 4;
  }

  function plannerReason(t) {
    if (t.missable) return 'Do first — the Chapter 1 meditation spot may disappear.';
    if (t.id === 7) return 'Do Yago\u2019s Chapter 3 race the moment it appears; it is time-sensitive.';
    if (t.kind === 'story') return 'Story order — just keep playing the main missions.';
    if (t.kind === 'side-story') return 'Stranger finale — finish the strand when its missions appear.';
    if (t.id === 1) return 'Pops automatically once the other 54 are earned.';
    if (t.kind === 'completion') return 'The long grind — save it for after the story.';
    return 'Clean-up — grab it whenever you are nearby.';
  }

  function renderPlanner() {
    var list = $('#nextUp');
    list.innerHTML = '';
    var rest = trophies.filter(function (t) { return !state.earned[t.id]; });
    rest.sort(function (a, b) {
      var ra = plannerRank(a), rb = plannerRank(b);
      if (ra !== rb) return ra - rb;
      return a.id - b.id;
    });
    rest.slice(0, 12).forEach(function (t) {
      var li = el('li');
      var strong = el('strong', null, isMasked(t) ? 'Hidden trophy' : t.name);
      li.appendChild(strong);
      li.appendChild(document.createTextNode(' — ' + plannerReason(t)));
      list.appendChild(li);
    });
    if (!rest.length) list.appendChild(el('li', null, 'Nothing left — platinum earned. Leonida Legend!'));
  }

  function renderAll() {
    renderProgress();
    renderList();
    renderRoadmap();
    renderPlanner();
  }

  function switchTab(name) {
    document.querySelectorAll('.tabs button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === name);
    });
    document.querySelectorAll('.tab').forEach(function (s) {
      s.classList.toggle('active', s.id === 'tab-' + name);
    });
  }

  function exportProgress() {
    var payload = {
      app: 'neon-leonida-gta6-trophies-v1',
      exportedAt: new Date().toISOString(),
      earned: state.earned,
      notes: state.notes,
      spoiler: state.spoiler
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'neon-leonida-progress.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 100);
    $('#saveStatus').textContent = 'Exported ' + earnedCount() + ' earned trophies.';
  }

  function importProgress(file) {
    var status = $('#saveStatus');
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!data || typeof data !== 'object' || !data.earned || typeof data.earned !== 'object') {
          throw new Error('bad shape');
        }
        var count = 0;
        var clean = {};
        Object.keys(data.earned).forEach(function (k) {
          var id = Number(k);
          if (byId[id] && data.earned[k]) { clean[id] = true; count++; }
        });
        state.earned = clean;
        state.notes = (data.notes && typeof data.notes === 'object') ? data.notes : {};
        if (typeof data.spoiler === 'boolean') state.spoiler = data.spoiler;
        saveState();
        $('#spoiler').checked = state.spoiler;
        renderAll();
        renderDetail();
        status.textContent = 'Imported ' + count + ' earned trophies.';
      } catch (e) {
        status.textContent = 'That file is not a valid Neon Leonida export — nothing changed.';
      }
    };
    reader.onerror = function () {
      status.textContent = 'That file is not a valid Neon Leonida export — nothing changed.';
    };
    reader.readAsText(file);
  }

  function bindEvents() {
    $('#spoiler').checked = state.spoiler;
    $('#spoiler').addEventListener('change', function () {
      state.spoiler = $('#spoiler').checked;
      saveState();
      renderAll();
      renderDetail();
    });
    ['search', 'fGrade', 'fKind', 'fStatus'].forEach(function (id) {
      $('#' + id).addEventListener('input', renderList);
      $('#' + id).addEventListener('change', renderList);
    });
    document.querySelectorAll('.tabs button').forEach(function (b) {
      b.addEventListener('click', function () { switchTab(b.getAttribute('data-tab')); });
    });
    $('#exportBtn').addEventListener('click', exportProgress);
    $('#importFile').addEventListener('change', function () {
      if (this.files && this.files[0]) importProgress(this.files[0]);
      this.value = '';
    });
    $('#resetBtn').addEventListener('click', function () {
      if (!window.confirm('Reset all progress and notes? This cannot be undone.')) return;
      state.earned = {};
      state.notes = {};
      selectedId = null;
      saveState();
      renderAll();
      renderDetail();
      $('#saveStatus').textContent = 'Progress reset.';
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA' || ev.target.tagName === 'SELECT')) {
        if (ev.key === 'Escape') ev.target.blur();
        return;
      }
      if (ev.key === '/') { ev.preventDefault(); $('#search').focus(); }
      var tabs = ['checklist', 'roadmap', 'missables', 'planner', 'save'];
      var n = parseInt(ev.key, 10);
      if (n >= 1 && n <= 5) switchTab(tabs[n - 1]);
    });
  }

  fetch('data/trophies.json')
    .then(function (r) {
      if (!r.ok) throw new Error('could not load trophies.json');
      return r.json();
    })
    .then(function (data) {
      trophies = Array.isArray(data) ? data : data.trophies;
      trophies.forEach(function (t) { byId[t.id] = t; });
      bindEvents();
      renderAll();
      renderDetail();
    })
    .catch(function (e) {
      $('#trophyList').innerHTML = '<li class="trophy">Could not load the trophy list. ' + e.message + '</li>';
    });
})();
