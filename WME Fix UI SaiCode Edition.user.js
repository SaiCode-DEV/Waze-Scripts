// ==UserScript==
// @name                WME Fix UI SaiCode Edition
// @namespace           https://greasyfork.org/en/scripts/435828-wme-fix-ui-memorial-edition
// @description         Allows alterations to the WME UI to fix things screwed up or ignored by Waze
// @include             /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @supportURL          https://www.waze.com/forum/viewtopic.php?t=334618
// @version             1.63.257
// @grant               none
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
/* globals $: */
/* globals W: true */
/* globals I18n: */
/* globals OpenLayers: true */
/* globals trustedTypes: */
/* globals ResizeObserver: */
/* globals jQuery: */
/* jshint esversion: 11 */

(function () {
  // global variables
  FUME_VERSION = "1.63.257";
  FUME_DATE = "2024-05-07";
  const newVersionNotes = ["Compatibility fix for latest WME release..."];

	PREFIX = "WMEFUME";

  let oldVersion;
  let tabAttempts = 0;
  let debug = true;
  let wmeFUinitialising = true;
  let kineticDragParams;
  let yslider;
  let layersButton, refreshButton, shareButton;
  let zliResizeObserver = null;

  let killTurnPopup = false;

  let abAlerts = null;
  let abAlertBoxStack = [];
  let abAlertBoxTickAction = null;
  let abAlertBoxCrossAction = null;
  let abAlertBoxInUse = false;

  function abAlertBoxObj(
    headericon,
    title,
    content,
    hasCross,
    tickText,
    crossText,
    tickAction,
    crossAction
  ) {
    this.headericon = headericon;
    this.title = title;
    this.content = content;
    this.hasCross = hasCross;
    this.tickText = tickText;
    this.crossText = crossText;
    this.tickAction = tickAction;
    this.crossAction = crossAction;
  }
  function abCloseAlertBox() {
    document.getElementById("abAlerts").childNodes[0].innerHTML =
      modifyHTML("");
    document.getElementById("abAlerts").childNodes[1].innerHTML =
      modifyHTML("");
    document.getElementById("abAlertTickBtnCaption").innerHTML = modifyHTML("");
    document.getElementById("abAlertCrossBtnCaption").innerHTML =
      modifyHTML("");
    abAlertBoxTickAction = null;
    abAlertBoxCrossAction = null;
    document.getElementById("abAlerts").style.visibility = "hidden";
    document.getElementById("abAlertCrossBtn").style.visibility = "hidden";
    abAlertBoxInUse = false;
    if (abAlertBoxStack.length > 0) {
      abBuildAlertBoxFromStack();
    }
  }
  function abCloseAlertBoxWithTick() {
    if (typeof abAlertBoxTickAction === "function") {
      abAlertBoxTickAction();
    }
    abCloseAlertBox();
  }
  function abCloseAlertBoxWithCross() {
    if (typeof abAlertBoxCrossAction === "function") {
      abAlertBoxCrossAction();
    }
    abCloseAlertBox();
  }
  function abShowAlertBox(
    headericon,
    title,
    content,
    hasCross,
    tickText,
    crossText,
    tickAction,
    crossAction
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
        crossAction
      )
    );
    if (abAlertBoxInUse === false) {
      abBuildAlertBoxFromStack();
    }
  }
  function abBuildAlertBoxFromStack() {
    const tbIcon =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAPdXpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjapZhpciu7coT/YxVeAuZhORgjvAMv31+iW7Skc/xeXFuUSKrZxFCVlZkFs//rP4/5D36idd7EVGpuOVt+YovNd95U+/z0++xsvM/3x78f8f+P6+bzgedS4DU8/9b83v913X0GeF4679K3gep8Pxg/P2jxHb/+GuidKGhFWsV6B2rvQME/H7h3gP5sy+ZWy/ctjP28rq+d1OfP6CmUZ+tfg/z+PxaitxIXg/c7uGB5DuFdQNBfMKHzJtznyo16dN3EcwrtXQkB+VucPj/cZ46WGv9604+sfN65v183v7MV/XtL+BXk/Hn963Xj0t+zckP/beZY33f+5/W07X5W9Cv6+jtn1XP3zC56zIQ6v5v62sp9x32DKTR1NSwt28JfYohyH41HBdWTrC077eAxXXOedB0X3XLdHbfv63STJUa/jS+88X76cC/WUHzzk6y5EPVwx5fQwgqVJM+b9hj8Zy3uTtvsNHe2yszLcat3DOb4yj9+mH/6hXNUCs7Z+okV6/JewWYZypyeuY2MuPMGNd0Afz1+/yivgQwmRVkl0gjseIYYyf0PE4Sb6MCNidenXFxZ7wCEiKkTi3GBDJA1F5LLzhbvi3MEspKgztJ9iH6QAZeSXyzSxxAyuaGSmJqvFHdv9clz2XAdMiMTKeRQyE0LnWTFmMBPiRUM9RRSTCnlVFJNLfUccswp51yySLGXUKIpqeRSSi2t9BpqrKnmWmqtrfbmW4A0U8uttNpa6505OyN3vt25offhRxhxJDPyKKOONvoEPjPONPMss842+/IrLPhj5VVWXW317TZQ2nGnnXfZdbfdD1A7wZx40smnnHra6Z+svWn94/EPsuberPmbKd1YPlnjailfQzjRSVLOSBgq4sh4UQoAtFfObHUxemVOObMN+gvJs8iknC2njJHBuJ1Px33lzvgno8rc/ytvpsQfefP/18wZpe4fZu7PvP0ta0syNG/GnipUUG2g+vh81+5rl9j98Wr82Kv1E0awc4bd2xx7r33KHnn1teMZjWX1tJc/vR0KqqxBxFziS/XMclY+rZjF1a73Y41Z9+gpDjZwktVkfswT8vMW2vT/akV6E/uprbM2IjmWnwO0spkUN5vmdxTiuMoBHp2grp5GCtun7u93+HI2YyPJDq7v64QyiHsavC3jNDdbIlfUUu6OvWBcus/xeSsd/v5qvl0g6G2l2pl75hwOVM+Q/tzRzx29NLdbcrWQ8ZPI9DN+m8nUdAdiH06Q67kldCPF2UkwEcqjk2FX2ibUdpccVtuN2PncWlrhKKAkx8yAgDEPq6inNHB2bOolua877g0sIRGhtXc7aTtG2KmAr0lZEC/fotlMcmLKZbH6HXOfuVJQSq//7Br0I2jr5n31A43uWcqKpw2yvvZa2fDZWWW0tkA8WAE7HVTH8+x+dbeL/b79+6ohoXIQf1xrlYCaPcqFYF9AsDD4jgWP08OexHdvFxXQtAvW5vt4mUEiRY7VSzusZNjzXMzgN1KJEhcttpczXai7p7RG9HWRgrSIXBkTJU6d7PLZHgxbj8sk2pDSVfBj8Mqq0/XJ2g7FbSNYKGC+VGSkQqjDlWq36nudemfqggs52JSyyB/eWlTQHHOH2QuxKm99BPdBR0tvmQU4haKnmM8B3l/QNy/2y5qTnTgwmclGbU+hnxHC3PZ5mzNTUdkCai8CqhbXl1iombBZbexUQhy7v6E9YLfb37UAYDEjSZE7bILaYVIwulnKMGX3DBunPJwDAYuypIR5nefZX7WqtUPWREhjxc4NoVvoLPS9O+Hf1TnTnvmwWb7f1DCJzWMpe4WIpYOzKuxbhpuqAZYDgit5ubaE5vYAzszT1reCbtobfvknRwxA5Y+ID9Sti7p8UXd2HAPIpmSgvskH9eE9xvlJfP+W93Z43hr1Gi3hO8ACCe6k1I5qj3JZmJiVQHHVZ0z9mGPZEwUq34ktBFFWyLQxY5uZbyUUNzeRwFfgYa5E+YEprDMKz6rgFEA+VMdnqykSoDNA4qQvoatGn3ZuK2o2lte/Z7k0muwVpumoEJAeBGlSAglhG4qX1hkDZQnqMvViegaeA0if+HJ5/ACH4acKnFF420O1Ch0tyoc8xB0su/dl/INl3/Ibu1cz8AB8W8w07fEDwUL1CoF3CGIPk2QliopKzmfFHU0nUquOhb9T6gKFRJpdmEugLeqSWDSinkYA2YsFDPayc4HC2DMhDChepjuK4eSgD4J4Z8BoKOEszZbhDqUGcMnlAFERm34+14cX7fItC3PfgfwzEGxB5cMbvqTcRSbOQxADH6HEwG0rbYqM3edUK1QSt0LeXcfsG5wAYD63vlsJorGfEX/QTos70yd4v5gXTHTTJ7KkKZPo9ep7gAOrSGFSyh6OoEQavU6DbtJHWNAyPk5QPLWYsqHS0FOEmqxAKw2AJIDiG5AlNGwynZRfsWzOKsDMykctMjw4C6WSBbZWgSrl6xHZIs8ndINzaKLEQCvFVJCFvrvSgAbKMyTyqG8SuNLzUE+b3V0DkGRdsN2MXOeFTe8krZURsE/FFYICVzL5ksUnKkgTPF+mWSw+XAIgQZTvbP1Ge8tZfrmWdvH6VztzX2fu5lg2QeEeC3rpCKWSB19DIcA4TJtFiqLBsSbOp26EGNNEIwNqwEtnWbCAcezTUfYePod2y9gwMsO6y67ozSQBHnyqZIE4NBpVHGwbdkaYQN9om6ylG0nPRl2kNEfNUsBZmApDIBIKOJI0rumu6foTjNcBK+LZwtIEW9Mb24CQGY/XMLgTBzsLniPtDdKO4C5Ph1XBNMx1MBCAhIz6fg3vxSmOrcxdvwTj372S11JJOGJI+nafASLFpS9rKj09Y7GcExFvC5rEQKnit88Qo/lFMIgIzkpWpUFcXGNL4tJOrzDPTkG6RnxQKRwIM6m1SGJ5RaeOW/Yn+CFfOmgHsA1Alkohq+TE52fLHobEa2DjySsxAdVwHialdwUG5qACT1yBvGALXA6ALIKxTsmX4mkutJWAJzLl8rO8IWy252iQgcSguyo3gYxrrBwZocsf5u3xoeg7y+vD1fXC1uzk57/w4S+yB+xV7JG97uSVAmEXrI91B6oAUBtYhK1By3nIZ5/X+kDHETAgPJfoH9XYVv5AdvuyjoCB312V8YdZc7sp+dsjIIkZSQzy9/y/0Gp6n4nIoxRMLCwmuqM8Ku4FNhlHLJnFaQZVpmoW3RoKAOIQCSdTh8RX8KbrjzWW/4CzUO0x6NfOmqoieiq8ymCgDo7V+vUAxWzJaEmUqlhKXYnHjA0aJRVIHcgyGV23fdr53rZULJgGoxMprwjxPcXhoVG5RJw0ycGX4UdOVJghpz2GKoXajQOG7mydftmX2x15PFb9w0rHi1yQriHKk6l1/eqWQFAHUCbt0pyDCBxDpmSqcMRMRF/H04YtdjosSHVDeGht9f25R1UteaZOFbxXlXLIOBOcP3QC+89QqT6Ll4KtuI3yY/04l7GylViUgB8HOSywke9C3wOnwU0zy4QgR7D+9eMFhsMektywYGw4qFnyQz1YaCctSt5KQSkKeDCwtBkFU9lGR2tjKHBwu0kxDU9IHqTnhC/HBPRl1bslHM2q1OiMyDri4ZCK/aQmUoGZfg43gkcLre888bPsC2bd5zYmdGUITMtETI2FwniEM8ypmpmJfAhg6CRebDYje953HYPOQ1LNirOTk3TkbDWYsuUw/H49+roe/Z4UNBbnBQloreP8t2PpXk5quY2hC6ptpAwJgXSojRVcgV1bEC3Q+7plFVSZJ7wqzB42loy+vyEEE0DDnuKkAk9IIEiphQ5pbUldpQoWWaNYnQ4JHEZF9+x7jwcDhpvYvWCCOWwdsqRHe/mDThECo43BeYsk13Ut1v5yJfToadEcF/xSoeQIDK0Wm0BKqARMvnzUUlNA9eOSQOGkVZZVv7pIKWZfJkau7WkwqupEb89GA3FqJnpAB23YgJvUofMTrMvxIbHwyJJrPNmRma6ssJa5zZYFlu+65wfrnh+ke36AZGNBxlQLhOkuYFU1JiGhK5ZZmJifuuU98jYdXKsVDdvteq48bDrSwVdYgIhsFYfxZWfyeFA4Fjbgu6SQzE5NV0DcQXYpyhUCIIdybqNN/1dqnCzRQUbS9qEejX5pSYvRP9YCrpxEkJaYpRgda5IGggdgvV9LB6FifHCUAK3k9bmoJs1CCO3+IqybskcEUFcQRQuRslP4ikwM9d/uwUCcMgI6llkwP7thZzpmgjii7TSFx6qloFcfIBrdM319ncOwGUmD515cFeKLJtJ9v10uTZNT3HDydGbnJo4gbEkmjV3GjRBntbNl4Va+2uvo8IM6BsQuqVgBK92zk2Not20IG9G3GDL1omOfZHQI1u4hWJYPqjqkUSeGWNBCwPkYJlKgbgybIxKkQ9cpzMVWC2REznYbGgEGhzs2v3Tt+E3ywrZBFLV3NJFOPifZZGM66qq3562EVcoVVVylmkBr2g8VZi9nhye6BSlxmtqpK19JjCVGo5XotFu0bFBazJLsjLNs12cDzEkhTwqZ7odmDHWrQfYXigN+dcJDlM3MdKLtNslyroBJdouh6N4jTQ3Rx0YxSRFvkmVPEfR6zSx9Z1NTIe0TbAVWCzS6TmShw1BR5qQjjmCepqcGKKnK1WKv5hmwUEiv4V5hogNJ5Y8DQQyAlb/2AqbDcRJssmcAPzJ/VNP4rCvF7wkfPn+138L5ExUw7lq4Xn8WgJQc030tPHmiCJO0sav+MVPXm7CejYfDl2Eedpr4Sp37sWrohwUjQ5HqP5EgfSS7Up8wFyWJp/GXMIYwi/mXc4wYANQuwc7qvfGCJPNIIswu10Kyta9Gt2WohehPHZGlmPXByXaSZrqi2zZ2mq4ZET0d4LAm9AjOZlI5nCGuekJBYKkHMBSVIZur2uy9WWhU1tuyGFtuB7EyLBBZQ0WWzgZp1tT9yY52FaWUVkaCJOjMikyADkqqyEU/hyK695v7NP+L/aT5BGqtwwO7zSBHUJUWNUbHLWoH5pRg3tNX0mOkmDgVHWN5MSASsKGYC78tqp866EG7i6ArgEgmQSbBoC+BkWjvEVhTJA3I/ttUe7WTNJlS7XZVHeqmFcV2VxoLihpHVMQMTa339WCiQjU1XiSuo//XeiuLNxCpS+hwU15HUSAJprt9dH1BHccFNUmYy/wENV3ZiWpR57rnoVE1RmdGQrVJHXsWi+e6J+ZCbYn31DBY8+QA4MU/In7OWc38N1iEhwGR/v/iAAABgWlDQ1BJQ0MgcHJvZmlsZQAAeJx9kUsoRFEcxn9myCSyMAtJugusKCFZaoiUqWmM8lq4985Lzb2me0c2lsp2ysJjY7CwsWZrYauU8ijZ2lgRG+n6n5mpmWScOp1f3znf1znfAV8hY1pu/QBYds6JToW0+YVFrfEFPwGgi4Buutnw7GSMmuPzjjq13varrNrn/hwt8YRrQp0mPGZmnZzwivDIRi6reE84aKb1uPCZcJ8jFxR+ULpR4lfFqSL7VGbQiUXHhYPCWqqKjSo2044lPCzcHbdsyffNlziueFOxlVk3y/dUL2xO2HOzSpfZyRTThImgYbDOKhly9Mtqi+ISlf1QDX9H0R8RlyGuVUxxTLCGhV70o/7gd7ducmiwlNQcgoZnz3vvgcYd+M573teR530fg/8JLu2Kf60Aox+i5yta9yG0bsH5VUUzduFiG9ofs7qjFyW/TF8yCW+n8k0L0HYDTUul3sr7nNxDTLqauYb9A+hNSfZyjXcHqnv790y5vx8MNnJ+vog/WAAAD3BpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDoxYThmMWIxZS1iMDhhLTQxN2EtOThkOS02Njg1OWNmZjg0ODgiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZTQxMTMxMTUtNWJkNS00Yjg5LTg3YTUtNjQ3ZDlkNjVkN2IyIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NmM3ZjJkYmQtZGQwYS00MDNjLThiYTMtMzAyNjRlYWMxNjI4IgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjgwIgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iODAiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjc4MjM1NDcyMjM0NjU2IgogICBHSU1QOlZlcnNpb249IjIuMTAuMzAiCiAgIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiCiAgIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIKICAgdGlmZjpJbWFnZUxlbmd0aD0iODAiCiAgIHRpZmY6SW1hZ2VXaWR0aD0iODAiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiCiAgIHRpZmY6WFJlc29sdXRpb249IjcyLzEiCiAgIHRpZmY6WVJlc29sdXRpb249IjcyLzEiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTEwLTI3VDA4OjUyOjUzKzAxOjAwIgogICB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0xMC0yN1QwODo1Mjo1MyswMTowMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InByb2R1Y2VkIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZmZpbml0eSBEZXNpZ25lciAxLjEwLjMiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMTAtMjdUMDg6NTI6NTMrMDE6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZGY4YTVhMzYtZDZkYy00ZDVmLWJjMWMtMzZhNWViZWY3YzU3IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIzLTAzLTA4VDAwOjMxOjEyIi8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pv26nxYAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAwgAHwyBbZEQAAAJD0lEQVRYw5WXeXDV1RXHP/f3+70tL28LISEhJCqyBYJiosgixQqyiFoI0NoKWq1lbMVOnVE7Zcap7dQ6dKE62DrttI7iVGVzGZWS0Q6LIAghQCwQskFeyEK2917y1t9y+0ceMS9A0TNz//md+zvne+8953zPEXwNMYKVGlCIFLchWA5MAooBf3pLCGgB6oCdII8gadOKdxjXsi3+nzLVslxVhFIG4kngbmAMoF7Dpgl0AFVIXpZC1trG7TC/MQA9WJkv4GkQa4Hc4XtNU2KYEinloBEhUFWBpmaYk0A38IbE2mgbt/Pi1wJgtK4Q0hI3CSH+BlQM3zMQNTjbFOGjTy7Q06tjWoMAFEXgcSss/FYBZZMDBPx2hMgAclQi10mL4/aSHfKqAFKtK4SwxEwhxBbgxuG61vYYL/29ju27UwRG5WG3O1AUBQRYloWhG/T1djGv3OTJRydwU6kfRckwXw+ssaTxhb34PXlFAHpL5c1CiG0jnbd3xtnw4kmO1uXgD+SgKArZ7iwe+O4qbJrG21u30xsKI6UkFo2S4wryx+dKmTbZP/KCG6WUq23FO45d+qAMc56fvvYM5ynd4p9vN3L4lI9AzqjBUwPTSqewcMECZtxyC2XTpg7Fgjs7m+7YWF7+Rz39A/pIAOOFEH81WirzMwDoLctVIXg6/eYZ0tmV4IOqMIGcUYhhDxsKhzl58iRNTU3U1ddn/ON2Z7P3CJw4FbpS3FUgxNNGcIUKoA1CV8rS0Z4R6T2hJLv+00ZLh44veRGbzc6o3FwURaGuvpHnf/u7dAZoCCGGskJRFBxZfuoawsy5NTcDePrQa6UUbwLHNb1lhSYG8zx3+K7Pq7v51Z+CGOo4yitKUDWV7GwPPn8ATdMQaawSME0TXU+RSiUxDINkMoFpGPSGujBN0LTLbmG0EPxUb1nxuCYQhekiMwRTSmhojqC5JzPhhhuJRqNEwiEi4TCRcCj93l8lWboaoKgKXq+f0bn5mIaJ3d6LuGqlEUuAAg3BbekK95VKwNyZeVSfPEO48xRn6uP84L7vUFSQh9Nhx+mwY7cNHkvXDeLJJImkTiql09rRxbH/1jAQPsOds8tQ1asiGCNgtgZi+ZXK6/gSD795ZhrBthgvvHR2MCNSOslUir6wREpr2KVJhFBQFEFuwMek64sIXjyHz2MjmTRxOK5YvVUJi7Q0sVzOA7rF69ua2flhGNcNs4iMn0PK5QIgHoux5/2dTA+ATdOo7jKYf/9yXFnuQcv5cS7sNlm7/gCV9/pZt2YCDrty+SMIUa6lWe0y6epOcOy4l5tLxzP9oZ8weUY58WgUzWbD4/ejqipHt2wGYOHDP2PR6u8R6evD0HVcbjeFJSWcfcei5vgFwvenyMt1XslNoTaMUjMpzZKkUga9/TF8o3L5dOd2ar84hNvj5ZFnfwlIKpfMQ0pJi2UyEA7z2sYXiA0MUDbzdiZMm04kmiCpG1iWvFoceLSrafJynZROCfGvD9qY39vDgspVLFy5GtM0MHSDszXVLFswCafDzu73P2f23Yt5bMNzqKqGlJIzNdUcrKll1VIHPm/hVblbSzcTo0cqXE6V9Y9Owudppmrr2zhdWdjsdvRUik93bGNmwGDqxOsQCObmH+f137/IgpWrsTucpJJJdm99i8ce8LCm8npczqu2EP1aupPJAGBZktb2GDs/vsDHBzXa2/ZCTw+Rvm5mTS3kR3PKmTF1AppmA+ChysWU1zXz762b2X8yyEA8RXNTI/0zCrGsZpYvKWLsGNdIdgRoU597qnQeMP3Sl3jC5JP9HTzzhy62J7+NvugJ5rsNli69h7yAj3Ur53OiOcTRug5qzg6u2qYudKmxevFsQnoWgdGFDBiS3gc38sGeixzdXU+uJ864QjealpENH6vPPTVFgKgElETS5I1tTTxfs4DwHQ9jxWNoThcVIozX66OnuwfDNPn0WCOnG4NEEhadfVFON57nYjiFw2GnubMfUwqi4T7umXoDnkSE03eso2p/HG/fcUon+i91TibIjRpwBOgwLTn2s8MX+XPDEtxrniXVGSTa8CUyGsHn8xFPJInEdfZ92YZpSZqb6jl5YpDWPR4vPl+AvbVtQ4Tkdrvx9rdR7JQExl/HoYkb2LRFoSDvIIvmF6AookNKDmqWtNoUoVS1tsUefvHdAuF85Ak0j59UZxBpmSjJOP4iP7phDvFEdraH22fPQ9dTANhsdlRVHXIO4HA40XUdIU1+WARxI4djq57kpdcaKJsSp2hM1i4B7Yq9+F0jFEq9/NZ7rd3nZ63BPnowZTQBFR47C4tyON9yHqfTmUGrqqridLpwOl2o6uVR3tfXg5YdQLE76UpC2AR7XhEN5d9n+4etXf1R/RWteIehAKxat7/21eOlW7w3zZYIgQZMcNlYMM7DL+6fy4WWc0jLxO3O+jpjBOFwiLq4QlXxXZyWObxyAYLmIMt5y+dZrxy4/o2lD+6p5RIJnQsmZMnv3jphG1N8J0IpXO6FlfZ2mk/XsujuhZSUFLN92zs4HE6isTi6rl9xxeNxOtrbONzajbrmWRKF4zm1bxfGxBlo3sDgzTmcRyi6cX3NXzb3Z/SEtaundyqCdQLZ4FfBpYJEYiEou+VWntjwa2qzx9GEjUZd0p5K4YoHccWDdKaSNOqS86qTzilzcf18E56ptyGEILMKywZFEY+fWjuzc3glHBIniZoEzjXbw+qbB84xvrMLEvXQLwQh8zqsZT9mrs9ilN1ilIyzLF4NwEfOcroVFz0phf1hhbilXOFhZIOC9WCWFqsZWYqHZH9Ftpxb3X84YrlWt/aFXw2nREXvAEJoX7Vz+yIKcwLgdGokLD8C6Hd4uJhQOBCBkHWZZ0smYkcVrMeztFjN3pu9cmSDmCGflXvk0QrtWORQ1b32nLxNQoiu4fqQCXt6oTGmcE7No0EdQ2NUYU/voG4E4Xc5cvM3DdTsu+9IhXZspPNrDqcVVedVkTO2DMR6C2UxkH8pcB0ClrnjAHwYdZGUGcNpp8DaJZCbRbir9ou7Cr75cDpcZlUnNVOqBRIxRyIWAeVAoQretMcI0AayWiB3CzioYLQdqnBeczz/H8ZD44ipEgS5AAAAAElFTkSuQmCC";

    abAlertBoxInUse = true;
    abAlertBoxTickAction = null;
    abAlertBoxCrossAction = null;
    var titleContent = '<span style="font-size:14px;padding:2px;">';
    //titleContent += '<i class="fa '+abAlertBoxStack[0].headericon+'"> </i>&nbsp;';
    titleContent += '<img src="' + tbIcon + '">';
    titleContent += abAlertBoxStack[0].title;
    titleContent += "</span>";
    document.getElementById("abAlerts").childNodes[0].innerHTML =
      modifyHTML(titleContent);
    document.getElementById("abAlerts").childNodes[1].innerHTML = modifyHTML(
      abAlertBoxStack[0].content
    );
    document.getElementById("abAlertTickBtnCaption").innerHTML = modifyHTML(
      abAlertBoxStack[0].tickText
    );
    if (abAlertBoxStack[0].hasCross) {
      document.getElementById("abAlertCrossBtnCaption").innerHTML = modifyHTML(
        abAlertBoxStack[0].crossText
      );
      document.getElementById("abAlertCrossBtn").style.visibility = "visible";
      if (typeof abAlertBoxStack[0].crossAction === "function") {
        abAlertBoxCrossAction = abAlertBoxStack[0].crossAction;
      }
    } else {
      document.getElementById("abAlertCrossBtn").style.visibility = "hidden";
    }
    if (typeof abAlertBoxStack[0].tickAction === "function") {
      abAlertBoxTickAction = abAlertBoxStack[0].tickAction;
    }
    document.getElementById("abAlerts").style.visibility = "";
    abAlertBoxStack.shift();
  }
  function abInitialiseAlertBox() {
    // create a new div to display script alerts
    abAlerts = document.createElement("div");
    abAlerts.id = "abAlerts";
    abAlerts.style.position = "fixed";
    abAlerts.style.visibility = "hidden";
    abAlerts.style.top = "50%";
    abAlerts.style.left = "50%";
    abAlerts.style.zIndex = 10000;
    abAlerts.style.backgroundColor = "aliceblue";
    abAlerts.style.borderWidth = "3px";
    abAlerts.style.borderStyle = "solid";
    abAlerts.style.borderRadius = "10px";
    abAlerts.style.boxShadow = "5px 5px 10px Silver";
    abAlerts.style.padding = "4px";
    abAlerts.style.webkitTransform = "translate(-50%, -50%)";
    abAlerts.style.transform = "translate(-50%, -50%)";

    var alertsHTML =
      '<div id="header" style="padding: 4px; background-color:LightBlue; font-weight: bold;">Alert title goes here...</div>';
    alertsHTML +=
      '<div id="content" style="padding: 4px; background-color:White; overflow:auto;max-height:500px">Alert content goes here...</div>';
    alertsHTML += '<div id="controls" align="center" style="padding: 4px;">';
    alertsHTML +=
      '<span id="abAlertTickBtn" style="cursor:pointer;font-size:14px;border:thin outset black;padding:2px 10px 2px 10px;">';
    alertsHTML += '<i class="fa fa-check"> </i>';
    alertsHTML +=
      '<span id="abAlertTickBtnCaption" style="font-weight: bold;"></span>';
    alertsHTML += "</span>";
    alertsHTML += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    alertsHTML +=
      '<span id="abAlertCrossBtn" style="cursor:pointer;font-size:14px;border:thin outset black;padding:2px 10px 2px 10px;">';
    alertsHTML += '<i class="fa fa-times"> </i>';
    alertsHTML +=
      '<span id="abAlertCrossBtnCaption" style="font-weight: bold;"></span>';
    alertsHTML += "</span>";
    alertsHTML += "</div>";
    abAlerts.innerHTML = modifyHTML(alertsHTML);
    document.body.appendChild(abAlerts);
  }

  function SetStyle(elm, style, value, important) {
    if (elm !== null && elm != undefined) {
      if (important === true) {
        value += "!important";
      }
      elm.style[style] = value;
    }
  }
  function modifyHTML(htmlIn) {
    if (typeof trustedTypes === "undefined") {
      return htmlIn;
    } else {
      const escapeHTMLPolicy = trustedTypes.createPolicy("forceInner", {
        createHTML: (to_escape) => to_escape,
      });
      return escapeHTMLPolicy.createHTML(htmlIn);
    }
  }
  function reorderDaysOfWeek(origDOWs) {
    let dows = [];
    for (let i = 0; i < 6; ++i) {
      dows.push(origDOWs[i + 1]);
    }
    dows.push(origDOWs[0]);

    return dows;
  }
  // contrast items
  function GetBorderContrast(contrast, isImportant) {
    var retval = "border: 1px solid " + ["", "lightgrey", "grey"][contrast];
    if (isImportant === true) {
      retval += "!important";
    }
    retval += "; ";
    return retval;
  }
  //Mutation Observer for daterangepicker in Restrictions
  var RestrictionObserver = new MutationObserver(function (mutations) {
    if (getById("_cbMondayFirst").checked || getById("_cbISODates").checked) {
      mutations.forEach(function (mutation) {
        if ($(mutation.target).hasClass("modal-content")) {
          if (mutation.addedNodes.length > 0) {
            if ($(".datepicker").length > 0) {
              let DRP = $(".datepicker")[0];
              let dows = reorderDaysOfWeek(
                $(DRP).data("daterangepicker").locale.daysOfWeek
              );

              if (getById("_cbMondayFirst").checked) {
                if ($(DRP).data("daterangepicker").locale.firstDay === 0) {
                  $(DRP).data("daterangepicker").locale.firstDay = 1;
                  $(DRP).data("daterangepicker").locale.daysOfWeek = dows;
                }
              }
              if (getById("_cbISODates").checked) {
                $(DRP).data("daterangepicker").locale.format = "YYYY-MM-DD";
                DRP.value =
                  $(DRP).data("daterangepicker").startDate._i +
                  " - " +
                  $(DRP).data("daterangepicker").endDate._i;
              }
            }
          }
        }
      });
    }
  });
  // Mutation Observer for segment edit panel
  var SegmentObserver = new MutationObserver(function (mutations) {
    // Tame the locked segment message which, in some locales, takes up rather more space than would be ideal
    if (getById("_cbTameLockedSegmentMsg").checked) {
      let tObj = document.getElementsByClassName("segment-details");
      if (tObj.length > 0) {
        if (
          tObj[0].firstChild.textContent ==
          I18n.lookup("edit.segment.permissions.locked.title")
        ) {
          tObj[0].firstChild.textContent = "Segment locked";
          tObj[0].childNodes[1].firstChild.firstChild.textContent = "";
        } else if (
          tObj[0].firstChild.textContent ==
          I18n.lookup("edit.segment.permissions.locked_except_closures.title")
        ) {
          tObj[0].firstChild.textContent = "Segment locked except for closures";
          tObj[0].childNodes[1].firstChild.firstChild.textContent = "";
        }
      }
    }

    // Hide the labels in the segment edit panel to give more vertical space to the things we need to interact with
    if (getById("_cbHideSegmentPanelLabels").checked) {
      let tObj = document
        .getElementById("edit-panel")
        .getElementsByTagName("wz-tab");
      if (tObj.length > 0) {
        tObj = tObj[0].getElementsByTagName("wz-label");
        if (tObj.length > 0) {
          for (let l of tObj) {
            if (l.getElementsByTagName("wz-checkbox").length == 0) {
              l.style.display = "none";
            }
          }
        }
      }
    }

    // Remove those options from the elevation menu which no-one is ever likely to need
    if (getById("_cbTameElevationMenu").checked) {
      if (document.getElementsByName("level").length > 0) {
        if (document.getElementsByName("level")[0].childElementCount > 0) {
          let menuEntries = document
            .getElementsByName("level")[0]
            .getElementsByTagName("wz-option");
          let localeGround = I18n.lookup("edit.segment.levels")[0];
          for (let pe of menuEntries) {
            let level = 0;
            if (pe.value != localeGround) {
              level = parseInt(pe.value);
            }
            if (level > 5 || level < -5) {
              SetStyle(pe, "display", "none", false);
            } else {
              let sr = pe.shadowRoot.querySelector(".wz-menu-item");
              let indent = 44 + level * 8;
              SetStyle(sr, "padding", "0px 0px 0px " + indent + "px", false);
              SetStyle(sr, "height", "100%", false);
              SetStyle(sr, "lineHeight", "100%", false);
              SetStyle(sr, "minHeight", "auto", false);
            }
          }
        }
      }
    }

    // Remove whitespace from the segment type menu if it's being used
    if (getById("_cbTameSegmentTypeMenu").checked) {
      // Check the menu is being shown - this won't be the case in compact mode
      if (document.getElementsByName("roadType").length > 0) {
        if (document.getElementsByName("roadType")[0].childElementCount > 0) {
          let menuDividers = document
            .getElementsByName("roadType")[0]
            .getElementsByTagName("wz-menu-divider");
          let pe;
          let sr;
          for (pe of menuDividers) {
            SetStyle(pe, "display", "none", false);
          }
          let menuTitles = document
            .getElementsByName("roadType")[0]
            .getElementsByTagName("wz-menu-title");
          for (pe of menuTitles) {
            sr = pe.shadowRoot.querySelector(".wz-menu-title");
            SetStyle(sr, "padding", "0px, 0px, 0px 4px", false);
            SetStyle(sr, "height", "100%", false);
            SetStyle(sr, "lineHeight", "100%", false);
            SetStyle(sr, "minHeight", "auto", false);
          }
          let menuEntries = document
            .getElementsByName("roadType")[0]
            .getElementsByTagName("wz-option");
          for (pe of menuEntries) {
            sr = pe.shadowRoot.querySelector(".wz-menu-item");
            SetStyle(sr, "padding", "0px 0px 0px 24px", false);
            SetStyle(sr, "height", "100%", false);
            SetStyle(sr, "lineHeight", "100%", false);
            SetStyle(sr, "minHeight", "auto", false);
          }
        }
      }
    }

    // Remove that slightly annoying "used as" message under the routing option buttons
    if (getById("_cbRemoveRoutingReminder").checked) {
      SetStyle(
        document.querySelector(".routing-road-type-message")?.parentElement,
        "display",
        "none",
        false
      );
    }

    if (getById("_cbCompressSegmentTab").checked) {
      if (getById("_inpUICompression").value > 0) {
        // Reduce padding enough so that the compact mode segment type selectors stand a reasonable chance
        // of fitting onto two lines instead of needing to spill over onto a third...
        SetStyle(
          document.querySelector("wz-tab")?.shadowRoot.querySelector(".wz-tab"),
          "padding",
          "2px",
          false
        );

        // Reduce gap between the "Select entire street" and "Edit house numbers" buttons
        SetStyle(
          document.querySelector("#edit-panel .more-actions"),
          "gap",
          "0px",
          false
        );

        // Reduce gap under the direction and lock level selectors
        SetStyle(
          document.querySelector("segment-direction-editor"),
          "marginBottom",
          "0px",
          false
        );
        SetStyle(
          document.querySelector(".lock-edit-view"),
          "marginBottom",
          "0px",
          false
        );

        // Reduce height of the speed limit input boxes
        let nSLE = document.querySelectorAll(
          "#segment-edit-general .speed-limit-input"
        ).length;
        if (nSLE > 0) {
          for (let i = 0; i < nSLE; ++i) {
            let sr = document.querySelectorAll(
              "#segment-edit-general .speed-limit-input"
            )[i].shadowRoot;
            SetStyle(
              sr.querySelector(".wz-text-input"),
              "height",
              "26px",
              false
            );
          }
        }

        // Reduce height of the elevation drop-down - all this just to tweak the height of ONE UI element, thank you
        // VERY much shadowroot :-/
        if (document.getElementsByName("level")[0] != undefined) {
          let sr = document.getElementsByName("level")[0].shadowRoot;
          SetStyle(sr.querySelector(".wz-select"), "height", "20px", false);
          SetStyle(
            sr.querySelector(".selected-value-wrapper"),
            "height",
            "20px",
            false
          );
          SetStyle(
            sr.querySelector(".select-wrapper"),
            "height",
            "20px",
            false
          );
          SetStyle(sr.querySelector(".select-box"), "height", "20px", false);
        }
      }
    }
  });
  //Mutation Observer for daterangepicker in Closures
  var ClosureObserver = new MutationObserver(function (mutations) {
    if (getById("_cbMondayFirst").checked) {
      mutations.forEach(function (mutation) {
        if (mutation.target.className == "closures") {
          if (mutation.addedNodes.length > 0) {
            if (
              mutation.addedNodes[0].firstChild.classList.contains(
                "edit-closure"
              )
            ) {
              if (
                $(".start-date").data("daterangepicker").locale.firstDay === 0
              ) {
                $(".start-date").data("daterangepicker").locale.firstDay = 1;
                $(".end-date").data("daterangepicker").locale.firstDay = 1;

                let dows = reorderDaysOfWeek(
                  $(".start-date").data("daterangepicker").locale.daysOfWeek
                );
                $(".start-date").data("daterangepicker").locale.daysOfWeek =
                  dows;
                $(".end-date").data("daterangepicker").locale.daysOfWeek = dows;
              }
            }
          }
        }
      });
    }
  });
  // Mutation Observer for place edit panel
  var PlaceObserver = new MutationObserver(function (mutations) {
    // This slightly convoluted bit of code allows us to manipulate
    // the entries in the dynamically created drop-down list which
    // is generated whenever you start searching for a GMaps place
    // to link to a native one
    if (getById("_cbFixExternalProviders").checked) {
      // First check that the MO has fired because the user has selected
      // a place for editing...
      let acMenu = document.getElementsByClassName(
        "external-provider-edit-form"
      )[0];
      if (acMenu !== undefined) {
        // ...and then check the "add linked Google place" option has been
        // selected, to start the process of generating the dynamic list
        let acInner = acMenu.getElementsByTagName("wz-autocomplete")[0];
        if (acInner !== undefined) {
          // If so, then we now need to poll the UI to see if there are any
          // list items present - this doesn't appear to be possible via a
          // MO due to the items being hidden behind shadowroot, hence the
          // slightly old-school nature of polling vs event driven here :-/
          window.setTimeout(EPObserver, 500);
        }
      }
    }

    let compress = getById("_inpUICompression").value;
    if (compress > 0) {
      // Also check for the existence of the entry point UI element, so
      // we can dive into its shadowroot to deal with its excessive whitespace
      if (
        document.getElementsByClassName(
          "navigation-point-item navigation-point-editable"
        ).length > 0
      ) {
        let npOuter = document.getElementsByClassName(
          "navigation-point-item navigation-point-editable"
        )[0];
        let npInner = npOuter.shadowRoot.querySelectorAll(".list-item-wrapper");
        if (npInner.length > 0) {
          for (let i of npInner) {
            i.style.paddingTop = "4px";
            i.style.paddingBottom = "4px";
          }
        }
      }
    }
  });
  // Mutation Observer for issue tracker panel
  var ITObserver = new MutationObserver(function (mutations) {
    disableUITransitions();
  });
  var MTEObserver = new MutationObserver(function (mutations) {
    checkForMTEDropDown();
  });

  // To unwind the temporary moving of the notification icons when entering HN edit mode above, we observe changes in the primary
  // toolbar in order to detect when the close HN editor button is displayed, and also when the regular toolbar contents are
  // displayed.  We use the former to set up an onclick handler so that when the close editor button is clicked, we set a flag
  // to then trigger the deferred unwinding of the icon move once we detect the toolbar is back to normal...
  let doCleanUpAfterHNEdit = false;
  var PriToolBarObserver = new MutationObserver(function (mutation) {
    if (document.querySelector("wz-button.waze-icon-exit") !== null) {
      // The HN topbar buttons don't exist within the DOM until the user initiates HN editing, so we need to
      // perform a seperate application of the button-specific parts of the topbar compression mods
      CheckForHNButtons();
    }

    if (
      document.querySelector(
        "#primary-toolbar .toolbar-collection-component"
      ) !== null
    ) {
      if (
        document.querySelector(".toolbar-group").getBoundingClientRect()
          .width !== 0
      ) {
        if (doCleanUpAfterHNEdit === true) {
          doCleanUpAfterHNEdit = false;
          hideMenuLabels();
          if (getById("_cbMoveUserInfo").checked === true) {
            insertNodeBeforeNode(
              document.querySelector(".user-toolbar"),
              getById("left-app-head")
            );
            insertNodeBeforeNode(
              document.querySelector("wz-user-box"),
              getById("left-app-head")
            );
          }
        }
      }
    }
  });
  function CheckForHNButtons() {
    // The shadowroots for the HN topbar buttons get filled in slightly after the topbar mutation observer fires, which means
    // we can't do a simple (because when has dealing with the WME UI design EVER been simple...) call to the code that applies
    // the appropriate compression settings to those buttons.  Instead we call the function, which will return false so long as
    // it saw any empty shadowroot containers - i.e. for any buttons which WME hasn't finished rendering.  We use this return
    // value to then trigger a short duration timeout before trying to apply the compression again, and so on until it works...
    if (ApplyTopBarShadowRootWzButtonCompression() === false) {
      window.setTimeout(CheckForHNButtons, 10);
    }
  }
  function PrepForHNEdit() {
    // Moving the notification icons prevents the HN buttons from being rendered, so if the user has opted to move them, temporarily
    // move them back if the user then goes to edit HN...
    if (getById("_cbMoveUserInfo").checked === true) {
      insertNodeAfterNode(
        document.querySelector("wz-user-box"),
        document.querySelector("#save-button").parentElement.parentElement
      );
      insertNodeAfterNode(
        document.querySelector(".user-toolbar"),
        document.querySelector("#save-button").parentElement.parentElement
      );
      doCleanUpAfterHNEdit = true;
    }
  }

  function checkForMTEDropDown() {
    let tObj = document.querySelector("#sidepanel-mtes");
    let nWO = tObj?.querySelectorAll("wz-option").length;
    let nSR = 0;
    while (nWO) {
      if (tObj.querySelectorAll("wz-option")[nWO - 1].shadowRoot != null) {
        ++nSR;
      }
      --nWO;
    }
    if (nSR > 0) {
      restyleDropDownEntries();
    } else {
      window.setTimeout(checkForMTEDropDown, 100);
    }
  }
  function EPObserver() {
    // Just a quick sanity check to make sure the list elements we need are
    // all still present...
    let acMenu = document.getElementsByClassName(
      "external-provider-edit-form"
    )[0];
    if (acMenu == undefined) return;
    let acInner = acMenu.getElementsByTagName("wz-autocomplete")[0];
    if (acInner == undefined) return;

    // Now that we're back to the same position we were at when we originally
    // started polling, it's time to mess with whichever list items we can
    // find here
    let acEntries = acInner.shadowRoot.querySelectorAll("wz-menu-item");
    if (acEntries.length != 0) {
      for (let i of acEntries) {
        // To accommodate suggestions that wrap onto 3+ lines, we need to remove the
        // height styling from the main menu item plus its child elements, so that each
        // entry can expand as needed to keep all of the text visible
        SetStyle(i, "--wz-menu-option-height", "auto", false);
        let wai = i.querySelector(".wz-autocomplete-item");
        SetStyle(wai, "height", "auto", false);
        SetStyle(wai, "padding-top", "2px", false);
        SetStyle(wai, "padding-bottom", "2px", false);

        // Most of the restyling fun takes place on this child element within the
        // list element
        let acText = i.querySelector(".wz-string-wrapper.primary-text");

        // Restore some sanity to the entries, so we can see exactly what they
        // say and therefore know what it is we're selecting - UI Design 101...
        SetStyle(acText, "overflow", "visible", false);
        SetStyle(acText, "overflow", "visible", false);
        SetStyle(acText, "lineHeight", "100%", false);
        SetStyle(acText, "display", "block", false);
        SetStyle(acText, "whiteSpace", "normal", false);

        // And just for shits and giggles, the late April WME update now places each and every
        // character within an entry in its own childnode of that entry, so that styling can be
        // applied to each character individually...  As this messes up the entry lineheight
        // styling which used to be all that was needed to get things looking good here, we now
        // ALSO need to override the native styling on these child nodes.  What next devs, an
        // individual node for each pixel of each character???
        let acChars = acText.childNodes;
        for (let j of acChars) {
          SetStyle(j, "lineHeight", "100%", false);
        }

        // We also need to tweak the shadowroot version of the menu item itself, to
        // adjust the height style to prevent the item failing to grow tall enough
        // to fully accommodate 3+ line entries
        let srMenuItems = i.shadowRoot.querySelector(".wz-menu-item");
        SetStyle(srMenuItems, "height", "auto", false);
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
    window.setTimeout(EPObserver, 100);
  }
  // Don't try to manipulate I18n if we're currently running within the scope of the login popup, because I18n doesn't
  // exist there, and we need to get past here without throwing an exception in order to be able to modify the CSS
  // within the popup...
  if (document.location.href.indexOf("signin") == -1) {
    //Fix for date/time formats in WME released Oct/Nov 2016 - provided by Glodenox
    I18n.translations[I18n.currentLocale()].time = {};
    I18n.translations[I18n.currentLocale()].time.formats = {};
    I18n.translations[I18n.currentLocale()].time.formats.long =
      "%a %b %d %Y, %H:%M";
    I18n.translations[I18n.currentLocale()].date.formats = {};
    I18n.translations[I18n.currentLocale()].date.formats.long =
      "%a %b %d %Y, %H:%M";
    I18n.translations[I18n.currentLocale()].date.formats.default =
      "%a %b %d %Y";
  }
  function newSaveMode() {
    let sm = W.editingMediator.attributes.saveMode;
    if (sm === "IDLE") {
      float();
    }
  }

  function init1() {
    logit("Starting init1", "debug");

    // Hide the "accept cookies" panel in the login popup
    if (document.location.href.indexOf("signin") != -1) {
      addGlobalStyle(".wz-cc-container { display: none; }");
    }

    if (W === undefined) {
      window.setTimeout(init1, 100);
      return;
    }

    logit("Initialising...");

    if (W.userscripts?.state?.isReady) {
      init1Finalise();
    } else {
      document.addEventListener("wme-ready", init1Finalise, { once: true });
    }
  }
  function init1Finalise() {
    // insert the content as a tab
    addMyTab();
  }
  function init2() {
    logit("Starting init2", "debug");
    if (W.userscripts === undefined) {
      //go round again if my tab isn't there yet
      if (!getById("sidepanel-FixUI")) {
        logit("Waiting for my tab to appear...", "warning");
        setTimeout(init2, 200);
        return;
      }
    }
    // setup event handlers for my controls:
    getById("_cbMoveZoomBar").onclick = createZoomBar;
    getById("_cbMoveChatIcon").onclick = moveChatIcon;
    getById("_cbHighlightInvisible").onclick = highlightInvisible;
    getById("_cbDarkenSaveLayer").onclick = darkenSaveLayer;
    getById("_cbSwapRoadsGPS").onclick = swapRoadsGPS;
    getById("_cbShowMapBlockers").onclick = showMapBlockers;
    getById("_cbShrinkTopBars").onclick = shrinkTopBars;
    getById("_cbCompressSegmentTab").onclick = compressSegmentTab;
    getById("_cbCompressLayersMenu").onclick = compressLayersMenu;
    getById("_cbLayersColumns").onclick = compressLayersMenu;
    getById("_cbRestyleReports").onclick = restyleReports;
    getById("_cbEnhanceChat").onclick = enhanceChat;
    getById("_cbNarrowSidePanel").onclick = narrowSidePanel;
    getById("_inpUICompression").onchange = applyEnhancements;
    getById("_inpUIContrast").onchange = applyEnhancements;
    getById("_cbResizeSearchBox").onclick = resizeSearch;

    getById("_inpASX").onchange = shiftAerials;
    getById("_inpASX").onwheel = shiftAerials;
    getById("_inpASY").onchange = shiftAerials;
    getById("_inpASY").onwheel = shiftAerials;
    getById("_inpASO").onchange = shiftAerials;
    getById("_inpASO").onwheel = shiftAerials;
    getById("_inpASXO").onchange = shiftAerials;
    getById("_inpASXO").onwheel = shiftAerials;
    getById("_inpASYO").onchange = shiftAerials;
    getById("_inpASYO").onwheel = shiftAerials;
    getById("_inpASOO").onchange = shiftAerials;
    getById("_inpASOO").onwheel = shiftAerials;

    getById("_resetAS").onclick = function () {
      getById("_inpASX").value = 0;
      getById("_inpASY").value = 0;
      getById("_inpASXO").value = 0;
      getById("_inpASYO").value = 0;
      shiftAerials();
    };
    getById("_inpGSVContrast").onchange = adjustGSV;
    getById("_inpGSVBrightness").onchange = adjustGSV;
    getById("_cbGSVInvert").onchange = adjustGSV;
    getById("_inpGSVWidth").onchange = GSVWidth;
    getById("_cbDisableBridgeButton").onchange = disableBridgeButton;
    getById("_cbDisablePathButton").onchange = disablePathButton;
    getById("_btnKillNode").onclick = killNode;
    getById("_cbDisableKinetic").onclick = disableKinetic;
    getById("_cbDisableScrollZoom").onclick = disableScrollZoom;
    getById("_cbDisableZoomAnimation").onclick = disableAnimatedZoom;
    getById("_cbDisableUITransitions").onclick = disableUITransitions;
    getById("_cbDisableSaveBlocker").onclick = disableSaveBlocker;
    getById("_cbColourBlindTurns").onclick = colourBlindTurns;
    getById("_cbHideMenuLabels").onclick = hideMenuLabels;
    getById("_cbUnfloatButtons").onclick = unfloatButtons;
    getById("_cbMoveUserInfo").onclick = moveUserInfo;
    getById("_cbHackGSVHandle").onclick = hackGSVHandle;
    getById("street-view-drag-handle").ondblclick = GSVWidthReset;
    getById("_cbEnlargeGeoNodes").onclick = enlargeGeoNodes;
    getById("_inpEnlargeGeoNodes").onchange = enlargeGeoNodes;
    getById("_cbEnlargeGeoHandlesFU").onclick = enlargeGeoHandles;
    getById("_inpEnlargeGeoHandles").onchange = enlargeGeoHandles;
    getById("_cbEnlargePointMCs").onclick = enlargePointMCs;
    getById("_inpEnlargePointMCs").onchange = enlargePointMCs;

    //REGISTER WAZE EVENT HOOKS

    // events for Aerial Shifter
    W.map.events.register("zoomend", null, shiftAerials);
    W.map.events.register("moveend", null, shiftAerials);
    W.map
      .getLayerByUniqueName("satellite_imagery")
      .events.register("loadend", null, shiftAerials);
    // events to change menu bar color based on map comments checkbox
    W.map.events.register("zoomend", null, warnCommentsOff);
    W.map.events.register("moveend", null, warnCommentsOff);
    // event to remove the overlay that blocks the sidebar UI if you zoom out too far
    W.map.events.register("zoomend", null, unblockSidePanel);
    // events to adjust the "Search this area" z-index so it gets rendered behind the drop-down menus
    W.map.events.register("zoomend", null, moveSearchThisArea);
    W.map.events.register("moveend", null, moveSearchThisArea);
    // event to re-hack my zoom bar if it's there
    W.map
      .getLayerByUniqueName("BASE_LAYER")
      .events.register("loadend", null, ZLI);
    //window resize event to resize chat
    window.addEventListener("resize", enhanceChat, true);
    //window resize event to resize layers menu
    window.addEventListener("resize", compressLayersMenu, true);
    //window resize event to reapply zoombar fix
    window.addEventListener("resize", ZLI, true);
    //window resize event to resize search box
    window.addEventListener("resize", resizeSearch, true);

    //anything we might need to do when the mouse moves...
    W.map.events.register("mousemove", null, mouseMove);

    let tEvt = Object.assign(
      {},
      W.editingMediator._events["change:saveMode"][0]
    );
    tEvt.callback = newSaveMode;
    W.editingMediator._events["change:saveMode"].push(tEvt);

    // event handlers to help with the weird change log visibility problem...
    document
      .querySelector("#save-button")
      .addEventListener("mouseover", saveMouseOver, true);
    document
      .querySelector("#save-button")
      .addEventListener("mouseout", saveMouseOut, true);

    //window resize event to refloat the sharing box in the correct location
    window.addEventListener("resize", unfloat, true);
    //event to re-hack toolbar buttons on exiting HN mode
    W.editingMediator.on("change:editingHouseNumbers", function () {
      if (W.editingMediator.attributes.editingHouseNumbers === true) {
        PrepForHNEdit();
      }

      if (getById("_cbUnfloatButtons").checked) {
        if (W.editingMediator.attributes.editingHouseNumbers) unfloat();
        if (W.editingMediator.attributes.editingEnabled) unfloat();
      }
    });

    //create Aerial Shifter warning div
    var ASwarning = document.createElement("div");
    ASwarning.id = "WMEFU_AS";
    ASwarning.innerHTML = modifyHTML("Aerials Shifted");
    ASwarning.setAttribute(
      "style",
      "top:20px; left:0px; width:100%; position:absolute; z-index:10000; font-size:100px; font-weight:900; color:rgba(255, 255, 0, 0.4); text-align:center; pointer-events:none; display:none;"
    );
    getById("WazeMap").appendChild(ASwarning);

    loadSettings();
    // Add an extra checkbox so I can test segment panel changes easily
    if (W.loginManager.user.attributes.userName == "Twister-UK") {
      logit("creating segment detail debug checkbox", "info");
      var extraCBSection = document.createElement("p");
      extraCBSection.innerHTML = modifyHTML(
        '<input type="checkbox" id="_cbextraCBSection" />'
      );
      insertNodeBeforeNode(extraCBSection, getById("left-app-head"));
      getById("_cbextraCBSection").onclick = FALSEcompressSegmentTab;
      getById("_cbextraCBSection").checked = getById(
        "_cbCompressSegmentTab"
      ).checked;
    }
    //create Panel Swap div
    var WMEPS_div = document.createElement("div");
    var WMEPS_div_sub = document.createElement("div");
    WMEPS_div.id = "WMEFUPS";
    WMEPS_div.setAttribute(
      "style",
      "color: lightgrey; margin-left: 5px; font-size: 20px;"
    );
    WMEPS_div.title =
      "Panel Swap: when map elements are selected, this lets you\nswap between the edit panel and the other tabs.";
    WMEPS_div_sub.innerHTML = modifyHTML('<i class="fa fa-sticky-note"></i>');
    WMEPS_div.appendChild(WMEPS_div_sub);
    insertNodeBeforeNode(WMEPS_div, getById("left-app-head"));
    getById("WMEFUPS").onclick = PSclicked;
    W.selectionManager.events.register("selectionchanged", null, PSicon);
    //create Permalink Count div
    var WMEPC_div = document.createElement("div");
    var WMEPC_div_sub = document.createElement("div");
    WMEPC_div.id = "WMEFUPC";
    WMEPC_div.classList.add("toolbar-button", "toolbar-button-with-icon");
    WMEPC_div.title =
      "Number of selectable map objects in the URL\nClick to reselect them.";
    WMEPC_div_sub.classList.add("item-container", "WMEFU-toolbar-button");
    var totalItems;
    if (location.search.match("segments"))
      totalItems = window.location.search
        .match(new RegExp("[?&]segments?=([^&]*)"))[1]
        .split(",").length;
    else if (location.search.match("venues"))
      totalItems = window.location.search
        .match(new RegExp("[?&]venues?=([^&]*)"))[1]
        .split(",").length;
    else if (location.search.match("nodes"))
      totalItems = Math.min(
        1,
        window.location.search
          .match(new RegExp("[?&]nodes?=([^&]*)"))[1]
          .split(",").length
      );
    else if (location.search.match("mapComments"))
      totalItems = Math.min(
        1,
        window.location.search
          .match(new RegExp("[?&]mapComments?=([^&]*)"))[1]
          .split(",").length
      );
    else if (location.search.match("cameras"))
      totalItems = Math.min(
        1,
        window.location.search
          .match(new RegExp("[?&]cameras?=([^&]*)"))[1]
          .split(",").length
      );
    else totalItems = 0;
    WMEPC_div_sub.innerHTML = modifyHTML(
      '<span class="item-icon" style="display:inline-flex"><i style="margin-top:8px" class="fa fa-link WMEFUPCicon"></i>&nbsp;' +
        totalItems +
        "</span>"
    );
    WMEPC_div.appendChild(WMEPC_div_sub);
    insertNodeBeforeNode(WMEPC_div, getById("search"));
    WMEPC_div.onclick = PCclicked;
    //Create Turn Popup Blocker div
    var WMETPB_div = document.createElement("div");
    var WMETPB_div_sub = document.createElement("div");
    WMETPB_div.id = "WMEFUTPB";
    WMETPB_div.classList.add("toolbar-button", "toolbar-button-with-icon");
    WMETPB_div.title = "Disable/enable the turn arrow popup dialogue";
    WMETPB_div_sub.classList.add("item-container", "WMEFU-toolbar-button");
    WMETPB_div_sub.innerHTML = modifyHTML(
      '<span class="item-icon fa-stack fa-2x" style="display:inline-flex; font-size:10px !important"><i class="fa fa-comment fa-stack-2x"></i><i class="fa fa-arrow-up fa-inverse fa-stack-1x"></i></span>'
    );
    WMETPB_div.appendChild(WMETPB_div_sub);
    insertNodeBeforeNode(WMETPB_div, getById("search"));
    WMETPB_div.onclick = toggleKillTurnPopup;
    addGlobalStyle(".WMEFU-toolbar-button { padding: 0px !important; }");

    // overload the window unload function to save my settings
    window.addEventListener("beforeunload", saveSettings, false);
    // Alert to new version
    if (oldVersion != FUME_VERSION) {
      let releaseNotes =
        "Version " +
        FUME_VERSION +
        " (" +
        FUME_DATE +
        ") release notes<br><br>";
      releaseNotes += "<ul>";
      for (let i = 0; i < newVersionNotes.length; ++i) {
        releaseNotes += "<li>" + newVersionNotes[i];
      }
      releaseNotes += "</ul>";
      abShowAlertBox(
        "fa-info-circle",
        "WME Fix UI Memorial Edition",
        releaseNotes,
        false,
        "OK",
        "",
        null,
        null
      );
      saveSettings();
    }
    // fix for sidebar display problem in Safari, requested by edsonajj
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      addGlobalStyle(".flex-parent { height: 99% !important; }");
    }
    // stop wobbling status bar
    addGlobalStyle(".WazeControlMousePosition { font-family: monospace }");
    // move closed node icon below node markers
    // apply the settings
    shiftAerials();

    window.setTimeout(applyAllSettings, 1000);

    logit("Initialisation complete");
  }
  let wasDrawing = null;
  function mouseMove() {
    // Temporarily disable the Enlarge geo/junction nodes and Enlarge geo handles options
    // when drawing new geometry, to avoid the enlarged nodes/handles on other geometry
    // objects getting in the way of the new object being drawn...
    let isDrawing = W.editingMediator.attributes.drawing;
    if (isDrawing != wasDrawing) {
      enlargeGeoNodes(isDrawing);
      enlargeGeoHandles(isDrawing);
      wasDrawing = isDrawing;
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
    document.querySelector(".overlay.editingDisabled")?.remove();
  }
  function createTabHTML() {
    let innerHTML = "";
    innerHTML +=
      '<b title="Shift aerial images layer to match GPS tracks and reduce image opacity">Aerial Shifter</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    innerHTML +=
      '<span class="fa fa-power-off" id="_resetAS" title="Clear X/Y offsets"></span><br>';
    innerHTML +=
      "<div>" +
      I18n.lookup("layer_switcher.togglers.ITEM_SATELLITE_IMAGERY") +
      "</div>";
    innerHTML +=
      '<div style="display:inline-block; padding-left:10px;"><input type="number" id="_inpASX" title="horizontal shift" max=300 min=-300 step=5 style="height:20px; width:50px;text-align:right;"/><b>m</b><span class="fa fa-arrow-right"></span></div>';
    innerHTML +=
      '<div id="as2" style="display:inline-block;padding:0 5px;"><input type="number" id="_inpASY" title="vertical shift" max=300 min=-300 step=5 style="height:20px; width:50px;text-align:right;"/><b>m</b><span class="fa fa-arrow-up"></span></div>';
    innerHTML +=
      '<div id="as3" style="display:inline-block"><input type="number" id="_inpASO" title="opacity" max=100 min=10 step=10 style="height:20px; width:50px;text-align:right;"/><b>%</b><span class="fa fa-adjust"></span></div>';
    innerHTML +=
      "<div>" + I18n.lookup("layer_switcher.togglers.GROUP_IMAGERY") + "</div>";
    innerHTML +=
      '<div style="display:inline-block; padding-left:10px;"><input type="number" id="_inpASXO" title="horizontal shift" max=300 min=-300 step=5 style="height:20px; width:50px;text-align:right;"/><b>m</b><span class="fa fa-arrow-right"></span></div>';
    innerHTML +=
      '<div id="as4" style="display:inline-block;padding:0 5px;"><input type="number" id="_inpASYO" title="vertical shift" max=300 min=-300 step=5 style="height:20px; width:50px;text-align:right;"/><b>m</b><span class="fa fa-arrow-up"></span></div>';
    innerHTML +=
      '<div id="as5" style="display:inline-block"><input type="number" id="_inpASOO" title="opacity" max=100 min=10 step=10 style="height:20px; width:50px;text-align:right;"/><b>%</b><span class="fa fa-adjust"></span></div>';

    innerHTML += "<br>";
    innerHTML += "<br>";

    innerHTML +=
      '<b title="Adjust contrast, brightness, colours & width for Google Street View images">GSV image adjust</b><br>';
    innerHTML +=
      '<span title="Contrast"><input type="number" id="_inpGSVContrast" max=200 min=25 step=25 style="height:20px; width:46px;text-align:right;"/><b>%</b><span class="fa fa-adjust"></span></span>&nbsp;&nbsp;';
    innerHTML +=
      '<span title="Brightness"><input type="number" id="_inpGSVBrightness" max=200 min=25 step=25 style="height:20px; width:46px;text-align:right;"/><b>%</b><span class="fa fa-sun-o"></span></span>&nbsp;&nbsp;';
    innerHTML +=
      '<span title="Invert colours"><input type="checkbox" id="_cbGSVInvert"/><span class="fa fa-tint"></span></span>&nbsp;&nbsp;';
    innerHTML +=
      '<span title="Default width"><input type="number" id="_inpGSVWidth" max=90 min=10 step=10 style="height:20px; width:46px;text-align:right;"/><b>%</b><span class="fa fa-arrows-h"></span></span>&nbsp;&nbsp;&nbsp;';

    innerHTML += "<br>";
    innerHTML += "<br>";

    innerHTML += "<b>UI Enhancements</b><br>";
    innerHTML +=
      '<input type="checkbox" id="_cbShrinkTopBars" /> ' +
      "<span title=\"Because we can't afford to waste screen space, particularly on\nstuff we didn't ask for and don't want, like the black bar.\nAnd why does the reload button have a re-do icon?!\">Compress/enhance bars above the map</span><br>";
    innerHTML +=
      '<input type="checkbox" id="_cbCompressSegmentTab" /> ' +
      '<span title="Because I\'m sick of having to scroll the side panel because of oversized fonts and wasted space">Compress/enhance side panel contents</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbCompressLayersMenu" /> ' +
      '<span title="Because it\'s already too big for small screens and Waze only plan to make it bigger">Compress/enhance layers menu</span><br>';
    innerHTML +=
      '<span id="layersColControls"><input type="checkbox" id="_cbLayersColumns" /> ' +
      '<span title="Widen the layers menu to 2 columns - particulary for netbook users\nWon\'t work without some compression turned on">Two-column layers menu</span><br></span>';
    innerHTML +=
      '<input type="checkbox" id="_cbRestyleReports" /> ' +
      '<span title="Another UI element configured for developers with massive screens instead of normal users">Compress/enhance report panels (UR/MP)</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbEnhanceChat" /> ' +
      '<span title="A perfect example of the new WME UI. Looks very stylish,\nbut destroys usability and utterly ignores small-screen users.">Compress/enhance Chat panel</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbNarrowSidePanel" /> ' +
      '<span title="If you have a netbook, Waze isn\'t interested in your experience.\nYou need every bit of map space you can get - so have a present from me!">Reduce width of the side panel</span><span title="This will definitely interfere with scripts that rely on a fixed width for their tab contents." style="font-size: 16px; color: red;">&#9888</span><br>';
    innerHTML += "<br>";
    innerHTML +=
      '<b title="Control the amount of compression/enhancment">UI Enhancement controls</b><br>';
    innerHTML +=
      '<div style="display:inline-block"><select id="_inpUICompression" title="Compression enhancement" style="height:20px; padding:0px; border-radius=0px;"><option value="2">High</option><option value="1">Low</option><option value="0">None</option></select><span class="fa fa-compress"></span></div>&nbsp;&nbsp;&nbsp;&nbsp;';
    innerHTML +=
      '<div style="display:inline-block"><select id="_inpUIContrast" title="Contrast enhancement" style="height:20px; padding:0px; border-radius=0px;"><option value="2">High</option><option value="1">Low</option><option value="0">None</option></select><span class="fa fa-adjust"></span></div>';
    innerHTML += "<br>";
    innerHTML +=
      '<button id="_btnKillNode" style = "height: 18px; margin-top: 5px;" title="Hide the junction nodes layer to allow access to Map Comments hidden under nodes.\nThis stays in effect until the page is zoomed/panned/refreshed.">Hide junction nodes</button>&nbsp;&nbsp;';

    innerHTML += "<br><br>";

    innerHTML += "<b>UI Fixes/changes</b><br>";
    innerHTML +=
      '<input type="checkbox" id="_cbTameLockedSegmentMsg" /> ' +
      '<span title="Tame the locked segment warning,\nbecause in some localisations it takes up a shit-ton of space.">Tame locked segment warning</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbHideSegmentPanelLabels" /> ' +
      '<span title="Hide the labels in the segment sidepanel,\nbecause there are more important things to display in that precious space.">Hide segment sidepanel labels</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbTameSegmentTypeMenu" /> ' +
      '<span title="Do away with all the wasted space in the segment type menu,\nso that we can select types without having to scroll.">Tame segment type menu</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbTameElevationMenu" /> ' +
      '<span title="Do away with all the wasted space and unlikely to ever be used option in the elevation menu,\nso that we can select the ones we DO use without having to scroll.">Tame elevation menu</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbRemoveRoutingReminder" /> ' +
      "<span title=\"Remove the 'Segment will be used as' message under the Routing buttons.\">Remove segment routing message</span><br>";
    innerHTML +=
      '<input type="checkbox" id="_cbReEnableSidePanel" /> ' +
      '<span title="Re-enable the side panel at wider zoom levels,\nbecause contrary to what the WME devs seem to think,\nthere is quite a lot you can still do there.">Re-enable side panel at wider zooms</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbResizeSearchBox" /> ' +
      '<span title="Allows the search box to use all the dead space in the top bar">Expand search box</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbMoveZoomBar" /> ' +
      '<span title="Because nobody likes a pointless UI change that breaks your workflow,\nimposed by idiots who rarely use the editor and don\'t listen to feedback.\nNO MATTER HOW HARD THEY TRY, I WILL BRING IT BACK!">Re-create zoom bar & move map controls</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbFixExternalProviders" /> ' +
      '<span title="The External Providers interface has a description box that will only show one line of text.\nThis fixes that.">Expand External Provider details for places</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbMoveChatIcon" /> ' +
      "<span title=\"Here's a truly outstanding example of making a stupid change to the UI in order to\ndeal with another stupid change to the UI!\nBecause HQ couldn't make the new layers menu auto-hide, they moved the chat icon.\nTick this box to put it back where it belongs.\">Move Chat icon back to right</span><br>";
    innerHTML +=
      '<input type="checkbox" id="_cbHighlightInvisible" /> ' +
      '<span title="Typical WME design - the chat icon changes when you\'re invisible,\nbut the change is practically invisible!\nThis option provides a more obvious highlight.">Highlight invisible mode</span></span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbLayersMenuMoreOptions" /> ' +
      '<span title="This function shows all options in the Layers menu at all times.\nNote that changing this only updates when the page loads.">Show all options in Layers menu</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbDarkenSaveLayer" /> ' +
      "<span title=\"It's not bad enough they've removed all the contrast to give you eyestrain,\nbut then they blind you every time you save. \">Darken screen overlay when saving</span><br>";
    innerHTML +=
      '<input type="checkbox" id="_cbSwapRoadsGPS" /> ' +
      '<span title="Guess what? Waze thinks the GPS layer should now be over the segments layer.\nWhy should you have any choice about that?">Move GPS layer below segments layer</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbShowMapBlockers" /> ' +
      '<span title="Some WME elements block access to the map layers. These problems have been reported as bugs.\nUntil they\'re fixed, this functions makes them visible.">Show map-blocking WME bugs</span></span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbDisableBridgeButton" /> ' +
      '<span title="The Bridge button is rarely useful, but often used incorrectly.\nIt\'s best to keep it disabled unless you need it.">Disable Bridge button</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbDisablePathButton" /> ' +
      '<span title="The far turn button seems to be an accidental click-magnet, making it all\ntoo easy to accidentally set a path without noticing until after you save...\nUse this option to disable it and avoid the embarrassment">Disable Far Turn button</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbMondayFirst" /> ' +
      '<span title="Requests to have calendar items localised with Monday as the first day of the week\ngo back a while. Now you don\'t have to wait for Waze.">Start calendars on Monday</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbISODates" /> ' +
      '<span title="Dates in the Restrictions dialogues are all in American format - MM/DD/YY\nFine if you\' American, confusing as hell for the rest of us!\nThis changes the dates to ISO format, matching the Closures dialogue">ISO dates in Restrictions</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbDisableKinetic" /> ' +
      '<span title="Kinetic panning is a new WME feature: if you release the mouse whilst dragging the map,\nthe map will keep moving. It can be very useful for panning large distances.\nIt can also be very annoying. Now YOU have control.">Disable Kinetic Panning</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbDisableZoomAnimation" /> ' +
      '<span title="Animated zooming is a new WME feature which some would prefer not to have enabled.  Click here to express that preference...">Disable Animated Zooming</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbDisableUITransitions" /> ' +
      '<span title="Because life is simply too short to waste time waiting for UI elements to oooooooooze into position">Disable UI Transitions</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbDisableScrollZoom" /> ' +
      '<span title="Zooming with the scroll wheel can be problematic when using an Apple Magic Mouse, which\nscrolls on touch. This will disable scroll-to-zoom.">Disable scroll-to-zoom</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbDisableSaveBlocker" /> ' +
      '<span title="When you hit Save, WME places a blocking element over the map until the save is complete\nThis disables that element, allowing you to pan the map and use GSV whilst a slow save is in progress.">Disable map blocking during save</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbColourBlindTurns" /> ' +
      '<span title="Change green turn arrows blue in order to make them more visible\nfor users with the most common type of colour blindness.">Change green turn arrows to blue</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbHideMenuLabels" /> ' +
      '<span title="Hide the text labels on the toolbar menus to save space on small screens">Hide menu labels</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbUnfloatButtons" /> ' +
      '<span title="Move Layers/Refresh buttons back into the toolbar and Share button into the\nfooter.\nWaze put little enough effort into giving us enough map area to work with,\nand then they drop little button turds all over it!">Remove floating buttons from map area</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbMoveUserInfo" /> ' +
      "<span title=\"The new user info button is very useful, but it's not a map editing control,\nso it shouldn't be in the toolbar. The same goes for the notification button.\nThis function moves them both to a sensible location.\">Move user info/notification buttons</span><br>";
    innerHTML +=
      '<input type="checkbox" id="_cbHackGSVHandle" /> ' +
      '<span title="Whilst being able to adjust the GSV width is useful, the drag handle\ninvisibly covers 30 pixels of map and is very easy to drag accidentally.\nThis function transforms it to a button drag control that\'s much less\nlikely to be used by accident.">Minimise GSV drag handle</span><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbEnlargeGeoNodes" /> ' +
      '<span title="If you\'re getting old, like me, grabbing those little circles is a pain!\nThis control lets you enlarge the geo nodes (and junction nodes for segments),\nwhich define the shapes of segments and place boundaries.">Enlarge geo/junction nodes</span><div style="display:inline-block">&nbsp;&nbsp;<input type="number" id="_inpEnlargeGeoNodes" title="radius (default=6)" max=12 min=8 step=2 style="height:16px; padding:0 0 0 2px;; border:1px solid; width:37px;"/></div><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbEnlargeGeoHandlesFU" /> ' +
      '<span title="If you\'re getting old, like me, grabbing those little circles is a pain!\nThis control lets you enlarge the geo handles, used to add geo nodes to segments and place boundaries.">Enlarge geo handles</span><div style="display:inline-block">&nbsp;&nbsp;<input type="number" id="_inpEnlargeGeoHandles" title="radius (default=4)" max=10 min=6 step=2 style="height:16px; padding:0 0 0 2px;; border:1px solid; width:37px;"/></div><br>';
    innerHTML +=
      '<input type="checkbox" id="_cbEnlargePointMCs" /> ' +
      '<span title="This control lets you enlarge point map comments, because sometimes they can look a little swamped inamongst the rest of the stuff on show">Enlarge point map comments</span><div style="display:inline-block">&nbsp;&nbsp;<input type="number" id="_inpEnlargePointMCs" title="scale (default=1)" max=3 min=1 step=0.1 style="height:16px; padding:0 0 0 2px;; border:1px solid; width:37px;"/></div><br>';
    innerHTML += "<br>";
    innerHTML +=
      '<b><a href="https://www.waze.com/forum/viewtopic.php?t=334618" title="Forum topic" target="_blank"><u>' +
      "WME Fix UI Memorial Edition</u></a></b> &nbsp; v" +
      FUME_VERSION;

    return innerHTML;
  }
  function addMyTab() {
    logit("Creating tab...");
    tabAttempts = 0;
    tabCreate();
  }
  async function tabCreate() {
    let { tabLabel, tabPane } = W.userscripts.registerSidebarTab("FUME");
    tabLabel.innerText = "FUME";
    tabPane.innerHTML = modifyHTML(createTabHTML());
    await W.userscripts.waitForElementConnected(tabPane);

    logit("Tab now available...");
    createDSASection();
    abInitialiseAlertBox();
    document
      .getElementById("abAlertTickBtn")
      .addEventListener("click", abCloseAlertBoxWithTick, true);
    document
      .getElementById("abAlertCrossBtn")
      .addEventListener("click", abCloseAlertBoxWithCross, true);

    //pass control to init2
    init2();
  }
  function loadSettings() {
    // Remove old V1 settings if they're still hanging around
    if (localStorage.WMEFixUI) {
      localStorage.removeItem("WMEFixUI");
    }
    var options;
    if (localStorage.WMEFUSettings) {
      options = JSON.parse(localStorage.WMEFUSettings);
    } else {
      options = {};
    }
    oldVersion = options.oldVersion !== undefined ? options.oldVersion : "0.0";
    getById("_cbMoveZoomBar").checked =
      options.moveZoomBar !== undefined ? options.moveZoomBar : true;
    getById("_cbShrinkTopBars").checked =
      options.shrinkTopBars !== undefined ? options.shrinkTopBars : true;
    getById("_cbCompressSegmentTab").checked =
      options.restyleSidePanel !== undefined ? options.restyleSidePanel : true;
    getById("_cbRestyleReports").checked =
      options.restyleReports !== undefined ? options.restyleReports : true;
    getById("_cbEnhanceChat").checked =
      options.enhanceChat !== undefined ? options.enhanceChat : true;
    getById("_cbNarrowSidePanel").checked =
      options.narrowSidePanel !== undefined ? options.narrowSidePanel : false;
    getById("_inpASX").value =
      options.aerialShiftX !== undefined ? options.aerialShiftX : 0;
    getById("_inpASY").value =
      options.aerialShiftY !== undefined ? options.aerialShiftY : 0;
    getById("_inpASO").value =
      options.aerialOpacity !== undefined ? options.aerialOpacity : 100;
    getById("_inpASXO").value =
      options.aerialShiftXO !== undefined ? options.aerialShiftXO : 0;
    getById("_inpASYO").value =
      options.aerialShiftYO !== undefined ? options.aerialShiftYO : 0;
    getById("_inpASOO").value =
      options.aerialOpacityO !== undefined ? options.aerialOpacityO : 100;
    getById("_cbFixExternalProviders").checked =
      options.fixExternalProviders !== undefined
        ? options.fixExternalProviders
        : true;
    getById("_inpGSVContrast").value =
      options.GSVContrast !== undefined ? options.GSVContrast : 100;
    getById("_inpGSVBrightness").value =
      options.GSVBrightness !== undefined ? options.GSVBrightness : 100;
    getById("_cbGSVInvert").checked =
      options.GSVInvert !== undefined ? options.GSVInvert : false;
    getById("_inpGSVWidth").value =
      options.GSVWidth !== undefined ? options.GSVWidth : 50;
    getById("_cbCompressLayersMenu").checked =
      options.restyleLayersMenu !== undefined
        ? options.restyleLayersMenu
        : true;
    getById("_cbLayersColumns").checked =
      options.layers2Cols !== undefined ? options.layers2Cols : false;
    getById("_cbMoveChatIcon").checked =
      options.moveChatIcon !== undefined ? options.moveChatIcon : true;
    getById("_cbHighlightInvisible").checked =
      options.highlightInvisible !== undefined
        ? options.highlightInvisible
        : true;
    getById("_cbDarkenSaveLayer").checked =
      options.darkenSaveLayer !== undefined ? options.darkenSaveLayer : true;
    getById("_cbLayersMenuMoreOptions").checked =
      options.layersMenuMore !== undefined ? options.layersMenuMore : true;
    getById("_inpUIContrast").value =
      options.UIContrast !== undefined ? options.UIContrast : 1;
    getById("_inpUICompression").value =
      options.UICompression !== undefined ? options.UICompression : 1;
    getById("_cbSwapRoadsGPS").checked =
      options.swapRoadsGPS !== undefined ? options.swapRoadsGPS : true;
    getById("_cbShowMapBlockers").checked =
      options.showMapBlockers !== undefined ? options.showMapBlockers : true;
    getById("_cbTameLockedSegmentMsg").checked =
      options.tameLockedSegmentMsg !== undefined
        ? options.tameLockedSegmentMsg
        : false;
    getById("_cbHideSegmentPanelLabels").checked =
      options.hideSegmentPanelLabels !== undefined
        ? options.hideSegmentPanelLabels
        : false;
    getById("_cbTameSegmentTypeMenu").checked =
      options.tameSegmentMenu !== undefined ? options.tameSegmentMenu : false;
    getById("_cbTameElevationMenu").checked =
      options.tameElevationMenu !== undefined
        ? options.tameElevationMenu
        : false;
    getById("_cbRemoveRoutingReminder").checked =
      options.removeRoutingReminder !== undefined
        ? options.removeRoutingReminder
        : false;
    getById("_cbReEnableSidePanel").checked =
      options.reEnableSidePanel !== undefined
        ? options.reEnableSidePanel
        : false;
    getById("_cbDisableBridgeButton").checked =
      options.disableBridgeButton !== undefined
        ? options.disableBridgeButton
        : true;
    getById("_cbDisablePathButton").checked =
      options.disablePathButton !== undefined
        ? options.disablePathButton
        : false;
    getById("_cbISODates").checked =
      options.ISODates !== undefined ? options.ISODates : true;
    getById("_cbMondayFirst").checked =
      options.mondayFirst !== undefined ? options.mondayFirst : false;
    getById("_cbDisableKinetic").checked =
      options.disableKinetic !== undefined ? options.disableKinetic : false;
    getById("_cbDisableScrollZoom").checked =
      options.disableScrollZoom !== undefined
        ? options.disableScrollZoom
        : false;
    getById("_cbDisableZoomAnimation").checked =
      options.disableAnimatedZoom !== undefined
        ? options.disableAnimatedZoom
        : false;
    getById("_cbDisableUITransitions").checked =
      options.disableUITransitions !== undefined
        ? options.disableUITransitions
        : false;
    getById("_cbDisableSaveBlocker").checked =
      options.disableSaveBlocker !== undefined
        ? options.disableSaveBlocker
        : false;
    getById("_cbColourBlindTurns").checked =
      options.colourBlindTurns !== undefined ? options.colourBlindTurns : false;
    getById("_cbHideMenuLabels").checked =
      options.hideMenuLabels !== undefined ? options.hideMenuLabels : false;
    getById("_cbUnfloatButtons").checked =
      options.unfloatButtons !== undefined ? options.unfloatButtons : false;
    getById("_cbMoveUserInfo").checked =
      options.moveUserInfo !== undefined ? options.moveUserInfo : false;
    getById("_cbHackGSVHandle").checked =
      options.hackGSVHandle !== undefined ? options.hackGSVHandle : false;
    getById("_cbEnlargeGeoNodes").checked =
      options.enlargeGeoNodes !== undefined ? options.enlargeGeoNodes : false;
    getById("_inpEnlargeGeoNodes").value =
      options.geoNodeSize !== undefined ? options.geoNodeSize : 8;
    getById("_cbEnlargeGeoHandlesFU").checked =
      options.enlargeGeoHandles !== undefined
        ? options.enlargeGeoHandles
        : false;
    getById("_inpEnlargeGeoHandles").value =
      options.geoHandleSize !== undefined ? options.geoHandleSize : 6;
    getById("_cbEnlargePointMCs").checked =
      options.enlargePointMCs !== undefined ? options.enlargePointMCs : false;
    getById("_inpEnlargePointMCs").value =
      options.pointMCScale !== undefined ? options.pointMCScale : 1;
    getById("_cbResizeSearchBox").checked =
      options.resizeSearchBox !== undefined ? options.resizeSearchBox : false;
  }
  function saveSettings() {
    if (localStorage) {
      logit("saving options to local storage");
      var options = {};
      options.oldVersion = FUME_VERSION;
      options.moveZoomBar = getById("_cbMoveZoomBar").checked;
      options.shrinkTopBars = getById("_cbShrinkTopBars").checked;
      options.restyleSidePanel = getById("_cbCompressSegmentTab").checked;
      options.restyleReports = getById("_cbRestyleReports").checked;
      options.enhanceChat = getById("_cbEnhanceChat").checked;
      options.narrowSidePanel = getById("_cbNarrowSidePanel").checked;
      options.aerialShiftX = getById("_inpASX").value;
      options.aerialShiftY = getById("_inpASY").value;
      options.aerialOpacity = getById("_inpASO").value;
      options.aerialShiftXO = getById("_inpASXO").value;
      options.aerialShiftYO = getById("_inpASYO").value;
      options.aerialOpacityO = getById("_inpASOO").value;
      options.fixExternalProviders = getById("_cbFixExternalProviders").checked;
      options.GSVContrast = getById("_inpGSVContrast").value;
      options.GSVBrightness = getById("_inpGSVBrightness").value;
      options.GSVInvert = getById("_cbGSVInvert").checked;
      options.GSVWidth = getById("_inpGSVWidth").value;
      options.restyleLayersMenu = getById("_cbCompressLayersMenu").checked;
      options.layers2Cols = getById("_cbLayersColumns").checked;
      options.moveChatIcon = getById("_cbMoveChatIcon").checked;
      options.highlightInvisible = getById("_cbHighlightInvisible").checked;
      options.darkenSaveLayer = getById("_cbDarkenSaveLayer").checked;
      options.layersMenuMore = getById("_cbLayersMenuMoreOptions").checked;
      options.UIContrast = getById("_inpUIContrast").value;
      options.UICompression = getById("_inpUICompression").value;
      options.swapRoadsGPS = getById("_cbSwapRoadsGPS").checked;
      options.showMapBlockers = getById("_cbShowMapBlockers").checked;
      options.tameLockedSegmentMsg = getById("_cbTameLockedSegmentMsg").checked;
      options.hideSegmentPanelLabels = getById(
        "_cbHideSegmentPanelLabels"
      ).checked;
      options.tameSegmentMenu = getById("_cbTameSegmentTypeMenu").checked;
      options.tameElevationMenu = getById("_cbTameElevationMenu").checked;
      options.removeRoutingReminder = getById(
        "_cbRemoveRoutingReminder"
      ).checked;
      options.reEnableSidePanel = getById("_cbReEnableSidePanel").checked;
      options.disableBridgeButton = getById("_cbDisableBridgeButton").checked;
      options.disablePathButton = getById("_cbDisablePathButton").checked;
      options.ISODates = getById("_cbISODates").checked;
      options.mondayFirst = getById("_cbMondayFirst").checked;
      options.disableKinetic = getById("_cbDisableKinetic").checked;
      options.disableScrollZoom = getById("_cbDisableScrollZoom").checked;
      options.disableAnimatedZoom = getById("_cbDisableZoomAnimation").checked;
      options.disableUITransitions = getById("_cbDisableUITransitions").checked;
      options.disableSaveBlocker = getById("_cbDisableSaveBlocker").checked;
      options.colourBlindTurns = getById("_cbColourBlindTurns").checked;
      options.hideMenuLabels = getById("_cbHideMenuLabels").checked;
      options.unfloatButtons = getById("_cbUnfloatButtons").checked;
      options.moveUserInfo = getById("_cbMoveUserInfo").checked;
      options.hackGSVHandle = getById("_cbHackGSVHandle").checked;
      options.enlargeGeoNodes = getById("_cbEnlargeGeoNodes").checked;
      options.geoNodeSize = getById("_inpEnlargeGeoNodes").value;
      options.enlargeGeoHandles = getById("_cbEnlargeGeoHandlesFU").checked;
      options.geoHandleSize = getById("_inpEnlargeGeoHandles").value;
      options.enlargePointMCs = getById("_cbEnlargePointMCs").checked;
      options.pointMCScale = getById("_inpEnlargePointMCs").value;
      options.resizeSearchBox = getById("_cbResizeSearchBox").checked;
      localStorage.WMEFUSettings = JSON.stringify(options);
    }
  }
  function applyAllSettings() {
    kineticDragParams = W.map.controls.find((control) => control.dragPan)
      .dragPan.kinetic;

    logit("Applying settings...");

    unfloatButtons();
    shrinkTopBars();
    compressSegmentTab();
    restyleReports();
    enhanceChat();
    narrowSidePanel();
    warnCommentsOff();
    adjustGSV();
    GSVWidth();
    compressLayersMenu();
    moveChatIcon();
    highlightInvisible();
    darkenSaveLayer();
    swapRoadsGPS();
    showMapBlockers();
    disableBridgeButton();
    disablePathButton();
    disableKinetic();
    disableScrollZoom();
    disableAnimatedZoom();
    disableSaveBlocker();
    disableUITransitions();
    colourBlindTurns();
    hideMenuLabels();
    createZoomBar();

    moveUserInfo();
    moveSearchThisArea();

    hackGSVHandle();
    enlargeGeoNodes(false);
    enlargeGeoHandles(false);
    enlargePointMCs();
    RTCArrowsFix();
    hideUnuseableStuff();
    resizeSearch();

    RestrictionObserver.observe(getById("dialog-container"), {
      childList: true,
      subtree: true,
    });
    ClosureObserver.observe(getById("edit-panel"), {
      childList: true,
      subtree: true,
    });
    SegmentObserver.observe(getById("edit-panel"), {
      childList: true,
      subtree: true,
    });
    PlaceObserver.observe(getById("edit-panel"), {
      childList: true,
      subtree: true,
    });
    MTEObserver.observe(getById("sidepanel-mtes"), {
      childList: true,
      subtree: true,
    });
    RTCMarkerObserver.observe(W.map.closuresMarkerLayer.div, {
      childList: true,
      subtree: true,
    });
    OBObserver.observe(getById("overlay-buttons"), {
      childList: true,
      subtree: true,
    });
    ITObserver.observe(getById("issue-tracker-filter-region"), {
      childList: true,
      subtree: true,
    });
    PriToolBarObserver.observe(getById("primary-toolbar"), {
      childList: true,
      subtree: true,
    });

    document.body.onchange = checkForTippy;
    getById("sidepanel-issue-tracker").onchange = checkForIssuesFilter;

    if (getById("_cbLayersMenuMoreOptions").checked === true) {
      $(
        "#layer-switcher-region > div > div > div.more-options-toggle > label > div"
      ).click();
      Array.from(
        getByClass("upside-down", getById("layer-switcher-region"))
      ).forEach(function (item) {
        item.click();
      });
    }

    wmeFUinitialising = false;
    saveSettings();
  }
  function hasExactlyOneSelectedSegment() {
    let retval = false;
    let sf = W.selectionManager.getSelectedDataModelObjects();
    if (sf.length === 1) {
      retval = sf[0].type === "segment";
    }

    return retval;
  }

  function checkForTippy() {
    // To handle the "tippy" classed dynamic popup used to show TIO details, we first call this function from the
    // body onchange event - the sole purpose of which is to call checkForTippy2() so long as exactly one segment
    // is selected.  If this latter isn't true, then no turn arrows will be visible, thus the TIO popup can't be
    // shown...
    if (hasExactlyOneSelectedSegment() === true) {
      let n = document.querySelectorAll(".turn-arrow-state-open").length;
      while (n) {
        --n;
        document
          .querySelectorAll(".turn-arrow-state-open")
          [n].addEventListener("mouseenter", checkForTippy1a);
      }
      checkForTippy1a();
    }
  }
  function checkForTippy1a() {
    let tObj = document.querySelector(".tippy-box");
    if (tObj === null) {
      window.setTimeout(checkForTippy1a, 100);
      return;
    }
    TippyObserver.observe(tObj, { childList: true, subtree: true });
  }
  function checkForTippy2() {
    // The onchange event is triggered as soon as the popup element is created within the DOM, however at this
    // point it won't yet be populated with its contents.  So in here we first make sure the popup container
    // (i.e. the ".tippy-box" classed element) exists, and then wait for it to gain some "wz-option" elements
    // which are used to render the drop-down menu we want to restyle.  Once we see some of those, we can move
    // onto the last step via the restyleTippy() call.
    //
    // Note this function is also used by the popup mutation observer we set up in a moment
    let tObj = document.querySelector(".tippy-box");

    if (tObj === null) {
      window.setTimeout(checkForTippy2, 100);
      return;
    }

    if (tObj.querySelectorAll("wz-option").length == 0) {
      window.setTimeout(checkForTippy2, 100);
      return;
    }

    let compress = getById("_inpUICompression").value;
    if (compress > 0) {
      restyleTippy();
    }
  }
  var TippyObserver = new MutationObserver(function (mutations) {
    // If we detect any changes in the popup contents, treat it almost the same as the original body onchange event
    // and go back into checking for the drop-down elements being present prior to restyling
    checkForTippy2();
  });
  function restyleTippy() {
    // Once we're happy that the TIO popup has been populated with the stuff we're interested in messing with, we can
    // apply the restyling required...
    let tObj = document.querySelector(".tippy-box");

    let n = tObj.querySelectorAll("wz-option").length;
    while (n) {
      let sr = tObj.querySelectorAll("wz-option")[n - 1].shadowRoot;
      let mi = sr.querySelector(".wz-menu-item");
      if (mi != null) {
        SetStyle(mi, "height", "100%", false);
        SetStyle(mi, "lineHeight", "130%", false);
        SetStyle(mi, "minHeight", "auto", false);
      }
      --n;
    }
    // Having done that, we now set up a mutation observer on the popup, which allows us to detect when its redrawn
    // (which would cause the redrawn drop-down to revert to the default styling) without the body onchange event
    // triggering - this can occur if they mouse-over one of the other turn arrows on the currently selected segment,
    // or if they select a different segment without first deselecting the current one...
    TippyObserver.observe(tObj, { childList: true, subtree: true });
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

    let srProbe = document
      .querySelector("#areas")
      ?.querySelector("wz-option")
      ?.shadowRoot?.querySelector(".wz-menu-item");
    let srExists = srProbe != null && srProbe != undefined;

    if (srExists === true) {
      restyleDropDownEntries();
    } else {
      window.setTimeout(checkForIssuesFilter, 100);
    }
  }
  function applyEnhancements() {
    shrinkTopBars();
    compressSegmentTab();
    restyleReports();
    enhanceChat();
    compressLayersMenu();
    moveUserInfo();
  }
  function moveSVRecentreIcons() {
    let fname = "moveSVRecentreIcons";
    if (getById("_cbMoveZoomBar").checked) {
      if (getById("WMEFUzoom") === null) return;
      // Apply the styling related to the zoombar, so that we can get an accurate read of its
      // size/location in a moment...
      var styles = `
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
          background-color: white;
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
          background-color: white;
          cursor: ns-resize;
        }

        `;
      addStyle(PREFIX + fname, styles);

      // Force a re-render of the zoombar, so that the graphics elements which are missing at this point
      // get inserted - this is also required to get an accurate size/location read...
      ZLI();

      // Get the absolute positions/sizes of the newly generated zoombar, the existing element that contains
      // the SV and location buttons, and the size of the SV button
      var zbBCR = getById("WMEFUzoom").getBoundingClientRect();
      var bcBCR = getByClass(
        "bottom overlay-buttons-container"
      )[0].getBoundingClientRect();
      var btnBCR = getByClass("street-view-control")[0].getBoundingClientRect();
      // Use this information to calculate what the x/y positions will need to be for the buttons to position
      // them correctly below the zoombar.  Note that the x position will be negative, as this gets applied
      // relative to the parent container in which the button container resides, rather than to the map view
      var bcPosX = zbBCR.left - bcBCR.left;
      var bcPosY = zbBCR.top + zbBCR.height;
      // Also work out how tall the button container will need to be once we've hidden the native zoom
      // controls
      var bcHeight = btnBCR.height * 2 + 10;

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
				  background-color: white;
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
				  background-color: white;
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
			`;

      addStyle(PREFIX + fname, styles);

      ZLI();
    } else {
      removeStyle(PREFIX + fname);
    }
  }
  function createZoomBar() {
    if (getById("_cbMoveZoomBar").checked) {
      // Create the zoombar element and add it to the map view
      yslider = new OpenLayers.Control.PanZoomBar({
        zoomStopHeight: 5,
        panIcons: false,
      });
      yslider.position.x = 10;
      yslider.position.y = 35;
      yslider.id = "WMEFUzoom";
      W.map.addControl(yslider);

      W.map.events.register("zoomend", null, ZLI);
      zliResizeObserver = new ResizeObserver(ZLIDeferred);
      zliResizeObserver.observe(
        document.getElementById("street-view-container")
      );
      zliResizeObserver.observe(document.getElementById("sidebar"));
    } else {
      if (yslider) {
        yslider.destroy();
      }
      W.map.events.unregister("zoomend", null, ZLI);
      if (zliResizeObserver !== null) {
        zliResizeObserver.disconnect();
      }
    }
    moveSVRecentreIcons();
  }
  function ZLIDeferred() {
    // The ResizeObserver attached to the StreetView container fires not only when the container is
    // opened or closed, but also when its width is altered by dragging the vertical divider.  On
    // some systems, the RO events that are triggered by this latter type of resizing are processed
    // before the StreetView container has finished redrawing - on such systems, if we were to call
    // ZLI directly from the RO event, the zoom bar would end up being trashed again if the user
    // resized using the divider, so we add a short delay after the RO event before calling ZLI.
    setTimeout(ZLI, 200);
    // Likewise for the function used to relocate the SV and recentre icons...
    setTimeout(moveSVRecentreIcons, 200);
  }
  function ZLI() {
    if (yslider) {
      //Need to reset the OpenLayers-created settings from the zoom bar when it's redrawn
      //Overall bar
      yslider.div.style.left = "";
      yslider.div.style.top = "";
      //zoom in/out buttons
      yslider.buttons[0].style = "";
      yslider.buttons[0].innerHTML = modifyHTML(
        "<div class='olControlZoomButton fa fa-plus' ></div>"
      );
      yslider.buttons[1].style = "";
      yslider.buttons[1].innerHTML = modifyHTML(
        "<div class='olControlZoomButton fa fa-minus' ></div>"
      );
      //slider stops
      yslider.zoombarDiv.classList.add("yslider-stops");
      yslider.zoombarDiv.classList.remove("olButton");
      yslider.zoombarDiv.style = "";
      //slider
      yslider.slider.innerHTML = modifyHTML("");
      yslider.slider.style = "";
      yslider.slider.classList.add("slider");
      yslider.moveZoomBar();
      //Actually set the ZLI
      yslider.slider.innerText = W.map.getZoom();
      yslider.slider.title = "Zoom level indicator by WMEFU";
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
          yslider.slider.style.background = "#ef9a9a";
          yslider.slider.title +=
            "\nCannot permalink any segments at this zoom level";
          break;
        case 14:
        case 15:
          yslider.slider.style.background = "#ffe082";
          yslider.slider.title +=
            "\nCan only permalink primary or higher at this zoom level";
          break;
        default:
          yslider.slider.style.background = "#ffffff";
          yslider.slider.title +=
            "\nCan permalink any segments at this zoom level";
          break;
      }

      if (W.map.getZoom() < 12) {
        // Re-enable the sidepanel UI if the user has opted to do so...
        if (getById("_cbReEnableSidePanel").checked === true) {
          if (
            document.getElementsByClassName("overlay editingDisabled").length >
            0
          ) {
            document
              .getElementsByClassName("overlay editingDisabled")[0]
              .remove();
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
            .getBoundingClientRect().height;
          eTop = Math.round(eTop) + "px";
          document.getElementsByClassName(
            "zoom-edit-message editingDisabled"
          )[0].style.top = eTop;
          document.getElementsByClassName(
            "zoom-edit-message editingDisabled"
          )[0].style.left = "0px";
        }
      }
    }
  }
  function resizeSearch() {
    let sb = document.querySelector("#search");
    if (getById("_cbResizeSearchBox").checked) {
      sb.style.width = "100%";
      let wcs = window.getComputedStyle(
        document.querySelector("#primary-toolbar")
      );
      let tbAvailable = parseInt(wcs.marginLeft) + parseInt(wcs.marginRight);
      if (tbAvailable > 0) {
        sb.style.width = tbAvailable + "px";
      }
    } else {
      sb.style.width = "";
    }
  }
  function moveSearchThisArea() {
    if (
      document.querySelector("div.w-icon-search")?.parentElement
        ?.parentElement !== undefined
    ) {
      document.querySelector(
        "div.w-icon-search"
      ).parentElement.parentElement.style.zIndex = "5";
    }
  }
  function moveUserInfo() {
    // Now functioning correctly for prod & beta
    let fname = "moveUserInfo";
    let styles = "";
    let mStyle = "";

    if (getById("_cbMoveUserInfo").checked) {
      // styles += '#user-box-region { margin-left: 5px; }';
      styles += ".notifications-button { display: flex; }";
      styles += "#app-head aside #left-app-head .waze-logo { width: 50px; }";
      styles += ".user-toolbar .notifications-button { padding: 0 4px; }";
      styles +=
        ".notifications-box-container { transform: translate3d(300px, 0px, 0px) !important; }";

      addStyle(PREFIX + fname, styles);

      insertNodeBeforeNode(
        document.querySelector(".user-toolbar"),
        getById("left-app-head")
      );
      insertNodeBeforeNode(
        document.querySelector("wz-user-box"),
        getById("left-app-head")
      );

      mStyle = "translate3d(240px, 0px, 0px)";

      //Fix to move control button of Invalidated Camera Mass Eraser
      if (getById("_UCME_btn")) {
        getById("advanced-tools").appendChild(getById("_UCME_btn"));
        getById("UCME_btn").parentNode.removeChild(getById("UCME_btn"));
      }
    } else {
      removeStyle(PREFIX + fname);
      insertNodeAfterNode(
        document.querySelector("wz-user-box"),
        document.querySelector("#save-button").parentElement.parentElement
      );
      insertNodeAfterNode(
        document.querySelector(".user-toolbar"),
        document.querySelector("#save-button").parentElement.parentElement
      );
    }

    unfloat();

    // Keep the user profile box aligned to the profile picture
    let sr = document.querySelector("wz-user-box");
    if (sr !== null) sr = sr.shadowRoot;
    if (sr !== null) {
      let mObj = sr.querySelector("wz-menu");
      if (mObj !== null) {
        mObj.style.transform = mStyle;
      }
    }
  }
  function RemoveTopBarCompression() {
    document
      .getElementsByTagName("wz-header")[0]
      .shadowRoot.querySelector(".content-wrapper").style.height = "";
    let bObj = document.getElementsByClassName("restricted-driving-area")[0]
      .parentElement;
    bObj.style.position = "";
  }
  function ApplyTopBarShadowRootWzButtonCompression() {
    let retval = true;

    if (getById("_cbShrinkTopBars").checked) {
      let compress = getById("_inpUICompression").value;
      if (compress > 0) {
        const c1 = ["", "35px", "24px"];
        let tbRoot = document.querySelector("#app-head");
        if (tbRoot != null) {
          let btnWraps = tbRoot.querySelectorAll(".toolbar-button-wrapper");
          for (let i = 0; i < btnWraps.length; ++i) {
            let btnElm = btnWraps[i].querySelector("wz-button");

            if (btnElm !== undefined) {
              let srButton = btnElm?.shadowRoot?.querySelector(".wz-button");
              if (srButton !== undefined && srButton !== null) {
                srButton.style.height = c1[compress];
              } else {
                retval = false;
              }
            }
          }
        }
      }
    }
    return retval;
  }
  function shrinkTopBars() {
    let fname = "shrinkTopBars";
    let styles = "";
    if (getById("_cbShrinkTopBars").checked) {
      let contrast = getById("_inpUIContrast").value;
      let compress = getById("_inpUICompression").value;

      //always do this stuff
      //event mode button
      styles +=
        "#mode-switcher-region .title-button .icon { font-size: 13px; font-weight: bold; color: black; }";
      //black bar
      styles += "#topbar-container { pointer-events: none; }";
      styles +=
        "#map #topbar-container .topbar > div { pointer-events: initial; }";
      //change toolbar buttons - from JustinS83
      $("#mode-switcher-region .title-button .icon").removeClass(
        "w-icon-caret-down"
      );
      $("#mode-switcher-region .title-button .icon").addClass("fa fa-calendar");
      // HN editing tweaks
      styles += "#map-lightbox .content { pointer-events: none; }";
      styles += "#map-lightbox .content > div { pointer-events: initial; }";
      styles +=
        "#map-lightbox .content .header { pointer-events: none !important; }";
      styles +=
        ".toolbar .toolbar-button.add-house-number { background-color: #61cbff; float: right; font-weight: bold; }";
      styles +=
        ".waze-icon-exit { background-color: #61cbff; font-weight: bold; }";
      // event mode button
      styles +=
        ".toolbar.toolbar-mte .add-button { background-color: orange; font-weight: bold; }";

      // fix for narrow windows and new toolbar
      let nbuttons = 3 + (getById("_cbUnfloatButtons").checked ? 2 : 0);
      let minW = nbuttons * [58, 49, 33][compress] + [80, 65, 55][compress];
      styles += "#edit-buttons { min-width: " + minW + "px; }";
      styles += "#toolbar { padding: 0px ; }";

      if (compress > 0) {
        const c1 = ["", "35px", "24px"];
        const c2 = ["", "13px", "12px"];

        //if we're in beta, remove the WME logo/beta badge (which isn't so important) to leave space for the build ID (which is)
        if (document.getElementById("env-badge") !== null) {
          styles += "#logo-and-env { display: none !important; }";
        }

        //overall menu bar
        styles += "#left-app-head { height: " + c1[compress] + " !important; }";
        styles += "#app-head { height: " + c1[compress] + "; }";
        styles += "#toolbar { height: " + c1[compress] + " !important; }";

        styles +=
          ".group-title-tooltip-wrap { height: " +
          c1[compress] +
          " !important; }";
        styles +=
          ".restricted-driving-area wz-tooltip-target { height: " +
          c1[compress] +
          " !important; }";
        styles += ".edit-area { height: calc(100% - " + c1[compress] + "); }";
        styles += "#primary-toolbar>div { height: " + c1[compress] + "; }";
        styles += "#user-toolbar { height: " + c1[compress] + "; }";
        styles +=
          "wz-user-box { scale: " +
          (parseInt(c1[compress]) * 100) / 36 +
          "%; }";

        styles +=
          "#app-head aside .short-title { font-size: " +
          c2[compress] +
          "; margin-right: 4px; }";
        styles +=
          "#app-head aside #debug { padding-right: " +
          ["", "10px", "6px"][compress] +
          "; line-height: " +
          ["", "15px", "12px"][compress] +
          "; white-space: nowrap; }";

        styles +=
          ".mode-switcher-view .title-button .icon { line-height: " +
          c1[compress] +
          "; }";
        styles +=
          ".mode-switcher-view .dropdown-menu { top: " + c1[compress] + "; }";
        styles += ".toolbar { font-size: " + c2[compress] + "; }";
        styles += ".toolbar { height: " + c1[compress] + " !important; }";

        styles += ".toolbar { gap: 4px; }";
        styles += ".toolbar-collection-view { gap: 4px !important; }";
        styles += ".toolbar .toolbar-group { margin-right: 0px !important; }";
        styles += "#edit-buttons { gap: 2px; }";
        styles += "#search { flex: 2 1 auto; }";

        //search box
        styles +=
          "#search { padding-top: " +
          ["", "3px", "1px"][compress] +
          " !important; }";
        styles +=
          ".form-search { height: " + ["", "27px", "22px"][compress] + "; }";
        styles +=
          ".form-search .search-query { height: " +
          ["", "27px", "22px"][compress] +
          "; font-size: " +
          c2[compress] +
          "; }";
        styles +=
          ".form-search .input-wrapper .search-icon { font-size: " +
          ["", "18px", "16px"][compress] +
          "; left: " +
          ["", "9px", "6px"][compress] +
          "; }";
        styles +=
          ".form-search .search-query { padding-left: " +
          ["", "34px", "24px"][compress] +
          ";; }";

        //edit-buttons section
        styles +=
          "#edit-buttons { margin-right: " +
          ["", "9px", "2px"][compress] +
          "; }";
        //toolbar dropdowns
        styles +=
          ".toolbar .toolbar-group { margin-right: " +
          ["", "14px", "8px"][compress] +
          "; padding-top: 0px; height: " +
          c1[compress] +
          "; }";
        styles +=
          ".toolbar .group-title { height: " +
          ["", "34px", "24px"][compress] +
          "; line-height: " +
          ["", "34px", "24px"][compress] +
          "; }";
        styles +=
          ".toolbar .dropdown-menu { top: " +
          ["", "34px", "24px"][compress] +
          " !important; left: " +
          ["", "7px", "4px"][compress] +
          " !important; }";
        styles +=
          "wz-menu { top: " + ["", "34px", "24px"][compress] + " !important; }";

        //toolbar buttons
        styles +=
          ".toolbar .toolbar-button { margin-top: " +
          ["", "3px", "1px"][compress] +
          "; margin-left: 3px; padding-left: " +
          ["", "10px", "5px"][compress] +
          "; padding-right: " +
          ["", "10px", "5px"][compress] +
          "; height: " +
          ["", "27px", "22px"][compress] +
          "; line-height: " +
          ["", "27px", "22px"][compress] +
          "; }";
        styles +=
          ".toolbar .toolbar-button { padding-left: " +
          ["", "2px", "2px"][compress] +
          "; padding-right: " +
          ["", "2px", "2px"][compress] +
          "; }";
        styles +=
          ".toolbar .toolbar-button .item-container { padding-left: " +
          ["", "9px", "2px"][compress] +
          "; padding-right: " +
          ["", "9px", "2px"][compress] +
          "; }";
        styles +=
          ".toolbar .item-icon { font-size: " +
          ["", "22px", "20px"][compress] +
          " !important; }";

        styles +=
          ".toolbar .toolbar-button > .item-icon { top: " +
          ["", "5px", "2px"][compress] +
          "; }";
        styles +=
          ".toolbar .toolbar-separator { height: " +
          ["", "34px", "22px"][compress] +
          "; }";

        styles += ".toolbar-button-wrapper { padding: 0!important; }";

        //extra hack for my Permalink Counter button
        styles +=
          ".WMEFUPCicon { margin-top: " +
          ["", "4px !important", "2px !important"][compress] +
          "; }";
        //floating buttons
        styles +=
          ".overlay-button { height: " +
          ["", "33px", "26px"][compress] +
          "; width: " +
          ["", "33px", "26px"][compress] +
          "; font-size: " +
          ["", "22px", "20px"][compress] +
          "; padding: " +
          ["", "3px", "1px"][compress] +
          "; }";
        styles +=
          "#Info_div { height: " +
          ["", "33px", "26px"][compress] +
          " !important; width: " +
          ["", "33px", "26px"][compress] +
          " !important; }";
        styles +=
          ".zoom-bar-container {width: " +
          ["", "33px", "26px"][compress] +
          " !important; }";
        styles +=
          ".zoom-bar-container .overlay-button {height: " +
          ["", "33px", "26px"][compress] +
          " !important; }";
        styles +=
          "#overlay-buttons .overlay-buttons-container > div:last-child { margin-bottom: 0; }";
        //layers menu
        // styles += '.layer-switcher .toolbar-button { margin-top: ' + ['','1px','0px'][compress] + ' !important; font-size: ' + ['','22px','20px'][compress] + ' !important; height: ' + ['','32px','24px'][compress] + '; }';
        //user button
        styles +=
          "#user-box-region { margin-right: " +
          ["", "8px", "2px"][compress] +
          "; }";
        styles +=
          ".user-box-avatar { height: " +
          ["", "32px", "23px"][compress] +
          " !important; font-size: " +
          ["", "22px", "20px"][compress] +
          "; }";
        styles +=
          ".app .level-icon { width: " +
          ["", "32px", "23px"][compress] +
          " !important;  height: " +
          ["", "32px", "23px"][compress] +
          " !important;}";
        //new save menu
        styles +=
          ".changes-log-region { top: " +
          ["", "26px", "21px"][compress] +
          "; }";
        //black bar
        styles +=
          ".topbar { height: " +
          ["", "24px", "18px"][compress] +
          "; line-height: " +
          ["", "24px", "18px"][compress] +
          "; }";
        //fix for WME Presets button
        styles += "#WMEPresetsDiv > i { height: 100%;}";
        // remove the unecessary space to the left of the notification icon
        styles += ".secondary-toolbar-spacer { display: none; }";

        // All the stuff that can no longer be done via CSS due to shadowroot...
        ApplyTopBarShadowRootWzButtonCompression();

        document
          .querySelector("wz-header")
          .shadowRoot.querySelector(".content-wrapper").style.height =
          c1[compress];
        document
          .querySelector("wz-header")
          .shadowRoot.querySelector(".content-wrapper").style.padding =
          "0px 16px 0px 16px";
        document
          .querySelector("#delete-button")
          .shadowRoot.querySelector("button")
          .setAttribute("style", "height: auto!important;");
        document
          .querySelector("#undo-button")
          .shadowRoot.querySelector("button")
          .setAttribute("style", "height: auto!important;");
        document
          .querySelector("#redo-button")
          .shadowRoot.querySelector("button")
          .setAttribute("style", "height: auto!important;");
        document
          .querySelector("#notification-button")
          .shadowRoot.querySelector("button")
          .setAttribute("style", "height: auto!important;");

        document
          .querySelector(".reload-button")
          .shadowRoot.querySelector("button")
          .setAttribute("style", "min-width: auto!important;");
        document
          .querySelector(".layer-switcher-button")
          .shadowRoot.querySelector("button")
          .setAttribute("style", "min-width: auto!important;");
      } else {
        RemoveTopBarCompression();
      }
      if (contrast > 0) {
        //toolbar dropdown menus
        styles += ".toolbar .group-title { color: black; }";
        styles +=
          ".toolbar .toolbar-button { border-radius: 8px; " +
          GetBorderContrast(contrast, false) +
          "color: black; }";
        //layers icon - until Waze fix it
        styles +=
          ".layer-switcher .waze-icon-layers.toolbar-button{ background-color: white; }";
      }
      addStyle(PREFIX + fname, styles);
    } else {
      removeStyle(PREFIX + fname);
      //change toolbar buttons - from JustinS83
      $("#mode-switcher-region .title-button .icon").removeClass(
        "fa fa-calendar"
      );
      $("#mode-switcher-region .title-button .icon").addClass(
        "fa fa-angle-down"
      );

      RemoveTopBarCompression();
    }

    window.dispatchEvent(new Event("resize"));
  }
  function FALSEcompressSegmentTab() {
    getById("_cbCompressSegmentTab").checked =
      getById("_cbextraCBSection").checked;
    compressSegmentTab();
  }
  function compressSegmentTab() {
    let fname = "compressSegmentTab";

    // Apply a permanently active styling fix to enable wrapping in the drives tab,
    // to counter the effects of lengthening the datetime string format...
    let styles = "";
    styles += ".list-item-card-title { white-space: pre-wrap; }";
    addStyle(PREFIX + fname + "_permanent", styles);

    // Now go and do the optional styling stuff
    styles = "";
    if (getById("_cbCompressSegmentTab").checked) {
      var contrast = getById("_inpUIContrast").value;
      var compress = getById("_inpUICompression").value;
      //Neuter the top gradient
      styles += "#sidebar .tab-scroll-gradient { pointer-events: none; }";
      //Nuke the bottom gradient
      styles += "#sidebar #links:before { display: none; }";
      // Make map comment text always visible
      styles +=
        ".map-comment-name-editor .edit-button { display: block !important; }";
      // fix the latest layout bug (add closure button at the bottom of the screen) introduced by a WME update...
      styles += ".closures-list { height: auto; }";

      if (compress > 0) {
        //Lock level
        styles += ".lock-level-selector { display: flex; }";
        styles +=
          "#edit-panel .lock-edit-view label { line-height: 140% !important; }";
        styles +=
          "#edit-panel .lock-edit-view label { height: auto !important; width: auto !important; }";
        styles +=
          "#edit-panel .lock-edit-view label { margin-right: 2px !important; }";
        styles +=
          "#edit-panel .lock-edit-view label { margin-bottom: 6px !important; }";
        //general compression enhancements
        styles +=
          "#sidebar { line-height: " +
          ["", "18px", "16px"][compress] +
          " !important;}";
        styles +=
          "#sidebar .tab-content .tab-pane { padding: " +
          ["", "8px", "1px"][compress] +
          "; }";
        styles +=
          "#sidebar #sidebarContent { font-size: " +
          ["", "13px", "12px"][compress] +
          "; }";
        styles +=
          "#sidebar #advanced-tools { padding: " +
          ["", "0 9px", "0 4px"][compress] +
          "; }";
        styles +=
          "#sidebar .waze-staff-tools { margin-bottom: " +
          ["", "9px", "4px"][compress] +
          "; height: " +
          ["", "25px", "20px"][compress] +
          "; }";
        styles +=
          "#sidebar .categories-card-content { row-gap: " +
          ["", "3px", "0px"][compress] +
          "; }";
        //Tabs
        styles +=
          "#sidebar .nav-tabs { padding-bottom: " +
          ["", "3px", "2px"][compress] +
          "; }";
        styles +=
          "#sidebar #user-info #user-tabs { padding: " +
          ["", "0 9px", "0 4px"][compress] +
          "; }";
        styles +=
          "#sidebar .tabs-container { padding: " +
          ["", "0 9px", "0 4px"][compress] +
          "; }";
        styles +=
          "#sidebar .nav-tabs li a { margin-top: " +
          ["", "2px", "1px"][compress] +
          "; margin-left: " +
          ["", "3px", "1px"][compress] +
          "; padding: " +
          ["", "0 6px", "0 2px"][compress] +
          "; line-height: " +
          ["", "24px", "21px"][compress] +
          "; height: " +
          ["", "24px", "21px"][compress] +
          "; }";
        styles += "#sidebar .nav-tabs li { flex-grow: 0; }";
        //Feed
        styles +=
          ".feed-item { margin-bottom: " + ["", "3px", "1px"][compress] + "; }";
        styles +=
          ".feed-item .inner { padding: " +
          ["", "5px", "0px"][compress] +
          "; }";
        styles +=
          ".feed-item .content .title { margin-bottom: " +
          ["", "1px", "0px"][compress] +
          "; }";
        styles +=
          ".feed-item .motivation { margin-bottom: " +
          ["", "2px", "0px"][compress] +
          "; }";
        //Drives & Areas
        styles +=
          "#sidebar .message { margin-bottom: " +
          ["", "6px", "2px"][compress] +
          "; }";
        styles +=
          "#sidebar .result-list .result { padding: " +
          ["", "6px 17px", "2px 9px"][compress] +
          "; margin-bottom: " +
          ["", "3px", "1px"][compress] +
          "; }";
        styles +=
          "#sidebar .result-list .session { background-color: lightgrey; }";
        styles +=
          "#sidebar .result-list .session-available { background-color: white; }";
        styles +=
          "#sidebar .result-list .result.selected { background-color: lightgreen; }";
        styles += "div#sidepanel-drives { height: auto !important; }";

        //SEGMENT EDIT PANEL
        //general changes
        //checkbox groups
        styles +=
          "#sidebar .controls-container { padding-top: " +
          ["", "4px", "1px"][compress] +
          "; display: inline-block; font-size: " +
          ["", "12px", "11px"][compress] +
          "; }";
        styles +=
          '#sidebar .controls-container input[type="checkbox"] + label { padding-left: ' +
          ["", "21px", "17px"][compress] +
          " !important; } }";
        //form groups
        styles +=
          "#sidebar .form-group { margin-bottom: " +
          ["", "5px", "0px"][compress] +
          "; }";
        //dropdown inputs
        styles +=
          "#sidebar .form-control { height: " +
          ["", "27px", "19px"][compress] +
          "; padding-top: " +
          ["", "4px", "0px"][compress] +
          "; padding-bottom: " +
          ["", "4px", "0px"][compress] +
          "; font-size: " +
          ["", "13px", "12px"][compress] +
          "; color: black; }";
        //buttons
        styles +=
          "#edit-panel .waze-btn { padding-top: 0px !important; padding-bottom: " +
          ["", "3px", "1px"][compress] +
          "; height: " +
          ["", "20px", "18px"][compress] +
          " !important; line-height: " +
          ["", "20px", "18px"][compress] +
          " !important; font-size: " +
          ["", "13px", "12px"][compress] +
          "; }";
        //			styles += '#edit-panel .waze-btn { padding-top: ' + ['','3px','0px'][compress] + ' !important; padding-bottom: ' + ['','3px','1px'][compress] + '; height: ' + ['','20px','18px'][compress] + ' !important; line-height: ' + ['','20px','18px'][compress] + ' !important; font-size: ' + ['','13px','12px'][compress] + '; }';
        //radio button controls
        styles +=
          ".waze-radio-container label { height: " +
          ["", "19px", "16px"][compress] +
          "; width: " +
          ["", "19px", "16px"][compress] +
          "; line-height: " +
          ["", "19px", "16px"][compress] +
          "; font-size: " +
          ["", "13px", "12px"][compress] +
          "; margin-bottom: " +
          ["", "3px", "1px"][compress] +
          "; }";
        styles +=
          ".waze-radio-container label { width: auto; padding-left: " +
          ["", "6px", "3px"][compress] +
          " !important; padding-right: " +
          ["", "6px", "3px"][compress] +
          " !important; }";
        //text input areas
        styles += "#sidebar textarea.form-control { height: auto; }";
        styles += "#sidebar textarea { max-width: unset; }";
        //specific changes
        //Selected segments info
        styles +=
          "#edit-panel .selection { padding-top: " +
          ["", "8px", "2px"][compress] +
          "; padding-bottom: " +
          ["", "8px", "4px"][compress] +
          "; }";
        styles +=
          "#edit-panel .segment .direction-message { margin-bottom: " +
          ["", "9px", "3px"][compress] +
          "; }";
        //Segment details (closure warning)
        styles +=
          "#edit-panel .segment .segment-details { padding: " +
          ["", "10px", "5px"][compress] +
          "; padding-top: 0px; }";
        //All control labels
        styles +=
          "#edit-panel .control-label { font-size: " +
          ["", "11px", "10px"][compress] +
          "; margin-bottom: " +
          ["", "4px", "1px"][compress] +
          "; }";
        //Address input
        styles +=
          "#edit-panel .address-edit-view { cursor: pointer; margin-bottom: " +
          ["", "6px", "2px"][compress] +
          "!important; }";
        styles +=
          "#edit-panel .address-edit-input { padding: " +
          ["", "4px", "1px"][compress] +
          "; font-size: " +
          ["", "13px", "12px"][compress] +
          "; }";
        styles +=
          ".tts-button { height: " + ["", "28px", "21px"][compress] + "; }";
        //alt names
        styles +=
          ".alt-street-list { margin-bottom: " +
          ["", "4px", "0px"][compress] +
          "; }";
        styles +=
          "#edit-panel .add-alt-street-form .alt-street { padding-top: " +
          ["", "13px", "3px"][compress] +
          "; padding-bottom: " +
          ["", "13px", "3px"][compress] +
          "; }";
        styles +=
          "#edit-panel .add-alt-street-form .alt-street .alt-street-delete { top: " +
          ["", "12px", "4px"][compress] +
          "; }";
        styles +=
          "#edit-panel .segment .address-edit-view .address-form .action-buttons { padding-top: " +
          ["", "11px", "6px"][compress] +
          "; padding-bottom: " +
          ["", "11px", "6px"][compress] +
          "; margin-top: " +
          ["", "5px", "0px"][compress] +
          "; height: " +
          ["", "45px", "28px"][compress] +
          "; }";
        styles +=
          "#edit-panel .add-alt-street-form .new-alt-street { padding-top: " +
          ["", "8px", "3px"][compress] +
          "; padding-bottom: " +
          ["", "8px", "3px"][compress] +
          "; }";
        //restrictions control
        styles +=
          "#edit-panel .restriction-list { margin-bottom: " +
          ["", "5px", "0px"][compress] +
          "; }";
        //speed limit controls
        styles +=
          "#edit-panel .speed-limit { margin-top: " +
          ["", "0px", "-5px"][compress] +
          "; margin-bottom: " +
          ["", "5px", "2px"][compress] +
          ";}";
        styles +=
          "#edit-panel .segment .speed-limit label { margin-bottom: " +
          ["", "3px", "1px"][compress] +
          "; }";
        styles +=
          "#edit-panel .segment .speed-limit .form-control { height: " +
          ["", "23px", "19px"][compress] +
          "; padding-top: " +
          ["", "4px", "2px"][compress] +
          "; font-size: " +
          ["", "13px", "12px"][compress] +
          "; width: 5em; margin-left: 0px; }";
        styles +=
          "#edit-panel .segment .speed-limit .direction-label { font-size: " +
          ["", "12px", "11px"][compress] +
          "; line-height: " +
          ["", "2.0em", "1.8em"][compress] +
          "; }";
        styles +=
          "#edit-panel .segment .speed-limit .unit-label { font-size: " +
          ["", "12px", "11px"][compress] +
          "; line-height: " +
          ["", "2.0em", "1.8em"][compress] +
          "; margin-left: 0px;}";
        styles +=
          "#edit-panel .segment .speed-limit .average-speed-camera { margin-left: 40px; }";
        styles +=
          "#edit-panel .segment .speed-limit .average-speed-camera .camera-icon { vertical-align: top; }";
        styles +=
          "#edit-panel .segment .speed-limit .verify-buttons { margin-bottom: " +
          ["", "5px", "0px"][compress] +
          "; }";
        //more actions section
        styles +=
          "#edit-panel .more-actions { padding-top: " +
          ["", "6px", "2px"][compress] +
          "; }";
        styles +=
          "#edit-panel .more-actions .waze-btn.waze-btn-white { padding-left: 0px; padding-right: 0px; }";

        //additional attributes
        styles +=
          "#edit-panel .additional-attributes { margin-bottom: " +
          ["", "3px", "1px"][compress] +
          "; }";
        //history items
        styles +=
          ".toggleHistory { padding: " + ["", "7px", "3px"][compress] + "; }";
        styles +=
          ".element-history-item:not(:last-child) { margin-bottom: " +
          ["", "3px", "1px"][compress] +
          "; }";
        styles +=
          ".element-history-item .tx-header { padding: " +
          ["", "6px", "2px"][compress] +
          "; }";
        styles +=
          ".element-history-item .tx-header .tx-author-date { margin-bottom: " +
          ["", "3px", "1px"][compress] +
          "; }";
        styles +=
          ".element-history-item .tx-content { padding: " +
          ["", "7px 7px 7px 22px", "4px 4px 4px 22px"][compress] +
          "; }";
        styles +=
          ".loadMoreContainer { padding: " +
          ["", "5px 0px", "3px 0px"][compress] +
          "; }";
        //closures tab
        styles +=
          ".closures-tab wz-button { transform: scale(" +
          ["", "0.85", "0.7"][compress] +
          "); padding: 0px!important; }";
        styles +=
          ".closures > div:not(.closures-list) { padding: " +
          ["", "0px", "0px"][compress] +
          "; }";
        styles +=
          "body { --wz-text-input-height: " +
          ["", "30px", "20px"][compress] +
          "; }";
        styles +=
          "body { --wz-select-height: " +
          ["", "30px", "20px"][compress] +
          "; }";
        styles +=
          "input.wz-text-input { height: " +
          ["", "30px", "20px"][compress] +
          "; }";
        styles +=
          ".edit-closure .closure-nodes .closure-node-item .closure-node-control { padding: " +
          ["", "7px", "2px"][compress] +
          "; }";
        //closures list
        styles +=
          ".closures-list .add-closure-button { line-height: " +
          ["", "20px", "18px"][compress] +
          "; }";
        styles +=
          ".closures-list .closure-item:not(:last-child) { margin-bottom: " +
          ["", "6px", "2px"][compress] +
          "; }";
        styles +=
          ".closures-list .closure-item .details { padding: " +
          ["", "5px", "0px"][compress] +
          "; font-size: " +
          ["", "12px", "11px"][compress] +
          "; }";
        styles +=
          ".closures-list .closure-item .buttons { top: " +
          ["", "7px", "4px"][compress] +
          "; }";
        //tweak for Junction Box button
        styles += "#edit-panel .junction-actions > button { width: inherit; }";

        //PLACE DETAILS
        styles +=
          "#edit-panel .navigation-point-list { margin-bottom: " +
          ["", "4px", "0px"][compress] +
          "; }";
        //alert
        styles +=
          "#edit-panel .header-alert { margin-bottom: " +
          ["", "6px", "2px"][compress] +
          "; padding: " +
          ["", "6px 32px", "2px 32px"][compress] +
          "; }";
        //address input
        styles +=
          "#edit-panel .full-address { padding-top: " +
          ["", "4px", "1px"][compress] +
          "; padding-bottom: " +
          ["", "4px", "1px"][compress] +
          "; font-size: " +
          ["", "13px", "12px"][compress] +
          "; }";
        //alt names
        styles +=
          "#edit-panel .aliases-view .list li { margin: " +
          ["", "12px 0", "4px 0"][compress] +
          "; }";
        styles += "#edit-panel .aliases-view .delete { line-height: inherit; }";
        //categories
        styles +=
          "#edit-panel .categories .select2-search-choice .category { margin: " +
          ["", "2px 0 2px 4px", "1px 0 1px 3px"][compress] +
          "; height: " +
          ["", "18px", "15px"][compress] +
          "; line-height: " +
          ["", "18px", "15px"][compress] +
          "; }";
        styles +=
          "#edit-panel .categories .select2-search-field input { height: " +
          ["", "18px", "17px"][compress] +
          "; }";
        styles +=
          "#edit-panel .categories .select2-choices { min-height: " +
          ["", "26px", "19px"][compress] +
          "; }";
        styles +=
          "#edit-panel .categories .select2-container { margin-bottom: 0px; }";
        //entry/exit points
        styles +=
          "#edit-panel .navigation-point-view .navigation-point-list-item .preview { padding: " +
          ["", "3px 7px", "0px 4px"][compress] +
          "; font-size: " +
          ["", "13px", "12px"][compress] +
          "; }";
        styles +=
          "#edit-panel .navigation-point-view .add-button { height: " +
          ["", "28px", "18px"][contrast] +
          "; line-height: " +
          ["", "17px", "16px"][contrast] +
          "; font-size: " +
          ["", "13px", "12px"][compress] +
          "; }";
        //type buttons
        styles +=
          "#sidebar .area-btn, #sidebar .point-btn { display: flex; align-items: center; justify-content: center; height: " +
          ["", "22px", "20px"][compress] +
          "; line-height: " +
          ["", "19px", "16px"][compress] +
          "; font-size: " +
          ["", "13px", "12px"][compress] +
          "; }";
        styles +=
          "#sidebar .area-btn:before, #sidebar .point-btn:before { top: 0px; margin-right: 8px; }";
        //external providers
        styles +=
          ".select2-container { font-size: " +
          ["", "13px", "12px"][compress] +
          "; }";
        styles +=
          "#edit-panel .external-providers-view .external-provider-item { margin-bottom: " +
          ["", "6px", "2px"][compress] +
          "; }";
        styles +=
          ".external-providers-view > div > ul { margin-bottom: " +
          ["", "4px", "0px"][compress] +
          "; }";
        styles +=
          "#edit-panel .external-providers-view .add { padding: " +
          ["", "3px 12px", "1px 9px"][compress] +
          "; }";
        styles +=
          "#edit-panel .waze-btn.waze-btn-smaller { line-height: " +
          ["", "26px", "21px"][compress] +
          "; }";
        //residential toggle
        styles +=
          "#edit-panel .toggle-residential { height: " +
          ["", "27px", "22px"][compress] +
          "; }";
        //more info
        styles +=
          ".service-checkbox { font-size: " +
          ["", "13px", "12px"][compress] +
          "; }";

        //PARKING LOT SPECIFIC
        styles += ".parking-type-option{ display: inline-block; }";
        styles +=
          ".payment-checkbox { display: inline-block; min-width: " +
          ["", "48%", "31%"][compress] +
          "; }";
        styles +=
          ".service-checkbox { display: inline-block; min-width: 49%; font-size: " +
          ["", "12px", "11px"][compress] +
          "; }";
        styles += ".lot-checkbox { display: inline-block; min-width: 49%; }";

        //MAP COMMENTS
        styles +=
          "#sidebar .map-comment-name-editor { padding: " +
          ["", "10px", "5px"][compress] +
          "; }";
        styles +=
          "#sidebar .map-comment-name-editor .edit-button { margin-top: 0px; font-size: " +
          ["", "13px", "12px"][compress] +
          "; padding-top: " +
          ["", "3px", "1px"][compress] +
          "; }";
        styles +=
          "#sidebar .conversation-view .no-comments { padding: " +
          ["", "10px 15px", "5px 15px"][compress] +
          "; }";
        styles +=
          "#sidebar .map-comment-feature-editor .conversation-view .comment-list { padding-top: " +
          ["", "8px", "1px"][compress] +
          "; padding-bottom: " +
          ["", "8px", "1px"][compress] +
          "; }";
        styles +=
          "#sidebar .map-comment-feature-editor .conversation-view .comment-list .comment .comment-content { padding: " +
          ["", "6px 0px", "2px 0px"][compress] +
          "; }";
        styles +=
          "#sidebar .conversation-view .comment .text { padding: " +
          ["", "6px 9px", "3px 4px"][compress] +
          "; font-size: " +
          ["", "13px", "12px"][compress] +
          "; }";
        styles +=
          "#sidebar .conversation-view .new-comment-form { padding-top: " +
          ["", "10px", "5px"][compress] +
          "; }";
        styles +=
          "#sidebar .map-comment-feature-editor .clear-btn { height: " +
          ["", "26px", "19px"][compress] +
          "; line-height: " +
          ["", "26px", "19px"][compress] +
          "; }";
        //Compression for WME Speedhelper
        styles +=
          ".clearfix.controls.speed-limit { margin-top: " +
          ["", "-4px", "-8px"][compress] +
          "; }";
        //Compression for WME Clicksaver
        styles +=
          ".rth-btn-container { margin-bottom: " +
          ["", "2px", "-1px"][compress] +
          "; }";
        styles +=
          "#csRoutingTypeContainer { height: " +
          ["", "23px", "16px"][compress] +
          " !important; margin-top: " +
          ["", "-2px", "-4px"][compress] +
          "; }";
        styles +=
          "#csElevationButtonsContainer { margin-bottom: " +
          ["", "2px", "-1px"][compress] +
          " !important; }";
        //tweak for WME Clicksaver tab controls
        styles += "#sidepanel-clicksaver .controls-container { width: 100%; }";
        //tweak for JAI tab controls
        styles += "#sidepanel-ja .controls-container { width: 100%; }";
        //tweaks for UR-MP Tracker
        styles +=
          "#sidepanel-urt { margin-left: " +
          ["", "-5px", "0px"][compress] +
          " !important; }";
        styles +=
          "#urt-main-title { margin-top: " +
          ["", "-5px", "0px"][compress] +
          " !important; }";
        //tweaks for my own panel
        styles +=
          "#fuContent { line-height: " +
          ["", "10px", "9px"][compress] +
          " !important; }";

        // scripts panel
        styles += "#user-tabs { padding: 0px !important; }";
      }

      if (contrast > 0) {
        //contrast enhancements

        //general
        styles +=
          "#sidebar .form-group { border-top: 1px solid " +
          ["", "lightgrey", "grey"][contrast] +
          "; }";
        styles +=
          "#sidebar .text { color: " +
          ["", "darkslategrey", "black"][contrast] +
          "; }";
        styles += "#sidebar {background-color: #d6ebff; }";
        styles += ":root {--background_variant: #d0ffd0; }";

        //text colour
        styles += "#sidebar { color: black; }";
        //advanced tools section
        styles += "#sidebar waze-staff-tools { background-color: #c7c7c7; }";
        //Tabs
        styles +=
          "#sidebar .nav-tabs { " + GetBorderContrast(contrast, false) + "}";
        styles +=
          "#sidebar .nav-tabs li a { " +
          GetBorderContrast(contrast, true) +
          "}";
        //Fix the un-noticeable feed refresh button
        styles +=
          "span.fa.fa-repeat.feed-refresh.nav-tab-icon { width: 19px; color: orangered; }";
        styles +=
          "span.fa.fa-repeat.feed-refresh.nav-tab-icon:hover { color: red; font-weight: bold; font-size: 15px; }";
        //Feed
        styles += ".feed-item { " + GetBorderContrast(contrast, false) + "}";
        styles +=
          ".feed-issue .content .title .type { color: " +
          ["", "black", "black"][contrast] +
          "; font-weight: bold; }";
        styles +=
          ".feed-issue .content .timestamp { color: " +
          ["", "darkslategrey", "black"][contrast] +
          "; }";
        styles +=
          ".feed-issue .content .subtext { color: " +
          ["", "darkslategrey", "black"][contrast] +
          "; }";
        styles += ".feed-item .motivation { font-weight: bold; }";
        //Drives & Areas
        styles +=
          "#sidebar .result-list .result { " +
          GetBorderContrast(contrast, false) +
          "}";
        //Segment edit panel
        styles += "#edit-panel .selection { font-size: 13px; }";
        styles +=
          "#edit-panel .segment .direction-message { color: orangered; }";
        styles +=
          "#edit-panel .address-edit-input { color: black; " +
          GetBorderContrast(contrast, false) +
          "}";
        styles +=
          "#sidebar .form-control { " +
          GetBorderContrast(contrast, false) +
          "}";
        //radio buttons when disabled
        styles +=
          '.waze-radio-container input[type="radio"]:disabled:checked + label { color: black; opacity: 0.7; font-weight:600; }';
        //override border for lock levels
        styles +=
          "#sidebar .waze-radio-container { border: 0 none !important; }";
        styles +=
          "#edit-panel .waze-btn { color: black; " +
          GetBorderContrast(contrast, false) +
          "}";
        styles +=
          ".waze-radio-container label  { " +
          GetBorderContrast(contrast, false) +
          "}";
        //history items
        styles += ".toggleHistory { color: black; text-align: center; }";
        styles += ".element-history-item .tx-header { color: black; }";
        styles +=
          ".element-history-item .tx-header a { color: " +
          ["", "royalblue", "black"][contrast] +
          "!important; }";
        styles +=
          ".element-history-item.closed .tx-header { border-radius: 8px; " +
          GetBorderContrast(contrast, false) +
          "}";
        styles +=
          ".loadMoreHistory { " + GetBorderContrast(contrast, false) + "}";
        //closures list
        styles +=
          ".closures-list .closure-item .details { border-radius: 8px; " +
          GetBorderContrast(contrast, false) +
          "}";
        styles += ".closures-list .closure-item .dates { color: black; }";
        styles +=
          ".closures-list .closure-item .dates .date-label { opacity: 1; }";
        //Place details
        //alert
        styles += "#edit-panel .alert-danger { color: red; }";
        //address input
        styles +=
          "#edit-panel .full-address { color: black; " +
          GetBorderContrast(contrast, false) +
          "}";
        styles += "#edit-panel a.waze-link { font-weight: bold; }";
        //the almost invisible alternate name link
        styles +=
          "#edit-panel .add.waze-link { color: " +
          ["", "royalblue", "black"][contrast] +
          "!important; }";
        //categories
        styles +=
          "#edit-panel .categories .select2-search-choice .category { text-transform: inherit; font-weight: bold; background: gray; }";
        //entry/exit points
        styles +=
          "#edit-panel .navigation-point-view .navigation-point-list-item .preview { " +
          GetBorderContrast(contrast, false) +
          "}";
        styles +=
          "#edit-panel .navigation-point-view .add-button { " +
          GetBorderContrast(contrast, false) +
          " margin-top: 2px; padding: 0 5px; color: " +
          ["", "royalblue", "black"][contrast] +
          "!important; }";
        //type buttons
        styles +=
          "#sidebar .point-btn { color: black; " +
          GetBorderContrast(contrast, true) +
          "}";
        //external providers
        styles +=
          ".select2-container { color: teal; " +
          GetBorderContrast(contrast, true) +
          "}";
        styles += ".select2-container .select2-choice { color: black; }";
        //residential toggle
        styles += "#edit-panel .toggle-residential { font-weight: bold; }";
        //COMMENTS
        styles +=
          ".map-comment-name-editor { border-color: " +
          ["", "darkgrey", "grey"][contrast] +
          "; }";
      }
      //fix for buttons of WME Image Overlay script
      styles +=
        "#sidepanel-imageoverlays > div.result-list button { height: 24px; }";
      addStyle(PREFIX + fname, styles);
    } else {
      removeStyle(PREFIX + fname);
      removeStyle(PREFIX + "hideHeadlights");
    }

    restyleDropDownEntries();
  }
  function restyleDropDownEntries() {
    let compress = getById("_inpUICompression").value;
    let enabled = getById("_cbCompressSegmentTab").checked;
    if (enabled === true && compress > 0) {
      compressDropDownEntries();
    } else {
      uncompressDropDownEntries();
    }
  }
  function compressDropDownEntries() {
    let n = document.querySelectorAll("wz-option").length;
    while (n) {
      let obj = document.querySelectorAll("wz-option")[n - 1];
      if (obj != undefined) {
        let mi = obj.shadowRoot.querySelector(".wz-menu-item");
        if (mi != null) {
          mi.style.lineHeight = "130%";
          mi.style.height = "100%";
        }
      }
      --n;
    }
  }
  function uncompressDropDownEntries() {
    let n = document.querySelectorAll("wz-option").length;
    while (n) {
      let obj = document.querySelectorAll("wz-option")[n - 1];
      if (obj != undefined) {
        let mi = obj.shadowRoot.querySelector(".wz-menu-item");
        if (mi != null) {
          mi.style.lineHeight =
            "var(--wz-menu-option-height, var(--wz-option-height, 40px));";
          mi.style.height =
            "var(--wz-menu-option-height, var(--wz-option-height, 40px))";
        }
      }
      --n;
    }
  }
  function hideUnuseableStuff() {
    if (W?.model?.getTopCountry === undefined) {
      // getTopCountry takes a short while to become available, so keep checking at regular
      // intervals until it's there to be used...
      setTimeout(hideUnuseableStuff, 100);
    } else {
      let fname = "hideUnuseableStuff";
      let styles = "";

      // Hide the headlights reminder checkbox for segments in countries that don't use it
      if (W?.model?.getTopCountry()?.allowHeadlightsReminderRank === null) {
        styles += ".headlights-reminder { display: none !important; }";
      }

      // Hide the restricted areas toolbar button for anyone who can't make use of it
      if (
        document.querySelector("wz-button.restricted-driving-area").disabled ===
        true
      ) {
        styles +=
          "wz-button.restricted-driving-area { display: none !important; }";
      }

      if (styles !== "") {
        addStyle(PREFIX + fname, styles);
      }
    }
  }
  function compressLayersMenu() {
    let fname = "compressLayersMenu";
    removeStyle(PREFIX + fname);
    let styles = "";
    if (getById("_cbCompressLayersMenu").checked) {
      getById("layersColControls").style.opacity = "1";
      let contrast = getById("_inpUIContrast").value;
      let compress = getById("_inpUICompression").value;
      if (compress > 0) {
        //VERTICAL CHANGES
        //change menu to autoheight - not working
        // styles += '.layer-switcher .menu { height: auto; width: auto; max-height: calc(100% - 26px); overflow-y: scroll }';
        //change menu to auto-width
        styles += ".layer-switcher .menu { width: auto }";
        styles += ".layer-switcher .menu.hide-layer-switcher { left: 100% }";
        //menu title
        styles +=
          ".layer-switcher .menu > .title { font-size: " +
          ["", "14px", "12px"][compress] +
          "; padding-bottom: " +
          ["", "7px", "2px"][compress] +
          "; padding-top: " +
          ["", "7px", "2px"][compress] +
          " }";
        styles +=
          ".layer-switcher .menu > .title .w-icon-x { font-size: " +
          ["", "21px", "18px"][compress] +
          " }";
        styles +=
          ".layer-switcher .scrollable { height: calc(100% - " +
          ["", "39px", "29px"][compress] +
          ") }";
        //menu group headers
        styles +=
          ".layer-switcher .layer-switcher-toggler-tree-category { padding: " +
          ["", "5px", "2px"][compress] +
          " 0; height: " +
          ["", "30px", "20px"][compress] +
          " }";
        //menu items
        styles +=
          ".layer-switcher li { line-height: " +
          ["", "20px", "16px"][compress] +
          "}";
        styles +=
          ".layer-switcher .togglers ul li .wz-checkbox { margin-bottom: " +
          ["", "3px", "0px"][compress] +
          " }";
        styles +=
          ".wz-checkbox { min-height: " + ["", "20px", "16px"][compress] + " }";
        styles +=
          '.wz-checkbox input[type="checkbox"] + label { line-height: ' +
          ["", "20px", "16px"][compress] +
          "; font-size: " +
          ["", "12px", "11px"][compress] +
          " }";
        styles +=
          '.wz-checkbox input[type="checkbox"] + label:before { font-size: ' +
          ["", "13px", "10px"][compress] +
          "; height: " +
          ["", "16px", "14px"][compress] +
          "; width: " +
          ["", "16px", "14px"][compress] +
          "; line-height: " +
          ["", "12px", "11px"][compress] +
          " }";
        //HORIZONTAL CHANGES
        styles +=
          ".layer-switcher .togglers ul { padding-left: " +
          ["", "19px", "12px"][compress] +
          "; }";
        styles +=
          ".layer-switcher .togglers .group { padding: " +
          ["", "0 8px 0 4px", "0 4px 0 2px"][compress] +
          " }";
        if (getById("_cbLayersColumns").checked) {
          //2 column stuff
          styles += ".layer-switcher .scrollable { columns: 2; }";
          styles +=
            "li.group { break-inside: avoid; page-break-inside: avoid; }";
          //prevent city names showing up when it should be hidden
          styles +=
            ' .layer-switcher ul[class^="collapsible"].collapse-layer-switcher-group { visibility: collapse }';
          styles +=
            ".layer-switcher .menu { overflow-x: hidden; overflow-y: scroll; height: auto; max-height: calc(100% - " +
            ["", "39px", "29px"][compress] +
            ") }";
          styles +=
            ".layer-switcher .scrollable { overflow-x: hidden; overflow-y: hidden; height: unset }";
        }
        // fix from ABelter for layers menu
        styles +=
          ' .layer-switcher ul[class^="collapsible"] { max-height: none; }';
      } else {
        //2-columns not available without compression
        getById("layersColControls").style.opacity = "0.5";
      }
      if (contrast > 0) {
        styles +=
          ".controls-container.main.toggler { color: white; background: dimgray }";
        styles +=
          ".layer-switcher .toggler.main .label-text { text-transform: inherit }";
        //labels
        styles +=
          ".layer-switcher .layer-switcher-toggler-tree-category > .label-text { color: black }";
        styles +=
          '.wz-checkbox input[type="checkbox"] + label { WME: FU; color: black }';
        //group separator
        styles +=
          ".layer-switcher .togglers .group { border-bottom: 1px solid " +
          ["", "lightgrey", "grey"][contrast] +
          " }";
        //column rule
        styles +=
          ".layer-switcher .scrollable { column-rule: 1px solid " +
          ["", "lightgrey", "grey"][contrast] +
          " }";
      }
      if (getById("_cbLayersMenuMoreOptions").checked === true) {
        styles +=
          '.layer-switcher ul[class^="collapsible"].collapse-layer-switcher-group { visibility: inherit; max-height: inherit }';
        styles +=
          ".layer-switcher i.toggle-category { visibility: hidden; width: 0 }";
      }
      addStyle(PREFIX + fname, styles);
    } else {
      getById("layersColControls").style.opacity = "0.5";
      removeStyle(PREFIX + fname);
    }
  }
  function changePassVisibility() {
    ReportObserver.disconnect();
    let panelContainer = document.querySelector("#panel-container");
    let passes = panelContainer.querySelectorAll(".activeHovSubscriptions");
    let pDisp = "none";
    if (panelContainer.querySelector("#_cbCollapsePasses").checked === false) {
      pDisp = "";
    }
    for (let i = 0; i < passes.length; ++i) {
      passes[i].style.display = pDisp;
    }
    ReportObserver.observe(document.querySelector("#panel-container"), {
      childList: true,
      subtree: true,
    });
  }
  var ReportObserver = new MutationObserver(function (mutations) {
    AddCollapsiblePasses();
  });
  function AddCollapsiblePasses() {
    let panelContainer = document.querySelector("#panel-container");
    if (panelContainer.getBoundingClientRect().width > 0) {
      let passes = panelContainer.querySelectorAll(".activeHovSubscriptions");
      if (passes.length > 0) {
        if (panelContainer.querySelector("#_cbCollapsePasses") == null) {
          ReportObserver.disconnect();
          let upHeader = panelContainer
            .querySelector(".reporter-preferences")
            .querySelector(".title");
          upHeader.innerHTML +=
            " | Hide passes (" +
            passes.length +
            ') <input type="checkbox" id="_cbCollapsePasses" checked/>';
          document
            .getElementById("_cbCollapsePasses")
            .addEventListener("click", changePassVisibility, true);
          changePassVisibility();
        }
      }
    }
  }
  function restyleReports() {
    let fname = "restyleReports";
    let styles = "";
    if (getById("_cbRestyleReports").checked) {
      let contrast = getById("_inpUIContrast").value;
      let compress = getById("_inpUICompression").value;

      // Stops Reject/Approve buttons being partially/completely cut off...
      styles += ".place-update-edit .place-update { max-height: 100%; }";

      if (compress > 0) {
        //report header
        // Remove title text - we know what the panel contains, because we've asked WME to open it...
        styles += "#panel-container .main-title { display: none!important; }";
        styles +=
          "#panel-container .issue-panel-header { padding: " +
          ["", "9px 36px", "1px 36px"][compress] +
          "; line-height: " +
          ["", "19px", "17px"][compress] +
          "; }";
        styles +=
          "#panel-container .issue-panel-header .dot { top: " +
          ["", "15px", "7px"][compress] +
          "; }";
        //special treatment for More Information checkboxes (with legends)
        styles +=
          "#panel-container .problem-edit .more-info .legend { left: 20px; top: 3px; }";
        styles +=
          '#panel-container .more-info input[type="checkbox"] + label { padding-left: 33px !important; }';
        // User preferences section
        styles +=
          "#panel-container .preferences-container { gap: 0px !important; }";
        //report body
        styles +=
          "#panel-container .body { line-height: " +
          ["", "15px", "13px"][compress] +
          "; font-size: " +
          ["", "13px", "12px"][compress] +
          "; }";
        //problem description
        styles +=
          "#panel-container .collapsible { padding: " +
          ["", "9px", "3px"][compress] +
          "; }";

        //comments
        ////styles += '#panel-container .conversation-view .comment .comment-content { padding: ' + ['','6px 9px','2px 3px'][compress] + '; }';
        styles +=
          "#panel-container .comment .text { padding: " +
          ["", "7px 9px", "4px 4px"][compress] +
          "; }";
        // Remove padding around comment boxes
        styles += "#panel-container wz-list { padding: 0px!important; }";
        ////styles += '#panel-container .wz-list-item .list-item-wrapper { padding-bottom: 0px!important; padding-top: 0px!important; }';
        //new comment entry
        styles +=
          "#panel-container .conversation-view .new-comment-form { padding: " +
          ["", "8px 9px 6px 9px", "1px 3px 2px 3px"][compress] +
          "; }";
        //send button
        styles +=
          "#panel-container .conversation-view .send-button { padding: " +
          ["", "4px 16px", "2px 12px"][compress] +
          "; box-shadow: " +
          ["", "3px 3px 4px 0 #def7ff", "3px 2px 4px 0 #def7ff"][compress] +
          "; }";
        //lower buttons
        styles +=
          "#panel-container > div > div > div.actions > div > div { padding-top: " +
          ["", "6px", "3px"][compress] +
          "; }";
        styles +=
          "#panel-container .close-details.section { font-size: " +
          ["", "13px", "12px"][compress] +
          "; line-height: " +
          ["", "13px", "9px"][compress] +
          "; }";
        styles +=
          "#panel-container .problem-edit .actions .controls-container label { height: " +
          ["", "28px", "21px"][compress] +
          "; line-height: " +
          ["", "28px", "21px"][compress] +
          "; margin-bottom: " +
          ["", "5px", "2px"][compress] +
          "; }";
        styles +=
          "#panel-container .waze-plain-btn { height: " +
          ["", "30px", "20px"][compress] +
          "; line-height: " +
          ["", "30px", "20px"][compress] +
          "; }";
        styles +=
          ".panel .navigation { margin-top: " +
          ["", "6px", "2px"][compress] +
          "; }";
        //WMEFP All PM button
        styles +=
          "#WMEFP-UR-ALLPM { top: " +
          ["", "5px", "0px"][compress] +
          " !important; }";
      }
      if (contrast > 0) {
        styles +=
          "#panel-container .section { border-bottom: 1px solid " +
          ["", "lightgrey", "grey"][contrast] +
          "; }";
        styles +=
          "#panel-container .close-panel { border-color: " +
          ["", "lightgrey", "grey"][contrast] +
          "; }";
        styles += "#panel-container .main-title { font-weight: 900; }";
        styles +=
          "#panel-container .reported { color: " +
          ["", "darkslategrey", "black"][contrast] +
          "; }";
        styles +=
          "#panel-container .date { color: " +
          ["", "#6d6d6d", "#3d3d3d"][contrast] +
          "; }";
        styles +=
          "#panel-container .comment .text { " +
          GetBorderContrast(contrast, false) +
          "}";
        styles +=
          "#panel-container .comment-content.reporter .username { color: " +
          ["", "#159dc6", "#107998"][contrast] +
          "; }";
        styles +=
          "#panel-container .conversation-view .new-comment-form textarea { " +
          GetBorderContrast(contrast, false) +
          "}";
        styles +=
          "#panel-container .top-section { border-bottom: 1px solid " +
          ["", "lightgrey", "grey"][contrast] +
          "; }";
        styles +=
          "#panel-container .waze-plain-btn { font-weight: 800; color: " +
          ["", "#159dc6", "#107998"][contrast] +
          "; }";
      }
      addStyle(PREFIX + fname, styles);
      if (wmeFUinitialising) {
        setTimeout(draggablePanel, 5000);
      } else {
        draggablePanel();
      }

      ReportObserver.observe(document.querySelector("#panel-container"), {
        childList: true,
        subtree: true,
      });
      AddCollapsiblePasses();
    } else {
      removeStyle(PREFIX + fname);
      if (jQuery.ui) {
        if ($("#panel-container").hasClass("ui-draggable")) {
          $("#panel-container").draggable("destroy");
        }
        getById("panel-container").style = "";
      }
      ReportObserver.disconnect();
    }
    window.dispatchEvent(new Event("resize"));
  }
  function draggablePanel() {
    if (jQuery.ui) {
      if ($("#panel-container").draggable) {
        $("#panel-container").draggable({ handle: ".header" });
      }
    }
  }
  function enhanceChat() {
    let fname = "enhanceChat";
    let styles = "";
    if (getById("_cbEnhanceChat").checked) {
      removeStyle(PREFIX + fname);
      let contrast = getById("_inpUIContrast").value;
      let compress = getById("_inpUICompression").value;
      let mapY = getById("map").clientHeight;
      let chatY = Math.floor(mapY * 0.5);
      let chatHeaderY = [50, 35, 20][compress];
      let chatMessageInputY = [39, 31, 23][compress];
      let chatMessagesY = chatY - chatHeaderY - chatMessageInputY;
      let chatUsersY = chatY - chatHeaderY;
      //change chat width to 35% of whole window
      styles += "#chat .messages { width: calc(25vw); min-width: 200px;}";
      styles += "#map.street-view-mode #chat .messages { width: calc(25vw); }";
      styles += "#chat .messages .message-list { margin-bottom: 0px; }";
      styles +=
        "#chat .messages .new-message { position: inherit; width: unset; }";
      styles +=
        "#map.street-view-mode #chat .messages .new-message { position: inherit; width: unset; }";
      styles += "#chat .users { width: calc(10vw); min-width: 120px; }";
      styles +=
        "#chat .messages .message-list .message.normal-message { max-width: unset; }";
      //change chat height to 50% of map view
      styles +=
        "#chat .messages .message-list { min-height: " +
        chatMessagesY +
        "px; }";
      styles += "#chat .users { max-height: " + chatUsersY + "px; }";

      //		#chat .messages .unread-messages-notification width=70%, bottom64px>
      if (compress > 0) {
        //do compression
        //header
        styles += "#chat .header { line-height: " + chatHeaderY + "px; }";

        styles +=
          "#chat .header .dropdown .dropdown-toggle { line-height: " +
          ["", "30px", "22px"][compress] +
          "; }";
        styles +=
          "#chat .header button { line-height: " +
          ["", "20px", "19px"][compress] +
          "; font-size: " +
          ["", "13px", "11px"][compress] +
          "; height: " +
          ["", "20px", "19px"][compress] +
          "; }";
        //message list
        styles +=
          "#chat .messages .message-list { padding: " +
          ["", "9px", "3px"][compress] +
          "; }";
        styles +=
          "#chat .messages .message-list .message.normal-message { padding: " +
          ["", "6px", "2px"][compress] +
          "; }";
        styles +=
          "#chat .messages .message-list .message { margin-bottom: " +
          ["", "8px", "2px"][compress] +
          "; line-height: " +
          ["", "16px", "14px"][compress] +
          "; font-size: " +
          ["", "12px", "11px"][compress] +
          "; }";
        styles +=
          "#chat .messages .new-message input { height: " +
          chatMessageInputY +
          "px; }";
        //user list
        styles +=
          "#chat .users { padding: " + ["", "8px", "1px"][compress] + "; }";
        styles +=
          "#chat ul.user-list a.user { padding: " +
          ["", "2px", "1px"][compress] +
          "; }";
        styles +=
          "#chat ul.user-list a.user .rank { width: " +
          ["", "25px", "20px"][compress] +
          "; height: " +
          ["", "20px", "16px"][compress] +
          "; margin-right: " +
          ["", "3px", "1px"][compress] +
          "; }";
        styles +=
          "#chat ul.user-list a.user .username { line-height: " +
          ["", "21px", "17px"][compress] +
          "; }";
        styles +=
          "#chat ul.user-list a.user:hover .crosshair { margin-top: " +
          ["", "3px", "1px"][compress] +
          "; right: " +
          ["", "3px", "1px"][compress] +
          "; }";
        //fix for WME Chat Addon
        styles += "#chat .users > ul > li > a { margin: 0px !important; }";
      }
      if (contrast > 0) {
        //header
        styles +=
          "#chat .header { color: black; background-color: " +
          ["", "#d9d9d9", "#bfbfbf"][contrast] +
          "; }";
        styles +=
          "#chat .messages .message-list { background-color: " +
          ["", "#e8e8e8", "lightgrey"][contrast] +
          "; }";
        styles +=
          "#chat .messages .message-list .message.normal-message { color: black; float: left; }";
        styles +=
          "#chat .messages .message-list .message.normal-message .from { color: darkslategrey; font-weight: bold; font-style: italic; }";
        styles +=
          "#chat .messages .message-list .message.own-message .from { color: black; background-color: #a1dcf5; }";
        //user message timestamps
        styles +=
          "#chat > div.chat-body > div.messages > div.message-list > div > div.from > span { color: " +
          ["", "darkslategrey", "black"][contrast] +
          " !important; }";
        //system message timestamps
        styles +=
          "#chat > div.chat-body > div.messages > div.message-list > div > div.body > div > span { color: " +
          ["", "darkslategrey", "black"][contrast] +
          " !important; }";
        //fix for WME Chat Addon
        styles += "#chat .body > div { color: black !important; }";
      }
      //fix for Chat Addon timestamps running up against names
      styles +=
        "#chat > div.chat-body > div.messages > div.message-list > div > div.from > span { margin-left: 5px; }";
      addStyle(PREFIX + fname, styles);
    } else {
      removeStyle(PREFIX + fname);
    }
  }
  function narrowSidePanel() {
    let fname = "narrowSidePanel";
    let styles = "";
    if (getById("_cbNarrowSidePanel").checked) {
      //sidebar width
      styles += ".row-fluid #sidebar { width: 250px; }";
      //map width
      styles += ".show-sidebar .row-fluid .fluid-fixed { margin-left: 250px; }";
      //user info tweaks
      styles += "#sidebar #user-info #user-box { padding: 0 0 5px 0; }";
      styles += "#sidebar #user-details { width: 250px; }";
      styles +=
        "#sidebar #user-details .user-profile .level-icon { margin: 0; }";
      styles +=
        "#sidebar #user-details .user-profile .user-about { max-width: 161px; }";
      //gradient bars
      styles += "#sidebar .tab-scroll-gradient { width: 220px; }";
      styles += "#sidebar #links:before { width: 236px; }";
      //feed
      styles += ".feed-item .content { max-width: 189px; }";
      //segment edit panel
      styles +=
        "#edit-panel .more-actions .waze-btn.waze-btn-white { width: 122px; }";
      //tweak for WME Bookmarks
      styles += "#divBookmarksContent .divName { max-width: 164px; }";
      //tweak for WME PH buttons
      styles +=
        "#WMEPH_runButton .btn { font-size: 11px; padding: 2px !important; }";
      addStyle(PREFIX + fname, styles);
    } else {
      removeStyle(PREFIX + fname);
    }
    compressSegmentTab();
    window.dispatchEvent(new Event("resize"));
  }
  function shiftAerials() {
    let siLayerNames = [
      "satellite_imagery",
      "merged_collection_by_latest_no_candid",
      "merged_collection_by_quality_no_candid",
      "satellite_pleiades_ortho_rgb",
      "satellite_worldview2_ortho_rgb",
      "satellite_worldview3_ortho_rgb",
      "satellite_geoeye1_ortho_rgb",
      "satellite_skysat_ortho_rgb",
      "satellite_pneo_ortho_rgb",
    ];

    // calculate meters/pixel for current map view, taking into account how the
    // map projection stretches things out the further from the equator you get
    let metersPerPixel = W.map.getResolution();
    let mapCentre = new OpenLayers.LonLat();
    mapCentre.lon = W.map.getCenter().lon;
    mapCentre.lat = W.map.getCenter().lat;
    mapCentre.transform(
      new OpenLayers.Projection("EPSG:900913"),
      new OpenLayers.Projection("EPSG:4326")
    );
    let latAdj = Math.cos((mapCentre.lat * Math.PI) / 180);
    metersPerPixel *= latAdj;

    if (metersPerPixel == 0) {
      metersPerPixel = 0.001;
    }

    let sLeft = Math.round(getById("_inpASX").value / metersPerPixel) + "px";
    let sTop = Math.round(-getById("_inpASY").value / metersPerPixel) + "px";

    if (getById("_inpASO").value < 10) getById("_inpASO").value = 10;
    let sOpa = getById("_inpASO").value / 100;

    let sLeftO = Math.round(getById("_inpASXO").value / metersPerPixel) + "px";
    let sTopO = Math.round(-getById("_inpASYO").value / metersPerPixel) + "px";

    if (getById("_inpASOO").value < 10) getById("_inpASOO").value = 10;
    let sOpaO = getById("_inpASOO").value / 100;

    if (
      getById("_inpASX").value != 0 ||
      getById("_inpASY").value != 0 ||
      getById("_inpASXO").value != 0 ||
      getById("_inpASYO").value != 0
    ) {
      getById("WMEFU_AS").style.display = "block";
    } else {
      getById("WMEFU_AS").style.display = "none";
    }

    // Apply the shift and opacity to all available imagery layers
    for (let i = 0; i < siLayerNames.length; ++i) {
      let siLayer = W.map.getLayersByName(siLayerNames[i]);
      if (siLayer.length == 1) {
        let siDiv = siLayer[0].div;
        if (i === 0) {
          // Standard layer
          siDiv.style.left = sLeft;
          siDiv.style.top = sTop;
          siDiv.style.opacity = sOpa;
        } else {
          // Additional layers
          siDiv.style.left = sLeftO;
          siDiv.style.top = sTopO;
          siDiv.style.opacity = sOpaO;
        }
      }
    }

    //turn off Enhance Chat if WME Chat Fix is loaded
    if (document.getElementById("WMEfixChat-setting")) {
      if (getById("_cbEnhanceChat").checked === true) {
        alert(
          "WME FixUI: Enhance Chat disabled because WME Chat UI Fix detected"
        );
      }
      getById("_cbEnhanceChat").checked = false;
    }
  }
  function ApplyArrowFix(aObj) {
    if (aObj.touchedByFUME === undefined) {
      let rStr = aObj.style.transform;
      let rFloat = 0;
      if (rStr.indexOf("deg") != -1) {
        rFloat = parseFloat(rStr.split("(")[1].split("deg")[0]);
      }
      rFloat += 180.0;
      aObj.style.transform = "rotate(" + rFloat + "deg) scaleX(-1)";
      aObj.touchedByFUME = true;
    }
  }
  function RTCArrowsFix() {
    if (W.model.isLeftHand === true) {
      let rtcDiv = W.map.closuresMarkerLayer.div;
      let fLen = rtcDiv.querySelectorAll(".forward").length;
      while (fLen) {
        ApplyArrowFix(rtcDiv.querySelectorAll(".forward")[fLen - 1]);
        --fLen;
      }
      let rLen = rtcDiv.querySelectorAll(".backward").length;
      while (rLen) {
        ApplyArrowFix(rtcDiv.querySelectorAll(".backward")[rLen - 1]);
        --rLen;
      }
    }
  }
  var RTCMarkerObserver = new MutationObserver(function (mutations) {
    RTCArrowsFix();
  });
  function warnCommentsOff() {
    let fname = "warnCommentsOff";
    if (W.map.getLayerByUniqueName("mapComments").visibility === false) {
      removeStyle(PREFIX + fname);
      addStyle(PREFIX + fname, "#app-head { --background_default: #FFC107 ; }");
    } else {
      removeStyle(PREFIX + fname);
    }
    // extra bit because killNodeLayer will be inactive
    getById("_btnKillNode").style.backgroundColor = "";
  }
  function adjustGSV() {
    let fname = "adjustGSV";
    let styles = "";
    let C = getById("_inpGSVContrast");
    let B = getById("_inpGSVBrightness");
    let I = getById("_cbGSVInvert");
    if (C.value < 10) C.value = 10;
    if (B.value < 10) B.value = 10;
    styles += ".gm-style { filter: contrast(" + C.value + "%) ";
    styles += "brightness(" + B.value + "%) ";
    if (I.checked) {
      styles += "invert(1); }";
    } else {
      styles += "invert(0); }";
    }
    removeStyle(PREFIX + fname);
    if (C.value != 100 || B.value != 100 || I.checked)
      addStyle(PREFIX + fname, styles);
  }
  function GSVWidth() {
    let fname = "GSVWidth";
    removeStyle(PREFIX + fname);
    let w = getById("_inpGSVWidth").value;
    if (w != 50) {
      let styles = "";
      styles +=
        "#editor-container #map.street-view-mode #waze-map-container { width: " +
        (100 - w) +
        "%; }";
      styles +=
        "#editor-container #street-view-container { width: " + w + "%; }";
      styles +=
        "#editor-container #map #street-view-drag-handle { left: " +
        (100 - w) +
        "%; }";
      addStyle(PREFIX + fname, styles);
    }
    window.dispatchEvent(new Event("resize"));
  }
  function GSVWidthReset() {
    getById("waze-map-container").style = null;
    getById("street-view-container").style = null;
    getById("street-view-drag-handle").style = null;
    // Check for WME Street View Availability
    // This can be removed soon - WME SVA no longer remembers GSV width
    if (localStorage.WMEStreetViewWidth) {
      localStorage.WMEStreetViewWidth = "";
    }
    window.dispatchEvent(new Event("resize"));
  }
  function moveChatIcon() {
    let fname = "moveChatIcon";
    let styles = "";
    if (getById("_cbMoveChatIcon").checked) {
      styles +=
        "#chat-overlay { left: inherit !important; right: 60px !important;}";
      styles += "#chat-overlay #chat-toggle { right: 0px !important; }";
      addStyle(PREFIX + fname, styles);
    } else {
      removeStyle(PREFIX + fname);
    }
  }
  function highlightInvisible() {
    let fname = "highlightInvisible";
    let styles = "";
    if (getById("_cbHighlightInvisible").checked) {
      styles +=
        "#chat-overlay.visible-false #chat-toggle button { filter: none; background-color: #ff0000c0; }";
      addStyle(PREFIX + fname, styles);
    } else {
      removeStyle(PREFIX + fname);
    }
  }
  function darkenSaveLayer() {
    let fname = "darkenSaveLayer";
    let styles = "";
    if (getById("_cbDarkenSaveLayer").checked) {
      styles += "#popup-overlay { background-color: dimgrey !important; }";
      addStyle(PREFIX + fname, styles);
    } else {
      removeStyle(PREFIX + fname);
    }
  }
  function swapRoadsGPS() {
    let fname = "swapRoadsGPS";
    let styles = "";
    if (getById("_cbSwapRoadsGPS").checked) {
      var rlName = "roads";
      var glName = "gps_points";
      var roadLayerId = W.map.getLayerByUniqueName(rlName).id;
      var GPSLayerId = W.map.getLayerByUniqueName(glName).id;
      var roadLayerZ = W.map.getLayerByUniqueName(rlName).getZIndex();
      var GPSLayerZ = W.map.getLayerByUniqueName(glName).getZIndex();
      logit(
        "Layers identified\n\tRoads: " +
          roadLayerId +
          "," +
          roadLayerZ +
          "\n\tGPS: " +
          GPSLayerId +
          "," +
          GPSLayerZ,
        "info"
      );
      styles +=
        "#" +
        roadLayerId.replace(/\./g, "\\2e") +
        " { z-index: " +
        GPSLayerZ +
        " !important; }";
      styles +=
        "#" +
        GPSLayerId.replace(/\./g, "\\2e") +
        " { z-index: " +
        roadLayerZ +
        " !important; }";
      addStyle(PREFIX + fname, styles);
    } else {
      removeStyle(PREFIX + fname);
    }
  }
  function killNode() {
    getById(W.map.getLayerByUniqueName("nodes").id + "_root").style.display =
      "none";
    getById("_btnKillNode").style.backgroundColor = "yellow";
  }
  function toggleKillTurnPopup() {
    let fname = "toggleKillTurnPopup";
    if (killTurnPopup === true) {
      getById("WMEFUTPB").style.backgroundColor = "inherit";
      killTurnPopup = false;
      removeStyle(PREFIX + fname);
    } else {
      getById("WMEFUTPB").style.backgroundColor = "red";
      killTurnPopup = true;
      addStyle(
        PREFIX + fname,
        'div[data-theme*="map-tooltip"] { display: none !important; }'
      );
    }
  }
  function showMapBlockers() {
    let fname = "showMapBlockers";
    let styles = "";
    if (getById("_cbShowMapBlockers").checked) {
      styles += ".street-view-layer { background-color: rgba(255,0,0,0.3); }";
      styles +=
        ".overlay-buttons-container.top { background-color: rgba(255,0,0,0.3); }";
      styles +=
        ".overlay-buttons-container.bottom { background-color: rgba(255,0,0,0.3); }";
      styles +=
        "#street-view-drag-handle { background-color: rgba(255,0,0,0.3); }";
      addStyle(PREFIX + fname, styles);
      fixNodeClosureIcons();
    } else {
      removeStyle(PREFIX + fname);
    }
  }
  function fixNodeClosureIcons() {
    var closureNodesId = W.map.getLayerByUniqueName("closure_nodes").id;
    var SVPinId = W.map.getLayersByName("streetViewPin")[0].id;
    addGlobalStyle("div#" + closureNodesId + " { z-index: 725 !important }");
    insertNodeBeforeNode(getById(closureNodesId), getById(SVPinId));
  }
  function disableBridgeButton() {
    let fname = "disableBridgeButton";
    let styles = "";
    if (getById("_cbDisableBridgeButton").checked) {
      styles += ".add-bridge { pointer-events: none; opacity: 0.4; }";
      addStyle(PREFIX + fname, styles);
    } else {
      removeStyle(PREFIX + fname);
    }
  }
  function disablePathButton() {
    let fname = "disablePathButton";
    let styles = "";
    if (getById("_cbDisablePathButton").checked) {
      styles += ".path-icon { pointer-events: none; opacity: 0.4; }";
      addStyle(PREFIX + fname, styles);
    } else {
      removeStyle(PREFIX + fname);
    }
  }
  function disableKinetic() {
    if (getById("_cbDisableKinetic").checked) {
      W.map.controls.find((control) => control.dragPan).dragPan.kinetic = null;
    } else {
      W.map.controls.find((control) => control.dragPan).dragPan.kinetic =
        kineticDragParams;
    }
  }
  function disableAnimatedZoom() {
    if (getById("_cbDisableZoomAnimation").checked) {
      W.map.segmentLayer.map.zoomDuration = 0;
    } else {
      W.map.segmentLayer.map.zoomDuration = 20;
    }
  }
  function disableScrollZoom() {
    var controller = null;
    if (W.map.navigationControl) {
      controller = W.map.navigationControl;
    } else if (
      W.map.controls.find(
        (control) => control.CLASS_NAME == "OpenLayers.Control.Navigation"
      )
    ) {
      controller = W.map.controls.find(
        (control) => control.CLASS_NAME == "OpenLayers.Control.Navigation"
      );
    } else {
      logit(
        "Cannot find zoom wheel controls - please alert script maintainers",
        "error"
      );
    }
    if (controller !== null) {
      if (getById("_cbDisableScrollZoom").checked) {
        controller.disableZoomWheel();
      } else {
        controller.enableZoomWheel();
      }
    }
  }
  function PSclicked(event) {
    if (event.ctrlKey) alert("CTRL");
    if (W.selectionManager.getSelectedFeatures().length > 0) {
      if (getById("edit-panel").className === "tab-pane active") {
        getById("edit-panel").className = "tab-pane";
        getById("sidepanel-feed").className = "tab-pane active";
        getById("user-tabs").removeAttribute("hidden");
      } else {
        getById("edit-panel").className = "tab-pane active";
        getById("sidepanel-feed").className = "tab-pane";
        getById("user-tabs").setAttribute("hidden", "");
      }
    }
  }
  function PSicon() {
    if (W.selectionManager.getSelectedFeatures().length > 0) {
      getById("WMEFUPS").style.color = "red";
    } else {
      getById("WMEFUPS").style.color = "lightgrey";
    }
  }
  function PCclicked() {
    if (location.search.match("segments")) reselectItems("segments", true);
    else if (location.search.match("venues")) reselectItems("venues", true);
    else if (location.search.match("nodes")) reselectItems("nodes", false);
    else if (location.search.match("mapComments"))
      reselectItems("mapComments", false);
    else if (location.search.match("cameras")) reselectItems("cameras", false);
  }
  function reselectItems(typeDesc, isArray) {
    var parameter, IDArray, objectArray, i, object;
    parameter = location.search.match(
      new RegExp("[?&]" + typeDesc + "?=([^&]*)")
    );
    if (parameter) {
      IDArray = parameter[1].split(",");
      objectArray = [];
      for (i = 0; i < IDArray.length; i++) {
        object = W.model[typeDesc].objects[IDArray[i]];
        if (typeof object != "undefined") objectArray.push(object);
      }
      if (isArray) {
        W.selectionManager.setSelectedModels(objectArray);
      } else {
        W.selectionManager.setSelectedModels(objectArray[0]);
      }
    }
  }
  function createDSASection() {
    var settingsDiv = null;
    settingsDiv = document.querySelector("#sidepanel-prefs > div > form");
    if (!settingsDiv) {
      logit("WME Settings div not there yet - looping...", "warning");
      setTimeout(createDSASection, 500);
      return;
    }
    if (localStorage.dontShowAgain) {
      var dontShowAgain = JSON.parse(localStorage.dontShowAgain);
      var DSGroup = document.createElement("div");
      DSGroup.classList = "form-group";
      var DSLabel = document.createElement("label");
      DSLabel.classList = "control-label";
      DSLabel.innerHTML = modifyHTML("Disabled WME warnings");
      DSLabel.title = "This section will not update if you disable a warning\n";
      DSLabel.title += "from a WME pop-up. Re-load the page if you need\n";
      DSLabel.title += "to re-enable a warning you have just disabled.\n\n";
      DSLabel.title += "SECTION ADDED BY WME Fix UI.";
      DSGroup.appendChild(DSLabel);
      DSGroup.appendChild(document.createElement("br"));
      var DSCC = document.createElement("div");
      DSCC.classList = "controls-container";
      var DSInput;
      for (var property in dontShowAgain) {
        DSInput = document.createElement("input");
        DSInput.type = "checkbox";
        DSInput.id = "WMEFUDScb_" + property.toString();
        DSInput.setAttribute("orig", property.toString());
        DSInput.checked = dontShowAgain[property];
        DSLabel = document.createElement("label");
        DSLabel.setAttribute("for", DSInput.id);
        DSLabel.innerText = property.toString();
        DSCC.appendChild(DSInput);
        DSCC.appendChild(DSLabel);
        DSCC.appendChild(document.createElement("br"));
        DSInput.onclick = DSIclicked;
      }
      DSGroup.appendChild(DSCC);
      settingsDiv.appendChild(DSGroup);
    }
  }
  function DSIclicked(e) {
    var DSA = JSON.parse(localStorage.dontShowAgain);
    DSA[e.target.getAttribute("orig")] = e.target.checked;
    localStorage.dontShowAgain = JSON.stringify(DSA);
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
  let inSaveDetails = false;
  let inSaveButton = false;
  function saveMouseOver() {
    let styles = ".changes-log { display: block !important; }";
    addStyle(PREFIX, styles);

    inSaveButton = true;
    window.setTimeout(addSaveDetailsEventListeners, 100);
  }
  function saveMouseOut() {
    inSaveButton = false;
    window.setTimeout(saveMouseOutDeferred, 1000);
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
        .addEventListener("mouseover", saveDetailsMouseOver, true);
      document
        .querySelector(".changes-log")
        .addEventListener("mouseout", saveDetailsMouseOut, true);
    }
  }
  function saveDetailsMouseOver() {
    // The mouseover handler simply sets a flag to let the rest of the script know that we're
    // in the popup
    inSaveDetails = true;
  }
  function saveDetailsMouseOut() {
    // Whilst the mouseout handler both clears the flag and also calls the mouseout handler for
    // the save button (to hide the popup) unless the corresponding flag for the button itself
    // hasn't been set by its mouseover handler - i.e. we only want to hide the popup if the
    // mouse is over neither the save button or the details popup...
    inSaveDetails = false;
    if (inSaveButton == false) {
      saveMouseOut();
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
      let styles = ".changes-log { display: none !important; }";
      addStyle(PREFIX, styles);
    }
  }
  function disableSaveBlocker() {
    let fname = "disableSaveBlocker";
    let styles = "";
    if (getById("_cbDisableSaveBlocker").checked) {
      styles += "#popup-overlay { z-index: 0 !important; }";
      styles += ".changes-log { display: none !important; }";
      addStyle(PREFIX + fname, styles);
    } else {
      removeStyle(PREFIX + fname);
    }
  }
  function disableUITransitions() {
    let fname = "disableUITransitions";
    let styles = "";
    let sliderTrans = "";

    // Side panel and main menu fixes we can apply directly via CSS mods...
    if (getById("_cbDisableUITransitions").checked) {
      styles += ".collapsible-container { transition: none!important; }";
      styles += "#issue-tracker-filter-region { transition: none!important; }";
      styles += ".menu { transition: none!important; }";
      addStyle(PREFIX + fname, styles);

      sliderTrans =
        ".wz-slider::before {transition:all 0s linear 0s!important;}";
    } else {
      removeStyle(PREFIX + fname);

      sliderTrans =
        ".wz-slider::before {transition:all 400ms ease 0s!important;}";
    }

    // And now the stuff hidden in shadowroots...

    // WME adds transition styles both to the slider itself and also to its ::before
    // pseudo-element, so we can't simply apply our own style override to the slider
    // directly as this doesn't affect the ::before style.  To get around this, we
    // instead apply the override to the parent element as a new CSS entry to be
    // applied to its slider children - this then takes precedence over anything
    // defined on the slider itself...
    let nTS = document.querySelectorAll("wz-toggle-switch").length;
    while (nTS > 0) {
      let tsObj = document.querySelectorAll("wz-toggle-switch")[nTS - 1];
      let sr = tsObj.shadowRoot.querySelector(".wz-switch");

      if (sr !== null) {
        // If we haven't already set up our CSS entry on this parent element, do
        // so now...
        if (sr.querySelector("#fume") == null) {
          let sliderStyle = document.createElement("style");
          sliderStyle.id = "fume";
          sr.insertBefore(sliderStyle, sr.firstChild);
        }

        // Now we know the parent has our CSS entry, update its contents according to
        // whether we're enabling or disabling transition effects
        sr.querySelector("#fume").innerHTML = sliderTrans;
      }
      --nTS;
    }
  }
  function colourBlindTurns() {
    let fname = "colourBlindTurns";
    let styles = "";
    if (getById("_cbColourBlindTurns").checked) {
      styles += ".turn-arrow-state-open { filter: hue-rotate(90deg); }";
      addStyle(PREFIX + fname, styles);
    } else {
      removeStyle(PREFIX + fname);
    }
  }
  function hideLabel(lblObj) {
    if (lblObj !== null) {
      lblObj.style.fontSize = "0";
      lblObj.style.width = "0";
    } else {
      // breakpoint
    }
  }
  function showLabel(lblObj) {
    if (lblObj !== null) {
      lblObj.style.fontSize = "100%";
      lblObj.style.width = "100%";
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
          .shadowRoot.querySelector(".button-text")
      );
      hideLabel(
        document
          .querySelector(".toolbar-group-venues")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text")
      );
      hideLabel(
        document
          .querySelector(".toolbar-group-drawing")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text")
      );
      hideLabel(
        document
          .querySelector(".toolbar-group-permanent_hazards")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text")
      );
      hideLabel(
        document
          .querySelector(".restricted-driving-area")
          .shadowRoot.querySelector(".button-text")
      );
    } else {
      showLabel(
        document
          .querySelector(".toolbar-group-map-comments")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text")
      );
      showLabel(
        document
          .querySelector(".toolbar-group-venues")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text")
      );
      showLabel(
        document
          .querySelector(".toolbar-group-drawing")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text")
      );
      showLabel(
        document
          .querySelector(".toolbar-group-permanent_hazards")
          .querySelector("wz-button")
          .shadowRoot.querySelector(".button-text")
      );
      showLabel(
        document
          .querySelector(".restricted-driving-area")
          .shadowRoot.querySelector(".button-text")
      );
    }

    resizeSearch();
  }
  function unfloatButtons() {
    //// remove once we figure out how to stop saves unfloating stuff...
    return;

    let fname = "unfloatButtons";
    layersButton = getByClass("layer-switcher-button")[0];
    refreshButton = getByClass("reload-button")[0];
    shareButton = getByClass("share-location-button")[0];
    if (getById("_cbUnfloatButtons").checked) {
      unfloat();

      //hacks for other scripts
      if (getById("Info_div")) {
        getByClass("bottom overlay-buttons-container")[0].appendChild(
          getById("Info_div")
        );
        getById("Info_div").style.marginTop = "8px";
      }
      if (getById("BeenHere")) getById("BeenHere").style.top = "310px";
      //temporary hack for new button arrangements Map Nav Historic
      if (getById("prevIcon"))
        insertNodeBeforeNode(
          getById("prevIcon").parentNode,
          getById("nextIcon").parentNode
        );

      if (wmeFUinitialising) setTimeout(unfloat, 5000);
    } else {
      if (!wmeFUinitialising) {
        float();
        layersButton.onmouseover = null;
        document.body.onmouseleave = null;
        getById("layer-switcher-region").onmouseleave = null;
        removeStyle(PREFIX + fname);

        if (getById("Info_div")) {
          getByClass("overlay-buttons-container top")[0].appendChild(
            getById("Info_div")
          );
          getById("Info_div").style.marginTop = "";
        }
        if (getById("BeenHere")) getById("BeenHere").style.top = "280px";
      }
    }
  }
  function unfloat_ReloadClickHandler() {
    // Clicking on the refresh button essentially just calls the following native function,
    // however once we do this then the bloody refresh button loses its onclick hander AGAIN,
    // so we need to reinstate it before we go...
    W.controller.reloadData();
    refreshButton.addEventListener("click", unfloat_ReloadClickHandler);
  }
  function SLBRelocate() {
    // Once the mutation observer code has decided that the share location popup needs relocation,
    // we first wait for it to become visible (usually this is true the first time we get in here,
    // but sometimes WME will surprise us by getting here a tad too quickly for the popup).
    //
    // Once the popup exists, we first hide it (to avoid it briefly appearing in its native position
    // before being relocated) and then we wait ever so slightly longer before trying to move it,
    // otherwise WME seems to occasionally overwrite our position with the native one again...
    let tippy = document.querySelector(".tippy-box");
    if (tippy === null) {
      window.setTimeout(SLBRelocate, 100);
    } else {
      tippy.parentElement.style.visibility = "hidden";
      window.setTimeout(SLBApplyTransform, 100);
    }
  }
  function SLBApplyTransform() {
    // Finally we get to actually restyle the popup...  This is simply a case of replacing the native
    // transform (which nudges it a little to tne left and down relative to the top-right corner of the
    // map viewport) with our own (which nudges it a little less to the left, but a lot further down,
    // based on how far away the share location button is).  And then remembering to make it visible
    // again, so the user sees it appearing in the desired position as if it was always meant to be :-)
    let tippy = document.querySelector(".tippy-box").parentElement;
    let tipBCR = tippy.getBoundingClientRect();
    let slbBCR = document
      .querySelector(".share-location-button")
      .getBoundingClientRect();
    let tY = slbBCR.top - tipBCR.bottom + "px";
    tippy.style.transform = "translate(-20px, " + tY + ")";
    tippy.style.visibility = "";
  }
  var OBObserver = new MutationObserver(function (mutations) {
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
          ".share-location-button.overlay-button.overlay-button-active"
        ) !== null
      ) {
        SLBRelocate();
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
      ".share-location-button.overlay-button"
    ).length;
    if (nSLB > 1) {
      while (nSLB > 1) {
        --nSLB;
        document
          .querySelectorAll(".share-location-button.overlay-button")
          [nSLB].remove();
      }
    }
  });
  function unfloat() {
    //temporary
    return;

    if (getById("_cbUnfloatButtons").checked === true) {
      let slb = getByClass("share-location-button")[0];
      let wcp = getByClass("WazeControlPermalink")[0];
      if (slb !== undefined && wcp !== undefined) {
        // as we may end up calling this function multiple times, we first refloat so that any changes
        // made here will always be applied to the default styles rather than any we've already changed
        float();

        if (getById("_cbMoveUserInfo").checked === false) {
          insertNodeAfterNode(
            layersButton,
            document.querySelector("wz-user-box")
          );
        } else {
          insertNodeAfterNode(
            layersButton,
            getById("save-button").parentElement.parentElement
          );
        }
        layersButton.classList.add("toolbar-button");
        layersButton.firstChild.classList.add("item-container");
        layersButton.firstChild.classList.add(
          "item-icon",
          "w-icon",
          "w-icon-layers"
        );

        insertNodeBeforeNode(
          refreshButton,
          document.querySelector(".secondary-toolbar")
        );
        refreshButton.classList.add("toolbar-button");
        refreshButton.firstChild.classList.add("item-container");
        refreshButton.firstChild.classList.add(
          "item-icon",
          "w-icon",
          "w-icon-refresh"
        );
        // Something's changed in the latest iteration of WME which means that moving the refresh button
        // stops it accepting mouse clicks, so we need to set up a new onclick handler to replicate the
        // desired behaviour...
        refreshButton.addEventListener("click", unfloat_ReloadClickHandler, {
          once: true,
        });

        var lmBCR = wcp.getBoundingClientRect();
        var sbBCR = slb.getBoundingClientRect();
        var sbTop = lmBCR.top - sbBCR.top - 3;

        var styles = "";
        styles +=
          ".share-location-button { position: absolute; top: " +
          sbTop +
          "px; height: 18px; }";
        styles +=
          "#edit-buttons .overlay-button-disabled { opacity: 0.5; cursor: not-allowed; }";
        styles += ".share-location-button-region { display: inline-block; }";
        styles += ".w-icon-layers { top: 0px!important; }";
        styles += "div.WazeControlPermalink { padding-right: 64px; }";
        styles +=
          "div.share-location-button-region > div > div > i { line-height: 18px; }";
        styles += "a.w-icon.w-icon-link { line-height:17px; font-size: 20px; }";
        // correct button sizing when moved into bottom bar
        styles += ".share-location-button { height:24px; width:30px; }";
        addStyle(PREFIX + "unfloatButtons2", styles);
      }
    }
  }
  function float() {
    // temporary
    return;

    let elm = getByClass("overlay-buttons-container top")[0];
    if (elm !== undefined) {
      elm.appendChild(layersButton);
      layersButton.classList.remove("toolbar-button");
      layersButton.firstChild.classList.remove("item-container");
      layersButton.firstChild.classList.remove(
        "item-icon",
        "w-icon",
        "w-icon-layers"
      );
      layersButton.firstChild.classList.add("overlay-button");
      layersButton.firstChild.classList.add("w-icon", "w-icon-layers");

      elm.appendChild(refreshButton);
      refreshButton.classList.remove("toolbar-button");
      refreshButton.firstChild.classList.remove("item-container");
      refreshButton.firstChild.classList.remove(
        "item-icon",
        "w-icon",
        "w-icon-refresh"
      );
      refreshButton.firstChild.classList.add("overlay-button");
      refreshButton.firstChild.classList.add("w-icon", "w-icon-refresh");

      elm.appendChild(shareButton);

      removeStyle(PREFIX + "unfloatButtons2");
    }
  }
  function hackGSVHandle() {
    let fname = "hackGSVHandle";
    let styles = "";
    if (getById("_cbHackGSVHandle").checked) {
      styles +=
        "#editor-container #map.street-view-mode #street-view-drag-handle { height: 29px; background: lightgrey; font-size: 24px; border-radius: 8px; text-align: center; padding-top: 2px; border: 1px black solid; }";
      addStyle(PREFIX + fname, styles);
      getById("street-view-drag-handle").classList.add(
        "w-icon",
        "w-icon-round-trip"
      );
      getById("street-view-drag-handle").title =
        "Double-click to reset\ndefault width.";
    } else {
      removeStyle(PREFIX + fname);
      getById("street-view-drag-handle").removeAttribute("class");
      getById("street-view-drag-handle").removeAttribute("title");
    }
  }
  function enlargeGeoNodes(forceOff) {
    let fname = "enlargeGeoNodes";
    removeStyle(PREFIX + fname);
    let styles = "";
    if (getById("_inpEnlargeGeoNodes").value < 6)
      getById("_inpEnlargeGeoNodes").value = 6;
    if (getById("_cbEnlargeGeoNodes").checked && forceOff === false) {
      let newStyle =
        "{ transform-box: fill-box; transform-origin: center; vector-effect: non-scaling-stroke; transform:scale(" +
        getById("_inpEnlargeGeoNodes").value / 6 +
        "); }";
      styles +=
        "#" +
        W.map.getLayerByUniqueName("sketch").id +
        '_vroot [id^="OpenLayers_Geometry_Point_"][fill-opacity="1"][r="6"] ' +
        newStyle;
      styles +=
        "#" +
        W.map.venueLayer.id +
        '_vroot [id^="OpenLayers_Geometry_Point_"][fill-opacity="1"][fill="white"][stroke-opacity="1"][r="6"] ' +
        newStyle;
      styles +=
        "#" +
        W.map.commentLayer.id +
        '_vroot [id^="OpenLayers_Geometry_Point_"][fill-opacity="1"][fill="white"][stroke-opacity="1"][r="6"] ' +
        newStyle;
      addStyle(PREFIX + fname, styles);
    }
  }
  function enlargeGeoHandles(forceOff) {
    let fname = "enlargeGeoHandles";
    removeStyle(PREFIX + fname);
    let styles = "";
    if (getById("_inpEnlargeGeoHandles").value < 4)
      getById("_inpEnlargeGeoHandles").value = 4;
    if (getById("_cbEnlargeGeoHandlesFU").checked && forceOff === false) {
      let newStyle =
        "{ transform-box: fill-box; transform-origin: center; vector-effect: non-scaling-stroke; transform:scale(" +
        getById("_inpEnlargeGeoHandles").value / 4 +
        "); }";
      styles +=
        "#" +
        W.map.getLayerByUniqueName("sketch").id +
        '_vroot [id^="OpenLayers_Geometry_Point_"][fill-opacity="0.6"][r="4"] ' +
        newStyle;
      styles +=
        "#" +
        W.map.venueLayer.id +
        '_vroot [id^="OpenLayers_Geometry_Point_"][fill-opacity="0.6"][stroke-opacity="1"][r="4"]' +
        newStyle;
      styles +=
        "#" +
        W.map.commentLayer.id +
        '_vroot [id^="OpenLayers_Geometry_Point_"][fill-opacity="0.6"][stroke-opacity="1"][r="4"]' +
        newStyle;
      addStyle(PREFIX + fname, styles);
    }
  }
  function enlargePointMCs() {
    let fname = "enlargePointMCs";
    removeStyle(PREFIX + fname);
    let styles = "";
    if (getById("_inpEnlargePointMCs").value < 1)
      getById("_inpEnlargePointMCs").value = 1;
    if (getById("_cbEnlargePointMCs").checked) {
      let newStyle =
        "{ fill: #ffff00; fill-opacity: 0.75; transform-box: fill-box; transform-origin: center; vector-effect: non-scaling-stroke; transform:scale(" +
        getById("_inpEnlargePointMCs").value +
        "); }";
      let newStyleHover =
        "{ transform-box: fill-box; transform-origin: center; vector-effect: non-scaling-stroke; transform:scale(" +
        (0.25 + getById("_inpEnlargePointMCs").value / 2) +
        "); }";
      styles +=
        "#" +
        W.map.commentLayer.id +
        '_vroot [id^="OpenLayers_Geometry_Point_"][stroke="#ffffff"][r="6"]' +
        newStyle;
      styles +=
        "#" +
        W.map.commentLayer.id +
        '_vroot [id^="OpenLayers_Geometry_Point_"][stroke="#ffffff"][r="12"]' +
        newStyleHover;
      addStyle(PREFIX + fname, styles);
    }
  }
  function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName("head")[0];
    if (!head) {
      return;
    }
    style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = modifyHTML(css);
    head.appendChild(style);
  }
  function addStyle(ID, css) {
    var head, style;
    head = document.getElementsByTagName("head")[0];
    if (!head) {
      return;
    }
    removeStyle(ID); // in case it is already there
    style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = modifyHTML(css);
    style.id = ID;
    head.appendChild(style);
  }
  function removeStyle(ID) {
    var style = document.getElementById(ID);
    if (style) {
      style.parentNode.removeChild(style);
    }
  }
  function getByClass(classname, node) {
    if (!node) {
      node = document.getElementsByTagName("body")[0];
    }
    return node.getElementsByClassName(classname);
    // var a = [];
    // var re = new RegExp('\\b' + classname + '\\b');
    // var els = node.getElementsByTagName("*");
    // for (var i=0,j=els.length; i<j; i++) {
    // 	if (re.test(els[i].className)) { a.push(els[i]); }
    // }
    // return a;
  }
  function getById(node) {
    return document.getElementById(node);
  }
  function insertNodeBeforeNode(insertNode, beforeNode) {
    if (insertNode == null || beforeNode == null) {
      logit("null node during insert", "error");
    } else {
      beforeNode.parentNode.insertBefore(insertNode, beforeNode);
    }
  }
  function insertNodeAfterNode(insertNode, afterNode) {
    insertNodeBeforeNode(insertNode, afterNode);
    insertNodeBeforeNode(afterNode, insertNode);
  }
  function logit(msg, typ) {
    if (!typ) {
      console.log(PREFIX + ": " + msg);
    } else {
      switch (typ) {
        case "error":
          console.error(PREFIX + ": " + msg);
          break;
        case "warning":
          console.warn(PREFIX + ": " + msg);
          break;
        case "info":
          console.info(PREFIX + ": " + msg);
          break;
        case "debug":
          if (debug) {
            console.warn(PREFIX + ": " + msg);
          }
          break;
        default:
          console.log(PREFIX + " unknown message type: " + msg);
          break;
      }
    }
  }

  // Start it running
  setTimeout(init1, 200);
})();
