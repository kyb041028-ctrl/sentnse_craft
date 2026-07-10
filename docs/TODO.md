# 센텐스크래프트 — 작업 목록 (TODO)

> 마지막 업데이트: 2026-07-10 (AI 인수인계 문서)
>
> **새 AI 세션:** `docs/AI_HANDOFF.md` — 구조·완료·TODO·성향 시스템 요약

---

## 🔜 다음 작업 — 프로필 확장 (순서대로)

> **2026-07-10 완료:** 성향지도 SVG · 좌표 에디터 캘리브레이션 (최대치 미리보기 · AI 복사)  
> **표준 파이프라인:** `SC_PROFILE_DATA` → `getCurrentProfileData()` → `renderProfileData()` → ProfileFrame

1. [x] **성향 지도** SVG 오버레이 (`alignmentMapLayer` · `SC_PROFILE_LAYOUT.alignmentMap`) (2026-07-10)
2. [ ] **아바타** 구현
3. [x] **대표 업적** 구현 (`achievementLayer` · 슬롯 UI · 아이콘/이름/날짜 좌표 에디터) (2026-07-10)
4. [x] `getCurrentProfileData()` — `loadCurrentUserProfile()` merge 어댑터 (Auth · API 캐시 · progression · 미로그인 Mock fallback, 2026-07-10)
5. [~] 실제 경험치·활동·영토·**성향** 집계 로직 연동 — ProfileFrame 성향지도 **표시용** localStorage 어댑터 연결 (2026-07-10)
6. [x] `alignmentMap` 좌표 확정 — center/pioneer 305,355 · guardian/alien 309,360 (2026-07-10)
7. [ ] 경험치 게이지 위치 최종 보정 (좌표 에디터)
8. [ ] `SC_PROFILE_LAYOUT` **최종 확정** (좌표 에디터 · 4스킨별)
9. [ ] 4개 영토 스킨 **최종 테스트** (PNG + 좌표 + 데이터 갱신)
10. [ ] ProfileFrame **모바일 최종 보정**

### 프로필 UI 확정 방향 (구현 시 준수)

- 유저가 주인공, 영토는 배경 정체성
- ProfileFrame = PNG + 오버레이 HUD (현재 기본 UI)
- legacy 영토 시민 카드 — hidden · 향후 아바타·레이더 연동 참고용
- 성향 **레이더만** · 가로 게이지·퍼센트 노출 **금지** (ProfileFrame exp% 텍스트·expGauge는 예외)
- 가입일 **금지** · 소속 **중복 금지**
- 경험치 게이지(expGauge) — **영토 무관** · 바 100% 배경 · % 텍스트만 실제 값 · **좌 밝은 노랑 → 우 짙은 갈색** 그라데이션

### ProfileFrame 완료 체크리스트 (2026-07-09) ✅

- [x] PNG 기본 UI · 4종 `territorySkin` · legacy hidden
- [x] 좌측 하단 HUD · 접기 버튼 · PNG contain · 크기·위치 고정
- [x] `SC_PROFILE_LAYOUT` px (1024×819) · scale · 좌표 에디터
- [x] `SC_PROFILE_DATA` · `renderProfileData()` · `getCurrentProfileData()` · `refreshCurrentProfile()`
- [x] 텍스트 13슬롯 + territorySkin PNG + expGauge
- [x] expGauge 노란/골드 · `{ x: 392, y: 126, w: 590, h: 10 }`

---
## 완료된 작업 ✅

### UI / 디자인 시스템

- [x] CSS 변수 기반 디자인 시스템 구축 (`--sc-sp-*`, `--sc-r-*`, `--sc-bc-*` 등)
- [x] UI Kit 클래스 정의 (`sc-panel`, `sc-card`, `sc-badge`, `sc-btn`, `sc-section-title`, `sc-tag`, `sc-input`)
- [x] 게임 HUD 전체 디자인 언어 확립
- [x] 버튼 Primary / Secondary 스타일 통일
- [x] 카드 공통 스타일 (border, radius, padding, shadow, gap)
- [x] 섹션 헤더 스타일 통일
- [x] 인풋 필드 스타일 통일
- [x] 배지(Badge), 태그(Tag) 스타일 정의
- [x] 패널 공통 border / radius / background
- [x] 여백(Spacing) 규칙 정리
- [x] 폰트 계층(Font Rule) 정리
- [x] Transition 속도 통일 (`--sc-ease`)
- [x] 영토별 색상 체계 정리 (centrist/reform/order/alien)
- [x] `data-territory` 기반 CSS 자동 테마 전환 구조

### 영토 명칭 통일 (2026-07-02)

