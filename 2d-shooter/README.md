# 2D Vertical Scrolling Shooter Game

A web-based 2D vertical scrolling shooter game inspired by classic arcade shooters like "Raiden". The game features auto-shooting, power-up collection, boss battles, and engaging gameplay.

## Features

- Vertically scrolling parallax backgrounds
- Player ship with multiple weapon upgrades
- Various enemy types with unique behaviors
- Boss battles with multiple attack patterns
- Power-up system (weapons, shields, speed, bombs, lives)
- Score system with multipliers
- Mobile-friendly controls

## How to Play

1. Open `index.html` in a web browser
2. Use arrow keys or WASD to move your ship
3. Your ship auto-fires its main weapon
4. Press SPACE to activate your special weapon
5. Press X to deploy a screen-clearing bomb
6. Collect power-ups to upgrade your weapons and abilities
7. Defeat enemies and bosses to progress through levels

## Controls

- **Arrow Keys / WASD**: Move ship
- **SPACE**: Fire special weapon
- **X**: Deploy bomb
- **ESC**: Pause game

## Asset Generation

This project includes two HTML-based asset generators to create placeholder graphics and audio:

### Graphics Generator

1. Open `asset-generator.html` in a web browser
2. Click on individual assets to download them, or use "Download All" to get all assets at once
3. Place the downloaded PNG files in the `assets/images` directory

### Audio Generator

1. Open `audio-generator.html` in a web browser
2. Click "Generate & Play" to preview audio files
3. Click "Download" to save individual audio files, or use "Generate & Download All" to get all audio files at once
4. Place the downloaded WAV files in the `assets/audio` directory

## Game Structure

- `index.html`: Main game HTML file
- `styles.css`: Game styling
- `js/`: JavaScript files
  - `main.js`: Game initialization
  - `config.js`: Game configuration and settings
  - `entity.js`: Base class for game entities
  - `player.js`: Player ship implementation
  - `enemy.js`: Enemy ships implementation
  - `bullet.js`: Projectile implementation
  - `powerup.js`: Power-up implementation
  - `utils.js`: Utility functions
  - `scenes/`: Phaser scenes
    - `bootScene.js`: Initial loading scene
    - `preloadScene.js`: Asset preloading
    - `menuScene.js`: Main menu
    - `gameScene.js`: Main gameplay
    - `uiScene.js`: HUD and UI elements
- `assets/`: Game assets
  - `images/`: Sprite images and backgrounds
  - `audio/`: Sound effects and music

## Development

This game is built using:

- **Phaser 3**: Primary game framework for 2D rendering and game logic
- **Howler.js**: For advanced audio management

To modify the game:

1. Edit the JavaScript files in the `js/` directory
2. Refresh the browser to see your changes
3. Use the asset generators to create new graphics or audio as needed

## License

This project is available under the MIT License. See the LICENSE file for more details.