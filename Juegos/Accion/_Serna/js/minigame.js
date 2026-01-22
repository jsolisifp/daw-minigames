////////////////////////////
// CONFIGURACION GENERAL  //
///////////////////////////

var GAME_TIME_STEP = 1 / 30;
var DINO_WIDTH = 46;
var DINO_HEIGHT = 46;
var GROUND_HEIGHT = 26;
var HITBOX_SHRINK_PX = 0;

var BASE_SPEED = 260;
var SPEED_GROWTH = 0.02;
var JUMP_SPEED = 340;

var OBSTACLE_TYPES = [
  {
    sprite: "cactus_small.png",
    width: 54,
    height: 70,
    unlockAt: 0,
    yOffset: 0,
  },
  {
    sprite: "cactus_tall.png",
    width: 78,
    height: 96,
    unlockAt: 8,
    yOffset: 0,
  },
  {
    sprite: "spikes.png",
    width: 56,
    height: 40,
    unlockAt: 14,
    yOffset: 0,
  },
  {
    sprite: "bones.png",
    width: 64,
    height: 36,
    unlockAt: 18,
    yOffset: 0,
  },
  {
    sprite: "rockpile.png",
    width: 72,
    height: 52,
    unlockAt: 22,
    yOffset: 0,
  },
  {
    sprite: "bird.png",
    width: 52,
    height: 40,
    unlockAt: 26,
    yOffset: -50,
  },
];

var DINO_RUN_FRAMES = [
  "move_0.png",
  "move_1.png",
  "move_2.png",
  "move_3.png",
];
var DINO_JUMP_FRAMES = ["jump_0.png", "jump_1.png", "jump_2.png", "jump_3.png"];
var DINO_DEAD_FRAMES = [
  "dead_0.png",
  "dead_1.png",
  "dead_2.png",
  "dead_3.png",
  "dead_4.png",
];
var DINO_HURT_FRAMES = [
  "hurt_0.png",
  "hurt_1.png",
  "hurt_2.png",
  "hurt_3.png",
];

////////////////////////////
// ESTADO DEL JUEGO       //
///////////////////////////

var worldWidth = 900;
var worldHeight = 360;
var groundY = 280;

var dinoIndex = -1;
var groundIndex = -1;
var controllerIndex = -1;

var obstacles = [];

var gameState = "welcome";
var isRunning = false;
var isGrounded = false;

var timeAlive = 0;
var speedMultiplier = 1;
var spawnTimer = 0;
var maxLives = 3;
var lives = 3;
var invulnTimer = 0;
var invulnActive = false;
var pendingObstacleDisable = false;
var maxJumps = 2;
var jumpsUsed = 0;

var currentAnim = "run";
var animTimer = 0;
var animFrame = 0;
var hurtTimer = 0;

var playerName = "";
var bestRecord = 0;

// leaderboard
var LEADERBOARD_KEY = "dinoLeaderboard_v1";
var leaderboard = [];

// debug hitboxes
var debugHitboxes = false;

////////////////////////////
// AUDIO                  //
///////////////////////////

var sfxJump = null;
var sfxHit = null;
var sfxLose = null;
var bgm = null;
var musicEnabled = true;

////////////////////////////
// REFERENCIAS DOM        //
///////////////////////////

var dom = {};