- [x] 개혁영토 → 개척영토 (내부 ID 유지)
- [x] 질서영토 → 수호영토 (내부 ID 유지)
- [x] 깐따삐아 → 외계행성 (내부 ID KANTAPBIYA 유지)
- [x] index.html 전체 사용자 표시 문자열 교체
- [x] permissions-guide.js 영토명 교체
- [x] config/world-territories.js labelKo 교체
- [x] config/alignment-rank-limits.js notesKo 교체
- [x] docs 문서 영토명 교체

### 영토 신념 시스템 (2026-07-02)

- [x] `public/territory-beliefs.js` 생성 — Single Source of Truth
- [x] `window.TERRITORY_BELIEFS` 전역 노출 (IIFE 패턴)
- [x] `displayName`, `subtitle`, `belief`, `philosophy` 필드 구조 확립
- [x] `index.html` 인라인 신념 상수 제거 → 외부 파일 참조로 전환
- [x] `renderTerritoryCreed()` — `belief.belief` 필드 참조
- [x] `philosophy` 필드 저장만 유지 (프로필 미노출)
- [x] HUD 서브텍스트 `displayName` 기반 동적 생성
- [x] `.avatar-territory-creed__motto` CSS `white-space: pre-line` 추가
- [x] 신념 문장 4종 최종 확정

### 중앙광장 (Central Plaza)

- [x] 중앙광장 레이아웃 개편 (데일리 이슈 → 2열 카드 → 게시글 → 사이드바)
- [x] 데일리 이슈 섹션 Primary 강화 (굵은 accent line, shadow)
- [x] 인기글/실시간 현황 / 영토 현황 2열 카드 구성
- [x] 게시글 섹션 카드 스타일 통일
- [x] 하단 헤더 blur 고정 요소 제거
- [x] 게시글 카드 압축 (padding, gap, 버튼 compact)
- [x] 게시글 카드 붙여넣기 버튼 제거 (프로필 화면으로 이동)
- [x] 게시글 카드 레이아웃 선정 기준 확립
- [x] 반응 버튼 사용자 참여 기반 compact 구성
- [x] 광장 정보 섹션 전체 재 + 구분선

### 메인 지도 / 히트존 (2026-07-04)

- [x] 신규 16:9 원시시대(tribal-s1) 메인 영토맵 교체
- [x] tribal-s1 지도용 히트존 좌표 에디터 수정본 적용 (`territory-hit-zones.json`)
- [x] viewBox `0 0 1600 900` 기준 progressive / conservative / plaza / kantapbiya 4영역 재조정
- [x] 메인맵 레이아웃 확대 및 화면 최적화
- [x] 영토 엠블럼 PNG 교체 (`assets/territory-icons/`)
- [x] 영토 배너·엠블럼 WEBP 에셋 정리 (`assets/territories/banners/`, `emblems/`)
- [x] 영토 배너·엠블럼 WEBP 프로필 신념 박스 1차 연결 (CSS 변수 + 배경)

### ProfileFrame 프로필 시스템 (2026-07-09)

- [x] PNG 기반 ProfileFrame 기본 UI · legacy `hidden`
- [x] 4종 영토 프로필 PNG (`profiles/center|pioneer|guardian|alien.png`)
- [x] `territorySkin` → `setProfileTerritorySkin()` PNG 자동 변경
- [x] 좌측 하단 HUD · 접기 버튼 Frame 내 우하단 · PNG contain
- [x] `%` 좌표 폐기 → `SC_PROFILE_LAYOUT` px (1024×819) · scale
- [x] `SC_PROFILE_LAYOUT_BY_SKIN` (center=pioneer · guardian/alien 개별)
- [x] 대표 업적 슬롯 좌표 에디터 (`achievement` · `achievementSlots` · AI 복사) (2026-07-10)
- [x] 성향지도 축 스케일 그룹 분리 (`SC_PROFILE_ALIGNMENT_AXIS_MAX_BY_GROUP`) (2026-07-10)
- [x] `SC_PROFILE_DATA` 단일 더미 객체
- [x] `renderProfileData(data)` — 텍스트 · PNG · expGauge
- [x] `getCurrentProfileData()` Mock Adapter · `refreshCurrentProfile()`
- [x] 경험치 게이지 `expGaugeLayer` · 노란/골드 · 100% Fill · expLayer 텍스트 상위
- [x] `expGauge` 좌표 `{ x: 392, y: 126, w: 590, h: 10 }`
- [x] 성향지도 SVG `alignmentMapLayer` · `data.alignment` · `renderProfileAlignmentMap()` (2026-07-10)
- [x] 대표 업적 `renderProfileAchievements()` · 슬롯 UI (2026-07-10)
- [x] `alignmentMap` 좌표 `{ x: 304, y: 353, w: 190, h: 190 }` (임시)

