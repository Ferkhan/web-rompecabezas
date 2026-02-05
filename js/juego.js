document.addEventListener('DOMContentLoaded', () => {
    
    const boardElement = document.getElementById('puzzle-board');
    const workspaceElement = document.getElementById('game-workspace');
    const scatteredLayer = document.getElementById('scattered-layer');
    const gameInstruction = document.getElementById('game-instruction');
    const mascotText = document.getElementById('mascot-text');
    const moveCountDisplay = document.getElementById('move-count');
    const timerDisplay = document.getElementById('timer');
    const btnMenuToggle = document.getElementById('btn-menu-toggle');
    const btnMenuClose = document.getElementById('btn-menu-close');
    const sideMenuOverlay = document.getElementById('side-menu-overlay');
    const btnPause = document.getElementById('btn-pause');
    const btnBackMenu = document.getElementById('btn-back-menu');
    const btnCancelGame = document.getElementById('btn-cancel-game');
    const btnHelp = document.getElementById('btn-help');
    const btnCheck = document.getElementById('btn-check');
    const victoryModal = document.getElementById('victory-modal');
    const finalTimeDisplay = document.getElementById('final-time');
    const finalMovesDisplay = document.getElementById('final-moves');
    const btnReplay = document.getElementById('btn-replay');
    const btnMenu = document.getElementById('btn-menu');

    let config = { size: 3, difficulty: 'easy', time: 'free', stimuli: 'visual' };
    let imageSrc = '';
    let moves = 0;
    let startTime;
    let timerInterval;
    let draggedPiece = null;
    let selectedPieceForSwap = null;
    let totalPieces = 0;
    let idleTimer;
    let boardWidth, boardHeight;

    initGame();
    loadSavedAvatar(); 

    function initGame() {
        const savedConfig = localStorage.getItem('puzzleConfig');
        if (savedConfig) config = JSON.parse(savedConfig);
        
        imageSrc = localStorage.getItem('selectedPuzzleImage') || '../assets/images/perro.jpg'; 

        requestAnimationFrame(() => {
            setupBoardDimensions();
            generatePuzzle();
            startTimer();
            resetIdleTimer();
        });

        window.addEventListener('resize', setupBoardDimensions);
    }

    function setupBoardDimensions() {
        const container = document.querySelector('.board-area');
        if (!container) return;

        const availWidth = container.clientWidth - 40;
        const availHeight = container.clientHeight - 120; 
        
        let size = Math.min(availWidth, availHeight);
        size = Math.max(280, Math.min(size, 800));

        workspaceElement.style.width = `${size}px`;
        workspaceElement.style.height = `${size}px`;
        
        boardWidth = size;
        boardHeight = size;

        boardElement.style.gridTemplateColumns = `repeat(${config.size}, 1fr)`;
        boardElement.style.gridTemplateRows = `repeat(${config.size}, 1fr)`;
        
        document.documentElement.style.setProperty('--board-width', `${size}px`);
        document.documentElement.style.setProperty('--board-height', `${size}px`);
    }

    function generatePuzzle() {
        totalPieces = config.size * config.size;
        
        const pieceWPercent = 100 / (config.size - 1);
        const pieceHPercent = 100 / (config.size - 1);

        boardElement.innerHTML = '';
        scatteredLayer.innerHTML = '';
        let piecesArray = [];

        if (config.difficulty === 'easy') {
            gameInstruction.textContent = "Nivel Fácil";
            updateMascotMessage("Las piezas están giradas. ¡Tócalas para arreglarlas!");
            announceToScreenReader("Nivel Fácil. Las piezas están giradas. Presiona Enter o Espacio para girarlas.");
        } else if (config.difficulty === 'medium') {
            gameInstruction.textContent = "Nivel Medio";
            updateMascotMessage("¡Arrastra las piezas para ordenarlas!");
            announceToScreenReader("Nivel Medio. Usa las flechas para navegar entre piezas. Presiona Enter para seleccionar una pieza, navega a otra y presiona Enter para intercambiarlas.");
        } else {
            gameInstruction.textContent = "Nivel Difícil";
            updateMascotMessage("Ponlas en su sitio Y tócalas para girarlas.");
            announceToScreenReader("Nivel Difícil. Usa las flechas para navegar. Presiona Enter para seleccionar e intercambiar piezas. Presiona R para girar.");
        }

        for (let i = 0; i < totalPieces; i++) {
            const slot = document.createElement('div');
            slot.classList.add('drop-zone');
            slot.dataset.index = i;
            
            if (config.difficulty !== 'easy') {
                slot.addEventListener('dragover', handleDragOver);
                slot.addEventListener('drop', handleDrop);
                slot.addEventListener('dragenter', () => slot.classList.add('hovered'));
                slot.addEventListener('dragleave', () => slot.classList.remove('hovered'));
            }
            boardElement.appendChild(slot);
        }

        for (let i = 0; i < totalPieces; i++) {
            const row = Math.floor(i / config.size);
            const col = i % config.size;

            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.id = `piece-${i}`;
            piece.dataset.correctIndex = i;
            
            piece.style.backgroundImage = `url('${imageSrc}')`;
            piece.style.backgroundPosition = `${col * pieceWPercent}% ${row * pieceHPercent}%`;
            piece.style.width = '100%';
            piece.style.height = '100%';

            if (config.difficulty === 'easy') {
                let randomRot = (Math.floor(Math.random() * 3) + 1) * 90;
                piece.dataset.currentRotation = randomRot;
                piece.style.transform = `rotate(${randomRot}deg)`;

                piece.classList.add('clickable');
                piece.addEventListener('click', handleRotateClick);

                piece.setAttribute('tabindex', '0');
                piece.setAttribute('role', 'button');
                piece.addEventListener('keydown', handleKeyboardRotate);
                piece.addEventListener('keydown', handleArrowNavigation);

                if (i === 0) addVisualCue(piece, 'tap');
                boardElement.children[i].appendChild(piece);
                updatePieceAriaLabel(piece, i, randomRot);
            }
            else if (config.difficulty === 'medium') {
                piece.dataset.currentRotation = 0;
                piece.draggable = true;
                piece.addEventListener('dragstart', handleDragStart);

                piece.setAttribute('tabindex', '0');
                piece.setAttribute('role', 'button');
                piece.addEventListener('keydown', handleArrowNavigation);
                piece.addEventListener('keydown', handleKeyboardSwap);

                if (i === 0) addVisualCue(piece, 'drag');
                piecesArray.push(piece);
            }
            else if (config.difficulty === 'hard') {
                let randomRot = Math.floor(Math.random() * 4) * 90;
                piece.dataset.currentRotation = randomRot;
                piece.style.transform = `rotate(${randomRot}deg)`;

                piece.draggable = true;
                piece.classList.add('clickable');
                piece.addEventListener('dragstart', handleDragStart);
                piece.addEventListener('click', handleRotateClick);

                piece.setAttribute('tabindex', '0');
                piece.setAttribute('role', 'button');
                piece.addEventListener('keydown', handleKeyboardSwap);
                piece.addEventListener('keydown', handleKeyboardRotateHard);
                piece.addEventListener('keydown', handleArrowNavigation);

                if (i === 0) addVisualCue(piece, 'both');
                piecesArray.push(piece);
            }
        }

        if (config.difficulty === 'medium' || config.difficulty === 'hard') {
            piecesArray.sort(() => Math.random() - 0.5);

            piecesArray.forEach((piece, index) => {
                const slot = boardElement.children[index];
                if (slot) {
                    slot.appendChild(piece);
                    const rot = parseInt(piece.dataset.currentRotation);
                    updatePieceAriaLabel(piece, index, rot);
                }
            });
        }
    }

    function updatePieceAriaLabel(piece, slotIndex, rotation) {
        const pieceNumber = slotIndex + 1;
        const positionText = `Pieza ${pieceNumber}`;

        let stateText = '';
        if (config.difficulty === 'easy' || config.difficulty === 'hard') {
            stateText = rotation === 0 ? ', orientación correcta' : `, rotada ${rotation} grados`;
        }

        let actionText = '';
        if (config.difficulty === 'easy') {
            actionText = '. Presiona Enter o Espacio para girar';
        } else if (config.difficulty === 'medium') {
            actionText = '. Presiona Enter o Espacio para seleccionar y mover';
        } else if (config.difficulty === 'hard') {
            actionText = '. Presiona Enter o Espacio para seleccionar y mover, o R para girar';
        }

        piece.setAttribute('aria-label', `${positionText}${stateText}${actionText}`);
    }

    function handleArrowNavigation(e) {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

        e.preventDefault();

        const currentPiece = e.target;
        const currentSlot = currentPiece.parentElement;
        if (!currentSlot || !currentSlot.classList.contains('drop-zone')) return;

        const currentIndex = parseInt(currentSlot.dataset.index);
        const currentRow = Math.floor(currentIndex / config.size);
        const currentCol = currentIndex % config.size;

        let newRow = currentRow;
        let newCol = currentCol;

        switch (e.key) {
            case 'ArrowUp':
                newRow = Math.max(0, currentRow - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(config.size - 1, currentRow + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, currentCol - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(config.size - 1, currentCol + 1);
                break;
        }

        const newIndex = newRow * config.size + newCol;
        if (newIndex !== currentIndex) {
            const newSlot = boardElement.children[newIndex];
            if (newSlot && newSlot.children.length > 0) {
                newSlot.children[0].focus();
            }
        }
    }

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

    function handleRotateClick(e) {
        const piece = e.currentTarget || e.target;
        if (piece.classList.contains('dragging')) return;

        resetIdleTimer();
        const cue = piece.querySelector('.action-indicator');
        if(cue) cue.remove();

        piece.classList.remove('incorrect', 'correct');

        let currentRot = parseInt(piece.dataset.currentRotation);
        currentRot = (currentRot + 90) % 360;
        piece.dataset.currentRotation = currentRot;
        piece.style.transform = `rotate(${currentRot}deg)`;

        moves++;
        updateStatsWithoutAnnounce();

        const slot = piece.parentElement;
        const slotIndex = slot ? parseInt(slot.dataset.index) : 0;
        updatePieceAriaLabel(piece, slotIndex, currentRot);

        const rotationText = currentRot === 0 ? 'orientación correcta' : `rotada ${currentRot} grados`;
        announceToScreenReader(`Pieza girada, ${rotationText}`);
    }

    function handleKeyboardRotate(e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            handleRotateClick(e);
        }
    }

    function handleKeyboardRotateHard(e) {
        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            handleRotateClick(e);
        }
    }

    function handleKeyboardSwap(e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();

        const currentPiece = e.target;
        const currentSlot = currentPiece.parentElement;
        if (!currentSlot || !currentSlot.classList.contains('drop-zone')) return;

        if (!selectedPieceForSwap) {
            selectedPieceForSwap = currentPiece;
            currentPiece.classList.add('selected-for-swap');
            const currentIndex = parseInt(currentSlot.dataset.index) + 1;
            announceToScreenReader(`Pieza ${currentIndex} seleccionada. Navega a otra pieza y presiona Enter para intercambiar.`);
        } else if (selectedPieceForSwap === currentPiece) {
            selectedPieceForSwap.classList.remove('selected-for-swap');
            selectedPieceForSwap = null;
            const currentIndex = parseInt(currentSlot.dataset.index) + 1;
            announceToScreenReader(`Pieza ${currentIndex} deseleccionada.`);
        } else {
            const selectedSlot = selectedPieceForSwap.parentElement;
            const selectedIndex = parseInt(selectedSlot.dataset.index);
            const currentIndex = parseInt(currentSlot.dataset.index);

            currentSlot.appendChild(selectedPieceForSwap);
            selectedSlot.appendChild(currentPiece);

            const selectedRot = parseInt(selectedPieceForSwap.dataset.currentRotation);
            const currentRot = parseInt(currentPiece.dataset.currentRotation);
            updatePieceAriaLabel(selectedPieceForSwap, currentIndex, selectedRot);
            updatePieceAriaLabel(currentPiece, selectedIndex, currentRot);

            selectedPieceForSwap.classList.remove('selected-for-swap');
            selectedPieceForSwap = null;

            moves++;
            updateStatsWithoutAnnounce();
            resetIdleTimer();

            announceToScreenReader(`Piezas intercambiadas. Ahora estás en pieza ${currentIndex + 1}.`);

            currentSlot.children[0].focus();
        }
    }

    function announceToScreenReader(message) {
        const announcer = document.getElementById('screen-reader-announcer');
        if (announcer) {
            announcer.textContent = '';
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        }
        
        if (config.stimuli === 'sound' || config.stimuli === 'mixed') {
            speakMessage(message);
        }
    }

    function speakMessage(message) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'es-ES';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    }

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
            const originalParent = draggedPiece.parentElement;
            const originalIndex = originalParent ? parseInt(originalParent.dataset.index) : -1;
            const newIndex = parseInt(slot.dataset.index);

            if (slot.children.length > 0) {
                const existingPiece = slot.children[0];

                if (originalParent) {
                    originalParent.appendChild(existingPiece);
                    resetPieceStyle(existingPiece);
                    const existingRot = parseInt(existingPiece.dataset.currentRotation);
                    updatePieceAriaLabel(existingPiece, originalIndex, existingRot);
                }

                slot.appendChild(draggedPiece);
                resetPieceStyle(draggedPiece);

            } else {
                slot.appendChild(draggedPiece);
                resetPieceStyle(draggedPiece);
            }

            const draggedRot = parseInt(draggedPiece.dataset.currentRotation);
            updatePieceAriaLabel(draggedPiece, newIndex, draggedRot);

            moves++;
            updateStatsWithoutAnnounce();
            resetIdleTimer();

            const pieceNumber = newIndex + 1;
            announceToScreenReader(`Pieza movida a posición ${pieceNumber}`);
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

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            btnHelp.classList.remove('hidden');
            updateMascotMessage("¿Necesitas una pista? Toca el foco de abajo.");
            announceToScreenReader("¿Necesitas una pista? El botón de pista está disponible.");
        }, 15000);
    }

    function updateMascotMessage(message) {
        if (mascotText) {
            mascotText.textContent = message;
            mascotText.setAttribute('aria-label', `Mensaje del asistente: ${message}`);
        }
    }

    function updateStatsWithoutAnnounce() {
        if(moveCountDisplay) {
            moveCountDisplay.textContent = moves;
        }
    }

    if(btnCheck) btnCheck.addEventListener('click', checkSolution);

    function checkSolution() {
        let correctCount = 0;
        let hasErrors = false;
        
        const allPieces = document.querySelectorAll('.puzzle-piece');

        allPieces.forEach(piece => {
            piece.classList.remove('correct', 'incorrect');
            const parent = piece.parentElement;
            
            if (!parent.classList.contains('drop-zone')) {
                piece.classList.add('incorrect');
                hasErrors = true;
                return;
            }

            const pIndex = parseInt(piece.dataset.correctIndex);
            const sIndex = parseInt(parent.dataset.index);
            const rot = parseInt(piece.dataset.currentRotation);

            if (pIndex === sIndex && rot === 0) {
                piece.classList.add('correct');
                correctCount++;
            } else {
                piece.classList.add('incorrect');
                hasErrors = true;
            }
        });

        if (correctCount === totalPieces) {
            endGame();
        } else {
            const incorrectCount = totalPieces - correctCount;
            updateMascotMessage(`Hay ${incorrectCount} pieza${incorrectCount > 1 ? 's' : ''} incorrecta${incorrectCount > 1 ? 's' : ''}. ¡Sigue intentando!`);
            announceToScreenReader(`Resultado: ${correctCount} piezas correctas, ${incorrectCount} piezas incorrectas. Sigue intentando.`);
            
            setTimeout(() => {
                document.querySelectorAll('.incorrect').forEach(el => el.classList.remove('incorrect'));
            }, 2500);
        }
    }

    if(btnHelp) btnHelp.addEventListener('click', () => {
        const slots = document.querySelectorAll('.drop-zone');
        let hintFound = false;
        let hintMessage = '';

        for (let slot of slots) {
            if (slot.children.length > 0) {
                const piece = slot.children[0];
                const pIndex = parseInt(piece.dataset.correctIndex);
                const sIndex = parseInt(slot.dataset.index);
                const rot = parseInt(piece.dataset.currentRotation);

                if (pIndex !== sIndex) {
                    piece.classList.add('incorrect');
                    hintMessage = `La pieza ${pIndex + 1} no está en su lugar correcto. Intenta moverla.`;
                    updateMascotMessage("Esta pieza no está en su lugar. Intenta moverla.");
                    setTimeout(() => piece.classList.remove('incorrect'), 2000);
                    hintFound = true;
                    break;
                } else if (rot !== 0) {
                    piece.classList.add('incorrect');
                    hintMessage = `La pieza ${pIndex + 1} necesita ser girada. Está rotada ${rot} grados.`;
                    updateMascotMessage("Esta pieza necesita ser girada.");
                    setTimeout(() => piece.classList.remove('incorrect'), 2000);
                    hintFound = true;
                    break;
                }
            }
        }

        if (!hintFound) {
            hintMessage = "¡Todo se ve bien! Presiona Comprobar Solución.";
            updateMascotMessage("¡Todo se ve bien! Dale a Comprobar.");
        }

        announceToScreenReader(hintMessage);
    });

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

    function openSideMenu() {
        sideMenuOverlay.classList.remove('hidden');
        sideMenuOverlay.setAttribute('aria-hidden', 'false');
        btnMenuToggle.setAttribute('aria-expanded', 'true');

        const menuTitle = document.getElementById('menu-title');
        if (menuTitle) {
            if (!menuTitle.hasAttribute('tabindex')) {
                menuTitle.setAttribute('tabindex', '-1');
            }
            setTimeout(() => menuTitle.focus(), 100);
        }
        
        announceToScreenReader("Menú de opciones abierto");
    }

    function closeSideMenu() {
        sideMenuOverlay.classList.add('hidden');
        sideMenuOverlay.setAttribute('aria-hidden', 'true');
        btnMenuToggle.setAttribute('aria-expanded', 'false');

        if (btnMenuToggle) {
            btnMenuToggle.focus();
        }
    }

    if(sideMenuOverlay) {
        sideMenuOverlay.addEventListener('click', (e) => {
            if (e.target === sideMenuOverlay) closeSideMenu();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !sideMenuOverlay.classList.contains('hidden')) {
            closeSideMenu();
        }
    });

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const delta = Math.floor((Date.now() - startTime) / 1000);
            const mins = Math.floor(delta / 60).toString().padStart(2, '0');
            const secs = (delta % 60).toString().padStart(2, '0');
            if(timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function endGame() {
        clearInterval(timerInterval);
        if(finalTimeDisplay) finalTimeDisplay.textContent = timerDisplay.textContent;
        if(finalMovesDisplay) finalMovesDisplay.textContent = moves;

        if(victoryModal) {
            victoryModal.classList.remove('hidden');
            victoryModal.setAttribute('aria-hidden', 'false');

            const victoryTitle = document.getElementById('victory-title');
            if (victoryTitle) {
                setTimeout(() => victoryTitle.focus(), 100);
            }
        }

        const victoryMessage = `¡Felicidades! Completaste el rompecabezas en ${timerDisplay.textContent} con ${moves} movimientos.`;
        updateMascotMessage("¡Lo lograste! ¡Eres un campeón!");
        announceToScreenReader(victoryMessage);
    }

    function loadSavedAvatar() {
        const savedAvatar = localStorage.getItem('savedAvatarSVG');
        const mascotContainer = document.getElementById('global-mascot-container');
        if (savedAvatar && mascotContainer) mascotContainer.innerHTML = savedAvatar;
    }

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
            announceToScreenReader("Juego pausado");
            alert("Juego Pausado. Pulsa Aceptar para continuar.");
            sideMenuOverlay.classList.add('hidden');
        });
    }
});