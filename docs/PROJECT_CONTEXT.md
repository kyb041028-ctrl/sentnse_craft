# 센텐스크래프트 — 프로젝트 컨텍스트

> 다른 Cursor 세션에서 이 문서를 먼저 읽어 프로젝트 전체 맥락을 파악하세요.
> 마지막 업데이트: 2026-07-05 (저녁 — 프로필 방향·에셋 v1 확정)

---

## 1. 프로젝트 소개

**센텐스크래프트(Sentence Craft)**는 "글로 싸우는 전쟁"을 테마로 한 게임형 커뮤니티 플랫폼입니다.

- 일반 SNS/커뮤니티가 아닌, **전략 게임의 세계관을 가진 커뮤니티**
- 사용자가 글을 쓰고 반응하면서 자신의 **성향(정치 스펙트럼)** 이 결정되고 **영토에 소속**됨
- 영토별로 게시판 접근 권한이 다르며, 충분한 비호감을 받으면 **외계행성으로 추방**됨
- 현재: **베타 뼈대** 상태 (기능 구조는 잡혀 있으나 일부 미구현)

### 기술 스택

| 구성 | 내용 |
|------|------|
| 백엔드 | Node.js + Express (`server.js`) |
| DB / Auth | Supabase (PostgreSQL + Supabase Auth) |
| 프론트엔드 | 단일 파일 SPA (`public/index.html`) — 빌드 없음 |
| 배포 | `npm start` → `http://localhost:3000` |
| 결제 | 카카오페이 / 토스페이 / 휴대폰 소액결제 (기획 정의됨, 미구현) |

---

## 2. 세계관

### 핵심 개념

- **글 = 무기**: 게시글·댓글·반응이 모두 플레이어의 성향과 영토 기여에 영향을 미침
- **성향(Alignment)**: 개척(좌) ↔ 중도 ↔ 수호(우) 스펙트럼. 활동할수록 수치가 이동
- **영토 귀속**: 성향 수치가 일정 기준에 도달하면 해당 영토의 주민이 됨
- **첩자(Spy)**: 소속 영토가 아닌 타 영토 게시판에 글을 쓸 경우 "종횡무진 척후대" 배지 부여
- **추방(Exile)**: 비호감 30개 이상 → 외계행성으로 추방, 3,000원 결제 시 귀환 가능

### 결제 상품

| 상품 | 가격 | 설명 |
|------|------|------|
| 월 구독권 | 4,900원 | 구독 보너스 부여 (매일 5시 리셋) |
| 직언패스500 | 500원 | 영구 보존 (리셋 후에도 소멸 안 됨) |
| 지구귀환티켓 | 3,000원 | 외계행성 추방 후 영토 귀환 |

---

## 3. 영토 구조

### 메인 4 영토

| CSS key / 내부 ID | 표시명 | 색상 코드 | 설명 |
|-------------------|--------|-----------|------|
| `centrist` / `COMMON` | 중앙광장 | `#3DFFB3` (녹색) | 중도 성향, 데일리 이슈 허브 |
| `reform` / `PROGRESSIVE` | 개척영토 | `#5AA8FF` (파랑) | 개척(좌) 성향, 게시판 4단계 |
| `order` / `CONSERVATIVE` | 수호영토 | `#FF5A5A` (빨강) | 수호(우) 성향, 게시판 4단계 |
| `alien` / `KANTAPBIYA` | 외계행성 | `#C77DFF` (보라) | 추방자·관측자 허브 |

> ⚠️ "깐따삐아" 명칭은 사용하지 않습니다. 내부 ID `KANTAPBIYA`는 유지.

### 영토 부제 (subtitle)

| 영토 | 부제 |
|------|------|
| 중앙광장 | 대화하는 사람 |
| 개척영토 | 변화를 만드는 사람 |
| 수호영토 | 질서를 지키는 사람 |
| 외계행성 | 경계를 관측하는 사람 |

### CSS data-territory 값

UI에서 영토 색상 전환은 **`data-territory` 속성 하나로** 제어됩니다.

```js
// JS에서 영토 변경 시 이렇게만 하면 배너/신념HUD/게이지 색상이 자동 전환
document.querySelector('.avatar-dock__panel').dataset.territory = 'reform';
document.querySelector('#avatar-territory-badge').dataset.territory = 'reform';
```

### 영토 게시판 단계 (Tier)

