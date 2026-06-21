document.addEventListener('DOMContentLoaded', function () {
  var COLS = 20;
  var ROWS = 20;
  var CELL_SIZE = 20;

  var SPEEDS = {
    slow: 200,
    normal: 120,
    fast: 70
  };

  var gameArea = document.getElementById('game-area');
  var scoreEl = document.getElementById('score');
  var gameStatus = document.getElementById('game-status');
  var startBtn = document.getElementById('start-btn');
  var stopBtn = document.getElementById('stop-btn');
  var speedSelect = document.getElementById('speed-select');
  var speedStatus = document.getElementById('speed-status');

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  var snake = [];
  var food = { x: 0, y: 0 };
  var direction = { x: 1, y: 0 };
  var nextDirection = { x: 1, y: 0 };
  var score = 0;
  var tickMs = SPEEDS.normal;
  var loopId = null;
  var isRunning = false;
  var isGameOver = false;
  var audio = window.GameAudio.init({ game: 'snake' });

  canvas.width = COLS * CELL_SIZE;
  canvas.height = ROWS * CELL_SIZE;
  canvas.setAttribute('aria-label', 'Snake game board');
  gameArea.appendChild(canvas);

  function setStatus(text) {
    gameStatus.textContent = text;
  }

  function isOnSnake(x, y) {
    return snake.some(function (segment) {
      return segment.x === x && segment.y === y;
    });
  }

  function spawnFood() {
    var emptyCells = [];

    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        if (!isOnSnake(x, y)) {
          emptyCells.push({ x: x, y: y });
        }
      }
    }

    if (emptyCells.length === 0) {
      return;
    }

    food = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  function resetGameState() {
    var centerX = Math.floor(COLS / 2);
    var centerY = Math.floor(ROWS / 2);

    snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreEl.textContent = '0';
    isGameOver = false;
    spawnFood();
    setStatus('Ready');
    draw();
  }

  function draw() {
    ctx.fillStyle = '#0a1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(61, 156, 255, 0.12)';
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

    ctx.strokeStyle = '#3d9cff';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    ctx.fillStyle = '#ff2d95';
    ctx.fillRect(
      food.x * CELL_SIZE + 2,
      food.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4
    );

    snake.forEach(function (segment, index) {
      ctx.fillStyle = index === 0 ? '#7dffd8' : '#4ecdc4';
      ctx.fillRect(
        segment.x * CELL_SIZE + 2,
        segment.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
      );
    });
  }

  function endGame() {
    isRunning = false;
    isGameOver = true;
    clearInterval(loopId);
    loopId = null;
    setStatus('Game Over');
    audio.playGameOver();
  }

  function tick() {
    if (isGameOver) {
      return;
    }

    if (!(nextDirection.x === -direction.x && nextDirection.y === -direction.y)) {
      direction = nextDirection;
    }

    var head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      endGame();
      return;
    }

    var willEat = head.x === food.x && head.y === food.y;
    var bodyToCheck = willEat ? snake : snake.slice(0, -1);

    if (bodyToCheck.some(function (segment) {
      return segment.x === head.x && segment.y === head.y;
    })) {
      endGame();
      return;
    }

    snake.unshift(head);

    if (willEat) {
      score += 1;
      scoreEl.textContent = String(score);
      spawnFood();
      audio.playScore();
    } else {
      snake.pop();
    }

    audio.playMove();
    draw();
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

  function tryChangeDirection(x, y) {
    if (x === -direction.x && y === -direction.y) {
      return;
    }

    nextDirection = { x: x, y: y };
  }

  function handleKeyDown(event) {
    var key = event.key.toLowerCase();

    if (key === ' ' || key === 'spacebar') {
      event.preventDefault();
      togglePause();
      return;
    }

    if (key === 'arrowup' || key === 'w') {
      event.preventDefault();
      tryChangeDirection(0, -1);
    } else if (key === 'arrowdown' || key === 's') {
      event.preventDefault();
      tryChangeDirection(0, 1);
    } else if (key === 'arrowleft' || key === 'a') {
      event.preventDefault();
      tryChangeDirection(-1, 0);
    } else if (key === 'arrowright' || key === 'd') {
      event.preventDefault();
      tryChangeDirection(1, 0);
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
