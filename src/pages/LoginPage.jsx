// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../utils/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  // If already logged in, send to home
  if (isAuthenticated()) {
    navigate('/');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) {
      return alert('Enter a valid username.');
    }
    login(username.trim());
    navigate('/'); // send them to home after login
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Pick any name"
          />
        </label>
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}
