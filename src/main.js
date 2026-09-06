import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const UP_BOUNDS = [[23.6, 77.2], [30.8, 84.7]];
const map = L.map('map', {
  zoomControl: false,
  zoomSnap: 0.5,
  maxBounds: UP_BOUNDS,
  maxBoundsViscosity: 1.0,
  minZoom: 6,
  maxZoom: 11,
  worldCopyJump: false
}).fitBounds(UP_BOUNDS);
map.setMinZoom(map.getBoundsZoom(UP_BOUNDS));
map.on('drag', () => map.panInsideBounds(UP_BOUNDS, { animate: false }));

const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 18 });
const esriImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri, Maxar', maxZoom: 18 });
const esriLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri', maxZoom: 18 });
const satellite = L.layerGroup([esriImagery, esriLabels]);
satellite.addTo(map);

const redIcon = L.divIcon({
  className: '',
  html: '<div class="pin-wrap"><div class="pin-pulse"></div><div class="pin-dot"></div></div>',
  iconSize: [16,16], iconAnchor: [8,8]
});
const lowIcon = L.divIcon({
  className: '',
  html: '<div class="pin-wrap" style="opacity:0.9"><div style="width:11px;height:11px;background:#a78bfa;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 6px rgba(0,0,0,.4)"></div></div>',
  iconSize: [11,11], iconAnchor: [5,5]
});

/* ---------- persistence ---------- */
const LS = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v===null?d:v; }catch{ return d; } },
  set(k, v){ try{ localStorage.setItem(k, v); }catch{} }
};
let lang = LS.get('redlight_lang', 'en');
let filterMode = LS.get('redlight_filter', 'all');

