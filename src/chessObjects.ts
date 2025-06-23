
export type point = [x: number, y: number];

export interface Board {
    getBoard: () => (Piece | undefined)[][];
    move: (to: point, from: point) => Board | undefined;
    checkSquare: (square: point, color: boolean) => boolean;
    checkCheck: (moved: boolean) => boolean;
    promotePiece: (type: string, color: boolean, x: number, y: number) => Board;
    checkMate: (color: boolean) => boolean;
    lastMovedPiece?: { piece: Piece, from: point, to: point };
    isStalemate: (color: boolean) => boolean;
}

export class standardBoard implements Board {
    board: (Piece | undefined)[][];
    lastMovedPiece?: { piece: Piece, from: point, to: point };

    constructor() {
        // Initialize an 8x8 board with undefined values
        this.board = Array(8).fill(null).map(() => Array(8).fill(undefined));

        // Place white pieces (true = white)
        this.board[0][0] = new rook(true, [0, 0]);
        this.board[1][0] = new knight(true, [1, 0]);
        this.board[2][0] = new bishop(true, [2, 0]);
        this.board[3][0] = new queen(true, [3, 0]);
        this.board[4][0] = new king(true, [4, 0]);
        this.board[5][0] = new bishop(true, [5, 0]);
        this.board[6][0] = new knight(true, [6, 0]);
        this.board[7][0] = new rook(true, [7, 0]);

        // Place white pawns
        for (let i = 0; i < 8; i++) {
            this.board[i][1] = new pawn(true, [i, 1]);
        }

        // Place black pieces (false = black)
        this.board[0][7] = new rook(false, [0, 7]);
        this.board[1][7] = new knight(false, [1, 7]);
        this.board[2][7] = new bishop(false, [2, 7]);
        this.board[3][7] = new queen(false, [3, 7]);
        this.board[4][7] = new king(false, [4, 7]);
        this.board[5][7] = new bishop(false, [5, 7]);
        this.board[6][7] = new knight(false, [6, 7]);
        this.board[7][7] = new rook(false, [7, 7]);

        // Place black pawns
        for (let i = 0; i < 8; i++) {
            this.board[i][6] = new pawn(false, [i, 6]);
        }
    }

    getBoard = (): (Piece | undefined)[][] => { return this.board; }

    move = ([x, y]: point, [a, b]: point): Board | undefined => {
        const piece = this.getBoard()[x][y];

        if (piece === undefined) {
            return undefined;
        } else {
            // Temporarily allow all moves for testing
            /*
            const points: point[] = piece.findLegalSquares2(this);
            let moveIsLegal = false;

            for (let i: number = 0; i < points.length; i++) {
                if (points[i][0] === a && points[i][1] === b) {
                    moveIsLegal = true;
                    break;
                }
            }

            if (!moveIsLegal) {
                console.log("illegal move");
                return undefined;
            }
            */
            
            // For testing, allow any move as long as it's to a different square
            if (x === a && y === b) {
                console.log("Can't move to the same square");
                return undefined;
            }

            const pieceColor: boolean = piece.getColor();
            const temp: Piece | undefined = this.board[a][b];

            // Handle en passant capture
            let capturedEnPassant = false;
            if (piece.type === "pawn" && a !== x && !temp) {
                // This is a diagonal pawn move with no piece to capture - must be en passant
                const captureY = piece.getColor() ? b - 1 : b + 1;
                const capturedPawn = this.board[a][captureY];
                if (capturedPawn && capturedPawn.type === "pawn") {
                    this.board[a][captureY] = undefined;
                    capturedEnPassant = true;
                }
            }

            // Make the move
            this.board[a][b] = piece;
            piece.changeCoords([a, b]);
            this.board[x][y] = undefined;

            // Temporarily disable check validation
            /*
            if (this.checkCheck(pieceColor)) {
                // Undo the move
                this.board[x][y] = piece;
                piece.changeCoords([x, y]);
                this.board[a][b] = temp;

                // Restore captured en passant pawn if needed
                if (capturedEnPassant) {
                    const captureY = piece.getColor() ? b - 1 : b + 1;
                    this.board[a][captureY] = this.lastMovedPiece?.piece;
                }

                console.log("move would result in check");
                return undefined;
            }
            */

            // Handle castling
            if (piece.type === "king" && !piece.hasMoved) {
                if (a === 1) { // Queenside castling
                    const rook = this.board[0][b];
                    if (rook) {
                        this.board[2][b] = rook;
                        this.board[0][b] = undefined;
                        rook.changeCoords([2, b]);
                        rook.hasMoved = true;
                    }
                } else if (a === 6) { // Kingside castling
                    const rook = this.board[7][b];
                    if (rook) {
                        this.board[5][b] = rook;
                        this.board[7][b] = undefined;
                        rook.changeCoords([5, b]);
                        rook.hasMoved = true;
                    }
                }
            }

            // Mark piece as moved (important for pawns, kings, rooks)
            piece.hasMoved = true;

            // Store the last moved piece (for en passant)
            this.lastMovedPiece = { piece, from: [x, y], to: [a, b] };

            return this;
        }
    }

