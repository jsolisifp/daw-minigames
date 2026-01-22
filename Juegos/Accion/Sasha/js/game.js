/////////////////////////////
// REQUIRED BY ENGINE
/////////////////////////////

function StartObject(index) {}
function OnObjectClicked(o) {}

/////////////////////////////
// GAME STATES
/////////////////////////////

var GAME_MENU  = 0;
var GAME_PLAY  = 1;
var GAME_PAUSE = 2;
var GAME_OVER  = 3;
var GAME_WIN   = 4;

var gameState = GAME_MENU;

/////////////////////////////
// GAME DATA
/////////////////////////////

var score = 0;
var lives = 3;
var level = 1;
var scoreMultiplier = 1;
var highScore = 0;

var paddle = -1;
var ball   = -1;

var scoreText    = -1;
var livesText    = -1;
var levelText    = -1;
var multiplierText = -1;
var highScoreText = -1;
var menuText     = -1;
var gameOverText = -1;
var winText      = -1;
var pauseText    = -1;
var powerUpIndicator = -1;
var volumeControlsText = -1;

/////////////////////////////
// SOUNDS
/////////////////////////////

var soundBounce = -1;
var soundBreak = -1;
var soundPowerUp = -1;
var soundGameOver = -1;
var soundWin = -1;
var soundShoot = -1;
var musicBackground = -1;

var soundVolume = 0.7;
var musicVolume = 0.5;
var soundsEnabled = true;
var musicEnabled = true;

/////////////////////////////
// OBJECT TYPES
/////////////////////////////

var TYPE_PADDLE = 0;
var TYPE_BALL   = 1;
var TYPE_BRICK  = 2;
var TYPE_WALL   = 3;
var TYPE_POWER  = 4;
var TYPE_BULLET = 5;

/////////////////////////////
// BRICKS
/////////////////////////////

var BRICK_NORMAL = 0;
var BRICK_STRONG = 1;

var activeBricks = 0;

/////////////////////////////
// POWER-UPS
/////////////////////////////

var POWER_EXPAND = 0;
var POWER_SHOOT = 1;
var POWER_LIFE = 2;

var activePowerUp = null;
var powerUpTimer = 0;
var canShoot = false;
var shootCooldown = 0;

/////////////////////////////
// BALL SETTINGS
/////////////////////////////

var BALL_SPEED = 300;

function NormalizeBallSpeed()
{
    var c = colliders[objects[ball].collider];

    var vx = c.speedX;
    var vy = c.speedY;

    var length = Math.sqrt(vx * vx + vy * vy);
    if (length === 0) return;

    var currentSpeed = BALL_SPEED + (level - 1) * 30;
    c.speedX = (vx / length) * currentSpeed;
    c.speedY = (vy / length) * currentSpeed;
}

/////////////////////////////
// SCENE CREATION
/////////////////////////////

