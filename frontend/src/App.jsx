import { useEffect, useMemo, useState } from 'react'

import {
  MapPin,
  Navigation,
  Droplets,
  Accessibility,
  Search,
  AlertTriangle,
  UserRound,
  Users,
  ExternalLink,
  Camera,
  X,
  CheckCircle2,
  WifiOff,
  LocateFixed,
} from 'lucide-react'

import { createDemoFacilities } from './demoFacilities'

import MapView from './MapView'

import './App.css'

const API_URL = 'http://127.0.0.1:8000'

function App() {

  // =====================================================
  // STATE
  // =====================================================

  const [facilities, setFacilities] = useState([])

  const [userLocation, setUserLocation] = useState(null)

  const [locationLoading, setLocationLoading] = useState(false)

  const [locationError, setLocationError] = useState(null)

  const [activeFilter, setActiveFilter] = useState('all')

  const [accessibilityFilter, setAccessibilityFilter] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')

  // Searched place is kept separate from the user's live location.
  const [searchLocation, setSearchLocation] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)


  // =====================================================
  // LOAD ALL REAL FACILITIES
  // =====================================================

  useEffect(() => {

    async function loadFacilities() {

      try {

        const response = await fetch(
          `${API_URL}/facilities`
        )

        if (!response.ok) {
          throw new Error('Failed to load facilities')
        }

        const data = await response.json()

        setFacilities(data.facilities || [])

      } catch (error) {

        console.error(
          'Facility loading error:',
          error
        )

      }

    }

    loadFacilities()

  }, [])


  // =====================================================
  // GET USER LOCATION
  // =====================================================

  function handleUseMyLocation() {

    if (!navigator.geolocation) {

      setLocationError(
        'Location services are not supported by this browser.'
      )

      return

    }

    setLocationLoading(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }

        console.log(
          'User location:',
          location
        )

        setUserLocation(location)

        setLocationLoading(false)

      },

      (error) => {

        console.error(
          'Location error:',
          error
        )

        setLocationLoading(false)

        if (error.code === 1) {

          setLocationError(
            'Location permission was denied. Please allow location access.'
          )

        } else if (error.code === 2) {

          setLocationError(
            'Your location could not be determined.'
          )

        } else {

          setLocationError(
            'Unable to get your location.'
          )

        }

      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }

    )

  }


  // =====================================================
  // SEARCH FOR A PLACE
  // =====================================================

  async function handleSearch() {
    const query = searchQuery.trim()

    if (!query) {
      setSearchLocation(null)
      setSearchError(null)
      return
    }

    setSearchLoading(true)
    setSearchError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          `${query}, Kochi, Kerala, India`
        )}&limit=1`
      )

      if (!response.ok) {
        throw new Error('Search request failed')
      }

      const results = await response.json()

      if (!results.length) {
        setSearchLocation(null)
        setSearchError('Location not found. Try another place.')
        return
      }

      const result = results[0]

      const location = {
        latitude: Number(result.lat),
        longitude: Number(result.lon),
        displayName: result.display_name,
      }

      console.log('Searched location:', location)

      // Keep the actual blue user location unchanged.
      setSearchLocation(location)

    } catch (error) {
      console.error('Location search error:', error)
      setSearchLocation(null)
      setSearchError('Unable to search this location. Please try again.')
    } finally {
      setSearchLoading(false)
    }
  }


  // =====================================================
  // COMBINE REAL + DEMO DATA
  // =====================================================
  const demoFacilities = useMemo(
  () => createDemoFacilities(userLocation),
  [userLocation]
 )  
 
  const allFacilities = useMemo(() => {

    return [
      ...facilities,
      ...demoFacilities,
    ]

  }, [facilities, demoFacilities])


  // =====================================================
  // FILTER FACILITIES
  // =====================================================

  const filteredFacilities = useMemo(() => {

    let result = [...allFacilities]


    // ---------------------------------------------------
    // MAIN TYPE FILTER
    // ---------------------------------------------------

    if (activeFilter === 'toilet') {

      result = result.filter(
        (facility) =>
          facility.facility_type === 'toilet'
      )

    }


    if (activeFilter === 'drinking_water') {

      result = result.filter(
        (facility) =>
          facility.facility_type === 'drinking_water' ||
          facility.facility_type === 'water_tap'
      )

    }


    // ---------------------------------------------------
    // ACCESSIBILITY FILTER
    // ---------------------------------------------------

    if (activeFilter === 'accessible') {

      if (accessibilityFilter) {

        result = result.filter((facility) => {

          const options =
            facility.accessibility_options || []

          return options.includes(
            accessibilityFilter
          )

        })

      } else {

        // General Accessible filter
        result = result.filter((facility) => {

          const options =
            facility.accessibility_options || []

          return (
            facility.accessibility === 'Accessible' ||
            options.includes('wheelchair') ||
            options.includes('male') ||
            options.includes('female') ||
            options.includes('unisex')
          )

        })

      }

    }


    // ---------------------------------------------------
    // SEARCH
    // ---------------------------------------------------

    const query = searchQuery
      .trim()
      .toLowerCase()

    if (query && !searchLocation) {

      result = result.filter((facility) => {

        const searchableText = [

          facility.name,

          facility.facility_id,

          facility.facility_type,

          facility.address,

          facility.operator,

          facility.accessibility,

          facility.condition,

          facility.availability,

          facility.source,

        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchableText.includes(query)

      })

    }


    return result

  }, [
    allFacilities,
    activeFilter,
    accessibilityFilter,
    searchQuery,
    searchLocation,
  ])


  // =====================================================
  // FILTER BUTTON
  // =====================================================

  function handleFilterChange(filter) {

    if (filter === 'accessible') {

      setActiveFilter('accessible')

      // Don't automatically select a sub-option.
      // This lets the accessibility menu open.

      return
    }


    setActiveFilter(filter)

    setAccessibilityFilter(null)

  }


  // =====================================================
  // ACCESSIBILITY OPTION
  // =====================================================

  function handleAccessibilityFilter(option) {

    setActiveFilter('accessible')

    setAccessibilityFilter(
      option
    )

  }


  // =====================================================
  // CLEAR ACCESSIBILITY SUB-FILTER
  // =====================================================

  function clearAccessibilityFilter() {

    setActiveFilter('accessible')

    setAccessibilityFilter(null)

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="app">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">

            <MapPin size={24} />

          </div>

          <div>

            <h1>
              Public Facility Finder
            </h1>

            <p>
              Kochi • Sanitation & Drinking Water
            </p>

          </div>

        </div>


        <button
          className="location-button"
          onClick={handleUseMyLocation}
          disabled={locationLoading}
        >

          <Navigation size={18} />

          {locationLoading
            ? 'Locating...'
            : 'Use My Location'}

        </button>

      </header>


      {/* =================================================
          LOCATION ERROR
      ================================================= */}

      {locationError && (

        <div className="location-error">

          <strong>
            Location unavailable
          </strong>

          <span>
            {locationError}
          </span>

        </div>

      )}


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main-content">


        {/* =================================================
            INTRO
        ================================================= */}

        <section className="intro">

          <div>

            <span className="eyebrow">
              KOCHI
            </span>

            <h2>
              Find essential public facilities near you
            </h2>

            <p>
              Locate public toilets and drinking-water
              points, check accessibility information,
              and report problems.
            </p>

          </div>

        </section>


        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="search-section">

          <div className="search-box">

            <Search size={20} />

            <input
              type="text"
              placeholder="Search a place in Kochi..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)

                if (searchLocation) {
                  setSearchLocation(null)
                }

                if (searchError) {
                  setSearchError(null)
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch()
                }
              }}
              aria-label="Search for a place in Kochi"
            />

            <button
              type="button"
              className="search-button"
              onClick={handleSearch}
              disabled={searchLoading}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>

          </div>

          {searchError && (
            <div className="search-error">
              {searchError}
            </div>
          )}

          {searchLocation && (
            <div className="search-location-info">
              <div>
                <strong>Searched area:</strong>{' '}
                {searchLocation.displayName}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchLocation(null)
                  setSearchQuery('')
                  setSearchError(null)
                }}
              >
                Clear
              </button>
            </div>
          )}

        </section>


        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="filters">


          {/* ALL */}

          <button
            className={
              activeFilter === 'all'
                ? 'filter active'
                : 'filter'
            }
            onClick={() =>
              handleFilterChange('all')
            }
          >

            <MapPin size={18} />

            All

          </button>


          {/* TOILETS */}

          <button
            className={
              activeFilter === 'toilet'
                ? 'filter active'
                : 'filter'
            }
            onClick={() =>
              handleFilterChange('toilet')
            }
          >

            <Droplets size={18} />

            Toilets

          </button>


          {/* DRINKING WATER */}

          <button
            className={
              activeFilter === 'drinking_water'
                ? 'filter active'
                : 'filter'
            }
            onClick={() =>
              handleFilterChange('drinking_water')
            }
          >

            <Droplets size={18} />

            Drinking Water

          </button>


          {/* =================================================
              ACCESSIBILITY FILTER
          ================================================= */}

          <div className="accessibility-filter-group">

            <button
              className={
                activeFilter === 'accessible'
                  ? 'filter active'
                  : 'filter'
              }
              onClick={() =>
                handleFilterChange('accessible')
              }
            >

              <Accessibility size={18} />

              Accessible

            </button>


            {/* ACCESSIBILITY OPTIONS */}

            {activeFilter === 'accessible' && (

              <div className="accessibility-options">


                {/* ALL ACCESSIBLE */}

                <button
                  className={
                    accessibilityFilter === null
                      ? 'accessibility-option selected'
                      : 'accessibility-option'
                  }
                  onClick={
                    clearAccessibilityFilter
                  }
                >

                  <Accessibility size={16} />

                  All Accessible

                </button>


                {/* WHEELCHAIR */}

                <button
                  className={
                    accessibilityFilter === 'wheelchair'
                      ? 'accessibility-option selected'
                      : 'accessibility-option'
                  }
                  onClick={() =>
                    handleAccessibilityFilter(
                      'wheelchair'
                    )
                  }
                >

                  <Accessibility size={16} />

                  Wheelchair

                </button>


                {/* MALE */}

                <button
                  className={
                    accessibilityFilter === 'male'
                      ? 'accessibility-option selected'
                      : 'accessibility-option'
                  }
                  onClick={() =>
                    handleAccessibilityFilter(
                      'male'
                    )
                  }
                >

                  <UserRound size={16} />

                  Male

                </button>


                {/* FEMALE */}

                <button
                  className={
                    accessibilityFilter === 'female'
                      ? 'accessibility-option selected'
                      : 'accessibility-option'
                  }
                  onClick={() =>
                    handleAccessibilityFilter(
                      'female'
                    )
                  }
                >

                  <UserRound size={16} />

                  Female

                </button>


                {/* UNISEX */}

                <button
                  className={
                    accessibilityFilter === 'unisex'
                      ? 'accessibility-option selected'
                      : 'accessibility-option'
                  }
                  onClick={() =>
                    handleAccessibilityFilter(
                      'unisex'
                    )
                  }
                >

                  <Users size={16} />

                  Unisex

                </button>


              </div>

            )}

          </div>


        </section>


        {/* =================================================
            ACTIVE FILTER INFORMATION
        ================================================= */}

        {activeFilter === 'accessible' &&
          accessibilityFilter && (

          <div className="active-filter-info">

            Showing:

            <strong>
              {' '}
              {accessibilityFilter === 'wheelchair'
                ? 'Wheelchair accessible'
                : accessibilityFilter === 'male'
                  ? 'Male'
                  : accessibilityFilter === 'female'
                    ? 'Female'
                    : 'Unisex'}
            </strong>

          </div>

        )}


        {/* =================================================
            MAP
        ================================================= */}

        <section className="map-section">

          <MapView
            userLocation={userLocation}
            searchLocation={searchLocation}
            facilities={filteredFacilities}
          />

        </section>


        {/* =================================================
            FACILITIES
        ================================================= */}

        <section className="facilities-section">


          <div className="section-heading">

            <div>

              <span className="eyebrow">

                {userLocation
                  ? 'NEARBY'
                  : 'KOCHI'}

              </span>

              <h2>

                {searchLocation
                  ? 'Facilities near searched area'
                  : userLocation
                    ? 'Facilities around you'
                    : 'Facilities in Kochi'}

              </h2>

            </div>


            <span className="facility-count">

              {filteredFacilities.length} facilities

            </span>

          </div>


          <div className="facility-grid">


            {filteredFacilities
              .slice(0, 12)
              .map((facility) => (

                <article
                  className="facility-card"
                  key={facility.facility_id}
                >


                  {/* ICON */}

                  <div
                    className={
                      facility.facility_type === 'toilet'
                        ? 'facility-icon toilet'
                        : 'facility-icon water'
                    }
                  >

                    {facility.facility_type === 'toilet'
                      ? <MapPin size={22} />
                      : <Droplets size={22} />}

                  </div>


                  {/* INFORMATION */}

                  <div className="facility-info">

                    <span className="facility-type">

                      {facility.facility_type === 'toilet'
                        ? 'PUBLIC TOILET'
                        : facility.facility_type === 'water_tap'
                          ? 'DRINKING WATER TAP'
                          : 'DRINKING WATER'}

                    </span>


                    <h3>
                      {facility.name}
                    </h3>


                    <div className="facility-meta">

                      <span>

                        {facility.accessibility &&
                        facility.accessibility !== 'Unknown'
                          ? facility.accessibility
                          : 'Accessibility not reported'}

                      </span>


                      {facility.is_demo && (

                        <>
                          <span>•</span>

                          <span>
                            Demo facility
                          </span>
                        </>

                      )}

                    </div>

                  </div>


                  {/* STATUS */}

                  <span className="status unknown">

                    {facility.condition &&
                    facility.condition !== 'Unknown'
                      ? facility.condition
                      : 'Not reported'}

                  </span>


                </article>

              ))}


          </div>


          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {filteredFacilities.length === 0 && (

            <div className="empty-state">

              <Search size={32} />

              <h3>
                No facilities found
              </h3>

              <p>
                Try another search or filter.
              </p>

            </div>

          )}


        </section>


        {/* =================================================
            REPORT
        ================================================= */}

        <section className="report-banner">

          <div className="report-icon">

            <AlertTriangle size={24} />

          </div>


          <div>

            <h3>
              See a problem?
            </h3>

            <p>
              Report a broken, locked, unusable
              or unavailable facility.
            </p>

          </div>


          <button className="report-button">

            Report Issue

          </button>

        </section>


      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <p>
          Public Facility Finder • ANAVANDI Hackathon 2026
        </p>

        <span>
          Data source: OpenStreetMap
        </span>

      </footer>


    </div>

  )

}


export default App