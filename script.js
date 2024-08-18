class Bejeweled {
    constructor() {
        this.grid = [];
        this.score = 0; 
        this.fruits = ["🍎", "🍌", "🍇", "🍒", "🍓", "🍍", "🍉"]; // Initial set of fruits
        this.initializeGrid();
        this.hintTimeout = null; 
        this.renderGrid();
        this.updateScoreDisplay();
        this.startHintTimer(); 
    }

    initializeGrid() {
        for (let row = 0; row < 8; row++) {
            this.grid[row] = [];
            for (let col = 0; col < 8; col++) {
                this.grid[row][col] = this.randomJewel();
            }
        }
    }

    renderGrid() {
        const gameGrid = document.getElementById("game-grid");
        gameGrid.innerHTML = ""; 

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement("div");
                cell.classList.add("grid-cell");
                cell.innerText = this.grid[row][col];
                cell.dataset.row = row;
                cell.dataset.col = col;

                cell.addEventListener("click", () => this.handleCellClick(row, col));

                gameGrid.appendChild(cell);
            }
        }
    }
    
    startHintTimer() {
        if (this.hintTimeout) clearTimeout(this.hintTimeout);
    
        this.hintTimeout = setTimeout(() => {
            this.showHint();
        }, 15000); 
    }
    
    
    showHint() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (col < 7 && this.isPotentialMatch(row, col, row, col + 1)) {
                    this.animateHint(row, col);
                    return;
                }
                if (row < 7 && this.isPotentialMatch(row, col, row + 1, col)) {
                    this.animateHint(row, col);
                    return;
                }
            }
        }
    }
    

    animateHint(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add("jumping");
    
        setTimeout(() => {
            cell.classList.remove("jumping");
        }, 2000); 
    }
    

    handleCellClick(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
        if (this.selectedCell) {
            const [prevRow, prevCol] = this.selectedCell;
            const prevCell = document.querySelector(`[data-row="${prevRow}"][data-col="${prevCol}"]`);
    
            if (this.isAdjacent(prevRow, prevCol, row, col)) {
                this.swap(prevRow, prevCol, row, col);
    
                if (this.checkForMatchesWithoutRemoving()) {
                    this.selectedCell = null; 
                    this.checkForMatches(); 
                    this.startHintTimer(); 
                } else {
                    this.swap(prevRow, prevCol, row, col);
                    this.selectedCell = null; 
                }
    
                prevCell.classList.remove("selected");
            } else {
                prevCell.classList.remove("selected");
                this.selectedCell = [row, col];
                cell.classList.add("selected");
            }
        } else {
            this.selectedCell = [row, col];
            cell.classList.add("selected");
        }
    }

    isAdjacent(row1, col1, row2, col2) {
        return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
    }

    swap(row1, col1, row2, col2) {
        const firstCell = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const secondCell = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
    
        const temp = this.grid[row1][col1];
        this.grid[row1][col1] = this.grid[row2][col2];
        this.grid[row2][col2] = temp;
    
        firstCell.innerText = this.grid[row1][col1];
        secondCell.innerText = this.grid[row2][col2];
    
        firstCell.classList.add("swapping");
        secondCell.classList.add("swapping");
    
        setTimeout(() => {
            firstCell.classList.remove("swapping");
            secondCell.classList.remove("swapping");
        }, 300); 
    }
    
    checkForMatches() {
        let hasMatches = false;

        // Check rows for matches
        for (let row = 0; row < 8; row++) {
            let matchLength = 1;
            for (let col = 0; col < 7; col++) {
                if (this.grid[row][col] === this.grid[row][col + 1]) {
                    matchLength++;
                } else {
                    if (matchLength >= 3) {
                        this.markRowForRemoval(row, col - matchLength + 1, matchLength);
                        hasMatches = true;
                    }
                    matchLength = 1;
                }
            }
            if (matchLength >= 3) {
                this.markRowForRemoval(row, 8 - matchLength, matchLength);
                hasMatches = true;
            }
        }

        // Check columns for matches
        for (let col = 0; col < 8; col++) {
            let matchLength = 1;
            for (let row = 0; row < 7; row++) {
                if (this.grid[row][col] === this.grid[row + 1][col]) {
                    matchLength++;
                } else {
                    if (matchLength >= 3) {
                        this.markColumnForRemoval(col, row - matchLength + 1, matchLength);
                        hasMatches = true;
                    }
                    matchLength = 1;
                }
            }
            if (matchLength >= 3) {
                this.markColumnForRemoval(col, 8 - matchLength, matchLength);
                hasMatches = true;
            }
        }

        if (hasMatches) {
            this.removeMatchesAndDrop();
        } else {
            this.renderGrid(); 
            if (!this.hasPossibleMatches()) {
                alert("No more possible matches! Shuffling the board...");
                this.shuffleBoard();
            }
        }
    }

    markRowForRemoval(row, startCol, length) {
        for (let col = startCol; col < startCol + length; col++) {
            this.markForRemoval(row, col);
        }
    }

    markColumnForRemoval(col, startRow, length) {
        for (let row = startRow; row < startRow + length; row++) {
            this.markForRemoval(row, col);
        }
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        scoreElement.innerText = `Score: ${this.score}`;
        this.updateAvailableFruits(); 
    }

    markForRemoval(row, col) {
        this.grid[row][col] = null;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add("highlight");
        }
        this.score += 10;
    }

    removeMatchesAndDrop() {
        setTimeout(() => {
            for (let col = 0; col < 8; col++) {
                let emptyRows = [];

                for (let row = 7; row >= 0; row--) {
                    if (this.grid[row][col] === null) {
                        emptyRows.push(row);
                    } else if (emptyRows.length > 0) {
                        const emptyRow = emptyRows.shift();
                        this.grid[emptyRow][col] = this.grid[row][col];
                        this.grid[row][col] = null;
                        emptyRows.push(row);
                    }
                }

                while (emptyRows.length > 0) {
                    const emptyRow = emptyRows.shift();
                    this.grid[emptyRow][col] = this.randomJewel();
                }
            }

            this.renderGrid(); 
            this.updateScoreDisplay();

            setTimeout(() => {
                this.checkForMatches(); 
            }, 500); 
        }, 500);
    }

    hasPossibleMatches() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (col < 7 && this.isPotentialMatch(row, col, row, col + 1)) {
                    return true; 
                }
                if (row < 7 && this.isPotentialMatch(row, col, row + 1, col)) {
                    return true; 
                }
            }
        }
        return false;
    }

    isPotentialMatch(row1, col1, row2, col2) {
        const temp = this.grid[row1][col1];
        this.grid[row1][col1] = this.grid[row2][col2];
        this.grid[row2][col2] = temp;

        const isMatch = this.checkForMatchesWithoutRemoving();

        this.grid[row2][col2] = this.grid[row1][col1];
        this.grid[row1][col1] = temp;

        return isMatch;
    }

    checkForMatchesWithoutRemoving() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.grid[row][col] === this.grid[row][col + 1] && this.grid[row][col] === this.grid[row][col + 2]) {
                    return true;
                }
            }
        }

        for (let col = 0; col < 8; col++) {
            for (let row = 0; row < 6; row++) {
                if (this.grid[row][col] === this.grid[row + 1][col] && this.grid[row][col] === this.grid[row + 2][col]) {
                    return true;
                }
            }
        }

        return false;
    }

    shuffleBoard() {
        const allFruits = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                allFruits.push(this.grid[row][col]);
            }
        }

        for (let i = allFruits.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allFruits[i], allFruits[j]] = [allFruits[j], allFruits[i]];
        }

        let index = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.grid[row][col] = allFruits[index++];
            }
        }

        this.renderGrid();
    }

    updateAvailableFruits() {
        if (this.score >= 500 && !this.fruits.includes("🍊")) {
            this.fruits.push("🍊"); 
        }
        if (this.score >= 1000 && !this.fruits.includes("🍑")) {
            this.fruits.push("🍑"); 
        }
        if (this.score >= 1500 && !this.fruits.includes("🍌")) {
            this.fruits.push("🍌"); 
        }
        if (this.score >= 2000 && !this.fruits.includes("🥝")) {
            this.fruits.push("🥝"); 
        }
        if (this.score >= 2500 && !this.fruits.includes("🍅")) {
            this.fruits.push("🍅"); 
        }
        if (this.score >= 3000 && !this.fruits.includes("🍋")) {
            this.fruits.push("🍋")
        }
    }

    randomJewel() {
        return this.fruits[Math.floor(Math.random() * this.fruits.length)];
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    const game = new Bejeweled();
});



