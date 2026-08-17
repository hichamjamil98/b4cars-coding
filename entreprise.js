/* ==========================================================================
   B4CARS — ENTREPRISE VEHICLES FILTER + FIVE-CARD COVERFLOW
   Scoped only to .section.is--entreprise-slider

   Desktop:
   [far] [near] [CENTER] [near] [far]
   Click or swipe a side card to rotate it into the center.
========================================================================== */

(() => {
    "use strict";
  
    window.addEventListener("load", () => {
      const section = document.querySelector(".section.is--entreprise-slider");
      if (!section) return;
  
      const filterItems = [
        ...section.querySelectorAll(".filter--item[filter]"),
      ];
  
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
      const SLOT_CLASSES = [
        "is--slot-prev-2",
        "is--slot-prev-1",
        "is--slot-next-1",
        "is--slot-next-2",
      ];
  
      let visibleItems = [];
      let activeItem = null;
      let pointerStartX = 0;
      let didSwipe = false;
  
      const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;
  
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
          item.querySelector('[filter="category"]')?.textContent || ""
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
  
      const hideAllItems = () => {
        collectionItems.forEach((item) => {
          item.classList.remove("is--visible", "is--active", ...SLOT_CLASSES);
          item.setAttribute("aria-hidden", "true");
          item.style.display = "none";
          item.style.removeProperty("--card-grow");
          item.style.removeProperty("order");
  
          item
            .querySelector(".card--item")
            ?.classList.remove("is--active");
        });
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
  
      const rotateVisibleItems = (target) => {
        const length = visibleItems.length;
        if (length < 2) return;
  
        const centerIndex = Math.floor((length - 1) / 2);
        const fromIndex = visibleItems.indexOf(target);
        if (fromIndex < 0 || fromIndex === centerIndex) return;
  
        const shift = fromIndex - centerIndex;
  
        visibleItems = visibleItems.map(
          (_, index) => visibleItems[(index + shift + length) % length]
        );
      };
  
      const applySlotLayout = () => {
        const desktop = isDesktop();
        const centerIndex = Math.floor((visibleItems.length - 1) / 2);
  
        visibleItems.forEach((item, index) => {
          const offset = index - centerIndex;
          const isActive = offset === 0;
          const slotClass = slotClassForOffset(offset);
  
          item.classList.remove("is--active", ...SLOT_CLASSES);
          item.classList.toggle("is--active", isActive);
          if (slotClass) item.classList.add(slotClass);
  
          if (desktop) {
            item.style.order = String(index);
          } else {
            item.style.removeProperty("order");
          }
  
          item
            .querySelector(".card--item")
            ?.classList.toggle("is--active", isActive);
        });
      };
  
      const setActiveCard = (item, immediate = false) => {
        if (!item || !visibleItems.includes(item)) return;
        if (!immediate && item === activeItem) return;
  
        if (isDesktop()) {
          rotateVisibleItems(item);
        }
  
        activeItem = item;
        applySlotLayout();
  
        if (
          !immediate &&
          typeof window.gsap !== "undefined"
        ) {
          window.gsap.fromTo(
            activeItem,
            { opacity: 0.96 },
            {
              opacity: 1,
              duration: 0.28,
              ease: window.B4CARS_EASE || "expo.out",
              overwrite: true,
            }
          );
        }
      };
  
      const goToNeighbor = (direction) => {
        if (!visibleItems.length) return;
  
        const centerIndex = Math.floor((visibleItems.length - 1) / 2);
        const target = visibleItems[centerIndex + direction];
        if (target) setActiveCard(target);
      };
  
      const bindCardEvents = () => {
        visibleItems.forEach((item) => {
          const card = item.querySelector(".card--item");
          if (!card || card.dataset.entrepriseExpandReady === "true") return;
  
          card.dataset.entrepriseExpandReady = "true";
  
          card.addEventListener("click", (event) => {
            if (!visibleItems.includes(item)) return;
  
            if (didSwipe) {
              didSwipe = false;
              event.preventDefault();
              return;
            }
  
            if (item === activeItem) return;
  
            event.preventDefault();
            event.stopPropagation();
            setActiveCard(item);
          });
        });
      };
  
      const showItems = (items) => {
        visibleItems = items;
  
        items.forEach((item) => {
          item.style.display = "";
          item.setAttribute("aria-hidden", "false");
          item.classList.add("is--visible");
        });
  
        const centerIndex = Math.floor((items.length - 1) / 2);
        const centerItem = items[centerIndex] || null;
  
        if (centerItem) {
          setActiveCard(centerItem, true);
  
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              captureFrozenImageSize(centerItem);
            });
          });
        } else {
          activeItem = null;
        }
  
        bindCardEvents();
      };
  
      const getMatchingItems = (filterValue) => {
        const matches = collectionItems
          .filter((item) => getItemCategory(item) === filterValue)
          .slice(-MAX_VISIBLE);
  
        if (!matches.length) {
          const availableCategories = [
            ...new Set(collectionItems.map(getItemCategory).filter(Boolean)),
          ];
  
          console.warn(
            `[B4Cars Entreprise] Aucun véhicule trouvé pour "${filterValue}".`,
            "Catégories réellement présentes dans la collection :",
            availableCategories
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
              matches,
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
              }
            );
          }
        };
  
        if (
          immediate ||
          !oldItems.length ||
          typeof window.gsap === "undefined"
        ) {
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
  
      grid.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        pointerStartX = event.clientX;
        didSwipe = false;
      });
  
      grid.addEventListener("pointerup", (event) => {
        if (!pointerStartX) return;
  
        const deltaX = event.clientX - pointerStartX;
        pointerStartX = 0;
  
        if (!isDesktop() || Math.abs(deltaX) < SWIPE_THRESHOLD) return;
  
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
        if (!activeItem) return;
  
        applySlotLayout();
  
        requestAnimationFrame(() => {
          captureFrozenImageSize(activeItem);
        });
      });
  
      const defaultFilterItem =
        filterItems.find(
          (item) =>
            getFilterValue(item) === normalizeValue(DEFAULT_FILTER)
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