document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("year").textContent = new Date().getFullYear();

  // CAROUSEL : Défilement dynamique basé sur la largeur d'un élément (1 par 1)
  const carousel = document.getElementById("carousel");
  
  document.getElementById("prev").onclick = () => {
    carousel.scrollBy({ left: -carousel.offsetWidth, behavior: "smooth" });
  };
  
  document.getElementById("next").onclick = () => {
    carousel.scrollBy({ left: carousel.offsetWidth, behavior: "smooth" });
  };

  // TOGGLE GRID
  const btn = document.getElementById("toggle");
  const grid = document.getElementById("grid");

  btn.onclick = () => {
    grid.classList.toggle("active");
    btn.textContent = grid.classList.contains("active")
      ? "Voir moins"
      : "Afficher tout";
  };

  // GESTION DU CLIC SUR LES CARTES PROJETS
  const clickableCards = document.querySelectorAll('.clickable-card');
  
  clickableCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Empêche de déclencher ce script si on clique directement sur un bouton <a> à l'intérieur
      if (e.target.tagName.toLowerCase() !== 'a') {
        const url = card.getAttribute('data-url');
        if (url) {
          window.open(url, '_blank');
        }
      }
    });
  });

});