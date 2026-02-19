import React, { useState, useEffect, useRef, useCallback } from 'react';
import MapView from '../components/Map/MapView';
import StationList from '../components/StationList/StationList';
import SearchFilter from '../components/SearchFilter/SearchFilter';
import StationDetails from '../components/StationDetails/StationDetails';
import RoutePanel from '../components/RoutePanel/RoutePanel';
import { stationAPI } from '../services/api';
import { useGeolocation, useFavorites, useStationFilter } from '../hooks/useApp';
import './Home.css';

function Home() {
  const [stations,            setStations]        = useState([]);
  const [loading,             setLoading]         = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [view,                setView]            = useState('both');

  // Route state
  const [routeDestination, setRouteDestination] = useState(null);
  const [routePanelOpen,   setRoutePanelOpen]   = useState(false);
  const [activeRoute,      setActiveRoute]      = useState(null);
  const [isNavigating,     setIsNavigating]     = useState(false);
  const [liveLocation,     setLiveLocation]     = useState(null);
  const [isPickingFromMap, setIsPickingFromMap] = useState(false);

  const [mapFlyTo, setMapFlyTo] = useState(null);
  const watchIdRef = useRef(null);

  const { location: userLocation, error: locationError } = useGeolocation();
  const { favoriteIds, toggleFavorite, isFavorite }      = useFavorites();
  const { filteredStations, filters, updateFilter, resetFilters } = useStationFilter(stations);

  // Load stations based on user location or default bounds
  useEffect(() => {
    const loadStations = async () => {
      setLoading(true);
      try {
        // If userLocation exists, search near them, otherwise use a broad India-wide box
        const delta = userLocation ? 1.0 : 15.0; 
        const lat = userLocation?.lat || 20.5937;
        const lon = userLocation?.lon || 78.9629;

        const result = await stationAPI.getAll(
          lat - delta, lon - delta,
          lat + delta, lon + delta
        );
        if (result.success) setStations(result.data);
      } catch (err) {
        console.error('Error loading stations:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStations();
  }, [userLocation]);

  // Reload when map pans
  const handleBoundsChange = useCallback(async (bounds) => {
    try {
      const result = await stationAPI.getAll(bounds.south, bounds.west, bounds.north, bounds.east);
      if (result.success) setStations(result.data);
    } catch (err) {
      console.error('Error loading stations for bounds:', err);
    }
  }, []);

  const effectiveUserLocation = liveLocation || userLocation;

  const nearbyCount = effectiveUserLocation
    ? stations.filter(s => {
        if (!s.latitude || !s.longitude) return false;
        const d = Math.sqrt(
          Math.pow((s.latitude  - effectiveUserLocation.lat) * 111, 2) +
          Math.pow((s.longitude - effectiveUserLocation.lon) * 111, 2)
        );
        return d <= 10;
      }).length
    : 0;

  const handleGetDirections = useCallback((station) => {
    setRouteDestination({ lat: station.latitude, lng: station.longitude, label: station.name });
    setRoutePanelOpen(true);
    setActiveRoute(null);
  }, []);

  const handlePickFromMap = useCallback(() => {
    setIsPickingFromMap(prev => !prev);
  }, []);

  const [routePanelPickedStart, setRoutePanelPickedStart] = useState(null);

  const handleMapPickedStart = useCallback((coords) => {
    setIsPickingFromMap(false);
    setRoutePanelPickedStart(coords);
  }, []);

  // Navigation
  const handleStartNavigation = useCallback(() => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    if (watchIdRef.current) return;
    setIsNavigating(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => setLiveLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => console.warn('Tracking error:', err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  }, []);

  const handleStopNavigation = useCallback(() => {
    if (watchIdRef.current) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    setIsNavigating(false);
    setLiveLocation(null);
  }, []);

  const handleClearRoute = useCallback(() => {
    handleStopNavigation();
    setRouteDestination(null);
    setActiveRoute(null);
    setRoutePanelOpen(false);
    setIsPickingFromMap(false);
    setRoutePanelPickedStart(null);
  }, [handleStopNavigation]);

  useEffect(() => () => handleStopNavigation(), [handleStopNavigation]);

  const stats = { total: stations.length, available: stations.filter(s => s.isAvailable).length };

  return (
    <div className="home-page">
      <div className="stats-bar">
        <div className="stat-pill"><span className="stat-dot all"></span><span>{stats.total} Total Stations</span></div>
        <div className="stat-pill"><span className="stat-dot available"></span><span>{stats.available} Available</span></div>
        <div className="stat-pill"><span className="stat-dot unavailable"></span><span>{stats.total - stats.available} Unavailable</span></div>

        {nearbyCount > 0 && (
          <div className="stat-pill nearby-pill">⚡ {nearbyCount} station{nearbyCount !== 1 ? 's' : ''} nearby</div>
        )}
        
        {/* Updated Error message */}
        {locationError && <div className="location-warning">📍 Showing stations across India</div>}
        
        {isNavigating && (
          <div className="nav-active-badge">🧭 Navigation Active
            <button className="stop-nav-btn" onClick={handleStopNavigation}>Stop</button>
          </div>
        )}
        {isPickingFromMap && (
          <div className="location-warning" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
            🖱️ Click on the map to pick start point
          </div>
        )}

        <div className="view-toggle">
          <button className={`toggle-btn ${view === 'map'  ? 'active' : ''}`} onClick={() => setView('map')}>🗺️ Map</button>
          <button className={`toggle-btn ${view === 'both' ? 'active' : ''}`} onClick={() => setView('both')}>⚡ Both</button>
          <button className={`toggle-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>📋 List</button>
        </div>
      </div>

      <div className={`home-content view-${view}`}>
        {(view === 'map' || view === 'both') && (
          <div className="map-section">
            <MapView
              stations={filteredStations}
              userLocation={effectiveUserLocation}
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
              onGetDirections={handleGetDirections}
              activeRoute={activeRoute}
              onBoundsChange={handleBoundsChange}
              isPickingFromMap={isPickingFromMap}
              onMapPickedStart={handleMapPickedStart}
              flyTo={mapFlyTo}
              layoutMode={view} // Pass the view state here to trigger invalidateSize
            />
          </div>
        )}

        {(view === 'list' || view === 'both') && (
          <div className="list-section">
            <SearchFilter 
              filters={filters} 
              onFilterChange={updateFilter} 
              onReset={resetFilters} 
              totalResults={filteredStations.length} 
              onLocationSelect={(loc) => setMapFlyTo(loc)} 
              stations={stations} 
            />
            <div className="list-scroll">
              <StationList
                stations={filteredStations}
                onSelectStation={setSelectedStation}
                onToggleFavorite={toggleFavorite}
                favoriteIds={favoriteIds}
                loading={loading}
                onGetDirections={handleGetDirections}
              />
            </div>
          </div>
        )}
      </div>

      {selectedStation && (
        <StationDetails
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite(selectedStation.id)}
          userLocation={effectiveUserLocation}
          onGetDirections={handleGetDirections}
        />
      )}

      {routePanelOpen && routeDestination && (
        <RoutePanel
          destination={routeDestination}
          userLocation={effectiveUserLocation}
          onRouteCalculated={setActiveRoute}
          onStartNavigation={handleStartNavigation}
          onClearRoute={handleClearRoute}
          isNavigating={isNavigating}
          onPickFromMap={handlePickFromMap}
          isPickingFromMap={isPickingFromMap}
          pickedStart={routePanelPickedStart}
        />
      )}
    </div>
  );
}

export default Home;