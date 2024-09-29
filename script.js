var watchID; // Variable to store the watch ID for geolocation
var geoLoc; // Variable to hold the geolocation object
var map; // Variable to hold the map object
var marker; // Variable for the user's marker on the map
const helpbutton = document.getElementById("help"); // Reference to the help button
const socket = io(); // Initialize socket.io for real-time communication
var danger = false; // Variable to track whether the user is in danger
const markers = {}; // Object to store markers for each connected client

function showLocation(position) {
    var latitude = position.coords.latitude; // Get latitude from the position object
    var longitude = position.coords.longitude; // Get longitude from the position object

    // Initialize the map only on the first location update
    if (!map) {
        // Create the map centered on the user's location
        map = L.map('map').setView([latitude, longitude], 13);

        // Set the tile layer for the map using OpenStreetMap
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Create a marker for the user's current location
        marker = L.marker([latitude, longitude]).addTo(map);

        // Set up event listeners for help and safe buttons
        helpbutton.addEventListener("click", getHelp);

        // Ensure that the safe button exists before adding an event listener
        const safeButton = document.getElementById("nullhelp");
        if (safeButton) {
            safeButton.addEventListener("click", removeDanger);
        }
    } else {
        // Update the user's marker position and pan the map
        marker.setLatLng([latitude, longitude]);
        map.panTo([latitude, longitude], 13);
    }

    // Emit the user's location along with the danger status to the server
    socket.emit('locationUpdate', { latitude, longitude, danger });
}

function getHelp() {
    if (marker) {
        // Bind a popup indicating the user is in danger and display it
        marker.bindPopup("I'm in Danger").openPopup();
        danger = true; // Set the danger status to true
        safe(); // Show the safe button

        // Emit the danger alert to the server with the user's location
        const userLocation = { latitude: marker.getLatLng().lat, longitude: marker.getLatLng().lng };
        socket.emit('dangerAlert', { ...userLocation, danger: true });
    }
}

function safe() {
    const safeButton = document.getElementById("nullhelp");
    if (safeButton) {
        safeButton.style.display = 'block'; // Show the safe button
    }
}

function removeDanger() {
    marker.closePopup(); // Close the danger popup
    danger = false; // Set the danger status to false

    // Emit a safe alert to the server
    const userLocation = { latitude: marker.getLatLng().lat, longitude: marker.getLatLng().lng };
    socket.emit('safeAlert', { ...userLocation, danger: false });

    const safeButton = document.getElementById("nullhelp");

    if (safeButton)
    {
        safeButton.style.display = 'none';
    }
}

function showBrowserNotification(message) {
    if (Notification.permission === "granted") {
        new Notification(message);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(message);
            }
        });
    }
}


// Listen for location updates from other users
socket.on('locationUpdate', (locationData) => {
    const clientId = locationData.clientId; // Assuming each client has a unique ID

    if (!markers[clientId]) {
        // Create a new marker for this client if it doesn't exist
        markers[clientId] = L.marker([locationData.latitude, locationData.longitude]).addTo(map);
    } else {
        // Update the existing marker's position
        markers[clientId].setLatLng([locationData.latitude, locationData.longitude]);
    }

    // Update the popup based on the danger status for this client
    if (locationData.danger) {
        markers[clientId].bindPopup("Friend in DANGER").openPopup();
        showBrowserNotification("Your friend is in DANGER.");
    } else {
        markers[clientId].bindPopup("User's Location").openPopup(); // Add a popup for visual feedback
    }
});

function errorHandler(err) {
    // Handle geolocation errors
    if (err.code === 1) {
        alert("Error: Access is denied!"); // User denied access
    } else if (err.code === 2) {
        alert("Error: Position is unavailable!"); // Position could not be determined
    }
}

function getLocationUpdate() {
    if (navigator.geolocation) {
        // Set options for geolocation
        var options = { timeout: 60000, enableHighAccuracy: true, maximumAge: 0 };
        geoLoc = navigator.geolocation;
        watchID = geoLoc.watchPosition(showLocation, errorHandler, options); // Start watching position
    } else {
        alert("Sorry, browser does not support geolocation!"); // Handle unsupported browsers
    }
}

// Function to check if browser notifications are supported and request permission
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Browser notifications enabled.");
            }
        });
    }
}


// Call this function once when the app starts
requestNotificationPermission();

// Start location updates when the window loads
window.onload = getLocationUpdate;
