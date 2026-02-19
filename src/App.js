import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import About from './pages/About';
import { useFavorites } from './hooks/useApp';
import './App.css';

function AppContent() {
  const { favoritesCount } = useFavorites();

  return (
    <div className="app">
      <Header favoritesCount={favoritesCount} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stations" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
