/* ==========================================================================
   B4CARS — HOME LOADING SCREEN
   Requires GSAP
========================================================================== */

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
        ease: "power3.out",
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
          ease: "power2.out",
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
          ease: "power2.inOut",
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
          ease: "power2.out",
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
        ease: "power2.inOut",
      },
      "start+=1.45",
    );

    timeline.to(
      logoWrapper || logo,
      {
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
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
          ease: "power2.inOut",
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
          ease: "power2.inOut",
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
          ease: "power2.inOut",
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
        ease: "power2.out",
      },
      "ready+=0.28",
    );

    timeline.to(
      loader,
      {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 1.25,
        ease: "expo.inOut",
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
     VEHICLES FILTER + EXPANDING FIVE-CARD GRID
     Scoped only to .section.is--home-slider
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

    let visibleItems = [];
    let activeItem = null;
    let activeFilterValue = "";

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

    const hideAllItems = () => {
      collectionItems.forEach((item) => {
        item.classList.remove("is--visible", "is--active");
        item.setAttribute("aria-hidden", "true");
        item.style.display = "none";
        item.style.removeProperty("--card-grow");

        item.querySelector(".card--item")?.classList.remove("is--active");
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

    const setActiveCard = (item, immediate = false) => {
      if (!item || !visibleItems.includes(item)) return;

      activeItem = item;

      visibleItems.forEach((visibleItem) => {
        const isActive = visibleItem === activeItem;

        visibleItem.classList.toggle("is--active", isActive);
        visibleItem.style.setProperty("--card-grow", isActive ? "5" : "1");

        visibleItem
          .querySelector(".card--item")
          ?.classList.toggle("is--active", isActive);
      });

      if (!immediate && typeof window.gsap !== "undefined") {
        window.gsap.fromTo(
          activeItem,
          { opacity: 0.96 },
          {
            opacity: 1,
            duration: 0.28,
            ease: "power2.out",
            overwrite: true,
          },
        );
      }
    };

    const bindCardEvents = () => {
      visibleItems.forEach((item) => {
        const card = item.querySelector(".card--item");
        if (!card || card.dataset.expandReady === "true") return;

        card.dataset.expandReady = "true";

        card.addEventListener("mouseenter", () => {
          if (visibleItems.includes(item)) {
            setActiveCard(item);
          }
        });

        card.addEventListener("focusin", () => {
          if (visibleItems.includes(item)) {
            setActiveCard(item);
          }
        });

        card.addEventListener("click", () => {
          if (visibleItems.includes(item)) {
            setActiveCard(item);
          }
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
              ease: "power3.out",
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
        ease: "power2.in",
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

    window.addEventListener("resize", () => {
      if (!activeItem) return;

      requestAnimationFrame(() => {
        captureFrozenImageSize(activeItem);
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
