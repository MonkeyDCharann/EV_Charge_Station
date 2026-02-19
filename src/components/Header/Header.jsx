import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header({ favoritesCount = 0 }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">
            <span className="logo-name">ChargeSaathi</span>
            <span className="logo-tagline">EV Charging Locator</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <span className="nav-icon">🗺️</span>
            <span>Map</span>
          </Link>
          <Link to="/stations" className={`nav-link ${isActive('/stations') ? 'active' : ''}`}>
            <span className="nav-icon">⚡</span>
            <span>Stations</span>
          </Link>
          <Link to="/favorites" className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}>
            <span className="nav-icon">❤️</span>
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className="nav-badge">{favoritesCount}</span>
            )}
          </Link>
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
            <span className="nav-icon">ℹ️</span>
            <span>About</span>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="mobile-nav">
          <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}>
            🗺️ Map
          </Link>
          <Link to="/stations" className={`mobile-nav-link ${isActive('/stations') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}>
            ⚡ Stations
          </Link>
          <Link to="/favorites" className={`mobile-nav-link ${isActive('/favorites') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}>
            ❤️ Favorites {favoritesCount > 0 && `(${favoritesCount})`}
          </Link>
          <Link to="/about" className={`mobile-nav-link ${isActive('/about') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}>
            ℹ️ About
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Header;
