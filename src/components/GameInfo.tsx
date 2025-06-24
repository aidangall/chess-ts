import React from 'react';
import { GameState, PieceColor } from '../types/chess';
import '../styles/GameInfo.css';

interface GameInfoProps {
  gameState: GameState;
}

const GameInfo: React.FC<GameInfoProps> = ({ gameState }) => {
  const { moves, capturedPieces } = gameState;
  
  // Calculate material advantage
  const calculateMaterialAdvantage = (): number => {
    const pieceValues: Record<string, number> = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9
    };
    
    let whiteScore = 0;
    let blackScore = 0;
    
    // Count pieces on the board
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = gameState.board[x][y];
        if (piece && piece.type !== 'king') {
          if (piece.color === 'white') {
            whiteScore += pieceValues[piece.type] || 0;
          } else {
            blackScore += pieceValues[piece.type] || 0;
          }
        }
      }
    }
    
    return whiteScore - blackScore;
  };
  
  const materialAdvantage = calculateMaterialAdvantage();
  
  // Render captured pieces
  const renderCapturedPieces = (color: PieceColor) => {
    // These are the pieces captured BY this color (so they are the opponent's pieces)
    const pieces = capturedPieces[color];
    const capturedColor = color === 'white' ? 'black' : 'white';
    
    // Group pieces by type for more organized display
    const groupedPieces: Record<string, number> = {};
    pieces.forEach(piece => {
      groupedPieces[piece.type] = (groupedPieces[piece.type] || 0) + 1;
    });
    
    return (
      <div className={`captured-pieces ${color}-captured`}>
        <h3>Captured by {color}:</h3>
        <div className="pieces-container">
          {Object.entries(groupedPieces).map(([type, count]) => (
            <div key={type} className="captured-piece-group">
              <div 
                className="piece-icon"
                style={{ backgroundImage: `url(/img/pieces/${capturedColor}${type}.png)` }}
              />
              {count > 1 && <span className="piece-count">×{count}</span>}
            </div>
          ))}
          {color === 'white' && materialAdvantage > 0 && (
            <span className="advantage">+{materialAdvantage}</span>
          )}
          {color === 'black' && materialAdvantage < 0 && (
            <span className="advantage">+{Math.abs(materialAdvantage)}</span>
          )}
        </div>
      </div>
    );
  };
  
  // Render move history
  const renderMoveHistory = () => {
    // Group moves by pairs (white and black)
    const moveGroups: { number: number; white?: string; black?: string }[] = [];
    
    for (let i = 0; i < moves.length; i += 2) {
      moveGroups.push({
        number: Math.floor(i / 2) + 1,
        white: moves[i]?.notation,
        black: moves[i + 1]?.notation
      });
    }
    
    return (
      <div className="move-history">
        <h3>Move History</h3>
        <div className="moves-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>White</th>
                <th>Black</th>
              </tr>
            </thead>
            <tbody>
              {moveGroups.map((group) => (
                <tr key={group.number}>
                  <td>{group.number}.</td>
                  <td>{group.white}</td>
                  <td>{group.black}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  return (
    <div className="game-info">
      {renderCapturedPieces('black')}
      {renderMoveHistory()}
      {renderCapturedPieces('white')}
    </div>
  );
};

export default GameInfo;