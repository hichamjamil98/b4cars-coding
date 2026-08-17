/* ==========================================================================
   B4CARS — ENTREPRISE VEHICLES FILTER + FIVE-CARD COVERFLOW
   Scoped only to .section.is--entreprise-slider

   Desktop:
   [far] [near] [CENTER] [near] [far]
   Looping. Cards outside the visible 5 enter from width 0.
   Speed: --cars-coverflow-duration (0.8s).
========================================================================== */

(() => {
  "use strict";

  window.addEventListener("load", () => {
    const section = document.querySelector(".section.is--entreprise-slider");
    if (!section) return;

    const filterItems = [...section.querySelectorAll(".filter--item[filter]")];

    const sliderWrapper = section.querySelector(".cars--slide-wrapper");
    const grid = sliderWrapper?.querySelector(".grid--cars");

    if (!filterItems.length || !sliderWrapper || !grid) return;

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

      item.querySelector(".card--item")?.classList.toggle("is--active", isActive);
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
        const stays = nextWindow.some((nextSlot) => nextSlot.item === slot.item);
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
            ease: window.B4CARS_EASE || "expo.out",
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
          `[B4Cars Entreprise] Aucun véhicule trouvé pour "${filterValue}".`,
          "Catégories réellement présentes dans la collection :",
          availableCategories,
        );
      }

      return matches;
    };

    const applyFilter = (filterItem, immediate = false) => {
      const filterValue = getFilterValue(filterItem);
      if (!filterValue) return;

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
              ease: window.B4CARS_EASE || "expo.out",
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
        ease: window.B4CARS_EASE || "expo.out",
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
      if (!card || card.dataset.entrepriseExpandReady === "true") return;

      card.dataset.entrepriseExpandReady = "true";

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
