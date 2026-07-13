# 센텐스크래프트 — AI 세션 인수인계 문서

> **새 Cursor/AI 세션 시작 시 이 문서를 먼저 읽으세요.**  
> 마지막 업데이트: **2026-07-13 (작업 종료 · 가게 PC 인수인계)**  
> 상세: `docs/PROJECT_CONTEXT.md` · `docs/TODO.md` · `docs/CHANGELOG.md`

---

## 0. 30초 요약

| 항목 | 내용 |
|------|------|
| 프로젝트 | 게임형 정치 커뮤니티 SPA — 글·반응 → 성향 → 영토 |
| 프론트 | `public/index.html` 단일 SPA (+ 모듈 JS) · 빌드 없음 |
| 백엔드 | `server.js` (Express) + Supabase Auth/DB (일부) |
| Git | **`main` 단일 브랜치만 사용** · `origin/HEAD` → `origin/main` |
| 현재 단계 | **Follow System v1 ✅ 완료** · Cursor 구현 작업 **일시 중단** |
| 다음 | 사용자가 ChatGPT와 **설계를 확정한 뒤** 명령한 작업만 진행 |
| 프로필 UI | **ProfileFrame** (PNG 1024×819 + px 오버레이) · legacy `hidden` |
| Follow | `sc_follow_v1` **localStorage 전용** (서버 동기화 없음) |

### 새 세션 필수 규칙

1. **반드시 `main`에서 `git pull` 후** 문서 4종을 **끝까지** 읽기  
2. UI는 `index.html` `<style>` · `sc-*` UI Kit · `data-territory` 색상  
3. 기존 JS 로직(성향·레벨·팔로우·반응) 함부로 수정 금지  
4. HTML `id` 변경 금지 · 작업 후 `CHANGELOG.md` + `TODO.md` 갱신  
5. **사용자가 새 구현 명령을 주기 전에는 코드 수정 금지**

---

## 1. 내일 가게 PC — 첫 시작 절차 (필수)

```
1. 프로젝트 폴더 열기
   C:\Users\user\Desktop\sentence_craft   (또는 가게 PC의 동일 클론 경로)

2. git fetch origin

3. git checkout main

4. git pull origin main

5. git status
   → working tree clean / up to date with 'origin/main' 확인

6. 아래 문서 4종을 마지막 줄까지 읽기
   - docs/PROJECT_CONTEXT.md
   - docs/CHANGELOG.md
   - docs/TODO.md
   - docs/AI_HANDOFF.md   ← 이 문서

7. 최신 완료 / 다음 / 보류 작업을 한 줄로 요약해 사용자에게 보고

8. 사용자가 새 구현 명령을 주기 전에는 코드·문서 임의 수정 금지
```

실행:

```bash
npm start   # http://localhost:3000
```

---

## 2. Git 상태 (2026-07-13 확정)

| 항목 | 상태 |
|------|------|
| 사용 브랜치 | **`main`만** |
| `master` | 로컬·원격 **삭제 완료** (재생성 금지, 필요 시 사용자 지시) |
| `origin/HEAD` | `origin/main` |
| 백업 태그 | `backup/pre-merge-main-91ad00b` **유지** (삭제 금지) |
| 작업 방식 | 집·가게 모두 `git pull origin main` / `git push origin main` |

오늘 한 일: `main`←`master` fast-forward 통합 → `master` 삭제 → Follow v1 QA·최소 수정 → 문서 갱신 → push.

---

## 3. 오늘 완료 — Follow System v1

### 기능

- 팔로워·팔로잉 **2탭** 목록 모달 (`follow-list-modal.js`)
- HUD 팔로워/팔로잉 수 클릭 진입
- 아바타·닉네임 클릭 → ProfileFrame (`openUserProfile`)
- 팔로잉 탭 **언팔로우** (`toggleFollow` · stopPropagation)
- `sc_follow_v1` following / followers **양방향** 갱신
- HUD 팔로워·팔로잉 **즉시** 갱신
- 게시글 목록·상세 `board__follow-btn` **즉시** 동기화
- 열린 ProfileFrame 팔로워 수 **즉시** 갱신
- 새로고침 후 localStorage 유지 · Console 오류 없음 · Known Issue **없음**

