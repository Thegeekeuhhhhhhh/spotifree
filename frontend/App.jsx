import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import { Route } from './utils/Router';

function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [likedTracks, setLikedTracks] = useState(new Set());
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const audioRef = useRef(null);

  console.log(volume);

  const [tracks, setTracks] = useState([]);

  const playlists = [
    { name: "p1", count: 30 },
    { name: "Liked Songs", count: likedTracks.size },
    { name: "ouais", count: 15 },
  ];

  useEffect(() => {
    fetch(`http://localhost:4444/tracks`).then(result1 => {
      result1.json().then(result2 => {
        console.log(result2["result"]);
        setTracks(result2["result"]);
      });
    });
  }, []);

  console.log(tracks);
  

  useEffect(() => {
    if (isPlaying) {
      const trackDuration = tracks[currentTrack].length;
      setDuration(trackDuration);

      audioRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= trackDuration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (audioRef.current) {
        clearInterval(audioRef.current);
      }
    }

    return () => {
      if (audioRef.current) {
        clearInterval(audioRef.current);
      }
    };
  }, [isPlaying, currentTrack]);

  const handleNext = () => {
    if (repeatMode === 2) {
      setProgress(0);
      return;
    }
    
    let nextTrack;
    if (isShuffle) {
      nextTrack = Math.floor(Math.random() * tracks.length);
    } else {
      nextTrack = (currentTrack + 1) % tracks.length;
    }
    
    setCurrentTrack(nextTrack);
    setProgress(0);
  };

  const handlePrevious = () => {
    if (progress > 5) {
      setProgress(0);
    } else {
      const prevTrack = currentTrack === 0 ? tracks.length - 1 : currentTrack - 1;
      setCurrentTrack(prevTrack);
      setProgress(0);
    }
  };

  const toggleLike = (trackId) => {
    const newLiked = new Set(likedTracks);
    if (newLiked.has(trackId)) {
      newLiked.delete(trackId);
    } else {
      newLiked.add(trackId);
    }
    setLikedTracks(newLiked);
  };

  const playTrack = (index) => {
    setCurrentTrack(index);
    setProgress(0);
    setIsPlaying(true);
  };

  const navigate = (path) => {
    setCurrentPath(path);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', width: "100vw", overflow: "hidden" }}>
      <Sidebar 
        currentPath={currentPath}
        navigate={navigate}
        playlists={playlists}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #5b247a 0%, #000 100%)', width: "100%", overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Route path="/" currentPath={currentPath}>
            <HomePage 
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              playTrack={playTrack}
              toggleLike={toggleLike}
              likedTracks={likedTracks}
              volume={volume}
            />
          </Route>
          <Route path="/search" currentPath={currentPath}>
            <SearchPage 
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              playTrack={playTrack}
              toggleLike={toggleLike}
              likedTracks={likedTracks}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              volume={volume}
            />
          </Route>
          <Route path="/library" currentPath={currentPath}>
            <LibraryPage
              playlists={playlists}
            />
          </Route>
        </div>

        <Player 
          track={tracks[currentTrack]}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          progress={progress}
          setProgress={setProgress}
          duration={duration}
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          isShuffle={isShuffle}
          setIsShuffle={setIsShuffle}
          repeatMode={repeatMode}
          setRepeatMode={setRepeatMode}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          toggleLike={toggleLike}
          likedTracks={likedTracks}
        />
      </div>
    </div>
  );
}

export default App;