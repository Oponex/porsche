/* =====================================================================
   animations.js — scroll reveals, animated stat counters, scroll
   progress bar. Pure motion logic, decoupled from navigation.
   ===================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Animated counters --- */
  function startCounters(scope) {
    var counters = scope.querySelectorAll("[data-count]");

    counters.forEach(function (el) {
      if (el.dataset.done) return;
      el.dataset.done = "1";

      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var suffix = el.getAttribute("data-suffix") || "";

      if (!isFinite(target)) return;

      if (reduce) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }

      var dur = 1600;
      var start = null;

      function tick(ts) {
        if (!start) start = ts;

        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic

        el.textContent = (target * eased).toFixed(decimals) + suffix;

        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target.toFixed(decimals) + suffix;
        }
      }

      requestAnimationFrame(tick);
    });
  }

  function revealNow(el) {
    el.classList.add("is-visible");

    if (el.hasAttribute("data-count-host") || el.querySelector("[data-count]")) {
      startCounters(el);
    }
  }

  /* --- Reveal on scroll --- */
  var revealEls = document.querySelectorAll("[data-reveal], [data-reveal-group]");

  if (reduce) {
    revealEls.forEach(revealNow);
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          revealNow(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.18 });

    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(revealNow);
  }

  /* --- Scroll progress bar --- */
  var bar = document.createElement("div");
  bar.className = "progress";
  document.body.appendChild(bar);

  var throttle = window.__rafThrottle || function (f) { return f; };

  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var scrolled = max > 0 ? h.scrollTop / max : 0;

    bar.style.width = (scrolled * 100) + "%";
  }

  window.addEventListener("scroll", throttle(updateProgress), { passive: true });
  updateProgress();
})();

/* =====================================================================
   Choose Your 911 — faster premium carousel
   Quicker drag response, lighter inertia feel, faster arrows, larger cards
   ===================================================================== */
