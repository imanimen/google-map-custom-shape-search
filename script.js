var map;
var drawingManager;
var geocoder;
var polygonCoordinates = [];

// Callback function to initialize the map
function initMap() {
  // Set the center coordinates
  var center = { lat: -34.397, lng: 150.644 };
  
  // Create the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 8
  });

  // Create a DrawingManager object
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [google.maps.drawing.OverlayType.POLYGON]
    },
    polygonOptions: {
      editable: true
    }
  });

  // Set the map to the DrawingManager
  drawingManager.setMap(map);

  // Add an event listener for when the polygon is complete
  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
    if (event.type === google.maps.drawing.OverlayType.POLYGON) {
      var polygon = event.overlay;
      
      // Clear the previous polygon coordinates
      polygonCoordinates = [];

      // Get the coordinates of the polygon vertices
      var path = polygon.getPath();
      path.forEach(function(latLng) {
        polygonCoordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
        reverseGeocodeLatLng(latLng.lat(), latLng.lng());
      });

      // Disable drawing mode after the polygon is complete
      drawingManager.setDrawingMode(null);
      
      // Display the polygonCoordinates output
      var outputDiv = document.getElementById('output');
      outputDiv.innerHTML = JSON.stringify(polygonCoordinates, null, 2); // Format the JSON string with indentation
    }
  });
  
  // Create a geocoder object
  geocoder = new google.maps.Geocoder();
}

// Perform reverse geocoding to retrieve the city name and state
function reverseGeocodeLatLng(lat, lng) {
  var latLng = { lat: lat, lng: lng };
  geocoder.geocode({ location: latLng }, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        var city = '';
        var state = '';

        // Find the city and state components in the geocoding results
        results[0].address_components.forEach(function(component) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
        });

        // Display the city name and state on the map
        var infowindow = new google.maps.InfoWindow({
          content: city + ', ' + state
        });
        var marker = new google.maps.Marker({
          position: latLng,
          map: map
        });
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
      }
    } else {
      console.log('Geocoder failed due to: ' + status);
    }
  });
}

// Load the Google Maps JavaScript API
function loadGoogleMapsAPI() {
  var script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap&libraries=drawing';
  script.defer = true;
  document.head.appendChild(script);
}

// Call the function to load the API
loadGoogleMapsAPI();
