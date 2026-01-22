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
    // SetCollisionEnabled(objectType1, objectType2, enabled) => Allows or disallows collisions between object types
    
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

var objectTypePlayer = 0;
var objectTypeEnemy  = 1;
var objectTypeBullet = 2;
var objectTypeScore  = 3;

var gameOver = false;
var musicIndex = -1;
var musicStarted = false;
var musicEnabled = false;
var audioUnlocked = false;
var shootSoundIndex = -1;

///////////////////////////////////////////////////
//              FIN DEL JUEGO                    //
///////////////////////////////////////////////////

function terminarJuego(win)
{
	if(gameOver) return;

	gameOver = true;

	var player = GetObject(FindObject("player"));
	var puntos = player.kills * 20;

	document.getElementById("tituloFinal").textContent =
		win ? "¡Has ganado!" : "¡Has perdido!";

	document.getElementById("resultadoFinal").textContent =
		"Puntuación: " + puntos;

	mostrarPantalla("pantallaFinal");
}

///////////////////////////////////////////////////
//              CREATE YOUR SCENE                //
///////////////////////////////////////////////////

function CreateScene()
{
	SetCollisionEnabled(objectTypeEnemy, objectTypeEnemy, false);

	CreateObject("player", objectTypePlayer, 400, 520, 50, 30);

	for(var i = 0; i < 6; i++) // filas
	{
		for(var x = 0; x < 10; x++) // columnas
		{
			CreateObject("enemy", objectTypeEnemy, 30 + x * 55, 30 + i * 50, 40, 30);
		}
	}

	CreateObject("score", objectTypeScore, 750, 10, 150, 30);

	shootSoundIndex = CreateSound("reference-sound.wav", false);
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
//              START YOUR OBJECTS               //
///////////////////////////////////////////////////

function StartObject(index)
{
	var o = objects[index];

	if(o.type == objectTypePlayer)
	{
		o.sprite = CreateSprite("nave.png", "ShipSprite");
		o.collider = CreateCollider(bodyTypeDynamic, false);
		o.kills = 0;
		o.shootCooldown = 0;
	}
	else if(o.type == objectTypeEnemy)
	{
		o.sprite = CreateSprite("alien.png", "EnemySprite");
		o.collider = CreateCollider(bodyTypeDynamic, false);
		o.directionX = 1;
	}
	else if(o.type == objectTypeBullet)
	{
		o.sprite = CreateSprite("bala.png", "BulletSprite");
		o.collider = CreateCollider(bodyTypeDynamic, false);
		o.width = 10;
		o.height = 20;
	}
	else if(o.type == objectTypeScore)
	{
		o.text = CreateText("Puntos: 0", "ScoreText");
	}
}

///////////////////////////////////////////////////
//              UPDATE YOUR OBJECTS              //
///////////////////////////////////////////////////

function UpdateObject(index)
{
	var o = objects[index];

	// -------- jugador ---------
	if(o.type == objectTypePlayer)
	{
		if(inputLeftPressed)  o.posX -= 400 * timeStep;
		if(inputRightPressed) o.posX += 400 * timeStep;

		o.posX = Math.max(0, Math.min(o.posX, 850));

		o.shootCooldown -= timeStep;

		if(inputUpPressed && o.shootCooldown <= 0)
		{
			var b = CreateObject("bullet", objectTypeBullet, o.posX + 20, o.posY - 20, 10, 20);
			StartObject(b);
			o.shootCooldown = 0.3;
			UnlockAudio();
			if(shootSoundIndex >= 0)
			{
				sounds[shootSoundIndex].currentTime = 0;
				PlaySound(shootSoundIndex);
			}
		}

		SetTextContent(
			GetObject(FindObject("score")).text,
			"Puntos: " + o.kills * 20
		);

		var enemiesLeft = 0;
		for(var i = 0; i < objects.length; i++)
		{
			if(objects[i].type == objectTypeEnemy && objects[i].posY < 900)
				enemiesLeft++;
		}

		if(enemiesLeft === 0)
		{
			terminarJuego(true);
		}
	}

	// -------- enemigo ---------
	else if(o.type == objectTypeEnemy)
	{
		o.posX += o.directionX * 100 * timeStep;

		// cambia dirección si llega al borde
		if(o.posX <= 0 || o.posX >= 860)
		{
			for(var i = 0; i < objects.length; i++)
			{
				if(objects[i].type == objectTypeEnemy)
				{
					objects[i].directionX *= -1;
					objects[i].posY += 30;
				}
			}
		}

		// ggame over si llegan abajo
		if(o.posY + o.height >= 520 && o.posY < 900)
		{
			terminarJuego(false);
		}
	}

	// ------- balas ---------
	else if(o.type == objectTypeBullet)
	{
		o.posY -= 400 * timeStep;
		if(o.posY < -20)
			objects.splice(index, 1);
	}
}

///////////////////////////////////////////////////
//                     CLICKS                    //
///////////////////////////////////////////////////

function OnObjectClicked(object)
{
	
}

function OnMusicButtonClick()
{
	UnlockAudio();
	if(!musicStarted)
	{
		musicEnabled = true;
		StartMusic();
		return;
	}
	ToggleMusic();
}

///////////////////////////////////////////////////
//              RESPOND TO COLLISIONS            //
///////////////////////////////////////////////////

function OnObjectCollision(object, otherObject)
{
	// bala mata enemigo
	if(object.type == objectTypeBullet && otherObject.type == objectTypeEnemy)
	{
		object.posY = -100;
		otherObject.posY = 1000;

		GetObject(FindObject("player")).kills++;
	}

	// jugador toca enemigo
	if(object.type == objectTypePlayer && otherObject.type == objectTypeEnemy)
	{
		terminarJuego(false);
	}
}
