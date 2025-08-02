// (function injectStyles() {
//   const css = `
//     /* Hover highlight for the map-button icon */
//     #imperiaSpyIcon { transition: transform 0.2s, filter 0.2s; transform: scale(0.7); transform-origin: center; }
//     #imperiaSpyIcon:hover { transform: scale(0.77); filter: brightness(1.2); }

//     /* Main window */
//     #imperiaSpyWindow { font-family: Arial, sans-serif; display: flex; flex-direction: column;
//       background: #fff; border: 1px solid #888; border-radius: 6px;
//       box-shadow: 0 4px 12px rgba(0,0,0,0.3);
//     }
//     /* Header */
//     #imperiaSpyWindowHeader { padding: 10px; background: #4a90e2; color: #fff;
//       display: flex; justify-content: space-between; cursor: move; user-select: none;
//     }
//     #imperiaSpyWindowHeader span { font-weight: bold; }

//     /* Top pane */
//     #imperiaSpyTop { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
//     #imperiaSpyDistance { display: flex; align-items: center; }
//     #imperiaSpyDistance label { font-size: 14px; }
//     #imperiaSpyDistance input { margin-left: 8px; width: 100px; padding: 4px; font-size: 14px; }
//     #imperiaSpyResources { display: flex; flex-wrap: wrap; gap: 6px; }
//     .imperiaSpyResourceItem { display: flex; flex-direction: column; align-items: center; width: 50px; }
//     .imperiaSpyResourceItem img { width: 24px; height: 24px; cursor: pointer; }
//     .percentLabel { font-size: 10px; text-align: center; margin-top: 2px; width: 100%; }
//     .imperiaSpyResourceItem input { margin-top: 4px; }

//     /* Bottom results grid */
//     #imperiaSpyBottom { flex: 1; overflow-y: auto; padding: 10px;
//       display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 6px;
//     }
//     .imperiaSpyGroupHeader { display: flex; align-items: center;
//       margin-top: 12px; margin-bottom: 4px;
//       font-weight: bold; grid-column: 1 / -1;
//     }
//     .imperiaSpyGroupHeader img { width: 20px; height: 20px; margin-right: 6px; }
//     .imperiaSpyResult { display: flex; align-items: center; font-size: 13px; }
//     .imperiaSpyResult img { width: 16px; height: 16px; margin-right: 6px; }

//     /* Footer */
//     #imperiaSpyFooter { padding: 10px; text-align: right; }
//     #imperiaSpyFooter button { padding: 6px 12px; font-size: 14px; }
//   `;
//   const style = document.createElement('style'); style.textContent = css;
//   document.head.appendChild(style);
// })();

// (function() {
//   function waitForMap() {
//     const widget = document.getElementById('widget-global-map');
//     const mapEl = widget && widget.querySelector('#item-global-map');
//     if (!mapEl) return requestAnimationFrame(waitForMap);
//     insertIcon(mapEl);
//   }

//   function insertIcon(mapEl) {
//     if (mapEl._spyInserted) return;
//     mapEl._spyInserted = true;
//     const container = document.createElement('div');
//     const rect = mapEl.getBoundingClientRect();
//     Object.assign(container.style, {
//       display: 'flex', justifyContent: 'center', marginTop: '8px',
//       width: rect.width + 'px', height: rect.height + 'px'
//     });
//     const img = document.createElement('img');
//     img.id = 'imperiaSpyIcon';
//     img.src = chrome.runtime.getURL('special_resources/special_resource_1027.png');
//     img.alt = 'Special Resource';
//     img.addEventListener('click', showWindow);
//     container.appendChild(img);
//     mapEl.parentNode.insertBefore(container, mapEl.nextSibling);
//   }

//   async function showWindow() {
//     if (document.getElementById('imperiaSpyWindow')) return;
//     let data;
//     try {
//       const res = await fetch(chrome.runtime.getURL('special_resources.json'));
//       data = await res.json();
//     } catch (err) {
//       console.error('Imperia Spy: JSON load error', err);
//       return;
//     }

