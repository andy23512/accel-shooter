var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getAllUrlParams(url) {
    // get query string from url (optional) or window
    let queryString = url ? url.split("?")[1] : window.location.search.slice(1);
    // we'll store the parameters here
    const obj = {};
    // if query string exists
    if (queryString) {
        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split("#")[0];
        // split our query string into its component parts
        const arr = queryString.split("&");
        for (const part of arr) {
            // separate the keys and the values
            const a = part.split("=");
            // set parameter name and value (use 'true' if empty)
            const paramName = a[0];
            const paramValue = typeof a[1] === "undefined" ? true : a[1];
            // if the paramName ends with square brackets, e.g. colors[] or colors[2]
            if (paramName.match(/\[(\d+)?\]$/)) {
                // create key if it doesn't exist
                const key = paramName.replace(/\[(\d+)?\]/, "");
                if (!obj[key])
                    obj[key] = [];
                // if it's an indexed array e.g. colors[2]
                if (paramName.match(/\[\d+\]$/)) {
                    // get the index value and add the entry at the appropriate position
                    const index = /\[(\d+)\]/.exec(paramName)[1];
                    obj[key][index] = paramValue;
                }
                else {
                    // otherwise add the value to the end of the array
                    obj[key].push(paramValue);
                }
            }
            else {
                // we're dealing with a string
                if (!obj[paramName]) {
                    // if it doesn't exist, create property
                    obj[paramName] = paramValue;
                }
                else if (obj[paramName] && typeof obj[paramName] === "string") {
                    // if property does exist and it's a string, convert it to an array
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                }
                else {
                    // otherwise add the property
                    obj[paramName].push(paramValue);
                }
            }
        }
    }
    return obj;
}
chrome.tabs.onCreated.addListener((tab) => __awaiter(this, void 0, void 0, function* () {
    const isAccelShooterLink = tab.pendingUrl &&
        tab.pendingUrl.startsWith("http://localhost:8315/accel-shooter/");
    console.log(isAccelShooterLink);
    if (isAccelShooterLink) {
        const query = getAllUrlParams(tab.pendingUrl);
        const { urls, group } = query;
        console.log(urls);
        console.log(group);
        const tabIds = [];
        const existingGroups = yield chrome.tabGroups.query({ title: group });
        for (const g of existingGroups) {
            const tabs = yield chrome.tabs.query({ groupId: g.id });
            chrome.tabs.remove(tabs.map((t) => t.id));
        }
        const urlList = JSON.parse(decodeURIComponent(urls));
        if (urlList.length > 0) {
            for (const url of JSON.parse(decodeURIComponent(urls))) {
                const t = yield chrome.tabs.create({ url });
                tabIds.push(t.id);
            }
            const groupId = yield chrome.tabs.group({ tabIds: tabIds });
            chrome.tabGroups.update(groupId, { color: "cyan", title: group });
            const pinnedTabs = yield chrome.tabs.query({
                currentWindow: true,
                pinned: true,
            });
            chrome.tabGroups.move(groupId, { index: pinnedTabs.length });
        }
        chrome.tabs.remove(tab.id);
    }
}));
//# sourceMappingURL=main.js.map