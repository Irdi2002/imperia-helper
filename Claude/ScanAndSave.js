  function loadBlock(blockId) {
  return new Promise(resolve => {
    picassio.map.sc.loadObjectsJson([ blockId ], resolve);
  });
}

async function scanAndExportSpecialResources(concurrency = 100) {
  console.time('scanAndExportSpecialResources');

  const groups = {};
  let nextId = 0;
  function getNextId() {
    return nextId <= 9999 ? nextId++ : null;
  }

  async function worker() {
    while (true) {
      const id = getNextId();
      if (id === null) break;
      try {
        const blocks = await loadBlock(id);
        blocks.forEach(block => {
          block.data.forEach(item => {
            const typeNum = parseInt(item.type, 10);
            if (typeNum < 1000 || typeNum > 1053) return;

            const { t: name, d } = item.tooltip;

            // clean & parse coords
            let coordStr = (d.find(x => x.key === 'Coordinates')?.value || '')
              .replace(/\u00A0/g, '')
              .replace(/&nbsp;/g, '');
            const coordMatch = coordStr.match(/X:(-?\d+)\s*Y:(-?\d+)/) || [];
            const X = coordMatch[1] || null;
            const Y = coordMatch[2] || null;

            // clean & parse distance
            let distStr = (d.find(x => x.key === 'Distance')?.value || '')
              .replace(/\u00A0/g, '')
              .replace(/&nbsp;/g, '');
            // if you want it as a number: const distance = parseFloat(distStr) || null;

            // first bonus
            const bonusArr = d.find(x => x.t === 'Bonuses')?.d || [];
            const bonusText = bonusArr.length
              ? `${bonusArr[0].key} : ${bonusArr[0].value}`
              : 'None';

            const key = `${name}│${bonusText}`;
            if (!groups[key]) {
              groups[key] = { 
                name, 
                bonusText,
                typeNum,
                locations: []    // rename for clarity 
              };
            }
            groups[key].locations.push({ X, Y, Distance: distStr });
          });
        });
      } catch (err) {
        console.error(`Error loading block ${id}:`, err);
      }
    }
  }

  // launch workers
  await Promise.all(
    Array.from({ length: concurrency }, () => worker())
  );

  console.timeEnd('scanAndExportSpecialResources');

  // stringify & download
  const data = Object.values(groups);
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'special_resources.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`✅ Exported ${data.length} resource groups with distances.`);
}

// kick it off:
scanAndExportSpecialResources(1000)
    .catch(console.error);
