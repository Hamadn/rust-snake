import init, { World, Direction, GameStatus } from "rust-snake";
import { random } from "./utils/random";

init().then((wasm) => {
  const CELL_SIZE = 50;
  const WORLD_WIDTH = 10;
  const snakeSpawnIndex = random(WORLD_WIDTH * WORLD_WIDTH);

  const world = World.new(WORLD_WIDTH, snakeSpawnIndex);
  const worldWidth = world.width();

  const points = document.getElementById("points");
  const gameStatus = document.getElementById("game-status");
  const gameCtrlBtn = document.getElementById("game-ctrl-btn");

  const canvas = <HTMLCanvasElement>document.getElementById("snake-canvas");
  const ctx = canvas.getContext("2d");

  canvas.height = worldWidth * CELL_SIZE;
  canvas.width = worldWidth * CELL_SIZE;

  gameCtrlBtn.addEventListener("click", (_) => {
    const status = world.game_status();

    if (status == undefined) {
      gameCtrlBtn.textContent = "Playing...";
      world.start_game();
      play();
    } else {
      location.reload();
    }
  });

  document.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "ArrowRight":
        world.change_direction(Direction.Right);
        break;
      case "ArrowLeft":
        world.change_direction(Direction.Left);
        break;
      case "ArrowUp":
        world.change_direction(Direction.Up);
        break;
      case "ArrowDown":
        world.change_direction(Direction.Down);
        break;
    }
  });

  function drawWorld() {
    ctx.beginPath();
    for (let x = 0; x < worldWidth + 1; x++) {
      ctx.moveTo(CELL_SIZE * x, 0);
      ctx.lineTo(CELL_SIZE * x, worldWidth * CELL_SIZE);
    }

    for (let y = 0; y < worldWidth + 1; y++) {
      ctx.moveTo(0, CELL_SIZE * y);
      ctx.lineTo(worldWidth * CELL_SIZE, CELL_SIZE * y);
    }

    ctx.stroke();
  }

  function drawReward() {
    const index = world.reward_cell();
    const col = index % worldWidth;
    const row = Math.floor(index / worldWidth);
    ctx.beginPath();
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.stroke();
  }

  function drawSnake() {
    const snakeCells = new Uint32Array(
      wasm.memory.buffer,
      world.snake_cells(),
      world.snake_len(),
    );

    snakeCells
      .slice()
      .reverse()
      .forEach((cellIndex, i) => {
        const col = cellIndex % worldWidth;
        const row = Math.floor(cellIndex / worldWidth);

        ctx.fillStyle = i === snakeCells.length - 1 ? "#7878db" : "#000000";

        ctx.beginPath();
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });
    ctx.stroke();
  }

  function drawGameStatus() {
    gameStatus.textContent = world.game_status_text();
    points.textContent = world.points().toString();
  }

  function paint() {
    drawWorld();
    drawSnake();
    drawReward();
    drawGameStatus();
  }

  function play() {
    const status = world.game_status();

    if (status == GameStatus.Won || status == GameStatus.Lost) {
      gameCtrlBtn.textContent = "Replay";
      return;
    }

    const fps = 5;
    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      world.update();
      paint();
      requestAnimationFrame(play);
    }, 1000 / fps);
  }

  paint();
});
