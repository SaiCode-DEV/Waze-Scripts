/* global $ */

// ==UserScript==
// @name         Waze GeoPortal DE
// @namespace    https://greasyfork.org/de/users/863740-horst-wittlich
// @version      2024.06.13
// @description  Geoportal Overlay für Deutschland
// @author       vertexcode, hiwi234, SaiCode
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waze.com
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        GM_addStyle
// @license      MIT

// @downloadURL  https://update.greasyfork.org/scripts/460976/Waze%20GeoPortal%20DE.user.js
// @updateURL    https://update.greasyfork.org/scripts/460976/Waze%20GeoPortal%20DE.meta.js
// ==/UserScript==

// Versions Format
// yyyy.mm.dd

(() => {
  let uOpenLayers;
  let uWaze;

  let opacity = localStorage.getItem("geoportal_opacity") || 0.5;

  if (isNaN(opacity)) {
    opacity = 0.5;
  }

  //check if opacity is in a valid range
  if (opacity < 0 || opacity > 1) {
    opacity = 0.5;
  }

  // Define WMTS Layers
  const sources = [
    {
      name: "Basemap DE",
      unique: "__DrawBasemapDE",
      id: "layer-switcher-basemap-de",
      source:
        "https://sgx.geodatenzentrum.de/wmts_basemapde/1.0.0/WMTSCapabilities.xml",
      layerName: "de_basemapde_web_raster_farbe",
      matrixSet: "GLOBAL_WEBMERCATOR",
      requestEncoding: "REST",
    },
    {
      name: "GeoDatenZentrum DE",
      unique: "__DrawGeoPortalDE",
      id: "layer-switcher-geoportal-de",
      source:
        "https://sgx.geodatenzentrum.de/wmts_topplus_open/1.0.0/WMTSCapabilities.xml",
      layerName: "web",
      matrixSet: "WEBMERCATOR",
      requestEncoding: "REST",
    },
    {
      name: "GeoPortal BW",
      unique: "__DrawGeoPortalBW",
      id: "layer-switcher-geoportal-bw",
      source:
        "https://owsproxy.lgl-bw.de/owsproxy/ows/WMTS_LGL-BW_Basiskarte?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities&user=ZentrKomp&password=viewerprod",
      layerName: "Basiskarte",
      matrixSet: "GoogleMapsCompatible",
    },
    {
      name: "GeoPortal NRW",
      unique: "__DrawGeoPortalNRW",
      id: "layer-switcher-geoportal-nrw",
      source:
        "https://www.wmts.nrw.de/geobasis/wmts_nw_dtk/1.0.0/WMTSCapabilities.xml",
      layerName: "nw_dtk_col",
      matrixSet: "EPSG_3857_16",
      requestEncoding: "REST",
    },
    {
      name: "GeoPortal NRW Overlay",
      unique: "__DrawGeoPortalNRWOverlay",
      id: "layer-switcher-geoportal-nrw-overlay",
      source:
        "https://www.wmts.nrw.de/geobasis/wmts_nw_dop_overlay/1.0.0/WMTSCapabilities.xml",
      layerName: "nw_dop_overlay",
      matrixSet: "EPSG_3857_16",
      opacity: 1,
      requestEncoding: "REST",
    },
    {
      name: "GeoPortal BY",
      unique: "__DrawGeoPortalBY",
      id: "layer-switcher-geoportal-by",
      source:
        "https://geoservices.bayern.de/od/wmts/geobasis/v1/1.0.0/WMTSCapabilities.xml",
      layerName: "by_webkarte",
      matrixSet: "smerc",
      requestEncoding: "REST",
    },
  ];

  // Define WMTS Layers. Hide this function for better readability
  function loadWMTSLayer() {
    if (uOpenLayers.Layer.WMTS) {
      return;
    }
    /**
     * Class: OpenLayers.Format.XML.VersionedOGC
     * Base class for versioned formats, i.e. a format which supports multiple
     * versions.
     *
     * To enable checking if parsing succeeded, you will need to define a property
     * called errorProperty on the parser you want to check. The parser will then
     * check the returned object to see if that property is present. If it is, it
     * assumes the parsing was successful. If it is not present (or is null), it will
     * pass the document through an OGCExceptionReport parser.
     *
     * If errorProperty is undefined for the parser, this error checking mechanism
     * will be disabled.
     *
     *
     *
     * Inherits from:
     *  - <OpenLayers.Format.XML>
     */
    uOpenLayers.Format.XML.VersionedOGC = uOpenLayers.Class(
      uOpenLayers.Format.XML,
      {
        /**
         * APIProperty: defaultVersion
         * {String} Version number to assume if none found.
         */
        defaultVersion: null,

        /**
         * APIProperty: version
         * {String} Specify a version string if one is known.
         */
        version: null,

        /**
         * APIProperty: profile
         * {String} If provided, use a custom profile.
         */
        profile: null,

        /**
         * APIProperty: allowFallback
         * {Boolean} If a profiled parser cannot be found for the returned version,
         * use a non-profiled parser as the fallback. Application code using this
         * should take into account that the return object structure might be
         * missing the specifics of the profile. Defaults to false.
         */
        allowFallback: false,

        /**
         * Property: name
         * {String} The name of this parser, this is the part of the CLASS_NAME
         * except for "OpenLayers.Format."
         */
        name: null,

        /**
         * APIProperty: stringifyOutput
         * {Boolean} If true, write will return a string otherwise a DOMElement.
         * Default is false.
         */
        stringifyOutput: false,

        /**
         * Property: parser
         * {Object} Instance of the versioned parser.  Cached for multiple read and
         *     write calls of the same version.
         */
        parser: null,

        /**
         * Constructor: OpenLayers.Format.XML.VersionedOGC.
         * Constructor.
         *
         * Parameters:
         * options - {Object} Optional object whose properties will be set on
         *     the object.
         */
        initialize: function (options) {
          uOpenLayers.Format.XML.prototype.initialize.apply(this, [options]);
          var className = this.CLASS_NAME;
          this.name = className.substring(className.lastIndexOf(".") + 1);
        },

        /**
         * Method: getVersion
         * Returns the version to use. Subclasses can override this function
         * if a different version detection is needed.
         *
         * Parameters:
         * root - {DOMElement}
         * options - {Object} Optional configuration object.
         *
         * Returns:
         * {String} The version to use.
         */
        getVersion: function (root, options) {
          var version;
          // read
          if (root) {
            version = this.version;
            if (!version) {
              version = root.getAttribute("version");
              if (!version) {
                version = this.defaultVersion;
              }
            }
          } else {
            // write
            version =
              (options && options.version) ||
              this.version ||
              this.defaultVersion;
          }
          return version;
        },

        /**
         * Method: getParser
         * Get an instance of the cached parser if available, otherwise create one.
         *
         * Parameters:
         * version - {String}
         *
         * Returns:
         * {<OpenLayers.Format>}
         */
        getParser: function (version) {
          version = version || this.defaultVersion;
          var profile = this.profile ? "_" + this.profile : "";
          if (!this.parser || this.parser.VERSION != version) {
            var format =
              uOpenLayers.Format[this.name][
                "v" + version.replace(/\./g, "_") + profile
              ];
            if (!format) {
              if (profile !== "" && this.allowFallback) {
                // fallback to the non-profiled version of the parser
                profile = "";
                format =
                  uOpenLayers.Format[this.name][
                    "v" + version.replace(/\./g, "_")
                  ];
              }
              if (!format) {
                throw (
                  "Can't find a " +
                  this.name +
                  " parser for version " +
                  version +
                  profile
                );
              }
            }
            this.parser = new format(this.options);
          }
          return this.parser;
        },

        /**
         * APIMethod: write
         * Write a document.
         *
         * Parameters:
         * obj - {Object} An object representing the document.
         * options - {Object} Optional configuration object.
         *
         * Returns:
         * {String} The document as a string
         */
        write: function (obj, options) {
          var version = this.getVersion(null, options);
          this.parser = this.getParser(version);
          var root = this.parser.write(obj, options);
          if (this.stringifyOutput === false) {
            return root;
          } else {
            return uOpenLayers.Format.XML.prototype.write.apply(this, [root]);
          }
        },

        /**
         * APIMethod: read
         * Read a doc and return an object representing the document.
         *
         * Parameters:
         * data - {String | DOMElement} Data to read.
         * options - {Object} Options for the reader.
         *
         * Returns:
         * {Object} An object representing the document.
         */
        read: function (data, options) {
          if (typeof data == "string") {
            data = uOpenLayers.Format.XML.prototype.read.apply(this, [data]);
          }
          var root = data.documentElement;
          var version = this.getVersion(root);
          this.parser = this.getParser(version); // Select the parser
          var obj = this.parser.read(data, options); // Parse the data

          var errorProperty = this.parser.errorProperty || null;
          if (errorProperty !== null && obj[errorProperty] === undefined) {
            // an error must have happened, so parse it and report back
            var format = new uOpenLayers.Format.OGCExceptionReport();
            obj.error = format.read(data);
          }
          obj.version = version;
          return obj;
        },

        CLASS_NAME: "OpenLayers.Format.XML.VersionedOGC",
      }
    );

    /**
     * Class: OpenLayers.Format.WMTSCapabilities
     * Read WMTS Capabilities.
     *
     * Inherits from:
     *  - <OpenLayers.Format.XML.VersionedOGC>
     */
    uOpenLayers.Format.WMTSCapabilities = uOpenLayers.Class(
      uOpenLayers.Format.XML.VersionedOGC,
      {
        /**
         * APIProperty: defaultVersion
         * {String} Version number to assume if none found.  Default is "1.0.0".
         */
        defaultVersion: "1.0.0",

        /**
         * APIProperty: yx
         * {Object} Members in the yx object are used to determine if a CRS URN
         *     corresponds to a CRS with y,x axis order.  Member names are CRS URNs
         *     and values are boolean.  By default, the following CRS URN are
         *     assumed to correspond to a CRS with y,x axis order:
         *
         * * urn:ogc:def:crs:EPSG::4326
         */
        yx: {
          "urn:ogc:def:crs:EPSG::4326": true,
        },

        /**
         * Constructor: OpenLayers.Format.WMTSCapabilities
         * Create a new parser for WMTS capabilities.
         *
         * Parameters:
         * options - {Object} An optional object whose properties will be set on
         *     this instance.
         */

        /**
         * APIMethod: read
         * Read capabilities data from a string, and return information about
         * the service (offering and observedProperty mostly).
         *
         * Parameters:
         * data - {String} or {DOMElement} data to read/parse.
         *
         * Returns:
         * {Object} Info about the WMTS Capabilities
         */

        /**
         * APIMethod: createLayer
         * Create a WMTS layer given a capabilities object.
         *
         * Parameters:
         * capabilities - {Object} The object returned from a <read> call to this
         *     format.
         * config - {Object} Configuration properties for the layer.  Defaults for
         *     the layer will apply if not provided.
         *
         * Required config properties:
         * layer - {String} The layer identifier.
         *
         * Optional config properties:
         * matrixSet - {String} The matrix set identifier, required if there is
         *      more than one matrix set in the layer capabilities.
         * style - {String} The name of the style
         * format - {String} Image format for the layer. Default is the first
         *     format returned in the GetCapabilities response.
         * param - {Object} The dimensions values eg: {"Year": "2012"}
         *
         * Returns:
         * {<OpenLayers.Layer.WMTS>} A properly configured WMTS layer.  Throws an
         *     error if an incomplete config is provided.  Returns undefined if no
         *     layer could be created with the provided config.
         */
        createLayer: function (capabilities, config) {
          var layer;

          // confirm required properties are supplied in config
          if (!("layer" in config)) {
            throw new Error("Missing property 'layer' in configuration.");
          }

          var contents = capabilities.contents;

          // find the layer definition with the given identifier
          var layers = contents.layers;
          var layerDef;
          for (var i = 0, ii = contents.layers.length; i < ii; ++i) {
            if (contents.layers[i].identifier === config.layer) {
              layerDef = contents.layers[i];
              break;
            }
          }
          if (!layerDef) {
            console.error(
              "No layer with identifier ",
              config.layer,
              "in",
              contents.layers
            );
            console.log(
              "available layers: ",
              contents.layers.map((l) => l.identifier)
            );
            throw new Error("Layer not found");
          }

          var format = config.format;
          if (!format && layerDef.formats && layerDef.formats.length) {
            format = layerDef.formats[0];
          }

          // find the matrixSet definition
          var matrixSet;
          if (config.matrixSet) {
            matrixSet = contents.tileMatrixSets[config.matrixSet];
          } else if (layerDef.tileMatrixSetLinks.length >= 1) {
            matrixSet =
              contents.tileMatrixSets[
                layerDef.tileMatrixSetLinks[0].tileMatrixSet
              ];
          }
          if (!matrixSet) {
            console.error(
              "No matrix set with identifier ",
              config.matrixSet,
              "in",
              contents.tileMatrixSets
            );
            console.log(
              "available matrix sets: ",
              Object.keys(contents.tileMatrixSets)
            );
            throw new Error("matrixSet not found");
          }

          // get the default style for the layer
          var style;
          for (var i = 0, ii = layerDef.styles.length; i < ii; ++i) {
            style = layerDef.styles[i];
            if (style.isDefault) {
              break;
            }
          }

          var requestEncoding = config.requestEncoding;
          if (!requestEncoding) {
            requestEncoding = "KVP";
            if (capabilities.operationsMetadata.GetTile.dcp.http) {
              var http = capabilities.operationsMetadata.GetTile.dcp.http;
              // Get first get method
              if (http.get[0].constraints) {
                var constraints = http.get[0].constraints;
                var allowedValues = constraints.GetEncoding.allowedValues;

                // The OGC documentation is not clear if we should use
                // REST or RESTful, ArcGis use RESTful,
                // and OpenLayers use REST.
                if (
                  !allowedValues.KVP &&
                  (allowedValues.REST || allowedValues.RESTful)
                ) {
                  requestEncoding = "REST";
                }
              }
            }
          }

          var dimensions = [];
          var params = config.params || {};
          // to don't overwrite the changes in the applyDefaults
          delete config.params;
          for (var id = 0, ld = layerDef.dimensions.length; id < ld; id++) {
            var dimension = layerDef.dimensions[id];
            dimensions.push(dimension.identifier);
            if (!params.hasOwnProperty(dimension.identifier)) {
              params[dimension.identifier] = dimension["default"];
            }
          }

          var projection =
            config.projection ||
            matrixSet.supportedCRS.replace(
              /urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/,
              "$1:$3"
            );
          var units =
            config.units || (projection === "EPSG:4326" ? "degrees" : "m");

          var resolutions = [];
          for (var mid in matrixSet.matrixIds) {
            if (matrixSet.matrixIds.hasOwnProperty(mid)) {
              resolutions.push(
                (matrixSet.matrixIds[mid].scaleDenominator * 0.28e-3) /
                  uOpenLayers.METERS_PER_INCH /
                  uOpenLayers.INCHES_PER_UNIT[units]
              );
            }
          }

          var url;
          if (requestEncoding === "REST" && layerDef.resourceUrls) {
            url = [];
            var resourceUrls = layerDef.resourceUrls,
              resourceUrl;
            for (var t = 0, tt = layerDef.resourceUrls.length; t < tt; ++t) {
              resourceUrl = layerDef.resourceUrls[t];
              if (
                resourceUrl.format === format &&
                resourceUrl.resourceType === "tile"
              ) {
                url.push(resourceUrl.template);
              }
            }
          } else {
            var httpGet = capabilities.operationsMetadata.GetTile.dcp.http.get;
            url = [];
            var constraint;
            for (var i = 0, ii = httpGet.length; i < ii; i++) {
              constraint = httpGet[i].constraints;
              if (
                !constraint ||
                (constraint &&
                  constraint.GetEncoding.allowedValues[requestEncoding])
              ) {
                url.push(httpGet[i].url);
              }
            }
          }

          return new uOpenLayers.Layer.WMTS(
            uOpenLayers.Util.applyDefaults(config, {
              url: url,
              requestEncoding: requestEncoding,
              name: layerDef.title,
              style: style.identifier,
              format: format,
              matrixIds: matrixSet.matrixIds,
              matrixSet: matrixSet.identifier,
              projection: projection,
              units: units,
              resolutions:
                config.isBaseLayer === false ? undefined : resolutions,
              serverResolutions: resolutions,
              tileFullExtent: matrixSet.bounds,
              dimensions: dimensions,
              params: params,
            })
          );
        },

        CLASS_NAME: "OpenLayers.Format.WMTSCapabilities",
      }
    );

    /**
     * Class: OpenLayers.Format.OWSCommon
     * Read OWSCommon. Create a new instance with the <OpenLayers.Format.OWSCommon>
     *     constructor.
     *
     * Inherits from:
     *  - <OpenLayers.Format.XML.VersionedOGC>
     */
    uOpenLayers.Format.OWSCommon = uOpenLayers.Class(
      uOpenLayers.Format.XML.VersionedOGC,
      {
        /**
         * APIProperty: defaultVersion
         * {String} Version number to assume if none found.  Default is "1.0.0".
         */
        defaultVersion: "1.0.0",

        /**
         * Constructor: OpenLayers.Format.OWSCommon
         * Create a new parser for OWSCommon.
         *
         * Parameters:
         * options - {Object} An optional object whose properties will be set on
         *     this instance.
         */

        /**
         * Method: getVersion
         * Returns the version to use. Subclasses can override this function
         * if a different version detection is needed.
         *
         * Parameters:
         * root - {DOMElement}
         * options - {Object} Optional configuration object.
         *
         * Returns:
         * {String} The version to use.
         */
        getVersion: function (root, options) {
          var version = this.version;
          if (!version) {
            // remember version does not correspond to the OWS version
            // it corresponds to the WMS/WFS/WCS etc. request version
            var uri = root.getAttribute("xmlns:ows");
            // the above will fail if the namespace prefix is different than
            // ows and if the namespace is declared on a different element
            if (uri && uri.substring(uri.lastIndexOf("/") + 1) === "1.1") {
              version = "1.1.0";
            }
            if (!version) {
              version = this.defaultVersion;
            }
          }
          return version;
        },

        /**
         * APIMethod: read
         * Read an OWSCommon document and return an object.
         *
         * Parameters:
         * data - {String | DOMElement} Data to read.
         * options - {Object} Options for the reader.
         *
         * Returns:
         * {Object} An object representing the structure of the document.
         */

        CLASS_NAME: "OpenLayers.Format.OWSCommon",
      }
    );

    /**
     * Class: OpenLayers.Format.OWSCommon.v1
     * Common readers and writers for OWSCommon v1.X formats
     *
     * Inherits from:
     *  - <OpenLayers.Format.XML>
     */
    uOpenLayers.Format.OWSCommon.v1 = uOpenLayers.Class(
      uOpenLayers.Format.XML,
      {
        /**
         * Property: regExes
         * Compiled regular expressions for manipulating strings.
         */
        regExes: {
          trimSpace: /^\s*|\s*$/g,
          removeSpace: /\s*/g,
          splitSpace: /\s+/,
          trimComma: /\s*,\s*/g,
        },

        /**
         * Method: read
         *
         * Parameters:
         * data - {DOMElement} An OWSCommon document element.
         * options - {Object} Options for the reader.
         *
         * Returns:
         * {Object} An object representing the OWSCommon document.
         */
        read: function (data, options) {
          options = uOpenLayers.Util.applyDefaults(options, this.options);
          var ows = {};
          this.readChildNodes(data, ows);
          return ows;
        },

        /**
         * Property: readers
         * Contains public functions, grouped by namespace prefix, that will
         *     be applied when a namespaced node is found matching the function
         *     name.  The function will be applied in the scope of this parser
         *     with two arguments: the node being read and a context object passed
         *     from the parent.
         */
        readers: {
          ows: {
            Exception: function (node, exceptionReport) {
              var exception = {
                code: node.getAttribute("exceptionCode"),
                locator: node.getAttribute("locator"),
                texts: [],
              };
              exceptionReport.exceptions.push(exception);
              this.readChildNodes(node, exception);
            },
            ExceptionText: function (node, exception) {
              var text = this.getChildValue(node);
              exception.texts.push(text);
            },
            ServiceIdentification: function (node, obj) {
              obj.serviceIdentification = {};
              this.readChildNodes(node, obj.serviceIdentification);
            },
            Title: function (node, obj) {
              obj.title = this.getChildValue(node);
            },
            Abstract: function (node, serviceIdentification) {
              serviceIdentification["abstract"] = this.getChildValue(node);
            },
            Keywords: function (node, serviceIdentification) {
              serviceIdentification.keywords = {};
              this.readChildNodes(node, serviceIdentification.keywords);
            },
            Keyword: function (node, keywords) {
              keywords[this.getChildValue(node)] = true;
            },
            ServiceType: function (node, serviceIdentification) {
              serviceIdentification.serviceType = {
                codeSpace: node.getAttribute("codeSpace"),
                value: this.getChildValue(node),
              };
            },
            ServiceTypeVersion: function (node, serviceIdentification) {
              serviceIdentification.serviceTypeVersion =
                this.getChildValue(node);
            },
            Fees: function (node, serviceIdentification) {
              serviceIdentification.fees = this.getChildValue(node);
            },
            AccessConstraints: function (node, serviceIdentification) {
              serviceIdentification.accessConstraints =
                this.getChildValue(node);
            },
            ServiceProvider: function (node, obj) {
              obj.serviceProvider = {};
              this.readChildNodes(node, obj.serviceProvider);
            },
            ProviderName: function (node, serviceProvider) {
              serviceProvider.providerName = this.getChildValue(node);
            },
            ProviderSite: function (node, serviceProvider) {
              serviceProvider.providerSite = this.getAttributeNS(
                node,
                this.namespaces.xlink,
                "href"
              );
            },
            ServiceContact: function (node, serviceProvider) {
              serviceProvider.serviceContact = {};
              this.readChildNodes(node, serviceProvider.serviceContact);
            },
            IndividualName: function (node, serviceContact) {
              serviceContact.individualName = this.getChildValue(node);
            },
            PositionName: function (node, serviceContact) {
              serviceContact.positionName = this.getChildValue(node);
            },
            ContactInfo: function (node, serviceContact) {
              serviceContact.contactInfo = {};
              this.readChildNodes(node, serviceContact.contactInfo);
            },
            Phone: function (node, contactInfo) {
              contactInfo.phone = {};
              this.readChildNodes(node, contactInfo.phone);
            },
            Voice: function (node, phone) {
              phone.voice = this.getChildValue(node);
            },
            Address: function (node, contactInfo) {
              contactInfo.address = {};
              this.readChildNodes(node, contactInfo.address);
            },
            DeliveryPoint: function (node, address) {
              address.deliveryPoint = this.getChildValue(node);
            },
            City: function (node, address) {
              address.city = this.getChildValue(node);
            },
            AdministrativeArea: function (node, address) {
              address.administrativeArea = this.getChildValue(node);
            },
            PostalCode: function (node, address) {
              address.postalCode = this.getChildValue(node);
            },
            Country: function (node, address) {
              address.country = this.getChildValue(node);
            },
            ElectronicMailAddress: function (node, address) {
              address.electronicMailAddress = this.getChildValue(node);
            },
            Role: function (node, serviceContact) {
              serviceContact.role = this.getChildValue(node);
            },
            OperationsMetadata: function (node, obj) {
              obj.operationsMetadata = {};
              this.readChildNodes(node, obj.operationsMetadata);
            },
            Operation: function (node, operationsMetadata) {
              var name = node.getAttribute("name");
              operationsMetadata[name] = {};
              this.readChildNodes(node, operationsMetadata[name]);
            },
            DCP: function (node, operation) {
              operation.dcp = {};
              this.readChildNodes(node, operation.dcp);
            },
            HTTP: function (node, dcp) {
              dcp.http = {};
              this.readChildNodes(node, dcp.http);
            },
            Get: function (node, http) {
              if (!http.get) {
                http.get = [];
              }
              var obj = {
                url: this.getAttributeNS(node, this.namespaces.xlink, "href"),
              };
              this.readChildNodes(node, obj);
              http.get.push(obj);
            },
            Post: function (node, http) {
              if (!http.post) {
                http.post = [];
              }
              var obj = {
                url: this.getAttributeNS(node, this.namespaces.xlink, "href"),
              };
              this.readChildNodes(node, obj);
              http.post.push(obj);
            },
            Parameter: function (node, operation) {
              if (!operation.parameters) {
                operation.parameters = {};
              }
              var name = node.getAttribute("name");
              operation.parameters[name] = {};
              this.readChildNodes(node, operation.parameters[name]);
            },
            Constraint: function (node, obj) {
              if (!obj.constraints) {
                obj.constraints = {};
              }
              var name = node.getAttribute("name");
              obj.constraints[name] = {};
              this.readChildNodes(node, obj.constraints[name]);
            },
            Value: function (node, allowedValues) {
              allowedValues[this.getChildValue(node)] = true;
            },
            OutputFormat: function (node, obj) {
              obj.formats.push({ value: this.getChildValue(node) });
              this.readChildNodes(node, obj);
            },
            WGS84BoundingBox: function (node, obj) {
              var boundingBox = {};
              boundingBox.crs = node.getAttribute("crs");
              if (obj.BoundingBox) {
                obj.BoundingBox.push(boundingBox);
              } else {
                obj.projection = boundingBox.crs;
                boundingBox = obj;
              }
              this.readChildNodes(node, boundingBox);
            },
            BoundingBox: function (node, obj) {
              // FIXME: We consider that BoundingBox is the same as WGS84BoundingBox
              // LowerCorner = "min_x min_y"
              // UpperCorner = "max_x max_y"
              // It should normally depend on the projection
              this.readers["ows"]["WGS84BoundingBox"].apply(this, [node, obj]);
            },
            LowerCorner: function (node, obj) {
              var str = this.getChildValue(node).replace(
                this.regExes.trimSpace,
                ""
              );
              str = str.replace(this.regExes.trimComma, ",");
              var pointList = str.split(this.regExes.splitSpace);
              obj.left = pointList[0];
              obj.bottom = pointList[1];
            },
            UpperCorner: function (node, obj) {
              var str = this.getChildValue(node).replace(
                this.regExes.trimSpace,
                ""
              );
              str = str.replace(this.regExes.trimComma, ",");
              var pointList = str.split(this.regExes.splitSpace);
              obj.right = pointList[0];
              obj.top = pointList[1];
              obj.bounds = new uOpenLayers.Bounds(
                obj.left,
                obj.bottom,
                obj.right,
                obj.top
              );
              delete obj.left;
              delete obj.bottom;
              delete obj.right;
              delete obj.top;
            },
            Language: function (node, obj) {
              obj.language = this.getChildValue(node);
            },
          },
        },

        /**
         * Property: writers
         * As a compliment to the readers property, this structure contains public
         *     writing functions grouped by namespace alias and named like the
         *     node names they produce.
         */
        writers: {
          ows: {
            BoundingBox: function (options, nodeName) {
              var node = this.createElementNSPlus(
                nodeName || "ows:BoundingBox",
                {
                  attributes: {
                    crs: options.projection,
                  },
                }
              );
              this.writeNode("ows:LowerCorner", options, node);
              this.writeNode("ows:UpperCorner", options, node);
              return node;
            },
            LowerCorner: function (options) {
              var node = this.createElementNSPlus("ows:LowerCorner", {
                value: options.bounds.left + " " + options.bounds.bottom,
              });
              return node;
            },
            UpperCorner: function (options) {
              var node = this.createElementNSPlus("ows:UpperCorner", {
                value: options.bounds.right + " " + options.bounds.top,
              });
              return node;
            },
            Identifier: function (identifier) {
              var node = this.createElementNSPlus("ows:Identifier", {
                value: identifier,
              });
              return node;
            },
            Title: function (title) {
              var node = this.createElementNSPlus("ows:Title", {
                value: title,
              });
              return node;
            },
            Abstract: function (abstractValue) {
              var node = this.createElementNSPlus("ows:Abstract", {
                value: abstractValue,
              });
              return node;
            },
            OutputFormat: function (format) {
              var node = this.createElementNSPlus("ows:OutputFormat", {
                value: format,
              });
              return node;
            },
          },
        },

        CLASS_NAME: "OpenLayers.Format.OWSCommon.v1",
      }
    );

    /**
     * Class: OpenLayers.Format.OWSCommon.v1_1_0
     * Parser for OWS Common version 1.1.0.
     *
     * Inherits from:
     *  - <OpenLayers.Format.OWSCommon.v1>
     */
    uOpenLayers.Format.OWSCommon.v1_1_0 = uOpenLayers.Class(
      uOpenLayers.Format.OWSCommon.v1,
      {
        /**
         * Property: namespaces
         * {Object} Mapping of namespace aliases to namespace URIs.
         */
        namespaces: {
          ows: "http://www.opengis.net/ows/1.1",
          xlink: "http://www.w3.org/1999/xlink",
        },

        /**
         * Property: readers
         * Contains public functions, grouped by namespace prefix, that will
         *     be applied when a namespaced node is found matching the function
         *     name.  The function will be applied in the scope of this parser
         *     with two arguments: the node being read and a context object passed
         *     from the parent.
         */
        readers: {
          ows: uOpenLayers.Util.applyDefaults(
            {
              ExceptionReport: function (node, obj) {
                obj.exceptionReport = {
                  version: node.getAttribute("version"),
                  language: node.getAttribute("xml:lang"),
                  exceptions: [],
                };
                this.readChildNodes(node, obj.exceptionReport);
              },
              AllowedValues: function (node, parameter) {
                parameter.allowedValues = {};
                this.readChildNodes(node, parameter.allowedValues);
              },
              AnyValue: function (node, parameter) {
                parameter.anyValue = true;
              },
              DataType: function (node, parameter) {
                parameter.dataType = this.getChildValue(node);
              },
              Range: function (node, allowedValues) {
                allowedValues.range = {};
                this.readChildNodes(node, allowedValues.range);
              },
              MinimumValue: function (node, range) {
                range.minValue = this.getChildValue(node);
              },
              MaximumValue: function (node, range) {
                range.maxValue = this.getChildValue(node);
              },
              Identifier: function (node, obj) {
                obj.identifier = this.getChildValue(node);
              },
              SupportedCRS: function (node, obj) {
                obj.supportedCRS = this.getChildValue(node);
              },
            },
            uOpenLayers.Format.OWSCommon.v1.prototype.readers["ows"]
          ),
        },

        /**
         * Property: writers
         * As a compliment to the readers property, this structure contains public
         *     writing functions grouped by namespace alias and named like the
         *     node names they produce.
         */
        writers: {
          ows: uOpenLayers.Util.applyDefaults(
            {
              Range: function (range) {
                var node = this.createElementNSPlus("ows:Range", {
                  attributes: {
                    "ows:rangeClosure": range.closure,
                  },
                });
                this.writeNode("ows:MinimumValue", range.minValue, node);
                this.writeNode("ows:MaximumValue", range.maxValue, node);
                return node;
              },
              MinimumValue: function (minValue) {
                var node = this.createElementNSPlus("ows:MinimumValue", {
                  value: minValue,
                });
                return node;
              },
              MaximumValue: function (maxValue) {
                var node = this.createElementNSPlus("ows:MaximumValue", {
                  value: maxValue,
                });
                return node;
              },
              Value: function (value) {
                var node = this.createElementNSPlus("ows:Value", {
                  value: value,
                });
                return node;
              },
            },
            OpenLayers.Format.OWSCommon.v1.prototype.writers["ows"]
          ),
        },

        CLASS_NAME: "OpenLayers.Format.OWSCommon.v1_1_0",
      }
    );

    /**
     * Class: OpenLayers.Format.WMTSCapabilities.v1_0_0
     * Read WMTS Capabilities version 1.0.0.
     *
     * Inherits from:
     *  - <OpenLayers.Format.WMTSCapabilities>
     */
    uOpenLayers.Format.WMTSCapabilities.v1_0_0 = uOpenLayers.Class(
      uOpenLayers.Format.OWSCommon.v1_1_0,
      {
        /**
         * Property: version
         * {String} The parser version ("1.0.0").
         */
        version: "1.0.0",

        /**
         * Property: namespaces
         * {Object} Mapping of namespace aliases to namespace URIs.
         */
        namespaces: {
          ows: "http://www.opengis.net/ows/1.1",
          wmts: "http://www.opengis.net/wmts/1.0",
          xlink: "http://www.w3.org/1999/xlink",
        },

        /**
         * Property: yx
         * {Object} Members in the yx object are used to determine if a CRS URN
         *     corresponds to a CRS with y,x axis order.  Member names are CRS URNs
         *     and values are boolean.  Defaults come from the
         *     <OpenLayers.Format.WMTSCapabilities> prototype.
         */
        yx: null,

        /**
         * Property: defaultPrefix
         * {String} The default namespace alias for creating element nodes.
         */
        defaultPrefix: "wmts",

        /**
         * Constructor: OpenLayers.Format.WMTSCapabilities.v1_0_0
         * Create a new parser for WMTS capabilities version 1.0.0.
         *
         * Parameters:
         * options - {Object} An optional object whose properties will be set on
         *     this instance.
         */
        initialize: function (options) {
          uOpenLayers.Format.XML.prototype.initialize.apply(this, [options]);
          this.options = options;
          var yx = uOpenLayers.Util.extend(
            {},
            uOpenLayers.Format.WMTSCapabilities.prototype.yx
          );
          this.yx = uOpenLayers.Util.extend(yx, this.yx);
        },

        /**
         * APIMethod: read
         * Read capabilities data from a string, and return info about the WMTS.
         *
         * Parameters:
         * data - {String} or {DOMElement} data to read/parse.
         *
         * Returns:
         * {Object} Information about the SOS service.
         */
        read: function (data) {
          if (typeof data == "string") {
            data = uOpenLayers.Format.XML.prototype.read.apply(this, [data]);
          }
          if (data && data.nodeType == 9) {
            data = data.documentElement;
          }
          var capabilities = {};
          this.readNode(data, capabilities);
          capabilities.version = this.version;
          return capabilities;
        },

        /**
         * Property: readers
         * Contains public functions, grouped by namespace prefix, that will
         *     be applied when a namespaced node is found matching the function
         *     name.  The function will be applied in the scope of this parser
         *     with two arguments: the node being read and a context object passed
         *     from the parent.
         */
        readers: {
          wmts: {
            Capabilities: function (node, obj) {
              this.readChildNodes(node, obj);
            },
            Contents: function (node, obj) {
              obj.contents = {};
              obj.contents.layers = [];
              obj.contents.tileMatrixSets = {};
              this.readChildNodes(node, obj.contents);
            },
            Layer: function (node, obj) {
              var layer = {
                styles: [],
                formats: [],
                dimensions: [],
                tileMatrixSetLinks: [],
              };
              layer.layers = [];
              this.readChildNodes(node, layer);
              obj.layers.push(layer);
            },
            Style: function (node, obj) {
              var style = {};
              style.isDefault = node.getAttribute("isDefault") === "true";
              this.readChildNodes(node, style);
              obj.styles.push(style);
            },
            Format: function (node, obj) {
              obj.formats.push(this.getChildValue(node));
            },
            TileMatrixSetLink: function (node, obj) {
              var tileMatrixSetLink = {};
              this.readChildNodes(node, tileMatrixSetLink);
              obj.tileMatrixSetLinks.push(tileMatrixSetLink);
            },
            TileMatrixSet: function (node, obj) {
              // node could be child of wmts:Contents or wmts:TileMatrixSetLink
              // duck type wmts:Contents by looking for layers
              if (obj.layers) {
                // TileMatrixSet as object type in schema
                var tileMatrixSet = {
                  matrixIds: [],
                };
                this.readChildNodes(node, tileMatrixSet);
                obj.tileMatrixSets[tileMatrixSet.identifier] = tileMatrixSet;
              } else {
                // TileMatrixSet as string type in schema
                obj.tileMatrixSet = this.getChildValue(node);
              }
            },
            TileMatrix: function (node, obj) {
              var tileMatrix = {
                supportedCRS: obj.supportedCRS,
              };
              this.readChildNodes(node, tileMatrix);
              obj.matrixIds.push(tileMatrix);
            },
            ScaleDenominator: function (node, obj) {
              obj.scaleDenominator = parseFloat(this.getChildValue(node));
            },
            TopLeftCorner: function (node, obj) {
              var topLeftCorner = this.getChildValue(node);
              var coords = topLeftCorner.split(" ");
              // decide on axis order for the given CRS
              var yx;
              if (obj.supportedCRS) {
                // extract out version from URN
                var crs = obj.supportedCRS.replace(
                  /urn:ogc:def:crs:(\w+):.+:(\w+)$/,
                  "urn:ogc:def:crs:$1::$2"
                );
                yx = !!this.yx[crs];
              }
              if (yx) {
                obj.topLeftCorner = new OpenLayers.LonLat(coords[1], coords[0]);
              } else {
                obj.topLeftCorner = new OpenLayers.LonLat(coords[0], coords[1]);
              }
            },
            TileWidth: function (node, obj) {
              obj.tileWidth = parseInt(this.getChildValue(node));
            },
            TileHeight: function (node, obj) {
              obj.tileHeight = parseInt(this.getChildValue(node));
            },
            MatrixWidth: function (node, obj) {
              obj.matrixWidth = parseInt(this.getChildValue(node));
            },
            MatrixHeight: function (node, obj) {
              obj.matrixHeight = parseInt(this.getChildValue(node));
            },
            ResourceURL: function (node, obj) {
              obj.resourceUrl = obj.resourceUrl || {};
              var resourceType = node.getAttribute("resourceType");
              if (!obj.resourceUrls) {
                obj.resourceUrls = [];
              }
              var resourceUrl = (obj.resourceUrl[resourceType] = {
                format: node.getAttribute("format"),
                template: node.getAttribute("template"),
                resourceType: resourceType,
              });
              obj.resourceUrls.push(resourceUrl);
            },
            // not used for now, can be added in the future though
            /*"Themes": function(node, obj) {
                obj.themes = [];
                this.readChildNodes(node, obj.themes);
            },
            "Theme": function(node, obj) {
                var theme = {};
                this.readChildNodes(node, theme);
                obj.push(theme);
            },*/
            WSDL: function (node, obj) {
              obj.wsdl = {};
              obj.wsdl.href = node.getAttribute("xlink:href");
              // TODO: other attributes of <WSDL> element
            },
            ServiceMetadataURL: function (node, obj) {
              obj.serviceMetadataUrl = {};
              obj.serviceMetadataUrl.href = node.getAttribute("xlink:href");
              // TODO: other attributes of <ServiceMetadataURL> element
            },
            LegendURL: function (node, obj) {
              obj.legend = {};
              obj.legend.href = node.getAttribute("xlink:href");
              obj.legend.format = node.getAttribute("format");
            },
            Dimension: function (node, obj) {
              var dimension = { values: [] };
              this.readChildNodes(node, dimension);
              obj.dimensions.push(dimension);
            },
            Default: function (node, obj) {
              obj["default"] = this.getChildValue(node);
            },
            Value: function (node, obj) {
              obj.values.push(this.getChildValue(node));
            },
          },
          ows: uOpenLayers.Format.OWSCommon.v1_1_0.prototype.readers["ows"],
        },

        CLASS_NAME: "OpenLayers.Format.WMTSCapabilities.v1_0_0",
      }
    );

    /**
     * Class: OpenLayers.Layer.WMTS
     * Instances of the WMTS class allow viewing of tiles from a service that
     *     implements the OGC WMTS specification version 1.0.0.
     *
     * Inherits from:
     *  - <OpenLayers.Layer.Grid>
     */
    uOpenLayers.Layer.WMTS = uOpenLayers.Class(uOpenLayers.Layer.Grid, {
      /**
       * APIProperty: isBaseLayer
       * {Boolean} The layer will be considered a base layer.  Default is true.
       */
      isBaseLayer: true,

      /**
       * Property: version
       * {String} WMTS version.  Default is "1.0.0".
       */
      version: "1.0.0",

      /**
       * APIProperty: requestEncoding
       * {String} Request encoding.  Can be "REST" or "KVP".  Default is "KVP".
       */
      requestEncoding: "KVP",

      /**
       * APIProperty: url
       * {String|Array(String)} The base URL or request URL template for the WMTS
       * service. Must be provided. Array is only supported for base URLs, not
       * for request URL templates. URL templates are only supported for
       * REST <requestEncoding>.
       */
      url: null,

      /**
       * APIProperty: layer
       * {String} The layer identifier advertised by the WMTS service.  Must be
       *     provided.
       */
      layer: null,

      /**
       * APIProperty: matrixSet
       * {String} One of the advertised matrix set identifiers.  Must be provided.
       */
      matrixSet: null,

      /**
       * APIProperty: style
       * {String} One of the advertised layer styles.  Must be provided.
       */
      style: null,

      /**
       * APIProperty: format
       * {String} The image MIME type.  Default is "image/jpeg".
       */
      format: "image/jpeg",

      /**
       * APIProperty: tileOrigin
       * {<OpenLayers.LonLat>} The top-left corner of the tile matrix in map
       *     units.  If the tile origin for each matrix in a set is different,
       *     the <matrixIds> should include a topLeftCorner property.  If
       *     not provided, the tile origin will default to the top left corner
       *     of the layer <maxExtent>.
       */
      tileOrigin: null,

      /**
       * APIProperty: tileFullExtent
       * {<OpenLayers.Bounds>}  The full extent of the tile set.  If not supplied,
       *     the layer's <maxExtent> property will be used.
       */
      tileFullExtent: null,

      /**
       * APIProperty: formatSuffix
       * {String} For REST request encoding, an image format suffix must be
       *     included in the request.  If not provided, the suffix will be derived
       *     from the <format> property.
       */
      formatSuffix: null,

      /**
       * APIProperty: matrixIds
       * {Array} A list of tile matrix identifiers.  If not provided, the matrix
       *     identifiers will be assumed to be integers corresponding to the
       *     map zoom level.  If a list of strings is provided, each item should
       *     be the matrix identifier that corresponds to the map zoom level.
       *     Additionally, a list of objects can be provided.  Each object should
       *     describe the matrix as presented in the WMTS capabilities.  These
       *     objects should have the propertes shown below.
       *
       * Matrix properties:
       * identifier - {String} The matrix identifier (required).
       * scaleDenominator - {Number} The matrix scale denominator.
       * topLeftCorner - {<OpenLayers.LonLat>} The top left corner of the
       *     matrix.  Must be provided if different than the layer <tileOrigin>.
       * tileWidth - {Number} The tile width for the matrix.  Must be provided
       *     if different than the width given in the layer <tileSize>.
       * tileHeight - {Number} The tile height for the matrix.  Must be provided
       *     if different than the height given in the layer <tileSize>.
       */
      matrixIds: null,

      /**
       * APIProperty: dimensions
       * {Array} For RESTful request encoding, extra dimensions may be specified.
       *     Items in this list should be property names in the <params> object.
       *     Values of extra dimensions will be determined from the corresponding
       *     values in the <params> object.
       */
      dimensions: null,

      /**
       * APIProperty: params
       * {Object} Extra parameters to include in tile requests.  For KVP
       *     <requestEncoding>, these properties will be encoded in the request
       *     query string.  For REST <requestEncoding>, these properties will
       *     become part of the request path, with order determined by the
       *     <dimensions> list.
       */
      params: null,

      /**
       * APIProperty: zoomOffset
       * {Number} If your cache has more levels than you want to provide
       *     access to with this layer, supply a zoomOffset.  This zoom offset
       *     is added to the current map zoom level to determine the level
       *     for a requested tile.  For example, if you supply a zoomOffset
       *     of 3, when the map is at the zoom 0, tiles will be requested from
       *     level 3 of your cache.  Default is 0 (assumes cache level and map
       *     zoom are equivalent).  Additionally, if this layer is to be used
       *     as an overlay and the cache has fewer zoom levels than the base
       *     layer, you can supply a negative zoomOffset.  For example, if a
       *     map zoom level of 1 corresponds to your cache level zero, you would
       *     supply a -1 zoomOffset (and set the maxResolution of the layer
       *     appropriately).  The zoomOffset value has no effect if complete
       *     matrix definitions (including scaleDenominator) are supplied in
       *     the <matrixIds> property.  Defaults to 0 (no zoom offset).
       */
      zoomOffset: 0,

      /**
       * APIProperty: serverResolutions
       * {Array} A list of all resolutions available on the server.  Only set this
       *     property if the map resolutions differ from the server. This
       *     property serves two purposes. (a) <serverResolutions> can include
       *     resolutions that the server supports and that you don't want to
       *     provide with this layer; you can also look at <zoomOffset>, which is
       *     an alternative to <serverResolutions> for that specific purpose.
       *     (b) The map can work with resolutions that aren't supported by
       *     the server, i.e. that aren't in <serverResolutions>. When the
       *     map is displayed in such a resolution data for the closest
       *     server-supported resolution is loaded and the layer div is
       *     stretched as necessary.
       */
      serverResolutions: null,

      /**
       * Property: formatSuffixMap
       * {Object} a map between WMTS 'format' request parameter and tile image file suffix
       */
      formatSuffixMap: {
        "image/png": "png",
        "image/png8": "png",
        "image/png24": "png",
        "image/png32": "png",
        png: "png",
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        jpeg: "jpg",
        jpg: "jpg",
      },

      /**
       * Property: matrix
       * {Object} Matrix definition for the current map resolution.  Updated by
       *     the <updateMatrixProperties> method.
       */
      matrix: null,

      /**
       * Constructor: OpenLayers.Layer.WMTS
       * Create a new WMTS layer.
       *
       * Example:
       * (code)
       * var wmts = new OpenLayers.Layer.WMTS({
       *     name: "My WMTS Layer",
       *     url: "http://example.com/wmts",
       *     layer: "layer_id",
       *     style: "default",
       *     matrixSet: "matrix_id"
       * });
       * (end)
       *
       * Parameters:
       * config - {Object} Configuration properties for the layer.
       *
       * Required configuration properties:
       * url - {String} The base url for the service.  See the <url> property.
       * layer - {String} The layer identifier.  See the <layer> property.
       * style - {String} The layer style identifier.  See the <style> property.
       * matrixSet - {String} The tile matrix set identifier.  See the <matrixSet>
       *     property.
       *
       * Any other documented layer properties can be provided in the config object.
       */
      initialize: function (config) {
        // confirm required properties are supplied
        var required = {
          url: true,
          layer: true,
          style: true,
          matrixSet: true,
        };
        for (var prop in required) {
          if (!(prop in config)) {
            throw new Error(
              "Missing property '" + prop + "' in layer configuration."
            );
          }
        }

        config.params = uOpenLayers.Util.upperCaseObject(config.params);
        var args = [config.name, config.url, config.params, config];
        uOpenLayers.Layer.Grid.prototype.initialize.apply(this, args);

        // determine format suffix (for REST)
        if (!this.formatSuffix) {
          this.formatSuffix =
            this.formatSuffixMap[this.format] || this.format.split("/").pop();
        }

        // expand matrixIds (may be array of string or array of object)
        if (this.matrixIds) {
          var len = this.matrixIds.length;
          if (len && typeof this.matrixIds[0] === "string") {
            var ids = this.matrixIds;
            this.matrixIds = new Array(len);
            for (var i = 0; i < len; ++i) {
              this.matrixIds[i] = { identifier: ids[i] };
            }
          }
        }
      },

      /**
       * Method: setMap
       */
      setMap: function () {
        uOpenLayers.Layer.Grid.prototype.setMap.apply(this, arguments);
      },

      /**
       * Method: updateMatrixProperties
       * Called when map resolution changes to update matrix related properties.
       */
      updateMatrixProperties: function () {
        this.matrix = this.getMatrix();
        if (this.matrix) {
          if (this.matrix.topLeftCorner) {
            this.tileOrigin = this.matrix.topLeftCorner;
          }
          if (this.matrix.tileWidth && this.matrix.tileHeight) {
            this.tileSize = new uOpenLayers.Size(
              this.matrix.tileWidth,
              this.matrix.tileHeight
            );
          }
          if (!this.tileOrigin) {
            this.tileOrigin = new uOpenLayers.LonLat(
              this.maxExtent.left,
              this.maxExtent.top
            );
          }
          if (!this.tileFullExtent) {
            this.tileFullExtent = this.maxExtent;
          }
        }
      },

      /**
       * Method: moveTo
       *
       * Parameters:
       * bounds - {<OpenLayers.Bounds>}
       * zoomChanged - {Boolean} Tells when zoom has changed, as layers have to
       *     do some init work in that case.
       * dragging - {Boolean}
       */
      moveTo: function (bounds, zoomChanged, dragging) {
        if (zoomChanged || !this.matrix) {
          this.updateMatrixProperties();
        }
        return uOpenLayers.Layer.Grid.prototype.moveTo.apply(this, arguments);
      },

      /**
       * APIMethod: clone
       *
       * Parameters:
       * obj - {Object}
       *
       * Returns:
       * {<OpenLayers.Layer.WMTS>} An exact clone of this <OpenLayers.Layer.WMTS>
       */
      clone: function (obj) {
        if (obj == null) {
          obj = new uOpenLayers.Layer.WMTS(this.options);
        }
        //get all additions from superclasses
        obj = uOpenLayers.Layer.Grid.prototype.clone.apply(this, [obj]);
        // copy/set any non-init, non-simple values here
        return obj;
      },

      /**
       * Method: getIdentifier
       * Get the current index in the matrixIds array.
       */
      getIdentifier: function () {
        return this.getServerZoom();
      },

      /**
       * Method: getMatrix
       * Get the appropriate matrix definition for the current map resolution.
       */
      getMatrix: function () {
        var matrix;
        if (!this.matrixIds || this.matrixIds.length === 0) {
          matrix = { identifier: this.getIdentifier() };
        } else {
          // get appropriate matrix given the map scale if possible
          if ("scaleDenominator" in this.matrixIds[0]) {
            // scale denominator calculation based on WMTS spec
            var denom =
              (uOpenLayers.METERS_PER_INCH *
                uOpenLayers.INCHES_PER_UNIT[this.units] *
                this.getServerResolution()) /
              0.28e-3;
            var diff = Number.POSITIVE_INFINITY;
            var delta;
            for (var i = 0, ii = this.matrixIds.length; i < ii; ++i) {
              delta = Math.abs(1 - this.matrixIds[i].scaleDenominator / denom);
              if (delta < diff) {
                diff = delta;
                matrix = this.matrixIds[i];
              }
            }
          } else {
            // fall back on zoom as index
            matrix = this.matrixIds[this.getIdentifier()];
          }
        }
        return matrix;
      },

      /**
       * Method: getTileInfo
       * Get tile information for a given location at the current map resolution.
       *
       * Parameters:
       * loc - {<OpenLayers.LonLat} A location in map coordinates.
       *
       * Returns:
       * {Object} An object with "col", "row", "i", and "j" properties.  The col
       *     and row values are zero based tile indexes from the top left.  The
       *     i and j values are the number of pixels to the left and top
       *     (respectively) of the given location within the target tile.
       */
      getTileInfo: function (loc) {
        var res = this.getServerResolution();

        var fx = (loc.lon - this.tileOrigin.lon) / (res * this.tileSize.w);
        var fy = (this.tileOrigin.lat - loc.lat) / (res * this.tileSize.h);

        var col = Math.floor(fx);
        var row = Math.floor(fy);

        return {
          col: col,
          row: row,
          i: Math.floor((fx - col) * this.tileSize.w),
          j: Math.floor((fy - row) * this.tileSize.h),
        };
      },

      /**
       * Method: getURL
       *
       * Parameters:
       * bounds - {<OpenLayers.Bounds>}
       *
       * Returns:
       * {String} A URL for the tile corresponding to the given bounds.
       */
      getURL: function (bounds) {
        bounds = this.adjustBounds(bounds);
        var url = "";
        if (
          !this.tileFullExtent ||
          this.tileFullExtent.intersectsBounds(bounds)
        ) {
          var center = bounds.getCenterLonLat();
          var info = this.getTileInfo(center);
          var matrixId = this.matrix.identifier;
          var dimensions = this.dimensions,
            params;

          if (uOpenLayers.Util.isArray(this.url)) {
            url = this.selectUrl(
              [
                this.version,
                this.style,
                this.matrixSet,
                this.matrix.identifier,
                info.row,
                info.col,
              ].join(","),
              this.url
            );
          } else {
            url = this.url;
          }

          if (this.requestEncoding.toUpperCase() === "REST") {
            params = this.params;
            if (url.indexOf("{") !== -1) {
              var template = url.replace(/\{/g, "${");
              var context = {
                // spec does not make clear if capital S or not
                style: this.style,
                Style: this.style,
                TileMatrixSet: this.matrixSet,
                TileMatrix: this.matrix.identifier,
                TileRow: info.row,
                TileCol: info.col,
              };
              if (dimensions) {
                var dimension, i;
                for (i = dimensions.length - 1; i >= 0; --i) {
                  dimension = dimensions[i];
                  context[dimension] = params[dimension.toUpperCase()];
                }
              }
              url = uOpenLayers.String.format(template, context);
            } else {
              // include 'version', 'layer' and 'style' in tile resource url
              var path =
                this.version + "/" + this.layer + "/" + this.style + "/";

              // append optional dimension path elements
              if (dimensions) {
                for (var i = 0; i < dimensions.length; i++) {
                  if (params[dimensions[i]]) {
                    path = path + params[dimensions[i]] + "/";
                  }
                }
              }

              // append other required path elements
              path =
                path +
                this.matrixSet +
                "/" +
                this.matrix.identifier +
                "/" +
                info.row +
                "/" +
                info.col +
                "." +
                this.formatSuffix;

              if (!url.match(/\/$/)) {
                url = url + "/";
              }
              url = url + path;
            }
          } else if (this.requestEncoding.toUpperCase() === "KVP") {
            // assemble all required parameters
            params = {
              SERVICE: "WMTS",
              REQUEST: "GetTile",
              VERSION: this.version,
              LAYER: this.layer,
              STYLE: this.style,
              TILEMATRIXSET: this.matrixSet,
              TILEMATRIX: this.matrix.identifier,
              TILEROW: info.row,
              TILECOL: info.col,
              FORMAT: this.format,
            };
            url = uOpenLayers.Layer.Grid.prototype.getFullRequestString.apply(
              this,
              [params]
            );
          }
        }
        return url;
      },

      /**
       * APIMethod: mergeNewParams
       * Extend the existing layer <params> with new properties.  Tiles will be
       *     reloaded with updated params in the request.
       *
       * Parameters:
       * newParams - {Object} Properties to extend to existing <params>.
       */
      mergeNewParams: function (newParams) {
        if (this.requestEncoding.toUpperCase() === "KVP") {
          return uOpenLayers.Layer.Grid.prototype.mergeNewParams.apply(this, [
            uOpenLayers.Util.upperCaseObject(newParams),
          ]);
        }
      },

      CLASS_NAME: "OpenLayers.Layer.WMTS",
    });
  }

  function geoportal_init() {
    loadWMTSLayer();

    let displayGroupSelector = $("#layer-switcher-group_display");
    if (displayGroupSelector.length) {
      let displayGroup = $("ul.collapsible-GROUP_DISPLAY");

      $.each(sources, function (index, source) {
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
                `Failed to load Geoportal Layer ${index + 1}/${
                  sources.length
                }: ${source.name}`
              );
              return;
            }

            let format = new uOpenLayers.Format.WMTSCapabilities({});
            var doc = responseXML;
            var capabilities = format.read(doc);
            source.layer = format.createLayer(capabilities, {
              layer: source.layerName,
              matrixSet: source.matrixSet,
              format: "image/png",
              opacity: source.opacity ?? opacity,
              isBaseLayer: false,
              requestEncoding: source.requestEncoding ?? "KVP",
            });

            uWaze.map.addLayer(source.layer);
            uWaze.map.setLayerIndex(source.layer, 3);

            // Check if layer was active previously
            if (localStorage[source.unique]) {
              source.layer.setVisibility(localStorage[source.unique] == "true");
            }

            // Make checkbox and add to "display" section
            let toggleEntry = $("<li></li>");
            let checkbox = $("<wz-checkbox></wz-checkbox>", {
              id: source.id,
              class: "hydrated",
              disabled: !displayGroupSelector.prop("checked"),
              checked: source.layer.getVisibility(),
              text: source.name,
            });

            toggleEntry.append(checkbox);
            displayGroup.append(toggleEntry);

            checkbox.on("click", function (e) {
              source.layer.setVisibility(e.target.checked);
              localStorage[source.unique] = source.layer.getVisibility();
            });

            displayGroupSelector.on("click", function (e) {
              source.layer.setVisibility(
                e.target.checked && checkbox.prop("checked")
              );
              checkbox.prop("disabled", !e.target.checked);
              localStorage[source.unique] = source.layer.getVisibility();
            });

            console.log(
              `Geoportal Layer ${index + 1}/${sources.length}: ${
                source.name
              } loaded`
            );
          },
          onerror: (response) => {
            console.error(
              `Failed to load Geoportal Layer ${index + 1}/${sources.length}: ${
                source.name
              }`
            );
          },
          ontimeout: (response) => {
            console.error(
              `Request to Geoportal Layer ${index + 1}/${sources.length}: ${
                source.name
              } timed out`
            );
          },
        });
      });
    }
  }

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

    // Add event listeners to the opacity control
    $(".opacity-plus").on("click", function () {
      opacity = Math.min(opacity + 0.1, 1);
      localStorage.setItem("geoportal_opacity", opacity);
      sources.forEach((source) => {
        try {
          source.layer.setOpacity(opacity);
        } catch (e) {
          console.error(`Failed to set opacity for ${source.name}`);
        }
      });
    });

    $(".opacity-minus").on("click", function () {
      opacity = Math.max(opacity - 0.1, 0);
      localStorage.setItem("geoportal_opacity", opacity);
      sources.forEach((source) => {
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
