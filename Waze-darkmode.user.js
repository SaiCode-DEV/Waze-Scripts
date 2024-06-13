// ==UserScript==
// @name            Waze Darkmode
// @name:de         Waze Darkmode (schön augen schonen)
// @namespace       https://github.com/SaiCode-DEV
// @version         0.72
// @description     A darkmode for WME / Waze
// @description:de  Dunkler Modus für WME / Waze
// @author          SaiCode
// @match           /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @match           https://www.waze.com/*
// @icon            https://www.google.com/s2/favicons?sz=64&domain=waze.com
// @grant           GM_addStyle
// @license         MIT
// @run-at          document-start
// @downloadURL     https://github.com/SaiCode-DEV/Waze-Scripts/raw/main/Waze-darkmode.user.js
// @updateURL       https://github.com/SaiCode-DEV/Waze-Scripts/raw/main/Waze-darkmode.user.js
// ==/UserScript==

GM_addStyle(`


p {
  color: #aaa !important;
}

  .transaction-header:hover {
  background-color: #222 !important;
}

h2 {
  color: #fff !important;
}

WWSUFooter a {
  color: #6fc1e6 !important;
}

#WWSU-Container {
  background-color: #111 !important;
}

#WWSU-script-update-info {
  background-color: #222 !important;
}

.add-opening-hour .section {
  background-color: #222 !important;
}

#app-head wz-header #left-app-head #logo-and-env #waze-logo {
  filter: invert(1);
}

.dialog-lightbox nav button {
  margin: 0 auto;
  outline: 0;
  border: 3px solid #1a1a1a;
  border-radius: 10px;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, #2f2f2f),
    color-stop(50%, #2f2f2f),
    color-stop(50%, #1a1a1a),
    color-stop(100%, #1a1a1a)
  );
  padding: 3px;
  color: #fff;
}

.dialog-lightbox nav button:hover:enabled {
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, #0077b6),
    color-stop(50%, #0077b6),
    color-stop(50%, #023e8a),
    color-stop(100%, #023e8a)
  );
  cursor: pointer;
  color: #fff;
}

[dir] .wz-footer {
  background-color: #333 !important;
}

[dir] .wz-nav {
  background-color: #333 !important;
}

.form-control {
  background-color: #333 !important;
  color: #d6dae7 !important;
}

.form-search .search-query {
  background-color: #222 !important;
  color: #89c4ff !important;
}

.form-search input.search-query::placeholder {
  color: #666 !important;
}

#header {
  border-bottom: 2px solid #50c9f2 !important;
  background-color: #11242a !important;
}

#header .user-avatar {
  color: #6fc1e6 !important;
}

#header .user-headline .header-info {
  background-color: #2c484f !important;
}

.house-number-marker {
  background: #353535 !important;
}

#issue-tracker-filter-region {
  background-color: #111 !important;
}

.issues-tracker-wrapper .issues-tracker-footer {
  background-color: #111 !important;
}

div[class^="changesLog--"] {
  --wz-tooltip-content-background-color: #222 !important;
  color: #eee !important;
}

.layer-switcher .menu {
  background-color: #111 !important;
}

.layer-switcher .menu > .title {
  color: #eee !important;
}

.ls-link:hover {
  background-color: #333 !important;
}

.ls-modal {
  background-color: #111 !important;
  color: #d6dae7 !important;
}

.modal-content {
  background-color: #111 !important;
}

body {
  color: #fff !important;
}

body {
  background-color: var(--background_default) !important;
}

.panel.panel--to-be-deprecated > * {
  background-color: #222 !important;
}

#password {
  background-color: #333 !important;
  color: #d6dae7 !important;
}

#recent-edits .recent-edits-list .recent-edits-list-header {
  background-color: #111 !important;
}

#recent-edits .recent-edits-list .recent-edits-list-items .transaction-header {
  background-color: #111 !important;
}

#recent-edits .recent-edits-list .recent-edits-load-more {
  background-color: #111 !important;
}

#recent-edits .recent-edits-map .map {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}

:root {
  --background_default: #0e0e0e !important;
  --background_variant: #222 !important;
  --content_default: #a7a7a7 !important;
  --surface_default: #1e1e1e !important;
  --surface_variant: #333 !important;
  --surface_variant_blue: #003a5e !important;
  --surface_variant_green: #003f10 !important;
  --surface_variant_orange: #421200 !important;
  --surface_variant_purple: #2e0042 !important;
  --surface_variant_red: #420000 !important;
  --surface_variant_yellow: #565201 !important;
  --content_p1: #d6dae7 !important;
  --content_p2: #bbb !important;
  --content_p3: #666 !important;
}

#sidebar {
  background-color: #111 !important;
}

#tutorial-dialog .modal-body {
  background-image: linear-gradient(-179deg, #222 0%, #313131 100%);
}

#username {
  background-color: #333 !important;
  color: #d6dae7 !important;
}

.welcome_popup_container--MpGOT {
  background-color: #111 !important;
}

.welcome_popup_image--SSxnF {
  filter: brightness(93.2%) invert(1) hue-rotate(180deg);
}

.wm-card.is-routing {
  background-color: #111 !important;
}

.wm-map__leaflet {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}

.wm-routes {
  border-top: 8px solid #222 !important;
  background-color: #111 !important;
}

.wm-routes-item-desktop.is-active {
  background-color: #222 !important;
}

.wm-routes-item-desktop__header {
  color: #fff !important;
}

.wm-routes__header {
  background-color: #111 !important;
}

.wm-routing-actions {
  background-color: #111 !important;
}

.wm-routing-poi {
  border-top: 8px solid #222 !important;
  background-color: #111 !important;
}

.wm-routing-poi-card section.wide:last-child {
  background-color: #111 !important;
}

.wm-routing-schedule {
  background-color: #111 !important;
}

.wm-routing-schedule .wz-react-dropdown__head {
  color: #d6dae7 !important;
}

.wm-routing-status {
  border-top: 8px solid #222 !important;
  background-color: #111 !important;
}

.wm-routing__sticky-delimeter {
  background-color: #333 !important;
}

.wm-routing__title {
  background-color: #111 !important;
  color: #d6dae7 !important;
}

.wm-search__secondary {
  color: #bbb !important;
}

.wz-cc-container {
  background-color: #333 !important;
  color: #d6dae7 !important;
}

.wz-footer-meta-logo {
  filter: invert(1);
}

.wz-footer-meta-social-link-container {
  filter: invert(1);
}

.wz-footer-meta-social-link-container::marker {
  opacity: 0;
}

.wz-map-ol-control-mouse-position {
  color: #eee !important;
}

.wz-map-ol-footer {
  background-color: #111 !important;
}

.wz-react-dropdown__head::after {
  border-top-color: #d6dae7 !important;
}

.wz-search-from-to {
  background-color: #111 !important;
}

.wz-search-from-to .wm-search .wm-search__selected {
  background-color: #333 !important;
}

.wz-search-from-to .wm-search__primary {
  color: #d7def2 !important;
}

.wz-sidebar {
  background-color: #111 !important;
}

.wz-sidebar-toggle-label {
  color: #ddd !important;
}

.wz-tabs__button {
  color: #d6dae7 !important;
}

.wz-tooltip-content-holder {
  background-color: #222 !important;
}

.wz-venue h6 {
  color: #c8cee1 !important;
}

`);
