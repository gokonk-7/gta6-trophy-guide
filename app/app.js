/* Neon Leonida — GTA VI trophy guide & tracker.
   Static and offline: progress lives in localStorage, nothing leaves the browser.
   Trophy data (names, descriptions, grades, guides, sources) comes from data/trophies.json. */
(function () {
  'use strict';

  var STORE_KEY = 'neon-leonida-gta6-trophies-v1';
  var DATA_URL = 'data/trophies.json';

  var store = { earned: {}, notes: {}, spoiler: true };
  var trophies = [];
  var sourceUrls = {};
  var selectedId = null;

  // The three phases of the platinum run, by trophy id.
  var ROADMAP = [
    {
      title: 'Phase 1 — Play the story',
      ids: [3, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      text: 'Play through all five chapters. Every story trophy pops as you go — the chapter trophies sometimes land on the first mission of the next chapter, so do not worry if one is late. Before you leave Chapter 1, do Lucia\u2019s balcony meditation (see Missables) — it is the one thing that may not come back.'
    },
    {
      title: 'Phase 2 — The 100% checklist',
      ids: [2, 4, 5, 6, 8, 9, 27, 28, 29, 30, 31, 33, 36, 40, 41, 42, 43, 44, 45, 51, 52],
      text: 'After the credits, the long grind: 250 stunts, 42 Shooting Range golds, 8 bank vaults, 39 gang operations, 15 Target Decks, 100 WAiNK scans. Work the grind trophies together — they all feed A Long Road, and this phase is most of the ~100 hours after the story.'
    },
    {
      title: 'Phase 3 — Strangers & clean-up',
      ids: [1, 7, 21, 22, 23, 24, 25, 26, 32, 34, 35, 37, 38, 39, 46, 47, 48, 49, 50, 53, 54, 55],
      text: 'Finish the 8 stranger strands, the six side-story finales (Andy, Kenton, Billy, Randy, Tyrone, Bret), the one-offs like the jet at VCIA and the tank at Mile Zero, and the partner trophies. The Platinum pops here, when the last of the other 54 lands.'
    }
  ];

  var WEIGHT = { platinum: 30, gold: 25, silver: 10, bronze: 2 };
  var GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
  var KIND_LABEL = {
    story: 'Story', activity: 'Activity', robbery: 'Robbery', collectible: 'Collectible',
    exploration: 'Exploration', combat: 'Combat', 'side-story': 'Side story',
    'one-off': 'One-off', money: 'Money', completion: '100% completion', platinum: 'Platinum'
  };
  var SOURCE_LABEL = {
    gtabase: 'GTABase — GTA 6 Achievements & Trophies list',
    outputlag: 'Outputlag — GTA 6 Trophy List'
  };

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function readStore() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (parsed && typeof parsed === 'object') {
        if (parsed.earned && typeof parsed.earned === 'object') store.earned = parsed.earned;
        if (parsed.notes && typeof parsed.notes === 'object') store.notes = parsed.notes;
        if (typeof parsed.spoiler === 'boolean') store.spoiler = parsed.spoiler;
      }
    } catch (e) { /* corrupted save: start fresh */ }
  }

  function writeStore() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* storage unavailable */ }
  }

  function trophyById(id) {
    for (var i = 0; i < trophies.length; i++) if (trophies[i].id === id) return trophies[i];
    return null;
  }

  function earned(t) { return !!store.earned[t.id]; }
  function masked(t) { return store.spoiler && (t.hidden || t.story) && !earned(t); }
  function earnedTotal() { return trophies.filter(earned).length; }

  /* ---------- progress header ---------- */

  function renderProgress() {
    var total = trophies.length, done = earnedTotal();
    var pct = total ? Math.round(done / total * 100) : 0;
    $('earnedCount').textContent = String(done);
    $('pct').textContent = pct + '%';
    $('barFill').style.width = pct + '%';
    $('gradeCounts').innerHTML = ['platinum', 'gold', 'silver', 'bronze'].map(function (g) {
      var gTotal = trophies.filter(function (t) { return t.grade === g; }).length;
      var gDone = trophies.filter(function (t) { return t.grade === g && earned(t); }).length;
      return esc(GRADE_LABEL[g]) + ' <b>' + gDone + '/' + gTotal + '</b>';
    }).join(' &middot; ');
    if (done === total && total) {
      $('eta').textContent = 'Platinum earned — congratulations, Leonida Legend.';
      return;
    }
    var weightOf = function (t) { return WEIGHT[t.grade] || 2; };
    var totalWeight = trophies.reduce(function (s, t) { return s + weightOf(t); }, 0);
    var leftWeight = trophies.filter(function (t) { return !earned(t); })
      .reduce(function (s, t) { return s + weightOf(t); }, 0);
    var hours = totalWeight ? Math.round(200 * leftWeight / totalWeight / 5) * 5 : 0;
    $('eta').textContent = 'Roughly ' + hours + ' hours left at a steady pace (about 200 hours total for the platinum).';
  }

  /* ---------- checklist ---------- */

  function visibleTrophies() {
    var q = $('search').value.trim().toLowerCase();
    var grade = $('fGrade').value, kind = $('fKind').value, status = $('fStatus').value;
    return trophies.filter(function (t) {
      if (grade && t.grade !== grade) return false;
      if (kind && t.kind !== kind) return false;
      if (status === 'earned' && !earned(t)) return false;
      if (status === 'remaining' && earned(t)) return false;
      if (status === 'missable' && !t.missable) return false;
      if (q) {
        var hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + KIND_LABEL[t.kind]).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function tagsHtml(t, withTarget) {
    var out = '';
    if (!masked(t)) out += '<span class="badge ' + esc(t.grade) + '">' + esc(GRADE_LABEL[t.grade]) + '</span>';
    out += '<span class="tag">' + esc(KIND_LABEL[t.kind] || t.kind) + '</span>';
    if (t.hidden && !masked(t)) out += '<span class="tag hidden-t">Hidden</span>';
    if (t.story && !masked(t)) out += '<span class="tag">Story</span>';
    if (t.missable) out += '<span class="tag missable">Possibly missable</span>';
    if (t.target && withTarget !== false) out += '<span class="tag">Target: ' + t.target.count + ' ' + esc(t.target.label) + '</span>';
    return out;
  }

  function renderList() {
    var items = visibleTrophies();
    $('listCount').textContent = items.length + ' of ' + trophies.length + ' trophies shown';
    if (!items.length) {
      $('trophyList').innerHTML = '<li class="trophy">No trophies match those filters.</li>';
      return;
    }
    $('trophyList').innerHTML = items.map(function (t) {
      var hide = masked(t);
      var cls = 'trophy' + (earned(t) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
      return '<li class="' + cls + '" data-id="' + t.id + '">' +
        '<div class="trophy-top">' +
        '<input type="checkbox"' + (earned(t) ? ' checked' : '') +
        ' aria-label="Mark ' + esc(hide ? 'hidden trophy' : t.name) + ' as earned">' +
        '<div><div class="trophy-name">' + esc(hide ? 'Hidden trophy' : t.name) + '</div>' +
        '<div class="trophy-desc' + (hide ? ' spoiled' : '') + '">' +
        esc(hide ? 'Hidden trophy — earn it to reveal.' : t.description) + '</div>' +
        '<div class="trophy-meta">' + tagsHtml(t) + '</div></div>' +
        '</div></li>';
    }).join('');
  }

  /* ---------- detail pane ---------- */

  function renderDetail() {
    var box = $('detail');
    var t = selectedId == null ? null : trophyById(selectedId);
    if (!t) {
      box.innerHTML = '<p class="detail-empty">Select a trophy to read its full guide, sources and — where it matters — when it can be missed.</p>';
      return;
    }
    if (masked(t)) {
      box.innerHTML = '<h3>Hidden trophy</h3>' +
        '<p class="official">This trophy is hidden. Turn spoiler-safe off, or earn it in the game, to read its guide.</p>' +
        '<p>Grade and kind are hidden too, so the story stays unspoiled.</p>';
      return;
    }
    var html = '<h3>' + esc(t.name) + '</h3>' +
      '<p class="official">&ldquo;' + esc(t.description) + '&rdquo;</p>' +
      '<div class="trophy-meta">' + tagsHtml(t, false) + '</div>';
    if (t.target) html += '<p class="target">Target: ' + t.target.count + ' ' + esc(t.target.label) + '</p>';
    if (t.missable) {
      html += '<div class="warn"><strong>Possibly missable.</strong> See the Missables tab for the exact steps and the save to keep.</div>';
    }
    html += '<h4>Guide</h4><p>' + esc(t.guide) + '</p><h4>Sources</h4><ul class="sources">' +
      (t.sources || []).map(function (key) {
        return '<li><a href="' + esc(sourceUrls[key] || '#') + '" target="_blank" rel="noopener">' +
          esc(SOURCE_LABEL[key] || key) + '</a></li>';
      }).join('') + '</ul>' +
      '<div class="note-box"><label for="note-' + t.id + '">Your note</label>' +
      '<textarea id="note-' + t.id + '" placeholder="Where you are with this one…">' +
      esc(store.notes[t.id] || '') + '</textarea></div>';
    box.innerHTML = html;
  }

  /* ---------- roadmap ---------- */

  function renderRoadmap() {
    $('phases').innerHTML = ROADMAP.map(function (phase) {
      var done = phase.ids.filter(function (id) {
        var t = trophyById(id);
        return t && earned(t);
      }).length;
      var pct = phase.ids.length ? Math.round(done / phase.ids.length * 100) : 0;
      var list = phase.ids.map(function (id) {
        var t = trophyById(id);
        if (!t) return '';
        return '<li class="' + (earned(t) ? 'done' : '') + '">' + esc(masked(t) ? 'Hidden trophy' : t.name) + '</li>';
      }).join('');
      return '<div class="phase"><h3>' + esc(phase.title) + '</h3>' +
        '<p class="phase-count">' + done + ' / ' + phase.ids.length + ' earned</p>' +
        '<div class="bar"><div class="fill" style="width:' + pct + '%"></div></div>' +
        '<p>' + esc(phase.text) + '</p><ul>' + list + '</ul></div>';
    }).join('');
  }

  /* ---------- missables ---------- */

  function renderMissables() {
    var cards = [
      {
        cls: 'miss-card hot',
        title: 'Positive Mental Attitude — possibly missable',
        body: 'Meditate at every Meditation Spot (18; meditating with Jason and Lucia together counts twice; the last one needs both characters, possible after Coffee Break in Chapter 2). The risk: in Chapter 1, the morning after Down to Earth, follow Lucia from the kitchen to the balcony and accept her meditation. It is gone after Chapter 1, and it is not confirmed yet whether the trophy needs it — so do not skip it. Track it under Progress > Collections > Exploration > Meditations.'
      },
      {
        cls: 'miss-card',
        title: 'Yago\u2019s race — time-sensitive',
        body: 'Yago\u2019s Race Against Yago in Chapter 3 counts toward Strangers & Freaks and shows an hourglass icon. Do it the moment it appears, and save first. It is the only stranger strand with a clock on it.'
      },
      {
        cls: 'miss-card',
        title: 'Irredeemable profile — permanent',
        body: 'Your Criminal Profile moves as you act (Actions Speak Louder counts 500 of those actions). Pushing it all the way to Irredeemable is permanent — do not chase it. Turn on Criminal Profile notifications in Settings > UI to watch where you stand.'
      },
      {
        cls: 'miss-card',
        title: 'Everything else comes back',
        body: 'No other trophy is missable. Every side-story finale, stranger strand, robbery, collectible and one-off stays available after the story in free roam. The story trophies cannot be missed at all — just play through the five chapters.'
      }
    ];
    $('missCards').innerHTML = cards.map(function (c) {
      return '<div class="' + c.cls + '"><h3>' + esc(c.title) + '</h3><p>' + esc(c.body) + '</p></div>';
    }).join('');
  }

  /* ---------- next-up planner ---------- */

  function renderPlanner() {
    var wrap = $('nextUp');
    var remaining = trophies.filter(function (t) { return !earned(t); });
    if (!remaining.length) {
      wrap.innerHTML = '<li><span class="done-note">Everything is earned — congratulations, Leonida Legend.</span></li>';
      return;
    }
    var queue = [];
    function push(id, why) {
      var t = trophyById(id);
      if (!t || earned(t)) return;
      for (var i = 0; i < queue.length; i++) if (queue[i].t.id === t.id) return;
      queue.push({ t: t, why: why });
    }
    push(32, 'Possibly missable — do Lucia\u2019s Chapter 1 balcony meditation before you leave Chapter 1.');
    ROADMAP[0].ids.forEach(function (id) { push(id, 'Story — play through the five chapters in order.'); });
    push(7, 'Finish 8 stranger strands; Yago\u2019s race in Chapter 3 is time-sensitive.');
    [21, 22, 23, 24, 25, 26].forEach(function (id) {
      push(id, 'Side-story finale — still available after the story, but worth doing as it opens.');
    });
    remaining.forEach(function (t) {
      if (t.grade === 'silver') push(t.id, 'Silver — a big step toward the platinum and toward 100%.');
    });
    remaining.forEach(function (t) { push(t.id, 'Clean-up — free roam, no deadline.'); });

    var shown = queue.slice(0, 10);
    wrap.innerHTML = shown.map(function (item, i) {
      return '<li><span class="rank">' + (i + 1) + '</span><div>' +
        '<div>' + esc(masked(item.t) ? 'Hidden trophy' : item.t.name) + '</div>' +
        '<div class="why">' + esc(item.why) + '</div></div></li>';
    }).join('') + (queue.length > 10
      ? '<li><span class="done-note">…and ' + (queue.length - 10) + ' more after these. Work the list top to bottom.</span></li>'
      : '');
  }

  /* ---------- tabs, export / import ---------- */

  var TABS = ['checklist', 'roadmap', 'missables', 'planner', 'save'];

  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(function (b) {
      var on = b.getAttribute('data-tab') === name;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'tab-' + name);
    });
  }

  function setStatus(msg) { $('saveStatus').textContent = msg; }

  function exportProgress() {
    var payload = {
      app: 'neon-leonida-gta6-trophy-guide',
      version: 1,
      exportedAt: new Date().toISOString(),
      earned: store.earned,
      notes: store.notes,
      spoiler: store.spoiler
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'neon-leonida-progress.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    setStatus('Exported ' + earnedTotal() + ' earned trophies to neon-leonida-progress.json.');
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!data || typeof data !== 'object' || !data.earned || typeof data.earned !== 'object') {
          throw new Error('not a progress file');
        }
        var known = {};
        trophies.forEach(function (t) { known[t.id] = true; });
        var imported = 0;
        Object.keys(data.earned).forEach(function (k) {
          if (known[k] && data.earned[k]) { store.earned[k] = true; imported++; }
        });
        if (data.notes && typeof data.notes === 'object') {
          Object.keys(data.notes).forEach(function (k) {
            if (known[k]) store.notes[k] = String(data.notes[k]);
          });
        }
        if (typeof data.spoiler === 'boolean') store.spoiler = data.spoiler;
        writeStore();
        $('spoiler').checked = store.spoiler;
        refreshAll();
        setStatus('Imported ' + imported + ' earned trophies.');
      } catch (e) {
        setStatus('That file is not a valid progress export — nothing was changed.');
      }
    };
    reader.readAsText(file);
  }

  function refreshAll() {
    renderProgress();
    renderList();
    renderDetail();
    renderRoadmap();
    renderPlanner();
  }

  /* ---------- boot ---------- */

  function init() {
    readStore();
    fetch(DATA_URL)
      .then(function (r) { if (!r.ok) throw new Error('trophies.json failed to load'); return r.json(); })
      .then(function (data) {
        trophies = data.trophies || [];
        sourceUrls = data.sources || {};
        $('spoiler').checked = store.spoiler;
        renderMissables();
        refreshAll();
      })
      .catch(function () {
        $('trophyList').innerHTML = '<li class="trophy">Could not load data/trophies.json. Open this guide from its own folder (for example with <code>node serve.ts</code>), not from a bare file path.</li>';
      });

    ['search', 'fGrade', 'fKind', 'fStatus'].forEach(function (id) {
      $(id).addEventListener('input', renderList);
      $(id).addEventListener('change', renderList);
    });

    $('spoiler').addEventListener('change', function () {
      store.spoiler = $('spoiler').checked;
      writeStore();
      refreshAll();
    });

    // One delegated listener covers row clicks and the earned checkboxes.
    $('trophyList').addEventListener('click', function (e) {
      var li = e.target.closest('li[data-id]');
      if (!li || e.target.tagName === 'INPUT') return;
      selectedId = Number(li.getAttribute('data-id'));
      renderList();
      renderDetail();
    });
    $('trophyList').addEventListener('change', function (e) {
      if (e.target.tagName !== 'INPUT') return;
      var li = e.target.closest('li[data-id]');
      if (!li) return;
      var id = Number(li.getAttribute('data-id'));
      if (e.target.checked) store.earned[id] = true;
      else delete store.earned[id];
      writeStore();
      refreshAll();
    });

    // Notes save a moment after typing stops, so a reload keeps them.
    var noteTimer = null;
    $('detail').addEventListener('input', function (e) {
      if (e.target.tagName !== 'TEXTAREA' || selectedId == null) return;
      clearTimeout(noteTimer);
      noteTimer = setTimeout(function () {
        var value = e.target.value;
        if (value.trim()) store.notes[selectedId] = value;
        else delete store.notes[selectedId];
        writeStore();
      }, 250);
    });

    document.querySelectorAll('.tab').forEach(function (b) {
      b.addEventListener('click', function () { switchTab(b.getAttribute('data-tab')); });
    });

    $('exportBtn').addEventListener('click', exportProgress);
    $('importFile').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
      e.target.value = '';
    });
    $('resetBtn').addEventListener('click', function () {
      if (confirm('Reset all progress and notes? This cannot be undone. Export a backup first if you want one.')) {
        store.earned = {};
        store.notes = {};
        selectedId = null;
        writeStore();
        refreshAll();
        setStatus('Progress reset.');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) return;
      if (e.key === '/') { e.preventDefault(); $('search').focus(); }
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= 5) switchTab(TABS[n - 1]);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
