// ==UserScript==
// @name                WME Fix UI SaiCode Edition
// @namespace           https://greasyfork.org/en/scripts/435828-wme-fix-ui-memorial-edition
// @description         Allows alterations to the WME UI to fix things screwed up or ignored by Waze
// @include             /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @supportURL          https://www.waze.com/forum/viewtopic.php?t=334618
// @version             1.63.257
// @grant           		GM_addStyle
// ==/UserScript==

/*
SaiCode Edition thanks:
 SaiCode :)

Memorial Edition thanks:
 phuz, fuji2086, Timbones, laurenthembprd, jm6087, BeastlyHaz
 
Original version thanks:
 Bellhouse, Twister-UK, Timbones, Dave2084, Rickzabel, Glodenox,
 JJohnston84, SAR85, Cardyin, JustinS83, berestovskyy, Sebiseba,
 The_Cre8r, ABelter

=======================================================================================================================
Bug fixes - MUST BE CLEARED BEFORE RELEASE
=======================================================================================================================

*/

/* JSHint Directives */
/* globals $ */
/* globals W: true */
/* globals I18n */
/* globals OpenLayers: true */
/* globals trustedTypes */
/* globals ResizeObserver */
/* globals jQuery */
/* jshint esversion: 11 */

;(function main() {
  "use strict"

  // global variables
  const FUME_VERSION = "1.63.257"
  const FUME_DATE = "2024-05-07"
  const newVersionNotes = ["Compatibility fix for latest WME release..."]

  const PREFIX = "WMEFUME"
  const DEFAULT_OPTIONS = {
    oldVersion: "0.0",
    moveZoomBar: true,
    shrinkTopBars: true,
    restyleSidePanel: true,
    restyleReports: true,
    enhanceChat: true,
    narrowSidePanel: false,
    arialShiftX: 0,
    arialShiftY: 0,
    arialOpacity: 100,
    arialShiftXO: 0,
    arialShiftYO: 0,
    arialOpacityO: 100,
    fixExternalProviders: true,
    GSVContrast: 100,
    GSVBrightness: 100,
    GSVInvert: false,
    GSVWidth: 50,
    restyleLayersMenu: true,
    layers2Cols: false,
    moveChatIcon: true,
    highlightInvisible: true,
    darkenSaveLayer: true,
    layersMenuMore: true,
    UIContrast: 1,
    UICompression: 1,
    swapRoadsGPS: true,
    showMapBlockers: true,
    tameLockedSegmentMsg: false,
    hideSegmentPanelLabels: false,
    tameSegmentTypeMenu: false,
    tameElevationMenu: false,
    removeRoutingReminder: false,
    reEnableSidePanel: false,
    disableBridgeButton: true,
    disablePathButton: false,
    ISODates: true,
    mondayFirst: false,
    disableKinetic: false,
    disableScrollZoom: false,
    disableAnimatedZoom: false,
    disableUITransitions: false,
    disableSaveBlocker: false,
    colourBlindTurns: false,
    hideMenuLabels: false,
    unfloatButtons: false,
    moveUserInfo: false,
    hackGSVHandle: false,
    enlargeGeoNodes: false,
    geoNodeSize: 8,
    enlargeGeoHandles: false,
    geoHandleSize: 6,
    enlargePointMCs: false,
    pointMCScale: 1,
    resizeSearchBox: false,
    theme: "system",
  }

  let options
  const debug = true
  let wmeFUinitialising = true
  let kineticDragParams
  let yslider
  let layersButton
  let refreshButton
  let shareButton
  let zliResizeObserver = null

  let killTurnPopup = false

  let abAlerts = null
  const abAlertBoxStack = []
  let abAlertBoxTickAction = null
  let abAlertBoxCrossAction = null
  let abAlertBoxInUse = false

  function abAlertBoxObj(
    headericon,
    title,
    content,
    hasCross,
    tickText,
    crossText,
    tickAction,
    crossAction,
  ) {
    this.headericon = headericon
    this.title = title
    this.content = content
    this.hasCross = hasCross
    this.tickText = tickText
    this.crossText = crossText
    this.tickAction = tickAction
    this.crossAction = crossAction
  }
  function abCloseAlertBox() {
    $("#abAlerts").fadeOut(250, () => {
      document.getElementById("abAlerts").childNodes[0].innerHTML =
        modifyHTML("")
      document.getElementById("abAlerts").childNodes[1].innerHTML =
        modifyHTML("")
      document.getElementById("abAlertTickBtnCaption").innerHTML =
        modifyHTML("")
      document.getElementById("abAlertCrossBtnCaption").innerHTML =
        modifyHTML("")
      abAlertBoxTickAction = null
      abAlertBoxCrossAction = null
      $("#abAlertCrossBtn").hide()
      abAlertBoxInUse = false
      if (abAlertBoxStack.length > 0) {
        abBuildAlertBoxFromStack()
      }
    })
  }
  function abCloseAlertBoxWithTick() {
    if (typeof abAlertBoxTickAction === "function") {
      abAlertBoxTickAction()
    }
    abCloseAlertBox()
  }
  function abCloseAlertBoxWithCross() {
    if (typeof abAlertBoxCrossAction === "function") {
      abAlertBoxCrossAction()
    }
    abCloseAlertBox()
  }
  function abShowAlertBox(
    headericon,
    title,
    content,
    hasCross,
    tickText,
    crossText,
    tickAction,
    crossAction,
  ) {
    abAlertBoxStack.push(
      new abAlertBoxObj(
        headericon,
        title,
        content,
        hasCross,
        tickText,
        crossText,
        tickAction,
        crossAction,
      ),
    )
    if (abAlertBoxInUse === false) {
      abBuildAlertBoxFromStack()
    }
  }
  function abBuildAlertBoxFromStack() {
    const tbIcon =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAPdXpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjapZhpciu7coT/YxVeAuZhORgjvAMv31+iW7Skc/xeXFuUSKrZxFCVlZkFs//rP4/5D36idd7EVGpuOVt+YovNd95U+/z0++xsvM/3x78f8f+P6+bzgedS4DU8/9b83v913X0GeF4679K3gep8Pxg/P2jxHb/+GuidKGhFWsV6B2rvQME/H7h3gP5sy+ZWy/ctjP28rq+d1OfP6CmUZ+tfg/z+PxaitxIXg/c7uGB5DuFdQNBfMKHzJtznyo16dN3EcwrtXQkB+VucPj/cZ46WGv9604+sfN65v183v7MV/XtL+BXk/Hn963Xj0t+zckP/beZY33f+5/W07X5W9Cv6+jtn1XP3zC56zIQ6v5v62sp9x32DKTR1NSwt28JfYohyH41HBdWTrC077eAxXXOedB0X3XLdHbfv63STJUa/jS+88X76cC/WUHzzk6y5EPVwx5fQwgqVJM+b9hj8Zy3uTtvsNHe2yszLcat3DOb4yj9+mH/6hXNUCs7Z+okV6/JewWYZypyeuY2MuPMGNd0Afz1+/yivgQwmRVkl0gjseIYYyf0PE4Sb6MCNidenXFxZ7wCEiKkTi3GBDJA1F5LLzhbvi3MEspKgztJ9iH6QAZeSXyzSxxAyuaGSmJqvFHdv9clz2XAdMiMTKeRQyE0LnWTFmMBPiRUM9RRSTCnlVFJNLfUccswp51yySLGXUKIpqeRSSi2t9BpqrKnmWmqtrfbmW4A0U8uttNpa6505OyN3vt25offhRxhxJDPyKKOONvoEPjPONPMss842+/IrLPhj5VVWXW317TZQ2nGnnXfZdbfdD1A7wZx40smnnHra6Z+svWn94/EPsuberPmbKd1YPlnjailfQzjRSVLOSBgq4sh4UQoAtFfObHUxemVOObMN+gvJs8iknC2njJHBuJ1Px33lzvgno8rc/ytvpsQfefP/18wZpe4fZu7PvP0ta0syNG/GnipUUG2g+vh81+5rl9j98Wr82Kv1E0awc4bd2xx7r33KHnn1teMZjWX1tJc/vR0KqqxBxFziS/XMclY+rZjF1a73Y41Z9+gpDjZwktVkfswT8vMW2vT/akV6E/uprbM2IjmWnwO0spkUN5vmdxTiuMoBHp2grp5GCtun7u93+HI2YyPJDq7v64QyiHsavC3jNDdbIlfUUu6OvWBcus/xeSsd/v5qvl0g6G2l2pl75hwOVM+Q/tzRzx29NLdbcrWQ8ZPI9DN+m8nUdAdiH06Q67kldCPF2UkwEcqjk2FX2ibUdpccVtuN2PncWlrhKKAkx8yAgDEPq6inNHB2bOolua877g0sIRGhtXc7aTtG2KmAr0lZEC/fotlMcmLKZbH6HXOfuVJQSq//7Br0I2jr5n31A43uWcqKpw2yvvZa2fDZWWW0tkA8WAE7HVTH8+x+dbeL/b79+6ohoXIQf1xrlYCaPcqFYF9AsDD4jgWP08OexHdvFxXQtAvW5vt4mUEiRY7VSzusZNjzXMzgN1KJEhcttpczXai7p7RG9HWRgrSIXBkTJU6d7PLZHgxbj8sk2pDSVfBj8Mqq0/XJ2g7FbSNYKGC+VGSkQqjDlWq36nudemfqggs52JSyyB/eWlTQHHOH2QuxKm99BPdBR0tvmQU4haKnmM8B3l/QNy/2y5qTnTgwmclGbU+hnxHC3PZ5mzNTUdkCai8CqhbXl1iombBZbexUQhy7v6E9YLfb37UAYDEjSZE7bILaYVIwulnKMGX3DBunPJwDAYuypIR5nefZX7WqtUPWREhjxc4NoVvoLPS9O+Hf1TnTnvmwWb7f1DCJzWMpe4WIpYOzKuxbhpuqAZYDgit5ubaE5vYAzszT1reCbtobfvknRwxA5Y+ID9Sti7p8UXd2HAPIpmSgvskH9eE9xvlJfP+W93Z43hr1Gi3hO8ACCe6k1I5qj3JZmJiVQHHVZ0z9mGPZEwUq34ktBFFWyLQxY5uZbyUUNzeRwFfgYa5E+YEprDMKz6rgFEA+VMdnqykSoDNA4qQvoatGn3ZuK2o2lte/Z7k0muwVpumoEJAeBGlSAglhG4qX1hkDZQnqMvViegaeA0if+HJ5/ACH4acKnFF420O1Ch0tyoc8xB0su/dl/INl3/Ibu1cz8AB8W8w07fEDwUL1CoF3CGIPk2QliopKzmfFHU0nUquOhb9T6gKFRJpdmEugLeqSWDSinkYA2YsFDPayc4HC2DMhDChepjuK4eSgD4J4Z8BoKOEszZbhDqUGcMnlAFERm34+14cX7fItC3PfgfwzEGxB5cMbvqTcRSbOQxADH6HEwG0rbYqM3edUK1QSt0LeXcfsG5wAYD63vlsJorGfEX/QTos70yd4v5gXTHTTJ7KkKZPo9ep7gAOrSGFSyh6OoEQavU6DbtJHWNAyPk5QPLWYsqHS0FOEmqxAKw2AJIDiG5AlNGwynZRfsWzOKsDMykctMjw4C6WSBbZWgSrl6xHZIs8ndINzaKLEQCvFVJCFvrvSgAbKMyTyqG8SuNLzUE+b3V0DkGRdsN2MXOeFTe8krZURsE/FFYICVzL5ksUnKkgTPF+mWSw+XAIgQZTvbP1Ge8tZfrmWdvH6VztzX2fu5lg2QeEeC3rpCKWSB19DIcA4TJtFiqLBsSbOp26EGNNEIwNqwEtnWbCAcezTUfYePod2y9gwMsO6y67ozSQBHnyqZIE4NBpVHGwbdkaYQN9om6ylG0nPRl2kNEfNUsBZmApDIBIKOJI0rumu6foTjNcBK+LZwtIEW9Mb24CQGY/XMLgTBzsLniPtDdKO4C5Ph1XBNMx1MBCAhIz6fg3vxSmOrcxdvwTj372S11JJOGJI+nafASLFpS9rKj09Y7GcExFvC5rEQKnit88Qo/lFMIgIzkpWpUFcXGNL4tJOrzDPTkG6RnxQKRwIM6m1SGJ5RaeOW/Yn+CFfOmgHsA1Alkohq+TE52fLHobEa2DjySsxAdVwHialdwUG5qACT1yBvGALXA6ALIKxTsmX4mkutJWAJzLl8rO8IWy252iQgcSguyo3gYxrrBwZocsf5u3xoeg7y+vD1fXC1uzk57/w4S+yB+xV7JG97uSVAmEXrI91B6oAUBtYhK1By3nIZ5/X+kDHETAgPJfoH9XYVv5AdvuyjoCB312V8YdZc7sp+dsjIIkZSQzy9/y/0Gp6n4nIoxRMLCwmuqM8Ku4FNhlHLJnFaQZVpmoW3RoKAOIQCSdTh8RX8KbrjzWW/4CzUO0x6NfOmqoieiq8ymCgDo7V+vUAxWzJaEmUqlhKXYnHjA0aJRVIHcgyGV23fdr53rZULJgGoxMprwjxPcXhoVG5RJw0ycGX4UdOVJghpz2GKoXajQOG7mydftmX2x15PFb9w0rHi1yQriHKk6l1/eqWQFAHUCbt0pyDCBxDpmSqcMRMRF/H04YtdjosSHVDeGht9f25R1UteaZOFbxXlXLIOBOcP3QC+89QqT6Ll4KtuI3yY/04l7GylViUgB8HOSywke9C3wOnwU0zy4QgR7D+9eMFhsMektywYGw4qFnyQz1YaCctSt5KQSkKeDCwtBkFU9lGR2tjKHBwu0kxDU9IHqTnhC/HBPRl1bslHM2q1OiMyDri4ZCK/aQmUoGZfg43gkcLre888bPsC2bd5zYmdGUITMtETI2FwniEM8ypmpmJfAhg6CRebDYje953HYPOQ1LNirOTk3TkbDWYsuUw/H49+roe/Z4UNBbnBQloreP8t2PpXk5quY2hC6ptpAwJgXSojRVcgV1bEC3Q+7plFVSZJ7wqzB42loy+vyEEE0DDnuKkAk9IIEiphQ5pbUldpQoWWaNYnQ4JHEZF9+x7jwcDhpvYvWCCOWwdsqRHe/mDThECo43BeYsk13Ut1v5yJfToadEcF/xSoeQIDK0Wm0BKqARMvnzUUlNA9eOSQOGkVZZVv7pIKWZfJkau7WkwqupEb89GA3FqJnpAB23YgJvUofMTrMvxIbHwyJJrPNmRma6ssJa5zZYFlu+65wfrnh+ke36AZGNBxlQLhOkuYFU1JiGhK5ZZmJifuuU98jYdXKsVDdvteq48bDrSwVdYgIhsFYfxZWfyeFA4Fjbgu6SQzE5NV0DcQXYpyhUCIIdybqNN/1dqnCzRQUbS9qEejX5pSYvRP9YCrpxEkJaYpRgda5IGggdgvV9LB6FifHCUAK3k9bmoJs1CCO3+IqybskcEUFcQRQuRslP4ikwM9d/uwUCcMgI6llkwP7thZzpmgjii7TSFx6qloFcfIBrdM319ncOwGUmD515cFeKLJtJ9v10uTZNT3HDydGbnJo4gbEkmjV3GjRBntbNl4Va+2uvo8IM6BsQuqVgBK92zk2Not20IG9G3GDL1omOfZHQI1u4hWJYPqjqkUSeGWNBCwPkYJlKgbgybIxKkQ9cpzMVWC2REznYbGgEGhzs2v3Tt+E3ywrZBFLV3NJFOPifZZGM66qq3562EVcoVVVylmkBr2g8VZi9nhye6BSlxmtqpK19JjCVGo5XotFu0bFBazJLsjLNs12cDzEkhTwqZ7odmDHWrQfYXigN+dcJDlM3MdKLtNslyroBJdouh6N4jTQ3Rx0YxSRFvkmVPEfR6zSx9Z1NTIe0TbAVWCzS6TmShw1BR5qQjjmCepqcGKKnK1WKv5hmwUEiv4V5hogNJ5Y8DQQyAlb/2AqbDcRJssmcAPzJ/VNP4rCvF7wkfPn+138L5ExUw7lq4Xn8WgJQc030tPHmiCJO0sav+MVPXm7CejYfDl2Eedpr4Sp37sWrohwUjQ5HqP5EgfSS7Up8wFyWJp/GXMIYwi/mXc4wYANQuwc7qvfGCJPNIIswu10Kyta9Gt2WohehPHZGlmPXByXaSZrqi2zZ2mq4ZET0d4LAm9AjOZlI5nCGuekJBYKkHMBSVIZur2uy9WWhU1tuyGFtuB7EyLBBZQ0WWzgZp1tT9yY52FaWUVkaCJOjMikyADkqqyEU/hyK695v7NP+L/aT5BGqtwwO7zSBHUJUWNUbHLWoH5pRg3tNX0mOkmDgVHWN5MSASsKGYC78tqp866EG7i6ArgEgmQSbBoC+BkWjvEVhTJA3I/ttUe7WTNJlS7XZVHeqmFcV2VxoLihpHVMQMTa339WCiQjU1XiSuo//XeiuLNxCpS+hwU15HUSAJprt9dH1BHccFNUmYy/wENV3ZiWpR57rnoVE1RmdGQrVJHXsWi+e6J+ZCbYn31DBY8+QA4MU/In7OWc38N1iEhwGR/v/iAAABgWlDQ1BJQ0MgcHJvZmlsZQAAeJx9kUsoRFEcxn9myCSyMAtJugusKCFZaoiUqWmM8lq4985Lzb2me0c2lsp2ysJjY7CwsWZrYauU8ijZ2lgRG+n6n5mpmWScOp1f3znf1znfAV8hY1pu/QBYds6JToW0+YVFrfEFPwGgi4Buutnw7GSMmuPzjjq13varrNrn/hwt8YRrQp0mPGZmnZzwivDIRi6reE84aKb1uPCZcJ8jFxR+ULpR4lfFqSL7VGbQiUXHhYPCWqqKjSo2044lPCzcHbdsyffNlziueFOxlVk3y/dUL2xO2HOzSpfZyRTThImgYbDOKhly9Mtqi+ISlf1QDX9H0R8RlyGuVUxxTLCGhV70o/7gd7ducmiwlNQcgoZnz3vvgcYd+M573teR530fg/8JLu2Kf60Aox+i5yta9yG0bsH5VUUzduFiG9ofs7qjFyW/TF8yCW+n8k0L0HYDTUul3sr7nNxDTLqauYb9A+hNSfZyjXcHqnv790y5vx8MNnJ+vog/WAAAD3BpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDoxYThmMWIxZS1iMDhhLTQxN2EtOThkOS02Njg1OWNmZjg0ODgiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZTQxMTMxMTUtNWJkNS00Yjg5LTg3YTUtNjQ3ZDlkNjVkN2IyIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NmM3ZjJkYmQtZGQwYS00MDNjLThiYTMtMzAyNjRlYWMxNjI4IgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjgwIgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iODAiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjc4MjM1NDcyMjM0NjU2IgogICBHSU1QOlZlcnNpb249IjIuMTAuMzAiCiAgIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiCiAgIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIKICAgdGlmZjpJbWFnZUxlbmd0aD0iODAiCiAgIHRpZmY6SW1hZ2VXaWR0aD0iODAiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiCiAgIHRpZmY6WFJlc29sdXRpb249IjcyLzEiCiAgIHRpZmY6WVJlc29sdXRpb249IjcyLzEiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTEwLTI3VDA4OjUyOjUzKzAxOjAwIgogICB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0xMC0yN1QwODo1Mjo1MyswMTowMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InByb2R1Y2VkIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZmZpbml0eSBEZXNpZ25lciAxLjEwLjMiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMTAtMjdUMDg6NTI6NTMrMDE6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZGY4YTVhMzYtZDZkYy00ZDVmLWJjMWMtMzZhNWViZWY3YzU3IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIzLTAzLTA4VDAwOjMxOjEyIi8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pv26nxYAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAwgAHwyBbZEQAAAJD0lEQVRYw5WXeXDV1RXHP/f3+70tL28LISEhJCqyBYJiosgixQqyiFoI0NoKWq1lbMVOnVE7Zcap7dQ6dKE62DrttI7iVGVzGZWS0Q6LIAghQCwQskFeyEK2917y1t9y+0ceMS9A0TNz//md+zvne+8953zPEXwNMYKVGlCIFLchWA5MAooBf3pLCGgB6oCdII8gadOKdxjXsi3+nzLVslxVhFIG4kngbmAMoF7Dpgl0AFVIXpZC1trG7TC/MQA9WJkv4GkQa4Hc4XtNU2KYEinloBEhUFWBpmaYk0A38IbE2mgbt/Pi1wJgtK4Q0hI3CSH+BlQM3zMQNTjbFOGjTy7Q06tjWoMAFEXgcSss/FYBZZMDBPx2hMgAclQi10mL4/aSHfKqAFKtK4SwxEwhxBbgxuG61vYYL/29ju27UwRG5WG3O1AUBQRYloWhG/T1djGv3OTJRydwU6kfRckwXw+ssaTxhb34PXlFAHpL5c1CiG0jnbd3xtnw4kmO1uXgD+SgKArZ7iwe+O4qbJrG21u30xsKI6UkFo2S4wryx+dKmTbZP/KCG6WUq23FO45d+qAMc56fvvYM5ynd4p9vN3L4lI9AzqjBUwPTSqewcMECZtxyC2XTpg7Fgjs7m+7YWF7+Rz39A/pIAOOFEH81WirzMwDoLctVIXg6/eYZ0tmV4IOqMIGcUYhhDxsKhzl58iRNTU3U1ddn/ON2Z7P3CJw4FbpS3FUgxNNGcIUKoA1CV8rS0Z4R6T2hJLv+00ZLh44veRGbzc6o3FwURaGuvpHnf/u7dAZoCCGGskJRFBxZfuoawsy5NTcDePrQa6UUbwLHNb1lhSYG8zx3+K7Pq7v51Z+CGOo4yitKUDWV7GwPPn8ATdMQaawSME0TXU+RSiUxDINkMoFpGPSGujBN0LTLbmG0EPxUb1nxuCYQhekiMwRTSmhojqC5JzPhhhuJRqNEwiEi4TCRcCj93l8lWboaoKgKXq+f0bn5mIaJ3d6LuGqlEUuAAg3BbekK95VKwNyZeVSfPEO48xRn6uP84L7vUFSQh9Nhx+mwY7cNHkvXDeLJJImkTiql09rRxbH/1jAQPsOds8tQ1asiGCNgtgZi+ZXK6/gSD795ZhrBthgvvHR2MCNSOslUir6wREpr2KVJhFBQFEFuwMek64sIXjyHz2MjmTRxOK5YvVUJi7Q0sVzOA7rF69ua2flhGNcNs4iMn0PK5QIgHoux5/2dTA+ATdOo7jKYf/9yXFnuQcv5cS7sNlm7/gCV9/pZt2YCDrty+SMIUa6lWe0y6epOcOy4l5tLxzP9oZ8weUY58WgUzWbD4/ejqipHt2wGYOHDP2PR6u8R6evD0HVcbjeFJSWcfcei5vgFwvenyMt1XslNoTaMUjMpzZKkUga9/TF8o3L5dOd2ar84hNvj5ZFnfwlIKpfMQ0pJi2UyEA7z2sYXiA0MUDbzdiZMm04kmiCpG1iWvFoceLSrafJynZROCfGvD9qY39vDgspVLFy5GtM0MHSDszXVLFswCafDzu73P2f23Yt5bMNzqKqGlJIzNdUcrKll1VIHPm/hVblbSzcTo0cqXE6V9Y9Owudppmrr2zhdWdjsdvRUik93bGNmwGDqxOsQCObmH+f137/IgpWrsTucpJJJdm99i8ce8LCm8npczqu2EP1aupPJAGBZktb2GDs/vsDHBzXa2/ZCTw+Rvm5mTS3kR3PKmTF1AppmA+ChysWU1zXz762b2X8yyEA8RXNTI/0zCrGsZpYvKWLsGNdIdgRoU597qnQeMP3Sl3jC5JP9HTzzhy62J7+NvugJ5rsNli69h7yAj3Ur53OiOcTRug5qzg6u2qYudKmxevFsQnoWgdGFDBiS3gc38sGeixzdXU+uJ864QjealpENH6vPPTVFgKgElETS5I1tTTxfs4DwHQ9jxWNoThcVIozX66OnuwfDNPn0WCOnG4NEEhadfVFON57nYjiFw2GnubMfUwqi4T7umXoDnkSE03eso2p/HG/fcUon+i91TibIjRpwBOgwLTn2s8MX+XPDEtxrniXVGSTa8CUyGsHn8xFPJInEdfZ92YZpSZqb6jl5YpDWPR4vPl+AvbVtQ4Tkdrvx9rdR7JQExl/HoYkb2LRFoSDvIIvmF6AookNKDmqWtNoUoVS1tsUefvHdAuF85Ak0j59UZxBpmSjJOP4iP7phDvFEdraH22fPQ9dTANhsdlRVHXIO4HA40XUdIU1+WARxI4djq57kpdcaKJsSp2hM1i4B7Yq9+F0jFEq9/NZ7rd3nZ63BPnowZTQBFR47C4tyON9yHqfTmUGrqqridLpwOl2o6uVR3tfXg5YdQLE76UpC2AR7XhEN5d9n+4etXf1R/RWteIehAKxat7/21eOlW7w3zZYIgQZMcNlYMM7DL+6fy4WWc0jLxO3O+jpjBOFwiLq4QlXxXZyWObxyAYLmIMt5y+dZrxy4/o2lD+6p5RIJnQsmZMnv3jphG1N8J0IpXO6FlfZ2mk/XsujuhZSUFLN92zs4HE6isTi6rl9xxeNxOtrbONzajbrmWRKF4zm1bxfGxBlo3sDgzTmcRyi6cX3NXzb3Z/SEtaundyqCdQLZ4FfBpYJEYiEou+VWntjwa2qzx9GEjUZd0p5K4YoHccWDdKaSNOqS86qTzilzcf18E56ptyGEILMKywZFEY+fWjuzc3glHBIniZoEzjXbw+qbB84xvrMLEvXQLwQh8zqsZT9mrs9ilN1ilIyzLF4NwEfOcroVFz0phf1hhbilXOFhZIOC9WCWFqsZWYqHZH9Ftpxb3X84YrlWt/aFXw2nREXvAEJoX7Vz+yIKcwLgdGokLD8C6Hd4uJhQOBCBkHWZZ0smYkcVrMeztFjN3pu9cmSDmCGflXvk0QrtWORQ1b32nLxNQoiu4fqQCXt6oTGmcE7No0EdQ2NUYU/voG4E4Xc5cvM3DdTsu+9IhXZspPNrDqcVVedVkTO2DMR6C2UxkH8pcB0ClrnjAHwYdZGUGcNpp8DaJZCbRbir9ou7Cr75cDpcZlUnNVOqBRIxRyIWAeVAoQretMcI0AayWiB3CzioYLQdqnBeczz/H8ZD44ipEgS5AAAAAElFTkSuQmCC"

    abAlertBoxInUse = true
    abAlertBoxTickAction = null
    abAlertBoxCrossAction = null
    let titleContent = '<span style="font-size:14px;padding:2px;">'
    // titleContent += '<i class="fa '+abAlertBoxStack[0].headericon+'"> </i>&nbsp;';
    titleContent += `<img src="${tbIcon}">`
    titleContent += abAlertBoxStack[0].title
    titleContent += "</span>"
    $("#abAlerts #header").html(titleContent)
    $("#abAlerts #content").html(abAlertBoxStack[0].content)
    document.getElementById("abAlertTickBtnCaption").innerHTML = modifyHTML(
      abAlertBoxStack[0].tickText,
    )
    if (abAlertBoxStack[0].hasCross) {
      document.getElementById("abAlertCrossBtnCaption").innerHTML = modifyHTML(
        abAlertBoxStack[0].crossText,
      )
      $("#abAlertCrossBtn").show()
      if (typeof abAlertBoxStack[0].crossAction === "function") {
        abAlertBoxCrossAction = abAlertBoxStack[0].crossAction
      }
    } else {
      $("#abAlertCrossBtn").hide()
    }
    if (typeof abAlertBoxStack[0].tickAction === "function") {
      abAlertBoxTickAction = abAlertBoxStack[0].tickAction
    }
    $("#abAlerts").fadeIn(200)
    abAlertBoxStack.shift()
  }
  function abInitialiseAlertBox() {
    // create a new div to display script alerts
    abAlerts = document.createElement("div")
    abAlerts.id = "abAlerts"

    const alertsHTML = `
    <div id="header">Alert title goes here...</div>
    <div id="content">Alert content goes here...</div>
    <div id="controls" align="center">
      <span id="abAlertTickBtn">
        <i class="fa fa-check"> </i>
        <span id="abAlertTickBtnCaption" style="font-weight: bold;"></span>
      </span>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span id="abAlertCrossBtn">
        <i class="fa fa-times"> </i>
        <span id="abAlertCrossBtnCaption" style="font-weight: bold;"></span>
      </span>
    </div>
    `
    abAlerts.innerHTML = modifyHTML(alertsHTML)
    abAlerts.style.display = "none"
    document.body.appendChild(abAlerts)
  }

  function SetStyle(elm, style, value, important) {
    if (elm !== null && elm != undefined) {
      if (important === true) {
        value += "!important"
      }
      elm.style[style] = value
    }
  }
  function modifyHTML(htmlIn) {
    if (typeof trustedTypes === "undefined") {
      return htmlIn
    }
    const escapeHTMLPolicy = trustedTypes.createPolicy("forceInner", {
      createHTML: to_escape => to_escape,
    })
    return escapeHTMLPolicy.createHTML(htmlIn)
  }
  function reorderDaysOfWeek(origDOWs) {
    const dows = []
    for (let i = 0; i < 6; ++i) {
      dows.push(origDOWs[i + 1])
    }
    dows.push(origDOWs[0])

    return dows
  }
  // contrast items
  function GetBorderContrast(contrast, isImportant) {
    let retval = `border: 1px solid ${["", "lightgrey", "grey"][contrast]}`
    if (isImportant === true) {
      retval += "!important"
    }
    retval += "; "
    return retval
  }
  // Mutation Observer for daterangepicker in Restrictions
  const RestrictionObserver = new MutationObserver(mutations => {
    if (options.mondayFirst || options.ISODates) {
      mutations.forEach(mutation => {
        if ($(mutation.target).hasClass("modal-content")) {
          if (mutation.addedNodes.length > 0) {
            if ($(".datepicker").length > 0) {
              const DRP = $(".datepicker")[0]
              const dows = reorderDaysOfWeek(
                $(DRP).data("daterangepicker").locale.daysOfWeek,
              )

              if (options.mondayFirst) {
                if ($(DRP).data("daterangepicker").locale.firstDay === 0) {
                  $(DRP).data("daterangepicker").locale.firstDay = 1
                  $(DRP).data("daterangepicker").locale.daysOfWeek = dows
                }
              }
              if (options.ISODates) {
                $(DRP).data("daterangepicker").locale.format = "YYYY-MM-DD"
                DRP.value = `${$(DRP).data("daterangepicker").startDate._i} - ${
                  $(DRP).data("daterangepicker").endDate._i
                }`
              }
            }
          }
        }
      })
    }
  })
  // Mutation Observer for segment edit panel
  const SegmentObserver = new MutationObserver(mutations => {
    // Tame the locked segment message which, in some locales, takes up rather more space than would be ideal
    if (options.tameLockedSegment) {
      const tObj = document.getElementsByClassName("segment-details")
      if (tObj.length > 0) {
        if (
          tObj[0].firstChild.textContent ==
          I18n.lookup("edit.segment.permissions.locked.title")
        ) {
          tObj[0].firstChild.textContent = "Segment locked"
          tObj[0].childNodes[1].firstChild.firstChild.textContent = ""
        } else if (
          tObj[0].firstChild.textContent ==
          I18n.lookup("edit.segment.permissions.locked_except_closures.title")
        ) {
          tObj[0].firstChild.textContent = "Segment locked except for closures"
          tObj[0].childNodes[1].firstChild.firstChild.textContent = ""
        }
      }
    }

    // Hide the labels in the segment edit panel to give more vertical space to the things we need to interact with
    if (options.hideSegmentPanelLabels) {
      let tObj = document
        .getElementById("edit-panel")
        .getElementsByTagName("wz-tab")
      if (tObj.length > 0) {
        tObj = tObj[0].getElementsByTagName("wz-label")
        if (tObj.length > 0) {
          for (const l of tObj) {
            if (l.getElementsByTagName("wz-checkbox").length == 0) {
              l.style.display = "none"
            }
          }
        }
      }
    }

    // Remove those options from the elevation menu which no-one is ever likely to need
    if (options.tameElevationMenu) {
      if (document.getElementsByName("level").length > 0) {
        if (document.getElementsByName("level")[0].childElementCount > 0) {
          const menuEntries = document
            .getElementsByName("level")[0]
            .getElementsByTagName("wz-option")
          const localeGround = I18n.lookup("edit.segment.levels")[0]
          for (const pe of menuEntries) {
            let level = 0
            if (pe.value != localeGround) {
              level = parseInt(pe.value)
            }
            if (level > 5 || level < -5) {
              SetStyle(pe, "display", "none", false)
            } else {
              const sr = pe.shadowRoot.querySelector(".wz-menu-item")
              const indent = 44 + level * 8
              SetStyle(sr, "padding", `0px 0px 0px ${indent}px`, false)
              SetStyle(sr, "height", "100%", false)
              SetStyle(sr, "lineHeight", "100%", false)
              SetStyle(sr, "minHeight", "auto", false)
            }
          }
        }
      }
    }

    // Remove whitespace from the segment type menu if it's being used
    if (options.tameSegmentTypeMenu) {
      // Check the menu is being shown - this won't be the case in compact mode
      if (document.getElementsByName("roadType").length > 0) {
        if (document.getElementsByName("roadType")[0].childElementCount > 0) {
          const menuDividers = document
            .getElementsByName("roadType")[0]
            .getElementsByTagName("wz-menu-divider")
          let pe
          let sr
          for (pe of menuDividers) {
            SetStyle(pe, "display", "none", false)
          }
          const menuTitles = document
            .getElementsByName("roadType")[0]
            .getElementsByTagName("wz-menu-title")
          for (pe of menuTitles) {
            sr = pe.shadowRoot.querySelector(".wz-menu-title")
            SetStyle(sr, "padding", "0px, 0px, 0px 4px", false)
            SetStyle(sr, "height", "100%", false)
            SetStyle(sr, "lineHeight", "100%", false)
            SetStyle(sr, "minHeight", "auto", false)
          }
          const menuEntries = document
            .getElementsByName("roadType")[0]
            .getElementsByTagName("wz-option")
          for (pe of menuEntries) {
            sr = pe.shadowRoot.querySelector(".wz-menu-item")
            SetStyle(sr, "padding", "0px 0px 0px 24px", false)
            SetStyle(sr, "height", "100%", false)
            SetStyle(sr, "lineHeight", "100%", false)
            SetStyle(sr, "minHeight", "auto", false)
          }
        }
      }
    }

    // Remove that slightly annoying "used as" message under the routing option buttons
    if (options.removeRoutingReminder) {
      SetStyle(
        document.querySelector(".routing-road-type-message")?.parentElement,
        "display",
        "none",
        false,
      )
    }

    if (options.restyleSidePanel) {
      if (options.UICompression > 0) {
        // Reduce padding enough so that the compact mode segment type selectors stand a reasonable chance
        // of fitting onto two lines instead of needing to spill over onto a third...
        SetStyle(
          document.querySelector("wz-tab")?.shadowRoot.querySelector(".wz-tab"),
          "padding",
          "2px",
          false,
        )

        // Reduce gap between the "Select entire street" and "Edit house numbers" buttons
        SetStyle(
          document.querySelector("#edit-panel .more-actions"),
          "gap",
          "0px",
          false,
        )

        // Reduce gap under the direction and lock level selectors
        SetStyle(
          document.querySelector("segment-direction-editor"),
          "marginBottom",
          "0px",
          false,
        )
        SetStyle(
          document.querySelector(".lock-edit-view"),
          "marginBottom",
          "0px",
          false,
        )

        // Reduce height of the speed limit input boxes
        const nSLE = document.querySelectorAll(
          "#segment-edit-general .speed-limit-input",
        ).length
        if (nSLE > 0) {
          for (let i = 0; i < nSLE; ++i) {
            const sr = document.querySelectorAll(
              "#segment-edit-general .speed-limit-input",
            )[i].shadowRoot
            SetStyle(
              sr.querySelector(".wz-text-input"),
              "height",
              "26px",
              false,
            )
          }
        }

        // Reduce height of the elevation drop-down - all this just to tweak the height of ONE UI element, thank you
        // VERY much shadowroot :-/
        if (document.getElementsByName("level")[0] != undefined) {
          const sr = document.getElementsByName("level")[0].shadowRoot
          SetStyle(sr.querySelector(".wz-select"), "height", "20px", false)
          SetStyle(
            sr.querySelector(".selected-value-wrapper"),
            "height",
            "20px",
            false,
          )
          SetStyle(sr.querySelector(".select-wrapper"), "height", "20px", false)
          SetStyle(sr.querySelector(".select-box"), "height", "20px", false)
        }
      }
    }
  })
  // Mutation Observer for daterangepicker in Closures
  const ClosureObserver = new MutationObserver(mutations => {
    if (options.mondayFirst) {
      mutations.forEach(mutation => {
        if (mutation.target.className == "closures") {
          if (mutation.addedNodes.length > 0) {
            if (
              mutation.addedNodes[0].firstChild.classList.contains(
                "edit-closure",
              )
            ) {
              if (
                $(".start-date").data("daterangepicker").locale.firstDay === 0
              ) {
                $(".start-date").data("daterangepicker").locale.firstDay = 1
                $(".end-date").data("daterangepicker").locale.firstDay = 1

                const dows = reorderDaysOfWeek(
                  $(".start-date").data("daterangepicker").locale.daysOfWeek,
                )
                $(".start-date").data("daterangepicker").locale.daysOfWeek =
                  dows
                $(".end-date").data("daterangepicker").locale.daysOfWeek = dows
              }
            }
          }
        }
      })
    }
  })
  // Mutation Observer for place edit panel
  const PlaceObserver = new MutationObserver(mutations => {
    // This slightly convoluted bit of code allows us to manipulate
    // the entries in the dynamically created drop-down list which
    // is generated whenever you start searching for a GMaps place
    // to link to a native one
    if (options.fixExternalProviders) {
      // First check that the MO has fired because the user has selected
      // a place for editing...
      const acMenu = document.getElementsByClassName(
        "external-provider-edit-form",
      )[0]
      if (acMenu !== undefined) {
        // ...and then check the "add linked Google place" option has been
        // selected, to start the process of generating the dynamic list
        const acInner = acMenu.getElementsByTagName("wz-autocomplete")[0]
        if (acInner !== undefined) {
          // If so, then we now need to poll the UI to see if there are any
          // list items present - this doesn't appear to be possible via a
          // MO due to the items being hidden behind shadowroot, hence the
          // slightly old-school nature of polling vs event driven here :-/
          window.setTimeout(EPObserver, 500)
        }
      }
    }
    if (options.UICompression > 0) {
      // Also check for the existence of the entry point UI element, so
      // we can dive into its shadowroot to deal with its excessive whitespace
      if (
        document.getElementsByClassName(
          "navigation-point-item navigation-point-editable",
        ).length > 0
      ) {
        const npOuter = document.getElementsByClassName(
          "navigation-point-item navigation-point-editable",
        )[0]
        const npInner =
          npOuter.shadowRoot.querySelectorAll(".list-item-wrapper")
        if (npInner.length > 0) {
          for (const i of npInner) {
            i.style.paddingTop = "4px"
            i.style.paddingBottom = "4px"
          }
        }
      }
    }
  })
  // Mutation Observer for issue tracker panel
  const ITObserver = new MutationObserver(mutations => {
    disableUITransitions()
  })
  const MTEObserver = new MutationObserver(mutations => {
    checkForMTEDropDown()
  })

  // To unwind the temporary moving of the notification icons when entering HN edit mode above, we observe changes in the primary
  // toolbar in order to detect when the close HN editor button is displayed, and also when the regular toolbar contents are
  // displayed.  We use the former to set up an onclick handler so that when the close editor button is clicked, we set a flag
  // to then trigger the deferred unwinding of the icon move once we detect the toolbar is back to normal...
  let doCleanUpAfterHNEdit = false
  const PriToolBarObserver = new MutationObserver(mutation => {
    if (document.querySelector("wz-button.waze-icon-exit") !== null) {
      // The HN topbar buttons don't exist within the DOM until the user initiates HN editing, so we need to
      // perform a seperate application of the button-specific parts of the topbar compression mods
      CheckForHNButtons()
    }

    if (
      document.querySelector(
        "#primary-toolbar .toolbar-collection-component",
      ) !== null
    ) {
      if (
        document.querySelector(".toolbar-group").getBoundingClientRect()
          .width !== 0
      ) {
        if (doCleanUpAfterHNEdit) {
          doCleanUpAfterHNEdit = false
          hideMenuLabels()
          if (options.moveUserInfo) {
            insertNodeBeforeNode(
              document.querySelector(".user-toolbar"),
              getById("left-app-head"),
            )
            insertNodeBeforeNode(
              document.querySelector("wz-user-box"),
              getById("left-app-head"),
            )
          }
        }
      }
    }
  })
  function CheckForHNButtons() {
    // The shadowroots for the HN topbar buttons get filled in slightly after the topbar mutation observer fires, which means
    // we can't do a simple (because when has dealing with the WME UI design EVER been simple...) call to the code that applies
    // the appropriate compression settings to those buttons.  Instead we call the function, which will return false so long as
    // it saw any empty shadowroot containers - i.e. for any buttons which WME hasn't finished rendering.  We use this return
    // value to then trigger a short duration timeout before trying to apply the compression again, and so on until it works...
    if (ApplyTopBarShadowRootWzButtonCompression() === false) {
      window.setTimeout(CheckForHNButtons, 10)
    }
  }
  function PrepForHNEdit() {
    // Moving the notification icons prevents the HN buttons from being rendered, so if the user has opted to move them, temporarily
    // move them back if the user then goes to edit HN...
    if (options.moveUserInfo) {
      insertNodeAfterNode(
        document.querySelector("wz-user-box"),
        document.querySelector("#save-button").parentElement.parentElement,
      )
      insertNodeAfterNode(
        document.querySelector(".user-toolbar"),
        document.querySelector("#save-button").parentElement.parentElement,
      )
      doCleanUpAfterHNEdit = true
    }
  }

  function checkForMTEDropDown() {
    const tObj = document.querySelector("#sidepanel-mtes")
    let nWO = tObj?.querySelectorAll("wz-option").length
    let nSR = 0
    while (nWO) {
      if (tObj.querySelectorAll("wz-option")[nWO - 1].shadowRoot != null) {
        ++nSR
      }
      --nWO
    }
    if (nSR > 0) {
      restyleDropDownEntries()
    } else {
      window.setTimeout(checkForMTEDropDown, 100)
    }
  }
  function EPObserver() {
    // Just a quick sanity check to make sure the list elements we need are
    // all still present...
    const acMenu = document.getElementsByClassName(
      "external-provider-edit-form",
    )[0]
    if (acMenu == undefined) return
    const acInner = acMenu.getElementsByTagName("wz-autocomplete")[0]
    if (acInner == undefined) return

    // Now that we're back to the same position we were at when we originally
    // started polling, it's time to mess with whichever list items we can
    // find here
    const acEntries = acInner.shadowRoot.querySelectorAll("wz-menu-item")
    if (acEntries.length != 0) {
      for (const i of acEntries) {
        // To accommodate suggestions that wrap onto 3+ lines, we need to remove the
        // height styling from the main menu item plus its child elements, so that each
        // entry can expand as needed to keep all of the text visible
        SetStyle(i, "--wz-menu-option-height", "auto", false)
        const wai = i.querySelector(".wz-autocomplete-item")
        SetStyle(wai, "height", "auto", false)
        SetStyle(wai, "padding-top", "2px", false)
        SetStyle(wai, "padding-bottom", "2px", false)

        // Most of the restyling fun takes place on this child element within the
        // list element
        const acText = i.querySelector(".wz-string-wrapper.primary-text")

        // Restore some sanity to the entries, so we can see exactly what they
        // say and therefore know what it is we're selecting - UI Design 101...
        SetStyle(acText, "overflow", "visible", false)
        SetStyle(acText, "overflow", "visible", false)
        SetStyle(acText, "lineHeight", "100%", false)
        SetStyle(acText, "display", "block", false)
        SetStyle(acText, "whiteSpace", "normal", false)

        // And just for shits and giggles, the late April WME update now places each and every
        // character within an entry in its own childnode of that entry, so that styling can be
        // applied to each character individually...  As this messes up the entry lineheight
        // styling which used to be all that was needed to get things looking good here, we now
        // ALSO need to override the native styling on these child nodes.  What next devs, an
        // individual node for each pixel of each character???
        const acChars = acText.childNodes
        for (const j of acChars) {
          SetStyle(j, "lineHeight", "100%", false)
        }

        // We also need to tweak the shadowroot version of the menu item itself, to
        // adjust the height style to prevent the item failing to grow tall enough
        // to fully accommodate 3+ line entries
        const srMenuItems = i.shadowRoot.querySelector(".wz-menu-item")
        SetStyle(srMenuItems, "height", "auto", false)
      }
    }

    // Having messed with whichever elements we found this time around, poll again
    // to account for the user continuing to type in the search box causing the
    // list to be regenerated with differing entries.  As we only get this far into
    // the function if the list is still visible, as soon as the user finishes their
    // search and the list is removed, the polling will stop until the next time
    // the MO fires - part-time polling, I can live with that if the alternative is
    // leaving the list entries in a sometimes unuseable state due to the odd
    // choice of native styles...
    window.setTimeout(EPObserver, 100)
  }
  // Don't try to manipulate I18n if we're currently running within the scope of the login popup, because I18n doesn't
  // exist there, and we need to get past here without throwing an exception in order to be able to modify the CSS
  // within the popup...
  if (document.location.href.indexOf("signin") == -1) {
    // Fix for date/time formats in WME released Oct/Nov 2016 - provided by Glodenox
    I18n.translations[I18n.currentLocale()].time = {}
    I18n.translations[I18n.currentLocale()].time.formats = {}
    I18n.translations[I18n.currentLocale()].time.formats.long =
      "%a %b %d %Y, %H:%M"
    I18n.translations[I18n.currentLocale()].date.formats = {}
    I18n.translations[I18n.currentLocale()].date.formats.long =
      "%a %b %d %Y, %H:%M"
    I18n.translations[I18n.currentLocale()].date.formats.default = "%a %b %d %Y"
  }
  function newSaveMode() {
    const sm = W.editingMediator.attributes.saveMode
    if (sm === "IDLE") {
      float()
    }
  }

  function init1() {
    logit("Starting init1", "debug")

    // Hide the "accept cookies" panel in the login popup
    if (document.location.href.indexOf("signin") != -1) {
      addGlobalStyle(".wz-cc-container { display: none; }")
    }

    if (W === undefined) {
      window.setTimeout(init1, 100)
      return
    }

    logit("Initialising...")

    if (W.userscripts?.state?.isReady) {
      init1Finalise()
    } else {
      document.addEventListener("wme-ready", init1Finalise, {
        once: true,
      })
    }
  }
  function init1Finalise() {
    // insert the content as a tab
    addMyTab()
  }
  function init2() {
    logit("Starting init2", "debug")
    if (W.userscripts === undefined) {
      // go round again if my tab isn't there yet
      if (!getById("sidepanel-FixUI")) {
        logit("Waiting for my tab to appear...", "warning")
        setTimeout(init2, 200)
        return
      }
    }
    // setup event handlers for controls:
    getById("street-view-drag-handle").ondblclick = GSVWidthReset

    // REGISTER WAZE EVENT HOOKS

    // events for Aerial Shifter
    W.map.events.register("zoomend", null, shiftAerials)
    W.map.events.register("moveend", null, shiftAerials)
    W.map
      .getLayerByUniqueName("satellite_imagery")
      .events.register("loadend", null, shiftAerials)
    // events to change menu bar color based on map comments checkbox
    W.map.events.register("zoomend", null, warnCommentsOff)
    W.map.events.register("moveend", null, warnCommentsOff)
    // event to remove the overlay that blocks the sidebar UI if you zoom out too far
    W.map.events.register("zoomend", null, unblockSidePanel)
    // events to adjust the "Search this area" z-index so it gets rendered behind the drop-down menus
    W.map.events.register("zoomend", null, moveSearchThisArea)
    W.map.events.register("moveend", null, moveSearchThisArea)
    // event to re-hack my zoom bar if it's there
    W.map
      .getLayerByUniqueName("BASE_LAYER")
      .events.register("loadend", null, ZLI)
    // window resize event to resize chat
    window.addEventListener("resize", enhanceChat, true)
    // window resize event to resize layers menu
    window.addEventListener("resize", compressLayersMenu, true)
    // window resize event to reapply zoombar fix
    window.addEventListener("resize", ZLI, true)
    // window resize event to resize search box
    window.addEventListener("resize", resizeSearch, true)

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", e => {
        updateTheme()
      })

    // anything we might need to do when the mouse moves...
    W.map.events.register("mousemove", null, mouseMove)

    const tEvt = {
      ...W.editingMediator._events["change:saveMode"][0],
    }
    tEvt.callback = newSaveMode
    W.editingMediator._events["change:saveMode"].push(tEvt)

    // event handlers to help with the weird change log visibility problem...
    document
      .querySelector("#save-button")
      .addEventListener("mouseover", saveMouseOver, true)
    document
      .querySelector("#save-button")
      .addEventListener("mouseout", saveMouseOut, true)

    // window resize event to refloat the sharing box in the correct location
    window.addEventListener("resize", unfloat, true)
    // event to re-hack toolbar buttons on exiting HN mode
    W.editingMediator.on("change:editingHouseNumbers", () => {
      if (W.editingMediator.attributes.editingHouseNumbers === true) {
        PrepForHNEdit()
      }

      if (options.unfloatButtons) {
        if (W.editingMediator.attributes.editingHouseNumbers) unfloat()
        if (W.editingMediator.attributes.editingEnabled) unfloat()
      }
    })

    // create Aerial Shifter warning div
    const ASwarning = document.createElement("div")
    ASwarning.id = "WMEFU_AS"
    ASwarning.innerHTML = modifyHTML("Aerials Shifted")
    ASwarning.setAttribute(
      "style",
      "top:20px; left:0px; width:100%; position:absolute; z-index:10000; font-size:100px; font-weight:900; color:rgba(255, 255, 0, 0.4); text-align:center; pointer-events:none; display:none;",
    )
    getById("WazeMap").appendChild(ASwarning)

    // Add an extra checkbox so I can test segment panel changes easily
    if (W.loginManager.user.attributes.userName == "Twister-UK") {
      logit("creating segment detail debug checkbox", "info")
      const extraCBSection = document.createElement("p")
      extraCBSection.innerHTML = modifyHTML(
        '<input type="checkbox" id="_cbextraCBSection" />',
      )
      insertNodeBeforeNode(extraCBSection, getById("left-app-head"))
      getById("_cbextraCBSection").onclick = FALSEcompressSegmentTab
      getById("_cbextraCBSection").checked = getById(
        "_cbCompressSegmentTab",
      ).checked
    }
    // create Panel Swap div
    const WMEPS_div = document.createElement("div")
    const WMEPS_div_sub = document.createElement("div")
    WMEPS_div.id = "WMEFUPS"
    WMEPS_div.setAttribute(
      "style",
      "color: lightgrey; margin-left: 5px; font-size: 20px;",
    )
    WMEPS_div.title =
      "Panel Swap: when map elements are selected, this lets you\nswap between the edit panel and the other tabs."
    WMEPS_div_sub.innerHTML = modifyHTML('<i class="fa fa-sticky-note"></i>')
    WMEPS_div.appendChild(WMEPS_div_sub)
    insertNodeBeforeNode(WMEPS_div, getById("left-app-head"))
    getById("WMEFUPS").onclick = PSclicked
    W.selectionManager.events.register("selectionchanged", null, PSicon)
    // create Permalink Count div
    const WMEPC_div = document.createElement("div")
    const WMEPC_div_sub = document.createElement("div")
    WMEPC_div.id = "WMEFUPC"
    WMEPC_div.classList.add("toolbar-button", "toolbar-button-with-icon")
    WMEPC_div.title =
      "Number of selectable map objects in the URL\nClick to reselect them."
    WMEPC_div_sub.classList.add("item-container", "WMEFU-toolbar-button")
    let totalItems
    if (location.search.match("segments"))
      totalItems = window.location.search
        .match(new RegExp("[?&]segments?=([^&]*)"))[1]
        .split(",").length
    else if (location.search.match("venues"))
      totalItems = window.location.search
        .match(new RegExp("[?&]venues?=([^&]*)"))[1]
        .split(",").length
    else if (location.search.match("nodes"))
      totalItems = Math.min(
        1,
        window.location.search
          .match(new RegExp("[?&]nodes?=([^&]*)"))[1]
          .split(",").length,
      )
    else if (location.search.match("mapComments"))
      totalItems = Math.min(
        1,
        window.location.search
          .match(new RegExp("[?&]mapComments?=([^&]*)"))[1]
          .split(",").length,
      )
    else if (location.search.match("cameras"))
      totalItems = Math.min(
        1,
        window.location.search
          .match(new RegExp("[?&]cameras?=([^&]*)"))[1]
          .split(",").length,
      )
    else totalItems = 0
    WMEPC_div_sub.innerHTML = modifyHTML(
      `<span class="item-icon" style="display:inline-flex"><i style="margin-top:8px" class="fa fa-link WMEFUPCicon"></i>&nbsp;${
        totalItems
      }</span>`,
    )
    WMEPC_div.appendChild(WMEPC_div_sub)
    insertNodeBeforeNode(WMEPC_div, getById("search"))
    WMEPC_div.onclick = PCclicked
    // Create Turn Popup Blocker div
    const WMETPB_div = document.createElement("div")
    const WMETPB_div_sub = document.createElement("div")
    WMETPB_div.id = "WMEFUTPB"
    WMETPB_div.classList.add("toolbar-button", "toolbar-button-with-icon")
    WMETPB_div.title = "Disable/enable the turn arrow popup dialogue"
    WMETPB_div_sub.classList.add("item-container", "WMEFU-toolbar-button")
    WMETPB_div_sub.innerHTML = modifyHTML(
      '<span class="item-icon fa-stack fa-2x" style="display:inline-flex; font-size:10px !important"><i class="fa fa-comment fa-stack-2x"></i><i class="fa fa-arrow-up fa-inverse fa-stack-1x"></i></span>',
    )
    WMETPB_div.appendChild(WMETPB_div_sub)
    insertNodeBeforeNode(WMETPB_div, getById("search"))
    WMETPB_div.onclick = toggleKillTurnPopup
    addGlobalStyle(".WMEFU-toolbar-button { padding: 0px !important; }")

    // overload the window unload function to save my settings
    window.addEventListener("beforeunload", saveSettings, false)
    // Alert to new version
    if (options.oldVersion != FUME_VERSION) {
      const releaseNotes = `
        <div>
          <div>Version ${FUME_VERSION} (${FUME_DATE}) release notes</div>
          <ul>
            ${
  newVersionNotes.length > 0
    ? newVersionNotes.map(note => `<li>${note}`).join("")
    : "<li>No changes"
  }
          </ul>
        </div>
        `
      abShowAlertBox(
        "fa-info-circle",
        "WME Fix UI Memorial Edition",
        releaseNotes,
        false,
        "OK",
        "",
        null,
        null,
      )
      saveSettings()
    }
    // fix for sidebar display problem in Safari, requested by edsonajj
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isSafari) {
      addGlobalStyle(".flex-parent { height: 99% !important; }")
    }
    // stop wobbling status bar
    addGlobalStyle(".WazeControlMousePosition { font-family: monospace }")
    // move closed node icon below node markers
    // apply the settings
    shiftAerials()

    window.setTimeout(applyAllSettings, 1000)

    logit("Initialisation complete")
  }
  let wasDrawing = null
  function mouseMove() {
    // Temporarily disable the Enlarge geo/junction nodes and Enlarge geo handles options
    // when drawing new geometry, to avoid the enlarged nodes/handles on other geometry
    // objects getting in the way of the new object being drawn...
    const isDrawing = W.editingMediator.attributes.drawing
    if (isDrawing != wasDrawing) {
      enlargeGeoNodes(isDrawing)
      enlargeGeoHandles(isDrawing)
      wasDrawing = isDrawing
    }
  }
  function unblockSidePanel() {
    // I can see why the devs thought blocking access to the sidepanel UI might make sense at wider
    // zoom levels, given that you can't select any map elements or therefore do any editing.
    // The problem is that this blocking applies to ALL of the sidepanel tabs, including those which
    // COULD be useful regardless of the zoom level - drives, edit areas and userscripts...
    //
    // This one-liner simply kills the blocking overlay if it's present, restoring access to the
    // sidebar UI at all zoom levels.
    document.querySelector(".overlay.editingDisabled")?.remove()
  }
  function createTabHTML() {
    const innerHTML = `
	<div id="UIFixSettings">
		<div class="aerial_shifter">
			<h6 title="Shift aerial images layer to match GPS tracks and reduce image opacity">
				Aerial Shifter
				<i class="fa fa-power-off" id="_resetAS" title="Clear X/Y offsets" @click="resetAerials"></i>
			</h6>

			<div>
				${I18n.lookup("layer_switcher.togglers.ITEM_SATELLITE_IMAGERY")}
			</div>
			<div class="control_group">
				<div>
					<input type="number" v-model="options.arialShiftX" id="_inpASX" title="horizontal shift" max=300
						min=-300 step=5 @change="shiftAerials" />
					<label for="_inpASX">m</label>
					<i class="fa fa-arrow-right">
					</i>
				</div>
				<div>
					<input type="number" v-model="options.arialShiftY" id="_inpASY" title="vertical shift" max=300
						min=-300 step=5 @change="shiftAerials" />
					<label for="_inpASY">m</label>
					<i class="fa fa-arrow-up"></i>
				</div>
				<div>
					<input type="number" v-model="options.arialOpacity" id="_inpASO" title="opacity" max=100 min=10
						step=10 @change="shiftAerials" />
					<label for="_inpASO">%</label>
					<i class="fa fa-adjust"></i>
				</div>
			</div>
			<div> ${I18n.lookup("layer_switcher.togglers.GROUP_IMAGERY")} </div>
			<div class="control_group">
				<div>
					<input type="number" v-model="options.arialShiftXO" id="_inpASXO" title="horizontal shift" max=300
						min=-300 step=5 @change="shiftAerials" />
					<label for="_inpASXO">m</label>
					<i class="fa fa-arrow-right"></i>
				</div>
				<div>
					<input type="number" v-model="options.arialShiftYO" id="_inpASYO" title="vertical shift" max=300
						min=-300 step=5 @change="shiftAerials" />
					<label for="_inpASYO">m</label>
					<i class="fa fa-arrow-up"></i>
				</div>
				<div>
					<input type="number" v-model="options.arialOpacityO" id="_inpASOO" title="opacity" max=100 min=10
						step=10 @change="shiftAerials" />
					<label for="_inpASOO">%</label>
					<i class="fa fa-adjust"></i>
				</div>
			</div>
			<div title="Adjust contrast, brightness, colours & width for Google Street View images">
				GSV image adjust
			</div>
			<div class="control_group">
				<div title="Contrast">
					<input type="number" v-model="options.GSVContrast" id="_inpGSVContrast" max=200 min=25 step=25
						@change="adjustGSV" />
					<label for="_inpGSVContrast">%</label>
					<i class="fa fa-adjust"></i>
				</div>
				<div title="Brightness">
					<input type="number" v-model="options.GSVBrightness" id="_inpGSVBrightness" max=200 min=25
						@change="adjustGSV" step=25 />
					<label for="_inpGSVBrightness">%</label>
					<i class="fa fa-sun-o"></i>
				</div>
				<div title="Invert colours">
					<input type="checkbox" id="_cbGSVInvert" v-model="options.GSVInvert" @change="adjustGSV" />
					<i class="fa fa-tint">
					</i>
				</div>
				<div title="Default width">
					<input type="number" v-model="options.GSVWidth" id="_inpGSVWidth" max=90 min=10 step=10
						@change="GSVWidth" />
					<label for="_inpGSVWidth">%</label>
					<i class="fa fa-arrows-h"></i>
				</div>
			</div>

		</div>
		<div class="ui_enhancements">
			<h6>UI Enhancements</h6>

			<div class="theme-selector">
				<input type="radio" id="system" value="system" v-model="theme" @change="updateTheme" />
				<label for="system" class="left">
					<i class="fa fa-cogs fa-2x"></i>
				</label>

				<input type="radio" id="dark" value="dark" v-model="theme" @change="updateTheme" />
				<label for="dark">
					<i class="fa fa-moon-o fa-2x"></i>
				</label>

				<input type="radio" id="light" value="light" v-model="theme" @change="updateTheme" />
				<label for="light" class="right">
					<i class="fa fa-sun-o fa-2x"></i>
				</label>
			</div>

			<div>
				<input type="checkbox" id="_cbShrinkTopBars" v-model="options.shrinkTopBars" @click="shrinkTopBars" />
				<label for="_cbShrinkTopBars"
					title="Because we cant afford to waste screen space, particularly on\nstuff we didnt ask for and dont want, like the black bar.\nAnd why does the reload button have a re-do icon?!">Compress/enhance
					bars above the map</label>
			</div>
			<div>
				<input type="checkbox" id="_cbCompressSegmentTab" v-model="options.restyleSidePanel"
					@change="compressSegmentTab" />
				<label for="_cbCompressSegmentTab"
					title="Because I\m sick of having to scroll the side panel because of oversized fonts and wasted space">Compress/enhance
					side panel contents</label>
			</div>
			<div>
				<input type="checkbox" id="_cbCompressLayersMenu" v-model="options.restyleLayersMenu"
					@change="compressLayersMenu" />
				<label for="_cbCompressLayersMenu"
					title="Because it\s already too big for small screens and Waze only plan to make it bigger">Compress/enhance
					layers menu</label>
				<div id="layersColControls">
					<input type="checkbox" id="_cbLayersColumns" v-model="options.layers2Cols"
						@change="compressLayersMenu" />
					<label for="_cbLayersColumns"
						title="Widen the layers menu to 2 columns - particulary for netbook users\nWon\t work without some compression turned on">Two-column
						layers menu</label>
				</div>
			</div>
			<div>
				<input type="checkbox" id="_cbRestyleReports" v-model="options.restyleReports"
					@change="restyleReports" />
				<label for="_cbRestyleReports"
					title="Another UI element configured for developers with massive screens instead of normal users">Compress/enhance
					report panels (UR/MP)</label>
			</div>
			<div>
				<input type="checkbox" id="_cbEnhanceChat" v-model="options.enhanceChat" @change="enhanceChat" />
				<label for="_cbEnhanceChat"
					title="A perfect example of the new WME UI. Looks very stylish,\nbut destroys usability and utterly ignores small-screen users.">Compress/enhance
					Chat panel</label>
			</div>
			<div>
				<input type="checkbox" id="_cbNarrowSidePanel" v-model="options.narrowSidePanel"
					@change="narrowSidePanel" />
				<label for="_cbNarrowSidePanel"
					title="If you have a netbook, Waze isn\t interested in your experience.\nYou need every bit of map space you can get - so have a present from me!">Reduce
					width of the side panel</label>
				<span
					title="This will definitely interfere with scripts that rely on a fixed width for their tab contents."
					style="font-size: 16px; color: red;" class="fa fa-exclamation-triangle"></span>
			</div>
			<div>
				<div title="Control the amount of compression/enhancment">UI Enhancement controls</div>
				<div style="display:inline-block">
					<select id="_inpUICompression" title="Compression enhancement" v-model="options.UICompression"
						@change="applyEnhancements" style="height:20px; padding:0px; border-radius:0px;">
						<option value="2">High</option>
						<option value="1">Low</option>
						<option value="0">None</option>
					</select>
					<i class="fa fa-compress"></i>
				</div>
				<div style="display:inline-block">
					<select id="_inpUIContrast" title="Contrast enhancement" v-model="options.UIContrast"
						@change="applyEnhancements" style="height:20px; padding:0px; border-radius:0px;">
						<option value="2">High</option>
						<option value="1">Low</option>
						<option value="0">None</option>
					</select>
					<i class="fa fa-adjust"></i>
				</div>

				<button id="_btnKillNode" style="height: 18px; margin-top: 5px;" @click="killNode"
					title="Hide the junction nodes layer to allow access to Map Comments hidden under nodes.\nThis stays in effect until the page is zoomed/panned/refreshed.">Hide
					junction nodes</button>
			</div>
		</div>
		<div class="ui_fixes">
			<h6>UI Fixes/changes</h6>
			<div>
				<input type="checkbox" id="_cbTameLockedSegmentMsg" v-model="options.tameLockedSegmentMsg" />
				<label for="_cbTameLockedSegmentMsg"
					title="Tame the locked segment warning,\nbecause in some localisations it takes up a shit-ton of space.">Tame
					locked segment warning</label>
			</div>
			<div>
				<input type="checkbox" id="_cbHideSegmentPanelLabels" v-model="options.hideSegmentPanelLabels" />
				<label for="_cbHideSegmentPanelLabels"
					title="Hide the labels in the segment sidepanel,\nbecause there are more important things to display in that precious space.">Hide
					segment sidepanel labels</label>
			</div>
			<div>
				<input type="checkbox" id="_cbTameSegmentTypeMenu" v-model="options.tameSegmentTypeMenu" />
				<label for="_cbTameSegmentTypeMenu"
					title="Do away with all the wasted space in the segment type menu,\nso that we can select types without having to scroll.">Tame
					segment type menu</label>
			</div>
			<div>
				<input type="checkbox" id="_cbTameElevationMenu" v-model="options.tameElevationMenu" />
				<label for="_cbTameElevationMenu"
					title="Do away with all the wasted space and unlikely to ever be used option in the elevation menu,\nso that we can select the ones we DO use without having to scroll.">Tame
					elevation menu</label>
			</div>
			<div>
				<input type="checkbox" id="_cbRemoveRoutingReminder" v-model="options.removeRoutingReminder" />
				<label for="_cbRemoveRoutingReminder"
					title="Remove the Segment will be used as message under the Routing buttons.">Remove segment routing
					message</label>
			</div>
			<div>
				<input type="checkbox" id="_cbReEnableSidePanel" v-model="options.reEnableSidePanel" />
				<label for="_cbReEnableSidePanel"
					title="Re-enable the side panel at wider zoom levels,\nbecause contrary to what the WME devs seem to think,\nthere is quite a lot you can still do there.">Re-enable
					side panel at wider zooms</label>
			</div>
			<div>
				<input type="checkbox" id="_cbResizeSearchBox" v-model="options.resizeSearch" @change="resizeSearch" />
				<label for="_cbResizeSearchBox"
					title="Allows the search box to use all the dead space in the top bar">Expand search box</label>
			</div>
			<div>
				<input type="checkbox" id="_cbMoveZoomBar" v-model="options.moveZoomBar" @change="createZoomBar" />
				<label for="_cbMoveZoomBar"
					title="Because nobody likes a pointless UI change that breaks your workflow,\nimposed by idiots who rarely use the editor and don\t listen to feedback.\nNO MATTER HOW HARD THEY TRY, I WILL BRING IT BACK!">Re-create
					zoom bar & move map controls</label>
			</div>
			<div>
				<input type="checkbox" id="_cbFixExternalProviders" v-model="options.fixExternalProviders" />
				<label for="_cbFixExternalProviders"
					title="The External Providers interface has a description box that will only show one line of text.\nThis fixes that.">Expand
					External Provider details for places</label>
			</div>
			<div>
				<input type="checkbox" id="_cbMoveChatIcon" v-model="options.moveChatIcon" @change="moveChatIcon" />
				<label for="_cbMoveChatIcon"
					title="Heres a truly outstanding example of making a stupid change to the UI in order to\ndeal with another stupid change to the UI!\nBecause HQ couldnt make the new layers menu auto-hide, they moved the chat icon.\nTick this box to put it back where it belongs.">Move
					Chat icon back to right</label>
			</div>
			<div>
				<input type="checkbox" id="_cbHighlightInvisible" v-model="options.highlightInvisible"
					@change="highlightInvisible" />
				<label for="_cbHighlightInvisible"
					title="Typical WME design - the chat icon changes when you\re invisible,\nbut the change is practically invisible!\nThis option provides a more obvious highlight.">Highlight
					invisible mode</label>
			</div>
			<div>
				<input type="checkbox" id="_cbLayersMenuMoreOptions" v-model="options.layersMenuMore" />
				<label for="_cbLayersMenuMoreOptions"
					title="This function shows all options in the Layers menu at all times.\nNote that changing this only updates when the page loads.">Show
					all options in Layers menu</label>
			</div>
			<div>
				<input type="checkbox" id="_cbDarkenSaveLayer" v-model="options.darkenSaveLayer"
					@change="darkenSaveLayer" />
				<label for="_cbDarkenSaveLayer"
					title="Its not bad enough theyve removed all the contrast to give you eyestrain,\nbut then they blind you every time you save. ">Darken
					screen overlay when saving</label>
			</div>
			<div>
				<input type="checkbox" id="_cbSwapRoadsGPS" v-model="options.swapRoadsGPS" @change="swapRoadsGPS" />
				<label for="_cbSwapRoadsGPS"
					title="Guess what? Waze thinks the GPS layer should now be over the segments layer.\nWhy should you have any choice about that?">Move
					GPS layer below segments layer</label>
			</div>
			<div>
				<input type="checkbox" id="_cbShowMapBlockers" v-model="options.showMapBlockers"
					@change="showMapBlockers" />
				<label for="_cbShowMapBlockers"
					title="Some WME elements block access to the map layers. These problems have been reported as bugs.\nUntil they\re fixed, this functions makes them visible.">Show
					map-blocking WME bugs</label>
			</div>
			<div>
				<input type="checkbox" id="_cbDisableBridgeButton" v-model="options.disableBridgeButton"
					@change="disableBridgeButton" />
				<label for="_cbDisableBridgeButton"
					title="The Bridge button is rarely useful, but often used incorrectly.\nIt\s best to keep it disabled unless you need it.">Disable
					Bridge button</label>
			</div>
			<div>
				<input type="checkbox" id="_cbDisablePathButton" v-model="options.disablePathButton"
					@change="disablePathButton" />
				<label for="_cbDisablePathButton"
					title="The far turn button seems to be an accidental click-magnet, making it all\ntoo easy to accidentally set a path without noticing until after you save...\nUse this option to disable it and avoid the embarrassment">Disable
					Far Turn button</label>
			</div>
			<div>
				<input type="checkbox" id="_cbMondayFirst" v-model="options.mondayFirst" />
				<label for="_cbMondayFirst"
					title="Requests to have calendar items localised with Monday as the first day of the week\ngo back a while. Now you don\t have to wait for Waze.">Start
					calendars on Monday</label>
			</div>
			<div>
				<input type="checkbox" id="_cbISODates" v-model="options.ISODates" />
				<label for="_cbISODates"
					title="Dates in the Restrictions dialogues are all in American format - MM/DD/YY\nFine if you\ American, confusing as hell for the rest of us!\nThis changes the dates to ISO format, matching the Closures dialogue">ISO
					dates in Restrictions</label>
			</div>
			<div>
				<input type="checkbox" id="_cbDisableKinetic" v-model="options.disableKinetic"
					@change="disableKinetic" />
				<label for="_cbDisableKinetic"
					title="Kinetic panning is a new WME feature: if you release the mouse whilst dragging the map,\nthe map will keep moving. It can be very useful for panning large distances.\nIt can also be very annoying. Now YOU have control.">Disable
					Kinetic Panning</label>
			</div>
			<div>
				<input type="checkbox" id="_cbDisableZoomAnimation" v-model="options.disableAnimatedZoom"
					@change="disableAnimatedZoom" />
				<label for="_cbDisableZoomAnimation"
					title="Animated zooming is a new WME feature which some would prefer not to have enabled.  Click here to express that preference...">Disable
					Animated Zooming</label>
			</div>
			<div>
				<input type="checkbox" id="_cbDisableUITransitions" v-model="options.disableUITransitions"
					@change="disableUITransitions" />
				<label for="_cbDisableUITransitions"
					title="Because life is simply too short to waste time waiting for UI elements to oooooooooze into position">Disable
					UI
					Transitions</label>
			</div>
			<div>
				<input type="checkbox" id="_cbDisableScrollZoom" v-model="options.disableScrollZoom"
					@change="disableScrollZoom" />
				<label for="_cbDisableScrollZoom"
					title="Zooming with the scroll wheel can be problematic when using an Apple Magic Mouse, which\nscrolls on touch. This will disable scroll-to-zoom.">Disable
					scroll-to-zoom</label>
			</div>
			<div>
				<input type="checkbox" id="_cbDisableSaveBlocker" v-model="options.disableSaveBlocker"
					@change="disableSaveBlocker" />
				<label for="_cbDisableSaveBlocker"
					title="When you hit Save, WME places a blocking element over the map until the save is complete\nThis disables that element, allowing you to pan the map and use GSV whilst a slow save is in progress.">Disable
					map blocking during save</label>
			</div>
			<div>
				<input type="checkbox" id="_cbColourBlindTurns" v-model="options.colourBlindTurns"
					@change="colourBlindTurns" />
				<label for="_cbColourBlindTurns"
					title="Change green turn arrows blue in order to make them more visible\nfor users with the most common type of colour blindness.">Change
					green turn arrows to blue</label>
			</div>
			<div>
				<input type="checkbox" id="_cbHideMenuLabels" v-model="options.hideMenuLabels"
					@change="hideMenuLabels" />
				<label for="_cbHideMenuLabels"
					title="Hide the text labels on the toolbar menus to save space on small screens">Hide menu
					labels</label>
			</div>
			<div>
				<input type="checkbox" id="_cbUnfloatButtons" v-model="options.unfloatButtons"
					@change="unfloatButtons" />
				<label for="_cbUnfloatButtons"
					title="Move Layers/Refresh buttons back into the toolbar and Share button into the\nfooter.\nWaze put little enough effort into giving us enough map area to work with,\nand then they drop little button turds all over it!">Remove
					floating buttons from map area</label>
			</div>
			<div>
				<input type="checkbox" id="_cbMoveUserInfo" v-model="options.moveUserInfo" @change="moveUserInfo" />
				<label for="_cbMoveUserInfo"
					title="The new user info button is very useful, but its not a map editing control,\nso it shouldnt be in the toolbar. The same goes for the notification button.\nThis function moves them both to a sensible location.">Move
					user info/notification buttons</label>
			</div>
			<div>
				<input type="checkbox" id="_cbHackGSVHandle" v-model="options.hackGSVHandle" @change="hackGSVHandle" />
				<label for="_cbHackGSVHandle"
					title="Whilst being able to adjust the GSV width is useful, the drag handle\ninvisibly covers 30 pixels of map and is very easy to drag accidentally.\nThis function transforms it to a button drag control that\s much less\nlikely to be used by accident.">Minimise
					GSV drag handle</label>
			</div>
			<div>
				<input type="checkbox" id="_cbEnlargeGeoNodes" v-model="options.enlargeGeoNodes"
					@change="enlargeGeoNodes" />
				<label for="_cbEnlargeGeoNodes"
					title="If you\re getting old, like me, grabbing those little circles is a pain!\nThis control lets you enlarge the geo nodes (and junction nodes for segments),\nwhich define the shapes of segments and place boundaries.">Enlarge
					geo/junction nodes</label>
				<div style="display:inline-block">
					<input type="number" id="_inpEnlargeGeoNodes" title="radius (default=6)" max=12 min=8 step=2
						@change="enlargeGeoNodes"
						style="height:16px; padding:0 0 0 2px; border:1px solid; width:37px;" />
				</div>
			</div>
			<div>
				<input type="checkbox" id="_cbEnlargeGeoHandlesFU" v-model="options.enlargeGeoHandles"
					@change="enlargeGeoHandles" />
				<label for="_cbEnlargeGeoHandlesFU"
					title="If you\re getting old, like me, grabbing those little circles is a pain!\nThis control lets you enlarge the geo handles, used to add geo nodes to segments and place boundaries.">
					Enlarge geo handles
				</label>
				<div style="display:inline-block">
					<input type="number" id="_inpEnlargeGeoHandles" title="radius (default=4)" max=10 min=6 step=2
						@change="enlargeGeoHandles"
						style="height:16px; padding:0 0 0 2px; border:1px solid; width:37px;" />
				</div>
			</div>
			<div>
				<input type="checkbox" id="_cbEnlargePointMCs" v-model="options.enlargePointMCs"
					@change="enlargePointMCs" />
				<label for="_cbEnlargePointMCs"
					title="This control lets you enlarge point map comments, because sometimes they can look a little swamped inamongst the rest of the stuff on show">
					Enlarge point map comments
				</label>
				<div style="display:inline-block"><input type="number" id="_inpEnlargePointMCs"
						title="scale (default=1)" max=3 min=1 step=0.1 @change="enlargePointMCs"
						style="height:16px; padding:0 0 0 2px; border:1px solid; width:37px;" />
				</div>
			</div>
		</div>
		<div class="about">
			<b><a href="https://www.waze.com/forum/viewtopic.php?t=334618" title="Forum topic" target="_blank"><u>
						"WME Fix UI Memorial Edition</u></a></b> v${FUME_VERSION}

		</div>
	</div>
`
    return innerHTML
  }
  function addMyTab() {
    logit("Creating tab...")
    tabCreate()
  }
  async function tabCreate() {
    const { tabLabel, tabPane } = W.userscripts.registerSidebarTab("FUME")
    tabLabel.innerText = "FUME"
    tabPane.innerHTML = modifyHTML(createTabHTML())
    await W.userscripts.waitForElementConnected(tabPane)

    // check if Vue.js is already loaded
    while (typeof Vue === "undefined") {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    // initialize Vue.js
    const { createApp, ref } = Vue
    try {
      loadSettings()
      logit("Vue.js loaded")
      createApp({
        setup() {
          const theme = ref(options.theme)
          return { options, theme }
        },
        methods: {
          resetAerials() {
            options.arialShiftX = 0
            options.arialShiftY = 0
            options.arialOpacity = 100
            options.arialShiftXO = 0
            options.arialShiftYO = 0
            options.arialOpacityO = 100
            shiftAerials()
          },
          updateTheme(theme) {
            options.theme = theme.target.id
            logit(`Theme changed to ${options.theme}`)
            updateTheme()
            saveSettings()
          },
          shiftAerials,
          shrinkTopBars,
          createZoomBar,
          moveChatIcon,
          highlightInvisible,
          darkenSaveLayer,
          killNode,
          swapRoadsGPS,
          showMapBlockers,
          compressSegmentTab,
          compressLayersMenu,
          compressLayersMenu,
          restyleReports,
          enhanceChat,
          narrowSidePanel,
          applyEnhancements,
          applyEnhancements,
          resizeSearch,
          adjustGSV,
          adjustGSV,
          adjustGSV,
          GSVWidth,
          disableBridgeButton,
          disablePathButton,
          killNode,
          disableKinetic,
          disableScrollZoom,
          disableAnimatedZoom,
          disableUITransitions,
          disableSaveBlocker,
          colourBlindTurns,
          hideMenuLabels,
          unfloatButtons,
          moveUserInfo,
          hackGSVHandle,
          enlargeGeoNodes,
          enlargeGeoHandles,
          enlargePointMCs,
        },
      }).mount(tabPane)
    } catch (error) {
      logit("Failed to load Vue.js", "error")
      logit(error, "error")
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

    logit("Tab now available...")
    createDSASection()
    abInitialiseAlertBox()
    document
      .getElementById("abAlertTickBtn")
      .addEventListener("click", abCloseAlertBoxWithTick, true)
    document
      .getElementById("abAlertCrossBtn")
      .addEventListener("click", abCloseAlertBoxWithCross, true)

    // pass control to init2
    init2()
  }
  function loadSettings() {
    // Remove old V1 settings if they're still hanging around
    if (localStorage.WMEFixUI) {
      localStorage.removeItem("WMEFixUI")
    }
    if (localStorage.WMEFUSettings) {
      const loadedOptions = JSON.parse(localStorage.WMEFUSettings)
      // merge old settings with new settings, to fix missing settings
      options = {
        ...DEFAULT_OPTIONS,
        ...loadedOptions,
      }
    } else {
      options = DEFAULT_OPTIONS
    }
  }
  function saveSettings() {
    if (localStorage) {
      logit("saving options to local storage")
      options.oldVersion = FUME_VERSION
      localStorage.WMEFUSettings = JSON.stringify(options)
    }
  }
  function applyAllSettings() {
    kineticDragParams = W.map.controls.find(control => control.dragPan)
      .dragPan.kinetic

    logit("Applying settings...")

    updateTheme()
    unfloatButtons()
    shrinkTopBars()
    compressSegmentTab()
    restyleReports()
    enhanceChat()
    narrowSidePanel()
    warnCommentsOff()
    adjustGSV()
    GSVWidth()
    compressLayersMenu()
    moveChatIcon()
    highlightInvisible()
    darkenSaveLayer()
    swapRoadsGPS()
    showMapBlockers()
    disableBridgeButton()
    disablePathButton()
    disableKinetic()
    disableScrollZoom()
    disableAnimatedZoom()
    disableSaveBlocker()
    disableUITransitions()
    colourBlindTurns()
    hideMenuLabels()
    createZoomBar()

    moveUserInfo()
    moveSearchThisArea()

    hackGSVHandle()
    enlargeGeoNodes(false)
    enlargeGeoHandles(false)
    enlargePointMCs()
    RTCArrowsFix()
    hideUnuseableStuff()
    resizeSearch()

    RestrictionObserver.observe(getById("dialog-container"), {
      childList: true,
      subtree: true,
    })
    ClosureObserver.observe(getById("edit-panel"), {
      childList: true,
      subtree: true,
    })
    SegmentObserver.observe(getById("edit-panel"), {
      childList: true,
      subtree: true,
    })
    PlaceObserver.observe(getById("edit-panel"), {
      childList: true,
      subtree: true,
    })
    MTEObserver.observe(getById("sidepanel-mtes"), {
      childList: true,
      subtree: true,
    })
    RTCMarkerObserver.observe(W.map.closuresMarkerLayer.div, {
      childList: true,
      subtree: true,
    })
    OBObserver.observe(getById("overlay-buttons"), {
      childList: true,
      subtree: true,
    })
    ITObserver.observe(getById("issue-tracker-filter-region"), {
      childList: true,
      subtree: true,
    })
    PriToolBarObserver.observe(getById("primary-toolbar"), {
      childList: true,
      subtree: true,
    })

    document.body.onchange = checkForTippy
    getById("sidepanel-issue-tracker").onchange = checkForIssuesFilter

    if (getById("_cbLayersMenuMoreOptions").checked === true) {
      $(
        "#layer-switcher-region > div > div > div.more-options-toggle > label > div",
      ).click()
      Array.from(
        getByClass("upside-down", getById("layer-switcher-region")),
      ).forEach(item => {
        item.click()
      })
    }

    wmeFUinitialising = false
    saveSettings()
  }
  function hasExactlyOneSelectedSegment() {
    let retval = false
    const sf = W.selectionManager.getSelectedDataModelObjects()
    if (sf.length === 1) {
      retval = sf[0].type === "segment"
    }

    return retval
  }

  function checkForTippy() {
    // To handle the "tippy" classed dynamic popup used to show TIO details, we first call this function from the
    // body onchange event - the sole purpose of which is to call checkForTippy2() so long as exactly one segment
    // is selected.  If this latter isn't true, then no turn arrows will be visible, thus the TIO popup can't be
    // shown...
    if (hasExactlyOneSelectedSegment() === true) {
      let n = document.querySelectorAll(".turn-arrow-state-open").length
      while (n) {
        --n
        document
          .querySelectorAll(".turn-arrow-state-open")
          [n].addEventListener("mouseenter", checkForTippy1a)
      }
      checkForTippy1a()
    }
  }
  function checkForTippy1a() {
    const tObj = document.querySelector(".tippy-box")
    if (tObj === null) {
      window.setTimeout(checkForTippy1a, 100)
      return
    }
    TippyObserver.observe(tObj, { childList: true, subtree: true })
  }
  function checkForTippy2() {
    // The onchange event is triggered as soon as the popup element is created within the DOM, however at this
    // point it won't yet be populated with its contents.  So in here we first make sure the popup container
    // (i.e. the ".tippy-box" classed element) exists, and then wait for it to gain some "wz-option" elements
    // which are used to render the drop-down menu we want to restyle.  Once we see some of those, we can move
    // onto the last step via the restyleTippy() call.
    //
    // Note this function is also used by the popup mutation observer we set up in a moment
    const tObj = document.querySelector(".tippy-box")

    if (tObj === null) {
      window.setTimeout(checkForTippy2, 100)
      return
    }

    if (tObj.querySelectorAll("wz-option").length == 0) {
      window.setTimeout(checkForTippy2, 100)
      return
    }

    const compress = getById("_inpUICompression").value
    if (compress > 0) {
      restyleTippy()
    }
  }
  var TippyObserver = new MutationObserver(mutations => {
    // If we detect any changes in the popup contents, treat it almost the same as the original body onchange event
    // and go back into checking for the drop-down elements being present prior to restyling
    checkForTippy2()
  })
  function restyleTippy() {
    // Once we're happy that the TIO popup has been populated with the stuff we're interested in messing with, we can
    // apply the restyling required...
    const tObj = document.querySelector(".tippy-box")

    let n = tObj.querySelectorAll("wz-option").length
    while (n) {
      const sr = tObj.querySelectorAll("wz-option")[n - 1].shadowRoot
      const mi = sr.querySelector(".wz-menu-item")
      if (mi != null) {
        SetStyle(mi, "height", "100%", false)
        SetStyle(mi, "lineHeight", "130%", false)
        SetStyle(mi, "minHeight", "auto", false)
      }
      --n
    }
    // Having done that, we now set up a mutation observer on the popup, which allows us to detect when its redrawn
    // (which would cause the redrawn drop-down to revert to the default styling) without the body onchange event
    // triggering - this can occur if they mouse-over one of the other turn arrows on the currently selected segment,
    // or if they select a different segment without first deselecting the current one...
    TippyObserver.observe(tObj, { childList: true, subtree: true })
  }
  function checkForIssuesFilter() {
    // To restyle the drop-down menu entries in the issue tracker panel, we need to be aware that, unlike all the other
    // drop-downs in WME that exist outside of a dynamic popup (i.e. for TIOs...), the ones within the tracker filtering
    // options slideout are only created the first time the options are shown.  Once that's happened, it then doesn't
    // matter how many times the slideout is slid in or out within that WME session, the DOM remains untouched.
    //
    // So, to enable restyling of these semi-dynamically created entries, we first wait for the firing of the onchange
    // event attached to the filter panel - that tells us WME is starting to update the DOM here.  Then we wait for the
    // first "wz-option" element within the areas section to gain a "wz-menu-item" classed element in its shadowroot.
    // Once we've seen that, we know that the drop-downs not only exist in the main DOM, but also that their shadowroots
    // have been populated - as per usual these days, it's the shadowroots where we need to apply the restyling, so until
    // WME has finished populating those then we can't do anything...
    //
    // Once we've seen the required element within the shadowroot, we then simply repeat the general (un)compression
    // styling on all of the drop-downs that are now visible within WME - as this is a one-shot action, the slight loss
    // of efficiency from reapplying the same styles to the ones we've already dealt with is less of an issue than the
    // increased complexity of having the code figure out which ones it does and doesn't need to restyle this time.
    //
    // And yes, this affords me the ideal opportunity to complain once again about how annoying shadowroots are - in the
    // good old days all of this would have been accomplished with a simple addition to the global CSS overrides FUME
    // can still use for *some* stuff, yet here we are having to use event handlers and DOM content checking and iterative
    // applications of styles to individual elements.

    const srProbe = document
      .querySelector("#areas")
      ?.querySelector("wz-option")
      ?.shadowRoot?.querySelector(".wz-menu-item")
    const srExists = srProbe != null && srProbe != undefined

    if (srExists === true) {
      restyleDropDownEntries()
    } else {
      window.setTimeout(checkForIssuesFilter, 100)
    }
  }
  function applyEnhancements() {
    shrinkTopBars()
    compressSegmentTab()
    restyleReports()
    enhanceChat()
    compressLayersMenu()
    moveUserInfo()
  }
  function moveSVRecentreIcons() {
    const fname = "moveSVRecentreIcons"
    if (getById("_cbMoveZoomBar").checked) {
      if (getById("WMEFUzoom") === null) return
      // Apply the styling related to the zoombar, so that we can get an accurate read of its
      // size/location in a moment...
      let styles = `
        .olControlPanZoomBar {
          left: 10px;
          top: 35px;
          height: 158px;
          border: 1px solid #f0f2f2;
          background-color: #f0f2f2;
          border-radius: 30px;
          width: 24px;
          box-sizing: initial;
        }
        .olButton {
          background-color: var(--color-white);
          border-radius: 30px;
          width: 24px;
          height: 24px;
          cursor: pointer;
        }
        .olControlZoomButton {
          padding: 3px 5px;
          font-size: 18px;
        }
        .yslider-stops {
          width: 24px;
          height: 110px;
          background-color: #f3f3f3;
          background-image: linear-gradient(
              90deg,
              transparent 45%,
              #dedede 45%,
              #dedede 55%,
              transparent 55%
            ),
            linear-gradient(#dedede 1px, transparent 1px);
          background-size: 50% 8px;
          background-repeat: repeat-y;
          background-position: 6px;
        }
        .slider {
          position: absolute;
          font-size: 15px;
          font-weight: 900;
          line-height: 1;
          text-align: center;
          width: 24px;
          height: 18px;
          margin-top: -29px;
          padding-top: 1px;
          border: 1px solid lightgrey;
          border-radius: 10px;
          background-color: var(--color-white);
          cursor: ns-resize;
        }

        `
      addStyle(PREFIX + fname, styles)

      // Force a re-render of the zoombar, so that the graphics elements which are missing at this point
      // get inserted - this is also required to get an accurate size/location read...
      ZLI()

      // Get the absolute positions/sizes of the newly generated zoombar, the existing element that contains
      // the SV and location buttons, and the size of the SV button
      const zbBCR = getById("WMEFUzoom").getBoundingClientRect()
      const bcBCR = getByClass(
        "bottom overlay-buttons-container",
      )[0].getBoundingClientRect()
      const btnBCR = getByClass(
        "street-view-control",
      )[0].getBoundingClientRect()
      // Use this information to calculate what the x/y positions will need to be for the buttons to position
      // them correctly below the zoombar.  Note that the x position will be negative, as this gets applied
      // relative to the parent container in which the button container resides, rather than to the map view
      const bcPosX = zbBCR.left - bcBCR.left
      const bcPosY = zbBCR.top + zbBCR.height
      // Also work out how tall the button container will need to be once we've hidden the native zoom
      // controls
      const bcHeight = btnBCR.height * 2 + 10

      // Now apply the full set of styling...
      styles = `
				.olControlPanZoomBar {
				  left: 10px;
				  top: 35px;
				  height: 158px;
				  border: 1px solid #f0f2f2;
				  background-color: #f0f2f2;
				  border-radius: 30px;
				  width: 24px;
				  box-sizing: initial;
				}
				.olButton {
				  background-color: var(--color-white);
				  border-radius: 30px;
				  width: 24px;
				  height: 24px;
				  cursor: pointer;
				}
				.olControlZoomButton {
				  padding: 3px 5px;
				  font-size: 18px;
				}
				.yslider-stops {
				  width: 24px;
				  height: 110px;
				  background-color: #f3f3f3;
				  background-image: linear-gradient(
				      90deg,
				      transparent 45%,
				      #dedede 45%,
				      #dedede 55%,
				      transparent 55%
				    ),
				    linear-gradient(#dedede 1px, transparent 1px);
				  background-size: 50% 8px;
				  background-repeat: repeat-y;
				  background-position: 6px;
				}
				.slider {
				  position: absolute;
				  font-size: 15px;
				  font-weight: 900;
				  line-height: 1;
				  text-align: center;
				  width: 24px;
				  height: 18px;
				  margin-top: -29px;
				  padding-top: 1px;
				  border: 1px solid lightgrey;
				  border-radius: 10px;
				  background-color: var(--color-white);
				  cursor: ns-resize;
				}
				.zoom-bar-container {
				  display: none;
				}
				.panel.show {
				  margin-left: 55px;
				}
				.bottom.overlay-buttons-container {
				  position: absolute;
				  left: ${bcPosX}px;
				  top: ${bcPosY}px;
				  height: ${bcHeight}px;
				}
				.street-view-region {
				  margin-bottom: 8px;
				}
			`

      addStyle(PREFIX + fname, styles)

      ZLI()
    } else {
      removeStyle(PREFIX + fname)
    }
  }
  async function createZoomBar() {
    if (options.moveZoomBar) {
      // Create the zoombar element and add it to the map view
      yslider = document.createElement("div")
      yslider.position.x = 10
      yslider.position.y = 35
      yslider.id = "WMEFUzoom"
      W.map.addControl(yslider)

      while (typeof jQuery.ui === "undefined") {
        await sleep(1000)
      }

      // Set up the zoom bar
      $("#WMEFUzoom").slider({
        orientation: "vertical",
        range: "min",
        min: 4,
        max: 22,
        value: W.map.zoom,
        slide(event, ui) {
          W.map.zoomTo(ui.value)
        },
      })

      W.map.events.register("zoomend", null, ZLI)
      zliResizeObserver = new ResizeObserver(ZLIDeferred)
      zliResizeObserver.observe(
        document.getElementById("street-view-container"),
      )
      zliResizeObserver.observe(document.getElementById("sidebar"))
    } else {
      if (yslider) {
        yslider.destroy()
      }
      W.map.events.unregister("zoomend", null, ZLI)
      if (zliResizeObserver !== null) {
        zliResizeObserver.disconnect()
      }
    }
    moveSVRecentreIcons()
  }
  function ZLIDeferred() {
    // The ResizeObserver attached to the StreetView container fires not only when the container is
    // opened or closed, but also when its width is altered by dragging the vertical divider.  On
    // some systems, the RO events that are triggered by this latter type of resizing are processed
    // before the StreetView container has finished redrawing - on such systems, if we were to call
    // ZLI directly from the RO event, the zoom bar would end up being trashed again if the user
    // resized using the divider, so we add a short delay after the RO event before calling ZLI.
    setTimeout(ZLI, 200)
    // Likewise for the function used to relocate the SV and recentre icons...
    setTimeout(moveSVRecentreIcons, 200)
  }
  function ZLI() {
    if (yslider) {
      // Need to reset the OpenLayers-created settings from the zoom bar when it's redrawn
      // Overall bar
      yslider.div.style.left = ""
      yslider.div.style.top = ""
      // zoom in/out buttons
      yslider.buttons[0].style = ""
      yslider.buttons[0].innerHTML = modifyHTML(
        "<div class='olControlZoomButton fa fa-plus' ></div>",
      )
      yslider.buttons[1].style = ""
      yslider.buttons[1].innerHTML = modifyHTML(
        "<div class='olControlZoomButton fa fa-minus' ></div>",
      )
      // slider stops
      yslider.zoombarDiv.classList.add("yslider-stops")
      yslider.zoombarDiv.classList.remove("olButton")
      yslider.zoombarDiv.style = ""
      // slider
      yslider.slider.innerHTML = modifyHTML("")
      yslider.slider.style = ""
      yslider.slider.classList.add("slider")
      yslider.moveZoomBar()
      // Actually set the ZLI
      yslider.slider.innerText = W.map.getZoom()
      yslider.slider.title = "Zoom level indicator by WMEFU"
      switch (W.map.getZoom()) {
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
          yslider.slider.style.background = "#ef9a9a"
          yslider.slider.title +=
            "\nCannot permalink any segments at this zoom level"
          break
        case 14:
        case 15:
          yslider.slider.style.background = "#ffe082"
          yslider.slider.title +=
            "\nCan only permalink primary or higher at this zoom level"
          break
        default:
          yslider.slider.style.background = "#ffffff"
          yslider.slider.title +=
            "\nCan permalink any segments at this zoom level"
          break
      }

      if (W.map.getZoom() < 12) {
        // Re-enable the sidepanel UI if the user has opted to do so...
        if (options.reEnableSidePanel) {
          if (
            document.getElementsByClassName("overlay editingDisabled").length >
            0
          ) {
            document
              .getElementsByClassName("overlay editingDisabled")[0]
              .remove()
          }
        }

        // ...and always relocate the warning dialog you get if the feed tab is active, so that
        // it sits nicely below the tabs regardless of how many there are.
        if (
          document.getElementsByClassName("zoom-edit-message editingDisabled")
            .length > 0
        ) {
          let eTop = document
            .getElementById("user-tabs")
            .getBoundingClientRect().height
          eTop = `${Math.round(eTop)}px`
          document.getElementsByClassName(
            "zoom-edit-message editingDisabled",
          )[0].style.top = eTop
          document.getElementsByClassName(
            "zoom-edit-message editingDisabled",
          )[0].style.left = "0px"
        }
      }
    }
  }
  function resizeSearch() {
    const sb = document.querySelector("#search")
    if (options.resizeSearchBox) {
      sb.style.width = "100%"
      const wcs = window.getComputedStyle(
        document.querySelector("#primary-toolbar"),
      )
      const tbAvailable = parseInt(wcs.marginLeft) + parseInt(wcs.marginRight)
      if (tbAvailable > 0) {
        sb.style.width = `${tbAvailable}px`
      }
    } else {
      sb.style.width = ""
    }
  }
  function moveSearchThisArea() {
    if (
      document.querySelector("div.w-icon-search")?.parentElement
        ?.parentElement !== undefined
    ) {
      document.querySelector(
        "div.w-icon-search",
      ).parentElement.parentElement.style.zIndex = "5"
    }
  }
  function moveUserInfo() {
    // Now functioning correctly for prod & beta
    const fname = "moveUserInfo"
    let styles = ""
    let mStyle = ""

    if (getById("_cbMoveUserInfo").checked) {
      // styles += '#user-box-region { margin-left: 5px; }';
      styles += ".notifications-button { display: flex; }"
      styles += "#app-head aside #left-app-head .waze-logo { width: 50px; }"
      styles += ".user-toolbar .notifications-button { padding: 0 4px; }"
      styles +=
        ".notifications-box-container { transform: translate3d(300px, 0px, 0px) !important; }"

      addStyle(PREFIX + fname, styles)

      insertNodeBeforeNode(
        document.querySelector(".user-toolbar"),
        getById("left-app-head"),
      )
      insertNodeBeforeNode(
        document.querySelector("wz-user-box"),
        getById("left-app-head"),
      )

      mStyle = "translate3d(240px, 0px, 0px)"

      // Fix to move control button of Invalidated Camera Mass Eraser
      if (getById("_UCME_btn")) {
        getById("advanced-tools").appendChild(getById("_UCME_btn"))
        getById("UCME_btn").parentNode.removeChild(getById("UCME_btn"))
      }
    } else {
      removeStyle(PREFIX + fname)
      insertNodeAfterNode(
        document.querySelector("wz-user-box"),
        document.querySelector("#save-button").parentElement.parentElement,
      )
      insertNodeAfterNode(
        document.querySelector(".user-toolbar"),
        document.querySelector("#save-button").parentElement.parentElement,
      )
    }

    unfloat()

    // Keep the user profile box aligned to the profile picture
    let sr = document.querySelector("wz-user-box")
    if (sr !== null) sr = sr.shadowRoot
    if (sr !== null) {
      const mObj = sr.querySelector("wz-menu")
      if (mObj !== null) {
        mObj.style.transform = mStyle
      }
    }
  }
  function RemoveTopBarCompression() {
    document
      .getElementsByTagName("wz-header")[0]
      .shadowRoot.querySelector(".content-wrapper").style.height = ""
    const bObj = document.getElementsByClassName("restricted-driving-area")[0]
      .parentElement
    bObj.style.position = ""
  }
  function ApplyTopBarShadowRootWzButtonCompression() {
    let retval = true

    if (getById("_cbShrinkTopBars").checked) {
      const compress = getById("_inpUICompression").value
      if (compress > 0) {
        const c1 = ["", "35px", "24px"]
        const tbRoot = document.querySelector("#app-head")
        if (tbRoot != null) {
          const btnWraps = tbRoot.querySelectorAll(".toolbar-button-wrapper")
          for (let i = 0; i < btnWraps.length; ++i) {
            const btnElm = btnWraps[i].querySelector("wz-button")

            if (btnElm !== undefined) {
              const srButton = btnElm?.shadowRoot?.querySelector(".wz-button")
              if (srButton !== undefined && srButton !== null) {
                srButton.style.height = c1[compress]
              } else {
                retval = false
              }
            }
          }
        }
      }
    }
    return retval
  }
  function shrinkTopBars() {
    const fname = "shrinkTopBars"
    let styles = ""
    if (getById("_cbShrinkTopBars").checked) {
      const contrast = getById("_inpUIContrast").value
      const compress = getById("_inpUICompression").value

      // always do this stuff
      // event mode button
      styles +=
        "#mode-switcher-region .title-button .icon { font-size: 13px; font-weight: bold; color: var(--color-black); }"
      // black bar
      styles += "#topbar-container { pointer-events: none; }"
      styles +=
        "#map #topbar-container .topbar > div { pointer-events: initial; }"
      // change toolbar buttons - from JustinS83
      $("#mode-switcher-region .title-button .icon").removeClass(
        "w-icon-caret-down",
      )
      $("#mode-switcher-region .title-button .icon").addClass("fa fa-calendar")
      // HN editing tweaks
      styles += "#map-lightbox .content { pointer-events: none; }"
      styles += "#map-lightbox .content > div { pointer-events: initial; }"
      styles +=
        "#map-lightbox .content .header { pointer-events: none !important; }"
      styles +=
        ".toolbar .toolbar-button.add-house-number { background-color: #61cbff; float: right; font-weight: bold; }"
      styles +=
        ".waze-icon-exit { background-color: #61cbff; font-weight: bold; }"
      // event mode button
      styles +=
        ".toolbar.toolbar-mte .add-button { background-color: orange; font-weight: bold; }"

      // fix for narrow windows and new toolbar
      const nbuttons = 3 + (getById("_cbUnfloatButtons").checked ? 2 : 0)
      const minW = nbuttons * [58, 49, 33][compress] + [80, 65, 55][compress]
      styles += `#edit-buttons { min-width: ${minW}px; }`
      styles += "#toolbar { padding: 0px ; }"

      if (compress > 0) {
        const c1 = ["", "35px", "24px"]
        const c2 = ["", "13px", "12px"]

        // if we're in beta, remove the WME logo/beta badge (which isn't so important) to leave space for the build ID (which is)
        if (document.getElementById("env-badge") !== null) {
          styles += "#logo-and-env { display: none !important; }"
        }

        // overall menu bar
        styles += `#left-app-head { height: ${c1[compress]} !important; }`
        styles += `#app-head { height: ${c1[compress]}; }`
        styles += `#toolbar { height: ${c1[compress]} !important; }`

        styles += `.group-title-tooltip-wrap { height: ${
          c1[compress]
        } !important; }`
        styles += `.restricted-driving-area wz-tooltip-target { height: ${
          c1[compress]
        } !important; }`
        styles += `.edit-area { height: calc(100% - ${c1[compress]}); }`
        styles += `#primary-toolbar>div { height: ${c1[compress]}; }`
        styles += `#user-toolbar { height: ${c1[compress]}; }`
        styles += `wz-user-box { scale: ${(parseInt(c1[compress]) * 100) / 36}%; }`

        styles += `#app-head aside .short-title { font-size: ${
          c2[compress]
        }; margin-right: 4px; }`
        styles += `#app-head aside #debug { padding-right: ${
          ["", "10px", "6px"][compress]
        }; line-height: ${
          ["", "15px", "12px"][compress]
        }; white-space: nowrap; }`

        styles += `.mode-switcher-view .title-button .icon { line-height: ${
          c1[compress]
        }; }`
        styles += `.mode-switcher-view .dropdown-menu { top: ${c1[compress]}; }`
        styles += `.toolbar { font-size: ${c2[compress]}; }`
        styles += `.toolbar { height: ${c1[compress]} !important; }`

        styles += ".toolbar { gap: 4px; }"
        styles += ".toolbar-collection-view { gap: 4px !important; }"
        styles += ".toolbar .toolbar-group { margin-right: 0px !important; }"
        styles += "#edit-buttons { gap: 2px; }"
        styles += "#search { flex: 2 1 auto; }"

        // search box
        styles += `#search { padding-top: ${
          ["", "3px", "1px"][compress]
        } !important; }`
        styles += `.form-search { height: ${["", "27px", "22px"][compress]}; }`
        styles += `.form-search .search-query { height: ${
          ["", "27px", "22px"][compress]
        }; font-size: ${c2[compress]}; }`
        styles += `.form-search .input-wrapper .search-icon { font-size: ${
          ["", "18px", "16px"][compress]
        }; left: ${["", "9px", "6px"][compress]}; }`
        styles += `.form-search .search-query { padding-left: ${
          ["", "34px", "24px"][compress]
        };; }`

        // edit-buttons section
        styles += `#edit-buttons { margin-right: ${
          ["", "9px", "2px"][compress]
        }; }`
        // toolbar dropdowns
        styles += `.toolbar .toolbar-group { margin-right: ${
          ["", "14px", "8px"][compress]
        }; padding-top: 0px; height: ${c1[compress]}; }`
        styles += `.toolbar .group-title { height: ${
          ["", "34px", "24px"][compress]
        }; line-height: ${["", "34px", "24px"][compress]}; }`
        styles += `.toolbar .dropdown-menu { top: ${
          ["", "34px", "24px"][compress]
        } !important; left: ${["", "7px", "4px"][compress]} !important; }`
        styles += `wz-menu { top: ${["", "34px", "24px"][compress]} !important; }`

        // toolbar buttons
        styles += `.toolbar .toolbar-button { margin-top: ${
          ["", "3px", "1px"][compress]
        }; margin-left: 3px; padding-left: ${
          ["", "10px", "5px"][compress]
        }; padding-right: ${["", "10px", "5px"][compress]}; height: ${
          ["", "27px", "22px"][compress]
        }; line-height: ${["", "27px", "22px"][compress]}; }`
        styles += `.toolbar .toolbar-button { padding-left: ${
          ["", "2px", "2px"][compress]
        }; padding-right: ${["", "2px", "2px"][compress]}; }`
        styles += `.toolbar .toolbar-button .item-container { padding-left: ${
          ["", "9px", "2px"][compress]
        }; padding-right: ${["", "9px", "2px"][compress]}; }`
        styles += `.toolbar .item-icon { font-size: ${
          ["", "22px", "20px"][compress]
        } !important; }`

        styles += `.toolbar .toolbar-button > .item-icon { top: ${
          ["", "5px", "2px"][compress]
        }; }`
        styles += `.toolbar .toolbar-separator { height: ${
          ["", "34px", "22px"][compress]
        }; }`

        styles += ".toolbar-button-wrapper { padding: 0!important; }"

        // extra hack for my Permalink Counter button
        styles += `.WMEFUPCicon { margin-top: ${
          ["", "4px !important", "2px !important"][compress]
        }; }`
        // floating buttons
        styles += `.overlay-button { height: ${
          ["", "33px", "26px"][compress]
        }; width: ${["", "33px", "26px"][compress]}; font-size: ${
          ["", "22px", "20px"][compress]
        }; padding: ${["", "3px", "1px"][compress]}; }`
        styles += `#Info_div { height: ${
          ["", "33px", "26px"][compress]
        } !important; width: ${["", "33px", "26px"][compress]} !important; }`
        styles += `.zoom-bar-container {width: ${
          ["", "33px", "26px"][compress]
        } !important; }`
        styles += `.zoom-bar-container .overlay-button {height: ${
          ["", "33px", "26px"][compress]
        } !important; }`
        styles +=
          "#overlay-buttons .overlay-buttons-container > div:last-child { margin-bottom: 0; }"
        // layers menu
        // styles += '.layer-switcher .toolbar-button { margin-top: ' + ['','1px','0px'][compress] + ' !important; font-size: ' + ['','22px','20px'][compress] + ' !important; height: ' + ['','32px','24px'][compress] + '; }';
        // user button
        styles += `#user-box-region { margin-right: ${
          ["", "8px", "2px"][compress]
        }; }`
        styles += `.user-box-avatar { height: ${
          ["", "32px", "23px"][compress]
        } !important; font-size: ${["", "22px", "20px"][compress]}; }`
        styles += `.app .level-icon { width: ${
          ["", "32px", "23px"][compress]
        } !important;  height: ${["", "32px", "23px"][compress]} !important;}`
        // new save menu
        styles += `.changes-log-region { top: ${["", "26px", "21px"][compress]}; }`
        // black bar
        styles += `.topbar { height: ${
          ["", "24px", "18px"][compress]
        }; line-height: ${["", "24px", "18px"][compress]}; }`
        // fix for WME Presets button
        styles += "#WMEPresetsDiv > i { height: 100%;}"
        // remove the unecessary space to the left of the notification icon
        styles += ".secondary-toolbar-spacer { display: none; }"

        // All the stuff that can no longer be done via CSS due to shadowroot...
        ApplyTopBarShadowRootWzButtonCompression()

        document
          .querySelector("wz-header")
          .shadowRoot.querySelector(".content-wrapper").style.height =
          c1[compress]
        document
          .querySelector("wz-header")
          .shadowRoot.querySelector(".content-wrapper").style.padding =
          "0px 16px 0px 16px"
        document
          .querySelector("#delete-button")
          .shadowRoot.querySelector("button")
          .setAttribute("style", "height: auto!important;")
        document
          .querySelector("#undo-button")
          .shadowRoot.querySelector("button")
          .setAttribute("style", "height: auto!important;")
        document
          .querySelector("#redo-button")
          .shadowRoot.querySelector("button")
          .setAttribute("style", "height: auto!important;")
        document
          .querySelector("#notification-button")
          .shadowRoot.querySelector("button")
          .setAttribute("style", "height: auto!important;")

        document
          .querySelector(".reload-button")
          .shadowRoot.querySelector("button")
          .setAttribute("style", "min-width: auto!important;")
        document
          .querySelector(".layer-switcher-button")
          .shadowRoot.querySelector("button")
          .setAttribute("style", "min-width: auto!important;")
      } else {
        RemoveTopBarCompression()
      }
      if (contrast > 0) {
        // toolbar dropdown menus
        styles += ".toolbar .group-title { color: var(--color-black); }"
        styles += `.toolbar .toolbar-button { border-radius: 8px; ${GetBorderContrast(
          contrast,
          false,
        )}color: var(--color-black); }`
        // layers icon - until Waze fix it
        styles +=
          ".layer-switcher .waze-icon-layers.toolbar-button{ background-color: var(--color-white); }"
      }
      addStyle(PREFIX + fname, styles)
    } else {
      removeStyle(PREFIX + fname)
      // change toolbar buttons - from JustinS83
      $("#mode-switcher-region .title-button .icon").removeClass(
        "fa fa-calendar",
      )
      $("#mode-switcher-region .title-button .icon").addClass(
        "fa fa-angle-down",
      )

      RemoveTopBarCompression()
    }

    window.dispatchEvent(new Event("resize"))
  }
  function FALSEcompressSegmentTab() {
    getById("_cbCompressSegmentTab").checked =
      getById("_cbextraCBSection").checked
    compressSegmentTab()
  }
  function compressSegmentTab() {
    const fname = "compressSegmentTab"

    // Apply a permanently active styling fix to enable wrapping in the drives tab,
    // to counter the effects of lengthening the datetime string format...
    let styles = `
      .list-item-card-title { white-space: pre-wrap; }
    `

    addStyle(`${PREFIX + fname}_permanent`, styles)

    // Now go and do the optional styling stuff
    styles = ""
    if (getById("_cbCompressSegmentTab").checked) {
      const contrast = getById("_inpUIContrast").value
      const compress = getById("_inpUICompression").value

      styles += `
        #sidebar .tab-content .tab-pane { padding: 0; }
        #sidebar #links:before { display: none; }
        .map-comment-name-editor .edit-button { display: block !important; }
        .closures-list { height: auto; }
      `

      if (compress > 0) {
        // Lock level
        styles += ".lock-level-selector { display: flex; }"
        styles +=
          "#edit-panel .lock-edit-view label { line-height: 140% !important; }"
        styles +=
          "#edit-panel .lock-edit-view label { height: auto !important; width: auto !important; }"
        styles +=
          "#edit-panel .lock-edit-view label { margin-right: 2px !important; }"
        styles +=
          "#edit-panel .lock-edit-view label { margin-bottom: 6px !important; }"
        // general compression enhancements
        styles += `#sidebar { line-height: ${
          ["", "18px", "16px"][compress]
        } !important;}`
        styles += `#sidebar .tab-content .tab-pane { padding: ${
          ["", "8px", "1px"][compress]
        }; }`
        styles += `#sidebar #sidebarContent { font-size: ${
          ["", "13px", "12px"][compress]
        }; }`
        styles += `#sidebar #advanced-tools { padding: ${
          ["", "0 9px", "0 4px"][compress]
        }; }`
        styles += `#sidebar .waze-staff-tools { margin-bottom: ${
          ["", "9px", "4px"][compress]
        }; height: ${["", "25px", "20px"][compress]}; }`
        styles += `#sidebar .categories-card-content { row-gap: ${
          ["", "3px", "0px"][compress]
        }; }`
        // Tabs
        styles += `#sidebar .nav-tabs { padding-bottom: ${
          ["", "3px", "2px"][compress]
        }; }`
        styles += `#sidebar #user-info #user-tabs { padding: ${
          ["", "0 9px", "0 4px"][compress]
        }; }`
        styles += `#sidebar .tabs-container { padding: ${
          ["", "0 9px", "0 4px"][compress]
        }; }`
        styles += `#sidebar .nav-tabs li a { margin-top: ${
          ["", "2px", "1px"][compress]
        }; margin-left: ${["", "3px", "1px"][compress]}; padding: ${
          ["", "0 6px", "0 2px"][compress]
        }; line-height: ${["", "24px", "21px"][compress]}; height: ${
          ["", "24px", "21px"][compress]
        }; }`
        styles += "#sidebar .nav-tabs li { flex-grow: 0; }"
        // Feed
        styles += `.feed-item { margin-bottom: ${["", "3px", "1px"][compress]}; }`
        styles += `.feed-item .inner { padding: ${["", "5px", "0px"][compress]}; }`
        styles += `.feed-item .content .title { margin-bottom: ${
          ["", "1px", "0px"][compress]
        }; }`
        styles += `.feed-item .motivation { margin-bottom: ${
          ["", "2px", "0px"][compress]
        }; }`
        // Drives & Areas
        styles += `#sidebar .message { margin-bottom: ${
          ["", "6px", "2px"][compress]
        }; }`
        styles += `#sidebar .result-list .result { padding: ${
          ["", "6px 17px", "2px 9px"][compress]
        }; margin-bottom: ${["", "3px", "1px"][compress]}; }`
        styles +=
          "#sidebar .result-list .session { background-color: lightgrey; }"
        styles +=
          "#sidebar .result-list .session-available { background-color: var(--color-white); }"
        styles +=
          "#sidebar .result-list .result.selected { background-color: lightgreen; }"
        styles += "div#sidepanel-drives { height: auto !important; }"

        // SEGMENT EDIT PANEL
        // general changes
        // checkbox groups
        styles += `#sidebar .controls-container { padding-top: ${
          ["", "4px", "1px"][compress]
        }; display: inline-block; font-size: ${
          ["", "12px", "11px"][compress]
        }; }`
        styles += `#sidebar .controls-container input[type="checkbox"] + label { padding-left: ${
          ["", "21px", "17px"][compress]
        } !important; } }`
        // form groups
        styles += `#sidebar .form-group { margin-bottom: ${
          ["", "5px", "0px"][compress]
        }; }`
        // dropdown inputs
        styles += `#sidebar .form-control { height: ${
          ["", "27px", "19px"][compress]
        }; padding-top: ${["", "4px", "0px"][compress]}; padding-bottom: ${
          ["", "4px", "0px"][compress]
        }; font-size: ${
          ["", "13px", "12px"][compress]
        }; color: var(--color-black); }`
        // buttons
        styles += `#edit-panel .waze-btn { padding-top: 0px !important; padding-bottom: ${
          ["", "3px", "1px"][compress]
        }; height: ${["", "20px", "18px"][compress]} !important; line-height: ${
          ["", "20px", "18px"][compress]
        } !important; font-size: ${["", "13px", "12px"][compress]}; }`
        //			styles += '#edit-panel .waze-btn { padding-top: ' + ['','3px','0px'][compress] + ' !important; padding-bottom: ' + ['','3px','1px'][compress] + '; height: ' + ['','20px','18px'][compress] + ' !important; line-height: ' + ['','20px','18px'][compress] + ' !important; font-size: ' + ['','13px','12px'][compress] + '; }';
        // radio button controls
        styles += `.waze-radio-container label { height: ${
          ["", "19px", "16px"][compress]
        }; width: ${["", "19px", "16px"][compress]}; line-height: ${
          ["", "19px", "16px"][compress]
        }; font-size: ${["", "13px", "12px"][compress]}; margin-bottom: ${
          ["", "3px", "1px"][compress]
        }; }`
        styles += `.waze-radio-container label { width: auto; padding-left: ${
          ["", "6px", "3px"][compress]
        } !important; padding-right: ${
          ["", "6px", "3px"][compress]
        } !important; }`
        // text input areas
        styles += "#sidebar textarea.form-control { height: auto; }"
        styles += "#sidebar textarea { max-width: unset; }"
        // specific changes
        // Selected segments info
        styles += `#edit-panel .selection { padding-top: ${
          ["", "8px", "2px"][compress]
        }; padding-bottom: ${["", "8px", "4px"][compress]}; }`
        styles += `#edit-panel .segment .direction-message { margin-bottom: ${
          ["", "9px", "3px"][compress]
        }; }`
        // Segment details (closure warning)
        styles += `#edit-panel .segment .segment-details { padding: ${
          ["", "10px", "5px"][compress]
        }; padding-top: 0px; }`
        // All control labels
        styles += `#edit-panel .control-label { font-size: ${
          ["", "11px", "10px"][compress]
        }; margin-bottom: ${["", "4px", "1px"][compress]}; }`
        // Address input
        styles += `#edit-panel .address-edit-view { cursor: pointer; margin-bottom: ${
          ["", "6px", "2px"][compress]
        }!important; }`
        styles += `#edit-panel .address-edit-input { padding: ${
          ["", "4px", "1px"][compress]
        }; font-size: ${["", "13px", "12px"][compress]}; }`
        styles += `.tts-button { height: ${["", "28px", "21px"][compress]}; }`
        // alt names
        styles += `.alt-street-list { margin-bottom: ${
          ["", "4px", "0px"][compress]
        }; }`
        styles += `#edit-panel .add-alt-street-form .alt-street { padding-top: ${
          ["", "13px", "3px"][compress]
        }; padding-bottom: ${["", "13px", "3px"][compress]}; }`
        styles += `#edit-panel .add-alt-street-form .alt-street .alt-street-delete { top: ${
          ["", "12px", "4px"][compress]
        }; }`
        styles += `#edit-panel .segment .address-edit-view .address-form .action-buttons { padding-top: ${
          ["", "11px", "6px"][compress]
        }; padding-bottom: ${["", "11px", "6px"][compress]}; margin-top: ${
          ["", "5px", "0px"][compress]
        }; height: ${["", "45px", "28px"][compress]}; }`
        styles += `#edit-panel .add-alt-street-form .new-alt-street { padding-top: ${
          ["", "8px", "3px"][compress]
        }; padding-bottom: ${["", "8px", "3px"][compress]}; }`
        // restrictions control
        styles += `#edit-panel .restriction-list { margin-bottom: ${
          ["", "5px", "0px"][compress]
        }; }`
        // speed limit controls
        styles += `#edit-panel .speed-limit { margin-top: ${
          ["", "0px", "-5px"][compress]
        }; margin-bottom: ${["", "5px", "2px"][compress]};}`
        styles += `#edit-panel .segment .speed-limit label { margin-bottom: ${
          ["", "3px", "1px"][compress]
        }; }`
        styles += `#edit-panel .segment .speed-limit .form-control { height: ${
          ["", "23px", "19px"][compress]
        }; padding-top: ${["", "4px", "2px"][compress]}; font-size: ${
          ["", "13px", "12px"][compress]
        }; width: 5em; margin-left: 0px; }`
        styles += `#edit-panel .segment .speed-limit .direction-label { font-size: ${
          ["", "12px", "11px"][compress]
        }; line-height: ${["", "2.0em", "1.8em"][compress]}; }`
        styles += `#edit-panel .segment .speed-limit .unit-label { font-size: ${
          ["", "12px", "11px"][compress]
        }; line-height: ${["", "2.0em", "1.8em"][compress]}; margin-left: 0px;}`
        styles +=
          "#edit-panel .segment .speed-limit .average-speed-camera { margin-left: 40px; }"
        styles +=
          "#edit-panel .segment .speed-limit .average-speed-camera .camera-icon { vertical-align: top; }"
        styles += `#edit-panel .segment .speed-limit .verify-buttons { margin-bottom: ${
          ["", "5px", "0px"][compress]
        }; }`
        // more actions section
        styles += `#edit-panel .more-actions { padding-top: ${
          ["", "6px", "2px"][compress]
        }; }`
        styles +=
          "#edit-panel .more-actions .waze-btn.waze-btn-white { padding-left: 0px; padding-right: 0px; }"

        // additional attributes
        styles += `#edit-panel .additional-attributes { margin-bottom: ${
          ["", "3px", "1px"][compress]
        }; }`
        // history items
        styles += `.toggleHistory { padding: ${["", "7px", "3px"][compress]}; }`
        styles += `.element-history-item:not(:last-child) { margin-bottom: ${
          ["", "3px", "1px"][compress]
        }; }`
        styles += `.element-history-item .tx-header { padding: ${
          ["", "6px", "2px"][compress]
        }; }`
        styles += `.element-history-item .tx-header .tx-author-date { margin-bottom: ${
          ["", "3px", "1px"][compress]
        }; }`
        styles += `.element-history-item .tx-content { padding: ${
          ["", "7px 7px 7px 22px", "4px 4px 4px 22px"][compress]
        }; }`
        styles += `.loadMoreContainer { padding: ${
          ["", "5px 0px", "3px 0px"][compress]
        }; }`
        // closures tab
        styles += `.closures-tab wz-button { transform: scale(${
          ["", "0.85", "0.7"][compress]
        }); padding: 0px!important; }`
        styles += `.closures > div:not(.closures-list) { padding: ${
          ["", "0px", "0px"][compress]
        }; }`
        styles += `body { --wz-text-input-height: ${
          ["", "30px", "20px"][compress]
        }; }`
        styles += `body { --wz-select-height: ${["", "30px", "20px"][compress]}; }`
        styles += `input.wz-text-input { height: ${
          ["", "30px", "20px"][compress]
        }; }`
        styles += `.edit-closure .closure-nodes .closure-node-item .closure-node-control { padding: ${
          ["", "7px", "2px"][compress]
        }; }`
        // closures list
        styles += `.closures-list .add-closure-button { line-height: ${
          ["", "20px", "18px"][compress]
        }; }`
        styles += `.closures-list .closure-item:not(:last-child) { margin-bottom: ${
          ["", "6px", "2px"][compress]
        }; }`
        styles += `.closures-list .closure-item .details { padding: ${
          ["", "5px", "0px"][compress]
        }; font-size: ${["", "12px", "11px"][compress]}; }`
        styles += `.closures-list .closure-item .buttons { top: ${
          ["", "7px", "4px"][compress]
        }; }`
        // tweak for Junction Box button
        styles += "#edit-panel .junction-actions > button { width: inherit; }"

        // PLACE DETAILS
        styles += `#edit-panel .navigation-point-list { margin-bottom: ${
          ["", "4px", "0px"][compress]
        }; }`
        // alert
        styles += `#edit-panel .header-alert { margin-bottom: ${
          ["", "6px", "2px"][compress]
        }; padding: ${["", "6px 32px", "2px 32px"][compress]}; }`
        // address input
        styles += `#edit-panel .full-address { padding-top: ${
          ["", "4px", "1px"][compress]
        }; padding-bottom: ${["", "4px", "1px"][compress]}; font-size: ${
          ["", "13px", "12px"][compress]
        }; }`
        // alt names
        styles += `#edit-panel .aliases-view .list li { margin: ${
          ["", "12px 0", "4px 0"][compress]
        }; }`
        styles += "#edit-panel .aliases-view .delete { line-height: inherit; }"
        // categories
        styles += `#edit-panel .categories .select2-search-choice .category { margin: ${
          ["", "2px 0 2px 4px", "1px 0 1px 3px"][compress]
        }; height: ${["", "18px", "15px"][compress]}; line-height: ${
          ["", "18px", "15px"][compress]
        }; }`
        styles += `#edit-panel .categories .select2-search-field input { height: ${
          ["", "18px", "17px"][compress]
        }; }`
        styles += `#edit-panel .categories .select2-choices { min-height: ${
          ["", "26px", "19px"][compress]
        }; }`
        styles +=
          "#edit-panel .categories .select2-container { margin-bottom: 0px; }"
        // entry/exit points
        styles += `#edit-panel .navigation-point-view .navigation-point-list-item .preview { padding: ${
          ["", "3px 7px", "0px 4px"][compress]
        }; font-size: ${["", "13px", "12px"][compress]}; }`
        styles += `#edit-panel .navigation-point-view .add-button { height: ${
          ["", "28px", "18px"][contrast]
        }; line-height: ${["", "17px", "16px"][contrast]}; font-size: ${
          ["", "13px", "12px"][compress]
        }; }`
        // type buttons
        styles += `#sidebar .area-btn, #sidebar .point-btn { display: flex; align-items: center; justify-content: center; height: ${
          ["", "22px", "20px"][compress]
        }; line-height: ${["", "19px", "16px"][compress]}; font-size: ${
          ["", "13px", "12px"][compress]
        }; }`
        styles +=
          "#sidebar .area-btn:before, #sidebar .point-btn:before { top: 0px; margin-right: 8px; }"
        // external providers
        styles += `.select2-container { font-size: ${
          ["", "13px", "12px"][compress]
        }; }`
        styles += `#edit-panel .external-providers-view .external-provider-item { margin-bottom: ${
          ["", "6px", "2px"][compress]
        }; }`
        styles += `.external-providers-view > div > ul { margin-bottom: ${
          ["", "4px", "0px"][compress]
        }; }`
        styles += `#edit-panel .external-providers-view .add { padding: ${
          ["", "3px 12px", "1px 9px"][compress]
        }; }`
        styles += `#edit-panel .waze-btn.waze-btn-smaller { line-height: ${
          ["", "26px", "21px"][compress]
        }; }`
        // residential toggle
        styles += `#edit-panel .toggle-residential { height: ${
          ["", "27px", "22px"][compress]
        }; }`
        // more info
        styles += `.service-checkbox { font-size: ${
          ["", "13px", "12px"][compress]
        }; }`

        // PARKING LOT SPECIFIC
        styles += ".parking-type-option{ display: inline-block; }"
        styles += `.payment-checkbox { display: inline-block; min-width: ${
          ["", "48%", "31%"][compress]
        }; }`
        styles += `.service-checkbox { display: inline-block; min-width: 49%; font-size: ${
          ["", "12px", "11px"][compress]
        }; }`
        styles += ".lot-checkbox { display: inline-block; min-width: 49%; }"

        // MAP COMMENTS
        styles += `#sidebar .map-comment-name-editor { padding: ${
          ["", "10px", "5px"][compress]
        }; }`
        styles += `#sidebar .map-comment-name-editor .edit-button { margin-top: 0px; font-size: ${
          ["", "13px", "12px"][compress]
        }; padding-top: ${["", "3px", "1px"][compress]}; }`
        styles += `#sidebar .conversation-view .no-comments { padding: ${
          ["", "10px 15px", "5px 15px"][compress]
        }; }`
        styles += `#sidebar .map-comment-feature-editor .conversation-view .comment-list { padding-top: ${
          ["", "8px", "1px"][compress]
        }; padding-bottom: ${["", "8px", "1px"][compress]}; }`
        styles += `#sidebar .map-comment-feature-editor .conversation-view .comment-list .comment .comment-content { padding: ${
          ["", "6px 0px", "2px 0px"][compress]
        }; }`
        styles += `#sidebar .conversation-view .comment .text { padding: ${
          ["", "6px 9px", "3px 4px"][compress]
        }; font-size: ${["", "13px", "12px"][compress]}; }`
        styles += `#sidebar .conversation-view .new-comment-form { padding-top: ${
          ["", "10px", "5px"][compress]
        }; }`
        styles += `#sidebar .map-comment-feature-editor .clear-btn { height: ${
          ["", "26px", "19px"][compress]
        }; line-height: ${["", "26px", "19px"][compress]}; }`
        // Compression for WME Speedhelper
        styles += `.clearfix.controls.speed-limit { margin-top: ${
          ["", "-4px", "-8px"][compress]
        }; }`
        // Compression for WME Clicksaver
        styles += `.rth-btn-container { margin-bottom: ${
          ["", "2px", "-1px"][compress]
        }; }`
        styles += `#csRoutingTypeContainer { height: ${
          ["", "23px", "16px"][compress]
        } !important; margin-top: ${["", "-2px", "-4px"][compress]}; }`
        styles += `#csElevationButtonsContainer { margin-bottom: ${
          ["", "2px", "-1px"][compress]
        } !important; }`
        // tweak for WME Clicksaver tab controls
        styles += "#sidepanel-clicksaver .controls-container { width: 100%; }"
        // tweak for JAI tab controls
        styles += "#sidepanel-ja .controls-container { width: 100%; }"
        // tweaks for UR-MP Tracker
        styles += `#sidepanel-urt { margin-left: ${
          ["", "-5px", "0px"][compress]
        } !important; }`
        styles += `#urt-main-title { margin-top: ${
          ["", "-5px", "0px"][compress]
        } !important; }`
        // tweaks for my own panel
        styles += `#fuContent { line-height: ${
          ["", "10px", "9px"][compress]
        } !important; }`

        // scripts panel
        styles += "#user-tabs { padding: 0px !important; }"
      }

      if (contrast > 0) {
        // contrast enhancements

        // general
        styles += `#sidebar .form-group { border-top: 1px solid ${
          ["", "lightgrey", "grey"][contrast]
        }; }`
        styles += `#sidebar .text { color: ${
          ["", "darkslategrey", "black"][contrast]
        }; }`
        styles += "#sidebar {background-color: var(--color-primary-200); }"
        styles += ":root {--background_variant: #242628; }"

        // text colour
        styles += "#sidebar { color: var(--color-black); }"
        // advanced tools section
        styles += "#sidebar waze-staff-tools { background-color: #c7c7c7; }"
        // Tabs
        styles += `#sidebar .nav-tabs { ${GetBorderContrast(contrast, false)}}`
        styles += `#sidebar .nav-tabs li a { ${GetBorderContrast(contrast, true)}}`
        // Fix the un-noticeable feed refresh button
        styles +=
          "span.fa.fa-repeat.feed-refresh.nav-tab-icon { width: 19px; color: orangered; }"
        styles +=
          "span.fa.fa-repeat.feed-refresh.nav-tab-icon:hover { color: red; font-weight: bold; font-size: 15px; }"
        // Feed
        styles += `.feed-item { ${GetBorderContrast(contrast, false)}}`
        styles += `.feed-issue .content .title .type { color: ${
          ["", "black", "black"][contrast]
        }; font-weight: bold; }`
        styles += `.feed-issue .content .timestamp { color: ${
          ["", "darkslategrey", "black"][contrast]
        }; }`
        styles += `.feed-issue .content .subtext { color: ${
          ["", "darkslategrey", "black"][contrast]
        }; }`
        styles += ".feed-item .motivation { font-weight: bold; }"
        // Drives & Areas
        styles += `#sidebar .result-list .result { ${GetBorderContrast(
          contrast,
          false,
        )}}`
        // Segment edit panel
        styles += "#edit-panel .selection { font-size: 13px; }"
        styles +=
          "#edit-panel .segment .direction-message { color: orangered; }"
        styles += `#edit-panel .address-edit-input { color: var(--color-black); ${GetBorderContrast(
          contrast,
          false,
        )}}`
        styles += `#sidebar .form-control { ${GetBorderContrast(contrast, false)}}`
        // radio buttons when disabled
        styles +=
          '.waze-radio-container input[type="radio"]:disabled:checked + label { color: var(--color-black); opacity: 0.7; font-weight:600; }'
        // override border for lock levels
        styles +=
          "#sidebar .waze-radio-container { border: 0 none !important; }"
        styles += `#edit-panel .waze-btn { color: var(--color-black); ${GetBorderContrast(
          contrast,
          false,
        )}}`
        styles += `.waze-radio-container label  { ${GetBorderContrast(
          contrast,
          false,
        )}}`
        // history items
        styles +=
          ".toggleHistory { color: var(--color-black); text-align: center; }"
        styles +=
          ".element-history-item .tx-header { color: var(--color-black); }"
        styles += `.element-history-item .tx-header a { color: ${
          ["", "royalblue", "black"][contrast]
        }!important; }`
        styles += `.element-history-item.closed .tx-header { border-radius: 8px; ${GetBorderContrast(
          contrast,
          false,
        )}}`
        styles += `.loadMoreHistory { ${GetBorderContrast(contrast, false)}}`
        // closures list
        styles += `.closures-list .closure-item .details { border-radius: 8px; ${GetBorderContrast(
          contrast,
          false,
        )}}`
        styles +=
          ".closures-list .closure-item .dates { color: var(--color-black); }"
        styles +=
          ".closures-list .closure-item .dates .date-label { opacity: 1; }"
        // Place details
        // alert
        styles += "#edit-panel .alert-danger { color: red; }"
        // address input
        styles += `#edit-panel .full-address { color: var(--color-black); ${GetBorderContrast(
          contrast,
          false,
        )}}`
        styles += "#edit-panel a.waze-link { font-weight: bold; }"
        // the almost invisible alternate name link
        styles += `#edit-panel .add.waze-link { color: ${
          ["", "royalblue", "black"][contrast]
        }!important; }`
        // categories
        styles +=
          "#edit-panel .categories .select2-search-choice .category { text-transform: inherit; font-weight: bold; background: gray; }"
        // entry/exit points
        styles += `#edit-panel .navigation-point-view .navigation-point-list-item .preview { ${GetBorderContrast(
          contrast,
          false,
        )}}`
        styles += `#edit-panel .navigation-point-view .add-button { ${GetBorderContrast(
          contrast,
          false,
        )} margin-top: 2px; padding: 0 5px; color: ${
          ["", "royalblue", "black"][contrast]
        }!important; }`
        // type buttons
        styles += `#sidebar .point-btn { color: var(--color-black); ${GetBorderContrast(
          contrast,
          true,
        )}}`
        // external providers
        styles += `.select2-container { color: teal; ${GetBorderContrast(
          contrast,
          true,
        )}}`
        styles +=
          ".select2-container .select2-choice { color: var(--color-black); }"
        // residential toggle
        styles += "#edit-panel .toggle-residential { font-weight: bold; }"
        // COMMENTS
        styles += `.map-comment-name-editor { border-color: ${
          ["", "darkgrey", "grey"][contrast]
        }; }`
      }
      // fix for buttons of WME Image Overlay script
      styles +=
        "#sidepanel-imageoverlays > div.result-list button { height: 24px; }"
      addStyle(PREFIX + fname, styles)
    } else {
      removeStyle(PREFIX + fname)
      removeStyle(`${PREFIX}hideHeadlights`)
    }

    restyleDropDownEntries()
  }
  function restyleDropDownEntries() {
    const compress = getById("_inpUICompression").value
    const enabled = getById("_cbCompressSegmentTab").checked
    if (enabled === true && compress > 0) {
      compressDropDownEntries()
    } else {
      uncompressDropDownEntries()
    }
  }
  function compressDropDownEntries() {
    let n = document.querySelectorAll("wz-option").length
    while (n) {
      const obj = document.querySelectorAll("wz-option")[n - 1]
      if (obj != undefined) {
        const mi = obj.shadowRoot.querySelector(".wz-menu-item")
        if (mi != null) {
          mi.style.lineHeight = "130%"
          mi.style.height = "100%"
        }
      }
      --n
    }
  }
  function uncompressDropDownEntries() {
    let n = document.querySelectorAll("wz-option").length
    while (n) {
      const obj = document.querySelectorAll("wz-option")[n - 1]
      if (obj != undefined) {
        const mi = obj.shadowRoot.querySelector(".wz-menu-item")
        if (mi != null) {
          mi.style.lineHeight =
            "var(--wz-menu-option-height, var(--wz-option-height, 40px));"
          mi.style.height =
            "var(--wz-menu-option-height, var(--wz-option-height, 40px))"
        }
      }
      --n
    }
  }
  function hideUnuseableStuff() {
    if (W?.model?.getTopCountry === undefined) {
      // getTopCountry takes a short while to become available, so keep checking at regular
      // intervals until it's there to be used...
      setTimeout(hideUnuseableStuff, 100)
    } else {
      const fname = "hideUnuseableStuff"
      let styles = ""

      // Hide the headlights reminder checkbox for segments in countries that don't use it
      if (W?.model?.getTopCountry()?.allowHeadlightsReminderRank === null) {
        styles += ".headlights-reminder { display: none !important; }"
      }

      // Hide the restricted areas toolbar button for anyone who can't make use of it
      if (
        document.querySelector("wz-button.restricted-driving-area").disabled ===
        true
      ) {
        styles +=
          "wz-button.restricted-driving-area { display: none !important; }"
      }

      if (styles !== "") {
        addStyle(PREFIX + fname, styles)
      }
    }
  }
  function compressLayersMenu() {
    const fname = "compressLayersMenu"
    removeStyle(PREFIX + fname)
    let styles = ""
    if (getById("_cbCompressLayersMenu").checked) {
      getById("layersColControls").style.opacity = "1"
      const contrast = getById("_inpUIContrast").value
      const compress = getById("_inpUICompression").value
      if (compress > 0) {
        // VERTICAL CHANGES
        // change menu to autoheight - not working
        // styles += '.layer-switcher .menu { height: auto; width: auto; max-height: calc(100% - 26px); overflow-y: scroll }';
        // change menu to auto-width
        styles += ".layer-switcher .menu { width: auto }"
        styles += ".layer-switcher .menu.hide-layer-switcher { left: 100% }"
        // menu title
        styles += `.layer-switcher .menu > .title { font-size: ${
          ["", "14px", "12px"][compress]
        }; padding-bottom: ${["", "7px", "2px"][compress]}; padding-top: ${
          ["", "7px", "2px"][compress]
        } }`
        styles += `.layer-switcher .menu > .title .w-icon-x { font-size: ${
          ["", "21px", "18px"][compress]
        } }`
        styles += `.layer-switcher .scrollable { height: calc(100% - ${
          ["", "39px", "29px"][compress]
        }) }`
        // menu group headers
        styles += `.layer-switcher .layer-switcher-toggler-tree-category { padding: ${
          ["", "5px", "2px"][compress]
        } 0; height: ${["", "30px", "20px"][compress]} }`
        // menu items
        styles += `.layer-switcher li { line-height: ${
          ["", "20px", "16px"][compress]
        }}`
        styles += `.layer-switcher .togglers ul li .wz-checkbox { margin-bottom: ${
          ["", "3px", "0px"][compress]
        } }`
        styles += `.wz-checkbox { min-height: ${["", "20px", "16px"][compress]} }`
        styles += `.wz-checkbox input[type="checkbox"] + label { line-height: ${
          ["", "20px", "16px"][compress]
        }; font-size: ${["", "12px", "11px"][compress]} }`
        styles += `.wz-checkbox input[type="checkbox"] + label:before { font-size: ${
          ["", "13px", "10px"][compress]
        }; height: ${["", "16px", "14px"][compress]}; width: ${
          ["", "16px", "14px"][compress]
        }; line-height: ${["", "12px", "11px"][compress]} }`
        // HORIZONTAL CHANGES
        styles += `.layer-switcher .togglers ul { padding-left: ${
          ["", "19px", "12px"][compress]
        }; }`
        styles += `.layer-switcher .togglers .group { padding: ${
          ["", "0 8px 0 4px", "0 4px 0 2px"][compress]
        } }`
        if (getById("_cbLayersColumns").checked) {
          // 2 column stuff
          styles += ".layer-switcher .scrollable { columns: 2; }"
          styles +=
            "li.group { break-inside: avoid; page-break-inside: avoid; }"
          // prevent city names showing up when it should be hidden
          styles +=
            ' .layer-switcher ul[class^="collapsible"].collapse-layer-switcher-group { visibility: collapse }'
          styles += `.layer-switcher .menu { overflow-x: hidden; overflow-y: scroll; height: auto; max-height: calc(100% - ${
            ["", "39px", "29px"][compress]
          }) }`
          styles +=
            ".layer-switcher .scrollable { overflow-x: hidden; overflow-y: hidden; height: unset }"
        }
        // fix from ABelter for layers menu
        styles +=
          ' .layer-switcher ul[class^="collapsible"] { max-height: none; }'
      } else {
        // 2-columns not available without compression
        getById("layersColControls").style.opacity = "0.5"
      }
      if (contrast > 0) {
        styles +=
          ".controls-container.main.toggler { color: var(--color-white); background: dimgray }"
        styles +=
          ".layer-switcher .toggler.main .label-text { text-transform: inherit }"
        // labels
        styles +=
          ".layer-switcher .layer-switcher-toggler-tree-category > .label-text { color: black }"
        styles +=
          '.wz-checkbox input[type="checkbox"] + label { WME: FU; color: black }'
        // group separator
        styles += `.layer-switcher .togglers .group { border-bottom: 1px solid ${
          ["", "lightgrey", "grey"][contrast]
        } }`
        // column rule
        styles += `.layer-switcher .scrollable { column-rule: 1px solid ${
          ["", "lightgrey", "grey"][contrast]
        } }`
      }
      if (getById("_cbLayersMenuMoreOptions").checked === true) {
        styles +=
          '.layer-switcher ul[class^="collapsible"].collapse-layer-switcher-group { visibility: inherit; max-height: inherit }'
        styles +=
          ".layer-switcher i.toggle-category { visibility: hidden; width: 0 }"
      }
      addStyle(PREFIX + fname, styles)
    } else {
      getById("layersColControls").style.opacity = "0.5"
      removeStyle(PREFIX + fname)
    }
  }
  function changePassVisibility() {
    ReportObserver.disconnect()
    const panelContainer = document.querySelector("#panel-container")
    const passes = panelContainer.querySelectorAll(".activeHovSubscriptions")
    let pDisp = "none"
    if (panelContainer.querySelector("#_cbCollapsePasses").checked === false) {
      pDisp = ""
    }
    for (let i = 0; i < passes.length; ++i) {
      passes[i].style.display = pDisp
    }
    ReportObserver.observe(document.querySelector("#panel-container"), {
      childList: true,
      subtree: true,
    })
  }
  var ReportObserver = new MutationObserver(mutations => {
    AddCollapsiblePasses()
  })
  function AddCollapsiblePasses() {
    const panelContainer = document.querySelector("#panel-container")
    if (panelContainer.getBoundingClientRect().width > 0) {
      const passes = panelContainer.querySelectorAll(".activeHovSubscriptions")
      if (passes.length > 0) {
        if (panelContainer.querySelector("#_cbCollapsePasses") == null) {
          ReportObserver.disconnect()
          const upHeader = panelContainer
            .querySelector(".reporter-preferences")
            .querySelector(".title")
          upHeader.innerHTML += ` | Hide passes (${
            passes.length
          }) <input type="checkbox" id="_cbCollapsePasses" checked/>`
          document
            .getElementById("_cbCollapsePasses")
            .addEventListener("click", changePassVisibility, true)
          changePassVisibility()
        }
      }
    }
  }
  function restyleReports() {
    const fname = "restyleReports"
    let styles = ""
    if (getById("_cbRestyleReports").checked) {
      const contrast = getById("_inpUIContrast").value
      const compress = getById("_inpUICompression").value

      // Stops Reject/Approve buttons being partially/completely cut off...
      styles += ".place-update-edit .place-update { max-height: 100%; }"

      if (compress > 0) {
        // report header
        // Remove title text - we know what the panel contains, because we've asked WME to open it...
        styles += "#panel-container .main-title { display: none!important; }"
        styles += `#panel-container .issue-panel-header { padding: ${
          ["", "9px 36px", "1px 36px"][compress]
        }; line-height: ${["", "19px", "17px"][compress]}; }`
        styles += `#panel-container .issue-panel-header .dot { top: ${
          ["", "15px", "7px"][compress]
        }; }`
        // special treatment for More Information checkboxes (with legends)
        styles +=
          "#panel-container .problem-edit .more-info .legend { left: 20px; top: 3px; }"
        styles +=
          '#panel-container .more-info input[type="checkbox"] + label { padding-left: 33px !important; }'
        // User preferences section
        styles +=
          "#panel-container .preferences-container { gap: 0px !important; }"
        // report body
        styles += `#panel-container .body { line-height: ${
          ["", "15px", "13px"][compress]
        }; font-size: ${["", "13px", "12px"][compress]}; }`
        // problem description
        styles += `#panel-container .collapsible { padding: ${
          ["", "9px", "3px"][compress]
        }; }`

        // comments
        /// /styles += '#panel-container .conversation-view .comment .comment-content { padding: ' + ['','6px 9px','2px 3px'][compress] + '; }';
        styles += `#panel-container .comment .text { padding: ${
          ["", "7px 9px", "4px 4px"][compress]
        }; }`
        // Remove padding around comment boxes
        styles += "#panel-container wz-list { padding: 0px!important; }"
        /// /styles += '#panel-container .wz-list-item .list-item-wrapper { padding-bottom: 0px!important; padding-top: 0px!important; }';
        // new comment entry
        styles += `#panel-container .conversation-view .new-comment-form { padding: ${
          ["", "8px 9px 6px 9px", "1px 3px 2px 3px"][compress]
        }; }`
        // send button
        styles += `#panel-container .conversation-view .send-button { padding: ${
          ["", "4px 16px", "2px 12px"][compress]
        }; box-shadow: ${
          ["", "3px 3px 4px 0 #def7ff", "3px 2px 4px 0 #def7ff"][compress]
        }; }`
        // lower buttons
        styles += `#panel-container > div > div > div.actions > div > div { padding-top: ${
          ["", "6px", "3px"][compress]
        }; }`
        styles += `#panel-container .close-details.section { font-size: ${
          ["", "13px", "12px"][compress]
        }; line-height: ${["", "13px", "9px"][compress]}; }`
        styles += `#panel-container .problem-edit .actions .controls-container label { height: ${
          ["", "28px", "21px"][compress]
        }; line-height: ${["", "28px", "21px"][compress]}; margin-bottom: ${
          ["", "5px", "2px"][compress]
        }; }`
        styles += `#panel-container .waze-plain-btn { height: ${
          ["", "30px", "20px"][compress]
        }; line-height: ${["", "30px", "20px"][compress]}; }`
        styles += `.panel .navigation { margin-top: ${
          ["", "6px", "2px"][compress]
        }; }`
        // WMEFP All PM button
        styles += `#WMEFP-UR-ALLPM { top: ${
          ["", "5px", "0px"][compress]
        } !important; }`
      }
      if (contrast > 0) {
        styles += `#panel-container .section { border-bottom: 1px solid ${
          ["", "lightgrey", "grey"][contrast]
        }; }`
        styles += `#panel-container .close-panel { border-color: ${
          ["", "lightgrey", "grey"][contrast]
        }; }`
        styles += "#panel-container .main-title { font-weight: 900; }"
        styles += `#panel-container .reported { color: ${
          ["", "darkslategrey", "black"][contrast]
        }; }`
        styles += `#panel-container .date { color: ${
          ["", "#6d6d6d", "#3d3d3d"][contrast]
        }; }`
        styles += `#panel-container .comment .text { ${GetBorderContrast(
          contrast,
          false,
        )}}`
        styles += `#panel-container .comment-content.reporter .username { color: ${
          ["", "#159dc6", "#107998"][contrast]
        }; }`
        styles += `#panel-container .conversation-view .new-comment-form textarea { ${GetBorderContrast(
          contrast,
          false,
        )}}`
        styles += `#panel-container .top-section { border-bottom: 1px solid ${
          ["", "lightgrey", "grey"][contrast]
        }; }`
        styles += `#panel-container .waze-plain-btn { font-weight: 800; color: ${
          ["", "#159dc6", "#107998"][contrast]
        }; }`
      }
      addStyle(PREFIX + fname, styles)
      if (wmeFUinitialising) {
        setTimeout(draggablePanel, 5000)
      } else {
        draggablePanel()
      }

      ReportObserver.observe(document.querySelector("#panel-container"), {
        childList: true,
        subtree: true,
      })
      AddCollapsiblePasses()
    } else {
      removeStyle(PREFIX + fname)
      if (jQuery.ui) {
        if ($("#panel-container").hasClass("ui-draggable")) {
          $("#panel-container").draggable("destroy")
        }
        getById("panel-container").style = ""
      }
      ReportObserver.disconnect()
    }
    window.dispatchEvent(new Event("resize"))
  }
  function draggablePanel() {
    if (jQuery.ui) {
      if ($("#panel-container").draggable) {
        $("#panel-container").draggable({ handle: ".header" })
      }
    }
  }
  function enhanceChat() {
    const fname = "enhanceChat"
    let styles = ""
    if (getById("_cbEnhanceChat").checked) {
      removeStyle(PREFIX + fname)
      const contrast = getById("_inpUIContrast").value
      const compress = getById("_inpUICompression").value
      const mapY = getById("map").clientHeight
      const chatY = Math.floor(mapY * 0.5)
      const chatHeaderY = [50, 35, 20][compress]
      const chatMessageInputY = [39, 31, 23][compress]
      const chatMessagesY = chatY - chatHeaderY - chatMessageInputY
      const chatUsersY = chatY - chatHeaderY
      // change chat width to 35% of whole window
      styles += "#chat .messages { width: calc(25vw); min-width: 200px;}"
      styles += "#map.street-view-mode #chat .messages { width: calc(25vw); }"
      styles += "#chat .messages .message-list { margin-bottom: 0px; }"
      styles +=
        "#chat .messages .new-message { position: inherit; width: unset; }"
      styles +=
        "#map.street-view-mode #chat .messages .new-message { position: inherit; width: unset; }"
      styles += "#chat .users { width: calc(10vw); min-width: 120px; }"
      styles +=
        "#chat .messages .message-list .message.normal-message { max-width: unset; }"
      // change chat height to 50% of map view
      styles += `#chat .messages .message-list { min-height: ${chatMessagesY}px; }`
      styles += `#chat .users { max-height: ${chatUsersY}px; }`

      //		#chat .messages .unread-messages-notification width=70%, bottom64px>
      if (compress > 0) {
        // do compression
        // header
        styles += `#chat .header { line-height: ${chatHeaderY}px; }`

        styles += `#chat .header .dropdown .dropdown-toggle { line-height: ${
          ["", "30px", "22px"][compress]
        }; }`
        styles += `#chat .header button { line-height: ${
          ["", "20px", "19px"][compress]
        }; font-size: ${["", "13px", "11px"][compress]}; height: ${
          ["", "20px", "19px"][compress]
        }; }`
        // message list
        styles += `#chat .messages .message-list { padding: ${
          ["", "9px", "3px"][compress]
        }; }`
        styles += `#chat .messages .message-list .message.normal-message { padding: ${
          ["", "6px", "2px"][compress]
        }; }`
        styles += `#chat .messages .message-list .message { margin-bottom: ${
          ["", "8px", "2px"][compress]
        }; line-height: ${["", "16px", "14px"][compress]}; font-size: ${
          ["", "12px", "11px"][compress]
        }; }`
        styles += `#chat .messages .new-message input { height: ${
          chatMessageInputY
        }px; }`
        // user list
        styles += `#chat .users { padding: ${["", "8px", "1px"][compress]}; }`
        styles += `#chat ul.user-list a.user { padding: ${
          ["", "2px", "1px"][compress]
        }; }`
        styles += `#chat ul.user-list a.user .rank { width: ${
          ["", "25px", "20px"][compress]
        }; height: ${["", "20px", "16px"][compress]}; margin-right: ${
          ["", "3px", "1px"][compress]
        }; }`
        styles += `#chat ul.user-list a.user .username { line-height: ${
          ["", "21px", "17px"][compress]
        }; }`
        styles += `#chat ul.user-list a.user:hover .crosshair { margin-top: ${
          ["", "3px", "1px"][compress]
        }; right: ${["", "3px", "1px"][compress]}; }`
        // fix for WME Chat Addon
        styles += "#chat .users > ul > li > a { margin: 0px !important; }"
      }
      if (contrast > 0) {
        // header
        styles += `#chat .header { color: var(--color-black); background-color: ${
          ["", "#d9d9d9", "#bfbfbf"][contrast]
        }; }`
        styles += `#chat .messages .message-list { background-color: ${
          ["", "#e8e8e8", "lightgrey"][contrast]
        }; }`
        styles +=
          "#chat .messages .message-list .message.normal-message { color: var(--color-black); float: left; }"
        styles +=
          "#chat .messages .message-list .message.normal-message .from { color: darkslategrey; font-weight: bold; font-style: italic; }"
        styles +=
          "#chat .messages .message-list .message.own-message .from { color: var(--color-black); background-color: #a1dcf5; }"
        // user message timestamps
        styles += `#chat > div.chat-body > div.messages > div.message-list > div > div.from > span { color: ${
          ["", "darkslategrey", "black"][contrast]
        } !important; }`
        // system message timestamps
        styles += `#chat > div.chat-body > div.messages > div.message-list > div > div.body > div > span { color: ${
          ["", "darkslategrey", "black"][contrast]
        } !important; }`
        // fix for WME Chat Addon
        styles += "#chat .body > div { color: black !important; }"
      }
      // fix for Chat Addon timestamps running up against names
      styles +=
        "#chat > div.chat-body > div.messages > div.message-list > div > div.from > span { margin-left: 5px; }"
      addStyle(PREFIX + fname, styles)
    } else {
      removeStyle(PREFIX + fname)
    }
  }
  function narrowSidePanel() {
    const fname = "narrowSidePanel"
    let styles = ""
    if (getById("_cbNarrowSidePanel").checked) {
      // sidebar width
      styles += ".row-fluid #sidebar { width: 250px; }"
      // map width
      styles += ".show-sidebar .row-fluid .fluid-fixed { margin-left: 250px; }"
      // user info tweaks
      styles += "#sidebar #user-info #user-box { padding: 0 0 5px 0; }"
      styles += "#sidebar #user-details { width: 250px; }"
      styles +=
        "#sidebar #user-details .user-profile .level-icon { margin: 0; }"
      styles +=
        "#sidebar #user-details .user-profile .user-about { max-width: 161px; }"
      // gradient bars
      styles += "#sidebar .tab-scroll-gradient { width: 220px; }"
      styles += "#sidebar #links:before { width: 236px; }"
      // feed
      styles += ".feed-item .content { max-width: 189px; }"
      // segment edit panel
      styles +=
        "#edit-panel .more-actions .waze-btn.waze-btn-white { width: 122px; }"
      // tweak for WME Bookmarks
      styles += "#divBookmarksContent .divName { max-width: 164px; }"
      // tweak for WME PH buttons
      styles +=
        "#WMEPH_runButton .btn { font-size: 11px; padding: 2px !important; }"
      addStyle(PREFIX + fname, styles)
    } else {
      removeStyle(PREFIX + fname)
    }
    compressSegmentTab()
    window.dispatchEvent(new Event("resize"))
  }
  function shiftAerials() {
    const siLayerNames = [
      "satellite_imagery",
      "merged_collection_by_latest_no_candid",
      "merged_collection_by_quality_no_candid",
      "satellite_pleiades_ortho_rgb",
      "satellite_worldview2_ortho_rgb",
      "satellite_worldview3_ortho_rgb",
      "satellite_geoeye1_ortho_rgb",
      "satellite_skysat_ortho_rgb",
      "satellite_pneo_ortho_rgb",
    ]

    // calculate meters/pixel for current map view, taking into account how the
    // map projection stretches things out the further from the equator you get
    let metersPerPixel = W.map.getResolution()
    const mapCentre = new OpenLayers.LonLat()
    mapCentre.lon = W.map.getCenter().lon
    mapCentre.lat = W.map.getCenter().lat
    mapCentre.transform(
      new OpenLayers.Projection("EPSG:900913"),
      new OpenLayers.Projection("EPSG:4326"),
    )
    const latAdj = Math.cos((mapCentre.lat * Math.PI) / 180)
    metersPerPixel *= latAdj

    if (metersPerPixel == 0) {
      metersPerPixel = 0.001
    }

    const sLeft = `${Math.round(options.arialShiftX / metersPerPixel)}px`
    const sTop = `${Math.round(-options.arialShiftY / metersPerPixel)}px`

    if (options.arialOpacity < 10) options.arialOpacity = 10

    const sLeftO = `${Math.round(options.arialShiftXO / metersPerPixel)}px`
    const sTopO = `${Math.round(-options.arialShiftYO / metersPerPixel)}px`

    if (options.arialOpacityO < 10) options.arialOpacityO = 10

    if (
      options.arialShiftX != 0 ||
      options.arialShiftY != 0 ||
      options.arialShiftXO != 0 ||
      options.arialShiftYO != 0
    ) {
      $("#WMEFU_AS").fadeIn(20)
    } else {
      $("#WMEFU_AS").fadeOut(20)
    }

    // Apply the shift and opacity to all available imagery layers
    for (let i = 0; i < siLayerNames.length; ++i) {
      const siLayer = W.map.getLayersByName(siLayerNames[i])
      if (siLayer.length == 1) {
        const siDiv = siLayer[0].div
        if (i === 0) {
          // Standard layer
          siDiv.style.left = sLeft
          siDiv.style.top = sTop
          siDiv.style.opacity = options.arialOpacity / 100
        } else {
          // Additional layers
          siDiv.style.left = sLeftO
          siDiv.style.top = sTopO
          siDiv.style.opacity = options.arialOpacityO / 100
        }
      }
    }

    // turn off Enhance Chat if WME Chat Fix is loaded
    if (document.getElementById("WMEfixChat-setting")) {
      if (getById("_cbEnhanceChat").checked === true) {
        alert(
          "WME FixUI: Enhance Chat disabled because WME Chat UI Fix detected",
        )
      }
      getById("_cbEnhanceChat").checked = false
    }
  }
  function ApplyArrowFix(aObj) {
    if (aObj.touchedByFUME === undefined) {
      const rStr = aObj.style.transform
      let rFloat = 0
      if (rStr.indexOf("deg") != -1) {
        rFloat = parseFloat(rStr.split("(")[1].split("deg")[0])
      }
      rFloat += 180.0
      aObj.style.transform = `rotate(${rFloat}deg) scaleX(-1)`
      aObj.touchedByFUME = true
    }
  }
  function RTCArrowsFix() {
    if (W.model.isLeftHand === true) {
      const rtcDiv = W.map.closuresMarkerLayer.div
      let fLen = rtcDiv.querySelectorAll(".forward").length
      while (fLen) {
        ApplyArrowFix(rtcDiv.querySelectorAll(".forward")[fLen - 1])
        --fLen
      }
      let rLen = rtcDiv.querySelectorAll(".backward").length
      while (rLen) {
        ApplyArrowFix(rtcDiv.querySelectorAll(".backward")[rLen - 1])
        --rLen
      }
    }
  }
  var RTCMarkerObserver = new MutationObserver(mutations => {
    RTCArrowsFix()
  })
  function warnCommentsOff() {
    const fname = "warnCommentsOff"
    if (W.map.getLayerByUniqueName("mapComments").visibility === false) {
      removeStyle(PREFIX + fname)
      addStyle(PREFIX + fname, "#app-head { --background_default: #FFC107 ; }")
    } else {
      removeStyle(PREFIX + fname)
    }
    // extra bit because killNodeLayer will be inactive
    getById("_btnKillNode").style.backgroundColor = ""
  }
  function adjustGSV() {
    const fname = "adjustGSV"
    let styles = ""
    const C = getById("_inpGSVContrast")
    const B = getById("_inpGSVBrightness")
    const I = getById("_cbGSVInvert")
    if (C.value < 10) C.value = 10
    if (B.value < 10) B.value = 10
    styles += `.gm-style { filter: contrast(${C.value}%) `
    styles += `brightness(${B.value}%) `
    if (I.checked) {
      styles += "invert(1); }"
    } else {
      styles += "invert(0); }"
    }
    removeStyle(PREFIX + fname)
    if (C.value != 100 || B.value != 100 || I.checked)
      addStyle(PREFIX + fname, styles)
  }
  function GSVWidth() {
    const fname = "GSVWidth"
    removeStyle(PREFIX + fname)
    const w = getById("_inpGSVWidth").value
    if (w != 50) {
      let styles = ""
      styles += `#editor-container #map.street-view-mode #waze-map-container { width: ${
        100 - w
      }%; }`
      styles += `#editor-container #street-view-container { width: ${w}%; }`
      styles += `#editor-container #map #street-view-drag-handle { left: ${
        100 - w
      }%; }`
      addStyle(PREFIX + fname, styles)
    }
    window.dispatchEvent(new Event("resize"))
  }
  function GSVWidthReset() {
    getById("waze-map-container").style = null
    getById("street-view-container").style = null
    getById("street-view-drag-handle").style = null
    // Check for WME Street View Availability
    // This can be removed soon - WME SVA no longer remembers GSV width
    if (localStorage.WMEStreetViewWidth) {
      localStorage.WMEStreetViewWidth = ""
    }
    window.dispatchEvent(new Event("resize"))
  }
  function moveChatIcon() {
    const fname = "moveChatIcon"
    let styles = ""
    if (getById("_cbMoveChatIcon").checked) {
      styles +=
        "#chat-overlay { left: inherit !important; right: 60px !important;}"
      styles += "#chat-overlay #chat-toggle { right: 0px !important; }"
      addStyle(PREFIX + fname, styles)
    } else {
      removeStyle(PREFIX + fname)
    }
  }
  function highlightInvisible() {
    const fname = "highlightInvisible"
    let styles = ""
    if (getById("_cbHighlightInvisible").checked) {
      styles +=
        "#chat-overlay.visible-false #chat-toggle button { filter: none; background-color: #ff0000c0; }"
      addStyle(PREFIX + fname, styles)
    } else {
      removeStyle(PREFIX + fname)
    }
  }
  function darkenSaveLayer() {
    const fname = "darkenSaveLayer"
    let styles = ""
    if (getById("_cbDarkenSaveLayer").checked) {
      styles += "#popup-overlay { background-color: dimgrey !important; }"
      addStyle(PREFIX + fname, styles)
    } else {
      removeStyle(PREFIX + fname)
    }
  }
  function swapRoadsGPS() {
    const fname = "swapRoadsGPS"
    let styles = ""
    if (getById("_cbSwapRoadsGPS").checked) {
      const rlName = "roads"
      const glName = "gps_points"
      const roadLayerId = W.map.getLayerByUniqueName(rlName).id
      const GPSLayerId = W.map.getLayerByUniqueName(glName).id
      const roadLayerZ = W.map.getLayerByUniqueName(rlName).getZIndex()
      const GPSLayerZ = W.map.getLayerByUniqueName(glName).getZIndex()
      logit(
        `Layers identified\n\tRoads: ${roadLayerId},${roadLayerZ}\n\tGPS: ${
          GPSLayerId
        },${GPSLayerZ}`,
        "info",
      )
      styles += `#${roadLayerId.replace(/\./g, "\\2e")} { z-index: ${
        GPSLayerZ
      } !important; }`
      styles += `#${GPSLayerId.replace(/\./g, "\\2e")} { z-index: ${
        roadLayerZ
      } !important; }`
      addStyle(PREFIX + fname, styles)
    } else {
      removeStyle(PREFIX + fname)
    }
  }
  function killNode() {
    getById(`${W.map.getLayerByUniqueName("nodes").id}_root`).style.display =
      "none"
    getById("_btnKillNode").style.backgroundColor = "yellow"
  }
  function toggleKillTurnPopup() {
    const fname = "toggleKillTurnPopup"
    if (killTurnPopup === true) {
      getById("WMEFUTPB").style.backgroundColor = "inherit"
      killTurnPopup = false
      removeStyle(PREFIX + fname)
    } else {
      getById("WMEFUTPB").style.backgroundColor = "red"
      killTurnPopup = true
      addStyle(
        PREFIX + fname,
        'div[data-theme*="map-tooltip"] { display: none !important; }',
      )
    }
  }
  function showMapBlockers() {
    const fname = "showMapBlockers"
    let styles = ""
    if (getById("_cbShowMapBlockers").checked) {
      styles += ".street-view-layer { background-color: rgba(255,0,0,0.3); }"
      styles +=
        ".overlay-buttons-container.top { background-color: rgba(255,0,0,0.3); }"
      styles +=
        ".overlay-buttons-container.bottom { background-color: rgba(255,0,0,0.3); }"
      styles +=
        "#street-view-drag-handle { background-color: rgba(255,0,0,0.3); }"
      addStyle(PREFIX + fname, styles)
      fixNodeClosureIcons()
    } else {
      removeStyle(PREFIX + fname)
    }
  }
  function fixNodeClosureIcons() {
    const closureNodesId = W.map.getLayerByUniqueName("closure_nodes").id
    const SVPinId = W.map.getLayersByName("streetViewPin")[0].id
    addGlobalStyle(`div#${closureNodesId} { z-index: 725 !important }`)
    insertNodeBeforeNode(getById(closureNodesId), getById(SVPinId))
  }
  function disableBridgeButton() {
    const fname = "disableBridgeButton"
    let styles = ""
    if (getById("_cbDisableBridgeButton").checked) {
      styles += ".add-bridge { pointer-events: none; opacity: 0.4; }"
      addStyle(PREFIX + fname, styles)
    } else {
      removeStyle(PREFIX + fname)
    }
  }
  function disablePathButton() {
    const fname = "disablePathButton"
    let styles = ""
    if (getById("_cbDisablePathButton").checked) {
      styles += ".path-icon { pointer-events: none; opacity: 0.4; }"
      addStyle(PREFIX + fname, styles)
    } else {
      removeStyle(PREFIX + fname)
    }
  }
  function disableKinetic() {
    if (getById("_cbDisableKinetic").checked) {
      W.map.controls.find(control => control.dragPan).dragPan.kinetic = null
    } else {
      W.map.controls.find(control => control.dragPan).dragPan.kinetic =
        kineticDragParams
    }
  }
  function disableAnimatedZoom() {
    if (getById("_cbDisableZoomAnimation").checked) {
      W.map.segmentLayer.map.zoomDuration = 0
    } else {
      W.map.segmentLayer.map.zoomDuration = 20
    }
  }
  function disableScrollZoom() {
    let controller = null
    if (W.map.navigationControl) {
      controller = W.map.navigationControl
    } else if (
      W.map.controls.find(
        control => control.CLASS_NAME == "OpenLayers.Control.Navigation",
      )
    ) {
      controller = W.map.controls.find(
        control => control.CLASS_NAME == "OpenLayers.Control.Navigation",
      )
    } else {
      logit(
        "Cannot find zoom wheel controls - please alert script maintainers",
        "error",
      )
    }
    if (controller !== null) {
      if (getById("_cbDisableScrollZoom").checked) {
        controller.disableZoomWheel()
      } else {
        controller.enableZoomWheel()
      }
    }
  }
  function PSclicked(event) {
    if (event.ctrlKey) alert("CTRL")
    if (W.selectionManager.getSelectedFeatures().length > 0) {
      if (getById("edit-panel").className === "tab-pane active") {
        getById("edit-panel").className = "tab-pane"
        getById("sidepanel-feed").className = "tab-pane active"
        getById("user-tabs").removeAttribute("hidden")
      } else {
        getById("edit-panel").className = "tab-pane active"
        getById("sidepanel-feed").className = "tab-pane"
        getById("user-tabs").setAttribute("hidden", "")
      }
    }
  }
  function PSicon() {
    if (W.selectionManager.getSelectedFeatures().length > 0) {
      getById("WMEFUPS").style.color = "red"
    } else {
      getById("WMEFUPS").style.color = "lightgrey"
    }
  }
  function PCclicked() {
    if (location.search.match("segments")) reselectItems("segments", true)
    else if (location.search.match("venues")) reselectItems("venues", true)
    else if (location.search.match("nodes")) reselectItems("nodes", false)
    else if (location.search.match("mapComments"))
      reselectItems("mapComments", false)
    else if (location.search.match("cameras")) reselectItems("cameras", false)
  }
  function reselectItems(typeDesc, isArray) {
    let parameter
    let IDArray
    let objectArray
    let i
    let object
    parameter = location.search.match(new RegExp(`[?&]${typeDesc}?=([^&]*)`))
    if (parameter) {
      IDArray = parameter[1].split(",")
      objectArray = []
      for (i = 0; i < IDArray.length; i++) {
        object = W.model[typeDesc].objects[IDArray[i]]
        if (typeof object !== "undefined") objectArray.push(object)
      }
      if (isArray) {
        W.selectionManager.setSelectedModels(objectArray)
      } else {
        W.selectionManager.setSelectedModels(objectArray[0])
      }
    }
  }
  function createDSASection() {
    let settingsDiv = null
    settingsDiv = document.querySelector("#sidepanel-prefs > div > form")
    if (!settingsDiv) {
      logit("WME Settings div not there yet - looping...", "warning")
      setTimeout(createDSASection, 500)
      return
    }
    if (localStorage.dontShowAgain) {
      const dontShowAgain = JSON.parse(localStorage.dontShowAgain)
      const DSGroup = document.createElement("div")
      DSGroup.classList = "form-group"
      let DSLabel = document.createElement("label")
      DSLabel.classList = "control-label"
      DSLabel.innerHTML = modifyHTML("Disabled WME warnings")
      DSLabel.title = "This section will not update if you disable a warning\n"
      DSLabel.title += "from a WME pop-up. Re-load the page if you need\n"
      DSLabel.title += "to re-enable a warning you have just disabled.\n\n"
      DSLabel.title += "SECTION ADDED BY WME Fix UI."
      DSGroup.appendChild(DSLabel)
      DSGroup.appendChild(document.createElement("br"))
      const DSCC = document.createElement("div")
      DSCC.classList = "controls-container"
      let DSInput
      for (const property in dontShowAgain) {
        DSInput = document.createElement("input")
        DSInput.type = "checkbox"
        DSInput.id = `WMEFUDScb_${property.toString()}`
        DSInput.setAttribute("orig", property.toString())
        DSInput.checked = dontShowAgain[property]
        DSLabel = document.createElement("label")
        DSLabel.setAttribute("for", DSInput.id)
        DSLabel.innerText = property.toString()
        DSCC.appendChild(DSInput)
        DSCC.appendChild(DSLabel)
        DSCC.appendChild(document.createElement("br"))
        DSInput.onclick = DSIclicked
      }
      DSGroup.appendChild(DSCC)
      settingsDiv.appendChild(DSGroup)
    }
  }
  function DSIclicked(e) {
    const DSA = JSON.parse(localStorage.dontShowAgain)
    DSA[e.target.getAttribute("orig")] = e.target.checked
    localStorage.dontShowAgain = JSON.stringify(DSA)
  }

  // These two event handlers act in concert with the change log restyling carried
  // out in disableSaveBlocker(), to allow the change log to continue being shown
  // and hidden as expected when the user mouses-over or out of the save button,
  // but not for it to then be displayed as soon as an edit is made whilst the
  // disable save blocker option is enabled and ctrl+s has been used to save an
  // earlier edit.  No, I still have NO idea why this combination of FUME setting
  // and WME keyboard shortcut causes the log to appear, hence this slightly
  // contrived workaround to essentially replicate the visibility changes WME
  // ought to be doing itself...
  let inSaveDetails = false
  let inSaveButton = false
  function saveMouseOver() {
    const styles = ".changes-log { display: block !important; }"
    addStyle(PREFIX, styles)

    inSaveButton = true
    window.setTimeout(addSaveDetailsEventListeners, 100)
  }
  function saveMouseOut() {
    inSaveButton = false
    window.setTimeout(saveMouseOutDeferred, 1000)
  }
  function addSaveDetailsEventListeners() {
    // Since adding the above fix, it's come to my attention that it has the potential to break
    // the ability of the save details popup to remain visible when moused-over.  To unbreak
    // this without rebreaking the ctrl+s fix, we add similar mouseover/out handlers to the popup,
    // noting that as it's dynamically generated whenever the save button is moused-over when
    // saves are pending, we have to reapply the handlers each time...  The following function is
    // therefore called from the buttom mouseover handler above, with a short delay to give WME a
    // chance to generate the element before we try dealing with it.
    if (document.querySelector(".changes-log") !== null) {
      document
        .querySelector(".changes-log")
        .addEventListener("mouseover", saveDetailsMouseOver, true)
      document
        .querySelector(".changes-log")
        .addEventListener("mouseout", saveDetailsMouseOut, true)
    }
  }
  function saveDetailsMouseOver() {
    // The mouseover handler simply sets a flag to let the rest of the script know that we're
    // in the popup
    inSaveDetails = true
  }
  function saveDetailsMouseOut() {
    // Whilst the mouseout handler both clears the flag and also calls the mouseout handler for
    // the save button (to hide the popup) unless the corresponding flag for the button itself
    // hasn't been set by its mouseover handler - i.e. we only want to hide the popup if the
    // mouse is over neither the save button or the details popup...
    inSaveDetails = false
    if (inSaveButton == false) {
      saveMouseOut()
    }
  }
  function saveMouseOutDeferred() {
    // To account for the order in which the save button mouseout and details popup mouseover
    // handlers fire (i.e. in the wrong order to make this fix easy...), the buttom mouseout
    // handler is modified to perform most of its processing after a short delay - this gives
    // the popup mouseover handler time to fire and set its flag, so that when we get here
    // we know that the mouseout event was triggered by movement of the pointer between the
    // button and popup, rather than out of the button in some other direction, and therefore
    // we should avoid hiding the popup...
    if (inSaveDetails == false && inSaveButton == false) {
      const styles = ".changes-log { display: none !important; }"
      addStyle(PREFIX, styles)
    }
  }
  function disableSaveBlocker() {
    const fname = "disableSaveBlocker"
    let styles = ""
    if (getById("_cbDisableSaveBlocker").checked) {
      styles += "#popup-overlay { z-index: 0 !important; }"
      styles += ".changes-log { display: none !important; }"
      addStyle(PREFIX + fname, styles)
    } else {
      removeStyle(PREFIX + fname)
    }
  }
  function disableUITransitions() {
    const fname = "disableUITransitions"
    let styles = ""
    let sliderTrans = ""

    // Side panel and main menu fixes we can apply directly via CSS mods...
    if (getById("_cbDisableUITransitions").checked) {
      styles += ".collapsible-container { transition: none!important; }"
      styles += "#issue-tracker-filter-region { transition: none!important; }"
      styles += ".menu { transition: none!important; }"
      addStyle(PREFIX + fname, styles)

      sliderTrans =
        ".wz-slider::before {transition:all 0s linear 0s!important;}"
    } else {
      removeStyle(PREFIX + fname)

      sliderTrans =
        ".wz-slider::before {transition:all 400ms ease 0s!important;}"
    }

    // And now the stuff hidden in shadowroots...

    // WME adds transition styles both to the slider itself and also to its ::before
    // pseudo-element, so we can't simply apply our own style override to the slider
    // directly as this doesn't affect the ::before style.  To get around this, we
    // instead apply the override to the parent element as a new CSS entry to be
    // applied to its slider children - this then takes precedence over anything
    // defined on the slider itself...
    let nTS = document.querySelectorAll("wz-toggle-switch").length
    while (nTS > 0) {
      const tsObj = document.querySelectorAll("wz-toggle-switch")[nTS - 1]
      const sr = tsObj.shadowRoot.querySelector(".wz-switch")

      if (sr !== null) {
        // If we haven't already set up our CSS entry on this parent element, do
        // so now...
        if (sr.querySelector("#fume") == null) {
          const sliderStyle = document.createElement("style")
          sliderStyle.id = "fume"
          sr.insertBefore(sliderStyle, sr.firstChild)
        }

        // Now we know the parent has our CSS entry, update its contents according to
        // whether we're enabling or disabling transition effects
        sr.querySelector("#fume").innerHTML = sliderTrans
      }
      --nTS
    }
  }
  function colourBlindTurns() {
    const fname = "colourBlindTurns"
    let styles = ""
    if (getById("_cbColourBlindTurns").checked) {
      styles += ".turn-arrow-state-open { filter: hue-rotate(90deg); }"
      addStyle(PREFIX + fname, styles)
    } else {
      removeStyle(PREFIX + fname)
    }
  }
  function hideLabel(lblObj) {
    if (lblObj !== null) {
      lblObj.style.fontSize = "0"
      lblObj.style.width = "0"
    } else {
      // breakpoint
    }
  }
  function showLabel(lblObj) {
    if (lblObj !== null) {
      lblObj.style.fontSize = "100%"
      lblObj.style.width = "100%"
    } else {
      // breakpoint
    }
  }
  function hideMenuLabels() {
    if (getById("_cbHideMenuLabels").checked) {
      hideLabel(
        document
          .querySelector(".toolbar-group-map-comments")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text"),
      )
      hideLabel(
        document
          .querySelector(".toolbar-group-venues")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text"),
      )
      hideLabel(
        document
          .querySelector(".toolbar-group-drawing")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text"),
      )
      hideLabel(
        document
          .querySelector(".toolbar-group-permanent_hazards")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text"),
      )
      hideLabel(
        document
          .querySelector(".restricted-driving-area")
          .shadowRoot.querySelector(".button-text"),
      )
    } else {
      showLabel(
        document
          .querySelector(".toolbar-group-map-comments")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text"),
      )
      showLabel(
        document
          .querySelector(".toolbar-group-venues")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text"),
      )
      showLabel(
        document
          .querySelector(".toolbar-group-drawing")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text"),
      )
      showLabel(
        document
          .querySelector(".toolbar-group-permanent_hazards")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text"),
      )
      showLabel(
        document
          .querySelector(".restricted-driving-area")
          .shadowRoot.querySelector(".button-text"),
      )
    }

    resizeSearch()
  }
  function unfloatButtons() {
    /// / remove once we figure out how to stop saves unfloating stuff...
    return

    const fname = "unfloatButtons"
    layersButton = getByClass("layer-switcher-button")[0]
    refreshButton = getByClass("reload-button")[0]
    shareButton = getByClass("share-location-button")[0]
    if (getById("_cbUnfloatButtons").checked) {
      unfloat()

      // hacks for other scripts
      if (getById("Info_div")) {
        getByClass("bottom overlay-buttons-container")[0].appendChild(
          getById("Info_div"),
        )
        getById("Info_div").style.marginTop = "8px"
      }
      if (getById("BeenHere")) getById("BeenHere").style.top = "310px"
      // temporary hack for new button arrangements Map Nav Historic
      if (getById("prevIcon"))
        insertNodeBeforeNode(
          getById("prevIcon").parentNode,
          getById("nextIcon").parentNode,
        )

      if (wmeFUinitialising) setTimeout(unfloat, 5000)
    } else if (!wmeFUinitialising) {
      float()
      layersButton.onmouseover = null
      document.body.onmouseleave = null
      getById("layer-switcher-region").onmouseleave = null
      removeStyle(PREFIX + fname)

      if (getById("Info_div")) {
        getByClass("overlay-buttons-container top")[0].appendChild(
          getById("Info_div"),
        )
        getById("Info_div").style.marginTop = ""
      }
      if (getById("BeenHere")) getById("BeenHere").style.top = "280px"
    }
  }
  function unfloat_ReloadClickHandler() {
    // Clicking on the refresh button essentially just calls the following native function,
    // however once we do this then the bloody refresh button loses its onclick hander AGAIN,
    // so we need to reinstate it before we go...
    W.controller.reloadData()
    refreshButton.addEventListener("click", unfloat_ReloadClickHandler)
  }
  function SLBRelocate() {
    // Once the mutation observer code has decided that the share location popup needs relocation,
    // we first wait for it to become visible (usually this is true the first time we get in here,
    // but sometimes WME will surprise us by getting here a tad too quickly for the popup).
    //
    // Once the popup exists, we first hide it (to avoid it briefly appearing in its native position
    // before being relocated) and then we wait ever so slightly longer before trying to move it,
    // otherwise WME seems to occasionally overwrite our position with the native one again...
    const tippy = document.querySelector(".tippy-box")
    if (tippy === null) {
      window.setTimeout(SLBRelocate, 100)
    } else {
      tippy.parentElement.style.visibility = "hidden"
      window.setTimeout(SLBApplyTransform, 100)
    }
  }
  function SLBApplyTransform() {
    // Finally we get to actually restyle the popup...  This is simply a case of replacing the native
    // transform (which nudges it a little to tne left and down relative to the top-right corner of the
    // map viewport) with our own (which nudges it a little less to the left, but a lot further down,
    // based on how far away the share location button is).  And then remembering to make it visible
    // again, so the user sees it appearing in the desired position as if it was always meant to be :-)
    const tippy = document.querySelector(".tippy-box").parentElement
    const tipBCR = tippy.getBoundingClientRect()
    const slbBCR = document
      .querySelector(".share-location-button")
      .getBoundingClientRect()
    const tY = `${slbBCR.top - tipBCR.bottom}px`
    tippy.style.transform = `translate(-20px, ${tY})`
    tippy.style.visibility = ""
  }
  var OBObserver = new MutationObserver(mutations => {
    // To check when the share location button popup displays, you'd think we could just use an onclick handler
    // on the share location button itself, but no, that would be FAR too easy...  Whilst setting an onclick
    // does work the first time, the way WME re-renders the button to change it between its selected and
    // unselected states causes the handler to be lost, and I couldn't figure out how to get it reapplied
    // reliably/efficiently.
    //
    // So here we are with plan B - a mutation observer attached to the DOM element that contains the button,
    // within which we can then check firstly to see if the button has been moved into the bottom bar (if
    // it's in its native location then we don't need to relocate the popup), and then if the button is
    // active.  If it is, then we know the popup is visible and in need of relocation...
    if (getById("_cbUnfloatButtons").checked === true) {
      if (
        document.querySelector(
          ".share-location-button.overlay-button.overlay-button-active",
        ) !== null
      ) {
        SLBRelocate()
      }
    }

    // WME being WME, we also have to deal with it sometimes adding a copy of the share location button, which
    // sits atop the original so that visually all looks the same, however this copy doesn't have all of the
    // same onclick handlers setup, so clicking on it doesn't actually cause the popup to appear.  One such way
    // to provoke this second button to be generated is if it's been clicked on at least once, and you then
    // enter and leave house number editing mode.
    //
    // As having this slightly broken button blocking access to the actual button is a bit of an embuggerance,
    // we make sure that any time we detect multiple copies appearing in the DOM, we nuke all of the
    // imposters, leaving the original available for clicky enjoyment once again.
    //
    // Have I ever mentioned how much I love what the devs have done with WME?  I mean, having to deal with
    // random crap like this really, truly, without any question, utterly and completely MAKES my day...
    let nSLB = document.querySelectorAll(
      ".share-location-button.overlay-button",
    ).length
    if (nSLB > 1) {
      while (nSLB > 1) {
        --nSLB
        document
          .querySelectorAll(".share-location-button.overlay-button")
          [nSLB].remove()
      }
    }
  })
  function unfloat() {
    // temporary
    return

    if (getById("_cbUnfloatButtons").checked === true) {
      const slb = getByClass("share-location-button")[0]
      const wcp = getByClass("WazeControlPermalink")[0]
      if (slb !== undefined && wcp !== undefined) {
        // as we may end up calling this function multiple times, we first refloat so that any changes
        // made here will always be applied to the default styles rather than any we've already changed
        float()

        if (getById("_cbMoveUserInfo").checked === false) {
          insertNodeAfterNode(
            layersButton,
            document.querySelector("wz-user-box"),
          )
        } else {
          insertNodeAfterNode(
            layersButton,
            getById("save-button").parentElement.parentElement,
          )
        }
        layersButton.classList.add("toolbar-button")
        layersButton.firstChild.classList.add("item-container")
        layersButton.firstChild.classList.add(
          "item-icon",
          "w-icon",
          "w-icon-layers",
        )

        insertNodeBeforeNode(
          refreshButton,
          document.querySelector(".secondary-toolbar"),
        )
        refreshButton.classList.add("toolbar-button")
        refreshButton.firstChild.classList.add("item-container")
        refreshButton.firstChild.classList.add(
          "item-icon",
          "w-icon",
          "w-icon-refresh",
        )
        // Something's changed in the latest iteration of WME which means that moving the refresh button
        // stops it accepting mouse clicks, so we need to set up a new onclick handler to replicate the
        // desired behaviour...
        refreshButton.addEventListener("click", unfloat_ReloadClickHandler, {
          once: true,
        })

        const lmBCR = wcp.getBoundingClientRect()
        const sbBCR = slb.getBoundingClientRect()
        const sbTop = lmBCR.top - sbBCR.top - 3

        let styles = ""
        styles += `.share-location-button { position: absolute; top: ${
          sbTop
        }px; height: 18px; }`
        styles +=
          "#edit-buttons .overlay-button-disabled { opacity: 0.5; cursor: not-allowed; }"
        styles += ".share-location-button-region { display: inline-block; }"
        styles += ".w-icon-layers { top: 0px!important; }"
        styles += "div.WazeControlPermalink { padding-right: 64px; }"
        styles +=
          "div.share-location-button-region > div > div > i { line-height: 18px; }"
        styles += "a.w-icon.w-icon-link { line-height:17px; font-size: 20px; }"
        // correct button sizing when moved into bottom bar
        styles += ".share-location-button { height:24px; width:30px; }"
        addStyle(`${PREFIX}unfloatButtons2`, styles)
      }
    }
  }
  function float() {
    // temporary
    return

    const elm = getByClass("overlay-buttons-container top")[0]
    if (elm !== undefined) {
      elm.appendChild(layersButton)
      layersButton.classList.remove("toolbar-button")
      layersButton.firstChild.classList.remove("item-container")
      layersButton.firstChild.classList.remove(
        "item-icon",
        "w-icon",
        "w-icon-layers",
      )
      layersButton.firstChild.classList.add("overlay-button")
      layersButton.firstChild.classList.add("w-icon", "w-icon-layers")

      elm.appendChild(refreshButton)
      refreshButton.classList.remove("toolbar-button")
      refreshButton.firstChild.classList.remove("item-container")
      refreshButton.firstChild.classList.remove(
        "item-icon",
        "w-icon",
        "w-icon-refresh",
      )
      refreshButton.firstChild.classList.add("overlay-button")
      refreshButton.firstChild.classList.add("w-icon", "w-icon-refresh")

      elm.appendChild(shareButton)

      removeStyle(`${PREFIX}unfloatButtons2`)
    }
  }
  function hackGSVHandle() {
    const fname = "hackGSVHandle"
    let styles = ""
    if (getById("_cbHackGSVHandle").checked) {
      styles +=
        "#editor-container #map.street-view-mode #street-view-drag-handle { height: 29px; background: lightgrey; font-size: 24px; border-radius: 8px; text-align: center; padding-top: 2px; border: 1px black solid; }"
      addStyle(PREFIX + fname, styles)
      getById("street-view-drag-handle").classList.add(
        "w-icon",
        "w-icon-round-trip",
      )
      getById("street-view-drag-handle").title =
        "Double-click to reset\ndefault width."
    } else {
      removeStyle(PREFIX + fname)
      getById("street-view-drag-handle").removeAttribute("class")
      getById("street-view-drag-handle").removeAttribute("title")
    }
  }
  function enlargeGeoNodes(forceOff) {
    const fname = "enlargeGeoNodes"
    removeStyle(PREFIX + fname)
    let styles = ""
    if (getById("_inpEnlargeGeoNodes").value < 6)
      getById("_inpEnlargeGeoNodes").value = 6
    if (getById("_cbEnlargeGeoNodes").checked && forceOff === false) {
      const newStyle = `{ transform-box: fill-box; transform-origin: center; vector-effect: non-scaling-stroke; transform:scale(${
        getById("_inpEnlargeGeoNodes").value / 6
      }); }`
      styles += `#${
        W.map.getLayerByUniqueName("sketch").id
      }_vroot [id^="OpenLayers_Geometry_Point_"][fill-opacity="1"][r="6"] ${
        newStyle
      }`
      styles += `#${
        W.map.venueLayer.id
      }_vroot [id^="OpenLayers_Geometry_Point_"][fill-opacity="1"][fill="white"][stroke-opacity="1"][r="6"] ${
        newStyle
      }`
      styles += `#${
        W.map.commentLayer.id
      }_vroot [id^="OpenLayers_Geometry_Point_"][fill-opacity="1"][fill="white"][stroke-opacity="1"][r="6"] ${
        newStyle
      }`
      addStyle(PREFIX + fname, styles)
    }
  }
  function enlargeGeoHandles(forceOff) {
    const fname = "enlargeGeoHandles"
    removeStyle(PREFIX + fname)
    let styles = ""
    if (getById("_inpEnlargeGeoHandles").value < 4)
      getById("_inpEnlargeGeoHandles").value = 4
    if (getById("_cbEnlargeGeoHandlesFU").checked && forceOff === false) {
      const newStyle = `{ transform-box: fill-box; transform-origin: center; vector-effect: non-scaling-stroke; transform:scale(${
        getById("_inpEnlargeGeoHandles").value / 4
      }); }`
      styles += `#${
        W.map.getLayerByUniqueName("sketch").id
      }_vroot [id^="OpenLayers_Geometry_Point_"][fill-opacity="0.6"][r="4"] ${
        newStyle
      }`
      styles += `#${
        W.map.venueLayer.id
      }_vroot [id^="OpenLayers_Geometry_Point_"][fill-opacity="0.6"][stroke-opacity="1"][r="4"]${
        newStyle
      }`
      styles += `#${
        W.map.commentLayer.id
      }_vroot [id^="OpenLayers_Geometry_Point_"][fill-opacity="0.6"][stroke-opacity="1"][r="4"]${
        newStyle
      }`
      addStyle(PREFIX + fname, styles)
    }
  }
  function enlargePointMCs() {
    const fname = "enlargePointMCs"
    removeStyle(PREFIX + fname)
    let styles = ""
    if (getById("_inpEnlargePointMCs").value < 1)
      getById("_inpEnlargePointMCs").value = 1
    if (getById("_cbEnlargePointMCs").checked) {
      const newStyle = `{ fill: #ffff00; fill-opacity: 0.75; transform-box: fill-box; transform-origin: center; vector-effect: non-scaling-stroke; transform:scale(${
        getById("_inpEnlargePointMCs").value
      }); }`
      const newStyleHover = `{ transform-box: fill-box; transform-origin: center; vector-effect: non-scaling-stroke; transform:scale(${
        0.25 + getById("_inpEnlargePointMCs").value / 2
      }); }`
      styles += `#${
        W.map.commentLayer.id
      }_vroot [id^="OpenLayers_Geometry_Point_"][stroke="#ffffff"][r="6"]${
        newStyle
      }`
      styles += `#${
        W.map.commentLayer.id
      }_vroot [id^="OpenLayers_Geometry_Point_"][stroke="#ffffff"][r="12"]${
        newStyleHover
      }`
      addStyle(PREFIX + fname, styles)
    }
  }
  function updateTheme() {
    switch (options.theme) {
      case "dark":
        // add class dark-mode to html
        document.documentElement.classList.add("dark-mode")
        break
      case "light":
        // remove class dark-mode from html
        document.documentElement.classList.remove("dark-mode")
        break
      case "system":
        // check if system prefers dark mode
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark-mode")
        } else {
          document.documentElement.classList.remove("dark-mode")
        }
      default:
        break
    }
  }
  function addGlobalStyle(css) {
    let head
    let style
    head = document.getElementsByTagName("head")[0]
    if (!head) {
      return
    }
    style = document.createElement("style")
    style.type = "text/css"
    style.innerHTML = modifyHTML(css)
    head.appendChild(style)
  }
  function addStyle(ID, css) {
    let head
    let style
    head = document.getElementsByTagName("head")[0]
    if (!head) {
      return
    }
    removeStyle(ID) // in case it is already there
    style = document.createElement("style")
    style.type = "text/css"
    style.innerHTML = modifyHTML(css)
    style.id = ID
    head.appendChild(style)
  }
  function removeStyle(ID) {
    const style = document.getElementById(ID)
    if (style) {
      style.parentNode.removeChild(style)
    }
  }
  function getByClass(classname, node) {
    if (!node) {
      node = document.getElementsByTagName("body")[0]
    }
    return node.getElementsByClassName(classname)
    // var a = [];
    // var re = new RegExp('\\b' + classname + '\\b');
    // var els = node.getElementsByTagName("*");
    // for (var i=0,j=els.length; i<j; i++) {
    // 	if (re.test(els[i].className)) { a.push(els[i]); }
    // }
    // return a;
  }
  function getById(node) {
    return document.getElementById(node)
  }
  function insertNodeBeforeNode(insertNode, beforeNode) {
    if (insertNode == null || beforeNode == null) {
      logit("null node during insert", "error")
    } else {
      beforeNode.parentNode.insertBefore(insertNode, beforeNode)
    }
  }
  function insertNodeAfterNode(insertNode, afterNode) {
    insertNodeBeforeNode(insertNode, afterNode)
    insertNodeBeforeNode(afterNode, insertNode)
  }
  function logit(msg, typ) {
    if (!typ) {
      console.log(`${PREFIX}: ${msg}`)
    } else {
      switch (typ) {
        case "error":
          console.error(`${PREFIX}: ${msg}`)
          break
        case "warning":
          console.warn(`${PREFIX}: ${msg}`)
          break
        case "info":
          console.info(`${PREFIX}: ${msg}`)
          break
        case "debug":
          if (debug) {
            console.warn(`${PREFIX}: ${msg}`)
          }
          break
        default:
          console.log(`${PREFIX} unknown message type: ${msg}`)
          break
      }
    }
  }

  async function loadVueJS() {
    // check if Vue.js is already loaded
    if (typeof Vue !== "undefined") {
      return
    }
    logit("Loading Vue.js")
    const vuejs = document.createElement("script")
    vuejs.src = "https://unpkg.com/vue@3/dist/vue.global.js"
    document.head.appendChild(vuejs)
  }

  async function loadJqueryUI() {
    // check if jQuery UI is already loaded
    if (typeof jQuery.ui !== "undefined") {
      return
    }
    logit("Loading jQuery UI")
    const jqueryui = document.createElement("script")
    jqueryui.src = "https://code.jquery.com/ui/1.13.3/jquery-ui.min.js"
    document.head.appendChild(jqueryui)
  }

  loadVueJS()
  loadJqueryUI()
  // Start it running
  setTimeout(init1, 200)
})()

