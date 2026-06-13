/* Paroisse Sainte Anne de Bingerville — moteur de contenu (mini-CMS)
   Charge contenu.json et met à jour les pages. Si le fichier est absent
   ou invalide, les pages gardent leur contenu HTML d'origine. */

(function () {
  "use strict";

  function echapper(t) {
    var d = document.createElement("div");
    d.textContent = t == null ? "" : String(t);
    return d.innerHTML;
  }

  /* ----- Nuances de couleur (éclaircir / assombrir un code hexadécimal) ----- */
  function nuance(hex, facteur) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return hex;
    var n = parseInt(m[1], 16);
    var canaux = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (c) {
      var v = facteur >= 0 ? c + (255 - c) * facteur : c * (1 + facteur);
      return Math.max(0, Math.min(255, Math.round(v)));
    });
    return "#" + canaux.map(function (c) {
      return ("0" + c.toString(16)).slice(-2);
    }).join("");
  }

  /* ----- Apparence : logo, nom du site, image d'en-tête (toutes les pages) ----- */
  function rendreApparence(a) {
    if (!a) return;
    if (a.couleurs) {
      var racine = document.documentElement.style;
      var c = a.couleurs;
      if (c.fond) racine.setProperty("--creme", c.fond);
      if (c.fondSecondaire) racine.setProperty("--creme-2", c.fondSecondaire);
      if (c.brun) {
        racine.setProperty("--brun-fonce", c.brun);
        racine.setProperty("--brun", nuance(c.brun, 0.18));
      }
      if (c.rouge) {
        racine.setProperty("--rouge", c.rouge);
        racine.setProperty("--rouge-fonce", nuance(c.rouge, -0.25));
      }
      if (c.or) {
        racine.setProperty("--or", c.or);
        racine.setProperty("--or-clair", nuance(c.or, 0.3));
      }
    }
    if (a.boutons) {
      var racineB = document.documentElement.style;
      var b = a.boutons;
      if (b.don) {
        racineB.setProperty("--bouton-rouge", b.don);
        racineB.setProperty("--bouton-rouge-fonce", nuance(b.don, -0.25));
      }
      if (b.or) {
        racineB.setProperty("--bouton-or", b.or);
        racineB.setProperty("--bouton-or-clair", nuance(b.or, 0.3));
      }
      if (b.brun) {
        racineB.setProperty("--bouton-brun", b.brun);
        racineB.setProperty("--bouton-brun-fonce", nuance(b.brun, -0.3));
      }
    }
    if (a.nomSite) {
      document.querySelectorAll(".logo .nom strong").forEach(function (el) {
        el.textContent = a.nomSite;
      });
    }
    if (a.sousTitre) {
      document.querySelectorAll(".logo .nom span").forEach(function (el) {
        el.textContent = a.sousTitre;
      });
    }
    if (a.logo) {
      document.querySelectorAll(".logo .croix").forEach(function (el) {
        el.style.background = "transparent";
        el.style.boxShadow = "none";
        el.innerHTML = '<img src="' + echapper(a.logo) +
          '" alt="Logo de la paroisse" style="width:46px;height:46px;border-radius:50%;object-fit:cover;">';
      });
    }
    if (a.imageEntete) {
      var url = 'url("' + a.imageEntete + '")';
      var zones = [
        [".heros", "linear-gradient(to bottom, rgba(40,24,8,0.55), rgba(40,24,8,0.35) 45%, rgba(40,24,8,0.75)), "],
        [".banniere-page", "linear-gradient(to bottom, rgba(40,24,8,0.62), rgba(62,39,18,0.72)), "],
        [".appel-action", "linear-gradient(rgba(122,20,20,0.88), rgba(122,20,20,0.88)), "],
        [".placeholder-video", "linear-gradient(to bottom, rgba(40,24,8,0.72), rgba(40,24,8,0.85)), "]
      ];
      zones.forEach(function (z) {
        document.querySelectorAll(z[0]).forEach(function (el) {
          el.style.backgroundImage = z[1] + url;
        });
      });
      // Photos de l'église insérées dans les pages (accueil, médias, etc.)
      document.querySelectorAll('img[src$="images/interieur-eglise.jpg"], img[src="images/interieur-eglise.jpg"]').forEach(function (img) {
        img.src = a.imageEntete;
      });
    }
  }

  /* ----- Coordonnées (toutes les pages, via les liens tel:/mailto:/wa.me) ----- */
  function rendreCoordonnees(c) {
    if (!c) return;
    if (c.telephone) {
      var telHref = "tel:" + c.telephone.replace(/[^+\d]/g, "");
      document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
        a.href = telHref;
        a.textContent = c.telephone;
      });
    }
    if (c.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
        a.href = "mailto:" + c.email;
        a.textContent = c.email;
      });
      // Pieds de page : ligne « ✉ … » sans lien
      document.querySelectorAll(".pied li").forEach(function (li) {
        if (li.children.length === 0 && li.textContent.indexOf("✉") === 0) {
          li.textContent = "✉ " + c.email;
        }
      });
    }
    if (c.telephone) {
      document.querySelectorAll(".pied li").forEach(function (li) {
        if (li.children.length === 0 && li.textContent.indexOf("☎") === 0) {
          li.textContent = "☎ " + c.telephone;
        }
      });
    }
    if (c.whatsapp) {
      var num = c.whatsapp.replace(/[^\d]/g, "");
      document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
        a.href = "https://wa.me/" + num;
      });
    }
    if (c.facebook && c.facebook !== "#") {
      document.querySelectorAll('.reseaux a[aria-label="Facebook"]').forEach(function (a) {
        a.href = c.facebook;
        a.target = "_blank";
        a.rel = "noopener";
      });
    }
  }

  /* ----- Liens YouTube (toutes les pages) ----- */
  function rendreYoutube(y) {
    if (!y || !y.lienChaine) return;
    document.querySelectorAll('a[href*="youtube.com/results"]').forEach(function (a) {
      a.href = y.lienChaine;
    });
    // Direct : si un channelId est fourni et qu'un lecteur placeholder existe
    if (y.channelId) {
      var lecteur = document.querySelector("#lecteur-direct");
      if (lecteur) {
        lecteur.innerHTML =
          '<iframe src="https://www.youtube.com/embed/live_stream?channel=' +
          encodeURIComponent(y.channelId) +
          '" title="Messe en direct — Paroisse Sainte Anne de Bingerville" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      }
    }
  }

  /* ----- Pied de page : titre, description, adresse, copyright ----- */
  function rendrePied(p) {
    if (!p) return;
    var pied = document.querySelector(".pied");
    if (!pied) return;
    var premiereColonne = pied.querySelector(".grille > div");
    if (premiereColonne) {
      if (p.titre) {
        var h4 = premiereColonne.querySelector("h4");
        if (h4) h4.textContent = p.titre;
      }
      if (p.description) {
        var para = premiereColonne.querySelector("p");
        if (para) para.textContent = p.description;
      }
    }
    if (p.adresse) {
      pied.querySelectorAll("li").forEach(function (li) {
        if (li.children.length === 0 && li.textContent.indexOf("📍") === 0) {
          li.textContent = "📍 " + p.adresse;
        }
      });
    }
    if (p.copyright) {
      var bas = pied.querySelector(".bas p");
      if (bas) {
        bas.innerHTML = '© <span class="annee-courante">' + new Date().getFullYear() +
          "</span> " + echapper(p.copyright) +
          ' Photos d’illustration : <a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a>.';
      }
    }
  }

  /* ----- Horaires du pied de page (colonne « Messes dominicales ») ----- */
  function rendreFooterHoraires(lignes) {
    if (!lignes || !lignes.length) return;
    document.querySelectorAll(".pied h4").forEach(function (h4) {
      if (h4.textContent.trim() === "Messes dominicales") {
        var ul = h4.parentElement.querySelector("ul");
        if (ul) {
          ul.innerHTML = lignes.map(function (l) {
            return "<li>" + echapper(l) + "</li>";
          }).join("");
        }
      }
    });
  }

  /* ----- Encarts horaires de l'accueil ----- */
  function rendreEncartsAccueil(encarts) {
    var grille = document.querySelector("#encarts-accueil");
    if (!grille || !encarts || !encarts.length) return;
    grille.innerHTML = encarts.map(function (e) {
      return '<div class="encart-horaires"><h3>' + echapper(e.titre) + "</h3><ul>" +
        (e.items || []).map(function (i) {
          return "<li><span>" + echapper(i.libelle) + "</span><span>" + echapper(i.horaire) + "</span></li>";
        }).join("") + "</ul></div>";
    }).join("");
  }

  /* ----- Tableau des messes (page messes.html) ----- */
  function rendreMessesTableau(lignes) {
    var tbody = document.querySelector("#tableau-messes");
    if (!tbody || !lignes || !lignes.length) return;
    tbody.innerHTML = lignes.map(function (l) {
      return "<tr><td><strong>" + echapper(l.jour) + "</strong></td><td>" +
        echapper(l.heure) + "</td><td>" + echapper(l.celebration) + "</td></tr>";
    }).join("");
  }

  /* ----- Événement vedette (accueil + événements) ----- */
  function rendreVedette(v) {
    if (!v) return;
    document.querySelectorAll("[data-cms-vedette]").forEach(function (bloc) {
      var img = bloc.querySelector("img");
      if (img && v.image) img.src = v.image;
      var titre = bloc.querySelector("[data-cms='vedette-titre']");
      if (titre) titre.textContent = v.titre;
      var desc = bloc.querySelector("[data-cms='vedette-description']");
      if (desc) desc.textContent = v.description;
      var etiq = bloc.querySelector("[data-cms='vedette-badge']");
      if (etiq) etiq.textContent = v.etiquette;
      var compte = bloc.querySelector("[data-compte-rebours]");
      if (compte && v.dateISO) compte.dataset.compteRebours = v.dateISO;
    });
    if (window.SainteAnne) window.SainteAnne.initCompteRebours();
  }

  /* ----- Cartes événements de l'accueil (3 premiers de l'agenda) ----- */
  function rendreEvenementsAccueil(agenda) {
    var grille = document.querySelector("#evenements-accueil");
    if (!grille || !agenda || !agenda.length) return;
    grille.innerHTML = agenda.slice(0, 3).map(function (e) {
      var image = e.image || "images/interieur-eglise.jpg";
      return '<article class="carte carte-evenement"><div style="position:relative;">' +
        '<img class="visuel" src="' + echapper(image) + '" alt="' + echapper(e.titre) + '">' +
        '<div class="date-badge"><strong>' + echapper(e.jour) + "</strong><span>" +
        echapper((e.mois || "").split(" ")[0]) + "</span></div></div>" +
        '<div class="corps"><h3>' + echapper(e.titre) + "</h3><p>" + echapper(e.description) + "</p>" +
        '<a class="lien-plus" href="evenements.html">En savoir plus →</a></div></article>';
    }).join("");
  }

  /* ----- Agenda complet (page événements) ----- */
  function rendreAgenda(agenda) {
    var conteneur = document.querySelector("#liste-agenda");
    if (!conteneur || !agenda || !agenda.length) return;
    conteneur.innerHTML = agenda.map(function (e) {
      var meta = "";
      if (e.heure) meta += "<span>🕘 " + echapper(e.heure) + "</span>";
      if (e.lieu) meta += "<span>📍 " + echapper(e.lieu) + "</span>";
      return '<div class="ligne-agenda"><div class="date-bloc"><strong>' + echapper(e.jour) +
        "</strong><span>" + echapper(e.mois) + "</span></div>" +
        '<div class="infos"><h3>' + echapper(e.titre) + "</h3><p>" + echapper(e.description) + "</p></div>" +
        '<div class="meta-evenement">' + meta + "</div></div>";
    }).join("");
  }

  /* ----- Actualités (page actualités : toutes ; accueil : 3 premières) ----- */
  function carteActu(a) {
    var image = a.image || "images/interieur-eglise.jpg";
    return '<article class="carte carte-actu">' +
      '<img class="visuel" src="' + echapper(image) + '" alt="' + echapper(a.titre) + '">' +
      '<div class="corps"><span class="date-actu">' + echapper(a.date) + "</span>" +
      "<h3>" + echapper(a.titre) + "</h3><p>" + echapper(a.texte) + "</p>" +
      (document.querySelector("#actus-accueil") ?
        '<a class="lien-plus" href="actualites.html">Lire la suite →</a>' : "") +
      "</div></article>";
  }

  function rendreActualites(actus) {
    if (!actus || !actus.length) return;
    var accueil = document.querySelector("#actus-accueil");
    if (accueil) {
      accueil.innerHTML = actus.slice(0, 3).map(carteActu).join("");
    }
    var page = document.querySelector("#liste-actualites");
    if (page) {
      page.innerHTML = actus.map(carteActu).join("");
    }
  }

  /* ----- Galerie photos (page médias) ----- */
  function rendreGalerie(photos) {
    var galerie = document.querySelector(".galerie");
    if (!galerie || !photos || !photos.length) return;
    galerie.innerHTML = photos.map(function (p) {
      return '<figure data-categorie="' + echapper(p.categorie) + '">' +
        '<img src="' + echapper(p.src) + '" data-grand="' + echapper(p.grand || p.src) +
        '" alt="' + echapper(p.legende) + '" loading="lazy">' +
        "<figcaption>" + echapper(p.legende) + "</figcaption></figure>";
    }).join("");
    if (window.SainteAnne) {
      window.SainteAnne.initGalerie();
      window.SainteAnne.initFiltres();
    }
  }

  /* ----- Vidéothèque (page médias) ----- */
  function rendreVideos(videos) {
    var conteneur = document.querySelector("#liste-videos");
    if (!conteneur || !videos || !videos.length) return;
    conteneur.innerHTML = videos.map(function (v) {
      return '<div class="carte-video"><video controls preload="none"' +
        (v.poster ? ' poster="' + echapper(v.poster) + '"' : "") + ">" +
        '<source src="' + echapper(v.src) + '" type="video/mp4">' +
        "Votre navigateur ne prend pas en charge la lecture vidéo.</video>" +
        '<div class="corps"><h3>' + echapper(v.titre) + "</h3><p>" + echapper(v.description) + "</p></div></div>";
    }).join("");
  }

  /* ----- Chargement ----- */
  function appliquer(contenu) {
    rendreApparence(contenu.apparence);
    rendrePied(contenu.pied);
    rendreCoordonnees(contenu.coordonnees);
    rendreYoutube(contenu.youtube);
    rendreFooterHoraires(contenu.footerHoraires);
    rendreEncartsAccueil(contenu.encartsAccueil);
    rendreMessesTableau(contenu.messesTableau);
    rendreVedette(contenu.evenementVedette);
    rendreEvenementsAccueil(contenu.agenda);
    rendreAgenda(contenu.agenda);
    rendreActualites(contenu.actualites);
    rendreGalerie(contenu.galerie);
    rendreVideos(contenu.videos);
  }

  function charger() {
    fetch("contenu.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(appliquer)
      .catch(function (err) {
        // Sans contenu.json (ex. ouverture en fichier local), le site garde son contenu HTML.
        console.warn("CMS : contenu.json non chargé —", err.message);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", charger);
  } else {
    charger();
  }
})();
