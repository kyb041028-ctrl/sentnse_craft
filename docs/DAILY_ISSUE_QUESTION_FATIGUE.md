# 데일리 이슈 — 질문 피로도 방지 (Question Fatigue)

구현: `public/index.html` (번들 생성·테마 선택·검증·로컬 기록).

## 목적

- 같은 **근본 갈등축(axisGroup)**·무거운 이슈·**conflict** 톤이 연속될 때 느껴지는 **질문 피로**를 줄인다.
- 정치·사회 흐름에 **완급(heavy ↔ light/viral, conflict ↔ 공감·호기심)**을 넣는다.

## 이슈(번들) 메타 필드

풀 항목(`CENTRIST_THEME_POOLS`) 또는 생성된 이슈 객체에 선택적으로 둘 수 있다. 없으면 **텍스트·분야 기반 추론**으로 채운다.

| 필드 | 값 | 설명 |
|------|-----|------|
| `axisGroup` | 예: `welfare_fiscal` | 유사 정책 갈등을 묶는 식별자. 키워드 규칙 + 없으면 `misc_{catId}_{hash}`. |
| `temperature` | `heavy` \| `medium` \| `light` \| `viral` | 이슈의 무게감. |
| `emotionTone` | `conflict` \| `empathy` \| `curiosity` \| `humor` \| `lifestyle` | 질문의 감정·참여 톤. |

### temperature 가이드(추론·직접 지정 공통)

- **heavy**: 연금·세금·헌법·외교·노동·제재·분쟁 등.
- **medium**: 교육·교통·군복무·부동산 등.
- **light**: 생활규칙·세대·지역 등.
- **viral**: 연예·SNS·유행 논란 등(연예 탭은 기본 편향).

### emotionTone 가이드

- **conflict**: 찬반 축이 선명한 토론형(기본값이 많음).
- **empathy**: 복지·돌봄·의료 등 공감 축.
- **curiosity**: 기술·미래·데이터 등.
- **humor**: 밈·가벼운 논란.
- **lifestyle**: 생활·문화 규범.

## 슬롯 내 규칙

1. **axisGroup**: 한 분야(`catId`)당 한 번들에서 **중복 없이** 고르도록 가중 선택(풀에 동일 그룹이 많으면 2차 패스에서만 중복 허용).
2. **temperature**: 분야당 이슈 수 `n`에 대해  
   - heavy 비율 ≤ `DAILY_ISSUE_FATIGUE_MAX_HEAVY_RATIO`(기본 0.35)  
   - (light + viral) 비율 ≥ `DAILY_ISSUE_FATIGUE_MIN_LIGHT_VIRAL_RATIO`(기본 0.3)  
   미달 시 같은 분야 풀에서 **교체 스왑**(`finalizePicksForFatigueRules`).
3. **emotionTone**: 분야당 conflict 비율 ≤ `DAILY_ISSUE_FATIGUE_MAX_CONFLICT_RATIO`(기본 0.67)를 맞추기 위해 스왑.

## 최근 슬롯(히스토리) 연동

- `loadDailyIssueHistoryRoot()`의 최근 `DAILY_ISSUE_FATIGUE_HISTORY_LOOKBACK`(기본 3)개 번들을 읽는다(현재 생성 중인 `slotKey`는 제외).
- **axisGroup**: 최근 슬롯에서 같은 분야에 동일 그룹이 `DAILY_ISSUE_FATIGUE_GROUP_REPEAT_THRESHOLD`(기본 2)회 이상이면 해당 그룹 가중치 감소.
- **conflict**: 최근 슬롯 전체 이슈 중 conflict 비율이 `DAILY_ISSUE_FATIGUE_CONFLICT_RATIO_HIGH`(기본 0.45) 이상이면 conflict 톤 가중 감소·그 외 톤 가중 증가.

## `validateBundleDiversity(bundle)`

- 항목: 분야별 **axisGroup 중복**, **temperature 편중**, **conflict 편중**, **유사한 `aiQuestion` 쌍**, **토픽에서 뽑은 6글자 이상 한글 토큰의 반복**.
- `buildFreshCentristBundle`은 위 검증을 통과할 때까지 최대 `DAILY_ISSUE_FATIGUE_BUNDLE_DIVERSITY_MAX_ATTEMPTS`회 재시도한다. 실패 시 마지막 시도 번들을 쓰고 `console.warn`으로 사유를 남긴다.

## 개인 피로도 로그(확장용)

- 키: `sc_daily_issue_question_fatigue_v1` (`DAILY_ISSUE_QUESTION_FATIGUE_KEY`).
- 유저 id별로 `recentAxisGroups`, `recentTemperatures`, `recentEmotionTones` 큐(최대 200), `recordedSlotKeys`로 **슬롯당 1회만** 누적.
- 허브 렌더 시 `ensureDailyIssueQuestionFatigueRecorded(bundle)`로 기록. **현재는 선택 가중치에 반영하지 않음**(추후 개인화용).

## 풀 작성 시 권장

- 정치·경제에도 `temperature: 'light'` 또는 `emotionTone: 'lifestyle'` 등 **가벼운 참여형**을 일부 넣으면 온도 분산 목표를 맞추기 쉽다.
- 동일 정책 축은 같은 `axisGroup` 문자열을 공유해 슬롯 내 중복을 피한다.

관련: `docs/DAILY_ISSUE_THEME_POOL_GUIDE.md`, `docs/DAILY_ISSUE_AND_FREE_BOARD_SPEC.md`.
