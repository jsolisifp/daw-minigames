// Variables globales del juego
let gameState = {
    cards: [], // Aquí guardamos todas las cartas del juego
    flippedCards: [], // Cartas que están volteadas actualmente
    matchedPairs: 0, // Cuántas parejas hemos encontrado
    totalPairs: 0, // Cuántas parejas hay en total
    moves: 0, // Cuántos movimientos hemos hecho
    score: 0, // Nuestra puntuación
    timeLeft: 120, // Tiempo que nos queda (2 minutos)
    timer: null, // Para controlar el temporizador
    gameActive: false, // Si el juego está en marcha o no
    difficulty: 'easy', // Dificultad actual
    musicEnabled: true, // Si la música está activada
    soundEnabled: true, // Si los sonidos están activados
    canFlip: true, // Si podemos voltear cartas (para evitar voltear muchas a la vez)
    userInteracted: false, // Si el usuario ha hecho clic (necesario para el audio)
    isMusicPlaying: false // Si la música está sonando ahora mismo
};

// Configuraciones para cada dificultad
const difficultySettings = {
    easy: { rows: 4, cols: 4, time: 120 }, // 4x4 = 16 cartas = 8 parejas
    medium: { rows: 4, cols: 5, time: 150 }, // 4x5 = 20 cartas = 10 parejas
    hard: { rows: 5, cols: 6, time: 180 } // 5x6 = 30 cartas = 15 parejas
};

// Íconos que aparecerán en las cartas (Font Awesome)
const cardIcons = [
    'fas fa-heart', 'fas fa-star', 'fas fa-moon', 'fas fa-sun',
    'fas fa-cloud', 'fas fa-bolt', 'fas fa-leaf', 'fas fa-gem',
    'fas fa-bell', 'fas fa-key', 'fas fa-flag', 'fas fa-home',
    'fas fa-tree', 'fas fa-umbrella', 'fas fa-snowflake', 'fas fa-anchor'
];

// Cuando la página termina de cargar, empezamos
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página lista, vamos a configurar el juego...');
    
    // Conectamos todos los botones a sus funciones
    setupEventListeners();
    
    // Cargamos lo que el usuario guardó antes (música, sonidos)
    loadPreferences();
    
    // Mostramos los récords guardados
    updateRecordsDisplay();
    
    // Preparamos el sistema de audio
    setupAudioInteraction();
});

// Configuramos el audio para que funcione cuando el usuario haga clic
function setupAudioInteraction() {
    const enableAudio = function() {
        if (!gameState.userInteracted) {
            gameState.userInteracted = true;
            console.log('¡El usuario hizo clic! Audio listo para usar');
            
            // Ya no necesitamos escuchar más clics para esto
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('keydown', enableAudio);
            document.removeEventListener('touchstart', enableAudio);
        }
    };
    
    // Escuchamos cualquier interacción del usuario
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
    document.addEventListener('touchstart', enableAudio);
}

// Conectamos todos los botones del juego a sus funciones
function setupEventListeners() {
    console.log('Conectando botones...');
    
    // Botón para empezar juego
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            console.log('Clic en "Nueva Partida"');
            // Asegurarnos que el audio esté habilitado
            if (!gameState.userInteracted) {
                gameState.userInteracted = true;
            }
            initGame();
        });
    }
    
    // Botón para volver al menú desde el juego
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            if (gameState.gameActive) {
                if (confirm('¿Volver al menú? Se perderá el progreso actual.')) {
                    gameState.gameActive = false;
                    clearInterval(gameState.timer); // Paramos el tiempo
                    stopMusic(); // Paramos la música
                    switchScreen('start'); // Volvemos al menú
                }
            } else {
                switchScreen('start');
            }
        });
    }
    
    // Botón para reiniciar juego
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            if (confirm('¿Reiniciar el juego?')) {
                initGame();
            }
        });
    }
    
    // Botón para jugar otra vez desde resultados
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', initGame);
    }
    
    // Botón para volver al menú desde resultados
    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            stopMusic(); // Paramos la música
            switchScreen('start'); // Volvemos al menú
        });
    }
    
    // Botones de dificultad (Fácil, Medio, Difícil)
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    console.log('Botones de dificultad encontrados:', difficultyBtns.length);
    
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Dificultad seleccionada:', this.dataset.level);
            
            // Quitamos la clase "active" de todos los botones
            difficultyBtns.forEach(b => b.classList.remove('active'));
            
            // Añadimos "active" al botón que se clickeó
            this.classList.add('active');
            
            // Guardamos la dificultad elegida
            gameState.difficulty = this.dataset.level;
            console.log('Dificultad actual:', gameState.difficulty);
        });
    });
    
    // Botón para encender/apagar la música
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', function() {
            gameState.musicEnabled = !gameState.musicEnabled;
            const icon = this.querySelector('i');
            
            if (gameState.musicEnabled) {
                icon.className = 'fas fa-music'; // Ícono de música encendida
                // Solo empezamos música si estamos en la pantalla de juego
                if (document.getElementById('game-screen').classList.contains('active')) {
                    startMusic();
                }
            } else {
                icon.className = 'fas fa-music-slash'; // Ícono de música apagada
                stopMusic(); // Paramos la música
            }
            
            // Guardamos la preferencia
            setCookie('musicEnabled', gameState.musicEnabled, 30);
        });
    }
    
    // Botón para encender/apagar los sonidos
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', function() {
            gameState.soundEnabled = !gameState.soundEnabled;
            const icon = this.querySelector('i');
            
            // Cambiamos el ícono
            icon.className = gameState.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            
            // Guardamos la preferencia
            setCookie('soundEnabled', gameState.soundEnabled, 30);
        });
    }
}