### 프로필 패널 (2026-07-04 Grid 재설계)

- [x] 프로필 UI Grid 기반 구조 재설계 시작 (profile-main + profile-summaries)
- [x] 오른쪽 성향 가로 게이지 제거, 4축 성향 레이더로 대체
- [x] `territory-beliefs.js` 기반 신념 HUD (엠블럼 + belief + ○○의 신념)
- [x] profile-summary-* 요약 섹션 class 분리
- [x] 프로필 HUD 정보 바 통합 · 신념/아바타/레이더/하단카드 compact 다듬기
- [x] 영토 시민 카드 레이아웃 골격 재정렬 (좌 아바타 / 우 정보+보조배너+레이더, 하단 3카드)
- [x] 프로필 패널 레이아웃 안정화 (패널 스크롤, 클리핑 복구, 배너 72px·레이더 min 150px)
- [x] 프로필 방향·항목명·에셋 v1 정의 문서화 (PROJECT_CONTEXT / TODO / CHANGELOG)
- [x] 프로필 내부 스크롤 제거
- [x] 프로필 세로 여백 압축
- [x] 신념 카드 높이 최적화
- [x] 성향 레이더 크기 조정
- [x] 하단 3개 요약 카드 첫 화면 노출 레이아웃 최적화

### 프로필 패널 (이전)

- [x] 프로필 패널 게임 HUD 플레이어 카드 리디자인
- [x] 플레이어 카드 (4:5 비율, 영토별 하단 바 아이콘 구조)
- [x] 아바타 슬롯 HUD형태 (SVG 플레이스홀더, HUD 형태)
- [x] 영토 소속 배너 하단 오른쪽 배치
- [x] 플레이어 카드 HUD 코너 장식 강화
- [x] 명예 장식 슬롯 (프레임/칭호/휘장/오라) → 패널 하단 영역 HUD 패널
- [x] 소속 배너 HUD Banner화 (min-height 44px, 영토 색상)
- [x] 영토 신념 HUD 섹션 (신념 문장 + 워터마크 + 텍스트색)
- [x] 성향 게이지 영토 색상 적용 (`data-territory` 자동 전환)
- [x] 성향 아이콘 확대 (2.2rem)
- [x] 경험치 바
- [x] 대표 업적 (pill 형태 더미 데이터)
- [x] 활동 카드 (2x2 그리드, 더미 레이아웃)
- [x] 뒤로 가기 (활동 카드 위에 배치)
- [x] 접기 버튼 (패널 하단 구성)
- [x] 패널 탭 전환 (프로필 화면의 탭 전환, transition)
- [x] 패널 전체 폭 (48rem)
- [x] 반응형 (모바일 1열 자동 전환)

### 영토 게시판

- [x] 영토 게시판 기반 구조 (개척/수호/외계행성)
- [x] 게시글 작성/조회/반응
- [x] 게시글 상세 작성자 영역 1차 CSS 개선 (HUD 카드형 · 팔로우 배치)
- [x] 게시글 상세 작성자 카드 2차 (레벨/명성 · `PlayerProgression` 재사용)
- [x] 게시글 상세 작성자 카드 3차 (영토 Badge · `territoryShortLabel` / `data-territory`)
- [x] Hover 미니 프로필 1차 — `ScMiniProfile` · 작성자 카드 Hover
- [x] 프로필 모달 껍데기 1차 — `ScProfileModal` · `openUserProfile()` 연동 (placeholder)
- [x] ScProfileModal ProfileFrame 렌더 연결 1차 — `renderProfileFrameInModal` · `buildUserProfileDataForModal`
- [x] ScProfileModal ProfileFrame 회귀 QA — Hover/모달/HUD/4스킨 · 닫기 이중 콜백 FIX
- [ ] ScProfileModal 2차 — DB/Supabase 실데이터 · 댓글/피드/알림에서 `openUserProfile` 확장
- [ ] Hover 미니 프로필 2차 — 댓글·알림·활동피드·랭킹 확장
- [x] 팔로우 시스템 + 알림
- [x] 알림센터 1차 — `sc_notifications_v1` · 맵 HUD/프로필 벨 · comment/like/follow/level_up (2026-07-10)
- [x] 최근 세계 활동 피드 1차 — `sc_activity_feed_v1` · 메인 지도 HUD (2026-07-10)
- [ ] 알림센터 2차 — 서버 동기화 · 실시간 푸시 · 업적 연동
- [x] 외계행성 단일 허브 UI

### 기반 / 백엔드

