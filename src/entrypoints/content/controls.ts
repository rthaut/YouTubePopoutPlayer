import { IsPopoutPlayer } from "@/utils/misc";
import Options from "@/utils/options";

import { CloseTab } from ".";
import { OpenPopoutForPageVideo, RotateVideoPlayer } from "./player";

/**
 * Click event handler for the context menu entry and the controls button
 * @param {MouseEvent} event the original click event
 */
const OpenPopoutPlayerControlsClickEventHandler = async (event: MouseEvent) => {
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

  if (document.querySelector("video")) {
    InsertPopoutEntryIntoContextMenu();
    await InsertPopoutButtonIntoPlayerControls();
    await InsertRotationButtonsIntoPlayerControls();
  }
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
          if (node.nodeType !== Node.ELEMENT_NODE) continue;

          const classes = (node as HTMLElement).classList;
          if (classes.contains("ytp-contextmenu")) {
            InsertPopoutEntryIntoContextMenu();
          } else if (classes.contains("ytp-right-controls")) {
            await InsertPopoutButtonIntoPlayerControls();
            await InsertRotationButtonsIntoPlayerControls();
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
    const contextMenu = document.querySelector<HTMLElement>(".ytp-contextmenu");
    if (!contextMenu) {
      return false;
    }

    let menuItem = document.getElementById("popout-player-context-menu-item");
    if (menuItem) {
      return false;
    }

    menuItem = document.createElement("div");
    menuItem.className = "ytp-menuitem";
    menuItem.setAttribute("aria-haspopup", "false");
    menuItem.setAttribute("role", "menuitem");
    menuItem.setAttribute("tabindex", "0");
    menuItem.id = "popout-player-context-menu-item";

    const menuItemIcon = document.createElement("div");
    menuItemIcon.className = "ytp-menuitem-icon";

    menuItemIcon.appendChild(GetPopoutIconSVG("menu", false));

    const menuItemLabel = document.createElement("div");
    menuItemLabel.className = "ytp-menuitem-label";
    menuItemLabel.innerText = browser.i18n.getMessage(
      "ContextMenuEntryLabel_PopoutPlayer",
    );

    const menuItemContent = document.createElement("div");
    menuItemContent.className = "ytp-menuitem-content";

    menuItem.appendChild(menuItemIcon);
    menuItem.appendChild(menuItemLabel);
    menuItem.appendChild(menuItemContent);
    menuItem.addEventListener(
      "click",
      OpenPopoutPlayerControlsClickEventHandler,
      false,
    );

    const panel = contextMenu.querySelector<HTMLElement>(".ytp-panel");
    const panelMenu = panel?.querySelector<HTMLElement>(".ytp-panel-menu");
    if (!panel || !panelMenu) {
      console.warn("Missing context menu panel");
      return false;
    }

    panelMenu.appendChild(menuItem);

    const height = contextMenu.offsetHeight + menuItem.offsetHeight;
    contextMenu.style.height = height + "px";
    panel.style.height = height + "px";
    panelMenu.style.height = height + "px";
  } catch (error) {
    console.error(
      "Failed to insert popout player entry into context menu",
      error,
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
        error,
      );
    }
  }

  try {
    let legacyControls = true;
    let controls = document.querySelector<HTMLElement>(
      ".ytp-right-controls-right",
    );
    if (controls) {
      legacyControls = false;
    } else {
      controls = document.querySelector<HTMLElement>(".ytp-right-controls");
    }

    if (!controls) {
      console.warn("Missing player controls");
      return false;
    }

    let playerButton =
      controls.querySelector<HTMLButtonElement>(".ytp-popout-button");
    if (playerButton) {
      console.warn(
        "#popout-player-control-button already exists",
        playerButton,
      );
      return false;
    }

    const fullScreenButton = controls.querySelector<HTMLButtonElement>(
      ".ytp-fullscreen-button",
    );
    if (!fullScreenButton) {
      console.warn("Missing player controls full screen button");
      return false;
    }

    playerButton = document.createElement("button");
    playerButton.className = ["ytp-popout-button", "ytp-button"].join(" ");
    playerButton.setAttribute("title", "");
    const attributes = ["aria-label"];
    if (legacyControls) {
      attributes.push("title");
    } else {
      attributes.push("data-title-no-tooltip", "data-tooltip-title");
    }
    attributes.forEach((attribute) => {
      playerButton.setAttribute(
        attribute,
        browser.i18n.getMessage("PlayerControlsButtonTitle_PopoutPlayer"),
      );
    });
    playerButton.id = "popout-player-control-button";
    playerButton.appendChild(
      GetPopoutIconSVG("button", true, legacyControls ? "legacy" : "delhi"),
    );
    playerButton.addEventListener(
      "click",
      OpenPopoutPlayerControlsClickEventHandler,
      false,
    );

    // TODO: this doesn't work (`fullScreenButton["onmouseover"]` is null); need another way to implement the fancy tooltip
    playerButton.addEventListener(
      "mouseover",
      () => ({}), // fullScreenButton["onmouseover"],
      false,
    );

    fullScreenButton.before(playerButton);
  } catch (error) {
    console.error(
      "Failed to insert popout player button into player controls",
      error,
    );
    return false;
  }

  return true;
};

