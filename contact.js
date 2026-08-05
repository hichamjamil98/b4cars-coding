/* ==========================================================================
   B4CARS — CONTACT PAGE V2
   Navbar + intl-tel-input loaded automatically
========================================================================== */

(() => {
    "use strict";
  
    const ITI_CSS =
      "https://cdn.jsdelivr.net/npm/intl-tel-input@25/build/css/intlTelInput.css";
  
    const ITI_JS =
      "https://cdn.jsdelivr.net/npm/intl-tel-input@25/build/js/intlTelInput.min.js";
  
    const ITI_UTILS =
      "https://cdn.jsdelivr.net/npm/intl-tel-input@25/build/js/utils.js";
  
    document.addEventListener("DOMContentLoaded", async () => {
      const contactPage = document.querySelector(".section.is--contact");
      if (!contactPage) return;
  
      document.body.classList.add("is--contact-page");
  
      try {
        await loadIntlTelInput();
        initContactPhoneField();
      } catch (error) {
        console.error(
          "[B4Cars] Impossible de charger intl-tel-input.",
          error
        );
      }
    });
  
    function loadIntlTelInput() {
      loadStylesheet(ITI_CSS);
  
      if (typeof window.intlTelInput === "function") {
        return Promise.resolve();
      }
  
      return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(
          'script[data-b4cars-intl-tel-input]'
        );
  
        if (existingScript) {
          existingScript.addEventListener("load", resolve, { once: true });
          existingScript.addEventListener("error", reject, { once: true });
          return;
        }
  
        const script = document.createElement("script");
        script.src = ITI_JS;
        script.async = true;
        script.dataset.b4carsIntlTelInput = "true";
  
        script.addEventListener("load", resolve, { once: true });
        script.addEventListener("error", reject, { once: true });
  
        document.head.appendChild(script);
      });
    }
  
    function loadStylesheet(href) {
      if (document.querySelector(`link[href="${href}"]`)) return;
  
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.b4carsIntlTelInput = "true";
  
      document.head.appendChild(link);
    }
  
    function initContactPhoneField() {
      const form = document.querySelector("#email-form");
      const phoneInput = document.querySelector("#T-l-phone");
  
      if (!form || !phoneInput) {
        console.warn(
          "[B4Cars] #email-form ou #T-l-phone est introuvable."
        );
        return;
      }
  
      if (typeof window.intlTelInput !== "function") {
        console.warn("[B4Cars] intl-tel-input n'est pas disponible.");
        return;
      }
  
      if (phoneInput.dataset.itiReady === "true") return;
      phoneInput.dataset.itiReady = "true";
  
      phoneInput.type = "tel";
      phoneInput.name = "Phone number";
      phoneInput.setAttribute("data-name", "Phone number");
      phoneInput.setAttribute("autocomplete", "tel");
      phoneInput.setAttribute("inputmode", "tel");
  
      const iti = window.intlTelInput(phoneInput, {
        initialCountry: "auto",
  
        geoIpLookup: (success) => {
          fetch("https://ipwho.is/")
            .then((response) => {
              if (!response.ok) throw new Error("Geo-IP request failed");
              return response.json();
            })
            .then((data) => {
              const countryCode =
                data &&
                data.success !== false &&
                typeof data.country_code === "string"
                  ? data.country_code.toLowerCase()
                  : "ma";
  
              success(countryCode);
            })
            .catch(() => success("ma"));
        },
  
        preferredCountries: [
          "ma",
          "fr",
          "cn",
          "ae",
          "be",
          "ch",
          "es",
        ],
  
        separateDialCode: true,
        nationalMode: false,
        formatAsYouType: true,
        autoPlaceholder: "off",
  
        loadUtils: () => import(ITI_UTILS),
      });
  
      /*
       * intl-tel-input wraps the original Webflow input inside .iti.
       * Webflow grid placement classes must therefore be moved to the wrapper.
       */
      const itiWrapper = phoneInput.closest(".iti");
  
      if (itiWrapper) {
        [...phoneInput.classList]
          .filter((className) => className.startsWith("w-node-"))
          .forEach((className) => {
            itiWrapper.classList.add(className);
            phoneInput.classList.remove(className);
          });
  
        itiWrapper.classList.add("contact--phone-field");
      }
  
      const countryCodeInput = createHiddenInput(
        form,
        "Country code"
      );
  
      const fullPhoneInput = createHiddenInput(
        form,
        "Full phone number"
      );
  
      const updatePhoneValues = () => {
        const country = iti.getSelectedCountryData();
  
        countryCodeInput.value = country?.dialCode
          ? `+${country.dialCode}`
          : "";
  
        fullPhoneInput.value =
          iti.getNumber() || phoneInput.value.trim();
      };
  
      phoneInput.addEventListener(
        "countrychange",
        updatePhoneValues
      );
  
      phoneInput.addEventListener(
        "input",
        updatePhoneValues
      );
  
      form.addEventListener("submit", () => {
        phoneInput.value = phoneInput.value.trim();
        updatePhoneValues();
      });
  
      updatePhoneValues();
  
      window.setTimeout(updatePhoneValues, 400);
      window.setTimeout(updatePhoneValues, 1000);
    }
  
    function createHiddenInput(form, name) {
      let input = form.querySelector(
        `input[type="hidden"][name="${name}"]`
      );
  
      if (input) return input;
  
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.setAttribute("data-name", name);
  
      form.appendChild(input);
  
      return input;
    }
  })();