// ==UserScript==
// @name        YouTube Popout Player
// @author      Ryan Thaut
// @description
// @namespace   http://repo.ryanthaut.com/userscripts/youtube_popout_player
// @updateURL   http://repo.ryanthaut.com/userscripts/youtube_popout_player/youtube_popout_player.meta.js
// @downloadURL http://repo.ryanthaut.com/userscripts/youtube_popout_player/youtube_popout_player.user.js
// @include     *//www.youtube.com/watch*
// @version     1.0.0.0
// @grant       unsafeWindow
// ==/UserScript==

'use strict';

const DEBUG = false;

var YouTubePopoutPlayer =
{
    defaults: {
        width: 854,
        height: 480
    },

    getVideoID: function() {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = window.location.href.match(regExp);
        return (match && match[7].length == 11) ? match[7] : null;
    },

    insertControls: function()
    {
        var target = document.getElementById('watch8-secondary-actions');
        if (!target)
        {
            return false;
        }

        var lbl = document.createElement('span');
        lbl.className = 'yt-uix-button-content';
        lbl.innerHTML = 'Popout';

        var btn = document.createElement('button');
        btn.id = "popout-player";
        btn.className = 'yt-uix-button yt-uix-button-size-default yt-uix-button-opacity yt-uix-button-has-icon no-icon-markup pause-resume-autoplay yt-uix-tooltip yt-uix-button-toggled';
        btn.appendChild(lbl);
        btn.addEventListener('click', this.onClick, false);

        target.appendChild(btn);
    },

    insertCSS: function()
    {
        var css = '';
        css += '#popout-player::before { background: no-repeat url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAWUlEQVQ4jb3R2w0AIAgDQDZndF0AaIEqCV+G46HZj3D3000pVqKwI1ODuqGp/oHMylJQOmGFtMHotmMQfVQLzLDsHDRYYe2VmaDASaYdVphszehxPdkzUBkX7OD4ZHHL5rYAAAAASUVORK5CYII=); background-size: auto; width: 20px; height: 20px }';

        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        document.body.appendChild(style);
    },

    onClick: function(e)
    {
        var id, width, height, time;

        if (HTML5Player.initialize())
        {
            // HTML5 player in use
            HTML5Player.pause();

            id = HTML5Player.getVideoID();
            width = HTML5Player.getWidth();
            height = HTML5Player.getHeight();
            time = HTML5Player.getTime();

            HTML5Player.remove();
        }
        else
        {
            id = this.getVideoID();
            width = this.defaults.width;
            height = this.defaults.height;
            time = 0;
        }

        YouTubePopoutPlayer.popoutPlayer(id, width, height, time);
    },

    popoutPlayer: function(id, width, height, time)
    {
        var target = 'https://www.youtube.com/embed/' + id + '?autoplay=1&start=' + time;
        var options = 'width=' + width + ',height=' + height + ',scrollbars=no,toolbar=no';
        window.open(target, '', options);
    },

    initialize: function()
    {
        this.insertCSS();
        this.insertControls();
    }
};

var HTML5Player =
{
    container: null,
    player: null,

    pause: function()
    {
        if (this.player)
        {
            this.player.pauseVideo();
        }
    },

    remove: function()
    {
        if (this.container)
        {
            this.container.remove();
        }
    },

    getVideoID: function()
    {
        return unsafeWindow.ytplayer.config.args.video_id;
    },

    getWidth: function()
    {
        return this.player ? this.player.clientWidth : 0;
    },

    getHeight: function()
    {
        return this.player ? this.player.clientHeight : 0;
    },

    getTime: function()
    {
        return this.player ? parseInt(this.player.currentTime, 10) : 0;
    },

    initialize: function()
    {
        var success = true;

        // find the video player's container and store a reference to it
        try
        {
            this.container = document.getElementById(unsafeWindow.ytplayer.config.attrs.id);
            success &= true;
        }
        catch (ex)
        {
            if (DEBUG) console.error(ex);
            success &= false;
        }

        /*
        // @TODO this should work in GreaseMonkey (it does in ScratchPad), but for some reason it doesn't...
        // find the video player and store a reference to it
        try
        {
            if (this.container)
            {
                this.player = this.container.getElementsByTagName('video')[0];
                success &= true;
            }
        }
        catch (ex)
        {
            if (DEBUG) console.error(ex);
            success &= false;
        }
        */

        // find the video player and store a reference to it
        try
        {
            this.player = unsafeWindow.yt.player.utils.VideoTagPool.instance_.A[0];
            success &= true;
        }
        catch (ex)
        {
            if (DEBUG) console.error(ex);
        }

        return success;
    }
};

(function() {
    YouTubePopoutPlayer.initialize();
})();
