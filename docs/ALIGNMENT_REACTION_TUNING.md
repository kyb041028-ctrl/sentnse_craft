# 성향·외계인 반응 튜닝 — 현재 수치 일람 (정확값)

다른 도구/AI와 논의할 때 **그대로 복사**해 쓰면 됩니다.  
(브라우저 데모 기준. `public/index.html` 게시판 스크립트 + `alignment-scoring.js` + `player-progression.js`.)

**설계 철학 (요약)**

- 정치 **방향**(보수·중도·진보)은 **내가 누른 반응(반응자 벡터)**과 **내가 받은 좋아요(작성자 쪽, 약화됨)**가 주로 만든다.
- **사회적 과열 / 외계성**(`planetPct`)은 **싫어요·외계인 표시** 쪽 비중을 상대적으로 키워, “남의 싫어요로 내 정치 색이 규정된다” 느낌을 줄인다.
- **일일 표시 % 캡**으로 좌표찍기·단시간 급변을 완화한다.

---

## 1. 저장소

| 항목 | 값 |
|------|-----|
| localStorage 키 (사람 축 + 외계인 %) | `sc_political_scores_v1` (`index.html` 내 `ALIGN_LS`) |
| 한 유저 버킷 필드 | `conservative`, `centrist`, `progressive` (실수 누적), `planetPct` (0~100), `forcedTerritory` (선택) |
| 일일 정치 % 캡 상태 | `sc_align_daily_pct_cap_v1` — 유저별 `{ date, base }` (`base` = 그날 **첫 반응 직전**의 표시 % 스냅샷) |

---

## 2. 사람 축 (보수·중도·진보) — `public/alignment-scoring.js`

### 2.1 고정 상수

| 이름 | 값 | 의미 |
|------|-----|------|
| `EPS` | `1e-6` | 수치 안정용 |
| `MIN_AXIS` | `0.5` | 각 축 최소값 클램프 (더해진 뒤에도 축 ≥ 0.5) |
| `W_REACTOR_LIKE` | `2.0` | **반응자**: 남 글에 좋아요 시, 작성자 반대편 방향 벡터에 곱하는 스칼라 |
| `W_REACTOR_DISLIKE` | `-0.6` | **반응자**: 싫어요 시 (같은 방향 벡터에 음수 가중) |
| `W_AUTHOR_LIKE` | `1.0` | **작성자**: 내 글에 좋아요 받을 때, 반응자 단위벡터 방향에 곱하는 스칼라 |
| `W_AUTHOR_DISLIKE` | `-0.6` | **작성자**: 싫어요 받을 때 |

### 2.2 초기 점수

| 함수 | 반환 |
|------|------|
| `initialScores()` | `{ conservative: 12, centrist: 12, progressive: 12 }` |

초기 합이 커서 **소수 반응만으로 % 막대가 크게 흔들리지 않음**.

### 2.3 방향 보조 상수 (`oppositeFaceUnit`)

| 이름 | 값 | 용도 |
|------|-----|------|
| 균형 판정 스프레드 임계 | `(max - min) < 0.08` | 이면 `unit3({ conservative: 1, centrist: 1.12, progressive: 1 })` 쪽으로 “살짝 퍼진” 반대 방향 |
| 보수 최대 축 | `ax === 0` | `{ conservative: 0, centrist: 1, progressive: 1 }` → `unit3` |
| 중도 최대 축 | `ax === 1` | `{ conservative: 1, centrist: 0, progressive: 1 }` → `unit3` |
| 진보 최대 축 | 그 외 | `{ conservative: 1, centrist: 1, progressive: 0 }` → `unit3` |

### 2.4 화면 라벨용 (퍼센트가 아닌 “격차” UI)

| 이름 | 값 |
|------|-----|
| `LEAN_NEUTRAL_MAX` | `12` |
| `LEAN_MILD_MAX` | `25` |

### 2.5 한 번의 좋아요/싫어요가 하는 일 (요약)

- **반응자 델타** = `scaleVec(oppositeFaceUnit(unit3(작성자))), W_REACTOR_* )`
- **작성자 델타** = `scaleVec(unit3(반응자), W_AUTHOR_* )`
- 둘 다 `applyDelta`로 축에 합산. **화면 %**는 `toDisplayPercent` = 세 축 합으로 나눈 뒤 반올림(합 100 근사).
- **싫어요**에 대해서는 `index.html`의 `applyReactionScoresWithMult` 안에서 사람 축 델타에 **`DISLIKE_ALIGN_SCALE`(`0.4`)** 를 한 번 더 곱한다 (정치 방향 이동 ≈ 40%).

---

## 3. 게시판 스크립트 — `public/index.html` (보드 IIFE 상단 근처)

### 3.1 영토·외계인 임계 (% 표시는 `AlignmentScoring.toDisplayPercent` 기준)

