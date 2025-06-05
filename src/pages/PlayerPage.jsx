// src/pages/PlayerPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';

export default function PlayerPage() {
  const [searchParams] = useSearchParams();
  const imdbID = searchParams.get('imdb'); // e.g. "tt0816692"
  const [mediaType, setMediaType] = useState(null);   // "movie" or "tv"
  const [tmdbId, setTmdbId] = useState(null);         // actual TMDb ID
  const [details, setDetails] = useState(null);       // { title, poster, genres, overview, rating, releaseDate }
  const [error, setError] = useState(null);
  const [inFavorites, setInFavorites] = useState(false);

  // State for which “server” is currently selected
  const [serverList] = useState([
    {
      name: 'VidSrc',
      embedUrl: (imdb) => `https://vidsrc.me/embed/${imdb}`,
    },
    {
      name: 'RapidCloud',
      embedUrl: (imdb) => `https://rapid-cloud.co/e/${imdb}`,
    },
    {
      name: 'VidCloud',
      embedUrl: (imdb) => `https://vidcloud9.com/e/${imdb}`,
    },
    {
      name: 'Fembed',
      embedUrl: (imdb) => `https://www6.fembed.com/v/${imdb}`,
    },
    {
      name: 'StreamTape',
      embedUrl: (imdb) => `https://streamtape.com/e/${imdb}`,
    },
  ]);
  const [currentServer, setCurrentServer] = useState(serverList[0]);

  const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;

  // Record “watch history” in localStorage under key history_{username} (for Movie/TV)
  function recordHistory() {
    const user = getCurrentUser();
    if (!user) return;
    const key = `history_${user}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    if (!existing.includes(imdbID)) {
      existing.push(imdbID);
      localStorage.setItem(key, JSON.stringify(existing));
    }
  }

  // Check if this item is already in Movie/TV favorites
  function checkFavorite() {
    const user = getCurrentUser();
    if (!user) return false;
    const favKey = `favorites_${user}`;
    const favList = JSON.parse(localStorage.getItem(favKey) || '[]');
    return favList.includes(imdbID);
  }

  function toggleFavorite() {
    const user = getCurrentUser();
    if (!user) {
      return alert('Log in first to manage favorites.');
    }
    const favKey = `favorites_${user}`;
    const favList = JSON.parse(localStorage.getItem(favKey) || '[]');
    if (inFavorites) {
      // remove
      const updated = favList.filter((id) => id !== imdbID);
      localStorage.setItem(favKey, JSON.stringify(updated));
      setInFavorites(false);
    } else {
      // add
      favList.push(imdbID);
      localStorage.setItem(favKey, JSON.stringify(favList));
      setInFavorites(true);
    }
  }

  // 1) On mount: if no imdb param, show error. Otherwise find TMDb ID via /find
  useEffect(() => {
    if (!imdbID) {
      setError('No IMDb ID provided. Go back to Search.');
      return;
    }
    fetch(`https://api.themoviedb.org/3/find/${imdbID}?api_key=${tmdbApiKey}&external_source=imdb_id`)
      .then((res) => res.json())
      .then((data) => {
        if (data.movie_results && data.movie_results.length) {
          setMediaType('movie');
          setTmdbId(data.movie_results[0].id);
        } else if (data.tv_results && data.tv_results.length) {
          setMediaType('tv');
          setTmdbId(data.tv_results[0].id);
        } else {
          setError('Item not found in TMDb.');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to find item.');
      });
  }, [imdbID, tmdbApiKey]);

  // 2) Once we have mediaType & tmdbId, fetch full details
  useEffect(() => {
    if (!mediaType || !tmdbId) return;
    const url =
      mediaType === 'movie'
        ? `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbApiKey}&language=en-US`
        : `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${tmdbApiKey}&language=en-US`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const d = {
          title: mediaType === 'movie' ? data.title : data.name,
          poster: data.poster_path,
          genres: data.genres, // array of { id, name }
          overview: data.overview,
          rating: data.vote_average,
          releaseDate: mediaType === 'movie' ? data.release_date : data.first_air_date,
        };
        setDetails(d);
        recordHistory();
        setInFavorites(checkFavorite());
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load details.');
      });
  }, [mediaType, tmdbId, tmdbApiKey]);

  if (error) {
    return (
      <div className="container">
        <p style={{ color: 'red' }}>{error}</p>
        <p>← Go back to <a href="/search">Search</a></p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="container">
        <p>Loading details…</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* ===== Movie/Show Info Section ===== */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        {/* Poster Container */}
        <div
          style={{
            flexShrink: 0,
            width: '200px',
            marginBottom: '20px',
          }}
        >
          <img
            src={
              details.poster
                ? `https://image.tmdb.org/t/p/w300${details.poster}`
                : 'https://via.placeholder.com/300x450?text=No+Image'
            }
            alt={details.title}
            style={{ width: '100%', borderRadius: '6px' }}
          />
        </div>

        {/* Text Details Container */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h2>{details.title}</h2>
          <p><strong>Release Date:</strong> {details.releaseDate}</p>
          <p><strong>Rating:</strong> {details.rating} / 10</p>
          <p>
            <strong>Genres:</strong>{' '}
            {details.genres.map((g) => g.name).join(', ')}
          </p>
          <div style={{ marginTop: '10px', maxWidth: '600px' }}>
            <p>{details.overview}</p>
          </div>

          {/* Add/Remove from Favorites */}
          <button onClick={toggleFavorite} style={{ marginTop: '20px' }}>
            {inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
        </div>
      </div>

      {/* ===== Server Selection & Player Embed ===== */}
      <div style={{ marginTop: '30px' }}>
        <h3>Choose a Server to Play:</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          {serverList.map((srv, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentServer(srv)}
              style={{
                backgroundColor:
                  srv.name === currentServer.name
                    ? 'var(--color-primary)'
                    : 'var(--color-accent)',
              }}
            >
              {srv.name}
            </button>
          ))}
        </div>
        <div style={{ width: '100%', height: '500px' }}>
          <iframe
            src={currentServer.embedUrl(imdbID)}
            title={`Player-${imdbID}`}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}