- [x] Express 서버 기반 구축
- [x] Supabase Auth API (`/api/auth/*`)
- [x] 플레이어 프로필 API (`/api/me/profile`)
- [x] 채팅 API (인메모리 베타)
- [x] 영토/게시판/성향/레벨 설정 파일 (`config/`)
- [x] 게스트 모드

---

## 다음 우선순위 (2026-07-04)

### 우선순위 1 — 프로필 뷰포트 최적화 ✅

- [x] 프로필 내부 스크롤 제거
- [x] 프로필 세로 여백 압축
- [x] 신념 카드 높이 최적화
- [x] 성향 레이더 크기 조정
- [x] 하단 3개 요약 카드가 첫 화면에 모두 보이도록 레이아웃 최적화

### 우선순위 2 — 프로필 마무리

- [x] 프로필 최종 HUD 디자인 다듬기
- [ ] 아바타 시스템 추가
- [ ] 업적/활동/영토기록 탭 시스템 추가
- [ ] 프로필 최종 QA

---

## 미완료 작업 🔲

### 프로필 패널 / ProfileFrame

- [ ] 위 **「다음 작업 — 프로필 확장」** 1~15 순서 참조
- [~] ProfileFrame 성향지도 ↔ 게임 성향 **표시 연결** (localStorage 어댑터 · 서버 집계는 미완)
- [x] `getCurrentProfileData()` · `loadCurrentUserProfile()` merge 어댑터 (2026-07-10)
- [ ] 실제 아바타 이미지 업로드 (Supabase Storage)
- [ ] 활동 메뉴 링크 실제 기능 연결
- [ ] 명예 장식 슬롯 실제 아이템 시스템 연동
- [ ] 프로필 탭 (권한/히스토리/설정/뒤로) 실제 구현
- [x] 프로필 PNG 4종 적용 (ProfileFrame — 2026-07-09)

### 중앙광장 / 영토

- [ ] 성향 AI 한 줄 설명 실제 연동 (UI 골격 → AI API)
- [ ] 성향 설명 카드 실제 수치 연동 · 시안 장식 polish
- [ ] 데일리 이슈 AI 자동 생성 (AI 기반 이슈 콘텐츠 연동)
- [ ] 인기글/실시간 현황 실제 데이터 연동
- [ ] 실시간 영토 현황 실제 데이터 연동
- [ ] 영토 인구 시각화 (인구 단계별 이미지 변화)
- [ ] 영토 게시판 단계 해금 (성향 수치 기준)
- [ ] 성향 계산 실제 집계 (글/댓글/반응 → 성향 수치 변화)
- [ ] 영토 귀속 자동화 (성향 → 영토 이동)
- [ ] 첩자 배지 자동 부여 (타 영토 게시판 작성 시)

### 레벨 / 명성

- [ ] XP 실제 적용 (글 작성 +25, 댓글 +12, 데일리 이슈 +10)
- [ ] 레벨 업 처리 (1~5단계, XP 40/50/60/70/80)
- [ ] 명성 점수 계산 (좋아요·비추·공감·팔로우)
- [ ] 영토 기여 인구 비율 기반 점수 적용

### 영토전 (배틀 시스템)

- [ ] 영토전 기반 구조 설계 및 구현
- [ ] 영토전 참여/결과 조건 정의
- [ ] 시즌 MVP 보상
- [ ] 영토전 결과 텍스트 칭호 부여 기능

### 추방 / 외계행성

- [ ] 추방 자동화 (비호감 30개 → 외계행성 이동)
- [ ] 지구귀환티켓 결제 연동
- [ ] 외계행성 체류 기간 관리 (0, 3, 7, 14, 30, 90일)
- [ ] 외계행성 전용 성향 시스템 (정치 성향 없음)

### 아바타 / 보상 시스템

- [ ] 아바타 슬롯 실제 이미지 업로드
- [ ] 영토별 기본 아바타 이미지 제작
- [ ] 시즌 보상 프레임 지급 구현
- [ ] 영토전 결과 칭호 보상 부여
- [ ] 업적 시스템 (조건 정의 + 실력 처리)
- [ ] 오라 지급 구현

### 결제

- [ ] 카카오페이 연동
- [ ] 토스페이 연동
- [ ] 휴대폰 소액결제 연동
- [ ] 월 구독권 처리 (4,900원, 매일 5시 리셋)
- [ ] 직언패스500 처리 (500원, 영구 보존)
- [ ] 지구귀환티켓 처리 (3,000원)

### 관리 / 운영

- [ ] 관리자 패널 (신고 처리, 추방 관리, 이슈 등록)
- [ ] 데일리 이슈 운영 도구
- [ ] 사용자 신고 → 조치 프로세스
- [ ] AI 이슈 자동화 파이프라인 (매일 갱신)
