import Options from "../helpers/options";
import { IsPopoutPlayer } from "../helpers/utils";

/**
 * @callback ControlsClickEventHandler
 * @param {MouseEvent} event
 */

/**
 * Inserts the various control elements and watches the DOM for changes and re-inserts controls as needed
 * @param {ControlsClickEventHandler} controlsClickEventHandler the click event handler function for the controls
 */
export const InsertControlsAndWatch = async (controlsClickEventHandler) => {
  await InsertControls(controlsClickEventHandler);
  WatchForPageChanges(controlsClickEventHandler);
};
export default InsertControlsAndWatch;

/**
 * Inserts the various control elements
 * @param {ControlsClickEventHandler} controlsClickEventHandler the click event handler function for the controls
 */
export const InsertControls = async (controlsClickEventHandler) => {
  console.group("[YouTubeCustomControls] InsertControls()");

  try {
    InsertContextMenuEntry(controlsClickEventHandler);
  } catch (error) {
    console.error("Failed to insert context menu entry control", error);
  }

  try {
    await InsertPlayerControlsButton(controlsClickEventHandler);
  } catch (error) {
    console.error("Failed to insert button control", error);
  }

  console.groupEnd();
};

/**
 * Watches the DOM for changes and re-inserts controls as needed
 * @param {ControlsClickEventHandler} controlsClickEventHandler the click event handler function for the controls
 */
export const WatchForPageChanges = (controlsClickEventHandler) => {
  console.group("[YouTubeCustomControls] WatchForPageChanges()");

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes != null) {
        for (const node of mutation.addedNodes) {
          switch (node.className) {
            case "ytp-popup ytp-contextmenu":
              console.log(
                "[YouTubeCustomControls] WatchForPageChanges() :: Mutation observed for context menu",
                node
              );
              InsertContextMenuEntry(controlsClickEventHandler);
              break;

            case "ytp-right-controls":
              console.log(
                "[YouTubeCustomControls] WatchForPageChanges() :: Mutation observed for player controls",
                node
              );
              InsertPlayerControlsButton(controlsClickEventHandler);
              break;
          }
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("Mutation Observer watching for changes", observer);
  console.groupEnd();
};

/**
 * Appends a new entry to the context (right-click) menu of the YouTube video player
 * @param {ControlsClickEventHandler} clickEventHandler the click event handler function for the content menu entry
 */
const InsertContextMenuEntry = (clickEventHandler) => {
  console.group("[YouTubeCustomControls] InsertControls()");

  const contextmenu = document.getElementsByClassName("ytp-contextmenu")[0];

  if (!contextmenu) {
    console.info("Missing context menu");
    console.groupEnd();
    return false;
  }

  let menuItem = document.getElementById("popout-player-context-menu-item");
  if (menuItem) {
    console.info("#popout-player-context-menu-item already exists", menuItem);
    console.groupEnd();
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
  menuItem.addEventListener("click", clickEventHandler, false);

  const menu = contextmenu
    .getElementsByClassName("ytp-panel")[0]
    .getElementsByClassName("ytp-panel-menu")[0];

  menu.appendChild(menuItem);
  console.info("Inserting context menu entry", menuItem);

  const contextMenus = document.getElementsByClassName("ytp-contextmenu");
  const contextMenu = contextMenus[contextMenus.length - 1];
  const contextMenuPanel = contextMenu.getElementsByClassName("ytp-panel")[0];
  const contextMenuPanelMenu =
    contextMenuPanel.getElementsByClassName("ytp-panel-menu")[0];

  const height = contextMenu.offsetHeight + menuItem.offsetHeight;
  console.info(
    "Modifying context menu height to " + height + "px",
    contextMenu
  );

  contextMenu.style.height = height + "px";
  contextMenuPanel.style.height = height + "px";
  contextMenuPanelMenu.style.height = height + "px";

  console.log("Inserted Context Menu Item", menuItem);
  console.groupEnd();
  return true;
};

/**
 * Adds a new button to the YouTube video player controls (in the lower-right corner)
 * This method checks the configurable "controls" option, so the button is only inserted when appropriate
 * @param {ControlsClickEventHandler} clickEventHandler the click event handler function for the button
 */
const InsertPlayerControlsButton = async (clickEventHandler) => {
  console.group("[YouTubeCustomControls] InsertPlayerControlsButton()");

  if (IsPopoutPlayer(window.location)) {
    const controls = await Options.GetLocalOption("behavior", "controls");
    if (controls.toLowerCase() !== "extended") {
      console.info('Popout Player controls option is NOT set to "extended"');
      console.groupEnd();
      return false;
    }
  }

  const controls = document.getElementsByClassName("ytp-right-controls")[0];
  if (!controls) {
    console.info("Missing player controls");
    console.groupEnd();
    return false;
  }

  let playerButton = controls.getElementsByClassName("ytp-popout-button")[0];
  if (playerButton) {
    console.info("#popout-player-control-button already exists", playerButton);
    console.groupEnd();
    return false;
  }

  const fullScreenButton = controls.getElementsByClassName(
    "ytp-fullscreen-button"
  )[0];
  if (!fullScreenButton) {
    console.info("Missing player controls full screen button");
    console.groupEnd();
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
  playerButton.addEventListener("click", clickEventHandler, false);

  // TODO: this doesn't work (`fullScreenButton["onmouseover"]` is null); need another way to implement the fancy tooltip
  playerButton.addEventListener(
    "mouseover",
    fullScreenButton["onmouseover"],
    false
  );

  controls.insertBefore(playerButton, fullScreenButton);

  console.log("Inserted Button", playerButton);
  console.groupEnd();
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
