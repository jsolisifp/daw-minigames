////////////////////////////
// CONFIGURACIÓN GENERAL //
//////////////////////////

var CARD_ROWS = 4;
var CARD_COLS = 4;
var CARD_WIDTH = 120;
var CARD_HEIGHT = 160;
var CARD_MARGIN = 10;

var GAME_TIME_LIMIT_SEC = 60;

//--------------------------- imágenes ---------------------------/
var cardImageBack = "card_back.png";
var cardImageFronts = [
  "card_1.png",
  "card_2.png",
  "card_3.png",
  "card_4.png",
  "card_5.png",
  "card_6.png",
  "card_7.png",
  "card_8.png",
];

////////////////////////////
// ESTADO DEL JUEGO      //
//////////////////////////

var cards = [];
var firstCard = null;
var secondCard = null;
var gameState = "idle";
var revealTimerMs = 0;

var matchedPairs = 0;
var moves = 0;

var remainingTimeMs = 0;
var isTimerRunning = false;
var loopIntervalId = null;

var currentScreen = "welcome";
var bestRecordMs = null;

var playerName = "";

// Leaderboard (localStorage)
var LEADERBOARD_KEY = "memoryLeaderboard_v1";
var leaderboard = []; // array donde meto { name, timeMs, moves, ts } para mostrarr en el leaderboard

////////////////////////////
// AUDIO                 //
//////////////////////////

var sfxEnabled = true;
var musicEnabled = true;
var bgm = null;
var sfxFlip = null;
var sfxMatch = null;
var sfxWin = null;
var sfxLose = null;

////////////////////////////
// REFERENCIAS DOM       //
//////////////////////////

var dom = {};

window.addEventListener("load", function () {
  dom.screenWelcome = document.getElementById("screen-welcome");
  dom.screenGame = document.getElementById("screen-game");
  dom.screenResults = document.getElementById("screen-results");
  dom.screenLeaderboard = document.getElementById("screen-leaderboard");

  dom.inputPlayerName = document.getElementById("player-name");

  dom.hudTime = document.getElementById("hud-time");
  dom.hudMoves = document.getElementById("hud-moves");
  dom.hudRecord = document.getElementById("hud-record");

  dom.resultsTitle = document.getElementById("results-title");
  dom.resultsStats = document.getElementById("results-stats");
  dom.resultsRecord = document.getElementById("results-record");

  dom.btnStart = document.getElementById("btn-start");
  dom.btnAgain = document.getElementById("btn-again");
  dom.btnMenu = document.getElementById("btn-menu");
  dom.btnResultsLeaderboard = document.getElementById(
    "btn-results-leaderboard"
  );

  dom.btnLeaderboard = document.getElementById("btn-leaderboard");
  dom.btnLeaderboardBack = document.getElementById("btn-leaderboard-back");
  dom.btnClearLeaderboard = document.getElementById("btn-clear-leaderboard");

  dom.btnGameMenu = document.getElementById("btn-game-menu");
  dom.btnGameLeaderboard = document.getElementById("btn-game-leaderboard");

  dom.leaderboardList = document.getElementById("leaderboard-list");
  dom.leaderboardMini = document.getElementById("leaderboard-mini");

  dom.btnSound = document.getElementById("btn-sound");

  // Eventos
  dom.btnStart.addEventListener("click", startGame);
  dom.btnAgain.addEventListener("click", startGame);

  dom.btnMenu.addEventListener("click", function () {
    stopGameAndMusic();
    showScreen("welcome");
  });

  dom.btnResultsLeaderboard.addEventListener("click", function () {
    showScreen("leaderboard");
  });

  dom.btnLeaderboard.addEventListener("click", function () {
    showScreen("leaderboard");
  });

  dom.btnLeaderboardBack.addEventListener("click", function () {
    showScreen("welcome");
  });

  dom.btnClearLeaderboard.addEventListener("click", function () {
    clearLeaderboard();
  });

  dom.btnGameMenu.addEventListener("click", function () {
    stopGameAndMusic();
    showScreen("welcome");
  });

  dom.btnGameLeaderboard.addEventListener("click", function () {
    showScreen("leaderboard");
  });

  //musicaaaa soundtracj y efectos

  dom.btnMusic = document.getElementById("btn-music");

  if (dom.btnMusic) {
    dom.btnMusic.addEventListener("click", toggleMusic);
  }

  dom.btnSound.addEventListener("click", toggleSfx);

  // Audio
  setupAudio();
  loadRecordFromCookie();
  loadLeaderboardFromStorage();

  // leaderboards
  renderLeaderboard();
  renderMiniLeaderboard();

  // HUD
  updateHUD();
  startGlobalLoop();


  window.addEventListener("resize", function () {
    if (currentScreen === "game") {
      layoutCardsCentered();
    }
  });

  if (dom.btnMusic) dom.btnMusic.textContent = musicEnabled ? "🎵" : "🚫";
  if (dom.btnSound) dom.btnSound.textContent = sfxEnabled ? "🔊" : "🔇";
});

