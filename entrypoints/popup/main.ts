import "./style.css";

// Get HTML elements of interest via declaration:
declare const message: HTMLDivElement;
declare const ogImage: HTMLDivElement;
declare const ogProps: HTMLDivElement;

// Get our service:
const SERVICE = getService();

// Query the active tab and work on it:
browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
  // Clear content slots:
  message.innerHTML = "";
  ogImage.innerHTML = "";
  ogProps.innerHTML = "";

  // We should have a single tab here:
  const tab = tabs[0];

  // Make sure that we have a tab:
  if (!tab) {
    return;
  }

  // Attempt to get the tab URL;
  const url = tab.url ?? tab.pendingUrl;

  // Make sure that we have a URL:
  if (!url) {
    return;
  }

  // Attempt to find and render the record for the URL:
  renderOpenGraphData(url);
});

async function renderOpenGraphData(url: string) {
  // Show loading message:
  message.innerHTML = "Loading...";

  // Find record for the current page:
  const record = await SERVICE.find(url);

  // Remove loading message:
  message.removeChild(message.firstChild!);

  // Check if we have a record:
  if (!record) {
    message.innerHTML = "No OpenGraph record found for this page.";
    return;
  }

  // Render images if any:
  record.ogdata.ogImage?.forEach((image) => {
    const img = document.createElement("img");
    img.src = image.url;
    img.alt = image.alt ?? "";
    ogImage.appendChild(img);
  });

  // Render properties:
  const pre = document.createElement("pre");
  pre.innerHTML = JSON.stringify(record, null, 2);
  ogProps.appendChild(pre);
}
