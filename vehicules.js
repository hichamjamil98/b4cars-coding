/* ==========================================================================
   B4CARS — VEHICLES HERO FEATURED SWIPER

   DESKTOP >= 992px
   - Infinite loop
   - Custom expanding active slide
   - 4 preview strips
   - Smooth rotating composition
   - Preview strips can be clicked

   TABLET + MOBILE <= 991px
   - Standard Swiper
   - Infinite loop
   - One normal slide at a time
   - No accordion / hover expansion
========================================================================== */

(() => {
    "use strict";
  
    const DESKTOP_BREAKPOINT = 992;
  
    /*
      Swiper spaceBetween expects a numeric pixel value.
      12px corresponds to 0.75rem in the design.
    */
    const GAP_PX = 12;
  
    const DESKTOP_SPEED = 1150;
    const MOBILE_SPEED = 700;
  
    const STATE_CLASSES = [
      "is-featured-active",
      "is-featured-next-1",
      "is-featured-next-2",
      "is-featured-next-3",
      "is-featured-next-4",
      "is-featured-rest",
    ];
  
    document.addEventListener("DOMContentLoaded", () => {
      const section = document.querySelector(".section.is--vehicule-hero");
      if (!section) return;
  
      const swiperElement = section.querySelector(".swiper.is--featured");
      if (!swiperElement) return;
  
      if (typeof window.Swiper === "undefined") {
        console.warn("[B4Cars] Swiper is not loaded.");
        return;
      }
  
      const wrapper = swiperElement.closest(".swiper--wrapper") || section;
      const previousButton = wrapper.querySelector(".swiper--btn.is--previous");
      const nextButton = wrapper.querySelector(".swiper--btn.is--next");
  
      const desktopMedia = window.matchMedia(
        `(min-width: ${DESKTOP_BREAKPOINT}px)`
      );
  
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
  
  
      /* ==========================================================================
         HELPERS
      ========================================================================== */
  
      const isDesktop = () => desktopMedia.matches;
  
      const normalizeLoopIndex = (value, total) => {
        if (!total) return 0;
        return ((value % total) + total) % total;
      };
  
      const clearVisualStates = (swiper) => {
        Array.from(swiper.slides).forEach((slide) => {
          STATE_CLASSES.forEach((className) => {
            slide.classList.remove(className);
          });
  
          slide.removeAttribute("tabindex");
        });
      };
  
      const getRealSlideCount = (swiper) => {
        const indexes = Array.from(swiper.slides)
          .map((slide) =>
            Number(slide.getAttribute("data-swiper-slide-index"))
          )
          .filter(Number.isFinite);
  
        if (!indexes.length) return 0;
  
        return Math.max(...indexes) + 1;
      };
  
  
      /* ==========================================================================
         DESKTOP VISUAL STATES
      ========================================================================== */
  
      const applyDesktopVisualStates = (swiper, animate = true) => {
        if (!isDesktop()) {
          clearVisualStates(swiper);
          return;
        }
  
        const totalRealSlides = getRealSlideCount(swiper);
        if (!totalRealSlides) return;
  
        const activeRealIndex = normalizeLoopIndex(
          swiper.realIndex,
          totalRealSlides
        );
  
        Array.from(swiper.slides).forEach((slide) => {
          STATE_CLASSES.forEach((className) => {
            slide.classList.remove(className);
          });
  
          slide.setAttribute("tabindex", "0");
  
          const slideRealIndex = Number(
            slide.getAttribute("data-swiper-slide-index")
          );
  
          if (!Number.isFinite(slideRealIndex)) {
            slide.classList.add("is-featured-rest");
            return;
          }
  
          const relativeIndex = normalizeLoopIndex(
            slideRealIndex - activeRealIndex,
            totalRealSlides
          );
  
          switch (relativeIndex) {
            case 0:
              slide.classList.add("is-featured-active");
              break;
  
            case 1:
              slide.classList.add("is-featured-next-1");
              break;
  
            case 2:
              slide.classList.add("is-featured-next-2");
              break;
  
            case 3:
              slide.classList.add("is-featured-next-3");
              break;
  
            case 4:
              slide.classList.add("is-featured-next-4");
              break;
  
            default:
              slide.classList.add("is-featured-rest");
              break;
          }
        });
  
        requestAnimationFrame(() => {
          swiper.updateSlides();
          swiper.updateProgress();
          swiper.updateSlidesClasses();
  
          if (
            animate &&
            !prefersReducedMotion &&
            typeof window.gsap !== "undefined"
          ) {
            const activeSlide = Array.from(swiper.slides).find((slide) =>
              slide.classList.contains("is-featured-active")
            );
  
            const activeImage = activeSlide?.querySelector(
              ".featured--image-wrapper .image--absolute-100"
            );
  
            if (activeImage) {
              window.gsap.fromTo(
                activeImage,
                {
                  scale: 1.025,
                },
                {
                  scale: 1,
                  duration: 1.2,
                  ease: "power3.out",
                  overwrite: true,
                  clearProps: "transform",
                }
              );
            }
          }
        });
      };
  
  
      /* ==========================================================================
         SWIPER
      ========================================================================== */
  
      const swiper = new window.Swiper(swiperElement, {
        loop: true,
  
        speed: prefersReducedMotion
          ? 0
          : isDesktop()
            ? DESKTOP_SPEED
            : MOBILE_SPEED,
  
        spaceBetween: GAP_PX,
  
        watchSlidesProgress: true,
        observer: true,
        observeParents: true,
        resizeObserver: true,
  
        allowTouchMove: true,
        threshold: 5,
        resistanceRatio: 0.72,
  
        navigation: {
          prevEl: previousButton,
          nextEl: nextButton,
        },
  
        /*
          Tablet + mobile:
          standard one-card slider.
  
          Desktop:
          slidesPerView:auto is required because the custom CSS controls
          the active / preview widths.
        */
        breakpoints: {
          0: {
            slidesPerView: 1,
            slidesPerGroup: 1,
            spaceBetween: GAP_PX,
            grabCursor: false,
          },
  
          992: {
            slidesPerView: "auto",
            slidesPerGroup: 1,
            spaceBetween: GAP_PX,
            grabCursor: true,
          },
        },
  
        on: {
          init(instance) {
            if (isDesktop()) {
              applyDesktopVisualStates(instance, false);
            } else {
              clearVisualStates(instance);
            }
  
            requestAnimationFrame(() => {
              instance.update();
            });
          },
  
          realIndexChange(instance) {
            if (isDesktop()) {
              applyDesktopVisualStates(instance, true);
            }
          },
  
          slideChangeTransitionStart(instance) {
            if (isDesktop()) {
              applyDesktopVisualStates(instance, true);
            }
          },
  
          resize(instance) {
            if (isDesktop()) {
              applyDesktopVisualStates(instance, false);
            } else {
              clearVisualStates(instance);
            }
          },
  
          breakpoint(instance) {
            instance.params.speed = prefersReducedMotion
              ? 0
              : isDesktop()
                ? DESKTOP_SPEED
                : MOBILE_SPEED;
  
            if (isDesktop()) {
              applyDesktopVisualStates(instance, false);
            } else {
              clearVisualStates(instance);
            }
  
            requestAnimationFrame(() => {
              instance.update();
            });
          },
        },
      });
  
  
      /* ==========================================================================
         DESKTOP ONLY — CLICK PREVIEW TO ACTIVATE
      ========================================================================== */
  
      swiperElement.addEventListener("click", (event) => {
        if (!isDesktop()) return;
  
        const slide = event.target.closest(".swiper-slide.is--featured");
        if (!slide) return;
  
        if (slide.classList.contains("is-featured-active")) return;
  
        const realIndex = Number(
          slide.getAttribute("data-swiper-slide-index")
        );
  
        if (!Number.isFinite(realIndex)) return;
  
        swiper.slideToLoop(
          realIndex,
          prefersReducedMotion ? 0 : DESKTOP_SPEED
        );
      });
  
  
      /* ==========================================================================
         DESKTOP ONLY — KEYBOARD
      ========================================================================== */
  
      swiperElement.addEventListener("keydown", (event) => {
        if (!isDesktop()) return;
        if (event.key !== "Enter" && event.key !== " ") return;
  
        const slide = event.target.closest(".swiper-slide.is--featured");
        if (!slide) return;
  
        if (slide.classList.contains("is-featured-active")) return;
  
        const realIndex = Number(
          slide.getAttribute("data-swiper-slide-index")
        );
  
        if (!Number.isFinite(realIndex)) return;
  
        event.preventDefault();
  
        swiper.slideToLoop(
          realIndex,
          prefersReducedMotion ? 0 : DESKTOP_SPEED
        );
      });
  
  
      /* ==========================================================================
         BREAKPOINT CHANGE SAFETY
      ========================================================================== */
  
      const handleBreakpointChange = () => {
        swiper.params.speed = prefersReducedMotion
          ? 0
          : isDesktop()
            ? DESKTOP_SPEED
            : MOBILE_SPEED;
  
        if (isDesktop()) {
          applyDesktopVisualStates(swiper, false);
        } else {
          clearVisualStates(swiper);
        }
  
        requestAnimationFrame(() => {
          swiper.update();
        });
      };
  
      if (typeof desktopMedia.addEventListener === "function") {
        desktopMedia.addEventListener("change", handleBreakpointChange);
      } else {
        desktopMedia.addListener(handleBreakpointChange);
      }
  
  
      /* ==========================================================================
         FINAL REFRESH
      ========================================================================== */
  
      window.addEventListener("load", () => {
        requestAnimationFrame(() => {
          if (isDesktop()) {
            applyDesktopVisualStates(swiper, false);
          } else {
            clearVisualStates(swiper);
          }
  
          swiper.update();
        });
      });
    });
  })();