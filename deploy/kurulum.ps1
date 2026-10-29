#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Plandayım'ı bu bilgisayarda Windows servisi olarak ilk kez kurar.

.DESCRIPTION
    Bir kez çalıştırılır. Klasörleri ve sunucuya özel ayar dosyasını oluşturur,
    uygulamayı derleyip kurar (guncelle.ps1), "Plandayim" servisini oluşturur,
    veritabanı yetkilerini verir ve günlük yedek görevini kaydeder.

    Yönetici olarak açılmış bir PowerShell penceresinde, proje klasöründe:
        powershell -ExecutionPolicy Bypass -File deploy\kurulum.ps1
#>
param(
    [string]$Root = "C:\plandayim",
    [string]$Domain = "plandayim.com.tr",
    [string]$SqlServer = "$env:COMPUTERNAME\SQLEXPRESS",
    [string]$Database = "PlandayimProd",
    [int]$Port = 5080
)

$ErrorActionPreference = "Stop"
$ServiceName = "Plandayim"
$ServiceAccount = "NT SERVICE\$ServiceName"
$ConfigFile = Join-Path $Root "config\appsettings.local.json"

function Step($text) { Write-Host "`n==> $text" -ForegroundColor Cyan }

Step "Klasörler oluşturuluyor ($Root)"
foreach ($dir in "app", "config", "data\uploads", "data\keys", "backups") {
    New-Item -ItemType Directory -Force (Join-Path $Root $dir) | Out-Null
}

if (Test-Path $ConfigFile) {
    Write-Host "Ayar dosyası zaten var, korunuyor: $ConfigFile"
} else {
    Step "Admin hesabı"
    $adminEmail = Read-Host "Admin e-posta adresi"
    $securePassword = Read-Host "Admin şifresi (en az 12 karakter önerilir)" -AsSecureString
    $adminPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

    if ($adminPassword.Length -lt 12) {
        throw "Şifre en az 12 karakter olmalı."
    }

    $config = [ordered]@{
        Urls = "http://localhost:$Port"
        AllowedHosts = "$Domain;www.$Domain;localhost"
        ConnectionStrings = @{
            DefaultConnection = "Server=$SqlServer;Database=$Database;Trusted_Connection=True;TrustServerCertificate=True;"
        }
        Admin = @{ Email = $adminEmail; Password = $adminPassword }
        Storage = @{
            RootPath = Join-Path $Root "data\uploads"
            PublicBaseUrl = "https://$Domain/uploads"
        }
        DataProtection = @{ KeysPath = Join-Path $Root "data\keys" }
        Cors = @{ AllowedOrigins = @("https://$Domain", "https://www.$Domain") }
        Seed = @{ SampleBusinesses = $false }
    }

    $json = $config | ConvertTo-Json -Depth 5
    [IO.File]::WriteAllText($ConfigFile, $json, (New-Object Text.UTF8Encoding($false)))
    $adminPassword = $null
    Write-Host "Ayar dosyası yazıldı: $ConfigFile"
}

Step "Uygulama derleniyor ve kuruluyor"
& (Join-Path $PSScriptRoot "guncelle.ps1") -Root $Root -SkipServiceRestart

Step "Windows servisi oluşturuluyor ($ServiceName)"
$exe = Join-Path $Root "app\Plandayim.Api.exe"

if (-not (Get-Service $ServiceName -ErrorAction SilentlyContinue)) {
    New-Service -Name $ServiceName -BinaryPathName "`"$exe`"" `
        -DisplayName "Plandayım" -Description "plandayim.com.tr web sitesi" `
        -StartupType Automatic | Out-Null
}

# Servis, sadece kendi dosyalarına erişebilen sanal bir hesapla çalışır.
sc.exe config $ServiceName obj= $ServiceAccount | Out-Null
# Çökerse 5 sn sonra yeniden başlar.
sc.exe failure $ServiceName reset= 86400 actions= restart/5000/restart/5000/restart/30000 | Out-Null

Step "Klasör izinleri veriliyor"
icacls (Join-Path $Root "app") /grant "${ServiceAccount}:(OI)(CI)RX" /T /Q | Out-Null
icacls (Join-Path $Root "data") /grant "${ServiceAccount}:(OI)(CI)M" /T /Q | Out-Null
# Ayar dosyasında admin şifresi var: sadece yöneticiler ve servis okuyabilir.
icacls $ConfigFile /inheritance:r /grant:r "*S-1-5-32-544:F" "*S-1-5-18:F" "${ServiceAccount}:R" /Q | Out-Null
# SQL Server yedek dosyasını kendi hesabıyla yazar.
icacls (Join-Path $Root "backups") /grant "NT SERVICE\MSSQL`$SQLEXPRESS:(OI)(CI)M" /Q | Out-Null

Step "Veritabanı yetkileri veriliyor"
$sql = @"
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'$ServiceAccount')
    CREATE LOGIN [$ServiceAccount] FROM WINDOWS;
USE [$Database];
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'$ServiceAccount')
    CREATE USER [$ServiceAccount] FOR LOGIN [$ServiceAccount];
ALTER ROLE db_datareader ADD MEMBER [$ServiceAccount];
ALTER ROLE db_datawriter ADD MEMBER [$ServiceAccount];
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'NT AUTHORITY\SYSTEM')
    CREATE LOGIN [NT AUTHORITY\SYSTEM] FROM WINDOWS;
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'NT AUTHORITY\SYSTEM')
    CREATE USER [NT AUTHORITY\SYSTEM] FOR LOGIN [NT AUTHORITY\SYSTEM];
ALTER ROLE db_backupoperator ADD MEMBER [NT AUTHORITY\SYSTEM];
"@
sqlcmd -S $SqlServer -E -C -b -Q $sql
if ($LASTEXITCODE -ne 0) { throw "Veritabanı yetkileri verilemedi." }

Step "Günlük yedek görevi kaydediliyor (her gün 03:00)"
$backupScript = Join-Path $Root "yedekle.ps1"
Copy-Item (Join-Path $PSScriptRoot "yedekle.ps1") $backupScript -Force
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$backupScript`" -Root `"$Root`" -SqlServer `"$SqlServer`" -Database `"$Database`""
$trigger = New-ScheduledTaskTrigger -Daily -At 3am
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable
Register-ScheduledTask -TaskName "Plandayim Yedek" -Action $action -Trigger $trigger `
    -Settings $settings -User "SYSTEM" -RunLevel Highest -Force | Out-Null

Step "Servis başlatılıyor"
Start-Service $ServiceName
& (Join-Path $PSScriptRoot "guncelle.ps1") -Root $Root -HealthCheckOnly

Write-Host "`nKurulum tamamlandı. Site bu bilgisayarda http://localhost:$Port adresinde çalışıyor." -ForegroundColor Green
Write-Host "İnternete açmak için docs\yayin.md dosyasındaki Cloudflare adımlarını uygula."
