var watchID;
var geoLoc;
var map;
var marker;

function showLocation(position){
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    //alert("Latitude : " + latitude + " Longitude: " + longitude);

    if (!map)
    {
        map = L.map('map').setView([latitude, longitude], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        
        marker = L.marker([latitude, longitude]).addTo(map);
    }
    else 
    {
        marker.setLatLng([latitude, longitude]);
        map.panTo([latitude, longitude], 13);
    }
}

function errorHandler(err) {
    if(err.code == 1) {
       alert("Error: Access is denied!");
    } else if( err.code == 2) {
       alert("Error: Position is unavailable!");
    }
 }

function getLocationUpdate(){
            
    if (navigator.geolocation){
       
       // timeout at 60000 milliseconds (60 seconds)
       var options = {timeout:60000, enableHighAccuracy: true, maximumAge:0};
       geoLoc = navigator.geolocation;
       watchID = geoLoc.watchPosition(showLocation, errorHandler, options);
    } else {
       alert("Sorry, browser does not support geolocation!");
    }
 }

window.onload = getLocationUpdate;