/**
 * 센텐스크래프트 — 정치색(보수·중도·진보) 점수 로직 (브라우저 전용)
 *
 * 규칙 요약
 * 1) 각 유저는 conservative / centrist / progressive 양수 누적치를 가진다.
 * 2) 화면 막대는 세 값을 합으로 나눈 비율(≈100%)로 표시한다.
 * 3) 타인 글에 좋아요/싫어요를 누른 사람(반응자): 작성자 성향의 "맞은 꼭짓점 반대편"으로 밀린다.
 *    - 좋아요: 반대 방향으로 더 크게 (+)
 *    - 싫어요: 같은 반대축에서 되돌림(−) — 상반 축을 유지하되 약하게
 * 4) 내 글에 남이 반응하면 작성자(나): 반응자 성향 방향으로 (+) / 반대로 (−)
 *    - 좋아요: 반응자 단위벡터 방향으로 가산
 *    - 싫어요: 반응자 단위벡터 반대로 가산(빼기)
 */
(function (global) {
  var EPS = 1e-6;
  var MIN_AXIS = 0.5;
  var W_REACTOR_LIKE = 2.4;
  var W_REACTOR_DISLIKE = -1.1;
  var W_AUTHOR_LIKE = 2.8;
  var W_AUTHOR_DISLIKE = -2.0;

  function clampAxis(x) {
    var n = Number(x);
    if (!isFinite(n)) return MIN_AXIS;
    return Math.max(MIN_AXIS, n);
  }

  function initialScores() {
    return { conservative: 4, centrist: 4, progressive: 4 };
  }

  /** L1 정규화 → 단위(합=1) */
  function unit3(s) {
    var c = clampAxis(s.conservative);
    var n = clampAxis(s.centrist);
    var p = clampAxis(s.progressive);
    var t = c + n + p;
    return { conservative: c / t, centrist: n / t, progressive: p / t };
  }

  /** 화면용 퍼센트 (합 100 근사) */
  function toDisplayPercent(s) {
    var u = unit3(s);
    var r = Math.round(u.conservative * 100);
    var c = Math.round(u.centrist * 100);
    var l = Math.max(0, 100 - r - c);
    return { conservative: r, centrist: c, progressive: l };
  }

  function argmax3(u) {
    var c = u.conservative;
    var n = u.centrist;
    var p = u.progressive;
    if (c >= n && c >= p) return 0;
    if (n >= c && n >= p) return 1;
    return 2;
  }

  /**
   * 작성자 단위벡터 u에 대해, 가장 큰 성분의 "반대 면" 중심으로 가는 방향 벡터(합=1, 성분≥0).
   * 균형(세 축 비슷)이면 살짝 퍼짐(중도·양극 동시 소량).
   */
  function oppositeFaceUnit(u) {
    var c = u.conservative;
    var n = u.centrist;
    var p = u.progressive;
    var spread = Math.max(c, n, p) - Math.min(c, n, p);
    if (spread < 0.08) {
      return unit3({ conservative: 1, centrist: 1.12, progressive: 1 });
    }
    var ax = argmax3(u);
    if (ax === 0) return unit3({ conservative: 0, centrist: 1, progressive: 1 });
    if (ax === 1) return unit3({ conservative: 1, centrist: 0, progressive: 1 });
    return unit3({ conservative: 1, centrist: 1, progressive: 0 });
  }

  function scaleVec(v, k) {
    return {
      conservative: v.conservative * k,
      centrist: v.centrist * k,
      progressive: v.progressive * k,
    };
  }

  /**
   * 반응자: 타인 글에 좋아요/싫어요
   * → 작성자 성향의 반대편으로(단위 oppositeFaceUnit) 가중.
   */
  function deltaReactorOnOthersPost(actorScores, authorScores, isLike) {
    var uA = unit3(authorScores);
    var dir = oppositeFaceUnit(uA);
    var w = isLike ? W_REACTOR_LIKE : W_REACTOR_DISLIKE;
    return scaleVec(dir, w);
  }

  /**
   * 작성자: 내 글에 남의 반응
   * → 좋아요: 반응자 성향 방향(+), 싫어요: 반응자 성향 반대(−)
   */
  function deltaAuthorReceivingReaction(authorScores, reactorScores, isLike) {
    var uR = unit3(reactorScores);
    var w = isLike ? W_AUTHOR_LIKE : W_AUTHOR_DISLIKE;
    return scaleVec(uR, w);
  }

  function applyDelta(scores, delta) {
    return {
      conservative: clampAxis((scores && scores.conservative) + delta.conservative),
      centrist: clampAxis((scores && scores.centrist) + delta.centrist),
      progressive: clampAxis((scores && scores.progressive) + delta.progressive),
    };
  }

  /** 보수−진보 격차: 미만이면 표시·라벨은 중립 */
  var LEAN_NEUTRAL_MAX = 12;
  /** 격차가 이상이면 “약함”, 그 이상이면 분명한 한쪽 */
  var LEAN_MILD_MAX = 25;

  /**
   * 화면용 최종 기울기 — 양극(보수·진보) 격차만 사용. 중도 축은 영토 해금 등 내부 계산용.
   * @returns {{ gap: number, side: 'neutral'|'conservative'|'progressive', tier: 'neutral'|'mild'|'strong', conservative: number, centrist: number, progressive: number }}
   */
  function leanFromPercent(pct) {
    var r = Math.max(0, Number(pct && pct.conservative) || 0);
    var l = Math.max(0, Number(pct && pct.progressive) || 0);
    var c = Math.max(0, Number(pct && pct.centrist) || 0);
    var gap = Math.abs(r - l);
    var side = 'neutral';
    if (gap >= 0.5) {
      if (r > l) side = 'conservative';
      else if (l > r) side = 'progressive';
    }
    var tier = 'neutral';
    if (gap >= LEAN_MILD_MAX) tier = 'strong';
    else if (gap >= LEAN_NEUTRAL_MAX) tier = 'mild';
    return {
      gap: Math.round(gap),
      side: side,
      tier: tier,
      conservative: r,
      centrist: c,
      progressive: l,
    };
  }

  function tendencyLabelFromPercent(pct) {
    var lean = leanFromPercent(pct);
    if (lean.tier === 'neutral') return '중립';
    var pole = lean.side === 'conservative' ? '보수' : '진보';
    var suffix = lean.tier === 'mild' ? ' (약함)' : '';
    return pole + ' +' + lean.gap + suffix;
  }

  /** 도크 막대 아래 설명 */
  function tendencyLegendFromPercent(pct) {
    var lean = leanFromPercent(pct);
    if (lean.tier === 'neutral') {
      return lean.gap > 0
        ? '사람 · 중립 (보수·진보 격차 ' + lean.gap + ')'
        : '사람 · 중립';
    }
    var pole = lean.side === 'conservative' ? '보수' : '진보';
    var strength = lean.tier === 'mild' ? '약한 ' : '';
    return (
      '사람 · ' +
      strength +
      pole +
      ' 쪽 +' +
      lean.gap +
      ' · 영토 해금은 축별 40% 기준'
    );
  }

  /** 스펙트럼 막대: 중립=가운데, 한쪽 기울기=보수(좌)·진보(우) 비율 */
  function leanBarWidths(pct) {
    var lean = leanFromPercent(pct);
    var g = Math.min(50, lean.gap);
    if (lean.tier === 'neutral') {
      return { conservative: 0, centrist: 100, progressive: 0 };
    }
    var half = g / 2;
    if (lean.side === 'conservative') {
      return { conservative: 50 + half, centrist: 0, progressive: 50 - half };
    }
    return { conservative: 50 - half, centrist: 0, progressive: 50 + half };
  }

  global.AlignmentScoring = {
    EPS: EPS,
    MIN_AXIS: MIN_AXIS,
    initialScores: initialScores,
    unit3: unit3,
    toDisplayPercent: toDisplayPercent,
    oppositeFaceUnit: oppositeFaceUnit,
    deltaReactorOnOthersPost: deltaReactorOnOthersPost,
    deltaAuthorReceivingReaction: deltaAuthorReceivingReaction,
    applyDelta: applyDelta,
    LEAN_NEUTRAL_MAX: LEAN_NEUTRAL_MAX,
    LEAN_MILD_MAX: LEAN_MILD_MAX,
    leanFromPercent: leanFromPercent,
    leanBarWidths: leanBarWidths,
    tendencyLabelFromPercent: tendencyLabelFromPercent,
    tendencyLegendFromPercent: tendencyLegendFromPercent,
  };
})(typeof window !== 'undefined' ? window : this);