/* ---------- i18n ---------- */
const HI_DISTRICT = {
  "Amroha":"अमरोहा","Hapur":"हापुड़","Bareilly":"बरेली","Pilibhit":"पीलीभीत","Bulandshahr":"बुलंदशहर","Gautam Buddha Nagar":"गौतम बुद्ध नगर","Lakhimpur Kheri":"लखीमपुर खीरी","Budaun":"बदायूँ","Bahraich":"बहराइच","Shahjahanpur":"शाहजहाँपुर","Aligarh":"अलीगढ़","Kasganj":"कासगंज","Mathura":"मथुरा","Shrawasti":"श्रावस्ती","Sitapur":"सीतापुर","Hathras":"हाथरस","Etah":"एटा","Hardoi":"हरदोई","Farrukhabad":"फर्रुखाबाद","Firozabad":"फिरोजाबाद","Siddharthnagar":"सिद्धार्थनगर","Mainpuri":"मैनपुरी","Maharajganj":"महाराजगंज","Agra":"आगरा","Gonda":"गोंडा","Barabanki":"बाराबंकी","Kushinagar":"कुशीनगर","Kannauj":"कन्नौज","Lucknow":"लखनऊ","Basti":"बस्ती","Gorakhpur":"गोरखपुर","Sant Kabir Nagar":"संत कबीर नगर","Unnao":"उन्नाव","Etawah":"इटावा","Kanpur Nagar":"कानपुर","Auraiya":"औरैया","Ayodhya":"अयोध्या","Kanpur Dehat":"कानपुर देहात","Deoria":"देवरिया","Sultanpur":"सुल्तानपुर","Ambedkar Nagar":"अंबेडकर नगर","Rae Bareli":"रायबरेली","Jalaun":"जालौन","Azamgarh":"आज़मगढ़","Mau":"मऊ","Fatehpur":"फतेहपुर","Ballia":"बलिया","Jaunpur":"जौनपुर","Jhansi":"झाँसी","Banda":"बाँदा","Ghazipur":"ग़ाज़ीपुर","Kaushambi":"कौशाम्बी","Prayagraj":"प्रयागराज","Varanasi":"वाराणसी","Chitrakoot":"चित्रकूट","Chandauli":"चंदौली","Bhadohi":"भदोही","Mirzapur":"मिर्ज़ापुर","Lalitpur":"ललितपुर","Sonbhadra":"सोनभद्र","Amethi":"अमेठी","Ghaziabad":"ग़ाज़ियाबाद","Sambhal":"संभल","Mahoba":"महोबा","Saharanpur":"सहारनपुर","Bijnor":"बिजनौर","Muzaffarnagar":"मुज़फ्फरनगर","Baghpat":"बागपत","Meerut":"मेरठ","Moradabad":"मुरादाबाद","Rampur":"रामपुर","Shamli":"शामली","Balrampur":"बलरामपुर","Hamirpur":"हमीरपुर","Pratapgarh":"प्रतापगढ़"
};
const I18N = {
  en: { title:"UP Red Light Areas", sub:"District & area-centroid mapping · information only", sat:"Satellite", street:"Street", lang:"EN", full:"Full", story:"Story", list:"List", search:"Search district or hotel…", fAll:"All", fVer:"Verified", fLow:"Low", legV:"Verified", legTI:"TI district", hint:"Tap a dot to explore", dTitle:"Select a district", dSub:"Tap any red dot or story card.", dContent:"Tap a red dot to explore. Satellite hybrid with labels is default. Map is locked to Uttar Pradesh only.", about:"About this map", src:"Open source", sv:"Street View", copy:"Copy link", close:"Close", tiType:"District with TI program", relHigh:"High", relMed:"Medium", relLow:"Low", badge:"Verified", introTitle:"Explore<br>the map", introOk:"OK", introStepsM:["Pinch to zoom the map","Tap a red dot for its story","Open List for all 75 districts"], introStepsD:["Scroll to zoom · drag to pan","Click a red dot for its story","Search or open List for districts"], legL:"Low evidence", stats:"{s} sites · {d} districts · {t} TI" },
  hi: { title:"यूपी रेड लाइट एरिया", sub:"ज़िला व क्षेत्र-केंद्र मानचित्र · केवल जानकारी", sat:"उपग्रह", street:"सड़क", lang:"हि", full:"पूरा", story:"कहानी", list:"सूची", search:"ज़िला या होटल खोजें…", fAll:"सभी", fVer:"प्रमाणित", fLow:"कम", legV:"प्रमाणित", legTI:"टीआई ज़िला", hint:"देखने हेतु बिंदु दबाएँ", dTitle:"कोई ज़िला चुनें", dSub:"कोई लाल बिंदु या कार्ड चुनें।", dContent:"लाल बिंदु दबाएँ। डिफ़ॉल्ट उपग्रह + लेबल। मानचित्र केवल यूपी तक सीमित।", about:"इस मानचित्र के बारे में", src:"स्रोत खोलें", sv:"स्ट्रीट व्यू", copy:"लिंक कॉपी", close:"बंद", tiType:"टीआई कार्यक्रम वाला ज़िला", relHigh:"उच्च", relMed:"मध्यम", relLow:"कम", badge:"सत्यापित", introTitle:"मानचित्र<br>देखें", introOk:"ठीक है", introStepsM:["ज़ूम के लिए पिंच करें","कहानी हेतु लाल बिंदु दबाएँ","सभी 75 ज़िलों हेतु सूची खोलें"], introStepsD:["ज़ूम हेतु स्क्रॉल · घुमाने हेतु ड्रैग","कहानी हेतु लाल बिंदु दबाएँ","खोजें या सूची खोलें"], legL:"कम साक्ष्य", stats:"{s} स्थल · {d} ज़िले · {t} टीआई" }
};
const T = () => I18N[lang];
const distName = d => lang === 'hi' && HI_DISTRICT[d] ? HI_DISTRICT[d] : d;