(function () {
  "use strict";

  var section = document.querySelector("[data-choose-911]");
  if (!section) return;

  var track = section.querySelector("[data-choose-track]");
  var prev = section.querySelector("[data-choose-prev]");
  var next = section.querySelector("[data-choose-next]");
  var dotsHost = section.querySelector("[data-choose-dots]");
  var cards = Array.prototype.slice.call(section.querySelectorAll(".lineup-model"));

  if (!track || !cards.length) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DRAG_SENSITIVITY = 1.22;
  var WHEEL_SENSITIVITY = 1.16;
  var RELEASE_PROJECTION = 190;
  var SNAP_DURATION = reduceMotion ? 0 : 220;
  var WHEEL_SNAP_DELAY = reduceMotion ? 0 : 70;

  var pageCount = 1;
  var activeIndex = 0;
  var rafId = 0;
  var scrollAnimId = 0;
  var resizeTimer = 0;
  var wheelSnapTimer = 0;

  var isDragging = false;
  var startX = 0;
  var startScrollLeft = 0;
  var lastScrollLeft = 0;
  var lastTime = 0;
  var velocity = 0;
  var movedDuringDrag = false;
  var suppressClickUntil = 0;
  var pointerId = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function getMaxScroll() {
    return Math.max(0, track.scrollWidth - track.clientWidth);
  }

  function getGap() {
    var styles = window.getComputedStyle(track);
    return parseFloat(styles.columnGap || styles.gap || "0") || 0;
  }

  function getStep() {
    if (cards.length > 1) {
      return Math.max(1, cards[1].offsetLeft - cards[0].offsetLeft);
    }

    return Math.max(1, cards[0].getBoundingClientRect().width + getGap());
  }

  function getVisibleCards() {
    var step = getStep();
    var visible = Math.floor((track.clientWidth + getGap()) / step);
    return clamp(visible, 1, cards.length);
  }

  function getPagePosition(index) {
    return clamp(index * getStep(), 0, getMaxScroll());
  }

  function getCurrentIndex() {
    var step = getStep();
    var index = Math.round(track.scrollLeft / step);
    return clamp(index, 0, pageCount - 1);
  }

  function setArrowState() {
    var max = getMaxScroll();
    var left = track.scrollLeft;

    if (prev) prev.disabled = left <= 1;
    if (next) next.disabled = left >= max - 1;
  }

  function setActiveDot(index) {
    if (!dotsHost) return;

    var dots = Array.prototype.slice.call(
      dotsHost.querySelectorAll(".lineup-indicators__dot")
    );

    dots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === index;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  function updateUI() {
    activeIndex = getCurrentIndex();
    setActiveDot(activeIndex);
    setArrowState();
    rafId = 0;
  }

  function requestUIUpdate() {
    if (rafId) return;
    rafId = requestAnimationFrame(updateUI);
  }

  function cancelScrollAnimation() {
    if (scrollAnimId) {
      cancelAnimationFrame(scrollAnimId);
      scrollAnimId = 0;
    }

    clearTimeout(wheelSnapTimer);
  }

  function animateScrollTo(targetLeft, duration) {
    var max = getMaxScroll();
    var destination = clamp(targetLeft, 0, max);

    cancelScrollAnimation();

    if (reduceMotion || duration <= 0) {
      track.scrollLeft = destination;
      requestUIUpdate();
      return;
    }

    var start = track.scrollLeft;
    var distance = destination - start;

    if (Math.abs(distance) < 1) {
      track.scrollLeft = destination;
      requestUIUpdate();
      return;
    }

    var startTime = performance.now();

    function frame(now) {
      var progress = Math.min(1, (now - startTime) / duration);
      var eased = easeOutQuart(progress);

      track.scrollLeft = start + distance * eased;
      requestUIUpdate();

      if (progress < 1) {
        scrollAnimId = requestAnimationFrame(frame);
      } else {
        scrollAnimId = 0;
        track.scrollLeft = destination;
        requestUIUpdate();
      }
    }

    scrollAnimId = requestAnimationFrame(frame);
  }

  function goToIndex(index, duration) {
    var targetIndex = clamp(index, 0, pageCount - 1);
    var left = getPagePosition(targetIndex);

    activeIndex = targetIndex;
    setActiveDot(activeIndex);
    setArrowState();
    animateScrollTo(left, typeof duration === "number" ? duration : SNAP_DURATION);
  }

  function buildDots() {
    if (!dotsHost) return;

    var visibleCards = getVisibleCards();
    pageCount = Math.max(1, cards.length - visibleCards + 1);
    activeIndex = clamp(getCurrentIndex(), 0, pageCount - 1);

    dotsHost.innerHTML = "";

    for (var i = 0; i < pageCount; i += 1) {
      var dot = document.createElement("button");

      dot.type = "button";
      dot.className = "lineup-indicators__dot";
      dot.setAttribute("aria-label", "Go to carousel page " + (i + 1));
      dot.setAttribute("aria-selected", i === activeIndex ? "true" : "false");

      if (i === activeIndex) {
        dot.classList.add("is-active");
      }

      dot.addEventListener("click", function (event) {
        var dots = Array.prototype.slice.call(
          dotsHost.querySelectorAll(".lineup-indicators__dot")
        );

        goToIndex(dots.indexOf(event.currentTarget), SNAP_DURATION);
      });

      dotsHost.appendChild(dot);
    }

    setArrowState();
  }

  function startDrag(event) {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.pointerType && event.pointerType !== "mouse") return;

    cancelScrollAnimation();

    isDragging = true;
    movedDuringDrag = false;
    pointerId = event.pointerId;

    startX = event.clientX;
    startScrollLeft = track.scrollLeft;
    lastScrollLeft = track.scrollLeft;
    lastTime = performance.now();
    velocity = 0;

    track.classList.add("is-dragging");

    if (track.setPointerCapture) {
      track.setPointerCapture(pointerId);
    }
  }

  function moveDrag(event) {
    if (!isDragging) return;

    var dx = (event.clientX - startX) * DRAG_SENSITIVITY;
    var nextLeft = clamp(startScrollLeft - dx, 0, getMaxScroll());
    var now = performance.now();
    var dt = Math.max(8, now - lastTime);

    if (Math.abs(dx) > 3) {
      movedDuringDrag = true;
    }

    velocity = (nextLeft - lastScrollLeft) / dt;
    track.scrollLeft = nextLeft;
    lastScrollLeft = nextLeft;
    lastTime = now;

    if (movedDuringDrag) {
      event.preventDefault();
    }

    requestUIUpdate();
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

    if (movedDuringDrag) {
      suppressClickUntil = performance.now() + 260;

      var projectedLeft = clamp(
        track.scrollLeft + velocity * RELEASE_PROJECTION,
        0,
        getMaxScroll()
      );

      var projectedIndex = clamp(
        Math.round(projectedLeft / getStep()),
        0,
        pageCount - 1
      );

      goToIndex(projectedIndex, SNAP_DURATION);
      return;
    }

    requestUIUpdate();
  }

  function scheduleWheelSnap() {
    clearTimeout(wheelSnapTimer);

    wheelSnapTimer = setTimeout(function () {
      goToIndex(getCurrentIndex(), SNAP_DURATION);
    }, WHEEL_SNAP_DELAY);
  }

  function handleWheel(event) {
    var horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    var shiftHorizontal = event.shiftKey && Math.abs(event.deltaY) > 0;

    if (!horizontal && !shiftHorizontal) return;

    var amount = horizontal ? event.deltaX : event.deltaY;
    var max = getMaxScroll();
    var goingLeftAtStart = track.scrollLeft <= 0 && amount < 0;
    var goingRightAtEnd = track.scrollLeft >= max && amount > 0;

    if (goingLeftAtStart || goingRightAtEnd) return;

    event.preventDefault();
    cancelScrollAnimation();

    track.scrollLeft = clamp(
      track.scrollLeft + amount * WHEEL_SENSITIVITY,
      0,
      max
    );

    requestUIUpdate();
    scheduleWheelSnap();
  }

  function handleKeyboard(event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToIndex(activeIndex + 1, SNAP_DURATION);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToIndex(activeIndex - 1, SNAP_DURATION);
    }
  }

  function preventClickAfterDrag(event) {
    if (performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function handleResize() {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function () {
      buildDots();
      cancelScrollAnimation();
      goToIndex(clamp(activeIndex, 0, pageCount - 1), 0);
      requestUIUpdate();
    }, 90);
  }

  section.querySelectorAll("[data-choose-badge]").forEach(function (badge) {
    badge.addEventListener("click", function () {
      var selected = badge.classList.toggle("is-selected");
      badge.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  });

  track.addEventListener("pointerdown", startDrag);
  track.addEventListener("pointermove", moveDrag);
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("lostpointercapture", endDrag);

  track.addEventListener("wheel", handleWheel, { passive: false });
  track.addEventListener("scroll", requestUIUpdate, { passive: true });
  track.addEventListener("keydown", handleKeyboard);
  track.addEventListener("click", preventClickAfterDrag, true);

  track.addEventListener("dragstart", function (event) {
    event.preventDefault();
  });

  if (prev) {
    prev.addEventListener("click", function () {
      goToIndex(activeIndex - 1, 180);
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      goToIndex(activeIndex + 1, 180);
    });
  }

  window.addEventListener("resize", handleResize);

  cards.forEach(function (card) {
    var image = card.querySelector("img");

    if (image && !image.complete) {
      image.addEventListener(
        "load",
        function () {
          buildDots();
          requestUIUpdate();
        },
        { once: true }
      );
    }
  });

  buildDots();
  goToIndex(0, 0);
  requestUIUpdate();
})();