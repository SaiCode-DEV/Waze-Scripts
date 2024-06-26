// ==UserScript==
// @name         Waze Translate
// @namespace    https://greasyfork.org/de/users/863740-horst-wittlich
// @version      0.01
// @description  Auto Translate using DeepL or LibreTranslate API for Waze Map Editor (WME)
// @author       SaiCode
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waze.com
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @grant        GM_webRequest
// @grant        GM_info
// @grant        GM_addStyle
// @license      MIT

// @downloadURL  https://
// @updateURL    https://
// ==/UserScript==

/*global I18n, $*/

(() => {
  /**
   * Load the translation library
   */
  function loadTranslateLib() {
    var version = OpenLayers.VERSION_NUMBER.replace(/Release /, "");
    console.info("Loading openlayers/" + version + "/" + filename + ".js");

    var translate = document.createElement("script");
    translate.src = "https://cdn.jsdelivr.net/npm/translate/index.min.js";
    translate.type = "module";
    document.head.appendChild(translate);
  }

  loadTranslateLib();
})();

GM_addStyle(`

`);
