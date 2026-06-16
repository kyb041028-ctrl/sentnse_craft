/**
 * UI 클릭음 — 마우스 스위치에 가까운 짧은 노이즈 스냅 (Web Audio · 외부 파일 없음)
 * 영토·게시판·모달 등 포인터로 누를 수 있는 대부분의 UI에 적용됩니다.
 * 특정 영역만 끄려면 조상에 data-sc-no-click-sound 를 두세요.
 * prefers-reduced-motion: reduce 이면 재생하지 않습니다.
 */
(function (g) {
  'use strict';

  var ctx = null;

  /** closest() 한 번에 쓰는 복합 선택자 (브라우저 :is 미사용 — 호환 우선) */
  var CLICK_SELECTOR = [
    'button:not([disabled])',
    'a[href]',
    'area[href]',
    'summary',
    'label',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'input:not([type="hidden"]):not([type="file"]):not([disabled])',
    '[role="button"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[role="menuitemcheckbox"]',
    '[role="menuitemradio"]',
    '[role="switch"]',
    '[role="link"][href]',
    '[role="option"]',
    '[role="radio"]',
    '[role="checkbox"]',
    '[contenteditable="true"]',
    '.zone--clickable',
    '.zone[data-territory-id]',
    '.territory-hit-zone__hit',
    '.centrist-issue-card',
    '.board-modal',
    '.sc-rank-modal__backdrop',
    '.sc-rank-modal__item',
    '.sc-rank-modal__more',
    '.sc-tendency-modal__backdrop',
    '.sc-tendency-modal__chart',
    '#kanta-planet-picker-backdrop',
    '.kanta-planet-picker__backdrop',
    '.kanta-planet-picker',
  ].join(',');

  function motionReduced() {
    try {
      return !!(g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (_) {
      return false;
    }
  }

  function getCtx() {
    if (ctx) return ctx;
    try {
      ctx = new (g.AudioContext || g.webkitAudioContext)();
    } catch (_) {
      return null;
    }
    return ctx;
  }

  function resumeCtx() {
    var c = getCtx();
    if (!c) return null;
    if (c.state === 'suspended' && c.resume) {
      c.resume().catch(function () {});
    }
    return c;
  }

  function shouldSkipSound() {
    if (g.__scUiSoundMuteReduced) return true;
    return motionReduced();
  }

  /**
   * 마우스 ‘딸깍’에 가깝게: 아주 짧은 백색노이즈 + 밴드패스 + 급격한 감쇠.
   */
  function playClick() {
    if (shouldSkipSound()) return;
    var c = resumeCtx();
    if (!c) return;
    var t0 = c.currentTime;
    var sr = c.sampleRate;
    var nFrames = Math.max(64, Math.floor(sr * 0.012));
    var buf = c.createBuffer(1, nFrames, sr);
    var ch = buf.getChannelData(0);
    var i;
    for (i = 0; i < nFrames; i++) {
      ch[i] = (Math.random() * 2 - 1) * (0.55 + 0.45 * (1 - i / nFrames));
    }

    var src = c.createBufferSource();
    src.buffer = buf;

    var hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(550, t0);
    hp.Q.setValueAtTime(0.5, t0);

    var bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2200, t0);
    bp.Q.setValueAtTime(0.55, t0);

    var env = c.createGain();
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(0.11, t0 + 0.0006);
    env.gain.exponentialRampToValueAtTime(0.0005, t0 + 0.009);

    src.connect(hp);
    hp.connect(bp);
    bp.connect(env);
    env.connect(c.destination);

    src.start(t0);
    src.stop(t0 + 0.014);
  }

  function onPointerDown(ev) {
    if (ev.button != null && ev.button !== 0) return;
    if (ev.isTrusted === false) return;
    var raw = ev.target;
    if (!raw) return;
    if (raw.nodeType !== 1) raw = raw.parentElement;
    if (!raw || !raw.closest) return;
    if (raw.closest('[data-sc-no-click-sound]')) return;

    var el = raw.closest(CLICK_SELECTOR);
    if (!el) return;
    if (el.disabled === true) return;

    playClick();
  }

  function attach() {
    document.addEventListener('pointerdown', onPointerDown, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }

  g.__scUiSound = {
    playClick: playClick,
    playTab: playClick,
    setReducedMotionMute: function (mute) {
      g.__scUiSoundMuteReduced = !!mute;
    },
  };
})(typeof window !== 'undefined' ? window : this);