    promotePiece = (type: string, color: boolean, x: number, y: number): Board => {
        switch (type) {
            case "queen": { this.board[x][y] = new queen(color, [x, y]); break }
            case "rook": { this.board[x][y] = new rook(color, [x, y]); break }
            case "knight": { this.board[x][y] = new knight(color, [x, y]); break }
            case "bishop": { this.board[x][y] = new bishop(color, [x, y]); break }
            default: { }
        }
        return this;
    }

    checkSquare = (square: point, color: boolean): boolean => {
        if (square[0] < 0 || square[0] >= this.board[0].length) {
            return false;
        }
        if (square[1] < 0 || square[1] >= this.board[0].length) {
            return false;
        }
        const currentSquare = this.board[square[0]][square[1]];
        if (currentSquare === undefined) {
            return true;
        } else {
            if (currentSquare.getColor() === color) {
                return false
            }
        }
        return true;
    }

    checkCheck = (moved: boolean): boolean => {
        // Find the king of the specified color
        let kingPos: point | null = null;
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = this.board[x][y];
                if (piece && piece.type === 'king' && piece.getColor() === moved) {
                    kingPos = [x, y];
                    break;
                }
            }
            if (kingPos) break;
        }

        if (!kingPos) return false; // No king found (shouldn't happen in a valid game)

        // Check if any opponent piece can attack the king
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = this.board[x][y];
                if (piece && piece.getColor() !== moved) {
                    const legalMoves = piece.findLegalSquares2(this);
                    if (legalMoves.some(move => move[0] === kingPos![0] && move[1] === kingPos![1])) {
                        return true; // King is in check
                    }
                }
            }
        }

        return false; // King is not in check
    }

    checkMate = (color: boolean): boolean => {
        // First check if the king is in check
        if (!this.checkCheck(color)) {
            return false; // Not in check, so not checkmate
        }

        // Check if any legal moves exist
        return this.hasNoLegalMoves(color);
    }

    isStalemate = (color: boolean): boolean => {
        // In stalemate, the king is not in check
        if (this.checkCheck(color)) {
            return false;
        }

        // But the player has no legal moves
        return this.hasNoLegalMoves(color);
    }

    private hasNoLegalMoves = (color: boolean): boolean => {
        // Try all possible moves for all pieces of the given color
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = this.board[x][y];
                if (piece && piece.getColor() === color) {
                    const legalMoves = piece.findLegalSquares(this);
                    if (legalMoves.length > 0) {
                        return false; // At least one legal move exists
                    }
                }
            }
        }

        return true; // No legal moves
    }
}

const testMove = (board: Board, [x, y]: point, [a, b]: point): boolean => {
    //return true;
    const piece = board.getBoard()[x][y];
    if (piece === undefined) {
        return false;
    } else {
        const pieceColor: boolean = piece.getColor();
        const temp: Piece | undefined = board.getBoard()[a][b];
        board.getBoard()[a][b] = piece;
        piece.changeCoords([a, b])
        board.getBoard()[x][y] = undefined;

        if (!board.checkCheck(pieceColor)) {
            board.getBoard()[x][y] = piece;
            piece.changeCoords([x, y])
            board.getBoard()[a][b] = temp;
            console.log("check")
            return false;
        }
        board.getBoard()[x][y] = piece;
        piece.changeCoords([x, y])
        board.getBoard()[a][b] = temp;
        return true;
    }
}

export interface Piece {
    type: string;
    findLegalSquares: (board: Board) => point[];
    findLegalSquares2: (board: Board) => point[];
    hasMoved: boolean;

    getValue: () => number;
    getColor: () => boolean;
    changeCoords: (coords: point) => point;
    getPieceImagePath: () => string;
    getCoords: () => point;
}

