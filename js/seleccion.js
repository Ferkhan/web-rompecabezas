document.addEventListener('DOMContentLoaded', () => {
    
    const btnBack = document.getElementById('btn-back');
    const btnContinue = document.getElementById('btn-continue');
    const imageCards = document.querySelectorAll('.image-card');
    const mascotContainer = document.getElementById('global-mascot-container');
    const mascotText = document.getElementById('mascot-text');
    const userTimeDisplay = document.getElementById('user-time-display');
    const userLevelDisplay = document.getElementById('user-level-display');

    let selectedUrl = null;

    loadSavedAvatar();
    loadUserPreferences();

    const previousSelection = localStorage.getItem('selectedPuzzleImage');

    const cardsArray = Array.from(imageCards);
    const columnsPerRow = 3;

    imageCards.forEach((card, index) => {
        const imgUrl = card.getAttribute('data-img-url');

        if (imgUrl === previousSelection) {
            selectCard(card, imgUrl);
        }

        card.addEventListener('click', () => {
            selectCard(card, imgUrl);

            if (mascotText) {
                const message = "¡Excelente elección! Esa imagen quedará genial.";
                mascotText.textContent = message;
                mascotText.setAttribute('aria-label', `Mensaje del asistente: ${message}`);
            }
        });

        card.addEventListener('keydown', (e) => {
            handleArrowNavigation(e, index, cardsArray, columnsPerRow);
        });
    });

    function handleArrowNavigation(e, currentIndex, items, columns) {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

        e.preventDefault();

        const totalItems = items.length;
        const currentRow = Math.floor(currentIndex / columns);
        const currentCol = currentIndex % columns;
        const totalRows = Math.ceil(totalItems / columns);

        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowUp':
                if (currentRow > 0) {
                    newIndex = (currentRow - 1) * columns + currentCol;
                }
                break;
            case 'ArrowDown':
                if (currentRow < totalRows - 1) {
                    const potentialIndex = (currentRow + 1) * columns + currentCol;
                    if (potentialIndex < totalItems) {
                        newIndex = potentialIndex;
                    }
                }
                break;
            case 'ArrowLeft':
                if (currentIndex > 0) {
                    newIndex = currentIndex - 1;
                }
                break;
            case 'ArrowRight':
                if (currentIndex < totalItems - 1) {
                    newIndex = currentIndex + 1;
                }
                break;
        }

        if (newIndex !== currentIndex && items[newIndex]) {
            items[newIndex].focus();
        }
    }

    function selectCard(cardElement, url) {
        imageCards.forEach(c => {
            c.classList.remove('selected');
            c.setAttribute('aria-pressed', 'false');
        });

        cardElement.classList.add('selected');
        cardElement.setAttribute('aria-pressed', 'true');

        selectedUrl = url;
        localStorage.setItem('selectedPuzzleImage', selectedUrl);

        if (btnContinue) {
            btnContinue.removeAttribute('disabled');
            btnContinue.setAttribute('aria-disabled', 'false');
        }
    }

    if (btnBack) {
        btnBack.addEventListener('click', () => {
            window.location.href = 'revision.html';
        });
    }

    if (btnContinue) {
        btnContinue.addEventListener('click', () => {
            if (selectedUrl) {
                window.location.href = 'juego.html';
            }
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
