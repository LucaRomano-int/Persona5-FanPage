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

    // Asegurar límites estrictos
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

/* =========================================================
   SOPORTE DE MENÚS DESPLEGABLES
   ========================================================= */

const dropdowns = document.querySelectorAll('.nav-item-dropdown');

dropdowns.forEach(dropdown => {
    const toggleBtn = dropdown.querySelector('.dropdown-toggle');

    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('activo');
    });
});

/* =========================================================
   CERRAR DROPDOWNS AL HACER CLICK AFUERA
   ========================================================= */

document.addEventListener('click', (e) => {
    dropdowns.forEach(dropdown => {
        if (
            dropdown.classList.contains('activo') &&
            !dropdown.contains(e.target)
        ) {
            dropdown.classList.remove('activo');
        }
    });
});

/* =========================================================
   CUANDO TERMINA DE CARGAR EL DOCUMENTO
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('activo');
            navMenu.classList.toggle('activo');
        });

        /* CERRAR MENÚ AL ELEGIR UNA OPCIÓN */
        document.querySelectorAll(
            '.nav-link:not(.dropdown-toggle)'
        ).forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('activo');
                navMenu.classList.remove('activo');
            });
        });
    }

    /* ==================== 1. EVENTOS DE FLECHAS DE CARRUSEL ==================== */
    const carouselBtns = document.querySelectorAll('.carousel-btn');
    carouselBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Obtener dirección (-1 izquierda, 1 derecha)
            const isNext = btn.classList.contains('next') || btn.classList.contains('right');
            const direction = isNext ? 1 : -1;
            
            // Encontrar el contenedor o sección padre para saber cuál carrusel mover
            const section = btn.closest('section') || btn.closest('.carousel-container');
            if (!section) return;

            const track = section.querySelector('.carousel-track');
            if (track && track.id) {
                moveCarousel(track.id, direction);
            }
        });
    });

    /* ==================== 2. INICIALIZAR ESTADO DE CARRUSELES ==================== */
    ['protagonistas', 'secundarios', 'villanos'].forEach((id) => {
        const progressBar = document.getElementById(`progress-${id}`);
        if (progressBar) {
            progressBar.style.width = '0%';
        }

        const track = document.getElementById(id);
        if (track && track.parentElement) {
            track.parentElement.classList.add('at-start');
        }
    });

    /* ==================== 3. MODAL DE PERSONAJES ==================== */
    const modal = document.getElementById('modal-personaje');
    const btnCerrar = document.querySelector('.modal-cerrar');

    const modalImg = document.getElementById('modal-img');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalDescripcion = document.getElementById('modal-descripcion');
    const btnAccion = document.getElementById('modal-btn-accion');

    const btnPrevImg = document.getElementById('modal-prev-galleria') || document.getElementById('modal-prev-img');
    const btnNextImg = document.getElementById('modal-next-galleria') || document.getElementById('modal-next-img');

    const cards = document.querySelectorAll('.character-card');

    let imagenesModal = [];
    let imagenActualIndex = 0;

    // Variables para controlar la imagen especial/alternativa
    let enImagenEspecial = false;
    let imagenBaseGuardada = '';
    let imagenEspecialModal = '#imagen';

    function actualizarImagenModal() {
        enImagenEspecial = false;
        
        if (imagenesModal.length > 0 && modalImg) {
            modalImg.src = imagenesModal[imagenActualIndex];
            imagenBaseGuardada = imagenesModal[imagenActualIndex];
        }

        if (imagenesModal.length > 1) {
            if (btnPrevImg) btnPrevImg.classList.remove('oculto');
            if (btnNextImg) btnNextImg.classList.remove('oculto');
        } else {
            if (btnPrevImg) btnPrevImg.classList.add('oculto');
            if (btnNextImg) btnNextImg.classList.add('oculto');
        }
    }

    if (btnPrevImg) {
        btnPrevImg.addEventListener('click', (e) => {
            e.stopPropagation();
            if (imagenesModal.length > 0) {
                imagenActualIndex = (imagenActualIndex - 1 + imagenesModal.length) % imagenesModal.length;
                actualizarImagenModal();
            }
        });
    }

    if (btnNextImg) {
        btnNextImg.addEventListener('click', (e) => {
            e.stopPropagation();
            if (imagenesModal.length > 0) {
                imagenActualIndex = (imagenActualIndex + 1) % imagenesModal.length;
                actualizarImagenModal();
            }
        });
    }

    // EVENTO DEL BOTÓN ACCIÓN ("PERSONA!")
    if (btnAccion) {
        btnAccion.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!modalImg) return;

            if (!enImagenEspecial) {
                imagenBaseGuardada = modalImg.src;
                modalImg.src = imagenEspecialModal;
                enImagenEspecial = true;
            } else {
                modalImg.src = imagenBaseGuardada;
                enImagenEspecial = false;
            }
        });
    }

    cards.forEach(card => {
        card.style.cursor = 'pointer';

        card.addEventListener('click', () => {
            enImagenEspecial = false;

            // 1. Mostrar/Ocultar el botón según la sección
            const esProtagonista = card.closest('#protagonistas') !== null;
            if (btnAccion) {
                btnAccion.style.visibility = esProtagonista ? 'visible' : 'hidden';
            }

            // 2. Leer la imagen especial del atributo HTML
            imagenEspecialModal = card.getAttribute('data-modal-persona-img') || '#imagen';

            const tituloElement = card.querySelector('.card-info h3');
            if (tituloElement && modalTitulo) {
                modalTitulo.textContent = tituloElement.textContent;
            }

            const arcana = card.getAttribute('data-modal-arcana');
            const persona = card.getAttribute('data-modal-persona');
            const palace = card.getAttribute('data-modal-palace'); // Captura del palacio
            const containerSpecs = document.getElementById('modal-specs');

            if (containerSpecs) {
                let specsHTML = '';

                if (arcana) {
                    specsHTML += `
                        <div class="spec-item">
                            <div class="spec-bar"></div>
                            <div class="spec-text"><span>ARCANA:</span> ${arcana}</div>
                        </div>`;
                }

                if (persona) {
                    specsHTML += `
                        <div class="spec-item">
                            <div class="spec-bar"></div>
                            <div class="spec-text"><span>PERSONA:</span> ${persona}</div>
                        </div>`;
                }

                if (palace) {
                    specsHTML += `
                        <div class="spec-item">
                            <div class="spec-bar"></div>
                            <div class="spec-text"><span>PALACIO:</span> ${palace}</div>
                        </div>`;
                }

                containerSpecs.innerHTML = specsHTML;
            }

            const customDesc = card.getAttribute('data-modal-desc');
            const fallbackDesc = card.querySelector('.card-info p');
            if (modalDescripcion) {
                modalDescripcion.textContent = customDesc ? customDesc : (fallbackDesc ? fallbackDesc.textContent : '');
            }

            const customImgs = card.getAttribute('data-modal-img');
            const fallbackImg = card.querySelector('.char-single-rectangular img') || card.querySelector('img');

            if (customImgs) {
                imagenesModal = customImgs.split(',').map(ruta => ruta.trim());
            } else if (fallbackImg) {
                imagenesModal = [fallbackImg.src];
            } else {
                imagenesModal = [];
            }

            imagenActualIndex = 0;
            actualizarImagenModal();

            if (modal) {
                modal.scrollTop = 0; // Resetea el scroll si el contenedor con overflow es .modal
                const modalContenido = modal.querySelector('.modal-contenido');
                if (modalContenido) {
                    modalContenido.scrollTop = 0; // Resetea el scroll si el contenedor con overflow es .modal-contenido
            }

            modal.classList.add('activo');
        }
        });
    });

    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            if (modal) modal.classList.remove('activo');
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('activo');
        }
    });
});