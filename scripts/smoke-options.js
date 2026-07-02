const { readFile } = require("node:fs/promises");
const { createServer } = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const extensionDir = path.resolve(".output/chrome-mv3");
const messagesPath = path.join(extensionDir, "_locales/en/messages.json");
const optionsPagePath = path.join(extensionDir, "options.html");

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
]);

async function loadJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function fileExists(file) {
  try {
    await readFile(file);
    return true;
  } catch {
    return false;
  }
}

function toResponsePath(requestUrl) {
  const { pathname } = new URL(requestUrl, "http://127.0.0.1");
  const relativePath = decodeURIComponent(
    pathname === "/" ? "/options.html" : pathname,
  );
  const resolvedPath = path.resolve(
    extensionDir,
    relativePath.replace(/^[/\\]+/, ""),
  );

  if (
    resolvedPath !== extensionDir &&
    !resolvedPath.startsWith(`${extensionDir}${path.sep}`)
  ) {
    return undefined;
  }

  return resolvedPath;
}

function createStaticServer() {
  const server = createServer(async (request, response) => {
    const file = toResponsePath(request.url ?? "/");

    if (file === undefined) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    try {
      const body = await readFile(file);
      response.writeHead(200, {
        "content-type":
          mimeTypes.get(path.extname(file)) ?? "application/octet-stream",
      });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function createBrowserApiStub(messages) {
  const serializedMessages = JSON.stringify(messages);

  return `
    (() => {
      const messages = ${serializedMessages};
      const messageLookup = new Map(
        Object.entries(messages).map(([key, value]) => [key.toLowerCase(), value]),
      );
      const storedValues = {};
      const storageListeners = new Set();

      function asSubstitutionArray(substitutions) {
        if (substitutions === undefined) {
          return [];
        }

        return Array.isArray(substitutions) ? substitutions : [substitutions];
      }

      function resolveMessage(messageName, substitutions) {
        const entry = messageLookup.get(String(messageName).toLowerCase());

        if (!entry) {
          return "";
        }

        let message = entry.message ?? "";
        const values = asSubstitutionArray(substitutions);

        for (const [placeholderName, placeholder] of Object.entries(
          entry.placeholders ?? {},
        )) {
          const content = placeholder.content ?? "";
          const replacement = content.replace(
            /\\$(\\d+)/g,
            (_, index) => values[Number(index) - 1] ?? "",
          );
          message = message.replaceAll(
            new RegExp("\\\\$" + placeholderName + "\\\\$", "gi"),
            replacement,
          );
        }

        values.forEach((value, index) => {
          message = message.replaceAll("$" + (index + 1), value);
        });

        return message;
      }

      function getStorageValues(keys) {
        if (keys === undefined || keys === null) {
          return { ...storedValues };
        }

        if (typeof keys === "string") {
          return { [keys]: storedValues[keys] };
        }

        if (Array.isArray(keys)) {
          return Object.fromEntries(keys.map((key) => [key, storedValues[key]]));
        }

        return Object.fromEntries(
          Object.entries(keys).map(([key, fallback]) => [
            key,
            storedValues[key] ?? fallback,
          ]),
        );
      }

      function notifyStorageListeners(changes) {
        if (!Object.keys(changes).length) {
          return;
        }

        for (const listener of storageListeners) {
          listener(changes, "local");
        }
      }

      const localStorageArea = {
        async get(keys) {
          return getStorageValues(keys);
        },
        async set(items) {
          const changes = {};
          for (const [key, value] of Object.entries(items)) {
            changes[key] = {
              oldValue: storedValues[key],
              newValue: value,
            };
            storedValues[key] = value;
          }
          notifyStorageListeners(changes);
        },
        async remove(keys) {
          const keyList = Array.isArray(keys) ? keys : [keys];
          const changes = {};
          for (const key of keyList) {
            changes[key] = { oldValue: storedValues[key] };
            delete storedValues[key];
          }
          notifyStorageListeners(changes);
        },
        async clear() {
          const changes = {};
          for (const key of Object.keys(storedValues)) {
            changes[key] = { oldValue: storedValues[key] };
            delete storedValues[key];
          }
          notifyStorageListeners(changes);
        },
        onChanged: {
          addListener(listener) {
            storageListeners.add(listener);
          },
          removeListener(listener) {
            storageListeners.delete(listener);
          },
        },
      };

      const extensionApi = {
        i18n: {
          getMessage: resolveMessage,
        },
        permissions: {
          async request() {
            return true;
          },
          async remove() {
            return true;
          },
        },
        runtime: {
          id: "options-smoke",
          getBrowserInfo: async () => ({ name: "Chrome" }),
          getURL: (resourcePath) => new URL(resourcePath, window.location.origin).href,
        },
        storage: {
          local: localStorageArea,
          sync: localStorageArea,
          managed: localStorageArea,
        },
      };

      window.browser = extensionApi;
      window.chrome = extensionApi;
    })();
  `;
}

async function waitForVisible(locator, description) {
  await locator
    .waitFor({ state: "visible", timeout: 10_000 })
    .catch((error) => {
      throw new Error(`Expected visible ${description}: ${error.message}`);
    });
}

async function runSmoke() {
  if (!(await fileExists(optionsPagePath))) {
    throw new Error(
      `Built options page was not found at ${optionsPagePath}. Run npm run build:chrome first.`,
    );
  }

  const messages = await loadJson(messagesPath);
  const server = await createStaticServer();
  const { port } = server.address();
  const pageUrl = `http://127.0.0.1:${port}/options.html`;
  const failures = [];
  let browser;

  try {
    browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1000, height: 900 },
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        failures.push(`console error: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      failures.push(`page error: ${error.message}`);
    });
    page.on("requestfailed", (request) => {
      failures.push(
        `request failed: ${request.method()} ${request.url()} (${request.failure()?.errorText})`,
      );
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failures.push(`HTTP ${response.status()}: ${response.url()}`);
      }
    });

    await page.route("https://fonts.googleapis.com/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/css; charset=utf-8",
        body: "",
      }),
    );
    await page.addInitScript(createBrowserApiStub(messages));

    await page.goto(pageUrl, { waitUntil: "networkidle" });

    const behaviorTab = page.getByRole("tab", { name: "Behavior" });
    const sizePositionTab = page.getByRole("tab", { name: "Size / Position" });
    const advancedTab = page.getByRole("tab", { name: "Advanced" });

    await waitForVisible(behaviorTab, "Behavior tab");
    await waitForVisible(sizePositionTab, "Size / Position tab");
    await waitForVisible(advancedTab, "Advanced tab");
    await waitForVisible(
      page.getByRole("heading", { name: "Popout Player Behavior" }),
      "Behavior heading",
    );

    await sizePositionTab.click();
    await waitForVisible(
      page.getByRole("heading", { name: "Popout Player Size" }),
      "Size heading",
    );
    await waitForVisible(
      page.getByRole("heading", { name: "Popout Player Position" }),
      "Position heading",
    );

    await advancedTab.click();
    await waitForVisible(
      page.getByRole("heading", { name: "Advanced Settings" }),
      "Advanced heading",
    );

    await page.waitForTimeout(250);

    if (failures.length) {
      throw new Error(`Options page smoke failures:\n${failures.join("\n")}`);
    }

    console.log(
      "Options page smoke passed for Behavior, Size / Position, and Advanced tabs.",
    );
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

runSmoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
