/* ---- Spec counter helpers ---- */
function animateCount(el, target, dec) {
  var start = 0, dur = 900, t0 = null;
  function step(ts) {
    if (!t0) t0 = ts;
    var p = Math.min((ts - t0) / dur, 1);
    var ease = 1 - Math.pow(1 - p, 3);
    el.textContent = (start + (target - start) * ease).toFixed(dec);
    if (p < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(dec);
  }
  requestAnimationFrame(step);
}
function updateStats(power, accel, top, layout, kw) {
  var box = document.querySelector('[data-stats]');
  if (!box) return;
  box.classList.remove('pos-left', 'pos-right', 'pos-split');
  box.classList.add('pos-' + (layout || 'split'));
  var nums = box.querySelectorAll('.stat__num:not(.stat__num--kw)');
  if (nums[0]) animateCount(nums[0], parseFloat(power), 0);
  if (nums[1]) animateCount(nums[1], parseFloat(accel), 1);
  if (nums[2]) animateCount(nums[2], parseFloat(top), 0);
  var kwNum = box.querySelector('.stat__num--kw');
  if (kwNum && kw) animateCount(kwNum, parseFloat(kw), 0);
}
/* =====================================================================
   script.js — entry orchestrator. Keeps app-level concerns (year,
   feature detection, lazy video) separate from nav/animation modules.
   ===================================================================== */
(function () {
  "use strict";

  /* --- Pause hero video when off-screen (saves battery / CPU) --- */
  var video = document.querySelector(".hero__video");
  if (video && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { video.play().catch(function () {}); }
        else { video.pause(); }
      });
    }, { threshold: 0.1 });
    vio.observe(video);
  }

  /* --- Graceful smooth-scroll fallback for older browsers --- */
  if (!("scrollBehavior" in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (ev) {
        var t = document.querySelector(a.getAttribute("href"));
        if (t) { ev.preventDefault(); t.scrollIntoView(); }
      });
    });
  }

  console.info("911 Turbo S — concept experience loaded.");
})();

/* ---- Hero 911 model selector ---- */
(function () {
  var nav = document.querySelector('[data-models]');
  if (!nav) return;
  var title = document.querySelector('.hero__title');
  var eyebrow = document.querySelector('.hero__eyebrow');
  nav.addEventListener('click', function (e) {
    var btn = e.target.closest('.hero__model');
    if (!btn) return;
    nav.querySelectorAll('.hero__model').forEach(function (b) { b.classList.remove('is-active'); });
    btn.classList.add('is-active');
    if (title) title.textContent = btn.dataset.title + '.';
    if (eyebrow) eyebrow.textContent = btn.dataset.eyebrow;
  });
})();

/* ---- Model chooser (lineup) ---- */
(function () {
  var nav = document.querySelector('[data-lineup]');
  if (!nav) return;
  var title = document.querySelector('[data-lineup-title]');
  var imgEl = document.getElementById('lineupImg');
  nav.addEventListener('click', function (e) {
    var btn = e.target.closest('.lineup__tab');
    if (!btn || btn.classList.contains('is-active')) return;
    nav.querySelectorAll('.lineup__tab').forEach(function (b) { b.classList.remove('is-active'); });
    btn.classList.add('is-active');

    // fade out current image + title
    if (imgEl) imgEl.classList.add('is-swapping');
    if (title) title.classList.add('is-swapping');

    var newSrc = btn.dataset.img;
    var l1 = btn.dataset.l1, l2 = btn.dataset.l2;

    // preload the next image, then swap + fade back in
    var pre = new Image();
    pre.onload = function () {
      setTimeout(function () {
        if (imgEl && newSrc) imgEl.src = newSrc;
        if (title) title.innerHTML = l1 + '<br>' + l2;
        // next frame: remove the swap class to fade/zoom back in
        var sbox = document.querySelector('[data-stats]'); if (sbox) sbox.classList.add('is-swapping');
        requestAnimationFrame(function () {
          if (imgEl) imgEl.classList.remove('is-swapping');
          if (title) title.classList.remove('is-swapping');
          if (sbox) sbox.classList.remove('is-swapping');
          updateStats(btn.dataset.power, btn.dataset.accel, btn.dataset.top, btn.dataset.layout, btn.dataset.kw);
        });
      }, 260);
    };
    pre.src = newSrc;
  });
})();

/* initial spec animation (Carrera) when section first appears */
(function () {
  var box = document.querySelector('[data-stats]');
  if (!box) return;
  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { updateStats(394, 4.1, 294, 'split', 290); obs.disconnect(); }
    });
  }, { threshold: 0.4 });
  io.observe(box);
})();

