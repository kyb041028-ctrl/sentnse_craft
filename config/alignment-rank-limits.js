/**
 * =============================================================================
 * ??겕蹂??깊뼢移??곹븳 + ?⑥씪 寃뚯떆臾??꾩쟻 ?곹븳
 * =============================================================================
 * - **硫붿씤 踰⑦듃(吏덉꽌쨌媛쒗쁺)** 異뺤뿉 ??겕 ?쒕? ?곸슜?쒕떎.
 * - ?멸퀎?됱꽦(KANTAPBIYA)? ?뺤튂 ?깊뼢 異뺢낵 遺꾨━ ???됰룞 moderation 泥대쪟留?
 * - ??寃뚯떆臾쇱뿉???묒옄?먭쾶 ?ㅼ뼱媛???깊뼢移섎뒗 **寃뚯떆臾쇰떦 罹?*?쇰줈 ?쒗븳.
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
  { rank: 1, labelKo: '1?곗뼱(?쒖옉)', maxAxisScore: 3_000, perPostAxisCap: 120 },
  { rank: 2, labelKo: '2?곗뼱', maxAxisScore: 8_000, perPostAxisCap: 200 },
  { rank: 3, labelKo: '3?곗뼱', maxAxisScore: 20_000, perPostAxisCap: 320 },
  { rank: 4, labelKo: '4?곗뼱', maxAxisScore: 45_000, perPostAxisCap: 480 },
  { rank: 5, labelKo: '5?곗뼱', maxAxisScore: 90_000, perPostAxisCap: 720 },
  { rank: 6, labelKo: '6?곗뼱', maxAxisScore: 160_000, perPostAxisCap: 1_000 },
  { rank: 7, labelKo: '7?곗뼱', maxAxisScore: 260_000, perPostAxisCap: 1_400 },
  { rank: 8, labelKo: '8?곗뼱', maxAxisScore: 400_000, perPostAxisCap: 1_800 },
  { rank: 9, labelKo: '9?곗뼱', maxAxisScore: 600_000, perPostAxisCap: 2_200 },
  { rank: 10, labelKo: '10?곗뼱(?곹븳 ?꾪솕)', maxAxisScore: 1_000_000, perPostAxisCap: 3_000 },
]);

const DESIGN_ASSUMPTION_MAU = 100_000;

function getRankAlignmentRow(rank) {
  var r = Math.floor(Number(rank));
  if (!isFinite(r) || r < 1) return RANK_ALIGNMENT_TABLE[0] || null;
  if (r > RANK_ALIGNMENT_TABLE.length) return RANK_ALIGNMENT_TABLE[RANK_ALIGNMENT_TABLE.length - 1] || null;
  return RANK_ALIGNMENT_TABLE[r - 1] || null;
}

/** ?멸퀎?됱꽦 ?⑥씪 ?덈툕 ???뺤튂 異??대옩???놁쓬(?됰룞 moderation留? */
function getKantapbiyaRankAlignmentLimits() {
  return Object.freeze({
    hubTerritoryId: 'KANTAPBIYA',
    ranks: RANK_ALIGNMENT_TABLE,
    noteKo: '?멸퀎?됱꽦? ?됰룞 愿痢?湲곗?. planetPct쨌醫뚯슦 ?좏샇援ъ뿭 ?놁쓬.',
  });
}

function getPublicRankAlignmentLimits() {
  return Object.freeze({
    designAssumptionMau: DESIGN_ASSUMPTION_MAU,
    ranks: RANK_ALIGNMENT_TABLE,
    kantapbiya: getKantapbiyaRankAlignmentLimits(),
    notesKo: [
      '吏덉꽌쨌媛쒗쁺瑜??쒓컖媛곸쓽 異뺚앹쑝濡????? 媛?異뺤씠 maxAxisScore瑜??섏? 紐삵븯寃??대옩??',
      '??寃뚯떆臾쇱뿉???묒옄?먭쾶 ?볦씠???쒓렇 異??⒱앹? perPostAxisCap???섏? 紐삵븯寃??대옩??',
      '?멸퀎?됱꽦(KANTAPBIYA)? ?뺤튂 ?깊뼢 異뺢낵 遺꾨━ ??moderation 泥대쪟留?',
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

