    ///////////////////////////////////////////////////
    //       VARIABLES & FUNCTIONS YOU CAN USE       //
    ///////////////////////////////////////////////////
    
    ////////////  SYSTEM ////////////////

    // timeStep  => Seconds passed between updates. Read only.
    
    ////////////  SCENE ////////////////

    // GetObject(index)
    // CreateObject(name, type, posX, posY, width, height) => Returns object index
    
    ////////////  PHYSICS ////////////////
    
    // gravity => Read and write.
    
    // GetCollider(index)
    // CreateCollider(movementType, hasGravity) => Returns collider index
    
    ////////////  RENDER ////////////////

    // GetSprite(index)
    // CreateSprite(file)  => Returns sprite index
	// ShowSprite(index)
	// HideSprite(index)

    ////////////  INPUT ////////////////

    // inputFireDown
    // inputLeftDown
    // inputRightDown
    // inputUpDown
    // inputDownDown
    // 
    // inputFirePressed
    // inputLeftPressed
    // inputRightPressed
    // inputUpPressed
    // inputDownPressed
    
    ////////////  SOUND ////////////////    
    
    // CreateSound(file, loop)  => Returns sound index
    // PlaySound(index)
    // StopSound(index)
    
    ////////////  UTILS ////////////////    

    // UtilsRandomRange(a, b)
    // UtilsRandomRangeInt(a, b)
 
/////////////////////////////////////////////////// 
//              DEFINE YOUR OBJECT TYPES         //
///////////////////////////////////////////////////

var objectTypeColumn = 0;   
var objectTypePiece = 1;    
var objectTypeUI = 1;       
var ROWS = 6;
var COLS = 7;

var board = [];            
var currentPlayer = 1;     

var musicIndex = -1;
var musicStarted = false;
var musicEnabled = true;

var audioUnlocked = false;
var gameOver = false;

var moves = 0;
var time = 0;
var timerInterval = null;

///////////////////////////////////////////////////
//              COOKIES UTILS
///////////////////////////////////////////////////

// Guardar cookie
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + d.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

// Leer cookie
function getCookie(name) {
    var parts = document.cookie.split(name + "=");

    if (parts.length < 2) return null;

    return parts[1].split(";")[0];
}




///////////////////////////////////////////////////
//              CREATE YOUR SCENE
///////////////////////////////////////////////////

function CreateScene()
{
    // Inicializar tablero lógico
    board = [];
    for (var r = 0; r < ROWS; r++) {
        board[r] = [];
        for (var c = 0; c < COLS; c++) {
            board[r][c] = 0;
        }
    }

    // Reset stats
    moves = 0;
    time = 0;
    document.getElementById("moves").textContent = moves;
    document.getElementById("time").textContent = "00:00";
    StartTimer();
    updateRecordDisplay();

    // Crear columnas 
    var size = 80;
    var offsetX = 100;
    var offsetY = 100;

    for (var c = 0; c < COLS; c++) {
        CreateObject(
            "column_" + c,
            objectTypeColumn,
            offsetX + c * size,
            offsetY,
            size,
            ROWS * size
        );
    }

    CreateObject("musicButton", objectTypeUI, 20, 20, 50, 50);
}

///////////////////////////////////////////////////
//              START YOUR MUSIC
///////////////////////////////////////////////////

function StartMusic()
{
    if (musicStarted) return;

    musicStarted = true;
    musicIndex = CreateSound("instrumental-music.wav", true);
    sounds[musicIndex].volume = 0.5;

    if (musicEnabled){
        PlaySound(musicIndex);
    }
}

function UnlockAudio()
{
    if (audioUnlocked) return;
    audioUnlocked = true;
    StartMusic();
}

function ToggleMusic()
{
    musicEnabled = !musicEnabled;

    if (!musicStarted) return;

    if (musicEnabled) {
        PlaySound(musicIndex);
    } else {
        StopSound(musicIndex);
    }
}

///////////////////////////////////////////////////
//              START YOUR OBJECTS
///////////////////////////////////////////////////

function StartObject(index)
{
    var o = objects[index];

    if (o.type == objectTypeColumn) {
        o.sprite = CreateSprite("column.png");
    }
    else if (o.type == objectTypeUI) {
        o.sprite = CreateSprite("music.png");
    }
    else if (o.type == objectTypePiece) {
    }
}

///////////////////////////////////////////////////
//              PIEZAS
///////////////////////////////////////////////////

function CreatePiece(row, col, player)
{
    var size = 80;
    var offsetX = 100;
    var offsetY = 100;

    var index = CreateObject(
        "piece",
        objectTypePiece,
        offsetX + col * size,
        offsetY + row * size,
        size,
        size
    );

    var o = GetObject(index);
    o.sprite = CreateSprite(player == 1 ? "red.png" : "blue.png");
}

///////////////////////////////////////////////////
//              UPDATE YOUR OBJECTS
///////////////////////////////////////////////////

