/**
 * 센텐스크래프트 — 전체/소속 랭킹 보기 (1~100위)
 */
(function (global) {
  'use strict';

  var MODE_GLOBAL = 'global';
  var MODE_TERRITORY = 'territory';
  var currentMode = MODE_GLOBAL;

  function meId() {
    return String((global.__scPlayer && global.__scPlayer.userId) || 'guest').trim() || 'guest';
  }

  function P() {
    return global.PlayerProgression;
  }

  function openModal() {
    var modal = document.getElementById('sc-rank-modal');
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    renderModal();
  }

  function closeModal() {
    var modal = document.getElementById('sc-rank-modal');
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  }

  function setActiveTab(mode) {
    currentMode = mode;
    var tabs = document.querySelectorAll('.sc-rank-modal__tab');
    tabs.forEach(function (btn) {
      var on = btn.getAttribute('data-mode') === mode;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderModal();
  }

  function renderModal() {
    var prog = P();
    if (!prog) return;
    var listEl = document.getElementById('sc-rank-modal-list');
    var myEl = document.getElementById('sc-rank-modal-my');
    var titleEl = document.getElementById('sc-rank-modal-title');
    if (!listEl) return;

    var uid = meId();
    var standings = prog.getMyStandings(uid);
    var tid = standings.territoryId || 'CENTRIST';
    var board =
      currentMode === MODE_TERRITORY ? prog.getLeaderboard(tid) : prog.getLeaderboard(null);

    if (titleEl) {
      titleEl.textContent =
        currentMode === MODE_TERRITORY
          ? '소속별 랭킹 · ' + prog.territoryLabelKo(tid)
          : '전체 랭킹 (소속 무관)';
    }

    if (myEl) {
      if (currentMode === MODE_TERRITORY) {
        myEl.textContent =
          '내 순위: ' +
          (standings.territoryRank != null
            ? standings.territoryRank + '위 / ' + standings.territoryTotal + '명'
            : '—') +
          ' · 점수 ' +
          standings.score.toLocaleString('ko-KR') +
          ' · 팔로워 ' +
          standings.followers.toLocaleString('ko-KR') +
          '명';
      } else {
        myEl.textContent =
          '내 순위: ' +
          (standings.globalRank != null
            ? standings.globalRank + '위 / ' + standings.globalTotal + '명'
            : '—') +
          ' · 점수 ' +
          standings.score.toLocaleString('ko-KR') +
          ' · 팔로워 ' +
          standings.followers.toLocaleString('ko-KR') +
          '명';
      }
    }

    listEl.textContent = '';
    if (!board.top.length) {
      var empty = document.createElement('li');
      empty.className = 'sc-rank-modal__empty muted';
      empty.textContent = '집계된 유저가 없습니다.';
      listEl.appendChild(empty);
      return;
    }

    board.top.forEach(function (row, idx) {
      var li = document.createElement('li');
      var rankNum = idx + 1;
      var isMe = row.userId === uid;
      li.className = 'sc-rank-modal__item' + (isMe ? ' is-me' : '');
      li.innerHTML =
        '<span class="sc-rank-modal__pos">' +
        rankNum +
        '</span>' +
        '<span class="sc-rank-modal__main">' +
        '<strong>' +
        escapeHtml(shortUserId(row.userId)) +
        '</strong>' +
        ' · ' +
        escapeHtml(row.rankTitle) +
        ' · Lv.' +
        row.level +
        '</span>' +
        '<span class="sc-rank-modal__sub">' +
        '점수 ' +
        row.score.toLocaleString('ko-KR') +
        ' · ' +
        escapeHtml(row.territoryLabel) +
        ' · 팔로워 ' +
        row.followers +
        '</span>';
      listEl.appendChild(li);
    });

    if (board.total > prog.LEADERBOARD_MAX) {
      var more = document.createElement('li');
      more.className = 'sc-rank-modal__more muted';
      more.textContent = '상위 ' + prog.LEADERBOARD_MAX + '위까지만 표시 (전체 ' + board.total + '명)';
      listEl.appendChild(more);
    }
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shortUserId(id) {
    var s = String(id || '');
    if (s.length <= 18) return s;
    return s.slice(0, 8) + '…' + s.slice(-6);
  }

  function initUi() {
    var btnOpen = document.getElementById('avatar-btn-rankings');
    var btnClose = document.getElementById('sc-rank-modal-close');
    var backdrop = document.getElementById('sc-rank-modal-backdrop');
    var modal = document.getElementById('sc-rank-modal');
    var tabs = document.querySelectorAll('.sc-rank-modal__tab');

    if (btnOpen) {
      btnOpen.addEventListener('click', function () {
        openModal();
      });
    }
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setActiveTab(tab.getAttribute('data-mode') || MODE_GLOBAL);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
    });
  }

  global.RankLeaderboard = {
    open: openModal,
    close: closeModal,
    refresh: renderModal,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUi);
  } else {
    initUi();
  }
})(typeof window !== 'undefined' ? window : this);
