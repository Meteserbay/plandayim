# Plandayim

Turkiye'nin organizasyon firmalarini musterilerle bulusturan modern platform.

## Tech Stack

- ASP.NET Core 9
- Entity Framework Core
- SQL Server
- React
- TypeScript

## Admin paneli


## Yayına alma

Site kendi bilgisayarında Windows servisi + Cloudflare Tunnel ile yayınlanır.
Adım adım rehber: [docs/yayin.md](docs/yayin.md). Kısaca:

- İlk kurulum: `deploy\kurulum.ps1` (yönetici PowerShell)
- Güncelleme: `deploy\guncelle.ps1`
- Yedek: her gece otomatik, `deploy\yedekle.ps1`

## Ortam ayarları

Yerel geliştirmede hiçbirini ayarlamak gerekmez; varsayılanlar `localhost`
adreslerini kullanır. Yayında `kurulum.ps1` bunları
`C:\plandayim\config\appsettings.local.json` dosyasına yazar:

| Ayar | Nerede | Açıklama |
|---|---|---|
| `VITE_API_BASE_URL` | `web/.env.local` (örnek: `web/.env.example`) | Frontend'in istek attığı API adresi |
| `Cors:AllowedOrigins` | API ayarları | Sitenin adresi(leri); çerezli istekler sadece bu adreslerden kabul edilir |
| `Storage:PublicBaseUrl` | API ayarları | Yüklenen görsellerin dışarıdan erişilen adresi (`https://api.ornek.com/uploads`) |
| `Storage:RootPath` | API ayarları | Görsellerin diske yazılacağı klasör (varsayılan `wwwroot/uploads`) |

## Status

🚧 In Development
