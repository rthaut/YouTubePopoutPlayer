import Options from "../helpers/options";
import { IsPopoutPlayer, debounce } from "../helpers/utils";
import { GetVideoIDFromURL, GetPlaylistIDFromURL } from "../helpers/youtube";
import HTML5Player from "./HTML5Player.class";

const sendWindowDimensionsAndPosition = async (action) => {
  const data = {
    dimensions: {
      // important: using innerWidth/innerHeight because we manually adjust the dimensions when opening the window
      width: window.innerWidth,
      height: window.innerHeight,
    },
    position: {
      top: window.screenY,
      left: window.screenX,
    },
  };

  try {
    await browser.runtime.sendMessage({
      action,
      data,
    });
  } catch (error) {
    void error;
  }
};

const YouTubePopoutPlayer = (() => {
  /**
   * YouTube Popout Player library
   */
  class YouTubePopoutPlayer {
    constructor() {
      console.group("YouTubePopoutPlayer()");

      (async () => {
        await this.insertControls();
        this.watchPageChange();
      })();

      browser.runtime.onMessage.addListener(this.onRuntimeMessage);

      if (IsPopoutPlayer(window.location)) {
        window.addEventListener(
          "resize",
          debounce(() => {
            sendWindowDimensionsAndPosition("popout-resized");
          }, 400)
        );

        window.addEventListener(
          "beforeunload",
          debounce(() => {
            sendWindowDimensionsAndPosition("popout-closed");
          }, 0)
        );
      }

      console.groupEnd();
    }

    async onRuntimeMessage(message, sender) {
      console.log(
        "[Content] YouTubePopoutPlayer Runtime Message",
        message,
        sender
      );

      if (message.action !== undefined) {
        switch (message.action.toLowerCase()) {
          case "open-popout-via-command":
            await this.openPopout();
            if (message.data?.closeTab) {
              await this.closeTab(message.data?.enforceDomainRestriction);
            }
        }

        console.log(
          "[Content] YouTubePopoutPlayer Runtime Message :: Unhandled Action"
        );
        return;
      }
    }

    /**
     * Gets the YouTube video ID from the supplied html player element
     * @param {HTMLElement} player
     * @return {String}
     */
    getVideoIDFromPlayer(player) {
      console.group("YouTubePopoutPlayer.getVideoIDFromPlayer()");

      const id = GetVideoIDFromURL(player.baseURI);

      console.log("Return", id);
      console.groupEnd();
      return id;
    }

    /**
     * Inserts the various control elements
     */
    async insertControls() {
      console.group("YouTubePopoutPlayer.insertControls()");

      this.insertContextMenuEntry();
      await this.insertPlayerControlsButton();

      console.groupEnd();
    }

    /**
     * Appends a new entry to the context (right-click) menu of the YouTube video player
     */
    insertContextMenuEntry() {
      console.group("YouTubePopoutPlayer.insertControls()");

      const menu = document.getElementsByClassName("ytp-contextmenu")[0];

      if (!menu) {
        console.info("Missing context menu");
        console.groupEnd();
        return false;
      }

      const target = menu
        .getElementsByClassName("ytp-panel")[0]
        .getElementsByClassName("ytp-panel-menu")[0];

      let menuItem = document.getElementById("popout-player-context-menu-item");
      if (menuItem) {
        console.info(
          "#popout-player-context-menu-item already exists",
          menuItem
        );
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
        (event) => {
          console.log("Context Menu Item Click", event);
          this.handleControlClickEvent(event);
        },
        false
      );

      target.appendChild(menuItem);
      console.info("Inserting context menu entry", menuItem);

      const contextMenus = document.getElementsByClassName("ytp-contextmenu");
      const contextMenu = contextMenus[contextMenus.length - 1];
      const contextMenuPanel =
        contextMenu.getElementsByClassName("ytp-panel")[0];
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
    }

    /**
     * Adds a new button to the YouTube video player controls (in the lower-right corner)
     * This method checks the configurable "controls" option, so the button is only inserted when appropriate
     */
    async insertPlayerControlsButton() {
      console.group("YouTubePopoutPlayer.insertPlayerControlsButton()");

      if (IsPopoutPlayer(window.location)) {
        const controls = await Options.GetLocalOption("behavior", "controls");
        if (controls !== "extended") {
          console.info(
            'Popout Player controls option is NOT set to "extended"'
          );
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

      const fullScreenButton = controls.getElementsByClassName(
        "ytp-fullscreen-button"
      )[0];
      if (!fullScreenButton) {
        console.info("Missing player controls full screen button");
        console.groupEnd();
        return false;
      }

      let playerButton =
        controls.getElementsByClassName("ytp-popout-button")[0];
      if (playerButton) {
        console.info(
          "#popout-player-control-button already exists",
          playerButton
        );
        console.groupEnd();
        return false;
      }

      const svgNS = "http://www.w3.org/2000/svg";

      const playerButtonSVG = document.createElementNS(svgNS, "svg");
      playerButtonSVG.setAttribute("width", "100%");
      playerButtonSVG.setAttribute("height", "100%");
      playerButtonSVG.setAttribute("viewBox", "0 0 36 36");
      playerButtonSVG.setAttribute("version", "1.1");

      const paths = {
        frame: "m 9,10 v 16 h 18 v -4 h -2 v 2 H 11 V 12 h 3 v -2 z",
        //'arrow': 'M 28,9 H 18 l 3,3 -6,8 2,2 8,-6 3,3 z',
        popout: "M 16,9 V 20 H 28 V 9 Z m 2,2 h 8 v 7 h -8 z",
      };

      for (const name in paths) {
        const pathElement = document.createElementNS(svgNS, "path");
        pathElement.id = "ytp-svg-pop-" + name;
        pathElement.setAttributeNS(null, "d", paths[name]);
        pathElement.setAttributeNS(null, "class", "ytp-svg-fill");

        const useElement = document.createElementNS(svgNS, "use");
        useElement.setAttributeNS(null, "class", "ytp-svg-shadow");
        useElement.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "href",
          "#" + pathElement.id
        );

        playerButtonSVG.appendChild(useElement);
        playerButtonSVG.appendChild(pathElement);
      }

      // TODO: see if we can re-trigger (or fake) the YT method(s) that setup custom tooltips for the buttons?
      //       (the tooltips come from aria-label and display ABOVE the button, making them more visible)
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
      playerButton.appendChild(playerButtonSVG);
      playerButton.addEventListener(
        "click",
        (event) => {
          console.log("Player Controls Button Click", event);
          this.handleControlClickEvent(event);
        },
        false
      );

      controls.insertBefore(playerButton, fullScreenButton);

      console.log("Inserted Button", playerButton);
      console.groupEnd();
    }

    /**
     * Click event handler for the context menu entry and the controls button
     * @param {MouseEvent} event the original click event
     */
    async handleControlClickEvent(event) {
      event.preventDefault();

      await this.openPopout();

      if (await Options.GetLocalOption("advanced", "close")) {
        await this.closeTab(true);
      }
    }

    /**
     * Opens the Popout Player (via a request to the background script)
     */
    async openPopout() {
      console.log("YouTubePopoutPlayer.openPopout()");

      const container =
        document.getElementById("movie_player") ||
        document.getElementById("player");
      const video = container.querySelector("video");
      const player = new HTML5Player(video);

      let id = this.getVideoIDFromPlayer(player.getVideo());
      if (id === undefined || id === null || id.length === 0) {
        // fallback to parsing the video ID from the page's address
        id = GetVideoIDFromURL(window.location.href);
      }

      try {
        const response = await browser.runtime.sendMessage({
          action: "open-popout",
          data: {
            id,
            list: GetPlaylistIDFromURL(window.location.href),
            time: player.getTime(),
            originalVideoWidth: player.getWidth(),
            originalVideoHeight: player.getHeight(),
          },
        });

        if (response !== undefined) {
          console.log(
            'YouTubePopoutPlayer.openPopout() :: Action "open-popout" response',
            response
          );
        }

        player.pause();
      } catch (error) {
        console.error("YouTubePopoutPlayer.openPopout() :: Error", error);
      }
    }

    /**
     * Closes the current tab (via a request to the background script)
     * @param {Boolean} [enforceDomainRestriction] if the tab should only be closed if it is on a known YouTube domain
     */
    async closeTab(enforceDomainRestriction = true) {
      console.log("YouTubePopoutPlayer.closeTab()");

      try {
        const response = await browser.runtime.sendMessage({
          action: "close-tab",
          data: {
            enforceDomainRestriction,
          },
        });

        if (response !== undefined) {
          console.log(
            'YouTubePopoutPlayer.closeTab() :: Action "close-tab" response',
            response
          );
        }
      } catch (error) {
        console.error("YouTubePopoutPlayer.closeTab() :: Error", error);
      }
    }

    /**
     * Watches the DOM for changes and re-inserts controls as needed
     */
    watchPageChange() {
      console.group("YouTubePopoutPlayer.watchPageChange()");

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes != null) {
            for (const node of mutation.addedNodes) {
              switch (node.className) {
                case "ytp-popup ytp-contextmenu":
                  console.log(
                    "YouTubePopoutPlayer.watchPageChange() :: Mutation observed for context menu",
                    node
                  );
                  this.insertContextMenuEntry();
                  break;

                case "ytp-right-controls":
                  console.log(
                    "YouTubePopoutPlayer.watchPageChange() :: Mutation observed for player controls",
                    node
                  );
                  this.insertPlayerControlsButton();
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
    }
  }

  return YouTubePopoutPlayer;
})();

export default YouTubePopoutPlayer;
