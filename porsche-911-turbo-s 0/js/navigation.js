/* =====================================================================
   navigation.js — header behavior, mobile drawer, active-link sync,
   smooth-scroll. Presentation logic only; no animation math here.
   ===================================================================== */
(function () {
  "use strict";

  function rafThrottle(fn) {
    var ticking = false;
    return function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        fn();
        ticking = false;
      });
    };
  }

  window.__rafThrottle = rafThrottle; // expose for other modules

  var nav = document.querySelector("[data-nav]");
  var burger = document.querySelector("[data-burger]");
  var menu = document.querySelector(".nav__menu");
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));

  if (!nav || !menu) return;

  /* --- Hide-on-scroll-down, show-on-scroll-up + frosted background --- */
  var lastY = window.scrollY || 0;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;

    nav.classList.toggle("nav--scrolled", y > 40);

    if (y > lastY && y > 400 && !menu.classList.contains("is-open")) {
      nav.classList.add("nav--hidden");
    } else {
      nav.classList.remove("nav--hidden");
    }

    lastY = y;
  }

  window.addEventListener("scroll", rafThrottle(onScroll), { passive: true });
  onScroll();

  /* --- Mobile drawer toggle --- */
  if (burger) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");

      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");

      document.body.style.overflow = open ? "hidden" : "";
      nav.classList.remove("nav--hidden");
    });
  }

  links.forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("is-open");

      if (burger) {
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Open menu");
      }

      document.body.style.overflow = "";
    });
  });

  /* --- Scroll-spy: highlight the section currently in view --- */
  var sections = links
    .map(function (l) {
      var href = l.getAttribute("href");
      return href ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = "#" + e.target.id;

          links.forEach(function (l) {
            l.classList.toggle("is-active", l.getAttribute("href") === id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (s) {
      spy.observe(s);
    });
  }
})();