/* AUREL - Contact page scripts */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Theme toggle ---------- */
  $('#themeToggle').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('aurel-theme', next); } catch (e) {}
  });

  /* ---------- RTL / LTR toggle ---------- */
  $('#rtlToggle').addEventListener('click', function () {
    var next = root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
    root.setAttribute('dir', next);
    try { localStorage.setItem('aurel-dir', next); } catch (e) {}
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('#menuBtn'), nav = $('#mainNav');
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });

  /* ---------- Dropdown ---------- */
  $$('.has-dropdown').forEach(function (item) {
    var btn = $('.dropdown-toggle', item);
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  });
  document.addEventListener('click', function () {
    $$('.has-dropdown.open').forEach(function (i) {
      i.classList.remove('open');
      $('.dropdown-toggle', i).setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      $$('.has-dropdown.open').forEach(function (i) { i.classList.remove('open'); });
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Header shadow + scroll progress ---------- */
  var header = $('#header'), bar = $('.scroll-progress');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('scrolled', y > 30);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- 3D tilt (mouse devices only) ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    $$('.tilt').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt-max')) || 8;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * max * 2).toFixed(2) + 'deg');
        el.classList.add('is-tilting');
      });
      el.addEventListener('mouseleave', function () {
        el.classList.remove('is-tilting');
        el.style.removeProperty('--rx');
        el.style.removeProperty('--ry');
      });
    });
  }

  /* ---------- Appointment form ---------- */
  var form = $('#apptForm');
  var dateInput = $('#f-date');
  var status = $('#formStatus');

  // Earliest selectable date is today
  var now = new Date();
  var pad = function (n) { return String(n).padStart(2, '0'); };
  dateInput.min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

  function setErr(input, msgEl, msg) {
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    msgEl.textContent = msg || '';
    return !msg;
  }

  // Clear an error as soon as the field changes
  form.addEventListener('input', clearErr);
  form.addEventListener('change', clearErr);
  function clearErr(e) {
    var t = e.target;
    var msg = document.getElementById('e-' + t.id.replace(/^f-/, ''));
    if (msg) { msg.textContent = ''; t.setAttribute('aria-invalid', 'false'); }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = $('#f-name'), phone = $('#f-phone'), date = $('#f-date'), consent = $('#f-consent');

    var okName = setErr(name, $('#e-name'),
      name.value.trim().length >= 2 ? '' : 'Please enter your name.');
    var okPhone = setErr(phone, $('#e-phone'),
      /^[+0-9 ()-]{8,}$/.test(phone.value.trim()) ? '' : 'Please enter a valid phone number.');
    var okDate = setErr(date, $('#e-date'),
      (date.value && date.value >= date.min) ? '' : 'Choose a date from today onwards.');
    var okConsent = setErr(consent, $('#e-consent'),
      consent.checked ? '' : 'Please give consent to continue.');

    if (!(okName && okPhone && okDate && okConsent)) {
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }

    // No backend is connected in this build. Replace this block with a fetch()
    // POST to your form endpoint when it is ready.
    status.textContent = 'Thank you, ' + name.value.trim() + '. Your request is received. We will call you on the number you gave to confirm the slot.';
    form.reset();
    dateInput.min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  });

  /* ---------- Footer year ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();