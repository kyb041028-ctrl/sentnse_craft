/**
 * =============================================================================
 * 랭크별 성향치 상한 + 단일 게시물 누적 상한
 * =============================================================================
 * - **메인 벨트(보수·진보)** 축과 **외계행성(좌·우)** 축에 같은 랭크 표를 적용한다.
 * - 설계 가정: 동시에 활동하는 유저 대략 **10만 명** 규모에서도 숫자가 포화되지 않게
 *   “축당 최대치”는 랭크가 오를수록 크게 벌려 둠.
 * - 한 게시물에서 작자에게 들어가는 성향치는 **게시물당 캡**으로 제한 (다계정·끌올 방지).
 * - 실제 DB/서버에서 적용할 때: 이벤트마다 min(남은캡, 가중점수) 형태로 클램프.
 * =============================================================================
 */

'use strict';

/**
 * @typedef {Object} RankAlignmentRow
 * @property {number} rank                 1 = 최저 랭크
 * @property {string} labelKo            표기용 (나중에 랭크 테이블과 합치기)
 * @property {number} maxAxisScore       해당 구역에서 쓰는 **양 극단 축** 각각의 **최대 누적치**
 *                                       (메인: 보수·진보 / 외계행성: 좌·우)
 * @property {number} perPostAxisCap     **한 게시물**에서 해당 축으로 작자에게 더해질 수 있는 **최대 합계**
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

/** MAU 가정 (문서·밸런스 메모용, 런타임 로직에는 필수 아님) */
const DESIGN_ASSUMPTION_MAU = 100_000;

/**
 * @param {number} rank
 * @returns {RankAlignmentRow | null}
 */
function getRankAlignmentRow(rank) {
  var r = Math.floor(Number(rank));
  if (!isFinite(r) || r < 1) return RANK_ALIGNMENT_TABLE[0] || null;
  if (r > RANK_ALIGNMENT_TABLE.length) return RANK_ALIGNMENT_TABLE[RANK_ALIGNMENT_TABLE.length - 1] || null;
  return RANK_ALIGNMENT_TABLE[r - 1] || null;
}

/**
 * 외계행성 진보·보수 행성: 메인 벨트와 **동일 랭크 표**를 두 영토 축에 적용.
 * (축 이름만 다르고 maxAxisScore·perPostAxisCap 숫자는 공유)
 */
function getKantapbiyaRankAlignmentLimits() {
  return Object.freeze({
    poleAxisTerritoryIds: Object.freeze(['KANTAPBIYA_LEFT', 'KANTAPBIYA_RIGHT']),
    poleAxisLabelKo: Object.freeze({
      KANTAPBIYA_LEFT: '진보 신호구역 축',
      KANTAPBIYA_RIGHT: '보수 신호구역 축',
    }),
    ranks: RANK_ALIGNMENT_TABLE,
    noteKo:
      '메인 벨트(보수·진보)와 같은 랭크별 maxAxisScore·perPostAxisCap을, 외계행성 두 행성 영토 성향 축에 그대로 적용한다.',
  });
}

function getPublicRankAlignmentLimits() {
  return Object.freeze({
    designAssumptionMau: DESIGN_ASSUMPTION_MAU,
    /** 메인 벨트: 보수·진보 축 (기존 필드명 `ranks` 유지) */
    ranks: RANK_ALIGNMENT_TABLE,
    /** 외계행성: 진보·보수 행성 축 */
    kantapbiya: getKantapbiyaRankAlignmentLimits(),
    notesKo: [
      '보수·진보를 “각각의 축”으로 둘 때: 각 축이 maxAxisScore를 넘지 못하게 클램프.',
      '한 게시물에서 작자에게 쌓이는 “그 축 합”은 perPostAxisCap을 넘지 못하게 클램프(글·댓글·반응 합산).',
      '외계행성 두 행성도 동일 랭크 표를 쓴다 — territoryId가 KANTAPBIYA_LEFT/RIGHT일 때 축 클램프에 적용.',
      '랭크 정의(이름·승급 조건)는 별도 랭크 테이블과 합칠 것 — 여기서는 숫자만.',
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
