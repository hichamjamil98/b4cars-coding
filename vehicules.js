/* ==========================================================================
   B4CARS — VEHICLES HERO FEATURED SWIPER — V4
   Requires Swiper

   DESKTOP:
   current = 71.125rem
   next 1  = 4.5rem
   next 2  = 3.25rem
   next 3  = 1.5rem
   next 4  = 0.75rem
   gap     = 0.75rem

   TABLET + MOBILE:
   standard infinite Swiper
========================================================================== */

(() => {
    "use strict";
  
    const DESKTOP_BREAKPOINT = 992;
  
    /*
      Swiper expects spaceBetween as a number.
      We keep the design value in rem and convert it dynamically.
    */
    const GAP_REM = 0.75;
  
    const DESKTOP_SPEED = 1100;
    const MOBILE_SPEED = 650;
  
    const STATE_CLASSES = [
      "b4-featured-active",
      "b4-featured-next-1",
      "b4-featured-next-2",
      "b4-featured-next-3",
      "b4-featured-next-4",
      "b4-featured-hidden",
    ];
  
  
    document.addEventListener("DOMContentLoaded", () => {
      const section = document.querySelector(
        ".section.is--vehicule-hero"
      );
  
      if (!section) return;
  
  
      const swiperElement = section.querySelector(
        ".swiper.is--featured"
      );
  
      if (!swiperElement) return;
  
  
      if (typeof window.Swiper === "undefined") {
        console.warn("[B4Cars] Swiper is not loaded.");
        return;
      }
  
  
      const wrapper =
        swiperElement.closest(".swiper--wrapper") || section;
  
  
      const previousButton = wrapper.querySelector(
        ".swiper--btn.is--previous"
      );
  
  
      const nextButton = wrapper.querySelector(
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
          window
            .getComputedStyle(document.documentElement)
            .fontSize
        );
  
        return rem * (
          Number.isFinite(rootFontSize)
            ? rootFontSize
            : 16
        );
      };
  
  
      const getSpeed = () => {
        if (prefersReducedMotion()) return 0;
  
        return isDesktop()
          ? DESKTOP_SPEED
          : MOBILE_SPEED;
      };
  
  
      const clearStateClasses = (swiper) => {
        Array.from(swiper.slides).forEach((slide) => {
          STATE_CLASSES.forEach((className) => {
            slide.classList.remove(className);
          });
        });
      };
  
  
      /* ==========================================================================
         DESKTOP VISUAL ORDER
  
         active
         +1 = 4.5rem
         +2 = 3.25rem
         +3 = 1.5rem
         +4 = 0.75rem
      ========================================================================== */
  
      const applyDesktopStates = (swiper) => {
        if (!isDesktop()) {
          clearStateClasses(swiper);
          return;
        }
  
  
        const slides = Array.from(swiper.slides);
        const total = slides.length;
  
        if (!total) return;
  
  
        clearStateClasses(swiper);
  
  
        const activeIndex = swiper.activeIndex;
  
  
        slides.forEach((slide, index) => {
          const relativeIndex =
            ((index - activeIndex) % total + total) % total;
  
  
          switch (relativeIndex) {
  
            case 0:
              slide.classList.add(
                "b4-featured-active"
              );
              break;
  
  
            case 1:
              slide.classList.add(
                "b4-featured-next-1"
              );
              break;
  
  
            case 2:
              slide.classList.add(
                "b4-featured-next-2"
              );
              break;
  
  
            case 3:
              slide.classList.add(
                "b4-featured-next-3"
              );
              break;
  
  
            case 4:
              slide.classList.add(
                "b4-featured-next-4"
              );
              break;
  
  
            default:
              slide.classList.add(
                "b4-featured-hidden"
              );
              break;
          }
        });
  
  
        /*
          CSS changes the slide widths.
          Swiper needs its geometry refreshed immediately after.
        */
        requestAnimationFrame(() => {
          swiper.updateSlides();
          swiper.updateProgress();
          swiper.updateSlidesClasses();
        });
      };
  
  
      /* ==========================================================================
         MODE
      ========================================================================== */
  
      const updateMode = (swiper) => {
        swiper.params.speed = getSpeed();
  
        swiper.params.spaceBetween =
          remToPx(GAP_REM);
  
  
        if (isDesktop()) {
  
          swiper.params.slidesPerView = "auto";
          swiper.params.slidesPerGroup = 1;
          swiper.params.grabCursor = true;
  
          applyDesktopStates(swiper);
  
        } else {
  
          swiper.params.slidesPerView = 1;
          swiper.params.slidesPerGroup = 1;
          swiper.params.grabCursor = false;
  
          clearStateClasses(swiper);
        }
  
  
        requestAnimationFrame(() => {
          swiper.update();
        });
      };
  
  
      /* ==========================================================================
         REMOVE AN OLD INSTANCE IF ONE EXISTS
      ========================================================================== */
  
      if (
        swiperElement.swiper &&
        typeof swiperElement.swiper.destroy === "function"
      ) {
        swiperElement.swiper.destroy(true, true);
      }
  
  
      /* ==========================================================================
         SWIPER
      ========================================================================== */
  
      const swiper = new window.Swiper(
        swiperElement,
        {
          loop: true,
  
          speed: getSpeed(),
  
          slidesPerView:
            isDesktop()
              ? "auto"
              : 1,
  
          slidesPerGroup: 1,
  
          spaceBetween:
            remToPx(GAP_REM),
  
          allowTouchMove: true,
          simulateTouch: true,
  
          threshold: 5,
          resistanceRatio: 0.72,
  
          watchSlidesProgress: true,
  
          observer: true,
          observeParents: true,
          resizeObserver: true,
  
          grabCursor: isDesktop(),
  
          navigation: {
            prevEl: previousButton,
            nextEl: nextButton,
          },
  
  
          on: {
  
            init(instance) {
              if (isDesktop()) {
                applyDesktopStates(instance);
              } else {
                clearStateClasses(instance);
              }
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
              updateMode(instance);
            },
          },
        }
      );
  
  
      /* ==========================================================================
         DESKTOP — CLICK A PREVIEW TO MAKE IT CURRENT
      ========================================================================== */
  
      swiperElement.addEventListener(
        "click",
        (event) => {
  
          if (!isDesktop()) return;
  
  
          const slide = event.target.closest(
            ".swiper-slide.is--featured"
          );
  
  
          if (!slide) return;
  
  
          const slides = Array.from(swiper.slides);
  
          const clickedIndex =
            slides.indexOf(slide);
  
  
          if (clickedIndex < 0) return;
  
          if (
            clickedIndex ===
            swiper.activeIndex
          ) {
            return;
          }
  
  
          swiper.slideTo(
            clickedIndex,
            getSpeed()
          );
        }
      );
  
  
      /* ==========================================================================
         BREAKPOINT CHANGE
      ========================================================================== */
  
      const onBreakpointChange = () => {
        updateMode(swiper);
      };
  
  
      if (
        typeof desktopMedia.addEventListener ===
        "function"
      ) {
        desktopMedia.addEventListener(
          "change",
          onBreakpointChange
        );
      } else {
        desktopMedia.addListener(
          onBreakpointChange
        );
      }
  
  
      /* ==========================================================================
         FINAL REFRESH
      ========================================================================== */
  
      window.addEventListener(
        "load",
        () => {
  
          requestAnimationFrame(() => {
  
            updateMode(swiper);
  
            requestAnimationFrame(() => {
              swiper.update();
            });
  
          });
        }
      );
    });
  })();