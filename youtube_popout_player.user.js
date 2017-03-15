// ==UserScript==
// @name        YouTube Popout Player
// @author      Ryan Thaut
// @description
// @namespace   http://repo.ryanthaut.com/userscripts/youtube_popout_player
// @updateURL   http://repo.ryanthaut.com/userscripts/youtube_popout_player/youtube_popout_player.meta.js
// @downloadURL http://repo.ryanthaut.com/userscripts/youtube_popout_player/youtube_popout_player.user.js
// @include     *//www.youtube.com/*
// @version     1.2.0
// @grant       none
// ==/UserScript==

'use strict';

const DEBUG = false;

var YouTubePopoutPlayer = {
    defaults: {
        width: 854,
        height: 480,
        startThreshold: 5
    },

    getVideoID: function () {
        var match = window.location.href.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(watch\?))\??v?=?([^#\&\?]*).*/);
        return (match && match[7].length == 11) ? match[7] : null;
    },

    insertControls: function () {
        if (DEBUG) console.group('YouTubePopoutPlayer.insertControls()');

        this.insertContextMenuEntry();
        this.insertActionButton();

        if (DEBUG) console.groupEnd();
    },

    insertActionButton: function () {
        if (DEBUG) console.group('YouTubePopoutPlayer.insertControls()');

        var btn = document.getElementById('popout-player-button');
        if (btn) {
            if (DEBUG) console.warn('#popout-player-button already exists', btn);
            if (DEBUG) console.groupEnd();
            return false;
        }

        var target = document.getElementById('watch7-action-buttons') ||
            document.getElementById('watch8-secondary-actions');

        if (!target) {
            if (DEBUG) console.warn('Missing #watch7-action-buttons & #watch8-secondary-actions');
            if (DEBUG) console.groupEnd();
            return false;
        } else {
            if (DEBUG) console.log('Found #' + target.id, target);
        }

        var lbl = document.createElement('span');
        lbl.className = 'yt-uix-button-content';
        lbl.innerHTML = 'Popout';

        var btnClasses = [
            'yt-uix-button',
            'yt-uix-button-size-default',
            'yt-uix-button-opacity',
            'yt-uix-button-has-icon',
            'no-icon-markup',
            'pause-resume-autoplay',
            'yt-uix-tooltip',
            'yt-uix-button-toggled'
        ];

        btn = document.createElement('button');
        btn.id = 'popout-player-button';
        btn.className = btnClasses.join(' ');
        btn.appendChild(lbl);
        btn.addEventListener('click', this.onClick, false);

        target.appendChild(btn);
        if (DEBUG) console.log('Inserted <button>', btn);

        if (DEBUG) console.groupEnd();
    },

    insertContextMenuEntry: function () {
        if (DEBUG) console.group('YouTubePopoutPlayer.insertControls()');

        var menu = document.getElementsByClassName('ytp-contextmenu')[0];

        if (!menu) {
            if (DEBUG) console.warn('Missing context menu');
            if (DEBUG) console.groupEnd();
            return false;
        }

        var target = menu.getElementsByClassName('ytp-panel')[0].getElementsByClassName('ytp-panel-menu')[0];

        var menuItem = document.getElementById('popout-player-context-menu-item');
        if (menuItem) {
            if (DEBUG) console.warn('#popout-player-context-menu-item already exists', menuItem);
            if (DEBUG) console.groupEnd();
            return false;
        }

        menuItem = document.createElement('div');
        menuItem.className = 'ytp-menuitem';
        menuItem.setAttribute('aria-haspopup', false);
        menuItem.setAttribute('role', 'menuitem');
        menuItem.setAttribute('tabindex', 0);
        menuItem.id = 'popout-player-context-menu-item'

        var menuItemLabel = document.createElement('div');
        menuItemLabel.className = 'ytp-menuitem-label';
        menuItemLabel.innerHTML = 'Popout Player';

        var menuItemContent = document.createElement('div');
        menuItemContent.className = 'ytp-menuitem-content';

        menuItem.appendChild(menuItemLabel);
        menuItem.appendChild(menuItemContent);
        menuItem.addEventListener('click', this.onClick, false);

        target.appendChild(menuItem);
        if (DEBUG) console.info('Inserting context menu entry', menuItem);

        var contextMenus = document.getElementsByClassName('ytp-contextmenu');
        var contextMenu = contextMenus[contextMenus.length - 1];
        var contextMenuPanel = contextMenu.getElementsByClassName('ytp-panel')[0];
        var contextMenuPanelMenu = contextMenuPanel.getElementsByClassName('ytp-panel-menu')[0];

        var height = (contextMenu.offsetHeight + menuItem.offsetHeight);
        if (DEBUG) console.info('Modifying context menu height to ' + height + 'px', contextMenu);

        contextMenu.style.height = height + 'px';
        contextMenuPanel.style.height = height + 'px';
        contextMenuPanelMenu.style.height = height + 'px';

        if (DEBUG) console.groupEnd();
    },

    insertCSS: function () {
        if (DEBUG) console.group('YouTubePopoutPlayer.insertCSS()');

        var iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAWUlEQVQ4jb3R2w0AIAgDQDZndF0AaIEqCV+G46HZj3D3000pVqKwI1ODuqGp/oHMylJQOmGFtMHotmMQfVQLzLDsHDRYYe2VmaDASaYdVphszehxPdkzUBkX7OD4ZHHL5rYAAAAASUVORK5CYII=';
        var css = '#popout-player-button::before { background: no-repeat url(data:image/png;base64,' + iconBase64 + '); background-size: auto; width: 20px; height: 20px }';

        if (DEBUG) console.log('css', css);

        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;

        document.body.appendChild(style);
        if (DEBUG) console.log('Inserted <style>', style);

        if (DEBUG) console.groupEnd();
    },

    onClick: function (e) {
        if (DEBUG) console.group('YouTubePopoutPlayer.onClick()');

        var player = new HTML5Player();

        player.initialize();
        player.pause();

        var id = player.getVideoID() || YouTubePopoutPlayer.getVideoID();
        var width = player.getWidth() || YouTubePopoutPlayer.defaults.width;
        var height = player.getHeight() || YouTubePopoutPlayer.defaults.height;
        var time = player.getTime() || 0;

        if (time <= YouTubePopoutPlayer.defaults.startThreshold) {
            if (DEBUG) console.info('Popout video will start from beginning');
            time = 0;
        }

        YouTubePopoutPlayer.popoutPlayer(id, width, height, time);

        if (DEBUG) console.groupEnd();
    },

    popoutPlayer: function (id, width, height, time) {
        if (DEBUG) console.group('YouTubePopoutPlayer.popoutPlayer()');

        if (DEBUG) console.log('id', id);
        if (DEBUG) console.log('width', width);
        if (DEBUG) console.log('height', height);
        if (DEBUG) console.log('time', time);

        var location = 'https://www.youtube.com/embed/' + id + '?autoplay=1&start=' + time;
        var options = 'width=' + width + ',height=' + height + ',scrollbars=no,toolbar=no';

        if (DEBUG) console.log('location', location);
        if (DEBUG) console.log('options', options);

        var popout = window.open(location, id, options);
        if (DEBUG) console.log('Opened window', popout);

        if (DEBUG) console.groupEnd();
    },

    watchPageChange: function () {
        if (DEBUG) console.group('YouTubePopoutPlayer.watchPageChange()');

        var self = this;

        var actionBarObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes !== null) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        if (mutation.addedNodes[i].id == 'watch7-container' ||
                            mutation.addedNodes[i].id == 'watch7-main-container') {
                            if (DEBUG) console.log('Mutation observed for #' + mutation.addedNodes[i].id, mutation);
                            self.insertActionButton();
                            break;
                        }
                    }
                }
            });
        });
        actionBarObserver.observe(document.body, { childList: true, subtree: true });

        var contextMenuObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes !== null) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        if (mutation.addedNodes[i].className == 'ytp-popup ytp-contextmenu') {
                            if (DEBUG) console.log('Mutation observed for .' + mutation.addedNodes[i].className, mutation);
                            self.insertContextMenuEntry();
                            contextMenuObserver.disconnect();
                            break;
                        }
                    }
                }
            });
        });
        contextMenuObserver.observe(document.body, { childList: true, subtree: true });

        if (DEBUG) console.groupEnd();
    },

    initialize: function () {
        if (DEBUG) console.group('YouTubePopoutPlayer.initialize()');

        this.insertCSS();
        this.insertControls();
        this.watchPageChange();

        if (DEBUG) console.groupEnd();
    }
};

