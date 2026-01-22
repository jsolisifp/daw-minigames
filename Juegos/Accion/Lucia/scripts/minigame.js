var objectTypePanel = 0;
var objectTypeManager = 1;
var objectTypeImage = 2;
var objectTypeButton = 3;

var music;
var welcomeImage;
var startButton;
var successImage;
var retryButton;
var table;
var panels;

var stateUndefined = -1;
var statePlaying = 0;
var stateSuccess = 1;
var stateWelcome = 2;

var state;

var isMuted = false;
var muteButtonHTML;

var maxLives = 3;
var livesPlayer1 = maxLives;
var livesPlayer2 = maxLives;
var livesCounterHTML;

var gameArea = {x:50, y:150, width:700, height:400};
var perimeterSprites = [];

///////////////////////////////////////////////////
//                   ESTADOS                     //
///////////////////////////////////////////////////


var paddleLeft, paddleRight;
var paddleLeftIndex, paddleRightIndex;
var ball, ballIndex;
var ballSpeedX = 150;
var ballSpeedY = 100;
var paddleSpeed = 250;

var inputWDown = false;
var inputSDown = false;
var inputUpDownArrow = false;
var inputDownDownArrow = false;

function SetState(nextState)
{

    if(state == stateWelcome)
    {
        HideSprite(welcomeImage.sprite);
        HideSprite(startButton.sprite);
    }
    else if(state == stateSuccess)
    {
        HideSprite(successImage.sprite);
        HideSprite(retryButton.sprite);
    }
    else if(state == statePlaying)
    {
        // Ocultar
        if(paddleLeft) HideSprite(paddleLeft.sprite);
        if(paddleRight) HideSprite(paddleRight.sprite);
        if(ball) HideSprite(ball.sprite);

        for(var i=0;i<perimeterSprites.length;i++)
            HideSprite(perimeterSprites[i]);
        perimeterSprites = [];

        for(var i = 0; i < panels.length; i++) HideSprite(panels[i].sprite);
    }


    if(nextState == stateWelcome)
    {
        ShowSprite(welcomeImage.sprite);
        ShowSprite(startButton.sprite);
    }
    else if(nextState == statePlaying)
    {
        // Reiniciar vidas
        livesPlayer1 = maxLives;
        livesPlayer2 = maxLives;
        if(livesCounterHTML)
            livesCounterHTML.textContent = "Player1: " + livesPlayer1 + " | Player2: " + livesPlayer2;

        // Paleta izquierda
        paddleLeftIndex = CreateObject("paddleLeft", objectTypePanel, gameArea.x+10, gameArea.y + gameArea.height/2 -50, 20, 100);
        paddleLeft = GetObject(paddleLeftIndex);
        paddleLeft.sprite = CreateShapeSprite("paddleLeft");
        paddleLeft.collider = CreateCollider(1,false);
        ShowSprite(paddleLeft.sprite);

        // Paleta derecha
        paddleRightIndex = CreateObject("paddleRight", objectTypePanel, gameArea.x + gameArea.width - 30, gameArea.y + gameArea.height/2 -50, 20, 100);
        paddleRight = GetObject(paddleRightIndex);
        paddleRight.sprite = CreateShapeSprite("paddleRight");
        paddleRight.collider = CreateCollider(1,false);
        ShowSprite(paddleRight.sprite);

        // Pelota
        ballIndex = CreateObject("ball", objectTypePanel, gameArea.x + gameArea.width/2, gameArea.y + gameArea.height/2, 20, 20);
        ball = GetObject(ballIndex);
        ball.sprite = CreateShapeSprite("ball");
        ball.collider = CreateCollider(0,false);
        var cBall = GetCollider(ball.collider);
        cBall.speedX = ballSpeedX;
        cBall.speedY = ballSpeedY;
        ShowSprite(ball.sprite);

        perimeterSprites.push(CreatePerimeterSprite(gameArea.x, gameArea.y, gameArea.width, 5));
        perimeterSprites.push(CreatePerimeterSprite(gameArea.x, gameArea.y + gameArea.height -5, gameArea.width, 5));
        perimeterSprites.push(CreatePerimeterSprite(gameArea.x, gameArea.y, 5, gameArea.height));
        perimeterSprites.push(CreatePerimeterSprite(gameArea.x + gameArea.width -5, gameArea.y, 5, gameArea.height));

    }
    else if(nextState == stateSuccess)
    {
        ShowSprite(successImage.sprite);
        ShowSprite(retryButton.sprite);
    }

    state = nextState;
}

