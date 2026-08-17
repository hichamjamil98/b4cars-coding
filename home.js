/* ==========================================================================
   B4CARS — HOME LOADING SCREEN
   Requires GSAP
========================================================================== */

window.B4CARS_EASE =
  window.B4CARS_EASE ||
  ((x1, y1, x2, y2) => {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    const sample = (a, b, c, t) => ((a * t + b) * t + c) * t;

    return (progress) => {
      if (progress <= 0) return 0;
      if (progress >= 1) return 1;

      let t = progress;

      for (let i = 0; i < 8; i += 1) {
        const slope = (3 * ax * t + 2 * bx) * t + cx;
        if (Math.abs(slope) < 1e-6) break;
        t -= (sample(ax, bx, cx, t) - progress) / slope;
      }

      return sample(ay, by, cy, t);
    };
  })(0.16, 1, 0.3, 1);

(() => {
  "use strict";

  const LOADER_SESSION_KEY = "b4cars-home-loader";

  const hasSeenLoader = () => {
    try {
      return sessionStorage.getItem(LOADER_SESSION_KEY) === "1";
    } catch (error) {
      return false;
    }
  };

  const markLoaderSeen = () => {
    try {
      sessionStorage.setItem(LOADER_SESSION_KEY, "1");
    } catch (error) {
      // Private mode / blocked storage — play the loader this visit only.
    }
  };

  if (hasSeenLoader()) {
    document.documentElement.classList.add("has-seen-loader");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const html = document.documentElement;
    const body = document.body;

    const loader = document.querySelector(".loading--screen");
    const logo = loader?.querySelector(".brand--loading");
    const logoWrapper = loader?.querySelector(".brand--loading-wrapper");
    const topContent = loader?.querySelector(".loading--top");
    const bottomContent = loader?.querySelector(".loading--bottom");
    const backgroundImage = loader?.querySelector(".image--absolute100");
    const pageElements = document.querySelectorAll(".main-wrapper, .navbar");

    const revealPageWithoutAnimation = () => {
      pageElements.forEach((element) => {
        element.style.removeProperty("opacity");
        element.style.removeProperty("visibility");
      });

      if (loader) {
        loader.style.display = "none";
        loader.style.pointerEvents = "none";
      }

      html.classList.remove("is-loading");
      body.classList.remove("is-loading");
    };

    if (!loader || typeof window.gsap === "undefined") {
      revealPageWithoutAnimation();
      return;
    }

    const gsap = window.gsap;
    gsap.defaults({ ease: window.B4CARS_EASE });

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || hasSeenLoader()) {
      revealPageWithoutAnimation();
      return;
    }

    markLoaderSeen();
    html.classList.add("is-loading");
    body.classList.add("is-loading");

    const paths = logo ? gsap.utils.toArray(logo.querySelectorAll("path")) : [];

    let hasDrawablePaths = false;

    paths.forEach((path) => {
      try {
        const length = path.getTotalLength();

        if (!Number.isFinite(length) || length <= 0) return;

        hasDrawablePaths = true;

        path.dataset.originalFill = path.getAttribute("fill") || "currentColor";

        path.setAttribute("fill", "transparent");
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "1.15");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");

        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 0,
        });
      } catch (error) {
        // A non-drawable SVG path simply falls back to a fade.
      }
    });

    gsap.set(loader, {
      display: "flex",
      opacity: 1,
      visibility: "visible",
      clipPath: "inset(0% 0% 0% 0%)",
      pointerEvents: "auto",
    });

    gsap.set(pageElements, {
      opacity: 0,
      visibility: "hidden",
    });

    if (backgroundImage) {
      gsap.set(backgroundImage, {
        opacity: 0,
        scale: 1.08,
      });
    }

    if (logoWrapper) {
      gsap.set(logoWrapper, {
        opacity: 0,
        scale: 0.88,
        y: "1rem",
      });
    }

    if (logo && !hasDrawablePaths) {
      gsap.set(logo, {
        opacity: 0,
      });
    }

    const secondaryElements = [topContent, bottomContent].filter(Boolean);

    /*
     * Important:
     * remove transforms/filters potentially left by an older loader version.
     * Webflow remains the only source of positioning for these elements.
     */
    if (secondaryElements.length) {
      gsap.set(secondaryElements, {
        clearProps: "transform,filter",
      });

      gsap.set(secondaryElements, {
        opacity: 0,
      });
    }

    const safetyTimeout = window.setTimeout(() => {
      console.warn("B4Cars loader safety fallback triggered.");
      revealPageWithoutAnimation();
    }, 7000);

    const timeline = gsap.timeline({
      defaults: {
        ease: window.B4CARS_EASE,
      },
      onComplete: () => {
        window.clearTimeout(safetyTimeout);
        loader.style.display = "none";
        html.classList.remove("is-loading");
        body.classList.remove("is-loading");

        gsap.set(pageElements, {
          opacity: 1,
          visibility: "visible",
        });

        gsap.set(pageElements, {
          clearProps: "opacity,visibility",
        });

        /*
         * Remove only animation-generated inline properties.
         * Position, top, bottom, left, right and layout remain untouched.
         */
        if (secondaryElements.length) {
          gsap.set(secondaryElements, {
            clearProps: "opacity,transform,filter",
          });
        }

        if (logoWrapper) {
          gsap.set(logoWrapper, {
            clearProps: "opacity,transform,filter",
          });
        }

        window.dispatchEvent(new Event("resize"));

        if (typeof window.ScrollTrigger !== "undefined") {
          window.ScrollTrigger.refresh();
        }
      },
    });

    timeline.addLabel("start", 0);

    if (backgroundImage) {
      timeline.to(
        backgroundImage,
        {
          opacity: 0.72,
          scale: 1.025,
          duration: 1.7,
          ease: window.B4CARS_EASE,
        },
        "start",
      );
    }

    if (logoWrapper) {
      timeline.to(
        logoWrapper,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.75,
        },
        "start+=0.12",
      );
    }

    if (hasDrawablePaths) {
      timeline.to(
        paths,
        {
          opacity: 1,
          duration: 0.35,
          stagger: 0.045,
        },
        "start+=0.15",
      );

      timeline.to(
        paths,
        {
          strokeDashoffset: 0,
          duration: 1.45,
          stagger: 0.09,
          ease: window.B4CARS_EASE,
        },
        "start+=0.2",
      );

      timeline.to(
        paths,
        {
          attr: {
            fill: "currentColor",
          },
          strokeOpacity: 0,
          duration: 0.6,
          stagger: 0.045,
          ease: window.B4CARS_EASE,
        },
        "start+=1.35",
      );
    } else if (logo) {
      timeline.to(
        logo,
        {
          opacity: 1,
          duration: 1,
        },
        "start+=0.25",
      );
    }

    timeline.to(
      logoWrapper || logo,
      {
        scale: 1.04,
        duration: 0.55,
        ease: window.B4CARS_EASE,
      },
      "start+=1.45",
    );

    timeline.to(
      logoWrapper || logo,
      {
        scale: 1,
        duration: 0.5,
        ease: window.B4CARS_EASE,
      },
      "start+=1.9",
    );

    if (secondaryElements.length) {
      timeline.to(
        secondaryElements,
        {
          opacity: 1,
          duration: 0.75,
          stagger: 0.12,
        },
        "start+=1.7",
      );
    }

    timeline.addLabel("ready", 2.65);

    if (logoWrapper) {
      timeline.to(
        logoWrapper,
        {
          opacity: 0,
          scale: 0.96,
          duration: 0.55,
          ease: window.B4CARS_EASE,
        },
        "ready",
      );
    }

    if (secondaryElements.length) {
      timeline.to(
        secondaryElements,
        {
          opacity: 0,
          duration: 0.45,
          stagger: 0.04,
          ease: window.B4CARS_EASE,
        },
        "ready",
      );
    }

    if (backgroundImage) {
      timeline.to(
        backgroundImage,
        {
          opacity: 0.9,
          scale: 1,
          duration: 0.7,
          ease: window.B4CARS_EASE,
        },
        "ready",
      );
    }

    timeline.to(
      pageElements,
      {
        opacity: 1,
        visibility: "visible",
        duration: 0.75,
        stagger: 0.08,
        ease: window.B4CARS_EASE,
      },
      "ready+=0.28",
    );

    timeline.to(
      loader,
      {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 1.25,
        ease: window.B4CARS_EASE,
        pointerEvents: "none",
      },
      "ready+=0.2",
    );

    timeline.to(
      loader,
      {
        opacity: 0.96,
        duration: 1.25,
        ease: "none",
      },
      "ready+=0.2",
    );
  });
})();

