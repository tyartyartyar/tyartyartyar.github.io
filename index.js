"use strict";

const year = new Date().getFullYear();

/*** General Leaflet Code ***/
// Create map and center around Pittsburgh, PA
const map = L.map("map", {
  center: [-7.195984, 107.726562],
  zoom: 17,
});

// Add Open Street Map as base map
const osm = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
  attribution: `Map data ©${year} <a href="https://www.google.com/maps">Google</a>`,
}).addTo(map);

// Spinner Opts
var SpinnerOpts = {
  lines: 20, // The number of lines to draw
  length: 12, // The length of each line
  width: 12, // The line thickness
  radius: 17, // The radius of the inner circle
  scale: 0.5, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  speed: 1.5, // Rounds per second
  rotate: 0, // The rotation offset
  animation: "spinner-line-shrink", // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: "#ffffff", // CSS color or array of colors
  fadeColor: "transparent", // CSS color or array of colors
  zIndex: 2000000000, // The z-index (defaults to 2e9)
  className: "spinner", // The CSS class to assign to the spinner
  position: "absolute", // Element positioning
};

/*** Code for adding GeoJSON ***/
// Allegheny County School Districts GeoJSON file
// Alleghency County, PA, Open GIS Data Site: https://openac-alcogis.opendata.arcgis.com/
const geoJsonUrl = "shp_kk2.geojson";

// Change to this url to test error function
// const geoJsonUrl = 'https://opendata.arcgis.com/datasets/f5ac385118344bbf8f707cd88ba31a45_0zzb3451.geojson';

// Placeholder for layer. Required to test if layer is added to map or not.
let schoolDistricts;

// HTML element to display error message
const errMsgSpan = $("#errorMsg");

/*** Add layer using Vanilla JS (Fetch API) ***/
const addDataFetch = () => {
  map.spin(true, SpinnerOpts);
  fetch(geoJsonUrl)
    .then((response) => {
      return response.json();
    })
    .then(function (data) {
      if (!mapHasLayer()) {
        // create a GeoJSON layer
        createSchoolDistrictsLayer(data);
        map.spin(false);
      }
      map.spin(false);
    })
    .catch((error) => {
      map.spin(false);
      errMsgSpan.text(`Request Failed: ${error.message}`);
      errMsgSpan.show();
    });
};

/*** Add layer using jQuery $.getJSON() method
See https://api.jquery.com/jquery.getjson/
1. Check to make sure layer is not already added to map.
2. Call $.getJSON method, passing in url for geoJSON data
3. Call function that creates Leaflet geoJSON layer and adds it to map
4. A function for the fail event is created to handle errors with the request
*******************************************************************************/

const myStyle = (feature) => {
  const defaultStyle = {
    weight: 0,
    opacity: 2,
    color: "white",
    fillOpacity: 0.3,
  };

  switch (feature.properties.Fungsi_kk) {
    case "CA":
      return { ...defaultStyle, fillColor: "#ffa500" };
    case "SM":
      return { ...defaultStyle, fillColor: "#ffff00" };
    case "TB":
      return { ...defaultStyle, fillColor: "#a52a2a" };
    case "TN":
      return { ...defaultStyle, fillColor: "#ff0000" };
    case "TWA":
      return { ...defaultStyle, fillColor: "#00f" };
    case "KSA/KPA":
      return { ...defaultStyle, fillColor: "#800080" };
    case "Tahura":
      return { ...defaultStyle, fillColor: "#808080" };
    default:
      return { ...defaultStyle, fillColor: "#808080" };
  }

};

const highlightFeature = (e) => {
  var layer = e.target;

  layer.setStyle({
    weight: 1,
    color: "#ffffff",
    dashArray: "",
    fillOpacity: 0.3,
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
};

const resetHighlight = (e) => {
  schoolDistricts.resetStyle(e.target);
};

/*** Helper Functions ***/
// create GeoJSON layer, style, add popup, and add to map
const createSchoolDistrictsLayer = (data) => {
  // see http://leafletjs.com/reference.html#geojson
  schoolDistricts = L.geoJson(data, {
    // symbolize features
    style: myStyle,
    onEachFeature: function (feature, layer) {
      var name = feature.properties.NAME;
      var popupContent = L.Util.template(
        `<h2 class='map-popup'>Kawasan Konservasi</h2>
        <br>
        <table>
            <tr>
                <td><strong>Nama KK</strong></td>
                <td>:</td>
                <td>{Nama_kk}</td>
            </tr>
            <tr>
                <td><strong>Fungsi KK</strong></td>
                <td>:</td>
                <td>{Fungsi_kk}</td>
            </tr>
            <tr>
                <td><strong>Pengelola</strong></td>
                <td>:</td>
                <td>{Satker}</td>
            </tr>
        </table>
        `,
        feature.properties
      );
      // add a popup to each feature
      layer.bindPopup(popupContent, {
        closeOnClick: true,
      });
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
      });
    },
  }).addTo(map); // add layer to map
};

// Test if map has layer
const mapHasLayer = () => {
  if (map.hasLayer(schoolDistricts)) {
    return true;
  } else {
    return false;
  }
};

// Remove layer from map
const removeLayerFromMap = () => {
  // if layer is on map, remove the layer
  if (mapHasLayer()) {
    map.removeLayer(schoolDistricts);
  }
};

const coord3857To4326 = (coord) => {
    
  const e_value = 2.7182818284;
  const X = 20037508.34;
  
  const lat3857 = coord[1]
  const long3857 = coord[0];
  
  //converting the longitute from epsg 3857 to 4326
  const long4326 = (long3857*180)/X;
  
  //converting the latitude from epsg 3857 to 4326 split in multiple lines for readability        
  let lat4326 = lat3857/(X / 180);
  const exponent = (Math.PI / 180) * lat4326;
  
  lat4326 = Math.atan(Math.pow(e_value, exponent));
  lat4326 = lat4326 / (Math.PI / 360); // Here is the fixed line
  lat4326 = lat4326 - 90;

  if(isNaN(lat4326) || isNaN(long4326)) {
    console.error("🚀 ~ parameter error coord3857To4326");
  }

  return [long4326, lat4326];
  
}

/*** Event Handlers ***/
// Add layer with XMLHttpRequest()
// tied to <a id="addVanillaJS">
var addVanillaJS = document.getElementById("addVanillaJS");
addVanillaJS.addEventListener("click", addDataFetch);

const loadGetaciLayer = () => {
  map.spin(true, SpinnerOpts);
  fetch("jbh_2023.geojson")
    .then(response => {
      return response.json()
    }).then(data => {
      data.features.forEach(e => { 
        e.geometry.coordinates = e.geometry.coordinates.map(f => coord3857To4326(f));
      });

      map.panTo(new L.LatLng(-6.948416, 107.722791));
      map.setZoom(10);
      L.geoJson(data).addTo(map);
      map.spin(false);
    }).catch(error => {
      console.error("🚀 ~ error:", error)
      map.spin(false);
    })
}

// Load Getaci Map
document.getElementById("load-getaci-layer").addEventListener("click", loadGetaciLayer);

// Remove layer from map
// tied to <a id="removeLayer">
$("#removeLayer").click(function () {
  removeLayerFromMap();
  errMsgSpan.hide();
});