function CreateScene()
{
    LoadHighScore();

    SetCollisionEnabled(TYPE_BALL, TYPE_BALL, false);
    SetCollisionEnabled(TYPE_BALL, TYPE_POWER, false);
    SetCollisionEnabled(TYPE_BALL, TYPE_BULLET, false);
    SetCollisionEnabled(TYPE_PADDLE, TYPE_WALL, false);
    SetCollisionEnabled(TYPE_PADDLE, TYPE_BRICK, false);
    SetCollisionEnabled(TYPE_PADDLE, TYPE_PADDLE, false);
    SetCollisionEnabled(TYPE_POWER, TYPE_WALL, false);
    SetCollisionEnabled(TYPE_POWER, TYPE_BRICK, false);
    SetCollisionEnabled(TYPE_POWER, TYPE_POWER, false);
    SetCollisionEnabled(TYPE_POWER, TYPE_BULLET, false);
    SetCollisionEnabled(TYPE_BRICK, TYPE_BRICK, false);
    SetCollisionEnabled(TYPE_BRICK, TYPE_WALL, false);
    SetCollisionEnabled(TYPE_WALL, TYPE_WALL, false);
    SetCollisionEnabled(TYPE_BULLET, TYPE_WALL, false);
    SetCollisionEnabled(TYPE_BULLET, TYPE_BULLET, false);
    SetCollisionEnabled(TYPE_BULLET, TYPE_POWER, false);
    SetCollisionEnabled(TYPE_BULLET, TYPE_PADDLE, false);

    scoreText = CreateText("Score: 0", "hud");
    livesText = CreateText("Lives: 3", "hud");
    levelText = CreateText("Level: 1", "hud");
    multiplierText = CreateText("x1", "hud");
    highScoreText = CreateText("High: " + highScore, "hud");
    powerUpIndicator = CreateText("", "hud");
    volumeControlsText = CreateText("", "hud");

    var scoreObj = CreateObject("score", TYPE_WALL, 10, 10, 0, 0);
    objects[scoreObj].text = scoreText;
    
    var livesObj = CreateObject("lives", TYPE_WALL, 10, 35, 0, 0);
    objects[livesObj].text = livesText;
    
    var levelObj = CreateObject("level", TYPE_WALL, 10, 60, 0, 0);
    objects[levelObj].text = levelText;
    
    var multiObj = CreateObject("multi", TYPE_WALL, 720, 10, 0, 0);
    objects[multiObj].text = multiplierText;
    
    var highObj = CreateObject("high", TYPE_WALL, 640, 35, 0, 0);
    objects[highObj].text = highScoreText;
    
    var powerupObj = CreateObject("powerup", TYPE_WALL, 320, 10, 0, 0);
    objects[powerupObj].text = powerUpIndicator;
    
    var volumeObj = CreateObject("volume", TYPE_WALL, 10, 455, 0, 0);
    objects[volumeObj].text = volumeControlsText;

    UpdateVolumeDisplay();

    menuText = CreateText("ARKANOID<br><br>Level " + level + "<br><br>PRESS SPACE TO START<br><br>Controls: A/D - Move | W - Pause<br>1/2 - Sound | 3/4 - Music | 0 - Mute All<br>High Score: " + highScore, "menuText");
    var menuObj = CreateObject("menu", TYPE_WALL, 0, 40, 0, 0);
    objects[menuObj].text = menuText;

    gameOverText = CreateText("GAME OVER<br><br>Score: 0<br>High: " + highScore + "<br><br>PRESS SPACE", "menuText");
    HideText(gameOverText);
    var overObj = CreateObject("over", TYPE_WALL, 0, 140, 0, 0);
    objects[overObj].text = gameOverText;

    winText = CreateText("LEVEL COMPLETE!<br><br>Score: 0<br><br>PRESS SPACE", "menuText");
    HideText(winText);
    var winObj = CreateObject("win", TYPE_WALL, 0, 140, 0, 0);
    objects[winObj].text = winText;

    pauseText = CreateText("PAUSED<br><br>W - Resume | SPACE - Menu", "menuText");
    HideText(pauseText);
    var pauseObj = CreateObject("pause", TYPE_WALL, 0, 180, 0, 0);
    objects[pauseObj].text = pauseText;

    paddle = CreateObject("paddle", TYPE_PADDLE, 340, 450, 120, 20);
    objects[paddle].sprite = CreateSprite("paddle.png", "sprite");
    objects[paddle].collider = CreateCollider(bodyTypeKinematic, false);

    ball = CreateObject("ball", TYPE_BALL, 392, 420, 16, 16);
    objects[ball].sprite = CreateSprite("ball.png", "sprite");
    objects[ball].collider = CreateCollider(bodyTypeDynamic, false);
    colliders[objects[ball].collider].bounciness = 1.0;

    CreateWalls();
    CreateBricks();
    CreateSounds();

    gameState = GAME_MENU;
}

/////////////////////////////
// VOLUME CONTROL
/////////////////////////////

function UpdateVolumeDisplay()
{
    var soundStatus = soundsEnabled ? "ON" : "OFF";
    var musicStatus = musicEnabled ? "ON" : "OFF";
    SetTextContent(volumeControlsText, "Sound: " + soundStatus + " | Music: " + musicStatus);
}

function HandleVolumeKeys()
{
    if (input1Down)
    {
        soundsEnabled = !soundsEnabled;
        UpdateAllSoundVolumes();
        UpdateVolumeDisplay();
    }

    if (input2Down)
    {
        soundVolume = Math.max(0, soundVolume - 0.1);
        UpdateAllSoundVolumes();
        UpdateVolumeDisplay();
    }

    if (input3Down)
    {
        musicEnabled = !musicEnabled;
        if (musicEnabled && gameState === GAME_PLAY)
            PlayBGMusic();
        else
            StopBGMusic();
        UpdateVolumeDisplay();
    }

    if (input4Down)
    {
        musicVolume = Math.max(0, musicVolume - 0.1);
        UpdateMusicVolume();
        UpdateVolumeDisplay();
    }

    if (input0Down)
    {
        soundsEnabled = false;
        musicEnabled = false;
        UpdateAllSoundVolumes();
        StopBGMusic();
        UpdateVolumeDisplay();
    }
}

