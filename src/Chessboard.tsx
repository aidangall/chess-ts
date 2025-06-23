// Chessboard.tsx
import * as React from 'react';
import { standardBoard, Board, Piece, point } from './chessObjects';
import './chessboard.css'; // Import the CSS file

interface ChessboardProps {
    flipBoard?: boolean;
}

interface ChessboardState {
    chessboard: Board;
    selectedSquare: point | null;
    legalMoves: point[];
    turn: boolean; // true = white, false = black
    gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';
    moveHistory: string[];
    capturedPieces: { white: Piece[], black: Piece[] };
    isRotating: boolean;
    canMove: boolean;
}

class Chessboard extends React.Component<ChessboardProps, ChessboardState> {
    constructor(props: ChessboardProps) {
        super(props);
        this.state = {
            chessboard: new standardBoard(),
            selectedSquare: null,
            legalMoves: [],
            turn: true, // White starts
            gameStatus: 'playing',
            moveHistory: [],
            capturedPieces: { white: [], black: [] },
            isRotating: false,
            canMove: true
        };
    }

    handleSquareClick = (x: number, y: number) => {
        console.log(`Square clicked: ${x}, ${y}`);
        const { chessboard, selectedSquare, turn, capturedPieces, canMove } = this.state;
        console.log(`canMove: ${canMove}, turn: ${turn ? 'white' : 'black'}`);

        // Don't allow moves during rotation or when canMove is false
        if (!canMove) {
            console.log('Moves are currently disabled');
            return;
        }

        if (!selectedSquare) {
            const piece = chessboard.getBoard()[x][y];
            console.log('Piece at clicked square:', piece);
            if (piece && piece.getColor() === turn) {
                const legalMoves = piece.findLegalSquares(chessboard);
                console.log('Legal moves:', legalMoves);
                this.setState({ selectedSquare: [x, y], legalMoves });
            }
        } else {
            // Check if the clicked square is the same as the selected square (deselect)
            if (selectedSquare[0] === x && selectedSquare[1] === y) {
                this.setState({ selectedSquare: null, legalMoves: [] });
                return;
            }

            // Check if the clicked square is a legal move
            const isLegalMove = this.state.legalMoves.some(move => move[0] === x && move[1] === y);
            if (!isLegalMove) {
                // If not a legal move, check if it's another piece of the same color
                const newPiece = chessboard.getBoard()[x][y];
                if (newPiece && newPiece.getColor() === turn) {
                    // Select the new piece instead
                    const legalMoves = newPiece.findLegalSquares(chessboard);
                    this.setState({ selectedSquare: [x, y], legalMoves });
                    return;
                } else {
                    // Not a legal move and not a selectable piece
                    return;
                }
            }
            
            // Store the piece that might be captured
            const targetPiece = chessboard.getBoard()[x][y];
            const movingPiece = chessboard.getBoard()[selectedSquare[0]][selectedSquare[1]];
            
            // Try to make the move
            console.log('Attempting to move from', selectedSquare, 'to', [x, y]);
            const updatedBoard = chessboard.move(selectedSquare, [x, y]);
            console.log('Move result:', updatedBoard ? 'success' : 'failed');
            
            if (updatedBoard) {
                // Add move to history
                const moveNotation = this.getMoveNotation(movingPiece!, selectedSquare, [x, y], !!targetPiece);
                const updatedHistory = [...this.state.moveHistory, moveNotation];
                
                // Update captured pieces
                const updatedCapturedPieces = { ...capturedPieces };
                if (targetPiece) {
                    const captureColor = targetPiece.getColor() ? 'white' : 'black';
                    updatedCapturedPieces[captureColor] = [...updatedCapturedPieces[captureColor], targetPiece];
                }
                
                // Check for en passant capture
                if (movingPiece?.type === 'pawn' && selectedSquare[0] !== x && !targetPiece) {
                    const captureY = turn ? y - 1 : y + 1;
                    const capturedPawn = chessboard.getBoard()[x][captureY];
                    if (capturedPawn) {
                        const captureColor = capturedPawn.getColor() ? 'white' : 'black';
                        updatedCapturedPieces[captureColor] = [...updatedCapturedPieces[captureColor], capturedPawn];
                    }
                }
                
                // Check for pawn promotion
                const piece = updatedBoard.getBoard()[x][y];
                if (piece && piece.type === 'pawn' && ((piece.getColor() && y === 7) || (!piece.getColor() && y === 0))) {
                    this.handlePawnPromotion(x, y);
                }
                
                // Switch turns
                const nextTurn = !turn;
                
                // Check game status
                let gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw' = 'playing';
                
                if (updatedBoard.checkCheck(nextTurn)) {
                    if (updatedBoard.checkMate(nextTurn)) {
                        gameStatus = 'checkmate';
                    } else {
                        gameStatus = 'check';
                    }
                } else if (updatedBoard.isStalemate(nextTurn)) {
                    gameStatus = 'stalemate';
                }
                
                // Update board immediately with the new turn
                this.setState({
                    chessboard: updatedBoard,
                    selectedSquare: null,
                    legalMoves: [],
                    isRotating: true,
                    gameStatus,
                    moveHistory: updatedHistory,
                    capturedPieces: updatedCapturedPieces,
                    turn: nextTurn // Update turn immediately
                });
                
                // After animation completes, allow moves again
                setTimeout(() => {
                    this.setState({
                        isRotating: false,
                        canMove: true
                    });
                    
                    // Show game end messages after rotation
                    if (gameStatus === 'checkmate') {
                        setTimeout(() => {
                            window.alert(`Checkmate! ${turn ? 'White' : 'Black'} wins!`);
                        }, 100);
                    } else if (gameStatus === 'stalemate') {
                        setTimeout(() => {
                            window.alert('Stalemate! The game is a draw.');
                        }, 100);
                    }
                }, 1000); // 1 second rotation animation
            } else {
                this.setState({ selectedSquare: null, legalMoves: [] });
            }
        }
    };

