//functions-------------------------------------------------------------

/**
 * calculate the distance between location and PoIs in Münster
 * @param {geojson} location - Point from where the distance to the PoIs is being measured
 * @param {geojson} poi - Point of Interests in Münster
 * @returns {array} Distances between location and PoIs in metres
 */
 distance = (location, poi) =>
 {
     const lon1 = location.geometry.coordinates[0];
     const lat1 = location.geometry.coordinates[1];
     const results = [];
     for(let i = 0; i < poi.features.length; i++){
         const lon2 = poi.features[i].geometry.coordinates[0];
         const lat2 = poi.features[i].geometry.coordinates[1];
     
         const R = 6371e3; // metres
         const phi1 = lat1 * Math.PI/180; // φ, λ in radians
         const phi2 = lat2 * Math.PI/180;
         const deltaphi = (lat2-lat1) * Math.PI/180;
         const deltalambda = (lon2-lon1) * Math.PI/180;
 
         const a = Math.sin(deltaphi/2) * Math.sin(deltaphi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltalambda/2) * Math.sin(deltalambda/2);
         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
 
         const d = R * c; // metres
         const e = (Math.round((d*100))/100);
         results.push([e,poi.features[i].properties.name]);
     }
     results.sort(function(a, b){return a[0] - b[0]}); //list sort 
     return results;
 }
 
 /**
  * Outputs the calculate distances in a list
  * @param {array} a - array of distances
  */
 output = a => 
 {
     var resultstring = "";
     for(let i=0; i<a.length; i++) {
         resultstring += "<li>"+a[i][0]+"m bis zum " + a[i][1] +"</li>";
     }
     document.getElementById("resultlist").innerHTML = resultstring;
 }
 
 /**
  * determines the coordinates of the user
  */
function geolocationFunction(){
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
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Point",
            "coordinates": [position.coords.longitude, position.coords.latitude]
        }
    }
     let pointString = JSON.stringify(point)
     document.getElementById("textfield").value = pointString;
 }
 
 //execute-------------------------------------------------------------------
 //tags
 const title = document.createElement("title");
 title.innerHTML = "Geosoftware 1 Übung";
 document.head.appendChild(title);

 const author = document.createElement("author");
 author.innerHTML = "Hendrik Lüning";
 document.head.appendChild(author);
 

// CalculateButton
 let calculateB = document.getElementById("CalculateButton");
 calculateB.addEventListener("click", function(){
     let text = document.getElementById("textfield").value; //select the text from textarea
     if(text!=""){ // examine if text is not empty
         let point = JSON.parse(text);
         let distancesPoints = distance(point,poi);
         output(distancesPoints);
     }
 })

 // LocationButton
 let locationB = document.getElementById("LocationButton");
 locationB.addEventListener("click", function(){
     geolocationFunction();
 })