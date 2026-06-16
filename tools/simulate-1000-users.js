#!/usr/bin/env node
/**
 * 1000명 다양 활동 시뮬레이션 (Node, localStorage 없이 메모리)
 * 실행: node tools/simulate-1000-users.js
 * 옵션:
 *   --seed=123          결정적 난수 (기본: 42)
 *   --legacy-tendency   구버전: 편향 분포(보수/진보/중도 비율 고정)
 *   (기본)              축별 독립 균등 난수 + planetPct 0~100 + 소수 외계 소속 랜덤
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const USER_COUNT = 1000;
const argvSeed = (() => {
  const a = process.argv.find((x) => /^--seed=/.test(x));
  return a ? parseInt(a.split('=')[1], 10) : NaN;
})();
const SEED = Number.isFinite(argvSeed) ? argvSeed : 42;
const LEGACY_TENDENCY = process.argv.includes('--legacy-tendency');

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadAlignmentScoring() {
  const code = fs.readFileSync(path.join(ROOT, 'public', 'alignment-scoring.js'), 'utf8');
  const ctx = { global: {}, window: {}, console };
  ctx.window = ctx.global;
  vm.runInNewContext(code, ctx);
  return ctx.global.AlignmentScoring;
}

const A = loadAlignmentScoring();
const rnd = mulberry32(SEED);

const FACTION_UNLOCK_PCT = 40;
const KANTA_UNLOCK_PLANET_PCT = 50;
const PLANET_DELTA = 14;
const EMPATHY_POP_BUMP = 4;
const FOUR_TIER_IDS = ['CONSERVATIVE', 'PROGRESSIVE', 'KANTAPBIYA_LEFT', 'KANTAPBIYA_RIGHT'];
const FREE_MEGA_CATS = ['all', 'mega_affairs', 'mega_life', 'mega_culture', 'mega_tech'];
const FREE_MEGA_SUBS = {
  mega_affairs: ['politics_free', 'society_free', 'world_free'],
  mega_life: ['money', 'advice', 'daily', 'meetup_free', 'free'],
  mega_culture: ['culture', 'humor', 'games_free'],
  mega_tech: ['tech'],
};
const FREE_SUB_CATS = [
  'free',
  'politics_free',
  'money',
  'society_free',
  'world_free',
  'culture',
  'tech',
  'daily',
  'meetup_free',
  'advice',
  'humor',
  'games_free',
];
const ISSUE_CATS = ['politics', 'economy', 'society', 'entertainment', 'world'];

const issues = [];
const errors = [];
const warnings = [];

function err(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

function pick(arr) {
  return arr[Math.floor(rnd() * arr.length)];
}

function isCommonSpace(tid) {
  return String(tid || '') === 'COMMON';
}

function isFourTier(tid) {
  return FOUR_TIER_IDS.indexOf(tid) >= 0;
}

function postKey(tid, stage) {
  return String(tid || 'COMMON') + '_s' + String(stage || 1);
}

function normalizePost(p, postTerritoryId) {
  if (!p.comments || !Array.isArray(p.comments)) p.comments = [];
  if (!p.reactions || typeof p.reactions !== 'object') {
    p.reactions = { likes: [], dislikes: [], planetVoters: [], empathy: [] };
  }
  const tid = postTerritoryId != null && String(postTerritoryId) !== '' ? String(postTerritoryId) : 'COMMON';
  if (isCommonSpace(tid)) {
    if (!p.category) p.category = 'free';
  } else {
    try {
      delete p.category;
    } catch (_) {
      p.category = undefined;
    }
  }
  return p;
}

function postMatchesFreeCategory(p, megaId) {
  if (!megaId || megaId === 'all') return true;
  const subs = FREE_MEGA_SUBS[megaId];
  if (!subs || !subs.length) return true;
  const c = String((p && p.category) || 'free').trim() || 'free';
  return subs.includes(c);
}

function bucketScores(prev) {
  const init = A.initialScores();
  if (!prev || typeof prev !== 'object') return { ...init };
  return {
    conservative: Number.isFinite(prev.conservative) ? prev.conservative : init.conservative,
    centrist: Number.isFinite(prev.centrist) ? prev.centrist : init.centrist,
    progressive: Number.isFinite(prev.progressive) ? prev.progressive : init.progressive,
    planetPct: Number.isFinite(prev.planetPct) ? Math.max(0, Math.min(100, prev.planetPct)) : 0,
    forcedTerritory:
      prev.forcedTerritory === 'KANTAPBIYA_LEFT' || prev.forcedTerritory === 'KANTAPBIYA_RIGHT'
        ? prev.forcedTerritory
        : null,
  };
}

function pickAffiliationFromPct(pct, userId, getForced) {
  const ft = getForced(userId);
  if (ft) return { tid: ft };
  if (!pct) return { tid: 'COMMON' };
  const { conservative: c, progressive: pr } = pct;
  const poles = [];
  if (c >= FACTION_UNLOCK_PCT) poles.push({ tid: 'CONSERVATIVE', val: c });
  if (pr >= FACTION_UNLOCK_PCT) poles.push({ tid: 'PROGRESSIVE', val: pr });
  if (poles.length) {
    poles.sort((a, b) => b.val - a.val || (a.tid === 'CONSERVATIVE' ? -1 : 1));
    return { tid: poles[0].tid };
  }
  return { tid: 'COMMON' };
}

function isFactionTier1Unlocked(tid, pct, userId, getForced, getPlanetPct) {
  if (isCommonSpace(tid)) return true;
  if (!isFourTier(tid)) return true;
  if (!pct) return false;
  if (tid === 'CONSERVATIVE') return pct.conservative >= FACTION_UNLOCK_PCT;
  if (tid === 'PROGRESSIVE') return pct.progressive >= FACTION_UNLOCK_PCT;
  if (tid === 'KANTAPBIYA_LEFT' || tid === 'KANTAPBIYA_RIGHT') {
    if (getPlanetPct(userId) < KANTA_UNLOCK_PLANET_PCT) return false;
    const home = getForced(userId);
    if (!home) return false;
    return home === tid;
  }
  return false;
}


function hotScore(p) {
  const em = p.reactions.empathy?.length || 0;
  return em * 8 + p.comments.length * 10 + Math.min(400, String(p.body || '').length / 40);
}

function calendarDayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// --- state ---
const scoresMap = {};
const bundle = { posts: {} };
const mapPop = {
  COMMON: 0,
  CONSERVATIVE: 0,
  PROGRESSIVE: 0,
  KANTAPBIYA_LEFT: 0,
  KANTAPBIYA_RIGHT: 0,
};
const followGraph = { following: {}, followers: {} };
let postIdSeq = 0;

function uid(i) {
  return `user_${i}`;
}

function getScores(userId) {
  return bucketScores(scoresMap[userId]);
}

function getPct(userId) {
  return A.toDisplayPercent(getScores(userId));
}

function getForced(userId) {
  return getScores(userId).forcedTerritory;
}

function getPlanetPct(userId) {
  return getScores(userId).planetPct;
}

function setScores(userId, scores) {
  scoresMap[userId] = bucketScores(scores);
}

function applyDelta(userId, delta) {
  setScores(userId, A.applyDelta(getScores(userId), delta));
}

function scaleDelta(d, k) {
  return {
    conservative: d.conservative * k,
    centrist: d.centrist * k,
    progressive: d.progressive * k,
  };
}

function applyReaction(actorId, authorId, isLike) {
  if (!actorId || !authorId || actorId === authorId) return;
  const sA = A.unit3(getScores(actorId));
  const sU = A.unit3(getScores(authorId));
  const dR = scaleDelta(A.deltaReactorOnOthersPost(sA, sU, isLike), 1);
  const dAuth = scaleDelta(A.deltaAuthorReceivingReaction(sU, sA, isLike), 1);
  applyDelta(actorId, dR);
  applyDelta(authorId, dAuth);
}

function bumpPop(tid, delta) {
  const t = String(tid || '').trim();
  if (mapPop[t] === undefined) return;
  mapPop[t] = Math.max(0, Math.min(500000, Math.floor((mapPop[t] || 0) + delta)));
}

function getPosts(tid, stage) {
  const k = postKey(tid, stage);
  if (!Array.isArray(bundle.posts[k])) return [];
  return bundle.posts[k].map((p) => normalizePost(JSON.parse(JSON.stringify(p)), tid));
}

function setPosts(tid, stage, arr) {
  bundle.posts[postKey(tid, stage)] = arr;
}

function addPost(tid, stage, authorId, category) {
  const all = getPosts(tid, stage);
  const raw = {
    id: `p_${++postIdSeq}_${authorId}`,
    title: `글 ${postIdSeq}`,
    body: '시뮬 본문 '.repeat(3 + Math.floor(rnd() * 20)),
    authorId,
    createdAt: new Date().toISOString(),
    comments: [],
  };
  if (isCommonSpace(tid)) {
    raw.category = category && FREE_SUB_CATS.includes(category) ? category : 'free';
  }
  const post = normalizePost(raw, tid);
  all.unshift(post);
  setPosts(tid, stage, all);
  return post;
}

function addComment(tid, stage, postId, authorId, parentId) {
  const all = getPosts(tid, stage);
  const post = all.find((p) => p.id === postId);
  if (!post) return;
  post.comments.push({
    id: `c_${++postIdSeq}`,
    authorId,
    text: '댓글',
    createdAt: new Date().toISOString(),
    parentId: parentId || null,
    reactions: { likes: [], dislikes: [], planetVoters: [], empathy: [] },
  });
  setPosts(tid, stage, all);
}

function toggleEmpathy(tid, stage, postId, giverId) {
  const all = getPosts(tid, stage);
  const post = all.find((p) => p.id === postId);
  if (!post || post.authorId === giverId) return;
  const em = post.reactions.empathy;
  const ix = em.indexOf(giverId);
  if (ix >= 0) {
    em.splice(ix, 1);
    bumpPop(tid, -EMPATHY_POP_BUMP);
  } else {
    em.push(giverId);
    bumpPop(tid, EMPATHY_POP_BUMP);
  }
  setPosts(tid, stage, all);
}

function toggleFollow(me, target) {
  if (!followGraph.following[me]) followGraph.following[me] = [];
  if (!followGraph.followers[target]) followGraph.followers[target] = [];
  const fl = followGraph.following[me];
  const ix = fl.indexOf(target);
  if (ix >= 0) {
    fl.splice(ix, 1);
    const fb = followGraph.followers[target];
    const j = fb.indexOf(me);
    if (j >= 0) fb.splice(j, 1);
  } else {
    fl.push(target);
    if (!followGraph.followers[target].includes(me)) followGraph.followers[target].push(me);
  }
}

/** 축별 [0.5, max] 균등 — 화면 퍼센트는 합 100 근사 */
function randomBucketScores(rndFn) {
  const hi = 120;
  const lo = 0.5;
  const c = lo + rndFn() * (hi - lo);
  const n = lo + rndFn() * (hi - lo);
  const p = lo + rndFn() * (hi - lo);
  const sc = bucketScores({ conservative: c, centrist: n, progressive: p });
  const planetPct = Math.floor(rndFn() * 101);
  let forcedTerritory = null;
  if (rndFn() < 0.12) {
    forcedTerritory = rndFn() < 0.5 ? 'KANTAPBIYA_LEFT' : 'KANTAPBIYA_RIGHT';
  }
  return { ...sc, planetPct, forcedTerritory };
}

