<#
.SYNOPSIS
    Veritabanını ve yüklenen görselleri yedekler. Kurulumda her gece 03:00
    için zamanlanır; elle de çalıştırılabilir.

.DESCRIPTION
    Veritabanı yedekleri 14 gün saklanır. Görseller tek bir kopya olarak
    aynalanır. Yedekler aynı diskte durduğu için disk arızasına karşı
    korumaz; ara sıra harici bir diske veya buluta kopyalanmalı.
#>
param(
    [string]$Root = "C:\plandayim",
    [string]$SqlServer = "$env:COMPUTERNAME\SQLEXPRESS",
    [string]$Database = "PlandayimProd",
    [int]$KeepDays = 14
)

$ErrorActionPreference = "Stop"
$backupDir = Join-Path $Root "backups"
$stamp = Get-Date -Format "yyyyMMdd_HHmm"
$backupFile = Join-Path $backupDir "${Database}_$stamp.bak"

sqlcmd -S $SqlServer -E -C -b -Q "BACKUP DATABASE [$Database] TO DISK = N'$backupFile' WITH INIT, CHECKSUM"
if ($LASTEXITCODE -ne 0) { throw "Veritabanı yedeklenemedi." }

robocopy (Join-Path $Root "data\uploads") (Join-Path $backupDir "uploads") /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Görseller yedeklenemedi (robocopy $LASTEXITCODE)." }

Get-ChildItem $backupDir -Filter "${Database}_*.bak" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$KeepDays) } |
    Remove-Item -Force

Write-Host "Yedek alındı: $backupFile"
exit 0
