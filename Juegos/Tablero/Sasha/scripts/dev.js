
let devMode = false;
$("btn-dev-toggle").onclick = () => {
    devMode = !devMode;
    $("dev-panel").classList.toggle('active');
};

$("dev-reveal-safe").onclick = () => {
    if (!started) return;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (board[y][x] !== "M" && board[y][x] !== "FM") {
                revealed[y][x] = true;
            }
        }
    }
    renderBoard();
    endGame(true);
};

$("dev-show-mines").onclick = () => {
    if (!started) return;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (board[y][x] === "M" || board[y][x] === "FM") {
                revealed[y][x] = true;
            }
        }
    }
    renderBoard();
};

$("btn-clear-cookies").onclick = () => {
    document.cookie.split(";").forEach(cookie => {
        const eq = cookie.indexOf("=");
        const name = eq > -1 ? cookie.slice(0, eq).trim() : cookie.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    alert("Cookies очищено!");
    updateBestTimeText();
};