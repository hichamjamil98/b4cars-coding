/* ==========================================================================
   B4CARS — VEHICLES HERO — V10 COMPLETE

   DESKTOP >= 992px
   ==========================================================================
   Custom 5-state animated composition.

   TABLET / MOBILE <= 991px
   ==========================================================================
   CSS is left entirely to Webflow.

   JavaScript only:
   - clears desktop animation classes
   - removes desktop inline animation properties
   - initializes a normal Swiper
   - loop: true
   - slidesPerView: 1

   No tablet/mobile card CSS is imposed by this script.
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
  
  
    document.addEventListener(
      "DOMContentLoaded",
      () => {
  
        const section =
          document.querySelector(
            ".section.is--vehicule-hero"
          );
  
        if (!section) return;
  
  
        const swiperElement =
          section.querySelector(
            ".swiper.is--featured"
          );
  
        if (!swiperElement) return;
  
  
        const wrapper =
          swiperElement.querySelector(
            ".swiper-wrapper.is--featured"
          );
  
        if (!wrapper) return;
  
  
        const previousButton =
          section.querySelector(
            ".swiper--btn.is--previous"
          );
  
  
        const nextButton =
          section.querySelector(
            ".swiper--btn.is--next"
          );
  
  
        const desktopMedia =
          window.matchMedia(
            `(min-width: ${DESKTOP_BREAKPOINT}px)`
          );
  
  
        let mobileSwiper =
          null;
  
        let isAnimating =
          false;
  
        let currentIndex =
          0;
  
        let ghost =
          null;
  
  
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
  
  
        const mod = (
          value,
          total
        ) =>
          (
            (value % total)
            + total
          ) % total;
  
  
        const remToPx = (
          rem
        ) => {
  
          const rootSize =
            parseFloat(
              getComputedStyle(
                document.documentElement
              ).fontSize
            );
  
  
          return rem * (
            Number.isFinite(
              rootSize
            )
              ? rootSize
              : 16
          );
        };
  
  
        const getGapPx = () =>
          remToPx(
            GAP_REM
          );
  
  
        const clearSlideStates = (
          slide
        ) => {
  
          STATE_CLASSES.forEach(
            (
              className
            ) => {
  
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
  
          const raw =
            getComputedStyle(
              section
            )
              .getPropertyValue(
                "--featured-duration"
              )
              .trim();
  
  
          if (
            raw.endsWith(
              "ms"
            )
          ) {
  
            return (
              parseFloat(
                raw
              )
              || 720
            );
          }
  
  
          if (
            raw.endsWith(
              "s"
            )
          ) {
  
            return (
              (
                parseFloat(
                  raw
                )
                || 0.72
              )
              * 1000
            );
          }
  
  
          return 720;
        };
  
  
        const forceReflow = () =>
          wrapper.getBoundingClientRect();
  
  
        const removeGhost = () => {
  
          if (!ghost) return;
  
  
          ghost.remove();
  
  
          ghost =
            null;
        };
  
  
        /* ==========================================================================
           CANONICAL DESKTOP STATES
        ========================================================================== */
  
        const applyCanonicalStates = () => {
  
          const slides =
            getRealSlides();
  
  
          const total =
            slides.length;
  
  
          if (!total) return;
  
  
          clearAllStates();
  
  
          const activeIndex =
            mod(
              currentIndex,
              total
            );
  
  
          const active =
            slides[
              activeIndex
            ];
  
  
          const next1 =
            slides[
              mod(
                activeIndex + 1,
                total
              )
            ];
  
  
          const next2 =
            slides[
              mod(
                activeIndex + 2,
                total
              )
            ];
  
  
          const next3 =
            slides[
              mod(
                activeIndex + 3,
                total
              )
            ];
  
  
          const next4 =
            slides[
              mod(
                activeIndex + 4,
                total
              )
            ];
  
  
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
            !isDesktop()
            || isAnimating
          ) {
            return;
          }
  
  
          const slides =
            getRealSlides();
  
  
          const total =
            slides.length;
  
  
          if (
            total < 2
          ) {
            return;
          }
  
  
          isAnimating =
            true;
  
  
          removeGhost();
  
  
          const oldIndex =
            mod(
              currentIndex,
              total
            );
  
  
          const newIndex =
            mod(
              oldIndex + 1,
              total
            );
  
  
          const outgoing =
            slides[
              oldIndex
            ];
  
  
          const newActive =
            slides[
              newIndex
            ];
  
  
          const newNext1 =
            slides[
              mod(
                newIndex + 1,
                total
              )
            ];
  
  
          const newNext2 =
            slides[
              mod(
                newIndex + 2,
                total
              )
            ];
  
  
          const newNext3 =
            slides[
              mod(
                newIndex + 3,
                total
              )
            ];
  
  
          clearSlideStates(
            outgoing
          );
  
  
          outgoing.classList.add(
            "b4-featured-outgoing-left"
          );
  
  
          clearSlideStates(
            newActive
          );
  
  
          newActive.classList.add(
            "b4-featured-active"
          );
  
  
          clearSlideStates(
            newNext1
          );
  
  
          newNext1.classList.add(
            "b4-featured-next-1"
          );
  
  
          clearSlideStates(
            newNext2
          );
  
  
          newNext2.classList.add(
            "b4-featured-next-2"
          );
  
  
          clearSlideStates(
            newNext3
          );
  
  
          newNext3.classList.add(
            "b4-featured-next-3"
          );
  
  
          window.setTimeout(
            () => {
  
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
            !isDesktop()
            || isAnimating
          ) {
            return;
          }
  
  
          const slides =
            getRealSlides();
  
  
          const total =
            slides.length;
  
  
          if (
            total < 2
          ) {
            return;
          }
  
  
          isAnimating =
            true;
  
  
          removeGhost();
  
  
          const oldIndex =
            mod(
              currentIndex,
              total
            );
  
  
          const newIndex =
            mod(
              oldIndex - 1,
              total
            );
  
  
          const incomingReal =
            slides[
              newIndex
            ];
  
  
          const oldActive =
            slides[
              oldIndex
            ];
  
  
          const oldNext1 =
            slides[
              mod(
                oldIndex + 1,
                total
              )
            ];
  
  
          const oldNext2 =
            slides[
              mod(
                oldIndex + 2,
                total
              )
            ];
  
  
          const oldNext3 =
            slides[
              mod(
                oldIndex + 3,
                total
              )
            ];
  
  
          ghost =
            incomingReal.cloneNode(
              true
            );
  
  
          STATE_CLASSES.forEach(
            (
              className
            ) => {
  
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
  
  
          clearSlideStates(
            incomingReal
          );
  
  
          incomingReal.classList.add(
            "b4-featured-under-ghost"
          );
  
  
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
           DESTROY MOBILE SWIPER
        ========================================================================== */
  
        const destroyMobileSwiper = () => {
  
          if (
            mobileSwiper
            && typeof mobileSwiper.destroy
              === "function"
          ) {
  
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
  
  
        /* ==========================================================================
           CLEAN DESKTOP INLINE STYLES
        ========================================================================== */
  
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
            (
              slide
            ) => {
  
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
  
  
        /* ==========================================================================
           DESKTOP MODE
        ========================================================================== */
  
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
           TABLET / MOBILE RESET
           IMPORTANT:
           Do not impose layout CSS.
        ========================================================================== */
  
        const cleanForWebflowMobile = () => {
  
          removeGhost();
  
  
          clearAllStates();
  
  
          wrapper.classList.remove(
            "is-no-transition"
          );
  
  
          /*
            Remove properties created by desktop logic / old Swiper.
            Webflow remains responsible for its own CSS classes.
          */
          wrapper.style.removeProperty(
            "height"
          );
  
  
          wrapper.style.removeProperty(
            "transform"
          );
  
  
          wrapper.style.removeProperty(
            "transition-duration"
          );
  
  
          wrapper.style.removeProperty(
            "transition-delay"
          );
  
  
          wrapper.style.removeProperty(
            "cursor"
          );
  
  
          getRealSlides().forEach(
            (
              slide
            ) => {
  
              slide.classList.remove(
                "is-no-transition"
              );
  
  
              slide.style.removeProperty(
                "position"
              );
  
  
              slide.style.removeProperty(
                "top"
              );
  
  
              slide.style.removeProperty(
                "left"
              );
  
  
              slide.style.removeProperty(
                "height"
              );
  
  
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
  
  
              slide.style.removeProperty(
                "z-index"
              );
  
            }
          );
        };
  
  
        /* ==========================================================================
           TABLET / MOBILE SWIPER
        ========================================================================== */
  
        const enableMobile = () => {
  
          if (
            mobileSwiper
          ) {
            return;
          }
  
  
          cleanForWebflowMobile();
  
  
          if (
            typeof window.Swiper
            === "undefined"
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
  
                allowTouchMove:
                  true,
  
                simulateTouch:
                  true,
  
                threshold:
                  5,
  
                resistanceRatio:
                  0.72,
  
                observer:
                  true,
  
                observeParents:
                  true,
  
                resizeObserver:
                  true,
  
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
  
        if (
          nextButton
        ) {
  
          nextButton.addEventListener(
            "click",
            (
              event
            ) => {
  
              if (
                !isDesktop()
              ) {
                return;
              }
  
  
              event.preventDefault();
  
  
              event.stopPropagation();
  
  
              goNextDesktop();
  
            },
            true
          );
        }
  
  
        if (
          previousButton
        ) {
  
          previousButton.addEventListener(
            "click",
            (
              event
            ) => {
  
              if (
                !isDesktop()
              ) {
                return;
              }
  
  
              event.preventDefault();
  
  
              event.stopPropagation();
  
  
              goPreviousDesktop();
  
            },
            true
          );
        }
  
  
        /* ==========================================================================
           CLICK A DESKTOP PREVIEW
        ========================================================================== */
  
        wrapper.addEventListener(
          "click",
          (
            event
          ) => {
  
            if (
              !isDesktop()
              || isAnimating
            ) {
              return;
            }
  
  
            const clickedSlide =
              event.target.closest(
                ".swiper-slide.is--featured:not(.b4-featured-ghost)"
              );
  
  
            if (
              !clickedSlide
            ) {
              return;
            }
  
  
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
                clickedIndex
                - currentIndex,
                total
              );
  
  
            if (
              distance === 0
            ) {
              return;
            }
  
  
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
  
  
          if (
            isDesktop()
          ) {
  
            enableDesktop();
  
          } else {
  
            enableMobile();
  
          }
        };
  
  
        if (
          typeof desktopMedia.addEventListener
          === "function"
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
  
      }
    );
  
  })();
  
  
  /* ==========================================================================
     B4CARS — VEHICLES FILTER + VALUE FORMATTER
  
     Features:
     - Live text search
     - Dynamic Marque dropdown generated from CMS values
     - Integer-only dual range for:
         year / price / km
     - All filters work together
     - Live filtering while dragging
     - Reset button
     - Empty-results state
     - [format="km"]    : 200000 -> 200.000km
     - [format="price"] : 200000 -> 200.000€
  ========================================================================== */
  
  (() => {
    "use strict";
  
    document.addEventListener("DOMContentLoaded", () => {
      const section = document.querySelector(".section.is--vehicule-filter");
      if (!section) return;
  
      const collection = section.querySelector(".collection--cars");
      if (!collection) return;
  
      const items = Array.from(
        collection.querySelectorAll(":scope > .w-dyn-item")
      );
  
      if (!items.length) return;
  
      const searchInput = section.querySelector(".search--field");
  
      const brandFilter = section.querySelector(
        '.filter--card[filter="marque"]'
      );
  
      const brandDropdown = brandFilter?.querySelector(".drop--wrapper") || null;
  
      const brandLabel =
        brandFilter?.querySelector(":scope > p") || null;
  
      const emptyResults = section.querySelector(
        '[filter="empty"], .empty--results'
      );
  
      const form = section.querySelector("form.filter--wrapper");
  
      const filtersTitle =
        section.querySelector(
          ".filter--card.is--title"
        );
  
      const filtersDropdown =
        section.querySelector(
          ".filter--dropdown"
        );
  
      const resetButton =
        section.querySelector(
          '[data-wf--slot-item-button--variant="reset"]'
        ) ||
        Array.from(
          section.querySelectorAll(
            ".filter--wrapper a, .filter--wrapper .button"
          )
        ).find((element) =>
          /r[eé]initialiser/i.test(
            element.textContent || ""
          )
        ) ||
        null;
  
  
      /* ==========================================================================
         NORMALIZATION / NUMBERS
      ========================================================================== */
  
      const normalizeText = (value = "") =>
        String(value)
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
  
  
      const parseInteger = (value) => {
        if (value === null || value === undefined) return null;
  
        const stringValue = String(value)
          .replace(/\u00a0/g, " ")
          .trim();
  
        if (!stringValue) return null;
  
        const cleaned = stringValue.replace(/[^\d-]/g, "");
  
        if (!cleaned || cleaned === "-") return null;
  
        const number = Number.parseInt(cleaned, 10);
  
        return Number.isFinite(number)
          ? number
          : null;
      };
  
  
      const clamp = (value, min, max) =>
        Math.min(
          Math.max(value, min),
          max
        );
  
  
      const formatGroupedInteger = (value) =>
        Math.round(value)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  
      const formatKm = (value) =>
        `${formatGroupedInteger(value)}km`;
  
  
      const formatPrice = (value) =>
        `${formatGroupedInteger(value)}€`;
  
  
      /* ==========================================================================
         GLOBAL FORMAT ATTRIBUTES
      ========================================================================== */
  
      const formatDocumentValues = () => {
        document
          .querySelectorAll('[format="km"], [format="price"]')
          .forEach((element) => {
            if (!element.dataset.b4RawValue) {
              element.dataset.b4RawValue = element.textContent.trim();
            }
  
            const raw = parseInteger(
              element.dataset.b4RawValue
            );
  
            if (raw === null) return;
  
            if (element.getAttribute("format") === "km") {
              element.textContent = formatKm(raw);
            }
  
            if (element.getAttribute("format") === "price") {
              element.textContent = formatPrice(raw);
            }
          });
      };
  
  
      /* ==========================================================================
         CMS DATA CACHE
      ========================================================================== */
  
      const getRawElementValue = (element) => {
        if (!element) return "";
  
        if (element.dataset.b4RawValue) {
          return element.dataset.b4RawValue;
        }
  
        return element.textContent.trim();
      };
  
  
      const getFilterText = (item, name) =>
        getRawElementValue(
          item.querySelector(`[filter="${name}"]`)
        );
  
  
      const cardData = items.map((item) => {
        const brand = getFilterText(item, "marque");
        const model = getFilterText(item, "modele");
        const yearRaw = getFilterText(item, "annee");
        const kmRaw = getFilterText(item, "km");
        const priceRaw = getFilterText(item, "price");
  
        return {
          item,
          brand,
          brandNormalized: normalizeText(brand),
          model,
          searchText: normalizeText(
            [
              brand,
              model,
              yearRaw,
              kmRaw,
              priceRaw,
              item.querySelector(".caritem--text")?.textContent || "",
            ].join(" ")
          ),
          year: parseInteger(yearRaw),
          km: parseInteger(kmRaw),
          price: parseInteger(priceRaw),
        };
      });
  
  
      /* ==========================================================================
         FILTER STATE
      ========================================================================== */
  
      const state = {
        query: "",
        brand: "",
        ranges: {
          year: null,
          price: null,
          km: null,
        },
      };
  
  
      /* ==========================================================================
         RANGE CONFIG
      ========================================================================== */
  
      const rangeConfigs = {
        year: {
          filterSelector: '[filter="year"]',
          dataKey: "year",
          format: (value) => String(value),
        },
  
        price: {
          filterSelector: '[filter="price"]',
          dataKey: "price",
          format: formatPrice,
          step: 10000,
        },
  
        km: {
          filterSelector: '[filter="km"]',
          dataKey: "km",
          format: formatKm,
          step: 10000,
        },
      };
  
  
      const rangeControllers = {};
  
  
      const getDataBounds = (dataKey) => {
        const values = cardData
          .map((card) => card[dataKey])
          .filter(Number.isFinite);
  
        if (!values.length) {
          return {
            min: 0,
            max: 0,
          };
        }
  
        return {
          min: Math.min(...values),
          max: Math.max(...values),
        };
      };
  
  
      /* ==========================================================================
         FILTER ENGINE
      ========================================================================== */
  
      const matchesRange = (card, key) => {
        const range = state.ranges[key];
  
        if (!range) return true;
  
        const value = card[key];
  
        const isFullRange =
          range.min === range.absoluteMin &&
          range.max === range.absoluteMax;
  
        /*
          Missing CMS numeric values remain visible while the slider
          is untouched. Once the user narrows the range, they are excluded.
        */
        if (!Number.isFinite(value)) {
          return isFullRange;
        }
  
        return (
          value >= range.min &&
          value <= range.max
        );
      };
  
  
      const applyFilters = () => {
        let visibleCount = 0;
  
        cardData.forEach((card) => {
          const queryMatch =
            !state.query ||
            card.searchText.includes(state.query);
  
          const brandMatch =
            !state.brand ||
            card.brandNormalized === state.brand;
  
          const yearMatch =
            matchesRange(card, "year");
  
          const priceMatch =
            matchesRange(card, "price");
  
          const kmMatch =
            matchesRange(card, "km");
  
          const shouldShow =
            queryMatch &&
            brandMatch &&
            yearMatch &&
            priceMatch &&
            kmMatch;
  
          const wasHidden =
            card.item.classList.contains(
              "is--filter-hidden"
            );
  
          if (shouldShow) {
            visibleCount += 1;
  
            card.item.classList.remove(
              "is--filter-hidden"
            );
  
            if (wasHidden) {
              card.item.classList.remove(
                "is--filter-entering"
              );
  
              /*
                Restart the small entrance animation.
              */
              void card.item.offsetWidth;
  
              card.item.classList.add(
                "is--filter-entering"
              );
  
              window.setTimeout(() => {
                card.item.classList.remove(
                  "is--filter-entering"
                );
              }, 420);
            }
          } else {
            card.item.classList.remove(
              "is--filter-entering"
            );
  
            card.item.classList.add(
              "is--filter-hidden"
            );
          }
        });
  
        if (emptyResults) {
          emptyResults.classList.toggle(
            "is--visible",
            visibleCount === 0
          );
        }
  
        /*
          Hiding cards shortens the page, so sections below can enter
          the viewport without their fade ScrollTriggers noticing.
          refresh(true) recalculates start positions after layout settles.
        */
        if (typeof window.ScrollTrigger !== "undefined") {
          window.ScrollTrigger.refresh(true);
        }
      };
  
  
      /* ==========================================================================
         SEARCH
      ========================================================================== */
  
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          state.query = normalizeText(
            searchInput.value
          );
  
          applyFilters();
        });
      }
  
  
      /* ==========================================================================
         MARQUE DROPDOWN — CMS GENERATED
      ========================================================================== */
  
      const closeBrandDropdown = () => {
        brandFilter?.classList.remove(
          "is--open"
        );
      };
  
  
      const openBrandDropdown = () => {
        brandFilter?.classList.add(
          "is--open"
        );
      };
  
  
      const toggleBrandDropdown = () => {
        brandFilter?.classList.toggle(
          "is--open"
        );
      };
  
  
      const setBrand = (
        normalizedBrand,
        displayLabel = "Marque"
      ) => {
        state.brand = normalizedBrand;
  
        if (brandLabel) {
          brandLabel.textContent = displayLabel;
        }
  
        brandDropdown
          ?.querySelectorAll(".text--marque")
          .forEach((option) => {
            option.classList.toggle(
              "is--selected",
              option.dataset.brandValue === normalizedBrand
            );
          });
  
        closeBrandDropdown();
        applyFilters();
      };
  
  
      const buildBrandDropdown = () => {
        if (
          !brandFilter ||
          !brandDropdown
        ) {
          return;
        }
  
        const uniqueBrands = new Map();
  
        cardData.forEach((card) => {
          const normalized =
            card.brandNormalized;
  
          if (
            !normalized ||
            uniqueBrands.has(normalized)
          ) {
            return;
          }
  
          uniqueBrands.set(
            normalized,
            card.brand.trim()
          );
        });
  
        const template =
          brandDropdown.querySelector(
            ".text--marque"
          );
  
        brandDropdown.innerHTML = "";
  
  
        const createOption = (
          label,
          value
        ) => {
          const option =
            template
              ? template.cloneNode(true)
              : document.createElement("div");
  
          option.classList.add(
            "text--marque"
          );
  
          option.removeAttribute("id");
  
          option.setAttribute(
            "item",
            "marque"
          );
  
          option.setAttribute(
            "role",
            "option"
          );
  
          option.setAttribute(
            "tabindex",
            "0"
          );
  
          option.textContent =
            label;
  
          option.dataset.brandValue =
            value;
  
          const select = (
            event
          ) => {
            event.preventDefault();
            event.stopPropagation();
  
            setBrand(
              value,
              value ? label : "Marque"
            );
          };
  
          option.addEventListener(
            "click",
            select
          );
  
          option.addEventListener(
            "keydown",
            (event) => {
              if (
                event.key !== "Enter" &&
                event.key !== " "
              ) {
                return;
              }
  
              select(event);
            }
          );
  
          return option;
        };
  
  
        brandDropdown.appendChild(
          createOption(
            "Toutes les marques",
            ""
          )
        );
  
  
        Array.from(
          uniqueBrands.entries()
        )
          .sort((a, b) =>
            a[1].localeCompare(
              b[1],
              "fr",
              {
                sensitivity: "base",
              }
            )
          )
          .forEach(
            ([normalized, label]) => {
              brandDropdown.appendChild(
                createOption(
                  label,
                  normalized
                )
              );
            }
          );
  
  
        brandFilter.setAttribute(
          "role",
          "combobox"
        );
  
        brandFilter.setAttribute(
          "aria-haspopup",
          "listbox"
        );
  
        brandDropdown.setAttribute(
          "role",
          "listbox"
        );
  
  
        brandFilter.addEventListener(
          "click",
          (event) => {
            if (
              event.target.closest(
                ".drop--wrapper"
              )
            ) {
              return;
            }
  
            toggleBrandDropdown();
          }
        );
  
  
        brandFilter.addEventListener(
          "keydown",
          (event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              toggleBrandDropdown();
            }
  
            if (
              event.key === "Escape"
            ) {
              closeBrandDropdown();
            }
          }
        );
  
  
        if (!brandFilter.hasAttribute("tabindex")) {
          brandFilter.setAttribute(
            "tabindex",
            "0"
          );
        }
      };
  
  
      document.addEventListener(
        "click",
        (event) => {
          if (
            brandFilter &&
            !brandFilter.contains(
              event.target
            )
          ) {
            closeBrandDropdown();
          }
        }
      );
  
  
      /* ==========================================================================
         DOUBLE RANGE BUILDER
      ========================================================================== */
  
      const createRangeController = (
        key,
        config
      ) => {
        const filterCard =
          section.querySelector(
            config.filterSelector
          );
  
        if (!filterCard) return null;
  
        const track =
          filterCard.querySelector(
            ".rod--grille-wrapper"
          );
  
        const minDot =
          filterCard.querySelector(
            ".dot--min"
          );
  
        const maxDot =
          filterCard.querySelector(
            ".dot--max"
          );
  
        const bottom =
          filterCard.querySelector(
            ".grille--bottom"
          );
  
        const labels =
          bottom
            ? Array.from(
                bottom.querySelectorAll(
                  ":scope > p"
                )
              )
            : [];
  
        const minLabel =
          labels[0] || null;
  
        const maxLabel =
          labels[labels.length - 1] || null;
  
        if (
          !track ||
          !minDot ||
          !maxDot
        ) {
          return null;
        }
  
  
        const bounds =
          getDataBounds(
            config.dataKey
          );
  
        const step =
          Number.isFinite(config.step) &&
          config.step > 1
            ? config.step
            : 1;
  
  
        const range = {
          absoluteMin:
            Math.round(
              bounds.min
            ),
  
          absoluteMax:
            Math.round(
              bounds.max
            ),
  
          min:
            Math.round(
              bounds.min
            ),
  
          max:
            Math.round(
              bounds.max
            ),
        };
  
  
        state.ranges[key] =
          range;
  
  
        const snapValue = (
          value
        ) => {
          const rounded =
            Math.round(value);
  
          if (step <= 1) {
            return rounded;
          }
  
          const snapped =
            Math.round(
              rounded / step
            ) * step;
  
          return clamp(
            snapped,
            range.absoluteMin,
            range.absoluteMax
          );
        };
  
  
        const valueToPercent = (
          value
        ) => {
          const span =
            range.absoluteMax -
            range.absoluteMin;
  
          if (span <= 0) return 0;
  
          return (
            (
              value -
              range.absoluteMin
            ) /
            span
          ) * 100;
        };
  
  
        const pointerToIntegerValue = (
          clientX
        ) => {
          const rect =
            track.getBoundingClientRect();
  
          if (rect.width <= 0) {
            return range.absoluteMin;
          }
  
          const ratio =
            clamp(
              (
                clientX -
                rect.left
              ) /
              rect.width,
              0,
              1
            );
  
          const raw =
            range.absoluteMin +
            ratio *
            (
              range.absoluteMax -
              range.absoluteMin
            );
  
          return snapValue(raw);
        };
  
  
        const render = () => {
          const minPercent =
            valueToPercent(
              range.min
            );
  
          const maxPercent =
            valueToPercent(
              range.max
            );
  
          track.style.setProperty(
            "--range-min-pct",
            `${minPercent}%`
          );
  
          track.style.setProperty(
            "--range-max-pct",
            `${maxPercent}%`
          );
  
          if (minLabel) {
            minLabel.textContent =
              config.format(
                range.min
              );
          }
  
          if (maxLabel) {
            maxLabel.textContent =
              config.format(
                range.max
              );
          }
        };
  
  
        const setMin = (
          nextValue
        ) => {
          range.min =
            clamp(
              snapValue(nextValue),
              range.absoluteMin,
              range.max
            );
  
          render();
          applyFilters();
        };
  
  
        const setMax = (
          nextValue
        ) => {
          range.max =
            clamp(
              snapValue(nextValue),
              range.min,
              range.absoluteMax
            );
  
          render();
          applyFilters();
        };
  
  
        const bindDot = (
          dot,
          type
        ) => {
          const onPointerDown = (
            event
          ) => {
            if (
              event.button !== undefined &&
              event.button !== 0
            ) {
              return;
            }
  
            event.preventDefault();
  
            dot.classList.add(
              "is--dragging"
            );
  
            try {
              dot.setPointerCapture(
                event.pointerId
              );
            } catch (error) {
              /* Pointer capture is optional. */
            }
  
            const update = (
              pointerEvent
            ) => {
              const nextValue =
                pointerToIntegerValue(
                  pointerEvent.clientX
                );
  
              if (type === "min") {
                setMin(nextValue);
              } else {
                setMax(nextValue);
              }
            };
  
  
            const end = () => {
              dot.classList.remove(
                "is--dragging"
              );
  
              dot.removeEventListener(
                "pointermove",
                update
              );
  
              dot.removeEventListener(
                "pointerup",
                end
              );
  
              dot.removeEventListener(
                "pointercancel",
                end
              );
            };
  
  
            dot.addEventListener(
              "pointermove",
              update
            );
  
            dot.addEventListener(
              "pointerup",
              end
            );
  
            dot.addEventListener(
              "pointercancel",
              end
            );
  
            update(event);
          };
  
  
          dot.addEventListener(
            "pointerdown",
            onPointerDown
          );
  
  
          dot.setAttribute(
            "role",
            "slider"
          );
  
          dot.setAttribute(
            "tabindex",
            "0"
          );
  
  
          dot.addEventListener(
            "keydown",
            (event) => {
              const currentValue =
                type === "min"
                  ? range.min
                  : range.max;
  
              let direction = 0;
  
              if (
                event.key === "ArrowRight" ||
                event.key === "ArrowUp"
              ) {
                direction = 1;
              }
  
              if (
                event.key === "ArrowLeft" ||
                event.key === "ArrowDown"
              ) {
                direction = -1;
              }
  
              if (!direction) return;
  
              event.preventDefault();
  
              const nextValue =
                step > 1
                  ? direction > 0
                    ? Math.floor(
                        currentValue / step
                      ) * step + step
                    : Math.ceil(
                        currentValue / step
                      ) * step - step
                  : currentValue +
                    direction;
  
              if (type === "min") {
                setMin(nextValue);
              } else {
                setMax(nextValue);
              }
            }
          );
        };
  
  
        /*
          Clicking the track moves the nearest handle.
        */
        track.addEventListener(
          "pointerdown",
          (event) => {
            if (
              event.target === minDot ||
              event.target === maxDot
            ) {
              return;
            }
  
            const value =
              pointerToIntegerValue(
                event.clientX
              );
  
            const distanceToMin =
              Math.abs(
                value -
                range.min
              );
  
            const distanceToMax =
              Math.abs(
                value -
                range.max
              );
  
            if (
              distanceToMin <=
              distanceToMax
            ) {
              setMin(value);
            } else {
              setMax(value);
            }
          }
        );
  
  
        bindDot(
          minDot,
          "min"
        );
  
        bindDot(
          maxDot,
          "max"
        );
  
  
        const reset = () => {
          range.min =
            range.absoluteMin;
  
          range.max =
            range.absoluteMax;
  
          render();
        };
  
  
        render();
  
  
        return {
          range,
          reset,
          render,
        };
      };
  
  
      Object.entries(
        rangeConfigs
      ).forEach(
        ([key, config]) => {
          rangeControllers[key] =
            createRangeController(
              key,
              config
            );
        }
      );
  
  
      /* ==========================================================================
         RESET
      ========================================================================== */
  
      const resetAll = () => {
        state.query = "";
        state.brand = "";
  
        if (searchInput) {
          searchInput.value = "";
        }
  
        if (brandLabel) {
          brandLabel.textContent =
            "Marque";
        }
  
        brandDropdown
          ?.querySelectorAll(
            ".text--marque"
          )
          .forEach(
            (option) => {
              option.classList.toggle(
                "is--selected",
                option.dataset.brandValue === ""
              );
            }
          );
  
        Object.values(
          rangeControllers
        ).forEach(
          (controller) => {
            controller?.reset();
          }
        );
  
        closeBrandDropdown();
  
        applyFilters();
      };
  
  
      if (resetButton) {
        resetButton.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            event.stopPropagation();
            resetAll();
          }
        );
  
        resetButton
          .querySelectorAll("a")
          .forEach((link) => {
            link.addEventListener(
              "click",
              (event) => {
                event.preventDefault();
                event.stopPropagation();
                resetAll();
              }
            );
          });
      }
  
  
      /* ==========================================================================
         MOBILE FILTER DROPDOWN  <= 991px
      ========================================================================== */
  
      const MOBILE_FILTERS_MQ =
        window.matchMedia(
          "(max-width: 991px)"
        );
  
      let mobileFiltersOpen = false;
      let mobileFiltersCloseTimer = 0;
  
      const isMobileFilters = () =>
        MOBILE_FILTERS_MQ.matches;
  
      const clearMobileFilterStyles = () => {
        if (!filtersDropdown) return;
  
        filtersDropdown.classList.remove(
          "is--open"
        );
  
        filtersDropdown.style.display = "";
        filtersDropdown.style.opacity = "";
  
        filtersTitle?.classList.remove(
          "is--open"
        );
      };
  
      const syncFiltersTitleAria = () => {
        if (!filtersTitle) return;
  
        if (!isMobileFilters()) {
          filtersTitle.removeAttribute("role");
          filtersTitle.removeAttribute("tabindex");
          filtersTitle.removeAttribute(
            "aria-expanded"
          );
          return;
        }
  
        filtersTitle.setAttribute(
          "role",
          "button"
        );
  
        filtersTitle.setAttribute(
          "tabindex",
          "0"
        );
  
        filtersTitle.setAttribute(
          "aria-expanded",
          mobileFiltersOpen ? "true" : "false"
        );
      };
  
      const setMobileFiltersOpen = (open) => {
        if (!filtersDropdown) return;
  
        if (!isMobileFilters()) {
          mobileFiltersOpen = false;
          clearMobileFilterStyles();
          syncFiltersTitleAria();
          return;
        }
  
        mobileFiltersOpen = open;
  
        window.clearTimeout(
          mobileFiltersCloseTimer
        );
  
        filtersTitle?.classList.toggle(
          "is--open",
          open
        );
  
        filtersDropdown.classList.toggle(
          "is--open",
          open
        );
  
        syncFiltersTitleAria();
  
        if (open) {
          filtersDropdown.style.display =
            "flex";
          filtersDropdown.style.opacity = "0";
  
          void filtersDropdown.offsetWidth;
  
          filtersDropdown.style.opacity = "1";
          return;
        }
  
        filtersDropdown.style.opacity = "0";
  
        const hideDropdown = () => {
          if (mobileFiltersOpen) return;
          filtersDropdown.style.display = "none";
        };
  
        const reduceMotion =
          window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;
  
        if (reduceMotion) {
          hideDropdown();
          return;
        }
  
        mobileFiltersCloseTimer =
          window.setTimeout(hideDropdown, 360);
      };
  
      if (filtersTitle && filtersDropdown) {
        syncFiltersTitleAria();
  
        filtersTitle.addEventListener(
          "click",
          (event) => {
            if (!isMobileFilters()) return;
  
            event.preventDefault();
            event.stopPropagation();
  
            setMobileFiltersOpen(
              !mobileFiltersOpen
            );
          }
        );
  
        filtersTitle.addEventListener(
          "keydown",
          (event) => {
            if (!isMobileFilters()) return;
  
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              setMobileFiltersOpen(
                !mobileFiltersOpen
              );
            }
  
            if (event.key === "Escape") {
              setMobileFiltersOpen(false);
            }
          }
        );
  
        document.addEventListener(
          "click",
          (event) => {
            if (
              !isMobileFilters() ||
              !mobileFiltersOpen
            ) {
              return;
            }
  
            if (
              filtersDropdown.contains(
                event.target
              )
            ) {
              return;
            }
  
            setMobileFiltersOpen(false);
          }
        );
  
        document.addEventListener(
          "keydown",
          (event) => {
            if (event.key !== "Escape") return;
            setMobileFiltersOpen(false);
          }
        );
  
        const onBreakpointChange = () => {
          mobileFiltersOpen = false;
          clearMobileFilterStyles();
          syncFiltersTitleAria();
        };
  
        if (
          typeof MOBILE_FILTERS_MQ.addEventListener ===
          "function"
        ) {
          MOBILE_FILTERS_MQ.addEventListener(
            "change",
            onBreakpointChange
          );
        } else if (
          typeof MOBILE_FILTERS_MQ.addListener ===
          "function"
        ) {
          MOBILE_FILTERS_MQ.addListener(
            onBreakpointChange
          );
        }
      }
  
  
      /* ==========================================================================
         PREVENT WEBFLOW FORM SUBMISSION
      ========================================================================== */
  
      if (form) {
        form.addEventListener(
          "submit",
          (event) => {
            event.preventDefault();
          }
        );
      }
  
  
      /* ==========================================================================
         INIT
      ========================================================================== */
  
      /*
        Cache CMS raw values first, then format visible price/km text.
      */
      buildBrandDropdown();
  
      formatDocumentValues();
  
      applyFilters();
    });
  })();