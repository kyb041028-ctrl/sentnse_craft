/**
 * =============================================================================
 * 센텐스크래프트 Ver 1.0 베타 — 백엔드 서버 (server.js) + Supabase 연동
 * =============================================================================
 *
 * 【환경변수】
 * - `.env`에 SUPABASE_URL, SUPABASE_ANON_KEY 를 넣으세요. (소스에 직접 쓰지 마세요.)
 *
 * 【실행】
 *   npm install
 *   npm start
 *   브라우저에서 http://localhost:PORT/ 접속 (기본 3000)
 *   화면 파일: public/index.html
 *
 * 【인증 API】
 *   POST /api/auth/signup   — 회원가입 (Supabase Auth signUp)
 *   POST /api/auth/signin   — 로그인 (signInWithPassword)
 *   POST /api/auth/signout  — 로그아웃 (Authorization: Bearer <access_token>)
 *   POST /api/auth/refresh  — 세션 갱신 (body: { refresh_token })
 *   GET  /api/auth/me       — 현재 유저 (Bearer)
 *   GET  /api/me/profile    — public.profiles 한 줄 (Bearer, RLS)
 * =============================================================================
 */

'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const appConfig = require('./app-config');

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

/** 서버 전용(세션 없이 가입/로그인 호출) — anon 키 */
let supabaseAdmin = null;
if (supabaseUrl && supabaseAnonKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * 사용자의 access_token 으로 RLS가 적용된 클라이언트 생성
 * @param {string} accessToken
 */
function createUserClient(accessToken) {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function getBearerToken(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  return null;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

/** CORS: 로컬 개발에서 브라우저가 API를 부를 수 있게 */
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

function requireSupabase(req, res, next) {
  if (!supabaseAdmin) {
    return res.status(503).json({
      ok: false,
      error: 'SUPABASE_NOT_CONFIGURED',
      message: '.env 에 SUPABASE_URL 과 SUPABASE_ANON_KEY 를 설정한 뒤 서버를 다시 시작하세요.',
    });
  }
  next();
}

// -----------------------------------------------------------------------------
// 인증 (Supabase Auth)
// -----------------------------------------------------------------------------

/**
 * POST /api/auth/signup
 * body: { email, password, nickname, home_country }
 * — home_country: ISO 3166-1 alpha-2 (예: KR, US). 목록은 config/signup-countries.js
 */
app.post('/api/auth/signup', requireSupabase, async (req, res) => {
  try {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || '');
    const nickname = String(req.body?.nickname || '').trim();
    let homeCountry = String(req.body?.home_country || 'KR')
      .trim()
      .toUpperCase();
    if (!/^[A-Z]{2}$/.test(homeCountry)) {
      homeCountry = 'KR';
    }
    if (!appConfig.isSignupCountryCode(homeCountry)) {
      return res.status(400).json({
        ok: false,
        error: 'INVALID_HOME_COUNTRY',
        message: '가입 시 선택한 국가 코드가 목록에 없습니다. ISO 2글자(예: KR, US)를 보내 주세요.',
      });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ ok: false, error: 'INVALID_EMAIL' });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'WEAK_PASSWORD', message: '비밀번호는 6자 이상이 안전합니다.' });
    }
    if (nickname.length < 2) {
      return res.status(400).json({ ok: false, error: 'INVALID_NICKNAME' });
    }

    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: nickname,
          home_country: homeCountry,
        },
      },
    });

    if (error) {
      return res.status(400).json({ ok: false, error: error.code || 'SIGNUP_FAILED', message: error.message });
    }

    const session = data.session;
    const user = data.user;

    return res.json({
      ok: true,
      user,
      session,
      needsEmailConfirmation: !session,
      message: session
        ? '가입이 완료되어 로그인되었습니다.'
        : '가입 메일을 확인해 주세요. (이메일 인증을 켜 둔 경우 세션은 인증 후 생깁니다.)',
    });
  } catch (e) {
    console.error('[signup]', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/auth/signin
 * body: { email, password }
 */
app.post('/api/auth/signin', requireSupabase, async (req, res) => {
  try {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ ok: false, error: error.code || 'SIGNIN_FAILED', message: error.message });
    }

    return res.json({
      ok: true,
      user: data.user,
      session: data.session,
    });
  } catch (e) {
    console.error('[signin]', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/auth/refresh
 * body: { refresh_token }
 */
app.post('/api/auth/refresh', requireSupabase, async (req, res) => {
  try {
    const refresh_token = String(req.body?.refresh_token || '');
    if (!refresh_token) {
      return res.status(400).json({ ok: false, error: 'MISSING_REFRESH_TOKEN' });
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });

    if (error) {
      return res.status(401).json({ ok: false, error: error.code || 'REFRESH_FAILED', message: error.message });
    }

    return res.json({
      ok: true,
      user: data.user,
      session: data.session,
    });
  } catch (e) {
    console.error('[refresh]', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/auth/signout
 * header: Authorization: Bearer <access_token>
 */
app.post('/api/auth/signout', requireSupabase, async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ ok: false, error: 'NO_ACCESS_TOKEN' });
    }

    const userClient = createUserClient(token);
    if (!userClient) {
      return res.status(500).json({ ok: false, error: 'CLIENT_INIT_FAILED' });
    }

    const { error } = await userClient.auth.signOut();

    if (error) {
      return res.status(400).json({ ok: false, error: error.code || 'SIGNOUT_FAILED', message: error.message });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error('[signout]', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

/**
 * GET /api/auth/me
 * header: Authorization: Bearer <access_token>
 */
app.get('/api/auth/me', requireSupabase, async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ ok: false, error: 'NO_ACCESS_TOKEN' });
    }

    const userClient = createUserClient(token);
    if (!userClient) {
      return res.status(500).json({ ok: false, error: 'CLIENT_INIT_FAILED' });
    }

    const { data, error } = await userClient.auth.getUser();

    if (error || !data?.user) {
      return res.status(401).json({ ok: false, error: 'INVALID_TOKEN', message: error?.message });
    }

    return res.json({ ok: true, user: data.user });
  } catch (e) {
    console.error('[me]', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

/**
 * GET /api/me/profile
 * — schema_profiles_identity_history.sql 의 public.profiles
 */
app.get('/api/me/profile', requireSupabase, async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ ok: false, error: 'NO_ACCESS_TOKEN' });
    }

    const userClient = createUserClient(token);
    if (!userClient) {
      return res.status(500).json({ ok: false, error: 'CLIENT_INIT_FAILED' });
    }

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return res.status(401).json({ ok: false, error: 'INVALID_TOKEN' });
    }

    const uid = userData.user.id;

    const { data: profile, error: pErr } = await userClient.from('profiles').select('*').eq('id', uid).maybeSingle();

    if (pErr) {
      return res.status(400).json({ ok: false, error: pErr.code || 'PROFILE_QUERY_FAILED', message: pErr.message });
    }

    return res.json({ ok: true, profile });
  } catch (e) {
    console.error('[profile]', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

// -----------------------------------------------------------------------------
// 기존 API
// -----------------------------------------------------------------------------

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'sentence-craft-api',
    time: new Date().toISOString(),
    supabaseConfigured: Boolean(supabaseAdmin),
  });
});

