'use client';
import React, { useEffect, useState } from "react";

export default function Emergency() {
  // Your Google Maps API key

  const [currentLocation, setCurrentLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [locationError, setLocationError] = useState(null);

  // Function to request the device's location.
  const requestLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError(
            "Unable to retrieve your location. Please allow location access."
          );
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  // Request location on component mount.
  useEffect(() => {
    requestLocation();
  }, []);

  // Helper function to dynamically load the Google Maps JavaScript API.
  const loadGoogleMapsScript = (callback) => {
    if (window.google && window.google.maps) {
      callback();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = callback;
    document.body.appendChild(script);
  };

  // When the current location is available, load Google Maps and search for nearby hospitals.
  useEffect(() => {
    if (currentLocation) {
      loadGoogleMapsScript(() => {
        const location = new window.google.maps.LatLng(
          currentLocation.lat,
          currentLocation.lng
        );
        // Create a PlacesService instance (using a dummy div as the container).
        const service = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );
        const request = {
          location: location,
          rankBy: window.google.maps.places.RankBy.DISTANCE,
          type: "hospital",
          keyword: "nearby reputed hospitals with emergency provision" // Only return hospitals that can handle pregnancy cases.
        };

        // Perform a nearby search.
        service.nearbySearch(request, (results, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results
          ) {
            setHospitals(results);
          }
        });
      });
    }
  }, [currentLocation]);

  // Generate a clickable Google Maps link using the hospital's place_id.
  const generateMapLink = (placeId) =>
    `https://www.google.com/maps/search/?api=1&query_place_id=${placeId}`;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Emergency Alert */}
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                If you are experiencing a medical emergency, call emergency
                services immediately
              </h3>
            </div>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-12">
          Emergency Support
        </h1>

        <div className="grid gap-8">
          {/* Emergency Numbers Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">
              Emergency Numbers
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Emergency Services</h3>
                <a href="tel:102" className="text-2xl text-red-600">102</a>
              </div>
              <div>
                <h3 className="font-medium">
                  24/7 Pregnancy Support Hotline
                </h3>
                <a href="tel:0444-631-4300" className="text-2xl text-red-600">0444-631-4300</a>
              </div>
            </div>
          </div>

          {/* Warning Signs Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Warning Signs</h2>
            <ul className="list-disc list-inside space-y-2 dark:text-gray-300">
              <li>Severe abdominal pain</li>
              <li>Heavy vaginal bleeding</li>
              <li>Severe headache that won't go away</li>
              <li>Decreased or no fetal movement</li>
              <li>Water breaking before 37 weeks</li>
              <li>High fever</li>
              <li>Severe swelling in face or hands</li>
              <li>Trouble breathing</li>
            </ul>
          </div>

          {/* Nearest Hospitals Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">
              Nearest Hospitals
            </h2>
            <div className="space-y-4">
              {locationError && (
                <div>
                  <p className="text-red-500">{locationError}</p>
                  <button
                    onClick={requestLocation}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Allow Location Access
                  </button>
                </div>
              )}
              {!locationError && !currentLocation && (
                <p>Loading your location...</p>
              )}
              {!locationError &&
                currentLocation &&
                hospitals.length === 0 && (
                  <p>Loading nearby hospitals...</p>
                )}
              {hospitals.slice(0, 6).map((hospital, index) => (
                <a
                  key={index}
                  href={generateMapLink(hospital.place_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-50 dark:hover:bg-slate-700 p-4 rounded transition-colors"
                >
                  <h3 className="font-medium">{hospital.name}</h3>
                  <p className="dark:text-gray-300">{hospital.vicinity}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
