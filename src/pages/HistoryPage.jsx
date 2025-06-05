// src/pages/HistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../utils/auth';
import { Link } from 'react-router-dom';

export default function HistoryPage() {
  const user = getCurrentUser();
  const [movieHistoryList, setMovieHistoryList] = useState([]); // array of imdbIDs
  const [movieData, setMovieData] = useState([]);               // array of { imdb, title, poster_path }

  const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;

  // 1) On mount: load Movie/TV history from localStorage
  useEffect(() => {
    if (!user) return;
    const mhKey = `history_${user}`;
    const mhSaved = JSON.parse(localStorage.getItem(mhKey) || '[]');
    setMovieHistoryList(mhSaved);
  }, [user]);

  // 2) Fetch Movie/TV details for each IMDb ID in history
  useEffect(() => {
    async function fetchMovieHistoryData() {
      const promises = movieHistoryList.map(async (imdbID) => {
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

    if (movieHistoryList.length) {
      fetchMovieHistoryData();
    } else {
      setMovieData([]);
    }
  }, [movieHistoryList, tmdbApiKey]);

  if (!user) {
    return (
      <div className="container">
        <p>
          You must <Link to="/login">log in</Link> to see your watch history.
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>{user}’s Watch History</h2>

      {/* ===== Movie/TV History Section ===== */}
      <section style={{ marginTop: '20px' }}>
        <h3>Movies &amp; TV Shows</h3>
        {movieData.length === 0 ? (
          <p style={{ marginTop: '10px' }}>
            No movie/TV history yet. Go watch something on <Link to="/search">Search</Link>.
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
