import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// UP bounds - zoomed to UP only
const UP_BOUNDS = [[23.8, 77.5], [30.8, 84.7]];

const map = L.map('map', {
  zoomSnap: 0.5,
  maxBounds: [[22.5,76],[32,86]],
  maxBoundsViscosity: 0.7
}).fitBounds(UP_BOUNDS);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 18
}).addTo(map);

// Red pointer icon
const redIcon = L.divIcon({
  className: 'custom-pin',
  html: '<div style="width:16px;height:16px;background:#d93025;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>',
  iconSize: [16,16],
  iconAnchor: [8,8]
});

function popupHtml(p){
  return `
    <div style="min-width:220px">
      <b>${p.district} — ${p.area_name}</b><br/>
      <span style="font-size:12px;color:#555">${p.type}</span><br/>
      <div style="margin:6px 0;font-size:12px">Source: <a href="${p.source_url}" target="_blank" rel="noopener">${p.source}</a></div>
      <div style="font-size:11px;color:#666">Reliability: <b>${p.reliability}</b> • Updated: ${p.last_updated}</div>
      <div style="font-size:11px;margin-top:6px;color:#444">${p.notes||''}</div>
    </div>
  `;
}

// Load verified points (district centroids only)
fetch('/data/up-points.geojson')
  .then(r=>r.json())
  .then(data=>{
    L.geoJSON(data, {
      pointToLayer: (f, latlng) => L.marker(latlng, {icon: redIcon}),
      onEachFeature: (f, layer) => {
        layer.bindTooltip(`${f.properties.district} — ${f.properties.area_name}`, {direction:'top', offset:[0,-8]});
        layer.bindPopup(popupHtml(f.properties), {maxWidth: 320});
      }
    }).addTo(map);
  });

// Load UP districts - shade TI districts (if hasTI)
fetch('/data/up-districts.geojson')
  .then(r=> r.ok ? r.json() : null)
  .then(data=>{
    if(!data) return;
    L.geoJSON(data, {
      style: f => {
        const hasTI = f.properties.hasTI;
        return {
          color: hasTI ? '#ff9800' : '#999',
          weight: hasTI ? 1.5 : 0.7,
          fillColor: hasTI ? '#ff9800' : '#e0e0e0',
          fillOpacity: hasTI ? 0.18 : 0.04
        };
      },
      onEachFeature: (f, layer)=>{
        const p = f.properties;
        layer.bindTooltip(`${p.DISTRICT||p.district||p.name} ${p.hasTI?'(TI district)':''}`, {sticky:true});
        if(p.hasTI){
          layer.bindPopup(`<b>${p.DISTRICT||p.district}</b><br/><span style="font-size:12px">UPSACS TI district (aggregated) - NGO coverage reported. Not a venue pin.</span><br/><span style="font-size:11px;color:#666">Source: UPSACS TI reports • ${p.source||''}</span>`);
        }
      }
    }).addTo(map);
  });
