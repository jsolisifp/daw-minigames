    ///////////////////////////////////////////////////
    //               MINI DINO GAME                  //
    //              //
    ///////////////////////////////////////////////////

    ///////////////////////////////////////////////////
    //                  ENGINE                 //
    ///////////////////////////////////////////////////
    // timeStep
    // CreateObject(name, type, x, y, w, h)
    // CreateSprite(file, className)
    // CreateText(content, className)
    // CreateCollider(movementType, hasGravity)
    // GetCollider(index), GetObject(index)
    // SetCollisionEnabled(typeA, typeB, enabled)
    // ShowSprite/HideSprite, ShowText/HideText
    // CreateSound(file, loop), PlaySound(index)
    // UtilsRandomRange(a, b)

    ///////////////////////////////////////////////////
    //                    TYPES                      //
    ///////////////////////////////////////////////////
    var objectTypeController = 0;
    var objectTypeDino = 1;
    var objectTypeObstacle = 2;
    var objectTypeGround = 3;
    var objectTypeScore = 4;
    var objectTypeWelcome = 5;
    var objectTypeResult = 6;
    var objectTypeInstruction = 7;

    ///////////////////////////////////////////////////
    //                    STATE                      //
    ///////////////////////////////////////////////////
    var gameStateWelcome = 0;
    var gameStatePlaying = 1;
    var gameStateResult = 2;
    var gameState = gameStateWelcome;

    ///////////////////////////////////////////////////
    //                 GAME DATA                     //
    ///////////////////////////////////////////////////
    var dinoIndex = -1;
    var groundIndex = -1;
    var scoreIndex = -1;
    var welcomeIndex = -1;
    var resultIndex = -1;
    var instructionIndex = -1;
    var obstacleIndices = new Array();

    var score = 0;
    var bestScore = 0;
    var gameTime = 0;
    var obstacleSpeed = 320;

    var jumpSpeed = -520;
    var gravityStrength = 1500;
    var jumpSound = -1;

    ///////////////////////////////////////////////////
    //                   LAYOUT                      //
    ///////////////////////////////////////////////////
    var groundY = 520;
    var groundHeight = 80;
    var dinoWidth = 60;
    var dinoHeight = 60;
    var obstacleWidth = 40;
    var obstacleHeight = 60;

    ///////////////////////////////////////////////////
    //                CREATE SCENE                   //
    ///////////////////////////////////////////////////
    function CreateScene()
    {
        CreateObject("controller", objectTypeController, 0, 0, 0, 0);

        groundIndex = CreateObject("ground", objectTypeGround, 0, groundY, 900, groundHeight);
        dinoIndex = CreateObject("dino", objectTypeDino, 120, groundY - dinoHeight, dinoWidth, dinoHeight);

        for(var i = 0; i < 3; i++)
        {
            obstacleIndices.push(CreateObject("obstacle" + i, objectTypeObstacle, 900 + i * 300, groundY - obstacleHeight, obstacleWidth, obstacleHeight));
        }

        scoreIndex = CreateObject("score", objectTypeScore, 20, 20, 0, 0);
        welcomeIndex = CreateObject("welcome", objectTypeWelcome, 120, 170, 0, 0);
        instructionIndex = CreateObject("instruction", objectTypeInstruction, 140, 250, 0, 0);
        resultIndex = CreateObject("result", objectTypeResult, 160, 190, 0, 0);
    }

    ///////////////////////////////////////////////////
    //                 START OBJECTS                 //
    ///////////////////////////////////////////////////
    function StartObject(index)
    {
        var o = objects[index];

        if(o.type == objectTypeController)
        {
            gravity = gravityStrength;
            jumpSound = CreateSound("reference-sound.wav", false);

            SetCollisionEnabled(objectTypeDino, objectTypeGround, true);
            SetCollisionEnabled(objectTypeDino, objectTypeObstacle, true);
            SetCollisionEnabled(objectTypeObstacle, objectTypeGround, false);

            SetStateWelcome();
        }
        else if(o.type == objectTypeDino)
        {
            o.sprite = CreateSprite("dino.png", "obstaculo1.png");
            o.collider = CreateCollider(bodyTypeDynamic, false);

            var c = GetCollider(o.collider);
            c.bounciness = 0;
            o.isGrounded = false;
        }
        else if(o.type == objectTypeObstacle)
        {
            o.sprite = CreateSprite("obstaculo1.png", "ObstacleSprite");
            o.collider = CreateCollider(bodyTypeKinematic, false);
        }
        else if(o.type == objectTypeGround)
        {
            o.sprite = CreateSprite("suelo_desierto.png", "groundSprite");
            o.collider = CreateCollider(bodyTypeKinematic, false);
        }
        else if(o.type == objectTypeScore)
        {
            o.text = CreateText("Puntuacion: 0", "ScoreText");
        }
        else if(o.type == objectTypeWelcome)
        {
            o.text = CreateText("DINO RUN", "TitleText");
        }
        else if(o.type == objectTypeInstruction)
        {
            o.text = CreateText("Pulsa espacio o click para jugar", "SubtitleText");
        }
        else if(o.type == objectTypeResult)
        {
            o.text = CreateText("Fin del juego", "ResultText");
        }
    }

    ///////////////////////////////////////////////////
    //                 UPDATE LOOP                   //
    ///////////////////////////////////////////////////
    function UpdateObject(index)
    {
        var o = objects[index];

        if(o.type == objectTypeController)
        {
            UpdateController();
            return;
        }

        if(o.type == objectTypeDino)
        {
            UpdateDino(o);
            return;
        }

        if(o.type == objectTypeObstacle)
        {
            UpdateObstacle(o);
            return;
        }

        if(o.type == objectTypeScore)
        {
            if(gameState == gameStatePlaying)
            {
                SetTextContent(o.text, "Puntuacion: " + score);
            }
        }
    }

    function UpdateController()
    {
        if(gameState == gameStateWelcome || gameState == gameStateResult)
        {
            if(inputFireDown || inputMouseClick)
            {
                SetStatePlaying();
            }
            return;
        }

        gameTime += timeStep;
        score = Math.floor(gameTime * 10);
        obstacleSpeed = 320 + Math.floor(gameTime * 12);
    }

    function UpdateDino(o)
    {
        if(gameState != gameStatePlaying)
        {
            return;
        }

        var c = GetCollider(o.collider);
        if(inputFireDown && o.isGrounded)
        {
            c.speedY = jumpSpeed;
            o.isGrounded = false;
            if(jumpSound >= 0)
            {
                PlaySound(jumpSound);
            }
        }

        o.isGrounded = false;
    }

    function UpdateObstacle(o)
    {
        if(gameState != gameStatePlaying)
        {
            return;
        }

        o.posX -= obstacleSpeed * timeStep;

        if(o.posX + o.width < 0)
        {
            var maxX = GetMaxObstacleX();
            o.posX = maxX + UtilsRandomRange(220, 520);
            o.posY = groundY - obstacleHeight;
            if(UtilsRandomRange(0, 1) > 0.65)
            {
                o.posY -= UtilsRandomRange(20, 80);
            }
        }
    }

    ///////////////////////////////////////////////////
    //                  INPUT EVENT                  //
    ///////////////////////////////////////////////////
    function OnObjectClicked(object)
    {
        if(gameState == gameStateWelcome || gameState == gameStateResult)
        {
            SetStatePlaying();
        }
    }

    ///////////////////////////////////////////////////
    //                 COLLISIONS                    //
    ///////////////////////////////////////////////////
    function OnObjectCollision(object, otherObject)
    {
        if(object.type == objectTypeDino && otherObject.type == objectTypeGround)
        {
            object.isGrounded = true;
        }
        else if(object.type == objectTypeDino && otherObject.type == objectTypeObstacle)
        {
            if(gameState == gameStatePlaying)
            {
                SetStateResult();
            }
        }
    }

    ///////////////////////////////////////////////////
    //                   STATES                      //
    ///////////////////////////////////////////////////
    function SetStateWelcome()
    {
        gameState = gameStateWelcome;

        SetObjectVisibility(dinoIndex, false);
        SetObjectVisibility(groundIndex, false);
        SetObjectVisibility(scoreIndex, false);
        SetObjectVisibility(welcomeIndex, true);
        SetObjectVisibility(resultIndex, false);
        SetObjectVisibility(instructionIndex, true);

        SetObstacleVisibility(false);
        SetDinoGravity(false);

        if(instructionIndex >= 0 && objects[instructionIndex].text >= 0)
        {
            SetTextContent(objects[instructionIndex].text, "Pulsa espacio o click para jugar");
        }

        UpdateWelcomeUI(true, "DINO RUN", "Pulsa el boton para empezar", "Iniciar videojuego");
    }

    function SetStatePlaying()
    {
        gameState = gameStatePlaying;
        gameTime = 0;
        score = 0;
        obstacleSpeed = 320;

        ResetDino();
        ResetObstacles();

        SetObjectVisibility(dinoIndex, true);
        SetObjectVisibility(groundIndex, true);
        SetObjectVisibility(scoreIndex, true);
        SetObjectVisibility(welcomeIndex, false);
        SetObjectVisibility(resultIndex, false);
        SetObjectVisibility(instructionIndex, false);

        SetObstacleVisibility(true);
        SetDinoGravity(true);

        UpdateWelcomeUI(false, "", "", "");
    }

    function SetStateResult()
    {
        gameState = gameStateResult;
        bestScore = Math.max(bestScore, score);

        SetObjectVisibility(dinoIndex, false);
        SetObjectVisibility(groundIndex, false);
        SetObjectVisibility(scoreIndex, false);
        SetObjectVisibility(welcomeIndex, false);
        SetObjectVisibility(resultIndex, true);
        SetObjectVisibility(instructionIndex, true);

        SetObstacleVisibility(false);
        SetDinoGravity(false);

        SetTextContent(objects[resultIndex].text, "Fin del juego - Puntuacion: " + score + " Mejor: " + bestScore);
        SetTextContent(objects[instructionIndex].text, "Pulsa espacio o click para reiniciar");

        UpdateWelcomeUI(true, "Fin del juego", "Puntuacion: " + score + " | Mejor: " + bestScore, "Reiniciar");
    }

    ///////////////////////////////////////////////////
    //               RESET HELPERS                   //
    ///////////////////////////////////////////////////
    function ResetDino()
    {
        var o = objects[dinoIndex];
        var c = GetCollider(o.collider);

        o.posX = 120;
        o.posY = groundY - dinoHeight;
        c.speedX = 0;
        c.speedY = 0;
        o.isGrounded = true;
    }

    function ResetObstacles()
    {
        for(var i = 0; i < obstacleIndices.length; i++)
        {
            var o = objects[obstacleIndices[i]];
            o.posX = 900 + i * 300 + UtilsRandomRange(0, 260);
            o.posY = groundY - obstacleHeight;
            if(UtilsRandomRange(0, 1) > 0.65)
            {
                o.posY -= UtilsRandomRange(20, 80);
            }
        }
    }

    function GetMaxObstacleX()
    {
        var maxX = 0;
        for(var i = 0; i < obstacleIndices.length; i++)
        {
            var o = objects[obstacleIndices[i]];
            if(o.posX > maxX)
            {
                maxX = o.posX;
            }
        }
        return maxX;
    }

    ///////////////////////////////////////////////////
    //               VISIBILITY HELPERS              //
    ///////////////////////////////////////////////////
    function SetObstacleVisibility(visible)
    {
        for(var i = 0; i < obstacleIndices.length; i++)
        {
            SetObjectVisibility(obstacleIndices[i], visible);
        }
    }

    function SetDinoGravity(enabled)
    {
        var o = objects[dinoIndex];
        if(o.collider >= 0)
        {
            var c = GetCollider(o.collider);
            c.hasGravity = enabled;
            if(!enabled)
            {
                c.speedY = 0;
            }
        }
    }

    function SetObjectVisibility(index, visible)
    {
        if(index < 0)
        {
            return;
        }

        var o = objects[index];

        if(o.sprite >= 0)
        {
            if(visible) { ShowSprite(o.sprite); }
            else { HideSprite(o.sprite); }
        }

        if(o.text >= 0)
        {
            if(visible) { ShowText(o.text); }
            else { HideText(o.text); }
        }
    }

    ///////////////////////////////////////////////////
    //                 WELCOME UI                    //
    ///////////////////////////////////////////////////
    function UpdateWelcomeUI(visible, title, subtitle, buttonText)
    {
        var screen = document.getElementById("welcomeScreen");
        if(!screen)
        {
            return;
        }

        var titleEl = document.getElementById("welcomeTitle");
        var subtitleEl = document.getElementById("welcomeSubtitle");
        var buttonEl = document.getElementById("startButton");

        if(titleEl) { titleEl.textContent = title; }
        if(subtitleEl) { subtitleEl.textContent = subtitle; }
        if(buttonEl) { buttonEl.textContent = buttonText; }

        screen.style.display = visible ? "flex" : "none";
    }

    function StartGameFromUI()
    {
        if(gameState == gameStateWelcome || gameState == gameStateResult)
        {
            SetStatePlaying();
        }
    }
