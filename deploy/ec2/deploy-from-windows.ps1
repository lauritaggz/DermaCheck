# Despliegue asistido desde Windows hacia EC2
# Uso: .\deploy\ec2\deploy-from-windows.ps1

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$PemPath = Join-Path $RepoRoot "dermacheck.pem"
$HostDns = "ec2-34-230-43-210.compute-1.amazonaws.com"
$SshUser = "ec2-user"
$SshTarget = "${SshUser}@${HostDns}"

if (-not (Test-Path $PemPath)) {
    Write-Host "No se encontró dermacheck.pem en la raíz del proyecto." -ForegroundColor Red
    Write-Host "Coloca el archivo aquí: $PemPath"
    exit 1
}

Write-Host "==> Ajustando permisos de la clave PEM..."
icacls $PemPath /inheritance:r | Out-Null
icacls $PemPath /grant:r "$($env:USERNAME):(R)" | Out-Null

Write-Host "==> Probando conexión SSH..."
ssh -i $PemPath -o StrictHostKeyChecking=accept-new $SshTarget "echo OK; uname -a"

Write-Host "==> Subiendo modelos YOLO (puede tardar)..."
$ModelsDir = Join-Path $RepoRoot "backend\ml_models"
foreach ($model in @("best.pt", "best_wrinkle_yolov8m.pt")) {
    $local = Join-Path $ModelsDir $model
    if (Test-Path $local) {
        scp -i $PemPath $local "${SshTarget}:~/DermaCheck/backend/ml_models/"
    } else {
        Write-Host "AVISO: no existe $local" -ForegroundColor Yellow
    }
}

Write-Host "==> Clonando/actualizando repo y arrancando en el servidor..."
$RemoteScript = @'
set -e
if [ ! -d ~/DermaCheck ]; then
  git clone https://github.com/lauritaggz/DermaCheck.git ~/DermaCheck
fi
cd ~/DermaCheck
git pull
chmod +x deploy/ec2/bootstrap.sh
if [ ! -f deploy/ec2/.env ]; then
  cp deploy/ec2/env.ec2.example deploy/ec2/.env
  echo "EDITA deploy/ec2/.env en el servidor antes del primer arranque completo."
fi
./deploy/ec2/bootstrap.sh
'@

ssh -i $PemPath $SshTarget "bash -s" <<< $RemoteScript

Write-Host ""
Write-Host "Listo. Prueba en el navegador:" -ForegroundColor Green
Write-Host "  http://$HostDns"
Write-Host "  http://${HostDns}:8000/docs"