app.get('/api/public-config', (req, res) => {
  res.json(appConfig.getPublicClientConfig());
});

app.get('/api/demo/territory-scale', (req, res) => {
  const population = Number(req.query.population ?? 0);
  res.json(appConfig.getTerritoryVisualVariables(population));
});

/** 인구 수 → 영토 “발전 단계” 라벨 (기획용, world-territories) */
app.get('/api/demo/world-stage', (req, res) => {
  const population = Number(req.query.population ?? 0);
  res.json(appConfig.worldTerritories.getStageForPopulation(population));
});

app.post('/api/demo/validate-comment', (req, res) => {
  const text = req.body?.text ?? '';
  res.json(appConfig.validateCommentLength(text));
});

// -----------------------------------------------------------------------------
// 프론트 — public 폴더 (화면 파일은 여기만 두면 덜 꼬입니다)
// -----------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use(express.static(path.join(__dirname, 'public')));

// -----------------------------------------------------------------------------
// 404
// -----------------------------------------------------------------------------
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ ok: false, error: 'NOT_FOUND', path: req.path });
  }
  return res.status(404).type('text/plain').send('Not Found');
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'INTERNAL_SERVER_ERROR' });
});

app.listen(PORT, () => {
  console.log(`[센텐스크래프트] http://localhost:${PORT}/`);
  console.log(`- 헬스: http://localhost:${PORT}/health`);
  if (!supabaseAdmin) {
    console.log('[안내] Supabase 미설정: .env 에 SUPABASE_URL, SUPABASE_ANON_KEY 를 넣고 서버를 다시 시작하세요.');
  } else {
    console.log('[안내] Supabase 클라이언트 준비 완료 (anon, 서버 사이드).');
  }
});
