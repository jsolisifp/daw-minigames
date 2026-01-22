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
    var numObjectTypes = 32;
    
    /////////////
    // Render  //
    /////////////
    
    var sprites;

    /////////////
    // Physics //
    /////////////
    
    var colliders;
    var collisionEnabled;
    
    // Collider types
    
    var bodyTypeDynamic = 0;
    var bodyTypeKinematic = 1;
    
    var gravity = 500.0;

    /////////////
    // Texts   //
    /////////////
    
    var texts;

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
    
    let input0Down;
    let input1Down;
    let input2Down;
    let input3Down;
    let input4Down;

    let input0Pressed;
    let input1Pressed;
    let input2Pressed;
    let input3Pressed;
    let input4Pressed;
    
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
        input0Down = false;
        input1Down = false;
        input2Down = false;
        input3Down = false;
        input4Down = false;
    }    
    
    
    function MiniengineOnKeyDown(e)
    {
        if (e.code === "Space")
        {
            inputFireDown = true;
            inputFirePressed = true;
        }
        else if (e.code === "KeyA")
        {
            inputLeftDown = true;
            inputLeftPressed = true;
        }
        else if (e.code === "KeyD")
        {
            inputRightDown = true;
            inputRightPressed = true;
        }
        else if (e.code === "KeyW")
        {
            inputUpDown = true;
            inputUpPressed = true;
        }
        else if (e.code === "Digit0" || e.code === "Numpad0")
        {
            input0Down = true;
            input0Pressed = true;
        }
        else if (e.code === "Digit1" || e.code === "Numpad1")
        {
            input1Down = true;
            input1Pressed = true;
        }
        else if (e.code === "Digit2" || e.code === "Numpad2")
        {
            input2Down = true;
            input2Pressed = true;
        }
        else if (e.code === "Digit3" || e.code === "Numpad3")
        {
            input3Down = true;
            input3Pressed = true;
        }
        else if (e.code === "Digit4" || e.code === "Numpad4")
        {
            input4Down = true;
            input4Pressed = true;
        }
        
    }

    
    function MiniengineOnKeyUp(e)
{
    if (e.code === "Space")
    {
        inputFirePressed = false;
    }
    else if (e.code === "KeyW")
    {
        inputUpPressed = false;
    }
    else if (e.code === "KeyS")
    {
        inputDownPressed = false;
    }
    else if (e.code === "KeyA")
    {
        inputLeftPressed = false;
    }
    else if (e.code === "KeyD")
    {
        inputRightPressed = false;
    }
    else if (e.code === "Digit0" || e.code === "Numpad0")
    {
        input0Pressed = false;
    }
    else if (e.code === "Digit1" || e.code === "Numpad1")
    {
        input1Pressed = false;
    }
    else if (e.code === "Digit2" || e.code === "Numpad2")
    {
        input2Pressed = false;
    }
    else if (e.code === "Digit3" || e.code === "Numpad3")
    {
        input3Pressed = false;
    }
    else if (e.code === "Digit4" || e.code === "Numpad4")
    {
        input4Pressed = false;
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

        collisionEnabled = new Array();

        for(var i = 0; i < numObjectTypes; i++)
        {
            collisionEnabled[i] = new Array();
            for(var j = 0; j < numObjectTypes; j++)
            {
                collisionEnabled[i][j] = true;
            }                
        }
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

    function SetCollisionEnabled(objectType1, objectType2, enabled)
    {
        collisionEnabled[objectType1][objectType2] = enabled;
        collisionEnabled[objectType2][objectType1] = enabled;        
    }
    
    function RayCast(originX, originY, dirX, dirY, maxDistance, objectType)
    {
        var m = Math.sqrt(dirX * dirX + dirY * dirY);
        dirX = dirX / m;
        dirY = dirY / m;
        
        var steps = Math.floor(maxDistance);
        
        var x = originX;
        var y = originY;
        
        var found = false;
        var distance = 0;
        
        var result = -1;
        
        while(!found && distance < maxDistance)
        {
            var i = 0;
            while(i < objects.length && !found)
            {
                var o = objects[i];
                if(o.type == objectType && o.collider >= 0)
                {
                    var c = colliders[o.collider];
                    
                    if(x >= o.posX && x <= o.posX + o.width && y >= o.posY && y <= o.posY + o.height)
                    {
                        result = i;
                        found = true;
                    }                    
                }
				
				if(!found)
                    {
                        x = x + dirX;
                        y = y + dirY;
                        distance ++;
                    }
                    i++;
                    
            }
        }
        
        return result;
        
        
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
    
    function CheckLayer(index1, index2)
    {
        var o1 = objects[index1];
        var o2 = objects[index2];
        
		var result = collisionEnabled[o1.type][o2.type];
        
        return result;        
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
            for(var j = i + 1; j < objects.length; j++)
            {
                if(i != j)
                {
                    if(CheckLayer(i, j))
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
    /////////I//////////////////
    
    function InitRender()
    {
        sprites = new Array();
		texts = new Array();
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

        if(o.text >= 0)
        {
            var t = texts[o.text];

            t.style.left = o.posX + "px";
            t.style.top = o.posY + "px";
			
        }        
    }
    
    function GetSprite(index)
    {
        return sprites[index];
    }
	
    function CreateSprite(file, className)
    {
        var index = sprites.length;
        var image = document.createElement("img");
		image.className = className;
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
	
	function FindObject(name)
	{
		var result = -1;
		var i = 0;
		var found = false;
		
		while(i < objects.length && !found)
		{
			if(objects[i].name == name)
			{
				result = i;
				found = true;
			}
			else
			{
				i ++;
			}
		}
		
		return result;
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
			text: -1,
            collider: -1
        }
        
        objects.push(object);
        
        return index;
    }
    
    ///////////////////////////
    //        TEXT           //
    ///////////////////////////    
    
    
	function CreateText(content, className)
	{
        var index = texts.length;
        var text = document.createElement("div");
		text.className = className;
        text.innerHTML = content;
		text.style.visibility = "visible";
        text.style.position = "absolute";
        text.style.left = "0px";
        text.style.top = "0px";
        texts.push(text);

        minigame.appendChild(text);        
        
        return index;		
	}
	
	function SetTextContent(index, content)
	{
		var text = texts[index];
		text.innerHTML = content;
	}
		
	function HideText(index)
	{
		texts[index].style.visibility = "hidden";
	}
	
	function ShowText(index)
	{
		texts[index].style.visibility = "visible";
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
    function SetSoundVolume(index, volume)
    {
        if (index >= 0 && index < sounds.length)
        {
            sounds[index].volume = Math.max(0, Math.min(1, volume));
        }
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
        ResetVolumeKeysFlag();
   

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
