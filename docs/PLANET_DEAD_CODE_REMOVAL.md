# 후속 작업: planet 관련 dead code 완전 제거

> **상태**: 미착수 (2026-06-17 기준)  
> **선행 커밋**: 외계행성 구조 단순화 + 정치/행동 moderation 분리  
> **목표**: planetPct 축·외계인 반응 UI 잔재를 코드·스토리지·CSS에서 완전 삭제

---

## 배경

외계행성은 **행동 moderation(유배)** 만 사용한다.  
`planetPct`·`planetVoters`·LEFT/RIGHT 신호구역은 제품 방향에서 제거되었으나,  
호환·no-op 형태로 **아래 잔재가 코드에 남아 있다.**

---

## 삭제 대상 (우선순위)

### 1. No-op / 레거시 함수

| 심볼 | 파일(주) | 비고 |
|------|----------|------|
| `getPlanetPct()` | `public/index.html`, `public/tendency-trends-ui.js` | 항상 0 반환 |
| `addPlanetScoreForAuthor()` | `public/index.html` | no-op |
| `bumpLikeRecvPlanet()` | `public/index.html` | no-op |
| `moderationStageFromPlanet()` | `public/index.html` | `moderationStageFromBehavior` 래퍼 |
| `togglePlanetOnPost` / `togglePlanetOnComment` | `public/index.html` | no-op |
| `syncForcedAffiliationForAuthor()` | `public/index.html` | planet 경로 잔재 검토 |
| `recordPlanetThreadUse()` | `public/index.html` | `authorRcvPl` 누적 |
| `clampPlanetDeltaForThread()` | `public/index.html` | 있으면 함께 제거 |
| `alienPlanetHeaderStatus(planetPct)` | `public/index.html` | 미사용 인자 |

### 2. 데이터 필드 · reaction 구조

| 항목 | 비고 |
|------|------|
| `reactions.planetVoters` | normalize/저장/집계 전부 제거 |
| `post.authorRcvPl` | planet 스레드 캡 잔재 |
| `authorReactionCaps().planet` | `PlayerProgression.getReactionCapsForUser` planet 분기 |
| `bucketScores` / alignment map의 `planetPct` | 읽기·마이그레이션 후 필드 drop |

### 3. UI / CSS

| 항목 | 비고 |
|------|------|
| `.sc-react-btn--planet`, `.sc-react-ico--planet` | CSS |
| `omitPlanet` 분기 | 항상 true → 분기 자체 삭제 |
| planet 반응 버튼 렌더 옵션 (`nPlanet`, `activePlanet`, `onPlanet`) | detail/list reaction row |

### 4. localStorage / history

| Key / 필드 | 비고 |
|------------|------|
| `sc_tendency_history_v2` → `planet` | 스냅샷·보간에서 필드 제거 |
| `sc_political_scores_v1` → `planetPct` | 마이그레이션 스크립트 또는 로드 시 strip |
| `sc_alien_faction_hot_tab_v1`, `sc_alien_signal_page_v1` | session orphan key (선택적 cleanup) |

### 5. 문서·시뮬

- `docs/ALIGNMENT_REACTION_TUNING.md` 등 planetPct 언급 문서 갱신 또는 deprecated 표시
- `tools/simulate-1000-users.js` planet 관련 검증 제거 확인

---

## 삭제 시 주의

1. **Supabase 이전 전** legacy `forcedTerritory` LEFT/RIGHT/CENTER → `KANTAPBIYA` 마이그레이션은 유지할 것.
2. 외계 허브(`KANTAPBIYA`) **공감 전용** 반응 규칙은 유지 (`isAlienPlanetHub` 분기).
3. 제거 후 `node tools/simulate-1000-users.js` 및 브라우저 smoke (유배·눈팅·중앙광장 quarantine) 실행.

---

## 완료 기준

- [ ] `planetPct` / `planetVoters` / `authorRcvPl` grep 0건 (의도적 마이그레이션 주석 제외)
- [ ] planet reaction UI/CSS 없음
- [ ] permissions-guide·kantapbiya config와 일치
- [ ] 시뮬 통과
