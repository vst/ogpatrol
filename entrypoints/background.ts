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
  // Attempt to parse OpenGraph data from the tab content:
  const result = await parse(tabId);

  // Handle the result:
  console.log(result);
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
