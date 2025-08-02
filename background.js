chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "navigateToCoordinates") {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',
      func: (x, y) => {
        if (typeof picassio !== 'undefined' && picassio.map && picassio.map.sc) {
          picassio.map.sc.goTo(x, y);
        }
        if (typeof xajax_switchVillageToGlobalMap === 'function') {
          xajax_switchVillageToGlobalMap();
        }
      },
      args: [request.x, request.y]
    });
  }
});