GM_addStyle(`
:host,
:root {
  /**
    Generated White mode
  */
  --color-primary-100: #f2faff;
  --color-primary-200: #ccebff;
  --color-primary-300: #a6dbff;
  --color-primary-400: #80ccff;
  --color-primary-500: #0099ff;
  --color-primary-600: #007acc;
  --color-primary-700: #005c99;
  --color-primary-800: #003d66;
  --color-primary-900: #001f33;
  --color-secondary-100: #fafcfd;
  --color-secondary-200: #eaf4f6;
  --color-secondary-300: #dbebef;
  --color-secondary-400: #cbe3e8;
  --color-secondary-500: #97c6d1;
  --color-secondary-600: #799ea7;
  --color-secondary-700: #5b777d;
  --color-secondary-800: #3c4f54;
  --color-secondary-900: #1e282a;
  --color-gray-100: #fcfbfb;
  --color-gray-200: #f1f1f0;
  --color-gray-300: #e7e6e4;
  --color-gray-400: #dddcd9;
  --color-gray-500: #bbb8b2;
  --color-gray-600: #96938e;
  --color-gray-700: #706e6b;
  --color-gray-800: #4b4a47;
  --color-gray-900: #252524;
  --color-success-100: #f6fbf6;
  --color-success-200: #dbefdc;
  --color-success-300: #c0e3c2;
  --color-success-400: #a6d7a8;
  --color-success-500: #4caf50;
  --color-success-600: #3d8c40;
  --color-success-700: #2e6930;
  --color-success-800: #1e4620;
  --color-success-900: #0f2310;
  --color-danger-100: #fdf5f7;
  --color-danger-200: #f9d8de;
  --color-danger-300: #f4bbc6;
  --color-danger-400: #ef9ead;
  --color-danger-500: #df3d5b;
  --color-danger-600: #b23149;
  --color-danger-700: #862537;
  --color-danger-800: #591824;
  --color-danger-900: #2d0c12;
  --color-warning-100: #fff9f2;
  --color-warning-200: #fee8cc;
  --color-warning-300: #fed7a6;
  --color-warning-400: #fdc680;
  --color-warning-500: #fb8c00;
  --color-warning-600: #c97000;
  --color-warning-700: #975400;
  --color-warning-800: #643800;
  --color-warning-900: #321c00;
  --color-info-100: #f4fafe;
  --color-info-200: #d3eafd;
  --color-info-300: #b1dafb;
  --color-info-400: #90cbf9;
  --color-info-500: #2196f3;
  --color-info-600: #1a78c2;
  --color-info-700: #145a92;
  --color-info-800: #0d3c61;
  --color-info-900: #071e31;
  --color-primary-alpha-10: rgba(0, 153, 255, 0.1);
  --color-primary-alpha-20: rgba(0, 153, 255, 0.2);
  --color-primary-alpha-30: rgba(0, 153, 255, 0.3);
  --color-primary-alpha-40: rgba(0, 153, 255, 0.4);
  --color-primary-alpha-50: rgba(0, 153, 255, 0.5);
  --color-primary-alpha-60: rgba(0, 153, 255, 0.6);
  --color-primary-alpha-70: rgba(0, 153, 255, 0.7);
  --color-primary-alpha-80: rgba(0, 153, 255, 0.8);
  --color-primary-alpha-90: rgba(0, 153, 255, 0.9);
  --color-secondary-alpha-10: rgba(151, 198, 209, 0.1);
  --color-secondary-alpha-20: rgba(151, 198, 209, 0.2);
  --color-secondary-alpha-30: rgba(151, 198, 209, 0.3);
  --color-secondary-alpha-40: rgba(151, 198, 209, 0.4);
  --color-secondary-alpha-50: rgba(151, 198, 209, 0.5);
  --color-secondary-alpha-60: rgba(151, 198, 209, 0.6);
  --color-secondary-alpha-70: rgba(151, 198, 209, 0.7);
  --color-secondary-alpha-80: rgba(151, 198, 209, 0.8);
  --color-secondary-alpha-90: rgba(151, 198, 209, 0.9);
  --color-gray-alpha-10: rgba(187, 184, 178, 0.1);
  --color-gray-alpha-20: rgba(187, 184, 178, 0.2);
  --color-gray-alpha-30: rgba(187, 184, 178, 0.3);
  --color-gray-alpha-40: rgba(187, 184, 178, 0.4);
  --color-gray-alpha-50: rgba(187, 184, 178, 0.5);
  --color-gray-alpha-60: rgba(187, 184, 178, 0.6);
  --color-gray-alpha-70: rgba(187, 184, 178, 0.7);
  --color-gray-alpha-80: rgba(187, 184, 178, 0.8);
  --color-gray-alpha-90: rgba(187, 184, 178, 0.9);
  --color-success-alpha-10: rgba(76, 175, 80, 0.1);
  --color-success-alpha-20: rgba(76, 175, 80, 0.2);
  --color-success-alpha-30: rgba(76, 175, 80, 0.3);
  --color-success-alpha-40: rgba(76, 175, 80, 0.4);
  --color-success-alpha-50: rgba(76, 175, 80, 0.5);
  --color-success-alpha-60: rgba(76, 175, 80, 0.6);
  --color-success-alpha-70: rgba(76, 175, 80, 0.7);
  --color-success-alpha-80: rgba(76, 175, 80, 0.8);
  --color-success-alpha-90: rgba(76, 175, 80, 0.9);
  --color-danger-alpha-10: rgba(223, 61, 91, 0.1);
  --color-danger-alpha-20: rgba(223, 61, 91, 0.2);
  --color-danger-alpha-30: rgba(223, 61, 91, 0.3);
  --color-danger-alpha-40: rgba(223, 61, 91, 0.4);
  --color-danger-alpha-50: rgba(223, 61, 91, 0.5);
  --color-danger-alpha-60: rgba(223, 61, 91, 0.6);
  --color-danger-alpha-70: rgba(223, 61, 91, 0.7);
  --color-danger-alpha-80: rgba(223, 61, 91, 0.8);
  --color-danger-alpha-90: rgba(223, 61, 91, 0.9);
  --color-warning-alpha-10: rgba(251, 140, 0, 0.1);
  --color-warning-alpha-20: rgba(251, 140, 0, 0.2);
  --color-warning-alpha-30: rgba(251, 140, 0, 0.3);
  --color-warning-alpha-40: rgba(251, 140, 0, 0.4);
  --color-warning-alpha-50: rgba(251, 140, 0, 0.5);
  --color-warning-alpha-60: rgba(251, 140, 0, 0.6);
  --color-warning-alpha-70: rgba(251, 140, 0, 0.7);
  --color-warning-alpha-80: rgba(251, 140, 0, 0.8);
  --color-warning-alpha-90: rgba(251, 140, 0, 0.9);
  --color-info-alpha-10: rgba(33, 150, 243, 0.1);
  --color-info-alpha-20: rgba(33, 150, 243, 0.2);
  --color-info-alpha-30: rgba(33, 150, 243, 0.3);
  --color-info-alpha-40: rgba(33, 150, 243, 0.4);
  --color-info-alpha-50: rgba(33, 150, 243, 0.5);
  --color-info-alpha-60: rgba(33, 150, 243, 0.6);
  --color-info-alpha-70: rgba(33, 150, 243, 0.7);
  --color-info-alpha-80: rgba(33, 150, 243, 0.8);
  --color-info-alpha-90: rgba(33, 150, 243, 0.9);
  /**
  	Others
  	var\(--(?!fs-color|border|size)(.+)
  */
  /**
    Shadow
    https://shadows.brumm.af/
  */
  --wme-shadow: 0px 1.2px 5.3px rgba(0, 0, 0, 0.061),
    0px 4px 17.9px rgba(0, 0, 0, 0.089), 0px 18px 80px rgba(0, 0, 0, 0.15);
  --alarming: #df3d5b;
  --alarming_variant: #e2506b;
  --always_white: #fff;
  --always_black: #000;
  --always_dark: var(--color-secondary-900);
  --always_dark_background_default: var(--color-gray-900);
  --always_dark_background_variant: var(--always_black);
  --always_dark_content_default: var(--color-gray-100);
  --always_dark_content_p1: var(--color-gray-400);
  --always_dark_content_p2: var(--color-gray-500);
  --always_dark_inactive: var(--color-gray-600);
  --always_dark_surface_default: var(--color-gray-800);
  --border-default: var(--color-primary-200);
  --background_default: var(--always_white);
  --background_modal: rgba(0, 15, 26, 0.6);
  --background_table_overlay: var(--color-gray-alpha-60);
  --background_variant: var(--color-primary-200);
  --brand_carpool: #1ee592;
  --brand_waze: #33ccff;
  --cautious: #ffc400;
  --cautious_variant: #e37400;
  --content_default: var(--color-primary-900);
  --content_p1: var(--color-gray-800);
  --content_p2: var(--color-gray-700);
  --content_p3: var(--color-gray-600);
  --disabled_text: #bbb8b2;
  --hairline: var(--color-gray-300);
  --hairline_strong: var(--color-gray-600);
  --handle: var(--color-primary-200);
  --hint_text: var(--color-gray-800);
  --ink_elevation: var(--always_white);
  --ink_on_primary: var(--color-primary-900);
  --ink_on_primary_focused: rgba(0, 15, 26, 0.15);
  --ink_on_primary_hovered: rgba(0, 15, 26, 0.05);
  --ink_on_primary_pressed: rgba(0, 15, 26, 0.1);
  --leading_icon: #97c6d1;
  --on_primary: var(--always_white);
  --primary: #0099ff;
  --primary_variant: var(--color-primary-700);
  --promotion_variant: #842feb;
  --report_chat: #1ee592;
  --report_closure: #feb87f;
  --report_crash: #d5d7db;
  --report_gas: #1bab50;
  --report_hazard: #ffc400;
  --report_jam: #ff5252;
  --report_place: #c088ff;
  --report_police: #1ab3ff;
  --safe: #4caf50;
  --safe_variant: var(--color-success-700);
  --separator_default: var(--color-secondary-200);
  --shadow_default: var(--color-gray-800);
  --surface_alt: var(--color-primary-100);
  --surface_default: var(--color-gray-100);
  --surface_variant: var(--color-gray-200);
  --surface_variant_blue: #e6f5ff;
  --surface_variant_green: #edf7ee;
  --surface_variant_yellow: #fff9e6;
  --surface_variant_orange: #fff4e6;
  --surface_variant_red: #fcecef;
  --surface_variant_purple: #f3eafd;
  color: #000;
  color-scheme: light;
}

.dark-mode {
  /**
    	Genrated Dark mode
		*/
  --color-primary-100: #00080d;
  --color-primary-200: #001f33;
  --color-primary-300: #003659;
  --color-primary-400: #004d80;
  --color-primary-500: #0099ff;
  --color-primary-600: #33adff;
  --color-primary-700: #66c2ff;
  --color-primary-800: #99d6ff;
  --color-primary-900: #ccebff;
  --color-secondary-100: #030404;
  --color-secondary-200: #0b0e0f;
  --color-secondary-300: #13191a;
  --color-secondary-400: #1c2325;
  --color-secondary-500: #374649;
  --color-secondary-600: #5f6b6d;
  --color-secondary-700: #879092;
  --color-secondary-800: #afb5b6;
  --color-secondary-900: #d7dadb;
  --color-gray-100: #070606;
  --color-gray-200: #1a1a18;
  --color-gray-300: #2e2d2b;
  --color-gray-400: #42403d;
  --color-gray-500: #84807a;
  --color-gray-600: #9d9995;
  --color-gray-700: #b5b3af;
  --color-gray-800: #ceccca;
  --color-gray-900: #e6e6e4;
  --color-success-100: #040904;
  --color-success-200: #0f2310;
  --color-success-300: #1b3d1c;
  --color-success-400: #265828;
  --color-success-500: #4caf50;
  --color-success-600: #70bf73;
  --color-success-700: #94cf96;
  --color-success-800: #b7dfb9;
  --color-success-900: #dbefdc;
  --color-danger-100: #0b0305;
  --color-danger-200: #2d0c12;
  --color-danger-300: #4e1520;
  --color-danger-400: #701f2e;
  --color-danger-500: #df3d5b;
  --color-danger-600: #e5647c;
  --color-danger-700: #ec8b9d;
  --color-danger-800: #f2b1bd;
  --color-danger-900: #f9d8de;
  --color-warning-100: #0d0700;
  --color-warning-200: #321c00;
  --color-warning-300: #583100;
  --color-warning-400: #7e4600;
  --color-warning-500: #fb8c00;
  --color-warning-600: #fca333;
  --color-warning-700: #fdba66;
  --color-warning-800: #fdd199;
  --color-warning-900: #fee8cc;
  --color-info-100: #02080c;
  --color-info-200: #071e31;
  --color-info-300: #0c3555;
  --color-info-400: #114b7a;
  --color-info-500: #2196f3;
  --color-info-600: #4dabf5;
  --color-info-700: #7ac0f8;
  --color-info-800: #a6d5fa;
  --color-info-900: #d3eafd;
  --color-secondary-alpha-10: rgba(55, 70, 73, 0.1);
  --color-secondary-alpha-20: rgba(55, 70, 73, 0.2);
  --color-secondary-alpha-30: rgba(55, 70, 73, 0.3);
  --color-secondary-alpha-40: rgba(55, 70, 73, 0.4);
  --color-secondary-alpha-50: rgba(55, 70, 73, 0.5);
  --color-secondary-alpha-60: rgba(55, 70, 73, 0.6);
  --color-secondary-alpha-70: rgba(55, 70, 73, 0.7);
  --color-secondary-alpha-80: rgba(55, 70, 73, 0.8);
  --color-secondary-alpha-90: rgba(55, 70, 73, 0.9);
  --color-gray-alpha-10: rgba(132, 128, 122, 0.1);
  --color-gray-alpha-20: rgba(132, 128, 122, 0.2);
  --color-gray-alpha-30: rgba(132, 128, 122, 0.3);
  --color-gray-alpha-40: rgba(132, 128, 122, 0.4);
  --color-gray-alpha-50: rgba(132, 128, 122, 0.5);
  --color-gray-alpha-60: rgba(132, 128, 122, 0.6);
  --color-gray-alpha-70: rgba(132, 128, 122, 0.7);
  --color-gray-alpha-80: rgba(132, 128, 122, 0.8);
  --color-gray-alpha-90: rgba(132, 128, 122, 0.9);
  --color-background: var(--color-primary-100);
  --color-white: #000;
  --color-black: #fff;
  --always_white: #000;
  --always_black: #fff;
  --wme-shadow: 0px 1.2px 5.3px rgba(0, 0, 0, 0.2),
    0px 4px 17.9px rgba(0, 0, 0, 0.3), 0px 18px 80px rgba(0, 0, 0, 0.4);
  color: white;
  color-scheme: dark;
}

`)

