/* ==========================================================================
   B4CARS — PRESS TEMPLATE V2
   Share current article on X and LinkedIn in a new tab
========================================================================== */

(() => {
    "use strict";
  
    document.addEventListener("DOMContentLoaded", () => {
      const page = document.querySelector(".section.is--tempress-hero");
      if (!page) return;
  
      const currentUrl = window.location.href;
      const currentTitle =
        page.querySelector("h1")?.textContent?.trim() ||
        document.title ||
        "B4Cars";
  
      document
        .querySelectorAll('.post--social .social--share[share]')
        .forEach((button) => {
          const network = (
            button.getAttribute("share") || ""
          ).trim().toLowerCase();
  
          let shareUrl = "";
  
          if (network === "x" || network === "twitter") {
            shareUrl =
              "https://twitter.com/intent/tweet" +
              `?url=${encodeURIComponent(currentUrl)}` +
              `&text=${encodeURIComponent(currentTitle)}`;
  
            button.setAttribute(
              "aria-label",
              "Partager cet article sur X"
            );
          }
  
          if (network === "linkedin") {
            shareUrl =
              "https://www.linkedin.com/sharing/share-offsite/" +
              `?url=${encodeURIComponent(currentUrl)}`;
  
            button.setAttribute(
              "aria-label",
              "Partager cet article sur LinkedIn"
            );
          }
  
          if (!shareUrl) return;
  
          button.href = shareUrl;
          button.target = "_blank";
          button.rel = "noopener noreferrer";
        });
    });
  })();