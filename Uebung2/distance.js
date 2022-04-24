


//functions-------------------------------------------------------------

/**
 * 
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
    //list sort 
    results.sort(function(a, b){return a - b});
    return results;
}

/**
 * 
 */
output = a => 
{
    var resultstring = "";
    for(let i=0; i<a.length; i++) {
        resultstring += "<li>"+a[i]+"</li>";
    }
    document.getElementById("resultlist").innerHTML = resultstring;
}



//execute--------------------------------------------------------------
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

document.getElementById("LocationButton").onclick = function() {myFunction()};

function myFunction() {
    console.log(1);
    var x = document.getElementById("demo");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
        let point = [position.coords.longitude,position.coords.latitude];
        console.log(point);
        let distancePoints = distance(point, poi);
        output(distancePoints);
    } else { 
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
    
}

//showPosition muss als Funktion deklariert werden