GM_addStyle(`
  .vue-fail-logo {
  display: flex;
  justify-content: center;
}

.vue-fail-logo svg {
  width: 50%;
  filter: drop-shadow(0 0 0.75rem rgba(150, 150, 150, 0.8));
}

#abAlerts {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10000;
  background-color: var(--color-primary-100);
  border-width: 3px;
  border-style: solid;
  border-radius: 10px;
  box-shadow: var(--wme-shadow);
  padding: 4px;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

#abAlerts div {
  padding: 4px;
}

#abAlerts #header {
  background-color: var(--color-primary-400);
  font-weight: bold;
}

#abAlerts #content {
  background-color: White;
  overflow: auto;
  max-height: 500px;
}

#abAlerts #abAlertTickBtn,
#abAlerts #abAlertCloseBtn {
  cursor: pointer;
  font-size: 14px;
  border: 1px solid var(--color-primary-800);
  border-radius: 4px;
  padding: 2px 10px 2px 10px;
}

.aerial_shifter .control_group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
}

#_inpGSVContrast,
#_inpGSVBrightness,
#_inpGSVWidth {
  height: 20px;
  width: 46px;
  text-align: right;
}
#_inpASX,
#_inpASY,
#_inpASO,
#_inpASXO,
#_inpASYO,
#_inpASOO {
  height: 20px;
  width: 50px;
  text-align: right;
}
/* Style radio inputs as button group*/
.theme-selector {
  display: flex;
  justify-content: center;
}
.theme-selector input[type="radio"] {
  display: none;
}
.theme-selector label {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-primary-900);
  cursor: pointer;
}
.theme-selector label.left {
  border-radius: 0.5rem 0 0 0.5rem;
}
.theme-selector label.right {
  border-radius: 0 0.5rem 0.5rem 0;
}
.theme-selector input[type="radio"]:checked + label {
  background-color: var(--color-primary-500);
  color: var(--color-primary-100);
}

.dark-mode input[type="text"],
.dark-mode input[type="email"],
.dark-mode input[type="number"],
.dark-mode input[type="password"],
.dark-mode select,
.dark-mode button,
.dark-mode textarea,
.dark-mode .form-control {
  background-color: var(--color-gray-300);
  color: var(--color-black);
}

.layer-switcher .menu {
  background-color: var(--color-gray-200);
  color: var(--color-black) !important;
}

.layer-switcher .layer-switcher-toggler-tree-category > .label-text {
  color: var(--color-black) !important;
}

.dark-mode .house-numbers-layer .house-number .content .input-wrapper {
  background-color: var(--color-gray-300);
}

.wz-tooltip-content,
.wz-tooltip-content-holder {
  pointer-events: none;
  user-select: none;
}

`)
