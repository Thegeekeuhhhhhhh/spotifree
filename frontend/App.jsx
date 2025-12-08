import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { Route } from './utils/Router';
import TrackItem from './components/TrackItem';

import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, Music, Search } from 'lucide-react';
import { formatTime } from './utils/helpers';
import Player from './components/Player';
import CircularProgressBar from './utils/CircularLoader';
import CircularLoader from './utils/CircularLoader';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';

function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackObj, setCurrentTrackObj] = useState(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(10);
  const [oldVolume, setOldVolume] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [likedTracks, setLikedTracks] = useState([]);
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const intervalRef = useRef(null);
  const [tracks, setTracks] = useState([]);

  const [draggedTrack, setDraggedTrack] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [trackList, setTrackList] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState([]);


  const [playlists, setPlaylists] = useState([]);

  const [playlistCreationPopUp, setPlaylistCreationPopUp] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorMessage, setIsErrorMessage] = useState(false);

  // const filteredTracks = tracks?.filter(track => 
  //   track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   track.author.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const [isSearching, setIsSearching] = useState(false);
  const [musics, setMusics] = useState([]);


  const genres = [
    /* TODO: Check ca, peut etre devoir 
    { name: 'Pop', colors: ['#e13300', '#dc148c'] },
    { name: 'Rock', colors: ['#27856a', '#1db954'] },
    { name: 'Hip-Hop', colors: ['#8400e7', '#e91429'] },
    { name: 'Electronic', colors: ['#1e3264', '#4687d6'] },
    { name: 'Jazz', colors: ['#e8115b', '#dc148c'] },
    { name: 'Classical', colors: ['#477d95', '#8d67ab'] }
    */
  ];

  useEffect(() => {
    if (searchQuery.trim() == '') return;
    const delayDebounce = setTimeout(() => {
      setIsSearching(true);
      fetch(`http://localhost:4444/search/${searchQuery}`).then(result1 => {
        if (result1.ok) {
          result1.json().then(result2 => {
            setIsSearching(false);
            setTracks(result2);
          });
        } else {
          result1.text().then(result2 => {
            setIsErrorMessage(true);
            setErrorMessage(result2);
          });
        }
      });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    for (let i = 0; i < playlists.length; i++) {
      if (playlists[i].id == 0) {
        setLikedTracks(playlists[i].tracks.map(e => e.id));
        break;
      }
    }
  }, [playlists]);

  useEffect(() => {
    if (currentTrackObj?.id) {
      setIsPlaying(true);
    }
  }, [currentTrackObj]);

  useEffect(() => {
    fetch(`http://localhost:4444/tracks`).then(result1 => {
      if (result1.ok) {
        result1.json().then(result2 => {
          setTracks(result2);
        });
      } else {
        result1.text().then(result2 => {
          setIsErrorMessage(true);
          setErrorMessage(result2);
        });
      }
    });
    fetch(`http://localhost:4444/playlist/list`).then(result1 => {
      if (result1.ok) {
        result1.json().then(result2 => {
          setPlaylists(result2);
          fetch(`http://localhost:4444/playlist/get/0`).then(result3 => {
            if (result3.ok) {
              result3.json().then(result4 => {
                setLikedTracks(result4.tracks.map(e => e.id));
              });
            } else {
              result3.text().then(result4 => {
                setIsErrorMessage(true);
                setErrorMessage(result4);
              });
            }
          });
        });
      } else {
        result1.text().then(result2 => {
          setIsErrorMessage(true);
          setErrorMessage(result2);
        });
      }
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
      nextTrack = Math.floor(Math.random() * trackList.length);
    } else {
      for (let i = 0; i < trackList?.length; i++) {
        if (trackList[i].id == currentTrackObj?.id) {
          if (i == trackList.length - 1) {
            nextTrack = trackList[0].id;
          } else {
            nextTrack = trackList[i + 1].id;
          }
        }
      }
    }

    const track = trackList?.filter(e => e.id == nextTrack)[0];
    if (track?.url) {
      const match = track.url.match(/[?&]v=([^&]+)/)?.[1];
      setIsPlaying(false);
      fetch(`http://localhost:4444/fetch/video/${match}`).then(result1 => {
        if (result1.ok) {
          result1.json().then(result2 => {
            const prevTracks = [...tracks];
            for (let i = 0; i < prevTracks.length; i++) {
              if (prevTracks[i].url == track.url) {
                prevTracks[i] = result2;
              }
            }
            setTracks(prevTracks);
            setTrackList(prevTracks);
            setCurrentTrackObj(result2);
            // setIsPlaying(true);
            setProgress(0);
          });
        } else {
          result1.text().then(result2 => {
            setIsErrorMessage(true);
            setErrorMessage(result2);
          });
        }
      });
    } else {
      setCurrentTrackObj(track);
      setProgress(0);
    }
  };

  const handlePrevious = () => {
    if (progress > 5) {
      setProgress(0);
    } else {
      let prevTrack;
      // TODO: Think about a stack that memorizes all played songs
      // Actual problem: If shuffle is on, you can't listen to previous song
      for (let i = 0; i < trackList?.length; i++) {
        if (trackList[i].id == currentTrackObj.id) {
          if (i == 0) {
            prevTrack = trackList[trackList.length - 1].id;
          } else {
            prevTrack = trackList[i - 1].id;
          }
        }
      }
      const track = trackList?.filter(e => e.id == prevTrack)[0];
      if (track?.url) {
        const match = track.url.match(/[?&]v=([^&]+)/)?.[1];
        setIsPlaying(false);
        fetch(`http://localhost:4444/fetch/video/${match}`).then(result1 => {
          if (result1.ok) {
            result1.json().then(result2 => {
              const prevTracks = [...tracks];
              for (let i = 0; i < prevTracks.length; i++) {
                if (prevTracks[i].url == track.url) {
                  prevTracks[i] = result2;
                }
              }
              setTracks(prevTracks);
              setTrackList(prevTracks);
              setCurrentTrackObj(result2);
              // setIsPlaying(true);
              setProgress(0);
            });
          } else {
            result1.text().then(result2 => {
              setIsErrorMessage(true);
              setErrorMessage(result2);
            });
          }
        });
      } else {
        setCurrentTrackObj(track);
        setProgress(0);
      }
    }
  };

  const toggleLike = (trackId, justFetched=false) => {
    for (let i = 0; i < likedTracks.length; i++) {
      if (likedTracks[i] == trackId) {
        // Fetch delete + update playlists
        fetch(`http://localhost:4444/playlist/delete`, {
          method: "DELETE",
          body: JSON.stringify({
            track: trackId,
            playlist_id: 0,
          }),
          headers: {
            "Content-type": "application/json"
          }
        }).then(result1 => {
          if (result1.ok) {
            result1.json().then(result2 => {
              setLikedTracks(result2);
              fetch(`http://localhost:4444/playlist/get/0`).then(result3 => {
                if (result3.ok) {
                  result3.json().then(result4 => {
                    const oldPlaylists = [...playlists];
                    for (let i = 0; i < oldPlaylists.length; i++) {
                      if (oldPlaylists[i].id == 0) {
                        oldPlaylists[i] = result4;
                      }
                    }
                    setPlaylists(oldPlaylists);
                  });
                } else {
                  result3.text().then(result4 => {
                    setIsErrorMessage(true);
                    setErrorMessage(result4);
                  });
                }
              });
            });
          } else {
            result1.text().then(result2 => {
              setIsErrorMessage(true);
              setErrorMessage(result2);
            });
          }
        });
        return;
      }
    }

    fetch(`http://localhost:4444/playlist/update`, {
      method: "POST",
      body: JSON.stringify({
        track: trackId,
        playlist_id: 0,
      }),
      headers: {
        "Content-type": "application/json"
      }
    }).then(result1 => {
      if (result1.ok) {
        result1.json().then(result2 => {
          fetch(`http://localhost:4444/playlist/get/0`).then(result3 => {
            if (result3.ok) {
              result3.json().then(result4 => {
                const oldPlaylists = [...playlists];
                for (let i = 0; i < oldPlaylists.length; i++) {
                  if (oldPlaylists[i].id == 0) {
                    oldPlaylists[i] = result4;
                  }
                }
                setPlaylists(oldPlaylists);
              });
            } else {
              result3.text().then(result4 => {
                setIsErrorMessage(true);
                setErrorMessage(result4);
              });
            }
          });
        });
      } else {
        result1.text().then(result2 => {
          setIsErrorMessage(true);
          setErrorMessage(result2);
        });
      }
    });
  };

  const playTrack = (id) => {
    if (isPlaying && id == currentTrackObj?.id) {
      setIsPlaying(false);
    } else {
      setCurrentTrackObj(trackList?.filter(e => e.id == id)[0]);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const navigate = (path) => {
    if (currentPath != path) {
      setCurrentPath(path);
      return true;
    }
    return false;
  };

  const [playlistName, setPlaylistName] = useState('');

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
        if (result1.ok) {
          result1.json().then(result2 => {
            setPlaylists(prev => [
              ...prev,
              result2,
            ]);
          });
        } else {
          result1.text().then(result2 => {
            setIsErrorMessage(true);
            setErrorMessage(result2);
          });
        }
      });
      setPlaylistName('');
      setPlaylistCreationPopUp(false);
    }
  };


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
          setSelectedPlaylist={setSelectedPlaylist}
          tracks={tracks}
          dragging={dragging}
          setPlaylists={setPlaylists}
          setLikedTracks={setLikedTracks}
          toggleLike={toggleLike}
          trackSearch={tracks}
          setErrorMessage={setErrorMessage}
          setIsErrorMessage={setIsErrorMessage}
          setTrackList={setTrackList}
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
                        trackList={trackList}
                        setTrackList={setTrackList}
                        trackSearch={tracks}
                        setDraggedTrack={setDraggedTrack}
                        setDragging={setDragging}
                        setTracks={setTracks}
                        setLikedTracks={setLikedTracks}
                        setErrorMessage={setErrorMessage}
                        setIsErrorMessage={setIsErrorMessage}
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
                    placeholder="What do you want to listen to ?"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                    }}
                    style={{
                      width: '90%',
                      right: "16px",
                      padding: '12px 0px 12px 40px',
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
                    {/* <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Browse all</h3>
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
                    </div> */}
                  </div>
                ) : (
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                      {tracks?.length && tracks.length > 0 ? `Found ${tracks.length} track${tracks.length > 1 ? 's' : ''}` :
                      isSearching ? <CircularLoader></CircularLoader> : 'No results found'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tracks?.map(track => (
                        <TrackItem
                          key={track.id}
                          track={track}
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
                          trackList={trackList}
                          setTrackList={setTrackList}
                          trackSearch={tracks}
                          setDraggedTrack={setDraggedTrack}
                          setDragging={setDragging}
                          setTracks={setTracks}
                          setLikedTracks={setLikedTracks}
                          setErrorMessage={setErrorMessage}
                          setIsErrorMessage={setIsErrorMessage}
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
                  {playlists?.map(playlist => (
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
                        if (navigate('/playlist')) {
                          if (playlist.id != 0) {
                            fetch(`http://localhost:4444/playlist/get/${playlist.id}`).then(result1 => {
                              if (result1.ok) {
                                result1.json().then(result2 => {
                                  setSelectedPlaylist(result2);
                                });
                              } else {
                                result1.text().then(result2 => {
                                  setIsErrorMessage(true);
                                  setErrorMessage(result2);
                                });
                              }
                            });
                          }
                        }
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
                        <div style={{ fontSize: '14px', color: '#b3b3b3' }}>Playlist • {playlist.tracks?.length} song{playlist.tracks?.length == 1 ? '' : 's'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Route>
            <Route path="/playlist" currentPath={currentPath}>
              <>
                <div style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{selectedPlaylist?.name}</h2>
                  {/* <p style={{ color: '#b3b3b3' }}>All your tracks</p> */}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedPlaylist?.tracks?.map(track => (
                      <TrackItem
                        key={track.id}
                        track={track}
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
                        trackList={trackList}
                        setTrackList={setTrackList}
                        trackSearch={[...selectedPlaylist.tracks]}
                        setDraggedTrack={setDraggedTrack}
                        setDragging={setDragging}
                        setTracks={() => {}}
                        setLikedTracks={setLikedTracks}
                        setErrorMessage={setErrorMessage}
                        setIsErrorMessage={setIsErrorMessage}
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
            setErrorMessage={setErrorMessage}
            setIsErrorMessage={setIsErrorMessage}
          />
          <Snackbar
            open={isErrorMessage}
            autoHideDuration={4000}
            onClose={() => {
              setErrorMessage("");
              setIsErrorMessage(false);
            }}
            message={errorMessage}
          />
        </div>
      </div>
    </>
  );
}

export default App;