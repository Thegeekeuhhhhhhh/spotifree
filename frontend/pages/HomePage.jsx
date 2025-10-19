import React from 'react';
import TrackItem from '../components/TrackItem';

const HomePage = ({ tracks, currentTrack, isPlaying, playTrack, toggleLike, likedTracks }) => {
  return (
    <>
      <div style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Playing Now</h2>
        <p style={{ color: '#b3b3b3' }}>Your favorite tracks</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tracks.map((track, idx) => (
            <TrackItem
              key={track.id}
              track={track}
              index={idx}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              playTrack={playTrack}
              toggleLike={toggleLike}
              likedTracks={likedTracks}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;