// src/pages/FavoritesPage.jsx
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../utils/auth';
import { Link } from 'react-router-dom';

export default function FavoritesPage() {
  const user = getCurrentUser();
  const [movieFavList, setMovieFavList] = useState([]); // array of imdbIDs
  const [movieData, setMovieData] = useState([]);       // array of { imdb, title, poster_path }

  const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;

  // 1) On mount: load Movie/TV favorites from localStorage
  useEffect(() => {
    if (!user) return;
    const mfKey = `favorites_${user}`;
    const mfSaved = JSON.parse(localStorage.getItem(mfKey) || '[]');
    setMovieFavList(mfSaved);
  }, [user]);

  // 2) Fetch Movie/TV details for each IMDb ID
  useEffect(() => {
    async function fetchMovieFavData() {
      const promises = movieFavList.map(async (imdbID) => {
        const res = await fetch(
          `https://api.themoviedb.org/3/find/${imdbID}?api_key=${tmdbApiKey}&external_source=imdb_id`
        );
        const data = await res.json();
        if (data.movie_results && data.movie_results.length) {
          const m = data.movie_results[0];
          return {
            imdb: imdbID,
            title: m.title,
            poster_path: m.poster_path,
          };
        } else if (data.tv_results && data.tv_results.length) {
          const t = data.tv_results[0];
          return {
            imdb: imdbID,
            title: t.name,
            poster_path: t.poster_path,
          };
        } else {
          return null;
        }
      });
      const results = await Promise.all(promises);
      setMovieData(results.filter((m) => m !== null));
    }

    if (movieFavList.length) {
      fetchMovieFavData();
    } else {
      setMovieData([]);
    }
  }, [movieFavList, tmdbApiKey]);

  if (!user) {
    return (
      <div className="container">
        <p>
          You must <Link to="/login">log in</Link> to see your favorites.
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>{user}’s Favorites</h2>

      {/* ===== Movie/TV Favorites Section ===== */}
      <section style={{ marginTop: '20px' }}>
        <h3>Movies &amp; TV Shows</h3>
        {movieData.length === 0 ? (
          <p style={{ marginTop: '10px' }}>
            No movie/TV favorites yet. Go to <Link to="/search">Search</Link> to add some.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '20px',
              marginTop: '20px',
            }}
          >
            {movieData.map((m) => (
              <div key={m.imdb} className="card">
                <Link to={`/player?imdb=${m.imdb}`}>
                  <img
                    src={
                      m.poster_path
                        ? `https://image.tmdb.org/t/p/w300${m.poster_path}`
                        : 'https://via.placeholder.com/300x450?text=No+Image'
                    }
                    alt={m.title}
                  />
                  <div className="card-content" style={{ textAlign: 'center' }}>
                    <p>{m.title}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
