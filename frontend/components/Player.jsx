import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, Music } from 'lucide-react';
import { formatTime } from '../utils/helpers';

const Player = ({ 
  track, isPlaying, setIsPlaying, progress, setProgress, duration, 
  volume, setVolume, isMuted, setIsMuted, isShuffle, setIsShuffle,
  repeatMode, setRepeatMode, handleNext, handlePrevious, toggleLike, likedTracks
}) => {
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
              <div style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track?.title}</div>
              <div style={{ fontSize: '14px', color: '#b3b3b3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track?.artist}</div>
            </div>
          </div>
          
          <button onClick={() => toggleLike(track?.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
            <Heart
              size={24}
              style={{ color: likedTracks.has(track?.id) ? '#1db954' : '#b3b3b3' }}
              fill={likedTracks.has(track?.id) ? '#1db954' : 'none'}
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

export default Player;