function UpdateAllSoundVolumes()
{
    var vol = soundsEnabled ? soundVolume : 0;
    if (soundBounce >= 0) SetSoundVolume(soundBounce, vol);
    if (soundBreak >= 0) SetSoundVolume(soundBreak, vol);
    if (soundPowerUp >= 0) SetSoundVolume(soundPowerUp, vol);
    if (soundGameOver >= 0) SetSoundVolume(soundGameOver, vol);
    if (soundWin >= 0) SetSoundVolume(soundWin, vol);
    if (soundShoot >= 0) SetSoundVolume(soundShoot, vol);
}

function UpdateMusicVolume()
{
    if (musicBackground >= 0)
        SetSoundVolume(musicBackground, musicEnabled ? musicVolume : 0);
}

/////////////////////////////
// SOUNDS
/////////////////////////////

function CreateSounds()
{
    soundBounce = CreateSound("bounce.mp3", false);
    soundBreak = CreateSound("break.mp3", false);
    soundPowerUp = CreateSound("powerup.mp3", false);
    soundGameOver = CreateSound("gameover.mp3", false);
    soundWin = CreateSound("win.mp3", false);
    soundShoot = CreateSound("shoot.mp3", false);
    musicBackground = CreateSound("music.mp3", true);

    UpdateAllSoundVolumes();
    UpdateMusicVolume();
}

function PlayBGMusic()
{
    if (musicBackground >= 0 && musicEnabled)
        PlaySound(musicBackground);
}

function StopBGMusic()
{
    if (musicBackground >= 0)
        StopSound(musicBackground);
}

/////////////////////////////
// HIGH SCORE
/////////////////////////////

function LoadHighScore()
{
    var saved = localStorage.getItem('arkanoidHighScore');
    if (saved)
        highScore = parseInt(saved);
}

function SaveHighScore()
{
    if (score > highScore)
    {
        highScore = score;
        localStorage.setItem('arkanoidHighScore', highScore.toString());
        SetTextContent(highScoreText, "High: " + highScore);
    }
}

/////////////////////////////
// WALLS
/////////////////////////////

function CreateWalls()
{
    CreateWall(0, 0, 10, 480);
    CreateWall(790, 0, 10, 480);
    CreateWall(0, 0, 800, 10);
}

function CreateWall(x, y, w, h)
{
    var id = CreateObject("wall", TYPE_WALL, x, y, w, h);
    objects[id].collider = CreateCollider(bodyTypeKinematic, false);
}

/////////////////////////////
// BRICKS
/////////////////////////////

function CreateBricks()
{
    activeBricks = 0;

    var rows = 4 + level;
    var strongChance = 0.2 + level * 0.05;

    for (var y = 0; y < rows; y++)
    {
        for (var x = 0; x < 8; x++)
        {
            var brick = CreateObject(
                "brick",
                TYPE_BRICK,
                80 + x * 80,
                60 + y * 40,
                70,
                30
            );

            var strong = Math.random() < strongChance;

            objects[brick].brickType = strong ? BRICK_STRONG : BRICK_NORMAL;
            objects[brick].hp = strong ? 2 : 1;

            objects[brick].sprite = CreateSprite(
                strong ? "brick_strong.png" : "brick.png",
                "sprite"
            );

            objects[brick].collider = CreateCollider(bodyTypeKinematic, false);
            activeBricks++;
        }
    }
}

/////////////////////////////
// UPDATE LOOP
/////////////////////////////

var volumeKeysHandled = false;

