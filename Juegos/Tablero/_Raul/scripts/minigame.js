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
    
    var objectTypeCard = 0;
	var objectTypeButton = 1;
	var objectTypeImage = 2;
	var objectTypeMusic = 3;
	var objectTypeSoundButton = 4;

    ///////////////////////////////////////////////////
    //              CREATE YOUR SCENE                //
    ///////////////////////////////////////////////////
	
	var cards;
	var cardObjects = []; 
	
	//Control del juego
	var firstCard = null;
	var secondCard = null;
	var pairsFound = 0;
	var inputLocked = false;
	var timer = 0;
	var maxTime = 40.0; 
	var flipDelay = 0.25; 
	var flipTimer = 0;
	
	//Objetos en la interfaz
	var welcomeImage;
	var startButton;
	var successImage;
	var loseImage;
	var retryButton;
	var musicObject;
	var muteButton;
	var musicMuted = false;
	var timerText; 
	var scorePanel; 
	var nameInputForm; 
	
	// Sistema de puntuaciones
	var playerName = "";
	var highScores = []; 
	var musicStarted = false;
	var playerName = ""; 

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
		var saved = localStorage.getItem('memoryGameScores');
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
		localStorage.setItem('memoryGameScores', JSON.stringify(highScores));
	}
	
	function AddHighScore(name, time)
	{
		highScores.push({name: name, time: time});
	
		highScores.sort(function(a, b) { return a.time - b.time; });
	
		if(highScores.length > 10)
		{
			highScores = highScores.slice(0, 10);
		}
		SaveHighScores();
		UpdateScorePanel();
	}
	
	function GetHighScoresText()
	{
		var text = "TOP 10 MEJORES TIEMPOS:\n\n";
		for(var i = 0; i < highScores.length; i++)
		{
			text += (i + 1) + ". " + highScores[i].name + " - " + highScores[i].time.toFixed(2) + "s\n";
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
				if(i == 0) medal = "1-";
				else if(i == 1) medal = "2-";
				else if(i == 2) medal = "3-";
				else medal = (i + 1) + "-";
				
				html += "<div style='font-size: 13px; margin: 5px 0; color: #fff;'>";
				html += medal + highScores[i].name + "<span style='float: right; color: #4CAF50;'>" + highScores[i].time.toFixed(2) + "s</span>";
				html += "</div>";
			}
		}
		
		scorePanel.innerHTML = html;
	}
    
    function FlipCard(card)
    {
        if(!card.isFlipped && !card.isMatched)
        {
            card.isFlipped = true;
            HideSprite(card.spriteBack);
            card.sprite = card.spriteFront;
            ShowSprite(card.spriteFront);
        }
    }
	
	function UnflipCard(card)
	{
		if(card.isFlipped && !card.isMatched)
		{
			card.isFlipped = false;
			HideSprite(card.spriteFront);
			card.sprite = card.spriteBack;
			ShowSprite(card.spriteBack);
		}
	}
	
	function HideAllCards()
	{
		for(var i = 0; i < cardObjects.length; i++)
		{
			var card = GetObject(cardObjects[i]);
			HideSprite(card.sprite);
			if(card.spriteFront) HideSprite(card.spriteFront);
			if(card.spriteBack) HideSprite(card.spriteBack);
		}
	}

	function CreateCardObject(posX, posY, value)
	{
	
		var objIndex = CreateObject("card", objectTypeCard, posX, posY, 100, 100);
		var obj = GetObject(objIndex);
		
		
		obj.cardValue = value; 
		
	
		obj.isFlipped = false;
		obj.isMatched = false; 


		
		obj.spriteBack = CreateSprite("card_back.png"); 
		obj.spriteFront = CreateSprite("card_" + value + ".png"); 
		
		
		var spriteBackElement = GetSprite(obj.spriteBack);
		var spriteFrontElement = GetSprite(obj.spriteFront);
		spriteBackElement.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3), 0 6px 20px rgba(0, 0, 0, 0.19)";
		spriteBackElement.style.borderRadius = "10px";
		spriteFrontElement.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3), 0 6px 20px rgba(0, 0, 0, 0.19)";
		spriteFrontElement.style.borderRadius = "10px";
		
	
		obj.sprite = obj.spriteBack;
		HideSprite(obj.spriteFront); 
		
		return objIndex;
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
		}
		else if(state == stateLose)
		{
			HideSprite(loseImage.sprite);
			HideSprite(retryButton.sprite);
		}		
		else if(state == statePlaying)
		{
			HideAllCards();
			if(timerText) timerText.style.visibility = "hidden";
		}
		
		
		
		if(nextState == stateWelcome)
		{
			ShowSprite(welcomeImage.sprite);
			ShowSprite(startButton.sprite);
			ShowSprite(muteButton.sprite);
		
			playerName = "";
		}
		else if(nextState == statePlaying)
		{
			InitGame();
			ShowSprite(muteButton.sprite);
			timer = 0;
			
		
			if(!timerText)
			{
				timerText = document.createElement("div");
				timerText.style.position = "absolute";
				timerText.style.left = "350px";
				timerText.style.top = "30px";
				timerText.style.fontSize = "24px";
				timerText.style.fontWeight = "bold";
				timerText.style.color = "#ffffff";
				timerText.style.textShadow = "2px 2px 4px #000000";
				document.getElementById("minigame").appendChild(timerText);
			}
			timerText.style.visibility = "visible";
			timerText.style.color = "#ffffff";
		}
		else if(nextState == stateSuccess)
		{
			ShowSprite(successImage.sprite);
			ShowSprite(retryButton.sprite);
			ShowSprite(muteButton.sprite);
			
			console.log("¡Juego completado en " + timer.toFixed(2) + " segundos!");
			
		
			AddHighScore(playerName, timer);
		}
		else if(nextState == stateLose)
		{
			ShowSprite(loseImage.sprite);
			ShowSprite(retryButton.sprite);
			ShowSprite(muteButton.sprite);
			
			console.log("¡Tiempo agotado! Has perdido.");
		}
		
		state = nextState;
	}
    
    function InitGame()
    {
     
        HideAllCards();
        
      
        cards = []; 
        cardObjects = [];
        firstCard = null;
        secondCard = null;
        pairsFound = 0;
        inputLocked = false;
        flipTimer = 0;

      
        for(var i = 0; i < 8; i++)
        {
            cards.push(i);
            cards.push(i);
        }


        for(var i = 0; i < cards.length; i++)
        {
            var randomIndex = UtilsRandomRangeInt(0, cards.length - 1);
            
            var temp = cards[i];
            cards[i] = cards[randomIndex];
            cards[randomIndex] = temp;
        }

       
        var index = 0;
        var startX = 150;
        var startY = 100;
        var spacing = 110;

        for(var row = 0; row < 4; row++)
        {
            for(var col = 0; col < 4; col++)
            {
                var cardValue = cards[index];
                var cardIndex = CreateCardObject(col * spacing + startX, row * spacing + startY, cardValue);
                cardObjects.push(cardIndex);
                
                index++;
            }
        }
    }
    
    function CreateScene()
    {
        console.log("Create scene");
		
		//////////// Welcome state //////////////
		
		var index = CreateObject("image-welcome", objectTypeImage, 150, 150, 500, 250);
		welcomeImage = GetObject(index);
		welcomeImage.sprite = CreateSprite("welcome.png");				

		HideSprite(welcomeImage.sprite);
		
		index = CreateObject("button-start", objectTypeButton, 300, 400, 200, 100);
		startButton = GetObject(index);
		startButton.sprite = CreateSprite("buton-init.png");	

		HideSprite(startButton.sprite);		
				
		//////////// Success state //////////////
		
		index = CreateObject("image-success", objectTypeImage, 200, 200, 400, 200);
		successImage = GetObject(index);
		successImage.sprite = CreateSprite("success.png");		
		HideSprite(successImage.sprite);
		
		index = CreateObject("image-lose", objectTypeImage, 200, 200, 400, 200);
		loseImage = GetObject(index);
		loseImage.sprite = CreateSprite("you-lose.png");		
		HideSprite(loseImage.sprite);

		index = CreateObject("button-reset", objectTypeButton, 300, 420, 200, 80);
		retryButton = GetObject(index);
		retryButton.sprite = CreateSprite("button-reset.png");		
		HideSprite(retryButton.sprite);

		//////////// Playing state //////////////
		
		index = CreateObject("music", objectTypeMusic, 0, 0, 0, 0);
		musicObject = GetObject(index);
		musicObject.sound = CreateSound("background.mp3", true);
		
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
		musicMessage.innerHTML = "doble clic en la bocina para iniciar cancion";
		document.getElementById("minigame").appendChild(musicMessage);
		
	
		state = stateUndefined;
		SetState(stateWelcome);
    }
    
    ///////////////////////////////////////////////////
    //              START YOUR OBJECTS               //
    ///////////////////////////////////////////////////
    
    function StartObject(index)
    {
        // No necesitamos inicializar nada especial por objeto
    }
    
    ///////////////////////////////////////////////////
    //              UPDATE YOUR OBJECTS               //
    ///////////////////////////////////////////////////

    function UpdateObject(index)
    {
		var o = GetObject(index);
		
	
		if(state == statePlaying && o.type == objectTypeMusic)
		{
			timer += timeStep;
			if(timerText)
			{
				var remainingTime = maxTime - timer;
				if(remainingTime <= 0)
				{
					timerText.textContent = "Tiempo: 0.0s";
				}
				else
				{
					timerText.textContent = "Tiempo: " + remainingTime.toFixed(1) + "s";
				}
				
				
				if(remainingTime <= 10)
				{
					timerText.style.color = "#ff0000";
				}
				else if(remainingTime <= 20)
				{
					timerText.style.color = "#ff9800";
				}
			}
			
			
			if(timer >= maxTime)
			{
				SetState(stateLose);
				return;
			}
			
		
			if(inputLocked)
			{
				flipTimer += timeStep;
				
				if(flipTimer >= flipDelay)
				{
				
					UnflipCard(firstCard);
					UnflipCard(secondCard);
					
					firstCard = null;
					secondCard = null;
					inputLocked = false;
					flipTimer = 0;
				}
			}
			
			
			if(pairsFound >= 8)
			{
				SetState(stateSuccess);
			}
		}
    }
    
    ///////////////////////////////////////////////////
    //            RESPOND TO INPUT EVENTS            //
    ///////////////////////////////////////////////////
    
	function OnObjectClicked(object)
    {
		console.log("Clicked " + object.name);
		console.log("State " + state);

	
		if(object.type == objectTypeSoundButton)
		{
		
			var musicMsg = document.getElementById("musicMessage");
			if(musicMsg && musicMsg.style.display !== "none")
			{
				musicMsg.style.display = "none";
			}
			
			if(musicMuted)
			{
				PlaySound(musicObject.sound);
				musicMuted = false;
				musicStarted = true;
				console.log("Música activada");
			}
			else
			{
				StopSound(musicObject.sound);
				musicMuted = true;
				console.log("Música silenciada");
			}
			return; 
		}

		if(state == stateWelcome)
		{
			if(object.type == objectTypeButton)
			{
				
				ShowNameInputForm();
			}
		}		
		else if(state == statePlaying)
		{
			if(object.type == objectTypeCard)
			{
			
				if(inputLocked) return;
				
				
				if(object.isFlipped || object.isMatched) return;
				
				if(firstCard != null && secondCard != null) return;
	
				FlipCard(object);

				if(firstCard == null)
				{
					firstCard = object;
				}
			
				else if(secondCard == null && object != firstCard)
				{
					secondCard = object;
					
			
					inputLocked = true;
			
					if(firstCard.cardValue == secondCard.cardValue)
					{
				
						console.log("¡Pareja encontrada! Valor: " + firstCard.cardValue);
						
						firstCard.isMatched = true;
						secondCard.isMatched = true;
						
						pairsFound++;
						console.log("Parejas encontradas: " + pairsFound + "/8");
						
				
						firstCard = null;
						secondCard = null;
						inputLocked = false;
					}
					else
					{
	
						console.log("No es pareja. Valores: " + firstCard.cardValue + " y " + secondCard.cardValue);
						flipTimer = 0;
					}
				}
			}
		}
		else if(state == stateSuccess || state == stateLose)
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
        // if(object.type == objectTypeBall)
        // {       
            // var c = GetCollider(object.collider);
            
            // if(Math.abs(c.speedX) > 50.0 || Math.abs(c.speedY) > 50.0)
            // {
                // PlaySound(object.sound);
            // }

        // }
    }
    