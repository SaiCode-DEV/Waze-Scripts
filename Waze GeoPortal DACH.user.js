// ==UserScript==
// @name         Waze GeoPortal DACH
// @namespace    https://greasyfork.org/de/users/863740-horst-wittlich
// @version      2024.06.13
// @description  Geoportal Overlay für Deutschland, Österreich und Schweiz
// @author       vertexcode, hiwi234, SaiCode
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waze.com
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        GM_addStyle
// @license      MIT

// @downloadURL  https://update.greasyfork.org/scripts/460976/Waze%20GeoPortal%20DACH.user.js
// @updateURL    https://update.greasyfork.org/scripts/460976/Waze%20GeoPortal%20DACH.meta.js
// ==/UserScript==

/*global I18n, $, W, OpenLayers*/

/* globals OpenLayers: true */
// Versions Format
// yyyy.mm.dd

DEFAULT_SOURCES = {
  de: {
    name: "GeoOverlays DE",
    flag: "🇩🇪",
    enabled: true,
    layers: [
      {
        name: "Basemap DE",
        enabled: true,
        active: false,
        unique: "__DrawBasemapDE",
        type: "WMTS",
        source:
          "https://sgx.geodatenzentrum.de/wmts_basemapde/1.0.0/WMTSCapabilities.xml",
        layerName: "de_basemapde_web_raster_farbe",
        matrixSet: "GLOBAL_WEBMERCATOR",
      },
      {
        name: "GeoDatenZentrum DE",
        enabled: true,
        active: false,
        unique: "__DrawGeoPortalDE",
        type: "WMTS",
        source:
          "https://sgx.geodatenzentrum.de/wmts_topplus_open/1.0.0/WMTSCapabilities.xml",
        layerName: "web",
        matrixSet: "WEBMERCATOR",
      },
      {
        name: "GeoPortal BW",
        enabled: true,
        active: false,
        unique: "__DrawGeoPortalBW",
        type: "WMTS",
        source:
          "https://owsproxy.lgl-bw.de/owsproxy/ows/WMTS_LGL-BW_Basiskarte?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities&user=ZentrKomp&password=viewerprod",
        layerName: "Basiskarte",
        matrixSet: "GoogleMapsCompatible",
      },
      {
        name: "GeoPortal NRW",
        enabled: true,
        active: false,
        unique: "__DrawGeoPortalNRW",
        type: "WMTS",
        source:
          "https://www.wmts.nrw.de/geobasis/wmts_nw_dtk/1.0.0/WMTSCapabilities.xml",
        layerName: "nw_dtk_col",
        matrixSet: "EPSG_3857_16",
      },
      {
        name: "GeoPortal NRW Overlay",
        enabled: true,
        active: false,
        unique: "__DrawGeoPortalNRWOverlay",
        type: "WMTS",
        source:
          "https://www.wmts.nrw.de/geobasis/wmts_nw_dop_overlay/1.0.0/WMTSCapabilities.xml",
        layerName: "nw_dop_overlay",
        matrixSet: "EPSG_3857_16",
        opacity: 1,
      },
      {
        name: "GeoPortal BY",
        enabled: true,
        active: false,
        unique: "__DrawGeoPortalBY",
        type: "WMTS",
        source:
          "https://geoservices.bayern.de/od/wmts/geobasis/v1/1.0.0/WMTSCapabilities.xml",
        layerName: "by_webkarte",
        matrixSet: "smerc",
      },
    ],
  },
  at: {
    name: "GeoOverlays AT",
    flag: "🇦🇹",
    enabled: true,
    layers: [
      {
        name: "Basemap AT",
        enabled: true,
        active: false,
        unique: "__DrawBasemapAT",
        type: "WMTS",
        source:
          "https://mapsneu.wien.gv.at/basemapneu/1.0.0/WMTSCapabilities.xml",
        layerName: "geolandbasemap",
        matrixSet: "google3857",
      },
      {
        name: "Overlay AT",
        enabled: true,
        active: false,
        unique: "__DrawOverlayAT",
        type: "WMTS",
        source: "https://www.basemap.at/wmts/1.0.0/WMTSCapabilities.xml",
        layerName: "bmapoverlay",
        matrixSet: "google3857",
      },
    ],
  },
  ch: {
    name: "GeoOverlays CH",
    flag: "🇨🇭",
    enabled: true,
    layers: [
      {
        name: "Strassenkarte",
        enabled: true,
        active: false,
        unique: "__DrawSwissTopoStrassenkarte",
        type: "WMTS",
        source:
          "https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml",
        layerName: "ch.swisstopo.swisstne-base",
        matrixSet: "3857_18",
      },
      {
        name: "Basisnetz",
        enabled: true,
        active: false,
        unique: "__DrawSwissBasisnetz",
        type: "WMTS",
        source:
          "https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml",
        layerName: "ch.swisstopo.swisstlm3d-strassen",
        matrixSet: "3857_18",
      },
      {
        name: "Luftbild",
        enabled: true,
        active: false,
        unique: "__DrawSwissTopoLuftbild",
        type: "WMTS",
        source:
          "https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml",
        layerName: "ch.swisstopo.swissimage-product",
        matrixSet: "3857_20",
      },
    ],
  },
};

