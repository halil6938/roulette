// =====================================================================
//  CONFIGURATION DE LA ROULETTE — c'est le seul fichier à modifier
// =====================================================================
//
//  Chaque case de la roue est décrite par :
//    texte   : ce qui est écrit sur la case
//    couleur : couleur de la case (code couleur)
//    gagnant : true = cadeau (confettis + fanfare), false = perdu
//    message : le message affiché quand la roue s'arrête sur cette case
//    poids   : (optionnel) chance relative de tomber sur la case.
//              Par défaut 1 pour toutes = chances égales.
//              Ex. mettre 0.2 sur la télé = 5 fois moins de chances.
//
//  Les cases sont placées dans l'ordre, dans le sens des aiguilles d'une montre.

window.ROULETTE_CONFIG = {
  dureeSecondes: 5,   // durée de rotation de la roue
  tours: 6,           // nombre de tours complets avant l'arrêt
  son: true,          // true = sons activés, false = silencieux

  cases: [
    { texte: "TÉLÉ",        couleur: "#ff1744", gagnant: true,  message: "Vous avez gagné 1 télé !!" },
    { texte: "PERDU",       couleur: "#7c1fd1", gagnant: false, message: "Perdu... Retentez votre chance !" },
    { texte: "CASQUE",      couleur: "#ff9100", gagnant: true,  message: "Vous avez gagné 1 casque !!" },
    { texte: "PERDU",       couleur: "#7c1fd1", gagnant: false, message: "Perdu... Retentez votre chance !" },
    { texte: "TÉLÉPHONE",   couleur: "#00c853", gagnant: true,  message: "Vous avez gagné 1 téléphone !!" },
    { texte: "PERDU",       couleur: "#7c1fd1", gagnant: false, message: "Perdu... Retentez votre chance !" },
    { texte: "TROTTINETTE", couleur: "#2979ff", gagnant: true,  message: "Vous avez gagné 1 trottinette !!" },
    { texte: "PERDU",       couleur: "#7c1fd1", gagnant: false, message: "Perdu... Retentez votre chance !" },
  ],
};
