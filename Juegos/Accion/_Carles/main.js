let dino = document.getElementById("dino");
let cactus = document.getElementById("cactus");
let pajaro = document.getElementById("pajaro");

let moverCactus = null;
let moverPajaro = null;
let detectarColision = null;

let velocidad = 7;
let jugando = false;
let distanciaMinima = 200;

// SALTAR
document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && jugando) {
        if (!dino.classList.contains("saltar")) {
            dino.classList.add("saltar");
            setTimeout(() => {
                dino.classList.remove("saltar");
            }, 500);
        }
    }
});

function empezar() {
    if (jugando) return;
    jugando = true;

    cactus.style.left = "600px";
    pajaro.style.left = "900px";

    generarCactus();
    generarPajaro();

    // MOVER CACTUS
    moverCactus = setInterval(() => {
        let left = parseInt(getComputedStyle(cactus).left);

        if (left <= -30) {
            cactus.style.left = "600px";
            generarCactus();
        } else {
            cactus.style.left = left - velocidad + "px";
        }
    }, 20);

    // MOVER PAJARO
    moverPajaro = setInterval(() => {
        let left = parseInt(getComputedStyle(pajaro).left);

        if (left <= -30) {
            pajaro.style.left = "900px";
            generarPajaro();
        } else {
            pajaro.style.left = left - velocidad + "px";
        }
    }, 20);

    detectarColision = setInterval(() => {
        let dinoBottom = parseInt(getComputedStyle(dino).bottom);

        let cactusLeft = parseInt(getComputedStyle(cactus).left);
        let cactusHeight = parseInt(getComputedStyle(cactus).height);

        let pajaroLeft = parseInt(getComputedStyle(pajaro).left);
        let pajaroBottom = parseInt(getComputedStyle(pajaro).bottom);

        // choque cactus
        if (cactusLeft < 90 && cactusLeft > 50 && dinoBottom < cactusHeight) {
            gameOver();
        }

        // choque pájaro
        if (pajaroLeft < 90 && pajaroLeft > 50 && dinoBottom + 40 > pajaroBottom) {
            gameOver();
        }
    }, 20);
}

function generarCactus() {
    let altura = Math.floor(Math.random() * 30) + 30;
    cactus.style.height = altura + "px";
    cactus.style.bottom = "0px";

    // Distancia mínima con el pájaro
    let pajaroLeft = parseInt(getComputedStyle(pajaro).left);
    let cactusLeft = parseInt(getComputedStyle(cactus).left);

    if (Math.abs(cactusLeft - pajaroLeft) < distanciaMinima) {
        cactus.style.left = (pajaroLeft + distanciaMinima) + "px";
    }
}

function generarPajaro() {
    let alturaVuelo = Math.floor(Math.random() * 60) + 60;
    pajaro.style.bottom = alturaVuelo + "px";

    let cactusLeft = parseInt(getComputedStyle(cactus).left);
    let pajaroLeft = parseInt(getComputedStyle(pajaro).left);

    if (Math.abs(pajaroLeft - cactusLeft) < distanciaMinima) {
        pajaro.style.left = (cactusLeft + distanciaMinima) + "px";
    }
}

function gameOver() {
    clearInterval(moverCactus);
    clearInterval(moverPajaro);
    clearInterval(detectarColision);
    jugando = false;

    let reiniciarJuego = confirm("💀 GAME OVER\n¿Quieres reiniciar la partida?");

    if (reiniciarJuego) {
        reiniciar();
        empezar();
    }
}

function reiniciar() {
    clearInterval(moverCactus);
    clearInterval(moverPajaro);
    clearInterval(detectarColision);
    jugando = false;

    cactus.style.left = "600px";
    pajaro.style.left = "900px";
}
