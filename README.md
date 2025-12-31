# Space Invaders Game

A classic Space Invaders game built with vanilla HTML, CSS, and JavaScript using HTML5 Canvas.

## Features

- Classic Space Invaders gameplay
- Player movement and shooting mechanics
- Enemy waves that move and shoot back
- Collision detection system
- Defensive barriers that degrade when hit
- Score tracking with different point values per enemy row
- Lives system (3 lives)
- Game states (start, playing, paused, game over)
- Wave system - new waves spawn when all enemies are destroyed
- Power-up system (activates at 100 points)
- Explosion effects when enemies are destroyed
- Retro green terminal aesthetic

## How to Run

### Option 1: Python HTTP Server (Recommended)

1. Navigate to the project directory:
```bash
cd cursor-tutorial
```

2. Start a local HTTP server:
```bash
python3 -m http.server 8000
```

3. Open your browser and navigate to:
```
http://localhost:8000/index.html
```

### Option 2: Other HTTP Servers

You can use any local HTTP server. Here are alternatives:

**Node.js (http-server):**
```bash
npx http-server -p 8000
```

**PHP:**
```bash
php -S localhost:8000
```

**VS Code Live Server:**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

## Controls

- **Arrow Keys (← →)**: Move player left/right
- **SPACE**: Shoot bullets
- **P**: Pause/Resume game

## Game Mechanics

### Scoring
- Top row enemies: 50 points each
- Second row enemies: 40 points each
- Third row enemies: 30 points each
- Fourth row enemies: 20 points each
- Bottom row enemies: 10 points each

### Power-Up System
- Activates automatically when score reaches 100
- Player speed increases by 50%
- Bullets deal double damage
- Bullets become larger and yellow
- Enemies gain 2 health instead of 1

### Enemy Behavior
- Enemies move as a group horizontally
- When hitting screen edges, they drop down one row
- Speed increases as fewer enemies remain
- Bottom-row enemies randomly shoot bullets downward
- Game over if enemies reach the player's position

### Barriers
- Four defensive barriers protect the player
- Barriers degrade when hit by bullets (player or enemy)
- Made of small blocks that can be destroyed individually

## File Structure

```
cursor-tutorial/
├── index.html      # Main HTML file with canvas element
├── style.css       # Styling for retro green terminal aesthetic
├── game.js         # Core game logic, entities, and game loop
├── README.md       # This file
└── .gitignore      # Git ignore rules
```

## Technologies Used

- **HTML5**: Structure and canvas element
- **CSS3**: Styling with retro green terminal theme
- **Vanilla JavaScript**: Game logic, no frameworks
- **HTML5 Canvas API**: 2D rendering
- **RequestAnimationFrame**: Smooth 60fps game loop

## Code Structure

### Classes
- `Player`: Player ship with movement and shooting
- `Enemy`: Enemy aliens with different point values
- `Bullet`: Projectiles (player and enemy)
- `Barrier`: Defensive blocks
- `Explosion`: Particle effects
- `Game`: Main game controller

### Key Functions
- `gameLoop()`: Main game loop using requestAnimationFrame
- `update()`: Updates all game entities each frame
- `draw()`: Renders all game entities to canvas
- `checkCollision()`: AABB collision detection
- `checkCollisions()`: Handles all collision logic

## Game States

1. **START**: Initial screen, press SPACE to begin
2. **PLAYING**: Active gameplay
3. **PAUSED**: Game paused, press P to resume
4. **GAME_OVER**: Game ended, press SPACE to restart

## Development Notes

- Canvas size: 800x600 pixels
- Game runs at ~60 FPS using requestAnimationFrame
- All collision detection uses AABB (Axis-Aligned Bounding Box)
- Enemy movement speed increases with each wave
- Player can only have one bullet on screen at a time

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 Classes
- RequestAnimationFrame API

## License

This is a tutorial project. Feel free to use and modify as needed.

