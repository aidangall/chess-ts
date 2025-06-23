# Chess Game Application

A multiplayer chess game application built with React and Socket.io.

## Features

- Real-time multiplayer chess gameplay
- Create and join games
- Proper chess rules implementation
- Drag and drop piece movement
- Game state persistence
- Player information storage

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode

To run both the client and server in development mode:

```bash
npm run dev
```

This will start the React development server on port 3000 and the Socket.io server on port 3001.

### Production Mode

To build and run the application in production mode:

1. Build the React application:

```bash
npm run build
```

2. Start the server:

```bash
npm run server
```

The application will be available at http://localhost:3001.

## How to Play

1. Enter your name when prompted
2. Create a new game or join an existing one
3. Wait for another player to join (if you created a game)
4. Make moves by dragging and dropping pieces or clicking on pieces and then clicking on the destination square
5. The game follows standard chess rules including castling, en passant, and pawn promotion

## Technologies Used

- React
- TypeScript
- Socket.io
- Express
- CSS3 with animations

## License

MIT