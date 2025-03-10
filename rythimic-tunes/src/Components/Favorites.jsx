import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import SongCard from './SongCard.jsx';
import { PlayerContext } from '../App.jsx';

function Favorites() {
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
    try {
      await axios.delete(`http://localhost:5000/api/favorites/${song.id}`);
      setFavorites(favorites.filter((fav) => fav.id !== song.id));
    } catch (error) {
      console.error('Error removing from favorites:', error);
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
    <div className="favorites container">
      <h1>Favorites</h1>
      <div className="row">
        {favorites.map((song) => (
          <div className="col" key={song.id}>
            <SongCard
              song={song}
              isFavorite={true}
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
        ))}
      </div>
    </div>
  );
}

export default Favorites;