class pawn implements Piece {
    type: string = "pawn"
    hasMoved: boolean = false;
    readonly color: boolean = true;
    x: number;
    y: number;

    constructor(color: boolean, coords: point) {
        this.color = color;
        [this.x, this.y] = coords;
    }

    getPieceImagePath = () => {
        const colorPrefix = this.color ? 'white' : 'black';
        return `img/pieces/${colorPrefix}${this.type.toLowerCase()}.png`;
    };

    getCoords = (): point => {
        return [this.x, this.y]
    }


    findLegalSquares = (board: Board): point[] => {
        let result: point[] = [];
        const grid = board.getBoard();

        // Forward movement
        if (this.color) { // White pawn
            if (this.y < grid[0].length) {
                // One square forward
                if (!grid[this.x][this.y + 1]) {
                    result.push([this.x, this.y + 1])
                    // Two squares forward from starting position
                    if (this.y === 1 && !grid[this.x][this.y + 2]) {
                        result.push([this.x, this.y + 2])
                    }
                }
                // Diagonal captures
                if (board.checkSquare([this.x + 1, this.y + 1], this.color)) {
                    if (grid[this.x + 1][this.y + 1] && grid[this.x + 1][this.y + 1]?.getColor() !== this.color)
                        result.push([this.x + 1, this.y + 1])
                }
                if (board.checkSquare([this.x - 1, this.y + 1], this.color)) {
                    if (grid[this.x - 1][this.y + 1] && grid[this.x - 1][this.y + 1]?.getColor() !== this.color)
                        result.push([this.x - 1, this.y + 1])
                }

                // En passant
                if (this.y === 4) { // White pawns can en passant on rank 5
                    const lastMove = board.lastMovedPiece;
                    if (lastMove && lastMove.piece.type === "pawn" && !lastMove.piece.getColor()) {
                        // Check if the last move was a black pawn moving two squares forward
                        const [fromX, fromY] = lastMove.from;
                        const [toX, toY] = lastMove.to;

                        if (fromY === 6 && toY === 4 && Math.abs(toX - this.x) === 1 && toY === this.y) {
                            // Can capture en passant
                            result.push([toX, this.y + 1]);
                        }
                    }
                }
            }
        } else { // Black pawn
            if (this.y > 0) {
                // One square forward
                if (!grid[this.x][this.y - 1]) {
                    result.push([this.x, this.y - 1])
                    // Two squares forward from starting position
                    if (this.y === 6 && !grid[this.x][this.y - 2]) {
                        result.push([this.x, this.y - 2])
                    }
                }
                // Diagonal captures
                if (board.checkSquare([this.x + 1, this.y - 1], this.color)) {
                    if (grid[this.x + 1][this.y - 1] && grid[this.x + 1][this.y - 1]?.getColor() !== this.color)
                        result.push([this.x + 1, this.y - 1])
                }
                if (board.checkSquare([this.x - 1, this.y - 1], this.color)) {
                    if (grid[this.x - 1][this.y - 1] && grid[this.x - 1][this.y - 1]?.getColor() !== this.color)
                        result.push([this.x - 1, this.y - 1])
                }

                // En passant
                if (this.y === 3) { // Black pawns can en passant on rank 4
                    const lastMove = board.lastMovedPiece;
                    if (lastMove && lastMove.piece.type === "pawn" && lastMove.piece.getColor()) {
                        // Check if the last move was a white pawn moving two squares forward
                        const [fromX, fromY] = lastMove.from;
                        const [toX, toY] = lastMove.to;

                        if (fromY === 1 && toY === 3 && Math.abs(toX - this.x) === 1 && toY === this.y) {
                            // Can capture en passant
                            result.push([toX, this.y - 1]);
                        }
                    }
                }
            }
        }

        // Filter out moves that would leave the king in check
        let result2: point[] = [];
        for (var move of result) {
            if (testMove(board, [this.x, this.y], move)) {
                result2.push(move)
            }
        }
        return result2;
    }
    findLegalSquares2 = (board: Board): point[] => {
        let result: point[] = [];
        const grid = board.getBoard();
        if (this.color) {
            if (this.y < grid[0].length) {
                if (!grid[this.x][this.y + 1]) {
                    result.push([this.x, this.y + 1])
                    if (this.y === 1 && !grid[this.x][this.y + 2]) {
                        result.push([this.x, this.y + 2])
                    }
                }
                if (board.checkSquare([this.x + 1, this.y + 1], this.color)) {
                    if (grid[this.x + 1][this.y + 1] && grid[this.x + 1][this.y + 1]?.getColor() !== this.color)
                        result.push([this.x + 1, this.y + 1])
                }
                if (board.checkSquare([this.x - 1, this.y + 1], this.color)) {
                    if (grid[this.x - 1][this.y + 1] && grid[this.x - 1][this.y + 1]?.getColor() !== this.color)
                        result.push([this.x - 1, this.y + 1])
                }
            }
        } else {
            if (this.y > 0) {
                if (!grid[this.x][this.y - 1]) {
                    result.push([this.x, this.y - 1])
                    if (this.y === 6 && !grid[this.x][this.y - 2]) {
                        result.push([this.x, this.y - 2])
                    }
                }
                if (board.checkSquare([this.x + 1, this.y - 1], this.color)) {
                    if (grid[this.x + 1][this.y - 1] && grid[this.x + 1][this.y - 1]?.getColor() !== this.color)
                        result.push([this.x + 1, this.y - 1])
                }
                if (board.checkSquare([this.x - 1, this.y - 1], this.color)) {
                    if (grid[this.x - 1][this.y - 1] && grid[this.x - 1][this.y - 1]?.getColor() !== this.color)
                        result.push([this.x - 1, this.y - 1])
                }
            }
        }
        return result;
    }
    getValue = (): number => { return 1; }
    getColor = (): boolean => { return this.color; }
    changeCoords = (coords: point): point => {
        this.x = coords[0];
        this.y = coords[1];
        return coords;
    }
}

