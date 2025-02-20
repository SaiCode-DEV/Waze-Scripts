/* global W, $, WazeWrap, getWmeSdk, SDK_INITIALIZED */

// ==UserScript==
// @name          WME API House Numbers
// @description   A House Number script with its controls in the House Number mini-editor. It allows you to quickly add house numbers to the map by fetching them from an API.
// @namespace     https://github.com/SaiCode-DEV
// @version       1.0
// @include       /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @copyright     2025-2025, SaiCode
// @author        SaiCode (2024-?)
// @license       MIT
// @grant         GM_addStyle
// @grant         GM_xmlhttpRequest
// @require       https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// ==/UserScript==

const DEBUG = true;

// Add fetch tracking variables
let isFetching = false;
let lastFetchedPosition = null;

(function main() {
  "use strict";

  const scriptName = GM_info.script.name;
  const { version } = GM_info.script;

  const log = (message, ...args) => {
    if (DEBUG) {
      console.log(`${scriptName}: ${message}`, ...args);
    }
  };

  // Display change log immediately as it has no dependencies on waze itself.
  const changeLog = [
    { version: "1.0", message: "Created script." },
  ];

  let wmeSDK = null;

  let houseNumbersObserver;

  const config = loadConfig();

  const shortcuts = [
    {
      callback: handleCustomShortcut,
      description: "New HN from API",
      shortcutId: "WME_RHN_fromAPI",
      shortcutKeys: null,
    },
  ];

  function loadConfig() {
    const loaded = JSON.parse(window.localStorage.getItem("rapidHN"));
    const defaultConfig = {
      version: 0,
      apiKey: "YOUR_API_KEY",
    };

    // If no config exists yet, return default
    if (!loaded) return defaultConfig;

    return {
      ...defaultConfig,
      ...loaded,
    };
  }

  function saveConfig() {
    window.localStorage.setItem("rapidHN", JSON.stringify(config));
  }

  async function checkVersion() {
    if (!WazeWrap?.Ready && !WazeWrap?.Interface?.ShowScriptUpdate) {
      setTimeout(checkVersion, 200);
      return;
    }

    const previousVersion = config.version;

    if (previousVersion === version) {
      return;
    }

    let announcement = "";
    let startIndex = 0;

    // Find the index of the previous version in the change log
    if (previousVersion) {
      startIndex = changeLog.findIndex(change => change.version === previousVersion);
      if (startIndex === -1) {
        startIndex = 0; // If not found, start from the beginning
      }
    }
    announcement += "<ul>";
    // Build the announcement message from the change log
    for (let i = startIndex + 1; i < changeLog.length; i++) {
      const msg = `<li> V${changeLog[i].version}: ${changeLog[i].message} </li>\n`;
      announcement += msg;
    }
    announcement += "</ul>";

    if (DEBUG) {
      console.group(`${scriptName} v${version} changelog:`);
      changeLog.slice(startIndex + 1).forEach(change => log(`V${change.version}: ${change.message}`));
      console.groupEnd();
    }

    const title = startIndex > 0 ? `V${changeLog[startIndex].version} -> V${version}` : `Welcome to RHN V${version}`;
    log("ShwowScriptUpdate", scriptName, title, announcement);
    WazeWrap.Interface.ShowScriptUpdate(
      scriptName,
      title,
      announcement,
      "https://greasyfork.org/en/scripts/35931-wme-rapid-house-numbers",
    );
    config.version = version;
    saveConfig();
  }
  checkVersion();

  function wmeReady() {
    wmeSDK = getWmeSdk({
      scriptId: "RHN_API_Script",
      scriptName,
    });
    return new Promise(resolve => {
      if (wmeSDK.State.isReady()) { resolve(); }
      wmeSDK.Events.once({ eventName: "wme-ready" }).then(resolve);
    });
  }

  // Delay until Waze has been loaded.
  async function rapidHNBootstrap() {
    await SDK_INITIALIZED;
    await wmeReady();
    initShortcuts();
    initSettings();
    wmeSDK.Events.on({
      eventName: "wme-selection-changed",
      eventHandler: handleSelectionChanges,
    });
    log("RHN is ready.");
  }

  // Initialize RHN once Waze has been loaded.
  async function initShortcuts() {
    // Register keyboard shortcuts
    W.accelerators.SpecialKeys[96] = "[NumPad] 0";
    W.accelerators.SpecialKeys[97] = "[NumPad] 1";
    W.accelerators.SpecialKeys[98] = "[NumPad] 2";
    W.accelerators.SpecialKeys[99] = "[NumPad] 3";
    W.accelerators.SpecialKeys[100] = "[NumPad] 4";
    W.accelerators.SpecialKeys[101] = "[NumPad] 5";
    W.accelerators.SpecialKeys[102] = "[NumPad] 6";
    W.accelerators.SpecialKeys[103] = "[NumPad] 7";
    W.accelerators.SpecialKeys[104] = "[NumPad] 8";
    W.accelerators.SpecialKeys[105] = "[NumPad] 9";
    W.accelerators.SpecialKeys[106] = "[NumPad] *";
    W.accelerators.SpecialKeys[107] = "[NumPad] +";
    W.accelerators.SpecialKeys[108] = "[NumPad] Enter";
    W.accelerators.SpecialKeys[109] = "[NumPad] -";
    W.accelerators.SpecialKeys[110] = "[NumPad] .";
    W.accelerators.SpecialKeys[111] = "[NumPad] /";

    for (let keyID = 112; keyID < 112 + 24; keyID++) { W.accelerators.SpecialKeys[keyID] = `F${keyID - 111}`; } // F1 - F24

    W.accelerators.SpecialKeys[45] = "Insert";
    W.accelerators.SpecialKeys[36] = "Home";
    W.accelerators.SpecialKeys[33] = "Page Up";
    W.accelerators.SpecialKeys[35] = "End";
    W.accelerators.SpecialKeys[34] = "Page Down";

    shortcuts.forEach(shortcut => {
      try {
        wmeSDK.Shortcuts.createShortcut(shortcut);
      } catch (error) {
        if (error.message === "Missing key in shortcut") {
          console.warn(`Shortcut already exists: ${shortcut.description}`);
          shortcut.shortcutKeys = null;
          wmeSDK.Shortcuts.createShortcut(shortcut);
          return;
        }
        console.error(`Failed to create shortcut: ${shortcut.description}`, error, error.message);
      }
    });
    log(`${wmeSDK.Shortcuts.getAllShortcuts().length} shortcuts registered.`);
  }

  async function initSettings() {
    if (!$.ui) {
      log("jQuery UI is not loaded.");
      setTimeout(initSettings, 1000);
      return;
    }
    const { tabLabel, tabPane } = await wmeSDK.Sidebar.registerScriptTab();
    tabLabel.innerText = "🏠 API HN";
    tabLabel.title = "API House Numbers";

    tabPane.innerHTML = /* html */ `
      <div class="rapidHN-settings">
        <h1>Settings</h1>
        <div class="api-key-section">
          <label for="apiKey">Geoapify API Key:</label>
          <input type="text" id="apiKey" value="${config.apiKey}" />
          <button id="saveApiKey">Save</button>
        </div>
        <div id="apiStatus"></div>
      </div>
    `;

    // Add event listener for save button
    document.getElementById("saveApiKey").addEventListener("click", () => {
      config.apiKey = document.getElementById("apiKey").value;
      saveConfig();

      // Show success message
      const status = document.getElementById("apiStatus");
      status.innerHTML = "API key saved!";
      status.style.color = "green";
      setTimeout(() => {
        status.innerHTML = "";
      }, 3000);
    });
  }

  function createRHNcontrols(addHouseNumberNode) {
    // check if the controls are already there
    if ($(addHouseNumberNode).next().hasClass("rapidHN-control")) {
      console.warn("RHN controls already exist");
      return;
    }

    $(addHouseNumberNode).append(/* html */ `
            <div class="rapidHN-control">
                <div class="toolbar-button rapidHN-input">
                    <span class="menu-title rapidHN-text">Auto-fetch House Numbers</span>
                </div>
            </div>
    `);

    // Find OpenLayers container
    const container = document.querySelector("[id$='_OpenLayers_Container']");
    if (!container) {
      console.warn("OpenLayers container not found");
      return;
    }

    // Listen for changes in the OpenLayers container
    houseNumbersObserver = new MutationObserver(mutations => {
      mutations.forEach(() => {
        const input = $(".house-numbers-layer .house-number .content.active:not(\".new\") input.number");
        if (input.length && input.val() === "") {
          injectHouseNumber(input);
          $("div#WazeMap").focus();
        }
      });
    });

    houseNumbersObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  async function handleSelectionChanges() {
    const selection = wmeSDK.Editing.getSelection();
    if (!selection || selection?.objectType !== "segment") return;
    await new Promise(resolve => { setTimeout(resolve, 100); });
    createRHNcontrols(document.querySelectorAll("div#segment-edit-general > div")[1]);
  }

  function setNativeValue(element, value) {
    const lastValue = element.value;
    element.value = value;
    const event = new Event("input", { target: element, bubbles: true });
    // React 15
    event.simulated = true;
    // React 16
    const tracker = element._valueTracker;
    if (tracker) {
      tracker.setValue(lastValue);
    }
    element.dispatchEvent(event);
    // press enter to save the house number
    const keyEvent = new KeyboardEvent("keydown", {
      bubbles: true, cancelable: true, keyCode: 13,
    });
    element.dispatchEvent(keyEvent);
  }

  async function fetchHouseNumber(lat, lon) {
    // Skip if API key hasn't been set
    if (!config.apiKey || config.apiKey === "YOUR_API_KEY") {
      console.warn("No API key configured");
      return "";
    }

    // Check if we're already fetching or if we've already fetched this position
    if (isFetching) {
      console.log("Already fetching, skipping request");
      return "";
    }

    if (lastFetchedPosition && lastFetchedPosition.lat === lat && lastFetchedPosition.lon === lon) {
      console.log("Position already fetched, skipping request");
      return "";
    }

    isFetching = true;
    console.log("fetchHouseNumber", lat, lon);

    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${config.apiKey}`,
        onload: response => {
          try {
            if (response.status === 401 || response.status === 403) {
              throw new Error("Unauthorized! Please check your API key.");
            }
            const data = JSON.parse(response.responseText);
            if (data.results && data.results.length > 0) {
              // Store last fetched position on successful fetch
              lastFetchedPosition = { lat, lon };
              resolve(data.results[0].housenumber || "");
            } else {
              resolve("");
            }
          } catch (error) {
            console.error("Error parsing API response:", error);
            resolve("");
          } finally {
            isFetching = false;
          }
        },
        onerror: error => {
          console.error("Error fetching house number:", error);
          isFetching = false;
          resolve("");
        },
      });
    });
  }

  function getMousePosition() {
    const positionElement = document.querySelector(".wz-map-ol-control-span-mouse-position");
    if (!positionElement) return null;

    const [lat, lon] = positionElement.textContent.split(" ").map(Number);
    return { lat, lon };
  }

  function injectHouseNumber(newHouseNumber) {
    const position = getMousePosition();
    if (!position) {
      console.warn("Could not get mouse position");
      return;
    }

    fetchHouseNumber(position.lat, position.lon).then(apiHouseNumber => {
      if (apiHouseNumber) {
        setNativeValue(newHouseNumber[0], apiHouseNumber);
      }
    });
  }

  function handleCustomShortcut() {
    if ($(".toolbar wz-button.add-house-number").length === 0) return;
    $(".toolbar wz-button.add-house-number").click();
  }

  rapidHNBootstrap();
})();

GM_addStyle(`

.rapidHN-control {
    display: flex;
    flex-direction: column;
}

.rapidHN-input {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0 5px;
    height: 100%
}

.rapidHN.next,
.rapidHN.increment {
    margin: 3px;
    height:20px;
    width: 64px;
    height: 30px;
}

.rapidHN-text-input input {
  background-color: var(--background_variant, #f2f4f7);
  border-color: var(--background_variant, #f2f4f7);
  border-radius: 6px;
  border-width: 0px 0px 1px;
  box-sizing: border-box;
  color: var(--content_default, #202124);
  flex: 1 1 auto;
  font-size: 14px;
  line-height: 16px;
  margin: 0px;
  min-width: 100px;
  outline: none;
  font-family: inherit;
  padding: 0px 16px;
}

.rapidHN-text {
    text-align: right;
    font-weight: 500;
}

.rapidHN-switch-mode {
    cursor: pointer;
}

.rapidHN-switch-mode .tooltiptext {
    visibility: hidden;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    position: absolute;
    top: 100%;
    padding: 5px 10px;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s;
}

.rapidHN-switch-mode:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
}

#current-input-type {
    background-color: var(--wz-button-background-color, var(--primary, #0099ff));
    color: var(--on_primary, #ffffff);
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    height: 24px;
    padding: 0px 20px;
    align-items: center;
    border: var(--wz-button-border, 1px solid transparent);
    box-shadow: var(--wz-button-box-shadow, none);
    cursor: pointer;
    display: inline-flex;
    font-family: "Waze Boing", "Waze Boing HB", "Rubik", sans-serif;
    justify-content: center;
    letter-spacing: 0.3px;
    outline: none;
    position: relative;
    text-align: center;
    text-decoration: unset;
    user-select: none;
    white-space: nowrap;
}

.api-key-section {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.api-key-section input {
  padding: 5px;
  margin: 5px 0;
}

.api-key-section button {
  padding: 5px 10px;
  cursor: pointer;
}

#apiStatus {
  height: 20px;
  margin-top: 5px;
}
`);
