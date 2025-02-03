/* global W */
/* global $ */

// ==UserScript==
// @name         WME Quick HN
// @description  Quick House Numbers
// @version      0.12
// @author       Vinkoy
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor.*$/
// @namespace    https://greasyfork.org/en/scripts/21378-wme-quick-hn
// @grant        none
// ==/UserScript==

(function main() {
  "use strict";

  let counter = 0;
  let interval = 1;

  function quickHN_bootstrap() {
    let oWaze = W;
    let oI18n = I18n;

    if (typeof unsafeWindow !== "undefined") {
      oWaze = unsafeWindow.W;
      oI18n = unsafeWindow.I18n;
    }

    if (typeof oWaze === "undefined") {
      setTimeout(quickHN_bootstrap, 500);
      return;
    }
    if (typeof oWaze.map === "undefined") {
      setTimeout(quickHN_bootstrap, 500);
      return;
    }
    if (typeof oWaze.selectionManager === "undefined") {
      setTimeout(quickHN_bootstrap, 500);
      return;
    }
    if (typeof oI18n === "undefined") {
      setTimeout(quickHN_bootstrap, 500);
      return;
    }
    if (typeof oI18n.translations === "undefined") {
      setTimeout(quickHN_bootstrap, 500);
      return;
    }

    oWaze.selectionManager.events.register("selectionchanged", null, addTab);

    setTimeout(initialiseQuickHN, 999);
  }

  function initialiseQuickHN() {
    let editPanelChange = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          if (
            mutation.addedNodes[i].nodeType === Node.ELEMENT_NODE &&
            mutation.addedNodes[i].querySelector("div.selection")
          ) {
            addTab();
            if (document.getElementById("WME-Quick-HN")) localDataManager();
          }
        }
      });
    });
    editPanelChange.observe(document.getElementById("edit-panel"), {
      childList: true,
      subtree: true,
    });

    let hnWindowShow = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type == "childList") {
          $(".sidebar-layout > .overlay").remove();
        }
      });
    });
    hnWindowShow.observe(document.getElementById("map-lightbox"), {
      childList: true,
      subtree: true,
    });

    I18n.translations[I18n.locale].keyboard_shortcuts.groups[
      "default"
    ].members.WME_QHN_newHN = "New HN (+1)";
    W.accelerators.addAction("WME_QHN_newHN", { group: "default" });
    W.accelerators.events.register("WME_QHN_newHN", null, addHN);
    W.accelerators._registerShortcuts({ t: "WME_QHN_newHN" });

    I18n.translations[I18n.locale].keyboard_shortcuts.groups[
      "default"
    ].members.WME_QHN_newHN2 = "New HN (+2)";
    W.accelerators.addAction("WME_QHN_newHN2", { group: "default" });
    W.accelerators.events.register("WME_QHN_newHN2", null, addHN2);
    W.accelerators._registerShortcuts({ r: "WME_QHN_newHN2" });

    I18n.translations[I18n.locale].keyboard_shortcuts.groups[
      "default"
    ].members.WME_QHN_newHN3 = "New HN (+CUSTOM_VALUE)";
    W.accelerators.addAction("WME_QHN_newHN3", { group: "default" });
    W.accelerators.events.register("WME_QHN_newHN3", null, addHN3);
    W.accelerators._registerShortcuts({ e: "WME_QHN_newHN3" });
  }

  function localDataManager() {
    // restore saved settings
    if (localStorage.WMEquickHN) {
      options = JSON.parse(localStorage.WMEquickHN);
      if (options[1] !== undefined)
        document.getElementById("_custominterval").value = options[1];
      else document.getElementById("_custominterval").value = 4;
    } else {
      document.getElementById("_custominterval").value = 4;
    }
    // overload the WME exit function
    wme_saveQuickHNOptions = function () {
      if (localStorage) {
        let options = [];

        // preserve previous options which may get lost after logout
        if (localStorage.WMEquickHN)
          options = JSON.parse(localStorage.WMEquickHN);

        options[1] = document.getElementById("_custominterval").value;

        localStorage.WMEquickHN = JSON.stringify(options);
      }
    };
    document.getElementById("_custominterval").onchange =
      wme_saveQuickHNOptions;
    window.addEventListener("beforeunload", wme_saveQuickHNOptions, false);
  }

  function addTab() {
    if (
      !document.getElementById("WME-Quick-HN") &&
      W.selectionManager.getSelectedFeatures().length > 0 &&
      W.selectionManager.getSelectedFeatures()[0].model.type === "segment"
    ) {
      let btnSection = document.createElement("div");
      btnSection.id = "WME-Quick-HN";
      let userTabs = document.getElementById("edit-panel");
      if (!(userTabs && getElementsByClassName("nav-tabs", userTabs))) return;

      let navTabs = getElementsByClassName("nav-tabs", userTabs)[0];
      if (typeof navTabs !== "undefined") {
        if (!getElementsByClassName("tab-content", userTabs)) return;

        let tabContent = getElementsByClassName("tab-content", userTabs)[0];

        if (typeof tabContent !== "undefined") {
          newtab = document.createElement("li");
          newtab.innerHTML =
            '<a href="#WME-Quick-HN" id="wmequickhn" data-toggle="tab">Quick HN</a>';
          navTabs.appendChild(newtab);

          btnSection.innerHTML =
            '<div class="form-group">' +
            "<h4>&nbsp;Quick House Numbers&nbsp;<sup>" +
            GM_info.script.version +
            "</sup>&nbsp;</h4>" +
            "</br>" +
            '<div title="House number"><b>House number </b><input type="number" id="_housenumber" style="width: 60px;"/></div>' +
            "<div>Press <b>T</b> to add <u>HN +1</u> <i>(1,2,3...)</i></div>" +
            "<div>Press <b>R</b> to add <u>HN +2</u> <i>(1,3,5... or 2,4,6...)</i></div>" +
            '<div>Press <b>E</b> to add <u>HN +</u><input type="number" id="_custominterval" style="width: 42px;margin-left: 6px;height: 22px;"></div>';

          btnSection.className = "tab-pane";
          tabContent.appendChild(btnSection);
        } else {
          btnSection.id = "";
        }
      } else {
        btnSection.id = "";
      }

      document.getElementById("_housenumber").value = counter + 1;
      document.getElementById("_housenumber").onchange = function () {
        counter = document.getElementById("_housenumber").value - 1;
      };
    }
  }

  function getElementsByClassName(classname, node) {
    if (!node) node = document.getElementsByTagName("body")[0];
    let a = [];
    let re = new RegExp("\\b" + classname + "\\b");
    let els = node.getElementsByTagName("*");
    for (let i = 0, j = els.length; i < j; i++)
      if (re.test(els[i].className)) a.push(els[i]);
    return a;
  }

  function addHN() {
    interval = 1;
    setFocus();
  }

  function addHN2() {
    interval = 2;
    setFocus();
  }

  function addHN3() {
    interval = document.getElementById("_custominterval").value;
    setFocus();
  }

  function setFocus() {
    $("#toolbar .add-house-number").click();
    $("#toolbar .add-house-number").click();
    let hn = getElementsByClassName("number");
    for (i = 0; i < hn.length; i++) {
      hn[i].onfocus = function () {
        sethn();
      };
    }
  }

  function sethn() {
    let hn = $(
      'div.olLayerDiv.house-numbers-layer div.house-number div.content.active:not(".new") input.number'
    );
    if (
      hn[0].placeholder ==
      I18n.translations[I18n.locale].edit.segment.house_numbers.no_number &&
      hn.val() === ""
    ) {
      counter = +counter + +interval;
      if (document.getElementById("_housenumber") !== null)
        document.getElementById("_housenumber").value = counter + 1;
      hn.val(counter).change();
      $("div#WazeMap").focus();
    }
  }

  quickHN_bootstrap();
})();