class knight implements Piece {
    type: string = "knight"
    hasMoved: boolean = false;

    readonly color: boolean = true;
    x: number;
    y: number;

    constructor(color: boolean, coords: point) {
        this.color = color;
        [this.x, this.y] = coords;
    }


    getCoords = (): point => {
        return [this.x, this.y]
    }
    getPieceImagePath = () => {
        const colorPrefix = this.color ? 'white' : 'black';
        return `img/pieces/${colorPrefix}${this.type.toLowerCase()}.png`;
    };

    findLegalSquares = (board: Board): point[] => {
        let result: point[] = [];

        if (board.checkSquare([this.x + 1, this.y + 2], this.color))
            result.push([this.x + 1, this.y + 2]);
        if (board.checkSquare([this.x - 1, this.y + 2], this.color))
            result.push([this.x - 1, this.y + 2]);
        if (board.checkSquare([this.x + 1, this.y - 2], this.color))
            result.push([this.x + 1, this.y - 2]);
        if (board.checkSquare([this.x - 1, this.y - 2], this.color))
            result.push([this.x - 1, this.y - 2]);

        if (board.checkSquare([this.x - 2, this.y - 1], this.color))
            result.push([this.x - 2, this.y - 1]);
        if (board.checkSquare([this.x - 2, this.y + 1], this.color))
            result.push([this.x - 2, this.y + 1]);
        if (board.checkSquare([this.x + 2, this.y - 1], this.color))
            result.push([this.x + 2, this.y - 1]);
        if (board.checkSquare([this.x + 2, this.y + 1], this.color))
            result.push([this.x + 2, this.y + 1]);

        let result2: point[] = [];
        for (var move of result) {
            if (testMove(board, [this.x, this.y], move)) {
                result2.push(move)
            }
        }
        return result2;
    }
    findLegalSquares2 = (board: Board): point[] => {
        let result: point[] = [];

        if (board.checkSquare([this.x + 1, this.y + 2], this.color))
            result.push([this.x + 1, this.y + 2]);
        if (board.checkSquare([this.x - 1, this.y + 2], this.color))
            result.push([this.x - 1, this.y + 2]);
        if (board.checkSquare([this.x + 1, this.y - 2], this.color))
            result.push([this.x + 1, this.y - 2]);
        if (board.checkSquare([this.x - 1, this.y - 2], this.color))
            result.push([this.x - 1, this.y - 2]);

        if (board.checkSquare([this.x - 2, this.y - 1], this.color))
            result.push([this.x - 2, this.y - 1]);
        if (board.checkSquare([this.x - 2, this.y + 1], this.color))
            result.push([this.x - 2, this.y + 1]);
        if (board.checkSquare([this.x + 2, this.y - 1], this.color))
            result.push([this.x + 2, this.y - 1]);
        if (board.checkSquare([this.x + 2, this.y + 1], this.color))
            result.push([this.x + 2, this.y + 1]);

        return result;
    }
    getValue = (): number => { return 3; }
    getColor = (): boolean => { return this.color; }
    changeCoords = (coords: point): point => {
        this.x = coords[0];
        this.y = coords[1];
        return coords;
    }
}

