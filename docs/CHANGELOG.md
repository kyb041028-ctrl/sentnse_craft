# 센텐스크래프트 — 변경 기록 (CHANGELOG)

> 최근 주요 변경 사항을 날짜 역순으로 정리합니다.
> 날짜는 git 커밋 기준. 마지막 업데이트: 2026-07-05 (저녁)

---

## [미배포] — 현 작업 이후

### ★ 2026-07-05 저녁 — 프로필 방향·에셋 v1 확정 (문서)

**확정 방향**

- 프로필 스킨(시안 PNG)은 **아직 Cursor 미적용** — 별도 작업으로 보류
- **영토 시민 카드** 게임형 HUD 유지 · **유저가 주인공**, 영토는 배경
- 좌 **전신 아바타** · 우 닉네임/Lv/명성/XP/보조배너/레이더
- 신념 배너는 보조 — 유저보다 주인공처럼 보이면 안 됨
- 성향 **레이더만** · 가로 게이지·퍼센트 **사용 안 함**
- **가입일 제외** · **소속 중복 금지**

**항목 명칭 정리**

- 활동 요약: 작성 글 / 댓글 / 받은 공감 / **토론 참여** / **전달한 아우라** (팔로워 우선순위 ↓)
- 전달한 아우라: 다른 시민에게 남긴 영향력 누적 지표 (글·댓글·토론·공감·상호작용)
- 영토 기록: 최초·현재 소속 / 이동 횟수 / **시민 영향력** / 시민 등급 (~~명명된 점수~~ 폐기)
- 성향 지도 아래 **AI 한 줄 설명** 영역 예정 (수치 대신 변화 흐름)

**공식 에셋 v1**

- `public/assets/territories/banners/` — reform · centrist · order · alien `.webp`
- `public/assets/territories/emblems/` — 동일 4종
- 매핑: 개척(파랑·검+날개) / 중앙(초록·신전) / 수호(빨강·방패+검) / 외계(보라·수정)

**코드 작업 (오늘)**

- 에셋 WEBP 8종 정리 · CSS 변수 1차 연결 · 시민 카드 2열 골격 · 패널 스크롤 안정화

**내일 TODO:** `docs/TODO.md` §「다음 작업 — 프로필 마무리」1~10

### ★ 프로필 패널 레이아웃 안정화

- `.avatar-dock__panel` 세로 스크롤 허용 (`overflow-y: auto`)
- flex `min-height: 0` / `overflow: hidden` 압축 제거 → 콘텐츠 자연 높이
- 보조 배너 72px 고정, 성향 레이더 `min-height: 150px`

### ★ 영토 시민 카드 레이아웃 골격 재정렬 (시안)

- 상단 전체 배너 제거 → `.profile-main-zone` 내부 보조 배너(80~110px)
- `.profile-citizen-card__body` 2열: `.profile-avatar-zone` | `.profile-main-zone`
- 좌: 전신 아바타 세로 카드 + `--profile-territory-emblem-url`
- 우: 닉네임/Lv/명성/XP → 배너 → 레이더+성향 설명
- 하단 3카드(대표 업적/활동/영토 기록) 유지

### ★ 영토 배너·엠블럼 에셋 1차 UI 연결

- `public/index.html` — `SC_TERRITORY_BANNERS` / `SC_TERRITORY_EMBLEMS` 상수, `applyProfileTerritoryAssets()` 추가
- `renderTerritoryCreed()` → `#avatar-player-card-wrap`에 `--profile-territory-banner-url`, `--profile-territory-emblem-url` 설정
- 신념 박스(`.profile-citizen-card__belief`) — 공식 배너 hero 표시 (gradient·워터마크 제거, HTML 텍스트 sr-only)
- 기존 `territory-icons` PNG 참조 유지

### ★ 영토 배너·엠블럼 에셋 정리

- `public/assets/territories/banners/` — reform / centrist / order / alien `.webp` 4종 추가
- `public/assets/territories/emblems/` — reform / centrist / order / alien `.webp` 4종 추가
- PNG 소스 → WEBP 변환 (`tools/convert-territory-assets.py`); HTML/CSS/JS 연결 없음

### ★ 프로필 HUD 최종 다듬기 (Grid 유지)

- Lv / 명성 / 시민등급 → `profile-header__infobar` 단일 정보 바로 통합
- `profile-main` stretch 제거 → 신념·경험치 아래 빈 공간 축소
- 신념 카드 높이 ~25% 축소, motto 글자 크기 확대 (`white-space: pre-line` 유지)
- 아바타 카드 프레임·영토 소속 foot 강화 (`avatar-card-territory-name` 노출)
- 성향 레이더 제목 시각 숨김, 차트 ~12% 확대 (9.5rem)
- 하단 3요약 카드 padding/gap/font ~12% 압축
- 모바일(767px↓)만 프로필 내부 스크롤 허용

