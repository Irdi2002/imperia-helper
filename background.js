chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "navigateToCoordinates" && sender.tab) {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',
      func: (x, y) => {
        if (typeof xajax_switchVillageToGlobalMap === 'function') {
          xajax_switchVillageToGlobalMap();
        }

        const tryGo = () => {
          if (typeof picassio !== 'undefined' && picassio.map && picassio.map.sc) {
            picassio.map.sc.goTo(x, y);
          } else {
            setTimeout(tryGo, 300);
          }
        };

        tryGo();
      },
      args: [request.x, request.y]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Imperia Spy navigation error:', chrome.runtime.lastError);
      }
    });
  }
});
