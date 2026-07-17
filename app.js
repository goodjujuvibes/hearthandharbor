/* =========================================================================
   Hearth & Harbor — interactions
   - Modal overlays (one open at a time; close on ✕, Esc, backdrop click)
   - Single-open FAQ accordion
   - Discord CTA wiring
   ========================================================================= */

/* Discord invite. Set this to the real invite URL (e.g. 'https://discord.gg/xxxx')
   to activate every "Visit our Discord" call-to-action; while it's '#', those
   links stay inert. */
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
  let overlayHistoryPushed = false;

  function anyOverlayOpen() {
    return overlays.some(function (o) { return o.classList.contains('is-open'); });
  }

  // Visible, focusable elements within a container (for the modal focus trap).
  function focusableIn(el) {
    return Array.prototype.slice.call(el.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea'
    )).filter(function (n) { return n.offsetParent !== null; });
  }

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

  // Dismiss initiated by the user (✕ / Esc / backdrop). If we added a history
  // entry when opening, step back so the URL/history stays clean; the popstate
  // handler then performs the actual close.
  function dismissOverlay() {
    if (overlayHistoryPushed) {
      history.back();
    } else {
      closeOverlay();
    }
  }

  function openOverlay(name, variant) {
    const target = document.querySelector('.overlay[data-overlay="' + name + '"]');
    if (!target) return;
    closeOverlay();
    lastFocused = document.activeElement;
    // Skin variant: the join overlay opens in its harbor (teal) skin from the
    // footer "Come sit down" button, and its default hearth skin from the hero.
    const panel = target.querySelector('.overlay__panel');
    if (panel) panel.classList.toggle('is-harbor', variant === 'harbor');
    target.classList.add('is-open');
    body.style.overflow = 'hidden';
    // Register a history entry so the phone's back-swipe (or Back button)
    // closes the popup first instead of leaving the site.
    if (!overlayHistoryPushed) {
      try {
        history.pushState({ hhOverlay: true }, '');
        overlayHistoryPushed = true;
      } catch (e) { /* history unavailable; fall back to plain close */ }
    }
    const closeBtn = target.querySelector('.overlay__close');
    if (closeBtn) closeBtn.focus();
  }

  // Back/forward (incl. mobile back-swipe) closes an open overlay.
  window.addEventListener('popstate', function () {
    if (anyOverlayOpen()) {
      overlayHistoryPushed = false;
      closeOverlay();
    }
  });

  // Triggers: anything with data-open="<overlay name>" (optional data-variant skin)
  document.querySelectorAll('[data-open]').forEach(function (trigger) {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.addEventListener('click', function () {
      openOverlay(trigger.getAttribute('data-open'), trigger.getAttribute('data-variant'));
    });
    // Keyboard activation for non-button triggers (cards, dot-line links)
    if (trigger.tagName !== 'BUTTON') {
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openOverlay(trigger.getAttribute('data-open'), trigger.getAttribute('data-variant'));
        }
      });
    }
  });

  // Backdrop click closes; panel click is contained.
  overlays.forEach(function (o) {
    o.addEventListener('click', function () {
      dismissOverlay();
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
        dismissOverlay();
      });
    }
    // Trap Tab focus within the open panel so it can't wander behind the modal.
    o.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !o.classList.contains('is-open') || !panel) return;
      const f = focusableIn(panel);
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  });

  // Esc closes any open overlay.
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && anyOverlayOpen()) dismissOverlay();
  });

  /* ---- FAQ accordion (single open, keyboard-operable) ------------------- */
  const faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq__item'));

  function closeFaq(item) {
    item.classList.remove('is-open');
    const q = item.querySelector('.faq__q');
    const icon = item.querySelector('.faq__icon');
    const answer = item.querySelector('.faq__a');
    if (q) q.setAttribute('aria-expanded', 'false');
    if (icon) icon.textContent = '+';
    // Keep the collapsed answer out of the screen-reader flow (it's visually
    // hidden by max-height, but would otherwise still be announced).
    if (answer) answer.setAttribute('aria-hidden', 'true');
  }

  faqItems.forEach(function (item, i) {
    const q = item.querySelector('.faq__q');
    const icon = item.querySelector('.faq__icon');
    const answer = item.querySelector('.faq__a');
    if (!q) return;

    if (answer) {
      const id = 'faq-answer-' + i;
      answer.id = id;
      q.setAttribute('aria-controls', id);
      answer.setAttribute('aria-hidden', 'true'); // starts collapsed
    }

    function toggle() {
      const isOpen = item.classList.contains('is-open');
      faqItems.forEach(closeFaq);
      if (!isOpen) {
        item.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
        if (icon) icon.textContent = '–'; // en dash
        if (answer) answer.setAttribute('aria-hidden', 'false');
      }
    }

    q.addEventListener('click', toggle);
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
})();

/* =========================================================================
   Starfield — individual stars so each twinkles on its own random timing
   (never synchronized), kept clear of the center where the logo/wordmark sit.
   ========================================================================= */
(function () {
  'use strict';
  const fields = document.querySelectorAll('.starfield');
  if (!fields.length) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  fields.forEach(function (field) {
    const frag = document.createDocumentFragment();
    const count = 34;
    for (let i = 0; i < count; i++) {
      // Position in the upper sky; retry to avoid the central content column.
      let x = 0, y = 0;
      for (let t = 0; t < 10; t++) {
        x = Math.random() * 100;
        y = 3 + Math.random() * 46;
        const inCenter = x > 36 && x < 64 && y > 6 && y < 44;
        if (!inCenter) break;
      }
      const size = (Math.random() * 1.5 + 1).toFixed(2);   // 1.0–2.5px
      const alpha = (Math.random() * 0.5 + 0.4).toFixed(2); // 0.40–0.90 brightness
      const star = document.createElement('span');
      star.className = 'star';
      star.style.left = x.toFixed(2) + '%';
      star.style.top = y.toFixed(2) + '%';
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.background = 'rgba(224, 236, 246, ' + alpha + ')';
      if (reduce) {
        star.style.animation = 'none';
      } else {
        star.style.setProperty('--dur', (Math.random() * 3 + 2.8).toFixed(2) + 's'); // 2.8–5.8s
        star.style.setProperty('--delay', (-Math.random() * 6).toFixed(2) + 's');    // desync start
        star.style.setProperty('--min', (Math.random() * 0.4 + 0.15).toFixed(2));    // 0.15–0.55 twinkle depth
      }
      frag.appendChild(star);
    }
    field.appendChild(frag);
  });
})();
