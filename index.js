"use strict";

/*** General Leaflet Code ***/
// Create map and center around Pittsburgh, PA
const map = L.map("map", {
  center: [-7.195984, 107.726562],
  zoom: 17
});

// Add Open Street Map as base map
const osm = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a>'
}).addTo(map);

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
  fetch(geoJsonUrl)
  .then((response) => {
    console.log(response);
    return response.json() })
  .then(function(data) {
     if (!mapHasLayer()) {
      // create a GeoJSON layer
      createSchoolDistrictsLayer(data);
    }
  })
  .catch(error => {
    errMsgSpan.text(`Request Failed: ${error.message}`);
    errMsgSpan.show();
  })
}

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

  if ("CA" == feature.properties.Fungsi_kk) {
    return { ...defaultStyle, fillColor: "#ffa500" };
  }
  if ("SM" == feature.properties.Fungsi_kk) {
    return { ...defaultStyle, fillColor: "#ffff00" };
  }
  if ("TB" == feature.properties.Fungsi_kk) {
    return { ...defaultStyle, fillColor: "#a52a2a" };
  }
  if ("TN" == feature.properties.Fungsi_kk) {
    return { ...defaultStyle, fillColor: "#ff0000" };
  }
  if ("TWA" == feature.properties.Fungsi_kk) {
    return { ...defaultStyle, fillColor: "#00f" };
  }
  if ("KSA/KPA" == feature.properties.Fungsi_kk) {
    return { ...defaultStyle, fillColor: "#800080" };
  }
  if ("Tahura" == feature.properties.Fungsi_kk) {
    return { ...defaultStyle, fillColor: "#808080" };
  }
}

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
}

const resetHighlight = (e) => {
  schoolDistricts.resetStyle(e.target);
}

const addDataJQuery = () => {
  if (!mapHasLayer()) {
    const getLayerJQuery = $.getJSON(geoJsonUrl, function (data) {
      // create a GeoJSON layer
      createSchoolDistrictsLayer(data);
    }); // end getLayerJQuery()

    // If there is an error making the request, write the error out in the <span id="#errorMsg"> element
    getLayerJQuery.fail(function (jqxhr, textStatus, error) {
      const err = `${textStatus}, ${error} (${jqxhr.status})`;
      errMsgSpan.text(`Request Failed: ${err}`);
      errMsgSpan.show();
    }); // end getLayerJQuery().fail()
  } // end if (!mapHasLayer())
} // end addDataJQuery()

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
        closeOnClick: true
      });
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
      });
    }
  }).addTo(map); // add layer to map
}

// Test if map has layer
const mapHasLayer = () => {
  if (map.hasLayer(schoolDistricts)) {
    return true;
  } else {
    return false;
  }
}

// Remove layer from map
const removeLayerFromMap = () => {
  // if layer is on map, remove the layer
  if (mapHasLayer()) {
    map.removeLayer(schoolDistricts);
  }
}

/*** Event Handlers ***/
// Add layer with $.getJSON()
// tied to <a id="addJQ">
$("#addJQ").click(function () {
  addDataJQuery();
});

// Add layer with XMLHttpRequest()
// tied to <a id="addVanillaJS">
var addVanillaJS = document.getElementById("addVanillaJS");
addVanillaJS.addEventListener("click", addDataFetch);

// Remove layer from map
// tied to <a id="removeLayer">
$("#removeLayer").click(function () {
  removeLayerFromMap();
  errMsgSpan.hide();
});