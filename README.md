# Game Site

A static retro-style game website with playable **Snake** and **Tetris** in the browser. Built with plain HTML, CSS, and JavaScript — no frameworks or build step required.

***This site is fully functional but still in progress. Updates to come soon***

## Features

- Dark arcade-themed landing page with game cards
- Fully playable Snake and Tetris with score, pause, and game over
- Responsive layout and keyboard controls
- Optional chiptune-style audio (Classic, Retro, and Minimal sound modes)
- Collapsible navigation with a Games dropdown

## Getting Started

Open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project Structure

```text
index.html          Landing page
snake.html          Snake game
tetris.html         Tetris game
css/styles.css      Shared styles
js/main.js          Navigation and shared audio
js/snake.js         Snake game logic
js/tetris.js        Tetris game logic
audio/              Game sound files
scripts/            Audio generation script
```

## Controls

**Snake:** Arrow keys or WASD to move · Space or Start to play/pause

**Tetris:** Arrow keys to move, rotate, and soft drop · Enter to hard drop · Space or Start to play/pause

## Audio

Sound files live in `audio/`. To regenerate them:

```bash
python3 scripts/generate_audio.py
```

See `audio/README.md` for details on Classic, Retro, and Minimal modes.

## Tech

- HTML5 Canvas for game boards
- CSS custom properties for theming
- Vanilla JavaScript only
