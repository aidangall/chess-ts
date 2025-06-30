import { GameState, Piece, PieceColor, PieceType, Square, Move, GameStatus, Position } from '../types/chess';
import { v4 as uuidv4 } from 'uuid';

// Create a new chess board with pieces in starting positions
export const createNewBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[i][1] = {
      id: uuidv4(),
      type: 'pawn',
      color: 'white',
      hasMoved: false
    };
    board[i][6] = {
      id: uuidv4(),
      type: 'pawn',
      color: 'black',
      hasMoved: false
    };
  }

  // Set up other pieces
  const setupPiece = (x: number, y: number, type: PieceType, color: PieceColor): void => {
    board[x][y] = {
      id: uuidv4(),
      type,
      color,
      hasMoved: false
    };
  };

  // Rooks
  setupPiece(0, 0, 'rook', 'white');
  setupPiece(7, 0, 'rook', 'white');
  setupPiece(0, 7, 'rook', 'black');
  setupPiece(7, 7, 'rook', 'black');

  // Knights
  setupPiece(1, 0, 'knight', 'white');
  setupPiece(6, 0, 'knight', 'white');
  setupPiece(1, 7, 'knight', 'black');
  setupPiece(6, 7, 'knight', 'black');

  // Bishops
  setupPiece(2, 0, 'bishop', 'white');
  setupPiece(5, 0, 'bishop', 'white');
  setupPiece(2, 7, 'bishop', 'black');
  setupPiece(5, 7, 'bishop', 'black');

  // Queens
  setupPiece(3, 0, 'queen', 'white');
  setupPiece(3, 7, 'queen', 'black');

  // Kings
  setupPiece(4, 0, 'king', 'white');
  setupPiece(4, 7, 'king', 'black');

  return board;
};

// Convert board position to a string for position tracking
export const boardToPositionString = (board: (Piece | null)[][], currentTurn: PieceColor): Position => {
  let posStr = currentTurn === 'white' ? 'w' : 'b';
  
  // Add castling rights
  let castlingRights = '';
  const whiteKing = board[4][0];
  const blackKing = board[4][7];
  const whiteKingsideRook = board[7][0];
  const whiteQueensideRook = board[0][0];
  const blackKingsideRook = board[7][7];
  const blackQueensideRook = board[0][7];
  
  if (whiteKing && !whiteKing.hasMoved) {
    if (whiteKingsideRook && !whiteKingsideRook.hasMoved) castlingRights += 'K';
    if (whiteQueensideRook && !whiteQueensideRook.hasMoved) castlingRights += 'Q';
  }
  
  if (blackKing && !blackKing.hasMoved) {
    if (blackKingsideRook && !blackKingsideRook.hasMoved) castlingRights += 'k';
    if (blackQueensideRook && !blackQueensideRook.hasMoved) castlingRights += 'q';
  }
  
  posStr += castlingRights || '-';
  
  // Add board state
  for (let y = 7; y >= 0; y--) {
    for (let x = 0; x < 8; x++) {
      const piece = board[x][y];
      if (piece) {
        let pieceChar = '';
        switch (piece.type) {
          case 'pawn': pieceChar = 'p'; break;
          case 'knight': pieceChar = 'n'; break;
          case 'bishop': pieceChar = 'b'; break;
          case 'rook': pieceChar = 'r'; break;
          case 'queen': pieceChar = 'q'; break;
          case 'king': pieceChar = 'k'; break;
        }
        posStr += piece.color === 'white' ? pieceChar.toUpperCase() : pieceChar;
      } else {
        posStr += '1';
      }
    }
  }
  
  return posStr;
};

// Create a new game state
export const createNewGame = (id: string): GameState => {
  const initialBoard = createNewBoard();
  return {
    id,
    board: initialBoard,
    currentTurn: 'white',
    players: {},
    status: 'waiting',
    moves: [],
    capturedPieces: {
      white: [],
      black: []
    },
    selectedPiece: null,
    legalMoves: [],
    check: false,
    lastMove: null,
    drawOffered: null,
    winner: null,
    positionHistory: [boardToPositionString(initialBoard, 'white')],
    halfMoveClock: 0,
    enPassantTarget: null
  };
};

