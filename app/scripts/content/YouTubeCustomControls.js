import Options from "../helpers/options";
import { IsPopoutPlayer } from "../helpers/utils";

/**
 * @callback PopoutControlClickEventHandler
 * @param {MouseEvent} event
 * @param {object} [data={}] optional data for opening popout player
 */

/**
 * Inserts the various control elements and watches the DOM for changes to re-insert controls as needed
 * @param {object} params
 * @param {PopoutControlClickEventHandler} params.openPopoutPlayerClickHandler the click event handler for the popout player controls
 * @param {boolean} [params.insertVideoRotationControls=false] if the video rotation controls should be inserted
 */
export const InsertControlsAndWatch = async ({
  openPopoutPlayerClickHandler,
  insertVideoRotationControls = false,
}) => {
  await InsertControls(
    openPopoutPlayerClickHandler,
    insertVideoRotationControls
  );
  WatchForPageChanges(
    openPopoutPlayerClickHandler,
    insertVideoRotationControls
  );
};

/**
 * Inserts the various control elements
 * @param {PopoutControlClickEventHandler} openPopoutPlayerClickHandler the click event handler for the controls
 * @param {boolean} [insertVideoRotationControls=false] if the video rotation controls should be inserted
 */
export const InsertControls = async (
  openPopoutPlayerClickHandler,
  insertVideoRotationControls = false
) => {
  console.group("[YouTubeCustomControls] InsertControls()");

  try {
    InsertPopoutEntryIntoContextMenu(openPopoutPlayerClickHandler);
  } catch (error) {
    console.error("Failed to insert context menu entry control", error);
  }

  try {
    await InsertPopoutButtonIntoPlayerControls(openPopoutPlayerClickHandler);
  } catch (error) {
    console.error("Failed to insert button control", error);
  }

  if (insertVideoRotationControls) {
    InsertRotationButtonsIntoPlayerControls();
  }

  console.groupEnd();
};

/**
 * Watches the DOM for changes and re-inserts controls as needed
 * @param {PopoutControlClickEventHandler} openPopoutPlayerClickHandler the click event handler for the controls
 * @param {boolean} [insertVideoRotationControls=false] if the video rotation controls should be re-inserted
 */
