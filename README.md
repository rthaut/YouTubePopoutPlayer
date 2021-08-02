[<img align="right" src="https://img.shields.io/badge/all_contributors-8-green.svg" alt="All Contributors"/>](#contributors)

# YouTube Popout Player v4.0.0

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

| Web Browser | Information | Download Link |
| ----------- | ----------- | ------------- |
| Google Chrome | [![Chrome Web Store][chrome-image-version]][chrome-url] [![Chrome Web Store][chrome-image-download]][chrome-url] | [Download from the Chrome Web Store][chrome-url] |
| Microsoft Edge | [![Microsoft Edge Add-on][edge-image-version]][edge-url] | [Download from Microsoft Edge Add-ons][edge-url] |
| Mozilla Firefox | [![Mozilla Add-on][firefox-image-version]][firefox-url] [![Mozilla Add-on][firefox-image-download]][firefox-url] | [Download from Mozilla Add-ons][firefox-url] |

[chrome-url]: https://chrome.google.com/webstore/detail/youtube-popout-player/kmfikkopdhmbdbkndkamabamlkkgkpod
[chrome-image-download]: https://img.shields.io/chrome-web-store/d/kmfikkopdhmbdbkndkamabamlkkgkpod?logo=googlechrome&style=for-the-badge
[chrome-image-version]: https://img.shields.io/chrome-web-store/v/kmfikkopdhmbdbkndkamabamlkkgkpod?logo=googlechrome&style=for-the-badge

[edge-url]: https://microsoftedge.microsoft.com/addons/detail/youtube-popout-player/mdhpmdbgkogobnebpgfbnnnbjfohiiee
[edge-image-version]: https://img.shields.io/badge/microsoft%20edge%20add--on-v4.0.0-blue?logo=microsoftedge&style=for-the-badge

[firefox-url]: https://addons.mozilla.org/en-US/firefox/addon/youtube-popout-player/
[firefox-image-download]: https://img.shields.io/amo/users/youtube-popout-player?color=green&logo=firefox&style=for-the-badge
[firefox-image-version]: https://img.shields.io/amo/v/youtube-popout-player?color=blue&logo=firefox&style=for-the-badge

* * *

## Contributing

Contributions are always welcome! Even if you aren't comfortable coding, you can always submit [new ideas](https://github.com/rthaut/YouTubePopoutPlayer/issues/new?labels=enhancement) and [bug reports](https://github.com/rthaut/YouTubePopoutPlayer/issues/new?labels=bug).

### Localization/Translation

This extension is setup to be fully localized/translated into multiple languages, but for now English is the only language with full translations. If you are able to help localize/translate, please [check out this guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization). All of the text for the extension is stored [here in the `/src/_locales` directory](https://github.com/rthaut/YouTubePopoutPlayer/tree/master/src/_locales).

### Building the Extension

To build the extension from source code, you will need to use [Node Package Manager (npm)](https://www.npmjs.com/), which handles all of the dependencies needed for this project and is used to execute the various scripts for development/building/packaging/etc.

```sh
npm install
```

Then you can run the development process (where the extension is auto-reloaded when changes are made) for your browser of choice:

```sh
npm run dev <chrome/edge/firefox>
```

Or you can generate a production build for your browser of choice:

```sh
npm run build <chrome/edge/firefox>
```

### Development Process

To make development easier, you can start up a temporary development profile on [Mozilla Firefox](https://getfirefox.com) with the extension already loaded. Firefox will also automatically detect changes and reload the extension for you (read more about this on the [`web-ext` documentation pages](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext)). Use the following commands to re-build the extension and re-load it in Firefox automatically as you make changes:

```sh
npm run dev firefox
npm run start:firefox
```

Note you will need 2 terminal instances, one for each of the above commands, as they both remain running until you cancel them (use <kbd>CTRL</kbd> + <kbd>c</kbd> to cancel each process in your terminal(s)).

* * *

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://wiki.mozilla.org/User:YFdyh000"><img src="https://avatars0.githubusercontent.com/u/1769875?v=4" width="100px;" alt=""/><br /><sub><b>YFdyh000</b></sub></a><br /><a href="#translation-yfdyh000" title="Translation">🌍</a></td>
    <td align="center"><a href="https://cdcs2.com"><img src="https://avatars3.githubusercontent.com/u/8739797?v=4" width="100px;" alt=""/><br /><sub><b>CD</b></sub></a><br /><a href="#ideas-d5c4b3" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/201601972-kimdongwook"><img src="https://avatars0.githubusercontent.com/u/62870938?v=4" width="100px;" alt=""/><br /><sub><b>DONGWOOK KIM</b></sub></a><br /><a href="#translation-201601972-kimdongwook" title="Translation">🌍</a></td>
    <td align="center"><a href="https://github.com/kimsoyeong"><img src="https://avatars3.githubusercontent.com/u/43427380?v=4" width="100px;" alt=""/><br /><sub><b>kimsoyeong</b></sub></a><br /><a href="#translation-kimsoyeong" title="Translation">🌍</a></td>
    <td align="center"><a href="https://github.com/OhKyungTaek"><img src="https://avatars1.githubusercontent.com/u/48934601?v=4" width="100px;" alt=""/><br /><sub><b>OhKyungTaek</b></sub></a><br /><a href="#translation-OhKyungTaek" title="Translation">🌍</a></td>
    <td align="center"><a href="https://github.com/Sumin971013"><img src="https://avatars3.githubusercontent.com/u/55087554?v=4" width="100px;" alt=""/><br /><sub><b>Sumin Bae</b></sub></a><br /><a href="#translation-Sumin971013" title="Translation">🌍</a></td>
    <td align="center"><a href="https://github.com/SeongJin16"><img src="https://avatars1.githubusercontent.com/u/55086076?v=4" width="100px;" alt=""/><br /><sub><b>SJAhn_Dev</b></sub></a><br /><a href="#translation-SeongJin16" title="Translation">🌍</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
