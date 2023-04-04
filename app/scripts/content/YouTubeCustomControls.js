import {
  OpenPopoutForPageVideo,
  RotateVideoPlayer,
} from "./YouTubePopoutPlayer";
import { CloseTab } from "../content";

import Options from "../helpers/options";
import { IsPopoutPlayer } from "../helpers/utils";

/**
 * Click event handler for the context menu entry and the controls button
 * @param {MouseEvent} event the original click event
 */
const OpenPopoutPlayerControlsClickEventHandler = async (event) => {
  event.preventDefault();

  await OpenPopoutForPageVideo();

  if (await Options.GetLocalOption("advanced", "close")) {
    await CloseTab(true);
  }
};

/**
 * Inserts the various control elements and watches the DOM for changes to re-insert controls as needed
 */
export const InsertControlsAndWatch = async () => {
  await InsertControls();
  WatchForPageChanges();
};

/**
 * Inserts the various control elements
 */
export const InsertControls = async () => {
  console.group("[YouTubeCustomControls] InsertControls()");

  InsertPopoutEntryIntoContextMenu();
  await InsertPopoutButtonIntoPlayerControls();
  await InsertRotationButtonsIntoPlayerControls();
};

/**
 * Watches the DOM for changes and re-inserts controls as needed
 */
export const WatchForPageChanges = () => {
  const observer = new MutationObserver((mutations) => {
    mutations
      .filter((mutation) => mutation.addedNodes !== null)
      .forEach(async (mutation) => {
        for (const node of mutation.addedNodes) {
          switch (node.className) {
            case "ytp-popup ytp-contextmenu":
              console.log(
                "[YouTubeCustomControls] WatchForPageChanges() :: Mutation observed for context menu",
                node
              );
              InsertPopoutEntryIntoContextMenu();
              break;

            case "ytp-right-controls":
              console.log(
                "[YouTubeCustomControls] WatchForPageChanges() :: Mutation observed for player controls",
                node
              );
              await InsertPopoutButtonIntoPlayerControls();
              await InsertRotationButtonsIntoPlayerControls();
              break;
          }
        }
      });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

/**
 * Appends a new entry to the context (right-click) menu of the YouTube video player
 */
const InsertPopoutEntryIntoContextMenu = () => {
  try {
    const contextmenu = document.getElementsByClassName("ytp-contextmenu")[0];
    if (!contextmenu) {
      console.warn("Missing context menu");
      return false;
    }

    let menuItem = document.getElementById("popout-player-context-menu-item");
    if (menuItem) {
      console.warn("#popout-player-context-menu-item already exists", menuItem);
      return false;
    }

    menuItem = document.createElement("div");
    menuItem.className = "ytp-menuitem";
    menuItem.setAttribute("aria-haspopup", false);
    menuItem.setAttribute("role", "menuitem");
    menuItem.setAttribute("tabindex", 0);
    menuItem.id = "popout-player-context-menu-item";

    const menuItemIcon = document.createElement("div");
    menuItemIcon.className = "ytp-menuitem-icon";

    menuItemIcon.appendChild(GetPopoutIconSVG("menu", false));

    const menuItemLabel = document.createElement("div");
    menuItemLabel.className = "ytp-menuitem-label";
    menuItemLabel.innerText = browser.i18n.getMessage(
      "ContextMenuEntryLabel_PopoutPlayer"
    );

    const menuItemContent = document.createElement("div");
    menuItemContent.className = "ytp-menuitem-content";

    menuItem.appendChild(menuItemIcon);
    menuItem.appendChild(menuItemLabel);
    menuItem.appendChild(menuItemContent);
    menuItem.addEventListener(
      "click",
      OpenPopoutPlayerControlsClickEventHandler,
      false
    );

    const menu = contextmenu
      .getElementsByClassName("ytp-panel")[0]
      .getElementsByClassName("ytp-panel-menu")[0];

    menu.appendChild(menuItem);

    const contextMenus = document.getElementsByClassName("ytp-contextmenu");
    const contextMenu = contextMenus[contextMenus.length - 1];
    const contextMenuPanel = contextMenu.getElementsByClassName("ytp-panel")[0];
    const contextMenuPanelMenu =
      contextMenuPanel.getElementsByClassName("ytp-panel-menu")[0];

    const height = contextMenu.offsetHeight + menuItem.offsetHeight;
    contextMenu.style.height = height + "px";
    contextMenuPanel.style.height = height + "px";
    contextMenuPanelMenu.style.height = height + "px";
  } catch (error) {
    console.error(
      "Failed to insert popout player entry into context menu",
      error
    );
    return false;
  }

  return true;
};

/**
 * Adds a new button to the YouTube video player controls (in the lower-right corner)
 * This method checks the configurable "controls" option, so the button is only inserted when appropriate
 */
const InsertPopoutButtonIntoPlayerControls = async () => {
  if (IsPopoutPlayer(window.location)) {
    try {
      const controls = await Options.GetLocalOption("behavior", "controls");
      if (controls.toLowerCase() !== "extended") {
        console.info('Popout player controls option is NOT set to "extended"');
        return false;
      }
    } catch (error) {
      console.error(
        `Failed to get "behavior.controls" option from local storage`,
        error
      );
    }
  }

  try {
    const controls = document.getElementsByClassName("ytp-right-controls")[0];
    if (!controls) {
      console.warn("Missing player controls");
      return false;
    }

    let playerButton = controls.getElementsByClassName("ytp-popout-button")[0];
    if (playerButton) {
      console.warn(
        "#popout-player-control-button already exists",
        playerButton
      );
      return false;
    }

    const fullScreenButton = controls.getElementsByClassName(
      "ytp-fullscreen-button"
    )[0];
    if (!fullScreenButton) {
      console.warn("Missing player controls full screen button");
      return false;
    }

    playerButton = document.createElement("button");
    playerButton.className = ["ytp-popout-button", "ytp-button"].join(" ");
    playerButton.setAttribute(
      "aria-label",
      browser.i18n.getMessage("PlayerControlsButtonTitle_PopoutPlayer")
    );
    playerButton.setAttribute(
      "title",
      browser.i18n.getMessage("PlayerControlsButtonTitle_PopoutPlayer")
    );
    playerButton.id = "popout-player-control-button";
    playerButton.appendChild(GetPopoutIconSVG("button", true));
    playerButton.addEventListener(
      "click",
      OpenPopoutPlayerControlsClickEventHandler,
      false
    );

    // TODO: this doesn't work (`fullScreenButton["onmouseover"]` is null); need another way to implement the fancy tooltip
    playerButton.addEventListener(
      "mouseover",
      fullScreenButton["onmouseover"],
      false
    );

    controls.insertBefore(playerButton, fullScreenButton);
  } catch (error) {
    console.error(
      "Failed to insert popout player button into player controls",
      error
    );
    return false;
  }

  return true;
};

const InsertRotationButtonsIntoPlayerControls = async () => {
  if (!IsPopoutPlayer(window.location)) {
    console.info(
      "Video player rotation controls are currently only supported within the popout player"
    );
    return false;
  }

  try {
    const showRotationButtons = await Options.GetLocalOption(
      "behavior",
      "showRotationButtons"
    );
    if (showRotationButtons === false) {
      console.info(`Options "behavior.showRotationButtons" is disabled`);
      return false;
    }
  } catch (error) {
    console.error(
      `Failed to get "behavior.showRotationButtons" option from local storage`,
      error
    );
  }

  try {
    const controls = document.getElementsByClassName("ytp-right-controls")[0];
    if (!controls) {
      console.warn("Missing player controls");
      return false;
    }

    const directions = ["left", "right"].reverse();
    for (const direction of directions) {
      let button = controls.querySelector(
        "#ytp-rotate-" + direction + "-button"
      );
      if (button) {
        console.warn(
          "#ytp-rotate-" + direction + "-button already exists",
          button
        );
        continue;
      }

      button = document.createElement("button");
      button.className = [
        "ytp-rotate-" + direction + "-button",
        "ytp-rotate-button",
        "ytp-button",
      ].join(" ");
      button.setAttribute(
        "aria-label",
        browser.i18n.getMessage("PopoutPlayerControls_RotateVideo_" + direction)
      );
      button.setAttribute(
        "title",
        browser.i18n.getMessage("PopoutPlayerControls_RotateVideo_" + direction)
      );
      button.id = "ytp-rotate-" + direction + "-button";
      button.appendChild(GetRotateIconSVG(direction, true));
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          switch (direction) {
            case "left":
              RotateVideoPlayer(-90);
              break;
            case "right":
              RotateVideoPlayer(+90);
              break;
          }
        },
        false
      );

      controls.insertBefore(button, controls.querySelector("button"));
    }
  } catch (error) {
    console.error(
      "Failed to insert video rotation buttons into player controls",
      error
    );
    return false;
  }

  return true;
};

/**
 * Gets an SVG element for the requested Popout icon
 * @param {string} type the type of icon
 * @param {boolean} shadow indicates if the YouTube shadows should be applied to the SVG paths
 * @returns {HTMLElement}
 */
const GetPopoutIconSVG = (type, shadow = false) => {
  const svgNS = "http://www.w3.org/2000/svg";

  const iconSVG = document.createElementNS(svgNS, "svg");
  iconSVG.setAttribute("width", "100%");
  iconSVG.setAttribute("height", "100%");
  iconSVG.setAttribute("viewBox", "0 0 36 36");
  iconSVG.setAttribute("version", "1.1");

  const paths = {
    button: {
      // paths are inset from edges more and are narrower
      frame: "m 9,10 v 16 h 18 v -4 h -2 v 2 H 11 V 12 h 3 v -2 z",
      popout: "M 16,9 V 20 H 28 V 9 Z m 2,2 h 8 v 7 h -8 z",
    },
    menu: {
      // paths are inset from edges less and are wider
      frame: "m 3,5 v 28 h 28 v -9 h -3 v 6 H 6 V 8 h 6 V 5 Z",
      popout: "M 15,3 V 21 H 33 V 3 Z m 3,3 H 30 V 18 H 18 Z",
    },
  };

  for (const [name, path] of Object.entries(paths[type])) {
    const pathElement = document.createElementNS(svgNS, "path");
    pathElement.id = "ytp-svg-pop-" + name;
    pathElement.setAttributeNS(null, "d", path);
    pathElement.setAttributeNS(null, "class", "ytp-svg-fill");

    if (shadow) {
      const useElement = document.createElementNS(svgNS, "use");
      useElement.setAttributeNS(null, "class", "ytp-svg-shadow");
      useElement.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href",
        "#" + pathElement.id
      );

      iconSVG.appendChild(useElement);
    }

    iconSVG.appendChild(pathElement);
  }

  return iconSVG;
};