var HTML5Player = function () {
    this.container = null;
    this.player = null;
    this.video_id = null;
};
HTML5Player.prototype = {
    constructor: HTML5Player,

    pause: function () {
        if (DEBUG) console.group('HTML5Player.pause()');

        if (this.player) {
            if (DEBUG) console.log('Pausing video player', this.player);
            this.player.pause();
        }

        if (DEBUG) console.groupEnd();
    },

    remove: function () {
        if (DEBUG) console.log('HTML5Player.remove()');

        if (this.container) {
            if (DEBUG) console.log('Removing container element', this.container);
            this.container.remove();
        }

        if (DEBUG) console.groupEnd();
    },

    getVideoID: function () {
        if (DEBUG) console.log('HTML5Player.getVideoID()');

        return this.video_id;
    },

    getWidth: function () {
        if (DEBUG) console.log('HTML5Player.getWidth()');

        return this.player ? this.player.clientWidth : null;
    },

    getHeight: function () {
        if (DEBUG) console.log('HTML5Player.getHeight()');

        return this.player ? this.player.clientHeight : null;
    },

    getTime: function () {
        if (DEBUG) console.log('HTML5Player.getTime()');

        return this.player ? parseInt(this.player.currentTime, 10) : null;
    },

    initialize: function () {
        if (DEBUG) console.group('HTML5Player.initialize()');

        // find the video player's container and store a reference to it
        this.container = document.getElementById('movie_player') || document.getElementById('player');
        if (this.container) {
            if (DEBUG) console.log('Found #movie_player', this.container);
        }

        // find the video player and store a reference to it
        if (this.container) {
            this.player = this.container.getElementsByTagName('video')[0];
            if (this.player) {
                if (DEBUG) console.log('Found <video>', this.player);
            }
        }

        // pull the video ID from one of the config objects
        if (window.ytplayer && window.ytplayer.config) {
            if (DEBUG) console.log('Found window.ytplayer.config object', window.ytplayer.config);
            this.video_id = window.ytplayer.config.args.video_id;
        } else if (window.yt && window.yt.config_) {
            if (DEBUG) console.log('Found window.yt.config_ object', window.yt.config_);
            this.video_id = window.yt.config_.PLAYER_CONFIG.args.video_id;
        } else {
            if (DEBUG) console.log('Missing config objects');
        }

        if (DEBUG) console.groupEnd();
    }
};

(function () {
    if (DEBUG) console.log('(function() { ... })()');
    YouTubePopoutPlayer.initialize();
})();
