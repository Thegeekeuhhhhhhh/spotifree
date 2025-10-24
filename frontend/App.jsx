import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { Route } from './utils/Router';
import TrackItem from './components/TrackItem';

import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, Music, Search } from 'lucide-react';
import { formatTime } from './utils/helpers';






function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTrackObj, setCurrentTrackObj] = useState(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(40);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [likedTracks, setLikedTracks] = useState(new Set());
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const intervalRef = useRef(null);




  console.log(progress);
































  
  

  
const SearchPage = () => {
  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [isSearching, setIsSearching] = useState(false);
  const [musics, setMusics] = useState([]);


  const genres = [
    { name: 'Pop', colors: ['#e13300', '#dc148c'] },
    { name: 'Rock', colors: ['#27856a', '#1db954'] },
    { name: 'Hip-Hop', colors: ['#8400e7', '#e91429'] },
    { name: 'Electronic', colors: ['#1e3264', '#4687d6'] },
    { name: 'Jazz', colors: ['#e8115b', '#dc148c'] },
    { name: 'Classical', colors: ['#477d95', '#8d67ab'] }
  ];

  useEffect(() => {
    if (searchQuery.trim() == '') return;
    const delayDebounce = setTimeout(() => {
      setIsSearching(true);
      fetch(`http://localhost:4444/search/${searchQuery}`).then(result1 => {
        result1.json().then(result2 => {
          setIsSearching(false);
          setMusics(result2["result"]);
        });
      });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Search</h2>
      
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#b3b3b3' }} />
        <input
          type="text"
          placeholder="What do you want to listen to?"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          style={{
            width: '100%',
            padding: '12px 16px 12px 48px',
            backgroundColor: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '24px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {searchQuery === '' ? (
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Browse all</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {genres.map((genre) => (
              <div
                key={genre.name}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: `linear-gradient(135deg, ${genre.colors[0]} 0%, ${genre.colors[1]} 100%)`,
                  cursor: 'pointer',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {genre.name}
                <Music size={64} style={{ position: 'absolute', right: '-8px', bottom: '-8px', opacity: 0.6, transform: 'rotate(-25deg)' }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            {musics.length > 0 ? `Found ${musics.length} track${musics.length > 1 ? 's' : ''}` : 'No results found'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {musics.map(track => (
              <TrackItem
                key={track.id}
                track={track}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                playTrack={playTrack}
                toggleLike={toggleLike}
                likedTracks={likedTracks}
                volume={volume}
                currentTrackObj={currentTrackObj}
                setCurrentTrackObj={setCurrentTrackObj}
                currentTime={progress}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};















































    const Player = ({trackObj}) => {
    const togglePlay = () => setIsPlaying(!isPlaying);
    
    const handleProgressChange = (e) => {
      const newProgress = parseInt(e.target.value);
      setProgress(newProgress);
    };

    const handleVolumeChange = (e) => {
      const newVolume = parseInt(e.target.value);
      setVolume(newVolume);
      if (newVolume == 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    };

    const toggleMute = () => setIsMuted(!isMuted);
    const toggleRepeat = () => setRepeatMode((repeatMode + 1) % 3);

    return (
      <>
        <div style={{ backgroundColor: '#181818', borderTop: '1px solid #282828', padding: '16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Music size={24} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trackObj?.title}</div>
                <div style={{ fontSize: '14px', color: '#b3b3b3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trackObj?.artist}</div>
              </div>
            </div>
            
            <button onClick={() => toggleLike(trackObj?.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
              <Heart
                size={24}
                style={{ color: likedTracks.has(trackObj?.id) ? '#1db954' : '#b3b3b3' }}
                fill={likedTracks.has(trackObj?.id) ? '#1db954' : 'none'}
              />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: isShuffle ? '#1db954' : '#b3b3b3', padding: 0 }}
              >
                <Shuffle size={20} />
              </button>
              
              <button onClick={handlePrevious} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b3b3b3', padding: 0 }}>
                <SkipBack size={24} />
              </button>
              
              <button
                onClick={togglePlay}
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isPlaying ? <Pause size={24} style={{ color: '#000' }} /> : <Play size={24} style={{ color: '#000', marginLeft: '2px' }} />}
              </button>
              
              <button onClick={handleNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b3b3b3', padding: 0 }}>
                <SkipForward size={24} />
              </button>
              
              <button
                onClick={toggleRepeat}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: repeatMode > 0 ? '#1db954' : '#b3b3b3', padding: 0, position: 'relative' }}
              >
                <Repeat size={20} />
                {repeatMode === 2 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '10px' }}>1</span>
                )}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              <span style={{ fontSize: '12px', color: '#b3b3b3', width: '40px', textAlign: 'right' }}>{formatTime(progress)}</span>
              <input
                type="range"
                min="0"
                max={duration}
                value={progress}
                onChange={handleProgressChange}
                style={{
                  flex: 1,
                  height: '4px',
                  backgroundColor: '#4d4d4d',
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none'
                }}
              />
              <span style={{ fontSize: '12px', color: '#b3b3b3', width: '40px' }}>{formatTime(duration)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button onClick={toggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b3b3b3', padding: 0 }}>
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              style={{
                width: '96px',
                height: '4px',
                backgroundColor: '#4d4d4d',
                borderRadius: '4px',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            />
          </div>
        </div>
        
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 12px;
            background: #fff;
            border-radius: 50%;
            cursor: pointer;
          }
          input[type="range"]::-moz-range-thumb {
            width: 12px;
            height: 12px;
            background: #fff;
            border-radius: 50%;
            cursor: pointer;
            border: none;
          }
        `}</style>
      </>
    );
  };


  const [tracks, setTracks] = useState([]);

  const playlists = [
    { name: "p1", count: 30 },
    { name: "Liked Songs", count: likedTracks.size },
    { name: "ouais", count: 15 },
  ];

  useEffect(() => {
    fetch(`http://localhost:4444/tracks`).then(result1 => {
      result1.json().then(result2 => {
        setTracks(result2["result"]);
      });
    });
  }, []);

  

  useEffect(() => {
    if (isPlaying) {
      const trackDuration = currentTrackObj?.length || 0;
      setDuration(trackDuration);

      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= trackDuration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentTrackObj]);

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
    setCurrentTrackObj(tracks[nextTrack]);
    setProgress(0);
  };

  const handlePrevious = () => {
    if (progress > 5) {
      setProgress(0);
    } else {
      const prevTrack = currentTrack === 0 ? tracks.length - 1 : currentTrack - 1;
      setCurrentTrack(prevTrack);
      setCurrentTrackObj(tracks[prevTrack]);
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

  const playTrack = (id) => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(id);
      setCurrentTrackObj(tracks.filter(e => e.id == id)[0]);
      setProgress(0);
      setIsPlaying(true);
    }
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
            <>
              <div style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Playing Now</h2>
                <p style={{ color: '#b3b3b3' }}>Your favorite tracks</p>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tracks.map(track => (
                    <TrackItem
                      key={track.id}
                      track={track}
                      currentTrack={currentTrack}
                      isPlaying={isPlaying}
                      playTrack={playTrack}
                      toggleLike={toggleLike}
                      likedTracks={likedTracks}
                      volume={volume}
                      currentTrackObj={currentTrackObj}
                      setCurrentTrackObj={setCurrentTrackObj}
                      currentTime={progress}
                    />
                  ))}
                </div>
              </div>
            </>
          </Route>
          <Route path="/search" currentPath={currentPath}>
            <SearchPage />
          </Route>
          <Route path="/library" currentPath={currentPath}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Your Library</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {playlists.map((playlist, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#282828'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Music size={28} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '16px' }}>{playlist.name}</div>
                      <div style={{ fontSize: '14px', color: '#b3b3b3' }}>Playlist • {playlist.count} songs</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Route>
        </div>

        <Player 
          track={tracks[currentTrack]}
        />
      </div>
    </div>
  );
}

export default App;