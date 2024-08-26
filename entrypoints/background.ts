import ogs from "open-graph-scraper-lite";
import type { SuccessResult } from "open-graph-scraper-lite";

export default defineBackground(() => {
  browser.tabs.onActivated.addListener(({ tabId }) => {
    process(tabId);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo?.status === "complete") {
      process(tabId);
    }
  });
});

export async function process(tabId: number): Promise<void> {
  // Reset the icon:
  setIcon();

  // Attempt to parse OpenGraph data from the tab content:
  const result = await parse(tabId);

  // Handle the result:
  console.log(result);
  setIcon(result);
}

export async function parse(tabId: number): Promise<ParseResult> {
  // Get the tab:
  const tab = await browser.tabs.get(tabId);

  // Attempt to get the tab URL;
  const url = tab.url ?? tab.pendingUrl;

  // Return if we do not have a URL:
  if (!url) {
    return { status: "not-applicable" };
  }

  // Attempt to get the hostname:
  const hostname = new URL(url).hostname;

  // Return if we do not have a hostname:
  if (!hostname) {
    return { status: "not-applicable" };
  }

  // Cool, we have a nice tab!
  console.log("Tab activated:", url, hostname);

  // Get the HTML content:
  const [{ result: html }] = await browser.scripting.executeScript({
    target: { tabId },
    func: () => {
      return document.head.innerHTML;
    },
  });

  // Attempt to parse the OpenGraph data:
  const result = await ogs({ html })
    .then(({ error, result }) => {
      if (error) {
        console.error("Error while trying to extract OpenGraph data.");
        return { status: "error", ogdata: result } as ParseResultError;
      }

      // Return with success:
      return { status: "success", ogdata: result } as ParseResultSuccess;
    })
    .catch((error) => {
      console.error("Error while trying to extract OpenGraph data.", error);
      return { status: "error" } as ParseResultError;
    });

  // Return the result:
  return result;
}

export type OgObject = SuccessResult["result"];

export type ParseResult =
  | ParseResultSuccess
  | ParseResultError
  | ParseResultNotApplicable;

export type ParseResultSuccess = {
  status: "success";
  ogdata: OgObject;
};

export type ParseResultError = {
  status: "error";
  ogdata?: OgObject;
};

export type ParseResultNotApplicable = {
  status: "not-applicable";
};

export const ICONS = {
  default: {
    16: "icon/16.png",
    32: "icon/32.png",
    48: "icon/48.png",
    96: "icon/96.png",
    128: "icon/128.png",
  },
  success: {
    16: "icon/16_success.png",
    32: "icon/32_success.png",
    48: "icon/48_success.png",
    96: "icon/96_success.png",
    128: "icon/128_success.png",
  },
  error: {
    16: "icon/16_error.png",
    32: "icon/32_error.png",
    48: "icon/48_error.png",
    96: "icon/96_error.png",
    128: "icon/128_error.png",
  },
  "not-applicable": {
    16: "icon/16.png",
    32: "icon/32.png",
    48: "icon/48.png",
    96: "icon/96.png",
    128: "icon/128.png",
  },
};

export async function setIcon(result?: ParseResult) {
  const path = ICONS[result?.status ?? "default"];
  (browser.action ?? browser.browserAction).setIcon({ path });
}
