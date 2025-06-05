// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PlayerPage from './pages/PlayerPage';
import LoginPage from './pages/LoginPage';
import FavoritesPage from './pages/FavoritesPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/player" element={<PlayerPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Movie/TV Favorites & History (private) */}
        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <FavoritesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <HistoryPage />
            </PrivateRoute>
          }
        />

        {/* Fallback to Home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}