window.addEventListener("load", function () {
  dom.screenWelcome = document.getElementById("screen-welcome");
  dom.screenGame = document.getElementById("screen-game");
  dom.screenResults = document.getElementById("screen-results");
  dom.screenLeaderboard = document.getElementById("screen-leaderboard");

  dom.inputPlayerName = document.getElementById("player-name");

  dom.btnStart = document.getElementById("btn-start");
  dom.btnAgain = document.getElementById("btn-again");
  dom.btnMenu = document.getElementById("btn-menu");
  dom.btnResultsLeaderboard = document.getElementById(
    "btn-results-leaderboard"
  );

  dom.btnLeaderboardBack = document.getElementById("btn-leaderboard-back");

  dom.btnGameMenu = document.getElementById("btn-game-menu");
  dom.btnMusic = document.getElementById("btn-music");

  dom.hudScore = document.getElementById("hud-score");
  dom.hudRecord = document.getElementById("hud-record");
  dom.hudTime = document.getElementById("hud-time");
  dom.hudLives = document.getElementById("hud-lives");

  dom.leaderboardList = document.getElementById("leaderboard-list");

  dom.resultsTitle = document.getElementById("results-title");
  dom.resultsStats = document.getElementById("results-stats");
  dom.resultsRecord = document.getElementById("results-record");

  dom.btnStart.addEventListener("click", startGame);
  dom.btnAgain.addEventListener("click", startGame);

  dom.btnMenu.addEventListener("click", function () {
    stopGame();
    showScreen("welcome");
  });

  dom.btnResultsLeaderboard.addEventListener("click", function () {
    showScreen("leaderboard");
  });

  dom.btnLeaderboardBack.addEventListener("click", function () {
    showScreen("welcome");
  });


  dom.btnGameMenu.addEventListener("click", function () {
    stopGame();
    showScreen("welcome");
  });

  if (dom.btnMusic) {
    dom.btnMusic.addEventListener("click", toggleMusic);
  }

  window.addEventListener("resize", function () {
    layoutScene();
  });

  loadLeaderboardFromStorage();
  bestRecord = getBestRecord();
  renderLeaderboard();
  updateHUD();

  setupAudio();
  renderLives();
});

////////////////////////////
// HOOKS DEL MINIENGINE   //
///////////////////////////

function CreateScene() {
  controllerIndex = CreateObject("controller", "controller", 0, 0, 0, 0);

  dinoIndex = CreateObject("dino", "dino", 120, 0, DINO_WIDTH, DINO_HEIGHT);
  var dino = GetObject(dinoIndex);
  dino.sprite = CreateSprite(DINO_RUN_FRAMES[0]);
  dino.collider = CreateCollider(bodyTypeDynamic, true);

  groundIndex = CreateObject("ground", "ground", 0, 0, worldWidth, GROUND_HEIGHT);
  var ground = GetObject(groundIndex);
  ground.collider = CreateCollider(bodyTypeKinematic, false);

  layoutScene();
}

function StartObject(index) {}

function UpdateObject(index) {
  var o = GetObject(index);

  if (o.type === "controller") {
    updateController();
    return;
  }

  if (o.type === "dino") {
    updateDino(o);
    return;
  }

  if (o.type === "obstacle") {
    updateObstacle(o);
  }
}

function OnObjectClicked(o) {}

function OnObjectCollision(o1, o2) {
  if (o1.type === "dino" && o2.type === "ground") {
    isGrounded = true;
    var dino = GetObject(dinoIndex);
    var collider = GetCollider(dino.collider);
    collider.speedY = 0;
    dino.posY = groundY - dino.height;
  }

  if (
    o1.type === "dino" &&
    o2.type === "obstacle" &&
    isRunning &&
    gameState === "game" &&
    o2.active &&
    invulnTimer <= 0
  ) {
    handleHit();
  }
}

////////////////////////////
// LOGICA PRINCIPAL       //
///////////////////////////

function updateController() {
  if (gameState === "welcome" && inputFireDown) {
    startGame();
    return;
  }

  if (!isRunning || gameState !== "game") return;

  timeAlive += GAME_TIME_STEP;
  speedMultiplier = 1 + timeAlive * SPEED_GROWTH;

  updateDebugBoxes();

  if (pendingObstacleDisable) {
    setObstacleCollidersEnabled(false);
    invulnActive = true;
    pendingObstacleDisable = false;
  }

  if (invulnActive && invulnTimer <= 0) {
    setObstacleCollidersEnabled(true);
    invulnActive = false;
  }

  spawnTimer -= GAME_TIME_STEP;
  if (spawnTimer <= 0) {
    spawnObstacle();
    var minGap = Math.max(0.8, 1.6 - timeAlive * 0.01);
    var maxGap = Math.max(1.2, 2.2 - timeAlive * 0.01);
    spawnTimer = randomRange(minGap, maxGap);
  }

  updateHUD();
  renderLives();
}

