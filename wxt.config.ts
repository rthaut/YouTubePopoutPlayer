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

    const optional_permissions: UserManifest["optional_permissions"] = [];

    if (mode !== "development") {
      // the `tabs` and `scripting` permissions are automatically added by `wxt` during development
      // https://wxt.dev/guide/essentials/config/manifest.html#permissions
      optional_permissions.push("tabs");
    }

    if (browser === "firefox") {
      // Chrome is limited to 3 default shortcut keys, so we only provide these for Firefox
      commands["open-popout-force-close-command"].suggested_key = {
        default: "Alt+Shift+PageUp",
      };
      commands["open-popout-no-close-command"].suggested_key = {
        default: "Alt+Shift+PageDown",
      };

      // Firefox uses the "cookies" permission for multi-account containers support
      optional_permissions.push("cookies");
    }

    return {
      name: "__MSG_ExtensionName__",
      description: "__MSG_ExtensionDescription__",
      short_name: "__MSG_ExtensionShortName__",
      default_locale: "en",
      author: {
        email: "rthaut@gmail.com",
      },
      homepage_url: "https://rthaut.github.io/YouTubePopoutPlayer/",
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
      minimum_chrome_version: browser === "chrome" ? "90" : "91",
      browser_specific_settings: {
        gecko: {
          id: "{85b42b8f-49cd-4935-aeca-a6b32dd6ac9f}",
          strict_min_version: "109.0",
        },
      },
    } satisfies UserManifest;
  },
});
