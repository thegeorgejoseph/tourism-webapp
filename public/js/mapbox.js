/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoidGhlZ2Vvcmdlam9zZXBoIiwiYSI6ImNrcnQ2NHIwNDJoMXYyd25vMnRkbmV3dWkifQ.d89xwMPvAeBs-24rXb4NXw';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/thegeorgejoseph/ckrt6kh4ba8x117qrofvhz2je',
  center: [-118.113491, 34.111745],
  zoom: 6,
  interactive: false,
});

// const bounds = new mapboxgl.LngLatBounds();

// locations.forEach((loc) => {
//   const el = document.createElement('div');
//   el.className = 'marker';

//   new mapboxgl.Marker({
//     element: el,
//     anchor: 'bottom',
//   })
//     .setLngLat(loc.coordinates)
//     .addTo(map);

//   bounds.extend(loc.coordinates);
// });

// map.fitBounds(bounds, {
//   padding: {
//     top: 200,
//     bottom: 200,
//     left: 100,
//     right: 100,
//   },
// });