function updateDino(dino) {
  if (hurtTimer > 0) {
    hurtTimer -= GAME_TIME_STEP;
  }
  if (invulnTimer > 0) {
    invulnTimer -= GAME_TIME_STEP;
  }

  if (isRunning && gameState === "game") {
    if (inputFireDown && jumpsUsed < maxJumps) {
      var collider = GetCollider(dino.collider);
      collider.speedY = -JUMP_SPEED;
      isGrounded = false;
      jumpsUsed += 1;
      playSfx(sfxJump);
    }
  }

  var dinoCollider = GetCollider(dino.collider);
  if (dino.posY >= groundY - dino.height && dinoCollider.speedY >= 0) {
    isGrounded = true;
    dinoCollider.speedY = 0;
    dino.posY = groundY - dino.height;
    jumpsUsed = 0;
  }

  updateDinoAnimation(dino);
}

function updateObstacle(o) {
  if (!o.active || !isRunning) return;

  var moveSpeed = BASE_SPEED * speedMultiplier;
  o.posX -= moveSpeed * GAME_TIME_STEP;

  var entry = obstacles[o.linkIndex];
  if (entry) {
    var spriteObj = GetObject(entry.spriteObjIndex);
    if (spriteObj) {
      spriteObj.posX = o.posX - entry.shrink;
      spriteObj.posY = o.posY - entry.shrink;
      spriteObj.width = entry.spriteWidth;
      spriteObj.height = entry.spriteHeight;
    }
  }

  if (o.posX + o.width < -40) {
    o.active = false;
    if (entry) {
      entry.active = false;
      var spriteObj2 = GetObject(entry.spriteObjIndex);
      if (spriteObj2 && spriteObj2.sprite >= 0) {
        HideSprite(spriteObj2.sprite);
      }
    }
  }
}

function updateDebugBoxes() {
  if (!debugHitboxes) return;
  var container = document.getElementById("minigame");
  if (!container) return;

  for (var i = 0; i < objects.length; i++) {
    var o = objects[i];
    if (o.type !== "dino" && o.type !== "obstacle") continue;
    if (o.type === "obstacle" && !o.active) {
      if (o.debugEl) o.debugEl.style.display = "none";
      continue;
    }
    ensureDebugBox(o, container);
    o.debugEl.style.display = "block";
    var box = getHitbox(o);
    o.debugEl.style.left = box.x + "px";
    o.debugEl.style.top = box.y + "px";
    o.debugEl.style.width = box.w + "px";
    o.debugEl.style.height = box.h + "px";
  }
}

function ensureDebugBox(o, container) {
  if (o.debugEl) return;
  var el = document.createElement("div");
  el.style.position = "absolute";
  el.style.border = "2px solid rgba(239, 68, 68, 0.8)";
  el.style.pointerEvents = "none";
  el.style.boxSizing = "border-box";
  el.style.zIndex = "3";
  container.appendChild(el);
  o.debugEl = el;
}

function getHitbox(o) {
  return {
    x: o.posX,
    y: o.posY,
    w: Math.max(4, o.width),
    h: Math.max(4, o.height),
  };
}

function handleHit() {
  if (!isRunning || gameState === "over") return;

  lives -= 1;
  hurtTimer = 0.5;
  invulnTimer = 1.0;
  if (lives > 0 && !invulnActive) {
    pendingObstacleDisable = true;
  }
  playSfx(sfxHit);

  setAnimation(DINO_HURT_FRAMES);

  if (lives <= 0) {
    isRunning = false;
    gameState = "over";
    if (bgm) bgm.pause();
    playSfx(sfxLose);

    setTimeout(function () {
      setAnimation(DINO_DEAD_FRAMES);
      var deadDurationMs = DINO_DEAD_FRAMES.length * 200;
      setTimeout(function () {
        var dino = GetObject(dinoIndex);
        if (dino && dino.sprite >= 0) {
          HideSprite(dino.sprite);
        }
      }, deadDurationMs);
      setTimeout(finishGame, deadDurationMs + 1000);
    }, 400);
  }
  updateHUD();
}

