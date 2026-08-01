/* ========================================================================== 
   B4CARS — INTERACTIONS & ANIMATIONS
========================================================================== */

/* Prevent horizontal overflow and lock page when mobile menu is open. */
body {
  overflow-x: hidden;
}

html.is--locked,
body.is--locked {
  overflow: hidden !important;
  overscroll-behavior: none;
}

/* ========================================================================== 
   BUTTON CHARACTER HOVER
========================================================================== */

[data-button-animate-chars] {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
}

[data-button-animate-chars] span {
  position: relative;
  display: inline-block;
  transform: translateY(0);
  text-shadow: 0 1.25em currentColor;
  transition: transform 0.55s cubic-bezier(0.625, 0.05, 0, 1);
  will-change: transform;
}

@media (hover: hover) and (pointer: fine) {
  .btn:hover [data-button-animate-chars] span,
  .button:hover [data-button-animate-chars] span,
  .nav--menu a:hover [data-button-animate-chars] span {
    transform: translateY(-1.25em);
  }
}

/* ========================================================================== 
   LOAD / SCROLL ANIMATIONS
========================================================================== */

[animation="load"],
[animation="load-up"],
[animation="load-left"],
[animation="load-right"],
[animation="load-stagger"] > *,
[animation="load-split"],
[animation="fade"],
[animation="fade-up"],
[animation="fade-left"],
[animation="fade-right"],
[animation="fade-stagger"] > *,
[animation="fade-split"] {
  will-change: transform, opacity;
}

[animation="load-split"],
[animation="fade-split"] {
  opacity: 1 !important;
  visibility: visible !important;
}

.load-split__line-mask,
.fade-split__line-mask {
  display: block;
  overflow: hidden;
}

.load-split__line,
.fade-split__line {
  display: block;
  will-change: transform, opacity;
}

/* ========================================================================== 
   MOBILE NAVBAR ICONS
========================================================================== */

.menu--trigger {
  position: relative;
  z-index: 1002;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.menu--trigger:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 0.3rem;
}

.menu--to-open,
.menu--to-close {
  display: block;
  width: 100%;
  height: auto;
  color: currentColor;
  transform-origin: center;
  will-change: transform, opacity;
}

.menu--to-close {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(0.75) rotate(-90deg);
  pointer-events: none;
}

/* ========================================================================== 
   TABLET / MOBILE NAVBAR
========================================================================== */

@media screen and (max-width: 991px) {
  .navbar {
    z-index: 1000;
  }

  .navbar .container--nav {
    position: relative;
    z-index: 1002;
  }

  .nav--brand {
    position: relative;
    z-index: 1002;
  }

  .nav--menu {
    position: fixed;
    inset: 0;
    z-index: 1001;

    display: none;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 1.25rem;

    width: 100%;
    height: 100dvh;
    padding: 7rem 1.5rem 2rem;

    background: #f3f0e9;
    opacity: 0;
    pointer-events: none;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .nav--menu.is--open {
    pointer-events: auto;
  }

  .nav--menu > a {
    width: 100%;
    opacity: 0;
    transform: translateY(1.5rem);
    filter: blur(6px);
    will-change: transform, opacity, filter;
  }

  .navbar.is--menu-open,
  .navbar.is--menu-open .nav--brand,
  .navbar.is--menu-open .menu--trigger {
    color: inherit;
  }
}

/* Restore normal desktop navigation. */
@media screen and (min-width: 992px) {
  .nav--menu {
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  .nav--menu > a {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}

/* Accessibility: reduce motion when requested by the user. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}