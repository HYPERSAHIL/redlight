import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const UP_BOUNDS = [[23.6, 77.2], [30.8, 84.7]];
const map = L.map('map', {
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
  iconSize: [16,16],
  iconAnchor: [8,8]
});

const drawer = document.getElementById('drawer');
const dTitle = document.getElementById('d-title');
const dSub = document.getElementById('d-sub');
const dContent = document.getElementById('d-content');
const dActions = document.getElementById('d-actions');
const dSource = document.getElementById('d-source');
const dStreet = document.getElementById('d-streetview');
const dClose = document.getElementById('d-close');
const storyEl = document.getElementById('story');
let currentSlug=null;

function openDrawer(p, latlng){
  currentSlug = p.slug || null;
  const freshBadge = p.last_verified ? `<span class="fresh">Verified ${p.last_verified}</span>` : '';
  dTitle.textContent = `${p.district} - ${p.area_name}`;
  dSub.innerHTML = `${p.type}<br/>Reliability <b>${p.reliability}</b> • Updated ${p.last_updated} ${freshBadge}`;
  dContent.innerHTML = `
    <div class="story-block"><b>Story</b><br/>${p.story||p.notes||''}</div>
    <div style="font-size:12px;opacity:.75;margin-top:10px">Source: <a href="${p.source_url}" target="_blank">${p.source}</a></div>
    <div style="margin-top:10px;font-size:12px;opacity:.75"><b>Coordinates:</b> ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)} (district centroid only)</div>`;
  dSource.href = p.source_url;
  dStreet.href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latlng.lat},${latlng.lng}`;
  dActions.style.display = 'flex';
  drawer.classList.add('open');
  [...storyEl.children].forEach(c=> c.classList.toggle('active', c.dataset.title===p.area_name));
}

function closeDrawer(){ drawer.classList.remove('open'); }
dClose.onclick = closeDrawer;

// swipe-to-close on mobile
let touchY=null;
drawer.addEventListener('touchstart', e=>{ touchY=e.touches[0].clientY; }, {passive:true});
drawer.addEventListener('touchend', e=>{
  if(touchY===null) return;
  if(e.changedTouches[0].clientY - touchY > 80 && window.scrollY<=0) closeDrawer();
  touchY=null;
}, {passive:true});

document.getElementById('d-share').onclick = async ()=>{
  const slug = currentSlug || '';
  const url = slug ? `${location.origin}/?d=${slug}` : location.origin;
  try{ await navigator.clipboard.writeText(url); alert('Link copied'); }
  catch{ prompt('Copy link:', url); }
};

// Controls - mobile first
document.getElementById('btn-fullscreen').onclick = ()=>{
  if(window.innerWidth <= 860) return;
  if(document.fullscreenElement) document.exitFullscreen();
  else document.getElementById('map').requestFullscreen();
};
document.getElementById('btn-sat').onclick = (e)=>{
  if(!map.hasLayer(satellite)){ map.addLayer(satellite); map.removeLayer(street); }
  e.target.classList.add('active'); document.getElementById('btn-street').classList.remove('active');
};
document.getElementById('btn-street').onclick = (e)=>{
  if(!map.hasLayer(street)){ map.addLayer(street); map.removeLayer(satellite); }
  e.target.classList.add('active'); document.getElementById('btn-sat').classList.remove('active');
};
let heatOn=true, heatLayer=null;
function enableHeat(){
  if(heatLayer){ heatLayer.addTo(map); return; }
  fetch('/data/up-points.geojson').then(r=>r.json()).then(d=>{
    const pts = d.features.map(f=> [f.geometry.coordinates[1], f.geometry.coordinates[0], 0.9]);
    heatLayer = L.layerGroup(pts.map(p=> L.circleMarker(p.slice(0,2), {radius:28, fillColor:'#d93025', fillOpacity:0.18, color:'#d93025', weight:1, opacity:0.25})));
    heatLayer.addTo(map);
  });
}
document.getElementById('btn-heat').onclick = (e)=>{
  heatOn=!heatOn;
  e.target.classList.toggle('active', heatOn);
  if(heatOn) enableHeat();
  else { if(heatLayer) map.removeLayer(heatLayer); }
};

// Story auto-tour
let storyIdx=-1, storyData=[], bySlug={};
document.getElementById('btn-story').onclick = ()=>{
  storyEl.classList.toggle('hidden');
  if(storyEl.classList.contains('hidden')) return;
  if(!storyData.length) return;
  storyIdx=(storyIdx+1)%storyData.length;
  focusFeature(storyData[storyIdx]);
};

function focusFeature(f){
  const ll=L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]);
  map.flyTo(ll, 9, {duration:1.2});
  openDrawer(f.properties, ll);
  history.replaceState(null,'',`?d=${f.properties.slug}`);
  [...storyEl.children].forEach(c=>c.classList.toggle('active', c.dataset.title===f.properties.area_name));
}

let districtsLayer=null;

fetch('/data/up-points.geojson').then(r=>r.json()).then(data=>{
  storyData=data.features;
  bySlug=Object.fromEntries(data.features.map(f=>[f.properties.slug,f]));
  storyEl.innerHTML='';
  data.features.forEach((f,i)=>{
    const card=document.createElement('div');
    card.className='story-card';
    card.dataset.title=f.properties.area_name;
    card.innerHTML=`<b>${f.properties.district}</b><span>${f.properties.area_name}</span>`;
    card.onclick=()=>{
      storyIdx=i;
      focusFeature(f);
      document.querySelectorAll('.story-card').forEach(c=>c.classList.remove('active'));
      card.classList.add('active');
    };
    storyEl.appendChild(card);
  });

  L.geoJSON(data, {
    pointToLayer: (f, latlng)=> L.marker(latlng, {icon: redIcon}),
    onEachFeature: (f, layer)=>{
      layer.bindTooltip(`${f.properties.district} - ${f.properties.area_name}`, {direction:'top', offset:[0,-10]});
      layer.on('click', ()=>{
        // mobile-first: open directly, no tooltip step
        const ll=layer.getLatLng();
        map.flyTo(ll, 9, {duration:1.2});
        openDrawer(f.properties, ll);
        history.replaceState(null,'',`?d=${f.properties.slug}`);
      });
    }
  }).addTo(map);

  // deep link ?d=slug
  const params=new URLSearchParams(location.search);
  const slug=params.get('d');
  if(slug && bySlug[slug]){
    const f=bySlug[slug];
    setTimeout(()=>{
      const ll=L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]);
      map.setView(ll, 9);
      openDrawer(f.properties, ll);
      const idx=storyData.indexOf(f);
      if(idx>=0){ storyIdx=idx; const cards=[...storyEl.children]; cards.forEach((c,i)=>c.classList.toggle('active', i===idx)); }
    }, 400);
  }
});

fetch('/data/up-districts.geojson').then(r=>r.json()).then(data=>{
  districtsLayer=L.geoJSON(data, {
    style: f=> ({
      color: f.properties.hasTI ? '#ff9800' : '#666',
      weight: f.properties.hasTI ? 1.4 : 0.6,
      fillColor: f.properties.hasTI ? '#ff9800' : '#222',
      fillOpacity: f.properties.hasTI ? 0.14 : 0.03
    }),
    onEachFeature: (f, layer)=>{
      const p=f.properties;
      layer.bindTooltip(`${p.DISTRICT} ${p.hasTI?'(TI district)':''}`, {sticky:true});
      layer.on('mouseover', ()=> layer.setStyle({fillOpacity: p.hasTI?0.32:0.12, weight:2}));
      layer.on('mouseout', ()=> districtsLayer.resetStyle(layer));
      if(p.hasTI){
        layer.on('click', (e)=>{
          const c=layer.getBounds().getCenter();
          openDrawer({district:p.DISTRICT, area_name:'TI district', type:'District with TI program', reliability:'medium', source:'UPSACS TI reports', source_url:'https://upsacs.up.gov.in', last_updated:'2024', last_verified:'', story:'This district has a UPSACS-funded Targeted Intervention program working with female sex workers and other high-risk groups. Coverage is aggregated for HIV prevention planning - it does not mark any venue.'}, c);
          map.flyTo(c, 8, {duration:1});
          L.DomEvent.stop(e);
        });
      }
    }
  }).addTo(map);
  districtsLayer.bringToBack();
});
