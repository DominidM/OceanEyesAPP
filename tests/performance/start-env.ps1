# ============================================================
# Levanta el entorno controlado para la prueba de estres.
#
#   1) Firebase Emulator Suite  -> auth :9099, firestore :8080, ui :4000
#   2) Wrangler dev             -> gateway en :8787
#
# .\dev.vars  (ya incluido en el repo, ignorado por git) apunta el
# gateway a los emuladores, asi que NADA sale a Internet.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File start-env.ps1
#   powershell -ExecutionPolicy Bypass -File start-env.ps1 -Stop
# ============================================================

param([switch]$Stop)

$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$Ports = @(9099, 8080, 4000, 8787)

function Get-EnvPids {
    $pids = @()
    foreach ($p in $Ports) {
        $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
        if ($c) { $pids += $c[0].OwningProcess }
    }
    return $pids | Sort-Object -Unique
}

# ── Detener ──
if ($Stop) {
    $pids = Get-EnvPids
    if (-not $pids) { Write-Host 'No hay nada que detener.' -ForegroundColor Yellow; exit 0 }

    Write-Host 'Deteniendo el entorno...' -ForegroundColor Yellow
    foreach ($procId in $pids) {
        taskkill /PID $procId /T /F 2>&1 | Out-Null
    }
    # Los emuladores dejan procesos java huerfanos.
    Get-Process java -ErrorAction SilentlyContinue | ForEach-Object {
        try { Stop-Process -Id $_.Id -Force -ErrorAction Stop } catch {}
    }
    Start-Sleep -Seconds 3

    foreach ($p in $Ports) {
        $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
        if ($c) { Write-Host "  $p SIGUE OCUPADO" -ForegroundColor Red }
        else { Write-Host "  $p liberado" -ForegroundColor Green }
    }
    exit 0
}

# ── Levantar ──
$pids = Get-EnvPids
if ($pids) {
    Write-Host "El entorno ya esta corriendo (PIDs: $($pids -join ', '))." -ForegroundColor Yellow
    Write-Host 'Usa -Stop para reiniciarlo.' -ForegroundColor Yellow
    exit 0
}

if (-not (Test-Path (Join-Path $ProjectDir '.dev.vars'))) {
    Write-Host 'FALTA .dev.vars - el gateway apuntaria a Google real.' -ForegroundColor Red
    exit 1
}

Write-Host ''
Write-Host '===============================================' -ForegroundColor Cyan
Write-Host '  ENTORNO CONTROLADO DE PRUEBAS' -ForegroundColor Cyan
Write-Host '===============================================' -ForegroundColor Cyan
Write-Host '  Sin trafico a Internet. Sin tocar el proyecto real.'
Write-Host '===============================================' -ForegroundColor Cyan
Write-Host ''

# 1) Emuladores de Firebase.
# firebase es un .cmd (shim de npm), no un ejecutable Win32: hay que lanzarlo
# a traves de cmd.exe o Start-Process falla con "%1 no es una aplicacion Win32 valida".
$firebaseCmd = Join-Path $env:APPDATA 'npm\firebase.cmd'
if (-not (Test-Path $firebaseCmd)) { $firebaseCmd = 'firebase.cmd' }

Write-Host '[1/2] Iniciando emuladores de Firebase...' -ForegroundColor Cyan
$emuLog = Join-Path $PSScriptRoot 'emulators.log'
Start-Process -FilePath 'cmd.exe' `
    -ArgumentList '/c', "`"$firebaseCmd`" emulators:start --project oceaneyes-5e7b4 --only auth,firestore" `
    -WorkingDirectory $ProjectDir `
    -RedirectStandardOutput $emuLog `
    -RedirectStandardError (Join-Path $PSScriptRoot 'emulators.err.log') `
    -WindowStyle Hidden

# Espera a que el emulador de Auth responda.
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 2
    if (Get-NetTCPConnection -LocalPort 9099 -State Listen -ErrorAction SilentlyContinue) {
        $ready = $true
        break
    }
}

if (-not $ready) {
    Write-Host 'El emulador de Auth no levanto. Revisa emulators.log' -ForegroundColor Red
    exit 1
}
Write-Host '      Auth :9099 y Firestore :8080 listos.' -ForegroundColor Green

# 2) Gateway con wrangler
Write-Host '[2/2] Iniciando el gateway (wrangler dev)...' -ForegroundColor Cyan
$wranglerLog = Join-Path $PSScriptRoot 'wrangler.log'
Start-Process -FilePath 'npx' `
    -ArgumentList 'wrangler', 'dev', '--port', '8787', '--local' `
    -WorkingDirectory $ProjectDir `
    -RedirectStandardOutput $wranglerLog `
    -RedirectStandardError (Join-Path $PSScriptRoot 'wrangler.err.log') `
    -WindowStyle Hidden

$up = $false
for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 2
    if (Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue) {
        $up = $true
        break
    }
}

if (-not $up) {
    Write-Host 'El gateway no levanto. Revisa wrangler.log' -ForegroundColor Red
    exit 1
}

# Verificacion final: el registro debe responder 200.
Start-Sleep -Seconds 3
try {
    $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8787/' -TimeoutSec 20 -UseBasicParsing
    Write-Host "      Gateway :8787 listo (GET / => $($r.StatusCode))." -ForegroundColor Green
} catch {
    Write-Host "      Gateway responde con error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ''
Write-Host '===============================================' -ForegroundColor Cyan
Write-Host '  ENTORNO LISTO' -ForegroundColor Cyan
Write-Host '===============================================' -ForegroundColor Cyan
Write-Host '  Gateway   : http://127.0.0.1:8787'
Write-Host '  Emulators : http://127.0.0.1:4000'
Write-Host ''
Write-Host '  Siguiente paso:'
Write-Host '   .\run-stress.ps1        (las 15 corridas por consola)'
Write-Host '   o abrir el .jmx en JMeter GUI (ver README)'
Write-Host ''
Write-Host '  Para detener: .\start-env.ps1 -Stop'
Write-Host '===============================================' -ForegroundColor Cyan
Write-Host ''