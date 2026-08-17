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

  const LOADER_SESSION_KEY = "b4cars-home-loader";

  const hasSeenLoader = () => {
    try {
      return sessionStorage.getItem(LOADER_SESSION_KEY) === "1";
    } catch (error) {
      return false;
    }
  };

  const markLoaderSeen = () => {
    try {
      sessionStorage.setItem(LOADER_SESSION_KEY, "1");
    } catch (error) {
      // Private mode / blocked storage — play the loader this visit only.
    }
  };

  if (hasSeenLoader()) {
    document.documentElement.classList.add("has-seen-loader");
  }

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

    if (prefersReducedMotion || hasSeenLoader()) {
      revealPageWithoutAnimation();
      return;
    }

    markLoaderSeen();
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
