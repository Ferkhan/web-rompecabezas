document.addEventListener('DOMContentLoaded', () => {

    const btnBack = document.getElementById('btn-back-home');
    const userTimeDisplay = document.getElementById('user-time-display');
    const userLevelDisplay = document.getElementById('user-level-display');
    const mascotContainer = document.getElementById('global-mascot-container');

    loadUserPreferences();
    loadSavedAvatar();

    const textCard = document.querySelector('.instructions-text-card');
    const stepCards = document.querySelectorAll('.step-card');
    const focusableElements = [textCard, ...Array.from(stepCards), btnBack].filter(el => el !== null);
    setupArrowNavigation(focusableElements);

    if (btnBack) {
        btnBack.addEventListener('click', () => {
            window.location.href = 'index.html';
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

    function loadUserPreferences() {
        const savedConfig = localStorage.getItem('puzzleConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            if (userTimeDisplay) userTimeDisplay.textContent = getLabel(config.time, 'time');
            if (userLevelDisplay) userLevelDisplay.textContent = getLabel(config.difficulty, 'diff');
        }
    }

    function getLabel(key, type) {
        const dict = {
            diff: { 'easy': 'Fácil', 'medium': 'Medio', 'hard': 'Difícil' },
            time: { 'free': 'Libre', '3min': '3 Min', '5min': '5 Min' }
        };
        return (dict[type] && dict[type][key]) ? dict[type][key] : key;
    }
});