export const WatchForPageChanges = (
  openPopoutPlayerClickHandler,
  insertVideoRotationControls = false
) => {
  console.group("[YouTubeCustomControls] WatchForPageChanges()");

  const observer = new MutationObserver((mutations) => {
    mutations
      .filter((mutation) => mutation.addedNodes !== null)
      .forEach((mutation) => {
        for (const node of mutation.addedNodes) {
          switch (node.className) {
            case "ytp-popup ytp-contextmenu":
              console.log(
                "[YouTubeCustomControls] WatchForPageChanges() :: Mutation observed for context menu",
                node
              );
              InsertPopoutEntryIntoContextMenu(openPopoutPlayerClickHandler);
              break;

            case "ytp-right-controls":
              console.log(
                "[YouTubeCustomControls] WatchForPageChanges() :: Mutation observed for player controls",
                node
              );
              InsertPopoutButtonIntoPlayerControls(
                openPopoutPlayerClickHandler
              );
              if (insertVideoRotationControls) {
                InsertRotationButtonsIntoPlayerControls();
              }
              break;
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
 * @param {PopoutControlClickEventHandler} clickEventHandler the click event handler for the content menu entry
 */
const InsertPopoutEntryIntoContextMenu = (clickEventHandler) => {
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
  menuItem.addEventListener(
    "click",
    (event) => clickEventHandler(event),
    false
  );

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

  console.log("Inserted open popout player context menu item", menuItem);
  console.groupEnd();
  return true;
};

/**
 * Adds a new button to the YouTube video player controls (in the lower-right corner)
 * This method checks the configurable "controls" option, so the button is only inserted when appropriate
 * @param {PopoutControlClickEventHandler} clickEventHandler the click event handler for the button
 */
const InsertPopoutButtonIntoPlayerControls = async (clickEventHandler) => {
  console.group("[YouTubeCustomControls] InsertPlayerControlsButton()");

  if (IsPopoutPlayer(window.location)) {
    const controls = await Options.GetLocalOption("behavior", "controls");
    if (controls.toLowerCase() !== "extended") {
      console.info('Popout player controls option is NOT set to "extended"');
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
  playerButton.addEventListener(
    "click",
    (event) => clickEventHandler(event),
    false
  );

  // TODO: this doesn't work (`fullScreenButton["onmouseover"]` is null); need another way to implement the fancy tooltip
  playerButton.addEventListener(
    "mouseover",
    fullScreenButton["onmouseover"],
    false
  );

  controls.insertBefore(playerButton, fullScreenButton);

  console.log("Inserted open popout player button", playerButton);
  console.groupEnd();
  return true;
};

const InsertRotationButtonsIntoPlayerControls = () => {
  try {
    console.group(
      "[YouTubeCustomControls] InsertRotationButtonsIntoPlayerControls()"
    );

    const controls = document.getElementsByClassName("ytp-right-controls")[0];
    if (!controls) {
      console.info("Missing player controls");
      console.groupEnd();
      return false;
    }

    const directions = ["left", "right"].reverse();
    for (const direction of directions) {
      let button = controls.querySelector(
        "#ytp-rotate-" + direction + "-button"
      );
      if (button) {
        console.info(
          "#ytp-rotate-" + direction + "-button already exists",
          button
        );
        console.groupEnd();
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
        () => {
          let rotation =
            +document.documentElement.getAttribute("data-ytp-rotation");
          switch (direction) {
            case "left":
              rotation -= 90;
              break;
            case "right":
              rotation += 90;
              break;
          }
          rotation = (rotation + 360) % 360; // convert to position rotation between 0-360
          document.documentElement.setAttribute("data-ytp-rotation", rotation);
        },
        false
      );

      controls.insertBefore(button, controls.querySelector("button"));
      console.log("Inserted rotate " + direction + " button", button);
    }

    console.groupEnd();
    return true;
  } catch (error) {
    console.error(
      "Failed to insert video rotation buttons into player controls",
      error
    );
    return false;
  }
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
      main: "M6.23706 2.0007C6.78897 2.02117 7.21978 2.48517 7.19931 3.03708L7.10148 5.67483C8.45455 4.62548 10.154 4.00001 12 4.00001C16.4183 4.00001 20 7.58174 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 11.4477 4.44772 11 5 11C5.55228 11 6 11.4477 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68631 15.3137 6.00001 12 6.00001C10.4206 6.00001 8.98317 6.60994 7.91098 7.60891L11.3161 8.00677C11.8646 8.07087 12.2573 8.56751 12.1932 9.11607C12.1291 9.66462 11.6325 10.0574 11.0839 9.99326L5.88395 9.38567C5.36588 9.32514 4.98136 8.87659 5.00069 8.35536L5.20069 2.96295C5.22116 2.41104 5.68516 1.98023 6.23706 2.0007Z",
    },
    right: {
      main: "M17.7629 2.0007C17.211 2.02117 16.7802 2.48517 16.8007 3.03708L16.8985 5.67483C15.5455 4.62548 13.846 4.00001 12 4.00001C7.58172 4.00001 4 7.58174 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12C6 8.68631 8.68629 6.00001 12 6.00001C13.5794 6.00001 15.0168 6.60994 16.089 7.60891L12.6839 8.00677C12.1354 8.07087 11.7427 8.56751 11.8068 9.11607C11.8709 9.66462 12.3675 10.0574 12.9161 9.99326L18.1161 9.38567C18.6341 9.32514 19.0186 8.87659 18.9993 8.35536L18.7993 2.96295C18.7788 2.41104 18.3148 1.98023 17.7629 2.0007Z",
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
