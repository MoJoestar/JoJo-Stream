// src/utils/auth.js

const USER_KEY = 'streaming_site_user';

export function login(username) {
  if (!username) return false;
  localStorage.setItem(USER_KEY, username);
  return true;
}

export function logout() {
  localStorage.removeItem(USER_KEY);
}

export function getCurrentUser() {
  return localStorage.getItem(USER_KEY);
}

export function isAuthenticated() {
  return !!getCurrentUser();
}
