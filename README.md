# Icy Tower Platformer Game

A browser-based platformer game inspired by Icy Tower, built with JavaScript, HTML5 Canvas, and CSS. Jump between platforms, avoid enemies, and collect items to achieve the highest score!

## Features

- **Character Selection:** Choose from multiple characters (Player, Wizard, Court Jester).
- **Platform Generation:** Platforms are generated as you climb higher.
- **Enemies:** Static and moving enemies appear on platforms.
- **Collectibles:** Pick up items like boots and coins for bonuses.
- **Scrolling Screen:** The camera follows your ascent.
- **Score & Leaderboard:** Track your score and view top scores.
- **Game Over Screen:** Restart the game and try to beat your high score.

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, etc.)
- [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code (optional, but recommended for local development)

### Running the Game

1. **Clone or fork this repository.**
2. **Open the project folder in VS Code.**
3. **Start the game:**
   - **Option 1:** Right-click `index.html` and select **"Open with Live Server"**.
   - **Option 2:** Open `index.html` directly in your browser.

### Controls

- **Arrow keys** or **A/D**: Move left/right
- **Spacebar** or **W/Up Arrow**: Jump
- **Mouse:** Select character at the start

## Project Structure

```
.
├── index.html          # Main HTML file
├── style.css           # Game styling
├── script.js           # Main game logic
├── Enemy.js            # Enemy logic
├── Platform.js         # Platform logic
├── Player.js           # Player logic
├── [various .png files]# Game assets (characters, enemies, items, backgrounds)
└── .vscode/            # VS Code settings (optional)
```

## Assets

All required images (PNG files) are included in the repository, so the game will work out of the box after cloning or forking.

## Customization

- Add new characters by placing their PNG files in the project and updating the character selection in `index.html`.
- Adjust platform, enemy, or player behavior by editing the respective JS files.

## License

This project is for educational purposes. Please credit the original author if you use or modify this code.

---

Enjoy playing!