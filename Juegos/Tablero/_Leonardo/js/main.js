var FILAS = 8;
var COLUMNAS = 8;
var NUMERO_DE_MINAS = 10;
var TAMANIO_CELDA = 40;
var TABLERO_X = 50;
var TABLERO_Y = 100;
var tablero = [];

var spriteOculta;
var spriteVacia;
var spriteMina;
var spriteNumero1;
var spriteNumero2;
var spriteNumero3;
var spriteNumero4;

var GAME_STATE = {
    MENU: 0,
    INPUT: 1,
    PLAYING: 2,
    END: 3
};
var currentState = GAME_STATE.MENU;

var playerName = "Jugador";
var score = 0;
var gameStartTime = 0;
var timeElapsed = 0;
var timerInterval = null;

var juegoTerminado = false;
var juegoGanado = false;

// Inicializa el juego y carga recursos
function CreateScene() {
    CargarSprites();
    InitGame();
}

// aqui configuro el estado para mostrar el menú
function InitGame() {
    currentState = GAME_STATE.MENU;
    document.getElementById('uimenu').classList.remove('hidden');
    document.getElementById('uiinput').classList.add('hidden');
    document.getElementById('uihud').classList.add('hidden');
    document.getElementById('uiend').classList.add('hidden');
}

// muestro la pantalla para que el jugador coloque el nombre
function ShowInput() {
    currentState = GAME_STATE.INPUT;
    document.getElementById('uimenu').classList.add('hidden');
    document.getElementById('uiinput').classList.remove('hidden');
}

// se guarda el nombre con la funcion y se comienza la partida
function InitGameFromInput() {
    var nameInput = document.getElementById('playername').value;
    if (nameInput.trim() !== "") {
        playerName = nameInput;
    }
    StartGame();
}

// aqui se inicia el juego
function StartGame() {
    currentState = GAME_STATE.PLAYING;
    document.getElementById('uiinput').classList.add('hidden');
    document.getElementById('uiend').classList.add('hidden');
    document.getElementById('uihud').classList.remove('hidden');

    document.getElementById('hud-name').innerText = playerName;

    score = 0;
    timeElapsed = 0;
    juegoTerminado = false;
    juegoGanado = false;
    UpdateHUD();

    if (timerInterval) clearInterval(timerInterval);
    gameStartTime = Date.now();
    timerInterval = setInterval(UpdateTimer, 1000);

    if (objects.length > 0) {
        LimpiarTableroDOM();
        objects = [];
    }

    CrearTablero();
    ColocarMinas();
    CalcularNumeros();
}

// aqui se limpia los elementos visuales del tablero anterior
function LimpiarTableroDOM() {
    var container = document.getElementById('minigame');
    var children = Array.from(container.children);
    children.forEach(child => {
        if (!child.classList.contains('overlay') && !child.classList.contains('hud')) {
            container.removeChild(child);
        }
    });
    sprites = [];
}

// Actualiza el tiempo transcurrido en pantalla (esta funcion la enseño javi el año pasado) 
function UpdateTimer() {
    if (currentState === GAME_STATE.PLAYING) {
        timeElapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        document.getElementById('hud-time').innerText = timeElapsed;
    }
}

// Actualiza la puntuación en pantalla
function UpdateHUD() {
    document.getElementById('hud-score').innerText = score;
}

// Reinicia el juego volviendo al inicio de menu
function RestartGame() {
    InitGame();
}

function StartObject(indice) {
}

function UpdateObject(indice) {
}

// maneja los clicks de las celdas
function OnObjectClicked(objeto) {
    if (currentState !== GAME_STATE.PLAYING || juegoTerminado) {
        return;
    }

    var fila = objeto.fila;
    var columna = objeto.columna;

    RevelarCelda(fila, columna);
}

function OnObjectCollision(objeto1, objeto2) {
}

function CargarSprites() {
}

// Crea los elementos visuales de las celdas
function CreateSpriteDiv() {
    var index = sprites.length;
    var div = document.createElement("div");

    div.style.position = "absolute";
    div.style.left = "0px";
    div.style.top = "0px";
    div.style.width = "0px";
    div.style.height = "0px";
    div.style.backgroundColor = "#151515ff";
    div.style.border = "2px outset #1f1f1fff";
    div.style.boxSizing = "border-box";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.fontWeight = "bold";
    div.style.fontSize = "20px";

    sprites.push(div);
    minigame.appendChild(div);

    return index;
}