### 오늘 QA FIX

| 파일 | 내용 |
|------|------|
| `public/player-progression.js` | HUD 팔로워 = `FollowSystem.getFollowerCount()` (SSOT 통일) |
| `public/follow-system.js` | 팔로우/언팔로우 후 열린 ProfileFrame 모달 + HUD ProfileFrame 즉시 재렌더 |

### 의도적 한계

- `sc_follow_v1`는 **localStorage 전용** · 서버·다기기 동기화 미구현

---

## 4. 다음 작업 (설계 확정 후만)

**현재 Cursor에서 진행 중인 구현 작업: 없음.**

후보 (설계 확정 후 사용자 명령 시):

1. Settings System v1  
2. 업적 시스템 **설계** (구현은 설계 확정 전 금지)  
3. Admin System v1  
4. 베타 운영 준비  

업적 시스템은 **설계 검토 중** — TODO에서 확정 작업으로 올리지 말고, 임의 구현하지 마세요.

---

## 5. 보류 항목 (누락 금지)

### Profile / Community

- 업적 시스템 설계 및 실제 조건 · 대표 업적 설정  
- 전달한 아우라 계산 · 시민 영향력 공식 고도화  
- ProfileFrame 전체 UI 폴리싱 · 팔로워 상단 UI 최종 디자인  
- 타인 프로필 팔로워 목록 · 팔로워·팔로잉 검색  
- 추천 사용자 · 사용자 차단 · 친구 요청 · 최근 본 시민  
- 북마크 목록 고도화  

### UI

- HUD 버튼 재배치 · 랭킹 UI 재보완 · 모달/아이콘 통일  
- 모바일 UI · 반응형 최종 QA · 아바타 시스템  

### 운영 / 데이터

- Settings System v1 · Admin System v1  
- 신고 목록·상세·처리  
- 실제 DB·Supabase 연결 · 팔로우·검색·북마크·신고 서버 동기화  
- 개발·테스트·운영 환경 분리 · 백업·복구 · 오류 로그  
- 권한·보안 · 이용약관 · 개인정보처리방침  

### 장기

- 시즌 · 영토 성장 · 지도자 · 외계행성 고도화 · 영토전 · 결제  

---

## 6. 변경 금지 핵심 구조

- 내부 영토 ID: `COMMON` / `PROGRESSIVE` / `CONSERVATIVE` / `KANTAPBIYA`  
- 표시명: 중앙광장 / 개척영토 / 수호영토 / 외계행성  
- 성향 게임 축 ≠ ProfileFrame 4축 (매핑 미연동)  
- Follow·북마크·신고 등 클라이언트 키: `sc_follow_v1`, `sc_bookmarks_v1`, `sc_reports_v1`  
- HTML `id` · FollowSystem/PlayerProgression 데이터 구조 임의 변경 금지  

---

## 7. 폴더 핵심 경로

```
public/index.html              # 메인 SPA
public/follow-system.js        # 팔로우 그래프·알림
public/follow-list-modal.js    # 팔로워/팔로잉 모달
public/player-progression.js   # 레벨·HUD (팔로워 수는 FollowSystem SSOT)
public/search-system.js        # Search v1
public/bookmark-list.js        # 북마크 목록
docs/PROJECT_CONTEXT.md
docs/CHANGELOG.md
docs/TODO.md
docs/AI_HANDOFF.md             # ← 이 문서
server.js
```

---

## 8. 새 세션 체크리스트

- [ ] `main` pull 완료 · status clean  
- [ ] 문서 4종 전부 읽음  
- [ ] Follow v1 완료·보류·다음 후보 파악  
- [ ] **사용자 명령 전 코드 수정 없음**  
- [ ] 설계 미확정 기능(업적 등) 임의 구현 안 함  