/**
 * Adds the rotation buttons to the YouTube video player controls (in the lower-right corner)
 * This method checks the configurable "showRotationButtons" option, so the buttons are only inserted when appropriate
 * NOTE: Rotation buttons are only added within the popout player
 */
const InsertRotationButtonsIntoPlayerControls = async () => {
  if (!IsPopoutPlayer(window.location)) {
    console.info(
      "Video player rotation controls are currently only supported within the popout player",
    );
    return false;
  }

  try {
    const showRotationButtons = await Options.GetLocalOption(
      "behavior",
      "showRotationButtons",
    );
    if (showRotationButtons === false) {
      console.info(`Options "behavior.showRotationButtons" is disabled`);
      return false;
    }
  } catch (error) {
    console.error(
      `Failed to get "behavior.showRotationButtons" option from local storage`,
      error,
    );
  }

  try {
    let legacyControls = true;
    let controls = document.querySelector<HTMLElement>(
      ".ytp-right-controls-right",
    );
    if (controls) {
      legacyControls = false;
    } else {
      controls = document.querySelector<HTMLElement>(".ytp-right-controls");
    }

    if (!controls) {
      console.warn("Missing player controls");
      return false;
    }

    const directions = ["right", "left"] as const;
    for (const direction of directions) {
      let button = controls.querySelector(
        "#ytp-rotate-" + direction + "-button",
      );
      if (button) {
        console.warn(
          "#ytp-rotate-" + direction + "-button already exists",
          button,
        );
        continue;
      }

      button = document.createElement("button");
      button.className = [
        "ytp-rotate-" + direction + "-button",
        "ytp-rotate-button",
        "ytp-button",
      ].join(" ");
      button.setAttribute("title", "");
      const attributes = ["aria-label"];
      if (legacyControls) {
        attributes.push("title");
      } else {
        attributes.push("data-title-no-tooltip", "data-tooltip-title");
      }
      attributes.forEach((attribute) => {
        button.setAttribute(
          attribute,
          browser.i18n.getMessage(
            `PopoutPlayerControls_RotateVideo_${direction as "Left" | "Right"}`,
          ),
        );
      });
      button.id = "ytp-rotate-" + direction + "-button";
      button.appendChild(
        GetRotateIconSVG(direction, true, legacyControls ? "legacy" : "delhi"),
      );
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
        false,
      );

      controls.querySelector("button")?.before(button);
    }
  } catch (error) {
    console.error(
      "Failed to insert video rotation buttons into player controls",
      error,
    );
    return false;
  }

  return true;
};

/**
 * Gets an SVG element for the requested Popout icon
 * @param {"button" | "menu"} type the type of icon
 * @param {boolean} shadow indicates if the YouTube shadows should be applied to the SVG paths
 * @param {"legacy" | "delhi"} size the size/style of the icon
 * @returns {HTMLElement}
 */
const GetPopoutIconSVG = (
  type: "button" | "menu",
  shadow: boolean = false,
  size: "legacy" | "delhi" = "legacy",
): SVGElement => {
  const svgNS = "http://www.w3.org/2000/svg";

  const iconSVG = document.createElementNS(svgNS, "svg");
  iconSVG.setAttribute("width", size === "delhi" ? "24" : "100%");
  iconSVG.setAttribute("height", size === "delhi" ? "24" : "100%");
  iconSVG.setAttribute("viewBox", size === "delhi" ? "6 6 24 24" : "0 0 36 36");
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
  } as const;

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
        "#" + pathElement.id,
      );

      iconSVG.appendChild(useElement);
    }

    iconSVG.appendChild(pathElement);
  }

  return iconSVG;
};

