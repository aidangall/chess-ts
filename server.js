const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store game slots
const gameSlots = new Map();

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Send current game slots to the new user
  socket.emit('gameSlots', Array.from(gameSlots.values()));
  
  // Get a specific game
  socket.on('getGame', (gameId) => {
    const game = gameSlots.get(gameId);
    if (game) {
      socket.emit('gameData', { gameId, game });
    }
  });
  
  // Create a new game
  socket.on('createGame', (gameData) => {
    const { game, player } = gameData;
    gameSlots.set(game.id, game);
    
    // Broadcast to all clients
    io.emit('gameCreated', game);
    console.log(`Game created: ${game.id}`);
  });
  
  // Join a game
  socket.on('joinGame', (data) => {
    const { gameId, player, color } = data;
    const game = gameSlots.get(gameId);
    
    if (game) {
      // Update player
      if (color) {
        game.players[color] = player;
      }
      
      // Update game status
      if (game.players.white && game.players.black) {
        game.status = 'active';
      } else if (game.players.white || game.players.black) {
        game.status = 'waiting';
      } else {
        game.status = 'empty';
      }
      
      game.updatedAt = new Date();
      gameSlots.set(gameId, game);
      
      // Broadcast to all clients
      io.emit('gameUpdated', game);
      console.log(`Player joined game: ${gameId}`);
      
      // Send the updated game state to the joining player
      socket.emit('gameJoined', { gameId, game });
    }
  });
  
  // Make a move
  socket.on('makeMove', (data) => {
    const { gameId, gameState } = data;
    
    // Update the game state
    const game = gameSlots.get(gameId);
    if (game) {
      // Make sure we preserve player information
      if (!gameState.players || !gameState.players.white || !gameState.players.black) {
        gameState.players = game.players;
      }
      
      // Update game with new state
      const updatedGame = {
        ...game,
        board: gameState.board,
        currentTurn: gameState.currentTurn,
        status: gameState.status,
        moves: gameState.moves,
        capturedPieces: gameState.capturedPieces,
        check: gameState.check,
        lastMove: gameState.lastMove,
        drawOffered: gameState.drawOffered,
        winner: gameState.winner,
        updatedAt: new Date()
      };
      
      gameSlots.set(gameId, updatedGame);
      
      // Broadcast to all clients
      io.emit('moveMade', { gameId, gameState });
      console.log(`Move made in game: ${gameId}`);
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Note: In a production app, you might want to handle player disconnection
    // by marking them as inactive but keeping their spot in the game
  });
  
  // Reconnect to a game
  socket.on('reconnectToGame', (data) => {
    const { gameId, player } = data;
    const game = gameSlots.get(gameId);
    
    if (game) {
      // Check if player was in this game
      if ((game.players.white && game.players.white.id === player.id) ||
          (game.players.black && game.players.black.id === player.id)) {
        // Send the game state to the reconnecting player
        socket.emit('gameData', { gameId, game });
        console.log(`Player reconnected to game: ${gameId}`);
      }
    }
  });
});

// Serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});