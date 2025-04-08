// ==UserScript==
// @name            Waze Darkmode
// @name:de         Waze Darkmode (schön augen schonen)
// @namespace       https://github.com/SaiCode-DEV
// @version         0.76
// @description     A darkmode for WME / Waze with improved contrast and dark gray tones
// @description:de  Dunkler Modus für WME / Waze mit verbessertem Kontrast und dunkelgrauen Tönen
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
  color: #cccccc !important;
}

h2 {
  color: var(--text-color) !important;
}

.ToolboxMeasurementTool {
  background-color: #2a2a2a !important;
}

.ToolboxMeasurementTool .header {
  background-color: #1a5566 !important;
}

#WMETB_Clear_Road_Geometry {
  filter: brightness(1.3);
}

#WMETB_CreateJunctions {
  filter: invert(0.9);
}

#WMETB_NavBar {
  background-color: rgba(40, 40, 45, 0.95) !important;
  color: var(--text-color) !important;
  opacity: 1;
}

WWSUFooter a {
  color: #7fd1f6 !important;
}

#WWSU-Container {
  background-color: var(--background_default) !important;
}

#WWSU-script-update-info {
  background-color: #2a2a2a !important;
}

.add-opening-hour .section {
  background-color: #2a2a2a !important;
}

#app-head wz-header #left-app-head #logo-and-env #waze-logo {
  filter: invert(0.9);
}

.dialog-lightbox nav button {
  margin: 0 auto;
  outline: 0;
  border: 3px solid #222222;
  border-radius: 10px;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, #3a3a3a),
    color-stop(50%, #3a3a3a),
    color-stop(50%, #2a2a2a),
    color-stop(100%, #2a2a2a)
  );
  padding: 3px;
  color: var(--text-color);
}

.dialog-lightbox nav button:hover:enabled {
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, #0088cc),
    color-stop(50%, #0088cc),
    color-stop(50%, #0055aa),
    color-stop(100%, #0055aa)
  );
  cursor: pointer;
  color: var(--text-color);
}

[dir] .wz-footer {
  background-color: #2e2e2e !important;
}

[dir] .wz-nav {
  background-color: #2e2e2e !important;
}

.form-control {
  background-color: #383838 !important;
  color: #e6eaf7 !important;
}

.form-search .search-query {
  background-color: #2a2a2a !important;
  color: #99d4ff !important;
}

.form-search input.search-query::placeholder {
  color: #999 !important;
}

#header {
  border-bottom: 2px solid #60d9ff !important;
  background-color: #1a3038 !important;
}

#header .user-avatar {
  color: #7fd1f6 !important;
}

#header .user-headline .header-info {
  background-color: #345863 !important;
}

.house-number-marker {
  background: #454545 !important;
}

#issue-tracker-filter-region {
  background-color: var(--background_default) !important;
}

.issues-tracker-wrapper .issues-tracker-footer {
  background-color: var(--background_default) !important;
}

div.c2821834349 > input:checked + label {
  background-color: #3e3e3e !important;
}

div.c2821834349 > input:enabled + label:hover {
  background-color: #4a4a4a !important;
}

div.c2821834349 > label {
  background-color: #2a2a2a !important;
}

div.c2952996808 {
  background-color: #2a2a2a !important;
}

div[class^="changesLog--"] {
  --wz-tooltip-content-background-color: #2a2a2a !important;
  color: #f5f5f5 !important;
}

#jaOptions .disabled::after {
  color: rgba(60, 60, 60, 0.67) !important;
}

.layer-switcher .menu {
  background-color: var(--background_default) !important;
}

.layer-switcher .menu > .title {
  color: #f5f5f5 !important;
}

.ls-link:hover {
  background-color: #3e3e3e !important;
}

.ls-modal {
  background-color: var(--background_default) !important;
  color: #e6eaf7 !important;
}

.modal-content {
  background-color: var(--background_default) !important;
}

body {
  color: var(--text-color) !important;
  background-color: var(--background_default) !important;
}

.panel.panel--to-be-deprecated > * {
  background-color: #2a2a2a !important;
}

#password {
  background-color: #383838 !important;
  color: #e6eaf7 !important;
}

#ptsm-Allgem {
  color: #c4ffff !important;
}

#ptsm-Baustell {
  color: #4df1c9 !important;
}

#ptsm-Bilder {
  color: #66ff66 !important;
}

#ptsm-Blitzer {
  color: #66ffff !important;
}

#ptsm-GeoPort {
  color: #baceff !important;
}

#ptsm-Misc {
  color: #ff55ca !important;
}

#recent-edits .recent-edits-list .recent-edits-list-header {
  background-color: var(--background_default) !important;
}

#recent-edits .recent-edits-list .recent-edits-list-items .transaction-header {
  background-color: var(--background_default) !important;
}

#recent-edits .recent-edits-list .recent-edits-load-more {
  background-color: var(--background_default) !important;
}

#recent-edits .recent-edits-map .map {
  filter: invert(95%) hue-rotate(180deg) brightness(85%) contrast(95%);
}

:root {
  --background_default: #1e1e1e !important;
  --background_variant: #2a2a2a !important;
  --content_default: #c7c7c7 !important;
  --surface_default: #2e2e2e !important;
  --surface_variant: #3a3a3a !important;
  --surface_variant_blue: #124a6e !important;
  --surface_variant_green: #124f20 !important;
  --surface_variant_orange: #522210 !important;
  --surface_variant_purple: #3e1052 !important;
  --surface_variant_red: #521010 !important;
  --surface_variant_yellow: #666211 !important;
  --surface_alt: #2e3132 !important;
  --text-color: #f0f0f0 !important;
  --content_p1: #e6eaf7 !important;
  --content_p2: #cccccc !important;
  --content_p3: #999999 !important;
}

