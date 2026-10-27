(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* mobile drawer */
  var burger = $('.nav__burger'), drawer = $('.drawer');
  if (burger && drawer) {
    var setDrawer = function (open) {
      drawer.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.textContent = open ? 'Close' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { setDrawer(!drawer.classList.contains('open')); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 860) setDrawer(false); });
  }

  /* entrances */
  var rv = $$('[data-rv]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* showcase tabs */
  var tabs = $$('.tab');
  if (tabs.length) {
    var panel = $('.show__body'), imgs = $$('.show__pic img');
    var pick = function (i) {
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      var d = tabs[i].dataset;
      $('[data-f="name"]', panel).textContent = d.name;
      $('[data-f="price"]', panel).textContent = d.price;
      $('[data-f="desc"]', panel).textContent = d.desc;
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(i); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
        if (n === null) return;
        n = (n + tabs.length) % tabs.length; pick(n); tabs[n].focus();
      });
    });
  }

  /* index hover */
  var rows = $$('.idx__rows .row'), pimgs = $$('.idx__frame img');
  if (rows.length && pimgs.length) {
    var show = function (i) { pimgs.forEach(function (im, k) { im.classList.toggle('on', k === i); }); };
    rows.forEach(function (r, i) {
      r.addEventListener('mouseenter', function () { show(i); });
      r.addEventListener('focus', function () { show(i); });
    });
  }

  /* one frame, contents change */
  var frame = $('.frame');
  if (frame) {
    var fi = $$('img', frame), cur = 0, timer;
    var go = function (n) { fi[cur].classList.remove('on'); cur = n % fi.length; fi[cur].classList.add('on'); };
    var start = function () { if (!reduce) timer = setInterval(function () { go(cur + 1); }, 2800); };
    frame.addEventListener('click', function () { clearInterval(timer); go(cur + 1); start(); });
    start();
  }

  /* menu: filters and chip highlight */
  var diet = $$('.diet button');
  if (diet.length) {
    var active = {};
    var apply = function () {
      var keys = Object.keys(active).filter(function (k) { return active[k]; });
      $$('.item').forEach(function (it) {
        var tags = (it.dataset.tags || '').split(' ');
        var ok = keys.every(function (k) {
          if (k === 'V') return tags.indexOf('V') > -1 || tags.indexOf('VV') > -1;
          return tags.indexOf(k) > -1;
        });
        it.hidden = !ok;
      });
      $$('.cat-sec').forEach(function (s) {
        var n = $$('.item:not([hidden])', s).length;
        s.hidden = n === 0;
        var c = $('.count', s); if (c) c.textContent = n + (n === 1 ? ' item' : ' items');
      });
      var none = $$('.cat-sec:not([hidden])').length === 0;
      $('.empty').hidden = !none;
      $$('.chip').forEach(function (c) { var t = $(c.getAttribute('href')); c.hidden = !t || t.hidden; });
    };
    diet.forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        active[b.dataset.tag] = on; apply();
      });
    });
    var secs = $$('.cat-sec'), chips = $$('.chip');
    if ('IntersectionObserver' in window) {
      var vis = {};
      var so = new IntersectionObserver(function (es) {
        es.forEach(function (e) { vis[e.target.id] = e.isIntersecting; });
        var first = secs.filter(function (s) { return vis[s.id] && !s.hidden; })[0];
        if (!first) return;
        chips.forEach(function (c) {
          var on = c.getAttribute('href') === '#' + first.id;
          c.setAttribute('aria-current', on ? 'true' : 'false');
          if (on) { var box = c.parentNode; box.scrollTo({ left: c.offsetLeft - 24, behavior: reduce ? 'auto' : 'smooth' }); }
        });
      }, { rootMargin: '-140px 0px -60% 0px' });
      secs.forEach(function (s) { so.observe(s); });
    }
  }
})();
