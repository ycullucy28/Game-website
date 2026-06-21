document.addEventListener('DOMContentLoaded', function () {
  var COLS = 10;
  var ROWS = 20;
  var CELL_SIZE = 24;
  var SPAWN_X = 3;
  var SPAWN_Y = 0;

  var SPEEDS = {
    slow: 900,
    normal: 600,
    fast: 350
  };

  var TETROMINOES = {
    I: {
      color: '#3d9cff',
      rotations: [
        [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
        [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
      ]
    },
    O: {
      color: '#ffd166',
      rotations: [
        [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
      ]
    },
    T: {
      color: '#b44dff',
      rotations: [
        [[0, 1, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]]
      ]
    },
    S: {
      color: '#7dffd8',
      rotations: [
        [[0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]],
        [[0, 0, 0, 0], [0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0]],
        [[1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]]
      ]
    },
    Z: {
      color: '#ff6eb4',
      rotations: [
        [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]]
      ]
    },
    J: {
      color: '#4ecdc4',
      rotations: [
        [[1, 0, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 1, 1, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 0, 0], [1, 1, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0]]
      ]
    },
    L: {
      color: '#ff9f43',
      rotations: [
        [[0, 0, 1, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
        [[0, 0, 0, 0], [1, 1, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
        [[1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]]
      ]
    }
  };

  var PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

  var gameArea = document.getElementById('game-area');
  var scoreEl = document.getElementById('score');
  var gameStatus = document.getElementById('game-status');
  var startBtn = document.getElementById('start-btn');
  var stopBtn = document.getElementById('stop-btn');
  var speedSelect = document.getElementById('speed-select');
  var speedStatus = document.getElementById('speed-status');

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  var board = [];
  var currentPiece = null;
  var score = 0;
  var tickMs = SPEEDS.normal;
  var loopId = null;
  var isRunning = false;
  var isGameOver = false;
  var audio = window.GameAudio.init({ game: 'tetris' });

  canvas.width = COLS * CELL_SIZE;
  canvas.height = ROWS * CELL_SIZE;
  canvas.setAttribute('aria-label', 'Tetris game board');
  gameArea.appendChild(canvas);

  function setStatus(text) {
    gameStatus.textContent = text;
  }

  function createEmptyBoard() {
    var rows = [];

    for (var y = 0; y < ROWS; y++) {
      var row = [];
      for (var x = 0; x < COLS; x++) {
        row.push('');
      }
      rows.push(row);
    }

    return rows;
  }

  function randomPieceType() {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  }

  function getRotationMatrix(piece) {
    var rotations = TETROMINOES[piece.type].rotations;
    return rotations[piece.rotationIndex % rotations.length];
  }

  function getPieceCells(piece) {
    var matrix = getRotationMatrix(piece);
    var cells = [];

    for (var row = 0; row < matrix.length; row++) {
      for (var col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          cells.push({
            x: piece.x + col,
            y: piece.y + row
          });
        }
      }
    }

    return cells;
  }

  function isValidPiecePosition(piece) {
    var cells = getPieceCells(piece);

    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];

      if (cell.x < 0 || cell.x >= COLS || cell.y >= ROWS) {
        return false;
      }

      if (cell.y >= 0 && board[cell.y][cell.x]) {
        return false;
      }
    }

    return true;
  }

  function createPiece(type) {
    return {
      type: type,
      rotationIndex: 0,
      x: SPAWN_X,
      y: SPAWN_Y
    };
  }

  function spawnPiece() {
    currentPiece = createPiece(randomPieceType());

    if (!isValidPiecePosition(currentPiece)) {
      currentPiece = null;
      return false;
    }

    return true;
  }

  function lockPiece() {
    var color = TETROMINOES[currentPiece.type].color;
    var cells = getPieceCells(currentPiece);

    cells.forEach(function (cell) {
      if (cell.y >= 0 && cell.y < ROWS && cell.x >= 0 && cell.x < COLS) {
        board[cell.y][cell.x] = color;
      }
    });
  }

  function clearLines() {
    var linesCleared = 0;

    for (var y = ROWS - 1; y >= 0; y--) {
      var isFull = true;

      for (var x = 0; x < COLS; x++) {
        if (!board[y][x]) {
          isFull = false;
          break;
        }
      }

      if (isFull) {
        board.splice(y, 1);
        board.unshift(createEmptyBoard()[0]);
        linesCleared += 1;
        y += 1;
      }
    }

    if (linesCleared > 0) {
      score += linesCleared * 100;
      scoreEl.textContent = String(score);
      audio.playScore();
    }
  }

  function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
      x * CELL_SIZE + 1,
      y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  }

  function draw() {
    ctx.fillStyle = '#0a1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 45, 149, 0.12)';
    ctx.lineWidth = 1;

    for (var x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE + 0.5, 0);
      ctx.lineTo(x * CELL_SIZE + 0.5, canvas.height);
      ctx.stroke();
    }

    for (var y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE + 0.5);
      ctx.lineTo(canvas.width, y * CELL_SIZE + 0.5);
      ctx.stroke();
    }

    ctx.strokeStyle = '#ff2d95';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    for (var row = 0; row < ROWS; row++) {
      for (var col = 0; col < COLS; col++) {
        if (board[row][col]) {
          drawCell(col, row, board[row][col]);
        }
      }
    }

    if (currentPiece) {
      var pieceColor = TETROMINOES[currentPiece.type].color;
      getPieceCells(currentPiece).forEach(function (cell) {
        if (cell.y >= 0) {
          drawCell(cell.x, cell.y, pieceColor);
        }
      });
    }
  }

  function tryMovePiece(dx, dy) {
    if (!currentPiece || isGameOver) {
      return false;
    }

    var movedPiece = {
      type: currentPiece.type,
      rotationIndex: currentPiece.rotationIndex,
      x: currentPiece.x + dx,
      y: currentPiece.y + dy
    };

    if (!isValidPiecePosition(movedPiece)) {
      return false;
    }

    currentPiece = movedPiece;
    draw();
    audio.playMove();
    return true;
  }

  function tryRotatePiece() {
    if (!currentPiece || isGameOver) {
      return false;
    }

    var rotatedPiece = {
      type: currentPiece.type,
      rotationIndex: currentPiece.rotationIndex + 1,
      x: currentPiece.x,
      y: currentPiece.y
    };

    if (!isValidPiecePosition(rotatedPiece)) {
      return false;
    }

    currentPiece = rotatedPiece;
    draw();
    audio.playMove();
    return true;
  }

  function hardDrop() {
    if (!currentPiece || isGameOver) {
      return;
    }

    while (tryMovePiece(0, 1)) {
      // Drop until blocked
    }

    settlePiece();
  }

  function settlePiece() {
    lockPiece();
    clearLines();

    if (!spawnPiece()) {
      endGame();
      draw();
      return;
    }

    draw();
  }

  function tick() {
    if (isGameOver || !currentPiece) {
      return;
    }

    if (!tryMovePiece(0, 1)) {
      settlePiece();
    }
  }

  function endGame() {
    isRunning = false;
    isGameOver = true;
    clearInterval(loopId);
    loopId = null;
    setStatus('Game Over');
    audio.playGameOver();
  }

  function startLoop() {
    if (loopId !== null) {
      clearInterval(loopId);
    }

    loopId = setInterval(tick, tickMs);
    isRunning = true;
    setStatus('Running');
    audio.startTheme();
  }

  function pauseGame() {
    if (!isRunning || isGameOver) {
      return;
    }

    clearInterval(loopId);
    loopId = null;
    isRunning = false;
    setStatus('Paused');
    audio.stopTheme();
  }

  function resetGameState() {
    board = createEmptyBoard();
    score = 0;
    scoreEl.textContent = '0';
    isGameOver = false;
    isRunning = false;

    if (loopId !== null) {
      clearInterval(loopId);
      loopId = null;
    }

    if (!spawnPiece()) {
      endGame();
    } else {
      setStatus('Ready');
    }

    draw();
  }

  function startGame() {
    if (isGameOver) {
      resetGameState();
    }

    if (isRunning) {
      return;
    }

    startLoop();
  }

  function togglePause() {
    if (isGameOver) {
      return;
    }

    if (isRunning) {
      pauseGame();
    } else {
      startGame();
    }
  }

  function handleKeyDown(event) {
    if (isGameOver) {
      return;
    }

    var key = event.key.toLowerCase();

    if (key === ' ' || key === 'spacebar') {
      event.preventDefault();
      togglePause();
      return;
    }

    if (key === 'enter') {
      event.preventDefault();
      if (isRunning) {
        hardDrop();
      }
      return;
    }

    if (key === 'arrowleft') {
      event.preventDefault();
      tryMovePiece(-1, 0);
    } else if (key === 'arrowright') {
      event.preventDefault();
      tryMovePiece(1, 0);
    } else if (key === 'arrowdown') {
      event.preventDefault();
      tryMovePiece(0, 1);
    } else if (key === 'arrowup') {
      event.preventDefault();
      tryRotatePiece();
    }
  }

  if (startBtn) {
    startBtn.addEventListener('click', startGame);
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', pauseGame);
  }

  if (speedSelect && speedStatus) {
    speedSelect.addEventListener('change', function () {
      tickMs = SPEEDS[speedSelect.value] || SPEEDS.normal;
      speedStatus.textContent = speedSelect.options[speedSelect.selectedIndex].text;

      if (isRunning) {
        clearInterval(loopId);
        loopId = setInterval(tick, tickMs);
      }
    });
  }

  document.addEventListener('keydown', handleKeyDown);

  resetGameState();
});
