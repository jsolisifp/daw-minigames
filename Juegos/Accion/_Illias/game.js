let gameStatus = 'menu';
let points = 0;
let remainingLives = 3;
let currentLevel = 1;
let showingLifeLostMsg = false;

const gameEngine = {
    paddle: {
        x: 300,
        y: 550,
        width: 100,
        height: 15,
        speed: 8
    },
    ball: {
        x: 350,
        y: 400,
        radius: 8,
        dx: 3,
        dy: -3
    },
    blocks: [],
    pressedKeys: {},
    frameId: null
};

const domElements = {
    menuScreen: document.getElementById('menuScreen'),
    gameScreen: document.getElementById('gameScreen'),
    gameOverScreen: document.getElementById('gameOverScreen'),
    lifeLostOverlay: document.getElementById('lifeLostOverlay'),
    startBtn: document.getElementById('startBtn'),
    retryBtn: document.getElementById('retryBtn'),
    menuBtn: document.getElementById('menuBtn'),
    canvas: document.getElementById('gameCanvas'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    levelDisplay: document.getElementById('levelDisplay'),
    livesDisplay: document.getElementById('livesDisplay'),
    finalScore: document.getElementById('finalScore'),
    finalLevel: document.getElementById('finalLevel'),
    livesRemaining: document.getElementById('livesRemaining')
};

const canvas = domElements.canvas;
const canvasCtx = canvas.getContext('2d');

canvas.width = 700;
canvas.height = 600;

const BRICK_PALETTE = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
const GAME_WIDTH = 700;
const GAME_HEIGHT = 600;

function setupBricks() {
    gameEngine.blocks = [];
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 8; c++) {
            gameEngine.blocks.push({
                x: c * 85 + 35,
                y: r * 35 + 50,
                width: 75,
                height: 25,
                color: BRICK_PALETTE[r],
                active: true,
                strength: r < 2 ? 2 : 1
            });
        }
    }
}

function resetBallPosition() {
    gameEngine.ball = {
        x: gameEngine.paddle.x + gameEngine.paddle.width / 2,
        y: 400,
        radius: 8,
        dx: 3,
        dy: -3
    };
}

function initGame() {
    gameStatus = 'playing';
    points = 0;
    remainingLives = 3;
    currentLevel = 1;
    showingLifeLostMsg = false;
    
    gameEngine.paddle.x = 300;
    resetBallPosition();
    setupBricks();
    
    updateDisplay();
    switchScreen('gameScreen');
    runGame();
}

function updateDisplay() {
    domElements.scoreDisplay.textContent = points;
    domElements.levelDisplay.textContent = currentLevel;
    domElements.livesDisplay.textContent = '❤️'.repeat(remainingLives);
}

function switchScreen(screenId) {
    domElements.menuScreen.style.display = screenId === 'menuScreen' ? 'flex' : 'none';
    domElements.gameScreen.style.display = screenId === 'gameScreen' ? 'flex' : 'none';
    domElements.gameOverScreen.style.display = screenId === 'gameOverScreen' ? 'flex' : 'none';
}

function checkBlockCollision(ball, block) {
    return ball.x + ball.radius > block.x &&
           ball.x - ball.radius < block.x + block.width &&
           ball.y + ball.radius > block.y &&
           ball.y - ball.radius < block.y + block.height;
}

function updateGameLogic() {
    const p = gameEngine.paddle;
    const b = gameEngine.ball;
    const blocks = gameEngine.blocks;
    const keys = gameEngine.pressedKeys;

    
    if (keys['ArrowLeft'] && p.x > 0) p.x -= p.speed;
    if (keys['ArrowRight'] && p.x < GAME_WIDTH - p.width) p.x += p.speed;

    b.x += b.dx;
    b.y += b.dy;

    
    if (b.x - b.radius < 0 || b.x + b.radius > GAME_WIDTH) b.dx = -b.dx;
    if (b.y - b.radius < 0) b.dy = -b.dy;

    
    if (b.y + b.radius > p.y &&
        b.y - b.radius < p.y + p.height &&
        b.x > p.x &&
        b.x < p.x + p.width) {
        const contactPos = (b.x - p.x) / p.width;
        b.dx = (contactPos - 0.5) * 8;
        b.dy = -Math.abs(b.dy);
    }

    
    if (b.y > GAME_HEIGHT) {
        remainingLives--;
        if (remainingLives <= 0) {
            endGame();
        } else {
            triggerLifeLostScreen();
        }
        return;
    }

    
    let remainingBlocks = 0;
    blocks.forEach(block => {
        if (block.active && checkBlockCollision(b, block)) {
            block.strength -= 1;
            if (block.strength <= 0) {
                block.active = false;
                points += 10;
            }
            b.dy = -b.dy;
        }
        if (block.active) remainingBlocks++;
    });

    
    if (remainingBlocks === 0) {
        currentLevel++;
        setupBricks();
        resetBallPosition();
    }

    updateDisplay();
}

