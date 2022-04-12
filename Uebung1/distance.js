
// point
const lon1 = point[0];
const lat1 = point[1];

// result
const results = [];

// calculation of the distance between point and each city
for(let i = 0; i < cities.length; i++){
    const lon2 = cities[i][0];
    const lat2 = cities[i][1];
    
    const R = 6371e3; // metres
    const phi1 = lat1 * Math.PI/180; // φ, λ in radians
    const phi2 = lat2 * Math.PI/180;
    const deltaphi = (lat2-lat1) * Math.PI/180;
    const deltalambda = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(deltaphi/2) * Math.sin(deltaphi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltalambda/2) * Math.sin(deltalambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    results.push(d);
}

//list sort 
results.sort(function(a, b){return a - b});


// return of the result
var resultstring = "";
for(let i=0; i<results.length; i++) {
    resultstring += "<li>"+results[i]+"</li>";
}
document.getElementById("resultlist").innerHTML = resultstring;