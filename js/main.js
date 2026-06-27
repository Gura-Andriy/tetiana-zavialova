/**
 * tetiana-zavialova/js/main.js
 *
 * Architecture:
 *  NavController      — sticky nav + scroll class
 *  MobileMenu         — burger open/close
 *  ScrollReveal       — IntersectionObserver fade-up
 *  BreathingExercise  — 4-phase guided breathing widget
 *  EasterEgg          — "thor" / "ерщк" keyboard + touch trigger
 *  App                — root: instantiates all controllers
 */

'use strict';

/* ============================================================
   NavController
   Adds/removes .scrolled when page scrolls past threshold.
   ============================================================ */
class NavController {
  /**
   * @param {string} navSelector  — CSS selector for <nav>
   * @param {number} threshold    — scroll-Y px before class is applied
   */
  constructor(navSelector = '#main-nav', threshold = 60) {
    this.nav       = document.querySelector(navSelector);
    this.threshold = threshold;

    if (!this.nav) return;
    this._onScroll = this._onScroll.bind(this);
    window.addEventListener('scroll', this._onScroll, { passive: true });
    this._onScroll(); // set correct state on load
  }

  _onScroll() {
    this.nav.classList.toggle('scrolled', window.scrollY > this.threshold);
  }

  destroy() {
    window.removeEventListener('scroll', this._onScroll);
  }
}


/* ============================================================
   MobileMenu
   Opens / closes the full-screen mobile navigation overlay.
   ============================================================ */
class MobileMenu {
  /**
   * @param {string} menuSelector  — overlay element
   * @param {string} openSelector  — button that opens
   * @param {string} closeSelector — button inside overlay that closes
   */
  constructor(
    menuSelector  = '#mobile-menu',
    openSelector  = '#burger',
    closeSelector = '#menu-close'
  ) {
    this.menu  = document.querySelector(menuSelector);
    this.opener = document.querySelector(openSelector);
    this.closer = document.querySelector(closeSelector);

    if (!this.menu) return;

    this.opener?.addEventListener('click', () => this.open());
    this.closer?.addEventListener('click', () => this.close());

    // close when any internal link is tapped
    this.menu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => this.close())
    );

    // close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  get isOpen() { return this.menu.classList.contains('open'); }

  open() {
    this.menu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.menu.classList.remove('open');
    document.body.style.overflow = '';
  }
}


/* ============================================================
   ScrollReveal
   Uses IntersectionObserver to add .visible to .fade-up nodes.
   ============================================================ */
class ScrollReveal {
  /**
   * @param {string} selector   — elements to observe
   * @param {number} threshold  — visibility fraction before trigger
   */
  constructor(selector = '.fade-up', threshold = 0.12) {
    this.observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          this.observer.unobserve(e.target); // fire once
        }
      }),
      { threshold }
    );

    document.querySelectorAll(selector)
      .forEach(el => this.observer.observe(el));
  }
}


/* ============================================================
   BreathingExercise
   4-phase guided breathing: inhale → hold → exhale → pause.
   Animates a CSS circle by changing its width/height.
   ============================================================ */
class BreathingExercise {
  /**
   * @param {Object} options
   * @param {string} options.containerSel  — clickable wrapper
   * @param {string} options.coreSel       — animated inner circle
   * @param {string} options.textSel       — label inside circle
   * @param {string} options.instructionSel — hint text below circle
   * @param {string} options.stopBtnSel    — stop button
   */
  constructor({
    containerSel   = '#breatheContainer',
    coreSel        = '#breatheCore',
    textSel        = '#breatheText',
    instructionSel = '#breatheInstruction',
    stopBtnSel     = '#breatheStop',
  } = {}) {
    this.container   = document.querySelector(containerSel);
    this.core        = document.querySelector(coreSel);
    this.textEl      = document.querySelector(textSel);
    this.instruction = document.querySelector(instructionSel);
    this.stopBtn     = document.querySelector(stopBtnSel);

    if (!this.container || !this.core) return;

    /** @type {Array<{label:string, duration:number, sizePx:number}>} */
    this.phases = [
      { label: 'вдих',     duration: 4000, sizePx: 156, hint: 'Повільно вдихайте через ніс' },
      { label: 'затримка', duration: 4000, sizePx: 156, hint: 'Затримайте дихання' },
      { label: 'видих',    duration: 6000, sizePx: 80,  hint: 'Повільно видихайте через рот' },
      { label: 'пауза',    duration: 2000, sizePx: 80,  hint: '...' },
    ];

    this._intervalId  = null;
    this._phaseIndex  = 0;
    this._elapsed     = 0;

    this._bindEvents();
  }

