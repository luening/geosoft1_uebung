//functions-------------------------------------------------------------

/**
 * calculate the distance between location and PoIs in Münster
 * @param {geojson} location - Point from where the distance to the PoIs is being measured
 * @param {geojson} poi - Point of Interests in Münster
 * @returns {array} Distances between location and PoIs in metres
 */
distance = (location, busstations) => {
    const lon1 = location.coordinates[0];
    const lat1 = location.coordinates[1];
    const results = [];
    for (let i = 0; i < busstations.length; i++) {
        const lon2 = busstations[i].longitude;
        const lat2 = busstations[i].latitude;

        const R = 6371e3; // metres
        const phi1 = lat1 * Math.PI / 180; // φ, λ in radians
        const phi2 = lat2 * Math.PI / 180;
        const deltaphi = (lat2 - lat1) * Math.PI / 180;
        const deltalambda = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(deltaphi / 2) * Math.sin(deltaphi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltalambda / 2) * Math.sin(deltalambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c; // metres
        const e = (Math.round((d*100))/100);
        results.push([e, busstations[i].bez, busstations[i].id]);
    }
    results.sort(function (a, b) { return a[0] - b[0] }); //list sort 
    return results;
}

/**
 * Outputs the calculate distances in a list
 * @param {array} a - array of distances
 */
output = a => {
    var resultstring = "";
    for (let i = 0; i < a.length; i++) {
        resultstring += "<li>" + a[i][0] + "m bis zu " + a[i][1] + "</li>";
    }
    document.getElementById("resultlist").innerHTML = resultstring;
}

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

/**
 * shows the results on the website
 * @param {geojson} position 
 */
function showPosition(position) {
    //convert position to an useable geojson schema 
    let point =
    {
        "type": "Point",
        "coordinates": [position.coords.longitude, position.coords.latitude]
    }
    let pointString = JSON.stringify(point)
    document.getElementById("textfield").value = pointString;
}

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
     */
    constructor(id, bez, longitude, latitude) {
        this.id = id;
        this.bez = bez;
        this.longitude = longitude;
        this.latitude = latitude;
    }
}

/**
 * Generates busstation-objects from @class busstations out of busstations (JSON).
 * @param {*} res - busstations in Münster (JSON)
 * @returns - Array mit Busstations-Objekte
 */
function generateBusstations(res){
    const bussta = new Array(res.length);
    for(let p=0;p<res.length;p++){
        bussta[p] = new Busstation(res[p].properties.nr,res[p].properties.lbez,res[p].geometry.coordinates[0],res[p].geometry.coordinates[1]);
    }
    return bussta;
}

/**
 * Gets departures within 5 minutes from the nearest busstation.
 * @param {*} a - id of the nearest busstation
 */
function departures(a){
    let xhttp1 = new XMLHttpRequest();
    xhttp1.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let res = JSON.parse(this.responseText);
            console.log(res);
            if(res == ""){
                document.getElementById("departures").innerHTML = "Kein Bus in den nächsten 5 Minuten.";  
            }else{
                var resultstring = "";
                for(let i = 0;i<res.length;i++){
                    resultstring += "<li>Linie: " + res[i].linienid + " Richtung: " + res[i].richtungstext + " Ankunftszeit: " + res[i].abfahrtszeit + "</li>";
                }
                document.getElementById("departures").innerHTML = resultstring; ;
            }
        }
    }
    xhttp1.open("GET", "https://rest.busradar.conterra.de/prod/haltestellen/"+a+"/abfahrten?sekunden=300", true);
    xhttp1.send();
}





//execute-------------------------------------------------------------------
//tags
const title = document.createElement("title");
title.innerHTML = "Geosoftware 1 Übung";
document.head.appendChild(title);

const author = document.createElement("author");
author.innerHTML = "Hendrik Lüning";
document.head.appendChild(author);


// LocationButton
let locationB = document.getElementById("LocationButton");
locationB.addEventListener("click", function () {
    geolocationFunction();
})


// CalculateButton
let calculateB = document.getElementById("BusstationButton");
calculateB.addEventListener("click", function () {
    //point
    let text = document.getElementById("textfield").value; //select the text from textarea
    if (text != "") { // examine if text is not empty
        let point = JSON.parse(text);

        //busstations
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let res = JSON.parse(this.responseText);
                const BusstationArray = generateBusstations(res.features);
                const distances = distance(point, BusstationArray);
                console.log(distances[0][2])
                departures(distances[0][2]);
                output(distances);
                
            }
        }
        xhttp.open("GET", "https://rest.busradar.conterra.de/prod/haltestellen", true);
        xhttp.send();
    }

})