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
    
    var objectTypeDino = 0;
	var objectTypeObstacle = 1;
	var objectTypeGround = 2;
	var objectTypeButton = 3;
	var objectTypeImage = 4;
	var objectTypeMusic = 5;
	var objectTypeSoundButton = 6;

    ///////////////////////////////////////////////////
    //      CREATE YOUR SCENE                //
    ///////////////////////////////////////////////////
	
	// Objetos del juego
	var dinoObject;
	var groundObject;
	var obstacles = [];
	
	// Sistema de animación del dino
	var dinoSprites = [];
	var currentDinoFrame = 0;
	var dinoAnimationTimer = 0;
	var dinoAnimationSpeed = 0.1; // Cambiar frame cada 0.1 segundos
	
	// Sistema de movimiento del fondo
	var backgroundPositionX = 0;
	var backgroundSpeed = 50; // Velocidad del desplazamiento del fondo
	
	//Control del juego
	var gameStarted = false;
	var isJumping = false;
	var jumpVelocity = 100;
	var jumpForce = 450;
	var gravity = 1500;
	var fallMultiplier = 5.0;
	var groundY = 420;
	var gameSpeed = 200;
	var distance = 0;
	var targetScore = 1000;
	var obstacleSpawnTimer = 0;
	var obstacleSpawnInterval = 6.5;
	var gameSpeedIncrease = 0;
	var gameTime = 0;
	
	//Objetos en la interfaz
	var welcomeImage;
	var gameBackgroundVideo;
	var gameBackgroundVideo2; // Segundo fondo para efecto de scroll infinito
	var startButton;
	var successImage;
	var loseImage;
	var retryButton;
	var exitButton;
	var musicObject;
	var gameMusicObject;
	var muteButton;
	var musicMuted = false;
	var distanceText; 
	var scorePanel; 
	var nameInputForm; 
	
	// Sistema de puntuaciones
	var playerName = "";
	var highScores = []; 
	var musicStarted = false;

