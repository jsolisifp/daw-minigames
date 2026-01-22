////////////////////////////////////////////////////////////////////////////////
//                                MINIENGINE                                 //
////////////////////////////////////////////////////////////////////////////////
// Motor genérico sin lógica del juego
// ----------------------------------------------------------------------------

var minigame;

var fps = 30;
var timeStep;

// Scene
var objects;

// Render
var sprites;

// Physics
var colliders;

var bodyTypeDynamic = 0;
var bodyTypeKinematic = 1;

var gravity = 500.0;

// Sound
var sounds;

// Input
var inputMouseClick = false;
var inputMouseClickX = 0;
var inputMouseClickY = 0;

var inputMouseRightClick = false;
var inputMouseRightX = 0;
var inputMouseRightY = 0;

///////////////////////////////////////////////////////////////////////////////
// INPUT
///////////////////////////////////////////////////////////////////////////////

function InitInput()
{
    document.addEventListener("click", MiniengineOnLeftClick);

    document.addEventListener("contextmenu", function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
    });

    document.addEventListener("mousedown", function(e){
        if (e.button === 2) {
            e.preventDefault();
            inputMouseRightClick = true;
            inputMouseRightX = e.pageX;
            inputMouseRightY = e.pageY;
        }
    });
}

function MiniengineOnLeftClick(e)
{
    inputMouseClick = true;
    inputMouseClickX = e.pageX;
    inputMouseClickY = e.pageY;
}

function InputUpdate()
{
    if (!objects) return;

    if (inputMouseClick || inputMouseRightClick)
    {
        for (let i = 0; i < objects.length; i++)
        {
            let o = objects[i];
            if (o.sprite < 0) continue;

            let rect = sprites[o.sprite].getBoundingClientRect();
            let x = rect.left + window.scrollX;
            let y = rect.top + window.scrollY;

            let insideLeft =
                inputMouseClick &&
                inputMouseClickX >= x && inputMouseClickX <= x + rect.width &&
                inputMouseClickY >= y && inputMouseClickY <= y + rect.height;

            let insideRight =
                inputMouseRightClick &&
                inputMouseRightX >= x && inputMouseRightX <= x + rect.width &&
                inputMouseRightY >= y && inputMouseRightY <= y + rect.height;

            if (insideLeft) OnObjectClicked(o, false);
            if (insideRight) OnObjectClicked(o, true);
        }
    }
}

function InputClear()
{
    inputMouseClick = false;
    inputMouseRightClick = false;
}

///////////////////////////////////////////////////////////////////////////////
// PHYSICS
///////////////////////////////////////////////////////////////////////////////

function InitPhysics()
{
    colliders = [];
}

function PhysicsUpdate()
{
    for (let i = 0; i < objects.length; i++)
        UpdatePhysics(i);
}

function UpdatePhysics(index)
{
    let o = objects[index];
    if (o.collider < 0) return;

    let c = colliders[o.collider];

    if (c.movementType == bodyTypeDynamic)
    {
        if (c.hasGravity)
            c.speedY += gravity * timeStep;

        o.posX += c.speedX * timeStep;
        o.posY += c.speedY * timeStep;
    }
}

function CreateCollider(movementType, hasGravity)
{
    let index = colliders.length;
    colliders.push({
        movementType,
        hasGravity,
        speedX: 0,
        speedY: 0,
        bounciness: 0.5
    });
    return index;
}

///////////////////////////////////////////////////////////////////////////////
// RENDER
///////////////////////////////////////////////////////////////////////////////

function InitRender()
{
    sprites = [];
}

function RenderUpdate()
{
    for (let i = 0; i < objects.length; i++)
        UpdateRender(i);
}

function UpdateRender(i)
{
    let o = objects[i];
    if (o.sprite < 0) return;

    let s = sprites[o.sprite];
    s.style.left = o.posX + "px";
    s.style.top = o.posY + "px";
    s.style.width = o.width + "px";
    s.style.height = o.height + "px";
}