// Función para empezar la música de forma segura
function startMusic() {
    // Si la música está apagada, el usuario no ha interactuado, o ya está sonando, salimos
    if (!gameState.musicEnabled || !gameState.userInteracted || gameState.isMusicPlaying) return;
    
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return;
    
    bgMusic.volume = 0.3; // Volumen al 30%
    bgMusic.currentTime = 0; // Empezamos desde el principio
    
    // Esperamos un poquito para evitar problemas
    setTimeout(() => {
        bgMusic.play().then(() => {
            gameState.isMusicPlaying = true;
            console.log('Música iniciada correctamente');
        }).catch(error => {
            console.log('No se pudo iniciar música:', error.name);
            gameState.isMusicPlaying = false;
        });
    }, 100);
}

// Función para parar la música
function stopMusic() {
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        gameState.isMusicPlaying = false;
    }
}

// Funciones para guardar y leer cookies (preferencias del usuario)
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Cargamos las preferencias guardadas (música y sonidos)
function loadPreferences() {
    const savedMusic = getCookie('musicEnabled');
    const savedSound = getCookie('soundEnabled');
    
    if (savedMusic !== null) {
        gameState.musicEnabled = savedMusic === 'true';
        const musicIcon = document.querySelector('#music-toggle i');
        if (musicIcon) {
            musicIcon.className = gameState.musicEnabled ? 'fas fa-music' : 'fas fa-music-slash';
        }
    }
    
    if (savedSound !== null) {
        gameState.soundEnabled = savedSound === 'true';
        const soundIcon = document.querySelector('#sound-toggle i');
        if (soundIcon) {
            soundIcon.className = gameState.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
    }
}

// Función para reproducir sonidos (voltear carta, acierto, error, victoria)
function playSound(soundId) {
    // Si los sonidos están apagados o el usuario no ha interactuado, no hacemos nada
    if (!gameState.soundEnabled || !gameState.userInteracted) return;
    
    try {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0; // Reiniciamos el sonido
            sound.volume = 0.5; // Volumen al 50%
            
            // Esperamos un poquito para evitar problemas
            setTimeout(() => {
                sound.play().catch(error => {
                    console.log(`Error con el sonido ${soundId}:`, error.name);
                });
            }, 50);
        }
    } catch (e) {
        console.log('Error reproduciendo sonido:', e);
    }
}

// Función principal para empezar una nueva partida
function initGame() {
    console.log('Iniciando juego con dificultad:', gameState.difficulty);
    
    // Paramos la música si está sonando
    stopMusic();
    
    const settings = difficultySettings[gameState.difficulty];
    gameState.totalPairs = (settings.rows * settings.cols) / 2; // Calculamos parejas totales
    gameState.timeLeft = settings.time; // Tiempo según dificultad
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.score = 0;
    gameState.flippedCards = [];
    gameState.gameActive = true;
    gameState.canFlip = true;
    
    // Creamos las cartas
    createCardsArray();
    
    // Actualizamos la pantalla con los nuevos datos
    updateStats();
    
    // Creamos el tablero visual
    createGameBoard();
    
    // Ajustamos el tamaño del tablero
    setTimeout(adjustBoardSize, 100);
    
    // Cambiamos a la pantalla de juego
    switchScreen('game');
    
    // Esperamos un poco y empezamos la música si está activada
    setTimeout(() => {
        if (gameState.musicEnabled && gameState.userInteracted) {
            startMusic();
        }
    }, 300);
    
    // Empezamos el temporizador
    startTimer();
    
    // Actualizamos el título con la dificultad
    const gameModeTitle = document.querySelector('.game-mode-title');
    if (gameModeTitle) {
        const difficultyNames = {
            'easy': 'FÁCIL',
            'medium': 'MEDIO', 
            'hard': 'DIFÍCIL'
        };
        gameModeTitle.textContent = `MEMORY MATCH - ${difficultyNames[gameState.difficulty]}`;
    }
}