    getMoveNotation = (piece: Piece, from: point, to: point, isCapture: boolean): string => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
        
        const fromFile = files[from[0]];
        const fromRank = ranks[from[1]];
        const toFile = files[to[0]];
        const toRank = ranks[to[1]];
        
        let pieceSymbol = '';
        switch (piece.type) {
            case 'king': pieceSymbol = 'K'; break;
            case 'queen': pieceSymbol = 'Q'; break;
            case 'rook': pieceSymbol = 'R'; break;
            case 'bishop': pieceSymbol = 'B'; break;
            case 'knight': pieceSymbol = 'N'; break;
            // Pawns don't have a symbol
        }
        
        const captureSymbol = isCapture ? 'x' : '';
        
        if (piece.type === 'pawn') {
            return isCapture ? `${fromFile}${captureSymbol}${toFile}${toRank}` : `${toFile}${toRank}`;
        } else {
            return `${pieceSymbol}${fromFile}${fromRank}${captureSymbol}${toFile}${toRank}`;
        }
    };

    handlePawnPromotion = (x: number, y: number) => {
        const pieceColor = this.state.turn;

        let chosen = window.prompt(`Choose a piece to promote your pawn to: Queen, Knight, Bishop, or Rook`);

        while (!chosen || (chosen.toLowerCase() != "queen" && chosen.toLowerCase() != "rook" &&
            chosen.toLowerCase() != "knight" && chosen.toLowerCase() != "bishop")) {
            chosen = window.prompt(`Choose a piece to promote your pawn to: Queen, Knight, Bishop, or Rook`);
        }
        chosen = chosen.toLowerCase();

        const updatedBoard = this.state.chessboard.promotePiece(chosen, pieceColor, x, y);
        if (updatedBoard) {
            this.setState({ chessboard: updatedBoard });
        }
    };

    renderSquare = (x: number, y: number) => {
        const {selectedSquare, legalMoves} = this.state;
        const isDarkSquare = (x + y) % 2 === 1;
        const squareColor = isDarkSquare ? 'dark' : 'light';

        let squareClass = `square ${squareColor}`;
        if (selectedSquare && selectedSquare[0] === x && selectedSquare[1] === y) {
            squareClass += ' selected';
        } else if (legalMoves.some(move => move[0] === x && move[1] === y)) {
            squareClass += ' legal-move';
        }

        return (
            <div
                key={`${x}-${y}`}
                className={squareClass}
                onClick={() => this.handleSquareClick(x, y)}
            >
                {this.renderPiece(x, y)}
            </div>
        );
    };

    renderPiece = (x: number, y: number) => {
        const {chessboard} = this.state;
        const piece: Piece | undefined = chessboard.getBoard()[x][y];

        return (
            piece && (
                <img
                    key={`${x}-${y}`}
                    src={piece.getPieceImagePath()}
                    alt={piece.type}
                    className="chess-piece"
                />
            )
        );
    };
    
    renderRow = (rowIndex: number) => {
        const { flipBoard } = this.props;
        const { turn } = this.state;
        
        // Flip the board based on props or current turn
        const shouldFlip = flipBoard === true || (flipBoard === undefined && !turn);
        const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
        const rankLabel = shouldFlip ? ranks[rowIndex] : ranks[7 - rowIndex];
        
        return (
            <div key={rowIndex} className="board-row">
                <div className="rank-label">{rankLabel}</div>
                {Array.from({length: 8}, (_, colIndex) => {
                    // Calculate board coordinates based on visual position
                    let x, y;
                    if (shouldFlip) {
                        x = 7 - colIndex;
                        y = rowIndex;
                    } else {
                        x = colIndex;
                        y = 7 - rowIndex;
                    }
                    return this.renderSquare(x, y);
                })}
            </div>
        );
    }

    renderFileLabels = () => {
        const { flipBoard } = this.props;
        const { turn } = this.state;
        
        // Flip the board based on props or current turn
        const shouldFlip = flipBoard === true || (flipBoard === undefined && !turn);
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        
        return (
            <div className="file-labels">
                <div className="empty-corner"></div>
                {Array.from({length: 8}, (_, index) => {
                    const fileIndex = shouldFlip ? 7 - index : index;
                    return (
                        <div key={index} className="file-label">{files[fileIndex]}</div>
                    );
                })}
            </div>
        );
    }
    
    resetGame = () => {
        this.setState({
            chessboard: new standardBoard(),
            selectedSquare: null,
            legalMoves: [],
            turn: true,
            gameStatus: 'playing',
            moveHistory: [],
            capturedPieces: { white: [], black: [] },
            isRotating: false,
            canMove: true
        });
    }
    
    renderGameInfo = () => {
        const { turn, gameStatus, moveHistory, capturedPieces } = this.state;
        const currentTurn = turn ? 'White' : 'Black';
        let statusText = `${currentTurn}'s turn`;
        
        if (gameStatus === 'check') {
            statusText = `${currentTurn} is in check!`;
        } else if (gameStatus === 'checkmate') {
            statusText = `Checkmate! ${!turn ? 'White' : 'Black'} wins!`;
        } else if (gameStatus === 'stalemate') {
            statusText = 'Stalemate! The game is a draw.';
        }
        
        return (
            <div className="game-info">
                <div className="status">{statusText}</div>
                
                <div className="captured-pieces">
                    <div className="captured-white">
                        {capturedPieces.white.map((piece, index) => (
                            <img 
                                key={`white-captured-${index}`}
                                src={piece.getPieceImagePath()} 
                                alt={piece.type}
                                className="captured-piece"
                            />
                        ))}
                    </div>
                    <div className="captured-black">
                        {capturedPieces.black.map((piece, index) => (
                            <img 
                                key={`black-captured-${index}`}
                                src={piece.getPieceImagePath()} 
                                alt={piece.type}
                                className="captured-piece"
                            />
                        ))}
                    </div>
                </div>
                
                <div className="move-history">
                    <h3>Move History</h3>
                    <div className="moves-list">
                        {moveHistory.map((move, index) => (
                            <span key={index} className="move">
                                {index % 2 === 0 ? `${Math.floor(index/2) + 1}. ` : ''}
                                {move}
                                {index % 2 === 0 ? ' ' : ' '}
                            </span>
                        ))}
                    </div>
                </div>
                
                <button className="reset-button" onClick={this.resetGame}>New Game</button>
            </div>
        );
    }
    
    render() {
        const { isRotating } = this.state;
        return (
            <div className="chess-game">
                <div className="chessboard-with-labels">
                    <div className={`chessboard ${isRotating ? 'rotating' : ''}`}>
                        {Array.from({length: 8}, (_, rowIndex) => this.renderRow(rowIndex))}
                    </div>
                    {this.renderFileLabels()}
                </div>
                {this.renderGameInfo()}
            </div>
        );
    }
}

export default Chessboard;