  /* ---- public --------------------------------------------- */

  start() {
    if (this._intervalId) return;
    this._phaseIndex = 0;
    this._elapsed    = 0;
    this._applyPhase(this._phaseIndex);
    this.stopBtn.style.display = 'inline-block';

    this._intervalId = setInterval(() => {
      this._elapsed += 100;
      if (this._elapsed >= this.phases[this._phaseIndex].duration) {
        this._phaseIndex = (this._phaseIndex + 1) % this.phases.length;
        this._elapsed    = 0;
        this._applyPhase(this._phaseIndex);
      }
    }, 100);
  }

  stop() {
    clearInterval(this._intervalId);
    this._intervalId = null;

    this._setSize(80, 500);
    this.textEl.textContent      = 'знову';
    this.instruction.textContent = 'Натисніть, щоб почати знову';
    this.stopBtn.style.display   = 'none';
  }

  /* ---- private -------------------------------------------- */

  _applyPhase(idx) {
    const p = this.phases[idx];
    this.textEl.textContent      = p.label;
    this.instruction.textContent = p.hint;
    this._setSize(p.sizePx, p.duration);
  }

  _setSize(px, durationMs) {
    this.core.style.transition = `width ${durationMs / 1000}s ease-in-out,
                                   height ${durationMs / 1000}s ease-in-out`;
    this.core.style.width  = px + 'px';
    this.core.style.height = px + 'px';
  }

  _bindEvents() {
    this.container.addEventListener('click', () => {
      if (!this._intervalId) this.start();
    });

    this.container.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && !this._intervalId) {
        e.preventDefault();
        this.start();
      }
    });

    this.stopBtn?.addEventListener('click', () => this.stop());
  }
}


/* ============================================================
   EasterEgg
   Navigates to index_thor.html when:
     - keyboard sequence "thor" or "ерщк" is typed, OR
     - a tiny invisible trigger element is tapped/clicked.
   ============================================================ */
class EasterEgg {
  /**
   * @param {string}   triggerSel  — tiny tap target (footer word)
   * @param {string[]} sequences   — keyboard combos that activate it
   * @param {string}   targetUrl   — page to navigate to
   */
  constructor({
    triggerSel = '#thorTrigger',
    sequences  = ['thor', 'ерщк'],
    targetUrl  = 'index_thor.html',
  } = {}) {
    this.trigger   = document.querySelector(triggerSel);
    this.sequences = sequences;
    this.targetUrl = targetUrl;

    this._buffer = '';
    this._maxLen = Math.max(...sequences.map(s => s.length)) + 1;

    this._bindEvents();
  }

  /* ---- public --------------------------------------------- */

  activate() {
    window.location.href = this.targetUrl;
  }

  /* ---- private -------------------------------------------- */

  _checkBuffer() {
    if (this.sequences.some(seq => this._buffer.endsWith(seq))) {
      this.activate();
    }
  }

  _bindEvents() {
    // keyboard
    document.addEventListener('keydown', e => {
      this._buffer += e.key.toLowerCase();
      if (this._buffer.length > this._maxLen) {
        this._buffer = this._buffer.slice(-this._maxLen);
      }
      this._checkBuffer();
    });

    // tap trigger (mobile)
    this.trigger?.addEventListener('click', () => this.activate());
  }
}

/* ============================================================
   App
   Root controller — wires everything together on DOMContentLoaded.
   ============================================================ */
class App {
  constructor() {
    this.nav       = new NavController();
    this.menu      = new MobileMenu();
    this.reveal    = new ScrollReveal();
    this.breathing = new BreathingExercise();
    this.egg       = new EasterEgg();
  }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
