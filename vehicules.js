/* ==========================================================================
   B4CARS — VEHICLES HERO — V8 COMPLETE

   DESKTOP
   ==========================================================================
   The visual row always contains 5 states:

   [ ACTIVE ][ 72 ][ 52 ][ 24 ][ 12 ]

   NEXT:
   - ACTIVE collapses/disappears to the LEFT.
   - The wrapper itself DOES NOT translate.
   - Slide 2 becomes ACTIVE.
   - Slide 3 becomes 72.
   - Slide 4 becomes 52.
   - Slide 5 becomes 24.
   - After the animation, the outgoing slide is moved to the end and becomes 12.

   PREVIOUS:
   - The last preview is prepared on the LEFT.
   - It becomes ACTIVE.
   - The previous ACTIVE becomes 72.
   - Everything shifts one position to the right.

   TABLET / MOBILE
   ==========================================================================
   Normal Swiper with loop: true and 1 slide per view.
========================================================================== */

(() => {
    "use strict";
  
    const DESKTOP_BREAKPOINT = 992;
    const MOBILE_SPEED = 650;
    const GAP_REM = 0.75;
  
    const STATE_CLASSES = [
      "b4-featured-active",
      "b4-featured-next-1",
      "b4-featured-next-2",
      "b4-featured-next-3",
      "b4-featured-next-4",
      "b4-featured-outgoing",
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
  
  
      const getGapPx = () =>
        remToPx(GAP_REM);
  
  
      const clearClasses = (slide) => {
  
        STATE_CLASSES.forEach(
          (className) => {
            slide.classList.remove(
              className
            );
          }
        );
      };
  
  
      const clearAllClasses = () => {
  
        getSlides().forEach(
          (slide) => clearClasses(slide)
        );
      };
  
  
      /*
        The DOM order itself represents the visual order on desktop:
        index 0 = active
        index 1 = 72
        index 2 = 52
        index 3 = 24
        index 4 = 12
      */
      const applyClassesFromDomOrder = () => {
  
        const slides = getSlides();
  
        clearAllClasses();
  
  
        slides.forEach(
          (slide, index) => {
  
            switch (index) {
  
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
      };
  
  
      const forceReflow = () =>
        wrapper.getBoundingClientRect();
  
  
      const getDurationMs = () => {
  
        const raw = getComputedStyle(section)
          .getPropertyValue(
            "--featured-duration"
          )
          .trim();
  
        if (raw.endsWith("ms")) {
          return parseFloat(raw) || 1050;
        }
  
        if (raw.endsWith("s")) {
          return (parseFloat(raw) || 1.05) * 1000;
        }
  
        return 1050;
      };
  
  
      /* ==========================================================================
         NEXT — FIXED
  
         IMPORTANT:
         The complete wrapper no longer translates left.
         Only the outgoing active slide collapses and exits.
      ========================================================================== */
  
      const goNextDesktop = () => {
  
        if (
          !isDesktop() ||
          isAnimating
        ) {
          return;
        }
  
  
        const slides = getSlides();
  
        if (slides.length < 2) return;
  
  
        isAnimating = true;
  
  
        const outgoing = slides[0];
  
  
        /*
          Target states:
  
          old active -> outgoing / width 0
          old #2     -> active
          old #3     -> 72
          old #4     -> 52
          old #5     -> 24
  
          The old active will only become the new 12 strip
          AFTER its exit animation is complete.
        */
  
        clearClasses(outgoing);
        outgoing.classList.add(
          "b4-featured-outgoing"
        );
  
  
        if (slides[1]) {
          clearClasses(slides[1]);
          slides[1].classList.add(
            "b4-featured-active"
          );
        }
  
  
        if (slides[2]) {
          clearClasses(slides[2]);
          slides[2].classList.add(
            "b4-featured-next-1"
          );
        }
  
  
        if (slides[3]) {
          clearClasses(slides[3]);
          slides[3].classList.add(
            "b4-featured-next-2"
          );
        }
  
  
        if (slides[4]) {
          clearClasses(slides[4]);
          slides[4].classList.add(
            "b4-featured-next-3"
          );
        }
  
  
        /*
          No wrapper transform here.
          Flex layout + width transitions do all the movement.
        */
        window.setTimeout(() => {
  
          /*
            Recycle the outgoing slide at the far right.
            We disable transitions only for this invisible DOM reorder.
          */
          wrapper.classList.add(
            "is-no-transition"
          );
  
  
          wrapper.appendChild(
            outgoing
          );
  
  
          /*
            Restore the exact canonical order:
            active / 72 / 52 / 24 / 12
          */
          applyClassesFromDomOrder();
  
  
          /*
            Ensure Swiper-generated desktop inline values do not come back.
          */
          wrapper.style.transform =
            "translate3d(0, 0, 0)";
  
  
          getSlides().forEach(
            (slide) => {
  
              slide.style.removeProperty(
                "width"
              );
  
              slide.style.removeProperty(
                "margin-right"
              );
  
              slide.style.removeProperty(
                "transform"
              );
  
            }
          );
  
  
          forceReflow();
  
  
          requestAnimationFrame(() => {
  
            wrapper.classList.remove(
              "is-no-transition"
            );
  
            isAnimating = false;
  
          });
  
        }, getDurationMs() + 30);
      };
  
  
      /* ==========================================================================
         PREVIOUS — LAST CARD ENTERS FROM LEFT
      ========================================================================== */
  
      const goPreviousDesktop = () => {
  
        if (
          !isDesktop() ||
          isAnimating
        ) {
          return;
        }
  
  
        const slides = getSlides();
  
        if (slides.length < 2) return;
  
  
        isAnimating = true;
  
  
        const incoming =
          slides[slides.length - 1];
  
  
        /*
          First put the last 12-strip at the beginning with transitions disabled.
        */
        wrapper.classList.add(
          "is-no-transition"
        );
  
  
        wrapper.insertBefore(
          incoming,
          wrapper.firstElementChild
        );
  
  
        applyClassesFromDomOrder();
  
  
        /*
          Because the new first slide is already ACTIVE width,
          offset the row by exactly that width + gap.
          Visually the user still sees the old composition.
        */
        const incomingWidth =
          incoming.getBoundingClientRect().width;
  
  
        const moveDistance =
          incomingWidth + getGapPx();
  
  
        wrapper.style.transform =
          `translate3d(-${moveDistance}px, 0, 0)`;
  
  
        forceReflow();
  
  
        requestAnimationFrame(() => {
  
          wrapper.classList.remove(
            "is-no-transition"
          );
  
  
          requestAnimationFrame(() => {
  
            /*
              Animate the new active from the left into its normal position.
            */
            wrapper.style.transform =
              "translate3d(0, 0, 0)";
  
          });
  
        });
  
  
        window.setTimeout(() => {
  
          wrapper.style.transform =
            "translate3d(0, 0, 0)";
  
          applyClassesFromDomOrder();
  
          isAnimating = false;
  
        }, getDurationMs() + 30);
      };
  
  
      /* ==========================================================================
         DESKTOP MODE
      ========================================================================== */
  
      const destroyMobileSwiper = () => {
  
        if (
          mobileSwiper &&
          typeof mobileSwiper.destroy ===
            "function"
        ) {
  
          mobileSwiper.destroy(
            true,
            true
          );
  
          mobileSwiper = null;
        }
      };
  
  
      const enableDesktop = () => {
  
        destroyMobileSwiper();
  
  
        /*
          A Swiper instance from tablet/mobile can leave inline properties.
          Clean only Swiper movement/size properties.
        */
        wrapper.classList.add(
          "is-no-transition"
        );
  
  
        wrapper.style.transform =
          "translate3d(0, 0, 0)";
  
        wrapper.style.removeProperty(
          "transition-duration"
        );
  
        wrapper.style.removeProperty(
          "transition-delay"
        );
  
  
        getSlides().forEach(
          (slide) => {
  
            slide.style.removeProperty(
              "width"
            );
  
            slide.style.removeProperty(
              "margin-right"
            );
  
            slide.style.removeProperty(
              "transform"
            );
  
            slide.style.removeProperty(
              "opacity"
            );
  
          }
        );
  
  
        applyClassesFromDomOrder();
  
  
        forceReflow();
  
  
        requestAnimationFrame(() => {
  
          wrapper.classList.remove(
            "is-no-transition"
          );
  
        });
      };
  
  
      /* ==========================================================================
         TABLET / MOBILE SWIPER
      ========================================================================== */
  
      const enableMobile = () => {
  
        if (mobileSwiper) return;
  
  
        clearAllClasses();
  
  
        wrapper.classList.add(
          "is-no-transition"
        );
  
  
        wrapper.style.removeProperty(
          "transform"
        );
  
  
        getSlides().forEach(
          (slide) => {
  
            slide.style.removeProperty(
              "width"
            );
  
            slide.style.removeProperty(
              "margin-right"
            );
  
            slide.style.removeProperty(
              "transform"
            );
  
            slide.style.removeProperty(
              "opacity"
            );
  
          }
        );
  
  
        forceReflow();
  
  
        wrapper.classList.remove(
          "is-no-transition"
        );
  
  
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
  
              slidesPerView: 1,
              slidesPerGroup: 1,
  
              spaceBetween:
                getGapPx(),
  
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
            }
          );
      };
  
  
      /* ==========================================================================
         NAVIGATION
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
         CLICK A PREVIEW
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
  
  
          if (index <= 0) return;
  
  
          /*
            Preview #1 = one NEXT.
            Preview #2 = two NEXT rotations.
            Preview #3 = three NEXT rotations.
            Preview #4 = four NEXT rotations.
          */
          let remaining = index;
  
  
          const run = () => {
  
            if (remaining <= 0) return;
  
  
            goNextDesktop();
  
  
            remaining -= 1;
  
  
            if (remaining > 0) {
  
              window.setTimeout(
                run,
                getDurationMs() + 70
              );
  
            }
          };
  
  
          run();
        }
      );
  
  
      /* ==========================================================================
         BREAKPOINT
      ========================================================================== */
  
      const updateMode = () => {
  
        isAnimating = false;
  
  
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
         RESIZE SAFETY
      ========================================================================== */
  
      let resizeTimer = null;
  
  
      window.addEventListener(
        "resize",
        () => {
  
          window.clearTimeout(
            resizeTimer
          );
  
  
          resizeTimer =
            window.setTimeout(
              () => {
  
                if (isDesktop()) {
  
                  wrapper.style.transform =
                    "translate3d(0, 0, 0)";
  
                  applyClassesFromDomOrder();
  
                } else if (mobileSwiper) {
  
                  mobileSwiper.params.spaceBetween =
                    getGapPx();
  
                  mobileSwiper.update();
  
                }
  
              },
              120
            );
  
        }
      );
  
  
      /* ==========================================================================
         INIT
      ========================================================================== */
  
      updateMode();
  
    });
  
  })();