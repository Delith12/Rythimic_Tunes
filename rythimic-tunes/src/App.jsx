import React, { createContext, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './Components/Sidebar.jsx';
import Songs from './Components/Songs.jsx';
import Favorites from './Components/Favorites.jsx';
import Playlist from './Components/Playlist.jsx';
import './App.css';

export const PlayerContext = createContext();

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else if (!playerRef.current) {
      initPlayer();
    }
  }, []);

  const initPlayer = () => {
    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      height: '0',
      width: '0',
      playerVars: { autoplay: 0, controls: 0, showinfo: 0, rel: 0 },
      events: {
        onReady: () => {
          const savedSong = JSON.parse(localStorage.getItem('currentSong'));
          const savedIsPlaying = localStorage.getItem('isPlaying') === 'true';
          if (savedSong && savedIsPlaying) {
            playSong(savedSong);
          }
        },
        onStateChange: (event) => {
          switch (event.data) {
            case window.YT.PlayerState.PLAYING:
              setIsPlaying(true);
              localStorage.setItem('isPlaying', 'true');
              setDuration(event.target.getDuration());
              const updateTime = () => {
                setCurrentTime(event.target.getCurrentTime());
                if (playerRef.current?.getPlayerState() === window.YT.PlayerState.PLAYING) {
                  requestAnimationFrame(updateTime);
                }
              };
              requestAnimationFrame(updateTime);
              break;
            case window.YT.PlayerState.PAUSED:
              setIsPlaying(false);
              localStorage.setItem('isPlaying', 'false');
              break;
            case window.YT.PlayerState.ENDED:
              setIsPlaying(false);
              break;
            default:
              break;
          }
        },
        onError: (event) => {
          console.error('Player error:', event.data);
          setIsPlaying(false);
          setIsLoading(false);
        },
      },
    });
  };

  const playSong = async (song) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/youtube/${encodeURIComponent(song.title)}/${encodeURIComponent(song.singer)}`);
      const { videoId } = await response.json();
      if (playerRef.current) {
        playerRef.current.loadVideoById({ videoId, startSeconds: 0 });
        setCurrentSong(song);
        localStorage.setItem('currentSong', JSON.stringify(song));
        setIsPlaying(true);
        setCurrentTime(0);
      }
    } catch (error) {
      console.error('Error playing song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pauseSong = () => {
    if (playerRef.current && isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      localStorage.setItem('isPlaying', 'false');
    }
  };

  const seekTo = (time) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
      if (!isPlaying) {
        playerRef.current.playVideo();
        setIsPlaying(true);
        localStorage.setItem('isPlaying', 'true');
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const playerContextValue = {
    currentSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    playSong,
    pauseSong,
    seekTo,
    formatTime,
  };

  return (
    <PlayerContext.Provider value={playerContextValue}>
      <Router>
        <div className="app">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Songs />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/playlist" element={<Playlist />} />
            </Routes>
          </div>
          {currentSong && (
            <div className="current-song-bar">
              <div className="song-info">
                <span className="song-title">{currentSong.title}</span>
                <span className="song-singer">{currentSong.singer}</span>
              </div>
              <div className="player-controls">
                <button className="btn btn-primary" onClick={() => (isPlaying ? pauseSong() : playSong(currentSong))}>
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <div className="track-container">
                  <input
                    type="range"
                    className="track-bar"
                    min="0"
                    max={duration || 100}
                    value={currentTime || 0}
                    onChange={(e) => seekTo(parseFloat(e.target.value))}
                  />
                  <span className="track-time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Router>
      <div ref={playerContainerRef} style={{ display: 'none' }} />
    </PlayerContext.Provider>
  );
}

export default App;