function UpdateObject(index)
{
    if (!volumeKeysHandled)
    {
        HandleVolumeKeys();
        volumeKeysHandled = true;
    }

    if (gameState === GAME_PLAY)
    {
        if (powerUpTimer > 0)
        {
            powerUpTimer -= timeStep;
            if (powerUpTimer <= 0)
                DeactivatePowerUp();
        }

        if (shootCooldown > 0)
            shootCooldown -= timeStep;

        UpdateMultiplier();
    }

    if (inputUpDown && gameState === GAME_PLAY)
    {
        gameState = GAME_PAUSE;
        ShowText(pauseText);
        StopBGMusic();
        return;
    }

    if (inputUpDown && gameState === GAME_PAUSE)
    {
        gameState = GAME_PLAY;
        HideText(pauseText);
        PlayBGMusic();
        return;
    }

    if (inputFireDown && gameState === GAME_PAUSE)
    {
        HideText(pauseText);
        StopBGMusic();
        RestartGame();
        return;
    }

    if (gameState === GAME_MENU)
    {
        ShowText(menuText);
        HideText(gameOverText);
        HideText(winText);
        HideText(pauseText);

        if (inputFireDown)
        {
            HideText(menuText);
            LaunchBall();
            gameState = GAME_PLAY;
            PlayBGMusic();
        }
        return;
    }

    if (gameState === GAME_PAUSE)
        return;

    if (gameState === GAME_PLAY)
    {
        if (index === paddle)
        {
            UpdatePaddle();
            
            if (canShoot && inputFireDown && shootCooldown <= 0)
            {
                ShootBullet();
                shootCooldown = 0.5;
            }
        }

        if (index === ball)
            CheckBallFall();

        if (objects[index].type === TYPE_BULLET && objects[index].posY < -50)
        {
            if (objects[index].sprite >= 0)
                sprites[objects[index].sprite].remove();
            objects.splice(index, 1);
        }

        if (objects[index].type === TYPE_POWER && objects[index].posY > 500)
        {
            if (objects[index].sprite >= 0)
                sprites[objects[index].sprite].remove();
            objects.splice(index, 1);
        }
    }

    if (gameState === GAME_OVER)
    {
        ShowText(gameOverText);
        HideText(menuText);
        HideText(winText);
        HideText(pauseText);
        
        if (inputFireDown)
        {
            level = 1;
            RestartGame();
        }
    }

    if (gameState === GAME_WIN)
    {
        ShowText(winText);
        HideText(menuText);
        HideText(gameOverText);
        HideText(pauseText);
        
        if (inputFireDown)
            NextLevel();
    }
}

function ResetVolumeKeysFlag()
{
    volumeKeysHandled = false;
}

/////////////////////////////
// CONTROLS
/////////////////////////////

function UpdatePaddle()
{
    var speed = 400;

    if (inputLeftPressed)
        objects[paddle].posX -= speed * timeStep;

    if (inputRightPressed)
        objects[paddle].posX += speed * timeStep;

    objects[paddle].posX = Math.max(10, Math.min(670, objects[paddle].posX));
}

///////////////////////////
// SHOOTING
/////////////////////////

function ShootBullet()
{
    var b = CreateObject("bullet", TYPE_BULLET, 
        objects[paddle].posX + objects[paddle].width / 2 - 4, 
        objects[paddle].posY - 20, 
        8, 16);
    objects[b].sprite = CreateSprite("bullet.png", "sprite");
    objects[b].collider = CreateCollider(bodyTypeDynamic, false);
    colliders[objects[b].collider].speedY = -500;
    
    if (soundShoot >= 0 && soundsEnabled)
        PlaySound(soundShoot);
}

///////////////////////////
// BALL LOGIC
///////////////////////////

function LaunchBall()
{
    var c = colliders[objects[ball].collider];
    c.speedX = 120;
    c.speedY = -BALL_SPEED;
    NormalizeBallSpeed();
}

function CheckBallFall()
{
    if (objects[ball].posY > 500)
    {
        lives--;
        SetTextContent(livesText, "Lives: " + lives);
        scoreMultiplier = 1;
        SetTextContent(multiplierText, "x" + scoreMultiplier);

        if (lives <= 0)
        {
            gameState = GAME_OVER;
            colliders[objects[ball].collider].speedX = 0;
            colliders[objects[ball].collider].speedY = 0;
            SaveHighScore();
            SetTextContent(gameOverText, "GAME OVER<br><br>Score: " + score + "<br>High: " + highScore + "<br><br>PRESS SPACE");
            StopBGMusic();
            if (soundGameOver >= 0 && soundsEnabled)
                PlaySound(soundGameOver);
        }
        else
        {
            ResetBall();
        }
    }
}