/**
 * Gets an SVG element for the requested rotation icon
 * @param {"left" | "right"} direction the direction of icon
 * @param {boolean} shadow indicates if the YouTube shadows should be applied to the SVG paths
 * @param {"legacy" | "delhi"} size the size/style of the icon
 * @returns {SVGElement}
 */
const GetRotateIconSVG = (
  direction: "left" | "right",
  shadow: boolean = false,
  size: "legacy" | "delhi" = "legacy",
): SVGElement => {
  const svgNS = "http://www.w3.org/2000/svg";

  const iconSVG = document.createElementNS(svgNS, "svg");
  iconSVG.setAttribute("width", size === "delhi" ? "24" : "100%");
  iconSVG.setAttribute("height", size === "delhi" ? "24" : "100%");
  iconSVG.setAttribute("viewBox", size === "delhi" ? "" : "0 0 1024 1024");
  iconSVG.setAttribute("version", "1.1");

  const paths = {
    left: {
      frame:
        "m 606.46016,450.50457 h -316.8 c -10.62,0 -19.2,8.58 -19.2,19.2 v 248.4 c 0,10.62 8.58,19.2 19.2,19.2 h 316.8 c 10.62,0 19.2,-8.58 19.2,-19.2 v -248.4 c 0,-10.62 -8.58,-19.2 -19.2,-19.2 z m -26.4,241.2 h -264 v -195.6 h 264 z",
      arrow:
        "m 694.84016,396.80457 c -47.28,-60.42 -117.6,-92.16 -188.76,-92.52 l -0.12,-38.4 c 0,-3.9 -4.56,-6.06 -7.56,-3.66 l -76.8,60.6 c -2.4,1.86 -2.34,5.46 0,7.38 l 76.86,60.66 c 3.06,2.4 7.62,0.24 7.56,-3.66 v -38.34 c 7.74,0.06 15.54,0.54 23.28,1.5 25.26,3.12 49.26,10.92 71.4,23.22 22.86,12.72 42.72,29.82 59.04,50.58 16.26,20.82 28.02,44.22 34.86,69.48 6.6,24.42 8.4,49.62 5.34,74.88 -0.42,3.24 -0.84,6.48 -1.44,9.66 h 44.94 c 8.88,-62.16 -6.78,-127.8 -48.6,-181.38 z",
    },
    right: {
      frame:
        "m 734.3176,450.52457 h -316.8 c -10.62,0 -19.2,8.58 -19.2,19.2 v 248.4 c 0,10.62 8.58,19.2 19.2,19.2 h 316.8 c 10.62,0 19.2,-8.58 19.2,-19.2 v -248.4 c 0,-10.62 -8.58,-19.2 -19.2,-19.2 z m -26.4,241.2 h -264 v -195.6 h 264 z",
      arrow:
        "m 494.6176,350.44457 c 7.8,-0.96 15.54,-1.44 23.28,-1.5 v 38.34 c 0,3.9 4.5,6.06 7.56,3.66 l 76.86,-60.66 c 2.4,-1.92 2.4,-5.52 0,-7.38 l -76.8,-60.6 c -3.06,-2.4 -7.56,-0.24 -7.56,3.66 l -0.12,38.4 c -71.16,0.3 -141.48,32.04 -188.76,92.52 -41.76,53.52 -57.42,119.16 -48.66,181.44 h 44.94 c -0.54,-3.18 -1.02,-6.42 -1.44,-9.66 -3.06,-25.26 -1.26,-50.46 5.34,-74.88 6.84,-25.32 18.6,-48.66 34.86,-69.48 16.32,-20.82 36.18,-37.92 59.04,-50.58 22.2,-12.36 46.14,-20.16 71.46,-23.28 z",
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
        "#" + pathElement.id,
      );

      iconSVG.appendChild(useElement);
    }

    iconSVG.appendChild(pathElement);
  }

  return iconSVG;
};
