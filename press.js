/* ==========================================================================
   B4CARS — PRESS PAGE
========================================================================== */

(() => {
    "use strict";
  
    document.addEventListener("DOMContentLoaded", () => {
      const pressPage = document.querySelector(
        ".section.is--press-list, .section.is--press-hero"
      );
      if (!pressPage) return;
  
      document.querySelectorAll(".press--card").forEach((card) => {
        const activate = () => card.classList.add("is--hovered");
        const deactivate = () => card.classList.remove("is--hovered");
  
        card.addEventListener("mouseenter", activate);
        card.addEventListener("mouseleave", deactivate);
        card.addEventListener("focusin", activate);
  
        card.addEventListener("focusout", (event) => {
          if (!card.contains(event.relatedTarget)) deactivate();
        });
      });
    });
  })();