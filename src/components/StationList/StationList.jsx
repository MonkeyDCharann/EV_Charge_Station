import React from 'react';
import './StationList.css';

// ── Single Station Card ──────────────────────────────────────
export function StationCard({ station, onSelect, onToggleFavorite, isFavorite, onGetDirections }) {
  return (
    <div
      className={`station-card ${!station.isAvailable ? 'unavailable-card' : ''}`}
      onClick={() => onSelect && onSelect(station)}
    >
      {/* Card Header */}
      <div className="card-header">
        <div className="provider-badge">{station.providerLogo}</div>
        <div className="card-header-info">
          <h3 className="card-name">{station.name}</h3>
          <p className="card-address">📍 {station.address}</p>
        </div>
        <button
          className={`fav-btn ${isFavorite ? 'favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite && onToggleFavorite(station);
          }}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Status Row */}
      <div className="card-status-row">
        <span className={`status-badge ${station.isAvailable ? 'available' : 'unavailable'}`}>
          {station.isAvailable ? '✅ Available' : '❌ Unavailable'}
        </span>
        <span className="plugs-info">
          🔌 {station.availablePlugs}/{station.totalPlugs} plugs
        </span>
        <span className="last-updated">🕒 {station.lastUpdated}</span>
      </div>

      {/* Stats Grid */}
      <div className="card-stats">
        <div className="card-stat">
          <span className="stat-label">Connector</span>
          <span className="stat-value">{station.connectorType}</span>
        </div>
        <div className="card-stat">
          <span className="stat-label">Power</span>
          <span className="stat-value">{station.power} kW</span>
        </div>
        <div className="card-stat">
          <span className="stat-label">Price</span>
          <span className="stat-value">{station.price}</span>
        </div>
        <div className="card-stat">
          <span className="stat-label">Distance</span>
          <span className="stat-value">{station.distance} km</span>
        </div>
      </div>

      {/* Amenities */}
      <div className="card-amenities">
        {station.amenities?.slice(0, 4).map((a, i) => (
          <span key={i} className="amenity-tag">{a}</span>
        ))}
        {station.amenities?.length > 4 && (
          <span className="amenity-tag more">+{station.amenities.length - 4}</span>
        )}
      </div>

      {/* Rating + Hours */}
      <div className="card-footer">
        <div className="card-rating">
          {'⭐'.repeat(Math.floor(station.rating))}
          <span className="rating-num">{station.rating}</span>
          <span className="review-count">({station.totalReviews})</span>
        </div>
        <span className="card-hours">🕐 {station.operatingHours}</span>
      </div>

      {/* Get Directions Button — mirrors route.js "Get Directions" popup button */}
      <button
        className="card-directions-btn"
        onClick={(e) => {
          e.stopPropagation();
          onGetDirections && onGetDirections(station);
        }}
        title="Get directions to this station"
      >
        📍 Get Directions
      </button>
    </div>
  );
}

// ── Station List Component ───────────────────────────────────
function StationList({ stations = [], onSelectStation, onToggleFavorite, favoriteIds = [], loading, onGetDirections }) {
  if (loading) {
    return (
      <div className="station-list">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-circle"></div>
              <div className="skeleton-lines">
                <div className="skeleton-line wide"></div>
                <div className="skeleton-line narrow"></div>
              </div>
            </div>
            <div className="skeleton-grid">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="skeleton-stat"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3>No stations found</h3>
        <p>Try adjusting your filters or search in a different area</p>
      </div>
    );
  }

  return (
    <div className="station-list">
      <div className="list-header">
        <span className="list-count">{stations.length} stations found</span>
      </div>
      {stations.map(station => (
        <StationCard
          key={station.id}
          station={station}
          onSelect={onSelectStation}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favoriteIds.includes(station.id)}
          onGetDirections={onGetDirections}
        />
      ))}
    </div>
  );
}

export default StationList;