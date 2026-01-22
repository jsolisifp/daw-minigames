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
// inputFireDown / inputLeftPressed / inputRightPressed
// UtilsRandomRangeInt(a, b)

///////////////////////////////////////////////////
//              TIPOS DE OBJETO                  //
///////////////////////////////////////////////////

var tipoFondo     = 0;
var tipoManager   = 1;
var tipoCarrito   = 2;
var tipoPared     = 3;
var tipoImagenUI  = 4;
var tipoBotonUI   = 5;

///////////////////////////////////////////////////
//                 AJUSTES DEL JUEGO             //
///////////////////////////////////////////////////

var anchoEscena  = 900;
var altoEscena   = 600;

var anchoCarrito = 80;
var altoCarrito  = 80;

var velocidadCarrito = 520;

var paresParedes     = 12;
var velocidadParedes = 640;
var altoPared        = 80;
var espacioParedes   = 60;

var anchoHueco  = 280;
var margenHueco = 90;

var tiempoParaGanar = 30;



var recorteCarritoX = 22;
var recorteCarritoY = 16;

var recorteParedX   = 50;
var recorteParedY   = 12;



var posicionEsCentro = false;

///////////////////////////////////////////////////
//                 ARCHIVOS                      //
///////////////////////////////////////////////////

var archivoFondo = "fondo.png";

var archivoTitulo   = "titulo.png";
var archivoStart    = "Start.png";

var archivoPerdiste = "perdiste.png";
var archivoRetry    = "Retry.png";

var archivoSuccess  = "Success.png";

var archivoCarrito  = "car.png";
var archivoPared    = "wall.png";




var fondo;

var manager;

var carrito;

var paredesIzq;
var paredesDer;

var imagenTitulo;
var botonStart;

var imagenPerdiste;
var botonRetry;

var imagenSuccess;

///////////////////////////////////////////////////
//                 ESTADOS                       //
///////////////////////////////////////////////////

var estadoNulo       = -1;
var estadoBienvenida = 0;
var estadoJugando    = 1;
var estadoPerdiste   = 2;
var estadoVictoria   = 3;

var estado = estadoNulo;




var tiempoRestante = 0;
var elementoTimer  = null;
var idTimer        = null;




var centroCamino      = anchoEscena / 2;
var objetivoCamino    = anchoEscena / 2;
var pasosHastaCambiar = 0;



function CambiarEstado(siguiente)
{
	// salir 

	if(estado == estadoBienvenida)
	{
		Hide(imagenTitulo.sprite);
		Hide(botonStart.sprite);
	}
	else if(estado == estadoJugando)
	{
		Hide(carrito.sprite);
		HideParedes();
		PararTimer();
	}
	else if(estado == estadoPerdiste)
	{
		Hide(imagenPerdiste.sprite);
		Hide(botonRetry.sprite);
	}
	else if(estado == estadoVictoria)
	{
		Hide(imagenSuccess.sprite);
		Hide(botonRetry.sprite);
	}


	//  entrar 

	if(siguiente == estadoBienvenida)
	{
		Show(imagenTitulo.sprite);
		Show(botonStart.sprite);

		PararTimer();
	}
	else if(siguiente == estadoJugando)
	{
		ReiniciarPartida();

		Show(carrito.sprite);
		ShowParedes();

		IniciarTimer();
	}
	else if(siguiente == estadoPerdiste)
	{
		PararTimer();

		Hide(carrito.sprite);
		HideParedes();

		Show(imagenPerdiste.sprite);
		Show(botonRetry.sprite);
	}
	else if(siguiente == estadoVictoria)
	{
		PararTimer();

		Hide(carrito.sprite);
		HideParedes();

		Show(imagenSuccess.sprite);
		Show(botonRetry.sprite);
	}

	estado = siguiente;
}

///////////////////////////////////////////////////
//              CREATE YOUR SCENE                //
///////////////////////////////////////////////////