// Perímetro del tablero

function CreatePerimeterSprite(x, y, width, height)
{
    var index = sprites.length;
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.width = width + "px";
    div.style.height = height + "px";
    div.style.backgroundColor = "white";
    sprites.push(div);
    minigame.appendChild(div);
    ShowSprite(index);
    return index;
}

// Pelota

function ResetBall()
{
    ball.posX = gameArea.x + gameArea.width/2;
    ball.posY = gameArea.y + gameArea.height/2;
    var cBall = GetCollider(ball.collider);
    cBall.speedX = (Math.random() < 0.5 ? 1 : -1) * ballSpeedX;
    cBall.speedY = (Math.random() < 0.5 ? 1 : -1) * ballSpeedY;
}

///////////////////////////////////////////////////
//                  CREATE SCENE                 //
///////////////////////////////////////////////////

function CreateScene()
{
    var index;

    index = CreateObject("image-welcome", objectTypeImage, 200, 200, 400, 200);
    welcomeImage = GetObject(index);
    welcomeImage.sprite = CreateSprite("welcome.png");
    HideSprite(welcomeImage.sprite);

    index = CreateObject("button-start", objectTypeButton, 300, 400, 200, 100);
    startButton = GetObject(index);
    startButton.sprite = CreateSprite("button-start.png");
    HideSprite(startButton.sprite);

    index = CreateObject("image-success", objectTypeImage, 350, 200, 200, 200);
    successImage = GetObject(index);
    successImage.sprite = CreateSprite("success.png");
    HideSprite(successImage.sprite);

    index = CreateObject("button-retry", objectTypeButton, 300, 400, 300, 100);
    retryButton = GetObject(index);
    retryButton.sprite = CreateSprite("button-retry.png");
    HideSprite(retryButton.sprite);

    table = [];
    panels = [];
    for(var i = 0; i < 4; i++)
    {
        table.push([]);
        for(var j = 0; j < 4; j++)
        {
            table[i].push(false);
            index = CreateObject("panel-"+i+"-"+j, objectTypePanel, 300 + j*64, 150 + i*64, 64, 64);
            var p = GetObject(index);
            p.row = i;
            p.column = j;
            panels.push(p);
        }
    }

    index = CreateObject("manager", objectTypeManager, 0, 0, 0, 0);
    GetObject(index).soundSuccess = CreateSound("success.mp3", false);

    music = new Audio("sounds/background.mp3");
    music.loop = true;
    if(!isMuted) music.play();

    muteButtonHTML = document.getElementById("muteButton");
    muteButtonHTML.addEventListener("click", function() {
        isMuted = !isMuted;
        if(isMuted) music.pause(); else music.play();
    });

    livesCounterHTML = document.getElementById("livesCounter");
    if(livesCounterHTML)
        livesCounterHTML.textContent = "Player1: " + livesPlayer1 + " | Player2: " + livesPlayer2;

    state = stateUndefined;
    SetState(stateWelcome);
}

///////////////////////////////////////////////////
//                  START OBJECT                 //
///////////////////////////////////////////////////

function StartObject(index)
{
    var o = GetObject(index);

    if(o.type == objectTypePanel)
    {
        o.sound = CreateSound("click.wav", false);
        o.spriteOff = CreateSprite("panel-off.png");
        o.spriteOn = null;
        o.sprite = o.spriteOff;
        HideSprite(o.sprite);
    }
}

///////////////////////////////////////////////////
//                  UPDATE OBJECT                //
///////////////////////////////////////////////////

