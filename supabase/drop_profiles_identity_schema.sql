/*
================================================================================
센텐스크래프트 — Supabase에서 profiles 관련 걸 “통째로 지우기”
================================================================================
【언제 쓰나요?】
- 제미나이 등으로 Supabase에 만져 둔 SQL이 꼬였을 때
- `schema_profiles_identity_history.sql` 을 **처음부터 다시** 깔고 싶을 때

【주의 — 꼭 읽기】
1) 이 스크립트를 실행하면 **`public.profiles`**, **`public.identity_history`** 안의 **데이터가 전부 삭제**됩니다.
2) **로그인 계정 목록(`auth.users`)** 은 이 파일만으로는 지우지 **않습니다**.  
   계정까지 깨끗이 하려면 Supabase 대시보드 **Authentication → Users** 에서 직접 삭제하세요.
3) 순서: **① 이 파일 실행 → ② `schema_profiles_identity_history.sql` 전체 실행**

================================================================================
*/

-- 가입 시 profiles 자동 생성 (auth.users에 붙어 있음 — 먼저 뗍니다)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 자식 → 부모 순으로 표 삭제 (RLS·트리거·인덱스는 CASCADE 로 같이 정리됩니다)
DROP TABLE IF EXISTS public.identity_history CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 트리거가 없어야 함수 삭제가 안전합니다
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.log_profile_identity_change() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- 끝. 이제 SQL Editor에서 `schema_profiles_identity_history.sql` 전체를 실행하세요.
