// Space Invaders - Proyecto DAW2
// Tipos de objetos
var NAVE = 0;
var BALA_JUGADOR = 1;
var ALIEN = 2;
var BALA_ALIEN = 3;
var TEXTO = 4;
var CONTROLADOR = 5;

var estadoJuego = "menu"; 
var puntuacion = 0;
var vidasRestantes = 3;
var contadorAliens = 0;
var disparoHabilitado = true;
var tiempoEntreDisparos = 0;
var tiempoMovimientoAliens = 0;
var sentidoMovimiento = 1; 
var velocidadAliens = 30;
var nivelActual = 1;

function CreateScene()
{
    CreateObject("menu", TEXTO, 0, 0, 900, 600);
    CreateObject("miNave", NAVE, 420, 520, 60, 40);
    
    // crear los enemigos en filas y columnas
    for(var f = 0; f < 5; f++)
    {
        for(var c = 0; c < 11; c++)
        {
            var posX = 100 + c * 60;
            var posY = 80 + f * 50;
            CreateObject("enemigo" + f + "_" + c, ALIEN, posX, posY, 40, 30);
        }
    }
    
    // balas del jugador
    for(var i = 0; i < 10; i++) CreateObject("bala" + i, BALA_JUGADOR, -50, -50, 25, 25);
    
    // balas de los enemigos
    for(var i = 0; i < 15; i++) CreateObject("balaEnemigo" + i, BALA_ALIEN, -50, -50, 40, 40);
    
    // textos
    CreateObject("textoPuntos", TEXTO, 20, 20, 250, 40);  
    CreateObject("textoVidas", TEXTO, 630, 20, 270, 40);
    CreateObject("textoNivel", TEXTO, 360, 20, 180, 40);
    CreateObject("pantallaGameOver", TEXTO, 0, 0, 900, 600);
    
    // controlador para mover los enemigos
    CreateObject("controlador", CONTROLADOR, 0, 0, 0, 0);
    sndLaser = CreateSound("laser.mp3", false);
}

function StartObject(index)
{
    var obj = objects[index];
    
    if(obj.type == NAVE)
    {
        obj.sprite = CreateSprite("nave.png", "Nave");
        obj.collider = CreateCollider(bodyTypeKinematic, false);
        obj.viva = true;
        HideSprite(obj.sprite);
    }
    else if(obj.type == ALIEN)
    {
        obj.sprite = CreateSprite("enemigo.png", "Enemigo");
        obj.vivo = false;
        HideSprite(obj.sprite);
    }
    else if(obj.type == BALA_JUGADOR || obj.type == BALA_ALIEN)
    {
        var img = (obj.type == BALA_JUGADOR) ? "disparo.png" : "disparo_enemigo.png";
        obj.sprite = CreateSprite(img, "Bala");
        obj.activo = false;
        HideSprite(obj.sprite);
    }
    else if(obj.type == TEXTO)
    {
        if(obj.name == "menu")
        {
            obj.text = CreateText("<div class='pantalla'><h1>SPACE INVADERS</h1><p>A/D para moverte</p><p>ESPACIO para disparar</p><p class='empezar'>Pulsa ESPACIO para empezar</p></div>", "Menu");
        }
        else if(obj.name == "textoPuntos")
        {
            obj.text = CreateText("PUNTOS: 0", "Marcador");
            texts[obj.text].id = "textoPuntos"; 
            HideText(obj.text);
        }
        else if(obj.name == "textoVidas")
        {
            obj.text = CreateText("VIDAS: 3", "Marcador");
            texts[obj.text].id = "textoVidas"; 
            HideText(obj.text);
        }
        else if(obj.name == "textoNivel")
        {
            obj.text = CreateText("NIVEL: 1", "Marcador");
            texts[obj.text].id = "textoNivel";
            HideText(obj.text);
        }
        else if(obj.name == "pantallaGameOver")
        {
            obj.text = CreateText("<div class='pantalla'><h1>GAME OVER</h1><p>Puntos: 0</p><p class='empezar'>Pulsa ESPACIO</p></div>", "GameOver");
            HideText(obj.text);
        }
    }
}

