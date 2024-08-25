// Chessboard.tsx
// @ts-ignore
import * as React from 'react';
import { standardBoard, Board, Piece, point } from './chessObjects';
import './chessboard.css'; // Import the CSS file

interface ChessboardProps {
    // Add any props you might need
}

interface ChessboardState {
    chessboard: Board;
    selectedSquare: point | null;
    legalMoves: point[];
    turn: boolean;
}

class Chessboard extends React.Component<ChessboardProps, ChessboardState> {
    constructor(props: ChessboardProps) {
        super(props);
        this.state = {
            chessboard: new standardBoard(),
            selectedSquare: null,
            legalMoves: [],
            turn: true
        };
    }

    handleSquareClick = (x: number, y: number) => {
        const { chessboard, selectedSquare } = this.state;

        if (!selectedSquare) {
            const piece = chessboard.getBoard()[x][y];
            if (piece && piece.getColor() === this.state.turn) {
                const legalMoves = piece.findLegalSquares(chessboard);
                this.setState({ selectedSquare: [x, y], legalMoves });
            }
        } else {
            const updatedBoard = chessboard.move(selectedSquare, [x, y]);
            if (updatedBoard) {
                const moveAnimationClass = 'move-animation';
                const squares = document.querySelectorAll('.square');

                squares[selectedSquare[0] * 8 + selectedSquare[1]].classList.add(moveAnimationClass);

                setTimeout(() => {
                    squares[selectedSquare[0] * 8 + selectedSquare[1]].classList.remove(moveAnimationClass);
                }, 500);

                const piece = updatedBoard.getBoard()[x][y];
                // @ts-ignore
                if (piece && piece.type === 'pawn' && (piece.getColor() && y === 7) || !piece.getColor() && y === 0) {
                    this.handlePawnPromotion(x, y);
                }

                this.setState({
                    chessboard: updatedBoard,
                    selectedSquare: null,
                    legalMoves: [],
                    turn: !this.state.turn
                });

            } else {
                this.setState({ chessboard: chessboard, selectedSquare: null, legalMoves: []});
            }
        }
        if(this.state.chessboard.checkMate(this.state.turn)) {
            window.alert("Checkmate.")
        }
    };

    handlePawnPromotion = (x: number, y: number) => {
        const pieceColor = this.state.turn;

        let chosen = window.prompt(`Choose a piece to promote your pawn to: Queen, Knight, Bishop, or Rook`);

        while(!chosen || (chosen.toLowerCase() != "queen" && chosen.toLowerCase() != "rook" &&
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
        // if(this.state.turn) {
            return (
                <div key={rowIndex} className="board-row">
                    {Array.from({length: 8}, (_, colIndex) => this.renderSquare(rowIndex, 7 - colIndex))}
                </div>
            );
        // } else {
        //     return (
        //         <div key={rowIndex} className="board-row">
        //             {Array.from({length: 8}, (_, colIndex) => this.renderSquare(7- rowIndex, colIndex))}
        //         </div>
        //     );
        // }
    }

    render() {
        return (
            <div className="chessboard">
                {Array.from({length: 8}, (_, rowIndex) => this.renderRow(rowIndex))}
            </div>
        );
    }
}

export default Chessboard;
