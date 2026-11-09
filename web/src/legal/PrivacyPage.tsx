import { Link } from "react-router";
import LegalPage from "./LegalPage";
import { contactPhrase } from "./legalInfo";

function PrivacyPage() {
    return (
        <LegalPage
            title="Gizlilik ve Çerez Politikası"
            description="Plandayım'da hangi çerezlerin kullanıldığı ve kişisel verilerinin nasıl korunduğu."
        >
            <p>
                Bu politika, Plandayım'ı kullanırken hangi bilgilerin
                toplandığını, nasıl korunduğunu ve hangi çerezlerin
                kullanıldığını açıklar. Kişisel verilerinin işlenmesine
                ilişkin ayrıntılar{" "}
                <Link to="/kvkk">KVKK Aydınlatma Metni</Link>
                {" "}sayfasında yer alır.
            </p>

            <h2>1. Topladığımız bilgiler</h2>
            <p>
                Siteye üye olmadan firma arayabilir ve profilleri
                görüntüleyebilirsin. Ad, e-posta ve telefon gibi bilgileri
                yalnızca hesap oluşturduğunda veya işletme başvurusu
                yaptığında, senin girdiğin kadarıyla alırız.
            </p>

            <h2>2. Çerezler</h2>
            <p>
                Plandayım yalnızca sitenin çalışması için zorunlu çerezleri
                kullanır. Reklam, pazarlama veya kullanıcı takibi amaçlı çerez
                kullanmayız. Çerezleri tarayıcı ayarlarından silebilir veya
                engelleyebilirsin; bu durumda hesabına giriş yapamazsın.
            </p>
            <div className="legal-table-wrap">
                <table className="legal-table">
                    <thead>
                        <tr>
                            <th>Ad</th>
                            <th>Amaç</th>
                            <th>Süre</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>plandayim_user</td>
                            <td>İşletme sahibi hesabıyla giriş yaptığında oturumunu açık tutar.</td>
                            <td>14 gün (kullandıkça uzar)</td>
                        </tr>
                        <tr>
                            <td>plandayim_admin</td>
                            <td>Site yöneticisinin oturumunu açık tutar.</td>
                            <td>8 saat</td>
                        </tr>
                        <tr>
                            <td>Cloudflare çerezleri (__cf_bm vb.)</td>
                            <td>Altyapı sağlayıcımız Cloudflare tarafından, siteyi bot ve saldırılara karşı korumak için gerektiğinde yerleştirilir.</td>
                            <td>Genellikle 30 dakika</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>
                Bunlara ek olarak tarayıcının oturum belleğinde
                (sessionStorage), görüntülediğin firma profilleri tutulur;
                böylece aynı profil sayfayı yenilediğinde tekrar sayılmaz. Bu
                bilgi sunucuya gönderilmez ve tarayıcı sekmesini kapattığında
                silinir.
            </p>

            <h2>3. Bilgilerini nasıl koruyoruz?</h2>
            <ul>
                <li>Siteyle tüm bağlantılar HTTPS ile şifrelenir.</li>
                <li>Şifreler geri çevrilemez biçimde (hash) saklanır; kimse şifreni göremez.</li>
                <li>Giriş denemeleri sınırlandırılarak şifre tahmin saldırıları engellenir.</li>
                <li>Her işletme sahibi yalnızca kendi işletmesinin bilgilerine erişebilir.</li>
                <li>Veritabanı her gece yedeklenir.</li>
            </ul>

            <h2>4. Herkese açık bilgiler</h2>
            <p>
                İşletme profilinde yayımlanan bilgiler (işletme adı, telefon,
                WhatsApp, e-posta, web sitesi, adres, açıklama, görseller ve
                kampanyalar) herkes tarafından görülebilir. Başvuru sırasında
                verdiğin e-posta adresi, profilde ayrıca yayımlanmadıkça
                gösterilmez.
            </p>

            <h2>5. Yaş sınırı</h2>
            <p>
                Hesap oluşturma ve işletme başvurusu 18 yaşını doldurmuş
                kişilere yöneliktir.
            </p>

            <h2>6. Değişiklikler ve iletişim</h2>
            <p>
                Bu politikayı zaman zaman güncelleyebiliriz; güncel sürüm her
                zaman bu sayfada yer alır. Sorularını {contactPhrase()}
                {" "}iletebilirsin.
            </p>
        </LegalPage>
    );
}

export default PrivacyPage;
