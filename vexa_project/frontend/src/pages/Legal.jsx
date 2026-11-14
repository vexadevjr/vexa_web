import LegalDoc, { P, Ul } from '../components/LegalDoc.jsx'
import { useSite } from '../context/SiteContext.jsx'
import { siteConfig } from '../config/siteConfig.js'

const { routes } = siteConfig

function Mail({ email }) {
  return email ? <a className="font-semibold text-vx-accent-text hover:text-white" href={`mailto:${email}`}>{email}</a> : <>iletişim sayfamız</>
}

export function PrivacyPolicy() {
  const { contact } = useSite()
  const sections = [
    { id: 'sorumlu', title: 'Veri sorumlusu', content: (
      <>
        <P>Bu Gizlilik Politikası, Vexstar Development (“Vexstar”, “biz”) tarafından işletilen web sitesi ve hizmetler kapsamında kişisel verilerinizin 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca nasıl işlendiğini açıklar.</P>
        <P>Veri sorumlusu: Vexstar Development. İletişim: <Mail email={contact.email} />.</P>
      </>
    ) },
    { id: 'veriler', title: 'İşlediğimiz kişisel veriler', content: (
      <Ul items={[
        'Hesap bilgileri: ad, e-posta adresi, şifreniz (yalnızca geri döndürülemez şifrelenmiş hâliyle) ve Google veya Discord ile giriş yaptıysanız hesabınızın profil fotoğrafı ve kimlik numarası.',
        'Sipariş bilgileri: seçtiğiniz hizmet, ad, e-posta, Discord kullanıcı adı ve sipariş notunuz.',
        'Destek bilgileri: destek taleplerinizin içeriği, sipariş numarası ve yazışmalar.',
        'Yorumlar: puanınız, yorum metniniz ve yorumda görünen kısaltılmış adınız.',
        'Ziyaret verileri (yalnızca analitik çerez izniyle): IP adresi, ziyaret edilen sayfa, tarayıcı bilgisi ve ziyaret zamanı.',
        'Teknik kayıtlar: güvenlik ve hata ayıklama amacıyla sunucu kayıtları.',
      ]} />
    ) },
    { id: 'amaclar', title: 'İşleme amaçları', content: (
      <Ul items={[
        'Hesabınızı oluşturmak ve oturumunuzu yönetmek.',
        'Siparişlerinizi almak, teslim etmek ve süreci size göstermek.',
        'Destek taleplerinize yanıt vermek.',
        'Yorumları yayınlamak ve müşteri memnuniyetini ölçmek.',
        'Siteyi güvenli tutmak, kötüye kullanımı ve saldırıları önlemek.',
        'İzin vermeniz hâlinde ziyaret istatistikleriyle siteyi geliştirmek.',
        'Yasal yükümlülüklerimizi yerine getirmek.',
      ]} />
    ) },
    { id: 'sebepler', title: 'Hukuki sebepler', content: (
      <P>Verileriniz KVKK m.5/2 kapsamında; sözleşmenin kurulması veya ifası için gerekli olması, hukuki yükümlülüğün yerine getirilmesi ve ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaati (site güvenliği) sebeplerine; analitik ve işlevsel çerezler bakımından ise açık rızanıza dayanılarak işlenir. Rızanızı çerez tercihlerinizden istediğiniz zaman geri çekebilirsiniz.</P>
    ) },
    { id: 'aktarim', title: 'Verilerin aktarımı', content: (
      <>
        <P>Verilerinizi satmayız ve reklam amacıyla üçüncü kişilerle paylaşmayız. Hizmetin sunulması için aşağıdaki hizmet sağlayıcılarla sınırlı ölçüde paylaşılabilir:</P>
        <Ul items={[
          'Barındırma ve sunucu altyapısı sağlayıcısı (siteyi çalıştırmak için).',
          'Veritabanı sağlayıcısı (verilerin saklanması için).',
          'Google ve Discord (yalnızca bu yöntemlerle giriş yapmayı seçerseniz, kendi gizlilik politikalarına tabi olarak).',
          'Ödeme hizmeti sağlayıcıları (ödeme adımında; kart bilgilerinizi biz görmeyiz ve saklamayız).',
          'Yasal talep hâlinde yetkili kamu kurumları.',
        ]} />
        <P>Bu sağlayıcıların bir kısmı yurt dışında bulunabilir; aktarım KVKK m.9 hükümlerine uygun olarak yapılır.</P>
      </>
    ) },
    { id: 'saklama', title: 'Saklama süreleri', content: (
      <Ul items={[
        'Hesap bilgileri: hesabınız silinene kadar.',
        'Sipariş ve destek kayıtları: hizmet geçmişi ve muhasebe yükümlülükleri için gerekli süre boyunca; hesabınızı sildiğinizde kimliğinizden ayrılarak saklanır.',
        'Yorumlar: hesabınızı sildiğinizde veya talep ettiğinizde silinir.',
        'Ziyaret kayıtları: en fazla 400 gün sonra otomatik silinir.',
      ]} />
    ) },
    { id: 'guvenlik', title: 'Güvenlik', content: (
      <P>Verilerinizi korumak için şifrelenmiş bağlantı (HTTPS), şifrelerin geri döndürülemez biçimde saklanması, yetkili erişim kontrolü, oran sınırlama ve düzenli güvenlik önlemleri uyguluyoruz. Hiçbir sistem tamamen risksiz değildir; bir güvenlik ihlali fark ederseniz bize bildirin.</P>
    ) },
    { id: 'haklar', title: 'KVKK kapsamındaki haklarınız', content: (
      <>
        <P>KVKK m.11 uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, aktarıldığı kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, bu işlemlerin aktarıldığı kişilere bildirilmesini isteme, otomatik analiz sonucu aleyhinize bir sonuca itiraz etme ve kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme haklarına sahipsiniz.</P>
        <P>Hesabınızı ve verilerinizi “Hesabım → Ayarlar” bölümünden kendiniz silebilir, diğer taleplerinizi <Mail email={contact.email} /> adresine iletebilirsiniz. Başvurularınız en geç 30 gün içinde yanıtlanır.</P>
      </>
    ) },
    { id: 'cocuklar', title: 'Çocukların gizliliği', content: (
      <P>Hizmetlerimiz 18 yaşından küçüklere yönelik değildir. 18 yaşından küçükseniz hizmeti yalnızca ebeveyn veya vasinizin bilgisi ve onayıyla kullanmalısınız.</P>
    ) },
    { id: 'degisiklik', title: 'Değişiklikler ve çerezler', content: (
      <P>Bu politikayı güncelleyebiliriz; güncel sürüm her zaman bu sayfada yayımlanır ve önemli değişikliklerde sizi bilgilendiririz. Çerez kullanımı için <a className="font-semibold text-vx-accent-text hover:text-white" href={routes.cookies}>Çerez Politikası</a>’nı inceleyebilirsiniz.</P>
    ) },
  ]
  return <LegalDoc path={routes.privacy} sections={sections} />
}

