<template>
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
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    let sources = {
    de: {
      name: "GeoOverlays DE",
      flag: "🇩🇪",
      enabled: true,
      layers: [
        {
          name: "Basemap DE",
          enabled: true,
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
          enabled: true,
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
          enabled: true,
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
          enabled: true,
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
          enabled: true,
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
          enabled: true,
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
    at: {
      name: "GeoOverlays AT",
      flag: "🇦🇹",
      enabled: true,
      layers: [
        {
          name: "Basemap AT",
          enabled: true,
          unique: "__DrawBasemapAT",
          id: "layer-switcher-basemap-at",
          type: "WMTS",
          source:
            "https://mapsneu.wien.gv.at/basemapneu/1.0.0/WMTSCapabilities.xml",
          layerName: "geolandbasemap",
          matrixSet: "google3857",
        },
        {
          name: "Overlay AT",
          enabled: true,
          unique: "__DrawOverlayAT",
          id: "layer-switcher-overlay-at",
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
          unique: "__DrawSwissTopoStrassenkarte",
          id: "layer-switcher-swisstopo-strassenkarte",
          type: "WMTS",
          source:
            "https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml",
          layerName: "ch.swisstopo.swisstne-base",
          matrixSet: "3857_18",
        },
        {
          name: "Basisnetz",
          enabled: true,
          unique: "__DrawSwissBasisnetz",
          id: "layer-switcher-basisnetz",
          type: "WMTS",
          source:
            "https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml",
          layerName: "ch.swisstopo.swisstlm3d-strassen",
          matrixSet: "3857_18",
        },
        {
          name: "Luftbild",
          enabled: true,
          unique: "__DrawSwissTopoLuftbild",
          id: "layer-switcher-swisstopo-luftbild",
          type: "WMTS",
          source:
            "https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml",
          layerName: "ch.swisstopo.swissimage-product",
          matrixSet: "3857_20",
        },
      ],
    },
  };
    const countries = ref(Object.keys(sources));
    const layers = ref(sources);

    return { countries, layers };
  },
  methods: {
    updateCountry(event) {
      console.log("updateCountry", event.target.id, event.target.checked);
    },
    updateLayer(event) {
      console.log("updateLayer", event.target.id, event.target.checked);
    },
  },
};
</script>
