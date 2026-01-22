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
	//       VARIABLES & FUNCTIONS YOU CAN USE       //
	///////////////////////////////////////////////////

// (todo este bloque se mantiene igual)

///////////////////////////////////////////////////
//              DEFINE YOUR OBJECT TYPES         //
///////////////////////////////////////////////////

var objectTypePanel = 0;
var objectTypeManager = 1;
var objectTypeImage = 2;
var objectTypeButton = 3;

///////////////////////////////////////////////////
//              GLOBAL VARIABLES                 //
///////////////////////////////////////////////////

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

var firstPanel = null;
var secondPanel = null;
var lockInput = false;

var pendingHide = false;
var waitTime = 0;
var waitMax = 1.0;

var isMuted = false;
var muteButtonHTML;

var maxLives = 5;
var currentLives = maxLives;
var livesCounterHTML;

///////////////////////////////////////////////////
//                 UTILS                         //
///////////////////////////////////////////////////

function Shuffle(array)
{
	for(var i = array.length - 1; i > 0; i--)
	{
		var j = UtilsRandomRangeInt(0, i);
		var t = array[i];
		array[i] = array[j];
		array[j] = t;
	}
}

function SetPanelOff(panel)
{
	HideSprite(panel.spriteOn);
	panel.sprite = panel.spriteOff;
	ShowSprite(panel.sprite);
	table[panel.row][panel.column] = false;
}

function SetPanelOn(panel)
{
	HideSprite(panel.spriteOff);
	panel.sprite = panel.spriteOn;
	ShowSprite(panel.sprite);
	table[panel.row][panel.column] = true;
}

function GenerateMemoryTable()
{
	var values = [];

	for(var i = 1; i <= 8; i++)
	{
		values.push(i);
		values.push(i);
	}

	Shuffle(values);

	var k = 0;
	for(var i = 0; i < 4; i++)
	{
		for(var j = 0; j < 4; j++)
		{
			table[i][j] = false;
			panels[k].value = values[k];
			k++;
		}
	}

	firstPanel = null;
	secondPanel = null;
	lockInput = false;
	pendingHide = false;
	waitTime = 0;
}

///////////////////////////////////////////////////
//                STATE SYSTEM                   //
///////////////////////////////////////////////////

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
        for(var i = 0; i < panels.length; i++)
            HideSprite(panels[i].sprite);
    }

    if(nextState == stateWelcome)
    {
        ShowSprite(welcomeImage.sprite);
        ShowSprite(startButton.sprite);
    }
    else if(nextState == statePlaying)
    {
        currentLives = maxLives;
        if(livesCounterHTML)
            livesCounterHTML.textContent = "Vidas: " + currentLives;

        GenerateMemoryTable();

        for(var i = 0; i < panels.length; i++)
        {
            panels[i].spriteOn = CreateSprite("L" + panels[i].value + ".png");
            HideSprite(panels[i].spriteOn);
            panels[i].sprite = panels[i].spriteOff;
            ShowSprite(panels[i].sprite);
        }

        if(music && !isMuted && music.paused)
            music.play();
    }
    else if(nextState == stateSuccess)
    {
        ShowSprite(successImage.sprite);
        ShowSprite(retryButton.sprite);
    }

    state = nextState;
}


///////////////////////////////////////////////////
//              CREATE SCENE                     //
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

    index = CreateObject("image-success", objectTypeImage, 200, 200, 400, 200);
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
        if(isMuted) {
            music.pause();
        } else {
            music.play();
        }
    });

    livesCounterHTML = document.getElementById("livesCounter");
    if(livesCounterHTML)
        livesCounterHTML.textContent = "Vidas: " + currentLives;

    state = stateUndefined;
    SetState(stateWelcome);
}



///////////////////////////////////////////////////
//              START OBJECT                     //
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
//              UPDATE OBJECT                    //
///////////////////////////////////////////////////

function UpdateObject(index)
{
	var o = GetObject(index);

	if(o.type == objectTypeManager && state == statePlaying)
	{
		if(pendingHide)
		{
			waitTime += timeStep;

			if(waitTime >= waitMax)
			{
				SetPanelOff(firstPanel);
				SetPanelOff(secondPanel);

				firstPanel = null;
				secondPanel = null;
				lockInput = false;
				pendingHide = false;

				currentLives--;
				if(currentLives < 0) currentLives = 0;
				if(livesCounterHTML)
					livesCounterHTML.textContent = "Vidas: " + currentLives;

				if(currentLives <= 0)
					SetState(stateSuccess);
			}
		}

		var finished = true;
		for(var i = 0; i < 4; i++)
			for(var j = 0; j < 4; j++)
				if(!table[i][j]) finished = false;

		if(finished)
		{
			PlaySound(o.soundSuccess);
			SetState(stateSuccess);
		}
	}
}

///////////////////////////////////////////////////
//              INPUT EVENTS                     //
///////////////////////////////////////////////////

function OnObjectClicked(object)
{
	if(state == stateWelcome && object.type == objectTypeButton)
	{
		SetState(statePlaying);
	}
	else if(state == statePlaying && object.type == objectTypePanel && !lockInput)
	{
		if(table[object.row][object.column]) return;

		PlaySound(object.sound);
		SetPanelOn(object);

		if(firstPanel == null)
		{
			firstPanel = object;
		}
		else
		{
			secondPanel = object;
			lockInput = true;

			if(firstPanel.value == secondPanel.value)
			{
				firstPanel = null;
				secondPanel = null;
				lockInput = false;
			}
			else
			{
				pendingHide = true;
				waitTime = 0;
			}
		}
	}
	else if(state == stateSuccess && object.type == objectTypeButton)
	{
		SetState(statePlaying);
	}
}

