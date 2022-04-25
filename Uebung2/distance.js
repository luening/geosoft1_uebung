//functions-------------------------------------------------------------

/**
 * calculate the distance between location and PoIs in Münster
 * @param {geojson} location - Point from where the distance to the PoIs is being measured
 * @param {geojson} poi - Point of Interests in Münster
 * @returns {array} Distances between location and PoIs in metres
 */
distance = (location, poi) =>
{
    const lon1 = location.coordinates[0];
    const lat1 = location.coordinates[1];
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
        results.push(d);
    }
    results.sort(function(a, b){return a - b}); //list sort 
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
        resultstring += "<li>"+a[i]+"</li>";
    }
    document.getElementById("resultlist").innerHTML = resultstring;
}

/**
 * Locates position of the user
 */
function geolocationFunction() {
    //uploadfield reset
    let uploadfield = document.getElementById("uploadfield");
    uploadfield.value = uploadfield.defaultValue;
    //geolocation
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
    //calcualte distances
    let distancePoints = distance(point, poi);
    output(distancePoints);
}



//execute--------------------------------------------------------------
document.getElementById("title").innerHTML = "Geosoftware 1 Übung"
let uploadfield = document.getElementById("uploadfield");

uploadfield.addEventListener('change', function(){

    // if a file was selected
    if (uploadfield.files.length > 0) 
    {
    var reader = new FileReader() // File reader to read the file 

    reader.readAsText(uploadfield.files[0]); // read the uploaded file
    
    // event listener, if the reader has read the file
    reader.addEventListener('load', function() {
        
        var result = JSON.parse(reader.result) // parse the result into a JSON object (no error checking at this point) 
        let distancePoints = distance(result, poi);
        output(distancePoints);
    })
    }  

})

// execute geolocationFunction if button is clicked
document.getElementById("LocationButton").onclick = function() {geolocationFunction()};



  