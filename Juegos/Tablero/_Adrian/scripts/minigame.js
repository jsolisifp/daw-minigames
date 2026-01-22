///////////////////////////////////////////////////
//       VARIABLES & FUNCTIONS YOU CAN USE       //
///////////////////////////////////////////////////

// timeStep  => Seconds passed between updates. Read only.

// GetObject(index)
// CreateObject(name, type, posX, posY, width, height)

// gravity => Read and write.

// GetCollider(index)
// CreateCollider(movementType, hasGravity) => Returns collider index

// GetSprite(index)
// CreateSprite(file)  => Returns sprite index
// ShowSprite(index)
// HideSprite(index)

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

// CreateSound(file, loop)  => Returns sound index
// PlaySound(index)
// StopSound(index)

// UtilsRandomRange(a, b)
// UtilsRandomRangeInt(a, b)

///////////////////////////////////////////////////
//              DEFINE YOUR OBJECT TYPES         //
///////////////////////////////////////////////////

var objectTypePanel  = 0;
var objectTypeManager = 1;
var objectTypeImage  = 2;
var objectTypeButton = 3;
var objectTypeMusic  = 4;

var boardSize = 4;

var timerValue   = 0;
var timerElement = null;
var timerId      = null;

///////////////////////////////////////////////////
//              CREATE YOUR SCENE                //
///////////////////////////////////////////////////

var music;

var welcomeImage;
var startButton;

var successImage;
var retryButton;

var panels;
var manager;

var emojiFiles;

var record = null;
var recordElement = null;


var stateUndefined = -1;
var statePlaying   = 0;
var stateSuccess   = 1;
var stateWelcome   = 2;

var state;

var firstPanel = null;
var lockInput  = false;

function SetState(nextState)
{
	// salir del estado anterior
	if(state == stateWelcome)
	{
		HideSprite(welcomeImage.sprite);
		HideSprite(startButton.sprite);
	}
	if(state == stateSuccess)
	{
		HideSprite(successImage.sprite);
		HideSprite(retryButton.sprite);
	}
	else if(state == statePlaying)
	{
		var i = 0;
		
		while(i < panels.length)
		{
			//borrado de todo para ir a success
			var p = panels[i];
			
			if(p.spriteBack >= 0)
			{
				HideSprite(p.spriteBack);
			}
			
			if(p.spriteFront >= 0)
			{
				HideSprite(p.spriteFront);
			}
			
			i ++;
		}
		
		StopSound(music.sound);
		StopTimer();
	}
	
	// entrar en el nuevo estado
	if(nextState == stateWelcome)
	{
		ShowSprite(welcomeImage.sprite);
		ShowSprite(startButton.sprite);
	}
	else if(nextState == statePlaying)
	{
		var faces = new Array();
		var i = 0;
		
		while(i < 8)
		{
			faces.push(i);
			faces.push(i);
			i ++;
		}
	
		var len = faces.length;
		var k = 0;
		
		while(k < len)
		{
			var r = UtilsRandomRangeInt(0, len - 1);
			var tmp = faces[k];
			faces[k] = faces[r];
			faces[r] = tmp;
			k ++;
		}
		
		k = 0;
		
		while(k < panels.length)
		{
			var p = panels[k];
			var faceIndex = faces[k];
			var file = emojiFiles[faceIndex];
			
			p.faceIndex  = faceIndex;
			p.isMatched  = false;
			p.isRevealed = false;
			
			if(p.spriteFront >= 0)
			{
				HideSprite(p.spriteFront);
			}
			
			p.spriteFront = CreateSprite(file);
			
			HideSprite(p.spriteFront);
			ShowSprite(p.spriteBack);
			
			p.sprite = p.spriteBack;
			
			k ++;
		}
		
		firstPanel = null;
		lockInput  = false;
		
		if(manager)
		{
			manager.matches = 0;
		}
		
		PlaySound(music.sound);
		StartTimer();
	}
	else if(nextState == stateSuccess)
	{
		ShowSprite(successImage.sprite);
		ShowSprite(retryButton.sprite);
	}
	
	state = nextState;
}


