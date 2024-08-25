
export type point = [x: number, y: number];

export interface Board {
    getBoard: () => (Piece|undefined)[][];
    move: (to: point, from: point) => Board | undefined;
    checkSquare: (square: point, color: boolean) => boolean;
    checkCheck : (moved: boolean) => boolean;
    promotePiece : (type: string, color: boolean, x: number, y:number) => Board;
    checkMate : (color: boolean) => boolean;
}

export class standardBoard implements Board {
    board: (Piece|undefined)[][];

    constructor() {
        this.board = [
            [new rook(true, [0,0]), new pawn(true, [0,1]),undefined,undefined,undefined,undefined,new pawn(false, [0,6]),new rook(false, [0,7])],
            [new knight(true, [1,0]), new pawn(true, [1,1]),undefined,undefined,undefined,undefined,new pawn(false, [1,6]),new knight(false, [1,7])],
            [new bishop(true, [2,0]), new pawn(true, [2,1]),undefined,undefined,undefined,undefined,new pawn(false, [2,6]),new bishop(false, [2,7])],
            [new queen(true, [3,0]), new pawn(true, [3,1]),undefined,undefined,undefined,undefined,new pawn(false, [3,6]),new queen(false, [3,7])],
            [new king(true, [4,0]), new pawn(true, [4,1]),undefined,undefined,undefined,undefined,new pawn(false, [4,6]),new king(false, [4,7])],
            [new bishop(true, [5,0]), new pawn(true, [5,1]),undefined,undefined,undefined,undefined,new pawn(false, [5,6]),new bishop(false, [5,7])],
            [new knight(true, [6,0]), new pawn(true, [6,1]),undefined,undefined,undefined,undefined,new pawn(false, [6,6]),new knight(false, [6,7])],
            [new rook(true, [7,0]), new pawn(true, [7,1]),undefined,undefined,undefined,undefined,new pawn(false, [7,6]),new rook(false, [7 ,7])],
        ]
    }

    getBoard = (): (Piece|undefined)[][] => { return this.board; }

    move = ([x,y]: point, [a,b]: point): Board | undefined => {

        const piece = this.getBoard()[x][y];

        if(piece === undefined) {
            return undefined;
        } else {
            const points: point[] = piece.findLegalSquares2(this);
            for(let i: number = 0; i < points.length; i++) {
                if(points[i][0] === a && points[i][1] === b) {
                    const pieceColor : boolean = piece.getColor();
                    const check : boolean = this.checkCheck(pieceColor)
                    const temp: Piece|undefined = this.board[a][b];
                    this.board[a][b] = piece;
                    piece.changeCoords([a,b])
                    this.board[x][y] = undefined;

                    if(!this.checkCheck(pieceColor)) {
                        this.board[x][y] = piece;
                        piece.changeCoords([x,y])
                        this.board[a][b] = temp;
                        console.log("check")
                        return undefined;
                    }

                    //Castling
                    if(piece.type === "king" && !piece.hasMoved) {
                        if(a == 1) {
                            const rook = this.board[0][b];
                            if(rook) {
                                this.board[2][b] = rook;
                                this.board[0][b] = undefined
                                rook.changeCoords([2,b]);
                            }


                        } else if (a == 6) {
                            const rook = this.board[7][b];
                            if(rook) {
                                this.board[5][b] = rook;
                                this.board[7][b] = undefined
                                rook.changeCoords([5,b]);
                            }
                        }
                        piece.hasMoved = true;
                    }
                    return this;
                }
            }
        }
        console.log("illegal")
        return undefined;
    }

    promotePiece = (type: string, color: boolean, x: number, y: number): Board => {
        switch(type) {
            case "queen" : {this.board[x][y] = new queen(color, [x,y]); break}
            case "rook" : {this.board[x][y] = new rook(color, [x,y]); break}
            case "knight" : {this.board[x][y] = new knight(color, [x,y]); break}
            case "bishop" : {this.board[x][y] = new bishop(color, [x,y]); break}
            default: {}
        }
        return this;
    }

