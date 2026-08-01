/* ==========================================================================
   B4CARS — PRESS TEMPLATE
========================================================================== */

(() => {
    "use strict";
  
    document.addEventListener("DOMContentLoaded", () => {
      const templatePage = document.querySelector(".section.is--tempress-hero");
      if (!templatePage) return;
  
      const buttons = document.querySelectorAll(
        '.post--social .social--share[share]'
      );
  
      const currentUrl = window.location.href;
      const pageTitle =
        document.querySelector(".section.is--tempress-hero h1")?.textContent?.trim() ||
        document.title ||
        "B4Cars";
  
      buttons.forEach((button) => {
        const network = button.getAttribute("share")?.trim().toLowerCase();
        let shareUrl = "";
  
        if (network === "x" || network === "twitter") {
          shareUrl =
            "https://twitter.com/intent/tweet" +
            `?url=${encodeURIComponent(currentUrl)}` +
            `&text=${encodeURIComponent(pageTitle)}`;
  
          button.setAttribute("aria-label", "Partager cet article sur X");
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
  
        button.addEventListener("click", (event) => {
          event.preventDefault();
  
          const width = 720;
          const height = 620;
          const left = Math.max(
            0,
            window.screenX + (window.outerWidth - width) / 2
          );
          const top = Math.max(
            0,
            window.screenY + (window.outerHeight - height) / 2
          );
  
          const popup = window.open(
            shareUrl,
            `b4cars-share-${network}`,
            `noopener,noreferrer,width=${width},height=${height},left=${left},top=${top}`
          );
  
          if (!popup) window.location.href = shareUrl;
        });
      });
    });
  })();