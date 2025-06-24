import { Player } from '../types/chess';

// Save player to local storage
export const savePlayer = (player: Player): void => {
  localStorage.setItem('chessPlayer', JSON.stringify(player));
};

// Get player from local storage
export const getPlayer = (): Player | null => {
  const playerJson = localStorage.getItem('chessPlayer');
  if (playerJson) {
    try {
      return JSON.parse(playerJson);
    } catch (e) {
      console.error('Error parsing player from localStorage', e);
      return null;
    }
  }
  return null;
};

// Clear player from local storage
export const clearPlayer = (): void => {
  localStorage.removeItem('chessPlayer');
};