document.addEventListener('DOMContentLoaded', () => {

    loadUserPreferences();
    loadSavedAvatar();

    const btnPlay = document.getElementById('btn-play');
    const btnSettings = document.getElementById('btn-settings');
    const btnInstructions = document.getElementById('btn-instructions');
    const btnExit = document.getElementById('btn-exit');

    const menuButtons = [btnPlay, btnSettings, btnInstructions, btnExit].filter(btn => btn !== null);
    setupArrowNavigation(menuButtons);

    if (btnPlay) {
        btnPlay.addEventListener('click', () => {
            window.location.href = 'revision.html';
        });
    }

    if (btnSettings) {
        btnSettings.addEventListener('click', () => {
            window.location.href = 'ajustes.html';
        });
    }

    if (btnInstructions) {
        btnInstructions.addEventListener('click', () => {
            window.location.href = 'instrucciones.html';
        });
    }

    if (btnExit) {
        btnExit.addEventListener('click', () => {
            const confirmExit = confirm("¿Seguro que quieres salir, héroe?");
            if (confirmExit) {
                window.close();
                document.body.innerHTML = "<h1 style='color:white; text-align:center; margin-top:20%'>¡Hasta la próxima aventura!</h1>";
                document.body.style.backgroundColor = "#333";
            }
        });
    }

    function setupArrowNavigation(buttons) {
        buttons.forEach((btn, index) => {
            btn.addEventListener('keydown', (e) => {
                if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

                e.preventDefault();
                let newIndex = index;

                if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    newIndex = index > 0 ? index - 1 : buttons.length - 1;
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    newIndex = index < buttons.length - 1 ? index + 1 : 0;
                }

                buttons[newIndex].focus();
            });
        });
    }
});

function loadSavedAvatar() {
    const savedAvatar = localStorage.getItem('savedAvatarSVG');
    const mascotContainer = document.getElementById('global-mascot-container');
    
    if (savedAvatar && mascotContainer) {
        mascotContainer.innerHTML = savedAvatar;
    }
}

function loadUserPreferences() {
    const userTimeDisplay = document.getElementById('user-time-display');
    const userLevelDisplay = document.getElementById('user-level-display');

    const savedConfig = localStorage.getItem('puzzleConfig');

    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (userTimeDisplay) userTimeDisplay.textContent = getLabel(config.time, 'time');
        if (userLevelDisplay) userLevelDisplay.textContent = getLabel(config.difficulty, 'diff');
    }
}

function getLabel(key, type) {
    const dict = {
        diff: {
            'easy': 'Fácil',
            'medium': 'Medio',
            'hard': 'Difícil'
        },
        time: {
            'free': 'Libre',
            '3min': '3 Min',
            '5min': '5 Min'
        }
    };
    return (dict[type] && dict[type][key]) ? dict[type][key] : key;
}
