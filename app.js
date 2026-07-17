/* =========================================================================
   Hearth & Harbor — interactions
   - Modal overlays (one open at a time; close on ✕, Esc, backdrop click)
   - Single-open FAQ accordion
   - Discord CTA wiring
   ========================================================================= */

/* -------------------------------------------------------------------------
   TODO(dev): set the real Discord invite here. This single value is applied
   to every external "VISIT OUR DISCORD" call-to-action on the page.
   Example: 'https://discord.gg/your-invite-code'
   ------------------------------------------------------------------------- */
const DISCORD_URL = '#';

(function () {
  'use strict';

  const body = document.body;

  /* ---- Discord CTAs ----------------------------------------------------- */
  const hasRealInvite = DISCORD_URL && DISCORD_URL !== '#';
  document.querySelectorAll('[data-discord]').forEach(function (el) {
    el.setAttribute('href', DISCORD_URL);
    if (!hasRealInvite) {
      // Placeholder: don't navigate anywhere or open a blank tab yet.
      el.setAttribute('aria-disabled', 'true');
      el.addEventListener('click', function (e) {
        e.preventDefault();
      });
    }
  });

  /* ---- Overlays --------------------------------------------------------- */
  const overlays = Array.prototype.slice.call(document.querySelectorAll('.overlay'));
  let lastFocused = null;

  function closeOverlay() {
    let closedAny = false;
    overlays.forEach(function (o) {
      if (o.classList.contains('is-open')) {
        o.classList.remove('is-open');
        closedAny = true;
      }
    });
    if (closedAny) {
      body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
      lastFocused = null;
    }
  }

  function openOverlay(name) {
    const target = document.querySelector('.overlay[data-overlay="' + name + '"]');
    if (!target) return;
    closeOverlay();
    lastFocused = document.activeElement;
    target.classList.add('is-open');
    body.style.overflow = 'hidden';
    const closeBtn = target.querySelector('.overlay__close');
    if (closeBtn) closeBtn.focus();
  }

  // Triggers: anything with data-open="<overlay name>"
  document.querySelectorAll('[data-open]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openOverlay(trigger.getAttribute('data-open'));
    });
    // Keyboard activation for non-button triggers (cards, dot-line links)
    if (trigger.tagName !== 'BUTTON') {
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openOverlay(trigger.getAttribute('data-open'));
        }
      });
    }
  });

  // Backdrop click closes; panel click is contained.
  overlays.forEach(function (o) {
    o.addEventListener('click', function () {
      closeOverlay();
    });
    const panel = o.querySelector('.overlay__panel');
    if (panel) {
      panel.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
    const closeBtn = o.querySelector('.overlay__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeOverlay();
      });
    }
  });

  // Esc closes any open overlay.
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeOverlay();
  });

  /* ---- FAQ accordion (single open) -------------------------------------- */
  const faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq__item'));
  faqItems.forEach(function (item) {
    const q = item.querySelector('.faq__q');
    const icon = item.querySelector('.faq__icon');
    if (!q) return;
    q.addEventListener('click', function () {
      const isOpen = item.classList.contains('is-open');
      // Close all first.
      faqItems.forEach(function (other) {
        other.classList.remove('is-open');
        const oi = other.querySelector('.faq__icon');
        if (oi) oi.textContent = '+';
      });
      // Toggle this one open if it wasn't already.
      if (!isOpen) {
        item.classList.add('is-open');
        if (icon) icon.textContent = '–'; // en dash
      }
    });
  });
})();