////////////////////////////
// UTILIDADES            //
//////////////////////////

function getRandInt(minInclusive, maxExclusive) {
  if (typeof UtilsRandomRangeInt === "function") {
    return UtilsRandomRangeInt(minInclusive, maxExclusive);
  }
  return (
    Math.floor(Math.random() * (maxExclusive - minInclusive)) + minInclusive
  );
}

function stopGameAndMusic() {
  isTimerRunning = false;
  gameState = "idle";
  revealTimerMs = 0;
  firstCard = null;
  secondCard = null;

  if (bgm) bgm.pause();
}

//////////////////////////
// CENTRADO DE CARTAS  //
////////////////////////

function layoutCardsCentered() {
  var container = document.getElementById("minigame");
  if (!container) return;

  var cw = container.clientWidth;
  var ch = container.clientHeight;

  if (cw <= 0 || ch <= 0) return;

  var totalWidth = CARD_COLS * CARD_WIDTH + (CARD_COLS - 1) * CARD_MARGIN;
  var totalHeight = CARD_ROWS * CARD_HEIGHT + (CARD_ROWS - 1) * CARD_MARGIN;

  var startX = Math.floor((cw - totalWidth) / 2);
  var startY = Math.floor((ch - totalHeight) / 2);

  if (startX < 0) startX = 0;
  if (startY < 0) startY = 0;

  for (var i = 0; i < cards.length; i++) {
    var row = Math.floor(i / CARD_COLS);
    var col = i % CARD_COLS;

    var x = startX + col * (CARD_WIDTH + CARD_MARGIN);
    var y = startY + row * (CARD_HEIGHT + CARD_MARGIN);

    var o = GetObject(cards[i]);

    o.posX = x;
    o.posY = y;

    // El motor usa width/height
    o.width = CARD_WIDTH;
    o.height = CARD_HEIGHT;
  }
}

////////////////////////////
// HOOKS DEL MINIENGINE  //
//////////////////////////

function CreateScene() {
  var container = document.getElementById("minigame");
  var cw = container ? container.clientWidth : 0;
  var ch = container ? container.clientHeight : 0;
  if (cw <= 0) cw = 620;
  if (ch <= 0) ch = 620;

  var totalWidth = CARD_COLS * CARD_WIDTH + (CARD_COLS - 1) * CARD_MARGIN;
  var totalHeight = CARD_ROWS * CARD_HEIGHT + (CARD_ROWS - 1) * CARD_MARGIN;

  var startX = (cw - totalWidth) / 2;
  var startY = (ch - totalHeight) / 2;

  var index = 0;
  for (var row = 0; row < CARD_ROWS; row++) {
    for (var col = 0; col < CARD_COLS; col++) {
      var x = startX + col * (CARD_WIDTH + CARD_MARGIN);
      var y = startY + row * (CARD_HEIGHT + CARD_MARGIN);

      var objectIndex = CreateObject(
        "card" + index,
        "card",
        x,
        y,
        CARD_WIDTH,
        CARD_HEIGHT
      );
      var o = GetObject(objectIndex);

      o.value = 0;
      o.isRevealed = false;
      o.isMatched = false;

      var spriteIndex = CreateSprite(cardImageBack);
      o.sprite = spriteIndex;
      var img = GetSprite(o.sprite);
      img.src = "images/" + cardImageBack;

      cards.push(objectIndex);
      index++;
    }
  }
}

