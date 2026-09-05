/* ==========================================================================
   Goldwagen Alberton — site behaviour
   No dependencies. Progressive enhancement: every section works without JS.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- Header */
  var header = $('#site-header');
  if (header) {
    var setStuck = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    setStuck();
    window.addEventListener('scroll', setStuck, { passive: true });
  }

  /* -------------------------------------------------- Mobile nav drawer */
  var drawer      = $('#nav-drawer');
  var drawerOpen  = $('#nav-open');
  var drawerClose = $('#nav-close');
  var lastFocused = null;

  var FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

  function openDrawer() {
    if (!drawer) return;
    lastFocused = document.activeElement;
    drawer.setAttribute('data-open', 'true');
    drawerOpen.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var first = $(FOCUSABLE, drawer);
    if (first) first.focus();
    document.addEventListener('keydown', onDrawerKey);
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.setAttribute('data-open', 'false');
    drawerOpen.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onDrawerKey);
    // Always hand focus back somewhere sensible — never let it fall to <body>.
    var target = (lastFocused && lastFocused !== document.body) ? lastFocused : drawerOpen;
    if (target && typeof target.focus === 'function') target.focus();
  }

  function onDrawerKey(e) {
    if (e.key === 'Escape') { closeDrawer(); return; }
    if (e.key !== 'Tab') return;
    // Focus trap
    var items = $$(FOCUSABLE, drawer).filter(function (el) { return el.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  if (drawerOpen)  drawerOpen.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawer) {
    $('.drawer-scrim', drawer).addEventListener('click', closeDrawer);
    $$('.drawer-link', drawer).forEach(function (a) { a.addEventListener('click', closeDrawer); });
  }

  /* ------------------------------------------------------------ Accordion */
  $$('.acc-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel    = document.getElementById(btn.getAttribute('aria-controls'));
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.setAttribute('data-open', String(!expanded));
    });
  });

  /* -------------------------------------------------- Marquee pause/play */
  var marquee    = $('#brand-marquee');
  var marqueeBtn = $('#marquee-toggle');
  if (marquee && marqueeBtn) {
    var track = $('.marquee-track', marquee);
    var paused = reduceMotion.matches;
    var applyMarquee = function () {
      track.style.animationPlayState = paused ? 'paused' : 'running';
      marqueeBtn.setAttribute('aria-pressed', String(paused));
      $('.marquee-toggle-text', marqueeBtn).textContent = paused ? 'Play' : 'Pause';
    };
    applyMarquee();
    marqueeBtn.addEventListener('click', function () { paused = !paused; applyMarquee(); });
    reduceMotion.addEventListener('change', function (e) { paused = e.matches; applyMarquee(); });
  }

  /* -------------------------------------------------------- Scroll reveal */
  var revealables = $$('.reveal');
  if (revealables.length) {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
          setTimeout(function () { el.classList.add('is-in'); }, delay);
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ------------------------------------------------------- Enquiry form */
  var form = $('#quote-form');
  if (form) {
    var summary     = $('#form-summary');
    var summaryList = $('#form-summary-list');
    var status      = $('#form-status');

    var validators = {
      'q-name':    function (v) { return v.trim().length >= 2 || 'Please enter your name.'; },
      'q-phone':   function (v) {
        var digits = v.replace(/[^0-9]/g, '');
        return digits.length >= 9 || 'Please enter a contact number we can reach you on.';
      },
      'q-make':    function (v) { return v.trim() !== '' || 'Please choose your vehicle make.'; },
      'q-model':   function (v) { return v.trim().length >= 1 || 'Please enter your vehicle model.'; },
      'q-parts':   function (v) { return v.trim().length >= 3 || 'Please tell us which parts you need.'; }
    };

    function fieldWrap(el) { return el.closest('[data-field]'); }

    function setFieldError(el, message) {
      var wrap = fieldWrap(el);
      if (!wrap) return;
      wrap.setAttribute('data-invalid', message ? 'true' : 'false');
      el.setAttribute('aria-invalid', message ? 'true' : 'false');
      var err = $('.field-error', wrap);
      if (err) err.textContent = message || '';
    }

    // Validate on blur, never on every keystroke
    Object.keys(validators).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('blur', function () {
        var res = validators[id](el.value);
        setFieldError(el, res === true ? '' : res);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errors = [];

      Object.keys(validators).forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        var res = validators[id](el.value);
        if (res === true) { setFieldError(el, ''); }
        else { setFieldError(el, res); errors.push({ id: id, message: res }); }
      });

      if (errors.length) {
        summaryList.innerHTML = '';
        errors.forEach(function (err) {
          var li = document.createElement('li');
          var a  = document.createElement('a');
          a.href = '#' + err.id;
          a.textContent = err.message;
          a.addEventListener('click', function (ev) {
            ev.preventDefault();
            document.getElementById(err.id).focus();
          });
          li.appendChild(a);
          summaryList.appendChild(li);
        });
        summary.setAttribute('data-show', 'true');
        summary.focus();
        return;
      }

      summary.setAttribute('data-show', 'false');

      // Build a pre-filled WhatsApp message — no backend required.
      var lines = [
        'Hi Goldwagen Alberton, I need a parts quote.',
        '',
        'Name: '    + $('#q-name').value.trim(),
        'Phone: '   + $('#q-phone').value.trim(),
        'Vehicle: ' + $('#q-make').value + ' ' + $('#q-model').value.trim() + ' ' + $('#q-year').value.trim(),
        'VIN: '     + ($('#q-vin').value.trim() || 'not supplied'),
        '',
        'Parts needed:',
        $('#q-parts').value.trim()
      ];

      var waNumber = document.body.getAttribute('data-whatsapp') || '';
      var url = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(lines.join('\n'));

      status.textContent = 'Opening WhatsApp with your enquiry ready to send.';
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ------------------------------------------------- Open / closed badge */
  var openBadge = $('#open-status');
  if (openBadge) {
    // Trading hours: Mon–Fri 08:00–17:00, Sat 08:00–13:00, Sun closed.
    // Rendered in the visitor's own clock; the store is SAST (UTC+2).
    var nowSast = new Date(Date.now() + (new Date().getTimezoneOffset() * 60000) + (2 * 3600000));
    var day  = nowSast.getDay();                                  // 0 = Sun
    var mins = nowSast.getHours() * 60 + nowSast.getMinutes();
    var open = false;

    if (day >= 1 && day <= 5) open = mins >= 480 && mins < 1020;   // 08:00–17:00
    else if (day === 6)       open = mins >= 480 && mins < 780;    // 08:00–13:00

    openBadge.textContent = open ? 'Open now' : 'Closed now';
    openBadge.setAttribute('data-open', String(open));
  }

  /* ------------------------------------------------------------ Footer yr */
  var yr = $('#year');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
