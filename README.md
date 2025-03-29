# YouTube Popout Player v5.1.1

[![Chrome Web Store][chrome-image-version]][chrome-url] [![Microsoft Edge Add-on][edge-image-version]][edge-url] [![Mozilla Add-on][firefox-image-version]][firefox-url]

> This browser extension provides simple ways to open any YouTube video or playlist (including videos and playlists embedded in other sites/pages) in a configurable "popout" window that can be freely sized and/or positioned.

* * *

## Overview

![YouTube Popout Player Promotional Image](/docs/screenshots/Promo-Screenshot.png?raw=true)

### Features

* Open any YouTube video (including playlists) in a popout player, either as a new browser window or a new tab in your current browser window.
* Open links to YouTube videos and/or playlists from any website in the popout player with a convenient right-click option.
* Show or hide the video player controls in the popout player.
* Automatically resume playback of the video when the popout player opens.
* Loop videos (both single videos and playlists) in the popout player.
* Multiple ways to customize the size and position of the popout player, with support for multiple displays/monitors/screens.
* Optionally close the original video when the popout player opens.
* Configurable keyboard shortcuts for opening the popout player.
* ... ***and much more!***

#### For more information, head to the [YouTube Popout Player website](https://rthaut.github.io/YouTubePopoutPlayer/).

* * *

## Installation

| Web Browser     | Information & Downloads                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| Google Chrome   | [![Chrome Web Store][chrome-image-version]][chrome-url] [![Chrome Web Store][chrome-image-users]][chrome-url]   |
| Microsoft Edge  | [![Microsoft Edge Add-on][edge-image-version]][edge-url] [![Microsoft Edge Add-on][edge-image-users]][edge-url] |
| Mozilla Firefox | [![Mozilla Add-on][firefox-image-version]][firefox-url] [![Mozilla Add-on][firefox-image-users]][firefox-url]   |

* * *

## Contributing

Contributions are always welcome! Even if you aren't comfortable coding, you can always submit [new ideas](https://github.com/rthaut/YouTubePopoutPlayer/issues/new?labels=enhancement) and [bug reports](https://github.com/rthaut/YouTubePopoutPlayer/issues/new?labels=bug).

### Localization/Translation

This extension is setup to be fully localized/translated into multiple languages, but for now English is the only language with full translations. If you are able to help localize/translate, please [check out this guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization). All of the text for the extension is stored [here in the `/src/public/_locales` directory](https://github.com/rthaut/YouTubePopoutPlayer/tree/master/src/public/_locales).

### Building the Extension

**This extension uses the [WXT](https://wxt.dev/) for development and build processes.**

To build the extension from source code, you will need to use [Node Package Manager (npm)](https://www.npmjs.com/), which handles all of the dependencies needed for this project and is used to execute the various scripts for development/building/packaging/etc.

```sh
npm install
```

Then you can run the development process (where the extension is auto-reloaded when changes are made) for your browser of choice:

```sh
npm run dev:<chrome|edge|firefox> # ex: npm run dev:chrome
```

Or you can generate a production build for your browser of choice:

```sh
npm run build:<chrome|edge|firefox> # ex: npm run build:chrome
```

To create a release package for all supported browsers, run the following command:

```sh
npm run zip
```

[chrome-url]: https://chrome.google.com/webstore/detail/youtube-popout-player/kmfikkopdhmbdbkndkamabamlkkgkpod
[chrome-image-version]: https://img.shields.io/chrome-web-store/v/kmfikkopdhmbdbkndkamabamlkkgkpod?logo=googlechrome&style=for-the-badge
[chrome-image-users]: https://img.shields.io/chrome-web-store/d/kmfikkopdhmbdbkndkamabamlkkgkpod?logo=googlechrome&style=for-the-badge

[edge-url]: https://microsoftedge.microsoft.com/addons/detail/youtube-popout-player/mdhpmdbgkogobnebpgfbnnnbjfohiiee
[edge-image-version]: https://img.shields.io/badge/dynamic/json?logo=microsoftedge&style=for-the-badge&label=edge%20add-on&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fmdhpmdbgkogobnebpgfbnnnbjfohiiee
[edge-image-users]: https://img.shields.io/badge/dynamic/json?logo=microsoftedge&style=for-the-badge&label=users&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fmdhpmdbgkogobnebpgfbnnnbjfohiiee

[firefox-url]: https://addons.mozilla.org/firefox/addon/youtube-popout-player/
[firefox-image-version]: https://img.shields.io/amo/v/youtube-popout-player?color=blue&logo=firefox&style=for-the-badge
[firefox-image-users]: https://img.shields.io/amo/users/youtube-popout-player?color=blue&logo=firefox&style=for-the-badge