function StartObject(index) {}
function UpdateObject(index) {}

function OnObjectClicked(o) {
  if (currentScreen !== "game") return;
  if (o.type !== "card") return;
  if (!isTimerRunning) return;
  if (gameState === "checking") return;
  if (o.isMatched || o.isRevealed) return;

  revealCard(o);
  playSfx(sfxFlip);

  if (firstCard === null) {
    firstCard = o;
  } else if (secondCard === null) {
    secondCard = o;
    gameState = "checking";
    revealTimerMs = 800;
    moves++;
    updateHUD();
  }
}

function OnObjectCollision(o1, o2) {}

///////////////////////////
// LÓGICA PRINCIPAL      //
///////////////////////////

function startGame() {

  // vuelve a pedir nombre si no hay y deja si ya lo tengo
  var typed = (dom.inputPlayerName?.value || "").trim();
  if (typed) playerName = typed;

  if (!playerName) {
    alert("Introduce tu nombre para empezar.");
    return;
  }

  resetBoardValues();

  matchedPairs = 0;
  moves = 0;
  remainingTimeMs = GAME_TIME_LIMIT_SEC * 1000;
  isTimerRunning = true;
  gameState = "idle";
  revealTimerMs = 0;
  firstCard = null;
  secondCard = null;

  updateHUD();
  showScreen("game");

  requestAnimationFrame(function () {
    layoutCardsCentered();
  });

  if (musicEnabled && bgm) {
    bgm.currentTime = 0;
    bgm.play();
  }
}

function resetBoardValues() {
  // 0..7 duplicados
  var values = [];
  for (var i = 0; i < 8; i++) {
    values.push(i);
    values.push(i);
  }

  // barajar
  for (var k = values.length - 1; k > 0; k--) {
    var j = getRandInt(0, k + 1);
    var tmp = values[k];
    values[k] = values[j];
    values[j] = tmp;
  }

  // Asignación y reset visual
  for (var c = 0; c < cards.length; c++) {
    var idx = cards[c];
    var o = GetObject(idx);

    o.value = values[c];
    o.isMatched = false;
    o.isRevealed = false;

    var img = GetSprite(o.sprite);
    img.src = "images/" + cardImageBack;
    img.style.opacity = "1";
  }
}

function revealCard(o) {
  var img = GetSprite(o.sprite);
  img.src = "images/" + cardImageFronts[o.value];
  o.isRevealed = true;
}

function hideCard(o) {
  var img = GetSprite(o.sprite);
  img.src = "images/" + cardImageBack;
  o.isRevealed = false;
}

function finishCheck() {
  if (!firstCard || !secondCard) {
    gameState = "idle";
    return;
  }

  if (firstCard.value === secondCard.value) {
    firstCard.isMatched = true;
    secondCard.isMatched = true;

    GetSprite(firstCard.sprite).style.opacity = "0.35";
    GetSprite(secondCard.sprite).style.opacity = "0.35";

    matchedPairs++;
    playSfx(sfxMatch);

    if (matchedPairs === 8) {
      endGame(true);
    }
  } else {
    hideCard(firstCard);
    hideCard(secondCard);
  }

  firstCard = null;
  secondCard = null;
  gameState = "idle";
}

