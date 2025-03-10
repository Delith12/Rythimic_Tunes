import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import SongCard from './SongCard.jsx';
import { PlayerContext } from '../App.jsx';

function Songs() {
  const [allSongs, setAllSongs] = useState([]);
  const [displayedSongs, setDisplayedSongs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentSong, isPlaying, isLoading, currentTime, duration, playSong, pauseSong, seekTo } = useContext(PlayerContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsRes, favRes, playlistRes] = await Promise.all([
          axios.get('http://localhost:5000/api/songs'),
          axios.get('http://localhost:5000/api/favorites'),
          axios.get('http://localhost:5000/api/playlist'),
        ]);
        const songs = songsRes.data;
        setAllSongs(songs);
        setFavorites(favRes.data);
        setPlaylist(playlistRes.data);
        setDisplayedSongs(songs.slice(0, 12));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setDisplayedSongs(allSongs.slice(0, 12));
    } else {
      const filtered = allSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(term.toLowerCase()) ||
          song.singer.toLowerCase().includes(term.toLowerCase()) ||
          song.category.toLowerCase().includes(term.toLowerCase())
      );
      setDisplayedSongs(filtered);
    }
  };

  const toggleFavorite = async (song) => {
    const isFavorite = favorites.some((fav) => fav.id === song.id);
    try {
      if (isFavorite) {
        await axios.delete(`http://localhost:5000/api/favorites/${song.id}`);
        setFavorites(favorites.filter((fav) => fav.id !== song.id));
      } else {
        await axios.post('http://localhost:5000/api/favorites', song);
        setFavorites([...favorites, song]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const togglePlaylist = async (song) => {
    const isInPlaylist = playlist.some((item) => item.id === song.id);
    try {
      if (isInPlaylist) {
        await axios.delete(`http://localhost:5000/api/playlist/${song.id}`);
        setPlaylist(playlist.filter((item) => item.id !== song.id));
      } else {
        await axios.post('http://localhost:5000/api/playlist', song);
        setPlaylist([...playlist, song]);
      }
    } catch (error) {
      console.error('Error toggling playlist:', error);
    }
  };

  const handlePlay = (song) => {
    if (currentSong?.id === song.id && isPlaying) {
      pauseSong();
    } else {
      playSong(song);
    }
  };

  return (
    <div className="songs container">
      <input
        type="text"
        placeholder="Search by title, singer, or category"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-bar full-width"
      />
      <div className="row">
        {displayedSongs.length === 0 && searchTerm.trim() === '' ? (
          <p>Loading songs...</p>
        ) : (
          displayedSongs.map((song) => (
            <div className="col" key={song.id}>
              <SongCard
                song={song}
                isFavorite={favorites.some((fav) => fav.id === song.id)}
                isInPlaylist={playlist.some((item) => item.id === song.id)}
                onToggleFavorite={toggleFavorite}
                onTogglePlaylist={togglePlaylist}
                onPlay={() => handlePlay(song)}
                isPlaying={currentSong?.id === song.id && isPlaying}
                isLoading={currentSong?.id === song.id && isLoading}
                currentTime={currentSong?.id === song.id ? currentTime : 0}
                duration={currentSong?.id === song.id ? duration : 0}
                onSeek={seekTo}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Songs;