/* ---------- DOM refs ---------- */
const drawer = document.getElementById('drawer');
const dTitle = document.getElementById('d-title');
const dSub = document.getElementById('d-sub');
const dContent = document.getElementById('d-content');
const dActions = document.getElementById('d-actions');
const dSource = document.getElementById('d-source');
const dStreet = document.getElementById('d-streetview');
const dClose = document.getElementById('d-close');
const storyEl = document.getElementById('story');
const storyCards = document.getElementById('story-cards');
const stPrev = document.getElementById('st-prev');
const stPlay = document.getElementById('st-play');
const stNext = document.getElementById('st-next');
const stCount = document.getElementById('st-count');
const searchInput = document.getElementById('search');
const resultsEl = document.getElementById('results');
const distlistEl = document.getElementById('distlist');
const distlistBody = document.getElementById('distlist-body');
let currentSlug = null;

function openDrawer(p, latlng){
  currentSlug = p.slug || null;
  const t = T();
  const relTxt = { high:t.relHigh, medium:t.relMed, low:t.relLow }[p.reliability] || p.reliability;
  const badge = p.last_verified ? `<span class="fresh">${t.badge} ${p.last_verified}</span>` : '';
  dTitle.textContent = `${distName(p.district)} - ${p.area_name}`;
  dSub.innerHTML = `${p.type}<br/>Reliability <b>${relTxt}</b> · Updated ${p.last_updated} ${badge}`;
  dContent.innerHTML = `
    <div class="story-block"><b>Story</b><br/>${p.story||p.notes||''}</div>
    <div style="font-size:12px;color:var(--muted);margin-top:10px">Source: <a href="${p.source_url}" target="_blank" style="color:#fca5a5">${p.source}</a></div>
    <div style="margin-top:10px;font-size:12px;color:var(--muted)"><b>Coordinates:</b> ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)} (district centroid only)</div>`;
  dSource.href = p.source_url;
  dStreet.href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latlng.lat},${latlng.lng}`;
  dActions.style.display = 'flex';
  drawer.classList.add('open');
}
function closeDrawer(){ drawer.classList.remove('open'); }
dClose.onclick = closeDrawer;
document.addEventListener('keydown', e=>{
  if(e.key !== 'Escape') return;
  if(distlistEl.classList.contains('open')) closeDistList();
  else if(drawer.classList.contains('open')) closeDrawer();
  else if(!storyEl.classList.contains('hidden')){ storyEl.classList.add('hidden'); pauseStory(); }
});
function toast(msg){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=> el.classList.remove('show'), 2200);
}
let touchY = null;
drawer.addEventListener('touchstart', e=>{ touchY = e.touches[0].clientY; }, {passive:true});
drawer.addEventListener('touchend', e=>{
  if(touchY===null) return;
  if(e.changedTouches[0].clientY - touchY > 80 && window.scrollY<=0) closeDrawer();
  touchY = null;
}, {passive:true});
document.getElementById('d-share').onclick = async ()=>{
  const url = currentSlug ? `${location.origin}/?d=${currentSlug}` : location.origin;
  try{ await navigator.clipboard.writeText(url); toast(T().copy+' ✓'); } catch{ prompt(T().copy+':', url); }
};

/* ---------- Controls ---------- */
document.getElementById('btn-fullscreen').onclick = ()=>{
  if(window.innerWidth <= 860) return;
  if(document.fullscreenElement) document.exitFullscreen();
  else document.getElementById('map').requestFullscreen();
};
document.getElementById('btn-sat').onclick = e=>{
  if(!map.hasLayer(satellite)){ map.addLayer(satellite); map.removeLayer(street); }
  e.target.classList.add('active'); document.getElementById('btn-street').classList.remove('active');
};
document.getElementById('btn-street').onclick = e=>{
  if(!map.hasLayer(street)){ map.addLayer(street); map.removeLayer(satellite); }
  e.target.classList.add('active'); document.getElementById('btn-sat').classList.remove('active');
};

/* ---------- Heat: always on, built from loaded points (single fetch) ---------- */
let heatLayer = null;
function buildHeat(features){
  if(heatLayer) map.removeLayer(heatLayer);
  heatLayer = L.layerGroup(features.map(f=> L.circleMarker([f.geometry.coordinates[1], f.geometry.coordinates[0]], {radius:26, fillColor:'#e11d48', fillOpacity:0.16, color:'#e11d48', weight:1, opacity:0.22})));
  heatLayer.addTo(map);
}

/* ---------- Zoom (left-top vertical) ---------- */
const zIn = document.getElementById('z-in'), zOut = document.getElementById('z-out');
function syncZoom(){ const z=map.getZoom(); const min=map.getMinZoom(), max=map.getMaxZoom(); if(zIn) zIn.disabled = z>=max; if(zOut) zOut.disabled = z<=min; }
zIn?.addEventListener('click', ()=> map.zoomIn(1,{animate:true}));
zOut?.addEventListener('click', ()=> map.zoomOut(1,{animate:true}));

/* ---------- Markers fade by zoom (heat-only when zoomed out) ---------- */
function updateMarkerFade(){
  const show = map.getZoom() >= 8;
  pointEntries.forEach(({marker})=>{
    const el = marker.getElement();
    if(el) el.classList.toggle('mk-hidden', !show);
  });
}
map.on('zoomend', ()=>{ syncZoom(); updateMarkerFade(); });

/* ---------- Story tour with auto-play ---------- */
let storyIdx = -1, storyData = [], bySlug = {}, pointsLayer = null, pointEntries = [];
let storyPlaying = false, storyTimer = null;
document.getElementById('btn-story').onclick = ()=>{
  storyEl.classList.toggle('hidden');
  if(storyEl.classList.contains('hidden')){ pauseStory(); }
  else if(storyData.length){ if(storyIdx < 0) storyIdx = 0; playStory(); }
};
function focusFeature(f){
  const ll = L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]);
  map.flyTo(ll, 9, {duration:1.2});
  openDrawer(f.properties, ll);
  history.replaceState(null,'',`?d=${f.properties.slug}`);
  [...storyCards.children].forEach(c=> c.classList.toggle('active', c.dataset.title===f.properties.area_name));
  updateStoryCount();
}
function storyStep(dir){
  if(!storyData.length) return;
  storyIdx = (storyIdx + dir + storyData.length) % storyData.length;
  focusFeature(storyData[storyIdx]);
}
function updateStoryCount(){ if(stCount) stCount.textContent = storyData.length ? `${storyIdx+1} / ${storyData.length}` : ''; }
function playStory(){
  if(storyPlaying || !storyData.length) return;
  storyPlaying = true; stPlay.textContent = '❚❚';
  if(storyIdx < 0) storyIdx = 0;
  storyTimer = setInterval(()=> storyStep(1), 5000);
}
function pauseStory(){
  storyPlaying = false; stPlay.textContent = '▶';
  if(storyTimer){ clearInterval(storyTimer); storyTimer = null; }
}
stPlay.onclick = ()=> storyPlaying ? pauseStory() : playStory();
stPrev.onclick = ()=>{ pauseStory(); storyStep(-1); };
stNext.onclick = ()=>{ pauseStory(); storyStep(1); };

/* ---------- Visibility: filter + search ---------- */
let searchTerm = '';
function visible(p){
  if(filterMode === 'verified' && !(p.reliability==='high'||p.reliability==='medium')) return false;
  if(filterMode === 'low' && p.reliability!=='low') return false;
  if(searchTerm){
    const hay = `${p.district} ${HI_DISTRICT[p.district]||''} ${p.area_name} ${p.type} ${p.story||''} ${p.source||''}`.toLowerCase();
    if(!hay.includes(searchTerm)) return false;
  }
  return true;
}
function applyVisibility(){
  if(!pointsLayer) return;
  pointEntries.forEach(({feature, marker})=>{
    if(visible(feature.properties)){ if(!pointsLayer.hasLayer(marker)) pointsLayer.addLayer(marker); }
    else { if(pointsLayer.hasLayer(marker)) pointsLayer.removeLayer(marker); }
  });
}
document.getElementById('filter').addEventListener('click', e=>{
  const b = e.target.closest('button'); if(!b) return;
  filterMode = b.dataset.f;
  [...e.currentTarget.children].forEach(x=> x.classList.toggle('active', x===b));
  LS.set('redlight_filter', filterMode);
  applyVisibility();
});

let statSites = 0, statDist = 0, statTI = 0;
function updateStats(){
  const el = document.getElementById('stats');
  if(!el) return;
  el.textContent = T().stats.replace('{s}', statSites).replace('{d}', statDist).replace('{t}', statTI);
}

/* ---------- Search ---------- */
function renderResults(){
  const term = searchTerm;
  resultsEl.innerHTML = '';
  if(!term) return;
  const matches = storyData.filter(f=>visible(f.properties));
  if(!matches.length){ resultsEl.innerHTML = `<div style="padding:10px;color:var(--muted);font-size:12px">No matches.</div>`; return; }
  matches.slice(0,40).forEach(f=>{
    const p = f.properties;
    const el = document.createElement('div');
    el.className = 'result';
    el.innerHTML = `<b>${distName(p.district)}</b><span>${p.area_name}</span><span class="tag ${p.reliability}">${p.reliability}</span>`;
    el.onclick = ()=>{ focusFeature(f); searchInput.blur(); };
    resultsEl.appendChild(el);
  });
}
searchInput.addEventListener('input', ()=>{
  searchTerm = searchInput.value.trim().toLowerCase();
  applyVisibility(); renderResults();
});

/* ---------- Language toggle (persisted) ---------- */
function applyLang(){
  const t = T();
  document.documentElement.lang = lang;
  document.querySelector('.brand h1').textContent = t.title;
  document.querySelector('.brand p').textContent = t.sub;
  document.getElementById('btn-sat').textContent = t.sat;
  document.getElementById('btn-street').textContent = t.street;
  document.getElementById('btn-lang').textContent = t.lang;
  document.getElementById('btn-list').textContent = t.list;
  document.getElementById('btn-fullscreen').textContent = t.full;
  document.getElementById('btn-story').textContent = t.story;
  searchInput.placeholder = t.search;
  document.querySelector('#filter button[data-f="all"]').textContent = t.fAll;
  document.querySelector('#filter button[data-f="verified"]').textContent = t.fVer;
  document.querySelector('#filter button[data-f="low"]').textContent = t.fLow;
  document.querySelector('.bottombar').innerHTML = `<span><span class="dot" style="background:#e11d48"></span>${t.legV}</span><span><span class="dot" style="background:#a78bfa"></span>${t.legL}</span><span><span class="dot" style="background:#f59e0b"></span>${t.legTI}</span><span class="sep"></span><span class="hint">${t.hint}</span>`;
  document.getElementById('d-close').textContent = t.close;
  document.getElementById('d-source').textContent = t.src;
  document.getElementById('d-streetview').textContent = t.sv;
  document.getElementById('d-share').textContent = t.copy;
  document.querySelector('.about-line').innerHTML = `<b>${t.about}</b><br/>District-centroid mapping of historically reported areas, compiled from NGO reports (Guria, Freedom Firm), court records, academic studies and news. TI districts = UPSACS HIV-program coverage, aggregated. No venue-level data. Report corrections via <a href="https://github.com/HYPERSAHIL/redlight/issues" target="_blank" style="color:#fca5a5">GitHub issues</a>.`;
  document.querySelector('.distlist-head .sub').textContent = 'All 75 · A–Z · tap to fly';
  if(!drawer.classList.contains('open')){
    dTitle.textContent = t.dTitle; dSub.textContent = t.dSub; dContent.textContent = t.dContent;
  }
  pointEntries.forEach(({feature, marker})=>{
    marker.getTooltip()?.setContent(`${distName(feature.properties.district)} - ${feature.properties.area_name}`);
  });
  if(districtsLayer){
    districtsLayer.eachLayer(l=>{
      const p = l.feature.properties;
      l.getTooltip()?.setContent(`${distName(p.DISTRICT)} ${p.hasTI?'('+t.legTI+')':''}`);
    });
    buildDistList();
  }
  renderResults();
  updateStoryCount();
  updateStats();
  if(document.getElementById('intro')?.classList.contains('show')) renderIntro();
}
document.getElementById('btn-lang').onclick = ()=>{ lang = lang==='en'?'hi':'en'; LS.set('redlight_lang', lang); applyLang(); };

/* ---------- Boot loader (intentional: min display time) ---------- */
const BOOT_MIN_MS = 2200;
const bootStart = Date.now();
let bootPending = 2;
function hideBoot(){
  const el = document.getElementById('boot-loader');
  if(!el) return;
  el.classList.add('done');
  setTimeout(()=> el.remove(), 500);
  setTimeout(showIntro, 350);
}
function bootReady(){
  if(bootPending <= 0) return;
  if(--bootPending > 0) return;
  const wait = Math.max(0, BOOT_MIN_MS - (Date.now() - bootStart));
  setTimeout(hideBoot, wait);
}
// never trap the user on a failed fetch
setTimeout(hideBoot, 9000);

/* ---------- Intro instructions (once) ---------- */
function renderIntro(){
  const m = window.innerWidth <= 480;
  const t = T();
  document.getElementById('intro-title').innerHTML = t.introTitle;
  document.getElementById('intro-desc').innerHTML = (m ? t.introStepsM : t.introStepsD).join('<br>');
  document.getElementById('intro-ok-txt').textContent = t.introOk;
}
function showIntro(){
  if(LS.get('redlight_intro_seen', '') === '1') return;
  renderIntro();
  document.getElementById('intro').classList.add('show');
}
document.getElementById('intro-ok').onclick = ()=>{
  document.getElementById('intro').classList.remove('show');
  LS.set('redlight_intro_seen', '1');
};

/* ---------- Load points ---------- */
fetch('/data/up-points.geojson').then(r=>r.json()).then(data=>{
  storyData = data.features;
  bySlug = Object.fromEntries(data.features.map(f=>[f.properties.slug, f]));
  pointsLayer = L.layerGroup().addTo(map);
  pointEntries = data.features.map(f=>{
    const marker = L.marker([f.geometry.coordinates[1], f.geometry.coordinates[0]], {icon: f.properties.reliability==='low' ? lowIcon : redIcon});
    marker.bindTooltip(`${distName(f.properties.district)} - ${f.properties.area_name}`, {direction:'top', offset:[0,-10]});
    marker.on('click', ()=>{
      const ll = marker.getLatLng();
      map.flyTo(ll, 9, {duration:1.2});
      openDrawer(f.properties, ll);
      history.replaceState(null,'',`?d=${f.properties.slug}`);
    });
    pointsLayer.addLayer(marker);
    return { feature: f, marker };
  });
  buildHeat(data.features);
  statSites = storyData.length; updateStats();

  storyCards.innerHTML = '';
  data.features.forEach((f,i)=>{
    const card = document.createElement('div');
    card.className = 'story-card';
    card.dataset.title = f.properties.area_name;
    card.innerHTML = `<b>${distName(f.properties.district)}</b><span>${f.properties.area_name}</span>`;
    card.onclick = ()=>{ pauseStory(); storyIdx = i; focusFeature(f); };
    storyCards.appendChild(card);
  });

  const params = new URLSearchParams(location.search);
  const slug = params.get('d');
  if(slug && bySlug[slug]){
    const f = bySlug[slug];
    setTimeout(()=>{
      const ll = L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]);
      map.setView(ll, 9); openDrawer(f.properties, ll);
      const idx = storyData.indexOf(f);
      if(idx>=0){ storyIdx = idx; [...storyCards.children].forEach((c,i)=> c.classList.toggle('active', i===idx)); updateStoryCount(); }
    }, 400);
  }
  map.whenReady(updateMarkerFade);
  bootReady();
});

/* ---------- Districts layer + A–Z list ---------- */
let districtsLayer = null, districtList = [];
fetch('/data/up-districts.geojson').then(r=>r.json()).then(data=>{
  districtsLayer = L.geoJSON(data, {
    style: f=> ({ color: f.properties.hasTI ? '#f59e0b' : '#666', weight: f.properties.hasTI ? 1.4 : 0.6, fillColor: f.properties.hasTI ? '#f59e0b' : '#222', fillOpacity: f.properties.hasTI ? 0.14 : 0.03 }),
    onEachFeature: (f, layer)=>{
      const p = f.properties; const t = T();
      layer.bindTooltip(`${distName(p.DISTRICT)} ${p.hasTI?'('+t.legTI+')':''}`, {sticky:true});
      layer.on('mouseover', ()=> layer.setStyle({fillOpacity: p.hasTI?0.32:0.12, weight:2}));
      layer.on('mouseout', ()=> districtsLayer.resetStyle(layer));
      const center = layer.getBounds().getCenter();
      districtList.push({ name: p.DISTRICT, hasTI: !!p.hasTI, center });
      if(p.hasTI){
        layer.on('click', e=>{
          openDrawer({district:p.DISTRICT, area_name:t.legTI, type:t.tiType, reliability:'medium', source:'UPSACS TI reports', source_url:'https://upsacs.up.gov.in', last_updated:'2024', last_verified:'', story:'This district has a UPSACS-funded Targeted Intervention program working with female sex workers and other high-risk groups. Coverage is aggregated for HIV prevention planning — it does not mark any venue.'}, center);
          map.flyTo(center, 8, {duration:1}); L.DomEvent.stop(e);
        });
      }
      else{
        layer.on('click', ()=>{ map.flyTo(center, 8, {duration:1}); });
      }
    }
  }).addTo(map);
  districtsLayer.bringToBack();
  buildDistList();
  statDist = districtList.length;
  statTI = districtList.filter(d=>d.hasTI).length;
  updateStats();
  bootReady();
});

function buildDistList(){
  if(!distlistBody) return;
  const t = T();
  const sorted = [...districtList].sort((a,b)=> distName(a.name).localeCompare(distName(b.name)));
  distlistBody.innerHTML = '';
  sorted.forEach(d=>{
    const item = document.createElement('div');
    item.className = 'dist-item';
    item.innerHTML = `<span>${distName(d.name)}</span>${d.hasTI?`<span class="ti">${t.legTI}</span>`:''}`;
    item.onclick = ()=>{
      map.flyTo(d.center, 8, {duration:1.1});
      if(d.hasTI){
        const tt = T();
        openDrawer({district:d.name, area_name:tt.legTI, type:tt.tiType, reliability:'medium', source:'UPSACS TI reports', source_url:'https://upsacs.up.gov.in', last_updated:'2024', last_verified:'', story:'This district has a UPSACS-funded Targeted Intervention program working with female sex workers and other high-risk groups. Coverage is aggregated for HIV prevention planning — it does not mark any venue.'}, d.center);
      }
      closeDistList();
    };
    distlistBody.appendChild(item);
  });
}
function openDistList(){ distlistEl.classList.add('open'); }
function closeDistList(){ distlistEl.classList.remove('open'); }
document.getElementById('btn-list').onclick = ()=> distlistEl.classList.contains('open') ? closeDistList() : openDistList();
document.getElementById('dist-close').onclick = closeDistList;

/* ---------- PWA ---------- */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=> navigator.serviceWorker.register('/sw.js').catch(()=>{}));
}

/* ---------- init ---------- */
// restore persisted filter active state
[...document.querySelectorAll('#filter button')].forEach(b=> b.classList.toggle('active', b.dataset.f===filterMode));
applyLang();
syncZoom();
updateMarkerFade();

/* mobile: start search collapsed */
const searchCard = document.querySelector('.searchcard');
const searchToggle = document.getElementById('search-toggle');
if(searchToggle){
  if(window.innerWidth <= 480) searchCard.classList.add('collapsed');
  searchToggle.addEventListener('click', ()=>{
    const c = searchCard.classList.toggle('collapsed');
    searchToggle.setAttribute('aria-expanded', String(!c));
  });
}
