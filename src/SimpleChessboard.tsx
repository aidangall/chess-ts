import React, { useState } from 'react';

// Define piece types
type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

// Initial board setup
const createInitialBoard = (): (Piece | null)[][] => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[i][1] = { type: 'pawn', color: 'white' };
    board[i][6] = { type: 'pawn', color: 'black' };
  }

  // Set up other pieces
  board[0][0] = { type: 'rook', color: 'white' };
  board[1][0] = { type: 'knight', color: 'white' };
  board[2][0] = { type: 'bishop', color: 'white' };
  board[3][0] = { type: 'queen', color: 'white' };
  board[4][0] = { type: 'king', color: 'white' };
  board[5][0] = { type: 'bishop', color: 'white' };
  board[6][0] = { type: 'knight', color: 'white' };
  board[7][0] = { type: 'rook', color: 'white' };

  board[0][7] = { type: 'rook', color: 'black' };
  board[1][7] = { type: 'knight', color: 'black' };
  board[2][7] = { type: 'bishop', color: 'black' };
  board[3][7] = { type: 'queen', color: 'black' };
  board[4][7] = { type: 'king', color: 'black' };
  board[5][7] = { type: 'bishop', color: 'black' };
  board[6][7] = { type: 'knight', color: 'black' };
  board[7][7] = { type: 'rook', color: 'black' };

  return board;
};

const SimpleChessboard: React.FC = () => {
  const [board] = useState<(Piece | null)[][]>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');

  // Render a square on the board
  const renderSquare = (x: number, y: number) => {
    const piece = board[x][y];
    
    // Determine square color
    const isDarkSquare = (x + y) % 2 === 1;
    
    return (
      <div
        key={`${x}-${y}`}
        style={{
          width: '60px',
          height: '60px',
          backgroundColor: isDarkSquare ? '#b58863' : '#f0d9b5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {piece && (
          <div style={{
            fontSize: '40px',
            color: piece.color === 'white' ? 'white' : 'black',
            textShadow: piece.color === 'white' ? '0 0 2px black' : '0 0 2px white'
          }}>
            {piece.type === 'pawn' && '♟'}
            {piece.type === 'knight' && '♞'}
            {piece.type === 'bishop' && '♝'}
            {piece.type === 'rook' && '♜'}
            {piece.type === 'queen' && '♛'}
            {piece.type === 'king' && '♚'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 60px)',
        gridTemplateRows: 'repeat(8, 60px)',
        width: '480px',
        border: '10px solid #5d4037',
        margin: '0 auto'
      }}>
        {Array.from({ length: 8 }, (_, y) => 
          Array.from({ length: 8 }, (_, x) => 
            renderSquare(x, 7 - y)
          )
        ).flat()}
      </div>
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        {currentPlayer === 'white' ? 'White' : 'Black'}'s turn
      </div>
      <button 
        style={{
          display: 'block',
          margin: '20px auto',
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white')}
      >
        Switch Turn
      </button>
    </div>
  );
};

export default SimpleChessboard;