//     // Sort by absolute bonus magnitude
//     data.sort((a, b) => {
//       const extract = txt => {
//         const pm = txt.match(/(-?\d+)%/);
//         if (pm) return Math.abs(parseInt(pm[1], 10));
//         const nm = txt.match(/(-?\d+)/);
//         return nm ? Math.abs(parseInt(nm[1], 10)) : 0;
//       };
//       return extract(a.bonusText) - extract(b.bonusText);
//     });

//     const win = document.createElement('div');
//     win.id = 'imperiaSpyWindow';
//     Object.assign(win.style, {
//       position: 'fixed', top: '80px', left: '80px',
//       width: '720px', height: '850px', zIndex: 10000
//     });

//     // Header
//     const hdr = document.createElement('div'); hdr.id = 'imperiaSpyWindowHeader';
//     const title = document.createElement('span'); title.textContent = 'Resource Filter';
//     const closeBtn = document.createElement('span'); closeBtn.textContent = '✕';
//     closeBtn.addEventListener('click', () => win.remove());
//     hdr.appendChild(title); hdr.appendChild(closeBtn); win.appendChild(hdr);

//     // Top pane
//     const top = document.createElement('div'); top.id = 'imperiaSpyTop';
//     const distWrap = document.createElement('div'); distWrap.id = 'imperiaSpyDistance';
//     const distLabel = document.createElement('label'); distLabel.textContent = 'Max Distance:';
//     const distInput = document.createElement('input');
//     distInput.type = 'number'; distInput.min = '0';
//     distInput.addEventListener('input', updateResults);
//     distLabel.appendChild(distInput);
//     distWrap.appendChild(distLabel);
//     top.appendChild(distWrap);

//     const resBox = document.createElement('div'); resBox.id = 'imperiaSpyResources';
//     data.forEach(r => {
//       const typeNum = r.typeNum || r.type;
//       const item = document.createElement('div'); item.className = 'imperiaSpyResourceItem';
//       const icon = document.createElement('img');
//       icon.src = chrome.runtime.getURL(`special_resources/special_resource_${typeNum}.png`);
//       icon.title = r.bonusText; // tooltip
//       const pm = r.bonusText.match(/(-?\d+)%/);
//       const nm = pm ? pm[1] + '%' : ((r.bonusText.match(/(-?\d+)/)||[])[1] || '');
//       const pct = document.createElement('div'); pct.className = 'percentLabel'; pct.textContent = nm;
//       const cb = document.createElement('input'); cb.type = 'checkbox'; cb.dataset.type = typeNum;
//       cb.addEventListener('change', updateResults);
//       item.appendChild(icon);
//       item.appendChild(pct);
//       item.appendChild(cb);
//       resBox.appendChild(item);
//     });
//     top.appendChild(resBox);
//     win.appendChild(top);

//     // Bottom results grid
//     const bottom = document.createElement('div'); bottom.id = 'imperiaSpyBottom';
//     win.appendChild(bottom);

//     // Footer
//     const footer = document.createElement('div'); footer.id = 'imperiaSpyFooter';
//     const done = document.createElement('button'); done.textContent = 'Close';
//     done.addEventListener('click', () => win.remove()); footer.appendChild(done);
//     win.appendChild(footer);

//     document.body.appendChild(win);
//     makeDraggable(win, hdr);

//     function updateResults() {
//       const maxD = parseInt(distInput.value, 10);
//       bottom.innerHTML = '';
//       let firstGroup = true;
//       data.forEach(r => {
//         const typeNum = r.typeNum || r.type;
//         const chk = resBox.querySelector(`input[data-type="${typeNum}"]`);
//         if (!chk.checked) return;

//         // Delimiter
//         if (!firstGroup) {
//           const hr = document.createElement('hr');
//           hr.style.gridColumn = '1 / -1';
//           hr.style.border = 'none';
//           hr.style.borderTop = '1px solid #ccc';
//           bottom.appendChild(hr);
//         }
//         firstGroup = false;

