import browser from "webextension-polyfill";

(async () => {
  await browser.contextMenus.removeAll();

  browser.contextMenus.create({
    type: "normal",
    contexts: ["image"],
    title: "Copy as Markdown Image",
    id: "copy-as-markdown-image",
  });

  browser.contextMenus.create({
    type: "normal",
    contexts: ["link"],
    title: "Copy as Markdown Link",
    id: "copy-as-markdown-link",
  });

  browser.contextMenus.create({
    type: "normal",
    contexts: ["page"],
    title: "Copy Page URL as Markdown Link",
    id: "copy-as-markdown-page",
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    console.debug("contextMenus.onClicked", info, tab);

    let data = "";

    switch (info.menuItemId) {
      case "copy-as-markdown-image":
        data = `![${info.mediaType}](${info.srcUrl})`;
        break;
      case "copy-as-markdown-link":
        data = `[${info.linkText}](${info.linkUrl})`;
        break;
      case "copy-as-markdown-page":
        if (!tab) {
          console.error("tab is not found");
          return;
        }
        data = `[${tab.title}](${tab.url})`;
        break;
    }

    browser.scripting.executeScript({
      target: {
        tabId: tab!.id!,
      },
      func: (data) => {
        navigator.clipboard.writeText(data);
      },
      args: [data],
    });
  });
})();
