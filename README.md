[<img align="right" src="https://travis-ci.com/rthaut/YouTubePopoutPlayer.svg?branch=master" alt="Build Status"/>](https://travis-ci.com/rthaut/YouTubePopoutPlayer)
[<img align="right" src="https://badges.greenkeeper.io/rthaut/YouTubePopoutPlayer.svg" alt="Greenkeeper badge"/>](https://greenkeeper.io/)
[<img align="right" src="https://img.shields.io/badge/all_contributors-1-orange.svg" alt="All Contributors"/>](#contributors)

# YouTube Popout Player v3.0.0

> This browser extension provides a simple way to open any YouTube video or playlist (including videos and playlists embedded in other sites/pages) in a configurable "popout" window which you can freely position and resize.

* * *

<details>
<summary><strong>Table of Contents</strong></summary>

* [Overview](#overview)
  * [Features](#features)
* [Installation](#installation)
* [Permissions](#permissions)
* [Usage](#usage)
  * [Opening the Popout Player](#opening-the-popout-player)
  * [Configuring YouTube Popout Player Options](#configuring-youtube-popout-player-options)
* [Frequently Asked Questions](#frequently-asked-questions)
* [Options](#options)
  * [Popout Player Behavior](#popout-player-behavior-view-screenshot)
  * [Popout Player Size](#popout-player-size)
  * [Advanced Settings](#advanced-settings-view-screenshot)
  * [Keyboard Shortcuts *(a.k.a. Hotkeys)*](#keyboard-shortcuts-aka-hotkeys-view-screenshot)
* [Screenshots](#screenshots)
* [Contributors](#contributors)

</details>

* * *

## Overview

![YouTube Popout Player Promotional Image](/resources/screenshots/Promo-Screenshot.png?raw=true)

### Features

* Open any YouTube video (including playlists) in a popout player, either as a new browser window or a new tab in your current browser window.
* Show or hide the video player controls in the popout player. [**(Configurable)**](#show-controls)
* Automatically resume playback of the video when the popout player opens. [**(Configurable)**](#autoplay-videos)
* Automatically loop videos (both single videos and playlists) in the popout player. [**(Configurable)**](#loop-videos)
* Customize the size of the popout player, either as a fixed size or as a percentage of your screen's resolution. [**(Configurable)**](#set-custom-dimensions)
* Close the original video when the popout player opens. [**(Configurable)**](#close-original-windowtab)
* *Firefox Only* Add custom text to the popout player's window title (for scripting). [**(Configurable)**](#window-title-text-preface---firefox-only)
* Keyboard shortcut for opening the popout player. [**(Configurable)**](#keyboard-shortcuts-aka-hotkeys)

* * *

## Installation

| Web Browser | Information | Download Link |
| ----------- | ----------- | ------------- |
| Google Chrome | [![Chrome Web Store][chrome-image-version]][chrome-url] [![Chrome Web Store][chrome-image-download]][chrome-url] | [Download from the Chrome Web Store][chrome-url] |
| Mozilla Firefox | [![Mozilla Add-on][firefox-image-version]][firefox-url] [![Mozilla Add-on][firefox-image-download]][firefox-url] | [Download from Mozilla Add-ons][firefox-url] |

[chrome-url]: https://chrome.google.com/webstore/detail/youtube-popout-player/kmfikkopdhmbdbkndkamabamlkkgkpod
[chrome-image-download]: https://img.shields.io/chrome-web-store/d/kmfikkopdhmbdbkndkamabamlkkgkpod.svg
[chrome-image-version]: https://img.shields.io/chrome-web-store/v/kmfikkopdhmbdbkndkamabamlkkgkpod.svg

[firefox-url]: https://addons.mozilla.org/en-US/firefox/addon/youtube-popout-player/
[firefox-image-download]: https://img.shields.io/amo/d/youtube-popout-player.svg
[firefox-image-version]: https://img.shields.io/amo/v/youtube-popout-player.svg

* * *

## Permissions

These are the required browser permissions for YouTube Popout Player.

If you would like to know more about permissions in general, Mozilla has a [support article about permissions](https://support.mozilla.org/en-US/kb/permission-request-messages-firefox-extensions), as well as a [guide for assessing the safety of an extension](https://support.mozilla.org/en-US/kb/tips-assessing-safety-extension).

Please [submit a new issue](https://github.com/rthaut/YouTubePopoutPlayer/issues/new) if you are still concerned about the use of any of the following permissions so the information provided below can be updated to cover common concerns and answer common questions.

### Access your data for sites in the youtube.com and youtube-nocookie.com domains

This permission is used to add the controls (button and context menu) and listen for the keyboard shortcut, which are used to open the popout player, on YouTube videos.

### Access browser tabs

The Tabs permission is used to close the original window/tab (when configured) after opening the popout player.

* * *

## Usage

### Opening the Popout Player

**While viewing any YouTube video**, whether directly [YouTube](https://www.youtube.com), or embedded on any other website, you can use any of the following methods to open the Popout Player for the current video/playlist:

* Right-click on the video and click the "Popout Player" option (at the bottom of the menu that is displayed)
* Click the Popout Player icon (a square with a smaller square coming out of the top right corner), which can be found in the lower right corner of the video (by the settings and fullscreen icons)
* Use the keyboard shortcut (default <kbd>Ctrl</kbd> + <kbd>Up Arrow</kbd> )

### Configuring YouTube Popout Player Options

1. Click the Red YouTube Popout Player icon that appears to the right of the address bar. ![YouTube Popout Player Browser Action in Firefox](/resources/screenshots/Page-Action-Firefox.png?raw=true) ![YouTube Popout Player Browser Action in Chrome](/resources/screenshots/Page-Action-Chrome.png?raw=true)
2. The YouTube Popout Player options screen will open automatically when you click the icon.

* * *

## Frequently Asked Questions

### How do I make the popout player always stay on top of other windows?

The APIs for browser extensions do not expose any functionality to keep windows on top, so this is not possible through the extension alone (at least for now).

**However**, you can use third-party applications on Windows, like [AutoHotkey](https://www.autohotkey.com/), [DeskPins](https://efotinis.neocities.org/deskpins/), [TurboTop](https://www.savardsoftware.com/turbotop/), or [DisplayFusion](https://www.displayfusion.com/). To make this even easier/better, if you are using Firefox, you can use the [Window Title Text (Preface)](#window-title-text-preface---firefox-only) setting to add some custom text to the popout player window's title, which you can then use to target the popout player window in these applications.

For MacOS, you can try using [SIMBL + Afloat](https://www.maketecheasier.com/mac-keeping-your-application-window-always-on-top/), though your mileage may vary.

For Linux, depending on your distribution (and, more likely, your window manager), you probably have a way to set windows to always be on top without the need for additional software.

### Why do some videos say "Video Unavailable" when opened in the popout player?

The popout player uses YouTube's [embedded video player](https://developers.google.com/youtube/player_parameters). By default, all videos uploaded to YouTube can be used in the embedded video player, but all videos can be [restricted from being able to be embedded](https://support.google.com/youtube/answer/6301625). This means that the owner of the video has intentionally blocked the video from the embedded player, and, as such, it cannot be played through the popout player.

* * *

## Options

### Popout Player Behavior ([View Screenshot](#popout-player-behavior-options-cropped-screenshot))

These are the basic settings for configuring the YouTube Popout Player. You can control where the Popout Player opens, which controls are shown for video(s) in the Popout Player (if any), and whether or not video(s) start playing automatically and/or loop indefinitely.

#### Open in a Popup Window

> The popout player will open in a new popup window. **This is the default setting.**

#### Open in a Tab

> The popout player will open in a new tab in your current browser window.

#### Show Controls

> Use this setting to adjust which video player controls are displayed on the popout player. **The default for this setting is Standard.**

| Option       | Description |
| ------------ | ----------- |
| **None**     | Set "Show Controls" to "None" to completely remove the video player controls (play/pause, volume, fullscreen, etc.) for video(s) in the Popout Player. |
| **Standard** | Set "Show Controls" to "Standard" to show the normal YouTube video player controls (play/pause, volume, fullscreen, etc.) for video(s) in the Popout Player. |
| **Extended** | Set "Show Controls" to "Extended" to show the normal YouTube video player controls (play/pause, volume, fullscreen, etc.), plus the Popout Player button, for video(s) in the Popout Player. |

#### Autoplay Video(s)

> This setting controls whether or not the video in the popout player begins playing automatically when the popout player is opened. **The default for this setting is enabled.**

#### Loop Video(s)

> This setting controls whether or not the video(s) in the popout player loop infinitely (until the popout player is closed). **The default for this setting is disabled.**

### Popout Player Size

#### Use Original Player Size ([View Screenshot](#popout-player-size-original-size-options-cropped-screenshot))

> The popout player will be sized to match the original YouTube video player. **This is the default setting.**

When you select this setting, the Popout Player will match the size of the current video automatically when it is opened.

#### Set Custom Dimensions ([View Screenshot](#popout-player-size-custom-dimensions-options-cropped-screenshot))

> Use this setting to specify dimensions (either in pixels or percentages) for the popout player.

When you select this setting, additional fields will appear to let you configure the size of the Popout Player. Some information about your screen resolution and the resulting aspect ratio will also be displayed in a table to help you set good dimensions.

| Field Name                         | Description |
| ---------------------------------- | ----------- |
| **Dimensions&nbsp;Units**          | You can choose to specify your custom dimensions using either pixels or a percentage of your screen size. When using percentages, the resulting resolution will be displayed beneath your current screen resolution in the information table. |
| **Width**&nbsp;and&nbsp;**Height** | These fields are where you enter your desired width and height for the Popout Player, either as pixels (px) or percentages (%). |

### Advanced Settings ([View Screenshot](#advanced-settings-options-cropped-screenshot))

These are the more advanced settings for configuring the YouTube Popout Player. Use caution when changing these settings, as they are a little more complex than the others.

#### Close Original Window/Tab

> Enabling this will cause the original YouTube window/tab to be closed when the popout player is opened. This does NOT apply to videos embedded in other pages/sites. **The default for this setting is disabled.**

#### Window Title Text (Preface) - *Firefox Only*

> Specify text to be automatically inserted into the title of the popout player window. This can be used for window manipulation scripting. **This text does NOT replace the standard title text.**

### Keyboard Shortcuts *(a.k.a. Hotkeys)* ([View Screenshot](#keyboard-shortcuts-options-cropped-screenshot))

YouTube Popout Player has a configurable keyboard shortcut for opening the popout player. The default shortcut is <kbd>Ctrl</kbd> + <kbd>Up Arrow</kbd> .

**In Firefox**, you can customize the shortcut by clicking the "Change" link that appears on the right side of the shortcut. Simply press a new combination of keys on your keyboard to set the new shortcut immediately.

**In Chrome**, you must manually open `chrome://extensions/shortcuts` in a new tab, which lets you set keyboard shortcuts for all of your installed extensions (including YouTube Popout Player).

Note that keyboard shortcuts require 1-2 modifier keys ( <kbd>Ctrl</kbd> , <kbd>Alt</kbd> , <kbd>Meta</kbd> , <kbd>Shift</kbd> ) and one regular key ( <kbd>A</kbd>-<kbd>Z</kbd> , <kbd>0</kbd>-<kbd>9</kbd> , <kbd>F1</kbd>-<kbd>F12</kbd> , etc.). See the [documentation for Shortcut Values on Mozilla's developer page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands#Shortcut_values) for more information about valid keyboard shortcuts.

* * *

## Screenshots

*(The following screenshots are taken from **Version 3.0.0** and may not accurately represent current functionality.)*

### Popout Player Behavior Options Cropped Screenshot

![Popout Player Behavior Options Cropped Screenshot](/resources/screenshots/Options-Cropped-Behavior.png?raw=true)

### Popout Player Size (Original Size) Options Cropped Screenshot

![Popout Player Size(Original Size) Options Cropped Screenshot](/resources/screenshots/Options-Cropped-Size-Original.png?raw=true)

### Popout Player Size (Custom Dimensions) Options Cropped Screenshot

![Popout Player Size (Custom Dimensions) Options Cropped Screenshot](/resources/screenshots/Options-Cropped-Size-Custom.png?raw=true)

### Advanced Settings Options Cropped Screenshot

![Advanced Settings Options Cropped Screenshot](/resources/screenshots/Options-Cropped-Advanced.png?raw=true)

### Keyboard Shortcuts Options Cropped Screenshot

![Keyboard Shortcuts Options Cropped Screenshot](/resources/screenshots/Options-Cropped-Keyboard-Shortcuts.png?raw=true)

* * *

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/all-contributors/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars0.githubusercontent.com/u/1769875?v=4" width="100px;" alt="YFdyh000"/><br /><sub><b>YFdyh000</b></sub>](http://wiki.mozilla.org/User:YFdyh000)<br />[🌍](#translation-yfdyh000 "Translation") | [<img src="https://avatars3.githubusercontent.com/u/8739797?v=4" width="100px;" alt="CD"/><br /><sub><b>CD</b></sub>](https://cdcs2.com)<br />[🤔](#ideas-d5c4b3 "Ideas, Planning, & Feedback") |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
