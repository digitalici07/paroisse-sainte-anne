/* Paroisse Sainte Anne de Bingerville — interactions du site */

(function () {
  "use strict";

  /* ----- Menu mobile ----- */
  function initMenu() {
    var burger = document.querySelector(".burger");
    var nav = document.querySelector(".nav-principale");
    if (burger && nav) {
      burger.addEventListener("click", function () {
        nav.classList.toggle("ouverte");
        burger.setAttribute(
          "aria-expanded",
          nav.classList.contains("ouverte") ? "true" : "false"
        );
      });
    }
  }

  /* ----- Lien actif dans la navigation ----- */
  function initNavActive() {
    var page = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-principale a").forEach(function (lien) {
      if (lien.getAttribute("href") === page) {
        lien.classList.add("actif");
      }
    });
  }

  /* ----- Année courante dans le pied de page ----- */
  function initAnnee() {
    document.querySelectorAll(".annee-courante").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ----- Filtres de la galerie médias (délégation : survit aux rendus CMS) ----- */
  function initFiltres() {
    var barre = document.querySelector(".filtres-galerie");
    if (!barre || barre.dataset.initFiltres) return;
    barre.dataset.initFiltres = "1";
    barre.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filtre]");
      if (!btn) return;
      barre.querySelectorAll("button").forEach(function (b) {
        b.classList.remove("actif");
      });
      btn.classList.add("actif");
      var filtre = btn.dataset.filtre;
      document.querySelectorAll("[data-categorie]").forEach(function (el) {
        el.style.display =
          filtre === "tout" || el.dataset.categorie === filtre ? "" : "none";
      });
    });
  }

  /* ----- Visionneuse photos (lightbox, délégation) ----- */
  var indiceVisionneuse = 0;

  function obtenirVisionneuse() {
    var v = document.querySelector(".visionneuse");
    if (v) return v;
    v = document.createElement("div");
    v.className = "visionneuse";
    v.innerHTML =
      '<button class="fermer" aria-label="Fermer">✕</button>' +
      '<button class="prec" aria-label="Précédente">‹</button>' +
      '<img src="" alt="">' +
      '<button class="suiv" aria-label="Suivante">›</button>' +
      '<div class="legende"></div>';
    document.body.appendChild(v);

    function figuresVisibles() {
      return Array.prototype.filter.call(
        document.querySelectorAll(".galerie figure"),
        function (f) { return f.style.display !== "none"; }
      );
    }

    function afficher(i) {
      var figures = figuresVisibles();
      if (!figures.length) return;
      indiceVisionneuse = (i + figures.length) % figures.length;
      var fig = figures[indiceVisionneuse];
      var img = fig.querySelector("img");
      v.querySelector("img").src = img.dataset.grand || img.src;
      v.querySelector("img").alt = img.alt;
      var cap = fig.querySelector("figcaption");
      v.querySelector(".legende").textContent = cap ? cap.textContent : "";
      v.classList.add("ouverte");
    }
    v.afficherImage = afficher;

    v.querySelector(".fermer").addEventListener("click", function () {
      v.classList.remove("ouverte");
    });
    v.querySelector(".prec").addEventListener("click", function (e) {
      e.stopPropagation(); afficher(indiceVisionneuse - 1);
    });
    v.querySelector(".suiv").addEventListener("click", function (e) {
      e.stopPropagation(); afficher(indiceVisionneuse + 1);
    });
    v.addEventListener("click", function (e) {
      if (e.target === v) v.classList.remove("ouverte");
    });
    document.addEventListener("keydown", function (e) {
      if (!v.classList.contains("ouverte")) return;
      if (e.key === "Escape") v.classList.remove("ouverte");
      if (e.key === "ArrowLeft") afficher(indiceVisionneuse - 1);
      if (e.key === "ArrowRight") afficher(indiceVisionneuse + 1);
    });
    return v;
  }

  function initGalerie() {
    var galerie = document.querySelector(".galerie");
    if (!galerie || galerie.dataset.initGalerie) return;
    galerie.dataset.initGalerie = "1";
    galerie.addEventListener("click", function (e) {
      var fig = e.target.closest("figure");
      if (!fig) return;
      var v = obtenirVisionneuse();
      var visibles = Array.prototype.filter.call(
        galerie.querySelectorAll("figure"),
        function (f) { return f.style.display !== "none"; }
      );
      v.afficherImage(visibles.indexOf(fig));
    });
  }

  /* ----- Formulaires (démo sans serveur) ----- */
  function initFormulaires() {
    document.querySelectorAll("form[data-demo]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msg = form.querySelector(".message-form");
        if (msg) {
          msg.style.display = "block";
          msg.textContent =
            "Merci ! Votre message a bien été enregistré. Le secrétariat paroissial vous répondra rapidement.";
        }
        form.reset();
      });
    });
  }

  /* ----- Compte à rebours fête patronale (ré-initialisable par le CMS) ----- */
  var minuteurCompte = null;

  function initCompteRebours() {
    var compte = document.querySelector("[data-compte-rebours]");
    if (!compte || !compte.dataset.compteRebours) return;
    if (minuteurCompte) clearInterval(minuteurCompte);
    var cible = new Date(compte.dataset.compteRebours + "T07:00:00");
    function majCompte() {
      var diff = cible - new Date();
      if (diff <= 0) {
        compte.textContent = "C'est aujourd'hui ! Bonne fête !";
        return;
      }
      var j = Math.floor(diff / 864e5);
      var h = Math.floor((diff % 864e5) / 36e5);
      var m = Math.floor((diff % 36e5) / 6e4);
      compte.textContent = j + " jours, " + h + " h et " + m + " min";
    }
    majCompte();
    minuteurCompte = setInterval(majCompte, 30000);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initNavActive();
    initAnnee();
    initFiltres();
    initGalerie();
    initFormulaires();
    initCompteRebours();
  });

  /* Fonctions exposées pour cms.js (rendu dynamique du contenu) */
  window.SainteAnne = {
    initFiltres: initFiltres,
    initGalerie: initGalerie,
    initCompteRebours: initCompteRebours
  };
})();
