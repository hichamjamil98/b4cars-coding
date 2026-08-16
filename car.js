/* ========================================================================== 
   B4CARS — CAR TEMPLATE PAGE
   FAQ + Desktop custom gallery + Tablet/Mobile normal Swiper
========================================================================== */

(() => {
    "use strict";
  
    const DESKTOP_BREAKPOINT = 992;
    const MOBILE_SPEED = 650;
    const DESKTOP_DURATION = 720;
    const DESKTOP_CLASSES = [
      "b4-car-active","b4-car-prev-1","b4-car-prev-2","b4-car-prev-3",
      "b4-car-next-1","b4-car-next-2","b4-car-next-3","b4-car-hidden"
    ];
  
    document.addEventListener("DOMContentLoaded", () => {
      const page = document.querySelector(".section.is--vehiculetemplate-hero");
      if (!page) return;
  
      /* FORMAT km / price */
      const parseInteger = (value) => {
        const cleaned = String(value ?? "").replace(/[^\d-]/g, "");
        if (!cleaned || cleaned === "-") return null;
        const n = Number.parseInt(cleaned, 10);
        return Number.isFinite(n) ? n : null;
      };
      const formatGrouped = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      document.querySelectorAll('[format="km"], [format="price"]').forEach((el) => {
        if (!el.dataset.b4RawValue) el.dataset.b4RawValue = el.textContent.trim();
        const raw = parseInteger(el.dataset.b4RawValue);
        if (raw === null) return;
        el.textContent = el.getAttribute("format") === "km" ? `${formatGrouped(raw)}km` : `${formatGrouped(raw)}€`;
      });
  
      /* FAQ */
      const faqSection = document.querySelector(".section.is--vehiculetemplate-faq");
      if (faqSection) {
        const items = Array.from(faqSection.querySelectorAll(".faq--item"));
        const closeItem = (item) => {
          const answer = item.querySelector(".faq--answer");
          if (!answer) return;
          if (answer.style.height === "auto") answer.style.height = `${answer.scrollHeight}px`;
          requestAnimationFrame(() => {
            answer.style.height = "0px";
            item.classList.remove("is--open");
            item.querySelector(".faq--question")?.setAttribute("aria-expanded", "false");
          });
        };
        const openItem = (item) => {
          items.forEach((other) => { if (other !== item && other.classList.contains("is--open")) closeItem(other); });
          const answer = item.querySelector(".faq--answer");
          if (!answer) return;
          item.classList.add("is--open");
          item.querySelector(".faq--question")?.setAttribute("aria-expanded", "true");
          answer.style.height = `${answer.scrollHeight}px`;
          window.setTimeout(() => { if (item.classList.contains("is--open")) answer.style.height = "auto"; }, 620);
        };
        items.forEach((item) => {
          const q = item.querySelector(".faq--question");
          if (!q) return;
          q.setAttribute("role", "button");
          q.setAttribute("tabindex", "0");
          q.setAttribute("aria-expanded", "false");
          const toggle = () => item.classList.contains("is--open") ? closeItem(item) : openItem(item);
          q.addEventListener("click", toggle);
          q.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault(); toggle();
          });
        });
      }
  
      /* GALLERY */
      const swiperEl = page.querySelector(".swiper.is--car");
      const wrapper = swiperEl?.querySelector(".swiper-wrapper.is--car");
      if (!swiperEl || !wrapper) return;
  
      const prevBtn = page.querySelector(".swiper--navigation.is--car .swiper--btn.is--previous");
      const nextBtn = page.querySelector(".swiper--navigation.is--car .swiper--btn.is--next");
      const desktopMedia = window.matchMedia(`(min-width:${DESKTOP_BREAKPOINT}px)`);
  
      let mobileSwiper = null;
      let currentIndex = 0;
      let isAnimating = false;
      let desktopClones = [];
  
      const isDesktop = () => desktopMedia.matches;
      const mod = (v, total) => ((v % total) + total) % total;
      const originalSlides = () => Array.from(wrapper.querySelectorAll(':scope > .swiper-slide.is--car:not([data-b4-clone="true"])'));
      const allDesktopSlides = () => Array.from(wrapper.querySelectorAll(':scope > .swiper-slide.is--car'));
  
      const clearClasses = (slide) => DESKTOP_CLASSES.forEach((c) => slide.classList.remove(c));
      const removeDesktopClones = () => {
        desktopClones.forEach((clone) => clone.remove());
        desktopClones = [];
      };
  
      const buildDesktopPool = () => {
        removeDesktopClones();
        const originals = originalSlides();
        if (!originals.length) return;
        /* Need at least 7 unique DOM nodes visible simultaneously. */
        let cursor = 0;
        while (originals.length + desktopClones.length < 9) {
          const source = originals[cursor % originals.length];
          const clone = source.cloneNode(true);
          clone.dataset.b4Clone = "true";
          clone.dataset.b4LogicalIndex = String(cursor % originals.length);
          clone.removeAttribute("id");
          wrapper.appendChild(clone);
          desktopClones.push(clone);
          cursor += 1;
        }
        originals.forEach((slide, i) => { slide.dataset.b4LogicalIndex = String(i); });
      };
  
      const logicalNodes = (logicalIndex) =>
        allDesktopSlides().filter((slide) => Number(slide.dataset.b4LogicalIndex) === logicalIndex);
  
      const takeNodeForRole = (logicalIndex, used) => {
        const candidates = logicalNodes(logicalIndex);
        const node = candidates.find((n) => !used.has(n));
        if (node) used.add(node);
        return node || null;
      };
  
      const applyDesktopStates = (animate = true) => {
        const originals = originalSlides();
        const total = originals.length;
        if (!total) return;
        currentIndex = mod(currentIndex, total);
        const pool = allDesktopSlides();
        if (!animate) wrapper.classList.add("is-no-transition");
        pool.forEach((slide) => { clearClasses(slide); slide.classList.add("b4-car-hidden"); });
  
        const used = new Set();
        const roles = [
          [0,"b4-car-active"],[-1,"b4-car-prev-1"],[-2,"b4-car-prev-2"],[-3,"b4-car-prev-3"],
          [1,"b4-car-next-1"],[2,"b4-car-next-2"],[3,"b4-car-next-3"]
        ];
        roles.forEach(([offset, cls]) => {
          const logical = mod(currentIndex + offset, total);
          const node = takeNodeForRole(logical, used);
          if (!node) return;
          clearClasses(node);
          node.classList.add(cls);
        });
  
        if (!animate) {
          void wrapper.offsetWidth;
          requestAnimationFrame(() => wrapper.classList.remove("is-no-transition"));
        }
      };
  
      const cleanInline = () => {
        wrapper.style.removeProperty("transform");
        wrapper.style.removeProperty("height");
        allDesktopSlides().forEach((slide) => {
          ["width","height","transform","opacity","margin-right","left","top","position"].forEach((p) => slide.style.removeProperty(p));
        });
      };
  
      const destroyMobile = () => {
        if (mobileSwiper && typeof mobileSwiper.destroy === "function") {
          if (Number.isFinite(mobileSwiper.realIndex)) currentIndex = mobileSwiper.realIndex;
          mobileSwiper.destroy(true, true);
          mobileSwiper = null;
        }
      };
  
      const enableDesktop = () => {
        destroyMobile();
        cleanInline();
        buildDesktopPool();
        applyDesktopStates(false);
      };
  
      const enableMobile = () => {
        removeDesktopClones();
        allDesktopSlides().forEach(clearClasses);
        cleanInline();
        if (mobileSwiper) return;
        if (typeof window.Swiper === "undefined") {
          console.warn("[B4Cars] Swiper is not loaded.");
          return;
        }
        mobileSwiper = new window.Swiper(swiperEl, {
          loop:true,
          initialSlide:currentIndex,
          slidesPerView:1,
          slidesPerGroup:1,
          spaceBetween:24,
          speed:MOBILE_SPEED,
          allowTouchMove:true,
          simulateTouch:true,
          observer:true,
          observeParents:true,
          resizeObserver:true,
          navigation:{ prevEl:prevBtn, nextEl:nextBtn },
          on:{ slideChange(instance){ currentIndex = instance.realIndex; } }
        });
      };
  
      const moveDesktop = (dir) => {
        if (!isDesktop() || isAnimating) return;
        const total = originalSlides().length;
        if (total < 2) return;
        isAnimating = true;
        currentIndex = mod(currentIndex + dir, total);
        applyDesktopStates(true);
        window.setTimeout(() => { isAnimating = false; }, DESKTOP_DURATION + 20);
      };
  
      nextBtn?.addEventListener("click", (e) => {
        if (!isDesktop()) return;
        e.preventDefault(); e.stopPropagation(); moveDesktop(1);
      }, true);
      prevBtn?.addEventListener("click", (e) => {
        if (!isDesktop()) return;
        e.preventDefault(); e.stopPropagation(); moveDesktop(-1);
      }, true);
  
      wrapper.addEventListener("click", (e) => {
        if (!isDesktop() || isAnimating) return;
        const slide = e.target.closest(".swiper-slide.is--car");
        if (!slide || slide.classList.contains("b4-car-active")) return;
        if (slide.classList.contains("b4-car-next-1")) return moveDesktop(1);
        if (slide.classList.contains("b4-car-next-2")) { currentIndex = mod(currentIndex + 2, originalSlides().length); applyDesktopStates(true); return; }
        if (slide.classList.contains("b4-car-next-3")) { currentIndex = mod(currentIndex + 3, originalSlides().length); applyDesktopStates(true); return; }
        if (slide.classList.contains("b4-car-prev-1")) return moveDesktop(-1);
        if (slide.classList.contains("b4-car-prev-2")) { currentIndex = mod(currentIndex - 2, originalSlides().length); applyDesktopStates(true); return; }
        if (slide.classList.contains("b4-car-prev-3")) { currentIndex = mod(currentIndex - 3, originalSlides().length); applyDesktopStates(true); }
      });
  
      const updateMode = () => isDesktop() ? enableDesktop() : enableMobile();
      if (typeof desktopMedia.addEventListener === "function") desktopMedia.addEventListener("change", updateMode);
      else desktopMedia.addListener(updateMode);
  
      let resizeTimer = null;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (isDesktop()) applyDesktopStates(false);
          else mobileSwiper?.update();
        }, 120);
      });
  
      updateMode();
    });
  })();