- Tier 1: 모두 읽기 가능, 쓰기는 성향 해금 필요
- Tier 2~4: 성향 강화 해금 필요 (읽기 포함)
- 외계행성: 단계 없음, 카테고리만 존재 (자유게시판/관측기록/밈/생존일기)

### 영토 인구 시각화 단계

| 인구 구간 | 단계 키 | 표현 |
|-----------|---------|------|
| 1 ~ 500 | TRIBAL | 시대 부족, 모닥불·사냥 |
| 501 ~ 2,000 | HAMLET | 초소형 촌락 |
| 2,001 ~ 4,999 | TOWN | 마을·도시 기반 |
| 5,000+ | AGRARIAN | 농경·도시 기반 사회 |

---

## 4. 영토 신념 시스템

신념은 `public/territory-beliefs.js` — 단일 출처(Single Source of Truth)에서 관리됩니다.

```js
// window.TERRITORY_BELIEFS[cssId]
{
  displayName : '개척영토',         // 사용자 표시명
  subtitle    : '변화를 만드는 사람', // 영토 부제
  belief      : '미래는 기다리는 것이 아니라,\n개척하는 것이다.',  // 프로필 HUD 표시
  philosophy  : '변화를 두려워하지 않고\n새로운 가능성을 향해 나아간다.' // 미표시, 향후 활용
}
```

| 영토 | 신념 문장 |
|------|-----------|
| 중앙광장 | "답은 하나가 아니라, 함께 찾는 것이다." |
| 개척영토 | "미래는 기다리는 것이 아니라, 개척하는 것이다." |
| 수호영토 | "질서는 자유를 지키는 가장 강한 약속이다." |
| 외계행성 | "경계 밖의 시선은 새로운 문명을 만든다." |

### 공식 영토 에셋 v1 (2026-07-05)

배너 4장 + 엠블럼 4개를 **공식 에셋 v1**으로 취급한다.

```
public/assets/territories/banners/
  reform.webp | centrist.webp | order.webp | alien.webp

public/assets/territories/emblems/
  reform.webp | centrist.webp | order.webp | alien.webp
```

| CSS key | 표시명 | 배너 테마 | 엠블럼 |
|---------|--------|-----------|--------|
| `reform` | 개척영토 | 파랑·은색 | 검 + 날개 |
| `centrist` | 중앙광장 | 초록·금색 | 그리스 신전/기둥 |
| `order` | 수호영토 | 빨강·금색 | 방패 + 검 |
| `alien` | 외계행성 | 보라·금색 | 보라 수정 |

프로필에서 `--profile-territory-banner-url`, `--profile-territory-emblem-url` CSS 변수로 연결 중.  
레거시 `assets/territory-icons/*.png` 참조는 점진 교체 예정(아직 일부 유지).

---

## 5. UI 철학

- **게임 HUD처럼**: 웹사이트가 아니라 전략게임/RPG의 인터페이스
- **정보 계층**: 데일리 이슈(Primary) → 인기글/실시간 현황(Secondary) → 게시글(Passive)
- **세계관 연출**: 영토 색상이 프로필 배너, 신념 영역, 성향 레이더에 통일되게 반영
- **압축 + 가독성**: 한 화면에 최대한 많은 정보가 들어오되 답답하지 않게
- **CSS-only 테마**: JS 속성 변경 한 줄로 전체 테마가 전환되도록 CSS 변수와 `data-*` 속성 활용

### 프로필 — 영토 시민 카드 (2026-07-05 확정 방향)

> ⚠️ **프로필 스킨(시안 PNG)은 아직 Cursor에 적용하지 않음.** 레이아웃 골격·에셋 연결만 진행 중.

| 원칙 | 내용 |
|------|------|
| 주인공 | **유저**가 주인공. 영토는 배경 정체성 |
| 카드 형태 | **영토 시민 카드** 기반 게임형 HUD 유지 |
| 아바타 | **왼쪽 전신 영역**으로 크게 확보 (placeholder → 추후 전신 이미지) |
| 신념 배너 | 우측 정보 영역 **보조 배너**. 유저보다 주인공처럼 보이면 안 됨 |
| 성향 | **레이더 하나만** 사용 |
| 금지 UI | 정치성향 **가로 게이지**, **퍼센트 노출** 사용 안 함 |
| 금지 항목 | 프로필 **가입일** 표시 안 함 |
| 소속 | **중복 표기 금지** — 한 곳(아바타 하단 등)에만 |

#### 활동 요약 (표시명·우선순위)