// Find the king's position
export const findKing = (board: (Piece | null)[][], color: PieceColor): Square | null => {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y];
      if (piece && piece.type === 'king' && piece.color === color) {
        return [x, y];
      }
    }
  }
  return null;
};

// Check if a square is under attack
export const isSquareUnderAttack = (
  board: (Piece | null)[][],
  square: Square,
  attackerColor: PieceColor
): boolean => {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y];
      if (piece && piece.color === attackerColor) {
        const moves = getPieceLegalMoves(board, [x, y], true);
        if (moves.some(([mx, my]) => mx === square[0] && my === square[1])) {
          return true;
        }
      }
    }
  }
  return false;
};

// Check if the king is in check
export const isInCheck = (board: (Piece | null)[][], color: PieceColor): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  return isSquareUnderAttack(board, kingPos, color === 'white' ? 'black' : 'white');
};

// Get all legal moves for a piece
export const getPieceLegalMoves = (
  board: (Piece | null)[][],
  square: Square,
  ignoreCheck: boolean = false,
  enPassantTarget: Square | null = null
): Square[] => {
  const [x, y] = square;
  const piece = board[x][y];
  if (!piece) return [];

  const moves: Square[] = [];
  const { type, color, hasMoved } = piece;

  // Pawn moves
  if (type === 'pawn') {
    const direction = color === 'white' ? 1 : -1;

    // Move forward one square
    if (y + direction >= 0 && y + direction < 8 && !board[x][y + direction]) {
      moves.push([x, y + direction]);

      // Move forward two squares from starting position
      if (!hasMoved && !board[x][y + 2 * direction]) {
        moves.push([x, y + 2 * direction]);
      }
    }

    // Capture diagonally
    if (x + 1 < 8 && y + direction >= 0 && y + direction < 8) {
      const targetPiece = board[x + 1][y + direction];
      if (targetPiece && targetPiece.color !== color) {
        moves.push([x + 1, y + direction]);
      }
    }

    if (x - 1 >= 0 && y + direction >= 0 && y + direction < 8) {
      const targetPiece = board[x - 1][y + direction];
      if (targetPiece && targetPiece.color !== color) {
        moves.push([x - 1, y + direction]);
      }
    }

    // En passant
    if (enPassantTarget) {
      const [epX, epY] = enPassantTarget;
      // Check if this pawn is in the right position to capture en passant
      if (y === (color === 'white' ? 4 : 3) && // Pawn is on the 5th/4th rank
          Math.abs(x - epX) === 1 && // Pawn is one file away from the target
          epY === (color === 'white' ? 5 : 2)) { // Target is on the correct rank
        moves.push([epX, epY]);
      }
    }
  }

  // Knight moves
  else if (type === 'knight') {
    const knightMoves = [
      [x + 1, y + 2], [x + 2, y + 1], [x + 2, y - 1], [x + 1, y - 2],
      [x - 1, y - 2], [x - 2, y - 1], [x - 2, y + 1], [x - 1, y + 2]
    ];

    for (const [nx, ny] of knightMoves) {
      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
        const targetPiece = board[nx][ny];
        if (!targetPiece || targetPiece.color !== color) {
          moves.push([nx, ny]);
        }
      }
    }
  }

  // Bishop, Rook, and Queen moves
  else if (type === 'bishop' || type === 'rook' || type === 'queen') {
    const directions: [number, number][] = [];

    if (type === 'bishop' || type === 'queen') {
      directions.push([1, 1], [1, -1], [-1, -1], [-1, 1]);
    }

    if (type === 'rook' || type === 'queen') {
      directions.push([0, 1], [1, 0], [0, -1], [-1, 0]);
    }

    for (const [dx, dy] of directions) {
      let nx = x + dx;
      let ny = y + dy;

      while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
        const targetPiece = board[nx][ny];

        if (!targetPiece) {
          moves.push([nx, ny]);
        } else {
          if (targetPiece.color !== color) {
            moves.push([nx, ny]);
          }
          break; // Stop after capturing or hitting own piece
        }

        nx += dx;
        ny += dy;
      }
    }
  }

  // King moves
  else if (type === 'king') {
    // Regular king moves
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
          const targetPiece = board[nx][ny];
          if (!targetPiece || targetPiece.color !== color) {
            moves.push([nx, ny]);
          }
        }
      }
    }

    // Castling
    if (!hasMoved && !ignoreCheck && !isInCheck(board, color)) {
      const rank = color === 'white' ? 0 : 7;

      // Kingside castling
      if (board[7][rank] &&
        board[7][rank]?.type === 'rook' &&
        !board[7][rank]?.hasMoved &&
        !board[6][rank] &&
        !board[5][rank]) {

        // Check if squares are under attack
        if (!isSquareUnderAttack(board, [5, rank], color === 'white' ? 'black' : 'white') &&
          !isSquareUnderAttack(board, [6, rank], color === 'white' ? 'black' : 'white')) {
          moves.push([6, rank]);
        }
      }

      // Queenside castling
      if (board[0][rank] &&
        board[0][rank]?.type === 'rook' &&
        !board[0][rank]?.hasMoved &&
        !board[1][rank] &&
        !board[2][rank] &&
        !board[3][rank]) {

        // Check if squares are under attack
        if (!isSquareUnderAttack(board, [3, rank], color === 'white' ? 'black' : 'white') &&
          !isSquareUnderAttack(board, [2, rank], color === 'white' ? 'black' : 'white')) {
          moves.push([2, rank]);
        }
      }
    }
  }

  // Filter moves that would leave the king in check
  if (!ignoreCheck) {
    return moves.filter(([mx, my]) => {
      // Create a temporary board with the move applied
      const tempBoard = board.map(row => [...row]);
      const movingPiece = tempBoard[x][y];
      tempBoard[mx][my] = movingPiece;
      tempBoard[x][y] = null;

      // Check if the king would be in check after this move
      return !isInCheck(tempBoard, color);
    });
  }

  return moves;
};

