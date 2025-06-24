import React, { useState, useEffect } from 'react';
import Chessboard from './components/Chessboard';
import GameControls from './components/GameControls';
import GameInfo from './components/GameInfo';
import { GameState, Player, PieceColor } from './types/chess';
import { createNewGame, offerDraw, acceptDraw, declineDraw, resignGame } from './utils/chessLogic';
import { makeMove as emitMove, onMoveMade, onGameJoined, onGameData, joinGame as emitJoinGame, getGame, reconnectToGame } from './utils/socketUtils';
import './styles/ChessGame.css';

interface ChessGameProps {
  gameId: string;
  player: Player;
  onExit: () => void;
}

const ChessGame: React.FC<ChessGameProps> = ({ gameId, player, onExit }) => {
  const [gameState, setGameState] = useState<GameState>(createNewGame(gameId));
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [playerColor, setPlayerColor] = useState<PieceColor | undefined>(undefined);
  
  // Effect to update board orientation when player color changes
  useEffect(() => {
    if (playerColor === 'black') {
      // For black player, flip the board so black pieces are at the bottom
      setBoardFlipped(true);
    } else if (playerColor === 'white') {
      // For white player, keep the board normal with white pieces at the bottom
      setBoardFlipped(false);
    }
  }, [playerColor]);
  
  // Initialize the game
  useEffect(() => {
    // Create a new game state
    const initialGameState = createNewGame(gameId);
    
    // Set initial game state
    setGameState(initialGameState);
    
    // Listen for game data event
    const handleGameData = ({ gameId: fetchedGameId, game }: { gameId: string, game: any }) => {
      if (fetchedGameId === gameId) {
        console.log('Game data received:', game);
        
        // Update game state with all game information
        const updatedGameState = {
          ...initialGameState,
          players: game.players,
          status: game.status,
          board: game.board || initialGameState.board,
          currentTurn: game.currentTurn || initialGameState.currentTurn,
          moves: game.moves || initialGameState.moves,
          capturedPieces: game.capturedPieces || initialGameState.capturedPieces,
          check: game.check || initialGameState.check,
          lastMove: game.lastMove || initialGameState.lastMove,
          drawOffered: game.drawOffered || initialGameState.drawOffered,
          winner: game.winner || initialGameState.winner
        };
        
        setGameState(updatedGameState);
        
        // Determine player color
        if (game.players.white && game.players.white.id === player.id) {
          setPlayerColor('white');
          // White pieces should be at the bottom for white player
          setBoardFlipped(false);
        } else if (game.players.black && game.players.black.id === player.id) {
          setPlayerColor('black');
          // Black pieces should be at the bottom for black player
          setBoardFlipped(true);
        } else {
          // Spectator mode - default to white at bottom
          setPlayerColor(undefined);
          setBoardFlipped(false);
        }
      }
    };
    
    // Listen for game joined event
    const handleGameJoined = ({ gameId: joinedGameId, game }: { gameId: string, game: any }) => {
      if (joinedGameId === gameId) {
        console.log('Game joined:', game);
        
        // Update game state with all game information
        const updatedGameState = {
          ...initialGameState,
          players: game.players,
          status: game.status,
          board: game.board || initialGameState.board,
          currentTurn: game.currentTurn || initialGameState.currentTurn,
          moves: game.moves || initialGameState.moves,
          capturedPieces: game.capturedPieces || initialGameState.capturedPieces,
          check: game.check || initialGameState.check,
          lastMove: game.lastMove || initialGameState.lastMove,
          drawOffered: game.drawOffered || initialGameState.drawOffered,
          winner: game.winner || initialGameState.winner
        };
        
        setGameState(updatedGameState);
        
        // Determine player color
        if (game.players.white && game.players.white.id === player.id) {
          setPlayerColor('white');
          // White pieces should be at the bottom for white player
          setBoardFlipped(false);
        } else if (game.players.black && game.players.black.id === player.id) {
          setPlayerColor('black');
          // Black pieces should be at the bottom for black player
          setBoardFlipped(true);
        } else {
          // Spectator mode - default to white at bottom
          setPlayerColor(undefined);
          setBoardFlipped(false);
        }
      }
    };
    
    // Listen for moves from other players
    const handleMoveMade = ({ gameId: movedGameId, gameState: updatedGameState }: { gameId: string, gameState: GameState }) => {
      if (movedGameId === gameId) {
        console.log('Move made:', updatedGameState);
        setGameState(updatedGameState);
      }
    };
    
    onGameData(handleGameData);
    onGameJoined(handleGameJoined);
    onMoveMade(handleMoveMade);
    
    // First, get the current game state
    getGame(gameId);
    
    // Try to reconnect if player was in this game
    reconnectToGame(gameId, player);
    
    // Then join the game
    emitJoinGame(gameId, player);
    
    // Cleanup function
    return () => {
      // No need to explicitly remove listeners as they will be cleaned up when socket disconnects
    };
  }, [gameId, player]);
  
  // Handle move
  const handleMove = (newGameState: GameState) => {
    // Preserve player information
    const updatedGameState = {
      ...newGameState,
      players: gameState.players // Keep the existing player information
    };
    
    // Update local state
    setGameState(updatedGameState);
    
    // Send move to server
    emitMove(gameId, updatedGameState);
  };
  
  // Handle resign
  const handleResign = () => {
    if (!playerColor) return;
    const newGameState = resignGame(gameState, playerColor);
    setGameState(newGameState);
  };
  
  // Handle draw offer
  const handleOfferDraw = () => {
    const newGameState = offerDraw(gameState);
    setGameState(newGameState);
  };
  
  // Handle accept draw
  const handleAcceptDraw = () => {
    const newGameState = acceptDraw(gameState);
    setGameState(newGameState);
  };
  
  // Handle decline draw
  const handleDeclineDraw = () => {
    const newGameState = declineDraw(gameState);
    setGameState(newGameState);
  };
  
  // Handle flip board
  const handleFlipBoard = () => {
    // Toggle the board orientation
    const newFlipped = !boardFlipped;
    setBoardFlipped(newFlipped);
    console.log(`Board flipped: ${newFlipped}, Player color: ${playerColor}`);
  };
  
  // Handle new game
  const handleNewGame = () => {
    // In a real app, we would create a new game on the server
    onExit();
  };
  
  return (
    <div className="chess-game">
      <div className="game-header">
        <h2>Chess Game: {gameId}</h2>
        <div className="players-info">
          <div className="player white">
            {gameState.players.white ? gameState.players.white.name : 'Waiting for player...'}
            {playerColor === 'white' && <span className="you-indicator">(You)</span>}
          </div>
          <div className="vs">vs</div>
          <div className="player black">
            {gameState.players.black ? gameState.players.black.name : 'Waiting for player...'}
            {playerColor === 'black' && <span className="you-indicator">(You)</span>}
          </div>
        </div>
        <div className="game-status">
          {gameState.status === 'waiting' && <span className="status waiting">Waiting for opponent...</span>}
          {gameState.status === 'active' && <span className="status active">Game in progress - {gameState.currentTurn}'s turn</span>}
          {gameState.status === 'checkmate' && <span className="status checkmate">Checkmate! {gameState.winner === 'white' ? 'White' : 'Black'} wins!</span>}
          {gameState.status === 'stalemate' && <span className="status stalemate">Stalemate! Game drawn.</span>}
          {gameState.status === 'draw' && <span className="status draw">Game drawn by agreement.</span>}
          {gameState.status === 'resigned' && <span className="status resigned">{gameState.winner === 'white' ? 'Black' : 'White'} resigned. {gameState.winner === 'white' ? 'White' : 'Black'} wins!</span>}
        </div>
      </div>
      
      <div className="game-container">
        <div className="board-and-controls">
          <Chessboard 
            gameState={gameState} 
            onMove={handleMove} 
            flipped={boardFlipped}
          />
          <GameControls 
            gameState={gameState}
            onResign={handleResign}
            onOfferDraw={handleOfferDraw}
            onAcceptDraw={handleAcceptDraw}
            onDeclineDraw={handleDeclineDraw}
            onFlipBoard={handleFlipBoard}
            onNewGame={handleNewGame}
            playerColor={playerColor}
          />
        </div>
        <GameInfo gameState={gameState} />
      </div>
      
      <div className="game-footer">
        <button className="exit-button" onClick={onExit}>
          Back to Game List
        </button>
      </div>
    </div>
  );
};

export default ChessGame;