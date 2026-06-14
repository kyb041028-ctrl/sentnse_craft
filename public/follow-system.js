/**
 * 센텐스크래프트 — 유저 팔로우 · 새 글 알림 (localStorage)
 */
(function (global) {
  'use strict';

  var LS_KEY = 'sc_follow_v1';
  var NOTIFY_KEY = 'sc_follow_notify_v1';
  var MAX_NOTIFY = 40;

  function meId() {
    return String((global.__scPlayer && global.__scPlayer.userId) || 'guest').trim() || 'guest';
  }

  function loadGraph() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return { following: {}, followers: {} };
      var o = JSON.parse(raw);
      if (!o || typeof o !== 'object') return { following: {}, followers: {} };
      if (!o.following || typeof o.following !== 'object') o.following = {};
      if (!o.followers || typeof o.followers !== 'object') o.followers = {};
      return o;
    } catch (_) {
      return { following: {}, followers: {} };
    }
  }

  function saveGraph(g) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(g));
      return true;
    } catch (e) {
      console.warn('[follow] save failed', e);
      return false;
    }
  }

  function uniqList(arr) {
    var out = [];
    var seen = {};
    (arr || []).forEach(function (id) {
      var s = String(id || '').trim();
      if (!s || seen[s]) return;
      seen[s] = true;
      out.push(s);
    });
    return out;
  }

  function getFollowing(userId) {
    var g = loadGraph();
    return uniqList(g.following[String(userId || '').trim()]);
  }

  function getFollowers(userId) {
    var g = loadGraph();
    return uniqList(g.followers[String(userId || '').trim()]);
  }

  function getFollowerCount(userId) {
    return getFollowers(userId).length;
  }

  function isFollowing(targetId) {
    var me = meId();
    var t = String(targetId || '').trim();
    if (!t || t === me) return false;
    return getFollowing(me).indexOf(t) >= 0;
  }

  function syncProgressionFollowers(targetId) {
    var n = getFollowerCount(targetId);
    if (typeof global.__scSetFollowerCount === 'function') {
      global.__scSetFollowerCount(targetId, n);
    }
  }

  function toggleFollow(targetId) {
    var me = meId();
    var t = String(targetId || '').trim();
    if (!t || t === me) return { ok: false, reason: 'SELF' };
    var g = loadGraph();
    if (!g.following[me]) g.following[me] = [];
    if (!g.followers[t]) g.followers[t] = [];
    var fl = uniqList(g.following[me]);
    var ix = fl.indexOf(t);
    var nowFollowing;
    if (ix >= 0) {
      fl.splice(ix, 1);
      nowFollowing = false;
      var fb = uniqList(g.followers[t]);
      var j = fb.indexOf(me);
      if (j >= 0) fb.splice(j, 1);
      g.followers[t] = fb;
    } else {
      fl.push(t);
      nowFollowing = true;
      var fb2 = uniqList(g.followers[t]);
      if (fb2.indexOf(me) < 0) fb2.push(me);
      g.followers[t] = fb2;
    }
    g.following[me] = fl;
    saveGraph(g);
    syncProgressionFollowers(t);
    if (nowFollowing && String(t) === String(meId()) === false) {
      /* noop */
    }
    renderFollowButtons();
    if (global.RankLeaderboard && typeof global.RankLeaderboard.refresh === 'function') {
      var modal = document.getElementById('sc-rank-modal');
      if (modal && !modal.hidden) global.RankLeaderboard.refresh();
    }
    return { ok: true, following: nowFollowing, targetId: t };
  }

  function loadNotifyMap() {
    try {
      var raw = localStorage.getItem(NOTIFY_KEY);
      if (!raw) return {};
      var o = JSON.parse(raw);
      return o && typeof o === 'object' ? o : {};
    } catch (_) {
      return {};
    }
  }

  function saveNotifyMap(map) {
    try {
      localStorage.setItem(NOTIFY_KEY, JSON.stringify(map));
    } catch (_) {}
  }

  function pushNotification(userId, item) {
    var uid = String(userId || '').trim();
    if (!uid) return;
    var map = loadNotifyMap();
    if (!Array.isArray(map[uid])) map[uid] = [];
    map[uid].unshift(item);
    if (map[uid].length > MAX_NOTIFY) map[uid] = map[uid].slice(0, MAX_NOTIFY);
    saveNotifyMap(map);
    renderNotificationPanel();
  }

  function territoryLabel(tid) {
    var m = {
      COMMON: '중앙광장',
      CENTRIST: '중앙광장',
      CONSERVATIVE: '보수',
      PROGRESSIVE: '진보',
    KANTAPBIYA_LEFT: '외계행성 · 진보행성',
    KANTAPBIYA_RIGHT: '외계행성 · 보수행성',
      UNASSIGNED: '미편입',
    };
    return m[tid] || tid || '영토';
  }

  function onAuthorNewPost(meta) {
    var authorId = String(meta && meta.authorId || '').trim();
    if (!authorId) return;
    var followers = getFollowers(authorId);
    if (!followers.length) return;
    var note = {
      id: 'fn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      postId: String(meta.postId || ''),
      authorId: authorId,
      title: String(meta.title || '(제목 없음)').slice(0, 80),
      territoryId: String(meta.territoryId || 'COMMON'),
      stage: Math.max(1, Math.floor(Number(meta.stage) || 1)),
      createdAt: new Date().toISOString(),
      read: false,
    };
    followers.forEach(function (fid) {
      if (fid === authorId) return;
      pushNotification(fid, note);
    });
  }

  function getMyNotifications() {
    return loadNotifyMap()[meId()] || [];
  }

  function markAllRead() {
    var map = loadNotifyMap();
    var uid = meId();
    if (!Array.isArray(map[uid])) return;
    map[uid].forEach(function (n) {
      n.read = true;
    });
    saveNotifyMap(map);
    renderNotificationPanel();
  }

  function clearMyNotifications() {
    var map = loadNotifyMap();
    map[meId()] = [];
    saveNotifyMap(map);
    renderNotificationPanel();
  }

  function unreadCount() {
    return getMyNotifications().filter(function (n) {
      return !n.read;
    }).length;
  }

  function renderNotificationPanel() {
    var panel = document.getElementById('sc-follow-notify-panel');
    var list = document.getElementById('sc-follow-notify-list');
    var badge = document.getElementById('sc-follow-notify-badge');
    if (!list) return;
    var items = getMyNotifications();
    var unread = unreadCount();
    if (badge) {
      badge.textContent = String(unread);
      badge.hidden = unread <= 0;
    }
    list.textContent = '';
    if (!items.length) {
      var empty = document.createElement('li');
      empty.className = 'sc-follow-notify__empty muted';
      empty.textContent = '새 알림이 없습니다.';
      list.appendChild(empty);
      return;
    }
    items.forEach(function (n) {
      var li = document.createElement('li');
      li.className = 'sc-follow-notify__item' + (n.read ? '' : ' is-unread');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sc-follow-notify__btn';
      btn.textContent =
        (n.authorId || '유저') +
        ' · ' +
        territoryLabel(n.territoryId) +
        ' — ' +
        (n.title || '새 글');
      btn.addEventListener('click', function () {
        n.read = true;
        var map = loadNotifyMap();
        var uid = meId();
        if (Array.isArray(map[uid])) saveNotifyMap(map);
        if (typeof global.__scBoardNavigateToPost === 'function') {
          global.__scBoardNavigateToPost(n.territoryId, n.stage, n.postId);
        }
        if (panel) panel.hidden = true;
        renderNotificationPanel();
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function renderFollowButtons() {
    document.querySelectorAll('.board__follow-btn[data-author-id]').forEach(function (btn) {
      var aid = btn.getAttribute('data-author-id');
      var on = isFollowing(aid);
      btn.textContent = on ? '팔로잉 ✓' : '팔로우';
      btn.classList.toggle('is-following', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function syncAllFollowerCountsToProgression() {
    var g = loadGraph();
    Object.keys(g.followers || {}).forEach(function (targetId) {
      syncProgressionFollowers(targetId);
    });
  }

  function initNotificationUi() {
    syncAllFollowerCountsToProgression();
    var toggle = document.getElementById('sc-follow-notify-toggle');
    var panel = document.getElementById('sc-follow-notify-panel');
    var btnClear = document.getElementById('sc-follow-notify-clear');
    var btnRead = document.getElementById('sc-follow-notify-read');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.hidden = !panel.hidden;
        if (!panel.hidden) markAllRead();
      });
    }
    if (btnClear) {
      btnClear.addEventListener('click', function () {
        clearMyNotifications();
      });
    }
    if (btnRead) {
      btnRead.addEventListener('click', function () {
        markAllRead();
      });
    }
    renderNotificationPanel();
  }

  global.FollowSystem = {
    getFollowing: getFollowing,
    getFollowers: getFollowers,
    getFollowerCount: getFollowerCount,
    isFollowing: isFollowing,
    toggleFollow: toggleFollow,
    onAuthorNewPost: onAuthorNewPost,
    getMyNotifications: getMyNotifications,
    renderNotificationPanel: renderNotificationPanel,
    renderFollowButtons: renderFollowButtons,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationUi);
  } else {
    initNotificationUi();
  }
})(typeof window !== 'undefined' ? window : this);
