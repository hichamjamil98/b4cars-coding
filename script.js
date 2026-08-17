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
    initNavbarScroll();
    initMobileNavbar(EASE);
    initCtaGallery(EASE);
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
     load-split     OR  animation="load-split"
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
    document.querySelectorAll(animSelector("load-split")).forEach((element) => {
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

      tween = gsap.fromTo(
        lines,
        { yPercent: 110, opacity: 0 },
        vars,
      );
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

    document.querySelectorAll(animSelector("parallax-fade")).forEach((element) => {
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
     4. NAVBAR BACKGROUND ON SCROLL

     - At the top: restores the background and text color defined in Webflow.
     - While scrolling: white background, #01070b text.
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
        navbar.style.setProperty("color", "#01070b", "important");
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

        const changeImage = () => {
          const nextSource = thumbnailImage.currentSrc || thumbnailImage.src;

          if (!nextSource || thumbnail === activeThumbnail || isAnimating)
            return;

          isAnimating = true;
          setActiveThumbnail(thumbnail);

          const switchSource = () => {
            mainImage.src = nextSource;
            mainImage.removeAttribute("srcset");
          };

          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            switchSource();
            isAnimating = false;
            return;
          }

          gsap
            .timeline({
              onComplete: () => {
                isAnimating = false;
              },
            })
            .to(mainImage, {
              opacity: 0,
              scale: 1.025,
              duration: 0.28,
              ease,
            })
            .add(switchSource)
            .fromTo(
              mainImage,
              { opacity: 0, scale: 1.025 },
              {
                opacity: 1,
                scale: 1,
                duration: 0.42,
                ease,
                clearProps: "opacity,scale",
              },
            );
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
})();
