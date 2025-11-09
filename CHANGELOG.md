# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.2.2] - 2025-11-09

### Bug Fixes

* Fix "This video is unavailable" (Error Code: 15)

## [5.2.1] - 2025-10-25

### Bug Fixes

* Fix "Video player configuration error" (Error 153)

## [5.2.0] - 2025-10-23

### Bug Fixes

* Fix controls not rendering in new YouTube UI
* Fix "This video is unavailable" (Error code: 15)
* Fix options panel width and horizontal scrolling issues

## [5.1.2] - 2025-04-05

### New Features

* Added new option to control whether the popout player resumes the video from the current timestamp when opening (re #431)

### Bug Fixes

* Fix popout player not resuming the video from current timestamp (when enabled) (fixes #431)

## [5.1.1] - 2025-03-29

### Bug Fixes

* Fix "Open Video in Popout Player" context menu incorrectly attempting to open as a playlist when used on links/videos containing both a video and a list/playlist (re #417)

## [5.1.0] - 2025-02-23

### New Features

* Added support for Video On Demand (VOD) URLs (re #295)

### Other

* Migrate to Manifest v3
* Updated to Material UI v5 (and React 18)

## [5.0.0] - 2024-10-15

### Other

* Migrate to Manifest v3
* Updated to Material UI v5 (and React 18)

## [4.4.1] - 2023-06-21

### Bug Fixes

* Fix "Automatically Open on Video Pages" functionality in Chromium browsers
* Only request optional `cookies` permission in Firefox (for multi-account containers support)
* Remove default keyboard shortcuts for the following commands in Chromium browsers
  * "Open popout player and close the current window/tab"
  * "Open popout player without closing the current window/tab"

## [4.4.0] - 2023-06-19

### New Features

* Added functionality for rotating videos in the Popout Player

## [4.3.0] - 2022-05-28

### New Features

* Added support for YouTube shorts (closes #387)

## [4.2.0] - 2022-28-04

### New Features

* Added new option to re-use any existing popout player window(s)/tab(s) instead of always opening a new one (closes #379)
* Added new option to automatically open the popout player when navigating to any video page (re #367)

## [4.1.0] - 2021-24-09

### New Features

* Add new option and corresponding logic to maximize the Popout Player window (closes #354)

### Bug Fixes

* Ensure the `Referer` header is set for Chrome 72+ (closes #356)
* Add workaround for opening the Watch Later playlist in the Popout Player (closes #359)

### Other

* Improve appearance of multi-account container hyperlink (in Advanced Options on Firefox)

## [4.0.0] - 2021-08-02

### New Features

* Added ability to customize the position of the popout player window (closes #344)
* Added functionality to remember the popout player window size and position (closes #285)
* Added ability to open the popout player in a background window/tab
* Added context menus for opening the popout player to all YouTube video and playlist links (closes #286)
* Added support for multi-account containers (Firefox only) (closes #104)
* Added separate hotkeys for opening the popout player with and without closing the original window/tab (closes #343)
* Added ability to use the "youtube-nocookie.com" domain for the popout player
* Works in Microsoft Edge (the newer chromium-based versions)
* Technical: Updated from legacy AngularJS to React for Options page (closes #348)

## [3.1.1] - 2020-03-06

### Bug Fixes

* Fixed the context menu when right-clicking on YouTube videos

## [3.1.0] - 2019-02-20

### New Features

* Tabbed Layout for Options Page (closes #58)
* Auto Save Options (closes #54)

### Updates

* Request `tabs` Permission Only When Needed (closes #55)

## [3.0.3] - 2019-02-12

### Bug Fixes

* Info Table Bug When Using Percentage for Custom Dimensions (fixes #52)
* Chrome: Custom Dimensions Error Messages Missing Numbers (fixes #57)

## [3.0.2] - 2019-02-07

### Bug Fixes

* Firefox 65+: Update Keyboard Shortcut No Longer Works (fixes #45)
* Update Keyboard Shortcut Modal is Cut Off (v3.0) (fixes #43)

## [3.0.0] - 2019-02-04

### New Features

* Open in New Tab (Instead of New Window) (closes #20)
* Configurable Window/Player Size (closes #21)
* Open Popout Player via Hotkey (closes #22)
* Hide Address/URL Bar (closes #23)
* Insert Custom Text into Window Title (closes #24)
* Hide Popout Controls on Popout Player (closes #25)
* Close Original Browser Tab When Opening Popout Player (closes #26)
* Loop Videos (closes #30)
* Autoplay Videos (closes #31)
* Hide All Video Player Controls (closes #32)

### Updates

* Resize/Update Popout Player Button Icon (closes #33)

### Documentation

* Version 3.0: Documentation (closes #27)
* Version 3.0: Promo Images (closes #37)

## [2.1.3] - 2018-03-17

* Fixed missing icons for Web Extension
  * This re-enables the extension to be installed from the Chrome store
* Fixed the file name and URLs for the userscript


## [2.1.2] - 2017-10-27

* Fixed playlist detection logic to support more playlist ID formats
* Updated logo to match new YouTube branding
* New zh_CN translation (thanks @yfdyh000)
* Now supports the youtube-nocookie.com domain


## [2.1.0] - 2017-09-05

### Playlist Support

When watching a playlist on YouTube, you can now open the entire playlist in the popout player. This allows you to manually move forward and backward between videos, as well as auto-advancing to the next video when the current video finishes.

### Translation Support

The extension/add-on now supports translations. Currently the only translation offered is English, but additional translations can be added and implemented following the standard localization process for web extensions.


## [2.0.0] - 2017-07-06

### Browser Extensions

**YouTube Popout Player is now a proper browser extension for Mozilla Firefox and Google Chrome!**

### Popout Player Icon in Lower Controls

A new icon has been added to the lower right corner to allow opening the current video in a popout player. This should work for all YouTube videos, both directly on youtube.com and embedded in other web pages.

[Unreleased]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v5.2.2...HEAD
[5.2.2]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v5.2.1...v5.2.2
[5.2.1]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v5.2.0...v5.2.1
[5.2.0]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v5.1.2...v5.2.0
[5.1.2]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v5.1.1...v5.1.2
[5.1.1]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v5.1.0...v5.1.1
[5.1.0]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v5.0.0...v5.1.0
[5.0.0]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v4.4.1...v5.0.0
[4.4.1]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v4.4.0...v4.4.1
[4.4.0]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v4.3.0...v4.4.0
[4.3.0]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v4.2.0...v4.3.0
[4.2.0]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v4.1.0...v4.2.0
[4.1.0]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v3.1.1...v4.0.0
[3.1.1]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v3.0.3...v3.1.0
[3.0.3]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v3.0.0...v3.0.2
[3.0.0]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v2.1.3...v3.0.0
[2.1.3]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v2.1.0...v2.1.2
[2.1.0]: https://github.com/rthaut/YouTubePopoutPlayer/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/rthaut/YouTubePopoutPlayer/compare/86ddfb44326746126eb919cb1cfd128a166c0620...v2.0.0
