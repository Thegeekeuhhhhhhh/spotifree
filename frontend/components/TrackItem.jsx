import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { formatTime } from '../utils/helpers';

const TrackItem = ({ track, isPlaying, playTrack, toggleLike, likedTracks, volume, currentTrackObj, setCurrentTrackObj, currentTime, setProgress, setIsPlaying, setTrackList, trackSearch }) => {
  // const audioRef = useRef(null);

  // useEffect(() => {
  //   if (track?.id === currentTrackObj?.id) {
  //     if (isPlaying) {
  //       audioRef.current?.play();
  //     } else {
  //       audioRef.current?.pause();
  //     }
  //   } else {
  //     audioRef.current?.pause();
  //   }
  // }, [isPlaying, currentTrackObj]);

  // useEffect(() => {
  //   if (audioRef.current) {
  //     audioRef.current.currentTime = currentTime;
  //   }
  // }, [currentTime]);

  // useEffect(() => {
  //   if (audioRef.current) {
  //     audioRef.current.volume = volume / 100;
  //   }
  // }, [volume]);

  return (
    <div
      onClick={() => {
        playTrack(track.id);
        if (track.url) {
          const match = track.url.match(/[?&]v=([^&]+)/)?.[1];
          fetch(`http://localhost:4444/fetch/video/${match}`).then(result1 => {
            result1.json().then(result2 => {
              setCurrentTrackObj(result2);
              setProgress(0);
              setIsPlaying(true);
              setTrackList(trackSearch)
              console.log("Downloaded", result2.title);
            });
          });
        } else {
          setCurrentTrackObj(track);
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px',
        borderRadius: '8px',
        cursor: 'pointer',
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
        {track?.id == currentTrackObj?.id && isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track?.title}</div>
        <div style={{ fontSize: '14px', color: '#b3b3b3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track?.artist}</div>
      </div>
      <div style={{ fontSize: '14px', color: '#b3b3b3' }}>{track?.album}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log(track);
          if (track?.url) {
            const match = track.url.match(/[?&]v=([^&]+)/)?.[1];
            fetch(`http://localhost:4444/fetch/video/${match}`).then(result1 => {
              result1.json().then(result2 => {
                console.log(result2);
                toggleLike(result2.id);
                console.log("Downloaded", result2.title);
              });
            });
          } else if (track?.name) {
            toggleLike(track.id);
          }
        }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
      >
        <Heart
          size={20}
          style={{ color: likedTracks.filter(e => e == track.id).length > 0 ? '#1db954' : '#b3b3b3' }}
          fill={likedTracks.filter(e => e == track.id).length > 0 ? '#1db954' : 'none'}
        />
      </button>
      <div style={{ fontSize: '14px', color: '#b3b3b3', width: '48px', textAlign: 'right' }}>{formatTime(track?.length)}</div>
    </div>
  );
};

export default TrackItem;