// Creamos el array de cartas mezcladas
function createCardsArray() {
    const settings = difficultySettings[gameState.difficulty];
    const totalCards = settings.rows * settings.cols;
    
    // Seleccionamos los íconos que vamos a usar
    const availableIcons = [...cardIcons];
    const selectedIcons = [];
    
    // Tomamos los íconos que necesitamos
    for (let i = 0; i < gameState.totalPairs; i++) {
        if (availableIcons.length === 0) {
            // Si nos quedamos sin íconos únicos, reutilizamos
            selectedIcons.push(cardIcons[i % cardIcons.length]);
        } else {
            // Tomamos un ícono aleatorio
            const randomIndex = Math.floor(Math.random() * availableIcons.length);
            selectedIcons.push(availableIcons[randomIndex]);
            availableIcons.splice(randomIndex, 1); // Lo removemos para no repetir
        }
    }
    
    // Duplicamos para tener parejas
    let icons = [...selectedIcons, ...selectedIcons];
    
    // Mezclamos las cartas (algoritmo de Fisher-Yates)
    for (let i = icons.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [icons[i], icons[j]] = [icons[j], icons[i]];
    }
    
    // Creamos objetos carta con toda la información que necesitamos
    gameState.cards = icons.map((icon, index) => ({
        id: index, // Identificador único
        icon: icon, // El ícono que muestra
        flipped: false, // Si está volteada
        matched: false // Si ya encontró su pareja
    }));
}

