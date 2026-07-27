# Playlist Feature Implementation Plan

This is a docs-only implementation plan for the related playlist feature
requests:

- [#454 Scrollable playlist navigation with links inside popout player
  window](https://github.com/rthaut/YouTubePopoutPlayer/issues/454)
- [#418 Ability to add video(s) to an existing popout
  playlist](https://github.com/rthaut/YouTubePopoutPlayer/issues/418)
- [#401 Playlist Shuffle
  Support](https://github.com/rthaut/YouTubePopoutPlayer/issues/401)
- [#394 Support For Temporary Queue
  Playlist](https://github.com/rthaut/YouTubePopoutPlayer/issues/394)

The recommended direction is to build an extension-owned playlist session
model first, then layer YouTube DOM extraction, IFrame Player API control, and
optional YouTube Data API metadata on top where they add enough value.

## Goals

- Add a reliable temporary queue concept that is owned by the extension, not by
  YouTube account state.
- Let users append video links or the current page video to an already-open
  popout playlist or queue.
- Support shuffle for extension-owned queues and for materialized playlist
  item arrays.
- Add a scrollable playlist navigation panel in the popout player when the
  extension knows the playlist items.
- Keep existing single-video, playlist URL, Watch Later fallback, window sizing,
  tab/window target, reuse, rotation, close-original-tab, and no-cookie-domain
  behavior intact.

## Non-Goals For The First Implementation

- Do not write to a user's real YouTube playlists in the first slice.
- Do not require a YouTube Data API key or OAuth consent for the first slice.
- Do not try to replicate all YouTube playlist page management actions.
- Do not depend on undocumented YouTube page application state unless a feature
  has a tested graceful fallback.

## Current Repo Touchpoints

- `src/entrypoints/background/popout.ts`
  - `OpenPopoutBackgroundHelper` extracts the current video ID and optional
    `list` URL parameter.
  - `OpenPopoutPlayer` builds YouTube embed parameters, sets `list` and
    `listType=playlist` for playlists, and uses `playlist=<video id>` to loop a
    single video.
  - Watch Later (`list=WL`) is already special-cased because the embedded
    player does not support it natively; the current workaround asks the origin
    content script for video IDs and passes them as a comma-separated
    `playlist` parameter.
  - `GetUrlForPopoutPlayer` chooses either `www.youtube.com/embed/` or
    `www.youtube-nocookie.com/embed/`.
- `src/utils/youtube.ts`
  - Extracts video IDs and the `list` query parameter.
  - `GetPlaylistVideoIDsFromDOM` currently scrapes
    `ytd-playlist-panel-renderer a[href*="v="]` and
    `ytd-playlist-video-list-renderer a[href*="v="]`.
- `src/entrypoints/content/player.ts`
  - Reads the current watch URL for `v` and `list`, captures current time and
    player dimensions, then sends `open-popout` to the background script.
- `src/entrypoints/content/controls.ts`
  - Injects controls into YouTube player UI using YouTube DOM selectors such as
    `.ytp-contextmenu`, `.ytp-right-controls-right`, `.ytp-right-controls`, and
    `.ytp-fullscreen-button`.
  - Any new in-player buttons should follow the same defensive pattern:
    selector lookup, early return, log, and no hard failure.
- `src/entrypoints/background/menus.ts`
  - Context menu supports opening video links and playlist links.
  - This is the natural place for "Add to current popout queue" and "Open
    playlist shuffled" link actions.
- `src/entrypoints/background/tabs.ts`
  - `GetPopoutPlayerTabs` already finds existing popout tabs by embed URL and
    the custom `__ytpp=1` parameter.
  - This can be reused to route append/shuffle/navigation messages to an
    existing popout.
- `src/utils/constants.ts`, `src/utils/options.ts`,
  `src/entrypoints/options/components/tabs/BehaviorTab.tsx`, and
  `src/public/_locales/en/messages.json`
  - Add playlist options here only after the session model and user-visible
    behavior are clear.
- `wxt.config.ts`
  - Current host permissions cover `youtube.com` and `youtube-nocookie.com`.
  - Current required permissions include `contextMenus`, `declarativeNetRequest`,
    `notifications`, and `storage`.
  - `tabs` is optional today and should remain optional unless a feature truly
    cannot work without it.
- `docs/pages/options.html`, `docs/pages/permissions.html`, and
  `docs/pages/faq.html`
  - Update after product changes, especially if new permissions, API use, or
    queue persistence settings are added.

## Research Findings

### YouTube Embedded Player URL Parameters

The embedded player officially supports loading a playlist with
`listType=playlist` and `list=<playlist id>`. The same docs say a playlist
embed URL does not need a video ID when `list` and `listType` are present.

The `playlist` URL parameter is different from `list`: it accepts a
comma-separated list of video IDs. YouTube documents that the URL path video ID
plays first, followed by the IDs in the `playlist` parameter. This is the
mechanism the repo already uses for Watch Later fallback and single-video loop.

The `loop` parameter loops either the initial video or the full playlist. For
single-video loop, YouTube documents the current repo's behavior: set
`loop=1` and set `playlist` to the same video ID.

The `enablejsapi=1` parameter enables IFrame Player API control. If that is
used, YouTube recommends setting `origin` to the host page's scheme and full
domain.

Important limitation: the player parameters page does not document an embed URL
`index` parameter. A normal YouTube watch URL may contain `index`, but this
should be treated as a hint from YouTube's site URL, not a stable embedded
player contract. The IFrame API does support an `index` argument/property for
`cuePlaylist` and `loadPlaylist`.

### YouTube IFrame Player API Capabilities

Relevant official methods:

- `loadPlaylist` and `cuePlaylist` can accept either a playlist ID/list object
  or an array of video IDs. They support a zero-based start `index`.
- `nextVideo`, `previousVideo`, and `playVideoAt(index)` can move within the
  current playlist.
- `setShuffle(true)` shuffles the current playlist order. YouTube documents
  that shuffle does not persist when a different playlist is loaded.
- `getPlaylist()` returns the current video ID array in current order. If
  shuffle was applied, this reflects shuffled order.
- `getPlaylistIndex()` returns the zero-based index of the current item, also in
  shuffled order when applicable.
- `onReady`, `onStateChange`, and `onError` are needed for a robust UI.

Implementation caveat: the extension currently opens the YouTube embed URL as
the top-level popout page. The official IFrame API examples are for a host page
that contains a YouTube iframe, then creates a `YT.Player` object around that
iframe. Before depending on these methods in product code, do a short
implementation spike to verify one of these control strategies:

- Keep the current top-level YouTube embed page and use a main-world bridge or
  direct `postMessage` control. This has the smallest UI migration but may be
  undocumented and browser-specific.
- Move to an extension-owned popout shell page that contains the YouTube iframe
  and an extension-owned playlist panel. This is cleaner for UI and state, but
  it changes the popout URL model and needs careful no-cookie, origin, autoplay,
  permissions, and store-review review.

Do not inject `https://www.youtube.com/iframe_api` as remotely hosted extension
code without validating Chrome Web Store policy. Chrome's Manifest V3 docs say
extension code must be bundled, and adding a script tag with a remote resource
is a common remotely-hosted-code violation. If a shell page uses IFrame API-like
control, prefer bundled code and message-based control, or prove that using
YouTube's page-owned script is allowed and cross-browser.

### YouTube Data API Capabilities And Limits

`playlistItems.list` can retrieve the items in a specified playlist. It returns
playlist item resources that include fields such as title, position, and
resource IDs when `part=snippet` is requested. The quota cost is 1 unit per
call. API responses are paginated; official samples use `maxResults=50` and
`pageToken` to retrieve additional pages.

Every YouTube Data API application needs credentials. Google supports API keys
for general API access and OAuth 2.0 for private user data. A bundled API key in
an open-source browser extension is not a secret and would share quota across
all users. A user-provided key is poor product UX. OAuth adds consent, account,
scope, privacy, and review work.

`playlistItems.insert` can add a resource to a playlist, but it costs 50 quota
units per call and requires OAuth authorization with YouTube scopes. The API
also returns `playlistOperationUnsupported` for playlists that cannot be
mutated through that endpoint. This should not be the first path for issue 418.

Data API does not represent a user's transient YouTube queue. It can help with
public playlist metadata and real user playlist writes after OAuth, but it does
not solve temporary queue capture by itself.

### Browser Extension Constraints

Chrome extension content scripts run in isolated worlds. They can read and
modify the DOM, but they cannot directly access JavaScript variables/functions
created by the page. If a future implementation must call YouTube page-internal
objects, it needs a main-world script bridge and a strict message protocol.

Content scripts are subject to the origin of the page for cross-origin network
requests. Extension service workers and extension pages can make cross-origin
requests when the extension has host permissions. If Data API fetching is added,
route it through background code and add a narrow host permission such as
`https://www.googleapis.com/*`.

Host permission changes can trigger user-visible warnings. Prefer optional host
permissions if an API-backed metadata feature is optional.

The existing `storage` permission can hold session state. Chrome documents
`storage.local` as 10 MB, enough for temporary queue metadata if entries are
small. Because this repo supports Firefox 113, do not assume
`storage.session` is available until compatibility is checked. Use
`storage.local` with explicit expiration/cleanup for temporary playlist
sessions, or an in-memory map plus local persistence for service-worker restart
recovery.

### YouTube Queue And DOM Inference

YouTube Help describes queue as a way to set up videos to watch next and states
that the queue does not save after the browser closes. That makes queue a poor
fit for official playlist APIs and a good fit for extension-owned temporary
state.

What can be inferred reliably:

- Current URL can provide `v` and `list`; sometimes it may include an `index`
  query parameter. Treat `index` as a hint only.
- A normal playlist URL can provide a playlist ID.
- In the popout URL, this extension controls `__ytpp`, `list`, `playlist`,
  `loop`, `autoplay`, `start`, `controls`, `rotation`, and no-cookie domain
  choice.

What cannot be inferred reliably from URL alone:

- Full playlist item list, titles, thumbnails, or unavailable/private entries.
- User's transient YouTube queue.
- Watch Later contents.
- Whether all videos are embeddable.
- The authoritative shuffled order of YouTube's own player unless an API
  control bridge can call `getPlaylist()`.

What can be inferred from YouTube DOM, with risk:

- Visible or rendered playlist panel links.
- Visible or rendered playlist page item links.
- Possibly the current queue panel contents.
- Item titles and thumbnails if selectors are expanded beyond the current video
  ID-only implementation.

DOM extraction risks:

- YouTube uses custom elements, virtualization, experiments, and layout
  variants. Off-screen playlist items may not exist in the DOM.
- Current selectors are already YouTube-specific:
  `ytd-playlist-panel-renderer`, `ytd-playlist-video-list-renderer`, and
  `.ytp-*` controls.
- Queue selectors must be discovered and tested separately. Do not assume the
  playlist panel selectors cover queue.
- DOM extraction is unavailable for context menu playlist links opened from
  non-YouTube pages.

## Proposed Architecture

### Playlist Session Model

Add a pure, tested model before adding UI. Suggested shape:

```ts
export interface PlaylistSession {
  id: string;
  source:
    | "manual"
    | "youtube-playlist"
    | "youtube-watch-later"
    | "youtube-queue"
    | "single-video";
  originalListId?: string;
  originUrl?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  currentIndex: number;
  items: PlaylistSessionItem[];
  shuffle: {
    enabled: boolean;
    seed?: string;
    order?: number[];
  };
  repeat: "off" | "all";
}

export interface PlaylistSessionItem {
  videoId: string;
  title?: string;
  url?: string;
  thumbnailUrl?: string;
  sourceIndex?: number;
  embeddable?: boolean;
}
```

Model operations should be pure functions:

- Create from one video.
- Create from a materialized item array.
- Append unique or duplicate items, based on UX decision.
- Remove/reorder items.
- Move to next/previous/current item.
- Toggle shuffle and compute a stable shuffled order.
- Serialize to storage and strip large/untrusted fields.

Keep the model independent from YouTube DOM and browser APIs so it can be
covered heavily by unit tests.

### Session Storage And Messaging

Add a background-owned session service, for example
`src/entrypoints/background/playlist-sessions.ts`.

Responsibilities:

- Store active sessions keyed by session ID.
- Persist sessions to `browser.storage.local` with an expiration timestamp.
- Clean expired sessions on install/update/startup and when the last popout
  closes.
- Resolve "current popout session" for append actions.
- Send session updates to popout content scripts.

Suggested message actions:

- `playlist-session-create`
- `playlist-session-open-popout`
- `playlist-session-append`
- `playlist-session-remove`
- `playlist-session-reorder`
- `playlist-session-set-current-index`
- `playlist-session-toggle-shuffle`
- `playlist-session-get`
- `playlist-session-updated`

Do not let content scripts request arbitrary network URLs through the
background. If Data API fetch is later added, messages should pass playlist IDs
or video IDs only, and the background should construct the API URL.

### Popout Playback Strategies

Implement playback through the least risky strategy first, but keep a narrow
interface so the backend can change.

```ts
interface PopoutPlaybackController {
  loadSession(session: PlaylistSession): Promise<void>;
  playIndex(index: number): Promise<void>;
  next(): Promise<void>;
  previous(): Promise<void>;
  setShuffle(enabled: boolean): Promise<void>;
}
```

Possible implementations:

1. URL-based controller:
   - For short materialized sessions, construct an embed URL with path video ID
     and comma-separated `playlist` IDs.
   - For large sessions, navigate to the selected video and let extension UI
     drive next/previous.
   - Pros: matches current architecture and avoids IFrame API uncertainty.
   - Cons: reloads the player on some operations, URL length limits, less
     native playlist behavior.
2. IFrame API controller:
   - Use `enablejsapi=1`, a verified bridge, and API methods such as
     `loadPlaylist`, `playVideoAt`, `getPlaylist`, and `setShuffle`.
   - Pros: cleaner player control and native shuffle/next behavior.
   - Cons: needs a spike because current popout is a top-level embed, not a
     host page with an iframe.
3. Extension shell controller:
   - Open an extension HTML page that hosts a YouTube iframe and the playlist UI.
   - Pros: best UI ownership and avoids placing heavy UI inside YouTube's DOM.
   - Cons: bigger migration, origin/no-cookie/autoplay review, and remote-code
     policy concerns around the IFrame API wrapper.

Recommended first implementation: URL-based controller for extension-owned
sessions, plus a separate IFrame API feasibility spike before replacing it.

### Popout Playlist Navigation UI

Add a compact extension-owned panel in the popout only when a session has more
than one item. It should be usable at small popout sizes and must not block
native YouTube controls.

Expected controls:

- Show/hide playlist panel button.
- Scrollable list with current item highlighted.
- Video title if known; fallback to video ID.
- Play item action.
- Remove item action for extension-owned temporary queues.
- Move up/down or drag reorder for temporary queues, if feasible.
- Shuffle toggle.
- Previous/next controls if native controls are unavailable or hidden.
- Empty/error state when playlist data cannot be materialized.

Accessibility and layout:

- Buttons need labels/tooltips through localized messages.
- Keyboard focus should stay within the panel when opened only if it behaves
  like a modal/drawer; otherwise normal tab order is fine.
- Keep a minimum viable layout at YouTube's documented 200x200 embed minimum,
  though the extension usually opens larger windows.
- Avoid inserting UI inside YouTube's own control bar except for a single
  toggle button. Put the scrollable panel in a separate overlay or side drawer.

## Issue Plans

### #394 Temporary Queue Playlist

Recommended path: extension-owned temporary queue.

Implementation slices:

1. Add playlist session model and storage.
2. Add "Open current video as temporary queue" action by reusing current
   `open-popout` flow with a new session ID.
3. Add "Add video to current popout queue" context menu for YouTube video links.
4. Add popout panel with queue item list, remove, reorder, previous, next, and
   clear actions.
5. Add DOM extraction from YouTube's current queue panel only after selectors
   are verified in Chrome, Edge, and Firefox.

Expected behavior:

- If no popout queue exists, "Add to current popout queue" can either open a new
  temporary queue or show a notification. Prefer an option after initial UX
  testing; default to opening a new temporary queue to keep the action useful.
- Queue is temporary by default. Persist only long enough to survive background
  service worker restarts and accidental popout reloads.
- Closing the popout should expire the session unless the user opts into
  restore.

Dependencies:

- Existing `storage` permission is enough.
- Existing YouTube host permissions are enough for DOM extraction from YouTube
  pages.
- No Data API or OAuth dependency.

Risk:

- Capturing YouTube's own queue depends on brittle DOM and may fail when the
  queue panel is collapsed, virtualized, or absent.

Acceptance criteria:

- User can create a temporary popout queue from at least one video.
- User can add videos from YouTube links to an existing popout queue.
- User can navigate, remove, and reorder extension-owned queue items.
- Queue state survives a background service worker restart while the popout is
  open.
- Failure to read YouTube's own queue shows a clear fallback instead of opening
  a broken popout.

### #418 Add Videos To An Existing Popout Playlist

Recommended path: append to an extension-owned playlist session. Treat real
YouTube playlist mutation as a separate future feature.

Implementation paths:

1. Extension session append, recommended:
   - If an existing popout session exists, send appended video IDs to the
     session service.
   - Update popout panel immediately.
   - If using URL-based playback and the appended item is not current, avoid
     reloading until needed.
2. Native YouTube embed append:
   - If an IFrame API bridge is proven, call `loadPlaylist` with the updated
     array while preserving current video/index.
   - This is a playback implementation detail, not the source of truth.
3. YouTube Data API `playlistItems.insert`, not first:
   - Requires OAuth and YouTube scopes.
   - Costs 50 units per added video.
   - Mutates a real user playlist and may fail for unsupported playlists.

User-visible actions:

- Link context menu: "Add Video to Current Popout Queue".
- Link context menu for playlist links: "Add Playlist to Current Popout Queue"
  only after playlist materialization exists.
- Player/page button: "Add Current Video to Popout Queue".
- Optional behavior setting: when no compatible popout exists, choose between
  "open a new queue" and "show a notification".

Acceptance criteria:

- Append works from a YouTube watch page and from link context menus.
- Append does not require a YouTube account or Data API key.
- Appending to a reused popout does not lose current playback position unless
  the user explicitly plays the new item.
- Duplicate handling is documented and tested.

### #401 Playlist Shuffle Support

Recommended path: implement shuffle in the extension session model first, then
optionally use IFrame API `setShuffle(true)` when available.

Implementation paths:

1. Extension-owned shuffle, recommended first:
   - Materialize video IDs into a session.
   - Store original order and shuffled order.
   - Current video should remain current when shuffle is enabled.
   - Next/previous use shuffled order.
   - Display the shuffled order in the popout panel.
2. IFrame API shuffle:
   - Add `enablejsapi=1` and verified player control bridge.
   - Call `setShuffle(true)` after `onReady`.
   - Use `getPlaylist()` and `getPlaylistIndex()` to sync UI with native player
     order.
   - Remember that YouTube says shuffle does not persist across loaded
     playlists.
3. Data API-assisted shuffle:
   - For public playlist links where DOM is unavailable, fetch all playlist
     items, then create a shuffled extension session.
   - Avoid this in first release due API key/quota UX.

User-visible actions:

- Context menu: "Open Playlist Shuffled" for playlist links.
- Popout panel shuffle toggle.
- Playlist page/player button only if DOM extraction can materialize the list.
- Optional setting: default shuffle off/on for temporary queues only. Avoid a
  global default for all playlists until users can see and control it.

Acceptance criteria:

- Shuffle can be toggled for extension-owned queues and materialized playlists.
- Current item remains stable when shuffle is toggled.
- Next item follows shuffled order.
- Turning shuffle off returns to original order.
- Shuffle state is reflected in the popout UI.

### #454 Scrollable Playlist Navigation With Links

Recommended path: implement navigation for extension-owned sessions first, then
add metadata/materialization paths for YouTube playlists.

Implementation paths:

1. Session-backed panel, recommended first:
   - Works for temporary queues, appended videos, Watch Later DOM fallback, and
     any materialized playlist.
   - Titles show when known; video IDs are fallback labels.
   - Clicking an item calls `playIndex` on the playback controller.
2. DOM-backed playlist materialization:
   - Extend `GetPlaylistVideoIDsFromDOM` into a safer
     `GetPlaylistItemsFromDOM` that returns IDs, URLs, titles, thumbnails, and
     source index where available.
   - Use only on YouTube pages where the content script can see the playlist or
     queue panel.
   - Keep the existing video-ID-only fallback.
3. Data API-backed metadata:
   - Use `playlistItems.list` for public playlists if API credentials are
     approved.
   - Cache playlist pages by playlist ID and page token/etag where possible.
   - Handle private, deleted, non-embeddable, and age-restricted videos.
4. IFrame API native playlist sync:
   - If available, use `getPlaylist()` and `getPlaylistIndex()` to update
     current item and shuffled order.
   - The API returns IDs, not titles; still need session metadata.

User-visible UI:

- A slim playlist button in the popout player.
- A drawer/panel with a scrollable item list.
- Current item indicator.
- Click item to play in the popout.
- Open original YouTube watch URL in a normal tab as a secondary action, not
  the primary click.

Acceptance criteria:

- Panel appears only when the extension has multiple known items.
- Panel scroll position keeps the current item visible.
- Item click switches playback without opening an unrelated browser tab.
- Panel works when YouTube native controls are set to "none", "standard", or
  "extended".
- If titles are unavailable, the panel remains useful with video IDs or compact
  URLs.

## Browser And Permission Plan

First implementation should require no new install-time permissions.

Likely no new permissions:

- Extension-owned temporary queue.
- Append video links to existing popout queue.
- Shuffle materialized sessions.
- Popout panel UI.
- DOM extraction from already-permitted YouTube pages.

Potential future permissions:

- `https://www.googleapis.com/*` host permission for YouTube Data API calls from
  the background service worker.
- `identity` or browser-specific OAuth support if writing to real YouTube
  playlists or reading private user playlists.
- Additional optional host permissions only if non-YouTube pages need richer
  link inspection beyond context menu target URLs.

Permission documentation must be updated if any new permission or external API
request is introduced.

## Testing Strategy

Unit tests:

- Video/list/index parsing.
- Playlist item normalization and de-duplication.
- Session creation, append, remove, reorder, next/previous.
- Shuffle order stability and current-item preservation.
- URL construction for manual playlist sessions, including no-cookie domain.
- Storage serialization and expiration cleanup.

Background/message tests:

- Append routes to the correct popout session.
- Reuse existing popout does not create duplicate sessions.
- Closing a popout expires or detaches the session as specified.
- Invalid content-script requests cannot fetch arbitrary URLs.

Content/DOM tests where feasible:

- DOM extraction returns IDs from existing playlist selectors.
- DOM extraction tolerates missing panels and virtualized/incomplete lists.
- Popout panel rendering handles missing titles/thumbnails.

Manual browser matrix:

- Chrome, Edge, Firefox.
- Popout target: window and tab.
- Reuse existing window/tab enabled and disabled.
- No-cookie domain enabled and disabled.
- Controls setting: none, standard, extended.
- Optional `tabs` permission granted and denied.
- Normal watch URL with playlist.
- Playlist-only URL.
- Watch Later.
- YouTube queue.
- Context menu from YouTube page and from a non-YouTube page.
- Long playlist with more than 50 items.
- Private/deleted/age-restricted/non-embeddable items.
- Autoplay blocked by browser.

Validation commands after implementation:

- `npm run compile`
- `npm run lint`
- `npm run test:unit`
- Browser build checks for Chrome, Edge, and Firefox when permissions or
  manifest behavior changes.
- Docs build if docs pages are updated: `npm run docs:build`.

## Risks And Mitigations

- YouTube DOM changes:
  - Keep DOM scraping isolated in `src/utils/youtube.ts` or a dedicated
    `playlist-dom.ts`.
  - Return partial results and warnings instead of throwing.
  - Prefer extension-owned session state after materialization.
- IFrame API uncertainty in current top-level embed architecture:
  - Do a spike before committing product UI to API methods.
  - Keep playback controller interface small.
- URL length limits for comma-separated `playlist`:
  - Use URL-based playback for short queues.
  - For long queues, use session-driven single-item navigation or verified API
    `loadPlaylist`.
- API key and quota:
  - Avoid Data API in the first implementation.
  - If added later, prefer optional feature gating and caching.
- OAuth and user trust:
  - Do not request YouTube write scopes for temporary queue support.
  - Treat real playlist mutation as a separate feature with explicit docs.
- Non-embeddable videos:
  - Surface YouTube player errors.
  - Allow skip/remove from extension session.
  - Document that embedded playback can fail when owners disable embeds,
    videos are private, or videos are age restricted.
- Service worker lifecycle:
  - Persist active sessions with TTL in `storage.local`.
  - Rehydrate on message/popout load.
  - Keep popout content able to request current session after reload.

## Recommended Sequencing

1. Playlist session foundation:
   - Add pure model and tests.
   - Add background session service and message types.
   - Add no user-visible UI beyond maybe a hidden debug/dev path.
2. Temporary queue and append:
   - Add "Open as temporary queue" and "Add to current popout queue" actions.
   - Add popout panel for extension-owned sessions.
   - Use URL-based playback.
3. Shuffle for extension-owned sessions:
   - Add shuffle toggle in popout panel.
   - Add "Open playlist shuffled" where the item list is already materialized.
4. DOM materialization:
   - Extend current playlist DOM extraction to item metadata.
   - Add YouTube queue extraction behind defensive checks.
   - Use this for Watch Later, current playlist page, and current queue.
5. IFrame API feasibility and playback upgrade:
   - Spike top-level embed versus extension shell.
   - If stable, switch playback controller to API methods.
   - Sync current index and shuffled order with `getPlaylist()` and
     `getPlaylistIndex()`.
6. Optional Data API metadata:
   - Decide API key/OAuth approach explicitly.
   - Add background fetch with narrow host permission.
   - Update permissions docs and privacy text.

## Recommended First Implementation Slice

Implement the playlist session foundation and a minimal extension-owned
temporary queue:

- `PlaylistSession` model with append/remove/reorder/next/previous/shuffle pure
  functions and unit tests.
- Background session storage with TTL in `storage.local`.
- Context menu action to add a YouTube video link to the current popout queue.
- Popout panel for sessions with known video IDs.
- URL-based playback fallback that does not require YouTube Data API or IFrame
  API control.

This slice directly unlocks #394 and #418, gives #401 a reliable state model,
and provides the UI foundation for #454.

## Issue Comment Notes

### #394 Comment Draft

Planned direction: implement this as an extension-owned temporary queue rather
than trying to depend on YouTube's transient queue state. YouTube's own queue is
not saved after the browser closes, and the full queue cannot be inferred from a
URL. The first useful slice is a playlist session model stored by the extension,
plus UI/actions to open a temporary queue and add more videos to it. Capturing
YouTube's current queue from the page can be added as a best-effort DOM
extraction later because that part depends on brittle YouTube selectors.

### #418 Comment Draft

Planned direction: append to the active popout's extension-owned playlist
session. This avoids requiring YouTube OAuth or mutating a real YouTube
playlist. A later YouTube Data API path could add videos to a user's real
playlist, but that requires YouTube scopes, costs quota per inserted item, and
does not work for every playlist type. The first implementation should add
context menu and current-page actions that append videos to the open popout
queue without interrupting current playback.

### #401 Comment Draft

Planned direction: support shuffle first in the extension's playlist session
model. For any materialized playlist or temporary queue, the extension can keep
the original order, generate a shuffled order, and drive next/previous from
that order. The YouTube IFrame API has `setShuffle(true)`, `getPlaylist()`, and
`getPlaylistIndex()`, but the current popout opens the YouTube embed as a
top-level page, so we should first spike the control bridge before depending on
native IFrame API shuffle.

### #454 Comment Draft

Planned direction: add a scrollable popout playlist panel when the extension has
a known playlist session. It can work reliably for temporary queues, appended
videos, and playlists materialized from DOM or a future metadata provider.
YouTube's embed URL can play a playlist, but it does not provide titles or a
stable scrollable playlist UI for the extension to reuse. For arbitrary public
playlists, the YouTube Data API can provide metadata, but that introduces API
credentials/quota; DOM extraction is lower-friction but brittle and incomplete
for virtualized lists.

## Source Links

- [YouTube Embedded Players and Player
  Parameters](https://developers.google.com/youtube/player_parameters)
- [YouTube IFrame Player API
  Reference](https://developers.google.com/youtube/iframe_api_reference)
- [YouTube Data API `playlistItems`
  resource](https://developers.google.com/youtube/v3/docs/playlistItems)
- [YouTube Data API `playlistItems.list`](https://developers.google.com/youtube/v3/docs/playlistItems/list)
- [YouTube Data API `playlistItems.insert`](https://developers.google.com/youtube/v3/docs/playlistItems/insert)
- [YouTube Data API quota
  calculator](https://developers.google.com/youtube/v3/determine_quota_cost)
- [Obtaining YouTube Data API authorization
  credentials](https://developers.google.com/youtube/registering_an_application)
- [YouTube Help: Queue videos on
  YouTube](https://support.google.com/youtube/answer/9546304?co=GENIE.Platform%3DDesktop&hl=en)
- [YouTube Help: Embed videos and
  playlists](https://support.google.com/youtube/answer/171780?hl=en)
- [YouTube Help: Videos not appearing in embedded
  playlist](https://support.google.com/youtube/answer/97363?hl=en)
- [Chrome Extensions: Content
  scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Chrome Extensions: Cross-origin network
  requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)
- [Chrome Extensions: Declare
  permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
- [Chrome Extensions: Deal with remote hosted code
  violations](https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code)
- [Chrome Extensions: `chrome.storage`
  API](https://developer.chrome.com/docs/extensions/reference/api/storage)