function UpdateObject(index)
{
    var o = objects[index];
}

///////////////////////////////////////////////////
//            RESPOND TO INPUT EVENTS
///////////////////////////////////////////////////

function OnObjectClicked(object)
{
    if (gameOver) return;

    UnlockAudio();

    if (object.name === "musicButton") {
        ToggleMusic();
        return;
    }

    // Click en columna
    if (object.type == objectTypeColumn) {
        var col = parseInt(object.name.split("_")[1]);

        for (var r = ROWS - 1; r >= 0; r--) {
            if (board[r][col] == 0) {
                board[r][col] = currentPlayer;
                CreatePiece(r, col, currentPlayer);

                // --- Actualizar estadísticas ---
                moves++;
                document.getElementById("moves").textContent = moves;

                CheckWin(r, col);
                currentPlayer = currentPlayer == 1 ? 2 : 1;
                break;
            }
        }
    }
}

///////////////////////////////////////////////////
//              RESPOND TO COLLISIONS
///////////////////////////////////////////////////

// function OnObjectCollision(object, otherObject)
// {
//     if(object.type == objectTypeBall)
//     {       
//         var c = GetCollider(object.collider);
//         if(Math.abs(c.speedX) > 50.0 || Math.abs(c.speedY) > 50.0)
//         {
//             PlaySound(object.sound);
//         }
//     }
// }


///////////////////////////////////////////////////
//              CHECK WIN
///////////////////////////////////////////////////

function CheckWin(row, col)
{
    var p = board[row][col];

    function count(dx, dy) {
        var n = 0;
        var r = row + dy;
        var c = col + dx;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] == p) {
            n++;
            r += dy;
            c += dx;
        }
        return n;
    }

    if (
        1 + count(1,0) + count(-1,0) >= 4 ||
        1 + count(0,1) + count(0,-1) >= 4 ||
        1 + count(1,1) + count(-1,-1) >= 4 ||
        1 + count(1,-1) + count(-1,1) >= 4
    ) {
        EndGame(p);       
    }
}

///////////////////////////////////////////////////
//              TIMER
///////////////////////////////////////////////////

function StartTimer(){
    StopTimer();
    timerInterval = setInterval(function(){
        time++;
        var min = Math.floor(time/60);
        var sec = time % 60;
        document.getElementById("time").textContent = 
            String(min).padStart(2,'0') + ":" + String(sec).padStart(2,'0');
    }, 1000);
}

function StopTimer(){
    if(timerInterval){
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

///////////////////////////////////////////////////
//              END GAME
///////////////////////////////////////////////////

function EndGame(winner) {
    StopTimer();
    gameOver = true;

    // Leer récord anterior
    var record = getCookie("bestRecord");
    var recMoves = Infinity;
    var recTime = Infinity;

    if (record) {
        var parts = record.split("-");
        recMoves = parseInt(parts[0]);
        recTime = parseInt(parts[1]);
    }

    // Actualizar récord si es mejor
    if (moves < recMoves || (moves === recMoves && time < recTime)) {
        setCookie("bestRecord", moves + "-" + time, 60);
    }

    // Mostrar récord
    updateRecordDisplay();

    // Mostrar pantalla de fin
    document.getElementById("pantallaFinal").classList.remove("oculto");
    document.getElementById("tituloFinal").textContent = "¡Fin del juego!";
    document.getElementById("resultadoFinal").textContent = "Gana el jugador " + winner;
}

function updateRecordDisplay() {
    var record = getCookie("bestRecord");
    if (!record) return;

    var parts = record.split("-");
    var recMoves = parseInt(parts[0]);
    var recTime = parseInt(parts[1]);

    var min = Math.floor(recTime / 60);
    var sec = recTime % 60;
    var timeStr = (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);

    var span = document.getElementById("recordMoves");
    if (!span) {
        span = document.createElement("p");
        span.id = "recordMoves";
        span.style.color = "#FFD700";
        document.getElementById("statsPanel").appendChild(span);
    }

    span.textContent = "Récord: " + recMoves + " movimientos / " + timeStr;
}



///////////////////////////////////////////////////
//              REINICIAR PARTIDA
///////////////////////////////////////////////////

window.reiniciarPartida = function() 
{
    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
            board[r][c] = 0;
        }
    }

    objects = objects.filter(o => o.type !== objectTypePiece);

    for (var i = 0; i < objects.length; i++) {
        StartObject(i);
    }

    var musicIndex = CreateObject("musicButton", objectTypeUI, 20, 20, 50, 50);
    StartObject(musicIndex);

    currentPlayer = 1;
    gameOver = false;

    // Reiniciar stats
    moves = 0;
    time = 0;
    document.getElementById("moves").textContent = moves;
    document.getElementById("time").textContent = "00:00";
    StartTimer();
    updateRecordDisplay();

    document.getElementById("pantallaFinal").classList.add("oculto");
};