// Get all legal moves for the current player
export const getAllLegalMoves = (board: (Piece | null)[][], color: PieceColor, enPassantTarget: Square | null = null): Square[] => {
  const moves: Square[] = [];

  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y];
      if (piece && piece.color === color) {
        const pieceMoves = getPieceLegalMoves(board, [x, y], false, enPassantTarget);
        moves.push(...pieceMoves);
      }
    }
  }

  return moves;
};

// Check if the current player is in checkmate
export const isCheckmate = (board: (Piece | null)[][], color: PieceColor, enPassantTarget: Square | null = null): boolean => {
  // If not in check, can't be checkmate
  if (!isInCheck(board, color)) return false;

  // Check if any move can get out of check
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y];
      if (piece && piece.color === color) {
        const moves = getPieceLegalMoves(board, [x, y], false, enPassantTarget);
        if (moves.length > 0) {
          return false; // At least one legal move exists
        }
      }
    }
  }

  return true; // No legal moves and in check = checkmate
};

// Check if the current player is in stalemate
export const isStalemate = (board: (Piece | null)[][], color: PieceColor, enPassantTarget: Square | null = null): boolean => {
  // If in check, it's not stalemate
  if (isInCheck(board, color)) return false;

  // Check if any legal move exists
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y];
      if (piece && piece.color === color) {
        const moves = getPieceLegalMoves(board, [x, y], false, enPassantTarget);
        if (moves.length > 0) {
          return false; // At least one legal move exists
        }
      }
    }
  }

  return true; // No legal moves and not in check = stalemate
};