//         // Group header with tooltip
//         const headerRow = document.createElement('div'); headerRow.className = 'imperiaSpyGroupHeader';
//         const imgH = document.createElement('img');
//         imgH.src = chrome.runtime.getURL(`special_resources/special_resource_${typeNum}.png`);
//         imgH.title = r.bonusText;
//         headerRow.appendChild(imgH);
//         headerRow.appendChild(document.createTextNode(r.bonusText));
//         bottom.appendChild(headerRow);

//         // Filter and sort locations by distance ascending
//         const locs = r.locations
//           .map(l => ({ X: l.X, Y: l.Y, Distance: parseInt(l.Distance||l.distance, 10) }))
//           .filter(l => isNaN(maxD) ? true : l.Distance <= maxD)
//           .sort((a, b) => a.Distance - b.Distance);

//         locs.forEach(l => {
//           const row = document.createElement('div'); row.className = 'imperiaSpyResult';
//           const iconR = document.createElement('img');
//           iconR.src = chrome.runtime.getURL(`special_resources/special_resource_${typeNum}.png`);
//           iconR.title = r.bonusText; // tooltip
//           row.appendChild(iconR);
//           row.appendChild(document.createTextNode(` X:${l.X}, Y:${l.Y}, D:${l.Distance}`));
//           bottom.appendChild(row);
//         });
//       });
//     }
//   }

//   function makeDraggable(el, handle) {
//     let down = false, dx = 0, dy = 0;
//     handle.addEventListener('mousedown', e => {
//       down = true;
//       const rect = el.getBoundingClientRect();
//       dx = e.clientX - rect.left;
//       dy = e.clientY - rect.top;
//       document.addEventListener('mousemove', onMove);
//       document.addEventListener('mouseup', onUp);
//     });
//     function onMove(e) {
//       if (!down) return;
//       el.style.left = e.clientX - dx + 'px';
//       el.style.top  = e.clientY - dy + 'px';
//     }
//     function onUp() {
//       down = false;
//       document.removeEventListener('mousemove', onMove);
//       document.removeEventListener('mouseup', onUp);
//     }
//   }

//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', waitForMap);
//   } else {
//     waitForMap();
//   }
// })();




(function injectStyles() {
  const css = `
    /* Hover highlight for the map-button icon */
    #imperiaSpyIcon { transition: transform 0.2s, filter 0.2s; transform: scale(0.7); transform-origin: center; }
    #imperiaSpyIcon:hover { transform: scale(0.77); filter: brightness(1.2); }

    /* Main window */
    #imperiaSpyWindow { font-family: Arial, sans-serif; display: flex; flex-direction: column;
      background: #fff; border: 1px solid #888; border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    /* Header */
    #imperiaSpyWindowHeader { padding: 10px; background: #4a90e2; color: #fff;
      display: flex; justify-content: space-between; cursor: move; user-select: none;
    }
    #imperiaSpyWindowHeader span { font-weight: bold; }

    /* Top pane */
    #imperiaSpyTop { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
    #imperiaSpyDistance { display: flex; align-items: center; }
    #imperiaSpyDistance label { font-size: 14px; }
    #imperiaSpyDistance input { margin-left: 8px; width: 100px; padding: 4px; font-size: 14px; }
    #imperiaSpyResources { display: flex; flex-wrap: wrap; gap: 6px; }
    .imperiaSpyResourceItem { display: flex; flex-direction: column; align-items: center; width: 50px; }
    .imperiaSpyResourceItem img { width: 24px; height: 24px; cursor: pointer; }
    .percentLabel { font-size: 10px; text-align: center; margin-top: 2px; width: 100%; }
    .imperiaSpyResourceItem input { margin-top: 4px; }

    /* Bottom results grid */
    #imperiaSpyBottom { flex: 1; overflow-y: auto; padding: 10px;
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 6px;
    }
    .imperiaSpyGroupHeader { display: flex; align-items: center;
      margin-top: 12px; margin-bottom: 4px;
      font-weight: bold; grid-column: 1 / -1;
    }
    .imperiaSpyGroupHeader img { width: 20px; height: 20px; margin-right: 6px; }
    .imperiaSpyResult { display: flex; align-items: center; font-size: 13px; }
    .imperiaSpyResult img { width: 16px; height: 16px; margin-right: 6px; }

    /* Footer */
    #imperiaSpyFooter { padding: 10px; text-align: right; }
    #imperiaSpyFooter button { padding: 6px 12px; font-size: 14px; }

    .imperiaSpyResult { 
    cursor: pointer; 
    padding: 2px;
    border-radius: 3px;
    }
    .imperiaSpyResult:hover { 
        background-color: #f0f0f0; 
    }
  `;
  const style = document.createElement('style'); style.textContent = css;
  document.head.appendChild(style);
})();

