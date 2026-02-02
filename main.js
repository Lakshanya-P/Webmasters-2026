/*TOPNAV JS */

function home(){
    window.location.href = 'home.html';
}

function resource(){
    window.location.href = 'directory.html';
}

function highlights(){
    window.location.href = 'highlights.html';
}

function references(){
    window.location.href = 'refs.html';
}

    // Drop down menu functionality
    document.addEventListener('DOMContentLoaded', function() {
    const moreBtn = document.getElementById('moreBtn');
    const moreMenu = document.getElementById('moreMenu');
    if (!moreBtn || !moreMenu) return;

    function adjustDropdown(menu) {
        const parent = menu.parentElement;
        parent.classList.remove('dropdown-flip');

        const rect = menu.getBoundingClientRect();
        const padding = 8; 

        if (rect.right > (window.innerWidth - padding)) {
        parent.classList.add('dropdown-flip');
        } else if (rect.left < padding) {
        menu.style.left = padding + 'px';
        } else {
        menu.style.left = '';
        }
    }

    document.addEventListener('click', function(e) {
        if (moreBtn.contains(e.target)) {
        const isOpen = moreMenu.classList.toggle('show');
        moreBtn.setAttribute('aria-expanded', isOpen);
        moreMenu.setAttribute('aria-hidden', !isOpen);

        if (isOpen) {
            moreMenu.style.left = '';
            setTimeout(() => adjustDropdown(moreMenu), 0);
        } else {
            moreMenu.parentElement.classList.remove('dropdown-flip');
            moreMenu.style.left = '';
        }
        } else {
        if (!moreMenu.contains(e.target)) {
            moreMenu.classList.remove('show');
            moreBtn.setAttribute('aria-expanded', 'false');
            moreMenu.setAttribute('aria-hidden', 'true');
            moreMenu.parentElement.classList.remove('dropdown-flip');
            moreMenu.style.left = '';
        }
        }
    });

    window.addEventListener('resize', function() {
        if (moreMenu.classList.contains('show')) {
        adjustDropdown(moreMenu);
        }
    });

    window.openFAQs = function() {
        window.location.href = 'faqs.html';
    };

    window.openAbout = function() {
        window.location.href = 'about.html';
    };
    });


    //heart button logic — hold-to-fill + compliments
    document.addEventListener('DOMContentLoaded', function() {
      const heart = document.querySelector('#topnav .heart');
      if (!heart) return;
      const tank = heart.querySelector('.tank');
      const curve = heart.querySelector('.curve');
      const complimentEl = document.getElementById('compliment');
      const compliments = ["You're amazing!","You light up the room!","You're a star!","You do great work!","You make a difference!"];
      const DURATION = 1500; // ms to fill
      let progress = 0;
      let isHeld = false;
      let raf = null;
      let startTime = 0;
      let filled = false;

      function setFill(p) {
        progress = Math.max(0, Math.min(1, p));
        if (tank) tank.style.height = (progress * 100) + '%';
        const crhStr = getComputedStyle(heart).getPropertyValue('--cruve-height') || '8px';
        const crh = parseFloat(crhStr);
        if (curve) curve.style.bottom = (-crh + progress * crh) + 'px';
      }

      function showCompliment() {
        if (!complimentEl) return;
        const text = compliments[Math.floor(Math.random() * compliments.length)];
        complimentEl.textContent = text;
        complimentEl.classList.add('show');
        setTimeout(() => complimentEl.classList.remove('show'), 3000);
        // reset visual after a short delay
        // HEART OPEN TO NEW PAGE ADD HERE
        setTimeout(() => { heart.classList.remove('full'); setFill(0); filled = false; }, 3500);
      }

      function step(ts) {
        if (!isHeld) { raf = null; return; }
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const p = elapsed / DURATION;
        if (p >= 1) {
          setFill(1);
          filled = true;
          isHeld = false;
          heart.classList.add('full');
          showCompliment();
          raf = null;
          return;
        } else {
          setFill(p);
          raf = requestAnimationFrame(step);
        }
      }

      function startHold() {
        if (filled) return;
        isHeld = true;
        startTime = 0;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(step);
      }

      function endHold() {
        isHeld = false;
        if (raf) cancelAnimationFrame(raf);
        if (!filled) {
          const startP = progress;
          const t0 = performance.now();
          const decayDur = 220;
          function decay(ts) {
            const t = Math.min(1, (ts - t0) / decayDur);
            const np = startP * (1 - t);
            setFill(np);
            if (t < 1) requestAnimationFrame(decay);
          }
          requestAnimationFrame(decay);
        }
      }

      heart.addEventListener('pointerdown', function(e) { 
        e.preventDefault(); 
        try { if (e.pointerId != null && heart.setPointerCapture) heart.setPointerCapture(e.pointerId); } catch (err) {}
        startHold(); 
      });

      ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => heart.addEventListener(evt, function(e) {
        try { if (e.pointerId != null && heart.releasePointerCapture) heart.releasePointerCapture(e.pointerId); } catch (err) {}
        endHold(e);
      }));

      heart.addEventListener('keydown', function(e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startHold(); } });
      heart.addEventListener('keyup', function(e) { if (e.key === ' ' || e.key === 'Enter') { endHold(e); } });
    });