function CreateScene()
{
	// Fondo 
	var idx = CreateObject("fondo", tipoFondo, 0, 0, anchoEscena, altoEscena);
	fondo = GetObject(idx);
	fondo.sprite = CreateSprite(archivoFondo);


	// Bienvenida
	idx = CreateObject("titulo", tipoImagenUI, 250, 120, 400, 200);
	imagenTitulo = GetObject(idx);
	imagenTitulo.sprite = CreateSprite(archivoTitulo);
	Hide(imagenTitulo.sprite);

	idx = CreateObject("start", tipoBotonUI, 350, 400, 200, 100);
	botonStart = GetObject(idx);
	botonStart.sprite = CreateSprite(archivoStart);
	Hide(botonStart.sprite);


	// Perdiste + Retry
	idx = CreateObject("perdiste", tipoImagenUI, 250, 150, 400, 200);
	imagenPerdiste = GetObject(idx);
	imagenPerdiste.sprite = CreateSprite(archivoPerdiste);
	Hide(imagenPerdiste.sprite);

	idx = CreateObject("retry", tipoBotonUI, 350, 400, 200, 100);
	botonRetry = GetObject(idx);
	botonRetry.sprite = CreateSprite(archivoRetry);
	Hide(botonRetry.sprite);


	// Success
	idx = CreateObject("success", tipoImagenUI, 250, 150, 400, 200);
	imagenSuccess = GetObject(idx);
	imagenSuccess.sprite = CreateSprite(archivoSuccess);
	Hide(imagenSuccess.sprite);


	// Carrito
	idx = CreateObject("carrito", tipoCarrito, (anchoEscena / 2) - (anchoCarrito / 2), altoEscena - 90, anchoCarrito, altoCarrito);
	carrito = GetObject(idx);
	carrito.sprite   = CreateSprite(archivoCarrito);
	carrito.collider = CreateCollider(bodyTypeDynamic, false);

	Hide(carrito.sprite);


	// Paredes 
	paredesIzq = [];
	paredesDer = [];

	var i = 0;

	while(i < paresParedes)
	{
		var y = -i * espacioParedes;

		var il = CreateObject("paredI_" + i, tipoPared, 0, y, 200, altoPared);
		var ir = CreateObject("paredD_" + i, tipoPared, 0, y, 200, altoPared);

		var pi = GetObject(il);
		var pd = GetObject(ir);

		pi.sprite = CreateSprite(archivoPared);
		pd.sprite = CreateSprite(archivoPared);

		pi.collider = CreateCollider(bodyTypeKinematic, false);
		pd.collider = CreateCollider(bodyTypeKinematic, false);

		Hide(pi.sprite);
		Hide(pd.sprite);

		paredesIzq.push(pi);
		paredesDer.push(pd);

		i ++;
	}


	// Manager
	idx = CreateObject("manager", tipoManager, 0, 0, 0, 0);
	manager = GetObject(idx);


	// Sin gravedad
	gravity = 0;

	
	SetCollisionEnabled(tipoPared, tipoPared, false);
	SetCollisionEnabled(tipoCarrito, tipoPared, false);


	elementoTimer = document.getElementById("number");

	if(!elementoTimer)
	{
		elementoTimer = document.createElement("div");
		elementoTimer.id = "number";
		document.body.appendChild(elementoTimer);
	}

	elementoTimer.style.display      = "none";
	elementoTimer.style.position     = "fixed";
	elementoTimer.style.left         = "20px";
	elementoTimer.style.top          = "20px";
	elementoTimer.style.zIndex       = "999999";
	elementoTimer.style.color        = "white";
	elementoTimer.style.fontSize     = "28px";
	elementoTimer.style.fontWeight   = "800";
	elementoTimer.style.padding      = "8px 12px";
	elementoTimer.style.background   = "rgba(0,0,0,0.45)";
	elementoTimer.style.borderRadius = "10px";
	elementoTimer.style.pointerEvents = "none";


	estado = estadoNulo;
	CambiarEstado(estadoBienvenida);
}

///////////////////////////////////////////////////
//              START YOUR OBJECTS               //
///////////////////////////////////////////////////

function StartObject(index)
{

}

///////////////////////////////////////////////////
//              UPDATE YOUR OBJECTS              //
///////////////////////////////////////////////////

