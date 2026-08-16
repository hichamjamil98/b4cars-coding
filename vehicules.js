/* ==========================================================================
   B4CARS — VEHICLES HERO — V9 COMPLETE / NO JUMP

   WHY THIS VERSION IS DIFFERENT
   ==========================================================================
   Desktop no longer reorders the DOM while the user is watching it.
   It also no longer translates the complete row.

   Every visible role has a fixed absolute position:

   [ ACTIVE ][ 72 ][ 52 ][ 24 ][ 12 ]

   NEXT
   --------------------------------------------------------------------------
   - old ACTIVE exits only to the left
   - next 1 expands directly into ACTIVE
   - next 2 -> 72
   - next 3 -> 52
   - next 4 -> 24
   - old ACTIVE is silently recycled to 12 after the animation

   PREVIOUS
   --------------------------------------------------------------------------
   - a temporary visual clone of the last 12-strip enters from the left
   - current ACTIVE -> 72
   - 72 -> 52
   - 52 -> 24
   - 24 -> 12
   - when the animation ends, the real last slide takes the active role
     underneath the clone, then the clone is removed

   Result:
   - no complete block sliding left
   - no return jump
   - no visible DOM reorder
   - faster animation

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
      "b4-featured-outgoing-left",
      "b4-featured-under-ghost",
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
      let currentIndex = 0;
      let ghost = null;
  
  
      /* ==========================================================================
         HELPERS
      ========================================================================== */
  
      const isDesktop = () =>
        desktopMedia.matches;
  
  
      const getRealSlides = () =>
        Array.from(
          wrapper.querySelectorAll(
            ":scope > .swiper-slide.is--featured:not(.b4-featured-ghost)"
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
  
  
      const getGapPx = () =>
        remToPx(GAP_REM);
  
  
      const clearSlideStates = (slide) => {
  
        STATE_CLASSES.forEach(
          (className) => {
            slide.classList.remove(
              className
            );
          }
        );
      };
  
  
      const clearAllStates = () => {
  
        getRealSlides().forEach(
          clearSlideStates
        );
      };
  
  
      const getDurationMs = () => {
  
        const raw = getComputedStyle(section)
          .getPropertyValue(
            "--featured-duration"
          )
          .trim();
  
        if (raw.endsWith("ms")) {
          return parseFloat(raw) || 720;
        }
  
        if (raw.endsWith("s")) {
          return (parseFloat(raw) || 0.72) * 1000;
        }
  
        return 720;
      };
  
  
      const forceReflow = () =>
        wrapper.getBoundingClientRect();
  
  
      const removeGhost = () => {
  
        if (!ghost) return;
  
        ghost.remove();
        ghost = null;
      };
  
  
      /*
        Assign the canonical 5 roles from the logical currentIndex.
        DOM order is irrelevant on desktop.
      */
      const applyCanonicalStates = () => {
  
        const slides = getRealSlides();
        const total = slides.length;
  
        if (!total) return;
  
  
        clearAllStates();
  
  
        const activeIndex =
          mod(currentIndex, total);
  
  
        const active =
          slides[activeIndex];
  
        const next1 =
          slides[mod(activeIndex + 1, total)];
  
        const next2 =
          slides[mod(activeIndex + 2, total)];
  
        const next3 =
          slides[mod(activeIndex + 3, total)];
  
        const next4 =
          slides[mod(activeIndex + 4, total)];
  
  
        active?.classList.add(
          "b4-featured-active"
        );
  
        next1?.classList.add(
          "b4-featured-next-1"
        );
  
        next2?.classList.add(
          "b4-featured-next-2"
        );
  
        next3?.classList.add(
          "b4-featured-next-3"
        );
  
        next4?.classList.add(
          "b4-featured-next-4"
        );
      };
  
  
      /* ==========================================================================
         NEXT
      ========================================================================== */
  
      const goNextDesktop = () => {
  
        if (
          !isDesktop() ||
          isAnimating
        ) {
          return;
        }
  
  
        const slides = getRealSlides();
        const total = slides.length;
  
        if (total < 2) return;
  
  
        isAnimating = true;
        removeGhost();
  
  
        const oldIndex =
          mod(currentIndex, total);
  
        const newIndex =
          mod(oldIndex + 1, total);
  
  
        const outgoing =
          slides[oldIndex];
  
        const newActive =
          slides[newIndex];
  
        const newNext1 =
          slides[mod(newIndex + 1, total)];
  
        const newNext2 =
          slides[mod(newIndex + 2, total)];
  
        const newNext3 =
          slides[mod(newIndex + 3, total)];
  
  
        /*
          Old current exits LEFT.
        */
        clearSlideStates(outgoing);
  
        outgoing.classList.add(
          "b4-featured-outgoing-left"
        );
  
  
        /*
          Remaining visible slides animate directly
          toward their new fixed positions.
        */
        clearSlideStates(newActive);
  
        newActive.classList.add(
          "b4-featured-active"
        );
  
  
        clearSlideStates(newNext1);
  
        newNext1.classList.add(
          "b4-featured-next-1"
        );
  
  
        clearSlideStates(newNext2);
  
        newNext2.classList.add(
          "b4-featured-next-2"
        );
  
  
        clearSlideStates(newNext3);
  
        newNext3.classList.add(
          "b4-featured-next-3"
        );
  
  
        window.setTimeout(
          () => {
  
            /*
              The outgoing slide is already invisible off-left.
              Move it instantly to the new 12-strip role.
            */
            outgoing.classList.add(
              "is-no-transition"
            );
  
  
            clearSlideStates(
              outgoing
            );
  
  
            outgoing.classList.add(
              "b4-featured-next-4"
            );
  
  
            forceReflow();
  
  
            requestAnimationFrame(
              () => {
  
                outgoing.classList.remove(
                  "is-no-transition"
                );
  
  
                currentIndex =
                  newIndex;
  
  
                applyCanonicalStates();
  
  
                isAnimating =
                  false;
  
              }
            );
  
          },
          getDurationMs() + 20
        );
      };
  
  
      /* ==========================================================================
         PREVIOUS
      ========================================================================== */
  
      const goPreviousDesktop = () => {
  
        if (
          !isDesktop() ||
          isAnimating
        ) {
          return;
        }
  
  
        const slides = getRealSlides();
        const total = slides.length;
  
        if (total < 2) return;
  
  
        isAnimating = true;
        removeGhost();
  
  
        const oldIndex =
          mod(currentIndex, total);
  
        const newIndex =
          mod(oldIndex - 1, total);
  
  
        const incomingReal =
          slides[newIndex];
  
        const oldActive =
          slides[oldIndex];
  
        const oldNext1 =
          slides[mod(oldIndex + 1, total)];
  
        const oldNext2 =
          slides[mod(oldIndex + 2, total)];
  
        const oldNext3 =
          slides[mod(oldIndex + 3, total)];
  
  
        /*
          Clone incoming slide.
          Clone is only a visual transition layer.
        */
        ghost =
          incomingReal.cloneNode(true);
  
  
        ghost.classList.remove(
          "b4-featured-next-4"
        );
  
  
        STATE_CLASSES.forEach(
          (className) => {
            ghost.classList.remove(
              className
            );
          }
        );
  
  
        ghost.classList.add(
          "b4-featured-ghost",
          "is-from-left"
        );
  
  
        ghost.removeAttribute(
          "id"
        );
  
  
        wrapper.appendChild(
          ghost
        );
  
  
        /*
          Hide the real incoming slide underneath the ghost.
        */
        clearSlideStates(
          incomingReal
        );
  
        incomingReal.classList.add(
          "b4-featured-under-ghost"
        );
  
  
        /*
          Shift all existing roles one position to the right.
        */
        clearSlideStates(
          oldActive
        );
  
        oldActive.classList.add(
          "b4-featured-next-1"
        );
  
  
        clearSlideStates(
          oldNext1
        );
  
        oldNext1.classList.add(
          "b4-featured-next-2"
        );
  
  
        clearSlideStates(
          oldNext2
        );
  
        oldNext2.classList.add(
          "b4-featured-next-3"
        );
  
  
        clearSlideStates(
          oldNext3
        );
  
        oldNext3.classList.add(
          "b4-featured-next-4"
        );
  
  
        forceReflow();
  
  
        requestAnimationFrame(
          () => {
  
            requestAnimationFrame(
              () => {
  
                ghost?.classList.add(
                  "is-entering"
                );
  
              }
            );
  
          }
        );
  
  
        window.setTimeout(
          () => {
  
            /*
              Put the real incoming slide exactly underneath the ghost,
              without transition.
            */
            incomingReal.classList.add(
              "is-no-transition"
            );
  
  
            clearSlideStates(
              incomingReal
            );
  
  
            incomingReal.classList.add(
              "b4-featured-active"
            );
  
  
            forceReflow();
  
  
            requestAnimationFrame(
              () => {
  
                removeGhost();
  
  
                incomingReal.classList.remove(
                  "is-no-transition"
                );
  
  
                currentIndex =
                  newIndex;
  
  
                applyCanonicalStates();
  
  
                isAnimating =
                  false;
  
              }
            );
  
          },
          getDurationMs() + 20
        );
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
  
          /*
            Capture current logical slide before destroying.
          */
          if (
            Number.isFinite(
              mobileSwiper.realIndex
            )
          ) {
            currentIndex =
              mobileSwiper.realIndex;
          }
  
  
          mobileSwiper.destroy(
            true,
            true
          );
  
  
          mobileSwiper =
            null;
        }
      };
  
  
      const cleanDesktopInlineStyles = () => {
  
        wrapper.style.removeProperty(
          "transform"
        );
  
        wrapper.style.removeProperty(
          "transition-duration"
        );
  
        wrapper.style.removeProperty(
          "transition-delay"
        );
  
  
        getRealSlides().forEach(
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
      };
  
  
      const enableDesktop = () => {
  
        destroyMobileSwiper();
        removeGhost();
  
  
        wrapper.classList.add(
          "is-no-transition"
        );
  
  
        cleanDesktopInlineStyles();
  
  
        applyCanonicalStates();
  
  
        forceReflow();
  
  
        requestAnimationFrame(
          () => {
  
            wrapper.classList.remove(
              "is-no-transition"
            );
  
          }
        );
      };
  
  
      /* ==========================================================================
         TABLET / MOBILE
      ========================================================================== */
  
      const enableMobile = () => {
  
        removeGhost();
  
  
        if (mobileSwiper) return;
  
  
        clearAllStates();
  
  
        wrapper.classList.add(
          "is-no-transition"
        );
  
  
        wrapper.style.removeProperty(
          "transform"
        );
  
  
        getRealSlides().forEach(
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
  
              initialSlide:
                currentIndex,
  
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
  
              on: {
  
                slideChange(
                  instance
                ) {
  
                  currentIndex =
                    instance.realIndex;
  
                },
  
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
  
  
          const clickedSlide =
            event.target.closest(
              ".swiper-slide.is--featured:not(.b4-featured-ghost)"
            );
  
  
          if (!clickedSlide) return;
  
  
          const slides =
            getRealSlides();
  
  
          const clickedIndex =
            slides.indexOf(
              clickedSlide
            );
  
  
          if (
            clickedIndex < 0
          ) {
            return;
          }
  
  
          const total =
            slides.length;
  
  
          const distance =
            mod(
              clickedIndex -
              currentIndex,
              total
            );
  
  
          if (distance === 0) {
            return;
          }
  
  
          /*
            Preview positions are always forward,
            therefore rotate NEXT the requested amount.
          */
          let remaining =
            distance;
  
  
          const rotate = () => {
  
            if (
              remaining <= 0
            ) {
              return;
            }
  
  
            goNextDesktop();
  
  
            remaining -= 1;
  
  
            if (
              remaining > 0
            ) {
  
              window.setTimeout(
                rotate,
                getDurationMs() + 55
              );
  
            }
          };
  
  
          rotate();
        }
      );
  
  
      /* ==========================================================================
         BREAKPOINT
      ========================================================================== */
  
      const updateMode = () => {
  
        isAnimating =
          false;
  
  
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
  
      let resizeTimer =
        null;
  
  
      window.addEventListener(
        "resize",
        () => {
  
          window.clearTimeout(
            resizeTimer
          );
  
  
          resizeTimer =
            window.setTimeout(
              () => {
  
                if (
                  isDesktop()
                ) {
  
                  cleanDesktopInlineStyles();
  
                  applyCanonicalStates();
  
                } else if (
                  mobileSwiper
                ) {
  
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