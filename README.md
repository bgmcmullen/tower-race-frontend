# tower-race-frontend

Tower Race is a simple single player game where the play must build and optimize their tower using bricks, competing against an AI opponent. The game features interactive animations, and a real-time WebSocket connection.

## Features

- **Player vs. AI Gameplay**: Compete against an AI opponent with a robust strategy for building stable towers.
- **Real-Time WebSocket Communication**: Smooth, real-time updates of game state.
- **Interactive Animations**: Animated tower building and dynamic feedback for player actions.

## Technologies Used

### Frontend
React/TypeScript: Library and language for building the user interface.
WebSocket: Enables real-time communication with the backend.
SCSS: For styling and animations.


### Backend

Django/Python: Framework and language for the server-side logic.
Django Channels: For WebSocket support.
PyTorch: Implements AI logic for the computer opponent.

Gameplay Instructions

Click the Start/Restart button to begin the game.
Replace bricks in your tower to optimize its stability.
Bricks can be taken from either the discard stack or the hidden stack.
The goal is the get a prefectly stack tower (largest brick on the bottom decreasing to the top)