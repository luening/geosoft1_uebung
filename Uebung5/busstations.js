//classes-------------------------------------------------------------

/**
 * Creates new Busstations
 * @class
 */
class Busstation {
    /**
     * 
     * @param {*} id - explicit id for every busstation
     * @param {*} bez - name of busstation
     * @param {*} longitude - longitude coordinate
     * @param {*} latitude - latitude coordinate
     * @param {*} distance - distance to location of user
     * @param {*} visible - true if busstation is in polygon
     * @param {*} marker - marker of the busstation in leaflet
     */
    constructor(id, bez, longitude, latitude, distance) {
        this.id = id;
        this.bez = bez;
        this.longitude = longitude;
        this.latitude = latitude;
        this.distance = distance;
        this.visible = true;
        this.marker = null;
    }

}

//global Attributes

var busstationArray = new Array();


//functions----------------------------------------------------------------------------------------------------------
//---------load-data--------------------------------------------------------------------------------------------------

/**
 * determines the coordinates of the user
 */
function geolocationFunction() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        document.getElementById("resultlist").innerHTML = "Geolocation is not supported by this browser.";
    }
}



//---------process-data------------------------------------------------------------------------------------------------

/**
 * calculate the distance between location and PoIs in Münster
 * @param {geojson} location - Point from where the distance to the PoIs is being measured
 * @param {array} busstations - Busstation objects
 */
distance = (location) => {
    const lon1 = location.geometry.coordinates[0];
    const lat1 = location.geometry.coordinates[1];
    for (let i = 0; i < busstationArray.length; i++) {
        const lon2 = busstationArray[i].longitude;
        const lat2 = busstationArray[i].latitude;

        const R = 6371e3; // metres
        const phi1 = lat1 * Math.PI / 180; // φ, λ in radians
        const phi2 = lat2 * Math.PI / 180;
        const deltaphi = (lat2 - lat1) * Math.PI / 180;
        const deltalambda = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(deltaphi / 2) * Math.sin(deltaphi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltalambda / 2) * Math.sin(deltalambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c; // metres
        const e = (Math.round((d * 100)) / 100);
        busstationArray[i].distance = e;
    }
}

/**
 * Generates busstation-objects from @class busstations out of busstations (JSON).
 * @param {*} res - busstations in Münster (JSON)
 */
function generateBusstations(res) {
    for (let p = 0; p < res.length; p++) {
        busstationArray[p] = new Busstation(res[p].properties.nr, res[p].properties.lbez, res[p].geometry.coordinates[0], res[p].geometry.coordinates[1], 0);
    }
}

/**
 * checks if busstations are in the polygon
 * if yes, set the visibility to true, otherwise to false
 * if no polygon is handed over, set all to true
 * @param {*} polygon 
 */
function busstationsInPolygon(polygon) {
    if (polygon != null) {
        var turfPolygon = turf.polygon(polygon.features[0].geometry.coordinates);
        busstationArray.forEach(element => {
            if (turf.booleanPointInPolygon([element.longitude, element.latitude], turfPolygon)) {
                element.visible = true;
            } else {
                element.visible = false;
            }
        })
    }else{
        busstationArray.forEach(element => {
            element.visible = true;
        })
    }
}

//---------output-data--------------------------------------------------------------------------------------------------

/**
 * shows the results on the website
 * @param {geojson} position 
 */
function showPosition(position) {
    //convert position to an useable geojson schema 
    let point =
    {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Point",
            "coordinates": [position.coords.longitude, position.coords.latitude]
        }
    }
    let pointString = JSON.stringify(point)
    document.getElementById("textfield").value = pointString;
    var marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(map);
    marker.bindPopup("Eigener Standort").openPopup();
}

/**
 * 
 */
function markBusstations() {
    busstationArray.forEach(element => {
        if (element.visible == true) {
            element.marker = L.marker([element.latitude, element.longitude]).addTo(map);
            element.marker.bindPopup(element.bez + " ist<br>" + element.distance + " m entfernt.");
        } else {
            map.removeLayer(element.marker)
        }
    });
}





//execute-------------------------------------------------------------------------------------------------------------
//tags
const title = document.createElement("title");
title.innerHTML = "Geosoftware 1 Übung";
document.head.appendChild(title);

const author = document.createElement("author");
author.innerHTML = "Hendrik Lüning";
document.head.appendChild(author);



// Leaflet
var map = L.map('map').setView([51.96, 7.62], 13);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// draw Control
var drawControlEditTrue = new L.Control.Draw({
    draw: {
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false
    },
    edit: {
        edit: false,
        remove: true,
        featureGroup: drawnItems
    }
});
map.addControl(drawControlEditTrue);

var drawControlEditFalse = new L.Control.Draw({
    draw: false,
    edit: {
        edit: false,
        remove: true,
        featureGroup: drawnItems
    }
});

// draw Event
map.on(L.Draw.Event.CREATED, function (e) {
    var layer = e.layer;
    drawnItems.addLayer(layer);
    var draws = drawnItems.toGeoJSON();
    map.removeControl(drawControlEditTrue);
    map.addControl(drawControlEditFalse);
    busstationsInPolygon(draws);
    markBusstations();
})


map.on('draw:deleted', function (e) {
    map.removeControl(drawControlEditFalse);
    map.addControl(drawControlEditTrue);
    var layer = e.layer;
    busstationsInPolygon(layer);
    markBusstations();
});

// LocationButton
let locationB = document.getElementById("LocationButton");
locationB.addEventListener("click", function () {
    geolocationFunction();
})

//busstations
let calculateB = document.getElementById("BusstationButton");
calculateB.addEventListener("click", function () {
    let point = JSON.parse(document.getElementById("textfield").value);
    fetch("https://rest.busradar.conterra.de/prod/haltestellen")
        .then(response => response.json())
        .then(data => {
            const busstationArray = generateBusstations(data.features);
            const busstationsDistance = distance(point, busstationArray);
            markBusstations(busstationsDistance);
        })
})






