# ============================================================
# Prueba de estres con JMeter - 3 niveles x 5 repeticiones.
#
#   nivel  50  -> 50  usuarios en 10 s   x 5 corridas
#   nivel  500 -> 500 usuarios en 10 s   x 5 corridas
#   nivel 5000 -> 5000 usuarios en 10 s  x 5 corridas
#
# Cada corrida escribe su propio .jtl (para tener las 5 lineas
# base por nivel y poder calcular variabilidad entre replicas).
# ============================================================

$ErrorActionPreference = 'Stop'

$JMeterHome = 'C:\tools\apache-jmeter-5.6.3'
$JmeterBin  = Join-Path $JMeterHome 'bin\jmeter.bat'
$Plan       = Join-Path $PSScriptRoot 'oceaneyes.jmx'
$ResultsDir = Join-Path $PSScriptRoot 'results'
$ReportsDir = Join-Path $PSScriptRoot 'reports'

$BaseUrl  = if ($env:PERF_BASE_URL) { $env:PERF_BASE_URL } else { 'http://127.0.0.1:8787' }
$Levels   = @(50, 500, 5000)
$Repeats  = 5
$RampUp   = 10

New-Item -ItemType Directory -Force -Path $ResultsDir, $ReportsDir | Out-Null

# Tuned de jmeter.properties: 5000 hilos no entran con el heap por defecto.
$props = Join-Path $JMeterHome 'bin\jmeter.properties'
Copy-Item $props "$props.bak-perf" -Force -ErrorAction SilentlyContinue

$env:HEAP = '-Xms1g -Xmx4g -XX:MaxMetaspaceSize=512m'

Write-Host ''
Write-Host '=========================================================' -ForegroundColor Cyan
Write-Host '  PRUEBA DE ESTRES - OCEANEYES' -ForegroundColor Cyan
Write-Host '=========================================================' -ForegroundColor Cyan
Write-Host "  Objetivo : $BaseUrl"
Write-Host "  Niveles  : $($Levels -join ', ')"
Write-Host "  Ramp-up  : $RampUp s   |   Repeticiones: $Repeats"
Write-Host "  Total    : $($Levels.Count * $Repeats) ejecuciones"
Write-Host '=========================================================' -ForegroundColor Cyan
Write-Host ''

foreach ($nivel in $Levels) {
    Write-Host ''
    Write-Host "### NIVEL $nivel usuarios ###" -ForegroundColor Yellow

    for ($r = 1; $r -le $Repeats; $r++) {
        $runId   = "n${nivel}r${r}"
        $jtl     = Join-Path $ResultsDir "signup-$runId.jtl"
        $htmlDir = Join-Path $ReportsDir "dashboard-$runId"

        if (Test-Path $jtl) { Remove-Item $jtl -Force }
        if (Test-Path $htmlDir) { Remove-Item $htmlDir -Recurse -Force }

        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        Write-Host ("  Corrida {0}/{1} ({2}) ... " -f $r, $Repeats, $runId) -NoNewline

        # Los argumentos se construyen con -f explicito: al invocar un .bat,
        # PowerShell no expande "$var" dentro de un token tipo -Jthreads=$var
        # y JMeter recibia la cadena literal ("Starting 0 threads").
        $jmeterArgs = @(
            '-n'
            '-t'; $Plan
            ('-Jthreads={0}' -f $nivel)
            ('-Jrampup={0}' -f $RampUp)
            ('-Jloops=1')
            ('-JrunId={0}' -f $runId)
            ('-JbaseUrl={0}' -f $BaseUrl)
            '-l'; $jtl
            '-f'
            '-j'; (Join-Path $ResultsDir "jmeter-$runId.log")
        )

        & $JmeterBin @jmeterArgs

        $sw.Stop()
        $exit = $LASTEXITCODE

        # Genera el dashboard HTML de esta corrida (Informe agregado,
        # grafico de tiempos de respuesta, percentiles, etc).
        if (Test-Path $jtl) {
            & $JmeterBin -g $jtl -o $htmlDir -f | Out-Null
        }

        if ($exit -eq 0) {
            Write-Host ("OK  {0,6:N1} s" -f $sw.Elapsed.TotalSeconds) -ForegroundColor Green
        } else {
            Write-Host ("FALLO (exit {0})" -f $exit) -ForegroundColor Red
        }

        # Pausa entre corridas para que el emulador vacie conexiones.
        Start-Sleep -Seconds 5
    }
}

Write-Host ''
Write-Host '=========================================================' -ForegroundColor Cyan
Write-Host '  EJECUCIONES COMPLETADAS' -ForegroundColor Cyan
Write-Host "  Resultados : $ResultsDir"
Write-Host "  Dashboards : $ReportsDir"
Write-Host '=========================================================' -ForegroundColor Cyan
Write-Host ''