(() => {
  let uOpenLayers;
  let uWaze;

  let shiftPressed = false;

  let opacity = localStorage.getItem("geoportal_opacity") || 0.5;

  if (isNaN(opacity)) {
    opacity = 0.5;
  }

  //check if opacity is in a valid range
  if (opacity < 0 || opacity > 1) {
    opacity = 0.5;
  }

  // Define WMTS Layers


  const layersList = [];

  let sources = loadSettings();

  /**
   * Define WMTS/WMS Layers. Hide this function for better readability
   */
  function geoportal_init() {
    const layerControl = $(".layer-switcher").find(".list-unstyled.togglers");
    if (layerControl.length) {
      console.info(`Loading Geoportal Layers...`);
      $.each(sources, function (key, country) {
        const controlEntry = `
        <li class="group layer-toggle-${country.flag}" style="${
          country.enabled ? "" : "display: none;"
        }">
          <div class="layer-switcher-toggler-tree-category">
            <wz-button class="expand-country-${key}" color="clear-icon" size="xs">
              <i class="toggle-category w-icon w-icon-caret-down"></i>
            </wz-button>
            <label class="label-text" for="layer-switcher-group_overlay">
              ${country.name}
            </label>
          </div>
          <ul class="collapsible-GROUP_OVERLAY ${key}"></ul>
        </li>
        `;
        // append the control entry as the second last entry
        layerControl.children().eq(-1).before(controlEntry);
        //make the caret clickable
        $(`.expand-country-${key}`).on("click", function () {
          $(`.collapsible-GROUP_OVERLAY.${key}`).toggle();
          //rotate the caret transform: rotate(90deg);
          if ($(this).find("i").css("transform") === "none") {
            $(this).find("i").css("transform", "rotate(-90deg)");
          } else {
            $(this).find("i").css("transform", "");
          }
        });
        country_init(key, country.layers, country.flag);
      });
    }
  }

  /**
   * Initialize the country layers
   * @param {string} country
   * @param {Array} layers
   * @param {string} flag
   */
  function country_init(country, layers, flag) {
    let overlayGroup = $(`ul.collapsible-GROUP_OVERLAY.${country}`);
    $.each(layers, function (index, source) {
      // Make and add layer
      GM.xmlHttpRequest({
        method: "GET",
        url: source.source,
        onload: (response) => {
          var responseXML = response.responseXML;
          // Inject responseXML into existing Object (only appropriate for XML content).
          if (!response.responseXML) {
            responseXML = new DOMParser().parseFromString(
              response.responseText,
              "text/xml"
            );
          }
          //if responseXML is not a XML document, cancel the loading
          if (!responseXML || responseXML instanceof XMLDocument === false) {
            console.error(
              `Failed to load ${flag} Layer ${index + 1}/${layers.length}: ${
                source.name
              }`
            );
            return;
          }

          //chec if WMST or WMTS and load the correct format
          if (source.type === "WMTS") {
            var format = new OpenLayers.Format.WMTSCapabilities();
            var doc = responseXML;
            var capabilities = format.read(doc);
            layersList[source.unique] = format.createLayer(capabilities, {
              layer: source.layerName,
              matrixSet: source.matrixSet,
              opacity: source.opacity ?? opacity,
              isBaseLayer: false,
              requestEncoding: source.requestEncoding ?? "REST",
              visibility: source.active,
            });
          } else if (source.type === "WMS") {
            var format = new OpenLayers.Format.WMSCapabilities();
            var doc = responseXML;
            var capabilities = format.read(doc);

            // Find the specific layer by its name
            var wmsLayer = capabilities.capability.layers.find(
              (layer) => layer.name === source.layerName
            );

            if (wmsLayer) {
              console.log(wmsLayer);
              layersList[source.unique] = new OpenLayers.Layer.Tile({
                source: new OpenLayers.Source.TileWMS({
                  url: wmsLayer.url,
                  params: {
                    LAYERS: wmsLayer.name,
                    FORMAT: "image/png",
                  },
                }),
                name: source.name,
                opacity: source.opacity ?? opacity,
                isBaseLayer: false,
                visibility: false,
              });
              JSON.stringify(result, null, 2);
              console.log(wmsLayer.url);
            } else {
              console.error(
                `Layer ${source.layerName} not found in WMS capabilities for ${flag} ${source.name}`
              );
              return;
            }
          }

          uWaze.map.addLayer(layersList[source.unique]);
          uWaze.map.setLayerIndex(layersList[source.unique], 3);

          //check for errors
          if (!layersList[source.unique]) {
            console.error(
              `Failed to load ${flag} Layer ${index + 1}/${layers.length}: ${
                source.name
              }`
            );
            return;
          }
          if (!layersList[source.unique].url.length) {
            console.error(
              `Failed to load ${flag} Layer ${index + 1}/${layers.length}: ${
                source.name
              }. No URL found in capabilities.`
            );
            console.log(layersList[source.unique]);
            return;
          }

          console.debug(layersList[source.unique].url);

          // Make checkbox and add to the section
          let toggleEntry = $("<li></li>");
          let checkbox = $("<wz-checkbox></wz-checkbox>", {
            id: source.unique,
            class: "hydrated",
            checked: layersList[source.unique].getVisibility(),
            text: source.name,
          });

          toggleEntry.append(checkbox).toggle(source.enabled);
          overlayGroup.append(toggleEntry);

          checkbox.on("click", function (e) {
            layersList[source.unique].setVisibility(e.target.checked);
            sources[country].layers[index].active = e.target.checked;
            saveSettings();
          });

          console.log(
            `${flag} Layer ${index + 1}/${layers.length}: ${source.name} loaded`
          );
        },
        onerror: (response) => {
          console.error(
            `Failed to load ${flag} Layer ${index + 1}/${layers.length}: ${
              source.name
            }`
          );
        },
        ontimeout: (response) => {
          console.error(
            `Request to ${flag} Layer ${index + 1}/${layers.length}: ${
              source.name
            } timed out`
          );
        },
      });
    });
  }

  /**
   * Initialize the UI
   * @returns {void}
   */
  function ui_init() {
    //Add a Opacity control to the map controls
    const controlContainer = $(".overlay-buttons-container.bottom").first();
    //check if the opacity control already exists
    if (controlContainer.find(".opacity-control-container").length) {
      return;
    }

    const opacityControl = $(`
    <div class="opacity-control-container">
    <wz-basic-tooltip class="sc-wz-basic-tooltip-h sc-wz-basic-tooltip-s">
        <wz-tooltip class="sc-wz-basic-tooltip sc-wz-basic-tooltip-s">
            <wz-tooltip-source class="sc-wz-tooltip-source-h sc-wz-tooltip-source-s">
                <wz-button color="clear-icon" class="opacity-button opacity-plus">
                  <wz-tooltip-target class="sc-wz-tooltip-target-h sc-wz-tooltip-target-s">
                  </wz-tooltip-target><i class="w-icon w-icon-eye-fill"></i>
                </wz-button>
            </wz-tooltip-source>
            <wz-tooltip-content position="left">
                <span> Increase Opacity </span>
            </wz-tooltip-content>
        </wz-tooltip>
    </wz-basic-tooltip>
    <wz-basic-tooltip class="sc-wz-basic-tooltip-h sc-wz-basic-tooltip-s">
        <wz-tooltip class="sc-wz-basic-tooltip sc-wz-basic-tooltip-s">
            <wz-tooltip-source class="sc-wz-tooltip-source-h sc-wz-tooltip-source-s">
                <wz-button color="clear-icon" disabled="false" class="opacity-button opacity-minus">
                  <wz-tooltip-target class="sc-wz-tooltip-target-h sc-wz-tooltip-target-s">
                  </wz-tooltip-target><i class="w-icon w-icon-eye2"></i>
                </wz-button>
            </wz-tooltip-source>
            <wz-tooltip-content position="left">
                <span> Decrease Opacity </span>
            </wz-tooltip-content>
        </wz-tooltip>
    </wz-basic-tooltip>
    </div>
    `);
    controlContainer.append(opacityControl);

    //check if control is pressed an update the value
    $(document).on("keydown", function (e) {
      if (e.key == "Shift") {
        shiftPressed = true;
      }
    });

    $(document).on("keyup", function (e) {
      if (e.key == "Shift") {
        shiftPressed = false;
      }
    });

    // Add event listeners to the opacity control
    $(".opacity-plus").on("click", function () {
      if (shiftPressed) {
        opacity = 1;
      } else {
        opacity = Math.min(opacity + 0.1, 1);
      }
      localStorage.setItem("geoportal_opacity", opacity);

      $.each(sources, function (index, source) {
        source.layers.forEach((source) => {
          try {
            layersList[source.unique].setOpacity(opacity);
          } catch (e) {
            console.error(`Failed to set opacity for ${source.name}`);
            return;
          }
        });
      });
    });

    $(".opacity-minus").on("click", function () {
      if (shiftPressed) {
        opacity = 0;
      } else {
        opacity = Math.max(opacity - 0.1, 0);
      }
      localStorage.setItem("geoportal_opacity", opacity);
      $.each(sources, function (index, source) {
        source.layers.forEach((source) => {
          try {
            layersList[source.unique].setOpacity(opacity);
          } catch (e) {
            console.error(`Failed to set opacity for ${source.name}`);
            return;
          }
        });
      });
    });

    //check every 10 seconds if the opacity control is still there
    setInterval(() => {
      if (
        !$(".overlay-buttons-container.bottom")
          .first()
          .find(".opacity-control-container").length
      ) {
        console.log("Opacity control not found, re-adding...");
        $(".overlay-buttons-container.bottom").first().append(opacityControl);
      }
    }, 10000);

    //add a mutation observer to check if the opacity control is removed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (!mutation.addedNodes.length) {
          return;
        }
        mutation.addedNodes.forEach((node) => {
          if (node.id === "overlay-buttons") {
            $(".overlay-buttons-container.bottom")
              .first()
              .append(opacityControl);
          }
        });
      });
    });

    observer.observe($("#overlay-buttons-region").get(0), {
      childList: true,
    });
  }

  /**
   * Initialize the settings
   */
  async function settings_init() {
    const { tabLabel, tabPane } =
      W.userscripts.registerSidebarTab("geoportal-dach");

    tabLabel.innerText = "🌍 Geoportal";
    tabLabel.title = "Geoportal DACH";

    tabPane.innerHTML = `
  <div class="geoportal-settings">
    <h1>Settings</h1>
    <div class="geoportal-countrys">
      <div v-for="country in countries" :key="country">
        <input type="checkbox" :id="country" v-model="layers[country].enabled" @change="updateCountry" />
        <label :for="country" class="countyname">{{ layers[country].flag }} {{ layers[country].name }}</label>
        <ul class="geoportal-layers" v-if="layers[country].enabled">
          <li v-for="layer in layers[country].layers" :key="layer.unique">
            <input type="checkbox" :id="layer.unique" v-model="layer.enabled" @change="updateLayer" />
            <label :for="layer.unique">{{ layer.name }}</label>
          </li>
        </ul>
    </div>
  </div>
  `;

    await W.userscripts.waitForElementConnected(tabPane);

    //check if Vue.js is already loaded
    while (typeof Vue === "undefined") {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    //initialize Vue.js
    const { createApp, ref } = Vue;
    createApp({
      setup() {
        const countries = ref(Object.keys(sources));
        const layers = ref(sources);

        return { countries, layers };
      },
      methods: {
        updateCountry(event) {
          //hide the layers if the country is disabled
          if (!event.target.checked) {
            sources[event.target.id].layers.forEach((layer) => {
              layersList[layer.unique].setVisibility(false);
            });
          } else {
            sources[event.target.id].layers.forEach((layer) => {
              layersList[layer.unique].setVisibility(layer.active);
            });
          }
          $(`.layer-toggle-${this.layers[event.target.id].flag}`).toggle(
            event.target.checked
          );
          saveSettings();
        },
        updateLayer(event) {
          layersList[event.target.id].setVisibility(event.target.checked);
          $(`li wz-checkbox#${event.target.id}`).toggle(
            event.target.checked
          ).prop("checked", event.target.checked);
          saveSettings();
        },
      },
    }).mount(tabPane);
  }

  /**
   * Load the settings from localStorage
   * @returns {Object} sources
   */
  function loadSettings() {
    try {
      const savedSources = JSON.parse(
        localStorage.getItem("geoportal_sources")
      );

      if (!savedSources || typeof savedSources !== "object") {
        return DEFAULT_SOURCES;
      }

      // Check if each key in savedSources matches the keys in DEFAULT_SOURCES
      for (const key in savedSources) {
        const savedSource = savedSources[key];

        // Check if the structure of savedSource matches the structure of defaultSource
        if (
          typeof savedSource.name !== "string" ||
          typeof savedSource.flag !== "string" ||
          !Array.isArray(savedSource.layers)
        ) {
          throw new Error("Invalid country format");
        }
        savedSource.enabled = savedSource.enabled ?? true;

        for (const layer of savedSource.layers) {
          if (
            typeof layer.name !== "string" ||
            typeof layer.unique !== "string" ||
            typeof layer.type !== "string" ||
            typeof layer.source !== "string" ||
            typeof layer.layerName !== "string" ||
            typeof layer.matrixSet !== "string"
          ) {
            throw new Error("Invalid layer format");
          }
          layer.enabled = layer.enabled ?? true;
          layer.active = layer.active ?? false;
        }
      }
      // If all checks passed, use savedSources
      return savedSources;
    } catch (error) {
      // If any check fails, log the error and use DEFAULT_SOURCES
      console.error(error.message);
      return DEFAULT_SOURCES;
    }
  }

  /**
   * Save the settings to localStorage
   */
  async function saveSettings() {
    localStorage.setItem("geoportal_sources", JSON.stringify(sources));
  }

  /**
   * Bootstrap the Geoportal Overlays
   */
  function geoportal_bootstrap() {
    uWaze = unsafeWindow.W;
    uOpenLayers = unsafeWindow.OpenLayers;
    if (
      !uOpenLayers ||
      !uWaze ||
      !uWaze.map ||
      !document.querySelector(".list-unstyled.togglers .group")
    ) {
      setTimeout(geoportal_bootstrap, 500);
    } else {
      console.log("Loading Geoportal Maps...");
      settings_init();
      geoportal_init();
      ui_init();
    }
  }

  /**
   * Patch OpenLayers to fix missing features
   * @returns {void}
   */
  async function patchOpenLayers() {
    console.groupCollapsed("WME Geometries: Patching missing features...");
    if (!OpenLayers.VERSION_NUMBER.match(/^Release [0-9.]*$/)) {
      console.error(
        "WME Geometries: OpenLayers version mismatch (" +
          OpenLayers.VERSION_NUMBER +
          ") - cannot apply patch"
      );
      return;
    }
    loadOLScript("lib/OpenLayers/Format/XML");
    loadOLScript("lib/OpenLayers/Format/XML/VersionedOGC");
    loadOLScript("lib/OpenLayers/Layer/WMTS");
    loadOLScript("lib/OpenLayers/Layer/Tile");
    loadOLScript("lib/OpenLayers/Format/OWSCommon");
    loadOLScript("lib/OpenLayers/Format/OWSCommon/v1");
    loadOLScript("lib/OpenLayers/Format/OWSCommon/v1_1_0");
    loadOLScript("lib/OpenLayers/Format/WMSCapabilities");
    loadOLScript("lib/OpenLayers/Format/WMSCapabilities/v1");
    loadOLScript("lib/OpenLayers/Format/WMSCapabilities/v1_3");
    loadOLScript("lib/OpenLayers/Format/WMSCapabilities/v1_3_0");
    loadOLScript("lib/OpenLayers/Format/WMTSCapabilities");
    loadOLScript("lib/OpenLayers/Format/WMTSCapabilities/v1_0_0");

    console.groupEnd();
  }

  /**
   * Load OpenLayers script from CDN
   * @param {string} filename
   */
  function loadOLScript(filename) {
    var version = OpenLayers.VERSION_NUMBER.replace(/Release /, "");
    console.info("Loading openlayers/" + version + "/" + filename + ".js");

    var openlayers = document.createElement("script");
    openlayers.src =
      "https://cdnjs.cloudflare.com/ajax/libs/openlayers/" +
      version +
      "/" +
      filename +
      ".js";
    openlayers.type = "text/javascript";
    openlayers.async = false;
    document.head.appendChild(openlayers);
  }

  function loadVueJS() {
    //check if Vue.js is already loaded
    if (typeof Vue !== "undefined") {
      return;
    }
    console.log("Loading Vue.js");
    var vuejs = document.createElement("script");
    vuejs.src = "https://unpkg.com/vue@3/dist/vue.global.js";
    document.head.appendChild(vuejs);
  }

  loadVueJS();
  patchOpenLayers();
  geoportal_bootstrap();
})();

GM_addStyle(`

  .opacity-control-container {
    align-items: center;
    background: var(--background_default);
    border-radius: 100px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .overlay-buttons-container.bottom {
    bottom: 42px;
  }

  .geoportal-settings {
    padding: 10px;
    user-select: none;
  }

  .geoportal-settings label {
    margin-left: 6px;
  }

`);