// matriz lógica y visual del tablero la mas complicada para mi
function CrearTablero() {
    tablero = [];

    for (var fila = 0; fila < FILAS; fila++) {
        tablero[fila] = [];

        for (var columna = 0; columna < COLUMNAS; columna++) {
            var posX = TABLERO_X + (columna * TAMANIO_CELDA);
            var posY = TABLERO_Y + (fila * TAMANIO_CELDA);

            var indiceCelda = CreateObject(
                "celda_" + fila + "_" + columna,
                "celda",
                posX,
                posY,
                TAMANIO_CELDA,
                TAMANIO_CELDA
            );

            var objetoCelda = GetObject(indiceCelda);

            objetoCelda.fila = fila;
            objetoCelda.columna = columna;

            var divCelda = document.createElement("div");
            divCelda.style.position = "absolute";
            divCelda.style.left = posX + "px";
            divCelda.style.top = posY + "px";
            divCelda.style.width = TAMANIO_CELDA + "px";
            divCelda.style.height = TAMANIO_CELDA + "px";
            divCelda.style.backgroundColor = "#bbb";
            divCelda.style.border = "2px outset #ddd";
            divCelda.style.boxSizing = "border-box";
            divCelda.style.display = "flex";
            divCelda.style.alignItems = "center";
            divCelda.style.justifyContent = "center";
            divCelda.style.fontWeight = "bold";
            divCelda.style.fontSize = "80px";
            divCelda.style.cursor = "pointer";

            minigame.appendChild(divCelda);

            var indiceSprite = sprites.length;
            sprites.push(divCelda);

            objetoCelda.sprite = indiceSprite;

            tablero[fila][columna] = {
                objeto: objetoCelda,
                divCelda: divCelda,
                tieneMina: false,
                revelada: false,
                numeroMinasVecinas: 0
            };
        }
    }
}

// Coloca las minas aleatoriamente en el tablero
function ColocarMinas() {
    var minasColocadas = 0;

    while (minasColocadas < NUMERO_DE_MINAS) {
        var filaAleatoria = UtilsRandomRangeInt(0, FILAS);
        var columnaAleatoria = UtilsRandomRangeInt(0, COLUMNAS);

        if (!tablero[filaAleatoria][columnaAleatoria].tieneMina) {
            tablero[filaAleatoria][columnaAleatoria].tieneMina = true;
            minasColocadas++;
        }
    }
}

// Calcula cuántas minas hay alrededor de cada celda
function CalcularNumeros() {
    for (var fila = 0; fila < FILAS; fila++) {
        for (var columna = 0; columna < COLUMNAS; columna++) {
            if (tablero[fila][columna].tieneMina) {
                continue;
            }

            var minasVecinas = ContarMinasVecinas(fila, columna);
            tablero[fila][columna].numeroMinasVecinas = minasVecinas;
        }
    }
}

// Cuenta las minas vecinas a una posición dada
function ContarMinasVecinas(fila, columna) {
    var contador = 0;

    for (var deltaFila = -1; deltaFila <= 1; deltaFila++) {
        for (var deltaColumna = -1; deltaColumna <= 1; deltaColumna++) {
            if (deltaFila === 0 && deltaColumna === 0) {
                continue;
            }

            var filaVecina = fila + deltaFila;
            var columnaVecina = columna + deltaColumna;

            if (EsCeldaValida(filaVecina, columnaVecina)) {
                if (tablero[filaVecina][columnaVecina].tieneMina) {
                    contador++;
                }
            }
        }
    }

    return contador;
}

// Verifica si las coordenadas están dentro del tablero
function EsCeldaValida(fila, columna) {
    return fila >= 0 && fila < FILAS && columna >= 0 && columna < COLUMNAS;
}

// Previene el menú contextual del navegador
function banderita() {
    addEventListener("contexmenu", (e) => {
        e.preventDefault();
    })
}

