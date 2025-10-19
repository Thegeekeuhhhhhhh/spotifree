import React from 'react';
import { Music } from 'lucide-react';

const LibraryPage = ({ playlists }) => {
  return (
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
  );
};

export default LibraryPage;