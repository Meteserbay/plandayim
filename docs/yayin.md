# Plandayım'ı yayına alma (kendi bilgisayarında)

Site bu bilgisayarda bir Windows servisi olarak çalışır ve internete
**Cloudflare Tunnel** ile açılır. Modemde port açılmaz, ev IP adresin
görünmez, HTTPS sertifikası Cloudflare tarafından otomatik verilir.

```
Ziyaretçi → https://plandayim.com.tr (Cloudflare) → şifreli tünel → bu bilgisayar
                                                     └ Plandayim servisi (localhost:5080)
                                                        ├ site + API
                                                        ├ görseller: C:\plandayim\data\uploads
                                                        └ SQL Server: PlandayimProd
```

## Önce: bilgisayar ayarları

Site, bilgisayar açık ve internete bağlı olduğu sürece çalışır.

- **Ayarlar → Sistem → Güç** bölümünde ekranın kapanması sorun değil, ama
  **uyku modunu "Hiçbir zaman"** yap.
- Windows Update yeniden başlatınca servis ve tünel kendiliğinden açılır;
  oturum açman gerekmez.

## 1. Siteyi bilgisayara kur (bir kez)

**Yönetici olarak** bir PowerShell penceresi aç (Başlat'a sağ tık → Terminal
(Yönetici)) ve proje klasöründe çalıştır:

```powershell
cd C:\Users\Kullanıcı\Desktop\projem\plandayim
powershell -ExecutionPolicy Bypass -File deploy\kurulum.ps1
```

Betik admin e-postasını ve şifresini sorar (en az 12 karakter). Şifre ekranda
görünmez ve sadece `C:\plandayim\config\appsettings.local.json` dosyasına
yazılır; bu dosyayı yalnızca yöneticiler ve servis okuyabilir.

Betik şunları yapar:

- `C:\plandayim` altında klasörleri oluşturur
- siteyi derleyip `C:\plandayim\app` klasörüne kurar
- `PlandayimProd` veritabanını günceller
- **Plandayim** adlı Windows servisini oluşturur; servis kendine ait kısıtlı
  bir hesapla çalışır ve çökerse kendini yeniden başlatır
- her gece 03:00'te çalışan yedek görevini kaydeder

Sonunda "Site çalışıyor" yazıyorsa <http://localhost:5080> adresinden kontrol
edebilirsin.

## 2. Alan adını Cloudflare'e bağla (bir kez)

1. <https://dash.cloudflare.com/sign-up> adresinden ücretsiz hesap aç.
2. **Add a domain** → `plandayim.com.tr` → **Free** planı seç.
3. Cloudflare sana iki **nameserver** adresi verir
   (örn. `ada.ns.cloudflare.com`).
4. Alan adını aldığın firmanın panelinde `plandayim.com.tr` için
   **nameserver / DNS sunucusu** ayarını bu iki adresle değiştir.
   `.com.tr` alan adlarında bu değişiklik birkaç saat sürebilir.
5. Cloudflare alan adının aktif olduğunu e-postayla bildirir.

## 3. Tüneli kur (bir kez)

1. Yönetici PowerShell'de Cloudflare'in programını kur:

   ```powershell
   winget install --id Cloudflare.cloudflared
   ```

2. Cloudflare panelinde **Zero Trust → Networks → Tunnels → Create a tunnel**
   → **Cloudflared** → ad olarak `plandayim` yaz.
3. Ortam olarak **Windows**'u seç. Ekranda
   `cloudflared.exe service install eyJ...` gibi bir komut çıkar. Bu komutu
   **yönetici PowerShell'de** çalıştır.
   - Bu komuttaki uzun kod tünelin şifresidir; kimseyle paylaşma, bir yere
     yapıştırma.
4. **Public Hostnames** adımında iki kayıt ekle:

   | Subdomain | Domain | Type | URL |
   |---|---|---|---|
   | *(boş)* | plandayim.com.tr | HTTP | `localhost:5080` |
   | www | plandayim.com.tr | HTTP | `localhost:5080` |

5. **SSL/TLS → Edge Certificates** altında **Always Use HTTPS**'i aç.

Birkaç dakika içinde <https://plandayim.com.tr> açılır.

## Güncelleme yayınlama

Kodda değişiklik yaptıktan sonra yönetici PowerShell'de:

```powershell
powershell -ExecutionPolicy Bypass -File deploy\guncelle.ps1
```

Site birkaç saniyeliğine kapanıp yeni sürümle açılır. Veritabanı
değişiklikleri (migration) otomatik uygulanır.

## Yedekler

- Her gece 03:00'te veritabanı `C:\plandayim\backups` klasörüne yedeklenir
  (son 14 gün tutulur), görseller de `backups\uploads` altına kopyalanır.
- Elle yedek almak için:
  `powershell -ExecutionPolicy Bypass -File C:\plandayim\yedekle.ps1`
- **Önemli:** Yedekler aynı diskte durur; disk bozulursa yedekler de gider.
  `C:\plandayim\backups` klasörünü ara sıra harici bir diske veya buluta
  (Google Drive, OneDrive) kopyala.

## Sorun giderme

| Durum | Kontrol |
|---|---|
| Site açılmıyor | `Get-Service Plandayim, cloudflared` — ikisi de **Running** olmalı |
| Servis başlamıyor | Olay Görüntüleyicisi → Windows Günlükleri → Uygulama → kaynak **Plandayim** |
| Cloudflare "Bad gateway" (502) | Servis çalışıyor mu? <http://localhost:5080> bu bilgisayarda açılıyor mu? |
| Admin şifresini değiştirmek | `C:\plandayim\config\appsettings.local.json` içindeki `Admin.Password`'ü düzenle, `Restart-Service Plandayim` |

Servisi tamamen kaldırmak için: `Stop-Service Plandayim; sc.exe delete Plandayim`
ve `cloudflared.exe service uninstall`.
