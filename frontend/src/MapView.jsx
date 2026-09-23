import { useEffect } from 'react'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet'

import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

// Kochi default location
const kochiCenter = [10.0159, 76.3419]


// =====================================================
// USER LOCATION ICON
// =====================================================

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',

  html: `
    <div class="user-location-wrapper">
      <div class="user-location-pulse"></div>

      <div class="user-location-dot">
        <div class="user-location-inner"></div>
      </div>

      <div class="user-location-label">
        You are here
      </div>
    </div>
  `,

  iconSize: [30, 30],
  iconAnchor: [15, 15],
})


// =====================================================
// SEARCH LOCATION ICON
// =====================================================

const searchLocationIcon = L.divIcon({
  className: 'search-location-marker',

  html: `
    <div class="search-location-wrapper">

      <div class="search-location-pin">
        <div class="search-location-pin-inner"></div>
      </div>

      <div class="search-location-label">
        Searched location
      </div>

    </div>
  `,

  iconSize: [34, 34],
  iconAnchor: [17, 17],
})


// =====================================================
// MAP LOCATION CONTROLLER
// =====================================================

function LocationController({
  userLocation,
  searchLocation,
}) {

  const map = useMap()


  // ---------------------------------------------------
  // MOVE TO SEARCHED LOCATION
  // ---------------------------------------------------

  useEffect(() => {

    if (!searchLocation) {
      return
    }

    map.flyTo(
      [
        searchLocation.latitude,
        searchLocation.longitude,
      ],
      15,
      {
        duration: 1.5,
      }
    )

  }, [searchLocation, map])


  // ---------------------------------------------------
  // MOVE TO USER LOCATION
  // ---------------------------------------------------

  useEffect(() => {

    if (!userLocation || searchLocation) {
      return
    }

    map.flyTo(
      [
        userLocation.latitude,
        userLocation.longitude,
      ],
      15,
      {
        duration: 1.5,
      }
    )

  }, [userLocation, searchLocation, map])


  return null
}


// =====================================================
// MAP VIEW
// =====================================================

function MapView({
  userLocation,
  searchLocation,
  facilities = [],
}) {

  return (

    <MapContainer

      center={kochiCenter}

      zoom={12}

      scrollWheelZoom={true}

      style={{
        height: '500px',
        width: '100%',
      }}

    >

      {/* =================================================
          OPENSTREETMAP
      ================================================= */}

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      {/* =================================================
          MAP MOVEMENT
      ================================================= */}

      <LocationController
        userLocation={userLocation}
        searchLocation={searchLocation}
      />


      {/* =================================================
          USER LOCATION
      ================================================= */}

      {userLocation && (

        <>

          <Circle

            center={[
              userLocation.latitude,
              userLocation.longitude,
            ]}

            radius={150}

            pathOptions={{
              color: '#1677ff',
              fillColor: '#1677ff',
              fillOpacity: 0.12,
              weight: 2,
            }}

          />

          <Marker

            position={[
              userLocation.latitude,
              userLocation.longitude,
            ]}

            icon={userLocationIcon}

          >

            <Popup>

              <strong>
                Your Location
              </strong>

              <br />

              You are here.

            </Popup>

          </Marker>

        </>

      )}


      {/* =================================================
          SEARCHED LOCATION
      ================================================= */}

      {searchLocation && (

        <Marker

          position={[
            searchLocation.latitude,
            searchLocation.longitude,
          ]}

          icon={searchLocationIcon}

        >

          <Popup>

            <strong>
              Searched Location
            </strong>

            <br />

            {searchLocation.displayName}

          </Popup>

        </Marker>

      )}


      {/* =================================================
          FACILITY MARKERS
      ================================================= */}

      {facilities.map((facility) => (

        <Marker

          key={facility.facility_id}

          position={[
            facility.latitude,
            facility.longitude,
          ]}

        >

          <Popup>

            <strong>
              {facility.name}
            </strong>

            <br />

            <br />

            <strong>
              Type:
            </strong>{' '}
            {facility.facility_type}

            <br />

            <strong>
              Facility ID:
            </strong>{' '}
            {facility.facility_id}

            <br />

            <strong>
              Accessibility:
            </strong>{' '}
            {facility.accessibility}

            <br />

            <strong>
              Condition:
            </strong>{' '}
            {facility.condition}

            <br />

            <strong>
              Availability:
            </strong>{' '}
            {facility.availability}

            <br />

            {facility.is_demo && (

              <>

                <br />

                <strong>
                  Prototype Demo Facility
                </strong>

              </>

            )}

          </Popup>

        </Marker>

      ))}

    </MapContainer>

  )

}


export default MapView