/* ==========================================================================
     SEARCH ITEMS — MOVING HOVER HIGHLIGHT
  ========================================================================== */

function initDirectionalListHover() {
  const directionMap = {
    top: "translateY(-100%)",
    bottom: "translateY(100%)",
    left: "translateX(-100%)",
    right: "translateX(100%)",
  };

  document.querySelectorAll("[data-directional-hover]").forEach((container) => {
    const type = container.getAttribute("data-type") || "all";

    container
      .querySelectorAll("[data-directional-hover-item]")
      .forEach((item) => {
        const tile = item.querySelector("[data-directional-hover-tile]");
        if (!tile) return;

        const searchItem = item.querySelector(".car--search-item");

        item.addEventListener("mouseenter", (e) => {
          const dir = getDirection(e, item, type);
          tile.style.transition = "none";
          tile.style.transform = directionMap[dir] || "translate(0, 0)";
          void tile.offsetHeight;
          tile.style.transition = "";
          tile.style.transform = "translate(0%, 0%)";
          item.setAttribute("data-status", `enter-${dir}`);
          searchItem?.classList.add("is--hovered");
        });

        item.addEventListener("mouseleave", (e) => {
          const dir = getDirection(e, item, type);
          item.setAttribute("data-status", `leave-${dir}`);
          tile.style.transform = directionMap[dir] || "translate(0, 0)";
          searchItem?.classList.remove("is--hovered");
        });
      });

    function getDirection(event, el, type) {
      const { left, top, width: w, height: h } = el.getBoundingClientRect();
      const x = event.clientX - left;
      const y = event.clientY - top;

      if (type === "y") return y < h / 2 ? "top" : "bottom";
      if (type === "x") return x < w / 2 ? "left" : "right";

      const distances = {
        top: y,
        right: w - x,
        bottom: h - y,
        left: x,
      };

      return Object.entries(distances).reduce((a, b) =>
        a[1] < b[1] ? a : b,
      )[0];
    }
  });
}

