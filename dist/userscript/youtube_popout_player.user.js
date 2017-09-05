// ==UserScript==
// @name        YouTube Popout Player
// @author      Ryan Thaut <rthaut@gmail.com> (http://ryanthaut.com)
// @description Provides a simple way to open any YouTube video in a popout window
// @version     2.1.0
// @namespace   https://github.com/rthaut/YouTubePopoutPlayer
// @updateURL   https://github.com/rthaut/YouTubePopoutPlayer/raw/master/dist/userscript/youtube_popout_player.user.js
// @downloadURL https://github.com/rthaut/YouTubePopoutPlayer/raw/master/dist/userscript/youtube_popout_player.user.js
// @include     http://*youtube.com/*
// @include     https://*youtube.com/*
// ==/UserScript==
var HTML5Player = function() {
    this.container = null, this.player = null, this.container = document.getElementById("movie_player") || document.getElementById("player"), 
    this.container && (this.player = this.container.getElementsByTagName("video")[0], 
    this.player);
};

HTML5Player.prototype = {
    constructor: HTML5Player,
    pause: function() {
        this.player && this.player.pause();
    },
    remove: function() {
        this.container && this.container.remove();
    },
    getWidth: function() {
        return this.player ? this.player.clientWidth : null;
    },
    getHeight: function() {
        return this.player ? this.player.clientHeight : null;
    },
    getTime: function() {
        return this.player ? parseInt(this.player.currentTime, 10) : null;
    }
};
var YouTubePopoutPlayer = function() {
    this.defaults = {
        width: 854,
        height: 480,
        startThreshold: 5
    };
};

