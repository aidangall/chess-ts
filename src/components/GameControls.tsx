import React from 'react';
import { GameState, PieceColor } from '../types/chess';
import '../styles/GameControls.css';

interface GameControlsProps {
  gameState: GameState;
  onResign: () => void;
  onOfferDraw: () => void;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  onFlipBoard: () => void;
  onNewGame: () => void;
  playerColor?: PieceColor;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  onFlipBoard,
  onNewGame,
  playerColor
}) => {
  const { status, currentTurn, drawOffered } = gameState;
  const isGameOver = status === 'checkmate' || status === 'stalemate' || status === 'draw' || status === 'resigned';
  const isPlayerTurn = !playerColor || playerColor === currentTurn;
  
  // Determine status message
  const getStatusMessage = () => {
    console.log('GameControls - Current status:', status);
    
    switch (status) {
      case 'checkmate':
        return `Checkmate! ${gameState.winner === 'white' ? 'White' : 'Black'} wins`;
      case 'stalemate':
        return 'Stalemate! The game is a draw';
      case 'draw':
        return 'Game ended in a draw';
      case 'resigned':
        return `${gameState.winner === 'white' ? 'White' : 'Black'} wins by resignation`;
      case 'check':
        return `${currentTurn === 'white' ? 'White' : 'Black'} is in check`;
      default:
        return `${currentTurn === 'white' ? 'White' : 'Black'} to move`;
    }
  };

  return (
    <div className="game-controls">
      <div className="status-message">
        {getStatusMessage()}
        {drawOffered && (
          <div className="draw-offer">
            {drawOffered === playerColor ? (
              <span>You offered a draw</span>
            ) : (
              <span>
                Opponent offered a draw
                <div className="draw-buttons">
                  <button onClick={onAcceptDraw}>Accept</button>
                  <button onClick={onDeclineDraw}>Decline</button>
                </div>
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="control-buttons">
        {!isGameOver && isPlayerTurn && !drawOffered && (
          <>
            <button 
              className="resign-button" 
              onClick={onResign}
              title="Resign the game"
            >
              Resign
            </button>
            <button 
              className="draw-button" 
              onClick={onOfferDraw}
              title="Offer a draw to your opponent"
            >
              Offer Draw
            </button>
          </>
        )}
        
        <button 
          className="flip-button" 
          onClick={onFlipBoard}
          title="Change the board perspective"
        >
          Change Perspective
        </button>
        
        {isGameOver && (
          <button 
            className="new-game-button" 
            onClick={onNewGame}
            title="Start a new game"
          >
            New Game
          </button>
        )}
      </div>
    </div>
  );
};

export default GameControls;