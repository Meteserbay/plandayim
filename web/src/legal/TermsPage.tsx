import { Link } from "react-router";
import LegalPage from "./LegalPage";
import { LEGAL_INFO, contactPhrase } from "./legalInfo";

function TermsPage() {
    return (
        <LegalPage
            title="Kullanım Koşulları"
            description="Plandayım'ı kullanırken geçerli olan kurallar ve tarafların sorumlulukları."
        >
            <p>
                plandayim.com.tr'yi ("Plandayım") kullanarak bu koşulları kabul
                etmiş olursun.
                {LEGAL_INFO.controllerName &&
                    ` Plandayım, ${LEGAL_INFO.controllerName} tarafından işletilir.`}
            </p>

            <h2>1. Hizmetin tanımı</h2>
            <p>
                Plandayım, organizasyon hizmeti arayan kullanıcıları bu
                hizmetleri sunan işletmelerle buluşturan bir rehber
                platformudur. Plandayım, kullanıcılar ile işletmeler arasında
                yapılan anlaşmaların tarafı değildir; hizmetin fiyatı,
                kalitesi, teslimi ve ödemesi kullanıcı ile işletme arasındadır.
            </p>

            <h2>2. Hesaplar</h2>
            <ul>
                <li>Hesap oluşturmak için 18 yaşını doldurmuş olman gerekir.</li>
                <li>Verdiğin bilgilerin doğru ve güncel olmasından sen sorumlusun.</li>
                <li>Şifreni gizli tutmak senin sorumluluğundadır. Hesabında yetkisiz bir kullanım fark edersen bize hemen bildir.</li>
                <li>Hesap oluşturmak tek başına hiçbir işletme profiline erişim vermez; işletme sahipliği, başvurunun onaylanmasıyla kazanılır.</li>
            </ul>

            <h2>3. İşletme profilleri ve içerikler</h2>
            <ul>
                <li>
                    İşletme ekleme veya sahiplenme başvurusu yapan kişi, o
                    işletme adına başvuru yapmaya yetkili olduğunu beyan eder.
                    Başvurular incelenir; Plandayım bir başvuruyu gerekçe
                    göstermeden reddedebilir.
                </li>
                <li>
                    Profildeki bilgi, görsel ve kampanyaların doğruluğundan ve
                    hukuka uygunluğundan işletme sahibi sorumludur. Başkasına
                    ait görselleri izinsiz yüklemek, yanıltıcı kampanya veya
                    bilgi yayımlamak yasaktır.
                </li>
                <li>
                    İşletme sahibi, yüklediği içeriklerin Plandayım'da
                    yayımlanması ve sitenin tanıtımında gösterilmesi için
                    ücretsiz ve münhasır olmayan bir kullanım izni verir. Bu
                    izin, içerik kaldırıldığında sona erer.
                </li>
                <li>
                    "Doğrulanmış" rozeti yalnızca işletme bilgilerinin
                    Plandayım tarafından kontrol edildiğini gösterir; hizmet
                    kalitesine dair bir garanti değildir.
                </li>
            </ul>

            <h2>4. Yasak kullanımlar</h2>
            <ul>
                <li>sahte veya başkası adına izinsiz başvuru yapmak,</li>
                <li>siteden otomatik araçlarla toplu veri çekmek,</li>
                <li>siteye, sunuculara veya başka kullanıcıların hesaplarına yetkisiz erişmeye çalışmak,</li>
                <li>hukuka aykırı, yanıltıcı, hakaret içeren veya üçüncü kişilerin haklarını ihlal eden içerik yayımlamak.</li>
            </ul>
            <p>
                Bu koşullara aykırı davranılması halinde Plandayım ilgili
                içeriği veya profili yayından kaldırabilir ya da hesabı askıya
                alabilir.
            </p>

            <h2>5. Ücretler</h2>
            <p>
                Plandayım'da firma aramak ve işletme profili oluşturmak şu an
                ücretsizdir. İleride ücretli hizmetler sunulursa, bunların
                koşulları ve fiyatları satın almadan önce ayrıca ve açıkça
                bildirilir.
            </p>

            <h2>6. Sorumluluğun sınırı</h2>
            <p>
                Plandayım, sitenin kesintisiz ve hatasız çalışması için makul
                çabayı gösterir; ancak bakım, teknik arıza veya altyapı
                sağlayıcılarından kaynaklanan kesintiler yaşanabilir.
                İşletmelerin sunduğu hizmetlerden ve kullanıcılarla
                işletmeler arasındaki anlaşmazlıklardan Plandayım sorumlu
                tutulamaz. Bu madde, tüketici mevzuatından doğan hakları
                sınırlamaz.
            </p>

            <h2>7. Kişisel veriler</h2>
            <p>
                Kişisel verilerin{" "}
                <Link to="/kvkk">KVKK Aydınlatma Metni</Link> ve{" "}
                <Link to="/gizlilik">Gizlilik ve Çerez Politikası</Link>
                {" "}kapsamında işlenir.
            </p>

            <h2>8. Değişiklikler, uygulanacak hukuk ve iletişim</h2>
            <p>
                Bu koşullar gerektiğinde güncellenebilir; güncel sürüm bu
                sayfada yayımlanır. Koşullar Türkiye Cumhuriyeti hukukuna
                tabidir. Tüketicilerin, yasal sınırlar içinde tüketici hakem
                heyetlerine ve tüketici mahkemelerine başvurma hakları
                saklıdır. Sorularını {contactPhrase()} iletebilirsin.
            </p>
        </LegalPage>
    );
}

export default TermsPage;
