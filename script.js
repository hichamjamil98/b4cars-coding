/* ========================================================================== 
   B4CARS — INTERACTIONS & ANIMATIONS
   Requires GSAP + ScrollTrigger
========================================================================== */

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

    const EASE = "power4.out";

    initButtonCharacterHover();
    initLoadAnimations(EASE);
    initScrollAnimations(EASE);
    initImageParallax();
    initNavbarScroll();
    initMobileNavbar(EASE);
  });

  /* ========================================================================
     1. BUTTON TEXT CHARACTER HOVER
     Add data-button-animate-chars to the text element inside a button.
  ======================================================================== */

  function initButtonCharacterHover() {
    const textElements = document.querySelectorAll("[data-button-animate-chars]");
    const delayStep = 0.012;

    textElements.forEach((element) => {
      if (element.dataset.charsReady === "true") return;

      const text = element.textContent || "";
      element.textContent = "";
      element.setAttribute("aria-label", text.trim());

      [...text].forEach((character, index) => {
        const span = document.createElement("span");
        span.setAttribute("aria-hidden", "true");
        span.textContent = character === " " ? "\u00A0" : character;
        span.style.transitionDelay = `${index * delayStep}s`;
        element.appendChild(span);
      });

      element.dataset.charsReady = "true";
    });
  }

  /* ========================================================================
     2. PAGE LOAD ANIMATIONS

     animation="load"
     animation="load-up"
     animation="load-left"
     animation="load-right"
     animation="load-stagger"
     animation="load-split"
  ======================================================================== */

  function initLoadAnimations(ease) {
    const timeline = gsap.timeline({
      defaults: { ease },
      delay: 0.08,
    });

    addLoadTween(timeline, '[animation="load"]', {
      opacity: 0,
      y: "1rem",
    }, 0);

    addLoadTween(timeline, '[animation="load-up"]', {
      opacity: 0,
      y: "2rem",
    }, 0.04);

    addLoadTween(timeline, '[animation="load-left"]', {
      opacity: 0,
      x: "2rem",
    }, 0.04);

    addLoadTween(timeline, '[animation="load-right"]', {
      opacity: 0,
      x: "-2rem",
    }, 0.04);

    document.querySelectorAll('[animation="load-stagger"]').forEach((parent) => {
      const children = [...parent.children];
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

    document.querySelectorAll('[animation="load-split"]').forEach((element) => {
      const line = prepareSplitLine(element, "load-split");
      if (!line) return;

      timeline.fromTo(
        line,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.95,
          clearProps: "transform,opacity",
        },
        0.14,
      );
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
     3. SCROLL ANIMATIONS

     animation="fade"
     animation="fade-up"
     animation="fade-left"
     animation="fade-right"
     animation="fade-stagger"
     animation="fade-split"
  ======================================================================== */

  function initScrollAnimations(ease) {
    if (typeof ScrollTrigger === "undefined") return;

    initFade('[animation="fade"]', { opacity: 0, y: "1rem" }, ease);
    initFade('[animation="fade-up"]', { opacity: 0, y: "2rem" }, ease);
    initFade('[animation="fade-left"]', { opacity: 0, x: "2rem" }, ease);
    initFade('[animation="fade-right"]', { opacity: 0, x: "-2rem" }, ease);
    initFadeStagger(ease);
    initFadeSplit(ease);
  }

  function initFade(selector, fromVars, ease) {
    document.querySelectorAll(selector).forEach((element) => {
      gsap.fromTo(
        element,
        fromVars,
        {
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
        },
      );
    });
  }

  function initFadeStagger(ease) {
    document.querySelectorAll('[animation="fade-stagger"]').forEach((parent) => {
      const children = [...parent.children];
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
    document.querySelectorAll('[animation="fade-split"]').forEach((element) => {
      const line = prepareSplitLine(element, "fade-split");
      if (!line) return;

      gsap.fromTo(
        line,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            once: true,
          },
        },
      );
    });
  }

  function prepareSplitLine(element, prefix) {
    const readyAttribute = `${prefix.replace(/-/g, "")}Ready`;
    if (element.dataset[readyAttribute] === "true") {
      return element.querySelector(`.${prefix}__line`);
    }

    const content = element.innerHTML.trim();
    if (!content) return null;

    element.innerHTML = `
      <span class="${prefix}__line-mask">
        <span class="${prefix}__line">${content}</span>
      </span>
    `;

    element.dataset[readyAttribute] = "true";
    return element.querySelector(`.${prefix}__line`);
  }

  /* ========================================================================
     4. IMAGE PARALLAX

     Add image="parallax" directly to an image.
     The parent wrapper should have overflow: hidden.
  ======================================================================== */

  function initImageParallax() {
    if (typeof ScrollTrigger === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const images = document.querySelectorAll('[image="parallax"]');

    images.forEach((image) => {
      if (image.dataset.parallaxReady === "true") return;

      image.dataset.parallaxReady = "true";

      gsap.fromTo(
        image,
        {
          yPercent: -8,
        },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: image.parentElement || image,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  }

  /* ========================================================================
     5. NAVBAR BACKGROUND ON SCROLL

     - At the top: restores the background defined in Webflow.
     - While scrolling: applies #01070b.
     - While the mobile menu is open: restores Webflow's original background.
  ======================================================================== */

  function initNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const originalInlineBackground = navbar.style.backgroundColor;
    const originalComputedBackground =
      window.getComputedStyle(navbar).backgroundColor;

    const restoreWebflowBackground = () => {
      if (originalInlineBackground) {
        navbar.style.backgroundColor = originalInlineBackground;
      } else if (
        originalComputedBackground &&
        originalComputedBackground !== "rgba(0, 0, 0, 0)"
      ) {
        navbar.style.backgroundColor = originalComputedBackground;
      } else {
        navbar.style.removeProperty("background-color");
      }
    };

    const updateNavbar = () => {
      const menuIsOpen = navbar.classList.contains("is--menu-open");
      const pageIsScrolled = window.scrollY > 1;

      navbar.classList.toggle("is--scrolled", pageIsScrolled);

      if (menuIsOpen) {
        restoreWebflowBackground();
        return;
      }

      if (pageIsScrolled) {
        navbar.style.setProperty("background-color", "#01070b", "important");
      } else {
        restoreWebflowBackground();
      }
    };

    navbar.__updateScrollBackground = updateNavbar;

    updateNavbar();

    window.addEventListener("scroll", updateNavbar, {
      passive: true,
    });
  }

  /* ========================================================================
     6. TABLET / MOBILE NAVBAR

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
        .to(menu, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0)
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
            ease: "power2.inOut",
          },
          0,
        )
        .to(menu, { opacity: 0, duration: 0.42, ease: "power2.inOut" }, 0.1)
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
})();