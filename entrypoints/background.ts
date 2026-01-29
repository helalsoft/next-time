export default defineBackground(() => {
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url?.startsWith('chrome://')) {
      browser.action.disable(tabId);
    } else {
      browser.action.enable(tabId);
    }
  });

  browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await browser.tabs.get(activeInfo.tabId);
    if (tab.url?.startsWith('chrome://')) {
      browser.action.disable(activeInfo.tabId);
    } else {
      browser.action.enable(activeInfo.tabId);
    }
  });
});
