const HTML5Player = (() => {

    /**
     * Utility class for retrieving configuration settings from the HTML5 video player
     */
    class HTML5Player {

        // TODO: pass an ID (or array of IDs) for the container <video> element's container
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

            const width = this.player ? this.player.clientWidth : null;

            console.log('Return', width);
            console.groupEnd();

            return width;
        }

        /**
         * Gets the current height of the HTML5 video player
         * @return {Integer}
         */
        getHeight() {
            console.group('HTML5Player.getHeight()');

            const height = this.player ? this.player.clientHeight : null;

            console.log('Return', height);
            console.groupEnd();

            return height;
        }

        /**
         * Gets the elapsed time of the playing video
         * @return {Integer}
         */
        getTime() {
            console.group('HTML5Player.getTime()');

            const time = this.player ? parseInt(this.player.currentTime, 10) : null;

            console.log('Return', time);
            console.groupEnd();

            return time;
        }

    }

    return HTML5Player;

})();

export default HTML5Player;