// Generate algebraic notation for a move
export const generateMoveNotation = (
  board: (Piece | null)[][],
  from: Square,
  to: Square,
  promotion?: PieceType
): string => {
  const [fromX, fromY] = from;
  const [toX, toY] = to;
  const piece = board[fromX][fromY];

  if (!piece) return '';

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const toFile = files[toX];
  const toRank = ranks[toY];

  // Castling
  if (piece.type === 'king') {
    if (fromX === 4 && toX === 6) return 'O-O';
    if (fromX === 4 && toX === 2) return 'O-O-O';
  }

  // Piece symbol
  let pieceSymbol = '';
  switch (piece.type) {
    case 'knight': pieceSymbol = 'N'; break;
    case 'bishop': pieceSymbol = 'B'; break;
    case 'rook': pieceSymbol = 'R'; break;
    case 'queen': pieceSymbol = 'Q'; break;
    case 'king': pieceSymbol = 'K'; break;
  }

  // Capture symbol
  const isCapture = board[toX][toY] !== null;
  const captureSymbol = isCapture ? 'x' : '';

  // Disambiguation
  let disambiguation = '';
  if (piece.type !== 'pawn' && piece.type !== 'king') {
    const sameTypePieces = [];

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (x === fromX && y === fromY) continue;

        const otherPiece = board[x][y];
        if (otherPiece && otherPiece.type === piece.type && otherPiece.color === piece.color) {
          const moves = getPieceLegalMoves(board, [x, y]);
          if (moves.some(([mx, my]) => mx === toX && my === toY)) {
            sameTypePieces.push([x, y]);
          }
        }
      }
    }

    if (sameTypePieces.length > 0) {
      const needFile = sameTypePieces.some(([x, _]) => x !== fromX);
      const needRank = sameTypePieces.some(([_, y]) => y !== fromY);

      if (needFile) disambiguation += files[fromX];
      if (needRank) disambiguation += ranks[fromY];
    }
  }

  // Pawn captures need the file
  if (piece.type === 'pawn' && isCapture) {
    disambiguation = files[fromX];
  }

  // Promotion
  const promotionString = promotion ? `=${promotion === 'knight' ? 'N' : promotion.charAt(0).toUpperCase()}` : '';

  // Check and checkmate
  let checkString = '';
  const tempBoard = board.map(row => [...row]);
  tempBoard[toX][toY] = piece;
  tempBoard[fromX][fromY] = null;

  const opponentColor = piece.color === 'white' ? 'black' : 'white';
  if (isCheckmate(tempBoard, opponentColor)) {
    checkString = '#';
  } else if (isInCheck(tempBoard, opponentColor)) {
    checkString = '+';
  }

  // Combine all parts
  if (piece.type === 'pawn' && !isCapture) {
    return `${toFile}${toRank}${promotionString}${checkString}`;
  } else {
    return `${pieceSymbol}${disambiguation}${captureSymbol}${toFile}${toRank}${promotionString}${checkString}`;
  }
};

