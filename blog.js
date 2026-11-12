 /* AUREL - Blog (AUREL Journal) scripts */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var BASE_TITLE = document.title;
  var ORDER = ['fitting', 'silk', 'care', 'kids', 'canvas'];   /* prev / next order */

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

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(function (el) { io.observe(el); });

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

  /* ---------- Journal routing: list view <-> full article page ----------
     #article/<id>  -> full article page
     #<section id>  -> journal list, scrolled to that section
     (no hash)      -> journal list                                         */
  var listView = $('#listView'), articleView = $('#articleView');

  function postTpl(id) { return document.getElementById('post-' + id); }

  function setPrevNext(a, id, label) {
    var tpl = postTpl(id);
    if (!tpl) return;
    a.href = '#article/' + id;
    a.innerHTML = '<small>' + label + '</small><span></span>';
    a.querySelector('span').textContent = tpl.dataset.title || '';
  }

  function showArticle(id) {
    var tpl = postTpl(id), d = tpl.dataset;

    var cover = $('#apCover');
    cover.src = d.image || '';
    cover.alt = d.alt || '';
    $('#apKicker').textContent = d.kicker || '';
    $('#apCrumb').textContent = d.kicker || '';
    $('#apTitle').textContent = d.title || '';
    $('#apMeta').textContent = d.meta || '';

    var body = $('#apBody');
    body.innerHTML = '';
    body.appendChild(tpl.content.cloneNode(true));

    var i = ORDER.indexOf(id), n = ORDER.length;
    setPrevNext($('#apPrev'), ORDER[(i - 1 + n) % n], 'Previous');
    setPrevNext($('#apNext'), ORDER[(i + 1) % n], 'Next');

    listView.hidden = true;
    articleView.hidden = false;
    document.title = (d.title || 'Article') + ' | AUREL Journal';
    window.scrollTo(0, 0);
    $('#apTitle').focus({ preventScroll: true });
  }

  function showList(target) {
    var wasArticle = !articleView.hidden;
    articleView.hidden = true;
    listView.hidden = false;
    document.title = BASE_TITLE;

    if (target) {
      var el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: wasArticle ? 'auto' : 'smooth', block: 'start' });
        return;
      }
    }
    if (wasArticle) window.scrollTo(0, 0);
  }

  function route() {
    var h = location.hash.slice(1);
    var m = h.match(/^article\/([a-z0-9-]+)$/i);
    if (m && postTpl(m[1])) showArticle(m[1]);
    else showList(h);
    onScroll();
  }

  window.addEventListener('hashchange', route);
  route();
  onScroll();

  /* ---------- Footer year ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();