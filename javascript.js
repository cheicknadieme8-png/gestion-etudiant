// 1. Récupérer les éléments HTML
const form = document.getElementById("form-etudiant");

const champNom = document.getElementById("nom");
const champPrenom = document.getElementById("prenom");
const champEmail = document.getElementById("email");
const champClasse = document.getElementById("classe");
const champNote = document.getElementById("note");

const messageErreur = document.getElementById("erreur");
const messageSucces = document.getElementById("mgs");

const boutonEnregistrer = document.getElementById("btn-enregistrer");
const boutonAnnuler = document.getElementById("btn-annuler");
const titreFormulaire = document.getElementById("titre-formulaire");

const recherche = document.getElementById("recherche");
const filtreClasse = document.getElementById("filtre-classe");
const corpsTableau = document.getElementById("table-body");

const totalEtudiants = document.getElementById("total-etudiants");
const moyenneGenerale = document.getElementById("moyenne-generale");
const totalAdmis = document.getElementById("total-admis");
const meilleureNote = document.getElementById("meilleure-note");
const meilleurEtudiant = document.getElementById("meilleur-etudiant");
const nombreAffiche = document.getElementById("nombre-affiche");

// 2. Charger les étudiants sauvegardés
const CLE_STOCKAGE = "unchk_etudiants";

function chargerEtudiants() {
  try {
    const donnees = localStorage.getItem(CLE_STOCKAGE);
    return donnees ? JSON.parse(donnees) : [];
  } catch (erreur) {
    return [];
  }
}

let Etudiants = chargerEtudiants();
let idEnModification = null;

// 3. Sauvegarder les étudiants dans le navigateur
function sauvegarderEtudiants() {
  try {
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify(Etudiants)
    );
  } catch (erreur) {
    afficherErreur("Impossible de sauvegarder les données.");
  }
}

// 4. Afficher les messages
function afficherErreur(texte) {
  messageErreur.textContent = texte;
  messageErreur.hidden = false;
  messageSucces.hidden = true;
}

function afficherSucces(texte) {
  messageSucces.textContent = texte;
  messageSucces.hidden = false;
  messageErreur.hidden = true;
}

function effacerMessages() {
  messageErreur.hidden = true;
  messageSucces.hidden = true;
  messageErreur.textContent = "";
  messageSucces.textContent = "";
}

// 5. Déterminer si l'étudiant est admis
function resultatEtudiant(note) {
  return Number(note) >= 10 ? "Admis" : "Ajourné";
}