// Make a move and return the updated game state
export const makeMove = (
  gameState: GameState,
  from: Square,
  to: Square,
  promotionPiece?: PieceType
): GameState => {
  const { board, currentTurn, enPassantTarget, halfMoveClock } = gameState;
  const [fromX, fromY] = from;
  const [toX, toY] = to;

  // If the game is already over, don't allow any more moves
  if (gameState.status === 'checkmate' || gameState.status === 'stalemate' || 
      gameState.status === 'draw' || gameState.status === 'resigned') {
    console.log('Game is already over with status:', gameState.status, '- not allowing move');
    return gameState;
  }
  
  console.log('Game status before move:', gameState.status);

  const piece = board[fromX][fromY];
  if (!piece || piece.color !== currentTurn) return gameState;

  // Check if the move is legal
  const legalMoves = getPieceLegalMoves(board, from, false, enPassantTarget);
  const isLegalMove = legalMoves.some(([x, y]) => x === toX && y === toY);
  if (!isLegalMove) return gameState;

  // Create a new board with the move applied
  const newBoard = board.map(row => [...row]);
  const movingPiece = { ...newBoard[fromX][fromY]!, hasMoved: true };
  const capturedPiece = newBoard[toX][toY];

  // Handle special moves
  let isEnPassant = false;
  let isCastling = false;
  
  // Track if this move resets the fifty-move counter
  let resetHalfMoveClock = false;

  // Set new en passant target
  let newEnPassantTarget: Square | null = null;
  
  // Pawn move - check for en passant and two-square advance
  if (piece.type === 'pawn') {
    resetHalfMoveClock = true; // Pawn moves reset the counter
    
    // Check for two-square advance to set en passant target
    if (Math.abs(fromY - toY) === 2) {
      const enPassantY = fromY + (toY > fromY ? 1 : -1);
      newEnPassantTarget = [fromX, enPassantY];
    }
    
    // Check for en passant capture
    if (fromX !== toX && !capturedPiece && enPassantTarget) {
      const [epX, epY] = enPassantTarget;
      if (toX === epX && toY === epY) {
        isEnPassant = true;
        const captureY = fromY;
        const enPassantPiece = newBoard[toX][captureY];
        if (enPassantPiece) {
          newBoard[toX][captureY] = null;
          gameState.capturedPieces[currentTurn].push(enPassantPiece);
        }
      }
    }
  }

  // Castling
  if (piece.type === 'king' && Math.abs(fromX - toX) === 2) {
    isCastling = true;
    const rank = currentTurn === 'white' ? 0 : 7;

    // Kingside castling
    if (toX === 6) {
      const rook = newBoard[7][rank];
      newBoard[5][rank] = rook;
      newBoard[7][rank] = null;
    }
    // Queenside castling
    else if (toX === 2) {
      const rook = newBoard[0][rank];
      newBoard[3][rank] = rook;
      newBoard[0][rank] = null;
    }
  }

  // Make the move
  newBoard[toX][toY] = movingPiece;
  newBoard[fromX][fromY] = null;

  // Handle pawn promotion
  let isPromotion = false;
  if (piece.type === 'pawn' && (toY === 7 || toY === 0)) {
    isPromotion = true;
    if (promotionPiece) {
      newBoard[toX][toY] = {
        ...movingPiece,
        type: promotionPiece
      };
    }
  }

  // Update captured pieces
  const newCapturedPieces = {
    white: [...gameState.capturedPieces.white],
    black: [...gameState.capturedPieces.black]
  };

  if (capturedPiece && !isEnPassant) {
    newCapturedPieces[currentTurn].push(capturedPiece);
    resetHalfMoveClock = true; // Captures reset the counter
  }

  // Generate move notation
  const notation = generateMoveNotation(board, from, to, isPromotion ? promotionPiece : undefined);

  // Create move object
  const move: Move = {
    from,
    to,
    piece: movingPiece,
    capturedPiece: capturedPiece || undefined,
    isPromotion,
    promotionPiece,
    isCastling,
    isEnPassant,
    notation
  };

  // Switch turns
  const nextTurn = currentTurn === 'white' ? 'black' : 'white';
  
  // Update half-move clock for fifty-move rule
  const newHalfMoveClock = resetHalfMoveClock ? 0 : halfMoveClock + 1;
  
  // Update position history for threefold repetition
  const newPosition = boardToPositionString(newBoard, nextTurn);
  const newPositionHistory = [...gameState.positionHistory, newPosition];

  // Check game status
  let status: GameStatus = 'active';
  let check = false;
  let winner = null;

  // Debug game state conditions
  console.log('Checking game status conditions:');
  console.log('Is in check:', isInCheck(newBoard, nextTurn));
  console.log('Is checkmate:', isCheckmate(newBoard, nextTurn, newEnPassantTarget));
  console.log('Is stalemate:', isStalemate(newBoard, nextTurn, newEnPassantTarget));
  console.log('Is threefold repetition:', isThreefoldRepetition(newPositionHistory));
  console.log('Is fifty move rule:', isFiftyMoveRule(newHalfMoveClock));
  console.log('Is insufficient material:', isInsufficientMaterial(newBoard));

  if (isInCheck(newBoard, nextTurn)) {
    check = true;
    if (isCheckmate(newBoard, nextTurn, newEnPassantTarget)) {
      status = 'checkmate';
      winner = currentTurn;
      console.log('Setting status to CHECKMATE');
    } else {
      status = 'active'; // Changed from 'check' to 'active' to avoid overriding the game status
    }
  } else if (isStalemate(newBoard, nextTurn, newEnPassantTarget)) {
    status = 'stalemate';
    console.log('Setting status to STALEMATE');
  } else if (isThreefoldRepetition(newPositionHistory)) {
    status = 'draw';
    console.log('Setting status to DRAW (threefold repetition)');
  } else if (isFiftyMoveRule(newHalfMoveClock)) {
    status = 'draw';
    console.log('Setting status to DRAW (fifty move rule)');
  } else if (isInsufficientMaterial(newBoard)) {
    status = 'draw';
    console.log('Setting status to DRAW (insufficient material)');
  }
  
  console.log('Final game status:', status);

  // Return updated game state
  return {
    ...gameState,
    board: newBoard,
    currentTurn: nextTurn,
    status,
    moves: [...gameState.moves, move],
    capturedPieces: newCapturedPieces,
    selectedPiece: null,
    legalMoves: [],
    check,
    lastMove: move,
    winner,
    positionHistory: newPositionHistory,
    halfMoveClock: newHalfMoveClock,
    enPassantTarget: newEnPassantTarget
  };
};

