import Options from '../../../helpers/Options';
import Utils from '../../../helpers/utils';
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

            url = new URL(url);
            if (url.searchParams !== undefined && url.searchParams !== null) {
                id = url.searchParams.get('list');
            }

            console.log('Return', id);
            console.groupEnd();
            return id;
        }

        /**
         * Inserts the various control elements
         */
        async insertControls() {
            console.group('YouTubePopoutPlayer.insertControls()');

            this.insertContextMenuEntry();
            await this.insertPlayerControlsButton();

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
         * This method checks the configurable "controls" option, so the button is only inserted when appropriate
         */
        async insertPlayerControlsButton() {
            console.group('YouTubePopoutPlayer.insertPlayerControlsButton()');

            if (Utils.IsPopoutPlayer(window.location)) {
                const controls = await Options.GetLocalOption('behavior', 'controls');
                if (controls !== 'extended') {
                    console.info('Popout Player controls option is NOT set to "extended"');
                    console.groupEnd();
                    return false;
                }
            }

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

            const svgNS = 'http://www.w3.org/2000/svg';

            const playerButtonSVG = document.createElementNS(svgNS, 'svg');
            playerButtonSVG.setAttribute('width', '100%');
            playerButtonSVG.setAttribute('height', '100%');
            playerButtonSVG.setAttribute('viewBox', '0 0 36 36');
            playerButtonSVG.setAttribute('version', '1.1');

            const paths = {
                'frame': 'm 9,10 v 16 h 18 v -4 h -2 v 2 H 11 V 12 h 3 v -2 z',
                //'arrow': 'M 28,9 H 18 l 3,3 -6,8 2,2 8,-6 3,3 z',
                'popout': 'M 16,9 V 20 H 28 V 9 Z m 2,2 h 8 v 7 h -8 z'
            };

            for (const name in paths) {
                const pathElement = document.createElementNS(svgNS, 'path');
                pathElement.id = 'ytp-svg-pop-' + name;
                pathElement.setAttributeNS(null, 'd', paths[name]);
                pathElement.setAttributeNS(null, 'class', 'ytp-svg-fill');

                const useElement = document.createElementNS(svgNS, 'use');
                useElement.setAttributeNS(null, 'class', 'ytp-svg-shadow');
                useElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + pathElement.id);

                playerButtonSVG.appendChild(useElement);
                playerButtonSVG.appendChild(pathElement);
            }

            // TODO: see if we can re-trigger (or fake) the YT method(s) that setup custom tooltips for the buttons?
            //       (the tooltips come from aria-label and display ABOVE the button, making them more visible)
            playerButton = document.createElement('button');
            playerButton.className = ['ytp-popout-button', 'ytp-button'].join(' ');
            playerButton.setAttribute('aria-label', browser.i18n.getMessage('PlayerControlsButtonTitle_PopoutPlayer'));
            playerButton.setAttribute('title', browser.i18n.getMessage('PlayerControlsButtonTitle_PopoutPlayer'));
            playerButton.id = 'popout-player-control-button';
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
         * Opens the Popout Player (via a request to the background script)
         */
        async openPopout() {
            console.log('YouTubePopoutPlayer.openPopout()');

            const container = document.getElementById('movie_player') || document.getElementById('player');
            const video = container.querySelector('video');
            const player = new HTML5Player(video);

            let id = this.getVideoIDFromPlayer(player.getVideo());
            if (id === undefined || id === null || id.length === 0) {
                // fallback to parsing the video ID from the page's address
                id = this.getVideoIDFromURL(window.location.href);
            }

            const data = {
                'id': id,
                'list': this.getPlaylistIDFromURL(window.location.href),
                'time': player.getTime(),
                'width': player.getWidth(),
                'height': player.getHeight()
            };

            let opened = false;
            if (await Options.GetLocalOption('experimental', 'useNewOpener')) {
                opened = await this.openPopoutViaBackgroundScript(data);
            } else {
                opened = await this.openPopoutViaContentScript(data, id);
            }

            if (opened) {
                player.pause();

                // note: the background script will only close the original window/tab when appropriate
                return browser.runtime.sendMessage({
                    'action': 'close-original-tab'
                }).catch(error => {
                    console.error('YouTubePopoutPlayer.openPopout() :: Failed to close original window/tab', error);
                });
            }
        }

        /**
         * Opens the popout player via the content script (using `window.open()`)
         * @param {object} data data from the original video player ({id, list, time, width, height})
         * @param {string} id the ID of the original video
         * @returns {boolean} whether the popout player was opened successfully or not
         */
        async openPopoutViaContentScript(data, id) {
            console.log('YouTubePopoutPlayer.openPopoutViaContentScript()', data, id);

            try {
                data = await browser.runtime.sendMessage({
                    'action': 'get-data-for-popout',
                    'data': data
                });

                console.log('YouTubePopoutPlayer.openPopoutViaContentScript() :: Popout data', data);

                const options = {
                    'width': data.width,
                    'height': data.height,
                    'scrollbars': 'no',
                    'toolbar': 'no'
                };
                const optionString = Object.keys(options).map(opt => opt + '=' + options[opt]).join(',');

                var popout = window.open(data.url, id, optionString);
                console.log('YouTubePopoutPlayer.openPopoutViaContentScript() :: Opened popout', popout, options);

                console.log('YouTubePopoutPlayer.openPopoutViaContentScript() :: Return', (popout !== null));
                return (popout !== null);
            } catch (error) {
                console.error('YouTubePopoutPlayer.openPopoutViaContentScript() :: Failed to open popout', error);

                console.log('YouTubePopoutPlayer.openPopoutViaContentScript() :: Return', false);
                return false;
            }
        }

        /**
         * Opens the popout player via the background script (using `browser.windows.create()` or `browser.tabs.create()`)
         * @param {object} data data from the original video player ({id, list, time, width, height})
         * @returns {boolean} whether the popout player was opened successfully or not
         */
        async openPopoutViaBackgroundScript(data) {
            console.log('YouTubePopoutPlayer.openPopoutViaBackgroundScript()', data);

            try {
                await browser.runtime.sendMessage({
                    'action': 'open-popout',
                    'data': data
                });

                console.log('YouTubePopoutPlayer.openPopoutViaBackgroundScript() :: Return', true);
                return true;
            } catch(error) {
                console.error('YouTubePopoutPlayer.openPopoutViaBackgroundScript() :: Failed to open popout', error);

                console.log('YouTubePopoutPlayer.openPopoutViaBackgroundScript() :: Return', false);
                return false;
            }
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
                                    console.log('YouTubePopoutPlayer.watchPageChange() :: Mutation observed for context menu', node);
                                    this.insertContextMenuEntry();
                                    break;

                                case 'ytp-right-controls':
                                    console.log('YouTubePopoutPlayer.watchPageChange() :: Mutation observed for player controls', node);
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
