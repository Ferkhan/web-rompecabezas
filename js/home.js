/**
 * Lógica de la Pantalla de Inicio (home.js)
 * Se encarga de la navegación inicial y de mostrar el estado del usuario.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. CARGAR DATOS DEL USUARIO Y AVATAR
    // ==========================================
    loadUserPreferences();
    loadSavedAvatar(); // <--- IMPORTANTE: Cargar el personaje al iniciar

    // ==========================================
    // 2. REFERENCIAS A BOTONES
    // ==========================================
    const btnPlay = document.getElementById('btn-play');
    const btnSettings = document.getElementById('btn-settings');
    const btnInstructions = document.getElementById('btn-instructions');
    const btnExit = document.getElementById('btn-exit');

    // ==========================================
    // 3. EVENT LISTENERS DE NAVEGACIÓN
    // ==========================================

    // Botón Jugar
    if (btnPlay) {
        btnPlay.addEventListener('click', () => {
            // Aquí iría la lógica para ir a la pantalla de juego real
            // Por ahora, un feedback visual
            window.location.href = 'revision.html';
        });
    }

    // Botón Ajustes -> Navegación Real a la página HTML separada
    if (btnSettings) {
        btnSettings.addEventListener('click', () => {
            console.log("Navegando a Ajustes...");
            // Redirección a la otra página
            window.location.href = 'ajustes.html';
        });
    }

    // Botón Instrucciones
    if (btnInstructions) {
        btnInstructions.addEventListener('click', () => {
            // CAMBIO: Redirección real
            window.location.href = 'instrucciones.html';
        });
    }

    // Botón Salir
    if (btnExit) {
        btnExit.addEventListener('click', () => {
            const confirmExit = confirm("¿Seguro que quieres salir, héroe?");
            if (confirmExit) {
                // Intenta cerrar la ventana (nota: los navegadores bloquean esto si no se abrió por script)
                window.close();
                // Fallback visual si no se cierra
                document.body.innerHTML = "<h1 style='color:white; text-align:center; margin-top:20%'>¡Hasta la próxima aventura!</h1>";
                document.body.style.backgroundColor = "#333";
            }
        });
    }
});

/**
 * Lee el avatar SVG guardado en LocalStorage y lo inyecta en el contenedor de la página de inicio.
 * Esto asegura que el personaje seleccionado en "Personalizar" aparezca aquí.
 */
function loadSavedAvatar() {
    // Recuperar el código HTML del SVG guardado
    const savedAvatar = localStorage.getItem('savedAvatarSVG');
    const mascotContainer = document.getElementById('global-mascot-container');
    
    // Si hay un avatar guardado y el contenedor existe en el HTML, inyectarlo
    if (savedAvatar && mascotContainer) {
        mascotContainer.innerHTML = savedAvatar;
    }
    // Si no hay avatar guardado, se mostrará el que esté por defecto en el HTML (Superhéroe)
}

/**
 * Lee la configuración guardada en LocalStorage y actualiza el panel de usuario.
 * Esto conecta lo que guardas en ajustes.html con lo que ves en index.html.
 */
function loadUserPreferences() {
    const userTimeDisplay = document.getElementById('user-time-display');
    const userLevelDisplay = document.getElementById('user-level-display');

    // Intentar leer configuración guardada
    const savedConfig = localStorage.getItem('puzzleConfig');

    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        // Actualizar UI si existen los elementos
        if (userTimeDisplay) userTimeDisplay.textContent = getLabel(config.time, 'time');
        if (userLevelDisplay) userLevelDisplay.textContent = getLabel(config.difficulty, 'diff');
    }
}

/**
 * Convierte los valores técnicos (ej: 'hard') a texto legible (ej: 'Difícil')
 */
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
    // Devuelve la traducción o el valor original si no encuentra
    return (dict[type] && dict[type][key]) ? dict[type][key] : key;
}