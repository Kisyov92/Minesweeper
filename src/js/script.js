const fieldElm = document.querySelector(".field");
const gameOverWindowElm = document.querySelector(".game-over");
const restartBtnElm = document.querySelectorAll(".restart-btn");
const winWindowElm = document.querySelector(".win");
const flagCounterElm = document.querySelector(".flag-counter");
const timerElm = document.querySelector(".timer");
const clockImgElm = document.querySelector(".clock");
const difficultyElm = document.querySelector(".difficulty");

let showClock = true;
let difficulty = "easy";
let gameInstance;

class Game {
  constructor(rows, cols, bombs) {
    this.rows = rows;
    this.cols = cols;
    this.bombs = bombs;
    this.flags = bombs;
    this.time = 0;
    this.gameStarted = false;
    this.field = this.createField();

    this.placeMines();
    this.displayMineField();
    this.displayStats();
  }

  startClock() {
    this.gameStarted = true;
    this.clock = setInterval(() => {
      const time = ++this.time;
      const hours = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
      const mins = (time % 60).toString().padStart(2, "0");
      timerElm.textContent = `${hours}:${mins}`;
    }, 1000);
  }

  stopClock() {
    clearInterval(this.clock);
  }

  displayStats() {
    flagCounterElm.textContent = this.flags;
    timerElm.textContent = "00:00";
  }

  placeFlag() {
    this.flags--;
    flagCounterElm.textContent = this.flags;
  }

  removeFlag() {
    this.flags++;
    flagCounterElm.textContent = this.flags;
  }

  createField() {
    const field = [];
    for (let i = 0; i < this.cols; i++) {
      const row = Array.from({ length: this.rows }, () => null);
      field.push(row);
    }
    return field;
  }

  placeMines() {
    for (let i = 0; i < this.bombs; i++) {
      const randomCol = randomNumBetween(0, this.cols - 1);
      const randomRow = randomNumBetween(0, this.rows - 1);

      if (this.field[randomCol][randomRow] === "*") {
        i--;
        continue;
      }

      this.field[randomCol][randomRow] = "*";
      this.surroundMineWithNumbers(randomCol, randomRow);
    }
  }

  surroundMineWithNumbers(row, col) {
    const startRow = row - 1;
    const startCol = col - 1;
    for (let i = startCol; i < startCol + 3; i++) {
      if (i < 0 || i > this.rows - 1) continue;
      for (let j = startRow; j < startRow + 3; j++) {
        if (j < 0 || j > this.cols - 1) continue;
        if (this.field[j][i] === "*") continue;
        this.field[j][i]++;
      }
    }
  }

  displayMineField() {
    for (let i = 0; i < this.cols; i++) {
      const rowElm = document.createElement("div");
      rowElm.classList = "row";
      for (let j = 0; j < this.rows; j++) {
        const squareElm = document.createElement("div");
        squareElm.classList = "square";
        const squereContentElm = document.createElement("div");
        squereContentElm.textContent = this.field[i][j];
        squereContentElm.classList.add("square-content", "hidden");
        squereContentElm.dataset.content = this.field[i][j];
        rowElm.dataset.row = i;
        squareElm.dataset.col = j;
        squareElm.appendChild(squereContentElm);
        rowElm.appendChild(squareElm);
      }
      fieldElm.appendChild(rowElm);
    }
  }

  openSqare(row, col) {
    const fieldSquare = fieldElm
      .querySelector(`[data-row="${row}"]`)
      .querySelector(`[data-col="${col}"]`);
    const fieldSquareContentElm = fieldSquare.querySelector(".square-content");
    if (fieldSquare.querySelector("img")) {
      gameInstance.removeFlag();
      fieldSquare.querySelector("img").remove();
    }
    if (![...fieldSquareContentElm.classList].includes("hidden")) return;

    fieldSquareContentElm.classList.remove("hidden");

    if (fieldSquareContentElm.dataset.content === "*") {
      fieldSquareContentElm.classList.add("bomb");
      fieldElm.classList.add("disable-clicks");

      setTimeout(() => {
        gameOverWindowElm.classList.remove("hidden");
      }, 1000);
    }

    if (fieldSquareContentElm.dataset.content === "null") {
      for (let i = col - 1; i < col + 2; i++) {
        if (i < 0 || i > this.rows - 1) continue;
        for (let j = row - 1; j < row + 2; j++) {
          if (j < 0 || j > this.cols - 1) continue;
          this.openSqare(j, i);
        }
      }
    }
  }

  checkIfWon() {
    const hiddenSquares = fieldElm.querySelectorAll(".hidden");
    if (hiddenSquares.length > this.bombs) return;
    for (const el of [...hiddenSquares]) {
      if (el.dataset.content !== "*") return;
    }

    fieldElm.classList.add("disable-clicks");
    this.stopClock();

    setTimeout(() => {
      winWindowElm.classList.remove("hidden");
    }, 1000);
  }
}

function randomNumBetween(minNum, maxNum) {
  return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
}

fieldElm.addEventListener("click", (e) => {
  if (!(e.target.classList.value === "square") || e.target.dataset.bomb) return;
  const squareContentElm = e.target.querySelector("div");

  if (!gameInstance.gameStarted) gameInstance.startClock();

  const row = squareContentElm.parentElement.parentElement.dataset.row;
  const col = squareContentElm.parentElement.dataset.col;
  gameInstance.openSqare(+row, +col);
  gameInstance.checkIfWon();
  if (squareContentElm.textContent === "*") {
    e.target.innerHTML = "";
    const bombImgElm = document.createElement("img");
    bombImgElm.src = "./src/img/bomb.webp";
    bombImgElm.alt = "A bomb";
    bombImgElm.style.width = "100%";
    e.target.appendChild(bombImgElm);
    gameInstance.stopClock();
  }
});

fieldElm.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const squareElm = e.target.closest(".square");
  if (!squareElm.querySelector(".hidden")) return;

  if (!squareElm.dataset.bomb) {
    gameInstance.placeFlag();
    squareElm.dataset.bomb = 1;
    const flagImgElm = document.createElement("img");
    flagImgElm.src = "./src/img/red-flag.webp";
    flagImgElm.alt = "A red flag";
    flagImgElm.style.width = "100%";
    flagImgElm.classList = "flagged";
    squareElm.appendChild(flagImgElm);
  } else if (squareElm.dataset.bomb === "1") {
    squareElm.querySelector("img").remove();
    gameInstance.removeFlag();
    delete squareElm.dataset.bomb;
  }
});

restartBtnElm.forEach((btn) => {
  btn.addEventListener("click", () => {
    fieldElm.innerHTML = "";
    startGame();
    gameOverWindowElm.classList.add("hidden");
    winWindowElm.classList.add("hidden");
    fieldElm.classList.remove("disable-clicks");
  });
});

clockImgElm.addEventListener("click", () => {
  showClock = !showClock;
  timerElm.classList.toggle("hidden");
});

function startGame() {
  if (difficulty === "easy") gameInstance = new Game(8, 8, 4);
  if (difficulty === "normal") gameInstance = new Game(8, 8, 8);
  if (difficulty === "nightmare") gameInstance = new Game(12, 12, 40);
  if (difficulty === "hell") gameInstance = new Game(25, 15, 150);
}

difficultyElm.addEventListener("change", (e) => {
  fieldElm.innerHTML = "";
  gameInstance.stopClock();
  difficulty = e.target.value;
  startGame(difficulty);
});

startGame();