/* ---- Story parallax: images rise up as you scroll down ---- */
(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (!els.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ticking = false;
  function update() {
    var vh = window.innerHeight;
    els.forEach(function (el) {
      var range = Math.abs(parseFloat(el.getAttribute('data-parallax')) || 0);
      var rect = el.getBoundingClientRect();
      var center = rect.top + rect.height / 2;
      // progress 0 (element below viewport) -> 1 (element at top). Clamp.
      var progress = (vh - center) / vh;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      // only moves UP as progress grows (scroll down) -> appears earlier
      var offset = -progress * range;
      el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
    });
    ticking = false;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();

/* ---- Moves (T-Hybrid) carousel ---- */
(function () {
  var track = document.querySelector('[data-moves-track]');
  if (!track) return;
  var prev = document.querySelector('[data-moves-prev]');
  var next = document.querySelector('[data-moves-next]');
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-moves-dots] .moves__dot'));
  var cards = track.children.length;
  var index = 0;
  function render() {
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === index); });
  }
  function go(dir) { index = Math.max(0, Math.min(cards - 1, index + dir)); render(); }
  if (prev) prev.addEventListener('click', function () { go(-1); });
  if (next) next.addEventListener('click', function () { go(1); });
  dots.forEach(function (d, i) { d.addEventListener('click', function () { index = i; render(); }); });
  // toggle show more (placeholder, no extra content)
  document.querySelectorAll('.moves__more').forEach(function (b) {
    b.addEventListener('click', function () { b.classList.toggle('is-open'); });
  });
})();

/* ---- Moves card show more/less ---- */
(function () {
  document.querySelectorAll('[data-moves-toggle]').forEach(function (btn) {
    var card = btn.closest('.moves__card');
    var label = btn.querySelector('.moves__more-label');
    btn.addEventListener('click', function () {
      var collapsed = card.classList.toggle('is-collapsed');
      if (label) label.textContent = collapsed ? 'show more' : 'show less';
    });
  });
})();


/* ==================================================
   Elements in Turbonite Gallery
   Gallery-only JavaScript
   ================================================== */

