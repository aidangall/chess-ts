import socketIo from 'socket.io-client';
import { GameSlot, GameState, Player } from '../types/chess';

// Connect to the server
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:3001';

let socket: any;

export const initSocket = (): any => {
  if (!socket) {
    socket = socketIo(SOCKET_URL);
    console.log('Socket initialized');
  }
  return socket;
};

export const getSocket = (): any => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// Game slot events
export const onGameSlots = (callback: (slots: GameSlot[]) => void): void => {
  getSocket().on('gameSlots', callback);
};

export const onGameCreated = (callback: (game: GameSlot) => void): void => {
  getSocket().on('gameCreated', callback);
};

export const onGameUpdated = (callback: (game: GameSlot) => void): void => {
  getSocket().on('gameUpdated', callback);
};

// Game events
export const onMoveMade = (callback: (data: { gameId: string, gameState: GameState }) => void): void => {
  getSocket().on('moveMade', callback);
};

export const onGameJoined = (callback: (data: { gameId: string, game: GameSlot }) => void): void => {
  getSocket().on('gameJoined', callback);
};

export const onGameData = (callback: (data: { gameId: string, game: GameSlot }) => void): void => {
  getSocket().on('gameData', callback);
};

export const getGame = (gameId: string): void => {
  getSocket().emit('getGame', gameId);
};

export const reconnectToGame = (gameId: string, player: Player): void => {
  getSocket().emit('reconnectToGame', { gameId, player });
};

// Emit events
export const createGame = (game: GameSlot, player: Player): void => {
  getSocket().emit('createGame', { game, player });
};

export const joinGame = (gameId: string, player: Player, color?: 'white' | 'black'): void => {
  getSocket().emit('joinGame', { gameId, player, color });
};

export const makeMove = (gameId: string, gameState: GameState): void => {
  getSocket().emit('makeMove', { gameId, gameState });
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
  }
};

export const deleteGame = (gameId: string): void => {
  getSocket().emit('deleteGame', { gameId });
};

export const onGameDeleted = (callback: (gameId: string) => void): void => {
  getSocket().on('gameDeleted', callback);
};