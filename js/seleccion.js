/**
 * seleccion.js
 * Maneja la lógica de selección de imagen para el rompecabezas.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Referencias
    const cards = document.querySelectorAll('.image-card');
    const btnContinue = document.getElementById('btn-continue');
    
    // Estado
    let selectedUrl = null;

    // Verificar si ya había una selección previa
    const previousSelection = localStorage.getItem('selectedPuzzleImage');

    // Inicialización de Event Listeners
    cards.forEach(card => {
        // Restaurar selección previa visualmente
        const imgUrl = card.getAttribute('data-img-url');
        if (imgUrl === previousSelection) {
            selectCard(card, imgUrl);
        }

        card.addEventListener('click', () => {
            selectCard(card, imgUrl);
        });
    });

    btnContinue.addEventListener('click', () => {
        if (selectedUrl) {
            // Guardar confirmación final (aunque ya se guarda al seleccionar)
            // Ir a la pantalla de revisión
            window.location.href = 'revision.html';
        }
    });

    /**
     * Marca una tarjeta como seleccionada y actualiza el estado.
     * @param {HTMLElement} cardElement - El elemento DOM de la tarjeta clickeada.
     * @param {string} url - La URL de la imagen.
     */
    function selectCard(cardElement, url) {
        // 1. Quitar selección visual de todas
        cards.forEach(c => {
            c.classList.remove('selected');
            c.setAttribute('aria-pressed', 'false');
        });

        // 2. Marcar la actual
        cardElement.classList.add('selected');
        cardElement.setAttribute('aria-pressed', 'true');

        // 3. Actualizar estado lógico
        selectedUrl = url;
        localStorage.setItem('selectedPuzzleImage', selectedUrl);

        // 4. Habilitar botón continuar
        btnContinue.removeAttribute('disabled');
        btnContinue.setAttribute('aria-disabled', 'false');

        // Feedback de audio opcional aquí (click sound)
    }

});
