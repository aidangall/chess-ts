import React, { useState, useEffect } from 'react';
import ChessGame from './ChessGame';
import GameSlots from './components/GameSlots';
import { GameSlot, Player } from './types/chess';
import { v4 as uuidv4 } from 'uuid';
import './styles/App.css';
import { 
  initSocket, 
  onGameSlots, 
  onGameCreated, 
  onGameUpdated, 
  onGameDeleted,
  createGame as emitCreateGame,
  joinGame as emitJoinGame
} from './utils/socketUtils';
import { savePlayer, getPlayer } from './utils/storageUtils';

const App: React.FC = () => {
  const [gameSlots, setGameSlots] = useState<GameSlot[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(() => {
    // Try to get player from local storage
    const savedPlayer = getPlayer();
    if (savedPlayer) {
      return savedPlayer;
    }
    // Otherwise create a new player
    return {
      id: uuidv4(),
      name: `Player_${Math.floor(Math.random() * 1000)}`
    };
  });
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isNameSet, setIsNameSet] = useState(() => !!getPlayer());
  
  // Initialize socket connection and listen for game updates
  useEffect(() => {
    // Initialize socket
    const socket = initSocket();
    
    // Listen for initial game slots
    onGameSlots((slots) => {
      console.log('Received game slots:', slots);
      setGameSlots(slots);
    });
    
    // Listen for new games
    onGameCreated((game) => {
      console.log('New game created:', game);
      setGameSlots(prev => [...prev, game]);
    });
    
    // Listen for game updates
    onGameUpdated((updatedGame) => {
      console.log('Game updated:', updatedGame);
      setGameSlots(prev => 
        prev.map(game => game.id === updatedGame.id ? updatedGame : game)
      );
    });
    
    // Listen for game deletions
    onGameDeleted((deletedGameId) => {
      console.log('Game deleted:', deletedGameId);
      setGameSlots(prev => prev.filter(game => game.id !== deletedGameId));
      
      // If the deleted game was the active game, go back to the game list
      if (activeGameId === deletedGameId) {
        setActiveGameId(null);
      }
    });
    
    // Cleanup function to disconnect socket when component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);
  
  // Handle player name submission
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      const updatedPlayer = {
        ...currentPlayer,
        name: playerName.trim()
      };
      setCurrentPlayer(updatedPlayer);
      savePlayer(updatedPlayer);
      setIsNameSet(true);
    }
  };
  
  // Handle joining a game
  const handleJoinGame = (slotId: string, color?: 'white' | 'black') => {
    // Send join request to server via socket
    emitJoinGame(slotId, currentPlayer, color);
    
    // Set active game locally
    setActiveGameId(slotId);
  };
  
  // Handle creating a new game
  const handleCreateGame = (name: string) => {
    const newGameId = uuidv4();
    const newSlot: GameSlot = {
      id: newGameId,
      name,
      status: 'empty',
      players: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Send create game request to server via socket
    emitCreateGame(newSlot, currentPlayer);
    
    // Automatically join as white
    handleJoinGame(newGameId, 'white');
  };
  
  // Handle exiting a game
  const handleExitGame = () => {
    setActiveGameId(null);
  };
  
  // If player name is not set, show the name input form
  if (!isNameSet) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Chess App</h1>
        </header>
        <main className="name-input-container">
          <div className="name-form">
            <h2>Welcome to Chess App</h2>
            <p>Please enter your name to continue:</p>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                required
              />
              <button type="submit">Continue</button>
            </form>
          </div>
        </main>
      </div>
    );
  }
  
  // If a game is active, show the chess game
  if (activeGameId) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Chess App</h1>
        </header>
        <main>
          <ChessGame 
            gameId={activeGameId} 
            player={currentPlayer} 
            onExit={handleExitGame} 
          />
        </main>
      </div>
    );
  }
  
  // Otherwise, show the game slots
  return (
    <div className="app">
      <header className="app-header">
        <h1>Chess App</h1>
        <div className="user-info">
          Welcome, {currentPlayer.name}
        </div>
      </header>
      <main>
        <GameSlots 
          slots={gameSlots}
          currentPlayer={currentPlayer}
          onJoinGame={handleJoinGame}
          onCreateGame={handleCreateGame}
        />
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Chess App</p>
      </footer>
    </div>
  );
};

export default App;