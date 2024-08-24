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

async function process(tabId: number) {
  // Get the tab:
  const tab = await browser.tabs.get(tabId);

  // Attempt to get the tab URL;
  const url = tab.url ?? tab.pendingUrl;

  // Return if we do not have a URL:
  if (!url) {
    return;
  }

  // Attempt to get the hostname:
  const hostname = new URL(url).hostname;

  // Return if we do not have a hostname:
  if (!hostname) {
    return;
  }

  // Cool, we have a nice tab!
  console.log("Tab activated:", url, hostname);

  const [{ result }] = await browser.scripting.executeScript({
    target: { tabId },
    func: () => {
      return document.documentElement.outerHTML;
    },
  });

  console.log(result);
}
