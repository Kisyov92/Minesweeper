const fieldElm = document.querySelector(".field");
const gameOverWindowElm = document.querySelector(".game-over");
const restartBtnElm = document.querySelectorAll(".restart-btn");
const winWindowElm = document.querySelector(".win");

let rows = 10;
let columns = 10;
let bombs = 10;

class Game {
  constructor(rows, cols, bombs) {
    this.rows = rows;
    this.cols = cols;
    this.bombs = bombs;
    this.field = this.createField();

    this.placeMines();
    this.displayMineField();
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

      if (this.field[randomRow][randomCol] === "*") {
        i--;
        continue;
      }

      this.field[randomRow][randomCol] = "*";
      this.surroundMineWithNumbers(randomRow, randomCol);
    }
  }

  surroundMineWithNumbers(row, col) {
    const startRow = row - 1;
    const startCol = col - 1;
    for (let i = startRow; i < startRow + 3; i++) {
      if (i < 0 || i > 9) continue;
      for (let j = startCol; j < startCol + 3; j++) {
        if (j < 0 || j > 9) continue;
        if (this.field[i][j] === "*") continue;
        this.field[i][j]++;
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
      for (let i = row - 1; i < row + 2; i++) {
        if (i < 0 || i > 9) continue;
        for (let j = col - 1; j < col + 2; j++) {
          if (j < 0 || j > 9) continue;
          this.openSqare(i, j);
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
  }
});

fieldElm.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const squareElm = e.target.closest(".square");
  if (!squareElm.querySelector(".hidden")) return;

  if (!squareElm.dataset.bomb) {
    squareElm.dataset.bomb = 1;
    const flagImgElm = document.createElement("img");
    flagImgElm.src = "./src/img/red-flag.webp";
    flagImgElm.alt = "A red flag";
    flagImgElm.style.width = "100%";
    flagImgElm.classList = "flagged";
    squareElm.appendChild(flagImgElm);
  } else if (squareElm.dataset.bomb === "1") {
    squareElm.querySelector("img").remove();
    delete squareElm.dataset.bomb;
  }
});

restartBtnElm.forEach((btn) => {
  btn.addEventListener("click", () => {
    fieldElm.innerHTML = "";
    gameInstance = new Game(rows, columns, bombs);
    gameOverWindowElm.classList.add("hidden");
    winWindowElm.classList.add("hidden");
    fieldElm.classList.remove("disable-clicks");
  });
});

let gameInstance = new Game(rows, columns, bombs);