function renderGame() {
    const p = gameEngine.paddle;
    const b = gameEngine.ball;
    const blocks = gameEngine.blocks;

    
    const bgGrad = canvasCtx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    bgGrad.addColorStop(0, '#0f0c29');
    bgGrad.addColorStop(0.5, '#302b63');
    bgGrad.addColorStop(1, '#24243e');
    canvasCtx.fillStyle = bgGrad;
    canvasCtx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    
    blocks.forEach(block => {
        if (block.active) {
            canvasCtx.shadowBlur = 10;
            canvasCtx.shadowColor = block.color;
            canvasCtx.fillStyle = block.strength > 1 ? block.color : block.color + '88';
            canvasCtx.fillRect(block.x, block.y, block.width, block.height);
            
            const blockShine = canvasCtx.createLinearGradient(block.x, block.y, block.x, block.y + block.height);
            blockShine.addColorStop(0, 'rgba(255,255,255,0.3)');
            blockShine.addColorStop(1, 'rgba(0,0,0,0.2)');
            canvasCtx.fillStyle = blockShine;
            canvasCtx.fillRect(block.x, block.y, block.width, block.height);
            canvasCtx.shadowBlur = 0;
        }
    });

    
    canvasCtx.shadowBlur = 15;
    canvasCtx.shadowColor = '#00d4ff';
    const paddleGrad = canvasCtx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
    paddleGrad.addColorStop(0, '#00d4ff');
    paddleGrad.addColorStop(1, '#0099cc');
    canvasCtx.fillStyle = paddleGrad;
    canvasCtx.fillRect(p.x, p.y, p.width, p.height);
    canvasCtx.shadowBlur = 0;

    
    canvasCtx.shadowBlur = 20;
    canvasCtx.shadowColor = '#00ff88';
    const ballGrad = canvasCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
    ballGrad.addColorStop(0, '#ffffff');
    ballGrad.addColorStop(0.5, '#00ff88');
    ballGrad.addColorStop(1, '#00cc66');
    canvasCtx.beginPath();
    canvasCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    canvasCtx.fillStyle = ballGrad;
    canvasCtx.fill();
    canvasCtx.shadowBlur = 0;
}

function triggerLifeLostScreen() {
    gameStatus = 'paused';
    showingLifeLostMsg = true;
    domElements.lifeLostOverlay.style.display = 'flex';
    domElements.livesRemaining.textContent = remainingLives;
    
    setTimeout(() => {
        domElements.lifeLostOverlay.style.display = 'none';
        showingLifeLostMsg = false;
        gameStatus = 'playing';
        resetBallPosition();
        runGame();
    }, 1500);
}

function endGame() {
    gameStatus = 'gameover';
    domElements.finalScore.textContent = points;
    domElements.finalLevel.textContent = currentLevel;
    switchScreen('gameOverScreen');
}

function runGame() {
    if (gameStatus !== 'playing') return;
    
    updateGameLogic();
    renderGame();
    gameEngine.frameId = requestAnimationFrame(runGame);
}

window.addEventListener('keydown', (e) => {
    gameEngine.pressedKeys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    gameEngine.pressedKeys[e.key] = false;
});

domElements.startBtn.addEventListener('click', initGame);

domElements.retryBtn.addEventListener('click', initGame);

domElements.menuBtn.addEventListener('click', () => {
    gameStatus = 'menu';
    if (gameEngine.frameId) {
        cancelAnimationFrame(gameEngine.frameId);
    }
    switchScreen('menuScreen');
});

switchScreen('menuScreen');
