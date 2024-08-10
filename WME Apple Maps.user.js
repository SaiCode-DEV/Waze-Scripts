// ==UserScript==
// @name         Waze GeoPortal DACH
// @namespace    https://github.com/SaiCode-DEV/
// @version      2024.06.13
// @description  Apple Maps for Waze Map Editor
// @author       SaiCode (idea by hiwi234)
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waze.com
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

/* global $, W */
/* globals OpenLayers: true */

(() => {
  "use strict";

  function loadVueJS() {
    // check if Vue.js is already loaded
    if (typeof Vue !== "undefined") {
      return;
    }
    console.log("Loading Vue.js");
    const vuejs = document.createElement("script");
    vuejs.src = "https://unpkg.com/vue@3/dist/vue.global.js";
    document.head.appendChild(vuejs);
  }

  loadVueJS();
})();
