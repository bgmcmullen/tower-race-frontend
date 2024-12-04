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

Django/Python: Framework and language for server-side logic.
Django Channels: For WebSocket support.
PyTorch: For the computer opponent's AI logic.

## Gameplay Instructions

1. Click the Start/Restart button to begin the game.
2. Replace bricks in your tower to optimize its stability.
3. Choose bricks from either the discard stack or the hidden stack.
4. Aim to create a perfectly stacked tower, with the largest brick on the bottom and progressively smaller bricks toward the top before the computer finishes its tower.

## Background
This game started as a school project during my time as a PhD student at the University of Pennsylvania. I decided to continue its development, adding a frontend interface and an AI opponent to enhance the gameplay experience.

