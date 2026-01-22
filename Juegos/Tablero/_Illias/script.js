var casillas = [];
var movimientos = 0;
var vacia = 8;
var segundos = 0;        
var intervaloTiempo = null;
var sonidoActivado = true; 

function iniciarTiempo() {
    segundos = 0;
    document.getElementById('tiempo').innerHTML = segundos;

    if (intervaloTiempo) {
        clearInterval(intervaloTiempo);
    }

    intervaloTiempo = setInterval(function () {
        segundos = segundos + 1; 
        document.getElementById('tiempo').innerHTML = segundos;
        
        
        var puntuacion = Math.max(0, 1000 - segundos);
        document.getElementById('puntuacionJuego').innerHTML = puntuacion;
    }, 1000);
}

function detenerTiempo() {
    if (intervaloTiempo) {
        clearInterval(intervaloTiempo);
        intervaloTiempo = null;
    }
}

function empezar() {
    movimientos = 0;
    document.getElementById('contador').innerHTML = movimientos;
    document.getElementById('puntuacionJuego').innerHTML = 1000;

    casillas = document.getElementById('tablero').getElementsByTagName('div');

    casillas[0].innerHTML = '1';
    casillas[1].innerHTML = '2';
    casillas[2].innerHTML = '3';
    casillas[3].innerHTML = '4';
    casillas[4].innerHTML = '5';
    casillas[5].innerHTML = '6';
    casillas[6].innerHTML = '7';
    casillas[7].innerHTML = '8';
    casillas[8].innerHTML = '';
    casillas[8].className = 'vacio';

    mezclar();
    iniciarTiempo();

    document.getElementById('menu').style.display = 'none';
    document.getElementById('juego').style.display = 'block';
    document.getElementById('ganar').style.display = 'none';
    
    
    cargarRecord();
}

function mezclar() {
    
    

    var movimientosAleatorios = 15; 

    for (var i = 0; i < movimientosAleatorios; i++) {
        var posicion = Math.floor(Math.random() * 9); 

        if (puedoMover(posicion)) {
            intercambiar(posicion);
        }
    }
}

function puedoMover(num) {
    if (num == vacia) return false;

    if (num == 0 && (vacia == 1 || vacia == 3)) return true;
    if (num == 1 && (vacia == 0 || vacia == 2 || vacia == 4)) return true;
    if (num == 2 && (vacia == 1 || vacia == 5)) return true;
    if (num == 3 && (vacia == 0 || vacia == 4 || vacia == 6)) return true;
    if (num == 4 && (vacia == 1 || vacia == 3 || vacia == 5 || vacia == 7)) return true;
    if (num == 5 && (vacia == 2 || vacia == 4 || vacia == 8)) return true;
    if (num == 6 && (vacia == 3 || vacia == 7)) return true;
    if (num == 7 && (vacia == 4 || vacia == 6 || vacia == 8)) return true;
    if (num == 8 && (vacia == 5 || vacia == 7)) return true;

    return false;
}

function mover(num) {
    if (puedoMover(num)) {
        intercambiar(num);

        movimientos++;
        document.getElementById('contador').innerHTML = movimientos;

        var esVictoria = gane();

        if (esVictoria) {
            if (sonidoActivado) {
                var victorySound = document.getElementById('victorySound');
                if (victorySound) {
                    victorySound.currentTime = 0;
                    victorySound.play();
                }
            }
        } else {
            if (sonidoActivado) {
                var moveSound = document.getElementById('moveSound');
                if (moveSound) {
                    moveSound.currentTime = 0;
                    moveSound.play();
                }
            }
        }

        if (esVictoria) {
            detenerTiempo();

            var tiempoTotal = segundos;
            document.getElementById('tiempoFinal').innerHTML = tiempoTotal;
            
            var puntuacion = Math.max(0, 1000 - tiempoTotal);
            document.getElementById('puntuacion').innerHTML = puntuacion;

            
            guardarRecord(puntuacion);
            cargarRecord();

            document.getElementById('final').innerHTML = movimientos;
            document.getElementById('menu').style.display = 'none';
            document.getElementById('juego').style.display = 'none';
            document.getElementById('ganar').style.display = 'block';
        }
    }
}

function intercambiar(num) {
    var texto = casillas[num].innerHTML;
    var clase = casillas[num].className;

    casillas[num].innerHTML = casillas[vacia].innerHTML;
    casillas[num].className = casillas[vacia].className;

    casillas[vacia].innerHTML = texto;
    casillas[vacia].className = clase;

    vacia = num;
}

function gane() {
    if (casillas[0].innerHTML != '1') return false;
    if (casillas[1].innerHTML != '2') return false;
    if (casillas[2].innerHTML != '3') return false;
    if (casillas[3].innerHTML != '4') return false;
    if (casillas[4].innerHTML != '5') return false;
    if (casillas[5].innerHTML != '6') return false;
    if (casillas[6].innerHTML != '7') return false;
    if (casillas[7].innerHTML != '8') return false;
    if (casillas[8].innerHTML != '') return false;

    return true;
}

function reiniciar() {
    empezar();
}

function volver() {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('juego').style.display = 'none';
    document.getElementById('ganar').style.display = 'none';
    cargarRecord(); 
}


function cambiarSonido() {
    sonidoActivado = !sonidoActivado; 
    
    
    if (sonidoActivado) {
        document.getElementById('botonSonido').innerHTML = 'SONIDO: ON';
        document.getElementById('botonSonidoJuego').innerHTML = 'SONIDO: ON';
        document.getElementById('botonSonidoGanar').innerHTML = 'SONIDO: ON';
    } else {
        document.getElementById('botonSonido').innerHTML = 'SONIDO: OFF';
        document.getElementById('botonSonidoJuego').innerHTML = 'SONIDO: OFF';
        document.getElementById('botonSonidoGanar').innerHTML = 'SONIDO: OFF';
    }
}


function guardarRecord(puntuacion) {
    var recordActual = leerRecord();
    
    
    if (puntuacion > recordActual) {
        document.cookie = 'record=' + puntuacion + '; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/';
    }
}


function leerRecord() {
    var cookies = document.cookie.split(';');
    
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf('record=') == 0) {
            return parseInt(cookie.substring(7)) || 0;
        }
    }
    
    return 0; 
}


function cargarRecord() {
    var record = leerRecord();
    var elementoRecord = document.getElementById('record');
    if (elementoRecord) {
        elementoRecord.innerHTML = record;
    }
}


window.onload = function() {
    cambiarSonido(); 
    cambiarSonido(); 
    cargarRecord(); 
};