export function Terms() {
  const { contact } = useSite()
  const sections = [
    { id: 'kapsam', title: 'Taraflar ve kapsam', content: (
      <P>Bu Kullanım Şartları, Vexstar Development (“Vexstar”) ile siteyi kullanan veya sipariş veren kişi (“Müşteri”) arasındaki ilişkiyi düzenler. Siteyi kullanarak veya sipariş vererek bu şartları kabul etmiş olursunuz.</P>
    ) },
    { id: 'hizmetler', title: 'Hizmetler ve sipariş', content: (
      <>
        <P>Vexstar; Discord botu, web sitesi ve ilgili yazılım hizmetleri sunar. Hizmetlerin kapsamı, özellikleri ve teslim süresi ilgili ürün sayfasında veya size iletilen teklifte belirtilir.</P>
        <P>Sipariş formunu göndermeniz bir satın alma talebidir; Vexstar’ın siparişi onaylamasıyla sözleşme kurulur. Eksik veya hatalı bilgi, stok/kapasite durumu ya da hukuka aykırılık hâllerinde siparişi reddetme hakkımız saklıdır.</P>
      </>
    ) },
    { id: 'fiyat', title: 'Fiyatlandırma ve ödeme', content: (
      <>
        <P>Fiyatlar Türk Lirası cinsindendir. Sitede gösterilen fiyat, sipariş anında geçerli olan fiyattır; sonradan yapılan fiyat değişiklikleri onaylanmış siparişleri etkilemez.</P>
        <P>Ödeme yöntemi ve zamanlaması sipariş onayında size bildirilir. Kart bilgileriniz Vexstar tarafından saklanmaz. Özel (teklif usulü) işlerde kapsam ve ücret yazılı olarak belirlenir.</P>
      </>
    ) },
    { id: 'teslimat', title: 'Teslimat', content: (
      <P>Teslim süresi, ödemenin tamamlanmasından ve işin başlaması için gereken bilgilerin tarafımıza iletilmesinden itibaren işlemeye başlar. Süreler tahminidir; Müşteri kaynaklı gecikmeler (geç bilgi, geç onay, kapsam değişikliği) teslim süresini uzatır. Teslim; botun sunucunuza kurulması, dosyaların iletilmesi veya sitenin yayına alınması ile gerçekleşir.</P>
    ) },
    { id: 'destek', title: 'Destek, revizyon ve hata düzeltme', content: (
      <P>Teslimden sonra, teslim edilen işte ortaya çıkan hatalar ürün sayfasında belirtilen süre boyunca ücretsiz düzeltilir. Kapsam dışı yeni özellik, tasarım değişikliği veya üçüncü taraf platform (ör. Discord) kaynaklı değişikliklere uyum çalışmaları ayrıca ücretlendirilebilir.</P>
    ) },
    { id: 'iptal', title: 'İptal ve iade', content: (
      <>
        <P>İş başlamadan önce iptal edilen siparişlerde ödenen ücret iade edilir. İş başladıktan sonra yapılan iptallerde, o ana kadar yapılan çalışmanın bedeli düşülerek kalan tutar iade edilir.</P>
        <P>Müşterinin istekleri doğrultusunda kişiselleştirilen ve teslim edilen dijital hizmetlerde, 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği’ndeki istisnalar kapsamında cayma hakkı kullanılamayabilir. Bu durum yasal haklarınızı etkilemez. İade ve iptal talepleriniz için <Mail email={contact.email} /> üzerinden bize ulaşın.</P>
      </>
    ) },
    { id: 'yukumlulukler', title: 'Müşteri yükümlülükleri', content: (
      <Ul items={[
        'Verdiğiniz bilgilerin doğru ve güncel olması ile hesabınızın güvenliğinden siz sorumlusunuz.',
        'Hizmetleri yasalara, Discord Hizmet Şartları ve Topluluk Kurallarına uygun kullanmalısınız.',
        'Hukuka aykırı, hak ihlali yaratan, taciz, dolandırıcılık veya spam amaçlı kullanım yasaktır.',
        'Bize ilettiğiniz içerik, görsel ve materyallerin kullanım hakkına sahip olduğunuzu kabul edersiniz.',
      ]} />
    ) },
    { id: 'fikri', title: 'Fikri mülkiyet', content: (
      <P>Site, logo, tasarım ve yazılım altyapısı Vexstar’a aittir. Teslim edilen işin kullanım hakları, ödemenin tamamlanmasıyla birlikte, sipariş kapsamında belirtilen amaçla Müşteri’ye geçer; Vexstar’ın önceden var olan genel amaçlı bileşen ve kütüphaneleri üzerindeki hakları saklıdır. Anlaşmaya aykırı olmamak kaydıyla, projeyi portföyümüzde tanıtım amacıyla gösterme hakkımız saklıdır; bunu istemiyorsanız önceden bildirin.</P>
    ) },
    { id: 'yorumlar', title: 'Yorumlar', content: (
      <P>Yorumlar yalnızca giriş yapmış kullanıcılar tarafından yazılabilir ve yayımlanmadan önce incelenir. Hakaret, spam, yanıltıcı veya hukuka aykırı içerikler yayınlanmaz. Yayımlanan yorumda adınız kısaltılmış olarak görünür.</P>
    ) },
    { id: 'sorumluluk', title: 'Sorumluluğun sınırı', content: (
      <P>Hizmetler “mevcut hâliyle” sunulur. Yasaların izin verdiği ölçüde; üçüncü taraf platformların (Discord, barındırma sağlayıcıları vb.) kesintileri, politika veya API değişiklikleri, mücbir sebepler ve Müşteri’nin yanlış kullanımından doğan zararlardan Vexstar sorumlu değildir. Her hâlükârda sorumluluğumuz, ilgili sipariş için ödenen ücretle sınırlıdır; bu sınırlama kasıt ve ağır kusur hâllerinde uygulanmaz.</P>
    ) },
    { id: 'fesih', title: 'Hesabın askıya alınması', content: (
      <P>Bu şartların ihlali, güvenliği tehdit eden kullanım veya hukuka aykırılık durumunda hesabı ve hizmeti askıya alma ya da sonlandırma hakkımız saklıdır. Hesabınızı istediğiniz zaman “Hesabım → Ayarlar” bölümünden silebilirsiniz.</P>
    ) },
    { id: 'degisiklik', title: 'Değişiklikler', content: (
      <P>Bu şartları güncelleyebiliriz. Güncel sürüm bu sayfada yayımlanır; yayımlandığı tarihten itibaren yeni siparişler için geçerli olur. Kişisel verilerinizin işlenmesi için <a className="font-semibold text-vx-accent-text hover:text-white" href={routes.privacy}>Gizlilik Politikası</a>’nı inceleyin.</P>
    ) },
    { id: 'hukuk', title: 'Uygulanacak hukuk ve iletişim', content: (
      <>
        <P>Bu şartlar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda, tüketici sıfatındaki Müşteriler için yasal tüketici hakem heyetleri ve tüketici mahkemeleri; diğer Müşteriler için Türkiye Cumhuriyeti mahkemeleri ve icra daireleri yetkilidir.</P>
        <P>Sorularınız için: <Mail email={contact.email} />.</P>
      </>
    ) },
  ]
  return <LegalDoc path={routes.terms} sections={sections} />
}
