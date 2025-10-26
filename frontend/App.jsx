import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { Route } from './utils/Router';
import TrackItem from './components/TrackItem';

import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, Music, Search } from 'lucide-react';
import { formatTime } from './utils/helpers';
import Player from './components/Player';


function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTrackObj, setCurrentTrackObj] = useState(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(40);
  const [oldVolume, setOldVolume] = useState(40);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [likedTracks, setLikedTracks] = useState([]);
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const intervalRef = useRef(null);
  const [tracks, setTracks] = useState([]);

  const [trackList, setTrackList] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState([]);


  const [playlists, setPlaylists] = useState([
    { id: 0, name: "Liked Songs", tracks: likedTracks },
  ]);

  const [playlistCreationPopUp, setPlaylistCreationPopUp] = useState(false);




  const filteredTracks = tracks?.filter(track => 
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
          setTracks(result2["result"]);
        });
      });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);



  useEffect(() => {
    fetch(`http://localhost:4444/tracks`).then(result1 => {
      result1.json().then(result2 => {
        setTracks(result2["result"]);
        setTrackList(result2["result"]);
      });
    });
    fetch(`http://localhost:4444/playlist/list`).then(result1 => {
      result1.json().then(result2 => {
        console.log(result2);
        setPlaylists(prev => [
          ...prev,
          ...result2,
        ]);
      });
    });
  }, []);


  console.log(tracks);
  

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
      nextTrack = Math.floor(Math.random() * trackList.length);
    } else {
      for (let i = 0; i < trackList?.length; i++) {
        if (trackList[i].id == currentTrackObj.id) {
          if (i == trackList.length - 1) {
            nextTrack = trackList[0].id;
          } else {
            nextTrack = trackList[i + 1].id;
          }
        }
      }
    }
    
    setCurrentTrack(nextTrack);
    setCurrentTrackObj(trackList?.filter(e => e.id == nextTrack)[0]);
    setProgress(0);
  };

  const handlePrevious = () => {
    if (progress > 5) {
      setProgress(0);
    } else {
      let prevTrack;
      for (let i = 0; i < trackList?.length; i++) {
        if (trackList[i].id == currentTrackObj.id) {
          if (i == 0) {
            prevTrack = trackList[trackList.length - 1].id;
          } else {
            prevTrack = trackList[i - 1].id;
          }
        }
      }
      setCurrentTrack(prevTrack);
      setCurrentTrackObj(trackList?.filter(e => e.id == prevTrack)[0]);
      setProgress(0);
    }
  };

  console.log(likedTracks);

  const toggleLike = (trackId) => {
    const newLiked = [...likedTracks];
    for (let i = 0; i < newLiked.length; i++) {
      if (newLiked[i] == trackId) {
        newLiked.splice(i, 1);
        setLikedTracks(newLiked);
        return;
      }
    }
    newLiked.push(trackId);
    setLikedTracks(newLiked);
  };

  const playTrack = (id) => {
    if (isPlaying && id == currentTrackObj?.id) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(id);
      setCurrentTrackObj(trackList?.filter(e => e.id == id)[0]);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const navigate = (path) => {
    setCurrentPath(path);
  };

  const [playlistName, setPlaylistName] = useState('');
  console.log(playlistName);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playlistName.trim() !== '') {
      fetch(`http://localhost:4444/playlist/create`, {
        method: "POST",
        body: JSON.stringify({
          name: playlistName
        }),
        headers: {
          "Content-type": "application/json"
        }
      }).then(result1 => {
        result1.json().then(result2 => {
          console.log(result2);
          setPlaylists(prev => [
            ...prev,
            result2,
          ]);
        });
      });
      setPlaylistName('');
      setPlaylistCreationPopUp(false);
    }
  };

  console.log(playlists);

  return (
    <>
      {playlistCreationPopUp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#333', padding: '24px', borderRadius: '8px',
            minWidth: '300px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              Create New Playlist
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Playlist Name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', 
                  backgroundColor: '#222', color: '#fff', fontSize: '16px', marginBottom: '16px'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setPlaylistCreationPopUp(false);
                  }} 
                  style={{
                    padding: '8px 16px', borderRadius: '8px', backgroundColor: '#ccc', border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{
                    padding: '8px 16px', borderRadius: '8px', backgroundColor: '#1db954', color: '#fff', 
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', width: "100vw", overflow: "hidden" }}>
        <Sidebar 
          currentPath={currentPath}
          navigate={navigate}
          playlists={playlists}
          setTracks={setTracks}
          setPlaylistCreationPopUp={setPlaylistCreationPopUp}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #5b247a 0%, #000 100%)', width: "100%", overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Route path="/" currentPath={currentPath}>
              <>
                <div style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Playing Now</h2>
                  <p style={{ color: '#b3b3b3' }}>All your tracks</p>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tracks?.map(track => (
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
                        isSearching={isSearching}
                        setProgress={setProgress}
                        setIsPlaying={setIsPlaying}
                        setTrackList={setTrackList}
                        trackSearch={tracks}
                      />
                    ))}
                  </div>
                </div>
              </>
            </Route>
            <Route path="/search" currentPath={currentPath}>
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
                      {tracks?.length && tracks.length > 0 ? `Found ${tracks.length} track${tracks.length > 1 ? 's' : ''}` : 'No results found'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tracks?.map(track => (
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
                          isSearching={isSearching}
                          setProgress={setProgress}
                          setIsPlaying={setIsPlaying}
                          setTrackList={setTrackList}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Route>
            <Route path="/library" currentPath={currentPath}>
              <div style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Your Library</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {playlists.map(playlist => (
                    <div
                      key={playlist.id}
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
                      onClick={() => {
                        setSelectedPlaylist(playlist);
                        navigate('/playlist')
                      }}
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
                        <div style={{ fontSize: '14px', color: '#b3b3b3' }}>Playlist • {playlist.tracks.length} songs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Route>
            <Route path="/playlist" currentPath={currentPath}>
              <>
                <div style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Playing Now</h2>
                  <p style={{ color: '#b3b3b3' }}>Your favorite tracks</p>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tracks?.map(track => (
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
                        isSearching={isSearching}
                        setProgress={setProgress}
                        setIsPlaying={setIsPlaying}
                        setTrackList={setTrackList}
                        trackSearch={tracks}
                      />
                    ))}
                  </div>
                </div>
              </>
            </Route>
          </div>

          <Player
            setIsPlaying={setIsPlaying}
            isPlaying={isPlaying}
            setProgress={setProgress}
            progress={progress}
            setOldVolume={setOldVolume}
            oldVolume={oldVolume}
            setVolume={setVolume}
            volume={volume}
            setIsMuted={setIsMuted}
            isMuted={isMuted}
            setRepeatMode={setRepeatMode}
            repeatMode={repeatMode}
            currentTrackObj={currentTrackObj}
            toggleLike={toggleLike}
            likedTracks={likedTracks}
            setIsShuffle={setIsShuffle}
            isShuffle={isShuffle}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            duration={duration}
            currentTime={progress}
          />
        </div>
      </div>
    </>
  );
}

export default App;