chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'navigateToCoordinates' && sender.tab) {
    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        world: 'MAIN',
        func: (x, y) => {
          if (typeof xajax_switchVillageToGlobalMap === 'function') {
            xajax_switchVillageToGlobalMap();
          }

          let attempts = 0;
          const tryGo = () => {
            attempts++;
            if (
              typeof picassio !== 'undefined' &&
              picassio.map &&
              picassio.map.sc &&
              typeof picassio.map.sc.goTo === 'function'
            ) {
              picassio.map.sc.goTo(x, y);
              if (attempts < 10) {
                setTimeout(tryGo, 500);
              }
            } else if (attempts < 10) {
              setTimeout(tryGo, 500);
            }
          };

          tryGo();
        },
        args: [request.x, request.y]
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Imperia Spy navigation error:', chrome.runtime.lastError);
        }
      }
    );
    sendResponse({ received: true });
  }
});
