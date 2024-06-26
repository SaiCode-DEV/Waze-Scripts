// ==UserScript==
// @name         Waze GeoPortal DACH
// @namespace    https://greasyfork.org/de/users/863740-horst-wittlich
// @version      2024.06.13
// @description  Geoportal Overlay für Deutschland, Österreich und Schweiz
// @author       vertexcode, hiwi234, SaiCode
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waze.com
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
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
  const sources = {
    de: {
      name: "GeoOverlays DE",
      layers: [
        {
          name: "Basemap DE",
          unique: "__DrawBasemapDE",
          id: "layer-switcher-basemap-de",
          type: "WMTS",
          source:
            "https://sgx.geodatenzentrum.de/wmts_basemapde/1.0.0/WMTSCapabilities.xml",
          layerName: "de_basemapde_web_raster_farbe",
          matrixSet: "GLOBAL_WEBMERCATOR",
        },
        {
          name: "GeoDatenZentrum DE",
          unique: "__DrawGeoPortalDE",
          id: "layer-switcher-geoportal-de",
          type: "WMTS",
          source:
            "https://sgx.geodatenzentrum.de/wmts_topplus_open/1.0.0/WMTSCapabilities.xml",
          layerName: "web",
          matrixSet: "WEBMERCATOR",
        },
        {
          name: "GeoPortal BW",
          unique: "__DrawGeoPortalBW",
          id: "layer-switcher-geoportal-bw",
          type: "WMTS",
          source:
            "https://owsproxy.lgl-bw.de/owsproxy/ows/WMTS_LGL-BW_Basiskarte?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities&user=ZentrKomp&password=viewerprod",
          layerName: "Basiskarte",
          matrixSet: "GoogleMapsCompatible",
        },
        {
          name: "GeoPortal NRW",
          unique: "__DrawGeoPortalNRW",
          id: "layer-switcher-geoportal-nrw",
          type: "WMTS",
          source:
            "https://www.wmts.nrw.de/geobasis/wmts_nw_dtk/1.0.0/WMTSCapabilities.xml",
          layerName: "nw_dtk_col",
          matrixSet: "EPSG_3857_16",
        },
        {
          name: "GeoPortal NRW Overlay",
          unique: "__DrawGeoPortalNRWOverlay",
          id: "layer-switcher-geoportal-nrw-overlay",
          type: "WMTS",
          source:
            "https://www.wmts.nrw.de/geobasis/wmts_nw_dop_overlay/1.0.0/WMTSCapabilities.xml",
          layerName: "nw_dop_overlay",
          matrixSet: "EPSG_3857_16",
          opacity: 1,
        },
        {
          name: "GeoPortal BY",
          unique: "__DrawGeoPortalBY",
          id: "layer-switcher-geoportal-by",
          type: "WMTS",
          source:
            "https://geoservices.bayern.de/od/wmts/geobasis/v1/1.0.0/WMTSCapabilities.xml",
          layerName: "by_webkarte",
          matrixSet: "smerc",
        },
      ],
    },
    ch: {
      name: "GeoOverlays CH",
      layers: [
        {
          name: "SwissTopo",
          unique: "__DrawSwissTopo",
          id: "layer-switcher-swisstopo",
          type: "WMS",
          source:
            "https://wms.geo.admin.ch/?REQUEST=GetCapabilities&SERVICE=WMS&VERSION=1.3.0&lang=de",
          layerName: "ch.swisstopo.swisseo_s2-sr_v100",
          matrixSet: "21781",
        },
        {
          name: "SwissImage",
          unique: "__DrawSwissImage",
          id: "layer-switcher-swissimage",
          type: "WMS",
          source:
            "https://wms.geo.admin.ch/?REQUEST=GetCapabilities&SERVICE=WMS&VERSION=1.3.0&lang=de",
          layerName: "ch.swisstopo.pixelkarte-farbe-pk1000.noscale",
          matrixSet: "21781",
        },
      ],
    },
  };

  /**
   * Define WMTS/WMS Layers. Hide this function for better readability
   */
  function geoportal_init() {
    const layerControl = $(".layer-switcher").find(".list-unstyled.togglers");
    if (layerControl.length) {
      $.each(sources, function (index, source) {
        console.log(source);
        const controlEntry = `
        <li class="group">
          <div class="layer-switcher-toggler-tree-category">
            <wz-button color="clear-icon" size="xs">
              <i class="toggle-category w-icon w-icon-caret-down"></i>
            </wz-button>
            <label class="label-text" for="layer-switcher-group_overlay">
              ${source.name}
            </label>
          </div>
          <ul class="collapsible-GROUP_OVERLAY ${index}"></ul>
        </li>
        `;
        // append the control entry as the second last entry
        layerControl.children().eq(-1).before(controlEntry);
        country_init(index, source.layers);
      });
    }
  }

  /**
   * Initialize the country layers
   * @param {string} country
   * @param {Array} layers
   */
  function country_init(country, layers) {
    let overlayGroup = $(`ul.collapsible-GROUP_OVERLAY.${country}`);
    console.group(`Loading Geoportal Layers for ${country.toUpperCase()}`);

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
              `Failed to load Geoportal Layer ${index + 1}/${layers.length}: ${
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
            source.layer = format.createLayer(capabilities, {
              layer: source.layerName,
              matrixSet: source.matrixSet,
              format: "image/png",
              opacity: source.opacity ?? opacity,
              isBaseLayer: false,
              requestEncoding: source.requestEncoding ?? "REST",
              visibility: false,
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
              source.layer = new OpenLayers.Layer.Tile({
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
                `Layer ${source.layerName} not found in WMS capabilities for ${source.name}`
              );
              return;
            }
          }

          uWaze.map.addLayer(source.layer);
          uWaze.map.setLayerIndex(source.layer, 3);

          // Check if layer was active previously
          if (localStorage[source.unique]) {
            source.layer.setVisibility(localStorage[source.unique] == "true");
          }

          // Make checkbox and add to the section
          let toggleEntry = $("<li></li>");
          let checkbox = $("<wz-checkbox></wz-checkbox>", {
            id: source.id,
            class: "hydrated",
            checked: source.layer.getVisibility(),
            text: source.name,
          });

          toggleEntry.append(checkbox);
          overlayGroup.append(toggleEntry);

          checkbox.on("click", function (e) {
            source.layer.setVisibility(e.target.checked);
            localStorage[source.unique] = source.layer.getVisibility();
          });

          console.info(
            `Geoportal Layer ${index + 1}/${layers.length}: ${
              source.name
            } loaded`
          );
        },
        onerror: (response) => {
          console.error(
            `Failed to load Geoportal Layer ${index + 1}/${layers.length}: ${
              source.name
            }`
          );
        },
        ontimeout: (response) => {
          console.error(
            `Request to Geoportal Layer ${index + 1}/${layers.length}: ${
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
      sources.de.forEach((source) => {
        try {
          source.layer.setOpacity(opacity);
        } catch (e) {
          console.error(`Failed to set opacity for ${source.name}`);
        }
      });
    });

    $(".opacity-minus").on("click", function () {
      if (shiftPressed) {
        opacity = 0;
      } else {
        opacity = Math.max(opacity - 0.1, 0);
      }
      localStorage.setItem("geoportal_opacity", opacity);
      sources.de.forEach((source) => {
        try {
          source.layer.setOpacity(opacity);
        } catch (e) {
          console.error(`Failed to set opacity for ${source.name}`);
        }
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
      geoportal_init();
      ui_init();
    }
  }

  /**
   * Patch OpenLayers to fix missing features
   * @returns {void}
   */
  async function patchOpenLayers() {
    console.group("WME Geometries: Patching missing features...");
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

`);
