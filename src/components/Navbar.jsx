// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, isAuthenticated } from '../utils/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={{ backgroundColor: 'rgba(46,46,46,0.95)', padding: '10px 20px' }}>
      <div
        className="container"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Link
          to="/"
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'var(--color-primary)',
            fontFamily: 'JoJoFont, sans-serif',
            letterSpacing: '1px',
          }}
        >
          JoJo
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          {isAuthenticated() && <Link to="/favorites">Favorites</Link>}
          {isAuthenticated() && <Link to="/history">History</Link>}
          {isAuthenticated() ? (
            <button onClick={handleLogout}>Logout ({user})</button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