// Offer a draw
export const offerDraw = (gameState: GameState): GameState => {
  return {
    ...gameState,
    drawOffered: gameState.currentTurn
  };
};

// Accept a draw
export const acceptDraw = (gameState: GameState): GameState => {
  if (!gameState.drawOffered) return gameState;

  return {
    ...gameState,
    status: 'draw',
    drawOffered: null
  };
};

// Decline a draw
export const declineDraw = (gameState: GameState): GameState => {
  return {
    ...gameState,
    drawOffered: null
  };
};

// Resign from the game
export const resignGame = (gameState: GameState, color: PieceColor): GameState => {
  return {
    ...gameState,
    status: 'resigned',
    winner: color === 'white' ? 'black' : 'white'
  };
};

// Check for threefold repetition
export const isThreefoldRepetition = (positionHistory: Position[]): boolean => {
  const positionCounts = new Map<string, number>();
  
  for (const position of positionHistory) {
    const count = positionCounts.get(position) || 0;
    positionCounts.set(position, count + 1);
    
    if (count + 1 >= 3) {
      return true;
    }
  }
  
  return false;
};

// Check for fifty-move rule
export const isFiftyMoveRule = (halfMoveClock: number): boolean => {
  return halfMoveClock >= 100; // 50 moves by each player = 100 half-moves
};

// Check for insufficient material
export const isInsufficientMaterial = (board: (Piece | null)[][]): boolean => {
  const pieces: { type: PieceType, color: PieceColor }[] = [];
  
  // Collect all pieces on the board
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y];
      if (piece && piece.type !== 'king') {
        pieces.push({ type: piece.type, color: piece.color });
      }
    }
  }
  
  // If no pieces left besides kings, it's a draw
  if (pieces.length === 0) {
    return true;
  }
  
  // King vs King + Knight or King vs King + Bishop is a draw
  if (pieces.length === 1 && (pieces[0].type === 'knight' || pieces[0].type === 'bishop')) {
    return true;
  }
  
  // King + Bishop vs King + Bishop with same colored bishops is a draw
  if (pieces.length === 2 && 
      pieces[0].type === 'bishop' && 
      pieces[1].type === 'bishop' && 
      pieces[0].color !== pieces[1].color) {
    // We would need to check if bishops are on same colored squares
    // This is a simplification - in a real implementation we would check the square colors
    return true;
  }
  
  return false;
};

// Check if the game is drawn
export const isDraw = (gameState: GameState): boolean => {
  return isStalemate(gameState.board, gameState.currentTurn, gameState.enPassantTarget) ||
         isThreefoldRepetition(gameState.positionHistory) ||
         isFiftyMoveRule(gameState.halfMoveClock) ||
         isInsufficientMaterial(gameState.board);
};