| 항목 | 비고 |
|------|------|
| 작성 글 | |
| 댓글 | |
| 받은 공감 | |
| **토론 참여** | 팔로워보다 **우선** 지표 |
| **전달한 아우라** | 아래 정의 참조 |

> **팔로워**는 프로필 핵심 활동 요약에서 우선순위를 낮춤. (팔로우 수는 헤더 등 보조 영역 가능)

**전달한 아우라** — 정의:

> 내 활동이 다른 시민에게 전달한 영향력.  
> 글 / 댓글 / 토론 참여 유도 / 공감 / 상호작용 등을 통해 다른 시민에게 남긴 영향력의 **누적 지표**.

#### 영토 기록 (표시명)

| 항목 | 비고 |
|------|------|
| 최초 소속 | |
| 현재 소속 | |
| 이동 횟수 | |
| **시민 영향력** | ~~명명된 점수~~ 표현 사용 안 함 |
| 시민 등급 | |

#### 성향 지도 — AI 한 줄 설명 (향후)

레이더 **아래**에 AI가 성향 변화를 한 줄로 설명하는 보조 영역을 둔다.  
수치·퍼센트 대신 **변화 흐름**을 설명한다.

예: `"최근 활동으로 개척 성향이 조금 증가하고 있습니다."`

---

## 6. 디자인 시스템

### CSS 변수 (`:root`)

| 카테고리 | 변수 접두어 | 예시 |
|---------|------------|------|
| 여백 | `--sc-sp-*` | `--sc-sp-sm`, `--sc-sp-md` |
| 테두리 반경 | `--sc-r-*` | `--sc-r-sm`, `--sc-r-md` |
| 테두리 색 | `--sc-bc-*` | `--sc-bc-subtle` |
| 버튼 | `--sc-btn-*` | `--sc-btn-h` |
| 카드 | `--sc-card-*` | |
| 타이틀 | `--sc-title-*` | |
| 폰트 | `--sc-fs-*` | |
| 패널 | `--sc-panel-*` | |
| 입력 | `--sc-input-*` | |
| 트랜지션 | `--sc-ease` | `all 0.15s ease` |
| 프로필 패널 폭 | `--avatar-panel-width` | `56rem` |
| 좌측 카드 폭 | `--avatar-left-col-w` | `18.5rem` |

### UI Kit 클래스

| 클래스 | 역할 |
|--------|------|
| `sc-panel` | 패널 컨테이너 (프로필, 채팅 등) |
| `sc-card` | 카드 컴포넌트 |
| `sc-badge` | 배지 (레벨, 영토, 업적 등) |
| `sc-btn` | 버튼 (Primary / Secondary) |
| `sc-section-title` | 섹션 헤더 |
| `sc-tag` | 태그 (자유토론, 정보·분석 등) |
| `sc-input` | 입력창 |

### 영토 색상 체계

```css
/* 성향 게이지 그라디언트 */
centrist  : #3DFFB3 → #8CFFD9
reform    : #5AA8FF → #A5D4FF
order     : #FF5A5A → #FFB1B1
alien     : #C77DFF → #E6B3FF

/* 배너 배경 (8~10% 투명도) */
centrist  : rgba(61, 255, 179, 0.08)
reform    : rgba(90, 168, 255, 0.08)
order     : rgba(255, 90, 90, 0.08)
alien     : rgba(199, 125, 255, 0.08)
```

---

## 7. 현재 구현 상태

> **프로필 UI — 영토 시민 카드 골격 작업 중 (2026-07-05)**  
> 시안 스킨 미적용. 좌 **전신 아바타** | 우 **닉네임·XP·보조배너·레이더** | 하단 **3카드**.  
> 패널 내부 스크롤 허용으로 클리핑 안정화. **내일:** 에셋 교체·항목명·중복 정리.

### ✅ 구현 완료

- 로그인/회원가입 UI (소셜 로그인 버튼 포함)
- 게스트 모드
- 메인 지도 화면 — 신규 16:9 원시시대(tribal-s1) 지도, 히트존, 호버 효과
- 중앙광장 허브 (데일리 이슈, 오늘의 인기글, 실시간 영토 현황, 게시글, 페이지네이션)
- 영토 게시판 (개척/수호/외계행성)
- 게시글 작성/조회/반응 (공감/추천/비추천)
- 팔로우 시스템 + 알림
- 플레이어 프로필 패널 — **영토 시민 카드** (`profile-citizen-card`)
  - body: `.profile-avatar-zone` | `.profile-main-zone` (2열)
  - 우측: 닉네임·Lv·명성·XP → 보조 신념 배너 → 레이더 + 성향 설명 골격
  - footer: 시민 기록 (대표 업적 · 활동 요약 · 영토 기록)