// Afficher les notes avec deux chiffres après la virgule
function formatNote(note) {
  return Number(note).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Protéger le tableau contre l'insertion de code HTML
function echapperHTML(valeur) {
  return String(valeur).replace(/[&<>"']/g, function (caractere) {
    const correspondances = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return correspondances[caractere];
  });
}

// 6. Calculer les statistiques
function actualiserStatistiques() {
  const total = Etudiants.length;

  totalEtudiants.textContent = total;

  if (total === 0) {
    moyenneGenerale.textContent = "0,00/20";
    totalAdmis.textContent = "0";
    meilleureNote.textContent = "—";
    meilleurEtudiant.textContent = "Aucun étudiant";
    return;
  }

  // Calculer la somme des notes
  const somme = Etudiants.reduce(function (acc, etudiant) {
    return acc + Number(etudiant.note);
  }, 0);

  // Calculer la moyenne générale
  const moyenne = somme / total;

  // Compter les étudiants admis
  const admis = Etudiants.filter(function (etudiant) {
    return Number(etudiant.note) >= 10;
  }).length;

  // Trouver le meilleur étudiant
  const meilleur = Etudiants.reduce(function (max, etudiant) {
    return Number(etudiant.note) > Number(max.note)
      ? etudiant
      : max;
  });

  moyenneGenerale.textContent = formatNote(moyenne) + "/20";
  totalAdmis.textContent = admis;
  meilleureNote.textContent = formatNote(meilleur.note) + "/20";

  meilleurEtudiant.textContent =
    meilleur.prenom + " " + meilleur.nom;
}

// 7. Mettre à jour la liste des classes dans le filtre
function actualiserFiltreClasses() {
  const ancienneValeur = filtreClasse.value;

  const classes = [
    ...new Set(
      Etudiants.map(function (etudiant) {
        return etudiant.classe.trim();
      })
    )
  ].filter(Boolean).sort();

  filtreClasse.innerHTML =
    '<option value="">Toutes les classes</option>';

  classes.forEach(function (classe) {
    const option = document.createElement("option");
    option.value = classe;
    option.textContent = classe;
    filtreClasse.appendChild(option);
  });

  if (classes.includes(ancienneValeur)) {
    filtreClasse.value = ancienneValeur;
  }
}

// 8. Afficher les étudiants dans le tableau
function afficherEtudiants() {
  const motCle = recherche.value.trim().toLowerCase();
  const classeChoisie = filtreClasse.value;

  const listeFiltree = Etudiants.filter(function (etudiant) {
    const informations = (
      etudiant.nom + " " +
      etudiant.prenom + " " +
      etudiant.email
    ).toLowerCase();

    const correspondRecherche = informations.includes(motCle);

    const correspondClasse =
      !classeChoisie || etudiant.classe === classeChoisie;

    return correspondRecherche && correspondClasse;
  });

  nombreAffiche.textContent =
    listeFiltree.length + " étudiant" +
    (listeFiltree.length > 1 ? "s" : "");

  if (listeFiltree.length === 0) {
    corpsTableau.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          Aucun étudiant à afficher.
        </td>
      </tr>
    `;
    return;
  }

  corpsTableau.innerHTML = listeFiltree.map(function (etudiant) {
    const resultat = resultatEtudiant(etudiant.note);

    const classeBadge =
      resultat === "Admis" ? "admis" : "ajourne";

    return `
      <tr>
        <td>
          <span class="student-name">
            ${echapperHTML(etudiant.prenom)}
            ${echapperHTML(etudiant.nom)}
          </span>
        </td>

        <td>${echapperHTML(etudiant.email)}</td>

        <td>${echapperHTML(etudiant.classe)}</td>

        <td>${formatNote(etudiant.note)}/20</td>

        <td>
          <span class="result-badge ${classeBadge}">
            ${resultat}
          </span>
        </td>

        <td>
          <div class="action-buttons">
            <button
              type="button"
              class="btn btn-small btn-edit"
              data-action="modifier"
              data-id="${etudiant.id}">
              Modifier
            </button>

            <button
              type="button"
              class="btn btn-small btn-delete"
              data-action="supprimer"
              data-id="${etudiant.id}">
              Supprimer
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// 9. Actualiser toute la page
function actualiserPage() {
  actualiserStatistiques();
  actualiserFiltreClasses();
  afficherEtudiants();
}

// 10. Réinitialiser le formulaire
function reinitialiserFormulaire() {
  form.reset();

  idEnModification = null;

  titreFormulaire.textContent = "Ajouter un étudiant";

  boutonEnregistrer.textContent = "Ajouter l'étudiant";

  boutonAnnuler.hidden = true;
}

// 11. Vérifier les informations saisies
function validerDonnees(nom, prenom, email, classe, note) {
  if (!nom || !prenom || !email || !classe || note === "") {
    return "Veuillez remplir tous les champs.";
  }

  const modeleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!modeleEmail.test(email)) {
    return "Veuillez saisir une adresse e-mail valide.";
  }

  const noteNumerique = Number(note);

  if (
    !Number.isFinite(noteNumerique) ||
    noteNumerique < 0 ||
    noteNumerique > 20
  ) {
    return "La note doit être comprise entre 0 et 20.";
  }

  // Vérifier que l'adresse e-mail n'existe pas déjà
  const emailExiste = Etudiants.some(function (etudiant) {
    return (
      etudiant.email.toLowerCase() === email.toLowerCase() &&
      etudiant.id !== idEnModification
    );
  });

  if (emailExiste) {
    return "Cette adresse e-mail est déjà utilisée.";
  }

  return "";
}

// 12. Ajouter ou modifier un étudiant
form.addEventListener("submit", function (evenement) {
  evenement.preventDefault();

  effacerMessages();

  const nom = champNom.value.trim();
  const prenom = champPrenom.value.trim();
  const email = champEmail.value.trim();
  const classe = champClasse.value.trim();
  const noteTexte = champNote.value.trim();

  const erreur = validerDonnees(
    nom,
    prenom,
    email,
    classe,
    noteTexte
  );

  if (erreur) {
    afficherErreur(erreur);
    return;
  }

  const donneesEtudiant = {
    nom: nom,
    prenom: prenom,
    email: email,
    classe: classe,
    note: Number(noteTexte)
  };

  if (idEnModification !== null) {
    // Modifier un étudiant existant
    const index = Etudiants.findIndex(function (etudiant) {
      return etudiant.id === idEnModification;
    });

    if (index !== -1) {
      Etudiants[index] = {
        ...Etudiants[index],
        ...donneesEtudiant
      };

      sauvegarderEtudiants();
      actualiserPage();
      reinitialiserFormulaire();

      afficherSucces("Étudiant modifié avec succès.");
    }
  } else {
    // Ajouter un nouvel étudiant
    const nouvelEtudiant = {
      id: Date.now().toString() +
        Math.random().toString(16).slice(2),
      ...donneesEtudiant
    };

    Etudiants.push(nouvelEtudiant);

    sauvegarderEtudiants();
    actualiserPage();
    reinitialiserFormulaire();

    afficherSucces("Étudiant ajouté avec succès.");
  }
});

// 13. Gérer les boutons Modifier et Supprimer
corpsTableau.addEventListener("click", function (evenement) {
  const bouton = evenement.target.closest("button[data-action]");

  if (!bouton) {
    return;
  }

  const id = bouton.dataset.id;
  const action = bouton.dataset.action;

  const etudiant = Etudiants.find(function (item) {
    return item.id === id;
  });

  if (!etudiant) {
    return;
  }

  if (action === "modifier") {
    effacerMessages();

    idEnModification = etudiant.id;

    champNom.value = etudiant.nom;
    champPrenom.value = etudiant.prenom;
    champEmail.value = etudiant.email;
    champClasse.value = etudiant.classe;
    champNote.value = etudiant.note;

    titreFormulaire.textContent = "Modifier un étudiant";

    boutonEnregistrer.textContent =
      "Enregistrer les modifications";

    boutonAnnuler.hidden = false;

    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    champNom.focus();
  }

  if (action === "supprimer") {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer " +
      etudiant.prenom + " " + etudiant.nom + " ?"
    );

    if (confirmation) {
      Etudiants = Etudiants.filter(function (item) {
        return item.id !== id;
      });

      sauvegarderEtudiants();

      if (idEnModification === id) {
        reinitialiserFormulaire();
      }

      actualiserPage();

      afficherSucces("Étudiant supprimé avec succès.");
    }
  }
});

// 14. Annuler une modification
boutonAnnuler.addEventListener("click", function () {
  reinitialiserFormulaire();
  effacerMessages();
});

// 15. Activer la recherche et le filtre
recherche.addEventListener("input", afficherEtudiants);

filtreClasse.addEventListener("change", afficherEtudiants);

// 16. Afficher les données au démarrage
actualiserPage();