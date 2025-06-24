// Chess game types
export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type Square = [number, number]; // [x, y] coordinates

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean;
}

export interface Move {
  from: Square;
  to: Square;
  piece: Piece;
  capturedPiece?: Piece;
  isPromotion?: boolean;
  promotionPiece?: PieceType;
  isCastling?: boolean;
  isEnPassant?: boolean;
  notation: string;
}

export type GameStatus = 'waiting' | 'active' | 'check' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';

export interface Player {
  id: string;
  name: string;
  color?: PieceColor;
}

export interface GameState {
  id: string;
  board: (Piece | null)[][];
  currentTurn: PieceColor;
  players: {
    white?: Player;
    black?: Player;
  };
  status: GameStatus;
  moves: Move[];
  capturedPieces: {
    white: Piece[];
    black: Piece[];
  };
  selectedPiece: Square | null;
  legalMoves: Square[];
  check: boolean;
  lastMove: Move | null;
  drawOffered: PieceColor | null;
  winner: PieceColor | null;
}

export interface GameSlot {
  id: string;
  name: string;
  status: 'empty' | 'waiting' | 'active' | 'finished';
  players: {
    white?: Player;
    black?: Player;
  };
  createdAt: Date;
  updatedAt: Date;
}