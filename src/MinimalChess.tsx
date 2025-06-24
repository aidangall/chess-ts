import React from 'react';

const MinimalChess: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Minimal Chess</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(8, 50px)',
        gridTemplateRows: 'repeat(8, 50px)',
        width: '400px',
        margin: '0 auto',
        border: '2px solid black'
      }}>
        {Array.from({ length: 64 }, (_, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          const isBlack = (row + col) % 2 === 1;
          
          return (
            <div key={i} style={{ 
              backgroundColor: isBlack ? '#b58863' : '#f0d9b5',
              width: '50px', 
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Just display text for pieces */}
              {row === 0 && (col === 0 || col === 7) && <span>♖</span>}
              {row === 0 && (col === 1 || col === 6) && <span>♘</span>}
              {row === 0 && (col === 2 || col === 5) && <span>♗</span>}
              {row === 0 && col === 3 && <span>♕</span>}
              {row === 0 && col === 4 && <span>♔</span>}
              {row === 1 && <span>♙</span>}
              {row === 6 && <span>♟</span>}
              {row === 7 && (col === 0 || col === 7) && <span>♜</span>}
              {row === 7 && (col === 1 || col === 6) && <span>♞</span>}
              {row === 7 && (col === 2 || col === 5) && <span>♝</span>}
              {row === 7 && col === 3 && <span>♛</span>}
              {row === 7 && col === 4 && <span>♚</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MinimalChess;