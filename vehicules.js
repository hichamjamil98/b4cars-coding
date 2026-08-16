/* ==========================================================================
   B4CARS — VEHICLES HERO — V5

   DESKTOP >= 992px
   ------------------------------------------------
   We do NOT use Swiper movement on desktop.

   The five CMS cards stay physically in place.
   Next / Previous only rotate the visual state:

   current
   +1 = 4.5rem
   +2 = 3.25rem
   +3 = 1.5rem
   +4 = 0.75rem

   This makes the accordion animation stable and truly infinite.

   TABLET + MOBILE <= 991px
   ------------------------------------------------
   A normal Swiper instance is created:
   - loop: true
   - 1 slide per view
   - normal touch/swipe
========================================================================== */

(() => {
    "use strict";
  
    const DESKTOP_BREAKPOINT = 992;
    const GAP_REM = 0.75;
    const MOBILE_SPEED = 650;
  
    const STATE_CLASSES = [
      "b4-featured-active",
      "b4-featured-next-1",
      "b4-featured-next-2",
      "b4-featured-next-3",
      "b4-featured-next-4",
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
  
  
      const wrapper = swiperElement.querySelector(
        ".swiper-wrapper.is--featured"
      );
  
      if (!wrapper) return;
  
  
      const previousButton = section.querySelector(
        ".swiper--btn.is--previous"
      );
  
      const nextButton = section.querySelector(
        ".swiper--btn.is--next"
      );
  
  
      const desktopMedia = window.matchMedia(
        `(min-width: ${DESKTOP_BREAKPOINT}px)`
      );
  
  
      let mobileSwiper = null;
      let currentIndex = 0;
      let isAnimating = false;
  
  
      /* ==========================================================================
         HELPERS
      ========================================================================== */
  
      const isDesktop = () =>
        desktopMedia.matches;
  
  
      const getSlides = () =>
        Array.from(
          wrapper.querySelectorAll(
            ":scope > .swiper-slide.is--featured"
          )
        );
  
  
      const mod = (value, total) =>
        ((value % total) + total) % total;
  
  
      const remToPx = (rem) => {
  
        const rootSize = parseFloat(
          getComputedStyle(
            document.documentElement
          ).fontSize
        );
  
        return rem * (
          Number.isFinite(rootSize)
            ? rootSize
            : 16
        );
      };
  
  
      const clearStates = () => {
  
        getSlides().forEach((slide) => {
  
          STATE_CLASSES.forEach(
            (className) => {
              slide.classList.remove(
                className
              );
            }
          );
  
        });
      };
  
  
      /* ==========================================================================
         DESKTOP STATE ENGINE
      ========================================================================== */
  
      const applyDesktopState = (
        animate = true
      ) => {
  
        const slides = getSlides();
        const total = slides.length;
  
        if (!total) return;
  
  
        currentIndex = mod(
          currentIndex,
          total
        );
  
  
        clearStates();
  
  
        slides.forEach(
          (slide, index) => {
  
            const relative =
              mod(
                index - currentIndex,
                total
              );
  
  
            switch (relative) {
  
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
            }
  
          }
        );
  
  
        /*
          Prevent multiple rapid clicks from breaking
          the width transition.
        */
        if (animate) {
  
          isAnimating = true;
  
          window.setTimeout(() => {
            isAnimating = false;
          }, 1080);
  
        }
  
      };
  
  
      const goNextDesktop = () => {
  
        if (
          !isDesktop() ||
          isAnimating
        ) {
          return;
        }
  
        currentIndex += 1;
  
        applyDesktopState(true);
      };
  
  
      const goPreviousDesktop = () => {
  
        if (
          !isDesktop() ||
          isAnimating
        ) {
          return;
        }
  
        currentIndex -= 1;
  
        applyDesktopState(true);
      };
  
  
      /* ==========================================================================
         DESKTOP MODE
      ========================================================================== */
  
      const enableDesktop = () => {
  
        /*
          If the mobile Swiper exists,
          return the original CMS DOM to its clean state.
        */
        if (
          mobileSwiper &&
          typeof mobileSwiper.destroy ===
            "function"
        ) {
  
          currentIndex =
            mobileSwiper.realIndex || 0;
  
          mobileSwiper.destroy(
            true,
            true
          );
  
          mobileSwiper = null;
        }
  
  
        /*
          Swiper may leave inline transforms / margins.
          Remove only Swiper-generated movement properties.
        */
        wrapper.style.removeProperty(
          "transform"
        );
  
        wrapper.style.removeProperty(
          "transition-duration"
        );
  
        wrapper.style.removeProperty(
          "transition-delay"
        );
  
  
        getSlides().forEach(
          (slide) => {
  
            slide.style.removeProperty(
              "margin-right"
            );
  
            slide.style.removeProperty(
              "width"
            );
  
            slide.style.removeProperty(
              "transform"
            );
  
          }
        );
  
  
        applyDesktopState(false);
      };
  
  
      /* ==========================================================================
         MOBILE / TABLET SWIPER
      ========================================================================== */
  
      const enableMobile = () => {
  
        clearStates();
  
  
        if (mobileSwiper) return;
  
  
        if (
          typeof window.Swiper ===
          "undefined"
        ) {
  
          console.warn(
            "[B4Cars] Swiper is not loaded."
          );
  
          return;
        }
  
  
        mobileSwiper =
          new window.Swiper(
            swiperElement,
            {
              loop: true,
  
              initialSlide:
                mod(
                  currentIndex,
                  getSlides().length
                ),
  
              slidesPerView: 1,
              slidesPerGroup: 1,
  
              spaceBetween:
                remToPx(GAP_REM),
  
              speed:
                MOBILE_SPEED,
  
              allowTouchMove: true,
              simulateTouch: true,
  
              threshold: 5,
              resistanceRatio: 0.72,
  
              observer: true,
              observeParents: true,
              resizeObserver: true,
  
              navigation: {
                prevEl:
                  previousButton,
                nextEl:
                  nextButton,
              },
  
              on: {
  
                slideChange(instance) {
  
                  currentIndex =
                    instance.realIndex;
  
                },
  
              },
            }
          );
      };
  
  
      /* ==========================================================================
         DESKTOP NAVIGATION
         We own these clicks on desktop.
      ========================================================================== */
  
      if (nextButton) {
  
        nextButton.addEventListener(
          "click",
          (event) => {
  
            if (!isDesktop()) return;
  
            event.preventDefault();
            event.stopPropagation();
  
            goNextDesktop();
          },
          true
        );
  
      }
  
  
      if (previousButton) {
  
        previousButton.addEventListener(
          "click",
          (event) => {
  
            if (!isDesktop()) return;
  
            event.preventDefault();
            event.stopPropagation();
  
            goPreviousDesktop();
          },
          true
        );
  
      }
  
  
      /* ==========================================================================
         CLICK A PREVIEW ON DESKTOP
      ========================================================================== */
  
      wrapper.addEventListener(
        "click",
        (event) => {
  
          if (
            !isDesktop() ||
            isAnimating
          ) {
            return;
          }
  
  
          const slide =
            event.target.closest(
              ".swiper-slide.is--featured"
            );
  
  
          if (!slide) return;
  
  
          const slides = getSlides();
  
          const index =
            slides.indexOf(slide);
  
  
          if (
            index < 0 ||
            index === currentIndex
          ) {
            return;
          }
  
  
          currentIndex = index;
  
          applyDesktopState(true);
        }
      );
  
  
      /* ==========================================================================
         MODE SWITCH
      ========================================================================== */
  
      const updateMode = () => {
  
        if (isDesktop()) {
          enableDesktop();
        } else {
          enableMobile();
        }
  
      };
  
  
      if (
        typeof desktopMedia.addEventListener ===
        "function"
      ) {
  
        desktopMedia.addEventListener(
          "change",
          updateMode
        );
  
      } else {
  
        desktopMedia.addListener(
          updateMode
        );
  
      }
  
  
      /* ==========================================================================
         START
      ========================================================================== */
  
      updateMode();
  
    });
  
  })();