function CreateScene()
{
	console.log("Create scene");
	
	/////////// WELCOME STATE /////////
	
	var index = CreateObject("FlipIt.png", objectTypeImage, 250, 150, 400, 200);
	welcomeImage = GetObject(index);
	welcomeImage.sprite = CreateSprite("FlipIt.png");
	HideSprite(welcomeImage.sprite);
	
	index = CreateObject("Start.png", objectTypeButton, 350, 400, 200, 100);
	startButton = GetObject(index);
	startButton.sprite = CreateSprite("Start.png");
	HideSprite(startButton.sprite);
	
	/////////// SUCCESS STATE /////////
	
	index = CreateObject("Success.png", objectTypeImage, 250, 150, 400, 200);
	successImage = GetObject(index);
	successImage.sprite = CreateSprite("Success.png");
	HideSprite(successImage.sprite);
	
	index = CreateObject("Retry.png", objectTypeButton, 350, 400, 200, 100);
	retryButton = GetObject(index);
	retryButton.sprite = CreateSprite("Retry.png");
	HideSprite(retryButton.sprite);
	
	/////////// PLAYING STATE /////////
	
	index = CreateObject("music", objectTypeMusic, 0, 0, 0, 0);
	music = GetObject(index);
	music.sound = CreateSound("background.mp3", true);
	
	emojiFiles = new Array();
	emojiFiles.push("carita-angel.png");
	emojiFiles.push("carita-boca.png");
	emojiFiles.push("carita-chill.png");
	emojiFiles.push("carita-enojada-sus.png");
	emojiFiles.push("carita-lagrima.png");
	emojiFiles.push("carita-noboca.png");
	emojiFiles.push("carita-sonrojada.png");
	emojiFiles.push("carita-triste.png");
	
	panels = new Array();
	
	var i = 0;
	
	while(i < boardSize)
	{
		var j = 0;
		
		while(j < boardSize)
		{
			var indexPanel = CreateObject("panel-" + i + "-" + j, objectTypePanel, 340 + j * 64, 150 + i * 64, 64, 64);
			var o = GetObject(indexPanel);
			
			o.row = i;
			o.column = j;

			panels.push(o);
			
			j ++;
		}
		
		i ++;
	}
	
	index = CreateObject("manager", objectTypeManager, 0, 0, 0, 0);
	manager = GetObject(index);
	manager.soundSuccess = CreateSound("success.mp3", false);
	manager.matches = 0;
	
	timerElement = document.getElementById("number");
	
	if(timerElement)
	{
		timerElement.style.display = "none";
		timerElement.innerHTML = "0";
	}

		recordElement = document.getElementById("record");

	if(window.localStorage)
	{
		var stored = localStorage.getItem("record");
		
		if(stored != null)
		{
			record = parseInt(stored);
		}
	}
	if(recordElement)
	{
		if(record != null)
		{
			recordElement.innerHTML = "Mejor: " + record + " s";
		}
		else
		{
			recordElement.innerHTML = "Mejor: -";
		}
	}

	state = stateUndefined;
	SetState(stateWelcome);
}

//////////////////////////////
//      FUNCION CONTADOR    //
//////////////////////////////

function StartTimer()
{
	//evitar duplicados
	if(!timerElement) return;
	
	if(timerId != null)
	{
		window.clearInterval(timerId);
	}
	
	timerValue = 0;
	timerElement.innerHTML = timerValue;
	timerElement.style.display = "block";
	
	timerId = window.setInterval(function(){
		timerElement.innerHTML = timerValue;
		timerValue ++;
	}, 1000);
}

function StopTimer()
{
	if(!timerElement) return;
	
	if(timerId != null)
	{
		window.clearInterval(timerId);
		timerId = null;
	}
	
	timerValue = 0;
	timerElement.innerHTML = timerValue;
	timerElement.style.display = "none";
}

