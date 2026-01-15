/**
 * Lógica de la Pantalla de Personalización de Asistente (asistente.js)
 * Permite seleccionar un avatar SVG, previsualizarlo y guardarlo globalmente.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. REFERENCIAS AL DOM
    // ==========================================
    const avatarPreviewContainer = document.getElementById('avatar-preview-container');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const btnSaveAvatar = document.getElementById('btn-save-avatar');
    const btnCancelAvatar = document.getElementById('btn-cancel-avatar');
    const currentMiniMascot = document.getElementById('current-mini-mascot');

    // Variable para almacenar el SVG seleccionado temporalmente
    let tempAvatarHTML = '';

    // ==========================================
    // 2. INICIALIZACIÓN
    // ==========================================
    initAvatarSelection();

    function initAvatarSelection() {
        // Cargar el avatar guardado previamente
        const savedAvatar = localStorage.getItem('savedAvatarSVG');

        if (savedAvatar) {
            // Si hay uno guardado, usar ese como inicial
            tempAvatarHTML = savedAvatar;
        } else {
            // Si no, usar el primero de la lista (Superhéroe por defecto)
            const firstOption = document.querySelector('.avatar-option[data-id="hero"] svg');
            if (firstOption) {
                tempAvatarHTML = firstOption.outerHTML;
            }
        }

        // Actualizar la vista previa grande
        updateLargePreview(tempAvatarHTML);

        // Actualizar la mascota pequeña de la esquina (feedback visual)
        if (currentMiniMascot) {
            currentMiniMascot.innerHTML = tempAvatarHTML;
        }

        // Marcar visualmente la opción correcta en la grilla (si es posible identificarla)
        // Nota: Esto es una mejora visual simple, comparando strings podría ser costoso, 
        // así que por ahora dejamos la selección visual en el click.
    }

    // ==========================================
    // 3. LÓGICA DE SELECCIÓN
    // ==========================================

    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 1. Quitar clase 'selected' de todos
            avatarOptions.forEach(o => {
                o.classList.remove('selected');
                o.setAttribute('aria-pressed', 'false');
            });

            // 2. Añadir clase 'selected' al clickeado
            option.classList.add('selected');
            option.setAttribute('aria-pressed', 'true');

            // 3. Obtener el SVG interno
            const svg = option.querySelector('svg');
            if (svg) {
                // Clonar el HTML del SVG para usarlo
                tempAvatarHTML = svg.outerHTML; 
                
                // 4. Actualizar la vista previa central
                updateLargePreview(tempAvatarHTML);
            }
        });
    });

    /**
     * Actualiza el contenedor grande con animación
     */
    function updateLargePreview(svgContent) {
        if (avatarPreviewContainer) {
            // Efecto de desvanecimiento
            avatarPreviewContainer.style.opacity = '0.5';
            avatarPreviewContainer.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                // Inyectar contenido
                avatarPreviewContainer.innerHTML = svgContent;
                
                // Restaurar estilos
                avatarPreviewContainer.style.opacity = '1';
                avatarPreviewContainer.style.transform = 'scale(1)';
            }, 150);
        }
    }

    // ==========================================
    // 4. GUARDAR Y SALIR
    // ==========================================

    // Botón Guardar
    if (btnSaveAvatar) {
        btnSaveAvatar.addEventListener('click', () => {
            if (tempAvatarHTML) {
                // Guardar en LocalStorage para que otras páginas (Home, Ajustes) lo lean
                localStorage.setItem('savedAvatarSVG', tempAvatarHTML);
                
                // Feedback visual en el botón
                const originalText = btnSaveAvatar.textContent;
                btnSaveAvatar.textContent = "¡Guardado!";
                btnSaveAvatar.style.backgroundColor = "var(--green-primary)";
                
                setTimeout(() => {
                    // Redirigir de vuelta a Ajustes
                    window.location.href = 'ajustes.html';
                }, 800);
            }
        });
    }

    // Botón Cancelar
    if (btnCancelAvatar) {
        btnCancelAvatar.addEventListener('click', () => {
            // Simplemente volver atrás sin guardar
            window.location.href = 'ajustes.html';
        });
    }

});