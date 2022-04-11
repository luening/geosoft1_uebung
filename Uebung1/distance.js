

const lat1 = point[0];
const lon1 = point[1];

const results = [];

for(let i = 0; i < cities.length; i++){
    const lat2 = cities[i][0];
    const lon2 = cities[i][1];

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

results.sort(function(a, b){return a - b});

for(let i = 0; i < results.length; i++){
    document.getElementById("resultlist"+i).innerHTML = results[i];
}