- 레벨/XP/명성 표시
- 권한 안내 탭
- 히스토리 탭
- 게시글 상세 화면
- Supabase Auth API (`/api/auth/*`)
- 플레이어 프로필 API (`/api/me/profile`)
- 채팅 API (인메모리 베타)
- **영토 신념 데이터** (`public/territory-beliefs.js`) — Single Source of Truth
- **공식 에셋 v1** WEBP 8종 (`assets/territories/banners/`, `emblems/`)
- 프로필 `--profile-territory-banner-url` / `--profile-territory-emblem-url` 1차 연결

### ⚠️ 부분 구현 / 뼈대만 있음

- Supabase DB 연동 (테이블 설계됨, 일부 API 미완성)
- 성향 계산 로직 (config 정의됨, 실제 집계 미구현)
- 레벨/XP 계산 (config 정의됨, 실제 적용 미완성)
- 영토 귀속 자동화 (룰 정의됨, 자동 처리 미구현)
- 프로필 활동/영토 기록 — **더미 라벨** (팔로워·영향력 점수 등, 내일 명칭 정리 예정)
- 성향 AI 한 줄 설명 — UI 골격만, AI 연동 없음
- 레거시 `territory-icons` PNG — 신규 emblems WEBP와 **혼재**

### ❌ 미구현

- **프로필 스킨 최종 적용** (시안 PNG — 별도 작업으로 보류)
- 결제 시스템 (상품 정의됨)
- 영토전 (배틀 시스템)
- 실제 전신 아바타 이미지 (현재 SVG placeholder)
- 업적 시스템 (더미 데이터)
- 활동 메뉴 링크 (버튼 disabled 상태)
- AI 데일리 이슈 자동 생성
- 관리자/운영 도구

---

## 8. 개발 원칙

1. **기능/JS/데이터 로직은 건드리지 않는다** — UI 작업 시 id, class, 함수명은 유지
2. **CSS/UI 수정은 `public/index.html` 의 `<style>` 블록에서만** — 별도 CSS 파일 없음
3. **영토 색상은 `data-territory` 하나로 전체 전환** — 하드코딩 금지
4. **빌드 단계 없음** — 파일 수정 후 브라우저 새로고침으로 확인
5. **CSS 변수(`--sc-*`)를 우선 재사용** — 새 색상/값은 변수로 추가
6. **모바일 터치 영역 유지** — 데스크톱 압축 시 `@media`로 모바일 보호
7. **추측하지 않는다** — 불확실하면 코드를 먼저 읽는다
8. **신념 문장은 `territory-beliefs.js`에서만 수정** — index.html 하드코딩 금지

---

## 9. 파일 구조

```
sentence-craft/
├── public/
│   ├── index.html               # 단일 SPA 파일 (HTML + CSS + JS 전부)
│   ├── territory-beliefs.js     # ★ 영토 신념 데이터 (Single Source of Truth)
│   ├── alignment-scoring.js     # 성향 점수 계산
│   ├── follow-system.js
│   ├── player-progression.js
│   ├── permissions-guide.js
│   ├── rank-leaderboard.js
│   ├── tendency-trends-ui.js
│   ├── ui-sounds.js
│   ├── assets/
│   │   ├── territory-icons/     # 레거시 PNG (점진 교체 예정)
│   │   └── territories/         # ★ 공식 에셋 v1 (WEBP)
│   │       ├── banners/         # reform | centrist | order | alien
│   │       └── emblems/
│   ├── auth/
│   │   └── callback.html        # OAuth 콜백 페이지
│   └── territories/             # 영토 맵 PNG, JSON 히트존
├── config/
│   ├── world-territories.js     # 영토·게시판 규칙
│   ├── alignment-system.js      # 성향 시스템
│   ├── player-progression.js    # 레벨·XP·명성
│   ├── kantapbiya.js            # 외계행성 규칙
│   ├── alignment-rank-limits.js
│   └── signup-countries.js
├── scripts/                     # 유틸리티 스크립트
├── tools/                       # 시뮬레이션 도구
├── supabase/                    # Supabase 관련 설정
├── docs/                        # 프로젝트 문서
├── app-config.js                # 전체 설정 집약 모듈
├── server.js                    # Express 서버
└── package.json
```
