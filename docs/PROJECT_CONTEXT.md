# 센텐스크래프트 — 프로젝트 컨텍스트

> 다른 Cursor 세션에서 이 문서를 먼저 읽어 프로젝트 전체 맥락을 파악하세요.
> 마지막 업데이트: 2026-07-02

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

---

## 5. UI 철학

- **게임 HUD처럼**: 웹사이트가 아니라 전략게임/RPG의 인터페이스
- **정보 계층**: 데일리 이슈(Primary) → 인기글/실시간 현황(Secondary) → 게시글(Passive)
- **세계관 연출**: 영토 색상이 프로필 배너, 신념 문장, 성향 게이지에 통일되게 반영
- **압축 + 가독성**: 한 화면에 최대한 많은 정보가 들어오되 답답하지 않게
- **CSS-only 테마**: JS 속성 변경 한 줄로 전체 테마가 전환되도록 CSS 변수와 `data-*` 속성 활용

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
| 프로필 패널 폭 | `--avatar-panel-width` | `48rem` |
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

### ✅ 구현 완료

- 로그인/회원가입 UI (소셜 로그인 버튼 포함)
- 게스트 모드
- 메인 지도 화면 (영토 히트존, 호버 효과)
- 중앙광장 허브 (데일리 이슈, 오늘의 인기글, 실시간 영토 현황, 게시글, 페이지네이션)
- 영토 게시판 (개척/수호/외계행성)
- 게시글 작성/조회/반응 (공감/추천/비추천)
- 팔로우 시스템 + 알림
- 플레이어 프로필 패널 (HUD 스타일 2열 레이아웃)
  - 플레이어 카드 (아바타 슬롯, 영토 카드 구조)
  - 영토 소속 배너 (HUD Banner, data-territory 기반)
  - 영토 신념 HUD (`window.TERRITORY_BELIEFS` 기반 동적 렌더링)
  - 성향 게이지 (영토 색상 기반)
  - 경험치 바
  - 대표 업적 (더미 데이터)
  - 활동 카드 (2x2 그리드, 더미 데이터)
  - 명예 장식 슬롯 (프레임/칭호/휘장/오라)
- 레벨/XP/명성 표시
- 권한 안내 탭
- 히스토리 탭
- 게시글 상세 화면
- Supabase Auth API (`/api/auth/*`)
- 플레이어 프로필 API (`/api/me/profile`)
- 채팅 API (인메모리 베타)
- **영토 신념 데이터 파일** (`public/territory-beliefs.js`) — Single Source of Truth

### ⚠️ 부분 구현 / 뼈대만 있음

- Supabase DB 연동 (테이블 설계됨, 일부 API 미완성)
- 성향 계산 로직 (config 정의됨, 실제 집계 미구현)
- 레벨/XP 계산 (config 정의됨, 실제 적용 미완성)
- 영토 귀속 자동화 (룰 정의됨, 자동 처리 미구현)

### ❌ 미구현

- 결제 시스템 (상품 정의됨)
- 영토전 (배틀 시스템)
- 실제 아바타 이미지 (현재 SVG 플레이스홀더)
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
│   │   └── emblems/             # 영토 엠블럼 이미지
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