function simulate() {
  console.log(
    `=== ${USER_COUNT}명 활동 시뮬레이션 (seed=${SEED}, tendency=${LEGACY_TENDENCY ? 'legacy-bias' : 'full-random'}) ===\n`,
  );

  for (let i = 0; i < USER_COUNT; i++) {
    const u = uid(i);
    if (LEGACY_TENDENCY) {
      const bias = rnd();
      const base = A.initialScores();
      if (bias < 0.22) base.conservative += 6 + rnd() * 8;
      else if (bias < 0.44) base.progressive += 6 + rnd() * 8;
      else if (bias < 0.66) base.centrist += 6 + rnd() * 8;
      else {
        base.conservative += rnd() * 3;
        base.centrist += rnd() * 3;
        base.progressive += rnd() * 3;
      }
      if (rnd() < 0.08) {
        const planet = 50 + Math.floor(rnd() * 40);
        const sc = bucketScores(base);
        const unit = A.unit3(sc);
        const ft = unit.progressive >= unit.conservative ? 'KANTAPBIYA_LEFT' : 'KANTAPBIYA_RIGHT';
        scoresMap[u] = {
          ...sc,
          planetPct: planet,
          forcedTerritory: ft,
        };
      } else {
        scoresMap[u] = bucketScores(base);
        if (rnd() < 0.15) {
          scoresMap[u].planetPct = Math.floor(rnd() * 100);
        }
      }
    } else {
      scoresMap[u] = randomBucketScores(rnd);
    }
  }

  const stats = {
    postsCommon: 0,
    postsFaction: 0,
    blockedFactionWrites: 0,
    reactions: 0,
    empathies: 0,
    follows: 0,
    issueComments: 0,
    invalidCategories: 0,
    duplicatePostIds: 0,
    orphanedReplies: 0,
  };

  const allPostIds = new Set();

  for (let round = 0; round < 8; round++) {
    for (let i = 0; i < USER_COUNT; i++) {
      const u = uid(i);
      const pct = getPct(u);
      const aff = pickAffiliationFromPct(pct, u, getForced);

      const boardTid = rnd() < 0.55 ? 'COMMON' : pick([...FOUR_TIER_IDS]);
      const stage = 1;

      if (!isFactionTier1Unlocked(boardTid, pct, u, getForced, getPlanetPct)) {
        if (!isCommonSpace(boardTid)) {
          stats.blockedFactionWrites++;
          continue;
        }
      }

      if (rnd() < 0.35) {
        const cat = isCommonSpace(boardTid) ? pick(FREE_SUB_CATS) : null;
        if (isCommonSpace(boardTid) && cat && !FREE_SUB_CATS.includes(cat) && cat !== 'all') {
          stats.invalidCategories++;
        }
        const post = addPost(boardTid, stage, u, cat);
        if (allPostIds.has(post.id)) stats.duplicatePostIds++;
        allPostIds.add(post.id);
        if (isCommonSpace(boardTid)) stats.postsCommon++;
        else stats.postsFaction++;

        const reactor = uid(Math.floor(rnd() * USER_COUNT));
        if (reactor !== u && rnd() < 0.6) {
          applyReaction(reactor, u, rnd() < 0.75);
          stats.reactions++;
        }
        if (rnd() < 0.4) {
          toggleEmpathy(boardTid, stage, post.id, uid(Math.floor(rnd() * USER_COUNT)));
          stats.empathies++;
        }
        if (rnd() < 0.25) {
          addComment(boardTid, stage, post.id, uid(Math.floor(rnd() * USER_COUNT)), null);
        }
      }

      if (rnd() < 0.12) {
        const target = uid(Math.floor(rnd() * USER_COUNT));
        if (target !== u) {
          toggleFollow(u, target);
          stats.follows++;
        }
      }

      if (rnd() < 0.2 && isCommonSpace(boardTid)) {
        stats.issueComments++;
      }
    }
  }

  // 검증: 카테고리 필터
  const commonPosts = getPosts('COMMON', 1);
  for (const cat of FREE_MEGA_CATS) {
    if (cat === 'all') continue;
    const subs = FREE_MEGA_SUBS[cat];
    const filtered = commonPosts.filter((p) => postMatchesFreeCategory(p, cat));
    const bad = filtered.filter((p) => !subs.includes(String((p && p.category) || 'free').trim()));
    if (bad.length) warn(`대분류 '${cat}' 필터에 불일치 ${bad.length}건`);
  }

  // 핫랭킹: 오늘 글만
  const dayKey = calendarDayKey();
  const today = commonPosts.filter((p) => String(p.createdAt || '').slice(0, 10) === dayKey);
  today.sort((a, b) => hotScore(b) - hotScore(a));
  if (today.length > 5 && hotScore(today[4]) < hotScore(today[5])) {
    err('핫랭킹 정렬 오류');
  }

  // 해금 통계
  let unlocked = { CONSERVATIVE: 0, PROGRESSIVE: 0, KANTA_L: 0, KANTA_R: 0, COMMON_only: 0 };
  for (let i = 0; i < USER_COUNT; i++) {
    const u = uid(i);
    const pct = getPct(u);
    const ft = getForced(u);
    if (ft === 'KANTAPBIYA_LEFT') unlocked.KANTA_L++;
    else if (ft === 'KANTAPBIYA_RIGHT') unlocked.KANTA_R++;
    else if (pct.conservative >= 40 && pct.conservative >= pct.centrist && pct.conservative >= pct.progressive)
      unlocked.CONSERVATIVE++;
    else if (pct.progressive >= 40 && pct.progressive >= pct.centrist && pct.progressive >= pct.conservative)
      unlocked.PROGRESSIVE++;
    else unlocked.COMMON_only++;
  }

  // 성향 합 100 (전원)
  for (let i = 0; i < USER_COUNT; i++) {
    const id = uid(i);
    const pct = getPct(id);
    const sum = pct.conservative + pct.centrist + pct.progressive;
    if (sum < 98 || sum > 102) err(`성향 합 ${sum}% (${id})`);
    const raw = getScores(id);
    for (const k of ['conservative', 'centrist', 'progressive', 'planetPct']) {
      const v = raw[k];
      if (!Number.isFinite(v)) err(`${id} ${k} 비유한수: ${v}`);
    }
    if (raw.planetPct < 0 || raw.planetPct > 100) err(`${id} planetPct 범위 밖: ${raw.planetPct}`);
  }

  // 팔로우 그래프 양방향 일관성
  let followMismatch = 0;
  for (const me of Object.keys(followGraph.following)) {
    for (const t of followGraph.following[me] || []) {
      const back = followGraph.followers[t] || [];
      if (!back.includes(me)) followMismatch++;
    }
  }
  if (followMismatch) err(`팔로우 역참조 불일치 ${followMismatch}건`);

  // pickAffiliation tie at 40/40/20 edge
  const tieUser = 'tie_test';
  scoresMap[tieUser] = bucketScores({ conservative: 20, centrist: 20, progressive: 20 });
  const tiePct = getPct(tieUser);
  if (tiePct.conservative === 40 && tiePct.centrist === 40) {
    const aff = pickAffiliationFromPct(tiePct, tieUser, () => null);
    if (aff.tid !== 'CONSERVATIVE') warn('40% 동률 시 보수 우선 규칙 — 의도 확인 필요 (현재: ' + aff.tid + ')');
  }

  // bundle 크기 추정 (현재 시뮬 + 1000명 풀스케일 가정)
  const jsonLen = JSON.stringify(bundle).length;
  const perPostBytes = commonPosts.length ? Math.ceil(jsonLen / commonPosts.length) : 800;
  const estFull = perPostBytes * 5000;
  if (jsonLen > 4 * 1024 * 1024) warn(`게시판 bundle JSON ~${(jsonLen / 1024 / 1024).toFixed(1)}MB — localStorage 한도 위험`);
  if (estFull > 4 * 1024 * 1024) {
    warn(
      `1000명×글 5개 가정 시 bundle ~${(estFull / 1024 / 1024).toFixed(1)}MB — 브라우저 localStorage(보통 5~10MB) 초과 가능. 서버 DB 전환 전 데모 한도 안내 필요`,
    );
  }

  // 댓글 고아
  for (const k of Object.keys(bundle.posts)) {
    for (const p of bundle.posts[k]) {
      const ids = new Set((p.comments || []).map((c) => c.id));
      for (const c of p.comments || []) {
        if (c.parentId && !ids.has(c.parentId)) stats.orphanedReplies++;
      }
    }
  }

  console.log('활동 통계:', stats);
  console.log('소속 분포(추정):', unlocked);
  console.log('영토 인구:', mapPop);
  console.log(`COMMON 글 ${commonPosts.length} · 오늘 핫 후보 ${today.length}`);

  if (warnings.length) {
    console.log('\n--- 경고 ---');
    warnings.forEach((w) => console.log('•', w));
  }
  if (errors.length) {
    console.log('\n--- 오류 ---');
    errors.forEach((e) => console.log('✗', e));
    process.exitCode = 1;
  } else {
    console.log('\n시뮬 로직 검증: 치명적 오류 없음 (브라우저 통합 이슈는 별도 수정)');
  }
}

simulate();
