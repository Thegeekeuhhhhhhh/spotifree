import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { formatTime } from '../utils/helpers';

const TrackItem = ({ track, index, currentTrack, isPlaying, playTrack, toggleLike, likedTracks, volume }) => {
  const [songToPlay, setSongToPlay] = useState("");
  const audioRef = useRef(null);

  console.log(songToPlay);
  
  useEffect(() => {
    if (index === currentTrack && songToPlay) {
      if (isPlaying) {
        audioRef.current?.play();
      } else {
        audioRef.current?.pause();
      }
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrack, songToPlay, index]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  return (
    <div
      onClick={() => {
        playTrack(index);
        if (track.url) {
          const match = track.url.match(/[?&]v=([^&]+)/)?.[1];
          fetch(`http://localhost:4444/fetch/video/${match}`).then(result1 => {
            result1.json().then(result2 => {
              setSongToPlay(result2.name);
              console.log("Downloaded", result2);
            });
          });
        } else {
          setSongToPlay(track.name);
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: index === currentTrack ? '#282828' : 'transparent',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => {
        if (index !== currentTrack) e.currentTarget.style.backgroundColor = '#282828';
      }}
      onMouseLeave={(e) => {
        if (index !== currentTrack) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      
      {index === currentTrack && songToPlay && (
        <audio ref={audioRef} src={`../data/videos/${songToPlay}`} autoPlay />
      )}
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
        {index === currentTrack && isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track?.title}</div>
        <div style={{ fontSize: '14px', color: '#b3b3b3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track?.artist}</div>
      </div>
      <div style={{ fontSize: '14px', color: '#b3b3b3' }}>{track?.album}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleLike(track?.id);
        }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
      >
        <Heart
          size={20}
          style={{ color: likedTracks.has(track.id) ? '#1db954' : '#b3b3b3' }}
          fill={likedTracks.has(track.id) ? '#1db954' : 'none'}
        />
      </button>
      <div style={{ fontSize: '14px', color: '#b3b3b3', width: '48px', textAlign: 'right' }}>{formatTime(track.length)}</div>
    </div>
  );
};

export default TrackItem;