    checkSquare = (square: point, color: boolean): boolean => {
        if(square[0] < 0 || square[0] >= this.board[0].length) {
            return false;
        }
        if(square[1] < 0 || square[1] >= this.board[0].length) {
            return false;
        }
        const currentSquare = this.board[square[0]][square[1]];
        if(currentSquare === undefined) {
            return true;
        } else {
            if(currentSquare.getColor() === color) {
                return false
            }
        }
        return true;
    }

    checkCheck = (moved: boolean): boolean => {
        for(const row of this.board) {
            for(const piece of row) {
                if(piece !== undefined) {
                    const toCheck: point[] = piece.findLegalSquares2(this);
                    for(const square of toCheck) {
                        const thePiece: Piece | undefined = this.board[square[0]][square[1]]
                        if(thePiece instanceof king && thePiece.color === moved) {
                            return false
                        }
                    }
                }
            }
        }
        return true;
    }

    checkMate = (color: boolean): boolean => {
        for(const row of this.board) {
            for(const piece of row) {
                if(piece !== undefined && !piece.getColor() === color) {
                    const legal: point[] = piece.findLegalSquares(this);
                    if(legal.length > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}

const testMove = (board: Board, [x,y]: point, [a,b]: point): boolean =>{
    //return true;
    const piece = board.getBoard()[x][y];
    if(piece === undefined) {
        return false;
    } else {
        const pieceColor : boolean = piece.getColor();
        const temp: Piece|undefined = board.getBoard()[a][b];
        board.getBoard()[a][b] = piece;
        piece.changeCoords([a,b])
        board.getBoard()[x][y] = undefined;

        if(!board.checkCheck(pieceColor)) {
            board.getBoard()[x][y] = piece;
            piece.changeCoords([x,y])
            board.getBoard()[a][b] = temp;
            console.log("check")
            return false;
        }
        board.getBoard()[x][y] = piece;
        piece.changeCoords([x,y])
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
        const colorPrefix = this.color? 'white' : 'black';
        return `img/pieces/${colorPrefix}${this.type.toLowerCase()}.png`;
    };

    getCoords = (): point => {
        return [this.x, this.y]
    }


    findLegalSquares = (board: Board): point[] => {
        let result : point[] = [];
        const grid = board.getBoard();
        if(this.color) {
            if(this.y < grid[0].length) {
                if(!grid[this.x][this.y + 1]) {
                    result.push([this.x, this.y + 1])
                    if(this.y === 1 && !grid[this.x][this.y + 2]) {
                        result.push([this.x, this.y + 2])
                    }
                }
                if(board.checkSquare([this.x+1, this.y+1], this.color)) {
                    if(grid[this.x+1][this.y+1]&& grid[this.x+1][this.y+1]?.getColor() !== this.color)
                        result.push([this.x+1, this.y + 1])
                }
                if(board.checkSquare([this.x-1, this.y+1], this.color)) {
                    if(grid[this.x-1][this.y+1] && grid[this.x-1][this.y+1]?.getColor() !== this.color)
                        result.push([this.x-1, this.y + 1])
                }
            }
        } else {
            if(this.y > 0) {
                if(!grid[this.x][this.y - 1]) {
                    result.push([this.x, this.y - 1])
                    if(this.y === 6 && !grid[this.x][this.y - 2]) {
                        result.push([this.x, this.y - 2])
                    }
                }
                if(board.checkSquare([this.x+1, this.y-1], this.color)) {
                    if(grid[this.x+1][this.y-1]&&grid[this.x+1][this.y-1]?.getColor() !== this.color)
                        result.push([this.x+1, this.y - 1])
                }
                if(board.checkSquare([this.x-1, this.y-1], this.color)) {
                    if(grid[this.x-1][this.y-1]&&grid[this.x-1][this.y-1]?.getColor() !== this.color)
                        result.push([this.x-1, this.y - 1])
                }
            }
        }
        let result2 : point[] = [];
        for(var move of result) {
            if(testMove(board, [this.x, this.y], move)) {
                result2.push(move)
            }
        }
        return result2;
    }
    findLegalSquares2 = (board: Board): point[] => {
        let result : point[] = [];
        const grid = board.getBoard();
        if(this.color) {
            if(this.y < grid[0].length) {
                if(!grid[this.x][this.y + 1]) {
                    result.push([this.x, this.y + 1])
                    if(this.y === 1 && !grid[this.x][this.y + 2]) {
                        result.push([this.x, this.y + 2])
                    }
                }
                if(board.checkSquare([this.x+1, this.y+1], this.color)) {
                    if(grid[this.x+1][this.y+1]&& grid[this.x+1][this.y+1]?.getColor() !== this.color)
                        result.push([this.x+1, this.y + 1])
                }
                if(board.checkSquare([this.x-1, this.y+1], this.color)) {
                    if(grid[this.x-1][this.y+1] && grid[this.x-1][this.y+1]?.getColor() !== this.color)
                        result.push([this.x-1, this.y + 1])
                }
            }
        } else {
            if(this.y > 0) {
                if(!grid[this.x][this.y - 1]) {
                    result.push([this.x, this.y - 1])
                    if(this.y === 6 && !grid[this.x][this.y - 2]) {
                        result.push([this.x, this.y - 2])
                    }
                }
                if(board.checkSquare([this.x+1, this.y-1], this.color)) {
                    if(grid[this.x+1][this.y-1]&&grid[this.x+1][this.y-1]?.getColor() !== this.color)
                        result.push([this.x+1, this.y - 1])
                }
                if(board.checkSquare([this.x-1, this.y-1], this.color)) {
                    if(grid[this.x-1][this.y-1]&&grid[this.x-1][this.y-1]?.getColor() !== this.color)
                        result.push([this.x-1, this.y - 1])
                }
            }
        }
        return result;
    }
    getValue = (): number => { return 1; }
    getColor = () : boolean => { return this.color; }
    changeCoords = (coords: point) : point => {
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
        const colorPrefix = this.color? 'white' : 'black';
        return `img/pieces/${colorPrefix}${this.type.toLowerCase()}.png`;
    };

    findLegalSquares = (board: Board): point[] => {
        let result : point[] = [];

        if(board.checkSquare([this.x+1, this.y+2], this.color))
            result.push([this.x+1, this.y+2]);
        if(board.checkSquare([this.x-1, this.y+2], this.color))
            result.push([this.x-1, this.y+2]);
        if(board.checkSquare([this.x+1, this.y-2], this.color))
            result.push([this.x+1, this.y-2]);
        if(board.checkSquare([this.x-1, this.y-2], this.color))
            result.push([this.x-1, this.y-2]);

        if(board.checkSquare([this.x-2, this.y-1], this.color))
            result.push([this.x-2, this.y-1]);
        if(board.checkSquare([this.x-2, this.y+1], this.color))
            result.push([this.x-2, this.y+1]);
        if(board.checkSquare([this.x+2, this.y-1], this.color))
            result.push([this.x+2, this.y-1]);
        if(board.checkSquare([this.x+2, this.y+1], this.color))
            result.push([this.x+2, this.y+1]);

        let result2 : point[] = [];
        for(var move of result) {
            if(testMove(board, [this.x, this.y], move)) {
                result2.push(move)
            }
        }
        return result2;
    }
    findLegalSquares2 = (board: Board): point[] => {
        let result : point[] = [];

        if(board.checkSquare([this.x+1, this.y+2], this.color))
            result.push([this.x+1, this.y+2]);
        if(board.checkSquare([this.x-1, this.y+2], this.color))
            result.push([this.x-1, this.y+2]);
        if(board.checkSquare([this.x+1, this.y-2], this.color))
            result.push([this.x+1, this.y-2]);
        if(board.checkSquare([this.x-1, this.y-2], this.color))
            result.push([this.x-1, this.y-2]);

        if(board.checkSquare([this.x-2, this.y-1], this.color))
            result.push([this.x-2, this.y-1]);
        if(board.checkSquare([this.x-2, this.y+1], this.color))
            result.push([this.x-2, this.y+1]);
        if(board.checkSquare([this.x+2, this.y-1], this.color))
            result.push([this.x+2, this.y-1]);
        if(board.checkSquare([this.x+2, this.y+1], this.color))
            result.push([this.x+2, this.y+1]);

        return result;
    }
    getValue = (): number => { return 3; }
    getColor = () : boolean => { return this.color; }
    changeCoords = (coords: point) : point => {
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
        const colorPrefix = this.color? 'white' : 'black';
        return `img/pieces/${colorPrefix}${this.type.toLowerCase()}.png`;
    };

    findLegalSquares = (board: Board): point[] => {
        let result : point[] = [];

        let n: number = 1;
        while(board.checkSquare([this.x+n, this.y+n], this.color)) {
            result.push([this.x+n, this.y+n]);
            if(board.getBoard()[this.x+n][this.y+n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x-n, this.y+n], this.color)) {
            result.push([this.x-n, this.y+n]);
            if(board.getBoard()[this.x-n][this.y+n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x+n, this.y-n], this.color)) {
            result.push([this.x+n, this.y-n]);
            if(board.getBoard()[this.x+n][this.y-n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x-n, this.y-n], this.color)) {
            result.push([this.x-n, this.y-n]);
            if(board.getBoard()[this.x-n][this.y-n]) {
                break
            }
            n += 1;
        }
        let result2 : point[] = [];
        for(var move of result) {
            if(testMove(board, [this.x, this.y], move)) {
                result2.push(move)
            }

        }
        return result2;
    }
    findLegalSquares2 = (board: Board): point[] => {
        let result : point[] = [];

        let n: number = 1;
        while(board.checkSquare([this.x+n, this.y+n], this.color)) {
            result.push([this.x+n, this.y+n]);
            if(board.getBoard()[this.x+n][this.y+n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x-n, this.y+n], this.color)) {
            result.push([this.x-n, this.y+n]);
            if(board.getBoard()[this.x-n][this.y+n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x+n, this.y-n], this.color)) {
            result.push([this.x+n, this.y-n]);
            if(board.getBoard()[this.x+n][this.y-n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x-n, this.y-n], this.color)) {
            result.push([this.x-n, this.y-n]);
            if(board.getBoard()[this.x-n][this.y-n]) {
                break
            }
            n += 1;
        }
        return result;
    }
    getValue = (): number => { return 3; }
    getColor = () : boolean => { return this.color; }
    changeCoords = (coords: point) : point => {
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
        const colorPrefix = this.color? 'white' : 'black';
        return `img/pieces/${colorPrefix}${this.type.toLowerCase()}.png`;
    };

    findLegalSquares = (board: Board): point[] => {
        let result : point[] = [];

        let n: number = 1;
        while(board.checkSquare([this.x+n, this.y], this.color)) {
            result.push([this.x+n, this.y]);
            if(board.getBoard()[this.x+n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x-n, this.y], this.color)) {
            result.push([this.x-n, this.y]);
            if(board.getBoard()[this.x-n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x, this.y-n], this.color)) {
            result.push([this.x, this.y-n]);
            if(board.getBoard()[this.x][this.y-n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x, this.y+n], this.color)) {
            result.push([this.x, this.y+n]);
            if(board.getBoard()[this.x][this.y+n]) {
                break
            }
            n += 1;
        }
        let result2 : point[] = [];
        for(var move of result) {
            if(testMove(board, [this.x, this.y], move)) {
                result2.push(move)
            }

        }
        return result2;
    }
    findLegalSquares2 = (board: Board): point[] => {
        let result : point[] = [];

        let n: number = 1;
        while(board.checkSquare([this.x+n, this.y], this.color)) {
            result.push([this.x+n, this.y]);
            if(board.getBoard()[this.x+n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x-n, this.y], this.color)) {
            result.push([this.x-n, this.y]);
            if(board.getBoard()[this.x-n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x, this.y-n], this.color)) {
            result.push([this.x, this.y-n]);
            if(board.getBoard()[this.x][this.y-n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x, this.y+n], this.color)) {
            result.push([this.x, this.y+n]);
            if(board.getBoard()[this.x][this.y+n]) {
                break
            }
            n += 1;
        }

        return result;
    }
    getValue = (): number => { return 5; }
    getColor = () : boolean => { return this.color; }
    changeCoords = (coords: point) : point => {
        this.x = coords[0];
        this.y = coords[1];
        return coords;
    }
}

class queen implements Piece {

    type:string = "queen"
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
        const colorPrefix = this.color? 'white' : 'black';
        return `img/pieces/${colorPrefix}${this.type.toLowerCase()}.png`;
    };

    findLegalSquares = (board: Board): point[] => {
        let result : point[] = [];

        let n: number = 1;
        while(board.checkSquare([this.x+n, this.y], this.color)) {
            result.push([this.x+n, this.y]);
            if(board.getBoard()[this.x+n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x-n, this.y], this.color)) {
            result.push([this.x-n, this.y]);
            if(board.getBoard()[this.x-n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x, this.y+n], this.color)) {
            result.push([this.x, this.y+n]);
            if(board.getBoard()[this.x][this.y+n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x, this.y-n], this.color)) {
            result.push([this.x, this.y-n]);
            if(board.getBoard()[this.x][this.y-n]) {
                break
            }
            n += 1;
        }
       n = 1;
        while(board.checkSquare([this.x+n, this.y+n], this.color)) {
            result.push([this.x+n, this.y+n]);
            if(board.getBoard()[this.x+n][this.y+n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x-n, this.y+n], this.color)) {
            result.push([this.x-n, this.y+n]);
            if(board.getBoard()[this.x-n][this.y+n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x+n, this.y-n], this.color)) {
            result.push([this.x+n, this.y-n]);
            if(board.getBoard()[this.x+n][this.y-n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x-n, this.y-n], this.color)) {
            result.push([this.x-n, this.y-n]);
            if(board.getBoard()[this.x-n][this.y-n]) {
                break
            }
            n += 1;
        }
        let result2 : point[] = [];
        for(var move of result) {
            if(testMove(board, [this.x, this.y], move)) {
                result2.push(move)
            }

        }
        return result2;
    }
    findLegalSquares2 = (board: Board): point[] => {
        let result : point[] = [];

        let n: number = 1;
        while(board.checkSquare([this.x+n, this.y], this.color)) {
            result.push([this.x+n, this.y]);
            if(board.getBoard()[this.x+n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x-n, this.y], this.color)) {
            result.push([this.x-n, this.y]);
            if(board.getBoard()[this.x-n][this.y]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x, this.y+n], this.color)) {
            result.push([this.x, this.y+n]);
            if(board.getBoard()[this.x][this.y+n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x, this.y-n], this.color)) {
            result.push([this.x, this.y-n]);
            if(board.getBoard()[this.x][this.y-n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x+n, this.y+n], this.color)) {
            result.push([this.x+n, this.y+n]);
            if(board.getBoard()[this.x+n][this.y+n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x-n, this.y+n], this.color)) {
            result.push([this.x-n, this.y+n]);
            if(board.getBoard()[this.x-n][this.y+n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x+n, this.y-n], this.color)) {
            result.push([this.x+n, this.y-n]);
            if(board.getBoard()[this.x+n][this.y-n]) {
                break
            }
            n += 1;
        }
        n = 1;
        while(board.checkSquare([this.x-n, this.y-n], this.color)) {
            result.push([this.x-n, this.y-n]);
            if(board.getBoard()[this.x-n][this.y-n]) {
                break
            }
            n += 1;
        }
        return result;    }
    getValue = (): number => { return 9; }
    getColor = () : boolean => { return this.color; }
    changeCoords = (coords: point) : point => {
        this.x = coords[0];
        this.y = coords[1];
        return coords;
    }
}

class king implements Piece {

    type:string = "king"
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
        const colorPrefix = this.color? 'white' : 'black';
        return `img/pieces/${colorPrefix}${this.type.toLowerCase()}.png`;
    };

    findLegalSquares = (board: Board): point[] => {
        let result : point[] = [];
        const grid: (Piece|undefined)[][] = board.getBoard();

        if(board.checkSquare([this.x+1, this.y], this.color))
            result.push([this.x+1, this.y]);
        if(board.checkSquare([this.x+1, this.y+1], this.color))
            result.push([this.x+1, this.y+1]);
        if(board.checkSquare([this.x+1, this.y-1], this.color))
            result.push([this.x+1, this.y-1]);
        if(board.checkSquare([this.x-1, this.y], this.color))
            result.push([this.x-1, this.y]);
        if(board.checkSquare([this.x-1, this.y+1], this.color))
            result.push([this.x-1, this.y+1]);
        if(board.checkSquare([this.x-1, this.y-1], this.color))
            result.push([this.x-1, this.y-1]);
        if(board.checkSquare([this.x, this.y+1], this.color))
            result.push([this.x, this.y+1]);
        if(board.checkSquare([this.x, this.y-1], this.color))
            result.push([this.x, this.y-1]);

        //Castling
        if(!this.hasMoved  && board.checkCheck(this.color)) {

            const rook : Piece | undefined = grid[0][this.y]
            if(rook && rook.type == "rook") {
                if(!grid[1][this.y] && !grid[2][this.y] && !grid[3][this.y]) {
                    result.push([1, this.y]);
                }
            }

            const rook2 : Piece | undefined = grid[7][this.y]
            if(rook2 && rook2.type == "rook") {
                if(!grid[6][this.y] && !grid[5][this.y]) {
                    result.push([6, this.y]);
                }
            }
        }

        let result2 : point[] = [];
        for(var move of result) {
            if(testMove(board, [this.x, this.y], move)) {
                result2.push(move)
            }
        }
        return result2;
    }

    findLegalSquares2 = (board: Board): point[] => {
        let result : point[] = [];
        const grid: (Piece|undefined)[][] = board.getBoard();

        if(board.checkSquare([this.x+1, this.y], this.color))
            result.push([this.x+1, this.y]);
        if(board.checkSquare([this.x+1, this.y+1], this.color))
            result.push([this.x+1, this.y+1]);
        if(board.checkSquare([this.x+1, this.y-1], this.color))
            result.push([this.x+1, this.y-1]);
        if(board.checkSquare([this.x-1, this.y], this.color))
            result.push([this.x-1, this.y]);
        if(board.checkSquare([this.x-1, this.y+1], this.color))
            result.push([this.x-1, this.y+1]);
        if(board.checkSquare([this.x-1, this.y-1], this.color))
            result.push([this.x-1, this.y-1]);
        if(board.checkSquare([this.x, this.y+1], this.color))
            result.push([this.x, this.y+1]);
        if(board.checkSquare([this.x, this.y-1], this.color))
            result.push([this.x, this.y-1]);

        //Castling
        if(!this.hasMoved) {

            const rook : Piece | undefined = grid[0][this.y]
            if(rook && rook.type == "rook") {
                if(!grid[1][this.y] && !grid[2][this.y] && !grid[3][this.y]) {
                    result.push([1, this.y]);
                }
            }

            const rook2 : Piece | undefined = grid[7][this.y]
            if(rook2 && rook2.type == "rook") {
                if(!grid[6][this.y] && !grid[5][this.y]) {
                    result.push([6, this.y]);
                }
            }
        }
        return result;
    }
    getValue = (): number => { return 9; }
    getColor = () : boolean => { return this.color; }
    changeCoords = (coords: point) : point => {
        this.x = coords[0];
        this.y = coords[1];
        return coords;
    }

    getMoved = () : boolean => {
        return this.hasMoved;
    }
}