// Initialize Directional List Hover
document.addEventListener("DOMContentLoaded", () => {
  initDirectionalListHover();
});

/* ==========================================================================
     CASCADING SLIDER
  ========================================================================== */

function initCascadingSlider() {
  const duration = 0.65;
  const ease = "power3.inOut";

  const breakpoints = [
    { maxWidth: 479, activeWidth: 0.78, siblingWidth: 0.08 },
    { maxWidth: 767, activeWidth: 0.7, siblingWidth: 0.1 },
    { maxWidth: 991, activeWidth: 0.6, siblingWidth: 0.1 },
    { maxWidth: Infinity, activeWidth: 0.6, siblingWidth: 0.13 },
  ];

  const wrappers = document.querySelectorAll("[data-cascading-slider-wrap]");
  wrappers.forEach(setupInstance);

  function setupInstance(wrapper) {
    const viewport =
      wrapper.querySelector("[data-cascading-viewport]") ||
      wrapper.querySelector(".cascading-slider__list") ||
      wrapper.querySelector(".w-dyn-items");
    const prevButton = wrapper.querySelector("[data-cascading-slider-prev]");
    const nextButton = wrapper.querySelector("[data-cascading-slider-next]");

    if (!viewport) return;

    if (!viewport.hasAttribute("data-cascading-viewport")) {
      viewport.setAttribute("data-cascading-viewport", "");
    }

    const originalSlides = Array.from(
      viewport.querySelectorAll("[data-cascading-slide]:not([data-clone])"),
    );

    if (!originalSlides.length) return;

    let slides = [];
    let totalSlides = 0;
    let activeIndex = 0;
    let isAnimating = false;
    let isFiltering = false;
    let currentFilterValue = "";
    let slideWidth = 0;
    let slotCenters = {};
    let slotWidths = {};

    const DEFAULT_FILTER = "en stock";

    const normalizeValue = function (value) {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    };

    const getSlideCategory = function (slide) {
      return normalizeValue(
        slide.querySelector('[filter="category"]')
          ? slide.querySelector('[filter="category"]').textContent
          : "",
      );
    };

    function removeClones() {
      viewport.querySelectorAll("[data-clone]").forEach(function (clone) {
        if (typeof gsap !== "undefined") gsap.killTweensOf(clone);
        clone.remove();
      });
    }

    function bindSlideClicks() {
      slides.forEach(function (slide) {
        if (slide.dataset.cascadingClick === "true") return;
        slide.dataset.cascadingClick = "true";
        slide.addEventListener("click", function () {
          const index = slides.indexOf(slide);
          if (index !== -1 && index !== activeIndex) goTo(index);
        });
      });
    }

    function rebuildSlides(filterValue) {
      const matching = originalSlides.filter(function (slide) {
        return getSlideCategory(slide) === filterValue;
      });

      if (typeof gsap !== "undefined") {
        gsap.killTweensOf(originalSlides);
        gsap.killTweensOf(slides);
      }

      removeClones();
      isAnimating = false;
      activeIndex = 0;

      originalSlides.forEach(function (slide) {
        const isMatch = matching.indexOf(slide) !== -1;
        slide.style.display = isMatch ? "" : "none";
        if (!isMatch) slide.removeAttribute("data-status");
      });

      slides = matching.slice();

      if (slides.length && slides.length < 9) {
        const source = slides.slice();
        while (slides.length < 9) {
          source.forEach(function (original) {
            const clone = original.cloneNode(true);
            clone.setAttribute("data-clone", "");
            clone.style.display = "";
            viewport.appendChild(clone);
            slides.push(clone);
          });
        }
      }

      totalSlides = slides.length;
      bindSlideClicks();

      if (!totalSlides) return;

      measure();
      layout(false);
    }

    function applyCategoryFilter(filterValue, immediate) {
      if (!filterValue) return;
      if (!immediate && filterValue === currentFilterValue) return;

      const fadeEase = window.B4CARS_EASE || "expo.out";

      const reveal = function () {
        rebuildSlides(filterValue);
        currentFilterValue = filterValue;

        if (immediate || typeof gsap === "undefined" || !totalSlides) {
          if (typeof gsap !== "undefined") {
            gsap.set(viewport, { opacity: 1 });
          }
          isFiltering = false;
          return;
        }

        gsap.fromTo(
          viewport,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            ease: fadeEase,
            overwrite: true,
            onComplete: function () {
              isFiltering = false;
            },
          },
        );
      };

      if (immediate || typeof gsap === "undefined" || !slides.length) {
        reveal();
        return;
      }

      isFiltering = true;

      gsap.to(viewport, {
        opacity: 0,
        duration: 0.28,
        ease: fadeEase,
        overwrite: true,
        onComplete: reveal,
      });
    }

    function readGap() {
      const raw = getComputedStyle(viewport).getPropertyValue("--gap").trim();
      if (!raw) return 0;
      const temp = document.createElement("div");
      temp.style.width = raw;
      temp.style.position = "absolute";
      temp.style.visibility = "hidden";
      viewport.appendChild(temp);
      const px = temp.offsetWidth;
      viewport.removeChild(temp);
      return px;
    }

    function getSettings() {
      const windowWidth = window.innerWidth;
      for (let i = 0; i < breakpoints.length; i++) {
        if (windowWidth <= breakpoints[i].maxWidth) return breakpoints[i];
      }
      return breakpoints[breakpoints.length - 1];
    }

    function getOffset(slideIndex, fromIndex) {
      if (fromIndex === undefined) fromIndex = activeIndex;
      let distance = slideIndex - fromIndex;
      const half = totalSlides / 2;
      if (distance > half) distance -= totalSlides;
      if (distance < -half) distance += totalSlides;
      return distance;
    }

    function measure() {
      const settings = getSettings();
      const viewportWidth = viewport.offsetWidth;
      const gap = readGap();

      const activeSlideWidth = viewportWidth * settings.activeWidth;
      const siblingSlideWidth = viewportWidth * settings.siblingWidth;
      const farSlideWidth = Math.max(
        0,
        (viewportWidth - activeSlideWidth - 2 * siblingSlideWidth - 4 * gap) /
          2,
      );

      slideWidth = activeSlideWidth;

      const visibleSlots = [
        { slot: -2, width: farSlideWidth },
        { slot: -1, width: siblingSlideWidth },
        { slot: 0, width: activeSlideWidth },
        { slot: 1, width: siblingSlideWidth },
        { slot: 2, width: farSlideWidth },
      ];

      let x = 0;
      visibleSlots.forEach(function (def, i) {
        slotCenters[String(def.slot)] = x + def.width / 2;
        slotWidths[String(def.slot)] = def.width;
        if (i < visibleSlots.length - 1) x += def.width + gap;
      });

      slotCenters["-3"] =
        slotCenters["-2"] - farSlideWidth / 2 - gap - farSlideWidth / 2;
      slotWidths["-3"] = farSlideWidth;
      slotCenters["3"] =
        slotCenters["2"] + farSlideWidth / 2 + gap + farSlideWidth / 2;
      slotWidths["3"] = farSlideWidth;

      slides.forEach(function (slide) {
        slide.style.width = slideWidth + "px";
      });
    }

    function getSlideProps(offset) {
      const clamped = Math.max(-3, Math.min(3, offset));
      const slotWidth = slotWidths[String(clamped)];
      const clipAmount = Math.max(0, (slideWidth - slotWidth) / 2);
      const translateX = slotCenters[String(clamped)] - slideWidth / 2;

      return {
        x: translateX,
        "--clip": clipAmount,
        zIndex: 10 - Math.abs(clamped),
      };
    }

    function layout(animate, previousIndex) {
      slides.forEach(function (slide, index) {
        const offset = getOffset(index);

        if (offset < -3 || offset > 3) {
          if (animate && previousIndex !== undefined) {
            const previousOffset = getOffset(index, previousIndex);
            if (previousOffset >= -2 && previousOffset <= 2) {
              const exitSlot = previousOffset < 0 ? -3 : 3;
              gsap.to(
                slide,
                Object.assign({}, getSlideProps(exitSlot), {
                  duration: duration,
                  ease: ease,
                  overwrite: true,
                }),
              );
              return;
            }
          }

          const parkSlot = offset < 0 ? -3 : 3;
          gsap.set(slide, getSlideProps(parkSlot));
          return;
        }

        const props = getSlideProps(offset);
        slide.setAttribute("data-status", offset === 0 ? "active" : "inactive");

        if (animate) {
          gsap.to(
            slide,
            Object.assign({}, props, {
              duration: duration,
              ease: ease,
              overwrite: true,
            }),
          );
        } else {
          gsap.set(slide, props);
        }
      });
    }

    function goTo(targetIndex) {
      if (!totalSlides) return;

      const normalizedTarget =
        ((targetIndex % totalSlides) + totalSlides) % totalSlides;
      if (isAnimating || normalizedTarget === activeIndex) return;
      isAnimating = true;

      const previousIndex = activeIndex;
      const travelDirection =
        getOffset(normalizedTarget, previousIndex) > 0 ? 1 : -1;

      slides.forEach(function (slide, index) {
        const currentOffset = getOffset(index, previousIndex);
        const nextOffset = getOffset(index, normalizedTarget);
        const wasInRange = currentOffset >= -3 && currentOffset <= 3;
        const willBeVisible = nextOffset >= -2 && nextOffset <= 2;

        if (!wasInRange && willBeVisible) {
          const entrySlot = travelDirection > 0 ? 3 : -3;
          gsap.set(slide, getSlideProps(entrySlot));
        }

        const wasInvisible = Math.abs(currentOffset) >= 3;
        const willBeStaging = Math.abs(nextOffset) === 3;
        const crossesSides = currentOffset * nextOffset < 0;
        if (wasInvisible && willBeStaging && crossesSides) {
          gsap.set(slide, getSlideProps(nextOffset > 0 ? 3 : -3));
        }
      });

      activeIndex = normalizedTarget;
      layout(true, previousIndex);
      gsap.delayedCall(duration + 0.05, function () {
        isAnimating = false;
      });
    }

    if (prevButton)
      prevButton.addEventListener("click", function () {
        goTo(activeIndex - 1);
      });
    if (nextButton)
      nextButton.addEventListener("click", function () {
        goTo(activeIndex + 1);
      });

    document.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") goTo(activeIndex - 1);
      if (event.key === "ArrowRight") goTo(activeIndex + 1);
    });

    let resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!totalSlides) return;
        measure();
        layout(false);
      }, 100);
    });

    const filterScope =
      wrapper.closest(".container--1344") ||
      wrapper.closest(".section.is--home-slider") ||
      wrapper.parentElement;
    const filterItems = filterScope
      ? Array.from(filterScope.querySelectorAll(".filter--item[filter]"))
      : [];

    function updateFilterButtons(selectedItem) {
      filterItems.forEach(function (filterItem) {
        const isActive = filterItem === selectedItem;
        filterItem.classList.toggle("is--active", isActive);
        filterItem.setAttribute("aria-pressed", isActive ? "true" : "false");
        const link = filterItem.querySelector("a");
        if (link) {
          link.setAttribute("aria-current", isActive ? "true" : "false");
        }
      });
    }

    filterItems.forEach(function (filterItem) {
      const trigger = filterItem.querySelector("a") || filterItem;
      filterItem.setAttribute("role", "button");
      filterItem.setAttribute("aria-pressed", "false");

      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        const value = normalizeValue(filterItem.getAttribute("filter") || "");
        if (!value || isFiltering) return;
        updateFilterButtons(filterItem);
        applyCategoryFilter(value, false);
      });
    });

    const defaultFilterItem =
      filterItems.find(function (item) {
        return (
          normalizeValue(item.getAttribute("filter") || "") === DEFAULT_FILTER
        );
      }) || filterItems[0];

    if (defaultFilterItem) {
      updateFilterButtons(defaultFilterItem);
      applyCategoryFilter(
        normalizeValue(defaultFilterItem.getAttribute("filter") || ""),
        true,
      );
    } else {
      applyCategoryFilter(DEFAULT_FILTER, true);
    }
  }
}

// Initialize Cascading Slider
document.addEventListener("DOMContentLoaded", function () {
  initCascadingSlider();
});
