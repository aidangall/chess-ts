import React, { useState } from 'react';
import { GameSlot, Player } from '../types/chess';
import '../styles/GameSlots.css';

interface GameSlotsProps {
  slots: GameSlot[];
  currentPlayer: Player;
  onJoinGame: (slotId: string, color?: 'white' | 'black') => void;
  onCreateGame: (name: string) => void;
}

const GameSlots: React.FC<GameSlotsProps> = ({
  slots,
  currentPlayer,
  onJoinGame,
  onCreateGame
}) => {
  const [newGameName, setNewGameName] = useState('');
  
  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGameName.trim()) {
      onCreateGame(newGameName.trim());
      setNewGameName('');
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  return (
    <div className="game-slots">
      <h2>Chess Games</h2>
      
      <div className="create-game">
        <h3>Create New Game</h3>
        <form onSubmit={handleCreateGame}>
          <input
            type="text"
            value={newGameName}
            onChange={(e) => setNewGameName(e.target.value)}
            placeholder="Game name"
            required
          />
          <button type="submit">Create Game</button>
        </form>
      </div>
      
      <div className="slots-list">
        <h3>Available Games</h3>
        {slots.length === 0 ? (
          <p className="no-games">No games available. Create one to start playing!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Game</th>
                <th>Status</th>
                <th>Players</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id} className={`game-slot ${slot.status}`}>
                  <td>{slot.name}</td>
                  <td>
                    <span className={`status-badge ${slot.status}`}>
                      {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {slot.players.white ? (
                      <span className="player white">
                        {slot.players.white.name} (White)
                      </span>
                    ) : (
                      <span className="empty-slot">Empty</span>
                    )}
                    <br />
                    {slot.players.black ? (
                      <span className="player black">
                        {slot.players.black.name} (Black)
                      </span>
                    ) : (
                      <span className="empty-slot">Empty</span>
                    )}
                  </td>
                  <td>{formatDate(slot.createdAt)}</td>
                  <td>
                    {slot.status === 'empty' || slot.status === 'waiting' ? (
                      <div className="join-buttons">
                        {!slot.players.white && (
                          <button 
                            onClick={() => onJoinGame(slot.id, 'white')}
                            className="join-white"
                          >
                            Join as White
                          </button>
                        )}
                        {!slot.players.black && (
                          <button 
                            onClick={() => onJoinGame(slot.id, 'black')}
                            className="join-black"
                          >
                            Join as Black
                          </button>
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={() => onJoinGame(slot.id)}
                        className="view-game"
                      >
                        View Game
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GameSlots;