function endGame(won) {
  if (!isTimerRunning && currentScreen === "results") return;

  isTimerRunning = false;

  if (bgm) bgm.pause();
  if (won) playSfx(sfxWin);
  else playSfx(sfxLose);

  var usedMs = GAME_TIME_LIMIT_SEC * 1000 - remainingTimeMs;
  if (usedMs < 0) usedMs = 0;

  var usedSec = Math.round(usedMs / 100) / 10;

  if (won) {
    dom.resultsTitle.textContent = "Has ganado";
    dom.resultsStats.textContent =
      "Jugador: " +
      playerName +
      " | Movimientos: " +
      moves +
      " | Tiempo: " +
      usedSec +
      " s";
  } else {
    dom.resultsTitle.textContent = "Tiempo agotado";
    dom.resultsStats.textContent =
      "Jugador: " +
      playerName +
      " | Parejas: " +
      matchedPairs +
      " | Movimientos: " +
      moves;
  }

  // el  mejor tiempo
  var recordMsg = "";
  if (won) {
    if (bestRecordMs === null || usedMs < bestRecordMs) {
      bestRecordMs = usedMs;
      saveRecordToCookie();
      recordMsg = "Nuevo récord: " + formatRecord(bestRecordMs);
    } else {
      recordMsg = "Récord: " + formatRecord(bestRecordMs);
    }
  } else {
    recordMsg =
      bestRecordMs !== null
        ? "Récord: " + formatRecord(bestRecordMs)
        : "Sin récord aún";
  }
  dom.resultsRecord.textContent = recordMsg;

  // Guardar puntuacion en leaderboard cuando se ganaa
  if (won) {
    addLeaderboardEntry({
      name: playerName,
      timeMs: usedMs,
      moves: moves,
      ts: Date.now(),
    });
  }

  // Actualizar vistas
  updateHUD();
  renderLeaderboard();
  renderMiniLeaderboard();

  showScreen("results");
}

///////////////
// (TIMERS) //
/////////////

function startGlobalLoop() {
  if (loopIntervalId !== null) return;

  loopIntervalId = setInterval(function () {

    // Comprobación de cartas
    if (gameState === "checking" && revealTimerMs > 0) {
      revealTimerMs -= 100;
      if (revealTimerMs <= 0) {
        revealTimerMs = 0;
        finishCheck();
      }
    }

    // Temporizador
    if (currentScreen === "game" && isTimerRunning) {
      remainingTimeMs -= 100;
      if (remainingTimeMs <= 0) {
        remainingTimeMs = 0;
        updateHUD();
        endGame(false);
      } else {
        updateHUD();
      }
    }
  }, 100);
}

////////////////////////////
//     UI / PANTALLAS    //
//////////////////////////

function showScreen(name) {
  currentScreen = name;

  dom.screenWelcome.classList.remove("active");
  dom.screenGame.classList.remove("active");
  dom.screenResults.classList.remove("active");
  dom.screenLeaderboard.classList.remove("active");

  if (name === "welcome") dom.screenWelcome.classList.add("active");
  if (name === "game") dom.screenGame.classList.add("active");
  if (name === "results") dom.screenResults.classList.add("active");
  if (name === "leaderboard") dom.screenLeaderboard.classList.add("active");

  // refresca leaderboard completoa
  if (name === "leaderboard") {
    renderLeaderboard();
  }
  // refresca mini-leaderboard y centra cartasn
  if (name === "game") {
    renderMiniLeaderboard();

    requestAnimationFrame(function () {
      layoutCardsCentered();
    });
  }
}

function updateHUD() {
  if (dom.hudTime) {
    var secs = Math.ceil(remainingTimeMs / 1000);
    if (!isFinite(secs) || secs < 0) secs = GAME_TIME_LIMIT_SEC;
    dom.hudTime.textContent = secs;
  }
  if (dom.hudMoves) dom.hudMoves.textContent = moves;

  var recordText = bestRecordMs !== null ? formatRecord(bestRecordMs) : "--";
  if (dom.hudRecord) dom.hudRecord.textContent = recordText;
}

function formatRecord(ms) {
  var s = Math.round(ms / 100) / 10;
  return s + " s";
}

function formatEntry(entry) {
  var s = Math.round(entry.timeMs / 100) / 10;
  return entry.name + " — " + s + "s — " + entry.moves + " mov";
}

////////////////////////////
// LEADERBOARD (TOP 10)  //
//////////////////////////

function loadLeaderboardFromStorage() {
  try {
    var raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      leaderboard = [];
      return;
    }
    var parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) leaderboard = parsed;
    else leaderboard = [];
  } catch (e) {
    leaderboard = [];
  }
}

function saveLeaderboardToStorage() {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  } catch (e) {}
}

