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

    if (prefersReducedMotion) {
      revealPageWithoutAnimation();
      return;
    }

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
     VEHICLES FILTER + FIVE-CARD COVERFLOW
     Scoped only to .section.is--home-slider

     Desktop:
     [far] [near] [CENTER] [near] [far]
     Looping. Cards outside the visible 5 enter from width 0.
     Speed: --cars-coverflow-duration (0.8s).
  ========================================================================== */

(() => {
  "use strict";

  window.addEventListener("load", () => {
    const section = document.querySelector(".section.is--home-slider");
    if (!section) return;

    const filterItems = [...section.querySelectorAll(".filter--item[filter]")];

    const grid = section.querySelector(".grid--cars");
    if (!filterItems.length || !grid) return;

    const collectionItems = [
      ...grid.querySelectorAll(":scope > .collection--item"),
    ];

    if (!collectionItems.length) return;

    const DEFAULT_FILTER = "En Stock";
    const MAX_VISIBLE = 5;
    const DESKTOP_QUERY = "(min-width: 992px)";
    const SWIPE_THRESHOLD = 48;
    const COVERFLOW_DURATION_MS = 800;
    const SLOT_CLASSES = [
      "is--slot-prev-2",
      "is--slot-prev-1",
      "is--slot-next-1",
      "is--slot-next-2",
    ];
    const STATE_CLASSES = [
      ...SLOT_CLASSES,
      "is--entering",
      "is--exiting",
      "is-no-transition",
    ];

    let matchingItems = [];
    let visibleItems = [];
    let visibleWindow = [];
    let activeItem = null;
    let activeIndex = 0;
    let activeFilterValue = "";
    let pointerStartX = 0;
    let didSwipe = false;
    let isAnimating = false;
    let animationTimer = 0;

    const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;

    const durationMs = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : COVERFLOW_DURATION_MS;

    const mod = (value, total) => {
      if (total <= 0) return 0;
      return ((value % total) + total) % total;
    };

    const shortestDelta = (from, to, total) => {
      if (!total) return 0;
      const delta = mod(to - from, total);
      return delta > total / 2 ? delta - total : delta;
    };

    const clearAnimationTimer = () => {
      if (!animationTimer) return;
      window.clearTimeout(animationTimer);
      animationTimer = 0;
    };

    const removeClones = () => {
      grid
        .querySelectorAll(":scope > .collection--item.is--clone")
        .forEach((clone) => clone.remove());
    };

    const normalizeValue = (value = "") =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const getFilterValue = (filterItem) =>
      normalizeValue(filterItem.getAttribute("filter") || "");

    const getItemCategory = (item) =>
      normalizeValue(
        item.querySelector('[filter="category"]')?.textContent || "",
      );

    const updateFilterButtons = (selectedItem) => {
      filterItems.forEach((filterItem) => {
        const isActive = filterItem === selectedItem;

        filterItem.classList.toggle("is--active", isActive);
        filterItem.setAttribute("aria-pressed", isActive ? "true" : "false");

        const link = filterItem.querySelector("a");
        link?.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };

    const resetItem = (item) => {
      item.classList.remove("is--visible", "is--active", ...STATE_CLASSES);
      item.setAttribute("aria-hidden", "true");
      item.style.display = "none";
      item.style.removeProperty("--card-grow");
      item.style.removeProperty("order");
      item.querySelector(".card--item")?.classList.remove("is--active");
    };

    const hideAllItems = () => {
      clearAnimationTimer();
      isAnimating = false;
      removeClones();
      collectionItems.forEach(resetItem);
      visibleItems = [];
      visibleWindow = [];
    };

    const captureFrozenImageSize = (referenceItem) => {
      if (!referenceItem) return;

      const wrapper = referenceItem.querySelector(".car--image-wrapper");
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      grid.style.setProperty("--frozen-image-width", `${rect.width}px`);
      grid.style.setProperty("--frozen-image-height", `${rect.height}px`);
    };

    const slotClassForOffset = (offset) => {
      if (offset === -2) return "is--slot-prev-2";
      if (offset === -1) return "is--slot-prev-1";
      if (offset === 1) return "is--slot-next-1";
      if (offset === 2) return "is--slot-next-2";
      return "";
    };

    const getWindowForIndex = (index) => {
      const total = matchingItems.length;
      if (!total) return [];

      const visible = Math.min(MAX_VISIBLE, total);
      const centerOffset = Math.floor((visible - 1) / 2);

      return Array.from({ length: visible }, (_, slotIndex) => {
        const itemIndex = mod(index - centerOffset + slotIndex, total);

        return {
          item: matchingItems[itemIndex],
          itemIndex,
          offset: slotIndex - centerOffset,
        };
      });
    };

    const getInitialIndex = (items) => {
      const visible = Math.min(MAX_VISIBLE, items.length);
      if (!visible) return 0;
      const start = Math.max(0, items.length - visible);
      return start + Math.floor((visible - 1) / 2);
    };

    const applySlotToItem = (item, offset, order, desktop) => {
      const slotClass = slotClassForOffset(offset);
      const isActive = offset === 0;

      item.classList.remove("is--active", ...SLOT_CLASSES);
      item.classList.add("is--visible");
      item.classList.toggle("is--active", isActive);
      if (slotClass) item.classList.add(slotClass);

      item.style.display = "";
      item.setAttribute("aria-hidden", "false");

      if (desktop) {
        item.style.order = String(order);
      } else {
        item.style.removeProperty("order");
      }

      item
        .querySelector(".card--item")
        ?.classList.toggle("is--active", isActive);
    };

    const createIncomingClone = (slot) => {
      const clone = slot.item.cloneNode(true);
      const slotClass = slotClassForOffset(slot.offset);

      clone.classList.add(
        "is--clone",
        "is--visible",
        "is-no-transition",
        "is--entering",
      );
      clone.classList.remove("is--active", "is--exiting", ...SLOT_CLASSES);
      if (slotClass) clone.classList.add(slotClass);

      clone.dataset.b4Clone = "true";
      clone.setAttribute("aria-hidden", "true");
      clone.style.display = "";
      clone.querySelector(".card--item")?.classList.remove("is--active");
      clone.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
      });

      grid.appendChild(clone);
      return clone;
    };

    const layoutImmediate = (nextIndex) => {
      removeClones();

      collectionItems.forEach((item) => {
        if (!matchingItems.includes(item)) resetItem(item);
      });

      if (!isDesktop()) {
        matchingItems.forEach((item, itemIndex) => {
          item.classList.remove("is--active", ...STATE_CLASSES);
          item.classList.add("is--visible");
          item.style.display = "";
          item.style.removeProperty("order");
          item.setAttribute("aria-hidden", "false");
          item
            .querySelector(".card--item")
            ?.classList.toggle("is--active", itemIndex === nextIndex);
          item.classList.toggle("is--active", itemIndex === nextIndex);
        });

        collectionItems.forEach((item) => {
          if (!matchingItems.includes(item)) resetItem(item);
        });

        visibleWindow = matchingItems.map((item, itemIndex) => ({
          item,
          itemIndex,
          offset: itemIndex - nextIndex,
        }));
        visibleItems = matchingItems.slice();
        activeIndex = nextIndex;
        activeItem = matchingItems[nextIndex] || null;
        return;
      }

      matchingItems.forEach(resetItem);

      const nextWindow = getWindowForIndex(nextIndex);

      nextWindow.forEach((slot, order) => {
        slot.item.classList.remove(
          "is--entering",
          "is--exiting",
          "is-no-transition",
        );
        applySlotToItem(slot.item, slot.offset, order, true);
      });

      visibleWindow = nextWindow;
      visibleItems = nextWindow.map((slot) => slot.item);
      activeIndex = nextIndex;
      activeItem = matchingItems[nextIndex] || null;
    };

    const setActiveIndex = (nextIndex, immediate = false) => {
      const total = matchingItems.length;
      if (!total) return;

      nextIndex = mod(nextIndex, total);

      if (immediate || !isDesktop() || !visibleWindow.length) {
        layoutImmediate(nextIndex);
        return;
      }

      if (isAnimating || nextIndex === activeIndex) return;

      const prevWindow = visibleWindow.slice();
      const nextWindow = getWindowForIndex(nextIndex);
      const direction = shortestDelta(activeIndex, nextIndex, total);
      const forward = direction > 0;
      const prevByItem = new Map(prevWindow.map((slot) => [slot.item, slot]));
      const wrapping = [];
      const incoming = [];
      const outgoing = [];

      nextWindow.forEach((slot) => {
        const prevSlot = prevByItem.get(slot.item);

        if (!prevSlot) {
          incoming.push(slot);
          return;
        }

        const wrapped = forward
          ? prevSlot.offset < 0 && slot.offset > 0
          : prevSlot.offset > 0 && slot.offset < 0;

        if (wrapped) wrapping.push(slot);
      });

      prevWindow.forEach((slot) => {
        const stays = nextWindow.some(
          (nextSlot) => nextSlot.item === slot.item,
        );
        const wraps = wrapping.some((nextSlot) => nextSlot.item === slot.item);

        if (!stays || wraps) outgoing.push(slot.item);
      });

      isAnimating = true;

      const incomingNodes = [
        ...wrapping.map((slot) => ({
          node: createIncomingClone(slot),
          slot,
        })),
        ...incoming.map((slot) => {
          slot.item.classList.add(
            "is--visible",
            "is-no-transition",
            "is--entering",
          );
          slot.item.classList.remove("is--exiting");
          slot.item.style.display = "";
          slot.item.setAttribute("aria-hidden", "false");

          return { node: slot.item, slot };
        }),
      ];

      outgoing.forEach((item) => {
        item.classList.add("is--exiting");
        item.classList.remove("is--active", ...SLOT_CLASSES);
        item.querySelector(".card--item")?.classList.remove("is--active");
      });

      const leftNodes = forward
        ? outgoing.slice()
        : incomingNodes.map(({ node }) => node);
      const rightNodes = forward
        ? incomingNodes.map(({ node }) => node)
        : outgoing.slice();
      const middleNodes = [];

      nextWindow.forEach((slot) => {
        if (wrapping.some((wrapSlot) => wrapSlot.item === slot.item)) return;
        middleNodes.push(slot.item);
        applySlotToItem(slot.item, slot.offset, 0, true);
      });

      incomingNodes.forEach(({ node, slot }) => {
        applySlotToItem(node, slot.offset, 0, true);
        node.classList.add("is--entering", "is-no-transition");
        node.classList.remove("is--active");
        node.querySelector(".card--item")?.classList.remove("is--active");
      });

      let order = 0;
      [...leftNodes, ...middleNodes, ...rightNodes].forEach((node) => {
        node.style.order = String(order);
        order += 1;
      });

      incomingNodes.forEach(({ node }) => {
        void node.offsetWidth;
      });

      requestAnimationFrame(() => {
        incomingNodes.forEach(({ node }) => {
          node.classList.remove("is-no-transition");
        });

        requestAnimationFrame(() => {
          incomingNodes.forEach(({ node }) => {
            node.classList.remove("is--entering");
          });
        });
      });

      visibleWindow = nextWindow;
      visibleItems = nextWindow.map((slot) => slot.item);
      activeIndex = nextIndex;
      activeItem = matchingItems[nextIndex] || null;

      if (typeof window.gsap !== "undefined" && activeItem) {
        window.gsap.fromTo(
          activeItem,
          { opacity: 0.96 },
          {
            opacity: 1,
            duration: 0.28,
            ease: window.B4CARS_EASE,
            overwrite: true,
          },
        );
      }

      animationTimer = window.setTimeout(() => {
        outgoing.forEach((item) => {
          const slot = nextWindow.find((entry) => entry.item === item);
          item.classList.remove("is--exiting");

          if (slot) {
            item.classList.add("is-no-transition");
            applySlotToItem(item, slot.offset, 0, true);
            void item.offsetWidth;
            item.classList.remove("is-no-transition");
          } else {
            resetItem(item);
          }
        });

        removeClones();

        nextWindow.forEach((slot, orderIndex) => {
          slot.item.classList.remove(
            "is--entering",
            "is--exiting",
            "is-no-transition",
          );
          applySlotToItem(slot.item, slot.offset, orderIndex, true);
        });

        isAnimating = false;
        animationTimer = 0;
      }, durationMs());
    };

    const goToNeighbor = (direction) => {
      if (!matchingItems.length || isAnimating) return;
      setActiveIndex(activeIndex + direction);
    };

    const showItems = (items) => {
      matchingItems = items;
      setActiveIndex(getInitialIndex(items), true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (activeItem) captureFrozenImageSize(activeItem);
        });
      });
    };

    const getMatchingItems = (filterValue) => {
      const matches = collectionItems.filter(
        (item) => getItemCategory(item) === filterValue,
      );

      if (!matches.length) {
        const availableCategories = [
          ...new Set(collectionItems.map(getItemCategory).filter(Boolean)),
        ];

        console.warn(
          `[B4Cars] Aucun véhicule trouvé pour "${filterValue}".`,
          "Catégories réellement présentes dans la collection :",
          availableCategories,
        );
      }

      return matches;
    };

    const applyFilter = (filterItem, immediate = false) => {
      const filterValue = getFilterValue(filterItem);
      if (!filterValue) return;

      activeFilterValue = filterValue;
      updateFilterButtons(filterItem);

      const matches = getMatchingItems(filterValue);
      const oldItems = visibleItems.slice();

      const render = () => {
        hideAllItems();
        showItems(matches);

        if (
          !immediate &&
          matches.length &&
          typeof window.gsap !== "undefined"
        ) {
          window.gsap.fromTo(
            visibleItems,
            {
              opacity: 0,
              y: "0.75rem",
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.05,
              ease: window.B4CARS_EASE,
              clearProps: "opacity,transform",
            },
          );
        }
      };

      if (immediate || !oldItems.length || typeof window.gsap === "undefined") {
        render();
        return;
      }

      window.gsap.to(oldItems, {
        opacity: 0,
        duration: 0.22,
        stagger: {
          each: 0.025,
          from: "center",
        },
        ease: window.B4CARS_EASE,
        overwrite: true,
        onComplete: render,
      });
    };

    filterItems.forEach((filterItem) => {
      const trigger = filterItem.querySelector("a") || filterItem;

      filterItem.setAttribute("role", "button");
      filterItem.setAttribute("aria-pressed", "false");

      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        applyFilter(filterItem);
      });

      trigger.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        applyFilter(filterItem);
      });
    });

    collectionItems.forEach((item) => {
      const card = item.querySelector(".card--item");
      if (!card || card.dataset.expandReady === "true") return;

      card.dataset.expandReady = "true";

      card.addEventListener("click", (event) => {
        if (!matchingItems.includes(item)) return;

        if (didSwipe) {
          didSwipe = false;
          event.preventDefault();
          return;
        }

        if (isAnimating) {
          event.preventDefault();
          return;
        }

        const slot = visibleWindow.find((entry) => entry.item === item);
        if (!slot || slot.offset === 0) return;

        event.preventDefault();
        event.stopPropagation();
        setActiveIndex(activeIndex + slot.offset);
      });
    });

    grid.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerStartX = event.clientX;
      didSwipe = false;
    });

    grid.addEventListener("pointerup", (event) => {
      if (!pointerStartX) return;

      const deltaX = event.clientX - pointerStartX;
      pointerStartX = 0;

      if (!isDesktop() || isAnimating || Math.abs(deltaX) < SWIPE_THRESHOLD) {
        return;
      }

      didSwipe = true;
      goToNeighbor(deltaX < 0 ? 1 : -1);
    });

    grid.addEventListener("keydown", (event) => {
      if (!isDesktop()) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNeighbor(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToNeighbor(-1);
      }
    });

    if (!grid.hasAttribute("tabindex")) {
      grid.setAttribute("tabindex", "0");
    }

    window.addEventListener("resize", () => {
      if (!matchingItems.length) return;

      setActiveIndex(activeIndex, true);

      requestAnimationFrame(() => {
        if (activeItem) captureFrozenImageSize(activeItem);
      });
    });

    const defaultFilterItem =
      filterItems.find(
        (item) => getFilterValue(item) === normalizeValue(DEFAULT_FILTER),
      ) || filterItems[0];

    filterItems.forEach((item) => {
      item.classList.remove("is--active");
      item.setAttribute("aria-pressed", "false");
      item.querySelector("a")?.setAttribute("aria-current", "false");
    });

    hideAllItems();

    requestAnimationFrame(() => {
      applyFilter(defaultFilterItem, true);
    });
  });
})();

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

    const slides = Array.from(
      viewport.querySelectorAll("[data-cascading-slide]"),
    );
    let totalSlides = slides.length;

    if (totalSlides === 0) return;

    if (totalSlides < 9) {
      const originalSlides = slides.slice();
      while (slides.length < 9) {
        originalSlides.forEach(function (original) {
          const clone = original.cloneNode(true);
          clone.setAttribute("data-clone", "");
          viewport.appendChild(clone);
          slides.push(clone);
        });
      }
      totalSlides = slides.length;
    }

    let activeIndex = 0;
    let isAnimating = false;
    let slideWidth = 0;
    let slotCenters = {};
    let slotWidths = {};

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

    slides.forEach(function (slide, index) {
      slide.addEventListener("click", function () {
        if (index !== activeIndex) goTo(index);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") goTo(activeIndex - 1);
      if (event.key === "ArrowRight") goTo(activeIndex + 1);
    });

    let resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        measure();
        layout(false);
      }, 100);
    });

    measure();
    layout(false);
  }
}

// Initialize Cascading Slider
document.addEventListener("DOMContentLoaded", function () {
  initCascadingSlider();
});
