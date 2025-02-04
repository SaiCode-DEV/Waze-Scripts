// ==UserScript==
// @name         Vue Loader
// @namespace    https://github.com/SaiCode-DEV
// @version      1.0.0
// @description  Loads Vue.js into the current page if it is not already loaded.
// @author       SaiCode
// @include       /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/* global Vue */
/* jshint esversion:6 */

(function main() {
  "use strict";

  const VUE_URL = "https://unpkg.com/vue@3/dist/vue.global.js";

  async function init() {
    const sandboxed = typeof unsafeWindow !== "undefined";
    const pageWindow = sandboxed ? unsafeWindow : window;

    // Check if Vue is already loaded
    if (typeof pageWindow.Vue !== "undefined") {
      console.log("Vue.js is already loaded.");
      return;
    }

    console.log("Loading Vue.js...");
    await loadScript(VUE_URL);

    if (typeof pageWindow.Vue !== "undefined") {
      console.log("Vue.js has been loaded successfully.");
    } else {
      console.error("Error loading Vue.js.");
    }
  }

  // Function to load an external script
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function bootstrap(tries = 1) {
    if (typeof $ !== "undefined") {
      init();
    } else if (tries < 100) {
      setTimeout(() => bootstrap(tries + 1), 100);
    } else {
      console.error("Vue Loader could not be initialized.");
    }
  }

  bootstrap();
})();