class bishop implements Piece {
    type: string = "bishop"
    hasMoved: boolean = false;

    readonly color: boolean = true;
    x: number;
    y: number;

    constructor(color: boolean, coords: point) {
        this.color = color;
        [this.x, this.y] = coords;
    }


    getCoords = (): point => {
        return [this.x, this.y]
    }


    getPieceImagePath = () => {
        const colorPrefix = this.color ? 'white' : 'black';
        return `img/pieces/${colorPrefix}${this.type.toLowerCase()}.png`;
    };

    findLegalSquares = (board: Board): point[] => {
        let result: point[] = [];

        let n: number = 1;
        while (board.checkSquare([this.x + n, this.y + n], this.color)) {
            result.push([this.x + n, this.y + n]);
            if (board.getBoard()[this.x + n][this.y + n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x - n, this.y + n], this.color)) {
            result.push([this.x - n, this.y + n]);
            if (board.getBoard()[this.x - n][this.y + n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x + n, this.y - n], this.color)) {
            result.push([this.x + n, this.y - n]);
            if (board.getBoard()[this.x + n][this.y - n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x - n, this.y - n], this.color)) {
            result.push([this.x - n, this.y - n]);
            if (board.getBoard()[this.x - n][this.y - n]) {
                break
            }
            n += 1;
        }
        let result2: point[] = [];
        for (var move of result) {
            if (testMove(board, [this.x, this.y], move)) {
                result2.push(move)
            }

        }
        return result2;
    }
    findLegalSquares2 = (board: Board): point[] => {
        let result: point[] = [];

        let n: number = 1;
        while (board.checkSquare([this.x + n, this.y + n], this.color)) {
            result.push([this.x + n, this.y + n]);
            if (board.getBoard()[this.x + n][this.y + n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x - n, this.y + n], this.color)) {
            result.push([this.x - n, this.y + n]);
            if (board.getBoard()[this.x - n][this.y + n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x + n, this.y - n], this.color)) {
            result.push([this.x + n, this.y - n]);
            if (board.getBoard()[this.x + n][this.y - n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x - n, this.y - n], this.color)) {
            result.push([this.x - n, this.y - n]);
            if (board.getBoard()[this.x - n][this.y - n]) {
                break
            }
            n += 1;
        }
        return result;
    }
    getValue = (): number => { return 3; }
    getColor = (): boolean => { return this.color; }
    changeCoords = (coords: point): point => {
        this.x = coords[0];
        this.y = coords[1];
        return coords;
    }
}

class rook implements Piece {
    type: string = "rook"
    hasMoved: boolean = false;

    readonly color: boolean = true;
    x: number;
    y: number;

    constructor(color: boolean, coords: point) {
        this.color = color;
        [this.x, this.y] = coords;
    }

    getCoords = (): point => {
        return [this.x, this.y]
    }

    getPieceImagePath = () => {
        const colorPrefix = this.color ? 'white' : 'black';
        return `img/pieces/${colorPrefix}${this.type.toLowerCase()}.png`;
    };

    findLegalSquares = (board: Board): point[] => {
        let result: point[] = [];

        let n: number = 1;
        while (board.checkSquare([this.x + n, this.y], this.color)) {
            result.push([this.x + n, this.y]);
            if (board.getBoard()[this.x + n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x - n, this.y], this.color)) {
            result.push([this.x - n, this.y]);
            if (board.getBoard()[this.x - n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x, this.y - n], this.color)) {
            result.push([this.x, this.y - n]);
            if (board.getBoard()[this.x][this.y - n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x, this.y + n], this.color)) {
            result.push([this.x, this.y + n]);
            if (board.getBoard()[this.x][this.y + n]) {
                break
            }
            n += 1;
        }
        let result2: point[] = [];
        for (var move of result) {
            if (testMove(board, [this.x, this.y], move)) {
                result2.push(move)
            }

        }
        return result2;
    }
    findLegalSquares2 = (board: Board): point[] => {
        let result: point[] = [];

        let n: number = 1;
        while (board.checkSquare([this.x + n, this.y], this.color)) {
            result.push([this.x + n, this.y]);
            if (board.getBoard()[this.x + n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x - n, this.y], this.color)) {
            result.push([this.x - n, this.y]);
            if (board.getBoard()[this.x - n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x, this.y - n], this.color)) {
            result.push([this.x, this.y - n]);
            if (board.getBoard()[this.x][this.y - n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x, this.y + n], this.color)) {
            result.push([this.x, this.y + n]);
            if (board.getBoard()[this.x][this.y + n]) {
                break
            }
            n += 1;
        }

        return result;
    }
    getValue = (): number => { return 5; }
    getColor = (): boolean => { return this.color; }
    changeCoords = (coords: point): point => {
        this.x = coords[0];
        this.y = coords[1];
        return coords;
    }
}

