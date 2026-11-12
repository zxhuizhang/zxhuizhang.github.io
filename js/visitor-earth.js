(function () {
  'use strict';
  const canvas = document.querySelector('.visitor-earth');
  if (!canvas || !window.d3 || !window.topojson) return;
  const ctx = canvas.getContext('2d');
  const projection = d3.geoOrthographic().scale(122).translate([220, 140]).rotate([-105, -22]);
  const path = d3.geoPath(projection, ctx);
  function paint(land) {
    ctx.clearRect(0, 0, 440, 280);
    ctx.beginPath(); path({type: 'Sphere'}); ctx.fillStyle = '#d8eef4'; ctx.fill();
    ctx.beginPath(); path(d3.geoGraticule10()); ctx.strokeStyle = '#aacdd5'; ctx.lineWidth = 0.6; ctx.stroke();
    if (land) { ctx.beginPath(); path(land); ctx.fillStyle = '#428a78'; ctx.fill(); }
  }
  paint();
  fetch('/data/countries-110m.json').then(r => { if (!r.ok) throw Error('Map'); return r.json(); })
    .then(data => paint(topojson.feature(data, data.objects.land)))
    .catch(() => { canvas.title = 'Geographic basemap could not be loaded'; });
})();
