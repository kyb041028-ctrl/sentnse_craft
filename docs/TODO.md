# 센텐스크래프트 — 작업 목록 (TODO)

> 마지막 업데이트: **2026-07-13 (작업 종료 · Follow System v1 완료 · main 단일 브랜치)**  
> **새 AI 세션:** `docs/AI_HANDOFF.md` 먼저 읽기 → `PROJECT_CONTEXT` · `CHANGELOG` · 이 문서  
> **상태:** ✅ 완료 · 🔜 다음(설계 확정 후) · ⏸️ 보류

---

## 현재 상태 (한 줄)

- **진행 중 Cursor 구현 작업: 없음**
- **방금 완료:** Follow System v1 통합 QA + HUD/ProfileFrame 즉시 갱신 FIX
- **Git:** `main`만 사용 · 집·가게 동일하게 `pull`/`push origin main`
- **다음:** 사용자가 ChatGPT와 설계를 확정한 뒤 명령한 작업만 시작

---

## 🔜 다음 (설계 확정 후 · 아직 구현 시작 금지)

> 우선순위는 사용자 명령으로 확정. 아래는 **후보**일 뿐.

1. [ ] **Settings System v1** — 설계 확정 후
2. [ ] **Admin System v1** — 설계 확정 후
3. [ ] **업적 시스템** — **설계 검토 중** · 확정 전 구현·TODO 승격 금지
4. [ ] **베타 운영 준비** — 설계·범위 확정 후

---

## ✅ Follow System v1 — 완료 (2026-07-12 구현 · 2026-07-13 QA)

1. [x] 팔로워·팔로잉 2탭 목록 모달 (`follow-list-modal.js`) · HUD 클릭 진입
2. [x] 아바타·닉네임 → ProfileFrame · Empty · ESC/배경/X
3. [x] 팔로잉 탭 언팔로우 · `toggleFollow` · `sc_follow_v1` 양방향
4. [x] HUD 팔로워·팔로잉 즉시 갱신 · 게시글 팔로우 버튼 동기화
5. [x] 열린 ProfileFrame 팔로워 즉시 갱신
6. [x] 통합 QA PASS · Known Issue 없음
7. [x] **FIX** — HUD 팔로워 SSOT=`FollowSystem.getFollowerCount` (`player-progression.js`)
8. [x] **FIX** — `toggleFollow` 후 ProfileFrame 모달/HUD 즉시 재렌더 (`follow-system.js`)

**한계 (의도):** `sc_follow_v1` localStorage 전용 · 서버 동기화 없음

---

## ✅ 최근 완료 (요약)

| 항목 | 날짜 |
|------|------|
| Git `main`←`master` 통합 · `master` 삭제 · 백업 태그 유지 | 2026-07-13 |
| Search System v1 | 2026-07-12 |
| Community v2 북마크 목록 1차 | 2026-07-12 |
| ProfileFrame 팔로워·표시 안정화 | 2026-07-12 |
| Community v1 (북마크·공유·신고) | 2026-07-11 |
| ProfileFrame PNG·성향지도·업적 슬롯 UI | 2026-07-09~10 |

---

## ⏸️ 보류 — Profile / Community

- [ ] 업적 시스템 설계 및 실제 조건
- [ ] 대표 업적 설정 기능
- [ ] 전달한 아우라 계산
- [ ] 시민 영향력 공식 고도화
- [ ] ProfileFrame 전체 UI 폴리싱
- [ ] 팔로워 상단 UI 최종 디자인 보완
- [ ] 타인 프로필 팔로워 목록
- [ ] 팔로워·팔로잉 검색
- [ ] 추천 사용자
- [ ] 사용자 차단
- [ ] 친구 요청
- [ ] 최근 본 시민
- [ ] 북마크 목록 고도화 (폴더/태그/메모 등)

---

## ⏸️ 보류 — UI

- [ ] HUD 버튼 재배치
- [ ] 랭킹 UI 재보완
- [ ] 모달 디자인 통일
- [ ] 아이콘 스타일 통일
- [ ] 모바일 UI
- [ ] 반응형 최종 QA
- [ ] 아바타 시스템
- [ ] ProfileFrame 경험치 게이지 위치 최종 보정
- [ ] `SC_PROFILE_LAYOUT` 4스킨 최종 확정
- [ ] ProfileFrame 모바일 최종 보정

---

## ⏸️ 보류 — 운영 / 데이터

- [ ] Settings System v1
- [ ] Admin System v1
- [ ] 신고 목록·상세·처리
- [ ] 실제 DB·Supabase 연결
- [ ] 팔로우·검색·북마크·신고 서버 동기화
- [ ] 개발·테스트·운영 환경 분리
- [ ] 백업·복구
- [ ] 오류 로그
- [ ] 권한·보안
- [ ] 이용약관
- [ ] 개인정보처리방침

---

## ⏸️ 보류 — 장기

- [ ] 시즌 시스템
- [ ] 영토 성장
- [ ] 지도자 시스템
- [ ] 외계행성 고도화
- [ ] 영토전
- [ ] 결제 시스템

---

## ✅ 기반 완료 (참고)

- CSS UI Kit · `data-territory` · tribal-s1 지도·히트존
- 영토 명칭·신념 SSOT (`territory-beliefs.js`)
- 중앙광장·영토 게시판·반응·상세
- displayName · Search v1 · 랭킹 UI · 팔로우 알림
- ProfileFrame 파이프라인 · 활동/영토 표시 안정화
- Supabase Auth API 뼈대 · 채팅 인메모리 베타

---

## 프로필 UI 확정 방향 (구현 시 준수)

- ProfileFrame = PNG + 오버레이 HUD (기본 UI)
- legacy 시민 카드 — `hidden` 유지
- 성향은 ProfileFrame에서 **레이더만** (가로 게이지·% 노출 금지 · exp% 예외)
- 가입일 금지 · 소속 중복 금지
- 파이프라인: `SC_PROFILE_DATA` → `getCurrentProfileData()` → `renderProfileData()`
