const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const blockSize = 20;
const cols = canvas.width / blockSize;
const rows = canvas.height / blockSize;

// Configuración del juego
let board = Array(rows).fill().map(() => Array(cols).fill(0));
let score = 0;
let level = 1;
let lines = 0;
let isPaused = false;

// Modales
const gameOverModal = document.getElementById('gameOverModal');
const pauseModal = document.getElementById('pauseModal');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const resumeButton = document.getElementById('resumeButton');

// Definición de piezas y colores
const pieces = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[1,1,1],[0,1,0]], // T
    [[1,1,1],[1,0,0]], // L
    [[1,1,1],[0,0,1]], // J
    [[1,1,0],[0,1,1]], // S
    [[0,1,1],[1,1,0]]  // Z
];

const colors = [
    '#FF0D72', '#0DC2FF', '#0DFF72',
    '#F538FF', '#FF8E0D', '#FFE138',
    '#3877FF'
];

// Variables de la pieza actual
let currentPiece = null;
let currentPieceX = 0;
let currentPieceY = 0;
let currentPieceIndex = 0;

// Función para hacer caer la pieza instantáneamente
function hardDrop() {
    while (!collision()) {
        currentPieceY++;
    }
    currentPieceY--;
    merge();
    clearLines();
    gameOver();
    createPiece();
}

// Funciones de gestión de piezas
function createPiece() {
    currentPieceIndex = Math.floor(Math.random() * pieces.length);
    currentPiece = pieces[currentPieceIndex];
    currentPieceX = Math.floor(cols / 2) - Math.floor(currentPiece[0].length / 2);
    currentPieceY = 0;
}

function collision() {
    for(let y = 0; y < currentPiece.length; y++) {
        for(let x = 0; x < currentPiece[y].length; x++) {
            if(currentPiece[y][x]) {
                const boardX = currentPieceX + x;
                const boardY = currentPieceY + y;
                
                if(boardX < 0 || boardX >= cols || 
                   boardY >= rows ||
                   (boardY >= 0 && board[boardY][boardX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge() {
    for(let y = 0; y < currentPiece.length; y++) {
        for(let x = 0; x < currentPiece[y].length; x++) {
            if(currentPiece[y][x]) {
                const boardY = currentPieceY + y;
                if(boardY >= 0) {
                    board[boardY][currentPieceX + x] = currentPieceIndex + 1;
                }
            }
        }
    }
}

function rotate() {
    const rotated = currentPiece[0].map((_, i) =>
        currentPiece.map(row => row[i]).reverse()
    );
    const prevPiece = currentPiece;
    currentPiece = rotated;
    if(collision()) {
        currentPiece = prevPiece;
    }
}

// Funciones de juego
function clearLines() {
    let linesCleared = 0;
    for(let y = rows - 1; y >= 0; y--) {
        if(board[y].every(value => value > 0)) {
            board.splice(y, 1);
            board.unshift(Array(cols).fill(0));
            linesCleared++;
        }
    }
    if(linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level;
        level = Math.floor(lines / 10) + 1;
        
        scoreElement.textContent = score;
        levelElement.textContent = level;
        linesElement.textContent = lines;
    }
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar el tablero
    for(let y = 0; y < rows; y++) {
        for(let x = 0; x < cols; x++) {
            if(board[y][x]) {
                context.fillStyle = colors[board[y][x] - 1];
                context.fillRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1);
            }
        }
    }

    // Dibujar la pieza actual
    if(currentPiece) {
        context.fillStyle = colors[currentPieceIndex];
        for(let y = 0; y < currentPiece.length; y++) {
            for(let x = 0; x < currentPiece[y].length; x++) {
                if(currentPiece[y][x]) {
                    context.fillRect(
                        (currentPieceX + x) * blockSize,
                        (currentPieceY + y) * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            }
        }
    }
}

function gameOver() {
    if(board[0].some(value => value > 0)) {
        finalScoreElement.textContent = score;
        gameOverModal.style.display = 'flex';
        gameOverModal.classList.add('active');
    }
}

function resetGame() {
    board = Array(rows).fill().map(() => Array(cols).fill(0));
    score = 0;
    level = 1;
    lines = 0;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
    gameOverModal.style.display = 'none';
    gameOverModal.classList.remove('active');
    createPiece();
}

function togglePause() {
    isPaused = !isPaused;
    if(isPaused) {
        pauseModal.style.display = 'flex';
        pauseModal.classList.add('active');
    } else {
        pauseModal.style.display = 'none';
        pauseModal.classList.remove('active');
        lastTime = performance.now();
    }
}

// Event Listeners
document.addEventListener('keydown', event => {
    if(!isPaused) {
        switch(event.keyCode) {
            case 37: // Left arrow
                currentPieceX--;
                if(collision()) currentPieceX++;
                break;
            case 39: // Right arrow
                currentPieceX++;
                if(collision()) currentPieceX--;
                break;
            case 40: // Down arrow
                currentPieceY++;
                if(collision()) {
                    currentPieceY--;
                    merge();
                    clearLines();
                    gameOver();
                    createPiece();
                }
                break;
            case 38: // Up arrow
                rotate();
                break;
            case 32: // Space bar
                hardDrop();
                break;
        }
    }
    if(event.keyCode === 80) { // P key
        togglePause();
    }
});

restartButton.addEventListener('click', resetGame);
resumeButton.addEventListener('click', togglePause);

// Loop principal del juego
let dropCounter = 0;
let lastTime = 0;
function update(time = 0) {
    if(!isPaused) {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;

        if(dropCounter > (1000 - (level * 50))) {
            currentPieceY++;
            if(collision()) {
                currentPieceY--;
                merge();
                clearLines();
                gameOver();
                createPiece();
            }
            dropCounter = 0;
        }

        draw();
    }
    requestAnimationFrame(update);
}

// Iniciar el juego
createPiece();
update();