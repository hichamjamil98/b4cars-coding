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
          element.style.opacity = "1";
          element.style.visibility = "visible";
        });
  
        if (loader) {
          loader.style.display = "none";
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
        "(prefers-reduced-motion: reduce)"
      ).matches;
  
      if (prefersReducedMotion) {
        revealPageWithoutAnimation();
        return;
      }
  
      html.classList.add("is-loading");
      body.classList.add("is-loading");
  
      const paths = logo
        ? gsap.utils.toArray(logo.querySelectorAll("path"))
        : [];
  
      let hasDrawablePaths = false;
  
      paths.forEach((path) => {
        try {
          const length = path.getTotalLength();
  
          if (!Number.isFinite(length) || length <= 0) return;
  
          hasDrawablePaths = true;
  
          path.dataset.originalFill =
            path.getAttribute("fill") || "currentColor";
  
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
  
      if (secondaryElements.length) {
        gsap.set(secondaryElements, {
          opacity: 0,
          y: "1rem",
          filter: "blur(6px)",
        });
      }
  
      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
        onComplete: () => {
          loader.style.display = "none";
          html.classList.remove("is-loading");
          body.classList.remove("is-loading");
  
          gsap.set(pageElements, {
            clearProps: "opacity,visibility",
          });
  
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
          "start"
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
          "start+=0.12"
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
          "start+=0.15"
        );
  
        timeline.to(
          paths,
          {
            strokeDashoffset: 0,
            duration: 1.45,
            stagger: 0.09,
            ease: "power2.inOut",
          },
          "start+=0.2"
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
          "start+=1.35"
        );
      } else if (logo) {
        timeline.to(
          logo,
          {
            opacity: 1,
            duration: 1,
          },
          "start+=0.25"
        );
      }
  
      timeline.to(
        logoWrapper || logo,
        {
          scale: 1.04,
          duration: 0.55,
          ease: "power2.inOut",
        },
        "start+=1.45"
      );
  
      timeline.to(
        logoWrapper || logo,
        {
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "start+=1.9"
      );
  
      if (secondaryElements.length) {
        timeline.to(
          secondaryElements,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.75,
            stagger: 0.12,
          },
          "start+=1.7"
        );
      }
  
      timeline.addLabel("ready", 2.65);
  
      timeline.to(
        [logoWrapper, ...secondaryElements].filter(Boolean),
        {
          opacity: 0,
          y: "-0.75rem",
          filter: "blur(4px)",
          duration: 0.55,
          stagger: 0.04,
          ease: "power2.inOut",
        },
        "ready"
      );
  
      if (backgroundImage) {
        timeline.to(
          backgroundImage,
          {
            opacity: 0.9,
            scale: 1,
            duration: 0.7,
            ease: "power2.inOut",
          },
          "ready"
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
        "ready+=0.28"
      );
  
      timeline.to(
        loader,
        {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.25,
          ease: "expo.inOut",
          pointerEvents: "none",
        },
        "ready+=0.2"
      );
  
      timeline.to(
        loader,
        {
          opacity: 0.96,
          duration: 1.25,
          ease: "none",
        },
        "ready+=0.2"
      );
    });
  })();