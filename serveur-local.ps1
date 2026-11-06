# Ultimate Football : petit serveur web local pour jouer sur un PC Windows sans internet.
# Les modules JavaScript du jeu ne se chargent pas en ouvrant index.html directement (file://) : il faut passer
# par http://localhost. Utilisation : clic droit sur ce fichier > Exécuter avec PowerShell.
# Pour arrêter : fermer la fenêtre (ou Ctrl+C).

$Port = 8080
$Root = [System.IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\') + '\'
$Types = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json'; '.webmanifest' = 'application/manifest+json'; '.png' = 'image/png'; '.txt' = 'text/plain; charset=utf-8'
}

$Listener = [System.Net.HttpListener]::new()
$Listener.Prefixes.Add("http://localhost:$Port/")
try {
  $Listener.Start()
} catch {
  Write-Host "Impossible d'utiliser le port $Port (déjà pris ?). Modifie `$Port en haut du script." -ForegroundColor Red
  Read-Host 'Entrée pour fermer'
  exit 1
}
Write-Host "Ultimate Football : http://localhost:$Port/  (fermer cette fenêtre pour arrêter)" -ForegroundColor Green
Start-Process "http://localhost:$Port/"

try {
  while ($Listener.IsListening) {
    $Context = $Listener.GetContext()
    $Path = [Uri]::UnescapeDataString($Context.Request.Url.AbsolutePath)
    if ($Path.EndsWith('/')) { $Path += 'index.html' }
    $File = [System.IO.Path]::GetFullPath((Join-Path $Root $Path.TrimStart('/')))
    $Response = $Context.Response
    # Seulement les fichiers du dossier du jeu
    if ($File.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $File -PathType Leaf)) {
      $Bytes = [System.IO.File]::ReadAllBytes($File)
      $Ext = [System.IO.Path]::GetExtension($File).ToLowerInvariant()
      $Response.ContentType = if ($Types.ContainsKey($Ext)) { $Types[$Ext] } else { 'application/octet-stream' }
      $Response.ContentLength64 = $Bytes.Length
      $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
    } else {
      $Response.StatusCode = 404
    }
    $Response.Close()
  }
} finally {
  $Listener.Stop()
}
