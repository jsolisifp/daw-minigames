let board = [];
let revealed = [];
let mines = 12;
let size = 8;
let minescount = 0;
let flagsPlaced = 0;
let time = 0;
let timerInterval = null;
let started = false;
let allowFlags = false;

function $(id) { return document.getElementById(id); }

const area = $("board");

function updateMines() {
    let s = parseInt($("size").value);
    mines = Math.round(s * s * 0.18);
}

$("size").onchange = () => {
    size = parseInt($("size").value);
    updateMines();
    area.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    area.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    area.style.width = `${Math.min(size * 32, 500)}px`;
    area.style.height = `${Math.min(size * 32, 500)}px`;
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
}

$("btn-start").onclick = () => {
    createBoard();
    renderBoard();
    showScreen("screen-game");

    started = true;
    allowFlags = false;
    time = 0;
    flagsPlaced = 0;

    $("timer").innerText = 0;
    $("mines-left").innerText = mines;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        time++;
        $("timer").innerText = time;
    }, 1000);

    AudioManager.startBg();
};


$("btn-restart").onclick = () => {
    showScreen("screen-start");

    clearInterval(timerInterval);
    timerInterval = null;

    time = 0;
    flagsPlaced = 0;
    started = false;
    allowFlags = false;

    $("timer").innerText = 0;
    $("mines-left").innerText = mines;

    AudioManager.stopBg();
};


function countMines(x, y) {
    let c = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (board[y + dy] && board[y + dy][x + dx] === "M") c++;
        }
    }
    return c;
}

function placeMines(nx, ny) {
    let attempts = 0;
    while (minescount < mines) {
        if (attempts > 5000) break;
        attempts++;
        let x = Math.floor(Math.random() * size);
        let y = Math.floor(Math.random() * size);
        if (board[y][x] === "M") continue;
        if (x === nx && y === ny) continue;
        board[y][x] = "M";
        let num = countMines(x, y);
        if (num <= 4) {
            minescount++;
        } else {
            board[y][x] = 0;
        }
    }
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (board[y][x] === "M") continue;
            board[y][x] = countMines(x, y);
        }
    }
}

function createBoard() {
    board = [];
    revealed = [];
    minescount = 0;
    for (let y = 0; y < size; y++) {
        board[y] = [];
        revealed[y] = [];
        for (let x = 0; x < size; x++) {
            board[y][x] = 0;
            revealed[y][x] = false;
        }
    }
}

function renderBoard() {
    area.innerHTML = "";
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            updateCellClass(cell, x, y);
            cell.onclick = () => clickCell(cell, x, y);
            cell.addEventListener('contextmenu', function (event) {
                event.preventDefault();
                if (allowFlags && !revealed[y][x]) {
                    if (cell.classList.contains('flagged')) {
                        cell.classList.remove('flagged');
                        if (board[y][x].toString().startsWith("F")) {
                            board[y][x] = board[y][x].toString().slice(1);
                            if (board[y][x] === "") board[y][x] = 0;
                            flagsPlaced--;
                        }
                    } else {
                        cell.classList.add('flagged');
                        if (board[y][x] !== "M") {
                            board[y][x] = "F" + board[y][x];
                            flagsPlaced++;
                        } else {
                            board[y][x] = "FM";
                            flagsPlaced++;
                        }
                    }
                    $("mines-left").innerText = mines - flagsPlaced;
                }
            });
            area.appendChild(cell);
        }
    }
}

function updateCellClass(cell, x, y) {
    const v = board[y][x];
    if (v.toString().startsWith("F")) {
        cell.classList.add('flagged');
        return;
    }
    if (!revealed[y][x]) return;
    cell.classList.add('revealed');
    if (v === "M" || v === "FM") {
        cell.classList.add('mine');
    } else if (v !== 0 && v !== "0") {
        const num = parseInt(v);
        cell.classList.add(`n${num}`);
        cell.textContent = num;
    }
}

function revealEmpty(x, y) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    if (revealed[y][x]) return;
    if (board[y][x].toString().includes("F")) return;
    revealed[y][x] = true;
    if (board[y][x] !== 0) return;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            revealEmpty(x + dx, y + dy);
        }
    }
}

function clickCell(cell, x, y) {
    if (!started) return;
    allowFlags = true;
    if (!minescount) {
        placeMines(x, y);
    }
    if (cell.classList.contains('flagged')) return;
    if (board[y][x] === "M") {
        revealed[y][x] = true;
        renderBoard();
        endGame(false);
        return;
    }
    if (board[y][x] === 0 || board[y][x] === "0") {
        revealEmpty(x, y);
    } else {
        revealed[y][x] = true;
    }
    renderBoard();
    if (checkWin()) endGame(true);
}

function checkWin() {
    let safe = 0;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (board[y][x] !== "M" && revealed[y][x]) safe++;
        }
    }
    return safe >= (size * size - mines);
}

function endGame(win) {
    AudioManager.stopBg();

    clearInterval(timerInterval);
    started = false;
    allowFlags = false;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (board[y][x] === "M" || board[y][x] === "FM") {
                revealed[y][x] = true;
            }
        }
    }

    if (win) {
        const best = getCookie("best_time");
        if (!best || time < parseInt(best)) {
            setCookie("best_time", time, 365);
        }
    }

    updateBestTimeText();
    renderBoard();

    if (win) {
        AudioManager.play(AudioManager.win);
        $("result-text").innerText = "VICTORIA!";
        $("result-text").className = "win";

        showScreen("screen-result");

    } else {
        AudioManager.play(AudioManager.lose);
        $("result-text").innerText = "PERDIDA...";
        $("result-text").className = "lose";

        setTimeout(() => {
            showScreen("screen-result");
        }, 2000);
    }
}



function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let c of cookies) {
        const [key, val] = c.split("=");
        if (key === name) return val;
    }
    return null;
}

function updateBestTimeText() {
    const best = getCookie("best_time");
    $("best-time-text").innerText = best ? `RECORD: ${best}s` : "RECORD: --";
}

updateBestTimeText();
updateMines();
$("size").onchange();