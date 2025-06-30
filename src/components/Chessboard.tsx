import React, { useState, useRef, useEffect } from 'react';
import { GameState, Square, PieceType } from '../types/chess';
import { getPieceLegalMoves, makeMove } from '../utils/chessLogic';
import '../styles/Chessboard.css';

interface ChessboardProps {
  gameState: GameState;
  onMove: (gameState: GameState) => void;
  flipped?: boolean;
}

interface AnimatingPiece {
  piece: {
    color: string;
    type: string;
  };
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

const Chessboard: React.FC<ChessboardProps> = ({ gameState, onMove, flipped = false }) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [promotionSquare, setPromotionSquare] = useState<Square | null>(null);
  const [animatingPiece, setAnimatingPiece] = useState<AnimatingPiece | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const { board, currentTurn, lastMove } = gameState;

  // Reset selection when turn changes
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [currentTurn]);

  // Handle square click
  const handleSquareClick = (x: number, y: number) => {
    // If waiting for promotion choice or game is over, ignore clicks
    if (promotionSquare) return;
    
    // Check if game is over
    const isGameOver = gameState.status === 'checkmate' || 
                      gameState.status === 'stalemate' || 
                      gameState.status === 'draw' || 
                      gameState.status === 'resigned';
    
    console.log('Current game status:', gameState.status, 'Is game over?', isGameOver);
    
    if (isGameOver) {
      console.log('Game is over, ignoring click');
      return;
    }

    const piece = board[x][y];

    // If no piece is selected yet
    if (!selectedSquare) {
      // Can only select own pieces
      if (piece && piece.color === currentTurn) {
        const moves = getPieceLegalMoves(board, [x, y]);
        setSelectedSquare([x, y]);
        setLegalMoves(moves);
        console.log(`Selected piece at ${x},${y} with ${moves.length} legal moves`);
      }
    } else {
      const [selectedX, selectedY] = selectedSquare;
      
      // If clicking the same square, deselect
      if (selectedX === x && selectedY === y) {
        setSelectedSquare(null);
        setLegalMoves([]);
        console.log(`Deselected piece at ${x},${y}`);
        return;
      }
      
      // If clicking another piece of the same color, select it instead
      if (piece && piece.color === currentTurn) {
        const moves = getPieceLegalMoves(board, [x, y]);
        setSelectedSquare([x, y]);
        setLegalMoves(moves);
        console.log(`Selected new piece at ${x},${y} with ${moves.length} legal moves`);
        return;
      }
      
      // Get the selected piece
      const selectedPiece = board[selectedX][selectedY];
      
      // Ensure the selected piece belongs to the current player
      if (!selectedPiece || selectedPiece.color !== currentTurn) {
        setSelectedSquare(null);
        setLegalMoves([]);
        console.log(`Cannot move opponent's pieces`);
        return;
      }
      
      // Check if the move is legal
      const isLegalMove = legalMoves.some(([mx, my]) => mx === x && my === y);
      if (isLegalMove) {
        const selectedPiece = board[selectedX][selectedY];
        
        // Check for pawn promotion
        if (
          selectedPiece?.type === 'pawn' && 
          ((selectedPiece.color === 'white' && y === 7) || 
           (selectedPiece.color === 'black' && y === 0))
        ) {
          setPromotionSquare([x, y]);
          console.log(`Pawn promotion at ${x},${y}`);
          return;
        }
        
        // Start animation
        if (selectedPiece) {
          setAnimatingPiece({
            piece: {
              color: selectedPiece.color,
              type: selectedPiece.type
            },
            fromX: selectedX,
            fromY: selectedY,
            toX: x,
            toY: y
          });
        }
        
        // Reset selection immediately
        setSelectedSquare(null);
        setLegalMoves([]);
        
        // Delay the actual move until animation completes
        setTimeout(() => {
          // Make the move
          const updatedGameState = makeMove(gameState, [selectedX, selectedY], [x, y]);
          console.log(`Moved piece from ${selectedX},${selectedY} to ${x},${y}`);
          console.log('Game status after move in Chessboard:', updatedGameState.status);
          
          onMove(updatedGameState);
          
          // Clear the animation after a short delay
          setTimeout(() => {
            setAnimatingPiece(null);
          }, 50);
        }, 400); // Animation duration
      } else {
        // If clicking an invalid square, deselect
        setSelectedSquare(null);
        setLegalMoves([]);
        console.log(`Invalid move to ${x},${y} - deselected`);
      }
    }
  };

  // Handle promotion choice
  const handlePromotion = (pieceType: PieceType) => {
    if (!selectedSquare || !promotionSquare) return;
    
    const [selectedX, selectedY] = selectedSquare;
    const [promotionX, promotionY] = promotionSquare;
    
    // Start animation
    const selectedPiece = board[selectedX][selectedY];
    if (selectedPiece) {
      setAnimatingPiece({
        piece: {
          color: selectedPiece.color,
          type: pieceType // Use the promotion piece type
        },
        fromX: selectedX,
        fromY: selectedY,
        toX: promotionX,
        toY: promotionY
      });
    }
    
    // Delay the actual move until animation completes
    setTimeout(() => {
      // Make the move with promotion
      const updatedGameState = makeMove(gameState, selectedSquare, promotionSquare, pieceType);
      onMove(updatedGameState);
      
      // Clear the animation after a short delay
      setTimeout(() => {
        setAnimatingPiece(null);
      }, 50);
      
      // Reset states
      setSelectedSquare(null);
      setLegalMoves([]);
      setPromotionSquare(null);
    }, 400); // Animation duration
  };

  // Render a square on the board
  const renderSquare = (x: number, y: number) => {
    // Get the piece at this position
    const piece = board[x][y];
    const isSelected = selectedSquare && selectedSquare[0] === x && selectedSquare[1] === y;
    const isLegalMove = legalMoves.some(([mx, my]) => mx === x && my === y);
    
    // Highlight the last move
    const isLastMoveFrom = lastMove && lastMove.from[0] === x && lastMove.from[1] === y;
    const isLastMoveTo = lastMove && lastMove.to[0] === x && lastMove.to[1] === y;
    
    // Determine square color
    const isDarkSquare = (x + y) % 2 === 1;
    
    // Build class names
    let squareClass = `square ${isDarkSquare ? 'dark' : 'light'}`;
    if (isSelected) squareClass += ' selected';
    if (isLegalMove) squareClass += ' legal-move';
    if (isLastMoveFrom) squareClass += ' last-move-from';
    if (isLastMoveTo) squareClass += ' last-move-to';
    
    // Check if king is in check
    if (
      piece && 
      piece.type === 'king' && 
      gameState.check && 
      piece.color === currentTurn
    ) {
      squareClass += ' check';
    }
    
    // Hide the piece if it's being animated
    const isAnimating = animatingPiece && 
                        animatingPiece.fromX === x && 
                        animatingPiece.fromY === y;
    
    return (
      <div
        key={`${x}-${y}`}
        className={squareClass}
        onClick={() => handleSquareClick(x, y)}
        data-square={`${String.fromCharCode(97 + x)}${y + 1}`}
      >
        {piece && !isAnimating && (
          <div 
            className={`piece ${piece.color === currentTurn ? 'movable' : 'opponent'}`}
            style={{
              backgroundImage: `url(/img/pieces/${piece.color}${piece.type}.png)`,
              cursor: piece.color === currentTurn ? 'pointer' : 'not-allowed'
            }}
            data-piece={`${piece.color}-${piece.type}`}
          />
        )}
        {isLegalMove && <div className="legal-move-indicator" />}
      </div>
    );
  };

  // Render the promotion dialog
  const renderPromotionDialog = () => {
    if (!promotionSquare || !selectedSquare) return null;
    
    const [x] = promotionSquare;
    // Adjust coordinates if board is flipped
    const displayX = flipped ? 7 - x : x;
    
    const promotionPieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];
    const color = currentTurn;
    
    // Position the dialog based on both color and board orientation
    const isWhiteAtBottom = (color === 'white' && !flipped) || (color === 'black' && flipped);
    
    return (
      <div 
        className="promotion-dialog"
        style={{ 
          left: `${displayX * 12.5}%`,
          top: isWhiteAtBottom ? '0' : 'auto',
          bottom: !isWhiteAtBottom ? '0' : 'auto'
        }}
      >
        {promotionPieces.map((pieceType) => (
          <div 
            key={pieceType}
            className="promotion-option"
            onClick={() => handlePromotion(pieceType)}
          >
            <div 
              className="piece"
              style={{
                backgroundImage: `url(/img/pieces/${color}${pieceType}.png)`
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  // Render rank labels (1-8)
  const renderRankLabels = () => {
    return (
      <div className="rank-labels">
        {Array.from({ length: 8 }, (_, i) => {
          // If board is flipped, we need to render ranks in reverse order
          const rank = flipped ? i + 1 : 8 - i;
          return (
            <div key={i} className="rank-label">
              {rank}
            </div>
          );
        })}
      </div>
    );
  };

  // Render file labels (a-h)
  const renderFileLabels = () => {
    return (
      <div className="file-labels">
        {Array.from({ length: 8 }, (_, i) => {
          // If board is flipped, we need to render files in reverse order
          const file = String.fromCharCode(97 + (flipped ? 7 - i : i));
          return (
            <div key={i} className="file-label">
              {file}
            </div>
          );
        })}
      </div>
    );
  };

  // Calculate the position for the animating piece
  const getAnimatingPieceStyle = () => {
    if (!animatingPiece) return {};
    
    // Calculate display coordinates based on board orientation
    const fromX = flipped ? 7 - animatingPiece.fromX : animatingPiece.fromX;
    const fromY = flipped ? animatingPiece.fromY : 7 - animatingPiece.fromY;
    const toX = flipped ? 7 - animatingPiece.toX : animatingPiece.toX;
    const toY = flipped ? animatingPiece.toY : 7 - animatingPiece.toY;
    
    return {
      backgroundImage: `url(/img/pieces/${animatingPiece.piece.color}${animatingPiece.piece.type}.png)`,
      left: `${fromX * 12.5}%`,
      top: `${fromY * 12.5}%`,
      '--dx': toX - fromX,
      '--dy': toY - fromY
    } as React.CSSProperties;
  };

  // Log the board orientation for debugging
  useEffect(() => {
    console.log(`Chessboard rendered with flipped=${flipped}`);
  }, [flipped]);
  
  return (
    <div className="chessboard-container" data-flipped={flipped ? 'true' : 'false'}>
      {renderRankLabels()}
      <div className="board-and-files">
        <div 
          ref={boardRef}
          className="chessboard"
          aria-label="Chess board"
          role="grid"
        >
          {Array.from({ length: 8 }, (_, y) => {
            return (
              <div key={y} className="board-row" role="row">
                {Array.from({ length: 8 }, (_, x) => {
                  // Calculate the actual board coordinates based on flipped state
                  // When flipped, black pieces are at the bottom (rows 0-1)
                  // When not flipped, white pieces are at the bottom (rows 6-7)
                  const actualX = flipped ? 7 - x : x;
                  const actualY = flipped ? y : 7 - y;
                  return renderSquare(actualX, actualY);
                })}
              </div>
            );
          })}
          
          {/* Animating piece */}
          {animatingPiece && (
            <div 
              className="animating-piece"
              style={getAnimatingPieceStyle()}
            />
          )}
          
          {promotionSquare && renderPromotionDialog()}
        </div>
        {renderFileLabels()}
      </div>
    </div>
  );
};

export default Chessboard;