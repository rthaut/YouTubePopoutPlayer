import HTML5Player from './HTML5Player.class';

const YouTubePopoutPlayer = (() => {

    /**
     * YouTube Popout Player library
     */
    class YouTubePopoutPlayer {

        constructor() {
            console.group('YouTubePopoutPlayer()');

            this.insertControls();
            this.watchPageChange();

            browser.runtime.onMessage.addListener((message, sender) => {
                console.log('[Content] YouTubePopoutPlayer Runtime Message', message, sender);

                if (message.action !== undefined) {

                    switch (message.action.toLowerCase()) {

                        case 'open-popout-command':
                            this.openPopout();
                            return;

                    }

                    console.log('[Content] YouTubePopoutPlayer Runtime Message :: Unhandled Action');
                    return;
                }
            });

            console.groupEnd();
        }

        /**
         * Gets the YouTube video ID from the supplied html player element
         * @param {HTMLElement} player
         * @return {String}
         */
        getVideoIDFromPlayer(player) {
            console.group('YouTubePopoutPlayer.getVideoIDFromPlayer()');

            const id = this.getVideoIDFromURL(player.baseURI);

            console.log('Return', id);
            console.groupEnd();
            return id;
        }

        /**
         * Gets the YouTube video ID from the specified YouTube URL
         * @param {String} url
         * @return {String}
         */
        getVideoIDFromURL(url) {
            console.group('YouTubePopoutPlayer.getVideoIDFromURL()');

            let id = null;

            const result = new RegExp(/(?:(?:v=)|(?:\/embed\/)|(?:\/youtu\.be\/))([^\?\&\/]{11})/).exec(url);
            console.log('RegExp Result', result);

            if (result && result[1]) {
                id = result[1];
            }

            console.log('Return', id);
            console.groupEnd();
            return id;
        }

        /**
         * Gets the YouTube playlist ID from the specified YouTube URL
         * @param {String} url
         * @return {String}
         */
        getPlaylistIDFromURL(url) {
            console.group('YouTubePopoutPlayer.getPlaylistIDFromURL()');

            let id = null;

            const result = new RegExp(/list=((?:WL|[^\?\&\/]+))/).exec(url);
            console.log('RegExp Result', result);

            if (result && result[1]) {
                id = result[1];
            }

            console.log('Return', id);
            console.groupEnd();
            return id;
        }

        /**
         * Inserts the various control elements
         */
        insertControls() {
            console.group('YouTubePopoutPlayer.insertControls()');

            this.insertContextMenuEntry();
            this.insertPlayerControlsButton();

            console.log('Controls inserted');
            console.groupEnd();
        }

        /**
         * Appends a new entry to the context (right-click) menu of the YouTube video player
         */
        insertContextMenuEntry() {
            console.group('YouTubePopoutPlayer.insertControls()');

            const menu = document.getElementsByClassName('ytp-contextmenu')[0];

            if (!menu) {
                console.info('Missing context menu');
                console.groupEnd();
                return false;
            }

            const target = menu.getElementsByClassName('ytp-panel')[0].getElementsByClassName('ytp-panel-menu')[0];

            let menuItem = document.getElementById('popout-player-context-menu-item');
            if (menuItem) {
                console.info('#popout-player-context-menu-item already exists', menuItem);
                console.groupEnd();
                return false;
            }

            menuItem = document.createElement('div');
            menuItem.className = 'ytp-menuitem';
            menuItem.setAttribute('aria-haspopup', false);
            menuItem.setAttribute('role', 'menuitem');
            menuItem.setAttribute('tabindex', 0);
            menuItem.id = 'popout-player-context-menu-item';

            const menuItemLabel = document.createElement('div');
            menuItemLabel.className = 'ytp-menuitem-label';
            menuItemLabel.innerText = browser.i18n.getMessage('ContextMenuEntryLabel_PopoutPlayer');

            const menuItemContent = document.createElement('div');
            menuItemContent.className = 'ytp-menuitem-content';

            menuItem.appendChild(menuItemLabel);
            menuItem.appendChild(menuItemContent);
            menuItem.addEventListener('click', event => {
                console.log('Context Menu Item Click', event);
                this.openPopout();
            }, false);

            target.appendChild(menuItem);
            console.info('Inserting context menu entry', menuItem);

            const contextMenus = document.getElementsByClassName('ytp-contextmenu');
            const contextMenu = contextMenus[contextMenus.length - 1];
            const contextMenuPanel = contextMenu.getElementsByClassName('ytp-panel')[0];
            const contextMenuPanelMenu = contextMenuPanel.getElementsByClassName('ytp-panel-menu')[0];

            const height = (contextMenu.offsetHeight + menuItem.offsetHeight);
            console.info('Modifying context menu height to ' + height + 'px', contextMenu);

            contextMenu.style.height = height + 'px';
            contextMenuPanel.style.height = height + 'px';
            contextMenuPanelMenu.style.height = height + 'px';

            console.log('Inserted Context Menu Item', menuItem);
            console.groupEnd();
        }

        /**
         * Adds a new button to the YouTube video player controls (in the lower-right corner)
         */
        insertPlayerControlsButton() {
            console.group('YouTubePopoutPlayer.insertPlayerControlsButton()');

            const controls = document.getElementsByClassName('ytp-right-controls')[0];
            if (!controls) {
                console.info('Missing player controls');
                console.groupEnd();
                return false;
            }

            const fullScreenButton = controls.getElementsByClassName('ytp-fullscreen-button')[0];
            if (!fullScreenButton) {
                console.info('Missing player controls full screen button');
                console.groupEnd();
                return false;
            }

            let playerButton = controls.getElementsByClassName('ytp-popout-button')[0];
            if (playerButton) {
                console.info('#popout-player-control-button already exists', playerButton);
                console.groupEnd();
                return false;
            }

            // TODO: use the SVG file, now that `web_accessible_resources` in the manifest permits access to the images directory?

            const xmlns = 'http://www.w3.org/2000/svg';
            const xlink = 'http://www.w3.org/1999/xlink';

            const playerButtonSVG = document.createElementNS(xmlns, 'svg');
            playerButtonSVG.setAttribute('width', '100%');
            playerButtonSVG.setAttribute('height', '100%');
            playerButtonSVG.setAttribute('viewBox', '0 0 36 36');
            playerButtonSVG.setAttribute('version', '1.1');

            const playerButtonSVGPath01 = document.createElementNS(xmlns, 'path');
            playerButtonSVGPath01.id = 'ytp-svg-pop-01';
            playerButtonSVGPath01.setAttributeNS(null, 'd', 'm 8,8 v 20 h 20 v -6 h -2 v 4 H 10 V 10 h 4 V 8 Z');
            playerButtonSVGPath01.setAttributeNS(null, 'class', 'ytp-svg-fill');

            const playerButtonSVGPath02 = document.createElementNS(xmlns, 'path');
            playerButtonSVGPath02.id = 'ytp-svg-pop-02';
            playerButtonSVGPath02.setAttributeNS(null, 'd', 'M 28,8 H 18 l 3,3 -7,8 3,3 8,-7 3,3 z');
            playerButtonSVGPath02.setAttributeNS(null, 'class', 'ytp-svg-fill');

            const playerButtonSVGUse01 = document.createElementNS(xmlns, 'use');
            playerButtonSVGUse01.setAttributeNS(null, 'class', 'ytp-svg-shadow');
            playerButtonSVGUse01.setAttributeNS(xlink, 'href', '#' + playerButtonSVGPath01.id);

            const playerButtonSVGUse02 = document.createElementNS(xmlns, 'use');
            playerButtonSVGUse02.setAttributeNS(null, 'class', 'ytp-svg-shadow');
            playerButtonSVGUse02.setAttributeNS(xlink, 'href', '#' + playerButtonSVGPath02.id);

            playerButtonSVG.appendChild(playerButtonSVGUse01);
            playerButtonSVG.appendChild(playerButtonSVGPath01);
            playerButtonSVG.appendChild(playerButtonSVGUse02);
            playerButtonSVG.appendChild(playerButtonSVGPath02);

            playerButton = document.createElement('button');
            playerButton.className = ['ytp-popout-button', 'ytp-button'].join(' ');
            playerButton.id = 'popout-player-control-button';
            playerButton.setAttribute('title', browser.i18n.getMessage('PlayerControlsButtonTitle_PopoutPlayer'));
            playerButton.appendChild(playerButtonSVG);
            playerButton.addEventListener('click', event => {
                console.log('Player Controls Button Click', event);
                this.openPopout();
            }, false);

            controls.insertBefore(playerButton, fullScreenButton);

            console.log('Inserted Button', playerButton);
            console.groupEnd();
        }

        /**
         * Click event handler for any of the popout player controls
         * @param {Event} event
         */
        openPopout() {
            console.log('YouTubePopoutPlayer.openPopout()');

            const container = document.getElementById('movie_player') || document.getElementById('player');
            const video = container.querySelector('video');
            const player = new HTML5Player(video);

            let id = this.getVideoIDFromPlayer(player.getVideo());
            if (id === undefined || id === null || id.length === 0) {
                // fallback to parsing the video ID from the page's address
                id = this.getVideoIDFromURL(window.location.href);
            }

            browser.runtime.sendMessage({
                'action': 'open-popout',
                'data': {
                    'id': id,
                    'list': this.getPlaylistIDFromURL(window.location.href),
                    'time': player.getTime(),
                    'width': player.getWidth(),
                    'height': player.getHeight()
                }
            }).then(response => {
                if (response !== undefined) {
                    console.log('YouTubePopoutPlayer.openPopout() :: Action "open-popout" response', response);
                }
                player.pause();

                // note: the background script will only close the original tab when appropriate
                return browser.runtime.sendMessage({
                    'action': 'close-original-tab'
                });
            }).then(response => {
                if (response !== undefined) {
                    console.log('YouTubePopoutPlayer.openPopout() :: Action "close-original-tab" response', response);
                }
            }).catch(error => {
                console.error('YouTubePopoutPlayer.openPopout() :: Error', error);
            });
        }

        /**
         * Watches the DOM for changes and re-inserts controls as needed
         */
        watchPageChange() {
            console.group('YouTubePopoutPlayer.watchPageChange()');

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes != null) {
                        for (const node of mutation.addedNodes) {
                            switch (node.className) {
                                case 'ytp-popup ytp-contextmenu':
                                    console.log('Mutation observed for context menu', node);
                                    this.insertContextMenuEntry();
                                    break;

                                case 'ytp-right-controls':
                                    console.log('Mutation observed for player controls', node);
                                    this.insertPlayerControlsButton();
                                    break;
                            }
                        }
                    }
                });
            });

            observer.observe(document.body, {
                'childList': true,
                'subtree': true
            });

            console.log('Mutation Observer watching for changes', observer);
            console.groupEnd();
        }

    }

    return YouTubePopoutPlayer;

})();

export default YouTubePopoutPlayer;
