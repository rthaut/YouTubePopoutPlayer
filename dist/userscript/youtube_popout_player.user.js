// ==UserScript==
// @name        YouTube Popout Player
// @author      Ryan Thaut <rthaut@gmail.com> (http://ryanthaut.com)
// @description Provides a simple way to open any YouTube video in a popout window
// @version     2.1.3
// @namespace   https://github.com/rthaut/YouTubePopoutPlayer
// @updateURL   https://github.com/rthaut/YouTubePopoutPlayer/raw/master/dist/userscript/youtube_popout_player.user.min.js
// @downloadURL https://github.com/rthaut/YouTubePopoutPlayer/raw/master/dist/userscript/youtube_popout_player.user.min.js
// @include     http://*youtube.com/*
// @include     http://*youtube-nocookie.com/*
// @include     https://*youtube.com/*
// @include     https://*youtube-nocookie.com/*
// ==/UserScript==
/**
 * YouTube Popout Player - Provides a simple way to open any YouTube video in a popout window
 * @version v2.1.3
 * @link https://github.com/rthaut/YouTubePopoutPlayer
 * @license GPL-3.0
 */
(function () {
'use strict';

const HTML5Player = (() => {

    /**
     * Utility class for retrieving configuration settings from the HTML5 video player
     */
    class HTML5Player {

        constructor() {
            console.group('HTML5Player()');

            this.container = null;
            this.player = null;

            // find the video player's container and store a reference to it
            this.container = document.getElementById('movie_player') || document.getElementById('player');
            if (this.container) {
                console.log('Found container', this.container);

                // find the video player and store a reference to it
                this.player = this.container.getElementsByTagName('video')[0];
                if (this.player) {
                    console.log('Found <video> element', this.player);
                }
            }

            console.groupEnd();
        }

        /**
         * Pauses the HTML5 video player
         */
        pause() {
            console.group('HTML5Player.pause()');

            if (this.player) {
                console.log('Pausing video player', this.player);
                this.player.pause();
            }

            console.groupEnd();
        }

        /**
         * Removes the HTML5 player's parent element from the DOM
         */
        remove() {
            console.group('HTML5Player.remove()');

            if (this.container) {
                console.log('Removing container element', this.container);
                this.container.remove();
            }

            console.groupEnd();
        }

        /**
         * Gets the current width of the HTML5 video player
         * @return {Integer}
         */
        getWidth() {
            console.group('HTML5Player.getWidth()');

            console.log('Return', this.player ? this.player.clientWidth : null);
            console.groupEnd();

            return this.player ? this.player.clientWidth : null;
        }

        /**
         * Gets the current height of the HTML5 video player
         * @return {Integer}
         */
        getHeight() {
            console.group('HTML5Player.getHeight()');

            console.log('Return', this.player ? this.player.clientHeight : null);
            console.groupEnd();

            return this.player ? this.player.clientHeight : null;
        }

        /**
         * Gets the elapsed time of the playing video
         * @return {Integer}
         */
        getTime() {
            console.group('HTML5Player.getTime()');

            console.log('Return', this.player ? parseInt(this.player.currentTime, 10) : null);
            console.groupEnd();

            return this.player ? parseInt(this.player.currentTime, 10) : null;
        }

    }

    return HTML5Player;

})();

const YouTubePopoutPlayer = (() => {

    /**
     * YouTube Popout Player library
     */
    class YouTubePopoutPlayer {

        constructor() {
            console.group('YouTubePopoutPlayer()');

            //@TODO convert these into user-configurable settings
            this.defaults = {
                'width': 854,
                'height': 480,
                'startThreshold': 5
            };
            console.log('defaults', this.defaults);

            console.groupEnd();
        }

        /**
         * Gets the YouTube video ID from the supplied html player element
         * @param {HTMLElement} player
         * @return {String}
         */
        getVideoIDFromPlayer(player) {
            console.group('YouTubePopoutPlayer.getVideoIDFromPlayer()');

            var id = this.getVideoIDFromURL(player.baseURI);

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

            var id = null;

            var result = new RegExp(/(?:(?:v=)|(?:\/embed\/)|(?:\/youtu\.be\/))([^\?\&\/]{11})/).exec(url);
            console.log(result);

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

            var id = null;

            var result = new RegExp(/list=((?:WL|[^\?\&\/]+))/).exec(url);
            console.log(result);

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

            console.groupEnd();
        }

        /**
         * Appends a new entry to the context (right-click) menu of the YouTube video player
         */
        insertContextMenuEntry() {
            console.group('YouTubePopoutPlayer.insertControls()');

            var menu = document.getElementsByClassName('ytp-contextmenu')[0];

            if (!menu) {
                console.warn('Missing context menu');
                console.groupEnd();
                return false;
            }

            var target = menu.getElementsByClassName('ytp-panel')[0].getElementsByClassName('ytp-panel-menu')[0];

            var menuItem = document.getElementById('popout-player-context-menu-item');
            if (menuItem) {
                console.warn('#popout-player-context-menu-item already exists', menuItem);
                console.groupEnd();
                return false;
            }

            menuItem = document.createElement('div');
            menuItem.className = 'ytp-menuitem';
            menuItem.setAttribute('aria-haspopup', false);
            menuItem.setAttribute('role', 'menuitem');
            menuItem.setAttribute('tabindex', 0);
            menuItem.id = 'popout-player-context-menu-item';

            var menuItemLabel = document.createElement('div');
            menuItemLabel.className = 'ytp-menuitem-label';
            menuItemLabel.innerText = "Popout Player";

            var menuItemContent = document.createElement('div');
            menuItemContent.className = 'ytp-menuitem-content';

            menuItem.appendChild(menuItemLabel);
            menuItem.appendChild(menuItemContent);
            menuItem.addEventListener('click', function () {
                this.onClick();
            }.bind(this), false);

            target.appendChild(menuItem);
            console.info('Inserting context menu entry', menuItem);

            var contextMenus = document.getElementsByClassName('ytp-contextmenu');
            var contextMenu = contextMenus[contextMenus.length - 1];
            var contextMenuPanel = contextMenu.getElementsByClassName('ytp-panel')[0];
            var contextMenuPanelMenu = contextMenuPanel.getElementsByClassName('ytp-panel-menu')[0];

            var height = (contextMenu.offsetHeight + menuItem.offsetHeight);
            console.info('Modifying context menu height to ' + height + 'px', contextMenu);

            contextMenu.style.height = height + 'px';
            contextMenuPanel.style.height = height + 'px';
            contextMenuPanelMenu.style.height = height + 'px';

            console.groupEnd();
        }

        /**
         * Adds a new button to the YouTube video player controls (in the lower-right corner)
         */
        insertPlayerControlsButton() {
            console.group('YouTubePopoutPlayer.insertPlayerControlsButton()');

            var controls = document.getElementsByClassName('ytp-right-controls')[0];
            if (!controls) {
                console.warn('Missing player controls');
                console.groupEnd();
                return false;
            }

            var fullScreenButton = controls.getElementsByClassName('ytp-fullscreen-button')[0];
            if (!fullScreenButton) {
                console.warn('Missing player controls full screen button');
                console.groupEnd();
                return false;
            }

            var playerButton = controls.getElementsByClassName('ytp-popout-button')[0];
            if (playerButton) {
                console.warn('#popout-player-control-button already exists', playerButton);
                console.groupEnd();
                return false;
            }

            var xmlns = 'http://www.w3.org/2000/svg';
            var xlink = 'http://www.w3.org/1999/xlink';

            var playerButtonSVG = document.createElementNS(xmlns, 'svg');
            playerButtonSVG.setAttribute('width', '100%');
            playerButtonSVG.setAttribute('height', '100%');
            playerButtonSVG.setAttribute('viewBox', '0 0 36 36');
            playerButtonSVG.setAttribute('version', '1.1');

            var playerButtonSVGPath01 = document.createElementNS(xmlns, 'path');
            playerButtonSVGPath01.id = 'ytp-svg-pop-01';
            playerButtonSVGPath01.setAttributeNS(null, 'd', 'm 8,8 v 20 h 20 v -6 h -2 v 4 H 10 V 10 h 4 V 8 Z');
            playerButtonSVGPath01.setAttributeNS(null, 'class', 'ytp-svg-fill');

            var playerButtonSVGPath02 = document.createElementNS(xmlns, 'path');
            playerButtonSVGPath02.id = 'ytp-svg-pop-02';
            playerButtonSVGPath02.setAttributeNS(null, 'd', 'M 28,8 H 18 l 3,3 -7,8 3,3 8,-7 3,3 z');
            playerButtonSVGPath02.setAttributeNS(null, 'class', 'ytp-svg-fill');

            var playerButtonSVGUse01 = document.createElementNS(xmlns, 'use');
            playerButtonSVGUse01.setAttributeNS(null, 'class', 'ytp-svg-shadow');
            playerButtonSVGUse01.setAttributeNS(xlink, 'href', '#' + playerButtonSVGPath01.id);

            var playerButtonSVGUse02 = document.createElementNS(xmlns, 'use');
            playerButtonSVGUse02.setAttributeNS(null, 'class', 'ytp-svg-shadow');
            playerButtonSVGUse02.setAttributeNS(xlink, 'href', '#' + playerButtonSVGPath02.id);

            playerButtonSVG.appendChild(playerButtonSVGUse01);
            playerButtonSVG.appendChild(playerButtonSVGPath01);
            playerButtonSVG.appendChild(playerButtonSVGUse02);
            playerButtonSVG.appendChild(playerButtonSVGPath02);

            playerButton = document.createElement('button');
            playerButton.className = ['ytp-popout-button', 'ytp-button'].join(' ');
            playerButton.id = 'popout-player-control-button';
            playerButton.setAttribute('title', "Popout Player");
            playerButton.appendChild(playerButtonSVG);
            playerButton.addEventListener('click', function () {
                this.onClick();
            }.bind(this), false);

            controls.insertBefore(playerButton, fullScreenButton);

            console.groupEnd();
        }

        /**
         * Click event handler for any of the popout player controls
         * @param {Event} event
         */
        onClick(event) {
            console.group('YouTubePopoutPlayer.onClick()');

            var player = new HTML5Player();

            player.pause();

            var id = this.getVideoIDFromPlayer(player.player) || this.getVideoIDFromURL(window.location.href);
            var list = this.getPlaylistIDFromURL(window.location.href);

            var time = player.getTime() || 0;
            if (time <= this.defaults.startThreshold) {
                console.info('Popout video will start from beginning');
                time = 0;
            }

            var attrs = {};

            if (list != null) {
                attrs.list = list;
            }

            attrs.start = time;
            attrs.autoplay = 1;

            var opts = {
                'width': player.getWidth() || this.defaults.width,
                'height': player.getHeight() || this.defaults.height,
                'scrollbars': 'no',
                'toolbar': 'no'
            };

            player.pause();
            this.popoutPlayer(id, attrs, opts);

            console.groupEnd();
        }

        /**
         * Opens the specified video in a new popout window
         * @param {String} id
         * @param {Object} [attrs]
         * @param {Object} [opts]
         */
        popoutPlayer(id, attrs, opts) {
            console.group('YouTubePopoutPlayer.popoutPlayer()');

            console.log('id', id);
            console.log('attrs', attrs);
            console.log('opts', opts);

            var location = 'https://www.youtube.com/embed/' + id + '?';

            if (attrs !== undefined) {
                for (var attr in attrs) {
                    location += attr + '=' + attrs[attr] + '&';
                }
                location = location.replace(/\&$/, ''); // trim trailing ampersand (&)
            }

            var options = '';
            if (opts !== undefined) {
                for (var opt in opts) {
                    options += opt + '=' + opts[opt] + ',';
                }
                options = options.replace(/\,$/, ''); // trim trailing comma (,)
            }

            console.log('location', location);
            console.log('options', options);

            var popout = window.open(location, id, options);
            console.log('Opened window', popout);

            console.groupEnd();
        }

        /**
         * Watches the DOM for changes and re-inserts controls as needed
         */
        watchPageChange() {
            console.group('YouTubePopoutPlayer.watchPageChange()');

            var self = this;

            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes != null) {
                        for (var i = 0; i < mutation.addedNodes.length; i++) {
                            switch (mutation.addedNodes[i].className) {
                                case 'ytp-popup ytp-contextmenu':
                                    console.log('Mutation observed for context menu', mutation.addedNodes[i]);
                                    self.insertContextMenuEntry();
                                    break;

                                case 'ytp-right-controls':
                                    console.log('Mutation observed for player controls', mutation.addedNodes[i]);
                                    self.insertPlayerControlsButton();
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

            console.groupEnd();
        }

        /**
         * Initializes the YouTube Popout Player functionality
         */
        run() {
            console.group('YouTubePopoutPlayer.initialize()');

            this.insertControls();
            this.watchPageChange();

            console.groupEnd();
        }

    }

    return YouTubePopoutPlayer;

})();

(function () {
    var ytPopoutPlayer = new YouTubePopoutPlayer();
    ytPopoutPlayer.run();
})();

}());