// Creamos el tablero visual en la pantalla
function createGameBoard() {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) {
        console.error('No se encontró el tablero');
        return;
    }
    
    gameBoard.innerHTML = ''; // Limpiamos el tablero anterior
    const settings = difficultySettings[gameState.difficulty];
    
    // Configuramos la cuadrícula según la dificultad
    gameBoard.style.gridTemplateColumns = `repeat(${settings.cols}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${settings.rows}, 1fr)`;
    gameBoard.style.gap = '8px';
    
    // Por cada carta, creamos su elemento HTML
    gameState.cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id; // Guardamos el ID en un atributo
        
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <i class="${card.icon}"></i> <!-- El ícono de la carta -->
                </div>
                <div class="card-back">
                    <i class="fas fa-question"></i> <!-- Parte de atrás -->
                </div>
            </div>
        `;
        
        // Cuando se hace clic en una carta
        cardElement.addEventListener('click', function() {
            flipCard(card.id);
        });
        
        gameBoard.appendChild(cardElement);
    });
}

// Ajustamos el tamaño de las cartas para que quepan en la pantalla
function adjustBoardSize() {
    const gameBoard = document.getElementById('game-board');
    const container = document.querySelector('.game-board-container');
    
    if (!gameBoard || !container || !gameBoard.children.length) return;
    
    const cards = gameBoard.querySelectorAll('.card');
    const settings = difficultySettings[gameState.difficulty];
    
    // Medimos el espacio disponible
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const gap = 8;
    const baseWidth = 70; // Tamaño base de ancho
    const baseHeight = 90; // Tamaño base de alto
    
    // Calculamos el tamaño máximo que pueden tener las cartas
    const maxCardWidth = Math.floor((containerWidth - (settings.cols - 1) * gap) / settings.cols);
    const maxCardHeight = Math.floor((containerHeight - (settings.rows - 1) * gap) / settings.rows);
    
    // Calculamos cuánto debemos escalar las cartas
    const scale = Math.min(
        maxCardWidth / baseWidth,
        maxCardHeight / baseHeight,
        1 // No más grande que el tamaño original
    );
    
    // Aplicamos el nuevo tamaño a todas las cartas
    cards.forEach(card => {
        card.style.width = `${baseWidth * scale}px`;
        card.style.height = `${baseHeight * scale}px`;
        
        // También ajustamos el tamaño de los íconos
        const frontIcon = card.querySelector('.card-front i');
        if (frontIcon) {
            frontIcon.style.fontSize = `${1.5 * scale}rem`;
        }
        const backIcon = card.querySelector('.card-back i');
        if (backIcon) {
            backIcon.style.fontSize = `${1.5 * scale}rem`;
        }
    });
}

// Si la ventana cambia de tamaño, ajustamos el tablero
window.addEventListener('resize', adjustBoardSize);

// Función para voltear una carta
function flipCard(cardId) {
    // Si el juego no está activo o no podemos voltear, salimos
    if (!gameState.gameActive || !gameState.canFlip) return;
    
    const card = gameState.cards.find(c => c.id === cardId);
    const cardElement = document.querySelector(`.card[data-id="${cardId}"]`);
    
    // Si la carta ya está volteada o emparejada, o ya hay 2 volteadas, no hacemos nada
    if (card.flipped || card.matched || gameState.flippedCards.length >= 2) return;
    
    // Volteamos la carta
    card.flipped = true;
    cardElement.classList.add('flipped');
    
    // La añadimos a las cartas volteadas
    gameState.flippedCards.push(card);
    
    // Reproducimos el sonido de voltear
    playSound('card-flip-sound');
    
    // Si ya hay 2 cartas volteadas, comprobamos si hacen pareja
    if (gameState.flippedCards.length === 2) {
        gameState.moves++; // Contamos un movimiento más
        updateStats(); // Actualizamos la pantalla
        checkForMatch(); // Comprobamos si hacen pareja
    }
}

// Comprobamos si las dos cartas volteadas hacen pareja
function checkForMatch() {
    gameState.canFlip = false; // No permitimos voltear más cartas por ahora
    
    const [card1, card2] = gameState.flippedCards;
    const isMatch = card1.icon === card2.icon;
    
    // Esperamos 1 segundo para que el jugador pueda ver las cartas
    setTimeout(() => {
        if (isMatch) {
            // ¡Pareja encontrada!
            card1.matched = true;
            card2.matched = true;
            gameState.matchedPairs++;
            gameState.score += 100; // 100 puntos por pareja
            
            // Marcamos las cartas como emparejadas
            document.querySelector(`.card[data-id="${card1.id}"]`).classList.add('matched');
            document.querySelector(`.card[data-id="${card2.id}"]`).classList.add('matched');
            
            // Sonido de acierto
            playSound('match-sound');
            
            // Comprobamos si hemos ganado
            if (gameState.matchedPairs === gameState.totalPairs) {
                endGame(true);
            }
        } else {
            // No son pareja, las volteamos de nuevo
            card1.flipped = false;
            card2.flipped = false;
            
            document.querySelector(`.card[data-id="${card1.id}"]`).classList.remove('flipped');
            document.querySelector(`.card[data-id="${card2.id}"]`).classList.remove('flipped');
            
            // Sonido de error
            playSound('mismatch-sound');
        }
        
        // Limpiamos las cartas volteadas y permitimos voltear de nuevo
        gameState.flippedCards = [];
        gameState.canFlip = true;
        updateStats(); // Actualizamos la pantalla
    }, 1000);
}

// Actualizamos los números en pantalla (tiempo, movimientos, etc.)
function updateStats() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    
    const timerElement = document.getElementById('timer');
    const movesElement = document.getElementById('moves');
    const scoreElement = document.getElementById('score');
    const pairsFoundElement = document.getElementById('pairs-found');
    
    // Actualizamos cada elemento si existe
    if (timerElement) timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (movesElement) movesElement.textContent = gameState.moves;
    if (scoreElement) scoreElement.textContent = gameState.score;
    if (pairsFoundElement) pairsFoundElement.textContent = `${gameState.matchedPairs} / ${gameState.totalPairs}`;
    
    // Si queda poco tiempo, cambiamos el color a rojo y hacemos parpadear
    if (gameState.timeLeft <= 30) {
        if (timerElement) {
            timerElement.style.color = '#ff6b6b';
            timerElement.style.animation = timerElement.style.animation ? '' : 'pulse 0.5s infinite alternate';
        }
    } else {
        if (timerElement) {
            timerElement.style.color = '#ffd93d';
            timerElement.style.animation = '';
        }
    }
}

// Empezamos el temporizador
function startTimer() {
    // Si ya hay un temporizador, lo paramos
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    // Cada segundo, reducimos el tiempo y actualizamos
    gameState.timer = setInterval(() => {
        if (!gameState.gameActive) return;
        
        gameState.timeLeft--;
        updateStats();
        
        // Si se acaba el tiempo, terminamos el juego
        if (gameState.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

// Terminamos el juego (ganamos o perdemos)
function endGame(isWin) {
    gameState.gameActive = false;
    clearInterval(gameState.timer); // Paramos el tiempo
    
    if (isWin) {
        // Si ganamos, sumamos puntos extra por tiempo sobrante
        gameState.score += gameState.timeLeft * 10;
        
        // Sonido de victoria
        playSound('win-sound');
        
        // Paramos la música
        stopMusic();
    } else {
        // Si perdimos, paramos la música
        stopMusic();
    }
    
    // Guardamos el récord si es mejor
    saveRecord(isWin);
    
    // Mostramos la pantalla de resultados
    showResultScreen(isWin);
}

// Guardamos el récord si ganamos y es mejor que el anterior
function saveRecord(isWin) {
    if (!isWin) return; // Solo guardamos si ganamos
    
    const recordKey = `record_${gameState.difficulty}`;
    const currentRecord = parseInt(getCookie(recordKey)) || 0;
    
    if (gameState.score > currentRecord) {
        setCookie(recordKey, gameState.score, 365); // Guardamos por 1 año
    }
    
    // Actualizamos la lista de récords
    updateRecordsDisplay();
}

// Mostramos la pantalla de resultados
function showResultScreen(isWin) {
    const recordKey = `record_${gameState.difficulty}`;
    const previousRecord = parseInt(getCookie(recordKey)) || 0;
    const isNewRecord = gameState.score > previousRecord;
    
    // Actualizamos todos los textos
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const finalScore = document.getElementById('final-score');
    const timeLeft = document.getElementById('time-left');
    const finalMoves = document.getElementById('final-moves');
    const previousRecordElem = document.getElementById('previous-record');
    const newRecordElem = document.getElementById('new-record');
    
    if (resultTitle) resultTitle.textContent = isWin ? '¡Felicidades!' : '¡Tiempo agotado!';
    if (resultMessage) resultMessage.textContent = isWin ? 'Has encontrado todas las parejas' : 'No lograste encontrar todas las parejas a tiempo';
    if (finalScore) finalScore.textContent = gameState.score;
    if (timeLeft) timeLeft.textContent = `${gameState.timeLeft}s`;
    if (finalMoves) finalMoves.textContent = gameState.moves;
    if (previousRecordElem) previousRecordElem.textContent = previousRecord;
    if (newRecordElem) {
        newRecordElem.textContent = isNewRecord ? '¡Sí!' : 'No';
        newRecordElem.style.color = isNewRecord ? '#6bcf7f' : '#ff6b6b';
    }
    
    // Cambiamos el ícono según si ganamos o perdimos
    const resultIcon = document.querySelector('.result-icon i');
    if (resultIcon) {
        resultIcon.className = isWin ? 'fas fa-trophy' : 'fas fa-clock';
    }
    
    // Cambiamos a la pantalla de resultados
    switchScreen('result');
}

// Cambiamos entre las diferentes pantallas (menú, juego, resultados)
function switchScreen(screenName) {
    console.log('Cambiando a pantalla:', screenName);
    
    // Ocultamos todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostramos solo la pantalla que queremos
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Si no estamos en la pantalla de juego, paramos la música
    if (screenName !== 'game') {
        stopMusic();
    }
}

// Actualizamos la lista de récords en el menú
function updateRecordsDisplay() {
    const recordsList = document.getElementById('records-list');
    if (!recordsList) {
        console.error('No se encontró la lista de récords');
        return;
    }
    
    recordsList.innerHTML = '';
    
    // Por cada dificultad, mostramos su récord
    Object.keys(difficultySettings).forEach(difficulty => {
        const recordKey = `record_${difficulty}`;
        const record = getCookie(recordKey) || 'Sin récord';
        const difficultyName = 
            difficulty === 'easy' ? 'Fácil (4x4)' : 
            difficulty === 'medium' ? 'Medio (4x5)' : 'Difícil (5x6)';
        
        const recordElement = document.createElement('p');
        recordElement.innerHTML = `
            <span>${difficultyName}</span>
            <span><strong>${record}</strong> puntos</span>
        `;
        recordsList.appendChild(recordElement);
    });
}

// Cuando se cierra la página, guardamos las preferencias y paramos la música
window.addEventListener('beforeunload', function() {
    setCookie('musicEnabled', gameState.musicEnabled, 30);
    setCookie('soundEnabled', gameState.soundEnabled, 30);
    stopMusic();
});

// Función para reiniciar el juego desde el botón "Reiniciar"
function restartGame() {
    if (gameState.gameActive && confirm('¿Reiniciar el juego?')) {
        initGame();
    }
}