function finishGame() {
  var score = Math.floor(timeAlive);
  var recordMsg = "";

  if (score > bestRecord) {
    bestRecord = score;
    recordMsg = "Nuevo record: " + bestRecord + " s";
  } else {
    recordMsg = "Record: " + bestRecord + " s";
  }

  dom.resultsTitle.textContent = "Has perdido";
  dom.resultsStats.textContent =
    "Jugador: " + playerName + " | Tiempo: " + score + " s";
  dom.resultsRecord.textContent = recordMsg;

  addLeaderboardEntry({
    name: playerName,
    score: score,
    ts: Date.now(),
  });

  updateHUD();
  renderLeaderboard();
  showScreen("results");
}

function startGame() {
  var typed = (dom.inputPlayerName?.value || "").trim();
  if (typed) playerName = typed;

  if (!playerName) {
    alert("Introduce tu nombre para empezar.");
    return;
  }

  resetGame();
  showScreen("game");

  if (bgm) {
    bgm.currentTime = 0;
    if (musicEnabled) bgm.play();
  }
}

function stopGame() {
  isRunning = false;
  gameState = "welcome";
  if (bgm) bgm.pause();
}

function resetGame() {
  timeAlive = 0;
  speedMultiplier = 1;
  spawnTimer = 0.8;
  isRunning = true;
  isGrounded = false;
  gameState = "game";
  hurtTimer = 0;
  invulnTimer = 0;
  invulnActive = false;
  lives = maxLives;
  jumpsUsed = 0;

  var dino = GetObject(dinoIndex);
  dino.posX = 120;
  dino.posY = groundY - dino.height;
  if (dino.sprite >= 0) {
    ShowSprite(dino.sprite);
  }
  setAnimation(DINO_RUN_FRAMES);
  var collider = GetCollider(dino.collider);
  collider.speedX = 0;
  collider.speedY = 0;

  clearObstacles();
  setObstacleCollidersEnabled(true);
  setAnimation(DINO_RUN_FRAMES);
  updateHUD();
  renderLives();
}

////////////////////////////
// ESCENARIO              //
///////////////////////////

function layoutScene() {
  var container = document.getElementById("minigame");
  if (!container) return;

  worldWidth = container.clientWidth || worldWidth;
  worldHeight = container.clientHeight || worldHeight;
  groundY = Math.floor(worldHeight - GROUND_HEIGHT - 12);

  var ground = GetObject(groundIndex);
  ground.posX = 0;
  ground.posY = groundY;
  ground.width = worldWidth;
  ground.height = GROUND_HEIGHT;

  var dino = GetObject(dinoIndex);
  dino.width = DINO_WIDTH;
  dino.height = DINO_HEIGHT;
  dino.posY = groundY - dino.height;
}

function spawnObstacle() {
  var available = OBSTACLE_TYPES.filter(function (o) {
    return timeAlive >= o.unlockAt;
  });
  var chosen = available[Math.floor(Math.random() * available.length)];

  var entry = getFreeObstacle();
  var obstacle = GetObject(entry.hitIndex);
  var shrink = entry.shrink;

  entry.spriteWidth = chosen.width;
  entry.spriteHeight = chosen.height;
  entry.active = true;

  obstacle.width = Math.max(4, chosen.width - shrink * 2);
  obstacle.height = Math.max(4, chosen.height - shrink * 2);
  obstacle.posX = worldWidth + randomRange(40, 120);
  obstacle.posY = groundY - chosen.height + chosen.yOffset + shrink;
  obstacle.active = true;

  var spriteObj = GetObject(entry.spriteObjIndex);
  if (spriteObj.sprite < 0) {
    spriteObj.sprite = CreateSprite(chosen.sprite);
  }
  var sprite = GetSprite(spriteObj.sprite);
  sprite.src = "images/" + chosen.sprite;
  spriteObj.posX = obstacle.posX - shrink;
  spriteObj.posY = obstacle.posY - shrink;
  spriteObj.width = chosen.width;
  spriteObj.height = chosen.height;
  ShowSprite(spriteObj.sprite);
}

