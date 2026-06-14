# 레벨 · XP · 명성·등급 — 현재 로직 일람 (정확값)

다른 도구/AI와 **상의용**으로 그대로 붙여 쓰면 됩니다.  
구현: **`public/player-progression.js`** (브라우저), 서버/공유 설정 참고용: **`config/player-progression.js`**.

**철학**

- **레벨** = 활동 경험(XP).
- **명성 등급** = 받은 반응·팔로 기반 **절대 기준 + 영토 인구 캡** (권력 계급·상대 순위 강등 아님).
- **성향 / 외계성**은 `alignment-scoring`·게시판 쪽과 역할 분리.

---

## 1. 저장소

| 항목 | 값 |
|------|-----|
| localStorage 키 | `sc_player_progression_v1` |
| 유저별 필드 | `totalXp`, `territoryId`, `receivedPostLikes`, `receivedCommentLikes`, `receivedFollowers`, `rankTier` |

`rankTier`는 저장 시 `recomputeAllRanks`로 **재계산**되어 반영됩니다.

---

## 2. 레벨 상한 · XP

| 이름 | 값 |
|------|-----|
| `MAX_LEVEL` | `5` |
| `LURK_UNLOCK_LEVEL` | `3` | 타 영토 **1단계 눈팅(읽기)** |
| `RANK_UNLOCK_LEVEL` | `4` | **명성 등급** 표시·집계 해금 |

### 2.1 XP 보상 (`XP_REWARDS`)

| 액션 | XP |
|------|-----|
| `post_write` | `25` |
| `board_comment` | `12` |
| `issue_comment` | `10` |

### 2.2 구간 XP (`XP_PER_LEVEL`)

`40`, `50`, `60`, `70`, `80` → 누적 임계 `[0, 40, 90, 150, 220, 300]` (Lv5는 220+).

---

## 3. 명성 등급 (`rankTier`, 0~4)

| tier | 한글 |
|------|------|
| 0 | (Lv&lt;4 미참여 또는 Lv4+ **논객 수치 미달** — UI: “참여 중” 등) |
| 1 | 시민 (레거시 데이터에만 남을 수 있음) |
| 2 | 논객 |
| 3 | 대표 |
| 4 | 지도자 |

### 3.1 해금

- `levelFromTotalXp(totalXp) >= RANK_UNLOCK_LEVEL` (**4**) 인 경우만 절대 기준·캡에 들어감. 미만이면 `rankTier` 계산상 **0**.

### 3.2 절대 기준 (`RANK_ABSOLUTE`) — **세 지표 동시** 충족

| 티어 | 글 ♥ | 댓글 ♥ | 팔로워 |
|------|------|--------|--------|
| 2 논객 | ≥3 | ≥2 | ≥2 |
| 3 대표 | ≥15 | ≥8 | ≥8 |
| 4 지도자 | ≥40 | ≥20 | ≥20 |

높은 티어부터 판정. 미달이면 **0** (자동으로 “하위 n%” 강등 **없음**).

### 3.3 인구 캡 (`RANK_CAPS`)

| 규칙 | 값 |
|------|-----|
| `politicianMaxRatio` | `0.1` | **대표(3)** 상한 ≈ 소속 Lv4+ 인원의 10% (최소 1) |
| `chiefsMaxCount` | `5` | **지도자(4)** 영토당 최대 5명 |

### 3.4 리더보드용 명성 점수 (`rankReputationScore`)

`글받은♥ + 댓글받은♥×2 + 팔로워×5` — **정렬·표시용**이며, 등급을 깎는 상대 컷에는 쓰지 않음.

---

## 4. 글·스레드당 반응 상한 (`PER_POST_REACTION_CAP`)

`getPerPostReactionCap(rankTier)` — `rankTier`를 **0~4**로 클램프.

| `rankTier` | 상한 |
|------------|------|
| 0 | `120` |
| 1 | `120` |
| 2 | `200` |
| 3 | `320` |
| 4 | `480` |

배열의 `720`은 인덱스 클램프로 **현재 미사용**.

---

## 5. 게시판과의 관계 (`public/index.html` 요약)

- **눈팅**: `playerLevel() >= LURK_UNLOCK_LEVEL` (3) + 4단계 영토 1단계.
- **글쓰기·반응**: `isBoardUnlocked()` — 주로 **성향 %**, 레벨과 별개.
- **명성 문구**: `RANK_UNLOCK_LEVEL` 동적 표기 (기본 “레벨 4 달성 후 해금”).

---

## 6. 조정 시 참고

| 바꾸고 싶은 것 | 위치 |
|----------------|------|
| 명성 해금 시점 | `RANK_UNLOCK_LEVEL` |
| 논객/대표/지도자 난이도 | `RANK_ABSOLUTE` |
| 대표·지도자 밀도 | `RANK_CAPS` |
| 글당 반응 상한 | `PER_POST_REACTION_CAP` |

---

*코드와 숫자가 어긋나면 `public/player-progression.js`를 기준으로 이 문서를 갱신하세요.*
