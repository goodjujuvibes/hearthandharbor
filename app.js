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
    const closeBtn = target.querySelector('.overlay__close');
    if (closeBtn) closeBtn.focus();
  }

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
    if (e.key === 'Escape') closeOverlay();
  });

  /* ---- FAQ accordion (single open, keyboard-operable) ------------------- */
  const faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq__item'));

  function closeFaq(item) {
    item.classList.remove('is-open');
    const q = item.querySelector('.faq__q');
    const icon = item.querySelector('.faq__icon');
    if (q) q.setAttribute('aria-expanded', 'false');
    if (icon) icon.textContent = '+';
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
    }

    function toggle() {
      const isOpen = item.classList.contains('is-open');
      faqItems.forEach(closeFaq);
      if (!isOpen) {
        item.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
        if (icon) icon.textContent = '–'; // en dash
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