function sortLeaderboard() {
  leaderboard.sort(function (a, b) {
    if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs; // menor tiempo mejor
    if (a.moves !== b.moves) return a.moves - b.moves; // empate: menos movimientos
    return a.ts - b.ts; // empate: más antiguo primero
  });
}

function addLeaderboardEntry(entry) {
  loadLeaderboardFromStorage();
  leaderboard.push(entry);
  sortLeaderboard();

  // Top 10
  if (leaderboard.length > 10) {
    leaderboard = leaderboard.slice(0, 10);
  }

  saveLeaderboardToStorage();
}

function renderLeaderboard() {
  if (!dom.leaderboardList) return;

  loadLeaderboardFromStorage();
  sortLeaderboard();

  dom.leaderboardList.innerHTML = "";

  if (leaderboard.length === 0) {
    var li = document.createElement("li");
    li.textContent = "— No hay puntuaciones todavía —";
    dom.leaderboardList.appendChild(li);
    return;
  }

  for (var i = 0; i < leaderboard.length; i++) {
    var li2 = document.createElement("li");
    li2.textContent = i + 1 + ". " + formatEntry(leaderboard[i]);
    dom.leaderboardList.appendChild(li2);
  }
}

function renderMiniLeaderboard() {
  if (!dom.leaderboardMini) return;

  loadLeaderboardFromStorage();
  sortLeaderboard();

  dom.leaderboardMini.innerHTML = "";

  var limit = 5;
  if (leaderboard.length === 0) {
    for (var k = 0; k < limit; k++) {
      var li0 = document.createElement("li");
      li0.textContent = "—";
      dom.leaderboardMini.appendChild(li0);
    }
    return;
  }

  for (var j = 0; j < Math.min(limit, leaderboard.length); j++) {
    var li3 = document.createElement("li");
    li3.textContent = j + 1 + ". " + formatEntry(leaderboard[j]);
    dom.leaderboardMini.appendChild(li3);
  }

  for (var r = leaderboard.length; r < limit; r++) {
    var liF = document.createElement("li");
    liF.textContent = "—";
    dom.leaderboardMini.appendChild(liF);
  }
}

function clearLeaderboard() {
  leaderboard = [];
  saveLeaderboardToStorage();
  renderLeaderboard();
  renderMiniLeaderboard();
}

///////////////
// SONIDO   //
/////////////

function setupAudio() {
  bgm = new Audio("audio/soundtrack.mp3");
  bgm.loop = true;

  sfxFlip = new Audio("audio/flip.mp3");
  sfxMatch = new Audio("audio/match.mp3");
  sfxLose = new Audio("audio/lose.mp3");
  sfxWin = new Audio("audio/win.mp3");
}

function toggleMusic() {
  musicEnabled = !musicEnabled;

  if (!musicEnabled) {
    if (bgm) bgm.pause();
    if (dom.btnMusic) dom.btnMusic.textContent = "🚫";
  } else {
    // solo reproducir si estamos jugando
    if (currentScreen === "game" && isTimerRunning && bgm) {
      bgm.play();
    }
    if (dom.btnMusic) dom.btnMusic.textContent = "🎵";
  }
}

function toggleSfx() {
  sfxEnabled = !sfxEnabled;

  if (!sfxEnabled) {
    if (dom.btnSound) {
      dom.btnSound.classList.add("muted");
      dom.btnSound.textContent = "🔇";
    }
  } else {
    if (dom.btnSound) {
      dom.btnSound.classList.remove("muted");
      dom.btnSound.textContent = "🔊";
    }
  }
}

function playSfx(audio) {
  if (!sfxEnabled || !audio) return;
  try {
    audio.currentTime = 0;
    audio.play();
  } catch (e) {}
}

//////////////
// COOKIES //
////////////

function loadRecordFromCookie() {
  var match = document.cookie.match(/memoryRecordMs=(\d+)/);
  if (match) bestRecordMs = parseInt(match[1], 10);
}

function saveRecordToCookie() {
  if (bestRecordMs === null) return;
  document.cookie =
    "memoryRecordMs=" +
    bestRecordMs +
    "; max-age=31536000; path=/; SameSite=Lax";
}
