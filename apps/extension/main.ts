function getAllUrlParams<T>(url: string): T {
  // get query string from url (optional) or window
  let queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  const obj = {};

  // if query string exists
  if (queryString) {
    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    const arr = queryString.split('&');

    for (const part of arr) {
      // separate the keys and the values
      const a = part.split('=');

      // set parameter name and value (use 'true' if empty)
      const paramName = a[0];
      const paramValue = typeof a[1] === 'undefined' ? true : a[1];

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {
        // create key if it doesn't exist
        const key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          const index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string') {
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj as T;
}

chrome.tabs.onCreated.addListener(async (tab) => {
  const isAccelShooterLink =
    tab.pendingUrl &&
    tab.pendingUrl.startsWith('http://localhost:8315/accel-shooter/');
  if (isAccelShooterLink) {
    const query = getAllUrlParams<{ urls: string; group: string }>(
      tab.pendingUrl
    );
    const { urls, group } = query;
    const tabIds = [];
    const existingGroups = await chrome.tabGroups.query({ title: group });
    for (const g of existingGroups) {
      const tabs = await chrome.tabs.query({ groupId: g.id });
      chrome.tabs.remove(tabs.map((t) => t.id));
    }
    const urlList = JSON.parse(decodeURIComponent(urls));
    if (urlList.length > 0) {
      for (const url of JSON.parse(decodeURIComponent(urls))) {
        const t = await chrome.tabs.create({ url });
        tabIds.push(t.id);
      }
      const groupId = await chrome.tabs.group({ tabIds: tabIds });
      chrome.tabGroups.update(groupId, { color: 'cyan', title: group });
      const pinnedTabs = await chrome.tabs.query({
        currentWindow: true,
        pinned: true,
      });
      chrome.tabGroups.move(groupId, { index: pinnedTabs.length });
    }
    chrome.tabs.remove(tab.id);
  }
});
