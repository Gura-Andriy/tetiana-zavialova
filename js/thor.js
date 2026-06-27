/**
 * tetiana-zavialova/js/thor.js
 *
 * Extends the base App from main.js for the thor easter-egg page.
 *
 * ThorApp
 *   └─ Inherits: NavController, MobileMenu, ScrollReveal, BreathingExercise
 *   └─ Adds:     ThorBackNavigation — handles the "повернутись" link + Escape
 */

'use strict';

/* ============================================================
   ThorBackNavigation
   Lets the visitor escape back to the real site.
   Escape key or clicking any .thor-back-btn navigates to index.html.
   ============================================================ */
class ThorBackNavigation {
  /**
   * @param {string} targetUrl  — URL to navigate back to
   */
  constructor(targetUrl = 'index.html') {
    this.targetUrl = targetUrl;
    this._bindEvents();
  }

  go() {
    window.location.href = this.targetUrl;
  }

  _bindEvents() {
    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.go();
    });

    // Any explicit back-buttons in markup
    document.querySelectorAll('.thor-back-btn[data-back]')
      .forEach(btn => btn.addEventListener('click', e => {
        e.preventDefault();
        this.go();
      }));
  }
}


/* ============================================================
   ThorApp
   Root controller for index_thor.html.
   Reuses all base controllers; adds back-navigation.
   ============================================================ */
class ThorApp {
  constructor() {
    this.nav        = new NavController();
    this.menu       = new MobileMenu();
    this.reveal     = new ScrollReveal();
    this.breathing  = new BreathingExercise();
    this.backNav    = new ThorBackNavigation('index.html');
  }
}

// Bootstrap — wait for both main.js classes and DOM
document.addEventListener('DOMContentLoaded', () => {
  window.thorApp = new ThorApp();
});