function CreateSprite(file)
{
    let index = sprites.length;
    let img = document.createElement("img");

    img.src = "images/" + file;
    img.style.position = "absolute";
    img.draggable = false;

    sprites.push(img);
    minigame.appendChild(img);

    return index;
}

///////////////////////////////////////////////////////////////////////////////
// SCENE
///////////////////////////////////////////////////////////////////////////////

function InitScene()
{
    objects = [];
}

function CreateObject(name, type, x, y, w, h)
{
    let index = objects.length;
    objects.push({
        name,
        type,
        posX: x,
        posY: y,
        width: w,
        height: h,
        sprite: -1,
        collider: -1
    });
    return index;
}

///////////////////////////////////////////////////////////////////////////////
// SOUND
///////////////////////////////////////////////////////////////////////////////

function InitSound()
{
    sounds = [];
}

function CreateSound(file, loop)
{
    let index = sounds.length;

    let audio = document.createElement("audio");
    audio.src = "sounds/" + file;
    audio.loop = loop;
    audio.volume = window.gameConfig.musicVolume;

    sounds.push(audio);
    document.body.appendChild(audio);

    return index;
}

function PlaySound(i)
{
    sounds[i].play();
}

function StopSound(i)
{
    sounds[i].pause();
    sounds[i].currentTime = 0;
}

///////////////////////////////////////////////////////////////////////////////
// UTILS (NECESARIOS PARA MINIGAME)
///////////////////////////////////////////////////////////////////////////////

function UtilsRandomRange(a, b)
{
    return a + (b - a) * Math.random();
}

function UtilsRandomRangeInt(a, b)
{
    let r = a + Math.floor((b - a) * Math.random());
    if (r === b) r--;
    return r;
}

// -----------------------------
// HUD (Timer + Clicks)
// -----------------------------

let timerInterval = null;
let elapsedTime = 0;
let leftClicks = 0;
let rightClicks = 0;

function ResetHUD() {
    elapsedTime = 0;
    leftClicks = 0;
    rightClicks = 0;

    document.getElementById("timer").textContent = elapsedTime;
    document.getElementById("leftClicks").textContent = leftClicks;
    document.getElementById("rightClicks").textContent = rightClicks;
}

function StartTimer() {
    timerInterval = setInterval(() => {
        elapsedTime++;
        document.getElementById("timer").textContent = elapsedTime;
    }, 1000);
}

function StopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

///////////////////////////////////////////////////////////////////////////////
// SYSTEM
///////////////////////////////////////////////////////////////////////////////

function MiniengineInit()
{
    minigame = document.getElementById("minigame");

    InitInput();
    InitScene();
    InitRender();
    InitPhysics();
    InitSound();

    CreateScene();

    for (let i = 0; i < objects.length; i++)
        StartObject(i);

    StartScene();

    timeStep = 1 / fps;
    setInterval(MiniengineUpdate, 1000 / fps);
}

function MiniengineUpdate()
{
    InputUpdate();
    SceneUpdate();
    PhysicsUpdate();
    RenderUpdate();
    InputClear();
}

///////////////////////////////////////////////////////////////////////////////
// EXPOSE TO GLOBAL SCOPE (IMPORTANT FOR MINIGAME)
///////////////////////////////////////////////////////////////////////////////

window.CreateObject = CreateObject;
window.GetObject = () => objects;

window.CreateSprite = CreateSprite;
window.GetSprite = (i) => sprites[i];

window.CreateCollider = CreateCollider;
window.GetCollider = (i) => colliders[i];

window.PlaySound = PlaySound;
window.StopSound = StopSound;
window.CreateSound = CreateSound;

window.UtilsRandomRange = UtilsRandomRange;
window.UtilsRandomRangeInt = UtilsRandomRangeInt;

window.MiniengineInit = MiniengineInit;
