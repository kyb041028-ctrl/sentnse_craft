/**
 * 영토 맵 — 성향 추이 미니차트 + 상세 모달 (일·주·월, 연령대 보기)
 * - 본인 일별 스냅샷: localStorage `sc_tendency_history_v2`
 * - 연령대(20·30·40·50+)는 프로필 연령 미연동 시 데모 보정 곡선(안내 문구 표시)
 */
(function (global) {
  'use strict';

  var ALIGN_LS = 'sc_political_scores_v1';
  var HISTORY_KEY = 'sc_tendency_history_v2';
  var MAX_DAILY = 120;

  function el(id) {
    return document.getElementById(id);
  }

  function pad2(n) {
    return String(n).length < 2 ? '0' + n : String(n);
  }

  function todayStr(d) {
    var x = d || new Date();
    return x.getFullYear() + '-' + pad2(x.getMonth() + 1) + '-' + pad2(x.getDate());
  }

  function parseDay(s) {
    var p = String(s || '').split('-');
    if (p.length !== 3) return null;
    var y = +p[0];
    var m = +p[1];
    var da = +p[2];
    var t = new Date(y, m - 1, da).getTime();
    return isNaN(t) ? null : t;
  }

  function addDaysStr(dayStr, delta) {
    var t = parseDay(dayStr);
    if (t == null) return dayStr;
    var d = new Date(t + delta * 86400000);
    return todayStr(d);
  }

  function uid() {
    var p = global.__scPlayer;
    return (p && p.userId) || 'guest';
  }

  function loadScoresMap() {
    try {
      var raw = localStorage.getItem(ALIGN_LS);
      if (!raw) return {};
      var o = JSON.parse(raw);
      return o && typeof o === 'object' ? o : {};
    } catch (_) {
      return {};
    }
  }

  function readBucket(userId) {
    var id = String(userId || '').trim() || 'guest';
    var m = loadScoresMap();
    var o = m[id];
    return o && typeof o === 'object' ? o : {};
  }

  function bucketScores(prev) {
    var A = global.AlignmentScoring;
    var init = A ? A.initialScores() : { conservative: 4, centrist: 4, progressive: 4 };
    if (!prev || typeof prev !== 'object') return init;
    return {
      conservative:
        typeof prev.conservative === 'number' && !isNaN(prev.conservative) ? prev.conservative : init.conservative,
      centrist: typeof prev.centrist === 'number' && !isNaN(prev.centrist) ? prev.centrist : init.centrist,
      progressive:
        typeof prev.progressive === 'number' && !isNaN(prev.progressive) ? prev.progressive : init.progressive,
    };
  }

  function getDisplayPct(userId) {
    var A = global.AlignmentScoring;
    if (!A || typeof A.toDisplayPercent !== 'function') {
      return { conservative: 34, centrist: 33, progressive: 33 };
    }
    return A.toDisplayPercent(bucketScores(readBucket(userId)));
  }

  function getPlanetPct(userId) {
    var b = readBucket(userId);
    var n = Number(b.planetPct);
    if (!isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function loadRoot() {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return { v: 2, users: {} };
      var o = JSON.parse(raw);
      if (!o || typeof o !== 'object') return { v: 2, users: {} };
      if (!o.users || typeof o.users !== 'object') o.users = {};
      return o;
    } catch (_) {
      return { v: 2, users: {} };
    }
  }

  function saveRoot(root) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(root));
    } catch (e) {
      console.warn('[tendency-trends] save failed', e);
    }
  }

  function getDailySeries(userId) {
    var root = loadRoot();
    var id = String(userId || '').trim() || 'guest';
    var arr = root.users[id];
    return Array.isArray(arr) ? arr.slice() : [];
  }

  function setDailySeries(userId, arr) {
    var root = loadRoot();
    var id = String(userId || '').trim() || 'guest';
    root.users[id] = arr.slice(-MAX_DAILY);
    saveRoot(root);
  }

  function normalizePctTriplet(c, n, p) {
    var a = Math.max(0, Math.min(100, Math.round(c)));
    var b = Math.max(0, Math.min(100, Math.round(n)));
    var d = Math.max(0, Math.min(100, Math.round(p)));
    var s = a + b + d;
    if (s <= 0) return { conservative: 34, centrist: 33, progressive: 33 };
    if (s === 100) return { conservative: a, centrist: b, progressive: d };
    var k = 100 / s;
    return {
      conservative: Math.round(a * k),
      centrist: Math.round(b * k),
      progressive: Math.max(0, 100 - Math.round(a * k) - Math.round(b * k)),
    };
  }

  function ageDemoBias(ageKey) {
    if (ageKey === '20') return { c: -5, n: -1, p: 6 };
    if (ageKey === '30') return { c: -2, n: 0, p: 3 };
    if (ageKey === '40') return { c: 3, n: 1, p: -3 };
    if (ageKey === '50') return { c: 6, n: 2, p: -6 };
    return { c: 0, n: 0, p: 0 };
  }

  function applyAgeDemo(point, ageKey) {
    if (!ageKey || ageKey === 'all') return point;
    var b = ageDemoBias(ageKey);
    var t = normalizePctTriplet(
      point.conservative + b.c,
      point.centrist + b.n,
      point.progressive + b.p,
    );
    return { d: point.d, conservative: t.conservative, centrist: t.centrist, progressive: t.progressive, planet: point.planet };
  }

  function recordSnapshot() {
    var id = uid();
    var pct = getDisplayPct(id);
    var pl = getPlanetPct(id);
    var day = todayStr();
    var series = getDailySeries(id);
    var last = series.length ? series[series.length - 1] : null;
    var entry = {
      d: day,
      conservative: pct.conservative,
      centrist: pct.centrist,
      progressive: pct.progressive,
      planet: pl,
    };
    if (last && last.d === day) {
      series[series.length - 1] = entry;
    } else {
      series.push(entry);
    }
    setDailySeries(id, series);
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      return ((t ^ (t + Math.imul(t ^ (t >>> 7), 61 | t))) >>> 0) / 4294967296;
    };
  }

  function clampRough(x) {
    return Math.max(10, Math.min(90, Math.round(x)));
  }

  /** 최근 14일 구간에서 기록 없는 날만 보간(미니차트·주간 집계용). 실제 저장된 날은 덮어쓰지 않음. */
  function ensureTwoWeekWindow() {
    var id = uid();
    var series = getDailySeries(id).slice().sort(sortByDay);
    var map = {};
    for (var i = 0; i < series.length; i++) map[series[i].d] = series[i];
    var pct = getDisplayPct(id);
    var pl = getPlanetPct(id);
    for (var b = 13; b >= 0; b--) {
      var d = addDaysStr(todayStr(), -b);
      if (map[d]) continue;
      var rnd2 = mulberry32(
        (d.charCodeAt(0) + d.charCodeAt(3) + d.charCodeAt(6) + d.charCodeAt(8) + id.length * 997) >>> 0,
      );
      var drift = (b / 13 - 0.5) * 5;
      var c0 = clampRough(pct.conservative + (rnd2() - 0.5) * 11 + drift);
      var p0 = clampRough(pct.progressive + (rnd2() - 0.5) * 11 - drift);
      var n0 = clampRough(100 - c0 - p0);
      var t = normalizePctTriplet(c0, n0, p0);
      map[d] = {
        d: d,
        conservative: t.conservative,
        centrist: t.centrist,
        progressive: t.progressive,
        planet: Math.max(0, Math.min(100, pl + Math.round((rnd2() - 0.5) * 7))),
      };
    }
    var keys = Object.keys(map).sort();
    if (keys.length > MAX_DAILY) keys = keys.slice(-MAX_DAILY);
    var merged = keys.map(function (k) {
      return map[k];
    });
    setDailySeries(id, merged);
  }

  function sortByDay(a, b) {
    return String(a.d).localeCompare(String(b.d));
  }

  function mondayKeyFromDayStr(dayStr) {
    var t = parseDay(dayStr);
    if (t == null) return dayStr;
    var d = new Date(t);
    var wd = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - wd);
    return todayStr(d);
  }

  function aggregateWeeks(daily) {
    var map = {};
    for (var i = 0; i < daily.length; i++) {
      var p = daily[i];
      var t = parseDay(p.d);
      if (t == null) continue;
      var key = mondayKeyFromDayStr(p.d);
      if (!map[key]) {
        map[key] = { sum: { c: 0, n: 0, p: 0, pl: 0 }, n: 0, sort: parseDay(key) || 0 };
      }
      map[key].sum.c += p.conservative;
      map[key].sum.n += p.centrist;
      map[key].sum.p += p.progressive;
      map[key].sum.pl += p.planet;
      map[key].n += 1;
    }
    var keys = Object.keys(map).sort(function (a, b) {
      return map[a].sort - map[b].sort;
    });
    var out = [];
    for (var k = 0; k < keys.length; k++) {
      var b = map[keys[k]];
      if (!b.n) continue;
      var t2 = normalizePctTriplet(b.sum.c / b.n, b.sum.n / b.n, b.sum.p / b.n);
      out.push({
        d: String(keys[k]).slice(5),
        conservative: t2.conservative,
        centrist: t2.centrist,
        progressive: t2.progressive,
        planet: Math.round(b.sum.pl / b.n),
      });
    }
    return out.slice(-16);
  }

  function aggregateMonths(daily) {
    var map = {};
    for (var i = 0; i < daily.length; i++) {
      var p = daily[i];
      var key = String(p.d).slice(0, 7);
      if (key.length !== 7) continue;
      if (!map[key]) map[key] = { sum: { c: 0, n: 0, p: 0, pl: 0 }, n: 0 };
      map[key].sum.c += p.conservative;
      map[key].sum.n += p.centrist;
      map[key].sum.p += p.progressive;
      map[key].sum.pl += p.planet;
      map[key].n += 1;
    }
    var keys = Object.keys(map).sort();
    var out = [];
    for (var j = 0; j < keys.length; j++) {
      var b = map[keys[j]];
      if (!b.n) continue;
      var t2 = normalizePctTriplet(b.sum.c / b.n, b.sum.n / b.n, b.sum.p / b.n);
      out.push({
        d: keys[j],
        conservative: t2.conservative,
        centrist: t2.centrist,
        progressive: t2.progressive,
        planet: Math.round(b.sum.pl / b.n),
      });
    }
    return out.slice(-14);
  }

  function sliceLastDays(daily, n) {
    var s = daily.slice().sort(sortByDay);
    return s.slice(-n);
  }

  function buildChartSeries(period, ageKey) {
    var id = uid();
    var daily = getDailySeries(id).slice().sort(sortByDay);
    var base;
    if (period === 'week') base = aggregateWeeks(daily);
    else if (period === 'month') base = aggregateMonths(daily);
    else base = sliceLastDays(daily, 32);
    return base.map(function (pt) {
      return applyAgeDemo(pt, ageKey);
    });
  }

  function sparkPoints(series) {
    var xs = series.length ? series : [{ conservative: 33, centrist: 34, progressive: 33 }];
    var vals = xs.map(function (p) {
      return p.progressive - p.conservative;
    });
    var w = 88;
    var h = 28;
    var pad = 2;
    var min = -48;
    var max = 48;
    var n = vals.length;
    var pts = [];
    for (var i = 0; i < n; i++) {
      var v = Math.max(min, Math.min(max, vals[i]));
      var x = pad + (i * (w - pad * 2)) / Math.max(1, n - 1);
      var y = pad + ((max - v) / (max - min)) * (h - pad * 2);
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    return { d: 'M' + pts.join(' L'), w: w, h: h };
  }

  function refreshMini() {
    var btn = el('sc-tendency-mini');
    var path = el('sc-tendency-mini-path');
    if (!btn || !path) return;
    ensureTwoWeekWindow();
    var series = sliceLastDays(getDailySeries(uid()), 21);
    var sp = sparkPoints(series);
    path.setAttribute('d', sp.d);
    btn.setAttribute('title', '[성향변화 추이] 최근 ' + series.length + '일 (클릭)');
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderModalChart(period, ageKey) {
    var wrap = el('sc-tendency-modal-chart');
    if (!wrap) return;
    var data = buildChartSeries(period, ageKey);
    if (!data.length) {
      wrap.innerHTML = '<p class="muted">표시할 데이터가 없습니다.</p>';
      return;
    }
    var W = 560;
    var H = 220;
    var padL = 42;
    var padR = 12;
    var padT = 14;
    var padB = 36;
    var innerW = W - padL - padR;
    var innerH = H - padT - padB;
    var n = data.length;
    function xAt(i) {
      return padL + (i * innerW) / Math.max(1, n - 1);
    }
    function yAt(v) {
      return padT + ((100 - v) / 100) * innerH;
    }
    function lineFor(getter) {
      var parts = [];
      for (var i = 0; i < n; i++) {
        var x = xAt(i);
        var y = yAt(getter(data[i]));
        parts.push(i === 0 ? 'M' + x.toFixed(1) + ',' + y.toFixed(1) : 'L' + x.toFixed(1) + ',' + y.toFixed(1));
      }
      return parts.join(' ');
    }
    var lc = lineFor(function (p) {
      return p.conservative;
    });
    var ln = lineFor(function (p) {
      return p.centrist;
    });
    var lp = lineFor(function (p) {
      return p.progressive;
    });
    var xLabels = '';
    for (var j = 0; j < n; j++) {
      if (n > 14 && j % 2 === 1) continue;
      var lx = xAt(j);
      var lab = period === 'month' ? String(data[j].d) : String(data[j].d).slice(5);
      xLabels +=
        '<text x="' +
        lx.toFixed(1) +
        '" y="' +
        (H - 10) +
        '" fill="#94a3b8" font-size="9" text-anchor="middle">' +
        esc(lab) +
        '</text>';
    }
    wrap.innerHTML =
      '<svg class="sc-tendency-modal__svg" viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="성향 비율 추이: 진보(좌)·중도·보수(우)">' +
      '<rect x="' +
      padL +
      '" y="' +
      padT +
      '" width="' +
      innerW +
      '" height="' +
      innerH +
      '" fill="rgba(15,23,42,0.35)" stroke="rgba(148,163,184,0.25)" rx="6"/>' +
      [0, 25, 50, 75, 100]
        .map(function (g) {
          var yy = yAt(g);
          return (
            '<line x1="' +
            padL +
            '" y1="' +
            yy.toFixed(1) +
            '" x2="' +
            (W - padR) +
            '" y2="' +
            yy.toFixed(1) +
            '" stroke="rgba(148,163,184,0.15)"/>' +
            '<text x="' +
            (padL - 6) +
            '" y="' +
            (yy + 3) +
            '" fill="#64748b" font-size="10" text-anchor="end">' +
            g +
            '</text>'
          );
        })
        .join('') +
      '<path d="' +
      esc(lc) +
      '" fill="none" stroke="#fbbf24" stroke-width="2.2"/>' +
      '<path d="' +
      esc(ln) +
      '" fill="none" stroke="#c084fc" stroke-width="2.2"/>' +
      '<path d="' +
      esc(lp) +
      '" fill="none" stroke="#38bdf8" stroke-width="2.2"/>' +
      xLabels +
      '</svg>' +
      '<div class="sc-tendency-modal__legend sc-tendency-modal__legend--ltr-spectrum">' +
      '<span><span class="sc-tendency-dot sc-tendency-dot--p"></span>진보(좌)</span>' +
      '<span><span class="sc-tendency-dot sc-tendency-dot--n"></span>중도</span>' +
      '<span><span class="sc-tendency-dot sc-tendency-dot--c"></span>보수(우)</span>' +
      '</div>';
  }

  var currentPeriod = 'day';
  var currentAge = 'all';

  function setTabActive(container, attr, value) {
    var nodes = container.querySelectorAll('[' + attr + ']');
    for (var i = 0; i < nodes.length; i++) {
      var on = nodes[i].getAttribute(attr) === value;
      nodes[i].classList.toggle('is-active', on);
      if (nodes[i].getAttribute('role') === 'tab') nodes[i].setAttribute('aria-selected', on ? 'true' : 'false');
    }
  }

  function openModal() {
    ensureTwoWeekWindow();
    var m = el('sc-tendency-modal');
    if (!m) return;
    m.hidden = false;
    m.setAttribute('aria-hidden', 'false');
    setTabActive(m, 'data-period', currentPeriod);
    setTabActive(m, 'data-age', currentAge);
    renderModalChart(currentPeriod, currentAge);
    var hint = el('sc-tendency-modal-agehint');
    if (hint) {
      hint.textContent =
        currentAge === 'all'
          ? '「전체」는 이 기기에 저장된 나의 일별 스냅샷입니다.'
          : '연령대 선택 시: 서버 집계 전까지 데모 보정 곡선으로 표시됩니다.';
    }
    var closeBtn = el('sc-tendency-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    var m = el('sc-tendency-modal');
    if (!m) return;
    m.hidden = true;
    m.setAttribute('aria-hidden', 'true');
  }

  function onDocKey(ev) {
    if (ev.key === 'Escape' && el('sc-tendency-modal') && !el('sc-tendency-modal').hidden) {
      closeModal();
    }
  }

  function init() {
    var mini = el('sc-tendency-mini');
    var modal = el('sc-tendency-modal');
    if (!mini || !modal) return;
    mini.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    });
    var bd = el('sc-tendency-modal-backdrop');
    if (bd) bd.addEventListener('click', closeModal);
    var cls = el('sc-tendency-modal-close');
    if (cls) cls.addEventListener('click', closeModal);

    modal.querySelectorAll('[data-period]').forEach(function (b) {
      b.addEventListener('click', function () {
        currentPeriod = b.getAttribute('data-period') || 'day';
        setTabActive(modal, 'data-period', currentPeriod);
        renderModalChart(currentPeriod, currentAge);
      });
    });
    modal.querySelectorAll('[data-age]').forEach(function (b) {
      b.addEventListener('click', function () {
        currentAge = b.getAttribute('data-age') || 'all';
        setTabActive(modal, 'data-age', currentAge);
        var hint = el('sc-tendency-modal-agehint');
        if (hint) {
          hint.textContent =
            currentAge === 'all'
              ? '「전체」는 이 기기에 저장된 나의 일별 스냅샷입니다.'
              : '연령대 선택 시: 서버 집계 전까지 데모 보정 곡선으로 표시됩니다.';
        }
        renderModalChart(currentPeriod, currentAge);
      });
    });
    document.addEventListener('keydown', onDocKey);
    refreshMini();
  }

  global.__scTendencyTrendsRecord = recordSnapshot;
  global.__scTendencyTrendsRefreshMini = refreshMini;
  global.__scTendencyTrendsInit = init;
  global.__scTendencyTrendsOnAlignmentRefresh = function () {
    try {
      recordSnapshot();
    } catch (_) {}
    refreshMini();
  };
})(typeof window !== 'undefined' ? window : globalThis);