///////////////////////////////////////////////////
//              START YOUR OBJECTS               //
///////////////////////////////////////////////////

function StartObject(index)
{
	var o = GetObject(index);
	
	if(o.type == objectTypePanel)
	{
		o.sound = CreateSound("click.wav", false);
		
		o.spriteBack = CreateSprite("panel-off.png");
		HideSprite(o.spriteBack);
		
	}
}

///////////////////////////////////////////////////
//              UPDATE YOUR OBJECTS              //
///////////////////////////////////////////////////

function UpdateObject(index)
{
	var o = GetObject(index);
	
	if(o.type == objectTypeManager)
		{
			if(state == statePlaying)
			{
				//condicion de victoria
				if(o.matches >= 8 || inputFirePressed)
				{
		
					var finalTime = timerValue;
					
					// actualizar mejor puntuación
					if(record == null || finalTime < record)
					{
						record = finalTime;
						
						if(window.localStorage)
						{
							localStorage.setItem("record", record);
						}
					}
					
					// actualizar texto en pantalla, si existe
					if(recordElement)
					{
						recordElement.innerHTML = "Mejor: " + record + " s";
					}
					
					PlaySound(o.soundSuccess);
					SetState(stateSuccess);
				}
			}
		}		
		if(inputLeftPressed){
			localStorage.clear("record")
		}
}

///////////////////////////////////////////////////
//            RESPOND TO INPUT EVENTS            //
///////////////////////////////////////////////////

function OnObjectClicked(object)
{
	if(state == stateWelcome)
	{
		if(object.type == objectTypePanel || object.type == objectTypeButton)
		{
			SetState(statePlaying);
		}
	}
	else if(state == statePlaying)
	{
		if(object.type == objectTypePanel)
		{
			if(lockInput) return;
			if(object.isMatched) return;
			if(object.isRevealed) return;
			
			PlaySound(object.sound);
			
			// enseñar la cara
			HideSprite(object.spriteBack);
			ShowSprite(object.spriteFront);
			
			object.sprite     = object.spriteFront;
			object.isRevealed = true;
			
			if(firstPanel == null)
			{
				firstPanel = object;
			}
			else
			{
				if(firstPanel == object)
				{

				}
				else if(firstPanel.faceIndex == object.faceIndex)
				{
					// pareja correcta
					firstPanel.isMatched = true;
					object.isMatched     = true;
					
					if(manager)
					{
						manager.matches ++;
					}
					
					firstPanel = null;
				}
				else
				{
					// pareja incorrecta, se tapan otra vez
					lockInput = true;
					
					var a = firstPanel;
					var b = object;
					
					window.setTimeout(function(){
						
						if(!a.isMatched)
						{
							HideSprite(a.spriteFront);
							ShowSprite(a.spriteBack);
							a.sprite     = a.spriteBack;
							a.isRevealed = false;
						}
						
						if(!b.isMatched)
						{
							HideSprite(b.spriteFront);
							ShowSprite(b.spriteBack);
							b.sprite     = b.spriteBack;
							b.isRevealed = false;
						}
						
						firstPanel = null;
						lockInput  = false;
						
					}, 850);
				}
			}
		}
	}
	else if(state == stateSuccess)
	{
		if(object.type == objectTypeButton)
		{
			SetState(statePlaying);
		}
	}
}

///////////////////////////////////////////////////
//              RESPOND TO COLLISIONS            //
///////////////////////////////////////////////////

function OnObjectCollision(object, otherObject)
{
	// Ejemplo por si usas físicas en otro juego:
	// if(object.type == objectTypeBall)
	// {
	//     var c = GetCollider(object.collider);
	//     
	//     if(Math.abs(c.speedX) > 50.0 || Math.abs(c.speedY) > 50.0)
	//     {
	//         PlaySound(object.sound);
	//     }
	// }
}
