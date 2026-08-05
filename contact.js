/* ==========================================================================
   B4CARS — CONTACT PAGE
========================================================================== */

(() => {
    "use strict";
  
    document.addEventListener("DOMContentLoaded", () => {
      const contactPage = document.querySelector(".section.is--contact");
      if (!contactPage) return;
  
      document.body.classList.add("is--contact-page");
  
      initContactPhoneField();
    });
  
    function initContactPhoneField() {
      const form = document.querySelector("#email-form");
      const phoneInput =
        document.querySelector("#T-l-phone") ||
        document.querySelector("#Phone-number");
  
      if (!form || !phoneInput) return;
  
      phoneInput.type = "tel";
      phoneInput.name = "Phone number";
      phoneInput.setAttribute("data-name", "Phone number");
      phoneInput.setAttribute("autocomplete", "tel");
      phoneInput.setAttribute("inputmode", "tel");
  
      if (typeof window.intlTelInput !== "function") {
        console.warn(
          "[B4Cars] intl-tel-input n'est pas chargé sur la page Contact."
        );
        return;
      }
  
      const iti = window.intlTelInput(phoneInput, {
        initialCountry: "auto",
  
        geoIpLookup: (success) => {
          fetch("https://ipwho.is/")
            .then((response) => {
              if (!response.ok) {
                throw new Error("Geo-IP request failed");
              }
  
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
            .catch(() => {
              success("ma");
            });
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
  
        /*
         * intl-tel-input v25+
         */
        loadUtils: () =>
          import(
            "https://cdn.jsdelivr.net/npm/intl-tel-input@25/build/js/utils.js"
          ),
      });
  
      const countryCodeInput = document.createElement("input");
      countryCodeInput.type = "hidden";
      countryCodeInput.name = "Country code";
      countryCodeInput.setAttribute("data-name", "Country code");
  
      const fullPhoneInput = document.createElement("input");
      fullPhoneInput.type = "hidden";
      fullPhoneInput.name = "Full phone number";
      fullPhoneInput.setAttribute("data-name", "Full phone number");
  
      form.append(countryCodeInput, fullPhoneInput);
  
      const updatePhoneValues = () => {
        const selectedCountry = iti.getSelectedCountryData();
  
        countryCodeInput.value = selectedCountry?.dialCode
          ? `+${selectedCountry.dialCode}`
          : "";
  
        const internationalNumber = iti.getNumber();
  
        fullPhoneInput.value =
          internationalNumber || phoneInput.value.trim();
      };
  
      const refreshPhoneField = () => {
        updatePhoneValues();
  
        /*
         * Keeps intl-tel-input correctly aligned after Webflow/GSAP layout
         * changes without modifying the Webflow field dimensions.
         */
        window.dispatchEvent(new Event("resize"));
      };
  
      refreshPhoneField();
  
      window.setTimeout(refreshPhoneField, 300);
      window.setTimeout(refreshPhoneField, 800);
  
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
    }
  })();