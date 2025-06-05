// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [trendingMovies, setTrendingMovies] = useState([]); // array of { tmdbId, title, poster_path, imdb_id }
  const [trendingTV, setTrendingTV] = useState([]);         // array of { tmdbId, name, poster_path, imdb_id }
  const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    // 1) Fetch trending movies
    fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${tmdbApiKey}`)
      .then((res) => res.json())
      .then(async (data) => {
        // Take top 8, then for each fetch external_ids to get its IMDb ID
        const topMovies = data.results.slice(0, 8);
        const moviesWithImdb = await Promise.all(
          topMovies.map(async (m) => {
            const extRes = await fetch(
              `https://api.themoviedb.org/3/movie/${m.id}/external_ids?api_key=${tmdbApiKey}`
            );
            const extData = await extRes.json();
            return {
              tmdbId: m.id,
              title: m.title,
              poster_path: m.poster_path,
              imdb_id: extData.imdb_id || null
            };
          })
        );
        setTrendingMovies(moviesWithImdb);
      })
      .catch((err) => console.error(err));

    // 2) Fetch trending TV shows
    fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${tmdbApiKey}`)
      .then((res) => res.json())
      .then(async (data) => {
        const topTV = data.results.slice(0, 8);
        const tvWithImdb = await Promise.all(
          topTV.map(async (t) => {
            const extRes = await fetch(
              `https://api.themoviedb.org/3/tv/${t.id}/external_ids?api_key=${tmdbApiKey}`
            );
            const extData = await extRes.json();
            return {
              tmdbId: t.id,
              name: t.name,
              poster_path: t.poster_path,
              imdb_id: extData.imdb_id || null
            };
          })
        );
        setTrendingTV(tvWithImdb);
      })
      .catch((err) => console.error(err));
  }, [tmdbApiKey]);

  return (
    <div className="container">
<h1 style={{ fontFamily: 'JoJoFont, sans-serif', fontSize: '3rem', marginBottom: '10px' }}>
  Welcome to JoJo
</h1>
<p style={{ fontSize: '1.2rem' }}>
  The ultimate JoJo streaming experience—browse movies and TV shows that inspire adventure!
</p>
<div style={{ marginTop: '20px', marginBottom: '30px', lineHeight: '1.6' }}>
        <p>Use the Search page (top menu) to look for any movie or TV show. Click a thumbnail to jump straight to the player.</p>
      </div>
      {/* ===== Trending Movies ===== */}
      <section style={{ marginTop: '30px' }}>
        <h2>Trending Movies</h2>
        {trendingMovies.length === 0 ? (
          <p>Loading movies…</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '16px',
              marginTop: '15px',
            }}
          >
            {trendingMovies.map((m) => (
              <div key={m.tmdbId} className="card">
                {m.imdb_id ? (
                  <Link to={`/player?imdb=${m.imdb_id}`}>
                    <img
                      src={`https://image.tmdb.org/t/p/w300${m.poster_path}`}
                      alt={m.title}
                    />
                    <div className="card-content" style={{ textAlign: 'center' }}>
                      <p>{m.title}</p>
                    </div>
                  </Link>
                ) : (
                  <div style={{ padding: '10px', textAlign: 'center' }}>
                    <p>{m.title}</p>
                    <small>No IMDb ID</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== Trending TV Shows ===== */}
      <section style={{ marginTop: '40px' }}>
        <h2>Trending TV Shows</h2>
        {trendingTV.length === 0 ? (
          <p>Loading shows…</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '16px',
              marginTop: '15px',
            }}
          >
            {trendingTV.map((t) => (
              <div key={t.tmdbId} className="card">
                {t.imdb_id ? (
                  <Link to={`/player?imdb=${t.imdb_id}`}>
                    <img
                      src={`https://image.tmdb.org/t/p/w300${t.poster_path}`}
                      alt={t.name}
                    />
                    <div className="card-content" style={{ textAlign: 'center' }}>
                      <p>{t.name}</p>
                    </div>
                  </Link>
                ) : (
                  <div style={{ padding: '10px', textAlign: 'center' }}>
                    <p>{t.name}</p>
                    <small>No IMDb ID</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
