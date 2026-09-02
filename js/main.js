/* ==================== ESTADO DEL CARRUSEL ==================== */

const carouselPositions = {
    protagonistas: 0,
    secundarios: 0,
    villanos: 0
};

/* ==================== HELPER MÁSCARA DINÁMICA ==================== */

function updateCarouselMasks(carouselId, currentPos, maxScroll) {
    const track = document.getElementById(carouselId);
    if (!track) return;

    const container = track.parentElement;
    if (!container) return;

    // Remover clases previas
    container.classList.remove('at-start', 'at-end');

    // Umbral de tolerancia de 2px por diferencias de redondeo
    if (currentPos <= 2) {
        container.classList.add('at-start');
    } else if (currentPos >= maxScroll - 2) {
        container.classList.add('at-end');
    }
}

/* ==================== LÓGICA DE MOVIMIENTO ==================== */

function moveCarousel(carouselId, direction) {
    const track = document.getElementById(carouselId);
    if (!track) return;

    const container = track.parentElement;
    const progressBar = document.getElementById(`progress-${carouselId}`);
    const cards = track.querySelectorAll('.character-card');

    if (!container || cards.length === 0) return;

    // Medida exacta de tarjeta + gap
    const cardStyle = window.getComputedStyle(cards[0]);
    const cardMarginRight = parseFloat(cardStyle.marginRight) || 0;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    const step = cards[0].offsetWidth + Math.max(cardMarginRight, gap);

    // Scroll máximo real sumando el aire extra para el skew y la sombra roja
    const extraSpace = 40; 
    const maxScroll = (track.scrollWidth - container.clientWidth) + extraSpace;

    let currentPos = carouselPositions[carouselId] || 0;
    
    // Posición teórica del siguiente salto
    let nextPos = currentPos + (direction * step);

    // Umbral de ajuste: si el tramo restante es menor a un paso, encajar directo
    if (direction === 1 && (maxScroll - nextPos) < step) {
        nextPos = maxScroll;
    } else if (direction === -1 && nextPos < step) {
        nextPos = 0;
    }

    // Asegurar límites strictly
    if (nextPos < 0) nextPos = 0;
    if (nextPos > maxScroll) nextPos = maxScroll;

    carouselPositions[carouselId] = nextPos;

    // Desplazar el track
    track.style.transform = `translateX(-${nextPos}px)`;

    // Actualizar estados de máscara (inicio / final)
    updateCarouselMasks(carouselId, nextPos, maxScroll);

    // Actualizar barra de progreso al 100%
    if (progressBar && maxScroll > 0) {
        const percentage = (nextPos / maxScroll) * 100;
        progressBar.style.width = `${Math.min(Math.max(percentage, 0), 100)}%`;
    }
}

/* ==================== INICIALIZACIÓN ==================== */

window.addEventListener('DOMContentLoaded', () => {
    ['protagonistas', 'secundarios', 'villanos'].forEach((id) => {
        const progressBar = document.getElementById(`progress-${id}`);
        if (progressBar) {
            progressBar.style.width = '0%';
        }

        // Marcar todos los carruseles al inicio al cargar la página
        const track = document.getElementById(id);
        if (track && track.parentElement) {
            track.parentElement.classList.add('at-start');
        }
    });
});