(function () {
  "use strict";

  var galleries = document.querySelectorAll("[data-elements-gallery]");

  if (!galleries.length) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  galleries.forEach(function (gallery) {
    var track = gallery.querySelector("[data-elements-gallery-track]");
    var pagination = gallery.querySelector("[data-elements-gallery-pagination]");

    if (!track || !pagination) return;

    var dots = [];
    var activeIndex = 0;

    var isDragging = false;
    var pointerId = null;

    var startX = 0;
    var startScrollLeft = 0;

    var lastX = 0;
    var lastTime = 0;
    var velocity = 0;

    var movedDuringDrag = false;
    var suppressClickUntil = 0;

    var animationFrame = null;
    var snapTimer = null;

    function getMaxScroll() {
      return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    function getTargets() {
      var max = getMaxScroll();

      /*
        Exactly 3 pagination positions:
        1. Start
        2. Middle
        3. End
      */
      return [0, max / 2, max];
    }

    function getClosestIndex() {
      var targets = getTargets();
      var current = track.scrollLeft;

      var closestIndex = 0;
      var closestDistance = Infinity;

      targets.forEach(function (target, index) {
        var distance = Math.abs(current - target);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    }

    function updateActiveDot() {
      activeIndex = getClosestIndex();

      dots.forEach(function (dot, index) {
        var isActive = index === activeIndex;

        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    }

    function requestDotUpdate() {
      if (animationFrame) return;

      animationFrame = requestAnimationFrame(function () {
        animationFrame = null;
        updateActiveDot();
      });
    }

    function goToIndex(index) {
      var targets = getTargets();
      var safeIndex = clamp(index, 0, targets.length - 1);

      activeIndex = safeIndex;

      track.scrollTo({
        left: targets[safeIndex],
        behavior: reduceMotion ? "auto" : "smooth"
      });

      updateActiveDot();
    }

    function snapToNearest(extraMomentum) {
      var max = getMaxScroll();
      var projectedScroll = clamp(track.scrollLeft + extraMomentum, 0, max);
      var targets = getTargets();

      var closestIndex = 0;
      var closestDistance = Infinity;

      targets.forEach(function (target, index) {
        var distance = Math.abs(projectedScroll - target);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      goToIndex(closestIndex);
    }

    function buildPagination() {
      pagination.innerHTML = "";
      dots = [];

      /*
        Requirement:
        exactly 3 indicators.
      */
      for (var index = 0; index < 3; index++) {
        var dot = document.createElement("button");

        dot.type = "button";
        dot.className = "elements-gallery__dot";
        dot.setAttribute("aria-label", "Go to gallery position " + (index + 1));

        dot.addEventListener("click", function (event) {
          var clickedIndex = dots.indexOf(event.currentTarget);
          goToIndex(clickedIndex);
        });

        pagination.appendChild(dot);
        dots.push(dot);
      }

      updateActiveDot();
    }

    function startDrag(event) {
      if (event.button !== undefined && event.button !== 0) return;

      isDragging = true;
      pointerId = event.pointerId;

      startX = event.clientX;
      startScrollLeft = track.scrollLeft;

      lastX = event.clientX;
      lastTime = performance.now();
      velocity = 0;

      movedDuringDrag = false;

      track.classList.add("is-dragging");

      if (track.setPointerCapture) {
        track.setPointerCapture(pointerId);
      }
    }

    function moveDrag(event) {
      if (!isDragging) return;

      var currentX = event.clientX;
      var dragDistance = currentX - startX;

      var now = performance.now();
      var deltaX = currentX - lastX;
      var deltaTime = Math.max(now - lastTime, 1);

      var nextScrollLeft = startScrollLeft - dragDistance;

      track.scrollLeft = clamp(nextScrollLeft, 0, getMaxScroll());

      /*
        Small velocity calculation.
        This makes the release feel smoother and more natural.
      */
      var instantVelocity = -deltaX / deltaTime;
      velocity = velocity * 0.72 + instantVelocity * 0.28;

      lastX = currentX;
      lastTime = now;

      if (Math.abs(dragDistance) > 4) {
        movedDuringDrag = true;
        suppressClickUntil = now + 180;
      }

      requestDotUpdate();

      /*
        Prevents the browser from selecting text/images while dragging.
      */
      event.preventDefault();
    }

    function endDrag(event) {
      if (!isDragging) return;

      isDragging = false;
      track.classList.remove("is-dragging");

      if (
        event &&
        pointerId !== null &&
        track.hasPointerCapture &&
        track.hasPointerCapture(pointerId)
      ) {
        track.releasePointerCapture(pointerId);
      }

      pointerId = null;

      /*
        Controlled, subtle momentum.
        Not too much, because the design should feel premium, not slippery.
      */
      var momentum = clamp(velocity * 180, -180, 180);

      snapToNearest(momentum);
    }

    function handleScroll() {
      requestDotUpdate();

      clearTimeout(snapTimer);

      /*
        When the user scrolls naturally or uses a trackpad,
        this gently settles the gallery to one of the 3 dot positions.
      */
      if (!isDragging) {
        snapTimer = setTimeout(function () {
          snapToNearest(0);
        }, 120);
      }
    }

    function handleWheel(event) {
      var horizontalWheel = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      var shiftWheel = event.shiftKey && Math.abs(event.deltaY) > 0;

      if (!horizontalWheel && !shiftWheel) return;

      event.preventDefault();

      var scrollAmount = horizontalWheel ? event.deltaX : event.deltaY;

      track.scrollLeft = clamp(
        track.scrollLeft + scrollAmount,
        0,
        getMaxScroll()
      );

      requestDotUpdate();
    }

    function handleKeyboard(event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToIndex(activeIndex + 1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToIndex(activeIndex - 1);
      }
    }

    function handleResize() {
      requestDotUpdate();
    }

    function preventClickAfterDrag(event) {
      if (movedDuringDrag && performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    /*
      Mouse drag + touch swipe.
      Pointer events support both mouse and touch with one system.
    */
    track.addEventListener("pointerdown", startDrag);
    track.addEventListener("pointermove", moveDrag);
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("lostpointercapture", endDrag);

    /*
      Prevent image dragging ghost behavior.
    */
    track.addEventListener("dragstart", function (event) {
      event.preventDefault();
    });

    /*
      Prevent accidental clicks after dragging.
    */
    track.addEventListener("click", preventClickAfterDrag, true);

    /*
      Keep pagination synced while the gallery moves.
    */
    track.addEventListener("scroll", handleScroll, { passive: true });

    /*
      Optional horizontal wheel/trackpad support.
    */
    track.addEventListener("wheel", handleWheel, { passive: false });

    /*
      Keyboard support when the gallery track is focused.
    */
    track.addEventListener("keydown", handleKeyboard);

    /*
      Keep dot positions correct if screen size changes.
    */
    window.addEventListener("resize", handleResize);

    /*
      Re-sync after images load.
      This helps if you replace images later with different sizes.
    */
    track.querySelectorAll("img").forEach(function (image) {
      if (!image.complete) {
        image.addEventListener("load", requestDotUpdate, { once: true });
      }
    });

    buildPagination();
  });
})();



