document.addEventListener('DOMContentLoaded', () => {

    const btnBack = document.getElementById('btn-back');
    const btnStart = document.getElementById('btn-start');
    const mascotContainer = document.getElementById('global-mascot-container');
    const summaryDifficulty = document.getElementById('summary-difficulty');
    const summarySize = document.getElementById('summary-size');
    const summaryStimuli = document.getElementById('summary-stimuli');
    const summaryTime = document.getElementById('summary-time');
    const userTimeDisplay = document.getElementById('user-time-display');
    const userLevelDisplay = document.getElementById('user-level-display');

    loadSavedAvatar();
    loadAndDisplayConfig();

    const reviewItems = document.querySelectorAll('.review-item');
    const actionButtons = [btnBack, btnStart].filter(btn => btn !== null);
    const allFocusable = [...Array.from(reviewItems), ...actionButtons];
    setupArrowNavigation(allFocusable);

    if (btnBack) {
        btnBack.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (btnStart) {
        btnStart.addEventListener('click', () => {
            window.location.href = 'seleccion.html';
        });
    }

    function setupArrowNavigation(elements) {
        elements.forEach((el, index) => {
            el.addEventListener('keydown', (e) => {
                if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

                e.preventDefault();
                let newIndex = index;

                if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    newIndex = index > 0 ? index - 1 : elements.length - 1;
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    newIndex = index < elements.length - 1 ? index + 1 : 0;
                }

                elements[newIndex].focus();
            });
        });
    }

    function loadSavedAvatar() {
        const savedAvatar = localStorage.getItem('savedAvatarSVG');
        if (savedAvatar && mascotContainer) {
            mascotContainer.innerHTML = savedAvatar;
        }
    }

    function loadAndDisplayConfig() {
        const savedConfig = localStorage.getItem('puzzleConfig');
        let config = { difficulty: 'easy', size: '3', stimuli: 'visual', time: 'free' };

        if (savedConfig) {
            config = JSON.parse(savedConfig);
        }

        const diffLabel = getLabel(config.difficulty, 'diff');
        const sizeLabel = `${config.size} x ${config.size}`;
        const stimuliLabel = getLabel(config.stimuli, 'stimuli');
        const timeLabel = getLabel(config.time, 'time');

        if (summaryDifficulty) summaryDifficulty.textContent = diffLabel;
        if (summarySize) summarySize.textContent = sizeLabel;
        if (summaryStimuli) summaryStimuli.textContent = stimuliLabel;
        if (summaryTime) summaryTime.textContent = timeLabel;

        if (userTimeDisplay) userTimeDisplay.textContent = timeLabel;
        if (userLevelDisplay) userLevelDisplay.textContent = diffLabel;
    }

    function getLabel(key, type) {
        const dict = {
            diff: { 'easy': 'Fácil', 'medium': 'Medio', 'hard': 'Difícil' },
            time: { 'free': 'Libre', '3min': '3 Min', '5min': '5 Min' },
            stimuli: { 'visual': 'Solo Visual', 'sound': 'Solo Sonido', 'mixed': 'Visual y Sonido' }
        };
        return (dict[type] && dict[type][key]) ? dict[type][key] : key;
    }
});