function getFreeObstacle() {
  for (var i = 0; i < obstacles.length; i++) {
    if (!obstacles[i].active) {
      return obstacles[i];
    }
  }

  var hitIndex = CreateObject(
    "obstacle_hit_" + obstacles.length,
    "obstacle",
    0,
    0,
    10,
    10
  );
  var hitObj = GetObject(hitIndex);
  hitObj.collider = CreateCollider(bodyTypeKinematic, false);
  hitObj.colliderDisabled = -1;
  hitObj.active = false;

  var spriteIndex = CreateObject(
    "obstacle_sprite_" + obstacles.length,
    "obstacleSprite",
    0,
    0,
    10,
    10
  );
  var spriteObj = GetObject(spriteIndex);
  spriteObj.sprite = -1;

  var entry = {
    hitIndex: hitIndex,
    spriteObjIndex: spriteIndex,
    active: false,
    shrink: HITBOX_SHRINK_PX,
    spriteWidth: 0,
    spriteHeight: 0,
  };

  obstacles.push(entry);
  hitObj.linkIndex = obstacles.length - 1;
  spriteObj.linkIndex = obstacles.length - 1;

  return entry;
}

function clearObstacles() {
  for (var i = 0; i < obstacles.length; i++) {
    var entry = obstacles[i];
    entry.active = false;
    var hitObj = GetObject(entry.hitIndex);
    if (hitObj) hitObj.active = false;
    var spriteObj = GetObject(entry.spriteObjIndex);
    if (spriteObj && spriteObj.sprite >= 0) {
      HideSprite(spriteObj.sprite);
    }
  }
}

function setObstacleCollidersEnabled(enabled) {
  for (var i = 0; i < obstacles.length; i++) {
    var entry = obstacles[i];
    var o = GetObject(entry.hitIndex);
    if (!o) continue;
    if (enabled) {
      if (o.collider < 0 && o.colliderDisabled >= 0) {
        o.collider = o.colliderDisabled;
        o.colliderDisabled = -1;
      }
    } else {
      if (o.collider >= 0) {
        o.colliderDisabled = o.collider;
        o.collider = -1;
      }
    }
  }
}

////////////////////////////
// ANIMACION              //
///////////////////////////

function updateDinoAnimation(dino) {
  if (gameState === "over") {
    if (hurtTimer > 0) {
      setAnimation(DINO_HURT_FRAMES);
    } else {
      setAnimation(DINO_DEAD_FRAMES);
    }
  } else if (hurtTimer > 0) {
    setAnimation(DINO_HURT_FRAMES);
  } else if (!isGrounded) {
    setAnimation(DINO_JUMP_FRAMES);
  } else {
    setAnimation(DINO_RUN_FRAMES);
  }

  var frames = getCurrentFrames();
  if (!frames || frames.length === 0) return;

  var frameSpeed = currentAnim === "run" ? 0.12 : 0.16;
  if (currentAnim === "dead") frameSpeed = 0.2;
  animTimer += GAME_TIME_STEP;
  if (animTimer >= frameSpeed) {
    animTimer = 0;
    if (currentAnim === "dead") {
      animFrame = Math.min(animFrame + 1, frames.length - 1);
    } else {
      animFrame = (animFrame + 1) % frames.length;
    }
    var sprite = GetSprite(dino.sprite);
    sprite.src = "images/" + frames[animFrame];
  }
}

function setAnimation(frames) {
  var name = frames === DINO_RUN_FRAMES ? "run" : "state";
  if (frames === DINO_JUMP_FRAMES) name = "jump";
  if (frames === DINO_HURT_FRAMES) name = "hurt";
  if (frames === DINO_DEAD_FRAMES) name = "dead";

  if (currentAnim === name) return;
  currentAnim = name;
  animTimer = 0;
  animFrame = 0;

  var dino = GetObject(dinoIndex);
  var sprite = GetSprite(dino.sprite);
  sprite.src = "images/" + frames[0];
}

