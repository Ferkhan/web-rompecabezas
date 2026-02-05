document.addEventListener('DOMContentLoaded', () => {

    const avatarPreviewContainer = document.getElementById('avatar-preview-container');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const btnSaveAvatar = document.getElementById('btn-save-avatar');
    const btnCancelAvatar = document.getElementById('btn-cancel-avatar');
    const currentMiniMascot = document.getElementById('current-mini-mascot');

    let tempAvatarHTML = '';

    initAvatarSelection();

    function initAvatarSelection() {
        const savedAvatar = localStorage.getItem('savedAvatarSVG');

        if (savedAvatar) {
            tempAvatarHTML = savedAvatar;
        } else {
            const firstOption = document.querySelector('.avatar-option[data-id="hero"] svg');
            if (firstOption) {
                tempAvatarHTML = firstOption.outerHTML;
            }
        }

        updateLargePreview(tempAvatarHTML);

        if (currentMiniMascot) {
            currentMiniMascot.innerHTML = tempAvatarHTML;
        }
    }

    const optionsArray = Array.from(avatarOptions);
    const columnsPerRow = 2;

    avatarOptions.forEach((option, index) => {
        option.addEventListener('click', () => {
            avatarOptions.forEach(o => {
                o.classList.remove('selected');
                o.setAttribute('aria-checked', 'false');
            });

            option.classList.add('selected');
            option.setAttribute('aria-checked', 'true');

            const svg = option.querySelector('svg');
            if (svg) {
                tempAvatarHTML = svg.outerHTML;
                updateLargePreview(tempAvatarHTML);
            }
        });

        option.addEventListener('keydown', (e) => {
            handleArrowNavigation(e, index, optionsArray, columnsPerRow);
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

    function updateLargePreview(svgContent) {
        if (avatarPreviewContainer) {
            avatarPreviewContainer.style.opacity = '0.5';
            avatarPreviewContainer.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                avatarPreviewContainer.innerHTML = svgContent;
                avatarPreviewContainer.style.opacity = '1';
                avatarPreviewContainer.style.transform = 'scale(1)';
            }, 150);
        }
    }

    if (btnSaveAvatar) {
        btnSaveAvatar.addEventListener('click', () => {
            if (tempAvatarHTML) {
                localStorage.setItem('savedAvatarSVG', tempAvatarHTML);
                
                const originalText = btnSaveAvatar.textContent;
                btnSaveAvatar.textContent = "¡Guardado!";
                btnSaveAvatar.style.backgroundColor = "var(--green-primary)";
                
                setTimeout(() => {
                    window.location.href = 'ajustes.html';
                }, 800);
            }
        });
    }

    if (btnCancelAvatar) {
        btnCancelAvatar.addEventListener('click', () => {
            window.location.href = 'ajustes.html';
        });
    }

});
