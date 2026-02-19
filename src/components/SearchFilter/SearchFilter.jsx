import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SearchFilter.css';

// ── Reusable suggestion input ────────────────────────────────
function SuggestionInput({ placeholder, icon, value, onChange, suggestions, isSearching, onSelect, onClear, activeIndex, setActiveIndex, showSuggestions, setShowSuggestions, suggestRef, inputRef, onKeyDown, footer }) {
  return (
    <div className="search-input-wrap" style={{ position: 'relative' }}>
      <span className="search-icon">
        {isSearching ? <span className="search-spinner"></span> : icon}
      </span>
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {value && (
        <button className="clear-search" onClick={onClear}>✕</button>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-box" ref={suggestRef}>
          {suggestions.map((s, idx) => (
            <div
              key={s.id}
              className={`suggestion-item ${idx === activeIndex ? 'active' : ''}`}
              onMouseDown={() => onSelect(s)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <span className="suggestion-icon">{s.icon}</span>
              <div className="suggestion-text">
                <span className="suggestion-main">{s.shortLabel}</span>
                {s.subLabel && <span className="suggestion-sub">{s.subLabel}</span>}
              </div>
              {s.badge && <span className="suggestion-type">{s.badge}</span>}
            </div>
          ))}
          {footer && <div className="suggestions-footer">{footer}</div>}
        </div>
      )}
    </div>
  );
}

// ── Main SearchFilter ────────────────────────────────────────
function SearchFilter({ filters, onFilterChange, onReset, totalResults, onLocationSelect, stations = [] }) {

  // ── Location search state ──────────────────────────────────
  const [locQuery,       setLocQuery]       = useState('');
  const [locSuggestions, setLocSuggestions] = useState([]);
  const [locSearching,   setLocSearching]   = useState(false);
  const [locShowSug,     setLocShowSug]     = useState(false);
  const [locActiveIdx,   setLocActiveIdx]   = useState(-1);
  const locDebounce = useRef(null);
  const locInputRef = useRef(null);
  const locSugRef   = useRef(null);

  // ── EV station search state ────────────────────────────────
  const [stQuery,       setStQuery]       = useState('');
  const [stSuggestions, setStSuggestions] = useState([]);
  const [stShowSug,     setStShowSug]     = useState(false);
  const [stActiveIdx,   setStActiveIdx]   = useState(-1);
  const stInputRef = useRef(null);
  const stSugRef   = useRef(null);

  // ── Fetch from Photon (komoot) ─────────────────────────────
  const fetchLocations = useCallback(async (query) => {
    if (!query || query.length < 2) { setLocSuggestions([]); return; }
    setLocSearching(true);
    try {
      const res  = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en`
      );
      const data = await res.json();

      setLocSuggestions((data.features || []).map((f, i) => {
        const p    = f.properties;
        const coords = f.geometry.coordinates; // [lon, lat]

        // Build a clean label: name + city/state/country
        const parts = [p.name, p.city, p.state, p.country].filter(Boolean);
        const shortLabel = parts.slice(0, 2).join(', ');
        const subLabel   = parts.slice(2, 4).join(', ');

        return {
          id:         `${p.osm_id}-${i}`,
          shortLabel: shortLabel || p.name || 'Unknown',
          subLabel:   subLabel   || '',
          badge:      p.type || p.osm_value || '',
          icon:       getLocationIcon(p.osm_key, p.type || p.osm_value),
          lat:        coords[1],
          lon:        coords[0],
          // store bbox if available for better map fitting
          bbox:       f.properties.extent || null,
        };
      }));
      setLocShowSug(true);
      setLocActiveIdx(-1);
    } catch (e) {
      console.error('Photon error:', e);
    } finally {
      setLocSearching(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(locDebounce.current);
    locDebounce.current = setTimeout(() => fetchLocations(locQuery), 350);
    return () => clearTimeout(locDebounce.current);
  }, [locQuery, fetchLocations]);

  // ── Filter EV stations locally ─────────────────────────────
  useEffect(() => {
    if (!stQuery || stQuery.length < 1) { setStSuggestions([]); setStShowSug(false); return; }
    const q = stQuery.toLowerCase();
    const matches = stations
      .filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.provider?.toLowerCase().includes(q) ||
        s.connectorType?.toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map(s => ({
        id:         s.id,
        shortLabel: s.name,
        subLabel:   s.address || s.provider,
        badge:      s.isAvailable ? '✅' : '❌',
        icon:       '⚡',
        lat:        s.latitude,
        lon:        s.longitude,
        station:    s,
      }));
    setStSuggestions(matches);
    setStShowSug(true);
    setStActiveIdx(-1);
  }, [stQuery, stations]);

  // ── Close on outside click ─────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!locSugRef.current?.contains(e.target) && !locInputRef.current?.contains(e.target))
        setLocShowSug(false);
      if (!stSugRef.current?.contains(e.target) && !stInputRef.current?.contains(e.target))
        setStShowSug(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Location selected → fly map to that place ─────────────
  const handleLocSelect = (s) => {
    setLocQuery(s.shortLabel);
    setLocShowSug(false);
    setLocSuggestions([]);
    // Pass lat/lon + bbox so MapView can fit the bounds of the place
    if (onLocationSelect) {
      onLocationSelect({
        lat:   s.lat,
        lon:   s.lon,
        label: s.shortLabel,
        bbox:  s.bbox, // [minLon, minLat, maxLon, maxLat] if available
      });
    }
  };

  // ── EV station selected → fly map + filter ─────────────────
  const handleStSelect = (s) => {
    setStQuery(s.shortLabel);
    setStShowSug(false);
    onFilterChange('search', s.shortLabel);
    if (onLocationSelect && s.lat && s.lon)
      onLocationSelect({ lat: s.lat, lon: s.lon, label: s.shortLabel });
  };

  // ── Keyboard nav factory ───────────────────────────────────
  const makeKeyDown = (suggestions, activeIdx, setActiveIdx, setShowSug, onSelect) => (e) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === 'Enter') {
      if (activeIdx >= 0) { e.preventDefault(); onSelect(suggestions[activeIdx]); }
      else if (suggestions.length > 0) { e.preventDefault(); onSelect(suggestions[0]); } // auto-select first on Enter
    }
    if (e.key === 'Escape') setShowSug(false);
  };

  return (
    <div className="search-filter">

      {/* ── Location Search Bar ── */}
      <div className="search-row">
        <div className="sf-bar-label">🌍 Search Location</div>
        <SuggestionInput
          placeholder="Search city, country, area..."
          icon="🌍"
          value={locQuery}
          onChange={(e) => {
            setLocQuery(e.target.value);
            if (e.target.value.length >= 2) setLocShowSug(true);
            else setLocShowSug(false);
          }}
          suggestions={locSuggestions}
          isSearching={locSearching}
          onSelect={handleLocSelect}
          onClear={() => { setLocQuery(''); setLocSuggestions([]); setLocShowSug(false); locInputRef.current?.focus(); }}
          activeIndex={locActiveIdx}
          setActiveIndex={setLocActiveIdx}
          showSuggestions={locShowSug}
          setShowSuggestions={setLocShowSug}
          suggestRef={locSugRef}
          inputRef={locInputRef}
          onKeyDown={makeKeyDown(locSuggestions, locActiveIdx, setLocActiveIdx, setLocShowSug, handleLocSelect)}
          footer={<span>🔡 Powered by Photon / Komoot</span>}
        />
      </div>

      {/* ── EV Station Search Bar ── */}
      <div className="search-row" style={{ marginTop: '8px' }}>
        <div className="sf-bar-label">⚡ Search EV Station</div>
        <SuggestionInput
          placeholder="Search station name, provider, connector..."
          icon="⚡"
          value={stQuery}
          onChange={(e) => { setStQuery(e.target.value); onFilterChange('search', e.target.value); }}
          suggestions={stSuggestions}
          isSearching={false}
          onSelect={handleStSelect}
          onClear={() => { setStQuery(''); setStSuggestions([]); setStShowSug(false); onFilterChange('search', ''); stInputRef.current?.focus(); }}
          activeIndex={stActiveIdx}
          setActiveIndex={setStActiveIdx}
          showSuggestions={stShowSug}
          setShowSuggestions={setStShowSug}
          suggestRef={stSugRef}
          inputRef={stInputRef}
          onKeyDown={makeKeyDown(stSuggestions, stActiveIdx, setStActiveIdx, setStShowSug, handleStSelect)}
          footer={null}
        />
      </div>

      {/* Filter Row */}
      <div className="filter-row">
        <div className="filter-group">
          <label className="filter-label">Connector</label>
          <select className="filter-select" value={filters.connectorType}
            onChange={(e) => onFilterChange('connectorType', e.target.value)}>
            <option value="all">All Types</option>
            <option value="Type 2">Type 2</option>
            <option value="CCS">CCS</option>
            <option value="CHAdeMO">CHAdeMO</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select className="filter-select" value={filters.availability}
            onChange={(e) => onFilterChange('availability', e.target.value)}>
            <option value="all">All Stations</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Min Power</label>
          <select className="filter-select" value={filters.minPower}
            onChange={(e) => onFilterChange('minPower', parseInt(e.target.value))}>
            <option value="0">Any Power</option>
            <option value="40">40+ kW</option>
            <option value="60">60+ kW</option>
            <option value="100">100+ kW</option>
            <option value="150">150+ kW</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Sort By</label>
          <select className="filter-select" value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}>
            <option value="distance">Nearest First</option>
            <option value="power">Highest Power</option>
            <option value="rating">Best Rated</option>
            <option value="price">Lowest Price</option>
          </select>
        </div>
        <button className="reset-btn" onClick={() => {
          onReset();
          setLocQuery(''); setStQuery('');
          setLocSuggestions([]); setStSuggestions([]);
        }} title="Reset all filters">↺ Reset</button>
      </div>

      {/* Results Summary */}
      <div className="filter-summary">
        <span className="results-count">⚡ {totalResults} station{totalResults !== 1 ? 's' : ''} found</span>
        {(stQuery || filters.connectorType !== 'all' || filters.availability !== 'all' || filters.minPower > 0) && (
          <span className="filter-active-badge">Filters active</span>
        )}
      </div>
    </div>
  );
}

function getLocationIcon(osmKey, osmValue) {
  if (osmValue === 'city')         return '🏙️';
  if (osmValue === 'town')         return '🏘️';
  if (osmValue === 'village')      return '🏡';
  if (osmValue === 'country')      return '🌐';
  if (osmValue === 'state')        return '📍';
  if (osmValue === 'county')       return '📍';
  if (osmValue === 'district')     return '📍';
  if (osmValue === 'suburb')       return '🏘️';
  if (osmKey   === 'highway')      return '🛣️';
  if (osmKey   === 'amenity')      return '🏢';
  if (osmKey   === 'tourism')      return '🏖️';
  if (osmKey   === 'natural')      return '🌿';
  return '📌';
}

export default SearchFilter;