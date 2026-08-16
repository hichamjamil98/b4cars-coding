/* ==========================================================================
   B4CARS — CAR TEMPLATE PAGE — V2

   Includes:
   - FAQ accordion
   - km / price formatting
   - Desktop custom gallery with smooth fixed-slot rotation
   - Tablet/mobile normal Swiper loop

   DESKTOP GALLERY
   ==========================================================================
   Visible slots:
   [PREV 3] [PREV 2] [PREV 1] [ACTIVE] [NEXT 1] [NEXT 2] [NEXT 3]

   ACTIVE always uses 100% of .container--768.is--car-slider.

   Pagination no longer rebuilds all visual roles from arbitrary clones.
   Existing visible nodes MOVE from one slot to the next, then only one
   hidden/recycled node enters from the outside.
========================================================================== */

(() => {
    "use strict";
  
    const DESKTOP_BREAKPOINT = 992;
    const MOBILE_SPEED = 650;
    const DESKTOP_DURATION = 680;
  
    const ROLE_CLASSES = [
      "b4-car-active",
      "b4-car-prev-1",
      "b4-car-prev-2",
      "b4-car-prev-3",
      "b4-car-next-1",
      "b4-car-next-2",
      "b4-car-next-3",
      "b4-car-enter-left",
      "b4-car-enter-right",
      "b4-car-exit-left",
      "b4-car-exit-right",
      "b4-car-hidden",
    ];
  
  
    document.addEventListener("DOMContentLoaded", () => {
  
      const page =
        document.querySelector(
          ".section.is--vehiculetemplate-hero"
        );
  
      if (!page) return;
  
  
      /* ==========================================================================
         FORMAT KM / PRICE
      ========================================================================== */
  
      const parseInteger = (
        value
      ) => {
  
        const cleaned =
          String(value ?? "")
            .replace(/[^\d-]/g, "");
  
  
        if (
          !cleaned ||
          cleaned === "-"
        ) {
          return null;
        }
  
  
        const number =
          Number.parseInt(
            cleaned,
            10
          );
  
  
        return Number.isFinite(
          number
        )
          ? number
          : null;
      };
  
  
      const formatGrouped = (
        number
      ) =>
        Math.round(number)
          .toString()
          .replace(
            /\B(?=(\d{3})+(?!\d))/g,
            "."
          );
  
  
      document
        .querySelectorAll(
          '[format="km"], [format="price"]'
        )
        .forEach(
          (
            element
          ) => {
  
            if (
              !element.dataset.b4RawValue
            ) {
  
              element.dataset.b4RawValue =
                element.textContent.trim();
  
            }
  
  
            const raw =
              parseInteger(
                element.dataset.b4RawValue
              );
  
  
            if (
              raw === null
            ) {
              return;
            }
  
  
            element.textContent =
              element.getAttribute(
                "format"
              ) === "km"
                ? `${formatGrouped(raw)}km`
                : `${formatGrouped(raw)}€`;
  
          }
        );
  
  
      /* ==========================================================================
         FAQ
      ========================================================================== */
  
      const faqSection =
        document.querySelector(
          ".section.is--vehiculetemplate-faq"
        );
  
  
      if (
        faqSection
      ) {
  
        const items =
          Array.from(
            faqSection.querySelectorAll(
              ".faq--item"
            )
          );
  
  
        const closeItem = (
          item
        ) => {
  
          const answer =
            item.querySelector(
              ".faq--answer"
            );
  
  
          if (
            !answer
          ) {
            return;
          }
  
  
          if (
            answer.style.height ===
            "auto"
          ) {
  
            answer.style.height =
              `${answer.scrollHeight}px`;
  
          }
  
  
          requestAnimationFrame(
            () => {
  
              answer.style.height =
                "0px";
  
  
              item.classList.remove(
                "is--open"
              );
  
  
              item
                .querySelector(
                  ".faq--question"
                )
                ?.setAttribute(
                  "aria-expanded",
                  "false"
                );
  
            }
          );
        };
  
  
        const openItem = (
          item
        ) => {
  
          items.forEach(
            (
              other
            ) => {
  
              if (
                other !== item &&
                other.classList.contains(
                  "is--open"
                )
              ) {
  
                closeItem(
                  other
                );
  
              }
  
            }
          );
  
  
          const answer =
            item.querySelector(
              ".faq--answer"
            );
  
  
          if (
            !answer
          ) {
            return;
          }
  
  
          item.classList.add(
            "is--open"
          );
  
  
          item
            .querySelector(
              ".faq--question"
            )
            ?.setAttribute(
              "aria-expanded",
              "true"
            );
  
  
          answer.style.height =
            `${answer.scrollHeight}px`;
  
  
          window.setTimeout(
            () => {
  
              if (
                item.classList.contains(
                  "is--open"
                )
              ) {
  
                answer.style.height =
                  "auto";
  
              }
  
            },
            620
          );
        };
  
  
        items.forEach(
          (
            item
          ) => {
  
            const question =
              item.querySelector(
                ".faq--question"
              );
  
  
            if (
              !question
            ) {
              return;
            }
  
  
            question.setAttribute(
              "role",
              "button"
            );
  
  
            question.setAttribute(
              "tabindex",
              "0"
            );
  
  
            question.setAttribute(
              "aria-expanded",
              "false"
            );
  
  
            const toggle = () => {
  
              if (
                item.classList.contains(
                  "is--open"
                )
              ) {
  
                closeItem(
                  item
                );
  
              } else {
  
                openItem(
                  item
                );
  
              }
  
            };
  
  
            question.addEventListener(
              "click",
              toggle
            );
  
  
            question.addEventListener(
              "keydown",
              (
                event
              ) => {
  
                if (
                  event.key !== "Enter" &&
                  event.key !== " "
                ) {
                  return;
                }
  
  
                event.preventDefault();
  
  
                toggle();
  
              }
            );
  
          }
        );
  
      }
  
  
      /* ==========================================================================
         GALLERY
      ========================================================================== */
  
      const swiperElement =
        page.querySelector(
          ".swiper.is--car"
        );
  
  
      const wrapper =
        swiperElement
          ?.querySelector(
            ".swiper-wrapper.is--car"
          );
  
  
      if (
        !swiperElement ||
        !wrapper
      ) {
        return;
      }
  
  
      const previousButton =
        page.querySelector(
          ".swiper--navigation.is--car .swiper--btn.is--previous"
        );
  
  
      const nextButton =
        page.querySelector(
          ".swiper--navigation.is--car .swiper--btn.is--next"
        );
  
  
      const desktopMedia =
        window.matchMedia(
          `(min-width: ${DESKTOP_BREAKPOINT}px)`
        );
  
  
      let mobileSwiper =
        null;
  
  
      let currentIndex =
        0;
  
  
      let isAnimating =
        false;
  
  
      let desktopClones =
        [];
  
  
      const isDesktop = () =>
        desktopMedia.matches;
  
  
      const mod = (
        value,
        total
      ) =>
        (
          (value % total)
          + total
        ) % total;
  
  
      const originalSlides = () =>
        Array.from(
          wrapper.querySelectorAll(
            ':scope > .swiper-slide.is--car:not([data-b4-clone="true"])'
          )
        );
  
  
      const allDesktopSlides = () =>
        Array.from(
          wrapper.querySelectorAll(
            ":scope > .swiper-slide.is--car"
          )
        );
  
  
      const clearRoleClasses = (
        slide
      ) => {
  
        ROLE_CLASSES.forEach(
          (
            className
          ) => {
  
            slide.classList.remove(
              className
            );
  
          }
        );
      };
  
  
      const role = (
        className
      ) =>
        wrapper.querySelector(
          `:scope > .swiper-slide.is--car.${className}`
        );
  
  
      /* ==========================================================================
         CLONE / POOL MANAGEMENT
      ========================================================================== */
  
      const removeDesktopClones = () => {
  
        desktopClones.forEach(
          (
            clone
          ) => {
  
            clone.remove();
  
          }
        );
  
  
        desktopClones =
          [];
      };
  
  
      const createCloneForLogical = (
        logicalIndex
      ) => {
  
        const originals =
          originalSlides();
  
  
        const total =
          originals.length;
  
  
        if (
          !total
        ) {
          return null;
        }
  
  
        const source =
          originals[
            mod(
              logicalIndex,
              total
            )
          ];
  
  
        const clone =
          source.cloneNode(
            true
          );
  
  
        clone.dataset.b4Clone =
          "true";
  
  
        clone.dataset.b4LogicalIndex =
          String(
            mod(
              logicalIndex,
              total
            )
          );
  
  
        clone.removeAttribute(
          "id"
        );
  
  
        clearRoleClasses(
          clone
        );
  
  
        clone.classList.add(
          "b4-car-hidden"
        );
  
  
        wrapper.appendChild(
          clone
        );
  
  
        desktopClones.push(
          clone
        );
  
  
        return clone;
      };
  
  
      const buildDesktopPool = () => {
  
        removeDesktopClones();
  
  
        const originals =
          originalSlides();
  
  
        originals.forEach(
          (
            slide,
            index
          ) => {
  
            slide.dataset.b4LogicalIndex =
              String(index);
  
  
            clearRoleClasses(
              slide
            );
  
  
            slide.classList.add(
              "b4-car-hidden"
            );
  
          }
        );
  
  
        /*
          7 visible nodes + spare hidden nodes make recycling seamless.
        */
        while (
          allDesktopSlides().length <
          10
        ) {
  
          const index =
            allDesktopSlides().length %
            originals.length;
  
  
          createCloneForLogical(
            index
          );
  
        }
      };
  
  
      const hiddenNodeForLogical = (
        logicalIndex
      ) => {
  
        const target =
          String(
            mod(
              logicalIndex,
              originalSlides().length
            )
          );
  
  
        let node =
          allDesktopSlides()
            .find(
              (
                slide
              ) =>
                slide.dataset.b4LogicalIndex ===
                  target &&
                slide.classList.contains(
                  "b4-car-hidden"
                )
            );
  
  
        if (
          !node
        ) {
  
          node =
            createCloneForLogical(
              logicalIndex
            );
  
        }
  
  
        return node;
      };
  
  
      /* ==========================================================================
         INITIAL DESKTOP COMPOSITION
      ========================================================================== */
  
      const takeUnusedLogicalNode = (
        logicalIndex,
        used
      ) => {
  
        const target =
          String(
            mod(
              logicalIndex,
              originalSlides().length
            )
          );
  
  
        let node =
          allDesktopSlides()
            .find(
              (
                slide
              ) =>
                slide.dataset.b4LogicalIndex ===
                  target &&
                !used.has(
                  slide
                )
            );
  
  
        if (
          !node
        ) {
  
          node =
            createCloneForLogical(
              logicalIndex
            );
  
        }
  
  
        used.add(
          node
        );
  
  
        return node;
      };
  
  
      const setupDesktopComposition = () => {
  
        const total =
          originalSlides().length;
  
  
        if (
          !total
        ) {
          return;
        }
  
  
        wrapper.classList.add(
          "is-no-transition"
        );
  
  
        allDesktopSlides()
          .forEach(
            (
              slide
            ) => {
  
              clearRoleClasses(
                slide
              );
  
  
              slide.classList.add(
                "b4-car-hidden"
              );
  
            }
          );
  
  
        const used =
          new Set();
  
  
        const roles = [
          [-3, "b4-car-prev-3"],
          [-2, "b4-car-prev-2"],
          [-1, "b4-car-prev-1"],
          [0,  "b4-car-active"],
          [1,  "b4-car-next-1"],
          [2,  "b4-car-next-2"],
          [3,  "b4-car-next-3"],
        ];
  
  
        roles.forEach(
          (
            [offset, className]
          ) => {
  
            const node =
              takeUnusedLogicalNode(
                currentIndex +
                  offset,
                used
              );
  
  
            clearRoleClasses(
              node
            );
  
  
            node.classList.add(
              className
            );
  
          }
        );
  
  
        void wrapper.offsetWidth;
  
  
        requestAnimationFrame(
          () => {
  
            wrapper.classList.remove(
              "is-no-transition"
            );
  
          }
        );
      };
  
  
      /* ==========================================================================
         NEXT — SMOOTH ONE-SLOT ROTATION
      ========================================================================== */
  
      const nextDesktop = () => {
  
        if (
          !isDesktop() ||
          isAnimating
        ) {
          return;
        }
  
  
        const total =
          originalSlides().length;
  
  
        if (
          total < 2
        ) {
          return;
        }
  
  
        isAnimating =
          true;
  
  
        const prev3 =
          role(
            "b4-car-prev-3"
          );
  
  
        const prev2 =
          role(
            "b4-car-prev-2"
          );
  
  
        const prev1 =
          role(
            "b4-car-prev-1"
          );
  
  
        const active =
          role(
            "b4-car-active"
          );
  
  
        const next1 =
          role(
            "b4-car-next-1"
          );
  
  
        const next2 =
          role(
            "b4-car-next-2"
          );
  
  
        const next3 =
          role(
            "b4-car-next-3"
          );
  
  
        const newLogical =
          mod(
            currentIndex + 4,
            total
          );
  
  
        const incoming =
          hiddenNodeForLogical(
            newLogical
          );
  
  
        /*
          Prepare the new far-right slide outside the visible composition.
        */
        incoming.classList.add(
          "is-no-transition"
        );
  
  
        clearRoleClasses(
          incoming
        );
  
  
        incoming.classList.add(
          "b4-car-enter-right"
        );
  
  
        void incoming.offsetWidth;
  
  
        incoming.classList.remove(
          "is-no-transition"
        );
  
  
        /*
          Every currently visible node moves exactly one slot.
        */
        clearRoleClasses(
          prev3
        );
  
        prev3.classList.add(
          "b4-car-exit-left"
        );
  
  
        clearRoleClasses(
          prev2
        );
  
        prev2.classList.add(
          "b4-car-prev-3"
        );
  
  
        clearRoleClasses(
          prev1
        );
  
        prev1.classList.add(
          "b4-car-prev-2"
        );
  
  
        clearRoleClasses(
          active
        );
  
        active.classList.add(
          "b4-car-prev-1"
        );
  
  
        clearRoleClasses(
          next1
        );
  
        next1.classList.add(
          "b4-car-active"
        );
  
  
        clearRoleClasses(
          next2
        );
  
        next2.classList.add(
          "b4-car-next-1"
        );
  
  
        clearRoleClasses(
          next3
        );
  
        next3.classList.add(
          "b4-car-next-2"
        );
  
  
        requestAnimationFrame(
          () => {
  
            clearRoleClasses(
              incoming
            );
  
  
            incoming.classList.add(
              "b4-car-next-3"
            );
  
          }
        );
  
  
        window.setTimeout(
          () => {
  
            prev3.classList.add(
              "is-no-transition"
            );
  
  
            clearRoleClasses(
              prev3
            );
  
  
            prev3.classList.add(
              "b4-car-hidden"
            );
  
  
            void prev3.offsetWidth;
  
  
            prev3.classList.remove(
              "is-no-transition"
            );
  
  
            currentIndex =
              mod(
                currentIndex + 1,
                total
              );
  
  
            isAnimating =
              false;
  
          },
          DESKTOP_DURATION + 30
        );
      };
  
  
      /* ==========================================================================
         PREVIOUS — SMOOTH ONE-SLOT ROTATION
      ========================================================================== */
  
      const previousDesktop = () => {
  
        if (
          !isDesktop() ||
          isAnimating
        ) {
          return;
        }
  
  
        const total =
          originalSlides().length;
  
  
        if (
          total < 2
        ) {
          return;
        }
  
  
        isAnimating =
          true;
  
  
        const prev3 =
          role(
            "b4-car-prev-3"
          );
  
  
        const prev2 =
          role(
            "b4-car-prev-2"
          );
  
  
        const prev1 =
          role(
            "b4-car-prev-1"
          );
  
  
        const active =
          role(
            "b4-car-active"
          );
  
  
        const next1 =
          role(
            "b4-car-next-1"
          );
  
  
        const next2 =
          role(
            "b4-car-next-2"
          );
  
  
        const next3 =
          role(
            "b4-car-next-3"
          );
  
  
        const newLogical =
          mod(
            currentIndex - 4,
            total
          );
  
  
        const incoming =
          hiddenNodeForLogical(
            newLogical
          );
  
  
        incoming.classList.add(
          "is-no-transition"
        );
  
  
        clearRoleClasses(
          incoming
        );
  
  
        incoming.classList.add(
          "b4-car-enter-left"
        );
  
  
        void incoming.offsetWidth;
  
  
        incoming.classList.remove(
          "is-no-transition"
        );
  
  
        clearRoleClasses(
          next3
        );
  
        next3.classList.add(
          "b4-car-exit-right"
        );
  
  
        clearRoleClasses(
          next2
        );
  
        next2.classList.add(
          "b4-car-next-3"
        );
  
  
        clearRoleClasses(
          next1
        );
  
        next1.classList.add(
          "b4-car-next-2"
        );
  
  
        clearRoleClasses(
          active
        );
  
        active.classList.add(
          "b4-car-next-1"
        );
  
  
        clearRoleClasses(
          prev1
        );
  
        prev1.classList.add(
          "b4-car-active"
        );
  
  
        clearRoleClasses(
          prev2
        );
  
        prev2.classList.add(
          "b4-car-prev-1"
        );
  
  
        clearRoleClasses(
          prev3
        );
  
        prev3.classList.add(
          "b4-car-prev-2"
        );
  
  
        requestAnimationFrame(
          () => {
  
            clearRoleClasses(
              incoming
            );
  
  
            incoming.classList.add(
              "b4-car-prev-3"
            );
  
          }
        );
  
  
        window.setTimeout(
          () => {
  
            next3.classList.add(
              "is-no-transition"
            );
  
  
            clearRoleClasses(
              next3
            );
  
  
            next3.classList.add(
              "b4-car-hidden"
            );
  
  
            void next3.offsetWidth;
  
  
            next3.classList.remove(
              "is-no-transition"
            );
  
  
            currentIndex =
              mod(
                currentIndex - 1,
                total
              );
  
  
            isAnimating =
              false;
  
          },
          DESKTOP_DURATION + 30
        );
      };
  
  
      /* ==========================================================================
         TABLET / MOBILE
      ========================================================================== */
  
      const cleanInlineStyles = () => {
  
        wrapper.style.removeProperty(
          "transform"
        );
  
  
        wrapper.style.removeProperty(
          "height"
        );
  
  
        allDesktopSlides()
          .forEach(
            (
              slide
            ) => {
  
              [
                "width",
                "height",
                "transform",
                "opacity",
                "margin-right",
                "left",
                "top",
                "position",
              ].forEach(
                (
                  property
                ) => {
  
                  slide.style.removeProperty(
                    property
                  );
  
                }
              );
  
            }
          );
      };
  
  
      const destroyMobile = () => {
  
        if (
          mobileSwiper &&
          typeof mobileSwiper.destroy
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
  
  
      const enableDesktop = () => {
  
        destroyMobile();
  
  
        cleanInlineStyles();
  
  
        buildDesktopPool();
  
  
        setupDesktopComposition();
  
      };
  
  
      const enableMobile = () => {
  
        removeDesktopClones();
  
  
        allDesktopSlides()
          .forEach(
            (
              slide
            ) => {
  
              clearRoleClasses(
                slide
              );
  
            }
          );
  
  
        cleanInlineStyles();
  
  
        if (
          mobileSwiper
        ) {
          return;
        }
  
  
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
              loop:
                true,
  
              initialSlide:
                currentIndex,
  
              slidesPerView:
                1,
  
              slidesPerGroup:
                1,
  
              /*
                1.5rem at a 16px root.
                Swiper expects a numeric pixel value.
              */
              spaceBetween:
                24,
  
              speed:
                MOBILE_SPEED,
  
              allowTouchMove:
                true,
  
              simulateTouch:
                true,
  
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
         BUTTONS
      ========================================================================== */
  
      nextButton
        ?.addEventListener(
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
  
  
            nextDesktop();
  
          },
          true
        );
  
  
      previousButton
        ?.addEventListener(
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
  
  
            previousDesktop();
  
          },
          true
        );
  
  
      /* ==========================================================================
         CLICK SIDE SLIDES
         Level 1 = one step.
         Level 2/3 = repeated smooth steps.
      ========================================================================== */
  
      const runSteps = (
        direction,
        count
      ) => {
  
        if (
          count <= 0
        ) {
          return;
        }
  
  
        const run = (
          remaining
        ) => {
  
          if (
            remaining <= 0
          ) {
            return;
          }
  
  
          if (
            direction > 0
          ) {
  
            nextDesktop();
  
          } else {
  
            previousDesktop();
  
          }
  
  
          if (
            remaining > 1
          ) {
  
            window.setTimeout(
              () => {
  
                run(
                  remaining - 1
                );
  
              },
              DESKTOP_DURATION + 55
            );
  
          }
  
        };
  
  
        run(
          count
        );
  
      };
  
  
      wrapper.addEventListener(
        "click",
        (
          event
        ) => {
  
          if (
            !isDesktop() ||
            isAnimating
          ) {
            return;
          }
  
  
          const slide =
            event.target.closest(
              ".swiper-slide.is--car"
            );
  
  
          if (
            !slide ||
            slide.classList.contains(
              "b4-car-active"
            )
          ) {
            return;
          }
  
  
          if (
            slide.classList.contains(
              "b4-car-next-1"
            )
          ) {
            return runSteps(
              1,
              1
            );
          }
  
  
          if (
            slide.classList.contains(
              "b4-car-next-2"
            )
          ) {
            return runSteps(
              1,
              2
            );
          }
  
  
          if (
            slide.classList.contains(
              "b4-car-next-3"
            )
          ) {
            return runSteps(
              1,
              3
            );
          }
  
  
          if (
            slide.classList.contains(
              "b4-car-prev-1"
            )
          ) {
            return runSteps(
              -1,
              1
            );
          }
  
  
          if (
            slide.classList.contains(
              "b4-car-prev-2"
            )
          ) {
            return runSteps(
              -1,
              2
            );
          }
  
  
          if (
            slide.classList.contains(
              "b4-car-prev-3"
            )
          ) {
  
            return runSteps(
              -1,
              3
            );
  
          }
  
        }
      );
  
  
      /* ==========================================================================
         BREAKPOINT / RESIZE
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
  
  
      let resizeTimer =
        null;
  
  
      window.addEventListener(
        "resize",
        () => {
  
          clearTimeout(
            resizeTimer
          );
  
  
          resizeTimer =
            window.setTimeout(
              () => {
  
                if (
                  isDesktop()
                ) {
  
                  setupDesktopComposition();
  
                } else {
  
                  mobileSwiper
                    ?.update();
  
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