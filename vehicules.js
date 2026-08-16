/* ==========================================================================
   B4CARS — VEHICLES HERO FEATURED SWIPER — V3
   Requires Swiper
========================================================================== */

(() => {
    "use strict";
  
    const DESKTOP_BREAKPOINT = 992;
  
    /*
      Design gap = 0.75rem.
      Swiper requires a numeric value, so we convert 0.75rem to pixels
      dynamically from the current root font-size.
    */
    const GAP_REM = 0.75;
  
    const DESKTOP_SPEED = 1150;
    const MOBILE_SPEED = 700;
  
    const VISUAL_CLASSES = [
      "b4-featured-active",
      "b4-featured-next-1",
      "b4-featured-next-2",
      "b4-featured-next-3",
      "b4-featured-next-4",
      "b4-featured-hidden",
    ];
  
    document.addEventListener("DOMContentLoaded", () => {
      const section = document.querySelector(".section.is--vehicule-hero");
      if (!section) return;
  
      const swiperElement = section.querySelector(".swiper.is--featured");
      if (!swiperElement) return;
  
      const swiperWrapper = swiperElement.querySelector(
        ".swiper-wrapper.is--featured"
      );
  
      if (!swiperWrapper) return;
  
      const originalSlides = Array.from(
        swiperWrapper.children
      ).filter((element) =>
        element.classList.contains("swiper-slide")
      );
  
      if (!originalSlides.length) return;
  
      if (typeof window.Swiper === "undefined") {
        console.warn("[B4Cars] Swiper is not loaded.");
        return;
      }
  
      const outerWrapper =
        swiperElement.closest(".swiper--wrapper") || section;
  
      const previousButton = outerWrapper.querySelector(
        ".swiper--btn.is--previous"
      );
  
      const nextButton = outerWrapper.querySelector(
        ".swiper--btn.is--next"
      );
  
      const desktopMedia = window.matchMedia(
        `(min-width: ${DESKTOP_BREAKPOINT}px)`
      );
  
      const reducedMotionMedia = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );
  
  
      /* ==========================================================================
         HELPERS
      ========================================================================== */
  
      const isDesktop = () => desktopMedia.matches;
  
      const prefersReducedMotion = () =>
        reducedMotionMedia.matches;
  
      const remToPx = (rem) => {
        const rootFontSize = parseFloat(
          window.getComputedStyle(document.documentElement).fontSize
        );
  
        return rem * (Number.isFinite(rootFontSize) ? rootFontSize : 16);
      };
  
      const getSpeed = () => {
        if (prefersReducedMotion()) return 0;
        return isDesktop() ? DESKTOP_SPEED : MOBILE_SPEED;
      };
  
      const clearVisualClasses = (swiper) => {
        Array.from(swiper.slides).forEach((slide) => {
          VISUAL_CLASSES.forEach((className) => {
            slide.classList.remove(className);
          });
  
          slide.removeAttribute("tabindex");
        });
      };
  
  
      /*
        This version deliberately uses the current DOM order around activeIndex.
  
        It does NOT depend on data-swiper-slide-index or realIndex to determine
        which strip is first, second, third or fourth.
  
        That makes it much safer with Webflow CMS + Swiper loop.
      */
      const applyDesktopStates = (swiper) => {
        if (!isDesktop()) {
          clearVisualClasses(swiper);
          return;
        }
  
        const slides = Array.from(swiper.slides);
        const total = slides.length;
  
        if (!total) return;
  
        clearVisualClasses(swiper);
  
        const activeIndex = swiper.activeIndex;
  
        slides.forEach((slide, index) => {
          const relativeIndex =
            ((index - activeIndex) % total + total) % total;
  
          if (relativeIndex === 0) {
            slide.classList.add("b4-featured-active");
          } else if (relativeIndex === 1) {
            slide.classList.add("b4-featured-next-1");
          } else if (relativeIndex === 2) {
            slide.classList.add("b4-featured-next-2");
          } else if (relativeIndex === 3) {
            slide.classList.add("b4-featured-next-3");
          } else if (relativeIndex === 4) {
            slide.classList.add("b4-featured-next-4");
          } else {
            slide.classList.add("b4-featured-hidden");
          }
  
          slide.setAttribute("tabindex", "0");
        });
  
        /*
          Widths are changed by CSS.
          Update Swiper geometry just after the browser has applied them.
        */
        requestAnimationFrame(() => {
          swiper.updateSlides();
          swiper.updateProgress();
          swiper.updateSlidesClasses();
        });
      };
  
  
      const setMode = (swiper) => {
        swiper.params.speed = getSpeed();
        swiper.params.spaceBetween = remToPx(GAP_REM);
  
        if (isDesktop()) {
          swiper.params.slidesPerView = "auto";
          swiper.params.grabCursor = true;
          applyDesktopStates(swiper);
        } else {
          swiper.params.slidesPerView = 1;
          swiper.params.grabCursor = false;
          clearVisualClasses(swiper);
        }
  
        requestAnimationFrame(() => {
          swiper.update();
        });
      };
  
  
      /* ==========================================================================
         PROTECT AGAINST A PREVIOUS SWIPER INITIALIZATION
      ========================================================================== */
  
      if (
        swiperElement.swiper &&
        typeof swiperElement.swiper.destroy === "function"
      ) {
        swiperElement.swiper.destroy(true, true);
      }
  
  
      /* ==========================================================================
         SWIPER INITIALIZATION
      ========================================================================== */
  
      const swiper = new window.Swiper(swiperElement, {
        loop: true,
  
        speed: getSpeed(),
  
        spaceBetween: remToPx(GAP_REM),
  
        slidesPerView: isDesktop() ? "auto" : 1,
        slidesPerGroup: 1,
  
        allowTouchMove: true,
        simulateTouch: true,
  
        watchSlidesProgress: true,
        observer: true,
        observeParents: true,
        resizeObserver: true,
  
        threshold: 5,
        resistanceRatio: 0.72,
  
        grabCursor: isDesktop(),
  
        loopAdditionalSlides: 4,
  
        navigation: {
          prevEl: previousButton,
          nextEl: nextButton,
        },
  
        on: {
          init(instance) {
            if (isDesktop()) {
              applyDesktopStates(instance);
            } else {
              clearVisualClasses(instance);
            }
  
            requestAnimationFrame(() => {
              instance.update();
            });
          },
  
          slideChangeTransitionStart(instance) {
            if (isDesktop()) {
              applyDesktopStates(instance);
            }
          },
  
          slideChange(instance) {
            if (isDesktop()) {
              applyDesktopStates(instance);
            }
          },
  
          transitionEnd(instance) {
            if (isDesktop()) {
              applyDesktopStates(instance);
            }
          },
  
          resize(instance) {
            setMode(instance);
          },
        },
      });
  
  
      /* ==========================================================================
         DESKTOP — CLICK A PREVIEW STRIP TO OPEN IT
      ========================================================================== */
  
      swiperElement.addEventListener("click", (event) => {
        if (!isDesktop()) return;
  
        const clickedSlide = event.target.closest(
          ".swiper-slide.is--featured"
        );
  
        if (!clickedSlide) return;
  
        const slides = Array.from(swiper.slides);
        const clickedIndex = slides.indexOf(clickedSlide);
  
        if (clickedIndex < 0) return;
        if (clickedIndex === swiper.activeIndex) return;
  
        swiper.slideTo(
          clickedIndex,
          getSpeed()
        );
      });
  
  
      /* ==========================================================================
         DESKTOP — KEYBOARD
      ========================================================================== */
  
      swiperElement.addEventListener("keydown", (event) => {
        if (!isDesktop()) return;
        if (event.key !== "Enter" && event.key !== " ") return;
  
        const selectedSlide = event.target.closest(
          ".swiper-slide.is--featured"
        );
  
        if (!selectedSlide) return;
  
        const slides = Array.from(swiper.slides);
        const selectedIndex = slides.indexOf(selectedSlide);
  
        if (selectedIndex < 0) return;
        if (selectedIndex === swiper.activeIndex) return;
  
        event.preventDefault();
  
        swiper.slideTo(
          selectedIndex,
          getSpeed()
        );
      });
  
  
      /* ==========================================================================
         BREAKPOINT CHANGE
      ========================================================================== */
  
      const handleBreakpointChange = () => {
        setMode(swiper);
      };
  
      if (typeof desktopMedia.addEventListener === "function") {
        desktopMedia.addEventListener(
          "change",
          handleBreakpointChange
        );
      } else {
        desktopMedia.addListener(handleBreakpointChange);
      }
  
  
      /* ==========================================================================
         FINAL REFRESH AFTER IMAGES / FONTS
      ========================================================================== */
  
      window.addEventListener("load", () => {
        requestAnimationFrame(() => {
          setMode(swiper);
  
          requestAnimationFrame(() => {
            swiper.update();
          });
        });
      });
    });
  })();