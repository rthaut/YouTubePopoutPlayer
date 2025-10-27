import { defineConfig, type UserManifest } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  runner: {
    startUrls: ["https://www.youtube.com/feed/trending"],
    openConsole: true,
  },
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  hooks: {
    "build:manifestGenerated": (wxt, manifest) => {
      if (manifest.options_ui?.page !== undefined) {
        // set the options page to open in a new tab in development mode
        manifest.options_ui = {
          ...manifest.options_ui,
          open_in_tab: wxt.config.mode === "development",
        };
      }
    },
  },
  manifest: ({ browser, mode }) => {
    const author_developer =
      browser === "firefox"
        ? {
            // use the "developer" field for Firefox, since it doesn't support the `author.email` format
            // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/developer
            developer: {
              name: "Ryan Thaut",
              url: "https://ryan.thaut.me",
            } as UserManifest["developer"],
          }
        : {
            // use the "author" field for Edge and Chrome
            // https://developer.chrome.com/docs/extensions/reference/manifest/author
            author: {
              email: "rthaut@gmail.com",
            } as UserManifest["author"],
          };

    const commands: UserManifest["commands"] = {
      "open-popout-auto-close-command": {
        suggested_key: {
          default: "Ctrl+Up",
        },
        description: "__MSG_OpenPopoutCommandDescription__",
      },
      "open-popout-force-close-command": {
        description: "__MSG_OpenPopoutForceCloseCommandDescription__",
      },
      "open-popout-no-close-command": {
        description: "__MSG_OpenPopoutNoCloseCommandDescription__",
      },
      "rotate-video-left": {
        suggested_key: {
          default: "Alt+Shift+A",
        },
        description: "__MSG_RotateVideoLeftCommandDescription__",
      },
      "rotate-video-right": {
        suggested_key: {
          default: "Alt+Shift+D",
        },
        description: "__MSG_RotateVideoRightCommandDescription__",
      },
    };

    if (browser === "firefox") {
      // Chrome is limited to 3 default shortcut keys, so we only provide these additional defaults for Firefox
      commands["open-popout-force-close-command"].suggested_key = {
        default: "Alt+Shift+PageUp",
      };
      commands["open-popout-no-close-command"].suggested_key = {
        default: "Alt+Shift+PageDown",
      };
    }

    const optional_permissions: UserManifest["optional_permissions"] = ["tabs"];
    if (browser === "firefox") {
      // Firefox optionally uses the "cookies" permission for multi-account containers support
      optional_permissions.push("cookies");
    }

    let browser_specific_settings: UserManifest["browser_specific_settings"];
    if (browser === "firefox") {
      browser_specific_settings = {
        gecko: {
          id: "{85b42b8f-49cd-4935-aeca-a6b32dd6ac9f}",
          strict_min_version: "113.0",
        },
      };
    }

    return {
      name: "__MSG_ExtensionName__",
      description: "__MSG_ExtensionDescription__",
      short_name: "__MSG_ExtensionShortName__",
      default_locale: "en",
      homepage_url: "https://rthaut.github.io/YouTubePopoutPlayer/",
      ...author_developer,
      action: {
        default_title: "__MSG_BrowserActionTitle__",
      },
      page_action: {
        default_title: "__MSG_BrowserActionTitle__",
      },
      commands,
      declarative_net_request: {
        rule_resources: [
          {
            id: "rules",
            enabled: true,
            path: "rules.json",
          },
        ],
      },
      host_permissions: ["*://*.youtube.com/*", "*://*.youtube-nocookie.com/*"],
      permissions: [
        "contextMenus",
        "declarativeNetRequest",
        "notifications",
        "storage",
      ],
      optional_permissions,
      minimum_chrome_version:
        browser === "firefox" ? undefined : browser === "chrome" ? "90" : "91",
      browser_specific_settings,
    } satisfies UserManifest;
  },
});
