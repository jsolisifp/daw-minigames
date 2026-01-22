////////////////////////////////////////////////////////////////////////////////
//                          MINESWEEPER GAME LOGIC                             //
////////////////////////////////////////////////////////////////////////////////

// CONFIG FROM MENU
var gridSize;
var minesCount;
var tileSize = 40;

var grid = [];
var gameOver = false;
var tilesRevealedCount = 0;
var totalSafeTiles = 0;

var objectTypeTile = 10;

// MUSIC
var musicIndex = -1;

// LOAD CONFIG FROM HTML MENU
function LoadGameConfig()
{
    gridSize = window.gameConfig.gridSize;
    minesCount = window.gameConfig.minesCount;

    totalSafeTiles = gridSize * gridSize - minesCount;
}

// -----------------------------------------------------------------------------
// VICTORY SCREEN LOGIC
// -----------------------------------------------------------------------------

function ShowVictoryScreen() {
    const screen = document.getElementById("victory-screen");
    pintarLeaderboard();
    const timeBox = document.getElementById("victory-time");
    const clicksBox = document.getElementById("victory-clicks");
    document.getElementById("player-name-ld")

    timeBox.textContent = elapsedTime + " s";
    clicksBox.textContent = (leftClicks + rightClicks);

    screen.classList.remove("hidden");
}

function HideVictoryScreen() {
    document.getElementById("victory-screen").classList.add("hidden");
}

function ForceWin() {
    tilesRevealedCount = totalSafeTiles;
    gameOver = true;
    StopTimer();

    setTimeout(() => {
        ShowVictoryScreen();
    }, 200);
    StopSound(musicIndex);
}
window.ForceWin = ForceWin;

// ----------------------------------------------------------------------------
// Save score
// ----------------------------------------------------------------------------

function guardarPuntuacion(nombre, temps, click) {

    const tiempo = parseInt(temps, 10);
    const clicks = parseInt(click, 10);

	let scores = JSON.parse(localStorage.getItem("puntuaciones")) || [];

	scores.push({
		nombre,
		tiempo,
		clicks,
		fecha: Date.now()
	});

	localStorage.setItem("puntuaciones", JSON.stringify(scores));
}

// ----------------------------------------------------------------------------
// Show Score
// ----------------------------------------------------------------------------

