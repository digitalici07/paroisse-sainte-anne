# ============================================================
#  Serveur local du site — Paroisse Sainte Anne de Bingerville
#  Ne pas modifier. Lancez plutôt DEMARRER-LE-SITE.bat
# ============================================================
$racine = $PSScriptRoot
$port = 8777

# Si le serveur tourne déjà, on ouvre simplement le navigateur
$dejaLance = $false
try {
  $test = Invoke-WebRequest -Uri "http://localhost:$port/index.html" -UseBasicParsing -TimeoutSec 2
  if ($test.StatusCode -eq 200) { $dejaLance = $true }
} catch { }

if ($dejaLance) {
  Start-Process "http://localhost:$port/"
  Write-Host ""
  Write-Host "  ✓ Le site tourne déjà dans une autre fenêtre !" -ForegroundColor Green
  Write-Host "    Il vient de se rouvrir dans votre navigateur : http://localhost:$port/"
  Write-Host "    Cette fenêtre-ci peut être fermée sans risque."
  Write-Host ""
  Read-Host "Appuyez sur Entrée pour fermer cette fenêtre"
  exit
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
  $listener.Start()
} catch {
  Write-Host ""
  Write-Host "  ✗ Impossible de démarrer le serveur sur le port $port." -ForegroundColor Red
  Write-Host "    Fermez les autres fenêtres du serveur puis réessayez."
  Write-Host ""
  Read-Host "Appuyez sur Entrée pour fermer"
  exit 1
}

Write-Host ""
Write-Host "  ============================================================" -ForegroundColor DarkYellow
Write-Host "   PAROISSE SAINTE ANNE DE BINGERVILLE — SITE EN LOCAL" -ForegroundColor Yellow
Write-Host "  ============================================================" -ForegroundColor DarkYellow
Write-Host ""
Write-Host "   Site            : http://localhost:$port/" -ForegroundColor Green
Write-Host "   Administration  : http://localhost:$port/admin.html" -ForegroundColor Green
Write-Host ""
Write-Host "   Le navigateur va s'ouvrir automatiquement."
Write-Host "   ⚠ LAISSEZ CETTE FENÊTRE OUVERTE pendant que vous travaillez."
Write-Host "   Pour arrêter : fermez simplement cette fenêtre."
Write-Host ""

Start-Process "http://localhost:$port/"

$types = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".js"="application/javascript; charset=utf-8"; ".png"="image/png";
  ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".svg"="image/svg+xml"; ".ico"="image/x-icon";
  ".mp4"="video/mp4"; ".json"="application/json; charset=utf-8"; ".md"="text/plain; charset=utf-8"
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $chemin = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
  if ([string]::IsNullOrEmpty($chemin)) { $chemin = "index.html" }

  # Sauvegarde du mini-CMS : POST /enregistrer-contenu -> écrit contenu.json
  if ($ctx.Request.HttpMethod -eq "POST" -and $chemin -eq "enregistrer-contenu") {
    try {
      $lecteur = New-Object System.IO.StreamReader($ctx.Request.InputStream, [System.Text.Encoding]::UTF8)
      $corps = $lecteur.ReadToEnd()
      $lecteur.Close()
      $null = $corps | ConvertFrom-Json  # validation JSON avant écriture
      $cible = Join-Path $racine "contenu.json"
      [System.IO.File]::WriteAllText($cible, $corps, (New-Object System.Text.UTF8Encoding($false)))
      $rep = [System.Text.Encoding]::UTF8.GetBytes('{"ok":true}')
      $ctx.Response.ContentType = "application/json; charset=utf-8"
      $ctx.Response.OutputStream.Write($rep, 0, $rep.Length)
      Write-Host "   💾 contenu.json enregistré ($(Get-Date -Format 'HH:mm:ss'))" -ForegroundColor Cyan
    } catch {
      $ctx.Response.StatusCode = 400
      $rep = [System.Text.Encoding]::UTF8.GetBytes('{"ok":false}')
      $ctx.Response.OutputStream.Write($rep, 0, $rep.Length)
    } finally {
      $ctx.Response.OutputStream.Close()
    }
    continue
  }

  $fichier = Join-Path $racine $chemin
  try {
    if (Test-Path $fichier -PathType Leaf) {
      $octets = [System.IO.File]::ReadAllBytes($fichier)
      $ext = [System.IO.Path]::GetExtension($fichier).ToLower()
      if ($types.ContainsKey($ext)) { $ctx.Response.ContentType = $types[$ext] }
      $ctx.Response.ContentLength64 = $octets.Length
      $ctx.Response.OutputStream.Write($octets, 0, $octets.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - Introuvable : $chemin")
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
  } catch {
    $ctx.Response.StatusCode = 500
  } finally {
    $ctx.Response.OutputStream.Close()
  }
}
