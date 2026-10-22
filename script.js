(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- theme toggle ---------- */
  var themeBtn = document.getElementById('theme-toggle');
  function setTheme(t) {
    doc.setAttribute('data-theme', t);
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    try { localStorage.setItem('theme', t); } catch (e) {}
  }
  setTheme(doc.getAttribute('data-theme') || 'dark');
  themeBtn.addEventListener('click', function () {
    setTheme(doc.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById('menu-btn');
  var links = document.getElementById('nav-links');
  function closeMenu() {
    links.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- nav border on scroll ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- experience, computed so it never goes stale ---------- */
  function months(from, to) {
    var a = from.split('-').map(Number);
    var b = to === 'now' ? [new Date().getFullYear(), new Date().getMonth() + 1] : to.split('-').map(Number);
    return Math.max(0, (b[0] - a[0]) * 12 + (b[1] - a[1]));
  }
  function fmt(m) {
    var y = Math.floor(m / 12), r = m % 12, out = [];
    if (y) out.push(y + (y === 1 ? ' yr' : ' yrs'));
    if (r) out.push(r + (r === 1 ? ' mo' : ' mos'));
    return out.join(' ') || '< 1 mo';
  }
  var total = months('2022-11', 'now'); // career start: Tring, Nov 2022
  var ey = document.querySelector('[data-exp-years]');
  var em = document.querySelector('[data-exp-months]');
  if (ey) ey.textContent = Math.floor(total / 12);
  if (em) em.textContent = total % 12;
  document.querySelectorAll('.job-dur[data-from]').forEach(function (el) {
    el.textContent = fmt(months(el.dataset.from, el.dataset.to));
  });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- terminal: type the run line by line ---------- */
  var term = document.getElementById('term');
  if (term && !reduce) {
    var lines = term.innerHTML.split('\n');
    term.innerHTML = '';
    var started = false;
    var play = function () {
      if (started) return; started = true;
      var i = 0, caret = document.createElement('span');
      caret.className = 'caret';
      term.appendChild(caret);
      (function next() {
        if (i >= lines.length) return;
        var span = document.createElement('span');
        span.innerHTML = lines[i] + (i < lines.length - 1 ? '\n' : '');
        term.insertBefore(span, caret);
        var delay = i === 0 ? 650 : (lines[i].trim() === '' ? 120 : (i === 1 ? 420 : 210));
        i++;
        setTimeout(next, delay);
      })();
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, o) {
        if (es[0].isIntersecting) { play(); o.disconnect(); }
      }, { threshold: 0.3 }).observe(term);
    } else { play(); }
  }

  /* ---------- copy email ---------- */
  var copyBtn = document.getElementById('copy-email');
  var copyStatus = document.getElementById('copy-status');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.dataset.email;
      var done = function () {
        copyStatus.textContent = '✓ Copied ' + email;
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = 'Copy email'; copyStatus.textContent = ''; }, 2400);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(done, function () { copyStatus.textContent = email; });
      } else {
        copyStatus.textContent = email;
      }
    });
  }

  /* ---------- save as PDF (uses the print stylesheet) ---------- */
  document.querySelectorAll('[data-print]').forEach(function (b) {
    b.addEventListener('click', function () { window.print(); });
  });

  /* ---------- reveal on scroll ---------- */
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  }
  window.addEventListener('beforeprint', function () { items.forEach(function (el) { el.classList.add('in'); }); });

  /* ---------- active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) {
            var on = a.getAttribute('href') === '#' + e.target.id;
            a.classList.toggle('active', on);
            if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
