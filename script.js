/* ========================================================================== 
   B4CARS — INTERACTIONS & ANIMATIONS
   Requires GSAP + ScrollTrigger
   Main ease: cubic-bezier(0.16, 1, 0.3, 1)
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
    if (typeof gsap === "undefined") {
      console.warn("B4Cars: GSAP is missing.");
      return;
    }

    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const EASE = window.B4CARS_EASE;
    gsap.defaults({ ease: EASE });

    initLoadAnimations(EASE);
    initScrollAnimations(EASE);
    initImageParallax();
    initParallaxFade(EASE);
    initCircleRecherche();
    initNavbarScroll();
    initMobileNavbar(EASE);
    initCtaGallery(EASE);
    initCascadingSlider();
  });

  function animSelector(name) {
    return `[animation="${name}"], [${name}]`;
  }

  /* ========================================================================
     1. PAGE LOAD ANIMATIONS

     load           OR  animation="load"
     load-up        OR  animation="load-up"
     load-left      OR  animation="load-left"
     load-right     OR  animation="load-right"
     load-stagger   OR  animation="load-stagger"
     load-split     OR  loading-split  OR  animation="load-split"
  ======================================================================== */

  function initLoadAnimations(ease) {
    const timeline = gsap.timeline({
      defaults: { ease },
      delay: 0.08,
    });

    addLoadTween(
      timeline,
      animSelector("load"),
      {
        opacity: 0,
        y: "1rem",
      },
      0,
    );

    addLoadTween(
      timeline,
      animSelector("load-up"),
      {
        opacity: 0,
        y: "2rem",
      },
      0.04,
    );

    addLoadTween(
      timeline,
      animSelector("load-left"),
      {
        opacity: 0,
        x: "2rem",
      },
      0.04,
    );

    addLoadTween(
      timeline,
      animSelector("load-right"),
      {
        opacity: 0,
        x: "-2rem",
      },
      0.04,
    );

    document
      .querySelectorAll(animSelector("load-stagger"))
      .forEach((parent) => {
        const children = getStaggerChildren(parent);
        if (!children.length) return;

        timeline.fromTo(
          children,
          { opacity: 0, y: "1.5rem" },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            clearProps: "transform,opacity",
          },
          0.12,
        );
      });

    initLoadSplit(ease);
  }

  function initLoadSplit(ease) {
    document
      .querySelectorAll(
        `${animSelector("load-split")}, ${animSelector("loading-split")}`,
      )
      .forEach((element) => {
        bindSplitAnimation(element, "load-split", ease, {
          duration: 0.95,
          delay: 0.22,
        });
      });
  }

  function addLoadTween(timeline, selector, fromVars, position) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    timeline.fromTo(
      elements,
      fromVars,
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.85,
        stagger: 0.08,
        clearProps: "transform,opacity",
      },
      position,
    );
  }

  /* ========================================================================
     2. SCROLL ANIMATIONS

     fade           OR  animation="fade"
     fade-up        OR  animation="fade-up"
     fade-left      OR  animation="fade-left"
     fade-right     OR  animation="fade-right"
     fade-stagger   OR  animation="fade-stagger"
     fade-split     OR  animation="fade-split"
  ======================================================================== */

  function initScrollAnimations(ease) {
    if (typeof ScrollTrigger === "undefined") return;

    initFade(animSelector("fade"), { opacity: 0, y: "1rem" }, ease);
    initFade(animSelector("fade-up"), { opacity: 0, y: "2rem" }, ease);
    initFade(animSelector("fade-left"), { opacity: 0, x: "2rem" }, ease);
    initFade(animSelector("fade-right"), { opacity: 0, x: "-2rem" }, ease);
    initFadeStagger(ease);
    initFadeSplit(ease);
  }

  function initFade(selector, fromVars, ease) {
    document.querySelectorAll(selector).forEach((element) => {
      gsap.fromTo(element, fromVars, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.85,
        ease,
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: element,
          start: "top 86%",
          once: true,
        },
      });
    });
  }

  function initFadeStagger(ease) {
    document
      .querySelectorAll(animSelector("fade-stagger"))
      .forEach((parent) => {
        const children = getStaggerChildren(parent);
        if (!children.length) return;

        gsap.fromTo(
          children,
          { opacity: 0, y: "1.5rem" },
          {
            opacity: 1,
            y: 0,
            duration: 0.78,
            stagger: 0.08,
            ease,
            clearProps: "transform,opacity",
            scrollTrigger: {
              trigger: parent,
              start: "top 86%",
              once: true,
            },
          },
        );
      });
  }

  function initFadeSplit(ease) {
    document.querySelectorAll(animSelector("fade-split")).forEach((element) => {
      bindSplitAnimation(element, "fade-split", ease, {
        duration: 0.9,
        scroll: true,
      });
    });
  }

  const SPLIT_LINE_STAGGER = 0.1;
  const splitOriginalHtml = new WeakMap();

  function bindSplitAnimation(element, prefix, ease, options) {
    let tween;

    const setup = (showImmediately) => {
      if (tween) {
        tween.scrollTrigger?.kill();
        tween.kill();
      }

      const lines = prepareSplitLines(element, prefix);
      if (!lines.length) return;

      if (showImmediately) {
        gsap.set(lines, {
          yPercent: 0,
          opacity: 1,
          clearProps: "transform,opacity",
        });
        return;
      }

      const vars = {
        yPercent: 0,
        opacity: 1,
        duration: options.duration,
        stagger: SPLIT_LINE_STAGGER,
        ease,
        clearProps: "transform,opacity",
        onComplete: () => {
          element.dataset.splitPlayed = "true";
        },
      };

      if (options.delay) vars.delay = options.delay;

      if (options.scroll) {
        vars.scrollTrigger = {
          trigger: element,
          start: "top 86%",
          once: true,
        };
      }

      tween = gsap.fromTo(lines, { yPercent: 110, opacity: 0 }, vars);
    };

    afterFonts(() => setup(false));

    let lastWindowWidth = window.innerWidth;
    window.addEventListener(
      "resize",
      debounce(() => {
        if (window.innerWidth === lastWindowWidth) return;
        lastWindowWidth = window.innerWidth;
        setup(element.dataset.splitPlayed === "true");
      }, 200),
    );
  }

  function prepareSplitLines(element, prefix) {
    if (!splitOriginalHtml.has(element)) {
      splitOriginalHtml.set(element, element.innerHTML);
    }

    element.innerHTML = splitOriginalHtml.get(element);

    if (!element.innerHTML.trim()) return [];

    wrapWords(element, `${prefix}__word`);
    const words = [...element.querySelectorAll(`.${prefix}__word`)];

    if (!words.length) {
      wrapElementAsSingleLine(element, prefix);
      return [...element.querySelectorAll(`.${prefix}__line`)];
    }

    const groups = groupWordsIntoLines(words);

    for (let i = groups.length - 1; i >= 0; i -= 1) {
      wrapLine(groups[i], prefix);
    }

    [...element.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
        node.remove();
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      if (
        node.tagName === "BR" ||
        (!node.classList.contains(`${prefix}__line-mask`) &&
          !node.textContent.trim())
      ) {
        node.remove();
      }
    });

    return [...element.querySelectorAll(`.${prefix}__line`)];
  }

  function wrapWords(root, wordClass) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        const parent = node.parentElement;
        if (!parent || parent.classList.contains(wordClass)) {
          return NodeFilter.FILTER_REJECT;
        }

        const tag = parent.tagName;
        if (tag === "SCRIPT" || tag === "STYLE") {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();

      node.nodeValue.split(/(\s+)/).forEach((part) => {
        if (!part) return;

        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }

        const word = document.createElement("span");
        word.className = wordClass;
        word.textContent = part;
        fragment.appendChild(word);
      });

      node.parentNode.replaceChild(fragment, node);
    });
  }

  function groupWordsIntoLines(words) {
    const groups = [];
    let current = [];
    let currentTop = null;

    words.forEach((word) => {
      const top = Math.round(word.getBoundingClientRect().top);

      if (currentTop === null || Math.abs(top - currentTop) <= 2) {
        current.push(word);
        if (currentTop === null) currentTop = top;
        return;
      }

      groups.push(current);
      current = [word];
      currentTop = top;
    });

    if (current.length) groups.push(current);
    return groups;
  }

  function wrapLine(words, prefix) {
    if (!words.length) return;

    const range = document.createRange();
    range.setStartBefore(words[0]);
    range.setEndAfter(words[words.length - 1]);

    const line = document.createElement("span");
    line.className = `${prefix}__line`;
    line.appendChild(range.extractContents());

    const mask = document.createElement("span");
    mask.className = `${prefix}__line-mask`;
    mask.appendChild(line);
    range.insertNode(mask);
  }

  function wrapElementAsSingleLine(element, prefix) {
    const content = element.innerHTML.trim();
    element.innerHTML = `
      <span class="${prefix}__line-mask">
        <span class="${prefix}__line">${content}</span>
      </span>
    `;
  }

  function afterFonts(callback) {
    if (document.fonts && document.fonts.status !== "loaded") {
      document.fonts.ready.then(callback);
      return;
    }

    callback();
  }

  function debounce(fn, wait) {
    let timer;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), wait);
    };
  }

  function getStaggerChildren(parent) {
    return [...parent.children].filter((child) => !hasOwnReveal(child));
  }

  function hasOwnReveal(element) {
    const animation = element.getAttribute("animation") || "";

    return (
      element.hasAttribute("parallax-fade") || animation === "parallax-fade"
    );
  }

  /* ========================================================================
     3. IMAGE PARALLAX

     image="parallax"          →  0 to -10
     parallax-reverse          →  5 to 0
     image="parallax-reverse"  →  5 to 0

     The parent wrapper should have overflow: hidden.
  ======================================================================== */

  function initImageParallax() {
    if (typeof ScrollTrigger === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setupImageParallax('[image="parallax"]', 0, -10);
    setupImageParallax(
      `${animSelector("parallax-reverse")}, [image="parallax-reverse"]`,
      5,
      0,
    );
  }

  function setupImageParallax(selector, fromY, toY) {
    document.querySelectorAll(selector).forEach((image) => {
      if (image.dataset.parallaxReady === "true") return;

      image.dataset.parallaxReady = "true";

      gsap.fromTo(
        image,
        {
          yPercent: fromY,
        },
        {
          yPercent: toY,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: image.parentElement || image,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.25,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  }

  /* ========================================================================
     3b. PARALLAX FADE

     parallax-fade  OR  animation="parallax-fade"
     Grows from width: 0px when the element enters the viewport.
  ======================================================================== */

  function initParallaxFade(ease) {
    if (typeof ScrollTrigger === "undefined") return;

    document
      .querySelectorAll(animSelector("parallax-fade"))
      .forEach((element) => {
        if (element.dataset.parallaxFadeReady === "true") return;

        element.dataset.parallaxFadeReady = "true";

        const targetWidth = element.getBoundingClientRect().width;
        gsap.set(element, { width: 0 });

        ScrollTrigger.create({
          trigger: element,
          start: "top 86%",
          once: true,
          onEnter: () => {
            gsap.to(element, {
              width: targetWidth,
              opacity: 1,
              y: 0,
              duration: 0.85,
              ease,
              overwrite: "auto",
              clearProps: "width,opacity,transform",
            });
          },
        });
      });
  }

  /* ========================================================================
     3c. CIRCLE RECHERCHE

     .circle--recherche  →  opacity 0.5 / scale 0.9  to  1 / 1
     Scrubbed with scroll as the circle enters the viewport.
  ======================================================================== */

  function initCircleRecherche() {
    if (typeof ScrollTrigger === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll(".circle--recherche").forEach((circle) => {
      if (circle.dataset.circleRechercheReady === "true") return;

      circle.dataset.circleRechercheReady = "true";

      gsap.fromTo(
        circle,
        {
          opacity: 0.5,
          scale: 0.9,
        },
        {
          opacity: 1,
          scale: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: circle,
            start: "top bottom",
            end: "center center",
            scrub: 1.25,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  }

  /* ========================================================================
     4. NAVBAR BACKGROUND ON SCROLL

     - At the top: restores the background and text color defined in Webflow.
     - While scrolling: white background, #031e4d text.
     - While the mobile menu is open: restores Webflow's original styles.
  ======================================================================== */

  function initNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const originalInlineBackground = navbar.style.backgroundColor;
    const originalInlineColor = navbar.style.color;
    const originalComputedBackground =
      window.getComputedStyle(navbar).backgroundColor;
    const originalComputedColor = window.getComputedStyle(navbar).color;

    const restoreProperty = (property, inlineValue, computedValue) => {
      if (inlineValue) {
        navbar.style.setProperty(property, inlineValue);
        return;
      }

      if (computedValue && computedValue !== "rgba(0, 0, 0, 0)") {
        navbar.style.setProperty(property, computedValue);
        return;
      }

      navbar.style.removeProperty(property);
    };

    const restoreWebflowStyles = () => {
      restoreProperty(
        "background-color",
        originalInlineBackground,
        originalComputedBackground,
      );
      restoreProperty("color", originalInlineColor, originalComputedColor);
    };

    const updateNavbar = () => {
      const menuIsOpen = navbar.classList.contains("is--menu-open");
      const pageIsScrolled = window.scrollY > 1;

      navbar.classList.toggle("is--scrolled", pageIsScrolled);

      if (menuIsOpen) {
        restoreWebflowStyles();
        return;
      }

      if (pageIsScrolled) {
        navbar.style.setProperty("background-color", "#ffffff", "important");
        navbar.style.setProperty("color", "#031e4d", "important");
      } else {
        restoreWebflowStyles();
      }
    };

    navbar.__updateScrollBackground = updateNavbar;

    updateNavbar();

    window.addEventListener("scroll", updateNavbar, {
      passive: true,
    });
  }

  /* ========================================================================
     5. TABLET / MOBILE NAVBAR

     Existing B4Cars classes:
     .navbar
     .nav--menu
     .menu--trigger
     .menu--to-open
     .menu--to-close
  ======================================================================== */

  function initMobileNavbar(ease) {
    const navbar = document.querySelector(".navbar");
    const menu = document.querySelector(".nav--menu");
    const trigger = document.querySelector(".menu--trigger");
    const iconOpen = trigger?.querySelector(".menu--to-open");
    const iconClose = trigger?.querySelector(".menu--to-close");
    const breakpoint = window.matchMedia("(max-width: 991px)");

    if (!navbar || !menu || !trigger) return;

    const links = [...menu.querySelectorAll("a")];
    let isOpen = false;
    let timeline = null;

    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Ouvrir le menu");

    function lockScroll() {
      document.documentElement.classList.add("is--locked");
      document.body.classList.add("is--locked");
    }

    function unlockScroll() {
      document.documentElement.classList.remove("is--locked");
      document.body.classList.remove("is--locked");
    }

    function setClosedState() {
      gsap.set(menu, {
        display: "none",
        opacity: 0,
        pointerEvents: "none",
      });

      gsap.set(links, {
        opacity: 0,
        y: "1.5rem",
        filter: "blur(6px)",
      });

      if (iconOpen) {
        gsap.set(iconOpen, { opacity: 1, scale: 1, rotate: 0 });
      }

      if (iconClose) {
        gsap.set(iconClose, { opacity: 0, scale: 0.75, rotate: -90 });
      }
    }

    function openMenu() {
      if (isOpen || !breakpoint.matches) return;
      isOpen = true;

      timeline?.kill();
      navbar.classList.add("is--menu-open");
      navbar.__updateScrollBackground?.();
      menu.classList.add("is--open");
      trigger.classList.add("is--open");
      trigger.setAttribute("aria-expanded", "true");
      trigger.setAttribute("aria-label", "Fermer le menu");
      lockScroll();

      timeline = gsap.timeline();

      timeline
        .set(menu, { display: "flex", pointerEvents: "auto" })
        .to(menu, { opacity: 1, duration: 0.45, ease }, 0)
        .to(
          links,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.62,
            stagger: 0.055,
            ease,
          },
          0.16,
        );

      if (iconOpen) {
        timeline.to(
          iconOpen,
          { opacity: 0, scale: 0.75, rotate: 90, duration: 0.3, ease },
          0,
        );
      }

      if (iconClose) {
        timeline.to(
          iconClose,
          { opacity: 1, scale: 1, rotate: 0, duration: 0.4, ease },
          0.06,
        );
      }
    }

    function closeMenu({ immediate = false } = {}) {
      if (!isOpen && !immediate) return;
      isOpen = false;

      timeline?.kill();
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-label", "Ouvrir le menu");
      unlockScroll();

      if (immediate) {
        navbar.classList.remove("is--menu-open");
        navbar.__updateScrollBackground?.();
        menu.classList.remove("is--open");
        trigger.classList.remove("is--open");
        setClosedState();
        return;
      }

      timeline = gsap.timeline({
        onComplete: () => {
          navbar.classList.remove("is--menu-open");
          navbar.__updateScrollBackground?.();
          menu.classList.remove("is--open");
          trigger.classList.remove("is--open");
        },
      });

      timeline
        .to(
          links,
          {
            opacity: 0,
            y: "1rem",
            filter: "blur(6px)",
            duration: 0.28,
            stagger: { each: 0.025, from: "end" },
            ease,
          },
          0,
        )
        .to(menu, { opacity: 0, duration: 0.42, ease }, 0.1)
        .set(menu, { display: "none", pointerEvents: "none" });

      if (iconClose) {
        timeline.to(
          iconClose,
          { opacity: 0, scale: 0.75, rotate: -90, duration: 0.3, ease },
          0,
        );
      }

      if (iconOpen) {
        timeline.to(
          iconOpen,
          { opacity: 1, scale: 1, rotate: 0, duration: 0.4, ease },
          0.05,
        );
      }
    }

    function toggleMenu() {
      isOpen ? closeMenu() : openMenu();
    }

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      toggleMenu();
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleMenu();
      }
    });

    links.forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen) closeMenu();
    });

    document.addEventListener("pointerdown", (event) => {
      if (!isOpen) return;
      if (menu.contains(event.target) || trigger.contains(event.target)) return;
      closeMenu();
    });

    breakpoint.addEventListener("change", (event) => {
      if (!event.matches) {
        closeMenu({ immediate: true });
        gsap.set(menu, { clearProps: "all" });
        gsap.set(links, { clearProps: "all" });
        gsap.set([iconOpen, iconClose].filter(Boolean), { clearProps: "all" });
      } else {
        closeMenu({ immediate: true });
      }
    });

    if (breakpoint.matches) setClosedState();
  }

  /* ========================================================================
     6. CTA IMAGE GALLERY
  ======================================================================== */

  function initCtaGallery(ease) {
    const galleries = document.querySelectorAll(".cta--image-wrapper");

    galleries.forEach((gallery) => {
      if (gallery.dataset.ctaGalleryReady === "true") return;

      const mainImage = gallery.querySelector(":scope > img");
      const thumbnails = [...gallery.querySelectorAll(".cta-gallery-select")];

      if (!mainImage || !thumbnails.length) return;

      gallery.dataset.ctaGalleryReady = "true";

      let activeThumbnail = null;
      let isAnimating = false;

      const normalizeUrl = (url) => {
        try {
          return new URL(url, window.location.href).href;
        } catch {
          return url;
        }
      };

      const setActiveThumbnail = (thumbnail) => {
        thumbnails.forEach((item) => {
          const isActive = item === thumbnail;
          item.classList.toggle("is--active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });

        activeThumbnail = thumbnail;
      };

      thumbnails.forEach((thumbnail) => {
        const thumbnailImage = thumbnail.querySelector("img");
        if (!thumbnailImage) return;

        thumbnail.setAttribute("role", "button");
        thumbnail.setAttribute("tabindex", "0");
        thumbnail.setAttribute("aria-label", "Afficher cette image");
        thumbnail.setAttribute("aria-pressed", "false");

        if (
          normalizeUrl(thumbnailImage.currentSrc || thumbnailImage.src) ===
          normalizeUrl(mainImage.currentSrc || mainImage.src)
        ) {
          setActiveThumbnail(thumbnail);
        }

        const switchSource = (source) => {
          mainImage.removeAttribute("srcset");
          mainImage.removeAttribute("sizes");
          mainImage.src = source;
        };

        const changeImage = () => {
          const nextSource = thumbnailImage.currentSrc || thumbnailImage.src;

          if (!nextSource || thumbnail === activeThumbnail || isAnimating)
            return;

          isAnimating = true;
          setActiveThumbnail(thumbnail);

          const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;

          if (reducedMotion) {
            switchSource(nextSource);
            isAnimating = false;
            return;
          }

          const reveal = () => {
            gsap.to(mainImage, {
              opacity: 1,
              duration: 0.42,
              ease,
              overwrite: "auto",
              onComplete: () => {
                gsap.set(mainImage, { clearProps: "opacity" });
                isAnimating = false;
              },
            });
          };

          gsap.to(mainImage, {
            opacity: 0,
            duration: 0.22,
            ease,
            overwrite: "auto",
            onComplete: () => {
              let revealed = false;

              const onLoad = () => {
                if (revealed) return;
                revealed = true;
                reveal();
              };

              mainImage.addEventListener("load", onLoad, { once: true });
              mainImage.addEventListener("error", onLoad, { once: true });
              switchSource(nextSource);

              if (mainImage.complete) onLoad();
            },
          });
        };

        thumbnail.addEventListener("click", changeImage);
        thumbnail.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            changeImage();
          }
        });
      });
    });
  }

  /* ========================================================================
     CASCADING CARS SLIDER

     [data-cascading-slider-wrap]
     Optional filters: .filter--item[filter] in the same section
  ======================================================================== */

  function initCascadingSlider() {
    if (typeof gsap === "undefined") return;
    if (!document.querySelector("[data-cascading-slider-wrap]")) return;

    const duration = 0.65;
    const ease = "power3.inOut";

    const breakpoints = [
      { maxWidth: 479, activeWidth: 0.78, siblingWidth: 0.08 },
      { maxWidth: 767, activeWidth: 0.7, siblingWidth: 0.1 },
      { maxWidth: 991, activeWidth: 0.6, siblingWidth: 0.1 },
      { maxWidth: Infinity, activeWidth: 0.6, siblingWidth: 0.13 },
    ];

    document
      .querySelectorAll("[data-cascading-slider-wrap]")
      .forEach(setupInstance);

    function setupInstance(wrapper) {
      const viewport =
        wrapper.querySelector("[data-cascading-viewport]") ||
        wrapper.querySelector(".cascading-slider__list") ||
        wrapper.querySelector(".w-dyn-items");
      const prevButton =
        wrapper.querySelector("[data-cascading-slider-prev]") ||
        wrapper.querySelector(
          ".cascading-slider__nav .swiper--btn.is--previous",
        ) ||
        wrapper.querySelector(".swiper--btn.is--previous");
      const nextButton =
        wrapper.querySelector("[data-cascading-slider-next]") ||
        wrapper.querySelector(".cascading-slider__nav .swiper--btn.is--next") ||
        wrapper.querySelector(".swiper--btn.is--next");

      if (!viewport) return;

      if (!viewport.hasAttribute("data-cascading-viewport")) {
        viewport.setAttribute("data-cascading-viewport", "");
      }

      const originalSlides = Array.from(
        viewport.querySelectorAll("[data-cascading-slide]:not([data-clone])"),
      );

      if (!originalSlides.length) return;

      const swiperRoot = wrapper.closest(".swiper--wrapper");
      const featuredText = swiperRoot
        ? swiperRoot.querySelector(".featured--text")
        : null;
      const extraPrevButton = swiperRoot
        ? swiperRoot.querySelector(
            ".swiper--navigation .swiper--btn.is--previous",
          )
        : null;
      const extraNextButton = swiperRoot
        ? swiperRoot.querySelector(".swiper--navigation .swiper--btn.is--next")
        : null;

      const isVenteLeading =
        Boolean(
          wrapper.closest(
            '[data-wf--slot-item-vehicules-slider--variant="vente"]',
          ),
        ) ||
        wrapper.getAttribute("data-wf--slot-item-vehicules-slider--variant") ===
          "vente";

      let isLeading = false;
      let layoutConfig = {
        visibleMin: -2,
        visibleMax: 2,
        parkMin: -3,
        parkMax: 3,
      };

      function updateLayoutMode() {
        const compactLeading = window.innerWidth <= 991;
        isLeading = isVenteLeading || compactLeading;

        if (compactLeading) {
          layoutConfig = {
            visibleMin: 0,
            visibleMax: 1,
            parkMin: -1,
            parkMax: 2,
          };
        } else if (isVenteLeading) {
          layoutConfig = {
            visibleMin: 0,
            visibleMax: 4,
            parkMin: -1,
            parkMax: 5,
          };
        } else {
          layoutConfig = {
            visibleMin: -2,
            visibleMax: 2,
            parkMin: -3,
            parkMax: 3,
          };
        }
      }

      let slides = [];
      let totalSlides = 0;
      let activeIndex = 0;
      let isAnimating = false;
      let isFiltering = false;
      let currentFilterValue = "";
      let slideWidth = 0;
      let slotCenters = {};
      let slotWidths = {};
      let featuredReady = false;
      let lastFeaturedKey = "";

      const DEFAULT_FILTER = "en stock";

      const normalizeValue = function (value) {
        return String(value || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
      };

      const getSlideCategory = function (slide) {
        const category = slide.querySelector('[filter="category"]');
        return normalizeValue(category ? category.textContent : "");
      };

      function removeClones() {
        viewport.querySelectorAll("[data-clone]").forEach(function (clone) {
          gsap.killTweensOf(clone);
          clone.remove();
        });
      }

      function bindSlideClicks() {
        slides.forEach(function (slide) {
          if (slide.dataset.cascadingClick === "true") return;
          slide.dataset.cascadingClick = "true";
          slide.addEventListener("click", function () {
            const index = slides.indexOf(slide);
            if (index !== -1 && index !== activeIndex) goTo(index);
          });
        });
      }

      function rebuildSlides(filterValue) {
        const matching = originalSlides.filter(function (slide) {
          if (!filterValue) return true;
          return getSlideCategory(slide) === filterValue;
        });

        gsap.killTweensOf(originalSlides);
        gsap.killTweensOf(slides);

        removeClones();
        isAnimating = false;
        activeIndex = 0;

        originalSlides.forEach(function (slide) {
          const isMatch = matching.indexOf(slide) !== -1;
          slide.style.display = isMatch ? "" : "none";
          if (!isMatch) slide.removeAttribute("data-status");
        });

        slides = matching.slice();

        if (slides.length && slides.length < 9) {
          const source = slides.slice();
          while (slides.length < 9) {
            source.forEach(function (original) {
              const clone = original.cloneNode(true);
              clone.setAttribute("data-clone", "");
              clone.style.display = "";
              viewport.appendChild(clone);
              slides.push(clone);
            });
          }
        }

        totalSlides = slides.length;
        bindSlideClicks();

        if (!totalSlides) return;

        measure();
        layout(false);
      }

      function applyCategoryFilter(filterValue, immediate) {
        if (!filterValue) return;
        if (!immediate && filterValue === currentFilterValue) return;

        const fadeEase = window.B4CARS_EASE || "expo.out";

        const reveal = function () {
          rebuildSlides(filterValue);
          currentFilterValue = filterValue;

          if (immediate || !totalSlides) {
            gsap.set(viewport, { opacity: 1 });
            isFiltering = false;
            return;
          }

          gsap.fromTo(
            viewport,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.5,
              ease: fadeEase,
              overwrite: true,
              onComplete: function () {
                isFiltering = false;
              },
            },
          );
        };

        if (immediate || !slides.length) {
          reveal();
          return;
        }

        isFiltering = true;

        gsap.to(viewport, {
          opacity: 0,
          duration: 0.28,
          ease: fadeEase,
          overwrite: true,
          onComplete: reveal,
        });
      }

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
        updateLayoutMode();

        const settings = getSettings();
        const viewportWidth = viewport.offsetWidth;
        const gap = readGap();
        const compactLeading = window.innerWidth <= 991;

        const activeSlideWidth = viewportWidth * settings.activeWidth;
        const siblingSlideWidth = viewportWidth * settings.siblingWidth;
        let visibleSlots;

        if (isLeading) {
          const nextWidths = compactLeading
            ? [Math.max(siblingSlideWidth * 2.4, viewportWidth * 0.22)]
            : [
                siblingSlideWidth,
                siblingSlideWidth * 0.72,
                siblingSlideWidth * 0.42,
                siblingSlideWidth * 0.22,
              ];
          const sidesWidth = nextWidths.reduce(function (sum, width) {
            return sum + width;
          }, 0);
          const leadingActiveWidth = Math.max(
            compactLeading ? viewportWidth * 0.55 : viewportWidth * 0.52,
            viewportWidth - sidesWidth - nextWidths.length * gap,
          );

          slideWidth = leadingActiveWidth;
          visibleSlots = [{ slot: 0, width: leadingActiveWidth }].concat(
            nextWidths.map(function (width, index) {
              return { slot: index + 1, width: width };
            }),
          );
        } else {
          const farSlideWidth = Math.max(
            0,
            (viewportWidth -
              activeSlideWidth -
              2 * siblingSlideWidth -
              4 * gap) /
              2,
          );

          slideWidth = activeSlideWidth;
          visibleSlots = [
            { slot: -2, width: farSlideWidth },
            { slot: -1, width: siblingSlideWidth },
            { slot: 0, width: activeSlideWidth },
            { slot: 1, width: siblingSlideWidth },
            { slot: 2, width: farSlideWidth },
          ];
        }

        slotCenters = {};
        slotWidths = {};

        let x = 0;
        visibleSlots.forEach(function (def, i) {
          slotCenters[String(def.slot)] = x + def.width / 2;
          slotWidths[String(def.slot)] = def.width;
          if (i < visibleSlots.length - 1) x += def.width + gap;
        });

        const first = visibleSlots[0];
        const last = visibleSlots[visibleSlots.length - 1];
        const parkLeftWidth = slotWidths[String(first.slot)];
        const parkRightWidth = slotWidths[String(last.slot)];

        slotCenters[String(layoutConfig.parkMin)] =
          slotCenters[String(first.slot)] -
          parkLeftWidth / 2 -
          gap -
          parkLeftWidth / 2;
        slotWidths[String(layoutConfig.parkMin)] = parkLeftWidth;

        slotCenters[String(layoutConfig.parkMax)] =
          slotCenters[String(last.slot)] +
          parkRightWidth / 2 +
          gap +
          parkRightWidth / 2;
        slotWidths[String(layoutConfig.parkMax)] = parkRightWidth;

        slides.forEach(function (slide) {
          slide.style.width = slideWidth + "px";
        });
      }

      function getSlideProps(offset) {
        const clamped = Math.max(
          layoutConfig.parkMin,
          Math.min(layoutConfig.parkMax, offset),
        );
        const slotWidth = slotWidths[String(clamped)];
        const clipAmount = Math.max(0, (slideWidth - slotWidth) / 2);
        const translateX = slotCenters[String(clamped)] - slideWidth / 2;

        return {
          x: translateX,
          "--clip": clipAmount,
          zIndex: isVisibleOffset(clamped)
            ? isLeading
              ? 10 - clamped
              : 10 - Math.abs(clamped)
            : 1,
        };
      }

      function isVisibleOffset(offset) {
        return (
          offset >= layoutConfig.visibleMin && offset <= layoutConfig.visibleMax
        );
      }

      function formatYearValue(value) {
        const match = String(value || "").match(/\b(19|20)\d{2}\b/);
        return match ? match[0] : String(value || "").trim();
      }

      function getSlideInfos(slide) {
        const info = {};
        slide
          .querySelectorAll(".infos--text .featured--text-row")
          .forEach(function (row) {
            const cells = row.querySelectorAll("p");
            if (cells.length < 2) return;
            const key = normalizeValue(cells[0].textContent);
            if (!key) return;
            info[key] = {
              text: cells[1].textContent.trim(),
              raw: cells[1].getAttribute("data-b4-raw-value") || "",
            };
          });
        return info;
      }

      function setFeaturedField(attr, payload, asYear) {
        if (!featuredText || !payload || !payload.text) return;
        const el = featuredText.querySelector("[" + attr + "]");
        if (!el) return;
        el.textContent = asYear ? formatYearValue(payload.text) : payload.text;
        if (payload.raw) el.setAttribute("data-b4-raw-value", payload.raw);
      }

      function updateFeaturedPanel(immediate) {
        if (!featuredText) return;
        const slide = slides[activeIndex];
        if (!slide) return;

        const info = getSlideInfos(slide);
        const nextKey = [
          info.marque && info.marque.text,
          info.modele && info.modele.text,
          info.annee && info.annee.text,
          info.kilometrage && info.kilometrage.text,
          info.prix && info.prix.text,
        ].join("|");

        if (nextKey === lastFeaturedKey) return;
        lastFeaturedKey = nextKey;

        setFeaturedField("marque", info.marque);
        setFeaturedField("modele", info.modele);
        setFeaturedField("annee", info.annee, true);
        setFeaturedField("kilometrage", info.kilometrage);
        setFeaturedField("prix", info.prix);

        const productLink = featuredText.querySelector(
          ".featured--btn-wrapper a",
        );
        const slideLink = slide.querySelector('a[href]:not([href="#"])');
        if (productLink && slideLink) {
          const href = slideLink.getAttribute("href");
          if (href) productLink.setAttribute("href", href);
        }

        if (!immediate && featuredReady) {
          const rows = featuredText.querySelectorAll(".featured--text-row");
          if (rows.length) {
            gsap.fromTo(
              rows,
              { opacity: 0, y: 12 },
              {
                opacity: 1,
                y: 0,
                duration: 0.45,
                stagger: 0.04,
                ease: window.B4CARS_EASE || "expo.out",
                overwrite: true,
              },
            );
          }
        }

        featuredReady = true;
      }

      function layout(animate, previousIndex) {
        slides.forEach(function (slide, index) {
          const offset = getOffset(index);

          if (!isVisibleOffset(offset)) {
            slide.setAttribute("data-status", "inactive");

            if (animate && previousIndex !== undefined) {
              const previousOffset = getOffset(index, previousIndex);
              if (isVisibleOffset(previousOffset)) {
                const exitSlot =
                  previousOffset <= layoutConfig.visibleMin
                    ? layoutConfig.parkMin
                    : layoutConfig.parkMax;
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

            const parkSlot =
              offset < layoutConfig.visibleMin
                ? layoutConfig.parkMin
                : layoutConfig.parkMax;
            gsap.set(slide, getSlideProps(parkSlot));
            return;
          }

          const props = getSlideProps(offset);
          slide.setAttribute(
            "data-status",
            offset === 0 ? "active" : "inactive",
          );

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

        updateFeaturedPanel(!animate);
      }

      function goTo(targetIndex) {
        if (!totalSlides) return;

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
          const wasInRange =
            currentOffset >= layoutConfig.parkMin &&
            currentOffset <= layoutConfig.parkMax;
          const willBeVisible = isVisibleOffset(nextOffset);

          if (!wasInRange && willBeVisible) {
            const entrySlot =
              travelDirection > 0 ? layoutConfig.parkMax : layoutConfig.parkMin;
            gsap.set(slide, getSlideProps(entrySlot));
          }

          const wasInvisible =
            currentOffset <= layoutConfig.parkMin ||
            currentOffset >= layoutConfig.parkMax;
          const willBeStaging =
            nextOffset === layoutConfig.parkMin ||
            nextOffset === layoutConfig.parkMax;
          const crossesSides = currentOffset * nextOffset < 0;
          if (wasInvisible && willBeStaging && crossesSides) {
            gsap.set(
              slide,
              getSlideProps(
                nextOffset > 0 ? layoutConfig.parkMax : layoutConfig.parkMin,
              ),
            );
          }
        });

        activeIndex = normalizedTarget;
        layout(true, previousIndex);
        gsap.delayedCall(duration + 0.05, function () {
          isAnimating = false;
        });
      }

      function bindNavButton(button, direction) {
        if (!button) return;
        button.addEventListener("click", function (event) {
          event.preventDefault();
          goTo(activeIndex + direction);
        });
      }

      bindNavButton(prevButton, -1);
      bindNavButton(nextButton, 1);
      bindNavButton(extraPrevButton, -1);
      bindNavButton(extraNextButton, 1);

      document.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") goTo(activeIndex - 1);
        if (event.key === "ArrowRight") goTo(activeIndex + 1);
      });

      let resizeTimer;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          if (!totalSlides) return;
          measure();
          layout(false);
        }, 100);
      });

      const filterScope =
        wrapper.closest(".container--1344") ||
        wrapper.closest("section") ||
        wrapper.parentElement;
      const filterItems = filterScope
        ? Array.from(filterScope.querySelectorAll(".filter--item[filter]"))
        : [];

      function updateFilterButtons(selectedItem) {
        filterItems.forEach(function (filterItem) {
          const isActive = filterItem === selectedItem;
          filterItem.classList.toggle("is--active", isActive);
          filterItem.setAttribute("aria-pressed", isActive ? "true" : "false");
          const link = filterItem.querySelector("a");
          if (link) {
            link.setAttribute("aria-current", isActive ? "true" : "false");
          }
        });
      }

      filterItems.forEach(function (filterItem) {
        const trigger = filterItem.querySelector("a") || filterItem;
        filterItem.setAttribute("role", "button");
        filterItem.setAttribute("aria-pressed", "false");

        trigger.addEventListener("click", function (event) {
          event.preventDefault();
          const value = normalizeValue(filterItem.getAttribute("filter") || "");
          if (!value || isFiltering) return;
          updateFilterButtons(filterItem);
          applyCategoryFilter(value, false);
        });
      });

      const defaultFilterItem =
        filterItems.find(function (item) {
          return (
            normalizeValue(item.getAttribute("filter") || "") === DEFAULT_FILTER
          );
        }) || filterItems[0];

      if (defaultFilterItem) {
        updateFilterButtons(defaultFilterItem);
        applyCategoryFilter(
          normalizeValue(defaultFilterItem.getAttribute("filter") || ""),
          true,
        );
      } else {
        rebuildSlides("");
        gsap.set(viewport, { opacity: 1 });
      }
    }
  }
})();