function UpdateObject(index)
{
	var o = GetObject(index);


	if(o.type == tipoManager)
	{
		if(estado == estadoBienvenida)
		{
			if(inputFireDown) CambiarEstado(estadoJugando);
			return;
		}

		if(estado == estadoJugando)
		{
			ActualizarParedes();

			if(HayChoque())
			{
				CambiarEstado(estadoPerdiste);
				return;
			}

			if(tiempoRestante <= 0 || inputFireDown)
			{
				CambiarEstado(estadoVictoria);
				return;
			}

			return;
		}

		if(estado == estadoPerdiste || estado == estadoVictoria)
		{
			if(inputFireDown) CambiarEstado(estadoJugando);
			return;
		}
	}


	if(o.type == tipoCarrito)
	{
		if(estado != estadoJugando) return;

		if(inputLeftPressed)  { o.posX += -velocidadCarrito * timeStep; }
		if(inputRightPressed) { o.posX +=  velocidadCarrito * timeStep; }

		if(o.posX < 0) o.posX = 0;
		if(o.posX + anchoCarrito > anchoEscena) o.posX = anchoEscena - anchoCarrito;

		return;
	}
}

///////////////////////////////////////////////////
//            RESPOND TO INPUT EVENTS            //
///////////////////////////////////////////////////

function OnObjectClicked(objeto)
{
	if(estado == estadoBienvenida)
	{
		if(objeto.type == tipoBotonUI) CambiarEstado(estadoJugando);
	}
	else if(estado == estadoPerdiste || estado == estadoVictoria)
	{
		if(objeto.type == tipoBotonUI) CambiarEstado(estadoJugando);
	}
}

///////////////////////////////////////////////////
//              RESPOND TO COLLISIONS            //
///////////////////////////////////////////////////

function OnObjectCollision(objeto, otro)
{
	
}

///////////////////////////////////////////////////
//                 CAMINO / PAREDES              //
///////////////////////////////////////////////////

function ReiniciarPartida()
{
	PararTimer();

	tiempoRestante = tiempoParaGanar;
	ActualizarTextoTimer();

	carrito.posX = (anchoEscena / 2) - (anchoCarrito / 2);
	carrito.posY = altoEscena - 90;

	AjustarTamano(carrito, anchoCarrito, altoCarrito);

	centroCamino      = anchoEscena / 2;
	objetivoCamino    = anchoEscena / 2;
	pasosHastaCambiar = 3;

	var i = 0;
	while(i < paresParedes)
	{
		ResetearPar(i, -i * espacioParedes);
		i ++;
	}
}

function ActualizarParedes()
{
	var i = 0;

	while(i < paresParedes)
	{
		paredesIzq[i].posY += velocidadParedes * timeStep;
		paredesDer[i].posY += velocidadParedes * timeStep;
		i ++;
	}

	var minY = 999999;

	i = 0;
	while(i < paresParedes)
	{
		if(paredesIzq[i].posY < minY) minY = paredesIzq[i].posY;
		i ++;
	}

	i = 0;
	while(i < paresParedes)
	{
		if(paredesIzq[i].posY > altoEscena)
		{
			var nuevoY = minY - espacioParedes;
			ResetearPar(i, nuevoY);
			minY = nuevoY;
		}

		i ++;
	}
}

function ResetearPar(iPar, y)
{
	ActualizarCentroCamino();

	var xHueco = Math.floor(centroCamino - (anchoHueco / 2));

	var minX = margenHueco;
	var maxX = anchoEscena - margenHueco - anchoHueco;

	if(xHueco < minX) xHueco = minX;
	if(xHueco > maxX) xHueco = maxX;

	var pi = paredesIzq[iPar];
	var pd = paredesDer[iPar];

	pi.posX = 0;
	pi.posY = y;
	AjustarTamano(pi, xHueco, altoPared);

	pd.posX = xHueco + anchoHueco;
	pd.posY = y;
	AjustarTamano(pd, anchoEscena - pd.posX, altoPared);
}

