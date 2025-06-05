// src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);      // array of { imdb_id, title, poster_path, media_type }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;

  // KEY under which we'll store the last search string
  const LAST_QUERY_KEY = 'lastSearchQuery';

  // On mount: if there’s a saved query in localStorage or a ?default= param, use it
  useEffect(() => {
    const pref = searchParams.get('default');
    if (pref) {
      setQuery(pref);
      doSearch(pref);
      return;
    }
    const saved = localStorage.getItem(LAST_QUERY_KEY);
    if (saved) {
      setQuery(saved);
      doSearch(saved);
    }
  }, [searchParams]);

  // When user submits a search, save the query and run doSearch()
  async function doSearch(q) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);

    // Save into localStorage so that if user navigates back, we can re-populate
    localStorage.setItem(LAST_QUERY_KEY, q.trim());

    try {
      // TMDb multi-search
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${encodeURIComponent(q.trim())}`
      );
      const data = await res.json();
      // Filter only movies and tv
      const filtered = data.results.filter(
        (item) => item.media_type === 'movie' || item.media_type === 'tv'
      );

      // For each, fetch its IMDb ID
      const withImdb = await Promise.all(
        filtered.map(async (item) => {
          let imdb_id = null;
          if (item.media_type === 'movie') {
            const extRes = await fetch(
              `https://api.themoviedb.org/3/movie/${item.id}/external_ids?api_key=${tmdbApiKey}`
            );
            const extData = await extRes.json();
            imdb_id = extData.imdb_id || null;
          } else if (item.media_type === 'tv') {
            const extRes = await fetch(
              `https://api.themoviedb.org/3/tv/${item.id}/external_ids?api_key=${tmdbApiKey}`
            );
            const extData = await extRes.json();
            imdb_id = extData.imdb_id || null;
          }
          return {
            imdb_id,
            title: item.media_type === 'movie' ? item.title : item.name,
            poster_path: item.poster_path,
            media_type: item.media_type,
          };
        })
      );

      // Keep only entries that have a valid IMDb ID
      setResults(withImdb.filter((i) => i.imdb_id));
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    doSearch(query);
  }

  return (
    <div className="container">
      <h2>Search Movies &amp; TV Shows</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Type a movie or series name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p style={{ marginTop: '20px' }}>Searching…</p>}
      {error && <p style={{ marginTop: '20px', color: 'red' }}>{error}</p>}

      { !loading && results.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '16px',
            marginTop: '25px',
          }}
        >
          {results.map((item, idx) => (
            <div key={idx} className="card">
              <Link to={`/player?imdb=${item.imdb_id}`}>
                <img
                  src={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                      : 'https://via.placeholder.com/300x450?text=No+Image'
                  }
                  alt={item.title}
                />
                <div className="card-content" style={{ textAlign: 'center' }}>
                  <p>{item.title}</p>
                  <small style={{ opacity: 0.75 }}>
                    {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                  </small>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      { !loading && results.length === 0 && query.trim() !== '' && !error && (
        <p style={{ marginTop: '20px' }}>No results found for “{query}.”</p>
      )}
    </div>
  );
}
