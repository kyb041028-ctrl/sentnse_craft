/**
 * 레벨·명성·게시판 권한 안내 (상단 탭 화면)
 */
(function (global) {
  'use strict';

  var SUB_TABS = [
    { id: 'level', label: '레벨' },
    { id: 'rank', label: '명성' },
    { id: 'board', label: '게시판·성향' },
  ];

  var activeSub = 'level';
  var inited = false;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function guideData() {
    var P = global.PlayerProgression;
    if (P && typeof P.getPermissionsGuideData === 'function') {
      return P.getPermissionsGuideData();
    }
    return {
      maxLevel: 5,
      lurkUnlockLevel: 3,
      rankUnlockLevel: 4,
      xpRewards: { post_write: 25, board_comment: 12, issue_comment: 10 },
      xpPerLevel: [40, 50, 60, 70, 80],
      levelCumulativeXp: [0, 40, 90, 150, 220, 300],
      rankTiers: [
        { tier: 1, labelKo: '시민' },
        { tier: 2, labelKo: '논객' },
        { tier: 3, labelKo: '대표' },
        { tier: 4, labelKo: '지도자' },
      ],
      rankAbsolute: {
        2: { postLikes: 3, commentLikes: 2, followers: 2 },
        3: { postLikes: 15, commentLikes: 8, followers: 8 },
        4: { postLikes: 40, commentLikes: 20, followers: 20 },
      },
      rankCaps: { politicianMaxRatio: 0.1, chiefsMaxCount: 5 },
    };
  }

  function renderLevelPanel(d) {
    var lurkLv = d.lurkUnlockLevel || 3;
    var rows = '';
    for (var lv = 1; lv <= d.maxLevel; lv++) {
      var cum = d.levelCumulativeXp[lv - 1] || 0;
      var need = d.xpPerLevel[lv - 1] || 0;
      var perks = [];
      if (lv === 1) perks.push('중앙광장 글·댓글·반응');
      if (lv < lurkLv) perks.push('타 영토 1단계 읽기(누구나) · 쓰기는 성향 40% 필요');
      if (lv === lurkLv) {
        perks.push('타 영토 탐색 UX(잠금 배너 해제) · 1단계 눈팅 정리');
      }
      if (lv === d.rankUnlockLevel) {
        perks.push('명성 등급(참여자→시민) 표시·집계 시작');
      }
      rows +=
        '<tr><td>Lv.' +
        lv +
        '</td><td>' +
        need +
        ' XP</td><td>' +
        cum +
        '+</td><td>' +
        esc(perks.join(' · ') || '—') +
        '</td></tr>';
    }
    return (
      '<section class="perm-guide__section">' +
      '<h3 class="perm-guide__h">레벨 1~' +
      d.maxLevel +
      '</h3>' +
      '<p class="perm-guide__lead">글쓰기·댓글·데일리 이슈 댓글로 경험치를 쌓습니다. <strong>Lv.' +
      lurkLv +
      '</strong>부터 타 영토 탐색이 편해지고, <strong>Lv.' +
      d.rankUnlockLevel +
      '</strong>에 <strong>명성 등급</strong>이 열립니다.</p>' +
      '<table class="perm-guide__table"><thead><tr><th>레벨</th><th>이번 단계 XP</th><th>누적 XP</th><th>주요 효과</th></tr></thead><tbody>' +
      rows +
      '</tbody></table>' +
      '<ul class="perm-guide__list">' +
      '<li>자유 글 작성: <strong>+' +
      d.xpRewards.post_write +
      ' XP</strong></li>' +
      '<li>게시판 댓글: <strong>+' +
      d.xpRewards.board_comment +
      ' XP</strong></li>' +
      '<li>데일리 이슈 댓글: <strong>+' +
      d.xpRewards.issue_comment +
      ' XP</strong></li>' +
      '<li>받은 좋아요·팔로워는 <strong>명성 등급</strong>에만 반영됩니다.</li>' +
      '</ul></section>'
    );
  }

  function renderRankPanel(d) {
    var abs = d.rankAbsolute;
    function rowTier(tier, label, extra) {
      var th = abs[tier];
      var cond = '—';
      if (th) {
        cond =
          '글 좋아요 ' +
          th.postLikes +
          '+ · 댓글 좋아요 ' +
          th.commentLikes +
          '+ · 팔로워 ' +
          th.followers +
          '+';
      }
      return (
        '<tr><td><strong>' +
        esc(label) +
        '</strong></td><td>' +
        cond +
        '</td><td>' +
        esc(extra || '') +
        '</td></tr>'
      );
    }
    var capPct = Math.round((d.rankCaps.politicianMaxRatio || 0.1) * 100);
    return (
      '<section class="perm-guide__section">' +
      '<h3 class="perm-guide__h">명성·등급 (Lv.' +
      d.rankUnlockLevel +
      ' 이후)</h3>' +
      '<p class="perm-guide__lead"><strong>명성 등급</strong>은 받은 좋아요·팔로워 <strong>절대 기준</strong>과 영토당 인구 캡으로 정합니다. 정치 성향·외계 체류와 무관합니다.</p>' +
      '<table class="perm-guide__table"><thead><tr><th>등급</th><th>절대 조건 (동시 충족)</th><th>비고</th></tr></thead><tbody>' +
      '<tr><td><strong>참여자</strong></td><td>—</td><td>Lv.' +
      d.rankUnlockLevel +
      ' 미만 · 명성 미집계</td></tr>' +
      '<tr><td><strong>시민</strong></td><td>—</td><td>Lv.' +
      d.rankUnlockLevel +
      '+ 기본 등급 · 논객 조건 미달</td></tr>' +
      rowTier(2, '논객', '인구 캡으로 한 단계 낮아질 수 있음') +
      rowTier(3, '대표', '영토당 최대 약 ' + capPct + '% 인원') +
      rowTier(4, '지도자', '영토당 최대 ' + (d.rankCaps.chiefsMaxCount || 5) + '명') +
      '</tbody></table>' +
      '<ul class="perm-guide__list">' +
      '<li>리더보드 명성 점수 = 글♥ + 댓글♥×2 + 팔로워×' +
      (d.rankFollowerWeight || 5) +
      ' (등급 결정과 별개)</li>' +
      '<li>대표·지도자 자리가 꽉 차면 한 단계 낮은 등급으로 조정될 수 있습니다.</li>' +
      '</ul></section>'
    );
  }

  function renderBoardPanel() {
    var d = guideData();
    var lurkLv = d.lurkUnlockLevel || 3;
    return (
      '<section class="perm-guide__section">' +
      '<h3 class="perm-guide__h">게시판 · 성향</h3>' +
      '<p class="perm-guide__lead">중앙광장은 <strong>모든 성향</strong>의 공용 공간입니다. 개혁·질서 영토는 <strong>성향 %</strong>로 단계가 열립니다. 외계행성은 정치와 분리된 <strong>행동 관측 기지</strong>입니다.</p>' +
      '<table class="perm-guide__table"><thead><tr><th>구역</th><th>읽기</th><th>글·댓글·반응</th></tr></thead><tbody>' +
      '<tr><td><strong>중앙광장</strong></td><td>전원</td><td>전원 (외계 체류 중에는 글·댓글 제한, 공감·읽기 가능)</td></tr>' +
      '<tr><td><strong>개혁·질서</strong> 1단계</td><td>전원</td><td>해당 축 <strong>40%+</strong></td></tr>' +
      '<tr><td><strong>개혁·질서</strong> 2단계</td><td>1단계 해금(40%+) 시</td><td>해당 축 <strong>60%+</strong></td></tr>' +
      '<tr><td><strong>외계행성</strong></td><td>허브 열람 가능</td><td><strong>행동 관측 체류(유배) 중</strong>만 글·댓글 · 자유·관측·밈·생존일지</td></tr>' +
      '<tr><td><strong>3·4단계</strong></td><td colspan="2">추후 공개</td></tr>' +
      '</tbody></table>' +
      '<h4 class="perm-guide__subh">눈팅 모드 (성향 미달 · 읽기만)</h4>' +
      '<ul class="perm-guide__list">' +
      '<li>개혁·질서 <strong>1·2단계</strong>: 목록·본문 <strong>읽기만</strong> 가능 (성향 해금 전).</li>' +
      '<li>글쓰기·댓글·좋아요·싫어요·공감은 <strong>불가</strong>.</li>' +
      '<li><strong>Lv.' +
      lurkLv +
      '+</strong>이면 타 영토 탐색 시 잠금 배너가 정리되어 관측자 UX가 편해집니다.</li>' +
      '</ul>' +
      '<h4 class="perm-guide__subh">성향 (사람 축)</h4>' +
      '<ul class="perm-guide__list">' +
      '<li>표시: 질서−개혁 격차 — 12 미만 <strong>중립</strong>, 12~24 약한 한쪽, 25+ 분명한 한쪽.</li>' +
      '<li>소속: 질서·개혁 각 40% 미만이면 <strong>중앙광장</strong>. (정치 성향은 제재 대상 아님)</li>' +
      '<li>게시판 공감은 성향 무영향 · 좋아요/싫어요만 반영.</li>' +
      '</ul>' +
      '<h4 class="perm-guide__subh">외계행성 · 행동 관측</h4>' +
      '<ul class="perm-guide__list">' +
      '<li>입장 조건: <strong>반복 신고·도배·과열·쿨다운 위반</strong> 등 운영/행동 기반 체류만.</li>' +
      '<li>체류 단계: 3·7·14·30·90일 등 (외계 N차 문화).</li>' +
      '<li>지구 게시판의 외계 유저 글: 블라인드 + 「외계 관측구역 전용 표현입니다」.</li>' +
      '<li><strong>planetPct·외계인 %·진보/보수 신호구역 없음.</strong></li>' +
      '</ul></section>'
    );
  }

  function renderPanel(sub) {
    var d = guideData();
    if (sub === 'rank') return renderRankPanel(d);
    if (sub === 'board') return renderBoardPanel();
    return renderLevelPanel(d);
  }

  function syncSubTabs() {
    var nav = document.getElementById('perm-guide-subnav');
    if (!nav) return;
    var btns = nav.querySelectorAll('[data-perm-sub]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var on = b.getAttribute('data-perm-sub') === activeSub;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    }
    var panel = document.getElementById('perm-guide-panel');
    if (panel) panel.innerHTML = renderPanel(activeSub);
  }

  function init() {
    if (inited) return;
    var nav = document.getElementById('perm-guide-subnav');
    if (!nav) return;
    inited = true;
    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-perm-sub]');
      if (!btn) return;
      activeSub = btn.getAttribute('data-perm-sub') || 'level';
      syncSubTabs();
    });
    syncSubTabs();
  }

  function refresh() {
    if (!inited) init();
    else syncSubTabs();
  }

  global.PermissionsGuide = {
    init: init,
    refresh: refresh,
    setSubTab: function (sub) {
      activeSub = sub || 'level';
      syncSubTabs();
    },
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else if (document.getElementById('perm-guide-subnav')) {
      init();
    }
  }
})(typeof window !== 'undefined' ? window : this);
