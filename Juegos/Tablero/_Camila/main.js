let cartas = [
    'mariquita.png', 'mariquita.png',
    'leon.png', 'leon.png',
    'jirafa.png', 'jirafa.png',
    'caballo.png', 'caballo.png'
];

let primera = null;
let segunda = null;
let bloqueo = false;
let parejasEncontradas = 0;
let tiempoInicio = 0;
let puntuacion = 0;
let audioHabilitado = true;

let sonidoCarta = new Audio('sonidos/bamboo-whoosh-429156.mp3');
let sonidoVictoria = new Audio('sonidos/winning-218995.mp3');

const pantallaBienvenida = document.getElementById('pantalla-bienvenida');
const pantallaJuego = document.getElementById('pantalla-juego');
const pantallaResultados = document.getElementById('pantalla-resultados');
const tablero = document.getElementById('tablero');
const btnComenzar = document.getElementById('btnComenzar');
const btnReiniciar = document.getElementById('btnReiniciar');
const btnJugarOtraVez = document.getElementById('btnJugarOtraVez');
const btnVolverMenu = document.getElementById('btnVolverMenu');
const btnAudio = document.getElementById('btnAudio');
const puntuacionActual = document.getElementById('puntuacion-actual');
const parejasEncontradasSpan = document.getElementById('parejas-encontradas');
const puntuacionFinal = document.getElementById('puntuacion-final');
const tiempoFinal = document.getElementById('tiempo-final');
const recordMostrar = document.getElementById('record-mostrar');
const recordActual = document.getElementById('record-actual');
const nuevoRecord = document.getElementById('nuevo-record');

btnComenzar.addEventListener('click', iniciarJuego);
btnReiniciar.addEventListener('click', iniciarJuego);
btnJugarOtraVez.addEventListener('click', iniciarJuego);
btnVolverMenu.addEventListener('click', () => {
    mostrarPantalla(pantallaBienvenida);
    cargarRecord();
});
btnAudio.addEventListener('click', () => {
    audioHabilitado = !audioHabilitado;
    btnAudio.textContent = audioHabilitado ? '🔊' : '🔇';
});

cargarRecord();

function mostrarPantalla(pantalla) {
    pantallaBienvenida.classList.remove('activa');
    pantallaJuego.classList.remove('activa');
    pantallaResultados.classList.remove('activa');
    pantalla.classList.add('activa');
}

function iniciarJuego() {
    mostrarPantalla(pantallaJuego);
    parejasEncontradas = 0;
    puntuacion = 0;
    primera = null;
    segunda = null;
    bloqueo = false;
    tiempoInicio = Date.now();
    puntuacionActual.textContent = 0;
    parejasEncontradasSpan.textContent = 0;
    tablero.innerHTML = '';
    
    let cartasMezcladas = [...cartas];
    cartasMezcladas.sort(() => Math.random() - 0.5);
    
    cartasMezcladas.forEach((img) => {
        let div = document.createElement('div');
        div.className = 'carta';
        div.innerHTML = '?';
        div.dataset.imagen = img;
        div.addEventListener('click', () => voltearCarta(div));
        tablero.appendChild(div);
    });
}

function voltearCarta(cartaHTML) {
    if (bloqueo || cartaHTML.innerHTML !== '?') return;
    
    if (audioHabilitado) {
        sonidoCarta.currentTime = 0;
        sonidoCarta.play();
    }
    
    let img = cartaHTML.dataset.imagen;
    cartaHTML.innerHTML = `<img src="imagenes/${img}">`;
    
    if (!primera) {
        primera = { elemento: cartaHTML, valor: img };
    } else {
        segunda = { elemento: cartaHTML, valor: img };
        bloqueo = true;
        
        setTimeout(() => {
            if (primera.valor === segunda.valor) {
                primera.elemento.classList.add('encontrada');
                segunda.elemento.classList.add('encontrada');
                parejasEncontradas++;
                puntuacion += 100;
                parejasEncontradasSpan.textContent = parejasEncontradas;
                puntuacionActual.textContent = puntuacion;
                
                if (parejasEncontradas === 4) {
                    finalizarJuego();
                }
            } else {
                primera.elemento.innerHTML = '?';
                segunda.elemento.innerHTML = '?';
            }
            primera = null;
            segunda = null;
            bloqueo = false;
        }, 800);
    }
}

function finalizarJuego() {
    let segundos = Math.floor((Date.now() - tiempoInicio) / 1000);
    
    if (audioHabilitado) {
        sonidoVictoria.currentTime = 0;
        sonidoVictoria.play();
    }
    
    puntuacion += Math.max(0, 500 - (segundos * 10));
    puntuacionFinal.textContent = puntuacion;
    tiempoFinal.textContent = segundos;
    
    let recordAnterior = obtenerRecord();
    if (puntuacion > recordAnterior) {
        document.cookie = `record=${puntuacion}; max-age=31536000`;
        nuevoRecord.style.display = 'block';
        recordActual.textContent = puntuacion;
    } else {
        nuevoRecord.style.display = 'none';
        recordActual.textContent = recordAnterior;
    }
    
    setTimeout(() => mostrarPantalla(pantallaResultados), 500);
}

function obtenerRecord() {
    let cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        let [nombre, valor] = cookie.trim().split('=');
        if (nombre === 'record') return parseInt(valor) || 0;
    }
    return 0;
}

function cargarRecord() {
    let record = obtenerRecord();
    recordMostrar.textContent = record > 0 ? record : '-';
}