function UpdateObject(index)
{
    var obj = objects[index];
    
    // actualizar nave
    if(obj.type == NAVE && estadoJuego == "juego" && obj.viva)
    {
        if(inputLeftPressed)  obj.posX -= 300 * timeStep;
        if(inputRightPressed) obj.posX += 300 * timeStep;
        
        // limites pantalla
        if(obj.posX < 0) obj.posX = 0;
        if(obj.posX > 840) obj.posX = 840;
        
        // disparar
        if(inputFireDown && disparoHabilitado)
        {
            crearDisparo(obj.posX + 30, obj.posY);
            disparoHabilitado = false;
        }
        
        // cooldown disparo
        if(!disparoHabilitado)
        {
            tiempoEntreDisparos += timeStep;
            if(tiempoEntreDisparos > 0.2)
            {
                disparoHabilitado = true;
                tiempoEntreDisparos = 0;
            }
        }
    }
    
    // actualizar balas jugador
    else if(obj.type == BALA_JUGADOR && obj.activo)
    {
        obj.posY -= 450 * timeStep;
        
        // comprobar colisiones con enemigos (AABB completo)
        for(var i = 0; i < objects.length; i++)
        {
            var enemigo = objects[i];
            if(enemigo.type == ALIEN && enemigo.vivo)
            {
                if(obj.posX < enemigo.posX + enemigo.width &&
                   obj.posX + obj.width > enemigo.posX &&
                   obj.posY < enemigo.posY + enemigo.height &&
                   obj.posY + obj.height > enemigo.posY)
                {
                    obj.activo = false;
                    HideSprite(obj.sprite);
                    obj.posX = -1000;
                    obj.posY = -1000;
                    enemigo.vivo = false;
                    HideSprite(enemigo.sprite);
                    enemigo.posX = -1000;
                    enemigo.posY = -1000;
                    contadorAliens--;
                    puntuacion += 10;
                    if(contadorAliens <= 0) siguienteNivel();
                    break;
                }
            }
        }
        
        if(obj.posY < -20) 
        { 
            obj.activo = false; 
            HideSprite(obj.sprite);
            obj.posX = -1000;
            obj.posY = -1000;
        }
    }
    
    // actualizar balas enemigos
    else if(obj.type == BALA_ALIEN && obj.activo)
    {
        obj.posY += 250 * timeStep;
        
        var miNave = objects[FindObject("miNave")];
        if(miNave.viva && 
           obj.posX < miNave.posX + miNave.width &&
           obj.posX + obj.width > miNave.posX &&
           obj.posY < miNave.posY + miNave.height &&
           obj.posY + obj.height > miNave.posY)
        {
            obj.activo = false;
            HideSprite(obj.sprite);
            obj.posX = -1000;
            obj.posY = -1000;
            vidasRestantes--;
            if(vidasRestantes <= 0)
            {
                vidasRestantes = 0;
                miNave.viva = false;
                HideSprite(miNave.sprite);
                finalizarJuego();
            }
            else resetearPosicionTrasGolpe();
        }
        
        if(obj.posY > 610) 
        { 
            obj.activo = false; 
            HideSprite(obj.sprite);
            obj.posX = -1000;
            obj.posY = -1000;
        }
    }
    
    // actualizar textos
    else if(obj.type == TEXTO && estadoJuego == "juego")
    {
        if(obj.name == "textoPuntos") SetTextContent(obj.text, "PUNTOS: " + puntuacion);
        else if(obj.name == "textoVidas") SetTextContent(obj.text, "VIDAS: " + vidasRestantes);
        else if(obj.name == "textoNivel") SetTextContent(obj.text, "NIVEL: " + nivelActual);
    }
    
    // input menu
    else if(obj.type == TEXTO && obj.name == "menu" && estadoJuego == "menu")
    {
        if(inputFireDown) iniciarJuego();
    }
    
    // input game over
    else if(obj.type == TEXTO && obj.name == "pantallaGameOver" && estadoJuego == "gameover")
    {
        if(inputFireDown) volverAlMenu();
    }
    
    // controlador - mover enemigos
    else if(obj.type == CONTROLADOR)
    {
        MoverEnemigos();
    }
}

function iniciarJuego()
{
    estadoJuego = "juego";
    puntuacion = 0;
    vidasRestantes = 3;
    contadorAliens = 0;
    velocidadAliens = 30;
    nivelActual = 1;
    
    HideText(objects[FindObject("menu")].text);
    ShowText(objects[FindObject("textoPuntos")].text);
    ShowText(objects[FindObject("textoVidas")].text);
    ShowText(objects[FindObject("textoNivel")].text);
    
    var miNave = objects[FindObject("miNave")];
    miNave.posX = 420;
    miNave.posY = 520;
    miNave.viva = true;
    ShowSprite(miNave.sprite);
    
    // mostrar enemigos
    for(var i = 0; i < objects.length; i++)
    {
        if(objects[i].type == ALIEN)
        {
            var nombrePartes = objects[i].name.split("_");
            var fila = parseInt(nombrePartes[0].replace("enemigo",""));
            var columna = parseInt(nombrePartes[1]);
            objects[i].posX = 100 + columna * 60;
            objects[i].posY = 80 + fila * 50;
            objects[i].vivo = true;
            contadorAliens++;
            ShowSprite(objects[i].sprite);
        }
    }
}

