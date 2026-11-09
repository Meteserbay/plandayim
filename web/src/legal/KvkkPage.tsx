import { Link } from "react-router";
import LegalPage from "./LegalPage";
import { LEGAL_INFO, contactPhrase } from "./legalInfo";

function KvkkPage() {
    return (
        <LegalPage
            title="KVKK Aydınlatma Metni"
            description="Plandayım'ın kişisel verileri hangi amaçla işlediği, kimlere aktardığı ve KVKK kapsamındaki hakların."
        >
            <p>
                Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu
                ("KVKK") 10. maddesi uyarınca, plandayim.com.tr ("Plandayım")
                üzerinden işlenen kişisel verilerin hakkında seni
                bilgilendirmek için hazırlanmıştır.
            </p>

            <h2>1. Veri sorumlusu</h2>
            <p>
                {LEGAL_INFO.controllerName || "Plandayım (plandayim.com.tr)"}
                {LEGAL_INFO.address && (
                    <>
                        <br />
                        Adres: {LEGAL_INFO.address}
                    </>
                )}
                {LEGAL_INFO.email && (
                    <>
                        <br />
                        E-posta: {LEGAL_INFO.email}
                    </>
                )}
            </p>

            <h2>2. Hangi kişisel verileri işliyoruz?</h2>
            <ul>
                <li>
                    <strong>Kimlik bilgileri:</strong> hesap oluştururken ve
                    işletme başvurusunda verdiğin ad soyad.
                </li>
                <li>
                    <strong>İletişim bilgileri:</strong> e-posta adresin ve
                    başvuruda verdiğin telefon numarası.
                </li>
                <li>
                    <strong>Başvuru bilgileri:</strong> işletme adı, başvuru
                    mesajın, başvurunun türü ve durumu.
                </li>
                <li>
                    <strong>İşletme profili bilgileri:</strong> işletme
                    sahiplerinin profilde yayımlanmak üzere girdiği telefon,
                    WhatsApp, e-posta, web sitesi, adres, açıklama ve
                    görseller.
                </li>
                <li>
                    <strong>İşlem güvenliği bilgileri:</strong> şifren (geri
                    çevrilemez biçimde saklanır), son giriş zamanın, oturum
                    çerezi ve IP adresin.
                </li>
            </ul>
            <p>
                Ziyaretçilerin firma profillerini görüntülemesi ve iletişim
                butonlarına tıklaması yalnızca firma bazında sayılır; bu
                sayılar ziyaretçinin kimliğiyle ilişkilendirilmez.
            </p>

            <h2>3. Kişisel verileri hangi amaçlarla işliyoruz?</h2>
            <ul>
                <li>hesabını oluşturmak, girişini sağlamak ve hesabını yönetmek,</li>
                <li>işletme ekleme ve sahiplenme başvurularını değerlendirmek ve seninle iletişime geçmek,</li>
                <li>onaylanan işletme profillerini sitede yayımlamak,</li>
                <li>işletme sahiplerine profillerine ait istatistikleri sunmak,</li>
                <li>siteyi kötüye kullanıma karşı korumak ve bilgi güvenliğini sağlamak,</li>
                <li>yasal yükümlülüklerimizi yerine getirmek ve yetkili kurumların taleplerini karşılamak.</li>
            </ul>

            <h2>4. Hukuki sebepler ve toplama yöntemi</h2>
            <p>
                Kişisel verilerin, sitedeki formlar aracılığıyla ve site
                kullanılırken otomatik yollarla (çerezler, sunucu kayıtları)
                toplanır. Bu veriler KVKK'nın 5. maddesinin 2. fıkrasındaki
                şu hukuki sebeplere dayanılarak işlenir:
            </p>
            <ul>
                <li>bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (hesap, başvuru ve profil hizmetleri),</li>
                <li>veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi,</li>
                <li>bir hakkın tesisi, kullanılması veya korunması,</li>
                <li>temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaati (site güvenliği, kötüye kullanımın önlenmesi).</li>
            </ul>

            <h2>5. Kişisel veriler kimlere aktarılır?</h2>
            <ul>
                <li>
                    <strong>Herkese açık profil bilgileri:</strong> İşletme
                    profilinde yayımlanan iletişim bilgileri ve içerikler,
                    siteyi ziyaret eden herkes tarafından görülebilir.
                </li>
                <li>
                    <strong>Altyapı hizmeti:</strong> Site trafiği; güvenlik,
                    HTTPS bağlantısı ve erişim hizmeti sağlayan Cloudflare,
                    Inc. (ABD) ağı üzerinden iletilir. Bu kapsamda yurt dışına
                    yapılan aktarım, KVKK'nın 9. maddesindeki şartlara uygun
                    olarak gerçekleştirilir.
                </li>
                <li>
                    <strong>Yetkili kurumlar:</strong> Kanunen yetkili kamu
                    kurum ve kuruluşlarına, talep etmeleri halinde ve yasal
                    sınırlar içinde.
                </li>
            </ul>
            <p>Kişisel verilerin satılmaz ve reklam amacıyla paylaşılmaz.</p>

            <h2>6. Saklama süresi</h2>
            <p>
                Kişisel verilerin, işlenme amacının gerektirdiği süre ve ilgili
                mevzuatta öngörülen süreler boyunca saklanır. Hesabının
                silinmesini istediğinde verilerin, yasal saklama
                yükümlülükleri saklı kalmak üzere silinir, yok edilir veya
                anonim hale getirilir. Veritabanı yedekleri 14 gün sonra
                otomatik olarak silinir.
            </p>

            <h2>7. KVKK kapsamındaki hakların</h2>
            <p>KVKK'nın 11. maddesi uyarınca veri sorumlusuna başvurarak:</p>
            <ul>
                <li>kişisel verilerinin işlenip işlenmediğini öğrenme,</li>
                <li>işlenmişse buna ilişkin bilgi talep etme,</li>
                <li>işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
                <li>eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
                <li>KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
                <li>düzeltme, silme ve yok etme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
                <li>münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhine bir sonuç çıkmasına itiraz etme,</li>
                <li>kanuna aykırı işlenmesi sebebiyle zarara uğraman halinde zararın giderilmesini talep etme</li>
            </ul>
            <p>haklarına sahipsin.</p>

            <h2>8. Başvuru yöntemi</h2>
            <p>
                Haklarını kullanmak için talebini, kimliğini doğrulayabileceğimiz
                bilgilerle birlikte {contactPhrase()} iletebilirsin. Başvurun, Veri Sorumlusuna Başvuru Usul ve
                Esasları Hakkında Tebliğ'e uygun olarak en geç 30 gün içinde
                ücretsiz olarak sonuçlandırılır.
            </p>
            <p>
                Çerezler hakkında ayrıntılı bilgi için{" "}
                <Link to="/gizlilik">Gizlilik ve Çerez Politikası</Link>
                {" "}sayfasına bakabilirsin.
            </p>
        </LegalPage>
    );
}

export default KvkkPage;