(function() {
  function waitForMap() {
    const widget = document.getElementById('widget-global-map');
    const mapEl = widget && widget.querySelector('#item-global-map');
    if (!mapEl) return requestAnimationFrame(waitForMap);
    insertIcon(mapEl);
  }

  function insertIcon(mapEl) {
    if (mapEl._spyInserted) return;
    mapEl._spyInserted = true;
    const container = document.createElement('div');
    const rect = mapEl.getBoundingClientRect();
    Object.assign(container.style, {
      display: 'flex', justifyContent: 'center', marginTop: '8px',
      width: rect.width + 'px', height: rect.height + 'px'
    });
    const img = document.createElement('img');
    img.id = 'imperiaSpyIcon';
    img.src = chrome.runtime.getURL('special_resources/special_resource_1027.png');
    img.alt = 'Special Resource';
    img.addEventListener('click', showWindow);
    container.appendChild(img);
    mapEl.parentNode.insertBefore(container, mapEl.nextSibling);
  }

  async function showWindow() {
    if (document.getElementById('imperiaSpyWindow')) return;
    let data;
    try {
      const res = await fetch(chrome.runtime.getURL('special_resources.json'));
      data = await res.json();
    } catch (err) {
      console.error('Imperia Spy: JSON load error', err);
      return;
    }

    // Sort by absolute bonus magnitude
    data.sort((a, b) => {
      const extract = txt => {
        const pm = txt.match(/(-?\d+)%/);
        if (pm) return Math.abs(parseInt(pm[1], 10));
        const nm = txt.match(/(-?\d+)/);
        return nm ? Math.abs(parseInt(nm[1], 10)) : 0;
      };
      return extract(a.bonusText) - extract(b.bonusText);
    });

    const win = document.createElement('div');
    win.id = 'imperiaSpyWindow';
    Object.assign(win.style, {
      position: 'fixed', top: '80px', left: '80px',
      width: '720px', height: '850px', zIndex: 10000
    });

    // Header
    const hdr = document.createElement('div'); hdr.id = 'imperiaSpyWindowHeader';
    const title = document.createElement('span'); title.textContent = 'Resource Filter';
    const closeBtn = document.createElement('span'); closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => win.remove());
    hdr.appendChild(title); hdr.appendChild(closeBtn); win.appendChild(hdr);

    // Top pane
    const top = document.createElement('div'); top.id = 'imperiaSpyTop';
    const distWrap = document.createElement('div'); distWrap.id = 'imperiaSpyDistance';
    const distLabel = document.createElement('label'); distLabel.textContent = 'Max Distance:';
    const distInput = document.createElement('input');
    distInput.type = 'number'; distInput.min = '0';
    distInput.addEventListener('input', updateResults);
    distLabel.appendChild(distInput);
    distWrap.appendChild(distLabel);
    top.appendChild(distWrap);

    const resBox = document.createElement('div'); resBox.id = 'imperiaSpyResources';
    data.forEach(r => {
      const typeNum = r.typeNum || r.type;
      const item = document.createElement('div'); item.className = 'imperiaSpyResourceItem';
      const icon = document.createElement('img');
      icon.src = chrome.runtime.getURL(`special_resources/special_resource_${typeNum}.png`);
      icon.title = r.bonusText; // tooltip
      const pm = r.bonusText.match(/(-?\d+)%/);
      const nm = pm ? pm[1] + '%' : ((r.bonusText.match(/(-?\d+)/)||[])[1] || '');
      const pct = document.createElement('div'); pct.className = 'percentLabel'; pct.textContent = nm;
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.dataset.type = typeNum;
      cb.addEventListener('change', updateResults);
      item.appendChild(icon);
      item.appendChild(pct);
      item.appendChild(cb);
      resBox.appendChild(item);
    });
    top.appendChild(resBox);
    win.appendChild(top);

    // Bottom results grid
    const bottom = document.createElement('div'); bottom.id = 'imperiaSpyBottom';
    win.appendChild(bottom);

    // Footer
    const footer = document.createElement('div'); footer.id = 'imperiaSpyFooter';
    const done = document.createElement('button'); done.textContent = 'Close';
    done.addEventListener('click', () => win.remove()); footer.appendChild(done);
    win.appendChild(footer);

    document.body.appendChild(win);
    makeDraggable(win, hdr);

    function updateResults() {
      const maxD = parseInt(distInput.value, 10);
      bottom.innerHTML = '';
      let firstGroup = true;
      data.forEach(r => {
        const typeNum = r.typeNum || r.type;
        const chk = resBox.querySelector(`input[data-type="${typeNum}"]`);
        if (!chk.checked) return;

        // Delimiter
        if (!firstGroup) {
          const hr = document.createElement('hr');
          hr.style.gridColumn = '1 / -1';
          hr.style.border = 'none';
          hr.style.borderTop = '1px solid #ccc';
          bottom.appendChild(hr);
        }
        firstGroup = false;

        // Group header with tooltip
        const headerRow = document.createElement('div'); headerRow.className = 'imperiaSpyGroupHeader';
        const imgH = document.createElement('img');
        imgH.src = chrome.runtime.getURL(`special_resources/special_resource_${typeNum}.png`);
        imgH.title = r.bonusText;
        headerRow.appendChild(imgH);
        headerRow.appendChild(document.createTextNode(r.bonusText));
        bottom.appendChild(headerRow);

        // Filter and sort locations by distance ascending
        const locs = r.locations
          .map(l => ({ X: l.X, Y: l.Y, Distance: parseInt(l.Distance||l.distance, 10) }))
          .filter(l => isNaN(maxD) ? true : l.Distance <= maxD)
          .sort((a, b) => a.Distance - b.Distance);

        locs.forEach(l => {
            const row = document.createElement('div'); 
            row.className = 'imperiaSpyResult';
            
            // Add click handler that navigates to coordinates
            row.addEventListener('click', () => {
                // Create a script element to run in page context
                const script = document.createElement('script');
                script.textContent = `
                    try {
                        // Navigate to coordinates
                        picassio.map.sc.goTo(${parseInt(l.X)}, ${parseInt(l.Y)});
                        
                        // Switch to global map
                        if (typeof xajax_switchVillageToGlobalMap === 'function') {
                            xajax_switchVillageToGlobalMap();
                        }
                    } catch (e) {
                        console.error('Imperia Spy navigation error:', e);
                    }
                `;
                document.body.appendChild(script);
                setTimeout(() => script.remove(), 100);
            });

            const iconR = document.createElement('img');
            iconR.src = chrome.runtime.getURL(`special_resources/special_resource_${typeNum}.png`);
            iconR.title = r.bonusText; // tooltip
            row.appendChild(iconR);
            
            const coordsText = document.createTextNode(` X:${l.X}, Y:${l.Y}, D:${l.Distance}`);
            row.appendChild(coordsText);
            
            bottom.appendChild(row);
        });
      });
    }
  }

  function makeDraggable(el, handle) {
    let down = false, dx = 0, dy = 0;
    handle.addEventListener('mousedown', e => {
      down = true;
      const rect = el.getBoundingClientRect();
      dx = e.clientX - rect.left;
      dy = e.clientY - rect.top;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    function onMove(e) {
      if (!down) return;
      el.style.left = e.clientX - dx + 'px';
      el.style.top  = e.clientY - dy + 'px';
    }
    function onUp() {
      down = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForMap);
  } else {
    waitForMap();
  }
})();