// Revela el contenido de una celda y maneja puntuación
function RevelarCelda(fila, columna) {
    var celda = tablero[fila][columna];

    if (celda.revelada) {
        return;
    }

    celda.revelada = true;

    if (celda.tieneMina) {
        MostrarMina(fila, columna);
        PerderJuego();
        return;
    }

    if (celda.numeroMinasVecinas === 0) {
        MostrarCeldaVacia(fila, columna);
        RevelarCeldasVecinas(fila, columna);
        score += 10;
    }
    else {
        MostrarNumero(fila, columna, celda.numeroMinasVecinas);
        score += 10 * celda.numeroMinasVecinas;
    }

    UpdateHUD();
    VerificarVictoria();
}

// Revela recursivamente las celdas vacías adyacentes
function RevelarCeldasVecinas(fila, columna) {
    for (var deltaFila = -1; deltaFila <= 1; deltaFila++) {
        for (var deltaColumna = -1; deltaColumna <= 1; deltaColumna++) {
            if (deltaFila === 0 && deltaColumna === 0) {
                continue;
            }
            var filaVecina = fila + deltaFila;
            var columnaVecina = columna + deltaColumna;

            if (EsCeldaValida(filaVecina, columnaVecina)) {
                RevelarCelda(filaVecina, columnaVecina);
            }
        }
    }
}

// Comprueba si el jugador ha ganado
function VerificarVictoria() {
    var celdasSinMinaReveladas = 0;
    var totalCeldasSinMina = (FILAS * COLUMNAS) - NUMERO_DE_MINAS;

    for (var fila = 0; fila < FILAS; fila++) {
        for (var columna = 0; columna < COLUMNAS; columna++) {
            var celda = tablero[fila][columna];
            if (!celda.tieneMina && celda.revelada) {
                celdasSinMinaReveladas++;
            }
        }
    }

    if (celdasSinMinaReveladas === totalCeldasSinMina) {
        GanarJuego();
    }
}

// Muestra la pantalla de Game Over y detiene el juego
function GameOver(ganado) {
    currentState = GAME_STATE.END;
    juegoTerminado = true;
    juegoGanado = ganado;
    if (timerInterval) clearInterval(timerInterval);

    var endTitle = document.getElementById('end-title');
    var endMessage = document.getElementById('end-message');
    var endScore = document.getElementById('end-score');
    var endTime = document.getElementById('end-time');

    if (ganado) {
        endTitle.innerText = "¡FELICIDADES!";
        endTitle.style.color = "#4CAF50";
        endMessage.innerText = "Has completado el campo de minas.";
        score += 1000;
    } else {
        endTitle.innerText = "GAME OVER";
        endTitle.style.color = "#ff4444";
        endMessage.innerText = "Has detonado una mina.";
    }

    endScore.innerText = score;
    endTime.innerText = timeElapsed + "s";

    setTimeout(() => {
        document.getElementById('uiend').classList.remove('hidden');
    }, 1500);
}

//  cuando el jugador pierde
function PerderJuego() {
    for (var fila = 0; fila < FILAS; fila++) {
        for (var columna = 0; columna < COLUMNAS; columna++) {
            var celda = tablero[fila][columna];
            if (celda.tieneMina) {
                MostrarMina(fila, columna);
            }
        }
    }
    alert("¡GAME OVER! Has clickeado una mina.");
    GameOver(false);
}

//  cuando el jugador gana
function GanarJuego() {
    alert("¡FELICIDADES! Has ganado el juego.");
    GameOver(true);
}

//  celdas vacía
function MostrarCeldaVacia(fila, columna) {
    var celda = tablero[fila][columna];
    var div = celda.divCelda;

    div.style.backgroundColor = "#e0e0e0";
    div.style.border = "1px solid #999";
    div.innerHTML = "";
}

// muestra la mina
function MostrarMina(fila, columna) {
    var celda = tablero[fila][columna];
    var div = celda.divCelda;

    div.style.backgroundColor = "#ff4444";
    div.style.border = "2px solid #cc0000";
    div.innerHTML = "💣";
    div.style.fontSize = "24px";
}


function MostrarNumero(fila, columna, numero) {
    var celda = tablero[fila][columna];
    var div = celda.divCelda;

    div.style.backgroundColor = "#e0e0e0";
    div.style.border = "1px solid #999";
    div.innerHTML = numero;
    div.style.fontSize = "20px";
    div.style.fontWeight = "bold";

    var colores = ["", "#0000ff", "#008000", "#ff0000", "#000080", "#800000", "#008080", "#000000", "#808080"];
    div.style.color = colores[numero];
}