function resetearPosicionTrasGolpe()
{
    // limpiar balas
    for(var i = 0; i < objects.length; i++)
    {
        if(objects[i].type == BALA_JUGADOR || objects[i].type == BALA_ALIEN)
        {
            objects[i].activo = false;
            objects[i].posX = -1000;
            objects[i].posY = -1000;
            HideSprite(objects[i].sprite);
        }
    }
    
    var miNave = objects[FindObject("miNave")];
    miNave.posX = 420;
}

function crearDisparo(x, y)
{
    for (var i = 0; i < objects.length; i++)
    {
        if (objects[i].type == BALA_JUGADOR && !objects[i].activo)
        {
            objects[i].posX = x - 5;
            objects[i].posY = y;
            objects[i].activo = true;
            ShowSprite(objects[i].sprite);

            sounds[sndLaser].currentTime = 0;
            PlaySound(sndLaser);
            break;
        }
    }
}


function disparoDelEnemigo(x, y)
{
    for(var i = 0; i < objects.length; i++)
    {
        if(objects[i].type == BALA_ALIEN && !objects[i].activo)
        {
            objects[i].posX = x;
            objects[i].posY = y;
            objects[i].activo = true;
            ShowSprite(objects[i].sprite);
            break;
        }
    }
}

function MoverEnemigos()
{
    if(estadoJuego != "juego") return;
    
    tiempoMovimientoAliens += timeStep;
    
    if(tiempoMovimientoAliens > 0.8)
    {
        tiempoMovimientoAliens = 0;
        
        var chocaConBorde = false;
        
        // ver si alguno toca el borde
        for(var i = 0; i < objects.length; i++)
        {
            if(objects[i].type == ALIEN && objects[i].vivo)
            {
                if((objects[i].posX > 850 && sentidoMovimiento == 1) || (objects[i].posX < 10 && sentidoMovimiento == -1))
                    chocaConBorde = true;
            }
        }
        
        if(chocaConBorde)
        {
            // cambiar direccion y bajar
            sentidoMovimiento *= -1;
            for(var i = 0; i < objects.length; i++)
            {
                if(objects[i].type == ALIEN && objects[i].vivo)
                {
                    objects[i].posY += 25;
                    if(objects[i].posY > 470) finalizarJuego();
                }
            }
        }
        else
        {
            // mover horizontalmente
            for(var i = 0; i < objects.length; i++)
            {
                if(objects[i].type == ALIEN && objects[i].vivo)
                    objects[i].posX += velocidadAliens * sentidoMovimiento;
            }
        }
        
        // disparos aleatorios
        if(Math.random() < 0.3)
        {
            var aliensVivos = [];
            for(var i = 0; i < objects.length; i++)
                if(objects[i].type == ALIEN && objects[i].vivo) aliensVivos.push(i);
            
            if(aliensVivos.length > 0)
            {
                var alienQueDispara = objects[aliensVivos[UtilsRandomRangeInt(0, aliensVivos.length)]];
                disparoDelEnemigo(alienQueDispara.posX + 20, alienQueDispara.posY + 30);
            }
        }
    }
}

function finalizarJuego()
{
    estadoJuego = "gameover";
    
    for(var i = 0; i < objects.length; i++)
    {
        if(objects[i].sprite >= 0) HideSprite(objects[i].sprite);
        if(objects[i].type == BALA_JUGADOR || objects[i].type == BALA_ALIEN) 
        {
            objects[i].activo = false;
            objects[i].posX = -1000;
            objects[i].posY = -1000;
        }
    }
    
    HideText(objects[FindObject("textoPuntos")].text);
    HideText(objects[FindObject("textoVidas")].text);
    HideText(objects[FindObject("textoNivel")].text);
    
    var pantallaFinal = objects[FindObject("pantallaGameOver")];
    SetTextContent(pantallaFinal.text, "<div class='pantalla'><h1>GAME OVER</h1><p>Puntos: " + puntuacion + "</p><p class='empezar'>Pulsa ESPACIO</p></div>");
    ShowText(pantallaFinal.text);
}

function volverAlMenu()
{
    estadoJuego = "menu";
    HideText(objects[FindObject("pantallaGameOver")].text);
    ShowText(objects[FindObject("menu")].text);
}

function siguienteNivel()
{
    nivelActual++;
    velocidadAliens += 20; 
    
    contadorAliens = 0;
    for(var i = 0; i < objects.length; i++)
    {
        if(objects[i].type == ALIEN)
        {
            var nombrePartes = objects[i].name.split("_");
            var fila = parseInt(nombrePartes[0].replace("enemigo",""));
            var columna = parseInt(nombrePartes[1]);
            objects[i].posX = 100 + columna * 60;
            objects[i].posY = 80 + fila * 50;
            objects[i].vivo = true;
            contadorAliens++;
            ShowSprite(objects[i].sprite);
        }
    }
    sentidoMovimiento = 1;
}