class queen implements Piece {

    type: string = "queen"
    hasMoved: boolean = false;

    readonly color: boolean = true;
    x: number;
    y: number;

    constructor(color: boolean, coords: point) {
        this.color = color;
        [this.x, this.y] = coords;
    }


    getCoords = (): point => {
        return [this.x, this.y]
    }

    getPieceImagePath = () => {
        const colorPrefix = this.color ? 'white' : 'black';
        return `img/pieces/${colorPrefix}${this.type.toLowerCase()}.png`;
    };

    findLegalSquares = (board: Board): point[] => {
        let result: point[] = [];

        let n: number = 1;
        while (board.checkSquare([this.x + n, this.y], this.color)) {
            result.push([this.x + n, this.y]);
            if (board.getBoard()[this.x + n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x - n, this.y], this.color)) {
            result.push([this.x - n, this.y]);
            if (board.getBoard()[this.x - n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x, this.y + n], this.color)) {
            result.push([this.x, this.y + n]);
            if (board.getBoard()[this.x][this.y + n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x, this.y - n], this.color)) {
            result.push([this.x, this.y - n]);
            if (board.getBoard()[this.x][this.y - n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x + n, this.y + n], this.color)) {
            result.push([this.x + n, this.y + n]);
            if (board.getBoard()[this.x + n][this.y + n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x - n, this.y + n], this.color)) {
            result.push([this.x - n, this.y + n]);
            if (board.getBoard()[this.x - n][this.y + n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x + n, this.y - n], this.color)) {
            result.push([this.x + n, this.y - n]);
            if (board.getBoard()[this.x + n][this.y - n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x - n, this.y - n], this.color)) {
            result.push([this.x - n, this.y - n]);
            if (board.getBoard()[this.x - n][this.y - n]) {
                break
            }
            n += 1;
        }
        let result2: point[] = [];
        for (var move of result) {
            if (testMove(board, [this.x, this.y], move)) {
                result2.push(move)
            }

        }
        return result2;
    }
    findLegalSquares2 = (board: Board): point[] => {
        let result: point[] = [];

        let n: number = 1;
        while (board.checkSquare([this.x + n, this.y], this.color)) {
            result.push([this.x + n, this.y]);
            if (board.getBoard()[this.x + n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x - n, this.y], this.color)) {
            result.push([this.x - n, this.y]);
            if (board.getBoard()[this.x - n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x, this.y + n], this.color)) {
            result.push([this.x, this.y + n]);
            if (board.getBoard()[this.x][this.y + n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x, this.y - n], this.color)) {
            result.push([this.x, this.y - n]);
            if (board.getBoard()[this.x][this.y - n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x + n, this.y + n], this.color)) {
            result.push([this.x + n, this.y + n]);
            if (board.getBoard()[this.x + n][this.y + n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x - n, this.y + n], this.color)) {
            result.push([this.x - n, this.y + n]);
            if (board.getBoard()[this.x - n][this.y + n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x + n, this.y - n], this.color)) {
            result.push([this.x + n, this.y - n]);
            if (board.getBoard()[this.x + n][this.y - n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while (board.checkSquare([this.x - n, this.y - n], this.color)) {
            result.push([this.x - n, this.y - n]);
            if (board.getBoard()[this.x - n][this.y - n]) {
                break
            }
            n += 1;
        }
        return result;
    }
    getValue = (): number => { return 9; }
    getColor = (): boolean => { return this.color; }
    changeCoords = (coords: point): point => {
        this.x = coords[0];
        this.y = coords[1];
        return coords;
    }
}

class king implements Piece {

    type: string = "king"
    hasMoved: boolean = false;

    readonly color: boolean = true;
    x: number;
    y: number;

    constructor(color: boolean, coords: point) {
        this.color = color;
        [this.x, this.y] = coords;
    }

    getCoords = (): point => {
        return [this.x, this.y]
    }

    getPieceImagePath = () => {
        const colorPrefix = this.color ? 'white' : 'black';
        return `img/pieces/${colorPrefix}${this.type.toLowerCase()}.png`;
    };

    findLegalSquares = (board: Board): point[] => {
        let result: point[] = [];
        const grid: (Piece | undefined)[][] = board.getBoard();

        if (board.checkSquare([this.x + 1, this.y], this.color))
            result.push([this.x + 1, this.y]);
        if (board.checkSquare([this.x + 1, this.y + 1], this.color))
            result.push([this.x + 1, this.y + 1]);
        if (board.checkSquare([this.x + 1, this.y - 1], this.color))
            result.push([this.x + 1, this.y - 1]);
        if (board.checkSquare([this.x - 1, this.y], this.color))
            result.push([this.x - 1, this.y]);
        if (board.checkSquare([this.x - 1, this.y + 1], this.color))
            result.push([this.x - 1, this.y + 1]);
        if (board.checkSquare([this.x - 1, this.y - 1], this.color))
            result.push([this.x - 1, this.y - 1]);
        if (board.checkSquare([this.x, this.y + 1], this.color))
            result.push([this.x, this.y + 1]);
        if (board.checkSquare([this.x, this.y - 1], this.color))
            result.push([this.x, this.y - 1]);

        //Castling
        if (!this.hasMoved && board.checkCheck(this.color)) {

            const rook: Piece | undefined = grid[0][this.y]
            if (rook && rook.type == "rook") {
                if (!grid[1][this.y] && !grid[2][this.y] && !grid[3][this.y]) {
                    result.push([1, this.y]);
                }
            }

            const rook2: Piece | undefined = grid[7][this.y]
            if (rook2 && rook2.type == "rook") {
                if (!grid[6][this.y] && !grid[5][this.y]) {
                    result.push([6, this.y]);
                }
            }
        }

        let result2: point[] = [];
        for (var move of result) {
            if (testMove(board, [this.x, this.y], move)) {
                result2.push(move)
            }
        }
        return result2;
    }

    findLegalSquares2 = (board: Board): point[] => {
        let result: point[] = [];
        const grid: (Piece | undefined)[][] = board.getBoard();

        if (board.checkSquare([this.x + 1, this.y], this.color))
            result.push([this.x + 1, this.y]);
        if (board.checkSquare([this.x + 1, this.y + 1], this.color))
            result.push([this.x + 1, this.y + 1]);
        if (board.checkSquare([this.x + 1, this.y - 1], this.color))
            result.push([this.x + 1, this.y - 1]);
        if (board.checkSquare([this.x - 1, this.y], this.color))
            result.push([this.x - 1, this.y]);
        if (board.checkSquare([this.x - 1, this.y + 1], this.color))
            result.push([this.x - 1, this.y + 1]);
        if (board.checkSquare([this.x - 1, this.y - 1], this.color))
            result.push([this.x - 1, this.y - 1]);
        if (board.checkSquare([this.x, this.y + 1], this.color))
            result.push([this.x, this.y + 1]);
        if (board.checkSquare([this.x, this.y - 1], this.color))
            result.push([this.x, this.y - 1]);

        //Castling
        if (!this.hasMoved) {

            const rook: Piece | undefined = grid[0][this.y]
            if (rook && rook.type == "rook") {
                if (!grid[1][this.y] && !grid[2][this.y] && !grid[3][this.y]) {
                    result.push([1, this.y]);
                }
            }

            const rook2: Piece | undefined = grid[7][this.y]
            if (rook2 && rook2.type == "rook") {
                if (!grid[6][this.y] && !grid[5][this.y]) {
                    result.push([6, this.y]);
                }
            }
        }
        return result;
    }
    getValue = (): number => { return 9; }
    getColor = (): boolean => { return this.color; }
    changeCoords = (coords: point): point => {
        this.x = coords[0];
        this.y = coords[1];
        return coords;
    }

    getMoved = (): boolean => {
        return this.hasMoved;
    }
}
