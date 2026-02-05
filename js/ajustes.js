document.addEventListener('DOMContentLoaded', () => {

    loadSavedSettings();
    loadSavedAvatar();

    const settingsForm = document.getElementById('settings-form');
    const previewGrid = document.getElementById('preview-grid-container');
    const btnSave = document.getElementById('btn-save');
    const btnDefault = document.getElementById('btn-default');
    const btnAssist = document.getElementById('btn-assist');
    const btnBack = document.getElementById('btn-back');
    const badgeDifficulty = document.getElementById('badge-difficulty');
    const badgeTime = document.getElementById('badge-time');
    const userTimeDisplay = document.getElementById('user-time-display');
    const userLevelDisplay = document.getElementById('user-level-display');

    const fieldsets = document.querySelectorAll('.control-group');
    setupFieldsetNavigation(fieldsets);

    updatePreviewState();

    function setupFieldsetNavigation(fieldsets) {
        const fieldsetsArray = Array.from(fieldsets);

        fieldsetsArray.forEach((fieldset, index) => {
            const radioInputs = fieldset.querySelectorAll('input[type="radio"]');

            radioInputs.forEach(input => {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();

                        let targetIndex = index;
                        if (e.key === 'ArrowUp' && index > 0) {
                            targetIndex = index - 1;
                        } else if (e.key === 'ArrowDown' && index < fieldsetsArray.length - 1) {
                            targetIndex = index + 1;
                        }

                        if (targetIndex !== index) {
                            const targetFieldset = fieldsetsArray[targetIndex];
                            const targetRadios = targetFieldset.querySelectorAll('input[type="radio"]');
                            const checkedRadio = Array.from(targetRadios).find(r => r.checked);
                            if (checkedRadio) {
                                checkedRadio.focus();
                            } else if (targetRadios.length > 0) {
                                targetRadios[0].focus();
                            }
                        }
                    }
                });
            });
        });
    }

    function updatePreviewState() {
        if (!settingsForm) return;

        const formData = new FormData(settingsForm);
        const size = parseInt(formData.get('size') || 3);
        const difficulty = formData.get('difficulty') || 'easy';
        const timeVal = formData.get('time') || 'free';

        updateGridVisuals(size);

        const diffText = getDifficultyLabel(difficulty);
        const timeText = getTimeLabel(timeVal);

        updateFeedbackUI(timeText, diffText);
    }

    function updateGridVisuals(size) {
        if (!previewGrid) return;
        previewGrid.style.setProperty('--grid-size', size);
        previewGrid.innerHTML = '';
        
        const totalCells = size * size;
        
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell'); 
            cell.style.animation = `popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${i * 0.03}s backwards`;
            previewGrid.appendChild(cell);
        }
    }

    function updateFeedbackUI(timeText, diffText) {
        if (userTimeDisplay) userTimeDisplay.textContent = timeText;
        if (userLevelDisplay) userLevelDisplay.textContent = diffText;

        if (badgeDifficulty) {
            badgeDifficulty.textContent = diffText;
            triggerAnimation(badgeDifficulty);
        }
        if (badgeTime) {
            badgeTime.textContent = timeText;
            triggerAnimation(badgeTime);
        }
    }

    function triggerAnimation(element) {
        element.style.animation = 'none';
        element.offsetHeight;
        element.style.animation = 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }

    function loadSavedSettings() {
        const savedData = localStorage.getItem('puzzleConfig');
        if (savedData) {
            const config = JSON.parse(savedData);
            if (config.difficulty) setRadioValue('difficulty', config.difficulty);
            if (config.size) setRadioValue('size', config.size);
            if (config.stimuli) setRadioValue('stimuli', config.stimuli);
            if (config.time) setRadioValue('time', config.time);
        }
    }

    function loadSavedAvatar() {
        const savedAvatar = localStorage.getItem('savedAvatarSVG');
        const mascotContainer = document.getElementById('global-mascot-container');
        
        if (savedAvatar && mascotContainer) {
            mascotContainer.innerHTML = savedAvatar;
        }
    }

    function saveAndExit() {
        const formData = new FormData(settingsForm);
        const config = {
            difficulty: formData.get('difficulty'),
            size: formData.get('size'),
            stimuli: formData.get('stimuli'),
            time: formData.get('time')
        };

        localStorage.setItem('puzzleConfig', JSON.stringify(config));
        
        btnSave.textContent = "¡Guardado!";
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }

    if (settingsForm) {
        settingsForm.addEventListener('change', updatePreviewState);
    }

    if (btnSave) {
        btnSave.addEventListener('click', (e) => {
            e.preventDefault();
            saveAndExit();
        });
    }

    if (btnDefault) {
        btnDefault.addEventListener('click', () => {
            settingsForm.reset();
            updatePreviewState();
            btnDefault.classList.add('active');
            setTimeout(() => btnDefault.classList.remove('active'), 200);
        });
    }

    if (btnAssist) {
        btnAssist.addEventListener('click', () => {
            window.location.href = 'asistente.html';
        });
    }

    if (btnBack) {
        btnBack.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});

function setRadioValue(name, value) {
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) radio.checked = true;
}

function getDifficultyLabel(val) {
    const map = { 'easy': 'Fácil', 'medium': 'Medio', 'hard': 'Difícil' };
    return map[val] || val;
}

function getTimeLabel(val) {
    const map = { 'free': 'Libre', '3min': '3 Min', '5min': '5 Min' };
    return map[val] || val;
}