### ★ 영토 시민 카드 레이아웃 재정렬

- `profile-citizen-card` 단일 카드: 신념 crest → 아바타·성향·시민정보 body → 시민 기록 footer
- 영토 신념·엠블럼을 카드 상단 hero로 승격 (워터마크·영토 그라디언트)
- 아바타·성향 레이더·하단 기록을 카드 내부 구역으로 통합 (개별 패널 테두리 제거)
- 패널 제목 "영토 시민 카드"로 변경

_다음 우선순위는 TODO.md 참조_

---

## 2026-07-04

### ★ 오늘 작업 요약

- 메인 영토맵을 신규 16:9 원시시대 버전으로 교체
- 영토 명칭을 **개척영토 / 중앙광장 / 수호영토 / 외계행성**으로 통일
- `territory-beliefs.js` 기반 공식 신념 시스템 적용
- 영토 엠블럼 및 신념 이미지 교체
- 메인맵 레이아웃 확대 및 화면 최적화
- 프로필 UI를 기존 레이아웃에서 **Grid 기반 구조**로 재설계 시작

### 메인맵 · 영토

- tribal-s1 원시시대 16:9 지도 에셋 적용 (`territory-zones-tribal-s1.png`)
- `territory-hit-zones.json` — viewBox `0 0 1600 900`, 4영역 좌표 재조정
  (`progressive` / `conservative` / `plaza` / `kantapbiya`)
- 메인맵 표시 영역 확대 및 HUD 레이아웃 화면 최적화

### 신념 · 엠블럼

- `public/territory-beliefs.js` — Single Source of Truth, `renderTerritoryCreed()` 연동
- 영토별 엠블럼 PNG 교체 (`assets/territory-icons/`)
- 프로필 신념 HUD: 엠블럼 + `belief` 문장 + `displayName`의 신념

### 프로필 UI (Grid 재설계)

- **상단** `profile-main`: 사이드바(아바타+4축 레이더) | 메인(헤더+신념+경험치)
- **하단** `profile-summaries`: 대표 업적 · 활동 요약 · 영토 기록 3카드
- 오른쪽 정치 성향 가로 게이지 제거 → 좌측 4축 성향 레이더로 통합
- 패널 폭 48rem → 56rem, 반응형 브레이크포인트(767/1199px)
- 뷰포트 높이 최적화: 패널 세로 스크롤 제거, 여백·신념 카드·레이더 축소, 하단 3카드 첫 화면 노출

---

## 2026-07-02 (오늘)

### ★ 영토 명칭 전면 통일

- **개혁영토** → **개척영토** (내부 ID `PROGRESSIVE` / CSS key `reform` 유지)
- **질서영토** → **수호영토** (내부 ID `CONSERVATIVE` / CSS key `order` 유지)
- **깐따삐아** → **외계행성** (내부 ID `KANTAPBIYA` 유지)
- 적용 범위: `public/index.html`, `public/permissions-guide.js`, `config/world-territories.js`, `config/alignment-rank-limits.js`, `docs/`
- 성향 게이지 라벨: "개혁%/질서%" → "개척%/수호%"
- TOP3 헤더: "개혁 · TOP3" → "개척 · TOP3", "질서 · TOP3" → "수호 · TOP3"
- 인기댓글 섹션: "개혁 인기댓글" → "개척 인기댓글", "질서 인기댓글" → "수호 인기댓글"
- 호감도 라벨: "개혁 호감도" → "개척 호감도", "질서 호감도" → "수호 호감도"
- aria-label, 게시판 해금 안내, 진영 이동 레이블 등 모든 사용자 노출 문자열 교체

### ★ 영토 신념 데이터 파일 분리 (`public/territory-beliefs.js` 신규 생성)

- 신념 데이터의 **Single Source of Truth** 확립
- `window.TERRITORY_BELIEFS` 으로 전역 노출 (IIFE 패턴)
- 데이터 구조:
  ```js
  {
    displayName : '개척영토',
    subtitle    : '변화를 만드는 사람',
    belief      : '미래는 기다리는 것이 아니라,\n개척하는 것이다.',
    philosophy  : '변화를 두려워하지 않고\n새로운 가능성을 향해 나아간다.'
  }
  ```
- `philosophy` 필드: 데이터에만 존재, 프로필 미노출 (향후 영토 소개·툴팁 활용)
- `index.html` 에서 `<script src="/territory-beliefs.js">` 로 가장 먼저 로드

### ★ 프로필 신념 HUD — 외부 데이터 연동