function pintarLeaderboard() {
	const puntuaciones = obtenerPuntuaciones();
	const tbody = document.querySelector("#leaderboard-table tbody");

	tbody.innerHTML = "";

    console.log(puntuaciones)

    puntuaciones.sort((a, b) => {
		if (a.tiempo !== b.tiempo) {
			return a.tiempo - b.tiempo;
		}
		return a.clicks - b.clicks;
	});

    console.log(puntuaciones)

	puntuaciones.forEach(p => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
			<td>${p.nombre}</td>
			<td>${p.tiempo}s</td>
			<td>${p.clicks}</td>
		`;
		tbody.appendChild(tr);
	});
}

function obtenerPuntuaciones() {
    return JSON.parse(localStorage.getItem("puntuaciones")) || [];
}

// ----------------------------------------------------------------------------
// SCENE CREATION
// ----------------------------------------------------------------------------

function CreateScene()
{
    LoadGameConfig();

    objects = [];
    grid = [];

    let boardWidth = gridSize * tileSize;
    let boardHeight = gridSize * tileSize;

    let startX = (900 - boardWidth) / 2;
    let startY = (600 - boardHeight) / 2;

    for (let y = 0; y < gridSize; y++)
    {
        grid[y] = [];

        for (let x = 0; x < gridSize; x++)
        {
            let tile = CreateObject(
                "tile_" + x + "_" + y,
                objectTypeTile,
                startX + x * tileSize,
                startY + y * tileSize,
                tileSize,
                tileSize
            );

            grid[y][x] = {
                index: tile,
                hasMine: false,
                revealed: false,
                flagged: false,
                number: 0
            };
        }
    }

    PlaceMines();
    ComputeNumbers();

    tilesRevealedCount = 0;
    gameOver = false;

    // MUSIC
    if (!window.gameConfig.musicMuted)
        StartMusic();

}

function StartMusic()
{
    musicIndex = CreateSound(window.gameConfig.musicFile, true);
    sounds[musicIndex].volume = window.gameConfig.musicVolume;
    PlaySound(musicIndex);
}

// ----------------------------------------------------------------------------
// GAME LOGIC
// ----------------------------------------------------------------------------

function PlaceMines()
{
    let placed = 0;

    while (placed < minesCount)
    {
        let x = UtilsRandomRangeInt(0, gridSize);
        let y = UtilsRandomRangeInt(0, gridSize);

        if (!grid[y][x].hasMine)
        {
            grid[y][x].hasMine = true;
            placed++;
        }
    }
}

function ComputeNumbers()
{
    for (let y = 0; y < gridSize; y++)
        for (let x = 0; x < gridSize; x++)
        {
            if (grid[y][x].hasMine)
            {
                grid[y][x].number = -1;
                continue;
            }

            let count = 0;

            for (let dy = -1; dy <= 1; dy++)
                for (let dx = -1; dx <= 1; dx++)
                {
                    let nx = x + dx;
                    let ny = y + dy;

                    if (nx >= 0 && nx < gridSize &&
                        ny >= 0 && ny < gridSize &&
                        grid[ny][nx].hasMine)
                        count++;
                }

            grid[y][x].number = count;
        }
}

function StartScene() {}
function SceneUpdate() {}

function StartObject(i)
{
    let o = objects[i];
    if (o.type == objectTypeTile)
        o.sprite = CreateSprite("hidden_tile.png");
}

function UpdateObject() {}

// ----------------------------------------------------------------------------
// INPUT
// ----------------------------------------------------------------------------

function OnObjectClicked(o, isRight)
{
    if (gameOver) return;

    if (isRight) {
        rightClicks++;
        document.getElementById("rightClicks").textContent = rightClicks;
    } else {
        leftClicks++;
        document.getElementById("leftClicks").textContent = leftClicks;
    }

    let p = o.name.split("_");
    let x = parseInt(p[1]);
    let y = parseInt(p[2]);

    if (isRight) ToggleFlag(x, y);
    else RevealTile(x, y);
}


function ToggleFlag(x, y)
{
    let c = grid[y][x];

    if (c.revealed) return;
    c.flagged = !c.flagged;

    let obj = objects[c.index];

    GetSprite(obj.sprite).src = c.flagged
        ? "images/tile_flag.png"
        : "images/hidden_tile.png";
}

function RevealTile(x, y)
{
    let c = grid[y][x];

    if (c.revealed || c.flagged) return;

    c.revealed = true;
    tilesRevealedCount++;

    let obj = objects[c.index];

    if (c.hasMine) {
        GetSprite(obj.sprite).src = "images/mine.png";
        RevealAllMines();
        gameOver = true;

        StopTimer();
        document.getElementById("btn-restart").classList.remove("hidden");

        setTimeout(() => {
            alert("Game Over!");
        }, 300);

        StopSound(musicIndex);

        return;
    }

    GetSprite(obj.sprite).src = "images/num_" + c.number + ".png";

    if (c.number === 0)
        FloodFill(x, y);

        if (tilesRevealedCount >= totalSafeTiles)
        {
            gameOver = true;

            StopTimer(); 

            setTimeout(() => {
                ShowVictoryScreen();
            }, 300);

            StopSound(musicIndex);
        }
    }

function FloodFill(x, y)
{
    for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++)
        {
            let nx = x + dx;
            let ny = y + dy;

            if (nx >= 0 && nx < gridSize &&
                ny >= 0 && ny < gridSize &&
                !grid[ny][nx].revealed)
                RevealTile(nx, ny);
        }
}

function RevealAllMines()
{
    for (let y = 0; y < gridSize; y++)
        for (let x = 0; x < gridSize; x++)
            if (grid[y][x].hasMine)
            {
                let obj = objects[grid[y][x].index];
                GetSprite(obj.sprite).src = "images/mine.png";
            }
}

// EXPONEMOS LAS FUNCIONES PARA QUE EL ENGINE LAS USE
window.CreateScene = CreateScene;
window.StartScene = StartScene;
window.SceneUpdate = SceneUpdate;
window.StartObject = StartObject;
window.UpdateObject = UpdateObject;
window.OnObjectClicked = OnObjectClicked;