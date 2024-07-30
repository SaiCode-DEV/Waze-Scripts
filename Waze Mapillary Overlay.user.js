// ==UserScript==
// @name         Waze Mapillary Overlay
// @namespace    https://github.com/SaiCode-DEV
// @version      2024.06.13
// @description  Adds Mapillary Signs as an overlay to the Waze Map Editor
// @author       SaiCode
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waze.com
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

/* global I18n, $, W, OpenLayers */

/* globals OpenLayers: true */
// Versions Format
// yyyy.mm.dd

DEFAULT_SETTINGS = {
  visible: true,
  client_token: "",
}
;(() => {
  const settings = loadSettings()

  /**
   * Initialize the settings
   */
  async function settings_init() {
    const { tabLabel, tabPane } =
      W.userscripts.registerSidebarTab("mapillary-overlay")

    tabLabel.innerText = "Mapillary"
    tabLabel.title = "Mapillary Overlay"

    tabPane.innerHTML = `
  <div class="mapillary-settings">
    <h3>Mapillary Settings</h3>
    <div class="settings">
      <label for="api-key">Client Token</label>
      <input 
        type="text" 
        placeholder="MLY|1234|abcd"
        :id="api-key" 
        v-model="userSettings.client_token" 
        @input="updateKey" 
      />
      <div v-if="!userSettings.client_token.match(/^MLY\|[0-9]{16}\|[a-f0-9]{32}$/i)">
        <p class="error">Invalid Mapillary key format</p>
      </div>
      </br>
      <p>Get your Mapillary key from <a href="https://www.mapillary.com/app/settings/developers" target="_blank">Mapillary Developers</a></p>
    </div>
  </div>
  `

    await W.userscripts.waitForElementConnected(tabPane)

    // check if Vue.js is already loaded
    while (typeof Vue === "undefined") {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    // initialize Vue.js
    const { createApp, ref } = Vue
    try {
      console.log("Vue.js loaded")
      createApp({
        setup() {
          const userSettings = ref(settings)
          return { userSettings }
        },
        methods: {
          updateKey(event) {
            // check if its a valid Mapillary key format (regex)
            if (!event.target.value.match(/^MLY\|[0-9]{16}\|[a-f0-9]{32}$/i)) {
              return
            }
            console.log(event)
            saveSettings()
          },
        },
      }).mount(tabPane)
    } catch (error) {
      console.error("Failed to load Vue.js")
      console.error(error)
      tabPane.innerHTML = `
      <h3>Failed to load Vue.js</h3>
      <p>Change in your Tampermonkey settings the Content-Security-Policy-Header (CSP) mode to Removed entirely (possibly unsecure).</p>
      <p>Then reload the page and try again.</p>
      </br>
      <p>If still not working, please report the issue to "saicode" on Discord.</p>
      <div class="vue-fail-logo">
        <svg width="50%" viewBox="0 0 190 190" version="1.1" id="svg1" xml:space="preserve" sodipodi:docname="Waze.svg"
          xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
          xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:svg="http://www.w3.org/2000/svg">
          <g inkscape:label="Ebene 1" inkscape:groupmode="layer" id="layer1" transform="translate(-9.5814339,-49.192611)">
            <path style="display:inline;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:2;stroke-dasharray:none;stroke-opacity:1" d="m 94.768176,205.81266 c -4.956323,-18.04127 -29.228187,-22.22111 -40.21299,-6.92505 l -0.68762,0.9575 -1.949667,-1.05347 C 41.636618,193.23636 30.30555,182.07154 25.476341,172.73805 l -1.158192,-2.23845 1.804078,-0.58016 c 5.902939,-1.89828 11.125993,-6.80606 13.409033,-12.59964 1.570221,-3.98469 1.809711,-6.37058 1.819133,-18.12287 0.01032,-12.86688 0.890802,-19.18044 3.858302,-27.66606 11.559981,-33.055968 45.198423,-53.224966 79.748015,-47.815458 42.99363,6.731611 70.26579,49.395208 58.40429,91.365598 -7.04688,24.93451 -27.15942,44.17697 -52.7075,50.42734 -7.00869,1.71469 -9.00866,1.88763 -22.96181,1.98557 l -12.437654,0.0873 z" id="path12" />
            <g id="g13" inkscape:label="eyes" style="display:inline" transform="translate(0,-6.8791669)">
              <path style="display:inline;fill:#000000;stroke:none;stroke-width:2;stroke-dasharray:none;stroke-opacity:1" d="m 152.68457,125.57489 c 4.46719,-1.2251 7.26569,-6.44227 5.93273,-11.06024 -2.27064,-7.86647 -13.11583,-8.77094 -16.7462,-1.3966 -1.04701,2.12677 -1.04073,5.61099 0.014,7.75339 1.99992,4.06241 6.30312,5.93656 10.7995,4.70345 z" id="path3" transform="translate(0,6.879167)" />
              <path style="display:inline;fill:#000000;stroke:none;stroke-width:2;stroke-dasharray:none;stroke-opacity:1" d="m 97.884558,125.67519 c 5.173612,-1.16595 8.168202,-7.30577 5.978092,-12.25689 -3.78459,-8.55568 -16.689521,-6.27155 -17.178278,3.0405 -0.327398,6.23775 4.992512,10.61538 11.200186,9.21639 z" id="path2" transform="translate(0,6.879167)" />
            </g>
            <path style="display:inline;fill:#000101" d="m 69.10295,234.4622 c -11.362102,-2.19663 -18.732536,-11.1904 -18.698883,-22.81731 0.0058,-2.01713 -0.05011,-3.66751 -0.12432,-3.66751 -0.297704,0 -7.05075,-3.96175 -9.241109,-5.42141 -11.59278,-7.7254 -22.536346,-20.69856 -26.095182,-30.9348 -0.643908,-1.85206 -1.021769,-5.25276 -0.71809,-6.46271 0.358542,-1.42855 2.037355,-2.54248 4.202581,-2.7885 5.98847,-0.68044 10.245281,-3.28242 12.343397,-7.54493 1.271849,-2.58388 1.270639,-2.5716 1.446375,-14.67005 0.225617,-15.53254 1.089571,-21.58977 4.472356,-31.35596 13.844019,-39.968017 55.883701,-62.938542 96.514735,-52.73575 34.22101,8.59318 58.76079,37.311575 61.68235,72.18558 0.31907,3.80863 0.12411,13.73327 -0.33621,17.11506 -3.209,23.57555 -15.1674,42.98234 -35.10725,56.97408 l -2.14447,1.50477 0.39951,1.16372 c 5.1583,15.02573 -6.49789,30.37002 -22.5632,29.70236 -9.85512,-0.40957 -18.61774,-7.35667 -20.77805,-16.47306 l -0.36527,-1.54142 h -9.49472 -9.494713 l -0.265644,1.22251 c -1.322391,6.08571 -6.725134,12.44939 -12.670969,14.92465 -3.964539,1.65044 -9.335812,2.32197 -12.963224,1.62068 z m 50.49486,-27.1272 c 32.99983,-2.88185 60.11685,-27.53673 65.47061,-59.52608 0.85602,-5.1148 0.96144,-6.47263 0.96564,-12.43765 0.005,-6.7313 -0.38987,-10.83573 -1.5126,-15.7331 C 177.08484,87.199729 149.7261,64.301467 116.67083,62.849696 82.744086,61.35965 51.759275,84.456735 43.483687,117.40577 c -1.835805,7.30921 -2.121272,10.24188 -2.328243,23.91856 l -0.170525,11.2683 -0.561741,2.01979 c -2.066012,7.42853 -7.65947,13.30332 -14.692417,15.4314 -0.701611,0.2123 -1.307911,0.40726 -1.347334,0.43324 -0.03942,0.026 0.31716,0.81838 0.792405,1.76089 5.020878,9.95739 15.818598,20.55978 27.467238,26.97034 l 1.186571,0.65301 0.933126,-1.20405 c 10.608357,-13.6883 30.94861,-11.8197 38.58304,3.5445 0.524246,1.05504 1.168062,2.68977 1.430702,3.63272 l 0.477527,1.71447 10.949384,-2.1e-4 c 6.02216,-1.1e-4 12.04964,-0.0963 13.39439,-0.21373 z" id="path10" inkscape:label="Outline" sodipodi:nodetypes="ssscsssssssssscssscccssscsccssscssssscssscsc" />
            <path style="display:inline;fill:#000000;stroke:none;stroke-width:2;stroke-dasharray:none;stroke-opacity:1" d="m 116.61105,144.44191 c -11.43486,2.02087 -22.265064,10.37005 -26.452914,20.39298 -1.47598,3.53253 2.00104,7.25575 5.6386,6.03785 1.30627,-0.43735 1.97092,-1.14069 3.12762,-3.30963 6.242714,-11.70577 19.329184,-17.18853 32.028224,-13.41867 6.51797,1.93495 12.56351,6.81658 15.68037,12.66156 2.33428,4.37741 5.34264,5.54661 8.02836,3.12022 2.26407,-2.04546 2.01841,-4.38354 -0.94738,-9.01676 -6.17063,-9.63989 -15.6388,-15.48986 -27.32285,-16.88157 -1.60742,-0.19146 -7.84911,0.0728 -9.78003,0.41402 z" id="path1" inkscape:label="mouth" />
          </g>
        </svg>
      </div>
      `
    }
  }

  /**
   * Load the settings from localStorage
   * @returns {Object} sources
   */
  function loadSettings() {
    try {
      const savedSettings = JSON.parse(
        localStorage.getItem("mapillary_overlay"),
      )

      if (!savedSettings || typeof savedSettings !== "object") {
        return DEFAULT_SETTINGS
      }

      // Check if each key in savedSources matches the keys in DEFAULT_SETTINGS

      // If all checks passed, use savedSettings
      return savedSettings
    } catch (error) {
      // If any check fails, log the error and use DEFAULT_SETTINGS
      console.error(error.message)
      return DEFAULT_SETTINGS
    }
  }

  /**
   * Save the settings to localStorage
   */
  async function saveSettings() {
    localStorage.setItem("mapillary_overlay", JSON.stringify(settings))
  }

  /**
   * Bootstrap the Mapillary overlay
   */
  function mapillary_bootstrap() {
    uWaze = unsafeWindow.W
    uOpenLayers = unsafeWindow.OpenLayers
    if (
      !uOpenLayers ||
      !uWaze ||
      !uWaze.map ||
      !document.querySelector(".list-unstyled.togglers .group")
    ) {
      setTimeout(mapillary_bootstrap, 500)
    } else {
      console.log("Loading mapillary Maps...")
      settings_init()
    }
  }

  async function addMap() {
    // create new Vector Tile Layer
    // https://tiles.mapillary.com/maps/vtp/mly_map_feature_traffic_sign/2/${z}/${x}/${y}?access_token=${settings.client_token}

    const mapillaryLayer = new uOpenLayers.Layer.Vector("Mapillary Signs", {
      rendererOptions: { zIndexing: true },
      protocol: new uOpenLayers.Protocol.HTTP({
        url: `https://tiles.mapillary.com/maps/vtp/mly_map_feature_traffic_sign/2/\${z}/\${x}/\${y}?access_token=${settings.client_token}`,
      }),
    })
    W.map.addLayer(mapillaryLayer)
  }

  /**
   * Patch OpenLayers to fix missing features
   * @returns {void}
   */
  async function patchOpenLayers() {
    console.groupCollapsed("Patching missing features...")
    if (!OpenLayers.VERSION_NUMBER.match(/^Release [0-9.]*$/)) {
      console.error(
        `OpenLayers version mismatch (${
          OpenLayers.VERSION_NUMBER
        }) - cannot apply patch`,
      )
      return
    }
    loadOLScript("lib/OpenLayers/Protocol")
    loadOLScript("lib/OpenLayers/Protocol/HTTP")

    console.groupEnd()
  }

  /**
   * Load OpenLayers script from CDN
   * @param {string} filename
   */
  function loadOLScript(filename) {
    const version = OpenLayers.VERSION_NUMBER.replace(/Release /, "")
    console.info(`Loading openlayers/${version}/${filename}.js`)

    const openlayers = document.createElement("script")
    openlayers.src = `https://cdnjs.cloudflare.com/ajax/libs/openlayers/${
      version
    }/${filename}.js`
    openlayers.type = "text/javascript"
    openlayers.async = false
    document.head.appendChild(openlayers)
  }

  function loadVueJS() {
    // check if Vue.js is already loaded
    if (typeof Vue !== "undefined") {
      return
    }
    console.log("Loading Vue.js")
    const vuejs = document.createElement("script")
    vuejs.src = "https://unpkg.com/vue@3/dist/vue.global.js"
    document.head.appendChild(vuejs)
  }

  loadVueJS()
  patchOpenLayers()
  mapillary_bootstrap()
  setTimeout(addMap, 5000)
})()

GM_addStyle(`

  .vue-fail-logo {
    display: flex;
    justify-content: center;
  }

  .vue-fail-logo svg {
    width: 50%;
    filter: drop-shadow(0 0 0.75rem rgba(150, 150, 150, 0.8));
  }

`)
