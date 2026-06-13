<?php
// ============================================================
//  Enregistrement du contenu du site (mini-CMS) — Hostinger
//  Ce script ecrit le fichier ../contenu.json a partir des
//  donnees envoyees par la page de gestion (bouton Enregistrer).
//
//  La SECURITE est assuree par la protection par mot de passe
//  du dossier /gestion/ (panneau Hostinger). Ne pas mettre de
//  mot de passe dans ce fichier : le dossier entier est protege.
// ============================================================

header('Content-Type: application/json; charset=utf-8');

// On n'accepte que la methode POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo '{"ok":false,"erreur":"methode"}';
    exit;
}

// Lecture du corps de la requete
$corps = file_get_contents('php://input');

// Garde-fou : taille raisonnable (5 Mo max)
if ($corps === false || strlen($corps) > 5 * 1024 * 1024) {
    http_response_code(413);
    echo '{"ok":false,"erreur":"taille"}';
    exit;
}

// Validation : le contenu doit etre du JSON valide
$donnees = json_decode($corps);
if ($donnees === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo '{"ok":false,"erreur":"json"}';
    exit;
}

// Ecriture dans le fichier contenu.json situe a la racine du site
$cible = __DIR__ . '/../contenu.json';
$ecrit = @file_put_contents($cible, $corps, LOCK_EX);

if ($ecrit === false) {
    http_response_code(500);
    echo '{"ok":false,"erreur":"ecriture"}';
    exit;
}

echo '{"ok":true}';
