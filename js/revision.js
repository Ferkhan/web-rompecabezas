/**
 * Lógica de la Pantalla de Revisión (Pre-Game)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Referencias ---
    const btnBack = document.getElementById('btn-back');
    const btnStart = document.getElementById('btn-start');
    const mascotContainer = document.getElementById('global-mascot-container');
    
    // Elementos de Resumen
    const summaryDifficulty = document.getElementById('summary-difficulty');
    const summarySize = document.getElementById('summary-size');
    const summaryStimuli = document.getElementById('summary-stimuli');
    const summaryTime = document.getElementById('summary-time');

    // Panel Superior
    const userTimeDisplay = document.getElementById('user-time-display');
    const userLevelDisplay = document.getElementById('user-level-display');

    // --- Inicialización ---
    loadSavedAvatar();
    loadAndDisplayConfig();

    // --- Navegación ---
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            // Regresar al Home para cambiar decisión o ir a ajustes desde ahí
            window.location.href = 'index.html';
        });
    }

    if (btnStart) {
        btnStart.addEventListener('click', () => {
            window.location.href = 'seleccion.html';
        });
    }

    // --- Funciones ---

    function loadSavedAvatar() {
        const savedAvatar = localStorage.getItem('savedAvatarSVG');
        if (savedAvatar && mascotContainer) {
            mascotContainer.innerHTML = savedAvatar;
        }
    }

    function loadAndDisplayConfig() {
        const savedConfig = localStorage.getItem('puzzleConfig');
        let config = { difficulty: 'easy', size: '3', stimuli: 'visual', time: 'free' }; // Defaults

        if (savedConfig) {
            config = JSON.parse(savedConfig);
        }

        // Traducir valores técnicos a texto legible
        const diffLabel = getLabel(config.difficulty, 'diff');
        const sizeLabel = `${config.size} x ${config.size}`;
        const stimuliLabel = getLabel(config.stimuli, 'stimuli');
        const timeLabel = getLabel(config.time, 'time');

        // Llenar tarjeta central
        if (summaryDifficulty) summaryDifficulty.textContent = diffLabel;
        if (summarySize) summarySize.textContent = sizeLabel;
        if (summaryStimuli) summaryStimuli.textContent = stimuliLabel;
        if (summaryTime) summaryTime.textContent = timeLabel;

        // Llenar panel superior
        if (userTimeDisplay) userTimeDisplay.textContent = timeLabel;
        if (userLevelDisplay) userLevelDisplay.textContent = diffLabel;
    }

    function getLabel(key, type) {
        const dict = {
            diff: { 'easy': 'Fácil', 'medium': 'Medio', 'hard': 'Difícil' },
            time: { 'free': 'Libre', '3min': '3 Min', '5min': '5 Min' },
            stimuli: { 'visual': 'Solo Visual', 'sound': 'Solo Sonido', 'mixed': 'Visual y Sonido' }
        };
        // Si no está en el diccionario, devolver capitalizado o original
        return (dict[type] && dict[type][key]) ? dict[type][key] : key;
    }
});