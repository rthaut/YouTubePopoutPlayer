const HTML5Player = (() => {
  /**
   * Utility class for working with HTML5 video players
   */
  class HTML5Player {
    /**
     * HTML 5 Video Player Helper Class
     * @param {HTMLVideoElement} video the HTML5 <video> element
     */
    constructor(video = null) {
      console.group("HTML5Player()");

      if (!video) {
        console.log("Looking for first <video> element in DOM");

        video = document.querySelector("video");
        if (video) {
          console.log("Found <video> element", video);
        }
      }

      this.video = video;

      console.groupEnd();
    }

    /**
     * Pauses the HTML5 video player
     */
    pause() {
      console.group("HTML5Player.pause()");

      if (this.video) {
        console.log("Pausing video player", this.video);
        this.video.pause();
      }

      console.groupEnd();
    }

    /**
     * Gets the HTML5 <video> element
     * @return {HTMLVideoElement}
     */
    getVideo() {
      console.group("HTML5Player.getVideo()");

      console.log("Return", this.video);
      console.groupEnd();

      return this.video;
    }

    /**
     * Gets the current width of the HTML5 video player
     * @return {Integer}
     */
    getWidth() {
      console.group("HTML5Player.getWidth()");

      const width = this.video ? this.video.clientWidth : null;

      console.log("Return", width);
      console.groupEnd();

      return width;
    }

    /**
     * Gets the current height of the HTML5 video player
     * @return {Integer}
     */
    getHeight() {
      console.group("HTML5Player.getHeight()");

      const height = this.video ? this.video.clientHeight : null;

      console.log("Return", height);
      console.groupEnd();

      return height;
    }

    /**
     * Gets the elapsed time of the playing video
     * @return {Integer}
     */
    getTime() {
      console.group("HTML5Player.getTime()");

      const time = this.video ? parseInt(this.video.currentTime, 10) : null;

      console.log("Return", time);
      console.groupEnd();

      return time;
    }
  }

  return HTML5Player;
})();

export default HTML5Player;