#sidebar {
  background-color: var(--background_default) !important;
}

#sidebar .nav-tabs {
  background: #2a2a2a !important;
}

#sidebar .nav-tabs li a {
  color: #eee !important;
}

#sidebar .nav-tabs li.active a {
  background: #3e3e3e !important;
}

#sidepanel-ptsm button {
  background-color: #2a2a2a !important;
}

.tb-feature-label-image {
  filter: invert(0.9);
}

.tb-tab-tab {
  background-color: #2a2a2a !important;
}

.tb-tab-tab.active {
  background-color: #3e3e3e !important;
}

.tb-tabContainer {
  background-color: var(--background_default) !important;
}

.transaction-header:hover {
  background-color: #2a2a2a !important;
}

#tutorial-dialog .modal-body {
  background-image: linear-gradient(-179deg, #2a2a2a 0%, #3e3e3e 100%);
}

#username {
  background-color: #383838 !important;
  color: #e6eaf7 !important;
}

.welcome_popup_container--MpGOT {
  background-color: var(--background_default) !important;
}

.welcome_popup_image--SSxnF {
  filter: brightness(90%) invert(0.9) hue-rotate(180deg);
}

.wm-card.is-routing {
  background-color: var(--background_default) !important;
}

.wm-map__leaflet {
  filter: invert(95%) hue-rotate(180deg) brightness(85%) contrast(95%);
}

.wm-routes {
  border-top: 8px solid #2a2a2a !important;
  background-color: var(--background_default) !important;
}

.wm-routes-item-desktop.is-active {
  background-color: #2a2a2a !important;
}

.wm-routes-item-desktop__header {
  color: var(--text-color) !important;
}

.wm-routes__header {
  background-color: var(--background_default) !important;
}

.wm-routing-actions {
  background-color: var(--background_default) !important;
}

.wm-routing-poi {
  border-top: 8px solid #2a2a2a !important;
  background-color: var(--background_default) !important;
}

.wm-routing-poi-card section.wide:last-child {
  background-color: var(--background_default) !important;
}

.wm-routing-schedule {
  background-color: var(--background_default) !important;
}

.wm-routing-schedule .wz-react-dropdown__head {
  color: #e6eaf7 !important;
}

.wm-routing-status {
  border-top: 8px solid #2a2a2a !important;
  background-color: var(--background_default) !important;
}

.wm-routing__sticky-delimeter {
  background-color: #3e3e3e !important;
}

.wm-routing__title {
  background-color: var(--background_default) !important;
  color: #e6eaf7 !important;
}

.wm-search__secondary {
  color: #cccccc !important;
}

.wz-button.shadowed {
  background-color: #2a2a2a !important;
}

.wz-cc-container {
  background-color: #3e3e3e !important;
  color: #e6eaf7 !important;
}

.wz-footer-meta-logo {
  filter: invert(0.9);
}

.wz-footer-meta-social-link-container {
  filter: invert(0.9);
}

.wz-footer-meta-social-link-container::marker {
  opacity: 0;
}

.wz-map-ol-control-mouse-position {
  color: #f5f5f5 !important;
}

.wz-map-ol-footer {
  background-color: var(--background_default) !important;
}

.wz-react-dropdown__head::after {
  border-top-color: #e6eaf7 !important;
}

.wz-search-from-to {
  background-color: var(--background_default) !important;
}

.wz-search-from-to .wm-search .wm-search__selected {
  background-color: #3e3e3e !important;
}

.wz-search-from-to .wm-search__primary {
  color: #e7eeff !important;
}

.wz-sidebar {
  background-color: var(--background_default) !important;
}

.wz-sidebar-toggle-label {
  color: #eee !important;
}

.wz-tabs__button {
  color: #e6eaf7 !important;
}

.wz-tooltip-content-holder {
  background-color: #2a2a2a !important;
}

.wz-venue h6 {
  color: #d8def1 !important;
}

#RAUtilWindow {
  background-color: var(--background_default) !important;
}

#rotationAmount,
#shiftAmount {
  background-color: #383838 !important;
  color: #e6eaf7 !important;
}

div.c3584528711 > span {
  background-color: rgb(77, 77, 39) !important;
}

div.c3336571891 > span {
  background-color: rgb(16, 71, 16) !important;
}

div.note {
  background-color: #20202C !important;
}
div.note a {
  color: #1c8bc0 !important;
}
div.note a:visited {
  color: #20af20 !important;
}

img#slackPermalink {
  filter: invert(0.9);
}

.restrictions-summary .restrictions-table th {
  background: #104352 !important;
}

.restrictions-summary .restrictions-table tr {
  background-color: #2a2a2a !important;
}

.restrictions-summary .restriction-list-item:hover td {
  background: #3e3e3e !important;
}

.restriction-editing-region .restriction-editing-section .restriction-editing-container {
  background-color: #2a2a2a !important;
}

#WazeMap .snapshot-message .snapshot-mode-message {
  background-color: var(--background_default) !important;
}

.container--wzXTu {
  background-color: var(--background_default) !important;
  display: none;
}

#abAlerts {
  background-color: var(--background_default) !important;
  box-shadow: var(--background_default) 5px 5px 10px !important;
  border-color: #3e3e3e !important;
}

#sidebar {
  color: var(--text-color) !important;
}

.toolbar .toolbar-button {
  color: var(--content_p1) !important;
}

.layer-switcher .layer-switcher-toggler-tree-category > .label-text {
  color: var(--text-color) !important;
}

`);
