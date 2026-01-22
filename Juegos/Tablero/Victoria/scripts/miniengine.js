    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////// MINIENGINE////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////
    //                                                                            //
    //  A quick and dirty game engine written in pure css, javascript and html    //
    //  with no third party dependencies and no AI generated code.                //
    //                                                                            //
    ////////////////////////////////////////////////////////////////////////////////  

    /////////////
    // System  //
    /////////////
    
    var minigame;
    
    var fps = 30;
    var timeStep;

    /////////////
    // Scene   //
    /////////////
    
    var objects;
    
    /////////////
    // Render  //
    /////////////
    
    var sprites;

    /////////////
    // Physics //
    /////////////
    
    var colliders;
    
    // Collider types
    
    var bodyTypeDynamic = 0;
    var bodyTypeKinematic = 1;
    
    var gravity = 500.0;

    /////////////
    // Sound   //
    /////////////
    
    var sounds;
    
    /////////////
    // Input   //
    /////////////   
    
    var inputFireDown;
    var inputLeftDown;
    var inputRightDown;
    var inputUpDown;
    var inputDownDown;

    var inputFirePressed;
    var inputLeftPressed;
    var inputRightPressed;
    var inputUpPressed;
    var inputDownPressed;
    
    var inputMouseClick;
    var inputMouseClickX;
    var inputMouseClickY;
    
    ///////////////////////////
    //        INPUT          //
    ///////////////////////////

    function InitInput()
    {
        document.addEventListener('keydown', MiniengineOnKeyDown);
        document.addEventListener('keyup', MiniengineOnKeyUp);
        document.addEventListener('click', MiniengineOnClick);        
    }
    
    function InputUpdate()
    {
        if(inputMouseClick)
        {
            for(var i = 0; i < objects.length; i++)
            {
                var o = objects[i];
                if(o.sprite >= 0)
                {
                    var rect = sprites[o.sprite].getBoundingClientRect();
                    var x = rect.left + window.scrollX;
                    var y = rect.top + window.scrollY;
                    
                    if(inputMouseClickX >= x && inputMouseClickX <= x + rect.width &&
                       inputMouseClickY >= y && inputMouseClickY <= y + rect.height)
                    {
                        OnObjectClicked(o);
                    }

                }
            }
        }
    }
    
    function InputClear()
    {
        inputFireDown = false;
        inputLeftDown = false;
        inputRightDown = false;
        inputUpDown = false;
        inputDownDown = false;    
        inputMouseClick = false;
    }    
    
    
    function MiniengineOnKeyDown(e)
    {
        if(e.key == " ")
        {
            inputFireDown = true;
            inputFirePressed = true;
        }
        else if(e.key == "w")
        {
            inputUpDown = true;
            inputUpPressed = true;
            
        }
        else if(e.key == "s")
        {
            inputDownDown = true;
            inputDownPressed = true;
        }
        else if(e.key == "a")
        {
            inputLeftDown = true;
            inputLeftPressed = true;
        }
        else if(e.key == "d")
        {
            inputRightDown = true;
            inputRightPressed = true;
        }        
    }
    
    function MiniengineOnKeyUp(e)
    {
        if(e.key == " ")
        {
            inputFirePressed = false;
        }
        else if(e.key == "w")
        {
            inputUpPressed = false;
        }
        else if(e.key == "s")
        {
            inputDownPressed = false;
        }
        else if(e.key == "a")
        {
            inputLeftPressed = false;
        }
        else if(e.key == "d")
        {
            inputRightPressed = false;
        }        
    }
        
    function MiniengineOnClick(e)
    {
        inputMouseClick = true;
        
        inputMouseClickX = e.pageX;
        inputMouseClickY = e.pageY;
    }
    
    
    ///////////////////////////
    //        PHYSICS        //
    ///////////////////////////
    
    function InitPhysics()
    {
        colliders = new Array();
    }    
    
    function PhysicsUpdate()
    {
        for(var i = 0; i < objects.length; i++)
        {
            UpdatePhysics(i);            
        }

        var collisions = CollisionDetection();
        CollisionResponse(collisions);        

    }
        
    
    function UpdatePhysics(index)
    {
        var o = objects[index];
        
        if(o.collider >= 0)
        {
            var c = colliders[o.collider];
            
            if(c.movementType == bodyTypeDynamic)
            {
                if(c.hasGravity)
                {
                    c.speedY += gravity * timeStep;
                }

                o.posX += c.speedX * timeStep;
                o.posY += c.speedY * timeStep;
                
            }
        }
        
    }
    
    function GetCollider(index)
    {
        return colliders[index];
    }
    
    function CreateCollider(movementType, hasGravity)
    {
        var index = colliders.length;        
        var collider =
        {
            movementType: movementType,
            speedX: 0,
            speedY: 0,
            bounciness: 0.5,
            hasGravity: hasGravity
        }
        
        colliders.push(collider);
        
        return index;
    }  

    function Check1DOverlap(a1, aw, b1, bw)
    {
        a2 = a1 + aw;
        b2 = b1 + bw;
        if(a2 < b1 || b2 < a1) { return false; }
        else { return true; }
    }
    
    function CheckOverlap(index1, index2)
    {
        var o1 = objects[index1];
        var o2 = objects[index2];
        
        var result = false;
        
        if(o1.collider >= 0 && o2.collider >= 0)
        {
            var c1 = colliders[o1.collider];
            var c2 = colliders[o2.collider];
            result = Check1DOverlap(o1.posX, o1.width, o2.posX, o2.width) && Check1DOverlap(o1.posY, o1.height, o2.posY, o2.height);
        }
        
        return result;
    }
    
    function Check1DOut(a1, aw, b1, bw)
    {
        if(Check1DOverlap(a1, aw, b1, bw))
        {
            a2 = a1 + aw;
            b2 = b1 + bw;            
            if(Math.abs(b2 - a1) < Math.abs(b1 - a2)) { return b2 - a1; }
            else  { return b1 - a2; }
        }
        else
        {
            return 0;
        }
    
    }
    
    function CreateCollision(index1, index2)
    {
        var o1 = objects[index1];
        var o2 = objects[index2];  

        var outX = Check1DOut(o1.posX, o1.width, o2.posX, o2.width);
        var outY = Check1DOut(o1.posY, o1.height, o2.posY, o2.height);
        
        if(Math.abs(outX) <= Math.abs(outY)) { outY = 0; }
        else { outX = 0; }
        
        var collision = 
        {
            index1: index1,
            index2: index2,
            outX: outX,
            outY: outY            
        }

        return collision;
    }
    
    function CollisionDetection()
    {
        var collisions = new Array();
        
        for(var i = 0; i < objects.length; i++)
        {
            for(var j = 0; j < objects.length; j++)
            {
                if(i != j)
                {
                    if(CheckOverlap(i, j))
                    {
                        var found = false;
                        var k = 0;
                        while(!found && k < collisions.length) { if(collisions[k].index1 == j && collisions[k].index2 == i) { found = true; } else { k++; }}
                        
                        if(!found)
                        {
                            var c = CreateCollision(i, j);
                            collisions.push(c);
                        }
                    }
                }
            }
        }  

        return collisions;
    }
    
    function CollisionResponse(collisions)
    {
        for(var i = 0; i < collisions.length; i++)
        {
            var c = collisions[i];

            o1 = objects[c.index1];            
            c1 = colliders[o1.collider];
            o2 = objects[c.index2];            
            c2 = colliders[o2.collider];
            if(c1.movementType == bodyTypeDynamic && c2.movementType == bodyTypeDynamic)
            {
                o1.posX += c.outX / 2;
                o2.posX -= c.outX / 2;
                o1.posY += c.outY / 2;
                o2.posY -= c.outY / 2;
                
                var bounciness = (c1.bounciness + c2.bounciness) / 2;
                
                if(c.outX != 0) { c1.speedX = Math.abs(c1.speedX) * Math.sign(c.outX) * bounciness; }
                if(c.outX != 0) { c2.speedX = Math.abs(c2.speedX) * -Math.sign(c.outX) * bounciness; }
                if(c.outY != 0) { c1.speedY = Math.abs(c1.speedY) * Math.sign(c.outY) * bounciness; }
                if(c.outY != 0) { c2.speedY = Math.abs(c2.speedY) * -Math.sign(c.outY) * bounciness; }
                
                OnObjectCollision(o1, o2);
                OnObjectCollision(o2, o1);
            }
            else if(c1.movementType == bodyTypeDynamic && c2.movementType == bodyTypeKinematic)
            {
                o1.posX += c.outX;
                o1.posY += c.outY;
                
                var bounciness = (c1.bounciness + c2.bounciness) / 2;

                if(c.outX != 0) { c1.speedX = Math.abs(c1.speedX) * Math.sign(c.outX) * bounciness; }
                if(c.outY != 0) { c1.speedY = Math.abs(c1.speedY) * Math.sign(c.outY) * bounciness; }

                OnObjectCollision(o1, o2);
                OnObjectCollision(o2, o1);
            }            
            else if(c1.movementType == bodyTypeKinematic && c2.movementType == bodyTypeDynamic)
            {
                o2.posX -= c.outX;
                o2.posY -= c.outY;

                var bounciness = (c1.bounciness + c2.bounciness) / 2;

                if(c.outX != 0) { c2.speedX = Math.abs(c2.speedX) * -Math.sign(c.outX) * bounciness; }
                if(c.outY != 0) { c2.speedY = Math.abs(c2.speedY) * -Math.sign(c.outY) * bounciness; }
                
                OnObjectCollision(o1, o2);
                OnObjectCollision(o2, o1);                
           }            
            
        }
        
    }
    
    
    ///////////////////////////
    //        RENDER         //
    ///////////////////////////
    
    function InitRender()
    {
        sprites = new Array();
    }
        
    function RenderUpdate()
    {
        for(var i = 0; i < objects.length; i ++)
        {
            UpdateRender(i);
        }        
    }
    
    function UpdateRender(index)
    {
        var o = objects[index];
        
        if(o.sprite >= 0)
        {
            var s = sprites[o.sprite];

            s.style.left = o.posX + "px";
            s.style.top = o.posY + "px";
            s.style.width = o.width + "px";
            s.style.height = o.height + "px";
			
        }        
    }
    
    function GetSprite(index)
    {
        return sprites[index];
    }
	
    function CreateSprite(file)
    {
        var index = sprites.length;
        var image = document.createElement("img");
        image.src = "images/" + file;
        image.style.position = "absolute";
        image.style.left = "0px";
        image.style.top = "0px";
        image.style.width = "0px";
        image.style.height = "0px";
        sprites.push(image);

        minigame.appendChild(image); 

        return index;
    }    
	
	function HideSprite(index)
	{
		sprites[index].style.visibility = "hidden";
	}
	
	function ShowSprite(index)
	{
		sprites[index].style.visibility = "visible";
	}
    
    ///////////////////////////
    //        SCENE          //
    ///////////////////////////  

    function InitScene()
    {
        objects = new Array();
    }
    
    function StartScene()
    {
        for(var i = 0; i < objects.length; i ++)
        {
            StartObject(i);
        }
        
    }

    function SceneUpdate()
    {
        for(var i = 0; i < objects.length; i ++)
        {
            UpdateObject(i);
        }
        
    }
    
    function GetObject(index)
    {
        return objects[index];
    }
    
    function CreateObject(name, type, posX, posY, width, height)
    {
        var index = objects.length;        
        
        var object =
        {
            name: name,
            posX: posX,
            posY: posY,
            width: width,
            height: height,
            type: type,
            sprite: -1,
            collider: -1
        }
        
        objects.push(object);
        
        return index;
    }
    
    ///////////////////////////
    //        SOUND          //
    ///////////////////////////    
    
    
    function InitSound()
    {
        sounds = new Array();
    }    
    
    function CreateSound(file, loop)
    {
        var index = sounds.length;
        var audio = document.createElement("audio");
        audio.src = "sounds/" + file;
        audio.volume = 1;
        audio.loop = loop;
        sounds.push(audio);

        minigame.appendChild(audio);        
        
        return index;

    }    

    function PlaySound(index)
    {
        sounds[index].play();
    }
    
    function StopSound(index)
    {
        sounds[index].pause();
		sounds[index].currentTime = 0
    }
    
    
    ///////////////////////////
    //        SYSTEM         //
    ///////////////////////////       
    
    function MiniengineInit()
    {   
        minigame = document.getElementById("minigame");

        InitInput();
        InitScene();
        InitRender();
        InitPhysics();
        InitSound();
   
        CreateScene();
        
        StartScene();
        
        timeStep = 1.0 / fps;
        window.setTimeout(MiniengineUpdate, 1000.0 / fps );
    }
           
 
    function MiniengineUpdate()
    {
        InputUpdate();
        SceneUpdate();        
        PhysicsUpdate();
        RenderUpdate();

        InputClear();
   

        window.setTimeout(MiniengineUpdate, 1000.0 / fps );
    }
    
    ///////////////////////////
    //        UTILS          //
    ///////////////////////////        
	
	function UtilsRandomRange(a, b)
	{
		return a + (b - a) * Math.random();		
	}

	function UtilsRandomRangeInt(a, b)
	{
		var r = a + Math.floor((b - a) * Math.random());
		
		if(r == b) { r = r - 1; }
		
		return r;
		
	}