- `index.html` 인라인 `TERRITORY_BELIEFS` 상수 제거
- `renderTerritoryCreed()` → `window.TERRITORY_BELIEFS[cssId].belief` 참조로 교체
- HUD 서브텍스트: `displayName` 기반으로 "— 개척영토의 신념 —" 동적 생성
- `.avatar-territory-creed__motto` CSS에 `white-space: pre-line` 추가 (`\n` 줄바꿈 적용)

### 신념 문장 최종 확정

| 영토 | 신념 |
|------|------|
| 중앙광장 | "답은 하나가 아니라, 함께 찾는 것이다." |
| 개척영토 | "미래는 기다리는 것이 아니라, 개척하는 것이다." |
| 수호영토 | "질서는 자유를 지키는 가장 강한 약속이다." |
| 외계행성 | "경계 밖의 시선은 새로운 문명을 만든다." |

### 신념 JS 데이터 구조 개선 (`headline` → `belief` + `philosophy` 분리)

- 기존 `headline` 단일 필드 → `belief` (표시용) + `philosophy` (보관용)
- `title` 필드 → `displayName` + `subtitle` 필드로 대체 (표시명과 부제 분리)

---

## 2026-07-02 (오전)

### 영토 신념 HUD — JS 동적 렌더링 전환

- 기존: HTML에 4개 영토 문구 하드코딩 + CSS `display:none`/`block` show/hide
- 변경: HTML 2개 동적 element (`#avatar-creed-motto`, `#avatar-creed-sub`)
- `TERRITORY_BELIEFS` 상수 정의 → `setMeta()` 내 `renderTerritoryCreed()` 호출
- `TERRITORY_CSS_MAP` 추가: `COMMON→centrist`, `PROGRESSIVE→reform`, `CONSERVATIVE→order`, `KANTAPBIYA→alien`
- CSS `[data-for]` show/hide 선택자 전체 제거
- `data-territory` 동기화: panel, badge, cardWrap 모두 `renderTerritoryCreed()` 내에서 갱신

---

## 2026-07-02 (하단 가독성 정리)

### 하단 활동 영역 가독성 개선 (`public/index.html`)

- `avatar-deco-panel__label` 색상 조정: `#334155` → `#64748b`
- `avatar-deco-panel__value--empty` 색상 조정: `#1e293b` → `#475569`
- 잠금 슬롯 opacity: `0.45` → `0.65`
- sticky 헤더 `backdrop-filter: blur(8px)` 제거 → 스크롤 하단 콘텐츠 블러 해소
- 활동 카드 라벨 색상: `#64748b` → `#94a3b8`
- 접기 버튼 row `margin-top: 0.15rem` 추가

---

## 2026-06-28

### 영토 신념 HUD + 성향 HUD 리디자인 (commit: `0b43d7b`)

#### 소속 배너 HUD Banner화
- `flex` 전환, `align-self: stretch` (전폭 소속 배너)
- `min-height: 44px`, `padding: 0.7rem 1.1rem`, `border-radius: 12px`
- 영토별 색상 체계 적용: centrist → 녹색(`#3DFFB3`), reform → 파랑(`#5AA8FF`), order → 빨강(`#FF5A5A`), alien → 보라(`#C77DFF`)
- `box-shadow: 0 0 14px rgba(영토색, 0.18)` glow 추가

#### 영토 신념 HUD (신규 섹션)
- `div.avatar-territory-creed` 신규 추가 (소속 배너 바로 아래 배치)
- 신념 문장 4종 (영토별 HTML `data-for` 속성으로 관리)
- 워터마크: `::before` 가상요소 (🏛/⚡/🛡/🪐), `font-size: 7rem`, `opacity: 0.07`
- `data-territory` 변경으로 배경·문장·워터마크·텍스트색 전체 자동 전환
- 높이: `min-height: 4.5rem` (와이드 배너 형태)
- 신념 문장: `font-size: 1.38rem`, `font-weight: 800`, `max-height: 2.6em` (2줄 제한)

#### 성향 HUD 업데이트
- 아이콘 크기: `1.15rem` → `2.2rem` (게이지와 균형), `1.9rem` (엠블럼)
- 아이콘·게이지 간격 gap: `0.4rem` → `0.28rem`
- 게이지 색상 업데이트:
  - centrist: `#3DFFB3 → #8CFFD9`
  - reform: `#5AA8FF → #A5D4FF`
  - order: `#FF5A5A → #FFB1B1`
  - alien: `#C77DFF → #E6B3FF`
- `avatar-dock__panel[data-territory]` 선택자 기반 게이지 자동 색상 전환

---

## 2026-06-26

### 영토 소속 배지 HUD 개선

