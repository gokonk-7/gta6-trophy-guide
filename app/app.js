(function () {
  'use strict';

  var KEY = 'neon-leonida-gta6-trophies-v1';
  var state = { earned: {}, notes: {}, spoiler: true };
  var trophies = [];
  var byId = {};
  var selectedId = null;

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') {
        if (saved.earned && typeof saved.earned === 'object') state.earned = saved.earned;
        if (saved.notes && typeof saved.notes === 'object') state.notes = saved.notes;
        if (typeof saved.spoiler === 'boolean') state.spoiler = saved.spoiler;
      }
    } catch (e) { /* a corrupt save starts fresh */ }
  }

  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  }

  function earnedCount() {
    return trophies.filter(function (t) { return state.earned[t.id]; }).length;
  }

  function isHiddenFrom(t) {
    return state.spoiler && (t.hidden || t.story) && !state.earned[t.id];
  }

  function gradeLabel(g) {
    return g.charAt(0).toUpperCase() + g.slice(1);
  }

  function kindLabel(k) {
    var labels = {
      platinum: 'Platinum', completion: 'Completion', story: 'Story',
      activity: 'Activity', robbery: 'Robbery', collectible: 'Collectible',
      exploration: 'Exploration', combat: 'Combat', 'side-story': 'Side story',
      'one-off': 'One-off', money: 'Money'
    };
    return labels[k] || k;
  }

  function renderProgress() {
    var n = earnedCount();
    var total = trophies.length || 55;
    $('#earnedCount').textContent = String(n);
    $('#pct').textContent = Math.round((n / total) * 100) + '%';
    $('#progressFill').style.width = (n / total * 100) + '%';
    $('#progressBar').setAttribute('aria-valuenow', String(n));
    var hoursLeft = Math.round(200 * (total - n) / total);
    $('#estTime').textContent = n >= total ? 'platinum earned — Leonida Legend!' : 'about ' + hoursLeft + ' hours left';
    var parts = ['platinum', 'gold', 'silver', 'bronze'].map(function (g) {
      var all = trophies.filter(function (t) { return t.grade === g; });
      var got = all.filter(function (t) { return state.earned[t.id]; }).length;
      return gradeLabel(g) + ' ' + got + '/' + all.length;
    });
    $('#gradeBreakdown').textContent = parts.join('  ·  ');
  }

  function matchesFilters(t) {
    var q = ($('#search').value || '').trim().toLowerCase();
    if (q) {
      var hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    var grade = $('#fGrade').value;
    if (grade && t.grade !== grade) return false;
    var kind = $('#fKind').value;
    if (kind && t.kind !== kind) return false;
    var status = $('#fStatus').value;
    if (status === 'earned' && !state.earned[t.id]) return false;
    if (status === 'remaining' && state.earned[t.id]) return false;
    if (status === 'missable' && !t.missable) return false;
    return true;
  }

  function renderList() {
    var list = $('#trophyList');
    list.innerHTML = '';
    var shown = 0;
    trophies.forEach(function (t) {
      if (!matchesFilters(t)) return;
      shown++;
      var masked = isHiddenFrom(t);
      var li = document.createElement('li');
      li.className = 'trophy' + (state.earned[t.id] ? ' earned' : '') + (t.missable ? ' missable' : '');
      li.setAttribute('data-id', String(t.id));

      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = !!state.earned[t.id];
      box.setAttribute('aria-label', 'Earned: ' + (masked ? 'Hidden trophy' : t.name));
      box.addEventListener('change', function () {
        state.earned[t.id] = box.checked;
        if (!box.checked) delete state.earned[t.id];
        saveState();
        renderAll();
        if (selectedId === t.id) renderDetail();
      });
      li.appendChild(box);

      var body = document.createElement('div');
      body.className = 'trophy-body';
      var name = document.createElement('span');
      name.className = 'trophy-name';
      name.textContent = masked ? 'Hidden trophy' : t.name;
      body.appendChild(name);
      var badge = document.createElement('span');
      badge.className = 'badge grade-' + t.grade;
      badge.textContent = gradeLabel(t.grade);
      body.appendChild(badge);
      if (t.hidden) {
        var hid = document.createElement('span');
        hid.className = 'chip';
        hid.textContent = 'Hidden';
        body.appendChild(hid);
      }
      if (t.missable) {
        var flag = document.createElement('span');
        flag.className = 'chip flag';
        flag.textContent = 'Missable?';
        body.appendChild(flag);
      }
      var kind = document.createElement('span');
      kind.className = 'chip';
      kind.textContent = kindLabel(t.kind);
      body.appendChild(kind);
      if (t.target) {
        var tgt = document.createElement('span');
        tgt.className = 'chip target';
        tgt.textContent = t.target.count + ' ' + t.target.label;
        body.appendChild(tgt);
      }
      var desc = document.createElement('p');
      desc.className = 'trophy-desc';
      desc.textContent = masked ? 'Hidden trophy — earn it to reveal.' : t.description;
      body.appendChild(desc);
      li.appendChild(body);

      li.addEventListener('click', function (ev) {
        if (ev.target === box) return;
        selectedId = t.id;
        renderDetail();
        $$('#trophyList .trophy').forEach(function (el) { el.classList.remove('selected'); });
        li.classList.add('selected');
      });
      list.appendChild(li);
    });
    $('#listCount').textContent = shown + ' of ' + trophies.length + ' trophies';
  }

  function renderDetail() {
    var pane = $('#detail');
    var t = byId[selectedId];
    pane.innerHTML = '';
    if (!t) {
      var p = document.createElement('p');
      p.className = 'detail-empty';
      p.textContent = 'Pick a trophy to see its full guide, sources and your note.';
      pane.appendChild(p);
      return;
    }
    var masked = isHiddenFrom(t);
    var h = document.createElement('h3');
    h.textContent = masked ? 'Hidden trophy' : t.name;
    pane.appendChild(h);
    var meta = document.createElement('p');
    meta.className = 'detail-meta';
    var badge = document.createElement('span');
    badge.className = 'badge grade-' + t.grade;
    badge.textContent = gradeLabel(t.grade);
    meta.appendChild(badge);
    meta.appendChild(document.createTextNode(' ' + kindLabel(t.kind) + (t.hidden ? ' · Hidden' : ' · Visible') + ' · ' + (t.gamerscore || 0) + 'G'));
    pane.appendChild(meta);
    var desc = document.createElement('p');
    desc.className = 'detail-desc';
    desc.textContent = masked ? 'Hidden trophy — earn it to reveal.' : t.description;
    pane.appendChild(desc);
    if (t.missable && !masked) {
      var warn = document.createElement('p');
      warn.className = 'warning';
      warn.textContent = 'Possibly missable: Lucia\'s Chapter 1 balcony meditation disappears after Chapter 1. Do it the first chance you get — see the Missables tab.';
      pane.appendChild(warn);
    }
    if (!masked) {
      var guide = document.createElement('p');
      guide.className = 'guide';
      guide.textContent = t.guide;
      pane.appendChild(guide);
      if (t.target) {
        var tgt = document.createElement('p');
        tgt.className = 'target-line';
        tgt.textContent = 'Target: ' + t.target.count + ' ' + t.target.label + '.';
        pane.appendChild(tgt);
      }
      if (t.sources && t.sources.length) {
        var sh = document.createElement('h4');
        sh.textContent = 'Sources';
        pane.appendChild(sh);
        var ul = document.createElement('ul');
        ul.className = 'sources';
        t.sources.forEach(function (s) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = s.url;
          a.textContent = s.label;
          a.target = '_blank';
          a.rel = 'noopener';
          li.appendChild(a);
          ul.appendChild(li);
        });
        pane.appendChild(ul);
      }
    }
    var nh = document.createElement('h4');
    nh.textContent = 'Your note';
    pane.appendChild(nh);
    var ta = document.createElement('textarea');
    ta.rows = 3;
    ta.placeholder = 'Your own note for this trophy…';
    ta.value = state.notes[t.id] || '';
    ta.addEventListener('input', function () {
      if (ta.value) state.notes[t.id] = ta.value;
      else delete state.notes[t.id];
      saveState();
    });
    pane.appendChild(ta);
  }

  var PHASES = [
    {
      title: 'Phase 1 — Story',
      text: 'Play the story and save at the start of every chapter. Do Lucia\'s balcony meditation in Chapter 1, and Yago\'s race the moment it appears in Chapter 3.',
      ids: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 3]
    },
    {
      title: 'Phase 2 — The 100% grind',
      text: 'A Long Road and the big counts: 250 stunts, 42 Shooting Range golds, 8 vaults, 39 gang operations, 15 Target Decks, 100 WAiNK scans and the rest of the 100% checklist.',
      ids: [2, 4, 5, 6, 8, 9, 28, 29, 32, 33, 36, 40, 41, 42]
    },
    {
      title: 'Phase 3 — Strangers & clean-up',
      text: 'The 8 stranger strands, the six side-story finales, and the one-offs. Almost everything here is still available after the story ends.',
      ids: [7, 21, 22, 23, 24, 25, 26, 27, 30, 31, 34, 35, 37, 38, 39, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55]
    }
  ];

  function renderRoadmap() {
    var host = $('#roadmap');
    host.innerHTML = '';
    PHASES.forEach(function (ph) {
      var div = document.createElement('div');
      div.className = 'phase';
      var h = document.createElement('h3');
      h.textContent = ph.title;
      div.appendChild(h);
      var p = document.createElement('p');
      p.textContent = ph.text;
      div.appendChild(p);
      var got = ph.ids.filter(function (id) { return state.earned[id]; }).length;
      var bar = document.createElement('div');
      bar.className = 'bar small';
      var fill = document.createElement('div');
      fill.className = 'fill';
      fill.style.width = (got / ph.ids.length * 100) + '%';
      bar.appendChild(fill);
      div.appendChild(bar);
      var count = document.createElement('p');
      count.className = 'phase-count';
      count.textContent = got + ' / ' + ph.ids.length + ' earned in this phase';
      div.appendChild(count);
      var ul = document.createElement('ul');
      ul.className = 'phase-list';
      ph.ids.forEach(function (id) {
        var t = byId[id];
        if (!t) return;
        var li = document.createElement('li');
        li.textContent = (state.earned[id] ? '✓ ' : '○ ') + (isHiddenFrom(t) ? 'Hidden trophy' : t.name);
        if (state.earned[id]) li.className = 'done';
        ul.appendChild(li);
      });
      div.appendChild(ul);
      host.appendChild(div);
    });
  }

  function renderMissables() {
    var host = $('#missableList');
    host.innerHTML = '';
    trophies.filter(function (t) { return t.missable; }).forEach(function (t) {
      var li = document.createElement('li');
      li.textContent = t.name + ' — ' + t.description;
      host.appendChild(li);
    });
    var extra = document.createElement('li');
    extra.textContent = 'Yago\'s Race Against Yago (Chapter 3, hourglass icon) — time-sensitive, counts toward Strangers & Freaks.';
    host.appendChild(extra);
  }

  function plannerItems() {
    var remaining = trophies.filter(function (t) { return !state.earned[t.id]; });
    var rank = function (t) {
      if (t.missable) return 0;
      if (t.id === 7) return 1;
      if (t.story) return 2;
      if (t.grade === 'gold' || t.grade === 'silver') return 3;
      return 4;
    };
    var reason = function (t) {
      if (t.missable) return 'Possibly missable — do the Chapter 1 balcony meditation now.';
      if (t.id === 7) return 'Includes Yago\'s time-sensitive race in Chapter 3 — do it the moment it appears.';
      if (t.story) return 'Story order — comes next in the campaign.';
      if (t.grade === 'gold') return 'Big-ticket trophy — work it alongside the grind.';
      if (t.grade === 'silver') return 'A grind with a clear counter — chip away at it.';
      return 'Clean-up — quick once the story is done.';
    };
    remaining.sort(function (a, b) {
      var d = rank(a) - rank(b);
      return d !== 0 ? d : a.id - b.id;
    });
    return remaining.slice(0, 10).map(function (t) {
      return { trophy: t, reason: reason(t) };
    });
  }

  function renderPlanner() {
    var host = $('#nextup');
    host.innerHTML = '';
    plannerItems().forEach(function (item) {
      var li = document.createElement('li');
      var strong = document.createElement('strong');
      strong.textContent = isHiddenFrom(item.trophy) ? 'Hidden trophy' : item.trophy.name;
      li.appendChild(strong);
      li.appendChild(document.createTextNode(' — ' + item.reason));
      host.appendChild(li);
    });
  }

  function renderAll() {
    renderProgress();
    renderList();
    renderRoadmap();
    renderMissables();
    renderPlanner();
  }

  function switchTab(name) {
    $$('.tabs button').forEach(function (b) {
      var on = b.getAttribute('data-tab') === name;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $$('.panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'tab-' + name);
    });
    if (name === 'planner') renderPlanner();
    if (name === 'roadmap') renderRoadmap();
    if (name === 'missables') renderMissables();
  }

  function exportProgress() {
    var data = { app: 'neon-leonida-gta6-trophies-v1', earned: state.earned, notes: state.notes, spoiler: state.spoiler };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'neon-leonida-progress.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    $('#saveStatus').textContent = 'Exported ' + earnedCount() + ' earned trophies.';
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!data || typeof data !== 'object' || !data.earned || typeof data.earned !== 'object') {
          throw new Error('bad file');
        }
        state.earned = {};
        Object.keys(data.earned).forEach(function (k) {
          if (data.earned[k]) state.earned[k] = true;
        });
        state.notes = (data.notes && typeof data.notes === 'object') ? data.notes : {};
        if (typeof data.spoiler === 'boolean') state.spoiler = data.spoiler;
        saveState();
        renderAll();
        renderDetail();
        $('#spoiler').checked = state.spoiler;
        $('#saveStatus').textContent = 'Imported ' + earnedCount() + ' earned trophies.';
      } catch (e) {
        $('#saveStatus').textContent = 'That file is not a valid Neon Leonida save file.';
      }
    };
    reader.readAsText(file);
  }

  function bind() {
    $('#spoiler').addEventListener('change', function (ev) {
      state.spoiler = ev.target.checked;
      saveState();
      renderAll();
      renderDetail();
    });
    ['search', 'fGrade', 'fKind', 'fStatus'].forEach(function (id) {
      $('#' + id).addEventListener('input', renderList);
      $('#' + id).addEventListener('change', renderList);
    });
    $$('.tabs button').forEach(function (b) {
      b.addEventListener('click', function () { switchTab(b.getAttribute('data-tab')); });
    });
    $('#exportBtn').addEventListener('click', exportProgress);
    $('#importFile').addEventListener('change', function (ev) {
      if (ev.target.files && ev.target.files[0]) importProgress(ev.target.files[0]);
      ev.target.value = '';
    });
    $('#resetBtn').addEventListener('click', function () {
      if (!window.confirm('Reset all progress? This clears every earned trophy and note.')) return;
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
      var idx = ['1', '2', '3', '4', '5'].indexOf(ev.key);
      if (idx >= 0) switchTab(tabs[idx]);
    });
  }

  loadState();
  fetch('data/trophies.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      trophies = data.trophies || data;
      trophies.sort(function (a, b) { return a.id - b.id; });
      trophies.forEach(function (t) { byId[t.id] = t; });
      $('#spoiler').checked = state.spoiler;
      bind();
      renderAll();
      renderDetail();
    })
    .catch(function (err) {
      $('#trophyList').innerHTML = '<li class="trophy">Could not load the trophy list: ' + err.message + '</li>';
    });
})();
