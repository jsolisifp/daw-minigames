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
    
    var objectTypePaddle = 0;
    var objectTypeBall = 1;
    var objectTypeBrick = 2;
    var objectTypeWall = 3;
    var gameRunning = false;
    gravity = 0;


    ///////////////////////////////////////////////////
    //              CREATE YOUR SCENE                //
    ///////////////////////////////////////////////////
    
    function CreateScene()
    {
        // PALA
        CreateObject("paddle", objectTypePaddle, 400, 550, 120, 20);

        // BOLA
        CreateObject("ball", objectTypeBall, 450, 300, 15, 15);

        // PAREDES
        CreateObject("wallLeft", objectTypeWall, -20, 0, 20, 600);
        CreateObject("wallRight", objectTypeWall, 900, 0, 20, 600);
        CreateObject("wallTop", objectTypeWall, 0, -20, 900, 20);

        // LADRILLOS
        for(var y = 0; y < 4; y++)
        {
            for(var x = 0; x < 10; x++)
            {
                CreateObject("brick", objectTypeBrick, 40 + x * 80, 60 + y * 30, 70, 20);
            }
        }
    }

    function showMenu(type)
    {
        hideAllMenus();

        if(type === "start")
            document.getElementById("menu-start").style.display = "flex";

        if(type === "win")
            document.getElementById("menu-win").style.display = "flex";

        if(type === "lose")
            document.getElementById("menu-lose").style.display = "flex";
    }

    function hideAllMenus()
    {
        document.getElementById("menu-start").style.display = "none";
        document.getElementById("menu-win").style.display = "none";
        document.getElementById("menu-lose").style.display = "none";
    }

    function startGame()
    {
        hideAllMenus();
        resetGame();
        gameRunning = true;
    }

    function resetGame()
    {
        for(var i = 0; i < objects.length; i++)
        {
            var o = objects[i];

            // RESET PALA
            if(o.type == objectTypePaddle)
            {
                o.posX = 400;
                o.posY = 550;
            }

            // RESET BOLA
            if(o.type == objectTypeBall)
            {
                o.posX = 450;
                o.posY = 300;

                var c = GetCollider(o.collider);
                c.speedX = 200;
                c.speedY = -200;
            }

            // RESET LADRILLOS
            if(o.type == objectTypeBrick)
            {
                o.posX = 40 + (i % 10) * 80;
                o.posY = 60 + Math.floor(i / 10) * 30;
            }
        }
    }

    ///////////////////////////////////////////////////
    //              START YOUR OBJECTS               //
    ///////////////////////////////////////////////////
    
    function StartObject(index)
    {
        var o = objects[index];

        if(o.type == objectTypePaddle)
        {
            o.sprite = CreateSprite("paddle.png", "Paddle");
            o.collider = CreateCollider(bodyTypeKinematic, false);
        }
        else if(o.type == objectTypeBall)
        {
            o.sprite = CreateSprite("ball.png", "Ball");
            o.collider = CreateCollider(bodyTypeDynamic, false);

            var c = GetCollider(o.collider);
            c.speedX = 200;
            c.speedY = -200;
            c.bounciness = 1.0;
        }
        else if(o.type == objectTypeBrick)
        {
            o.sprite = CreateSprite("brick1.png", "Brick");
            o.collider = CreateCollider(bodyTypeKinematic, false);
        }
        else if(o.type == objectTypeWall)
        {
            o.collider = CreateCollider(bodyTypeKinematic, false);
        }
    }
    
    ///////////////////////////////////////////////////
    //              UPDATE YOUR OBJECTS               //
    ///////////////////////////////////////////////////

    function UpdateObject(index)
    {
        if(!gameRunning)
            return;

        var o = objects[index];

        // DERROTA: bola fuera
        if(o.type == objectTypeBall && o.posY > 600)
        {
            gameRunning = false;
            showMenu("lose");
            return;
        }

        // PADDLE
        if(o.type == objectTypePaddle)
        {
            if(inputLeftDown)  o.posX -= 400 * timeStep;
            if(inputRightDown) o.posX += 400 * timeStep;

            if(o.posX < 0) o.posX = 0;
            if(o.posX + o.width > 900) o.posX = 900 - o.width;
        }

        // BALL (velocidad constante)
        else if(o.type == objectTypeBall)
        {
            var c = GetCollider(o.collider);

            var speed = Math.sqrt(c.speedX*c.speedX + c.speedY*c.speedY);
            var target = 280;

            c.speedX = c.speedX / speed * target;
            c.speedY = c.speedY / speed * target;
        }
    }
 
    ///////////////////////////////////////////////////
    //            RESPOND TO INPUT EVENTS            //
    ///////////////////////////////////////////////////
    
    function OnObjectClicked(object)
    {
		/*
		
        if(object.collider >= 0)
        {
            var c = GetCollider(object.collider);
            if(c.movementType == bodyTypeDynamic)
            {
                c.speedX += UtilsRandomRange(-500, 500);
                c.speedY += UtilsRandomRange(-500, 500);
            }
        }
		
		*/
        
    }
    
    ///////////////////////////////////////////////////
    //              RESPOND TO COLLISIONS            //
    ///////////////////////////////////////////////////
    
    function OnObjectCollision(object, other)
    {
        // rebote con paredes y pala ya está en física

        // bola con pala → rebote hacia arriba
        if(object.type == objectTypeBall && other.type == objectTypePaddle)
        {
            var c = GetCollider(object.collider);

            c.speedY = -Math.abs(c.speedY);

            // efecto: cambia ángulo según punto de impacto
            var hit = (object.posX + object.width / 2) - (other.posX + other.width / 2);
            c.speedX += hit * 3;
        }

        // bola con ladrillo → eliminar ladrillo
        if(object.type == objectTypeBall && other.type == objectTypeBrick)
        {
            other.posX = -1000;
            other.posY = -1000;

            var cb = GetCollider(object.collider);

            if(allBricksDestroyed())
            {
                gameRunning = false;
                showMenu("win");
            }

            // invertimos rebote
            if(Math.abs(object.posX - other.posX) > Math.abs(object.posY - other.posY))
            {
                cb.speedX = -cb.speedX; // choque lateral
            }
            else
            {
                cb.speedY = -cb.speedY; // choque vertical
            }
        }
    }
    