| 이름 | 값 |
|------|-----|
| `FACTION_UNLOCK_PCT` | `40` |
| `FACTION_STAGE2_PCT` | `60` |
| `ALIEN_MARK_DELTA` | `10` | 외계인 표시 1회당 작성자 `planetPct` 변화(토글 시 ±) |
| `LIKE_RECV_PLANET_DELTA` | `2` | 글/댓글 **좋아요**로 작성자가 받을 때 `planetPct` 변화 단위(토글에 따라 ±) |
| `DISLIKE_RECV_PLANET_DELTA` | `3` | 글/댓글 **싫어요**로 작성자 `planetPct` 변화 단위(좋아요보다 큼) |
| `DISLIKE_ALIGN_SCALE` | `0.4` | 싫어요로 인한 **사람 축** 델타 추가 스케일 (`applyReactionScoresWithMult`) |
| `ALIGN_DAILY_CAP_KEY` | `'sc_align_daily_pct_cap_v1'` | 일일 기준선·날짜 저장 |
| `ALIGN_DAILY_PCT_PER_AXIS` | `5` | 그날 첫 반응 이후, 표시 % 각 축이 기준선에서 벗어날 수 있는 최대 폭(±) |
| `ALIEN_WARN_PCT` | `30` |
| `ALIEN_FORCE_KANTA_PCT` | `50` |
| `KANTA_UNLOCK_PLANET_PCT` | `ALIEN_FORCE_KANTA_PCT` (= `50`) |

### 3.2 `applyReactionScoresWithMult` 적용 순서

1. `mult`로 좋아요/싫어요 방향 스케일.
2. **싫어요**면 `dR`, `dAuth`에 `DISLIKE_ALIGN_SCALE` 적용.
3. 작성자 델타: `clampAlignDeltaForThread` (글당 상한).
4. `mult > 0`일 때만: 반응자·작성자 각각 `clampAlignmentDeltaForDailyPctCap` (일일 표시 % 캡). **`mult < 0`(취소/되돌리기)에는 일일 캡을 적용하지 않음** — 저장 상태와 역연산이 맞도록.
5. `setScoresForUser`, `recordAlignUse`.

### 3.3 공감 → 영토 인구 (성향 축과 무관)

| 이름 | 값 |
|------|-----|
| `EMPATHY_POP_BUMP` | `4` | 공감 1회당 `bumpMapPopForTerritory`에 `delta * 4` |

### 3.4 글당 클램프 (작성자에게 들어가는 반응 누적)

- `index.html`: `authorReactionCaps` 실패 시 기본 `{ align: 120, planet: 120 }`.
- 실제 값: `PlayerProgression.getReactionCapsForUser` → 아래 배열.

---

## 4. 글·스레드당 상한 — `public/player-progression.js`

| 이름 | 값 |
|------|-----|
| `PER_POST_REACTION_CAP` | `[120, 200, 320, 480, 720]` |
| 인덱스 | `rankTier` 0~4에 대응 (`getPerPostReactionCap`) |
| `getReactionCapsForUser` | `{ align: c, planet: c }` — **사람 축 델타 L1 합**과 **외계인 델타 절댓값**에 동일 상한 적용 |

---

## 5. 적용 범위 (어디서 사람 축이 움직이나)

- **움직임**: 지구측 게시판에서 **좋아요 / 싫어요** (`applyReactionScoresWithMult`, 외계행성 보드에서는 해당 토글에서 사람 축 경로 제외).
- **안 움직임**: **공감**은 `sc_political_scores_v1`의 보수·중도·진보를 바꾸지 않음.
- **별도 축**: `planetPct` / `forcedTerritory`는 `addPlanetScoreForAuthor`, `setScoresForUser` 경로. **싫어요**는 `DISLIKE_RECV_PLANET_DELTA`로 좋아요보다 `planetPct`에 더 크게 반영.

---

## 6. 조정할 때 권장 매핑

| 바꾸고 싶은 느낌 | 우선 수정 위치 |
|------------------|------------------|
| 좋아요/싫어요 **한 번**의 힘 (사람 축) | `alignment-scoring.js` — `W_REACTOR_*`, `W_AUTHOR_*` |
| **% 막대**만 덜 민감하게 | `initialScores()`의 기본값을 키우기, 또는 위 가중치·`DISLIKE_ALIGN_SCALE` |
| 싫어요가 **정치 축**을 덜 밀게 | `DISLIKE_ALIGN_SCALE` 내리기 |
| 싫어요가 **외계인 %**를 더/덜 밀게 | `DISLIKE_RECV_PLANET_DELTA` |
| 하루에 표시 %가 너무 많이 움직임 | `ALIGN_DAILY_PCT_PER_AXIS` |
| **한 글**에서만 덜 쌓이게 | `PER_POST_REACTION_CAP` |
| 외계인 표시 한 방 | `ALIEN_MARK_DELTA` |
| 받은 좋아요가 외계인 %에 주는 영향 | `LIKE_RECV_PLANET_DELTA` |
| 30%/50% 알림·행성 편입 | `ALIEN_WARN_PCT`, `ALIEN_FORCE_KANTA_PCT` |

---

*이 문서는 코드의 상수와 동기화해 두었습니다. 숫자를 바꿀 때는 코드와 함께 이 표를 갱신하는 것을 권장합니다.*
