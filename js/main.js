// netti-app.com: the phone menu, the "See each change" pension demo and the hero video.
// First-party, no dependencies.
(function () {
  'use strict';

  // The phone menu: a real disclosure, closed by a link, Escape or a wide window.
  var menuButton = document.querySelector('.menu-button');
  var menu = document.getElementById('site-menu');
  if (menuButton && menu) {
    var setMenu = function (open) {
      menu.hidden = !open;
      menuButton.setAttribute('aria-expanded', String(open));
    };
    menuButton.addEventListener('click', function () {
      setMenu(menu.hidden);
    });
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !menu.hidden) {
        setMenu(false);
        menuButton.focus();
      }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (query) {
      if (query.matches) setMenu(false);
    });
  }

  // See each change: £48,000 in England, tax code 1257L, no student loan, a salary sacrifice
  // pension. HMRC 2026–27: every option keeps pay under £50,270, so it is all basic rate, 20% tax
  // and 8% NI above £12,570. The figures match Netti's tax engine (ios-native/Sources/TaxEngine).
  var demo = document.querySelector('[data-pension-demo]');
  if (demo) {
    var SALARY = 48000;
    var ALLOWANCE = 12570;
    var calc = function (percent) {
      var pension = SALARY * percent / 100;
      var gross = SALARY - pension;
      var tax = (gross - ALLOWANCE) * 0.2;
      var ni = (gross - ALLOWANCE) * 0.08;
      return { pension: pension, tax: tax, ni: ni, home: gross - tax - ni };
    };
    var pounds = function (n) {
      return '£' + Math.round(n).toLocaleString('en-GB');
    };
    var pence = function (n) {
      return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    var out = function (name) {
      return demo.querySelector('[data-out="' + name + '"]');
    };
    var buttons = Array.prototype.slice.call(demo.querySelectorAll('[data-pension]'));
    var state = { pension: 5, previous: 0 };

    var render = function () {
      var now = calc(state.pension);
      var before = calc(state.previous);
      var diff = Math.round((now.home - before.home) / 12);
      buttons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(Number(button.dataset.pension) === state.pension));
      });
      out('figure').textContent = pounds(now.home / 12);
      var chip = out('chip');
      chip.hidden = diff === 0;
      chip.textContent = pounds(Math.abs(diff)) + (diff < 0 ? ' less' : ' more');
      out('sub').textContent = state.pension === 0
        ? 'a month, after tax and National Insurance'
        : 'a month, after tax, National Insurance and ' + state.pension + '% pension';
      out('pension').textContent = state.pension === 0 ? '£0.00' : '−' + pence(now.pension / 12);
      out('tax').textContent = '−' + pence(now.tax / 12);
      out('ni').textContent = '−' + pence(now.ni / 12);
      out('home').textContent = pence(now.home / 12);
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var percent = Number(button.dataset.pension);
        if (percent === state.pension) return;
        state.previous = state.pension;
        state.pension = percent;
        render();
      });
    });
  }

  // The hero: a recording of the app. It plays only on screen, only in the visitor's colour
  // scheme, never under Reduce Motion, and the button pauses it (WCAG 2.2.2).
  var screen = document.getElementById('hero-screen');
  var pauseButton = document.querySelector('.hero-pause');
  if (screen && pauseButton) {
    var videos = {
      light: screen.querySelector('.hero-video--light'),
      dark: screen.querySelector('.hero-video--dark')
    };
    var dark = window.matchMedia('(prefers-color-scheme: dark)');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var movingLabel = screen.getAttribute('aria-label');
    var stillLabel = screen.dataset.stillLabel;
    var userPaused = false;
    var onScreen = true;

    var update = function () {
      var active = dark.matches ? videos.dark : videos.light;
      var idle = dark.matches ? videos.light : videos.dark;
      // The other scheme's video never loads.
      idle.removeAttribute('autoplay');
      idle.preload = 'none';
      idle.pause();
      screen.setAttribute('aria-label', reduce.matches ? stillLabel : movingLabel);
      pauseButton.hidden = reduce.matches;
      if (reduce.matches) {
        active.removeAttribute('autoplay');
        active.pause();
        return;
      }
      if (userPaused || !onScreen) {
        active.pause();
      } else {
        var playing = active.play();
        if (playing && playing.catch) playing.catch(function () {});
      }
    };

    pauseButton.addEventListener('click', function () {
      userPaused = !userPaused;
      pauseButton.setAttribute('aria-pressed', String(userPaused));
      update();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[entries.length - 1].isIntersecting;
        update();
      }).observe(screen);
    }
    dark.addEventListener('change', update);
    reduce.addEventListener('change', update);
    update();
  }
})();
