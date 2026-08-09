$ErrorActionPreference = "Stop"

$provinceUrl = "https://api.turkiyeapi.dev/v2/datasets/2025/provinces.json"
$districtUrl = "https://api.turkiyeapi.dev/v2/datasets/2025/districts.json"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$outputPath = Join-Path $projectRoot "src\Plandayim.Infrastructure\Persistence\Seed\Data\locations.json"

Write-Host "Il verisi indiriliyor..."
$provinces = Invoke-RestMethod -Uri $provinceUrl -Method Get

Write-Host "Ilce verisi indiriliyor..."
$districts = Invoke-RestMethod -Uri $districtUrl -Method Get

$locations = foreach ($province in ($provinces | Sort-Object name)) {
    $provinceDistricts = @(
        $districts |
        Where-Object { $_.provinceId -eq $province.id } |
        Sort-Object name |
        ForEach-Object { $_.name }
    )

    [PSCustomObject]@{
        name      = $province.name
        districts = $provinceDistricts
    }
}

$directory = Split-Path $outputPath -Parent
New-Item -ItemType Directory -Force -Path $directory | Out-Null

$json = $locations | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText(
    $outputPath,
    $json,
    [System.Text.UTF8Encoding]::new($false)
)

$cityCount = @($locations).Count
$districtCount = ($locations | ForEach-Object { $_.districts.Count } | Measure-Object -Sum).Sum

Write-Host ""
Write-Host "locations.json olusturuldu:"
Write-Host $outputPath
Write-Host ""
Write-Host "Il sayisi: $cityCount"
Write-Host "Ilce sayisi: $districtCount"

if ($cityCount -ne 81) {
    throw "Beklenen il sayisi 81, bulunan: $cityCount"
}

if ($districtCount -ne 973) {
    throw "Beklenen ilce sayisi 973, bulunan: $districtCount"
}

Write-Host ""
Write-Host "Kontrol basarili."