// SECTION4: Canvas-based interactive US map
document.addEventListener('DOMContentLoaded', function() {
  const mapContainer = document.getElementById('mapContainer');
  const popup = document.getElementById('statePopup');
  const popupContent = document.getElementById('statePopupContent');
  const closeBtn = document.getElementById('closeStatePopup');
  const addBtn = document.getElementById('addEntryFromMap');
  const discoverBtn = document.getElementById('discoverResourcesFromMap');

  if (!mapContainer || !popup) return;

  // create canvas
  const canvas = document.createElement('canvas');
  // center and enlarge the canvas visually via inline styles
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  // make the map larger: allow overflow beyond container and increase max width
  // make the canvas intentionally larger than the viewport so it can "leave" the screen
  canvas.style.width = '115vw';
  canvas.style.maxWidth = 'none';
  canvas.style.boxSizing = 'border-box';
  canvas.style.height = '150vh';
  // shift the whole canvas 100px to the right
  canvas.style.transform = 'translateX(100px)';
  canvas.style.willChange = 'transform';
  canvas.tabIndex = 0;
  // ensure container centers the canvas and has small side padding
  mapContainer.style.display = 'flex';
  mapContainer.style.justifyContent = 'center';
  mapContainer.style.padding = '0 12px';
  // allow the canvas to overflow the container bounds
  mapContainer.style.overflow = 'visible';
  mapContainer.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let DPR = Math.max(1, window.devicePixelRatio || 1);
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    // set backing store size in device pixels to match displayed rect
    canvas.width = Math.round(rect.width * DPR);
    canvas.height = Math.round(rect.height * DPR);
    // ensure CSS height matches the rect (useful if styles changed)
    canvas.style.height = rect.height + 'px';
    // re-render
    render();
  }

  window.addEventListener('resize', () => { DPR = Math.max(1, window.devicePixelRatio || 1); resizeCanvas(); });

  // state shapes storage
  const statesData = []; // {name, feature, path2d, bbox}
  let geoBounds = null;
  // per-state color overrides (edit these values to change individual state colors)
  const stateColors = {
    'Washington' : '#8a87b3',
    'Oregon' : '#8792b8',
    'California' : '#b7cdf2',
    'Nevada' : '#bbb6de',
    'Idaho' : '#dce4fb',
    'Montana' : '#5f73a0',
    'Wyoming' : '#c3bfe9',
    'Utah' : '#9fb3e3',
    'Arizona' : '#5b6fa3',
    'Colorado' : '#c3bfe9',
    'New Mexico' : '#8fa3cf',
    'North Dakota' : '#f1f3ff',
    'South Dakota' : '#ada6de',
    'Nebraska' : '#6f86b8',
    'Kansas' : '#8a8db3',
    'Oklahoma' : '#a39bdb',
    'Texas' : '#b4c7eb',
    'Minnesota' : '#b1b2cf',
    'Iowa' : '#6c6a86',
    'Missouri' : '#7f97c7',
    'Arkansas' : '#9db3e0',
    'Louisiana' : '#8a89ad',
    'Wisconsin' : '#9f94d2',
    'Illinois' : '#9bb0dc',
    'Michigan' : '#a5a3c6',
    'Indiana' : '#7c74ad',
    'Ohio' : '#d3defa',
    'Kentucky' : '#7e7ba2',
    'Tennessee' : '#8f86c2',

    'Alabama' : '#8a87b3',
    'Mississippi' : '#8792b8',
    'Georgia' : '#b7cdf2',
    'South Carolina' : '#bbb6de',
    'North Carolina' : '#dce4fb',
    'Virginia' : '#5f73a0',
    'West Virginia' : '#c3bfe9',
    'Pennsylvania' : '#9fb3e3',
    'New York' : '#5b6fa3',
    'Vermont' : '#c3bfe9',
    'New Hampshire' : '#8fa3cf',
    'Maine' : '#f1f3ff',
    'Massachusetts' : '#ada6de',
    'Rhode Island' : '#6f86b8',
    'Connecticut' : '#8a8db3',
    'New Jersey' : '#a39bdb',
    'Delaware' : '#b4c7eb',
    'Maryland' : '#b1b2cf',
    'Florida' : '#6c6a86',

    'Alaska' : '#7f97c7',
    'Hawaii' : '#9db3e0'

  };

  // fetch GeoJSON of US states
  const GEOJSON_URL = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';
  fetch(GEOJSON_URL).then(r => r.json()).then(geo => {
    // compute bounds
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    geo.features.forEach(f => {
      const coords = getAllCoords(f.geometry);
      coords.forEach(c => {
        const lon = c[0], lat = c[1];
        if (lon < minX) minX = lon;
        if (lon > maxX) maxX = lon;
        if (lat < minY) minY = lat;
        if (lat > maxY) maxY = lat;
      });
    });
    geoBounds = {minX,minY,maxX,maxY};

    // compute continental center (exclude Alaska and Hawaii)
    let cMinX=Infinity,cMinY=Infinity,cMaxX=-Infinity,cMaxY=-Infinity;
    geo.features.forEach(f => {
      const name = (f.properties && (f.properties.name||f.properties.NAME||'')).toLowerCase();
      if (name.includes('alaska') || name.includes('hawaii')) return;
      const coords = getAllCoords(f.geometry);
      coords.forEach(c => {
        const lon=c[0], lat=c[1];
        if (lon < cMinX) cMinX = lon;
        if (lon > cMaxX) cMaxX = lon;
        if (lat < cMinY) cMinY = lat;
        if (lat > cMaxY) cMaxY = lat;
      });
    });
    const continentalCenterLon = (cMinX + cMaxX)/2;
    const continentalCenterLat = (cMinY + cMaxY)/2;
    // store for use in path building
    window.__continentalCenter = { lon: continentalCenterLon, lat: continentalCenterLat };

    // helper: build one or more Path2D objects for a feature (preserve separate islands)
    function buildPathsForFeature(geom, bounds, canvasEl, name) {
      const rect = canvasEl.getBoundingClientRect();
      const paths = [];
      if (geom.type === 'Polygon') {
        const p = new Path2D();
        buildPathFromGeometry(p, geom, bounds, canvasEl, name);
        paths.push(p);
      } else if (geom.type === 'MultiPolygon') {
        // create a Path2D per polygon so separate islands remain distinct
        const polys = geom.coordinates || [];
        const lname = String(name).toLowerCase();
        const isHawaii = lname.includes('hawaii');

        if (isHawaii && polys.length > 1) {
          // Compute approximate on-canvas area for each polygon, then pick the largest 3
          try {
            const rect = canvasEl.getBoundingClientRect();
            const width = Math.round(rect.width * DPR);
            const height = Math.round((rect.width * 0.6) * DPR);
            const continentalCenter = window.__continentalCenter || { lon: (bounds.minX + bounds.maxX)/2, lat: (bounds.minY + bounds.maxY)/2 };
            const continentalCss = project([continentalCenter.lon, continentalCenter.lat], bounds, rect.width, rect.width * 0.6);
            const continentalCenterDeviceX = continentalCss[0] * DPR;
            const continentalCenterDeviceY = continentalCss[1] * DPR;
            const globalScale = 1.25;
            const alaskaScale = 0.35;
            const alaskaOffsetX = Math.round(width * 0.06);
            const alaskaOffsetY = Math.round(height * 0.55);
            const hawaiiScale = 1.0; // tuned

            function transformPointDevice(x, y, featCenterDeviceX, featCenterDeviceY) {
              // Hawaii transform: place relative to canvas center with tuned offsets
              const targetX = Math.round(width / 2) - Math.round(width * 0.30);
              const targetY = Math.round(height / 2) + Math.round(height * 0.28);
              const relX = x - featCenterDeviceX;
              const relY = y - featCenterDeviceY;
              const tunedScale = 0.85;
              return [relX * tunedScale + targetX, relY * tunedScale + targetY];
            }

            const areas = polys.map(polygon => {
              // use outer ring for area calc
              const ring = (polygon && polygon[0]) || [];
              if (!ring.length) return 0;
              // compute feature center in device pixels (pre-transform)
              let sx = 0, sy = 0;
              const pts = ring.map(pt => {
                const [xCss, yCss] = project(pt, bounds, rect.width, rect.width * 0.6);
                const x = xCss * DPR;
                const y = yCss * DPR;
                sx += x; sy += y;
                return [x,y];
              });
              const featCenterDeviceX = sx / pts.length;
              const featCenterDeviceY = sy / pts.length;
              // transform points and compute shoelace area
              let area = 0;
              for (let i=0;i<pts.length;i++){
                const a = transformPointDevice(pts[i][0], pts[i][1], featCenterDeviceX, featCenterDeviceY);
                const b = transformPointDevice(pts[(i+1)%pts.length][0], pts[(i+1)%pts.length][1], featCenterDeviceX, featCenterDeviceY);
                area += (a[0]*b[1] - b[0]*a[1]);
              }
              return Math.abs(area) * 0.5;
            });

            // pick top 3 polygons by area
            const idxs = areas.map((a,i)=>({a,i})).sort((u,v)=>v.a-u.a).slice(0,3).map(o=>o.i);
            idxs.forEach(i => {
              const polygon = polys[i];
              const p = new Path2D();
              const polyGeom = { type: 'Polygon', coordinates: polygon };
              buildPathFromGeometry(p, polyGeom, bounds, canvasEl, name);
              paths.push(p);
            });
          } catch (err) {
            // fallback: build first 3
            polys.slice(0,3).forEach(polygon => {
              const p = new Path2D();
              const polyGeom = { type: 'Polygon', coordinates: polygon };
              buildPathFromGeometry(p, polyGeom, bounds, canvasEl, name);
              paths.push(p);
            });
          }
        } else {
          polys.forEach(polygon => {
            const p = new Path2D();
            const polyGeom = { type: 'Polygon', coordinates: polygon };
            buildPathFromGeometry(p, polyGeom, bounds, canvasEl, name);
            paths.push(p);
          });
        }
      }
      return paths;
    }

    // create Path2D(s) for each state
    geo.features.forEach(f => {
      const name = f.properties.name || f.properties.NAME || 'Unknown';
      const paths = buildPathsForFeature(f.geometry, geoBounds, canvas, name);
      const bbox = featureBBox(f.geometry);
      statesData.push({name, feature:f, path: paths.length===1 ? paths[0] : paths, bbox});
      // debug: report how many path parts were created for this state
      try {
        console.debug(`MapBuilder: built ${paths.length} path(s) for state: ${name}`);
        if (String(name).toLowerCase().includes('hawaii')) {
          console.debug('Hawaii feature bbox:', bbox, 'first 3 polygon counts:', (f.geometry && f.geometry.coordinates && f.geometry.coordinates.length) || 0);
        }
      } catch (e) { /* ignore */ }
    });
    resizeCanvas();
  }).catch(err => {
    console.error('Failed to load GeoJSON', err);
    // fallback: show message
    mapContainer.innerHTML = '<p>Unable to load map.</p>';
  });

  let hovered = null;

  function render() {
    if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // draw states
    ctx.lineWidth = Math.max(1, DPR * 0.6);
    statesData.forEach(s => {
      const baseFill = stateColors[s.name] || '#ffffff';
      ctx.fillStyle = (hovered && hovered.name === s.name) ? '#ffe9b2' : baseFill;
      ctx.strokeStyle = '#666';
      if (Array.isArray(s.path)) {
        s.path.forEach(p => { ctx.fill(p); ctx.stroke(p); });
      } else {
        ctx.fill(s.path); ctx.stroke(s.path);
      }
    });
    // glow for hovered (drawn on top)
    if (hovered) {
      ctx.save();
      ctx.shadowColor = 'rgba(255,200,60,0.9)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(255,230,150,0.9)';
      if (Array.isArray(hovered.path)) {
        hovered.path.forEach(p => ctx.fill(p));
      } else {
        ctx.fill(hovered.path);
      }
      ctx.restore();
    }
  }

  function getAllCoords(geom) {
    const out = [];
    if (geom.type === 'Polygon') {
      geom.coordinates.forEach(ring => ring.forEach(c => out.push(c)));
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach(polygon => polygon.forEach(ring => ring.forEach(c => out.push(c))));
    }
    return out;
  }

  function featureBBox(geom) {
    const coords = getAllCoords(geom);
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    coords.forEach(c => { if (c[0]<minX) minX=c[0]; if (c[0]>maxX) maxX=c[0]; if (c[1]<minY) minY=c[1]; if (c[1]>maxY) maxY=c[1]; });
    return {minX,minY,maxX,maxY};
  }

  function project([lon,lat], bounds, width, height) {
    const x = (lon - bounds.minX) / (bounds.maxX - bounds.minX) * width;
    const y = (bounds.maxY - lat) / (bounds.maxY - bounds.minY) * height; // invert y
    return [x,y];
  }

  function buildPathFromGeometry(path, geom, bounds, canvasEl, name) {
    // build path in device pixels to match canvas backing store
    const rect = canvasEl.getBoundingClientRect();
    const width = Math.round(rect.width * DPR);
    const height = Math.round((rect.width * 0.6) * DPR);

    // global scale to make US block larger
    const globalScale = 1.25;
    const centerX = width / 2;
    const centerY = height / 2;
    // continental center in lon/lat provided by loader
    const continentalCenter = window.__continentalCenter || { lon: (bounds.minX + bounds.maxX)/2, lat: (bounds.minY + bounds.maxY)/2 };
    const continentalCss = project([continentalCenter.lon, continentalCenter.lat], bounds, rect.width, rect.width * 0.6);
    const continentalCenterDeviceX = Math.round(continentalCss[0] * DPR);
    const continentalCenterDeviceY = Math.round(continentalCss[1] * DPR);

    // Alaska tweak
    const lname = String(name).toLowerCase();
    const isAlaska = lname.includes('alaska');
    const isHawaii = lname.includes('hawaii');
    const alaskaScale = 0.35;
    const alaskaOffsetX = Math.round(width * 0.06);
    const alaskaOffsetY = Math.round(height * 0.55);

    // compute feature bbox center in device pixels for Hawaii reuse
    const featBBox = featureBBox(geom);
    const featCenterCss = project([(featBBox.minX + featBBox.maxX)/2, (featBBox.minY + featBBox.maxY)/2], bounds, rect.width, rect.width * 0.6);
    const featCenterDeviceX = featCenterCss[0] * DPR;
    const featCenterDeviceY = featCenterCss[1] * DPR;

    const applyTransform = (x,y, continentalCenterDeviceX, continentalCenterDeviceY, centerX, centerY) => {
      if (isAlaska) {
        return [x * alaskaScale + alaskaOffsetX, y * alaskaScale + alaskaOffsetY];
      }
      if (isHawaii) {
        // place Hawaii relative to canvas center with tuned offsets
        const hawaiiScale = 0.85;
        const targetX = centerX - Math.round(width * 0.30);
        const targetY = centerY + Math.round(height * 0.28);
        const relX = x - featCenterDeviceX;
        const relY = y - featCenterDeviceY;
        return [relX * hawaiiScale + targetX, relY * hawaiiScale + targetY];
      }
      // scale about continental center then translate to canvas center
      const nx = (x - continentalCenterDeviceX) * globalScale + centerX;
      const ny = (y - continentalCenterDeviceY) * globalScale + centerY;
      return [nx, ny];
    };

    if (geom.type === 'Polygon') {
      geom.coordinates.forEach((ring, i) => {
        ring.forEach((pt, j) => {
              const [xCss,yCss] = project(pt, bounds, rect.width, rect.width * 0.6);
              // convert to device pixels
              const x = xCss * DPR;
              const y = yCss * DPR;
              const [tx,ty] = applyTransform(x,y, continentalCenterDeviceX, continentalCenterDeviceY, centerX, centerY);
              if (j===0) path.moveTo(tx,ty); else path.lineTo(tx,ty);
        });
        path.closePath();
      });
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach(polygon => {
        polygon.forEach(ring => {
          ring.forEach((pt, j) => {
            const [xCss,yCss] = project(pt, bounds, rect.width, rect.width * 0.6);
            const x = xCss * DPR;
            const y = yCss * DPR;
            const [tx,ty] = applyTransform(x,y, continentalCenterDeviceX, continentalCenterDeviceY, centerX, centerY);
            if (j===0) path.moveTo(tx,ty); else path.lineTo(tx,ty);
          });
          path.closePath();
        });
      });
    }
  }

  // hit testing
  canvas.addEventListener('mousemove', function(ev) {
    if (!statesData.length) return;
    const rect = canvas.getBoundingClientRect();
    const xCss = (ev.clientX - rect.left);
    const yCss = (ev.clientY - rect.top);
    // convert to device pixels coordinates used in Path2D
    const x = xCss * DPR;
    const y = yCss * DPR;
    let found = null;
    for (let s of statesData) {
      if (Array.isArray(s.path)) {
        for (let p of s.path) { if (ctx.isPointInPath(p, x, y)) { found = s; break; } }
        if (found) break;
      } else {
        if (ctx.isPointInPath(s.path, x, y)) { found = s; break; }
      }
    }
    if ((found && !hovered) || (found && hovered && found.name !== hovered.name) || (!found && hovered)) {
      hovered = found;
      render();
    }
    canvas.style.cursor = found ? 'pointer' : '';
  });

  canvas.addEventListener('click', async function(ev) {
    if (!hovered) return;
    await openStatePopup(hovered.name, hovered.feature);
  });

  // popup/backdrop and actions
  let currentBackdrop = null;
  function closeStatePopup() {
    try { popup.setAttribute('aria-hidden', 'true'); } catch(e){}
    try { popup.style.display = 'none'; } catch(e){}
    if (currentBackdrop && currentBackdrop.parentElement) currentBackdrop.parentElement.removeChild(currentBackdrop);
    currentBackdrop = null;
  }
  closeBtn.addEventListener('click', closeStatePopup);
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeStatePopup(); });
  discoverBtn.addEventListener('click', () => { window.location.href = 'directory.html'; });

  // openStatePopup accepts optional feature to draw mini shapes
  async function openStatePopup(stateName, feature) {
    popupContent.innerHTML = '<p>Loading…</p>';
    if (!currentBackdrop) {
      const bd = document.createElement('div'); bd.className='state-backdrop'; bd.addEventListener('click', closeStatePopup); document.body.appendChild(bd); currentBackdrop=bd;
    }
    if (popup.parentElement !== document.body) document.body.appendChild(popup);
    popup.style.display = 'block'; popup.setAttribute('aria-hidden','false');

    // populate title and carousel placeholders
    const titleEl = document.getElementById('statePopupTitle');
    const carouselEl = document.getElementById('stateCarousel');
    if (titleEl) titleEl.textContent = stateName || 'State';
    if (carouselEl) { carouselEl.innerHTML = ''; carouselEl.setAttribute('aria-hidden', 'true'); }

    try {
      const module = await import('./map-data.js');
      const entries = await module.getEntriesByState(stateName);
      if (!entries || entries.length === 0) {
        popupContent.innerHTML = `<p>No information added yet for '${escapeHtml(stateName || '')}'</p>`;
      } else {
        const e = entries[0];
        // build simple image carousel if pictures exist
        if (carouselEl && e.pictures && e.pictures.length) {
          let idx = 0;
          carouselEl.setAttribute('aria-hidden', 'false');
          carouselEl.innerHTML = '';
          const prev = document.createElement('button'); prev.className = 'carousel-prev'; prev.type='button'; prev.textContent = '◀';
          const next = document.createElement('button'); next.className = 'carousel-next'; next.type='button'; next.textContent = '▶';
          const imgWrap = document.createElement('div'); imgWrap.className = 'carousel-wrap';
          const imgEl = document.createElement('img'); imgEl.className = 'carousel-image'; imgEl.src = e.pictures[0]; imgEl.alt = e.title || stateName || 'state image';
          imgWrap.appendChild(imgEl);
          prev.addEventListener('click', () => { idx = (idx - 1 + e.pictures.length) % e.pictures.length; imgEl.src = e.pictures[idx]; });
          next.addEventListener('click', () => { idx = (idx + 1) % e.pictures.length; imgEl.src = e.pictures[idx]; });
          carouselEl.appendChild(prev); carouselEl.appendChild(imgWrap); carouselEl.appendChild(next);
        }

        popupContent.innerHTML = `\n          <div class="map-card">\n            <h3>${escapeHtml(e.title || 'Untitled')}</h3>\n            <p><strong>State:</strong> ${escapeHtml(e.state || '')}</p>\n            <p><strong>Tags:</strong> ${escapeHtml(e.tags || '')}</p>\n            <p>${escapeHtml((e.helpfulInfo || '').slice(0, 200))}${(e.helpfulInfo && e.helpfulInfo.length>200)?'...':''}</p>\n          </div>`;
      }
    } catch (err) {
      console.error('Error fetching entries for state', err);
      popupContent.innerHTML = '<p>Error loading data</p>';
    }

    // render state-shaped mini-canvas inside action buttons and set labels
    const addBtnEl = document.getElementById('addEntryFromMap');
    const discoverBtnEl = document.getElementById('discoverResourcesFromMap');
    addBtnEl.innerHTML = '';
    discoverBtnEl.innerHTML = '';
    const small = (w,h, feat) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h; c.style.width = w+'px'; c.style.height = h+'px';
      const g = c.getContext('2d'); g.fillStyle='#ffffff'; g.strokeStyle='#444'; g.lineWidth=1;
      // compute bbox of feature
      const bbox = featureBBox(feat.geometry);
      // draw scaled
      drawFeatureIntoCanvas(g, feat.geometry, bbox, w, h);
      return c;
    };

    function makeButton(btn, labelText) {
      btn.innerHTML = '';
      const label = document.createElement('div');
      label.textContent = labelText;
      label.className = 'map-btn-label';
      btn.appendChild(label);
    }

    makeButton(addBtnEl, 'Want to add an entry?');
    makeButton(discoverBtnEl, 'Find other resources');

    // wire add/discover buttons using onclick to avoid duplicate listeners
    addBtnEl.onclick = () => { window.location.href = 'directory.html#add'; };
    discoverBtnEl.onclick = () => { window.location.href = 'directory.html'; };
  }

  function drawFeatureIntoCanvas(g, geom, bbox, w, h) {
    // simple linear projection from bbox to canvas
    const pad = 6;
    const scaleX = (w - pad*2) / (bbox.maxX - bbox.minX || 1);
    const scaleY = (h - pad*2) / (bbox.maxY - bbox.minY || 1);
    const scale = Math.min(scaleX, scaleY);
    g.clearRect(0,0,w,h);
    g.save();
    g.translate(pad, pad);
    g.scale(scale, -scale);
    g.translate(-bbox.minX, -bbox.maxY);
    g.beginPath();
    if (geom.type === 'Polygon') {
      geom.coordinates.forEach(ring => { ring.forEach((pt,i)=>{ if (i===0) g.moveTo(pt[0], pt[1]); else g.lineTo(pt[0], pt[1]); }); g.closePath(); });
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach(poly => poly.forEach(ring => { ring.forEach((pt,i)=>{ if (i===0) g.moveTo(pt[0], pt[1]); else g.lineTo(pt[0], pt[1]); }); g.closePath(); }));
    }
    g.fillStyle = '#f5f5f5'; g.fill(); g.strokeStyle='#666'; g.lineWidth = 1/scale; g.stroke();
    g.restore();
  }

  // helpers reused
  function getAllCoords(geom) { const out=[]; if(geom.type==='Polygon'){ geom.coordinates.forEach(r=>r.forEach(c=>out.push(c))); } else if(geom.type==='MultiPolygon'){ geom.coordinates.forEach(p=>p.forEach(r=>r.forEach(c=>out.push(c)))); } return out; }
  function featureBBox(geom){ const cs=getAllCoords(geom); let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity; cs.forEach(c=>{ if(c[0]<minX)minX=c[0]; if(c[0]>maxX)maxX=c[0]; if(c[1]<minY)minY=c[1]; if(c[1]>maxY)maxY=c[1]; }); return {minX,minY,maxX,maxY}; }
  function escapeHtml(str){ if(!str) return ''; return String(str).replace(/[&<>\"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }

});


/* ============================================
   SCROLL-SCRUBBED IMAGE SEQUENCE TRANSITION
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('scrollCanvas');
  const videoTransition = document.getElementById('section3');
  const spacer = document.querySelector('.video-scroll-spacer');
  
  if (!canvas || !videoTransition || !spacer) {
    console.error('Image sequence elements not found');
    return;
  }

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const frameCount = 55;
  const frames = [];
  let imagesLoaded = 0;
  let isVisible = false;
  let lastFrame = -1;
  let targetFrame = 0;
  let rafId = null;
  let lastScrollTop = 0;

  // Cache these values
  let transitionTop = 0;
  let spacerHeight = 0;
  let viewportHeight = 0;
  let scrollRangeForPlayback = 0;

  function updateDimensions() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    transitionTop = videoTransition.offsetTop;
    spacerHeight = spacer.offsetHeight;
    viewportHeight = window.innerHeight;
    scrollRangeForPlayback = spacerHeight - viewportHeight;
    if (lastFrame >= 0) {
      drawFrame(lastFrame);
    }
  }

  function getFrameSrc(index) {
    const frameNumber = index + 1;
    return `assets/scroll_animation_starpath_webmaster_2026/scroll_animation${frameNumber}.png`;
  }

  function preloadFrames() {
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      img.decode().then(() => {
        return (window.createImageBitmap ? createImageBitmap(img) : null);
      }).then((bitmap) => {
        frames[i] = { img, bitmap };
        imagesLoaded += 1;
        if (imagesLoaded === 1) {
          drawFrame(0);
        }
      }).catch(() => {
        frames[i] = { img, bitmap: null };
        imagesLoaded += 1;
        if (imagesLoaded === 1) {
          drawFrame(0);
        }
      });
    }
  }

  function drawFrame(index) {
    const frame = frames[index];
    if (!frame || (!frame.bitmap && !frame.img) || (frame.img && !frame.img.complete)) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const source = frame.bitmap || frame.img;
    const imgWidth = source.width || source.naturalWidth;
    const imgHeight = source.height || source.naturalHeight;

    // Scale to fit width, allowing height to extend
    const scale = canvasWidth / imgWidth;
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const offsetX = 0;
    const offsetY = 0; // Align to top

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(source, offsetX, offsetY, drawWidth, drawHeight);
  }

  function computeTargetFrame() {
    if (!isVisible) return;

    const scrollTop = lastScrollTop;
    const scrollIntoSection = scrollTop - transitionTop;

    if (scrollIntoSection >= 0 && scrollIntoSection <= spacerHeight) {
      if (!canvas.classList.contains('visible')) {
        canvas.classList.add('visible');
      }

      const playbackScroll = Math.max(0, scrollIntoSection - viewportHeight);
      let progress = 0;

      if (scrollRangeForPlayback > 0) {
        progress = playbackScroll / scrollRangeForPlayback;
        progress = Math.max(0, Math.min(1, progress));
      }

      targetFrame = Math.min(
        frameCount - 1,
        Math.max(0, Math.round(progress * (frameCount - 1)))
      );
    } else {
      if (canvas.classList.contains('visible')) {
        canvas.classList.remove('visible');
      }
    }
  }

  function renderLoop() {
    if (!isVisible) {
      rafId = null;
      return;
    }

    if (targetFrame !== lastFrame) {
      lastFrame = targetFrame;
      drawFrame(targetFrame);
      
      // Show text during frames 37-40
      const myText = document.getElementById('myText');
      if (myText) {
        if (targetFrame >= 37 && targetFrame <= 40) {
          myText.classList.add('visible');
        } else {
          myText.classList.remove('visible');
        }
      }
    }

    rafId = requestAnimationFrame(renderLoop);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        computeTargetFrame();
        if (!rafId) {
          rafId = requestAnimationFrame(renderLoop);
        }
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }, { threshold: 0 });

  observer.observe(videoTransition);

  preloadFrames();
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
  window.addEventListener('scroll', () => {
    lastScrollTop = window.scrollY || document.documentElement.scrollTop;
    computeTargetFrame();
  }, { passive: true });
  lastScrollTop = window.scrollY || document.documentElement.scrollTop;
  computeTargetFrame();
});