function UpdateObject(index)
{
    var o = GetObject(index);

    if(o.type == objectTypeManager && state == statePlaying)
    {
        var dt = timeStep;

        if(paddleLeft && paddleRight && ball)
        {
            if(inputWDown) paddleLeft.posY -= paddleSpeed * dt;
            if(inputSDown) paddleLeft.posY += paddleSpeed * dt;
            if(paddleLeft.posY < gameArea.y) paddleLeft.posY = gameArea.y;
            if(paddleLeft.posY + paddleLeft.height > gameArea.y + gameArea.height) paddleLeft.posY = gameArea.y + gameArea.height - paddleLeft.height;

            if(inputUpDownArrow) paddleRight.posY -= paddleSpeed * dt;
            if(inputDownDownArrow) paddleRight.posY += paddleSpeed * dt;
            if(paddleRight.posY < gameArea.y) paddleRight.posY = gameArea.y;
            if(paddleRight.posY + paddleRight.height > gameArea.y + gameArea.height) paddleRight.posY = gameArea.y + gameArea.height - paddleRight.height;

    // Movimiento pelota

            var cBall = GetCollider(ball.collider);
            ball.posX += cBall.speedX * dt;
            ball.posY += cBall.speedY * dt;

    // Rebotes superior/inferior

            if(ball.posY < gameArea.y) { ball.posY = gameArea.y; cBall.speedY *= -1; }
            if(ball.posY + ball.height > gameArea.y + gameArea.height) { ball.posY = gameArea.y + gameArea.height - ball.height; cBall.speedY *= -1; }

    // Rebotes con paletas

            if(CheckOverlap(paddleLeftIndex, ballIndex)) { ball.posX = paddleLeft.posX + paddleLeft.width; cBall.speedX *= -1; }
            if(CheckOverlap(paddleRightIndex, ballIndex)) { ball.posX = paddleRight.posX - ball.width; cBall.speedX *= -1; }

    // Rebote en el perímetro

            if(ball.posX < gameArea.x) 
            {
                livesPlayer1--;
                if(livesPlayer1 <= 0) { SetState(stateSuccess); return; }
                else ResetBall();
            }
            else if(ball.posX + ball.width > gameArea.x + gameArea.width)
            {
                livesPlayer2--;
                if(livesPlayer2 <= 0) { SetState(stateSuccess); return; }
                else ResetBall();
            }

            // Vidas
            
            if(livesCounterHTML)
                livesCounterHTML.textContent = "Player1: " + livesPlayer1 + " | Player2: " + livesPlayer2;
        }
        
    }
}

///////////////////////////////////////////////////
//                  INPUT EVENTS                 //
///////////////////////////////////////////////////

function OnObjectClicked(object)
{
    if(state == stateWelcome && object.type == objectTypeButton)
    {
        SetState(statePlaying);
    }
    else if(state == statePlaying && object.type == objectTypePanel)
        {
            return;
        }
        
    else if(state == stateSuccess && object.type == objectTypeButton)
    {
        SetState(statePlaying);
    }
}


function CreateShapeSprite(type)
{
    var index = sprites.length;
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = "0px";
    div.style.top = "0px";

    if(type=="paddleLeft" || type=="paddleRight") { div.style.width="20px"; div.style.height="100px"; div.style.backgroundColor="blue"; }
    else if(type=="ball") { div.style.width="20px"; div.style.height="20px"; div.style.backgroundColor="red"; }
    else { div.style.width="50px"; div.style.height="50px"; div.style.backgroundColor="gray"; }

    sprites.push(div);
    minigame.appendChild(div);
    return index;
}


document.addEventListener('keydown', function(e){
    if(["ArrowUp","ArrowDown"].includes(e.key)) e.preventDefault();
    if(e.key == "w") inputWDown = true;
    if(e.key == "s") inputSDown = true;
    if(e.key == "ArrowUp") inputUpDownArrow = true;
    if(e.key == "ArrowDown") inputDownDownArrow = true;
});

document.addEventListener('keyup', function(e){
    if(e.key == "w") inputWDown = false;
    if(e.key == "s") inputSDown = false;
    if(e.key == "ArrowUp") inputUpDownArrow = false;
    if(e.key == "ArrowDown") inputDownDownArrow = false;
});
