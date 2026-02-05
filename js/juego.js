/**
 * Lógica del Tablero de Juego (juego.js)
 * Funcionalidad:
 * - Menú Desplegable tipo Hamburguesa.
 * - Validación diferida (Botón Comprobar).
 * - Mecánicas ajustadas por dificultad (Fácil, Medio, Difícil).
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. REFERENCIAS AL DOM
    // ==========================================

    // Áreas principales
    const boardElement = document.getElementById('puzzle-board');
    const workspaceElement = document.getElementById('game-workspace');
    const scatteredLayer = document.getElementById('scattered-layer');
    
    // Textos informativos
    const gameInstruction = document.getElementById('game-instruction');
    const mascotText = document.getElementById('mascot-text');
    const moveCountDisplay = document.getElementById('move-count');
    const timerDisplay = document.getElementById('timer');
    
    // Menú y Navegación
    const btnMenuToggle = document.getElementById('btn-menu-toggle');
    const btnMenuClose = document.getElementById('btn-menu-close');
    const sideMenuOverlay = document.getElementById('side-menu-overlay');
    
    // Botones del Menú Desplegable
    const btnPause = document.getElementById('btn-pause');
    const btnBackMenu = document.getElementById('btn-back-menu');
    const btnCancelGame = document.getElementById('btn-cancel-game');

    // Botones de Acción (Abajo)
    const btnHelp = document.getElementById('btn-help');
    const btnCheck = document.getElementById('btn-check');
    
    // Modal de Victoria
    const victoryModal = document.getElementById('victory-modal');
    const finalTimeDisplay = document.getElementById('final-time');
    const finalMovesDisplay = document.getElementById('final-moves');
    const btnReplay = document.getElementById('btn-replay');
    const btnMenu = document.getElementById('btn-menu');

    // ==========================================
    // 2. ESTADO DEL JUEGO
    // ==========================================
    let config = { size: 3, difficulty: 'easy', time: 'free' };
    let imageSrc = '';
    let moves = 0;
    let startTime;
    let timerInterval;
    let draggedPiece = null;
    let totalPieces = 0;
    let idleTimer; 
    let boardWidth, boardHeight;

    // ==========================================
    // 3. INICIALIZACIÓN
    // ==========================================
    initGame();
    loadSavedAvatar(); 

    function initGame() {
        // Cargar datos
        const savedConfig = localStorage.getItem('puzzleConfig');
        if (savedConfig) config = JSON.parse(savedConfig);
        
        imageSrc = localStorage.getItem('selectedPuzzleImage') || '../assets/images/perro.jpg'; 

        // Esperar a que el DOM calcule tamaños
        requestAnimationFrame(() => {
            setupBoardDimensions();
            generatePuzzle();
            startTimer();
            resetIdleTimer();
        });

        // Responsividad
        window.addEventListener('resize', setupBoardDimensions);
    }

    /**
     * Calcula el tamaño del tablero para que ocupe el máximo espacio posible
     * sin desbordarse y manteniendo la proporción cuadrada.
     */
    function setupBoardDimensions() {
        const container = document.querySelector('.board-area');
        if (!container) return;

        // Espacio disponible (restando padding y botonera inferior)
        const availWidth = container.clientWidth - 40;
        const availHeight = container.clientHeight - 120; 
        
        let size = Math.min(availWidth, availHeight);
        // Límites de seguridad
        size = Math.max(280, Math.min(size, 800));

        // Aplicar dimensiones
        workspaceElement.style.width = `${size}px`;
        workspaceElement.style.height = `${size}px`;
        
        boardWidth = size;
        boardHeight = size;

        // Configurar CSS Grid
        boardElement.style.gridTemplateColumns = `repeat(${config.size}, 1fr)`;
        boardElement.style.gridTemplateRows = `repeat(${config.size}, 1fr)`;
        
        // Variables para que las piezas calculen su fondo
        document.documentElement.style.setProperty('--board-width', `${size}px`);
        document.documentElement.style.setProperty('--board-height', `${size}px`);
    }

    /**
     * Genera las piezas y slots según la dificultad.
     */
    function generatePuzzle() {
        totalPieces = config.size * config.size;
        
        const pieceWPercent = 100 / (config.size - 1);
        const pieceHPercent = 100 / (config.size - 1);

        boardElement.innerHTML = '';
        scatteredLayer.innerHTML = '';
        let piecesArray = [];

        // Mensajes Iniciales
        if (config.difficulty === 'easy') {
            gameInstruction.textContent = "Nivel Fácil";
            mascotText.textContent = "Las piezas están giradas. ¡Tócalas para arreglarlas!";
        } else if (config.difficulty === 'medium') {
            gameInstruction.textContent = "Nivel Medio";
            mascotText.textContent = "¡Arrastra las piezas para ordenarlas!";
        } else {
            gameInstruction.textContent = "Nivel Difícil";
            mascotText.textContent = "Ponlas en su sitio Y tócalas para girarlas.";
        }

        // 1. Crear Slots (Huecos)
        for (let i = 0; i < totalPieces; i++) {
            const slot = document.createElement('div');
            slot.classList.add('drop-zone');
            slot.dataset.index = i;
            
            // Habilitar Drop para Medio y Difícil
            if (config.difficulty !== 'easy') {
                slot.addEventListener('dragover', handleDragOver);
                slot.addEventListener('drop', handleDrop);
                slot.addEventListener('dragenter', () => slot.classList.add('hovered'));
                slot.addEventListener('dragleave', () => slot.classList.remove('hovered'));
            }
            boardElement.appendChild(slot);
        }

        // 2. Crear Piezas
        for (let i = 0; i < totalPieces; i++) {
            const row = Math.floor(i / config.size);
            const col = i % config.size;

            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.id = `piece-${i}`;
            piece.dataset.correctIndex = i;
            
            // Imagen de fondo
            piece.style.backgroundImage = `url('${imageSrc}')`;
            piece.style.backgroundPosition = `${col * pieceWPercent}% ${row * pieceHPercent}%`;
            piece.style.width = '100%';
            piece.style.height = '100%';

            // --- Lógica por Dificultad ---

            // FÁCIL: Piezas ordenadas pero ROTADAS
            if (config.difficulty === 'easy') {
                let randomRot = (Math.floor(Math.random() * 3) + 1) * 90; // 90, 180 o 270
                piece.dataset.currentRotation = randomRot;
                piece.style.transform = `rotate(${randomRot}deg)`;

                piece.classList.add('clickable');
                piece.addEventListener('click', handleRotateClick);

                // Accesibilidad: Hacer focuseable y añadir controles de teclado
                piece.setAttribute('tabindex', '0');
                piece.setAttribute('role', 'button');
                piece.setAttribute('aria-label', `Pieza ${i + 1}. Presiona Enter o R para rotar. Actualmente rotada ${randomRot} grados`);
                piece.addEventListener('keydown', handleKeyboardRotate);

                if (i === 0) addVisualCue(piece, 'tap');
                boardElement.children[i].appendChild(piece);
            } 
            
            // MEDIO: Piezas RECTAS (0º) pero DESORDENADAS (Barajadas)
            else if (config.difficulty === 'medium') {
                piece.dataset.currentRotation = 0;
                piece.draggable = true;
                piece.addEventListener('dragstart', handleDragStart);

                // Accesibilidad: Hacer focuseable
                piece.setAttribute('tabindex', '0');
                piece.setAttribute('aria-label', `Pieza ${i + 1}. Arrastra para mover de posición`);

                if (i === 0) addVisualCue(piece, 'drag');
                piecesArray.push(piece);
            } 

            // DIFÍCIL: Piezas DESORDENADAS y ROTADAS
            else if (config.difficulty === 'hard') {
                let randomRot = Math.floor(Math.random() * 4) * 90;
                piece.dataset.currentRotation = randomRot;
                piece.style.transform = `rotate(${randomRot}deg)`;

                piece.draggable = true;
                piece.classList.add('clickable');
                piece.addEventListener('dragstart', handleDragStart);
                piece.addEventListener('click', handleRotateClick);

                // Accesibilidad: Hacer focuseable y añadir controles de teclado
                piece.setAttribute('tabindex', '0');
                piece.setAttribute('role', 'button');
                piece.setAttribute('aria-label', `Pieza ${i + 1}. Presiona Enter o R para rotar. Arrastra para mover. Actualmente rotada ${randomRot} grados`);
                piece.addEventListener('keydown', handleKeyboardRotate);

                if (i === 0) addVisualCue(piece, 'both');
                piecesArray.push(piece);
            }
        }

        // --- Barajar (Solo Medio y Difícil) ---
        if (config.difficulty === 'medium' || config.difficulty === 'hard') {
            // Algoritmo Fisher-Yates
            piecesArray.sort(() => Math.random() - 0.5);
            
            // Colocar en los slots
            piecesArray.forEach((piece, index) => {
                // Usamos Scattered Layer SOLO si quisieramos que floten fuera (opcional)
                // Pero tu pediste "intercambio", asi que las ponemos en los slots directamente
                const slot = boardElement.children[index];
                if (slot) slot.appendChild(piece);
            });
        }
    }

    /**
     * Muestra indicadores (mano/dedo) temporales
     */
    function addVisualCue(piece, type) {
        if(piece.querySelector('.action-indicator')) return;
        const cue = document.createElement('div');
        cue.classList.add('action-indicator');
        
        if (type === 'tap') cue.innerHTML = '👆'; 
        else if (type === 'drag') cue.innerHTML = '✋'; 
        else if (type === 'both') {
            cue.innerHTML = '<span style="font-size:0.8em">✋/👆</span>'; 
            cue.classList.add('pulse-dual'); 
        } 
        
        piece.appendChild(cue);
        setTimeout(() => { 
            if(cue.parentNode) {
                cue.style.opacity = '0';
                setTimeout(() => cue.remove(), 500); 
            }
        }, 5000);
    }

    // ==========================================
    // 4. INTERACCIÓN (EVENTOS)
    // ==========================================

    // --- Rotación (Clic y Teclado) ---
    function handleRotateClick(e) {
        const piece = e.currentTarget || e.target;
        // Evitar conflicto con arrastre
        if (piece.classList.contains('dragging')) return;

        resetIdleTimer();
        const cue = piece.querySelector('.action-indicator');
        if(cue) cue.remove();

        // Limpiar estilos de validación (para que no se vea raro al girar)
        piece.classList.remove('incorrect', 'correct');

        let currentRot = parseInt(piece.dataset.currentRotation);
        currentRot = (currentRot + 90) % 360;
        piece.dataset.currentRotation = currentRot;
        piece.style.transform = `rotate(${currentRot}deg)`;

        moves++;
        updateStats();

        // Anunciar la rotación para lectores de pantalla
        const pieceIndex = parseInt(piece.dataset.correctIndex) + 1;
        const announcement = `Pieza ${pieceIndex} rotada ${currentRot} grados`;
        announceToScreenReader(announcement);
    }

    // --- Control de Teclado para Rotación ---
    function handleKeyboardRotate(e) {
        // Enter, Space o R para rotar
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            handleRotateClick(e);
        }
    }

    // Función para anunciar cambios a lectores de pantalla
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    // --- Arrastre (Drag & Drop) ---
    function handleDragStart(e) {
        draggedPiece = e.target;
        resetIdleTimer();
        
        const cue = draggedPiece.querySelector('.action-indicator');
        if(cue) cue.remove();

        e.dataTransfer.setData('text/plain', ''); 
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }

    document.addEventListener('dragend', (e) => {
        if (draggedPiece) {
            draggedPiece.classList.remove('dragging');
            draggedPiece = null;
        }
    });

    function handleDragOver(e) { e.preventDefault(); }

    function handleDrop(e) {
        e.preventDefault();
        const slot = e.target.closest('.drop-zone');
        if(slot) slot.classList.remove('hovered');

        if (slot && draggedPiece) {
            // Lógica de Intercambio (Swap)
            if (slot.children.length > 0) {
                const existingPiece = slot.children[0];
                const originalParent = draggedPiece.parentElement; 
                
                // Mover la existente al hueco de donde vino la arrastrada
                if (originalParent) {
                    originalParent.appendChild(existingPiece);
                    // Resetear estilos para evitar glitches visuales
                    resetPieceStyle(existingPiece);
                }
                
                slot.appendChild(draggedPiece);
                resetPieceStyle(draggedPiece);
                
            } else {
                // Hueco vacío (caso raro si se generan llenos)
                slot.appendChild(draggedPiece);
                resetPieceStyle(draggedPiece);
            }
            
            moves++;
            updateStats();
            resetIdleTimer();
        }
    }

    function resetPieceStyle(piece) {
        piece.style.position = 'relative';
        piece.style.left = '0';
        piece.style.top = '0';
        piece.style.width = '100%';
        piece.style.height = '100%';
        piece.classList.remove('incorrect', 'correct');
    }

    // ==========================================
    // 5. VALIDACIÓN Y AYUDA
    // ==========================================

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        // Si no hay actividad por 15s, mostrar botón de ayuda
        idleTimer = setTimeout(() => {
            btnHelp.classList.remove('hidden');
            mascotText.textContent = "¿Necesitas una pista? Toca el foco de abajo.";
        }, 15000);
    }

    // Botón Comprobar Solución
    if(btnCheck) btnCheck.addEventListener('click', checkSolution);

    function checkSolution() {
        let correctCount = 0;
        let hasErrors = false;
        
        const allPieces = document.querySelectorAll('.puzzle-piece');

        allPieces.forEach(piece => {
            // 1. Limpiar estados previos
            piece.classList.remove('correct', 'incorrect');
            const parent = piece.parentElement;
            
            // Si la pieza está flotando fuera (por error), es incorrecta
            if (!parent.classList.contains('drop-zone')) {
                piece.classList.add('incorrect');
                hasErrors = true;
                return;
            }

            const pIndex = parseInt(piece.dataset.correctIndex);
            const sIndex = parseInt(parent.dataset.index);
            const rot = parseInt(piece.dataset.currentRotation);

            // 2. Validación Estricta
            if (pIndex === sIndex && rot === 0) {
                // Correcto: Verde
                piece.classList.add('correct');
                correctCount++;
            } else {
                // Incorrecto: Rojo (Minimalista, sin amarillo ni animaciones locas)
                piece.classList.add('incorrect');
                hasErrors = true;
            }
        });

        // Feedback del Asistente
        if (correctCount === totalPieces) {
            endGame();
        } else {
            mascotText.textContent = "Hay piezas incorrectas (Rojo). ¡Sigue intentando!";
            // Quitar el rojo después de un momento para no ensuciar la vista
            setTimeout(() => {
                document.querySelectorAll('.incorrect').forEach(el => el.classList.remove('incorrect'));
            }, 2500);
        }
    }

    // Botón Ayuda
    if(btnHelp) btnHelp.addEventListener('click', () => {
        const slots = document.querySelectorAll('.drop-zone');
        let hintFound = false;

        // Buscar el primer error y señalarlo
        for (let slot of slots) {
            if (slot.children.length > 0) {
                const piece = slot.children[0];
                const pIndex = parseInt(piece.dataset.correctIndex);
                const sIndex = parseInt(slot.dataset.index);
                const rot = parseInt(piece.dataset.currentRotation);

                if (pIndex !== sIndex || rot !== 0) {
                    piece.classList.add('incorrect');
                    mascotText.textContent = "Esta pieza no está bien. Intenta cambiarla o girarla.";
                    setTimeout(() => piece.classList.remove('incorrect'), 2000);
                    hintFound = true;
                    return; // Solo mostrar una pista a la vez
                }
            }
        }

        if (!hintFound) {
            mascotText.textContent = "¡Todo se ve bien! Dale a Comprobar.";
        }
    });

    // ==========================================
    // 6. MENÚ LATERAL Y UTILIDADES
    // ==========================================

    // Toggle Menú
    if(btnMenuToggle) {
        btnMenuToggle.addEventListener('click', () => {
            openSideMenu();
        });
    }

    if(btnMenuClose) {
        btnMenuClose.addEventListener('click', () => {
            closeSideMenu();
        });
    }

    // Funciones de Focus Management para el Menú
    function openSideMenu() {
        sideMenuOverlay.classList.remove('hidden');
        sideMenuOverlay.setAttribute('aria-hidden', 'false');
        btnMenuToggle.setAttribute('aria-expanded', 'true');

        // CRÍTICO: Mover focus al título del menú para accesibilidad
        const menuTitle = document.getElementById('menu-title');
        if (menuTitle) {
            // Hacer focuseable si no lo es
            if (!menuTitle.hasAttribute('tabindex')) {
                menuTitle.setAttribute('tabindex', '-1');
            }
            setTimeout(() => menuTitle.focus(), 100);
        }
    }

    function closeSideMenu() {
        sideMenuOverlay.classList.add('hidden');
        sideMenuOverlay.setAttribute('aria-hidden', 'true');
        btnMenuToggle.setAttribute('aria-expanded', 'false');

        // CRÍTICO: Retornar focus al botón que abrió el menú
        if (btnMenuToggle) {
            btnMenuToggle.focus();
        }
    }

    // Cerrar menú al hacer click fuera
    if(sideMenuOverlay) {
        sideMenuOverlay.addEventListener('click', (e) => {
            if (e.target === sideMenuOverlay) closeSideMenu();
        });
    }

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !sideMenuOverlay.classList.contains('hidden')) {
            closeSideMenu();
        }
    });

    // Timer
    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const delta = Math.floor((Date.now() - startTime) / 1000);
            const mins = Math.floor(delta / 60).toString().padStart(2, '0');
            const secs = (delta % 60).toString().padStart(2, '0');
            if(timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function updateStats() {
        if(moveCountDisplay) {
            moveCountDisplay.textContent = moves;
            // Actualizar aria-label para lectores de pantalla
            const scoreContainer = moveCountDisplay.closest('.score-badge');
            if (scoreContainer) {
                scoreContainer.setAttribute('aria-label', `Movimientos realizados: ${moves}`);
            }
        }
    }

    function endGame() {
        clearInterval(timerInterval);
        if(finalTimeDisplay) finalTimeDisplay.textContent = timerDisplay.textContent;
        if(finalMovesDisplay) finalMovesDisplay.textContent = moves;

        if(victoryModal) {
            victoryModal.classList.remove('hidden');
            victoryModal.setAttribute('aria-hidden', 'false');

            // CRÍTICO: Mover focus al título del modal para accesibilidad
            const victoryTitle = document.getElementById('victory-title');
            if (victoryTitle) {
                // Hacer focuseable si no lo es
                if (!victoryTitle.hasAttribute('tabindex')) {
                    victoryTitle.setAttribute('tabindex', '-1');
                }
                setTimeout(() => victoryTitle.focus(), 100);
            }
        }

        if(mascotText) mascotText.textContent = "¡Lo lograste! ¡Eres un campeón!";
    }

    function loadSavedAvatar() {
        const savedAvatar = localStorage.getItem('savedAvatarSVG');
        const mascotContainer = document.getElementById('global-mascot-container');
        if (savedAvatar && mascotContainer) mascotContainer.innerHTML = savedAvatar;
    }

    // Botones de Navegación
    if (btnBackMenu) btnBackMenu.addEventListener('click', () => window.location.href = '../html/revision.html');
    
    if (btnCancelGame) {
        btnCancelGame.addEventListener('click', () => {
            if (confirm("¿Salir al menú principal? Perderás el progreso.")) {
                window.location.href = '../html/index.html';
            }
        });
    }
    
    if (btnMenu) btnMenu.addEventListener('click', () => window.location.href = '../html/index.html');
    if (btnReplay) btnReplay.addEventListener('click', () => location.reload());
    
    if (btnPause) {
        btnPause.addEventListener('click', () => {
            alert("Juego Pausado. Pulsa Aceptar para continuar.");
            sideMenuOverlay.classList.add('hidden');
        });
    }
});