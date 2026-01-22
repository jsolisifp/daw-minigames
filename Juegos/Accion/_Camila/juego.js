let fondo = document.getElementById("fondo");
let trex = document.getElementById("trex");
let obstaculo = document.getElementById("obstaculo");
let textoPuntos = document.getElementById("puntaje");
let saltando = false;
let juegoTerminado = false;
let puntos = 0;
let obstaculoSaltado = false;

/* =====================================
   CAMBIO DE FONDO
===================================== */
setInterval(function () {
  if (fondo.src.includes("fondo1.png")) {
    fondo.src = "img/fondo2.png";
  } else {
    fondo.src = "img/fondo1.png";
  }
}, 2000);

/* =====================================
   SALTO DEL TREX
===================================== */
function saltar() {

  if (saltando) return;
  if (juegoTerminado) return;

  saltando = true;

  let posicion = parseInt(
    window.getComputedStyle(trex).bottom
  );

  let subir = setInterval(function () {

    if (posicion >= 200) {
      clearInterval(subir);

      let bajar = setInterval(function () {

        if (posicion <= 120) {
          clearInterval(bajar);
          saltando = false;
        }

        posicion -= 10;
        trex.style.bottom = posicion + "px";

      }, 20);
    }

    posicion += 10;
    trex.style.bottom = posicion + "px";

  }, 20);
}

document.addEventListener("keydown", saltar);

/* =====================================
   MOVIMIENTO DEL OBSTÁCULO
===================================== */
let x = 700;

function moverObstaculo() {

  setInterval(function () {

    if (juegoTerminado) return;

    x -= 6;
    obstaculo.style.left = x + "px";

    if (x < -100) {

      if (obstaculoSaltado) {
        puntos += 20;
        textoPuntos.innerHTML = "Puntos: " + puntos;
      }

      obstaculoSaltado = false;
      x = 800;
    }

    detectarChoque();

  }, 20);
}

moverObstaculo();

/* =====================================
   COLISIÓN
===================================== */
function detectarChoque() {

  if (x > 40 && x < 100) {

    if (saltando) {
      obstaculoSaltado = true;
    } else {
      gameOver();
    }

  }
}

/* =====================================
   FIN DEL JUEGO
===================================== */
function gameOver() {

  juegoTerminado = true;

  document.getElementById("puntosFinal").innerHTML =
    "Puntos: " + puntos;

  document.getElementById("gameOverPantalla").style.display = "flex";
}

/* =====================================
   REINICIAR
===================================== */
function reiniciar() {

  puntos = 0;
  textoPuntos.innerHTML = "Puntos: 0";

  x = 800;
  obstaculo.style.left = x + "px";

  obstaculoSaltado = false;
  juegoTerminado = false;

  document.getElementById("gameOverPantalla").style.display = "none";
}