function ActualizarCentroCamino()
{
	if(pasosHastaCambiar <= 0)
	{
		var minCentro = margenHueco + (anchoHueco / 2);
		var maxCentro = anchoEscena - margenHueco - (anchoHueco / 2);

		objetivoCamino = UtilsRandomRangeInt(minCentro, maxCentro);
		pasosHastaCambiar = UtilsRandomRangeInt(2, 5);
	}

	centroCamino = centroCamino + (objetivoCamino - centroCamino) * 0.25;
	pasosHastaCambiar --;
}

///////////////////////////////////////////////////
//                 CHOQUE                        //
///////////////////////////////////////////////////

function HayChoque()
{
	var car = Rect(carrito, recorteCarritoX, recorteCarritoY);

	var i = 0;
	while(i < paresParedes)
	{
		var izq = Rect(paredesIzq[i], recorteParedX, recorteParedY);
		var der = Rect(paredesDer[i], recorteParedX, recorteParedY);

		if(SeChocan(car, izq)) return true;
		if(SeChocan(car, der)) return true;

		i ++;
	}

	return false;
}

function Rect(obj, recX, recY)
{
	var w = AnchoObj(obj);
	var h = AltoObj(obj);

	var x = obj.posX;
	var y = obj.posY;

	if(posicionEsCentro)
	{
		x = x - (w / 2);
		y = y - (h / 2);
	}

	x = x + recX;
	y = y + recY;
	w = w - (recX * 2);
	h = h - (recY * 2);

	if(w < 1) w = 1;
	if(h < 1) h = 1;

	return { x: x, y: y, w: w, h: h };
}


function SeChocan(a, b)
{
	var separados =
		(a.x + a.w <= b.x) ||
		(a.x >= b.x + b.w) ||
		(a.y + a.h <= b.y) ||
		(a.y >= b.y + b.h);

	return !separados;
}

function AnchoObj(o)
{
	if(o.width != null) return o.width;
	if(o.sizeX != null) return o.sizeX;
	return 0;
}

function AltoObj(o)
{
	if(o.height != null) return o.height;
	if(o.sizeY != null) return o.sizeY;
	return 0;
}

///////////////////////////////////////////////////
//                 TIMER                         //
///////////////////////////////////////////////////

function IniciarTimer()
{
	if(idTimer != null)
	{
		window.clearInterval(idTimer);
		idTimer = null;
	}

	if(tiempoRestante <= 0) tiempoRestante = tiempoParaGanar;

	ActualizarTextoTimer();
	if(elementoTimer) elementoTimer.style.display = "block";

	idTimer = window.setInterval(function(){

		if(estado != estadoJugando) return;

		tiempoRestante --;
		if(tiempoRestante < 0) tiempoRestante = 0;

		ActualizarTextoTimer();

	}, 1000);
}

function PararTimer()
{
	if(idTimer != null)
	{
		window.clearInterval(idTimer);
		idTimer = null;
	}

	if(elementoTimer) elementoTimer.style.display = "none";
}

function ActualizarTextoTimer()
{
	if(elementoTimer)
	{
		elementoTimer.innerHTML = "Tiempo: " + tiempoRestante;
	}
}

///////////////////////////////////////////////////
//                 HELPERS VISUALES              //
///////////////////////////////////////////////////

function AjustarTamano(obj, w, h)
{
	obj.width  = w;
	obj.height = h;

	obj.sizeX  = w;
	obj.sizeY  = h;
}

function Show(spriteIndex)
{
	if(spriteIndex >= 0) ShowSprite(spriteIndex);
}

function Hide(spriteIndex)
{
	if(spriteIndex >= 0) HideSprite(spriteIndex);
}

function ShowParedes()
{
	var i = 0;
	while(i < paresParedes)
	{
		Show(paredesIzq[i].sprite);
		Show(paredesDer[i].sprite);
		i ++;
	}
}

function HideParedes()
{
	var i = 0;
	while(i < paresParedes)
	{
		Hide(paredesIzq[i].sprite);
		Hide(paredesDer[i].sprite);
		i ++;
	}
}