function getCurrentFrames() {
  if (currentAnim === "jump") return DINO_JUMP_FRAMES;
  if (currentAnim === "hurt") return DINO_HURT_FRAMES;
  if (currentAnim === "dead") return DINO_DEAD_FRAMES;
  return DINO_RUN_FRAMES;
}

////////////////////////////
// UI / PANTALLAS         //
///////////////////////////

function showScreen(name) {
  gameState = name;

  dom.screenWelcome.classList.remove("active");
  dom.screenGame.classList.remove("active");
  dom.screenResults.classList.remove("active");
  dom.screenLeaderboard.classList.remove("active");

  if (name === "welcome") dom.screenWelcome.classList.add("active");
  if (name === "game") dom.screenGame.classList.add("active");
  if (name === "results") dom.screenResults.classList.add("active");
  if (name === "leaderboard") dom.screenLeaderboard.classList.add("active");

  if (name === "leaderboard") {
    renderLeaderboard();
  }
  if (name === "game") {
    layoutScene();
  }
}

function updateHUD() {
  var score = Math.floor(timeAlive);
  if (dom.hudScore) dom.hudScore.textContent = score;
  if (dom.hudRecord) dom.hudRecord.textContent = bestRecord;
  if (dom.hudTime) dom.hudTime.textContent = score;
}

function renderLives() {
  if (!dom.hudLives) return;
  dom.hudLives.innerHTML = "";
  for (var i = 0; i < maxLives; i++) {
    var heart = document.createElement("span");
    heart.className = "life-heart" + (i < lives ? "" : " is-lost");
    dom.hudLives.appendChild(heart);
  }
}

////////////////////////////
// LEADERBOARD            //
///////////////////////////

function loadLeaderboardFromStorage() {
  try {
    var raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      leaderboard = [];
      return;
    }
    var parsed = JSON.parse(raw);
    leaderboard = Array.isArray(parsed) ? parsed : [];
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
    if (a.score !== b.score) return b.score - a.score;
    return a.ts - b.ts;
  });
}

function addLeaderboardEntry(entry) {
  loadLeaderboardFromStorage();
  leaderboard.push(entry);
  sortLeaderboard();

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
    li.textContent = "No hay puntuaciones todavia";
    dom.leaderboardList.appendChild(li);
    return;
  }

  for (var i = 0; i < leaderboard.length; i++) {
    var li2 = document.createElement("li");
    li2.textContent =
      i + 1 + ". " + leaderboard[i].name + " - " + leaderboard[i].score + " s";
    dom.leaderboardList.appendChild(li2);
  }
}

function clearLeaderboard() {
  leaderboard = [];
  saveLeaderboardToStorage();
  renderLeaderboard();
}

function getBestRecord() {
  loadLeaderboardFromStorage();
  sortLeaderboard();
  if (leaderboard.length === 0) return 0;
  return leaderboard[0].score;
}

////////////////////////////
// AUDIO                  //
///////////////////////////

function setupAudio() {
  bgm = new Audio("audio/bckground-music.mp3");
  bgm.loop = true;
  bgm.volume = 0.6;

  sfxJump = new Audio("audio/jump.mp3");
  sfxHit = new Audio("audio/hit.mp3");
  sfxLose = new Audio("audio/lose.mp3");
}

function playSfx(audio) {
  if (!audio) return;
  try {
    audio.currentTime = 0;
    audio.play();
  } catch (e) {}
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  if (musicEnabled) {
    if (bgm && isRunning && gameState === "game") {
      bgm.play();
    }
    if (dom.btnMusic) dom.btnMusic.textContent = "🔊";
  } else {
    if (bgm) bgm.pause();
    if (dom.btnMusic) dom.btnMusic.textContent = "🔇";
  }
}

////////////////////////////
// UTILS                  //
///////////////////////////

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}
