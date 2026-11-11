 /* AUREL - Fabric Gallery scripts */
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
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  /* ---------- Dropdown (click / keyboard / touch) ---------- */
  $$('.has-dropdown').forEach(function (item) {
    var btn = $('.dropdown-toggle', item);
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
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

  /* ---------- Header shrink + scroll progress ---------- */
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

  /* ---------- Library filter ---------- */
  var chips = $$('.chip-btn'), items = $$('.lib-item'), count = $('#libCount');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        c.classList.remove('is-on');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-on');
      chip.setAttribute('aria-pressed', 'true');

      var f = chip.getAttribute('data-filter');
      var shown = 0;
      items.forEach(function (it) {
        var match = f === 'all' || it.getAttribute('data-cat') === f;
        it.hidden = !match;
        if (match) { it.style.setProperty('--i', shown); shown++; }
      });
      count.textContent = shown;
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbTitle = $('#lbTitle'), lbMeta = $('#lbMeta');
  var lastFocus = null;

  items.forEach(function (btn) {
    btn.addEventListener('click', function () {
      lastFocus = btn;
      lbImg.src = btn.getAttribute('data-src');
      lbImg.alt = btn.getAttribute('data-title');
      lbTitle.textContent = btn.getAttribute('data-title');
      lbMeta.textContent = btn.getAttribute('data-meta');
      if (typeof lb.showModal === 'function') lb.showModal();
      else lb.setAttribute('open', '');
    });
  });

  $('#lbClose').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', function () { if (lastFocus) lastFocus.focus(); });

  /* ---------- Footer year ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();