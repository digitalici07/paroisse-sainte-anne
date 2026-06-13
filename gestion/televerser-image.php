<?php
// ============================================================
//  Televersement d'une image (mini-CMS) — Hostinger
//  Recoit un fichier image, le valide, l'enregistre dans
//  ../images/ et renvoie son chemin (ex. images/photo.jpg).
//
//  La SECURITE repose sur la protection par mot de passe du
//  dossier /gestion/ (panneau Hostinger).
// ============================================================

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo '{"ok":false,"erreur":"methode"}';
    exit;
}

if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo '{"ok":false,"erreur":"aucun-fichier"}';
    exit;
}

$f = $_FILES['image'];

if ($f['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo '{"ok":false,"erreur":"upload"}';
    exit;
}

// Taille maximale : 8 Mo
if ($f['size'] > 8 * 1024 * 1024) {
    http_response_code(413);
    echo '{"ok":false,"erreur":"taille"}';
    exit;
}

// Verification du vrai type d'image (pas seulement l'extension)
$infos = @getimagesize($f['tmp_name']);
$autorises = array(
    IMAGETYPE_JPEG => 'jpg',
    IMAGETYPE_PNG  => 'png',
    IMAGETYPE_GIF  => 'gif',
    IMAGETYPE_WEBP => 'webp'
);
if ($infos === false || !isset($autorises[$infos[2]])) {
    http_response_code(415);
    echo '{"ok":false,"erreur":"type"}';
    exit;
}
$ext = $autorises[$infos[2]];

// Nom de fichier propre (sans accents ni espaces)
$base = pathinfo($f['name'], PATHINFO_FILENAME);
$base = strtolower($base);
$base = preg_replace('/[^a-z0-9]+/', '-', $base);
$base = trim($base, '-');
if ($base === '') {
    $base = 'photo';
}
$base = substr($base, 0, 60);

$dossier = __DIR__ . '/../images/';
if (!is_dir($dossier)) {
    @mkdir($dossier, 0755, true);
}

// Evite d'ecraser un fichier existant
$nom = $base . '.' . $ext;
$i = 1;
while (file_exists($dossier . $nom)) {
    $nom = $base . '-' . $i . '.' . $ext;
    $i++;
}

if (!move_uploaded_file($f['tmp_name'], $dossier . $nom)) {
    http_response_code(500);
    echo '{"ok":false,"erreur":"ecriture"}';
    exit;
}

echo json_encode(array('ok' => true, 'chemin' => 'images/' . $nom));
