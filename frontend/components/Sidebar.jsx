import React from 'react';
import { Music, Search, Home, Library } from 'lucide-react';

const DropZone = ({ onDrop, name, tracksNumber }) => {
  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{ border: '1px dashed #ddd' }}
    >
      <div style={{ color: '#b3b3b3', cursor: 'pointer' }}>
        <div style={{ fontWeight: '500' }}>{name}</div>
        <div style={{ fontSize: '12px' }}>{tracksNumber} song{tracksNumber == 1 ? '' : 's'}</div>
      </div>
    </div>
  );
};

const Sidebar = ({ currentPath, navigate, playlists, setTracks, setPlaylistCreationPopUp, setSelectedPlaylist, tracks, dragging, setPlaylists }) => {
  return (
    <div style={{ width: "240px", backgroundColor: '#000', padding: '24px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Music style={{ color: '#1db954' }} size={32} />
          Spotifree
        </h1>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => {
              if (navigate('/')) {
                fetch("http://localhost:4444/tracks").then(result1 => {
                  result1.json().then(result2 => {
                    setTracks(result2);
                  })
                })
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: currentPath === '/' ? '#fff' : '#b3b3b3',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: currentPath === '/' ? '600' : '400',
              padding: '8px 0',
              textAlign: 'left'
            }}
          >
            <Home size={24} />
            Home
          </button>
          <button
            onClick={() => {
              if (navigate('/search')) {
                setTracks([]);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: currentPath === '/search' ? '#fff' : '#b3b3b3',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: currentPath === '/search' ? '600' : '400',
              padding: '8px 0',
              textAlign: 'left'
            }}
          >
            <Search size={24} />
            Search
          </button>
          <button
            onClick={() => navigate('/library')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: currentPath === '/library' ? '#fff' : '#b3b3b3',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: currentPath === '/library' ? '600' : '400',
              padding: '8px 0',
              textAlign: 'left'
            }}
          >
            <Library size={24} />
            Your Library
          </button>
        </nav>
      </div>

      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#b3b3b3', marginBottom: '12px', letterSpacing: '0.1em' }}>
          {"PLAYLISTS "}
          <button onClick={() => {
            setPlaylistCreationPopUp(true);
          }}>
            NEW +
          </button>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {playlists.map(playlist => (
            dragging ? (
              <DropZone
                key={playlist.id}
                onDrop={(e) => {
                  const droppedTrackId = e.dataTransfer.getData('text/plain');
                  fetch(`http://localhost:4444/playlist/update`, {
                    method: "POST",
                    body: JSON.stringify({
                      track: droppedTrackId,
                      playlist_id: playlist.id,
                    }),
                    headers: {
                      "Content-type": "application/json"
                    }
                  }).then(result1 => {
                    result1.json().then(result2 => {
                      const oldPlaylists = [...playlists];
                      for (let i = 0; i < oldPlaylists.length; i++) {
                        if (oldPlaylists[i].id == playlist.id) {
                          oldPlaylists[i]["tracks"] = result2;
                        }
                      }
                      setPlaylists(oldPlaylists);
                    });
                  });
                }}
                name={playlist.name}
                tracksNumber={playlist.tracks?.length}
              /> ) : (
              <div onClick={() => {
                navigate('/playlist');
                setSelectedPlaylist(playlist);
                setTracks(playlist.tracks);
                fetch(`http://localhost:4444/playlist/get/${playlist.id}`).then(result1 => {
                  result1.json().then(result2 => {
                    setSelectedPlaylist(result2);
                  });
                });
              }}
              key={playlist.id} style={{ color: '#b3b3b3', cursor: 'pointer' }}>
                <div style={{ fontWeight: '500' }}>{playlist.name}</div>
                <div style={{ fontSize: '12px' }}>{playlist.tracks?.length} song{playlist.tracks?.length == 1 ? '' : 's'}</div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;