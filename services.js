/* AUREL - Services page scripts */
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

  /* ---------- Dropdown (click / keyboard / touch) ---------- */
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

  /* ---------- Scroll reveal (page sections + footer) ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .f-rise').forEach(function (el) { io.observe(el); });

  /* ---------- 3D tilt on cards (mouse devices only) ---------- */
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

  /* ---------- Fitting guide: measurement points ---------- */
  var points = $$('.hs');
  var gp = $('#guidePanel'), gpStep = $('#gpStep'), gpTitle = $('#gpTitle'), gpText = $('#gpText');
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function setPoint(i) {
    var b = points[i];
    points.forEach(function (p, k) {
      p.classList.toggle('active', k === i);
      p.setAttribute('aria-pressed', k === i ? 'true' : 'false');
    });
    gpStep.textContent = 'Point ' + pad(i + 1) + ' of ' + pad(points.length);
    gpTitle.textContent = b.getAttribute('data-title');
    gpText.textContent = b.getAttribute('data-text');
    gp.classList.remove('swap');
    void gp.offsetWidth;
    gp.classList.add('swap');
  }
  points.forEach(function (p, i) {
    p.addEventListener('click', function () { setPoint(i); });
    p.addEventListener('mouseenter', function () { setPoint(i); });
    p.addEventListener('focus', function () { setPoint(i); });
  });

  /* ---------- Footer year ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();