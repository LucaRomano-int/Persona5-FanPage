document.addEventListener("DOMContentLoaded", () => {
  // Elementos del modal de la galería
  const modal = document.getElementById("gallery-modal");
  const modalImg = document.getElementById("modal-img-display");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalCloseBtn = document.getElementById("modal-cerrar");
  const modalActionBtn = document.getElementById("modal-btn-action");
  
  const prevBtn = document.getElementById("modal-prev");
  const nextBtn = document.getElementById("modal-next");

  // Si no estamos en la página de galería, salimos
  if (!modal) return;

  // Obtener todas las tarjetas de la galería
  const cards = Array.from(document.querySelectorAll(".gallery-card"));
  let currentIndex = 0;

  // Extraer información de las tarjetas
  const galleryData = cards.map((card) => {
    const img = card.querySelector("img") ? card.querySelector("img").src : "";
    const title = card.getAttribute("data-title") || "GALERÍA";
    const desc = card.getAttribute("data-desc") || "";
    return { img, title, desc };
  });

  // Función para actualizar el modal
  function updateModal(index) {
    if (index < 0) {
      currentIndex = galleryData.length - 1;
    } else if (index >= galleryData.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    const data = galleryData[currentIndex];
    if (modalImg) modalImg.src = data.img;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalDesc) modalDesc.textContent = data.desc;
  }

  function openModal(index) {
    updateModal(index);
    modal.classList.add("activo");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("activo");
    document.body.style.overflow = "";
  }

  // Clic en las tarjetas
  cards.forEach((card, idx) => {
    card.addEventListener("click", () => openModal(idx));
  });

  // Flechas de navegación
  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      updateModal(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      updateModal(currentIndex + 1);
    });
  }

  // Teclado (Flechas y Escape)
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("activo")) return;
    if (e.key === "ArrowLeft") updateModal(currentIndex - 1);
    if (e.key === "ArrowRight") updateModal(currentIndex + 1);
    if (e.key === "Escape") closeModal();
  });

  // Botones de cierre
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalActionBtn) modalActionBtn.addEventListener("click", closeModal);

  // Clic fuera del contenido
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
});