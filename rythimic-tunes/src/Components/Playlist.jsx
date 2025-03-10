import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import SongCard from './SongCard.jsx';
import { PlayerContext } from '../App.jsx';

function Playlist() {
  const [favorites, setFavorites] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const { currentSong, isPlaying, isLoading, currentTime, duration, playSong, pauseSong, seekTo } = useContext(PlayerContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [favRes, playlistRes] = await Promise.all([
          axios.get('http://localhost:5000/api/favorites'),
          axios.get('http://localhost:5000/api/playlist'),
        ]);
        setFavorites(favRes.data);
        setPlaylist(playlistRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

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
    try {
      await axios.delete(`http://localhost:5000/api/playlist/${song.id}`);
      setPlaylist(playlist.filter((item) => item.id !== song.id));
    } catch (error) {
      console.error('Error removing from playlist:', error);
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
    <div className="playlist container">
      <h1>Playlist</h1>
      <div className="row">
        {playlist.map((song) => (
          <div className="col" key={song.id}>
            <SongCard
              song={song}
              isFavorite={favorites.some((fav) => fav.id === song.id)}
              isInPlaylist={true}
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
        ))}
      </div>
    </div>
  );
}

export default Playlist;