/**
 * Gets an SVG element for the requested rotation icon
 * @param {string} direction the direction of icon
 * @param {boolean} shadow indicates if the YouTube shadows should be applied to the SVG paths
 * @returns {HTMLElement}
 */
const GetRotateIconSVG = (direction, shadow = false) => {
  const svgNS = "http://www.w3.org/2000/svg";

  const iconSVG = document.createElementNS(svgNS, "svg");
  iconSVG.setAttribute("width", "100%");
  iconSVG.setAttribute("height", "100%");
  iconSVG.setAttribute("viewBox", "0 0 24 24");
  iconSVG.setAttribute("version", "1.1");

  const paths = {
    left: {
      arrow:
        "m 9.11853,6.5003499 c 0.275955,0.010235 0.49136,0.242235 0.481125,0.51819 L 9.55074,8.3374149 C 10.227275,7.8127399 11.077,7.5000049 12,7.5000049 c 2.20915,0 4,1.790865 4,3.9999951 0,2.20915 -1.79085,4 -4,4 -2.20914,0 -4,-1.79085 -4,-4 C 8,11.22385 8.22386,11 8.5,11 8.77614,11 9,11.22385 9,11.5 c 0,1.65685 1.343145,3 3,3 1.65685,0 3,-1.34315 3,-3 0,-1.6568451 -1.34315,-2.9999951 -3,-2.9999951 -0.7897,0 -1.508415,0.304965 -2.04451,0.80445 l 1.70256,0.19893 c 0.27425,0.03205 0.4706,0.28037 0.43855,0.5546501 -0.03205,0.274275 -0.28035,0.470665 -0.55465,0.438595 L 8.941975,10.192835 C 8.68294,10.16257 8.49068,9.9382949 8.500345,9.6776799 l 0.1,-2.696205 C 8.61058,6.7055199 8.84258,6.4901149 9.11853,6.5003499 Z",
    },
    right: {
      arrow:
        "m 14.88145,6.5003499 c -0.27595,0.010235 -0.49135,0.242235 -0.4811,0.51819 l 0.0489,1.318875 C 13.77275,7.8127399 12.923,7.5000049 12,7.5000049 c -2.20914,0 -4,1.790865 -4,3.9999951 0,2.20915 1.79086,4 4,4 2.20915,0 4,-1.79085 4,-4 0,-0.27615 -0.22385,-0.5 -0.5,-0.5 -0.27615,0 -0.5,0.22385 -0.5,0.5 0,1.65685 -1.34315,3 -3,3 -1.656855,0 -3,-1.34315 -3,-3 0,-1.6568451 1.343145,-2.9999951 3,-2.9999951 0.7897,0 1.5084,0.304965 2.0445,0.80445 l -1.70255,0.19893 c -0.27425,0.03205 -0.4706,0.28037 -0.43855,0.5546501 0.03205,0.274275 0.28035,0.470665 0.55465,0.438595 l 2.6,-0.303795 c 0.259,-0.03026 0.45125,-0.2545401 0.4416,-0.5151551 l -0.1,-2.696205 c -0.01025,-0.275955 -0.24225,-0.49136 -0.5182,-0.481125 z",
    },
  };

  for (const [name, path] of Object.entries(paths[direction])) {
    const pathElement = document.createElementNS(svgNS, "path");
    pathElement.id = "ytp-svg-rotate-" + direction + "-" + name;
    pathElement.setAttributeNS(null, "d", path);
    pathElement.setAttributeNS(null, "class", "ytp-svg-fill");

    if (shadow) {
      const useElement = document.createElementNS(svgNS, "use");
      useElement.setAttributeNS(null, "class", "ytp-svg-shadow");
      useElement.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href",
        "#" + pathElement.id
      );

      iconSVG.appendChild(useElement);
    }

    iconSVG.appendChild(pathElement);
  }

  return iconSVG;
};