//Estado del juego
	var stateUndefined = -1;
	var stateWelcome = 0;
	var statePlaying = 1;
	var stateSuccess = 2;
	var stateLose = 3;
	
	var state;
	
	// Funciones para gestionar puntuaciones
	function LoadHighScores()
	{
		var saved = localStorage.getItem('dinoRunScores');
		if(saved)
		{
			highScores = JSON.parse(saved);
		}
		else
		{
			highScores = [];
		}
	}
	
	function SaveHighScores()
	{
		localStorage.setItem('dinoRunScores', JSON.stringify(highScores));
	}
	
	function AddHighScore(name, dist)
	{
		highScores.push({name: name, distance: dist});
	
		highScores.sort(function(a, b) { return b.distance - a.distance; });
	
		if(highScores.length > 10)
		{
			highScores = highScores.slice(0, 10);
		}
		SaveHighScores();
		UpdateScorePanel();
	}
	
	function GetHighScoresText()
	{
		var text = "TOP 10 MEJORES DISTANCIAS:\n\n";
		for(var i = 0; i < highScores.length; i++)
		{
			text += (i + 1) + ". " + highScores[i].name + " - " + Math.floor(highScores[i].distance) + "m\n";
		}
		if(highScores.length == 0)
		{
			text += "No hay puntuaciones aún.";
		}
		return text;
	}
	
	function ShowNameInputForm()
	{
		if(!nameInputForm)
		{
			nameInputForm = document.createElement("div");
			nameInputForm.style.position = "absolute";
			nameInputForm.style.left = "50%";
			nameInputForm.style.top = "50%";
			nameInputForm.style.transform = "translate(-50%, -50%)";
			nameInputForm.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
			nameInputForm.style.padding = "30px";
			nameInputForm.style.borderRadius = "15px";
			nameInputForm.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.3)";
			nameInputForm.style.zIndex = "2000";
			nameInputForm.style.fontFamily = "Arial, sans-serif";
			nameInputForm.style.minWidth = "400px";
			
		nameInputForm.innerHTML = 
			"<div style='text-align: center;'>" +
			"<h2 style='color: #4CAF50; margin: 0 0 10px 0;'>¡Bienvenido!</h2>" +
			"<p style='color: #333; margin: 10px 0;'>Ingresa tu nombre para comenzar:</p>" +
				"<input type='text' id='playerNameInput' maxlength='20' style='width: 100%; padding: 12px; font-size: 16px; border: 2px solid #4CAF50; border-radius: 8px; box-sizing: border-box; margin: 10px 0;' placeholder='Tu nombre' required>" +
				"<p id='nameError' style='color: red; font-size: 14px; margin: 5px 0; min-height: 20px; visibility: hidden;'>Por favor, ingresa tu nombre</p>" +
				"<div style='margin-top: 20px;'>" +
				"<button id='submitNameBtn' style='background-color: #4CAF50; color: white; padding: 12px 30px; font-size: 16px; border: none; border-radius: 8px; cursor: pointer;'>Aceptar</button>" +
				"</div>" +
				"</div>";
			
			document.getElementById("minigame").appendChild(nameInputForm);
			

			document.getElementById('submitNameBtn').addEventListener('click', function() {
				var input = document.getElementById('playerNameInput');
				var errorMsg = document.getElementById('nameError');
				playerName = input.value.trim();
				
				if(!playerName || playerName === "") {
					
					errorMsg.style.visibility = "visible";
					input.style.borderColor = "red";
					input.focus();
					return;
				}
				
			
			nameInputForm.style.display = "none";
			SetState(statePlaying);
		});		
			document.getElementById('playerNameInput').addEventListener('keypress', function(e) {
				if(e.key === 'Enter') {
					document.getElementById('submitNameBtn').click();
				}
			});
			
			
			setTimeout(function() {
				document.getElementById('playerNameInput').focus();
			}, 100);
		}
		else
		{
			nameInputForm.style.display = "block";
			document.getElementById('playerNameInput').value = "";
			document.getElementById('playerNameInput').style.borderColor = "#4CAF50";
			document.getElementById('nameError').style.visibility = "hidden";
			document.getElementById('playerNameInput').focus();
		}
	}
	
	function UpdateScorePanel()
	{
		if(!scorePanel) return;
		
		var html = "<div style='font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #FFD700;'> TOP 10</div>";
		
		if(highScores.length == 0)
		{
			html += "<div style='color: #999; font-size: 12px;'>No hay puntuaciones</div>";
		}
		else
		{
			for(var i = 0; i < Math.min(10, highScores.length); i++)
			{
				var medal = "";
				if(i == 0) medal = "🥇 ";
				else if(i == 1) medal = "🥈 ";
				else if(i == 2) medal = "🥉 ";
				else medal = (i + 1) + "-";
				
				html += "<div style='font-size: 13px; margin: 5px 0; color: #fff;'>";
				html += medal + highScores[i].name + "<span style='float: right; color: #4CAF50;'>" + Math.floor(highScores[i].distance) + "m</span>";
				html += "</div>";
			}
		}
		
		scorePanel.innerHTML = html;
	}
	
	function CreateObstacle()
	{
		var obstacleHeight = 200;
		var obstacleWidth = 200;
		var obstacleY = 380;
		var obstacleX = 850;
		
		var objIndex = CreateObject("obstacle", objectTypeObstacle, obstacleX, obstacleY, obstacleWidth, obstacleHeight);
		var obj = GetObject(objIndex);
		obj.sprite = CreateSprite("obstaculo.png");
		ShowSprite(obj.sprite);
		
		
		var spriteElement = GetSprite(obj.sprite);
		if(spriteElement) {
			spriteElement.style.zIndex = "100";
		}
		
		console.log("Obstáculo creado en X:", obstacleX, "Y:", obstacleY);
		
		obstacles.push(objIndex);
	}
	
	function RemoveOffscreenObstacles()
	{
		for(var i = obstacles.length - 1; i >= 0; i--)
		{
			var obj = GetObject(obstacles[i]);
			if(obj.posX < -100)
			{
				HideSprite(obj.sprite);
				obstacles.splice(i, 1);
			}
		}
	}
	
	function CheckCollision()
	{
		for(var i = 0; i < obstacles.length; i++)
		{
			var obs = GetObject(obstacles[i]);
			

			var marginX = 80;  
			var marginY = 50;  
			
			if(dinoObject.posX + marginX < obs.posX + obs.width - marginX &&
			   dinoObject.posX + dinoObject.width - marginX > obs.posX + marginX &&
			   dinoObject.posY + marginY < obs.posY + obs.height - marginY &&
			   dinoObject.posY + dinoObject.height - marginY > obs.posY + marginY)
			{
				
				return true;
			}
		}
		return false;
	}

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
			HideSprite(exitButton.sprite);
			if(scorePanel) scorePanel.style.display = "none";
		}
		else if(state == stateLose)
		{
			HideSprite(loseImage.sprite);
			HideSprite(retryButton.sprite);
			HideSprite(exitButton.sprite);
			if(scorePanel) scorePanel.style.display = "none";
		}		
		else if(state == statePlaying)
		{
			StopSound(gameMusicObject.sound);
			if(gameBackgroundVideo) {
				gameBackgroundVideo.style.display = "none";
				gameBackgroundVideo2.style.display = "none";
			}
			if(dinoObject) 
			{
			
				for(var i = 0; i < dinoSprites.length; i++)
				{
					HideSprite(dinoSprites[i]);
				}
			}
			for(var i = 0; i < obstacles.length; i++)
			{
				var obs = GetObject(obstacles[i]);
				HideSprite(obs.sprite);
			}
			if(distanceText) distanceText.style.visibility = "hidden";
		}
		
		
		
		if(nextState == stateWelcome)
		{
			ShowSprite(welcomeImage.sprite);
			ShowSprite(startButton.sprite);
			ShowSprite(muteButton.sprite);
			if(scorePanel) scorePanel.style.display = "none";
		
			playerName = "";
		
			if(gameBackgroundVideo) {
				gameBackgroundVideo.style.display = "none";
				gameBackgroundVideo.pause();
				gameBackgroundVideo.currentTime = 0;
			}
			if(gameBackgroundVideo2) {
				gameBackgroundVideo2.style.display = "none";
				gameBackgroundVideo2.pause();
				gameBackgroundVideo2.currentTime = 0;
			}
			
	
			if(!musicMuted)
			{
				StopSound(gameMusicObject.sound);
				PlaySound(musicObject.sound);
				musicMuted = false;
				musicStarted = true;
			}
		}
		else if(nextState == statePlaying)
		{
			StopSound(musicObject.sound);
			PlaySound(gameMusicObject.sound);
			musicMuted = false;
			if(gameBackgroundVideo) {
				gameBackgroundVideo.style.display = "block";
				gameBackgroundVideo.play();
				gameBackgroundVideo2.style.display = "block";
				gameBackgroundVideo2.play();
			}
			InitGame();
			ShowSprite(muteButton.sprite);
			if(scorePanel) scorePanel.style.display = "none";
			distance = 0;
			gameSpeed = 300;
			
		
			if(!distanceText)
			{
				distanceText = document.createElement("div");
				distanceText.style.position = "absolute";
				distanceText.style.left = "350px";
				distanceText.style.top = "30px";
				distanceText.style.fontSize = "24px";
				distanceText.style.fontWeight = "bold";
				distanceText.style.color = "#ffffff";
				distanceText.style.textShadow = "2px 2px 4px #000000";
				document.getElementById("minigame").appendChild(distanceText);
			}
			distanceText.style.visibility = "visible";
		}
		else if(nextState == stateSuccess)
		{
			ShowSprite(successImage.sprite);
			ShowSprite(retryButton.sprite);
			ShowSprite(exitButton.sprite);
			ShowSprite(muteButton.sprite);
			if(scorePanel) scorePanel.style.display = "block";
			
			console.log("¡Juego completado! Distancia: " + Math.floor(distance) + "m");
			
		
			AddHighScore(playerName, distance);
		}
		else if(nextState == stateLose)
		{
			ShowSprite(loseImage.sprite);
			ShowSprite(retryButton.sprite);
			ShowSprite(exitButton.sprite);
			ShowSprite(muteButton.sprite);
			if(scorePanel) scorePanel.style.display = "block";
			
			console.log("¡Game Over! Distancia: " + Math.floor(distance) + "m");
			AddHighScore(playerName, distance);
		}
		
		state = nextState;
	}
    
    function InitGame()
    {
		for(var i = 0; i < obstacles.length; i++)
		{
			var obs = GetObject(obstacles[i]);
			HideSprite(obs.sprite);
		}
		obstacles = [];
		
		gameStarted = false;
		isJumping = false;
		jumpVelocity = 0;
		distance = 0;
		gameSpeed = 100;
		obstacleSpawnTimer = 0;
		obstacleSpawnInterval = 5.0;
		gameTime = 0;
		
	
		dinoAnimationTimer = 0;
		currentDinoFrame = 0;
	
		backgroundPositionX = 0;
		if(gameBackgroundVideo)
		{
			gameBackgroundVideo.style.left = "0px";
			gameBackgroundVideo2.style.left = "910px";
		}
		
	
		for(var i = 0; i < dinoSprites.length; i++)
		{
			HideSprite(dinoSprites[i]);
		}
		dinoObject.sprite = dinoSprites[0];
		ShowSprite(dinoObject.sprite);
		
	
		dinoObject.posY = groundY;
    }
    
    function CreateScene()
    {

		
		//////////// Welcome state //////////////
		
		var index = CreateObject("image-welcome", objectTypeImage, 0, -15, 910, 630);
		welcomeImage = GetObject(index);
		welcomeImage.sprite = CreateSprite("principal.png");				

		HideSprite(welcomeImage.sprite);
		
		index = CreateObject("button-start", objectTypeButton, 300, 400, 200, 100);
		startButton = GetObject(index);
		startButton.sprite = CreateSprite("start.png");	

		HideSprite(startButton.sprite);		
				
		//////////// Success state //////////////
		
	index = CreateObject("image-success", objectTypeImage, 0, 0, 910, 630);
	successImage = GetObject(index);
	successImage.sprite = CreateSprite("haz ganado.png");
	var successSprite = GetSprite(successImage.sprite);
	if(successSprite) successSprite.style.pointerEvents = "none";
	HideSprite(successImage.sprite);
	
	index = CreateObject("image-lose", objectTypeImage, 0, -15, 910, 630);
	loseImage = GetObject(index);
	loseImage.sprite = CreateSprite("haz perdido.png");
	var loseSprite = GetSprite(loseImage.sprite);
	if(loseSprite) loseSprite.style.pointerEvents = "none";
	HideSprite(loseImage.sprite);

	index = CreateObject("button-reset", objectTypeButton, 200, 420, 200, 80);
	retryButton = GetObject(index);
	retryButton.sprite = CreateSprite("reintentar.png");
	var retrySprite = GetSprite(retryButton.sprite);
	if(retrySprite) {
		retrySprite.style.zIndex = "10";
		retrySprite.style.pointerEvents = "auto";
	}
	HideSprite(retryButton.sprite);

	index = CreateObject("button-exit", objectTypeButton, 420, 420, 200, 80);
	exitButton = GetObject(index);
	exitButton.sprite = CreateSprite("salir.png");
	var exitSprite = GetSprite(exitButton.sprite);
	if(exitSprite) {
		exitSprite.style.zIndex = "10";
		exitSprite.style.pointerEvents = "auto";
	}
	HideSprite(exitButton.sprite);

	//////////// Playing state //////////////
	

	gameBackgroundVideo = document.createElement("video");
	gameBackgroundVideo.src = "images/juego.mp4";
	gameBackgroundVideo.loop = true;
	gameBackgroundVideo.muted = false;
	gameBackgroundVideo.autoplay = false;
	gameBackgroundVideo.style.position = "absolute";
	gameBackgroundVideo.style.left = "0px";
	gameBackgroundVideo.style.top = "-15px";
	gameBackgroundVideo.style.width = "910px";
	gameBackgroundVideo.style.height = "630px";
	gameBackgroundVideo.style.zIndex = "0";
	gameBackgroundVideo.style.objectFit = "cover";
	gameBackgroundVideo.style.display = "none";
	document.getElementById("minigame").appendChild(gameBackgroundVideo);
	
	
	gameBackgroundVideo2 = document.createElement("video");
	gameBackgroundVideo2.src = "images/juego.mp4";
	gameBackgroundVideo2.loop = true;
	gameBackgroundVideo2.muted = true;
	gameBackgroundVideo2.autoplay = false;
	gameBackgroundVideo2.style.position = "absolute";
	gameBackgroundVideo2.style.left = "910px"; 
	gameBackgroundVideo2.style.top = "-15px";
	gameBackgroundVideo2.style.width = "910px";
	gameBackgroundVideo2.style.height = "630px";
	gameBackgroundVideo2.style.zIndex = "0";
	gameBackgroundVideo2.style.objectFit = "cover";
	gameBackgroundVideo2.style.display = "none";
	document.getElementById("minigame").appendChild(gameBackgroundVideo2);
	
	index = CreateObject("music", objectTypeMusic, 0, 0, 0, 0);
	musicObject = GetObject(index);	musicObject.sound = CreateSound("Adventures inicio-final.mp3", true);
	
	index = CreateObject("music-game", objectTypeMusic, 0, 0, 0, 0);
	gameMusicObject = GetObject(index);
	gameMusicObject.sound = CreateSound("captain juego.mp3", true);

		index = CreateObject("dino", objectTypeDino, -55, groundY, 300, 150);
		dinoObject = GetObject(index);
		
		dinoSprites.push(CreateSprite("dino.png")); 
		dinoSprites.push(CreateSprite("dino2.png")); 
		dinoSprites.push(CreateSprite("dino3.png")); 
		
	
		for(var i = 0; i < dinoSprites.length; i++)
		{
			var dinoSprite = GetSprite(dinoSprites[i]);
			if(dinoSprite) dinoSprite.style.zIndex = "100";
			HideSprite(dinoSprites[i]);
		}
		
	
		dinoObject.sprite = dinoSprites[0];
		currentDinoFrame = 0;
		
		index = CreateObject("button-mute", objectTypeSoundButton, 700, 20, 60, 60);
		muteButton = GetObject(index);
		muteButton.sprite = CreateSprite("button-mute.png");
		HideSprite(muteButton.sprite);
		
	
		scorePanel = document.createElement("div");
		scorePanel.style.position = "absolute";
		scorePanel.style.right = "20px";
		scorePanel.style.top = "100px";
		scorePanel.style.width = "200px";
		scorePanel.style.padding = "15px";
		scorePanel.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
		scorePanel.style.border = "2px solid #FFD700";
		scorePanel.style.borderRadius = "10px";
		scorePanel.style.color = "#ffffff";
		scorePanel.style.fontFamily = "Arial, sans-serif";
		scorePanel.style.fontSize = "12px";
		scorePanel.style.zIndex = "1000";
		scorePanel.style.boxShadow = "0 0 20px rgba(255, 215, 0, 0.3)";
		document.getElementById("minigame").appendChild(scorePanel);
		
		
		LoadHighScores();
		UpdateScorePanel();
		
	
		var musicMessage = document.createElement("div");
		musicMessage.id = "musicMessage";
		musicMessage.style.position = "absolute";
		musicMessage.style.top = "40px";
		musicMessage.style.right = "200px";
		musicMessage.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
		musicMessage.style.color = "#ddd";
		musicMessage.style.padding = "5px 10px";
		musicMessage.style.borderRadius = "5px";
		musicMessage.style.fontSize = "11px";
		musicMessage.style.fontFamily = "Arial, sans-serif";
		musicMessage.style.zIndex = "999";
		musicMessage.style.textAlign = "right";
		musicMessage.style.whiteSpace = "nowrap";
		musicMessage.innerHTML = "Play/Pausa";
		document.getElementById("minigame").appendChild(musicMessage);
		
	
		state = stateUndefined;
		SetState(stateWelcome);
    }
    
    ///////////////////////////////////////////////////
    //              START YOUR OBJECTS               //
    ///////////////////////////////////////////////////
    
    function StartObject(index)
    {
        
    }
    
    ///////////////////////////////////////////////////
    //              UPDATE YOUR OBJECTS               //
    ///////////////////////////////////////////////////

    function UpdateObject(index)
    {
		var o = GetObject(index);
		

		if(state == statePlaying && o.type == objectTypeDino)
		{
	
			if(gameStarted && !isJumping && dinoObject.posY >= groundY)
			{
				dinoAnimationTimer += timeStep;
			
				var adjustedAnimSpeed = dinoAnimationSpeed * (200 / gameSpeed);
				
				if(dinoAnimationTimer >= adjustedAnimSpeed)
				{
				
					HideSprite(dinoSprites[currentDinoFrame]);
					
			
					currentDinoFrame = (currentDinoFrame + 1) % dinoSprites.length;
					
			
					dinoObject.sprite = dinoSprites[currentDinoFrame];
					ShowSprite(dinoObject.sprite);
					dinoAnimationTimer = 0;
				}
			}
			
			
			if((inputFirePressed || inputUpPressed) && !isJumping && dinoObject.posY >= groundY)
			{
				gameStarted = true;
				isJumping = true;
				jumpVelocity = -jumpForce;
			}
			
		
			if(isJumping || dinoObject.posY < groundY)
			{
				
				var currentGravity = gravity;
				if(jumpVelocity > 0) 
				{
					currentGravity *= fallMultiplier;
				}
				
				jumpVelocity += currentGravity * timeStep;
				dinoObject.posY += jumpVelocity * timeStep;
				
				// Limitar al suelo
				if(dinoObject.posY >= groundY)
				{
					dinoObject.posY = groundY;
					isJumping = false;
					jumpVelocity = 0;
				}
			}
		}
		

		if(state == statePlaying && o.type == objectTypeObstacle && gameStarted)
		{
			o.posX -= gameSpeed * timeStep;
		}
		
	
		if(state == statePlaying && o.type == objectTypeMusic)
		{

			if(gameStarted && gameBackgroundVideo)
			{
				backgroundPositionX -= backgroundSpeed * timeStep;
				
	
				var pos1 = backgroundPositionX % 910;
				var pos2 = pos1 + 910;
				
				gameBackgroundVideo.style.left = pos1 + "px";
				gameBackgroundVideo2.style.left = pos2 + "px";
			}
			
			if(gameStarted)
			{
				
				gameTime += timeStep;
				
				
				distance += gameSpeed * timeStep * 0.1;
				

				gameSpeed += 5 * timeStep;
				
				
				obstacleSpawnTimer += timeStep;
				if(obstacleSpawnTimer >= obstacleSpawnInterval)
				{
					if(gameTime < 30)
					{
					
						CreateObstacle();
					}
					else
					{
						
						CreateObstacle();
					
						var obstacleHeight = 200;
						var obstacleWidth = 200;
						var obstacleY = 380;
						var obstacleX = 850 + 200;
						
						var objIndex = CreateObject("obstacle", objectTypeObstacle, obstacleX, obstacleY, obstacleWidth, obstacleHeight);
						var obj = GetObject(objIndex);
						obj.sprite = CreateSprite("obstaculo.png");
						ShowSprite(obj.sprite);
						var spriteElement = GetSprite(obj.sprite);
						if(spriteElement) {
							spriteElement.style.zIndex = "100";
						}
						obstacles.push(objIndex);
					}
					
					obstacleSpawnTimer = 0;
				}
			}
			
			
			if(distanceText)
			{
			distanceText.textContent = Math.floor(distance) + "m";
		}
		
	
		if(distance >= targetScore)
		{
			SetState(stateSuccess);
			return;
		}
	}
			
		
			if(gameStarted && CheckCollision())
			{
				SetState(stateLose);
				return;
			}
		}
    
    
    ///////////////////////////////////////////////////
    //            RESPOND TO INPUT EVENTS            //
    ///////////////////////////////////////////////////
    
	function OnObjectClicked(object)
    {
	
		if(object.type == objectTypeSoundButton)
		{
		
			var musicMsg = document.getElementById("musicMessage");
			if(musicMsg && musicMsg.style.display !== "none")
			{
				musicMsg.style.display = "none";
			}
			
			if(musicMuted)
			{
				if(state == statePlaying)
				{
					PlaySound(gameMusicObject.sound);
				}
				else
				{
					PlaySound(musicObject.sound);
				}
				musicMuted = false;
				musicStarted = true;
				console.log("Música activada");
			}
			else
			{
				StopSound(musicObject.sound);
				StopSound(gameMusicObject.sound);
				musicMuted = true;
				console.log("Música silenciada");
			}
			return; 
		}

		if(state == stateWelcome)
		{
			if(object.type == objectTypeButton)
			{
				
				if(!playerName || playerName === "")
				{
					ShowNameInputForm();
				}
				else
				{
					SetState(statePlaying);
				}
			}
		}		
		else if(state == statePlaying)
		{
			
			
		}
		else if(state == stateSuccess || state == stateLose)
		{
			if(object.type == objectTypeButton)
			{
			
				if(object.name == "button-reset")
				{
					SetState(statePlaying);
				}

				else if(object.name == "button-exit")
				{
					SetState(stateWelcome);
				}
			}
		}		
		

        
    }
    
    ///////////////////////////////////////////////////
    //              RESPOND TO COLLISIONS            //
    ///////////////////////////////////////////////////
    
    function OnObjectCollision(object, otherObject)
    {
        // if(object.type == objectTypeBall)
        // {       
            // var c = GetCollider(object.collider);
            
            // if(Math.abs(c.speedX) > 50.0 || Math.abs(c.speedY) > 50.0)
            // {
                // PlaySound(object.sound);
            // }

        // }
    }