function ResetBall()
{
    objects[ball].posX = 392;
    objects[ball].posY = 420;

    colliders[objects[ball].collider].speedX = 0;
    colliders[objects[ball].collider].speedY = 0;

    objects[paddle].posX = 340;
    objects[paddle].width = 120;

    gameState = GAME_MENU;
    StopBGMusic();
}

/////////////////////////////
// MULTIPLIER
///////////////////////////

function UpdateMultiplier()
{
    var bricksDestroyed = (4 + level) * 8 - activeBricks;
    var newMultiplier = Math.floor(bricksDestroyed / 5) + 1;
    
    if (newMultiplier !== scoreMultiplier)
    {
        scoreMultiplier = Math.min(newMultiplier, 5);
        SetTextContent(multiplierText, "x" + scoreMultiplier);
    }
}

/////////////////////////////
// COLLISIONS
/////////////////////////////

function OnObjectCollision(self, other)
{
    if (self.type === TYPE_BALL && (other.type === TYPE_BRICK || other.type === TYPE_WALL || other.type === TYPE_PADDLE))
    {
        NormalizeBallSpeed();
        if (soundBounce >= 0 && soundsEnabled)
            PlaySound(soundBounce);
    }

    if (self.type === TYPE_BALL && other.type === TYPE_BRICK)
    {
        other.hp--;

        if (other.hp <= 0)
        {
            score += 10 * scoreMultiplier;
            SetTextContent(scoreText, "Score: " + score);

            HideSprite(other.sprite);
            other.collider = -1;

            activeBricks--;

            if (soundBreak >= 0 && soundsEnabled)
                PlaySound(soundBreak);

            if (activeBricks <= 0)
            {
                colliders[objects[ball].collider].speedX = 0;
                colliders[objects[ball].collider].speedY = 0;
                gameState = GAME_WIN;
                SaveHighScore();
                SetTextContent(winText, "LEVEL COMPLETE!<br><br>Score: " + score + "<br><br>PRESS SPACE");
                StopBGMusic();
                if (soundWin >= 0 && soundsEnabled)
                    PlaySound(soundWin);
            }

            if (Math.random() < 0.25)
                DropPowerUp(other.posX, other.posY);
        }
        else
        {
            if (other.brickType === BRICK_STRONG && other.sprite >= 0)
            {
                sprites[other.sprite].src = "images/brick.png";
            }
        }
    }

    if (self.type === TYPE_BULLET && other.type === TYPE_BRICK)
    {
        other.hp--;

        if (other.hp <= 0)
        {
            score += 5 * scoreMultiplier;
            SetTextContent(scoreText, "Score: " + score);

            HideSprite(other.sprite);
            other.collider = -1;

            activeBricks--;

            if (soundBreak >= 0 && soundsEnabled)
                PlaySound(soundBreak);

            if (activeBricks <= 0)
            {
                colliders[objects[ball].collider].speedX = 0;
                colliders[objects[ball].collider].speedY = 0;
                gameState = GAME_WIN;
                SaveHighScore();
                SetTextContent(winText, "LEVEL COMPLETE!<br><br>Score: " + score + "<br><br>PRESS SPACE");
                StopBGMusic();
                if (soundWin >= 0 && soundsEnabled)
                    PlaySound(soundWin);
            }
        }
        else
        {
            if (other.brickType === BRICK_STRONG && other.sprite >= 0)
            {
                sprites[other.sprite].src = "images/brick.png";
            }
        }

        HideSprite(self.sprite);
        self.collider = -1;
    }

    if (self.type === TYPE_POWER && other.type === TYPE_PADDLE)
    {
        ActivatePowerUp(self.powerType);
        HideSprite(self.sprite);
        self.collider = -1;
        
        if (soundPowerUp >= 0 && soundsEnabled)
            PlaySound(soundPowerUp);
    }

    if (self.type === TYPE_BALL && other.type === TYPE_PADDLE)
    {
        var ballCenter = self.posX + self.width / 2;
        var paddleCenter = other.posX + other.width / 2;
        var diff = ballCenter - paddleCenter;
        var normalizedDiff = diff / (other.width / 2);
        
        var c = colliders[self.collider];
        
        var angle = normalizedDiff * 60;
        var angleRad = angle * Math.PI / 180;
        
        var currentSpeed = BALL_SPEED + (level - 1) * 30;
        c.speedX = Math.sin(angleRad) * currentSpeed;
        c.speedY = -Math.cos(angleRad) * currentSpeed;
    }
}

