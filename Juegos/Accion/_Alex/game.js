

(() => {



  // Canvas donde se dibuja el juego
  const canvas = document.getElementById("game");

  
  const ctx = canvas.getContext("2d");

  // Elementos del HUD 
  const elScore = document.getElementById("score");
  const elLives = document.getElementById("lives");

  // Elementos del overlay 
  const overlay = document.getElementById("overlay");
  const title = document.getElementById("title");
  const subtitle = document.getElementById("subtitle");
  const btnStart = document.getElementById("btnStart");
  const btnRestart = document.getElementById("btnRestart");



  let running = false;
  let paused = false;
  let waitingLaunch = true;

  // Variables típicas de Arkanoid
  let score = 0;
  let lives = 3;

  // Dimensiones fijas del canvas 
  const W = canvas.width;
  const H = canvas.height;




  const paddle = {
    w: 120,                 // ancho
    h: 14,                  // alto
    x: (W - 120) / 2,       // posición inicial centrada
    y: H - 36,              // cerca de la parte inferior
    speed: 520,             // velocidad en px/segundo
    dir: 0                  // dirección: -1 izquierda, +1 derecha, 0 parado
  };


  const ball = {
    r: 8,                   // radio
    x: W / 2,               // posición inicial X
    y: paddle.y - 8,        // posición inicial Y 
    vx: 240,                // velocidad horizontal 
    vy: -240,               // velocidad vertical
  };


  const bricks = {
    cols: 10,               // columnas
    rows: 6,                // filas
    gap: 10,                // separación entre ladrillos
    top: 70,                // margen superior
    left: 40,               // margen izquierdo
    h: 22,                  // altura de cada ladrillo
    // el ancho de ladrillo se calcula según canvas, por eso no está fijo aquí
    list: []                // aquí guardo todos los ladrillos generados
  };


  function resetBricks() {
    // Vaciamos la lista y la volvemos a rellenar
    bricks.list = [];

    // Total de espacio ocupado por los huecos entre columnas
    const totalGap = (bricks.cols - 1) * bricks.gap;

    // Ancho usable del canvas, descontando márgenes laterales
    const usableW = W - bricks.left * 2;

    // Ancho de cada ladrillo calculado para que encaje perfecto
    const bw = (usableW - totalGap) / bricks.cols;

    // Recorremos filas y columnas y creamos cada ladrillo con su posición
    for (let r = 0; r < bricks.rows; r++) {
      for (let c = 0; c < bricks.cols; c++) {
        bricks.list.push({
          x: bricks.left + c * (bw + bricks.gap),
          y: bricks.top + r * (bricks.h + bricks.gap),
          w: bw,
          h: bricks.h,
          alive: true,       // si está vivo se dibuja y colisiona
          // HP: los de arriba aguantan 2 golpes y el resto 1
          hp: r < 2 ? 2 : 1
        });
      }
    }
  }

  
  function resetBallAndPaddle() {
    // Devolvemos la pala al centro y paramos su movimiento
    paddle.x = (W - paddle.w) / 2;
    paddle.dir = 0;

    // Colocamos la bola encima de la pala
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - ball.r - 1;

    // Le damos una velocidad inicial aleatoria en X 
    ball.vx = 240 * (Math.random() < 0.5 ? -1 : 1);

    // Y siempre sale hacia arriba
    ball.vy = -260;

    // Marcamos que todavía no se ha lanzado la bola
    waitingLaunch = true;
  }


  function resetGame() {
    // Reiniciamos variables de partida
    score = 0;
    lives = 3;
    paused = false;
    running = false;

    // Regeneramos ladrillos y recolocamos bola+pala
    resetBricks();
    resetBallAndPaddle();

    // Actualizamos HUD y mostramos pantalla de inicio
    updateHUD();
    showOverlay("ARKANOID", "Pulsa <b>Espacio</b> para empezar");
  }


  function updateHUD() {
    elScore.textContent = `Puntos: ${score}`;
    elLives.textContent = `Vidas: ${lives}`;
  }



  // Muestra overlay con título y subtítulo 
  function showOverlay(t, subHtml) {
    title.textContent = t;
    subtitle.innerHTML = subHtml; 
    overlay.classList.remove("hidden");
  }

  // Oculta el overlay (para jugar)
  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  // Empieza el juego si todavía no estaba corriendo
  function startGame() {
    if (!running) {
      running = true;
      paused = false;
      hideOverlay();
    }
  }

  // Pausa / reanuda. Cuando se pausa muestro overlay.
  function togglePause() {
    if (!running) return; 
    paused = !paused;

    if (paused) {
      showOverlay("PAUSA", "Pulsa <b>P</b> para continuar");
    } else {
      hideOverlay();
    }
  }

  

  // Uso un Set para saber qué teclas están pulsadas 
  const keys = new Set();

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();

    // Tecla P: alterna pausa
    if (k === "p") {
      e.preventDefault();
      togglePause();
      return;
    }

    // Espacio: iniciar o lanzar bola
    if (k === " " || k === "spacebar") {
      e.preventDefault();

      // Si aún no ha empezado la partida, la arrancamos
      if (!running) startGame();

      // Si estamos en partida y no estamos pausados, lanzamos bola
      if (running && !paused) waitingLaunch = false;
      return;
    }

    // Guardamos tecla pulsada
    keys.add(k);

    // Movimiento izquierda/derecha
    if (k === "arrowleft" || k === "a") paddle.dir = -1;
    if (k === "arrowright" || k === "d") paddle.dir = 1;
  });

  window.addEventListener("keyup", (e) => {
    const k = e.key.toLowerCase();
    keys.delete(k);

    // Comprobamos si aún quedan teclas de izquierda/derecha pulsadas
    const leftHeld = keys.has("arrowleft") || keys.has("a");
    const rightHeld = keys.has("arrowright") || keys.has("d");

    // Si no hay ninguna, paramos la pala
    if (!leftHeld && !rightHeld) paddle.dir = 0;
    // Si sigue pulsada izquierda, mantenemos dirección izquierda
    else if (leftHeld) paddle.dir = -1;
    // Si sigue pulsada derecha, mantenemos dirección derecha
    else if (rightHeld) paddle.dir = 1;
  });



  // Esta función convierte la posición del puntero  a coordenadas del canvas
  function pointerToPaddle(clientX) {
    // Rectángulo real del canvas en pantalla (porque es responsive)
    const rect = canvas.getBoundingClientRect();

    // Convertimos a coordenada interna del canvas 
    const x = (clientX - rect.left) * (canvas.width / rect.width);

    // Colocamos la pala centrada respecto al puntero
    paddle.x = x - paddle.w / 2;

    // "Clamp": evitamos que la pala se salga por los lados del canvas
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.w > W) paddle.x = W - paddle.w;

    // Si la bola aún no se ha lanzado, la mantenemos pegada a la pala
    if (waitingLaunch) {
      ball.x = paddle.x + paddle.w / 2;
      ball.y = paddle.y - ball.r - 1;
    }
  }

  // Eventos de ratón y táctil que llaman a la función anterior
  canvas.addEventListener("mousemove", (e) => pointerToPaddle(e.clientX));

  canvas.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches[0]) pointerToPaddle(e.touches[0].clientX);
  }, { passive: true });

  canvas.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) pointerToPaddle(e.touches[0].clientX);
  }, { passive: true });



  // Botón empezar: simplemente inicia la partida
  btnStart.addEventListener("click", () => startGame());

  // Botón reiniciar: reinicia el juego y arranca
  btnRestart.addEventListener("click", () => {
    resetGame();
    startGame();
  });



  // clamp: limita un valor entre un mínimo y un máximo (lo uso mucho)
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // Colisión círculo-rectángulo:
  // - Busco el punto más cercano del rect al centro del círculo
  // - Si la distancia a ese punto es menor que el radio entonces colisión
  function circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
    const nearestX = clamp(cx, rx, rx + rw);
    const nearestY = clamp(cy, ry, ry + rh);
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return (dx * dx + dy * dy) <= cr * cr;
  }

  // Rebote aproximado con un rectángulo:
  // intentamos decidir si el choque fue lateral o vertical comparando solpamientos.
  function reflectBallFromRect(rectX, rectY, rectW, rectH) {
    const overlapLeft = (ball.x + ball.r) - rectX;
    const overlapRight = (rectX + rectW) - (ball.x - ball.r);
    const overlapTop = (ball.y + ball.r) - rectY;
    const overlapBottom = (rectY + rectH) - (ball.y - ball.r);

    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    // Si el mínimo solapamiento fue por izquierda o derecha entonces invertimos vx
    if (minOverlap === overlapLeft || minOverlap === overlapRight) {
      ball.vx *= -1;
    } else {
      // Si fue por arriba o abajo wntonces invertimos vy
      ball.vy *= -1;
    }
  }



  // last se usa para calcular dt (tiempo entre frames)
  let last = performance.now();

  //  aquí está la lógica del juego 
  function update(dt) {

    // --- Movimiento de la pala con teclado ---
    // (si estás usando ratón, paddle.x ya se actualiza en pointerToPaddle)
    if (paddle.dir !== 0) {
      paddle.x += paddle.dir * paddle.speed * dt;
      paddle.x = clamp(paddle.x, 0, W - paddle.w);
    }

    // --- Si la bola no se ha lanzado, va pegada a la pala ---
    if (waitingLaunch) {
      ball.x = paddle.x + paddle.w / 2;
      ball.y = paddle.y - ball.r - 1;
      return; // no calculamos colisiones aún
    }

    // --- Movimiento de la bola ---
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // --- Colisiones con paredes ---
    // Pared izquierda
    if (ball.x - ball.r <= 0) {
      ball.x = ball.r;   // recolocamos dentro para que no se quede fuera
      ball.vx *= -1;     // invertimos dirección
    }
    // Pared derecha
    if (ball.x + ball.r >= W) {
      ball.x = W - ball.r;
      ball.vx *= -1;
    }
    // Techo
    if (ball.y - ball.r <= 0) {
      ball.y = ball.r;
      ball.vy *= -1;
    }

    // --- Si la bola cae por abajo: pierdes vida ---
    if (ball.y - ball.r > H) {
      lives--;
      updateHUD();

      // Si no quedan vidas = fin de partida
      if (lives <= 0) {
        running = false;
        showOverlay("HAS PERDIDO", `Puntos: <b>${score}</b><br>Pulsa <b>Reiniciar</b>`);
        return;
      }

      // Si quedan vidas, recolocamos bola y pala y esperamos lanzamiento
      resetBallAndPaddle();
      return;
    }

    // --- Colisión con la pala ---
    if (circleRectCollision(ball.x, ball.y, ball.r, paddle.x, paddle.y, paddle.w, paddle.h)) {

      // Para que el rebote sea más jugable, calculo donde golpea la bola
      // hit: -1 golpea en extremo izquierdo, +1 en extremo derecho
      const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);

      // Mantengo la velocidad total, pero cambio el ángulo según hit
      const speed = Math.hypot(ball.vx, ball.vy);

      // Máximo 60º hacia izquierda o derecha
      const angle = hit * (Math.PI / 3);

      // Descomposición trigonométrica de la velocidad
      ball.vx = speed * Math.sin(angle);
      ball.vy = -Math.abs(speed * Math.cos(angle)); // siempre hacia arriba al rebotar

      // Pequeño ajuste para evitar múltiples colisiones en el mismo frame
      ball.y = paddle.y - ball.r - 1;
    }

    // --- Colisión con ladrillos ---
    // aliveCount lo uso para saber si ya no queda ninguno = victoria
    let aliveCount = 0;

    for (const b of bricks.list) {
      if (!b.alive) continue;
      aliveCount++;

      // Si la bola toca el ladrillo procesamos colisión
      if (circleRectCollision(ball.x, ball.y, ball.r, b.x, b.y, b.w, b.h)) {

        // Rebote aproximado según lado de choque
        reflectBallFromRect(b.x, b.y, b.w, b.h);

        // Quitamos vida al ladrillo
        b.hp--;

        // Si llega a 0, se destruye y da más puntos
        if (b.hp <= 0) {
          b.alive = false;
          score += 10;
        } else {
          // Si no se destruye aún, damos menos puntos
          score += 5;
        }

        updateHUD();

        // solo permito 1 choque por frame para evitar atravesar ladrillos
        break;
      }
    }

    // --- Condición de victoria: no queda ningún ladrillo vivo ---
    if (aliveCount === 0) {
      running = false;
      showOverlay("¡HAS GANADO!", `Puntos: <b>${score}</b><br>Pulsa <b>Reiniciar</b>`);
    }
  }

  // DRAW: aquí solo dibujo el estado actual 
  function draw() {

    // Limpio la pantalla cada frame
    ctx.clearRect(0, 0, W, H);

    // Línea decorativa para separar un poco el HUD visualmente
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 52, W, 1);
    ctx.globalAlpha = 1;

    // --- Dibujar ladrillos ---
    for (const b of bricks.list) {
      if (!b.alive) continue;

      // Diferencio ladrillos "duros" (hp=2) con más opacidad
      ctx.fillStyle = b.hp === 2 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.65)";
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // Sombra simple para dar volumen (muy básica)
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#000000";
      ctx.fillRect(b.x, b.y + b.h - 3, b.w, 3);
      ctx.globalAlpha = 1;
    }

    // --- Dibujo pala ---
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

    // --- Dibujo bola ---
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fill();
  }

  // LOOP: bucle principal del juego con requestAnimationFrame
  function loop(now) {

    // dt = tiempo en segundos desde el último frame
    // Lo limito a 0.033 (~30 FPS) para evitar saltos raros si el navegador se cuelga un instante
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    // Solo actualizo la lógica si el juego está corriendo y no está pausado
    if (running && !paused) update(dt);

    // Siempre dibujo (aunque esté en pausa, así se ve el estado congelado)
    draw();

    // Siguiente frame
    requestAnimationFrame(loop);
  }



  // Reseteo todo para empezar en menú
  resetGame();

  // Arranco el loop (aunque no esté "running", así se dibuja la pantalla)
  requestAnimationFrame(loop);


  canvas.addEventListener("click", () => {
    // Si no ha empezado, lo inicio (equivalente a botón start)
    if (!running) startGame();

    // Si está en partida y no está pausado, lanzo la bola si estaba esperando
    if (running && !paused) waitingLaunch = false;
  });

})(); 
