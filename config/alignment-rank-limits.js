/**
 * =============================================================================
 * 랭크별 성향치 상한 + 단일 게시물 누적 상한
 * =============================================================================
 * - **메인 벨트(질서·개혁)** 축에 랭크 표를 적용한다.
 * - 외계행성(KANTAPBIYA)은 정치 성향 축과 분리 — 행동 moderation 체류만.
 * - 한 게시물에서 작자에게 들어가는 성향치는 **게시물당 캡**으로 제한.
 * =============================================================================
 */

'use strict';

/**
 * @typedef {Object} RankAlignmentRow
 * @property {number} rank
 * @property {string} labelKo
 * @property {number} maxAxisScore
 * @property {number} perPostAxisCap
 */

/** @type {ReadonlyArray<RankAlignmentRow>} */
const RANK_ALIGNMENT_TABLE = Object.freeze([
  { rank: 1, labelKo: '1티어(시작)', maxAxisScore: 3_000, perPostAxisCap: 120 },
  { rank: 2, labelKo: '2티어', maxAxisScore: 8_000, perPostAxisCap: 200 },
  { rank: 3, labelKo: '3티어', maxAxisScore: 20_000, perPostAxisCap: 320 },
  { rank: 4, labelKo: '4티어', maxAxisScore: 45_000, perPostAxisCap: 480 },
  { rank: 5, labelKo: '5티어', maxAxisScore: 90_000, perPostAxisCap: 720 },
  { rank: 6, labelKo: '6티어', maxAxisScore: 160_000, perPostAxisCap: 1_000 },
  { rank: 7, labelKo: '7티어', maxAxisScore: 260_000, perPostAxisCap: 1_400 },
  { rank: 8, labelKo: '8티어', maxAxisScore: 400_000, perPostAxisCap: 1_800 },
  { rank: 9, labelKo: '9티어', maxAxisScore: 600_000, perPostAxisCap: 2_200 },
  { rank: 10, labelKo: '10티어(상한 완화)', maxAxisScore: 1_000_000, perPostAxisCap: 3_000 },
]);

const DESIGN_ASSUMPTION_MAU = 100_000;

function getRankAlignmentRow(rank) {
  var r = Math.floor(Number(rank));
  if (!isFinite(r) || r < 1) return RANK_ALIGNMENT_TABLE[0] || null;
  if (r > RANK_ALIGNMENT_TABLE.length) return RANK_ALIGNMENT_TABLE[RANK_ALIGNMENT_TABLE.length - 1] || null;
  return RANK_ALIGNMENT_TABLE[r - 1] || null;
}

/** 외계행성 단일 허브 — 정치 축 클램프 없음(행동 moderation만) */
function getKantapbiyaRankAlignmentLimits() {
  return Object.freeze({
    hubTerritoryId: 'KANTAPBIYA',
    ranks: RANK_ALIGNMENT_TABLE,
    noteKo: '외계행성은 행동 관측 기지. planetPct·좌우 신호구역 없음.',
  });
}

function getPublicRankAlignmentLimits() {
  return Object.freeze({
    designAssumptionMau: DESIGN_ASSUMPTION_MAU,
    ranks: RANK_ALIGNMENT_TABLE,
    kantapbiya: getKantapbiyaRankAlignmentLimits(),
    notesKo: [
      '질서·개혁를 “각각의 축”으로 둘 때: 각 축이 maxAxisScore를 넘지 못하게 클램프.',
      '한 게시물에서 작자에게 쌓이는 “그 축 합”은 perPostAxisCap을 넘지 못하게 클램프.',
      '외계행성(KANTAPBIYA)은 정치 성향 축과 분리 — moderation 체류만.',
    ],
  });
}

module.exports = Object.freeze({
  DESIGN_ASSUMPTION_MAU,
  RANK_ALIGNMENT_TABLE,
  getRankAlignmentRow,
  getKantapbiyaRankAlignmentLimits,
  getPublicRankAlignmentLimits,
});
