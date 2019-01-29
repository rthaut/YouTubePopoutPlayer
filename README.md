[<img align="right" src="https://badges.greenkeeper.io/rthaut/YouTubePopoutPlayer.svg" alt="Greenkeeper badge"/>](https://greenkeeper.io/)

# YouTube Popout Player v3.0.0

> This browser extension provides a simple way to open any YouTube video or playlist (including videos and playlists embedded in other sites/pages) in a configurable "popout" window which you can freely position and resize.

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
* Use the keyboard shortcut (default <kbd>Ctrl</kbd> + <kbd>Up Arrow</kbd>)

### Configuring YouTube Popout Player Options

1. Click the Red YouTube Popout Player icon that appears to the right of the address bar. ![YouTube Popout Player Browser Action in Firefox](/resources/screenshots/Page-Action-Firefox.png?raw=true)![YouTube Popout Player Browser Action in Chrome](/resources/screenshots/Page-Action-Chrome.png?raw=true)
2. The YouTube Popout Player options screen will open automatically when you click the icon.

* * *

## Options

### Popout Player Behavior

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

#### Use Original Player Size

> The popout player will be sized to match the original YouTube video player. **This is the default setting.**

When you select this setting, the Popout Player will match the size of the current video automatically when it is opened.

#### Set Custom Dimensions

> Use this setting to specify dimensions (either in pixels or percentages) for the popout player.

When you select this setting, additional fields will appear to let you configure the size of the Popout Player. Some information about your screen resolution and the resulting aspect ratio will also be displayed in a table to help you set good dimensions.

| Field Name                         | Description |
| ---------------------------------- | ----------- |
| **Dimensions&nbsp;Units**          | You can choose to specify your custom dimensions using either pixels or a percentage of your screen size. When using percentages, the resulting resolution will be displayed beneath your current screen resolution in the information table. |
| **Width**&nbsp;and&nbsp;**Height** | These fields are where you enter your desired width and height for the Popout Player, either as pixels (px) or percentages (%). |

### Advanced Settings

These are the more advanced settings for configuring the YouTube Popout Player. Use caution when changing these settings, as they are a little more complex than the others.

#### Close Original Window/Tab

> Enabling this will cause the original YouTube window/tab to be closed when the popout player is opened. This does NOT apply to videos embedded in other pages/sites. **The default for this setting is disabled.**

#### Window Title Text (Preface) - *Firefox Only*

> Specify text to be automatically inserted into the title of the popout player window. This can be used for window manipulation scripting. **This text does NOT replace the standard title text.**

### Keyboard Shortcuts *(a.k.a. Hotkeys)*

YouTube Popout Player has a configurable keyboard shortcut for opening the popout player. The default shortcut is <kbd>Ctrl</kbd> + <kbd>Up Arrow</kbd>.

**In Firefox**, you can customize the shortcut by clicking the "Change" link that appears on the right side of the shortcut. Simply press a new combination of keys on your keyboard to set the new shortcut immediately.

**In Chrome**, you must manually open `chrome://extensions/shortcuts` in a new tab, which lets you set keyboard shortcuts for all of your installed extensions (including YouTube Popout Player).

Note that keyboard shortcuts require 1-2 modifier keys (<kbd>Ctrl</kbd> , <kbd>Alt</kbd> , <kbd>Meta</kbd> , <kbd>Shift</kbd>) and one regular key (<kbd>A</kbd>-<kbd>Z</kbd> , <kbd>0</kbd>-<kbd>9</kbd> , <kbd>F1</kbd>-<kbd>F12</kbd> , etc.). See the [documentation for Shortcut Values on Mozilla's developer page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands#Shortcut_values) for more information about valid keyboard shortcuts.
