  /* AUREL - Home 1 scripts */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    hsInit();
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

  /* ---------- Header shrink, scroll progress, hero parallax ---------- */
  var header = $('#header'), bar = $('.scroll-progress'), heroBg = $('.hero-bg');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('scrolled', y > 30);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (heroBg && !reduceMotion) {
      heroBg.style.translate = '0 ' + (-Math.min(y, 900) * 0.16).toFixed(1) + 'px';
    }
    hsUpdate();
  }

  /* ---------- Horizontal scroll section ----------
     Desktop: the section is made tall, the inner stage sticks to the top and the
     card track slides sideways as you scroll down.
     Mobile / reduced motion: falls back to a native swipeable row with snap. */
  var hs = $('.hs'), hsSticky = hs && $('.hs-sticky', hs), hsViewport = hs && $('.hs-viewport', hs),
      hsTrack = hs && $('.hs-track', hs), hsBar = hs && $('.hs-progress span', hs), hsDist = 0, hsOn = false;

  function hsInit() {
    if (!hs) return;
    hsOn = window.innerWidth > 760 && !reduceMotion;
    hs.classList.toggle('hs-on', hsOn);
    if (!hsOn) {
      hs.style.height = '';
      hsTrack.style.transform = '';
      hsBar.style.transform = '';
      return;
    }
    hs.style.height = '';
    hsDist = Math.max(0, hsTrack.scrollWidth - hsViewport.clientWidth);
    hs.style.height = (hsSticky.offsetHeight + hsDist) + 'px';
    hsUpdate();
  }

  function hsUpdate() {
    if (!hsOn) return;
    var rtl = root.getAttribute('dir') === 'rtl';
    var stickTop = header.offsetHeight;
    var total = hs.offsetHeight - hsSticky.offsetHeight;
    var p = total > 0 ? (stickTop - hs.getBoundingClientRect().top) / total : 0;
    p = Math.min(1, Math.max(0, p));
    var x = p * hsDist * (rtl ? 1 : -1);
    hsTrack.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    hsBar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', hsInit);
  window.addEventListener('load', hsInit);
  hsInit();
  onScroll();

  /* ---------- Infinite marquee: clone each set once for a seamless loop ---------- */
  $$('.mq-track').forEach(function (track) {
    var set = track.firstElementChild;
    if (!set) return;
    var copy = set.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    $$('img', copy).forEach(function (img) { img.alt = ''; });
    track.appendChild(copy);
  });

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var dur = 1800, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------- 3D tilt on cards and hero frame (mouse devices only) ---------- */
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

  /* ---------- Footer year ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();