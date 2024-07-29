const fieldElm = document.querySelector(".field");

let rows = 10;
let columns = 10;
let bombs = 20;

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
        squareElm.classList = "sqare";
        squareElm.textContent = this.field[i][j];
        rowElm.appendChild(squareElm);
      }
      fieldElm.appendChild(rowElm);
    }
  }
}

function randomNumBetween(minNum, maxNum) {
  return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
}

const gameInstance = new Game(rows, columns, bombs);
// console.log(gameInstance.field);
