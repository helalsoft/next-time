export default defineBackground(() => {
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url?.startsWith('chrome://')) {
      browser.action.disable(tabId);
    } else {
      browser.action.enable(tabId);
      
      // Notify content script to check reminders on URL change or load completion
      if (changeInfo.url || changeInfo.status === 'complete') {
        browser.tabs.sendMessage(tabId, { type: 'REFRESH_REMINDERS' }).catch(() => {
          // Ignore errors when content script isn't ready
        });
      }
    }
  });

  browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await browser.tabs.get(activeInfo.tabId);
    if (tab.url?.startsWith('chrome://')) {
      browser.action.disable(activeInfo.tabId);
    } else {
      browser.action.enable(activeInfo.tabId);
      // Also check when switching to an existing tab
      browser.tabs.sendMessage(activeInfo.tabId, { type: 'REFRESH_REMINDERS' }).catch(() => {});
    }
  });
});
