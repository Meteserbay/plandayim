#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Projedeki güncel kodu derleyip çalışan siteye kurar.

.DESCRIPTION
    Frontend'i ve API'yi derler, veritabanı migration'larını uygular,
    servisi durdurup yeni dosyaları kopyalar ve yeniden başlatır.
    Kesinti genelde birkaç saniyedir.

    Yönetici olarak açılmış bir PowerShell penceresinde, proje klasöründe:
        powershell -ExecutionPolicy Bypass -File deploy\guncelle.ps1
#>
param(
    [string]$Root = "C:\plandayim",
    [switch]$SkipServiceRestart,
    [switch]$HealthCheckOnly
)

$ErrorActionPreference = "Stop"
$ServiceName = "Plandayim"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$ConfigFile = Join-Path $Root "config\appsettings.local.json"

function Step($text) { Write-Host "`n==> $text" -ForegroundColor Cyan }

if (-not (Test-Path $ConfigFile)) {
    throw "Ayar dosyası bulunamadı: $ConfigFile. Önce deploy\kurulum.ps1 çalıştırılmalı."
}

$config = Get-Content $ConfigFile -Raw -Encoding UTF8 | ConvertFrom-Json
$baseUrl = $config.Urls

function Test-Site {
    Step "Site kontrol ediliyor ($baseUrl)"

    for ($i = 0; $i -lt 30; $i++) {
        try {
            $api = Invoke-WebRequest "$baseUrl/api/categories" -UseBasicParsing -TimeoutSec 5
            $page = Invoke-WebRequest "$baseUrl/" -UseBasicParsing -TimeoutSec 5

            if ($api.StatusCode -eq 200 -and $page.StatusCode -eq 200) {
                Write-Host "Site çalışıyor." -ForegroundColor Green
                return
            }
        } catch {
            Start-Sleep -Seconds 1
        }
    }

    throw "Site 30 saniye içinde yanıt vermedi. Olay Görüntüleyicisi > Windows Günlükleri > Uygulama altında 'Plandayim' kayıtlarına bak."
}

if ($HealthCheckOnly) {
    Test-Site
    return
}

$staging = Join-Path $Root "staging"

Step "Frontend derleniyor"
Push-Location (Join-Path $RepoRoot "web")
try {
    npm ci --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw "npm ci başarısız." }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend derlenemedi." }
} finally {
    Pop-Location
}

Step "API derleniyor"
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
dotnet publish (Join-Path $RepoRoot "src\Plandayim.Api") -c Release -o $staging --nologo
if ($LASTEXITCODE -ne 0) { throw "API derlenemedi." }

# Geliştirme ayarları (yerel veritabanı, örnek firmalar) canlıya taşınmaz.
Remove-Item (Join-Path $staging "appsettings.Development.json") -ErrorAction SilentlyContinue

# Copy-Item hedef klasör yokken alt klasörleri düzleştirebiliyor; robocopy
# klasör yapısını (assets/) korur.
robocopy (Join-Path $RepoRoot "web\dist") (Join-Path $staging "wwwroot") /E /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Frontend dosyaları kopyalanamadı (robocopy $LASTEXITCODE)." }

Step "Veritabanı güncelleniyor"
$env:ASPNETCORE_ENVIRONMENT = "Production"
$env:ConnectionStrings__DefaultConnection = $config.ConnectionStrings.DefaultConnection
try {
    dotnet ef database update `
        --project (Join-Path $RepoRoot "src\Plandayim.Infrastructure") `
        --startup-project (Join-Path $RepoRoot "src\Plandayim.Api")
    if ($LASTEXITCODE -ne 0) { throw "Migration uygulanamadı." }
} finally {
    Remove-Item Env:ASPNETCORE_ENVIRONMENT, Env:ConnectionStrings__DefaultConnection -ErrorAction SilentlyContinue
}

$service = Get-Service $ServiceName -ErrorAction SilentlyContinue

if ($service -and $service.Status -eq "Running") {
    Step "Servis durduruluyor"
    Stop-Service $ServiceName
}

Step "Dosyalar kopyalanıyor"
robocopy $staging (Join-Path $Root "app") /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
# robocopy 0-7 arası çıkış kodları başarılıdır.
if ($LASTEXITCODE -ge 8) { throw "Dosyalar kopyalanamadı (robocopy $LASTEXITCODE)." }
$global:LASTEXITCODE = 0

Remove-Item $staging -Recurse -Force

if ($service -and -not $SkipServiceRestart) {
    Step "Servis başlatılıyor"
    Start-Service $ServiceName
    Test-Site
}
