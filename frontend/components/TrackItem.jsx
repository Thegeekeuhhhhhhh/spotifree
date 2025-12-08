// TODO: Downloading error represente l etat de telechargement d une chanson, passez le texte en rouge quand on a une erreur + peut etre mettre une snackbar

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Heart, Ellipsis } from 'lucide-react';
import { formatTime } from '../utils/helpers';
import CircularLoader from '../utils/CircularLoader';

const TrackItem = ({ track, isPlaying, playTrack, toggleLike, likedTracks, volume, currentTrackObj, setCurrentTrackObj, currentTime, setProgress, setIsPlaying, trackList, setTrackList, trackSearch, setTracks, setDraggedTrack, setDragging, setLikedTracks, setErrorMessage, setIsErrorMessage, }) => {  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingError, setDownloadingError] = useState(false);

  const handleDragStart = (e) => {
    setDraggedTrack(track);
    setDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify(track));
    e.target.style.opacity = 0.5;
  };

  const handleDragEnd = (e) => {
    setDragging(false);
    e.target.style.opacity = 1;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    // const droppedTrackId = e.dataTransfer.getData('text/plain');
    // const droppedTrack = trackSearch.find((t) => t.id === droppedTrackId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => {
        if (track.url) {
          setDownloadingError(false);
          setIsDownloading(true);
          const match = track.url.match(/[?&]v=([^&]+)/)?.[1];
          setIsPlaying(false);
          fetch(`http://localhost:4444/fetch/video/${match}`).then(result1 => {
            if (result1.ok) {
              result1.json().then(result2 => {
                const prevTracks = [...trackSearch];
                for (let i = 0; i < prevTracks.length; i++) {
                  if (prevTracks[i].url == track.url) {
                    prevTracks[i] = result2;
                    setTracks(prevTracks);

                    // Can be replaced by post comment
                    setTrackList(prevTracks);
                    // if (trackList?.length > i && trackList[i].url == track.url) {
                    //   const prevTrackList = [...trackSearch];
                    //   prevTrackList[i] = result2;
                    //   setTrackList(prevTrackList);
                    // }
                    break;
                  }
                }

                setIsDownloading(false);
                
                if (result2?.id == currentTrackObj?.id && isPlaying) {
                  setIsPlaying(false);
                } else {
                  setCurrentTrackObj(result2);
                  setProgress(0);
                  setIsPlaying(true);
                  setTrackList(prevTracks);
                }
              });
            } else {
              result1.text().then(result2 => {
                setIsErrorMessage(true);
                setErrorMessage(result2);
              });
            }
          });
        } else {
          playTrack(track.id);
          setCurrentTrackObj(track);
          setTrackList(trackSearch);
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px',
        borderRadius: '8px',
        cursor: 'move',
        backgroundColor: track?.id == currentTrackObj?.id ? '#282828' : 'transparent',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => {
        if (track?.id != currentTrackObj?.id) e.currentTarget.style.backgroundColor = '#282828';
      }}
      onMouseLeave={(e) => {
        if (track?.id != currentTrackObj?.id) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      
      <div style={track.miniature ? {
        width: '48px',
        height: '48px',
        backgroundImage: `url("${track.miniature}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      } : {
        width: '48px',
        height: '48px',
        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {isDownloading ? <CircularLoader size={80} color={'#8d67ab'}></CircularLoader> : track?.id == currentTrackObj?.id && isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: !downloadingError ? "white" : "red" }}>{track?.title}</div>
        <div style={{ fontSize: '14px', color: '#b3b3b3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track?.artist}</div>
      </div>
      <div style={{ fontSize: '14px', color: '#b3b3b3' }}>{track?.album}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (track?.url) {
            const match = track.url.match(/[?&]v=([^&]+)/)?.[1];
            setIsPlaying(false);
            fetch(`http://localhost:4444/fetch/video/${match}`).then(result1 => {
              if (result1.ok) {
                result1.json().then(result2 => {
                  toggleLike(result2.id, true);
                  const prevTracks = [...trackSearch];
                  for (let i = 0; i < prevTracks.length; i++) {
                    if (prevTracks[i].url == track.url) {
                      prevTracks[i] = result2;
                    }
                  }
                  setTracks(prevTracks);
                  setTrackList(prevTracks);
                  setLikedTracks(prev => [...prev, result2.id]);
                });
              } else {
                result1.text().then(result2 => {
                  setIsErrorMessage(true);
                  setErrorMessage(result2);
                });
              }
            });
          } else {
            toggleLike(track.id);
          }
        }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
      >
        <Heart
          size={20}
          style={{ color: likedTracks.filter(e => e == track?.id).length > 0 || track?.liked ? '#1db954' : '#b3b3b3' }}
          fill={likedTracks.filter(e => e == track?.id).length > 0 || track?.liked ? '#1db954' : 'none'}
        />
      </button>
      <button onClick={() => toggleLike(currentTrackObj?.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
        <Ellipsis
          size={24}
          style={{ color: '#b3b3b3' }}
        />
      </button>
      <div style={{ fontSize: '14px', color: '#b3b3b3', width: '48px', textAlign: 'right' }}>{formatTime(track?.length)}</div>
    </div>
  );
};

export default TrackItem;
