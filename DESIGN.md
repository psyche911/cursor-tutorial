# Space Invaders - Design Document

## Overview

A retro-style Space Invaders game built with HTML5 Canvas. Features a terminal/CRT green aesthetic, classic gameplay mechanics, and a power-up system.

## Architecture

### Core Components

- **Game Class**: Main game controller managing state, entities, and game loop
- **Entity Classes**: Player, Enemy, Bullet, Barrier, Explosion
- **Canvas Rendering**: 800x600 canvas with retro green (#00ff00) color scheme
- **State Machine**: START → PLAYING → PAUSED/GAME_OVER → (restart)

### Game Loop

```
1. Update phase:
   - Player movement (arrow keys)
   - Enemy movement (horizontal with edge detection, moves down when hitting edge)
   - Bullet updates (player and enemy)
   - Enemy shooting logic
   - Collision detection
   - Explosion animations

2. Draw phase:
   - Clear canvas (black background)
   - Draw all entities
   - Draw UI (lives, score, power-up indicator)
   - Draw explosions
```

## Entities

### Player
- Triangle-shaped ship at bottom of screen
- Moves left/right with arrow keys
- Shoots single bullet at a time (SPACE key)
- 3 lives, game over when lives = 0
- Speed increases 1.5x when power-up active

### Enemies
- Grid formation: 5 rows × 10 columns
- Color-coded by row: red (top), yellow (row 1), cyan (others)
- Points: (5 - row) × 10 (top row = 50 points)
- Move horizontally, drop down when hitting edge
- Speed increases each wave
- Bottom-most enemy in each column can shoot
- Health: 1 (normal), 2 (when power-up active)

### Bullets
- **Player bullets**: Green (#0f0), speed 7, damage 1 (or 2 when powered up)
- **Enemy bullets**: Red (#f00), speed 3
- Powered-up player bullets: Yellow (#ff0), larger size (6px vs 4px)
- Destroyed on collision or when leaving screen

### Barriers
- 4 defensive structures positioned above player
- Composed of small blocks (4px × 4px) in arch shape
- Blocks destroyed on bullet impact
- Protect both player and enemies

### Explosions
- Particle effects when enemies are destroyed
- 15 particles with random velocities and colors
- Gravity and fade effects
- 20-frame lifetime

## Systems

### Collision Detection
- Axis-Aligned Bounding Box (AABB) collision
- Checks: player bullets vs enemies, enemy bullets vs player, bullets vs barriers
- Barriers use per-block collision detection

### Power-Up System
- Activates at 100 points
- Effects:
  - Player speed: 1.5x
  - Player bullet damage: 2x
  - Enemy health: 2x
  - Visual indicator: yellow "POWER-UP ACTIVE!" text

### Enemy Movement
- Horizontal movement with direction reversal at edges
- Moves down by 30px when hitting edge
- Speed increases by 0.5 each wave
- Game over if any enemy reaches player's Y position

### Enemy Shooting
- Random bottom-most enemy shoots every ~2 seconds
- 30% chance per frame when interval elapsed
- Only bottom-most alive enemy in each column can shoot

## State Management

### Game States
- `START`: Initial screen, press SPACE to begin
- `PLAYING`: Active gameplay
- `PAUSED`: Game paused (P key), overlay visible
- `GAME_OVER`: Player lost, shows final score, SPACE to restart

### State Transitions
- START → PLAYING: SPACE key
- PLAYING → PAUSED: P key
- PAUSED → PLAYING: P key
- PLAYING → GAME_OVER: Lives = 0 or enemy reaches player
- GAME_OVER → PLAYING: SPACE key (restarts game)

## Visual Style

### Color Scheme
- Background: Black (#000)
- Primary: Bright green (#00ff00, #0f0)
- Accents: Red (#f00), Yellow (#ff0), Cyan (#0ff)
- Text glow: Green text-shadow effects

### Typography
- Monospace font (Courier New)
- Retro terminal aesthetic
- Green glow on all text elements

### Canvas Effects
- Green border with glow (box-shadow)
- Particle explosions with gravity
- Opacity effects for damaged enemies

## Controls

- **Arrow Left/Right**: Move player
- **SPACE**: Shoot (player) / Start game / Restart
- **P**: Pause/Resume

## Game Progression

1. Start with 3 lives, score 0
2. Destroy all enemies → new wave (faster enemies)
3. At 100 points → power-up activates
4. Game over when:
   - Lives reach 0
   - Enemy reaches player's Y position

## Technical Details

- Canvas size: 800×600
- Frame rate: ~60fps (requestAnimationFrame)
- Enemy formation: 50 enemies (5×10 grid)
- Barrier count: 4
- Player position: Bottom center (Y = 550)

