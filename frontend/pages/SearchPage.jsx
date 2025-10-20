import React, { useEffect, useState } from 'react';
import { Search, Music } from 'lucide-react';
import TrackItem from '../components/TrackItem';


const SearchPage = ({ tracks, currentTrack, isPlaying, playTrack, toggleLike, likedTracks, searchQuery, setSearchQuery }) => {
  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album.toLowerCase().includes(searchQuery.toLowerCase())
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
          console.log(result2["result"]);
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
            {musics.map((track, idx) => (
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
      )}
    </div>
  );
};

export default SearchPage;