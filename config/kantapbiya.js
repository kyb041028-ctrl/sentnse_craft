/**
 * =============================================================================
 * 외계행성 — 예전 KANTAPBIYA_RULES + 영토(개혁·질서 행성) 맵을 한 이름으로 묶음
 * =============================================================================
 * - 극단 성향 행성 + 개혁·질서 행성 영토(게시판 4단계)
 * - 유배지 규칙(자동 사면 없음, 지구 귀환 티켓 가격, 내부 재축출 등)
 * 가격 숫자만 바꾸려면 app-config.js 의 PAYMENT_PRODUCTS 와 맞추면 됩니다.
 * =============================================================================
 */

'use strict';

const alignmentRankLimits = require('./alignment-rank-limits');

/**
 * @param {number} earthReturnTicketKrw 지구 귀환 티켓 가격(원)
 */
function buildKantapbiya(earthReturnTicketKrw) {
  const price = Number(earthReturnTicketKrw);
  return Object.freeze({
    /** DB·이벤트용 구역 키 (예전 zoneKey 와 동일 의미) */
    id: 'KANTAPBIYA',
    labelKo: '외계행성',

    /** 개혁·질서 행성 (각 4단계 게시판) */
    territory: Object.freeze({
      left: Object.freeze({
        id: 'KANTAPBIYA_LEFT',
        labelKo: '개혁 신호구역',
        forumTierCount: 4,
      }),
      right: Object.freeze({
        id: 'KANTAPBIYA_RIGHT',
        labelKo: '질서 신호구역',
        forumTierCount: 4,
      }),
    }),

    /** 유배지 특수 규칙 (예전 KANTAPBIYA_RULES 내용) */
    exile: Object.freeze({
      noAutoTimer: true,
      noFreePardon: true,
      returnToCitizenLand: Object.freeze({
        payEarthReturnTicketKrw: price,
        reExileByDislikesInsideZone: Object.freeze({
          enabled: true,
          noteKo:
            '외계행성 내부에서 유저들에게 싫어요를 받아 재축출되면 일반 시민 땅으로 복귀할 수 있음(세부 수치는 기획 확정 후 조정)',
        }),
      }),
    }),

    /** 메인 벨트와 동일 랭크별 성향치 상한·게시물당 캡 → 두 행성 축에 적용 */
    rankAlignment: alignmentRankLimits.getKantapbiyaRankAlignmentLimits(),
  });
}

module.exports = Object.freeze({
  buildKantapbiya,
});