- `avatar-territory-badge` 구조 확립
  - `span.avatar-territory-badge__icon` (영토 아이콘)
  - `span#avatar-meta-territory` (영토명)
  - `span.avatar-territory-badge__suffix` ("주민")
- `div.avatar-player-info-sub` 추가 (Lv + 명성 보조)
- `p#avatar-meta-summary` → `avatar-dock__sr-only` (JS 연산용, 화면 비표시)

---

## 2026-06-26 (이전)

### 영토 프로필 패널 플레이어 카드 리디자인 (commit: `3767bd2`)

#### Part 8 — 영토 소속 시각화
- `avatar-territory-badge` 도입 (`data-territory` 기반)
- 영토 전용 표시 (배지 > 레벨 > 명성 정보 흐름)

#### Part 7 — 프로필 탭 전환 애니메이션
- `.avatar-dock__tab` hide → `opacity: 0; visibility: hidden; transform: translateY(0.35rem)` 전환
- `display: none` 대신 transition 기반 (레이아웃 안정성)

#### Part 6 — 접기 버튼 위치 변경
- 헤더에서 제거 → 패널 하단 `div.avatar-panel-close-row`로 이동
- "당기듯 열고 밀어서 닫는" UX

#### Part 5 — 플레이어 카드 4:5 비율 + 명예 장식 분리
- 카드 비율: `3:4` → `4:5`
- 명예 장식 슬롯(프레임/칭호/휘장/오라)을 카드 영역에서 → 패널 하단 영역으로 분리
- 패널 폭: `34rem` → `48rem`
- 좌측 카드 폭: `8.5rem` → `18.5rem`

#### Part 4 — 2열 레이아웃 도입
- `avatar-panel-body`: 2열 grid (좌: 플레이어 카드, 우: 정보)
- `avatar-player-card` 신규 (영토 하단바 아이콘 구조 포함)
- `avatar-honor-slots` 명예 장식 슬롯 UI

#### Part 3 — 아바타 슬롯 HUD화
- "잠금 이미지" 아바타 변경, "업로드" → "편집"
- 미래형 프로필 HUD 형태의 슬롯
- 빈 이미지: SVG + "SLOT" 텍스트

---

## 2026-06 (중앙광장 레이아웃 개편, commit: `3767bd2`)

### 전체 중앙광장 레이아웃 개편

- 기존 순서: 데일리 이슈 → 인기글/실시간 현황/영토 현황(2열) → 게시글 → 사이드바
- 구 "보드 정보" 섹션을 게시글 탭에서 → 별도 보드 정보 섹션으로
- 하단 헤더 blur 고정 요소 제거

### 정보 카드 디자인 통일

- 데일리 이슈 / 인기글/실시간 현황 / 영토 현황 카드 공통 스타일 정착
- border-radius, border, padding, gap, 색상 통일
- 좌측 accent line 강조

### 시각 정보 계층화(Hierarchy) 정립

- 데일리 이슈(Primary): 굵은 accent line, background 5~8% 흐림, shadow 강화
- 인기글/실시간 현황/영토 현황(Secondary): 조금 작은 사이즈
- 게시글(Passive): 최소화

### 게시글 카드 레이아웃 최적화

- 카드 내부 padding 20~30% 축소
- 카드 간 margin 축소
- 반응 버튼 compact 구성 (사용자 참여 기반, 나머지 숫자 제거)
- 붙여넣기 버튼 카드에서 제거
- 하드 정보 한 줄 정리 (작성자 · 날짜 · 카테고리)
- 게시글 목록 1열 + 구분선

---

## 2026-06 (UI Kit 구축, commit: `3767bd2` 이전)

### 전체 UI Kit / 디자인 시스템 구축

- CSS 변수 시스템 전체 도입 (`--sc-sp-*`, `--sc-r-*`, `--sc-bc-*`, etc.)
- 버튼 Primary/Secondary 스타일
- 카드 공통 스타일
- 섹션 헤더 스타일
- 인풋 필드 스타일
- 배지(Badge), 태그(Tag) 공통 컴포넌트 이식
- 패널 공통 border/radius/background
- 입력창 스타일 통일
- Transition 속도 통일 (`--sc-ease`)

---

## 2026-05 이전 (기반 구축)

### 초기 기반 구축

- Express 서버 + Supabase 연동
- 영토 지도 (SVG 히트존, PNG 배경 배치)
- 게시판 시스템 (중앙광장/개척/수호/외계행성)
- 데일리 이슈 시스템
- 팔로우 시스템
- 레벨/XP/명성 config 정의
- 성향 시스템 config 정의
- 외계행성 추방/체류 UI
- 알림 데이터 구조
- 히스토리 탭
- 게시글 상세 화면
- OAuth 소셜 로그인 버튼 (Google, Apple, Kakao, Naver)
- 게스트 모드
