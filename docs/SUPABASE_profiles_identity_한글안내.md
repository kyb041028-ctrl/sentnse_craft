# Supabase 테이블 안내 — `profiles` / `identity_history` (비전공자용)

이 문서는 `supabase/schema_profiles_identity_history.sql` 파일을 **사장님이 Supabase에서 직접 적용**할 때 보조 설명으로 쓰는 안내입니다.

---

## 1) 한 장으로 이해하기

| 테이블 이름 | 비유 | 들어가는 내용 |
|---|---|---|
| `profiles` | **명함(현재)** | 닉네임, 아바타, 시작 국가, 지금 신분, 문패 칭호 키, 축출 누적 카운트 등 “지금 상태” |
| `identity_history` | **일기장(과거 누적)** | 신분이 바뀐 순간마다 한 줄씩 쌓이는 기록(언제/무엇에서 무엇으로/이유 코드) |

---

## 2) Supabase에 “클릭 몇 번”으로 넣는 방법

1. Supabase 대시보드 접속
2. 왼쪽 메뉴 **SQL Editor**
3. **New query**
4. 프로젝트 폴더의 `supabase/schema_profiles_identity_history.sql` 내용을 **통째로 복사/붙여넣기**
5. **Run**

성공하면 Table Editor에 테이블이 보입니다.

---

## 3) 자동으로 돌아가는 편의 기능(이미 SQL에 포함됨)

- **회원가입하면 `profiles`가 자동 생성**  
  `auth.users`에 유저가 생길 때, `public.profiles`에 한 줄이 자동으로 만들어집니다.

- **`profiles`의 신분(`citizenship_status`)이 바뀌면 `identity_history`에 자동 기록**  
  닉네임만 바꾼 경우에는 일기장이 불필요하게 길어지지 않도록, **신분 컬럼이 바뀔 때만** 기록합니다.

- **`updated_at` 자동 갱신**  
  프로필을 수정할 때마다 `updated_at`이 현재 시각으로 갱신됩니다.

---

## 4) 보안(RLS)을 이렇게 잡아둔 이유

- **프로필 읽기**: 로그인 사용자뿐 아니라 **게스트(anon)** 도 읽을 수 있게 해두었습니다.  
  “비공개 운영”으로 바꾸고 싶으면 SQL의 `profiles_select_anon` 정책을 삭제하면 됩니다.

- **프로필 수정**: **본인 것만** 수정 가능합니다.

- **신분 일기장(`identity_history`)**:
  - **읽기**: 본인 기록만
  - **쓰기(직접 INSERT)**: 일반 유저에게는 열지 않았습니다(조작 방지).  
    대신 **DB 트리거(자동 장치)**가 신분 변경을 기록합니다.

---

## 5) 앱 설정(`app-config.js`)과 맞추면 좋은 것들

- `home_country`: **ISO 3166-1 alpha-2** (대문자 2글자, 예: `KR`, `US`, `DE`).  
  가입 화면에서 고를 수 있는 나라 목록은 서버 `/api/public-config` 의 `signupCountries` 와 같게 맞추면 됩니다.  
  (이미 예전 SQL만 적용해 두었다면 `supabase/migration_home_country_iso.sql` 을 한 번 더 실행하세요.)
- `citizenship_status`: `CITIZEN`, `EXILED`, `KANTAPBIYA_RESIDENT`, `OUTLANDER_SPY`
- `title_badge_key`: 예) `SPY` (한글 칭호는 앱 매핑 테이블에서 표시)
- `identity_history.reason_code`: 앱의 `reasonCodes`와 최대한 동일하게 쓰는 것이 운영이 편합니다.

SQL 트리거가 자동으로 넣는 사유 코드는 다음이 추가로 등장합니다.

- `SIGNUP`: 가입 직후 첫 프로필 생성 기록
- `PROFILE_CITIZENSHIP_CHANGED`: 프로필에서 신분 코드가 바뀐 경우(자동 기록)

원하시면 나중에 `app-config.js`의 `reasonCodes`에 위 두 줄을 공식으로 추가해 일치시키면 됩니다.

---

## 6) 가입 시 시작 국가를 넣고 싶다면(개발 팁)

회원가입 요청에서 `raw_user_meta_data`에 `home_country`를 넣으면 SQL이 그 값을 읽습니다.  
**대문자 2글자**(예: `KR`, `BR`)가 아니면 자동으로 `KR`로 바꿉니다.  
목록에 없는 코드(형식만 맞는 `ZZ` 등)는 **앱 서버**에서 가입 단계에서 막는 것이 좋습니다.

---

## 7) 문제 해결(가장 흔한 것)

- **“permission denied for schema auth” 같은 오류**  
  Supabase SQL Editor(관리자 권한)에서 실행했는지 확인하세요. 로컬 클라이언트에서 권한이 약한 역할로 실행하면 실패할 수 있습니다.

- **트리거/함수 오류**  
  Supabase Postgres 버전에 따라 `EXECUTE PROCEDURE` / `EXECUTE FUNCTION` 표기가 환경마다 다를 수 있습니다. 오류 메시지에 맞춰 한 줄만 바꿔보세요.
