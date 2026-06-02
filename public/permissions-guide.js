/**
 * 레벨·랭크·게시판 권한 안내 (상단 탭 화면)
 */
(function (global) {
  'use strict';

  var SUB_TABS = [
    { id: 'level', label: '레벨' },
    { id: 'rank', label: '랭크' },
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
      rankUnlockLevel: 5,
      xpRewards: { post_write: 25, board_comment: 12, issue_comment: 10 },
      xpPerLevel: [40, 50, 60, 70, 80],
      levelCumulativeXp: [0, 40, 90, 150, 220, 300],
      rankTiers: [
        { tier: 1, labelKo: '일반시민' },
        { tier: 2, labelKo: '평론가' },
        { tier: 3, labelKo: '정치인' },
        { tier: 4, labelKo: '총수' },
      ],
      rankAbsolute: {
        2: { postLikes: 3, commentLikes: 2, followers: 2 },
        3: { postLikes: 15, commentLikes: 8, followers: 8 },
        4: { postLikes: 40, commentLikes: 20, followers: 20 },
      },
      rankCaps: { politicianMaxRatio: 0.1, chiefsMaxCount: 5 },
      citizenBottomRatio: 0.5,
    };
  }

  function renderLevelPanel(d) {
    var rows = '';
    for (var lv = 1; lv <= d.maxLevel; lv++) {
      var cum = d.levelCumulativeXp[lv - 1] || 0;
      var need = d.xpPerLevel[lv - 1] || 0;
      var perks = [];
      if (lv === 1) perks.push('중앙광장 글·댓글·반응');
      if (lv < (d.lurkUnlockLevel || 3)) perks.push('영토 게시판은 성향 해금 필요');
      if (lv === (d.lurkUnlockLevel || 3)) {
        perks.push('다른 영토 1단계 눈팅(읽기만, 중립이어도)');
      }
      if (lv === d.rankUnlockLevel) {
        perks.push('랭크(일반시민~) 표시·집계 시작');
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
      (d.lurkUnlockLevel || 3) +
      '</strong>에 타 영토 눈팅, <strong>Lv.' +
      d.rankUnlockLevel +
      '</strong>에 랭크가 열립니다.</p>' +
      '<table class="perm-guide__table"><thead><tr><th>레벨</th><th>이번 단계 XP</th><th>누적 XP</th><th>주요 권한</th></tr></thead><tbody>' +
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
      '<li>받은 좋아요는 레벨이 아니라 <strong>랭크 승급</strong>에 반영됩니다.</li>' +
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
    var bottomPct = Math.round((d.citizenBottomRatio || 0.5) * 100);
    return (
      '<section class="perm-guide__section">' +
      '<h3 class="perm-guide__h">랭크 (Lv.' +
      d.rankUnlockLevel +
      ' 이후)</h3>' +
      '<p class="perm-guide__lead">랭크는 <strong>받은 좋아요·팔로워</strong> 절대 기준과, 같은 영토 안 <strong>영향력 순위</strong>로 정해집니다. 프로필에 표시됩니다.</p>' +
      '<table class="perm-guide__table"><thead><tr><th>랭크</th><th>절대 조건 (동시 충족)</th><th>비고</th></tr></thead><tbody>' +
      rowTier(
        1,
        '일반시민',
        '승급 조건 미달이거나, 영토 내 영향력 하위 ' + bottomPct + '%',
      ) +
      rowTier(2, '평론가', '위 조건 충족 시 자동 승급 후보') +
      rowTier(3, '정치인', '영토당 최대 약 ' + capPct + '% 인원') +
      rowTier(4, '총수', '영토당 최대 ' + (d.rankCaps.chiefsMaxCount || 5) + '명') +
      '</tbody></table>' +
      '<ul class="perm-guide__list">' +
      '<li>영향력 = 받은 글 좋아요 + 댓글 좋아요×2 + 팔로워×' +
      (d.rankFollowerWeight || 5) +
      ' (대략)</li>' +
      '<li>정치인·총수 자리가 꽉 차면 한 단계 낮은 랭크로 조정될 수 있습니다.</li>' +
      '<li>랭크는 <strong>게시판 해금</strong>과 별개입니다. 영토 1단계 글쓰기는 성향 %가 필요합니다.</li>' +
      '</ul></section>'
    );
  }

  function renderBoardPanel() {
    var d = guideData();
    var lurkLv = d.lurkUnlockLevel || 3;
    return (
      '<section class="perm-guide__section">' +
      '<h3 class="perm-guide__h">게시판 · 성향</h3>' +
      '<p class="perm-guide__lead">중앙광장은 누구나 이용합니다. 영토 게시판은 <strong>성향(또는 외계인 %)</strong>으로 단계가 열립니다.</p>' +
      '<table class="perm-guide__table"><thead><tr><th>구역</th><th>읽기</th><th>글·댓글·반응</th></tr></thead><tbody>' +
      '<tr><td><strong>중앙광장</strong></td><td>전원</td><td>전원 (1단계)</td></tr>' +
      '<tr><td><strong>보수·진보</strong> 1단계</td><td>Lv.' +
      lurkLv +
      ' 눈팅 또는 해당 축 40%+</td><td>해당 축 40%+</td></tr>' +
      '<tr><td><strong>보수·진보</strong> 2단계</td><td>해당 축 60%+</td><td>해당 축 60%+</td></tr>' +
      '<tr><td><strong>깐따삐아</strong> 1단계</td><td>Lv.' +
      lurkLv +
      ' 눈팅 또는 외계인 50%+</td><td>외계인 50%+</td></tr>' +
      '<tr><td><strong>깐따삐아</strong> 2단계</td><td>외계인 50% + 사람 축 60%+</td><td>동일</td></tr>' +
      '<tr><td><strong>3·4단계</strong> (전 영토)</td><td colspan="2">추후 공개</td></tr>' +
      '</tbody></table>' +
      '<h4 class="perm-guide__subh">Lv.' +
      lurkLv +
      ' 눈팅 모드</h4>' +
      '<ul class="perm-guide__list">' +
      '<li><strong>Lv.' +
      lurkLv +
      ' 이상</strong>이면 중립(보수·진보 격차 12 미만)이어도 <strong>모든 영토 1단계</strong> 글·댓글을 <strong>읽기만</strong> 할 수 있습니다.</li>' +
      '<li>글쓰기·댓글·좋아요·싫어요·외계인 표시는 불가 (버튼 숨김).</li>' +
      '<li>2단계 이상은 눈팅 없이 기존 해금 규칙만 적용됩니다.</li>' +
      '</ul>' +
      '<h4 class="perm-guide__subh">성향 표시 (사람)</h4>' +
      '<ul class="perm-guide__list">' +
      '<li>프로필에는 <strong>보수−진보 격차</strong>만 표시: 12 미만 <strong>중립</strong>, 12~24 약한 한쪽, 25+ 분명한 한쪽.</li>' +
      '<li>영토 해금·소속은 보수·진보 두 게시판 축과 중도(균형) %를 함께 봅니다. 두 축 모두 40% 미만이면 중앙광장 소속입니다.</li>' +
      '<li>공감은 성향에 영향 없음. 엄지 좋아요/싫어요만 성향 시뮬에 반영.</li>' +
      '</ul>' +
      '<h4 class="perm-guide__subh">깐따삐아 소속 시</h4>' +
      '<ul class="perm-guide__list">' +
      '<li>지구(중앙광장·일반 영토)에 쓴 글·댓글은 블라인드 + 「외계인의 언어입니다」 안내.</li>' +
      '<li>깐따 영토 안에서는 정상적으로 읽고 쓸 수 있습니다.</li>' +
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