////////////////////////////
// POWER-UP
/////////////////////////////

function DropPowerUp(x, y)
{
    var types = [POWER_EXPAND, POWER_SHOOT, POWER_LIFE];
    var type = types[Math.floor(Math.random() * types.length)];
    
    var sprites_names = ["power_expand.png", "power_shoot.png", "power_life.png"];
    
    var p = CreateObject("power", TYPE_POWER, x, y, 24, 24);
    objects[p].powerType = type;
    objects[p].sprite = CreateSprite(sprites_names[type], "sprite");
    objects[p].collider = CreateCollider(bodyTypeDynamic, false);
    colliders[objects[p].collider].speedY = 120;
}

function ActivatePowerUp(type)
{
    if (type === POWER_EXPAND)
    {
        objects[paddle].width = Math.min(objects[paddle].width + 30, 200);
        activePowerUp = "EXPAND";
        powerUpTimer = 10;
    }
    else if (type === POWER_SHOOT)
    {
        canShoot = true;
        activePowerUp = "SHOOT";
        powerUpTimer = 15;
    }
    else if (type === POWER_LIFE)
    {
        lives++;
        SetTextContent(livesText, "Lives: " + lives);
        SetTextContent(powerUpIndicator, "EXTRA LIFE!");
        setTimeout(function() {
            SetTextContent(powerUpIndicator, "");
        }, 2000);
        return;
    }
    
    UpdatePowerUpIndicator();
}

function DeactivatePowerUp()
{
    if (activePowerUp === "SHOOT")
        canShoot = false;
    
    activePowerUp = null;
    powerUpTimer = 0;
    SetTextContent(powerUpIndicator, "");
}

function UpdatePowerUpIndicator()
{
    if (activePowerUp)
        SetTextContent(powerUpIndicator, activePowerUp + " (" + Math.ceil(powerUpTimer) + "s)");
    else
        SetTextContent(powerUpIndicator, "");
}

/////////////////////
// LEVEL SYSTEM
/////////////////////////////

function NextLevel()
{
    level++;
    
    if (level > 2)
    {
        level = 1;
        SetTextContent(winText, "YOU WIN!<br><br>Final Score: " + score + "<br>High: " + highScore + "<br><br>PRESS SPACE");
        SaveHighScore();
        return;
    }
    
    HideText(winText);
    
    for (var i = objects.length - 1; i >= 0; i--)
    {
        if (objects[i].type === TYPE_BRICK || objects[i].type === TYPE_POWER || objects[i].type === TYPE_BULLET)
        {
            if (objects[i].sprite >= 0)
                sprites[objects[i].sprite].remove();
            objects.splice(i, 1);
        }
    }
    
    SetTextContent(levelText, "Level: " + level);
    CreateBricks();
    ResetBall();
    DeactivatePowerUp();
    scoreMultiplier = 1;
    SetTextContent(multiplierText, "x" + scoreMultiplier);
    SetTextContent(menuText, "ARKANOID<br><br>Level " + level + "<br><br>PRESS SPACE TO START<br><br>Controls: A/D - Move | W - Pause<br>1/2 - Sound | 3/4 - Music | 0 - Mute All<br>High Score: " + highScore);
}

/////////////////////////////
// RESTART GAME
/////////////////////////////

function RestartGame()
{
    score = 0;
    lives = 3;

    SetTextContent(scoreText, "Score: 0");
    SetTextContent(livesText, "Lives: 3");
    SetTextContent(levelText, "Level: " + level);
    SetTextContent(multiplierText, "x1");
    
    scoreMultiplier = 1;

    HideText(gameOverText);
    HideText(winText);
    
    DeactivatePowerUp();

    objects[paddle].width = 120;
    objects[paddle].posX = 340;

    for (var i = objects.length - 1; i >= 0; i--)
    {
        if (objects[i].type === TYPE_BRICK || objects[i].type === TYPE_POWER || objects[i].type === TYPE_BULLET)
        {
            if (objects[i].sprite >= 0)
                sprites[objects[i].sprite].remove();

            objects.splice(i, 1);
        }
    }

    CreateBricks();
    ResetBall();
    SetTextContent(menuText, "ARKANOID<br><br>Level " + level + "<br><br>PRESS SPACE TO START<br><br>Controls: A/D - Move | W - Pause<br>1/2 - Sound | 3/4 - Music | 0 - Mute All<br>High Score: " + highScore);
}