YouTubePopoutPlayer.prototype = {
    constructor: YouTubePopoutPlayer,
    getVideoIDFromPlayer: function(player) {
        var id = this.getVideoIDFromURL(player.baseURI);
        return id;
    },
    getVideoIDFromURL: function(url) {
        var id = null, result = new RegExp(/(?:(?:v=)|(?:\/embed\/)|(?:\/youtu\.be\/))([^\?\&\/]{11})/).exec(url);
        return result && result[1] && (id = result[1]), id;
    },
    getPLaylistIDFromURL: function(url) {
        var id = null, result = new RegExp(/list=([^\?\&\/]{34})/).exec(url);
        return result && result[1] && (id = result[1]), id;
    },
    insertControls: function() {
        this.insertContextMenuEntry(), this.insertPlayerControlsButton();
    },
    insertContextMenuEntry: function() {
        var menu = document.getElementsByClassName("ytp-contextmenu")[0];
        if (!menu) {
            return !1;
        }
        var target = menu.getElementsByClassName("ytp-panel")[0].getElementsByClassName("ytp-panel-menu")[0], menuItem = document.getElementById("popout-player-context-menu-item");
        if (menuItem) {
            return !1;
        }
        (menuItem = document.createElement("div")).className = "ytp-menuitem", menuItem.setAttribute("aria-haspopup", !1), 
        menuItem.setAttribute("role", "menuitem"), menuItem.setAttribute("tabindex", 0), 
        menuItem.id = "popout-player-context-menu-item";
        var menuItemLabel = document.createElement("div");
        menuItemLabel.className = "ytp-menuitem-label", menuItemLabel.innerHTML = "Popout Player";
        var menuItemContent = document.createElement("div");
        menuItemContent.className = "ytp-menuitem-content", menuItem.appendChild(menuItemLabel), 
        menuItem.appendChild(menuItemContent), menuItem.addEventListener("click", function() {
            this.onClick();
        }.bind(this), !1), target.appendChild(menuItem);
        var contextMenus = document.getElementsByClassName("ytp-contextmenu"), contextMenu = contextMenus[contextMenus.length - 1], contextMenuPanel = contextMenu.getElementsByClassName("ytp-panel")[0], contextMenuPanelMenu = contextMenuPanel.getElementsByClassName("ytp-panel-menu")[0], height = contextMenu.offsetHeight + menuItem.offsetHeight;
        contextMenu.style.height = height + "px", contextMenuPanel.style.height = height + "px", 
        contextMenuPanelMenu.style.height = height + "px";
    },
    insertPlayerControlsButton: function() {
        var controls = document.getElementsByClassName("ytp-right-controls")[0];
        if (!controls) {
            return !1;
        }
        var fullScreenButton = controls.getElementsByClassName("ytp-fullscreen-button")[0];
        if (!fullScreenButton) {
            return !1;
        }
        var playerButton = controls.getElementsByClassName("ytp-popout-button")[0];
        if (playerButton) {
            return !1;
        }
        var xmlns = "http://www.w3.org/2000/svg", xlink = "http://www.w3.org/1999/xlink", playerButtonSVG = document.createElementNS(xmlns, "svg");
        playerButtonSVG.setAttribute("width", "100%"), playerButtonSVG.setAttribute("height", "100%"), 
        playerButtonSVG.setAttribute("viewBox", "0 0 36 36"), playerButtonSVG.setAttribute("version", "1.1");
        var playerButtonSVGPath01 = document.createElementNS(xmlns, "path");
        playerButtonSVGPath01.id = "ytp-svg-pop-01", playerButtonSVGPath01.setAttributeNS(null, "d", "m 8,8 v 20 h 20 v -6 h -2 v 4 H 10 V 10 h 4 V 8 Z"), 
        playerButtonSVGPath01.setAttributeNS(null, "class", "ytp-svg-fill");
        var playerButtonSVGPath02 = document.createElementNS(xmlns, "path");
        playerButtonSVGPath02.id = "ytp-svg-pop-02", playerButtonSVGPath02.setAttributeNS(null, "d", "M 28,8 H 18 l 3,3 -7,8 3,3 8,-7 3,3 z"), 
        playerButtonSVGPath02.setAttributeNS(null, "class", "ytp-svg-fill");
        var playerButtonSVGUse01 = document.createElementNS(xmlns, "use");
        playerButtonSVGUse01.setAttributeNS(null, "class", "ytp-svg-shadow"), playerButtonSVGUse01.setAttributeNS(xlink, "href", "#" + playerButtonSVGPath01.id);
        var playerButtonSVGUse02 = document.createElementNS(xmlns, "use");
        playerButtonSVGUse02.setAttributeNS(null, "class", "ytp-svg-shadow"), playerButtonSVGUse02.setAttributeNS(xlink, "href", "#" + playerButtonSVGPath02.id), 
        playerButtonSVG.appendChild(playerButtonSVGUse01), playerButtonSVG.appendChild(playerButtonSVGPath01), 
        playerButtonSVG.appendChild(playerButtonSVGUse02), playerButtonSVG.appendChild(playerButtonSVGPath02), 
        (playerButton = document.createElement("button")).className = [ "ytp-popout-button", "ytp-button" ].join(" "), 
        playerButton.id = "popout-player-control-button", playerButton.setAttribute("title", "Popout Player"), 
        playerButton.appendChild(playerButtonSVG), playerButton.addEventListener("click", function() {
            this.onClick();
        }.bind(this), !1), controls.insertBefore(playerButton, fullScreenButton);
    },
    onClick: function(event) {
        var player = new HTML5Player();
        player.pause();
        var id = this.getVideoIDFromPlayer(player.player) || this.getVideoIDFromURL(window.location.href), list = this.getPLaylistIDFromURL(window.location.href), time = player.getTime() || 0;
        time <= this.defaults.startThreshold && (time = 0);
        var attrs = {};
        null != list && (attrs.list = list), attrs.start = time, attrs.autoplay = 1;
        var opts = {
            width: player.getWidth() || this.defaults.width,
            height: player.getHeight() || this.defaults.height,
            scrollbars: "no",
            toolbar: "no"
        };
        player.pause(), this.popoutPlayer(id, attrs, opts);
    },
    popoutPlayer: function(id, attrs, opts) {
        var location = "https://www.youtube.com/embed/" + id + "?";
        if (void 0 !== attrs) {
            for (var attr in attrs) {
                location += attr + "=" + attrs[attr] + "&";
            }
            location = location.replace(/\&$/, "");
        }
        var options = "";
        if (void 0 !== opts) {
            for (var opt in opts) {
                options += opt + "=" + opts[opt] + ",";
            }
            options = options.replace(/\,$/, "");
        }
        window.open(location, id, options);
    },
    watchPageChange: function() {
        var self = this;
        new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (null != mutation.addedNodes) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        switch (mutation.addedNodes[i].className) {
                          case "ytp-popup ytp-contextmenu":
                            self.insertContextMenuEntry();
                            break;

                          case "ytp-right-controls":
                            self.insertPlayerControlsButton();
                        }
                    }
                }
            });
        }).observe(document.body, {
            childList: !0,
            subtree: !0
        });
    },
    run: function() {
        this.insertControls(), this.watchPageChange();
    }
};
!function() {
    new YouTubePopoutPlayer().run();
}();