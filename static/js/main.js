/* UniSlot project page: theme toggle, result tables, gallery tabs, BibTeX copy. */
(function () {
  'use strict';

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  function currentTheme() {
    return root.dataset.theme || (media.matches ? 'dark' : 'light');
  }
  document.getElementById('themeToggle').addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Results data (from the paper) ---------- */
  var OCL_METRICS = ['ARI', 'FG-ARI', 'mBO', 'J&F'];
  function fmtScore(v) { return v.toFixed(3).replace(/^0/, ''); }
  function fmtPct(v) { return v.toFixed(2); }

  var TABLES = {
    main: [
    {
      id: 'tracking',
      label: 'Decomposition & tracking',
      note: 'Sequence-level metrics on CLEVRER {clevrer}, MOVi {kubric} and YouTube-VIS {ytvis}; higher is better. Bold: best, underlined: second best.',
      datasets: {
        'CLEVRER': {
          SAVi: [.001, .241, .046, .045], VideoSAUR: [.015, .210, .028, .014], SlotContrast: [.095, .618, .118, .067],
          SRL: [.080, .451, .071, .052], SlotCurri: [.024, .620, .067, .053], UniSlot: [.927, .781, .647, .558]
        },
        'MOVi-C': {
          SAVi: [.011, .138, .075, .097], VideoSAUR: [.220, .614, .334, .218], SlotContrast: [.103, .568, .274, .107],
          SRL: [.036, .195, .057, .030], SlotCurri: [.186, .652, .289, .197], UniSlot: [.505, .654, .358, .280]
        },
        'MOVi-E': {
          SAVi: [.002, .227, .099, .123], VideoSAUR: [.236, .585, .251, .173], SlotContrast: [.204, .744, .262, .214],
          SRL: [.143, .754, .246, .198], SlotCurri: [.046, .570, .169, .142], UniSlot: [.267, .785, .282, .230]
        },
        'YouTube-VIS 2019': {
          SAVi: [.042, .122, .271, .187], VideoSAUR: [.150, .145, .398, .298], SlotContrast: [.153, .194, .406, .308],
          SRL: [.225, .139, .409, .219], SlotCurri: [.083, .112, .247, .206], UniSlot: [.304, .225, .516, .360]
        },
        'YouTube-VIS 2021': {
          SAVi: [.034, .109, .181, .162], VideoSAUR: [.133, .161, .368, .256], SlotContrast: [.134, .206, .371, .275],
          SRL: [.097, .179, .243, .186], SlotCurri: [.058, .154, .250, .193], UniSlot: [.228, .231, .455, .315]
        }
      }
    },
    {
      id: 'transfer',
      label: 'Transfer to DAVIS',
      note: 'Zero-shot: all models trained on YouTube-VIS 2021 and evaluated on DAVIS 2017 {davis} without fine-tuning.',
      datasets: {
        'DAVIS 2017': {
          SAVi: [.018, .067, .183, .173], VideoSAUR: [.097, .111, .328, .213],
          SlotContrast: [.158, .085, .330, .234], UniSlot: [.179, .148, .379, .242]
        }
      }
    },
    {
      id: 'ablation',
      label: 'Ablations',
      note: 'Every variant falls short of the full model on every metric. Aligning position and scale over time, not only appearance, sharply degrades results (ARI .505 → .205 on MOVi-C).',
      ours: 'UniSlot (full)',
      datasets: {
        'MOVi-C': {
          'Temporal alignment on all of [v, p, s]': [.205, .235, .211, .220],
          'w/o temporal alignment': [.266, .204, .205, .204], 'w/o slot separation': [.283, .225, .214, .213],
          'w/o adaptive activation': [.476, .237, .258, .251], 'w/o disentanglement (SA)': [.111, .233, .161, .164],
          'w/o depth': [.477, .646, .348, .195], 'UniSlot (full)': [.505, .654, .358, .280]
        },
        'YouTube-VIS 2021': {
          'Temporal alignment on all of [v, p, s]': [.075, .144, .253, .199],
          'w/o temporal alignment': [.202, .213, .439, .299], 'w/o slot separation': [.211, .218, .443, .303],
          'w/o adaptive activation': [.136, .203, .378, .283], 'w/o disentanglement (SA)': [.165, .181, .411, .296],
          'w/o depth': [.219, .217, .444, .297], 'UniSlot (full)': [.228, .231, .455, .315]
        }
      }
    }
    ],
    dynamics: [
    {
      id: 'dynamics',
      label: 'Dynamics prediction',
      note: 'SlotFormer {slotformer} predictor trained on frozen slots; metrics on predicted future frames.',
      datasets: {
        'MOVi-C': {
          SAVi: [.008, .055, .034, .023], VideoSAUR: [.123, .402, .214, .161],
          SlotContrast: [.055, .378, .133, .097], UniSlot: [.318, .504, .229, .175]
        },
        'MOVi-E': {
          SAVi: [.001, .125, .086, .071], VideoSAUR: [.157, .560, .234, .202],
          SlotContrast: [.166, .692, .249, .214], UniSlot: [.202, .636, .279, .242]
        },
        'YouTube-VIS 2021': {
          SAVi: [.024, .092, .142, .118], VideoSAUR: [.121, .161, .359, .287],
          SlotContrast: [.118, .192, .346, .225], UniSlot: [.194, .213, .389, .297]
        }
      }
    }
    ],
    vqa: [
      {
        id: 'vqa-question',
        label: 'Per question',
        metrics: ['Descriptive', 'Explanatory', 'Predictive', 'Counterfactual'],
        short: ['Desc.', 'Expl.', 'Pred.', 'Count.'],
        fmt: fmtPct,
        note: 'Accuracy (%) on the CLEVRER validation set. A multiple-choice question counts as correct only if all its choices are. Question only: no visual input.',
        datasets: {
          'CLEVRER': {
            'Question only': [34.54, 13.42, 24.15, 10.04], VideoSAUR: [47.68, 20.92, 25.61, 11.69],
            SlotContrast: [82.66, 77.27, 69.64, 47.01], UniSlot: [89.75, 89.76, 83.19, 67.85]
          }
        }
      },
      {
        id: 'vqa-option',
        label: 'Per option',
        metrics: ['Explanatory', 'Predictive', 'Counterfactual'],
        short: ['Expl.', 'Pred.', 'Count.'],
        fmt: fmtPct,
        note: 'Per-choice accuracy (%) on the multiple-choice question types. Question only: no visual input.',
        datasets: {
          'CLEVRER': {
            'Question only': [57.22, 49.58, 50.11], VideoSAUR: [60.42, 52.29, 54.09],
            SlotContrast: [91.17, 82.84, 79.03], UniSlot: [96.13, 90.92, 88.37]
          }
        }
      }
    ]
  };

  /* ---------- Citations ----------
     Numbers come from the order of items in the References list (#refList),
     so reordering or adding a reference renumbers every [n] on the page. */
  var REF_NUM = {};
  document.querySelectorAll('#refList > li').forEach(function (li, i) {
    REF_NUM[li.id.replace(/^ref-/, '')] = i + 1;
  });
  function cite(key) {
    var a = document.createElement('a');
    a.className = 'cite';
    a.href = '#ref-' + key;
    a.textContent = '[' + (REF_NUM[key] || '?') + ']';
    return a;
  }
  // Append text to a node, turning {key} tokens into citation links.
  function appendRich(node, text) {
    // Citations attach directly to the preceding word (no space).
    text.replace(/\s+(\{[a-z0-9]+\})/g, '$1').split(/(\{[a-z0-9]+\})/).forEach(function (part) {
      var m = /^\{([a-z0-9]+)\}$/.exec(part);
      node.appendChild(m ? cite(m[1]) : document.createTextNode(part));
    });
    return node;
  }
  document.querySelectorAll('a.cite[data-ref]').forEach(function (a) {
    a.href = '#ref-' + a.dataset.ref;
    a.textContent = '[' + (REF_NUM[a.dataset.ref] || '?') + ']';
  });

  // Row labels in the tables that get a citation.
  var ROW_REFS = {
    SAVi: 'savi', VideoSAUR: 'videosaur', SlotContrast: 'slotcontrast', SRL: 'srl', SlotCurri: 'slotcurri',
    'w/o disentanglement (SA)': 'sa'
  };

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }

  /* One tabbed table widget per [data-tables] container. */
  function mountTables(container, tasks) {
    var state = { task: 0, dataset: {} };
    var taskTabs = el('div', { class: 'tabs', role: 'tablist' });
    var dsTabs = el('div', { class: 'seg', role: 'tablist', 'aria-label': 'Dataset' });
    var wrap = el('div', { class: 'table-wrap' });
    var table = el('table', { class: 'results' });
    var note = el('p', { class: 'table-note' });
    wrap.appendChild(table);
    if (tasks.length > 1) container.appendChild(taskTabs);
    container.appendChild(dsTabs);
    container.appendChild(wrap);
    container.appendChild(note);

    function renderTaskTabs() {
      taskTabs.innerHTML = '';
      tasks.forEach(function (t, i) {
        var b = el('button', { role: 'tab', 'aria-selected': String(i === state.task), type: 'button' }, t.label);
        b.addEventListener('click', function () { state.task = i; render(); });
        taskTabs.appendChild(b);
      });
    }

    function renderDatasetTabs(task) {
      dsTabs.innerHTML = '';
      var names = Object.keys(task.datasets);
      dsTabs.hidden = names.length < 2;
      names.forEach(function (name) {
        var b = el('button', { role: 'tab', 'aria-selected': String(name === state.dataset[task.id]), type: 'button' }, name);
        b.addEventListener('click', function () { state.dataset[task.id] = name; render(); });
        dsTabs.appendChild(b);
      });
    }

    function renderTable(task) {
      var metrics = task.metrics || OCL_METRICS;
      var fmt = task.fmt || fmtScore;
      var data = task.datasets[state.dataset[task.id]];
      var ours = task.ours || 'UniSlot';
      var rows = Object.keys(data);

      // Best and second best per column.
      var best = [], second = [], max = [];
      metrics.forEach(function (_, c) {
        var vals = rows.map(function (r) { return data[r][c]; }).sort(function (a, b) { return b - a; });
        best[c] = vals[0]; second[c] = vals[1]; max[c] = Math.max(vals[0], 1e-6);
      });

      table.innerHTML = '';
      var thead = el('thead'), hr = el('tr');
      hr.appendChild(el('th', { scope: 'col' }, task.id === 'ablation' ? 'Variant' : 'Method'));
      metrics.forEach(function (m, c) {
        var th = el('th', { scope: 'col', title: m });
        if (task.short) {
          th.appendChild(el('span', { class: 'long' }, m));
          th.appendChild(el('span', { class: 'short', 'aria-hidden': 'true' }, task.short[c]));
        } else {
          th.appendChild(document.createTextNode(m));
        }
        th.appendChild(el('span', { class: 'up', 'aria-label': 'higher is better' }, ' ↑'));
        hr.appendChild(th);
      });
      thead.appendChild(hr);
      table.appendChild(thead);

      var tbody = el('tbody');
      rows.forEach(function (r) {
        var tr = el('tr', r === ours ? { class: 'ours' } : null);
        var name = el('td');
        var label = r === 'UniSlot' ? 'UniSlot (ours)' : r;
        if (label.indexOf('UniSlot') === 0) {
          name.appendChild(el('span', { class: 'us' }, 'UniSlot'));
          name.appendChild(document.createTextNode(label.slice(7)));
        } else {
          name.textContent = label;
        }
        if (ROW_REFS[r]) name.appendChild(cite(ROW_REFS[r]));
        tr.appendChild(name);
        data[r].forEach(function (v, c) {
          var cls = v === best[c] ? 'best' : (v === second[c] ? 'second' : '');
          var td = el('td', cls ? { class: cls } : null, fmt(v));
          var bar = el('span', { class: 'bar', 'aria-hidden': 'true' });
          var fill = el('i');
          fill.style.width = (100 * v / max[c]).toFixed(1) + '%';
          bar.appendChild(fill);
          td.appendChild(bar);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      note.textContent = '';
      appendRich(note, task.note);
    }

    function render() {
      var task = tasks[state.task];
      if (!state.dataset[task.id]) state.dataset[task.id] = Object.keys(task.datasets)[0];
      renderTaskTabs();
      renderDatasetTabs(task);
      renderTable(task);
    }
    render();
  }

  document.querySelectorAll('[data-tables]').forEach(function (c) {
    mountTables(c, TABLES[c.dataset.tables]);
  });

  /* ---------- Gallery tabs ---------- */
  var gTabs = document.querySelectorAll('#galleryTabs button');
  gTabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      gTabs.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', String(on));
        document.getElementById(b.dataset.target).hidden = !on;
      });
    });
  });

  /* ---------- BibTeX copy ---------- */
  var copyBtn = document.getElementById('copyBib');
  copyBtn.addEventListener('click', function () {
    var text = document.getElementById('bib').textContent;
    var label = copyBtn.querySelector('span');
    function done(ok) {
      label.textContent = ok ? 'Copied' : 'Press ⌘C';
      setTimeout(function () { label.textContent = 'Copy'; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      done(false);
    }
  });
})();
