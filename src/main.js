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
// keep layers control hidden - we use custom subbar
// L.control.layers({"Satellite": satellite, "Street": street}, null, {position:'topright', collapsed:true}).addTo(map);

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

function openDrawer(p, latlng){
  dTitle.textContent = `${p.district} - ${p.area_name}`;
  dSub.textContent = `${p.type} • Reliability ${p.reliability} • Updated ${p.last_updated}`;
  dContent.innerHTML = `<div style="margin-bottom:10px"><b>About:</b> ${p.notes||''}</div><div style="font-size:12px;opacity:.75">Source: <a href="${p.source_url}" target="_blank">${p.source}</a></div><div style="margin-top:10px;font-size:12px"><b>Coordinates:</b> ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)} (district centroid only)</div>`;
  dSource.href = p.source_url;
  dStreet.href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latlng.lat},${latlng.lng}`;
  dActions.style.display = 'flex';
  drawer.classList.add('open');
  // highlight story
  [...storyEl.children].forEach(c=> c.classList.toggle('active', c.dataset.title===p.area_name));
}

dClose.onclick = ()=> drawer.classList.remove('open');
document.getElementById('d-share').onclick = async ()=>{
  const t = dTitle.textContent;
  await navigator.clipboard.writeText(`${t} - https://redlight.sahil.run`);
  alert('Link copied');
};

// Controls
document.getElementById('btn-fullscreen').onclick = ()=>{
  if(document.fullscreenElement) document.exitFullscreen();
  else document.getElementById('map').requestFullscreen();
};
document.getElementById('btn-reset').onclick = ()=> map.flyToBounds(UP_BOUNDS, {duration:1});
document.getElementById('btn-sat').onclick = (e)=>{
  if(!map.hasLayer(satellite)){ map.addLayer(satellite); map.removeLayer(street); }
  e.target.classList.add('active'); document.getElementById('btn-street').classList.remove('active');
};
document.getElementById('btn-street').onclick = (e)=>{
  if(!map.hasLayer(street)){ map.addLayer(street); map.removeLayer(satellite); }
  e.target.classList.add('active'); document.getElementById('btn-sat').classList.remove('active');
};
let heatOn=false, heatLayer=null;
document.getElementById('btn-heat').onclick = (e)=>{
  heatOn=!heatOn;
  e.target.classList.toggle('active', heatOn);
  if(heatOn){
    if(!heatLayer){
      fetch('/data/up-points.geojson').then(r=>r.json()).then(d=>{
        const pts = d.features.map(f=> [f.geometry.coordinates[1], f.geometry.coordinates[0], 0.9]);
        // simple heat via circleMarkers glow
        heatLayer = L.layerGroup(pts.map(p=> L.circleMarker(p.slice(0,2), {radius:28, fillColor:'#d93025', fillOpacity:0.18, color:'#d93025', weight:1, opacity:0.25})));
        heatLayer.addTo(map);
      });
    } else heatLayer.addTo(map);
  } else { if(heatLayer) map.removeLayer(heatLayer); }
};

// Story auto-tour
let storyIdx=0, storyData=[];
document.getElementById('btn-story').onclick = ()=>{
  if(!storyData.length) return;
  storyIdx=(storyIdx+1)%storyData.length;
  const f=storyData[storyIdx];
  const latlng=L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]);
  map.flyTo(latlng, 9, {duration:1.4});
  openDrawer(f.properties, latlng);
};

let districtsLayer=null;
let pointsData=null;

fetch('/data/up-points.geojson').then(r=>r.json()).then(data=>{
  pointsData=data;
  storyData=data.features;
  // build story cards
  storyEl.innerHTML='';
  data.features.forEach((f,i)=>{
    const card=document.createElement('div');
    card.className='story-card';
    card.dataset.title=f.properties.area_name;
    card.innerHTML=`<b>${f.properties.district}</b><span>${f.properties.area_name}</span>`;
    card.onclick=()=>{
      const ll=L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]);
      map.flyTo(ll, 9, {duration:1.2});
      openDrawer(f.properties, ll);
      storyIdx=i;
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
        const ll=layer.getLatLng();
        map.flyTo(ll, 9, {duration:1.2});
        openDrawer(f.properties, ll);
      });
    }
  }).addTo(map);
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
      layer.on('mouseover', ()=>{
        layer.setStyle({fillOpacity: p.hasTI?0.32:0.12, weight:2});
      });
      layer.on('mouseout', ()=>{
        districtsLayer.resetStyle(layer);
      });
      if(p.hasTI){
        layer.on('click', (e)=>{
          // show district drawer
          const c=layer.getBounds().getCenter();
          openDrawer({district:p.DISTRICT, area_name:'TI district', type:'District with TI program', reliability:'medium', source:'UPSACS TI reports', source_url:'https://upsacs.up.gov.in', last_updated:'2024', notes:'Aggregated district coverage, not a venue pin.'}, c);
          map.flyTo(c, 8, {duration:1});
          L.DomEvent.stop(e);
        });
      }
    }
  }).addTo(map);
  districtsLayer.bringToBack();
});
