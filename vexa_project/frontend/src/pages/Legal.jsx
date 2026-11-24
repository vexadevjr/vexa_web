import LegalDoc, { P, Ul, IdentityTable, Mail, L, useIdentity } from '../components/LegalDoc.jsx'
import { siteConfig } from '../config/siteConfig.js'

const { routes } = siteConfig
const Table = ({ head, rows }) => (
  <div className="overflow-x-auto -mx-2">
    <table className="w-full min-w-[560px] text-left text-[14px]">
      <thead><tr className="text-white border-b border-vx-line">{head.map((h) => <th key={h} className="py-2 px-2 font-semibold">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r) => <tr key={r[0]} className="border-b border-vx-line/60 last:border-0 align-top">{r.map((c, i) => <td key={i} className={`py-3 px-2 ${i === 0 ? 'text-white' : ''}`}>{c}</td>)}</tr>)}</tbody>
    </table>
  </div>
)

// ───────────────────────── KVKK Aydınlatma Metni ─────────────────────────
export function Kvkk() {
  const { email } = useIdentity()
  const sections = [
    { id: 'sorumlu', title: 'Veri sorumlusu', content: (<><P>6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) m.10 ve Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla aşağıda bilgileri yer alan işletme (“Vexstar”) tarafından işlenmektedir.</P><IdentityTable /></>) },
    { id: 'kategoriler', title: 'İşlenen kişisel veriler', content: (
      <Table head={['Kategori', 'Veriler', 'Toplandığı yer']} rows={[
        ['Kimlik', 'Ad, soyad (kullanıcı adı)', 'Üyelik, sipariş ve iletişim formları'],
        ['İletişim', 'E-posta adresi, Discord kullanıcı adı', 'Üyelik, sipariş ve destek formları'],
        ['Müşteri işlem', 'Sipariş numarası, seçilen hizmet, tutar, sipariş notu, destek yazışmaları, sipariş durum geçmişi', 'Sipariş ve destek süreçleri'],
        ['İşlem güvenliği', 'Şifrenizin geri döndürülemez özeti (hash), oturum bilgisi, IP adresi, sunucu kayıtları', 'Giriş ve site kullanımı'],
        ['Hesap bağlantısı', 'Google veya Discord ile girişte: hesap kimliği, ad, doğrulanmış e-posta, profil fotoğrafı bağlantısı', 'Google / Discord oturum açma'],
        ['Pazarlama / ziyaret (yalnızca izninizle)', 'Ziyaret edilen sayfa, IP adresi, tarayıcı ve cihaz bilgisi, ziyaret zamanı', 'Analitik çerez tercihi'],
        ['Görüş ve yorum', 'Puan, yorum metni, görünen kısaltılmış ad', 'Yorum formu'],
        ['Hizmet teslim bilgileri', 'Discord sunucu ID’si, bot adı, bot logosu, sunucu davet bağlantısı ve (bot kurulumu siparişlerinde) bot token. Bot token şifreli saklanır, sipariş teslim edildiğinde veya iptal edildiğinde otomatik silinir.', 'Sipariş formu'],
        ['Hukuki işlem', 'Mesafeli satış sözleşmesi ve kullanım şartları onay zamanı ve sürümü', 'Sipariş ve kayıt onayı'],
      ]} />
    ) },
    { id: 'amac', title: 'İşleme amaçları', content: (<Ul items={[
      'Üyelik hesabınızı oluşturmak, kimliğinizi doğrulamak ve oturumunuzu yönetmek',
      'Sipariş taleplerinizi almak, sözleşmeyi kurmak ve ifa etmek, siparişinizi teslim etmek ve süreci size göstermek',
      'Destek ve iletişim taleplerinize yanıt vermek',
      'Yorumları incelemek, yayımlamak ve müşteri memnuniyetini hesaplamak',
      'Site ve hesap güvenliğini sağlamak, kötüye kullanımı ve saldırıları önlemek',
      'İzin vermeniz hâlinde ziyaret istatistikleri ile siteyi geliştirmek',
      'Yasal yükümlülüklerimizi (muhasebe, vergi, uyuşmazlık süreçleri) yerine getirmek ve hak taleplerinde delil olarak saklamak',
    ]} />) },
    { id: 'sebep', title: 'Hukuki sebepler', content: (<><P>Verileriniz KVKK m.5/2 uyarınca şu hukuki sebeplere dayanılarak işlenir:</P><Ul items={[
      'Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (m.5/2-c): üyelik, sipariş ve teslimat süreçleri',
      'Hukuki yükümlülüğün yerine getirilmesi (m.5/2-ç): vergi ve ticaret mevzuatındaki saklama yükümlülükleri',
      'Bir hakkın tesisi, kullanılması veya korunması (m.5/2-e): olası uyuşmazlıklarda delil olarak saklama',
      'İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaati (m.5/2-f): site güvenliği ve kötüye kullanımın önlenmesi',
      'Açık rıza (m.5/1): isteğe bağlı analitik ve işlevsel çerezler. Rızanızı çerez tercihlerinizden dilediğiniz zaman geri çekebilirsiniz.',
    ]} /></>) },
    { id: 'yontem', title: 'Toplama yöntemi', content: (<P>Verileriniz; web sitemizdeki formlar (kayıt, sipariş, iletişim, yorum), Google ve Discord ile oturum açma, çerezler ve sunucu kayıtları aracılığıyla, tamamen veya kısmen otomatik yollarla elektronik ortamda toplanır.</P>) },
    { id: 'aktarim', title: 'Verilerin aktarılması', content: (<><P>Verileriniz satılmaz ve reklam amacıyla paylaşılmaz. Yukarıdaki amaçlarla sınırlı olmak üzere şu alıcı gruplarına aktarılabilir:</P><Ul items={[
      'Barındırma, sunucu ve veritabanı hizmet sağlayıcıları (hizmetin sunulması)',
      'Google ve Discord (yalnızca bu yöntemle giriş yapmanız hâlinde, kendi gizlilik politikalarına tabi olarak)',
      'Ödeme hizmeti sağlayıcıları ve bankalar (ödeme adımında; kart bilgileriniz tarafımızca görülmez ve saklanmaz)',
      'Yetkili kamu kurum ve kuruluşları, mahkemeler ve icra daireleri (yasal talep hâlinde)',
      'Hukuk, muhasebe ve mali müşavirlik hizmeti aldığımız profesyonel danışmanlar',
    ]} /><P>Hizmet sağlayıcılarımızın sunucuları yurt dışında bulunabilir. Yurt dışına aktarım KVKK m.9 uyarınca; yeterlilik kararı, standart sözleşme gibi uygun güvenceler veya mevzuatta öngörülen diğer şartlar çerçevesinde gerçekleştirilir.</P></>) },
    { id: 'saklama', title: 'Saklama ve imha', content: (<Ul items={[
      'Hesap bilgileri: hesabınız silinene kadar; silmeden sonra yasal saklama yükümlülüğü olmayan veriler silinir veya anonim hâle getirilir.',
      'Sipariş ve ödeme kayıtları: ilgili mevzuatta öngörülen saklama süreleri boyunca (vergi ve ticaret mevzuatı kapsamında genellikle 5-10 yıl); hesap silinirse kimliğinizden ayrılarak saklanır.',
      'Destek kayıtları: hizmet geçmişi ve olası uyuşmazlıklar için gerekli süre boyunca; hesap silinirse kimliğinizden ayrılır.',
      'Yorumlar: hesabınızı sildiğinizde veya talep ettiğinizde silinir.',
      'Bot token gibi hassas teslimat bilgileri: şifreli saklanır; sipariş teslim edildiğinde veya iptal edildiğinde silinir.',
      'Ziyaret (analitik) kayıtları: en geç 400 gün sonra otomatik silinir.',
      'Saklama süresi sona eren veriler, periyodik imha süreçlerinde silinir, yok edilir veya anonim hâle getirilir.',
    ]} />) },
    { id: 'haklar', title: 'KVKK m.11 kapsamındaki haklarınız', content: (<><P>Veri sahibi olarak şu haklara sahipsiniz:</P><Ul items={[
      'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
      'İşlenmişse buna ilişkin bilgi talep etme',
      'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme',
      'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme',
      'Eksik veya yanlış işlenmişse düzeltilmesini isteme',
      'KVKK m.7 çerçevesinde silinmesini veya yok edilmesini isteme',
      'Düzeltme, silme ve yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme',
      'İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonuç doğmasına itiraz etme',
      'Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme',
    ]} /></>) },
    { id: 'basvuru', title: 'Başvuru yöntemi', content: (<><P>Haklarınıza ilişkin taleplerinizi, kimliğinizi tespit edici bilgiler ve talebinizin konusunu açıkça belirterek; yazılı olarak yukarıda belirtilen adrese, varsa KEP adresimize veya sistemimizde kayıtlı e-posta adresinizle <Mail email={email} /> üzerinden iletebilirsiniz. Talepleriniz, niteliğine göre en geç 30 gün içinde ücretsiz olarak sonuçlandırılır; işlemin ayrıca bir maliyet gerektirmesi hâlinde Kişisel Verileri Koruma Kurulu’nca belirlenen tarife uygulanabilir.</P><P>Başvurunuza verilen yanıtı yetersiz bulmanız veya süresinde yanıt alamamanız hâlinde, öğrenme tarihinden itibaren 30 gün ve her hâlde başvuru tarihinden itibaren 60 gün içinde Kişisel Verileri Koruma Kurulu’na şikâyette bulunma hakkınız saklıdır.</P><P>Hesabınızı ve hesaba bağlı verilerinizi, “Hesabım → Ayarlar” bölümünden de kendiniz silebilirsiniz.</P></>) },
    { id: 'guvenlik', title: 'Veri güvenliği', content: (<P>KVKK m.12 uyarınca verilerinizin hukuka aykırı işlenmesini ve erişilmesini önlemek için şifrelenmiş bağlantı (HTTPS), şifrelerin geri döndürülemez biçimde saklanması, yetki bazlı erişim, istek sınırlama, güvenlik başlıkları ve düzenli güvenlik kontrolleri gibi teknik ve idari tedbirler uygulanmaktadır. Bir ihlal fark ederseniz lütfen derhal bize bildirin.</P>) },
    { id: 'guncelleme', title: 'Güncellemeler', content: (<P>Bu metin mevzuat veya hizmetlerimizdeki değişikliklere göre güncellenebilir; güncel sürüm bu sayfada yayımlanır. İlgili diğer belgeler: <L to={routes.privacy}>Gizlilik Politikası</L>, <L to={routes.cookies}>Çerez Politikası</L>.</P>) },
  ]
  return <LegalDoc path={routes.kvkk} sections={sections} />
}

// ───────────────────────── Gizlilik Politikası ─────────────────────────
export function PrivacyPolicy() {
  const { email } = useIdentity()
  const sections = [
    { id: 'kapsam', title: 'Kapsam', content: (<><P>Bu politika, Vexstar web sitesini ziyaret ettiğinizde veya hizmetlerimizden yararlandığınızda hangi bilgilerin toplandığını ve nasıl kullanıldığını sade bir dille açıklar. Kişisel verilerin KVKK kapsamındaki ayrıntılı işlenme koşulları için <L to={routes.kvkk}>KVKK Aydınlatma Metni</L>’ni inceleyin.</P><IdentityTable /></>) },
    { id: 'toplanan', title: 'Hangi bilgileri topluyoruz?', content: (<Ul items={[
      'Hesap bilgileri: ad, e-posta, şifre (yalnızca geri döndürülemez şifrelenmiş hâliyle); Google/Discord ile girişte hesap kimliği ve profil fotoğrafı',
      'Sipariş bilgileri: seçtiğiniz hizmet, ad, e-posta, Discord kullanıcı adı, sipariş notu ve hizmete göre istenen kurulum bilgileri (Discord sunucu ID’si, bot adı/logosu, davet bağlantısı, bot token)',
      'Destek bilgileri: taleplerinizin içeriği ve yazışmalarımız',
      'Yorumlar: puanınız ve yorum metniniz (adınız “Ahmet Y.” biçiminde kısaltılarak gösterilir)',
      'Ziyaret bilgileri (yalnızca analitik çerezine izin verirseniz): sayfa, IP adresi, tarayıcı bilgisi, zaman',
      'Güvenlik kayıtları: saldırı ve kötüye kullanımı önlemek için gerekli teknik kayıtlar',
    ]} />) },
    { id: 'kullanim', title: 'Bilgileri nasıl kullanıyoruz?', content: (<Ul items={['Hesabınızı ve siparişlerinizi yönetmek, hizmeti teslim etmek', 'Destek taleplerinize yanıt vermek', 'Yasal yükümlülüklerimizi yerine getirmek', 'Siteyi güvenli tutmak', 'İzniniz varsa siteyi iyileştirmek için anonimleştirilmiş istatistikler üretmek']} />) },
    { id: 'pazarlama', title: 'Pazarlama iletileri', content: (<P>İzniniz olmadan size ticari elektronik ileti (reklam, kampanya e-postası) göndermeyiz. Sipariş ve destek süreciyle ilgili bilgilendirmeler ticari ileti sayılmaz. Verilerinizi reklam amacıyla üçüncü kişilere satmaz veya kiralamayız.</P>) },
    { id: 'ucuncu', title: 'Üçüncü taraf hizmetler', content: (<P>Site; barındırma ve veritabanı sağlayıcıları, Google Fonts (yazı tipi), Google ve Discord (isteğe bağlı oturum açma) ve ödeme hizmeti sağlayıcılarının altyapısını kullanır. Bu hizmetlerin kendi gizlilik politikaları geçerlidir. Sitemizden dışarıdaki bağlantılara verdiğimiz yönlendirmelerin içeriğinden sorumlu değiliz.</P>) },
    { id: 'saklama', title: 'Saklama süresi', content: (<P>Verileriniz, işleme amacının gerektirdiği ve mevzuatın öngördüğü süre boyunca saklanır; ayrıntılar KVKK Aydınlatma Metni’nin “Saklama ve imha” bölümündedir. Hesabınızı dilediğiniz zaman “Hesabım → Ayarlar” bölümünden silebilirsiniz.</P>) },
    { id: 'haklariniz', title: 'Haklarınız', content: (<P>KVKK m.11 uyarınca verilerinize erişme, düzeltme, silme ve itiraz gibi haklara sahipsiniz. Taleplerinizi <Mail email={email} /> adresine iletebilirsiniz; başvuru yöntemleri için <L to={routes.kvkk}>KVKK Aydınlatma Metni</L>’ne bakın.</P>) },
    { id: 'guvenlik', title: 'Güvenlik', content: (<P>Verilerinizi korumak için HTTPS, güvenli şifre saklama, sıkı tarayıcı güvenlik başlıkları (CSP, HSTS, İzin Politikası), istek sınırlama ve yetkilendirme kontrolleri kullanıyoruz. Hiçbir sistem tamamen risksiz değildir; bir güvenlik açığı fark ederseniz bize bildirin.</P>) },
    { id: 'cocuklar', title: 'Çocukların gizliliği', content: (<P>Hizmetlerimiz 18 yaşından küçüklere yönelik değildir. 18 yaşından küçükseniz hizmeti yalnızca ebeveyn veya vasinizin bilgisi ve onayıyla kullanabilirsiniz.</P>) },
    { id: 'degisiklik', title: 'Değişiklikler', content: (<P>Politikayı güncelleyebiliriz; güncel sürüm her zaman bu sayfadadır ve önemli değişiklikleri sizi bilgilendirerek duyururuz. Çerezler için <L to={routes.cookies}>Çerez Politikası</L>’na bakın.</P>) },
  ]
  return <LegalDoc path={routes.privacy} sections={sections} />
}

// ───────────────────────── Kullanım Şartları ─────────────────────────
export function Terms() {
  const { email } = useIdentity()
  const sections = [
    { id: 'kapsam', title: 'Taraflar ve kapsam', content: (<><P>Bu Kullanım Şartları, aşağıdaki işletme (“Vexstar”) ile siteyi kullanan veya sipariş veren kişi (“Müşteri”) arasındaki ilişkiyi düzenler. Siteyi kullanarak veya hesap oluşturarak bu şartları kabul etmiş olursunuz.</P><IdentityTable /></>) },
    { id: 'hizmet', title: 'Hizmetler', content: (<P>Vexstar; Discord botu, web sitesi ve ilgili yazılım hizmetleri sunar. Hizmetin kapsamı, özellikleri, fiyatı ve teslim süresi ilgili ürün sayfasında veya size iletilen teklifte yer alır. Sitede yer alan bilgiler yanlışlık, güncelleme veya teknik hata nedeniyle değişebilir; sipariş onayından önce bildirilen bedel ve kapsam esas alınır.</P>) },
    { id: 'siparis', title: 'Sipariş ve sözleşmenin kurulması', content: (<><P>Sipariş formunun gönderilmesi bir satın alma talebidir. Müşteri, siparişten önce <L to={routes.distance}>Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu</L>’nu okuyup onaylar. Vexstar’ın siparişi onaylamasıyla sözleşme kurulur; eksik/hatalı bilgi, kapasite veya hukuka aykırılık hâllerinde siparişi reddetme hakkı saklıdır.</P><P>Fiyatlar Türk Lirası’dır. Ödeme yöntemi ve zamanı sipariş onayında bildirilir; kart bilgileri Vexstar tarafından saklanmaz.</P></>) },
    { id: 'teslim', title: 'Teslimat, destek ve hata düzeltme', content: (<P>Teslim süresi ürün sayfasında belirtilir ve Müşteri’nin gerekli bilgi ve materyalleri iletmesiyle işlemeye başlar. Müşteri kaynaklı gecikmeler süreyi uzatır. Teslimden sonra ortaya çıkan hatalar ürün sayfasında belirtilen kapsamda ücretsiz düzeltilir; kapsam dışı yeni özellikler ve üçüncü taraf platform değişikliklerine uyum çalışmaları ayrıca ücretlendirilebilir.</P>) },
    { id: 'iptal', title: 'İptal, iade ve cayma', content: (<P>İptal, iade ve cayma hakkına ilişkin esaslar <L to={routes.refund}>İptal ve İade Koşulları</L> ve <L to={routes.distance}>Mesafeli Satış Sözleşmesi</L> sayfalarında düzenlenmiştir; tüketici sıfatındaki Müşteri’nin kanundan doğan hakları saklıdır.</P>) },
    { id: 'yukumluluk', title: 'Müşteri yükümlülükleri', content: (<Ul items={[
      'Verdiğiniz bilgilerin doğru ve güncel olması ile hesabınızın güvenliğinden siz sorumlusunuz.',
      'Hizmetleri yürürlükteki mevzuata, Discord Hizmet Şartları ve Topluluk Kurallarına uygun kullanmalısınız.',
      'Hukuka aykırı, üçüncü kişilerin haklarını ihlal eden, taciz, dolandırıcılık veya spam amaçlı kullanım yasaktır.',
      'Bize ilettiğiniz içerik ve materyaller üzerinde kullanım hakkına sahip olduğunuzu kabul edersiniz.',
    ]} />) },
    { id: 'fikri', title: 'Fikri mülkiyet', content: (<P>Site, logo, tasarım ve yazılım altyapısı Vexstar’a aittir. Teslim edilen işin kullanım hakları, bedelin tamamen ödenmesiyle birlikte sipariş kapsamında belirtilen amaçla Müşteri’ye geçer; Vexstar’ın önceden var olan genel amaçlı bileşen ve kütüphaneleri üzerindeki hakları saklıdır. Önceden yazılı itirazınız yoksa, teslim edilen projeyi portföyümüzde tanıtım amacıyla gösterebiliriz (müşteri bilgisi paylaşımı için ayrıca izin alınır).</P>) },
    { id: 'yorum', title: 'Yorumlar', content: (<P>Yorumlar yalnızca giriş yapmış kullanıcılar tarafından yazılabilir ve yayımlanmadan önce incelenir. Hakaret, spam, yanıltıcı veya hukuka aykırı içerikler yayımlanmaz. Yayımlanan yorumda adınız kısaltılarak gösterilir. Müşteri memnuniyeti oranı yalnızca yayımlanmış yorumların yıldız puanlarından hesaplanır.</P>) },
    { id: 'sorumluluk', title: 'Sorumluluğun sınırı', content: (<P>Yasaların izin verdiği ölçüde; üçüncü taraf platformların (Discord, barındırma sağlayıcıları vb.) kesintileri, politika veya API değişiklikleri, mücbir sebepler ve Müşteri’nin hatalı kullanımından doğan zararlardan Vexstar sorumlu değildir. Vexstar’ın sorumluluğu, ilgili sipariş için ödenen bedelle sınırlıdır; bu sınırlama kasıt ve ağır kusur ile tüketici mevzuatının emredici hükümlerini etkilemez.</P>) },
    { id: 'fesih', title: 'Hesabın askıya alınması', content: (<P>Şartların ihlali, güvenliği tehdit eden kullanım veya hukuka aykırılık hâlinde hesabı ve hizmeti askıya alma veya sonlandırma hakkımız saklıdır. Hesabınızı istediğiniz zaman “Hesabım → Ayarlar” bölümünden silebilirsiniz.</P>) },
    { id: 'hukuk', title: 'Uygulanacak hukuk ve uyuşmazlık', content: (<><P>Bu şartlar Türkiye Cumhuriyeti hukukuna tabidir. Tüketici sıfatındaki Müşteri’ler, uyuşmazlıklar için her yıl Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar dahilinde yerleşim yerindeki veya işlemin yapıldığı yerdeki tüketici hakem heyetlerine, aşan değerlerde tüketici mahkemelerine başvurabilir. Diğer Müşteri’ler bakımından Türkiye Cumhuriyeti mahkemeleri ve icra daireleri yetkilidir.</P><P>Sorularınız için: <Mail email={email} />.</P></>) },
    { id: 'degisiklik', title: 'Değişiklikler', content: (<P>Şartlar güncellenebilir; yayımlandığı tarihten itibaren yeni siparişler için geçerli olur. Kişisel verileriniz için <L to={routes.privacy}>Gizlilik Politikası</L> ve <L to={routes.kvkk}>KVKK Aydınlatma Metni</L>’ne bakın.</P>) },
  ]
  return <LegalDoc path={routes.terms} sections={sections} />
}

// ───────────────────────── Mesafeli Satış Sözleşmesi ─────────────────────────
export function DistanceSales() {
  const sections = [
    { id: 'taraflar', title: 'Taraflar', content: (<><P><b className="text-white">SATICI / SAĞLAYICI:</b></P><IdentityTable /><P><b className="text-white">ALICI (TÜKETİCİ):</b> Sipariş formunda ad, e-posta ve (varsa) Discord kullanıcı adı bilgilerini bildiren kişidir. Alıcı bilgileri sipariş kaydında yer alır.</P></>) },
    { id: 'konu', title: 'Sözleşmenin konusu', content: (<P>Bu sözleşme, Alıcı’nın Satıcı’nın internet sitesi üzerinden sipariş verdiği Discord botu, web sitesi veya benzeri yazılım hizmetinin sunulmasına ve satışına ilişkin olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun, Mesafeli Sözleşmeler Yönetmeliği ve ilgili mevzuat uyarınca tarafların hak ve yükümlülüklerini düzenler.</P>) },
    { id: 'nitelik', title: 'Hizmetin temel nitelikleri', content: (<P>Hizmetin adı, kapsamı, özellikleri, vergiler dahil toplam bedeli ve teslim süresi, Alıcı’nın siparişi onaylamadan önce gördüğü ürün sayfasında ve sipariş özetinde yer alır ve bu sözleşmenin ayrılmaz parçasıdır. Hizmetler Alıcı’nın istekleri ve ihtiyaçları doğrultusunda hazırlanan, dijital ortamda sunulan yazılım hizmetleridir.</P>) },
    { id: 'bedel', title: 'Bedel ve ödeme', content: (<P>Hizmet, sipariş sırasında seçilen abonelik süresi (1, 3, 6 veya 12 ay) için sunulur; toplam bedel aylık fiyat ile süre çarpılarak hesaplanır ve sipariş özetinde gösterilir. Süre sonunda hizmet otomatik yenilenmez, otomatik ödeme alınmaz. Sipariş özetinde gösterilen tutar, Alıcı’nın ödeyeceği toplam bedeldir; ek bir ücret varsa sipariş öncesinde açıkça belirtilir. Ödeme yöntemi ve zamanlaması sipariş onayında Alıcı’ya bildirilir. Kart bilgileri Satıcı tarafından saklanmaz.</P>) },
    { id: 'ifa', title: 'İfa (teslim) şekli ve süresi', content: (<P>Hizmet, elektronik ortamda; bot kurulumu, dosya/erişim teslimi veya sitenin yayına alınması suretiyle ifa edilir. Teslim süresi ürün sayfasında belirtilir ve Alıcı’nın gerekli bilgi/materyali iletmesiyle işlemeye başlar. Aksi kararlaştırılmadıkça Satıcı edimini siparişin onaylanmasından itibaren 30 günü aşmayacak şekilde yerine getirir. Alıcı kaynaklı gecikmeler süreyi uzatır.</P>) },
    { id: 'cayma', title: 'Cayma hakkı', content: (<><P>Alıcı, hizmet sözleşmelerinde sözleşmenin kurulduğu tarihten itibaren 14 (on dört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkının kullanıldığına dair bildirim, bu süre içinde <b className="text-white">“Hesabım → Siparişlerim”</b> bölümünden, destek formu üzerinden veya Satıcı’nın e-posta/KEP adresine yazılı olarak yapılabilir.</P><P>Alıcı’nın açık talebi ve onayıyla cayma süresi dolmadan hizmetin ifasına başlanmışsa, cayma hâlinde Alıcı, cayma bildirimine kadar ifa edilen kısmın bedelini ödemekle yükümlüdür.</P></>) },
    { id: 'istisna', title: 'Cayma hakkının kullanılamayacağı hâller', content: (<><P>Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesi uyarınca; Alıcı’nın istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mal ve hizmetler ile cayma süresi sona ermeden önce Alıcı’nın onayıyla ifasına başlanan hizmetler ve elektronik ortamda anında ifa edilen hizmetler bakımından cayma hakkı kullanılamaz.</P><P>Alıcı, siparişi onaylayarak, hizmetin kendi istekleri doğrultusunda hazırlanacağını ve bu kapsamda cayma hakkının sınırlı olabileceğini bildiğini beyan eder. Bu hüküm, hizmetin ayıplı ifa edilmesi hâlinde Alıcı’nın kanundan doğan haklarını etkilemez; ayrıntılar <L to={routes.refund}>İptal ve İade Koşulları</L> sayfasındadır.</P></>) },
    { id: 'iade', title: 'İade ve ödeme', content: (<P>Cayma veya iptal hâlinde iade edilmesi gereken bedel, bildirimin Satıcı’ya ulaştığı tarihten itibaren en geç 14 gün içinde, Alıcı’nın ödemede kullandığı yöntemle iade edilir.</P>) },
    { id: 'ayip', title: 'Ayıplı hizmet', content: (<P>Hizmetin sözleşmeye aykırı veya ayıplı ifa edilmesi hâlinde Alıcı, 6502 sayılı Kanun’un ayıplı hizmete ilişkin hükümlerinden doğan seçimlik haklarını (ücretsiz yeniden ifa, bedel indirimi, sözleşmeden dönme gibi) kullanabilir. Alıcı, ayıbı fark ettiğinde Satıcı’ya gecikmeden bildirir.</P>) },
    { id: 'beyan', title: 'Alıcı beyanı', content: (<P>Alıcı, sipariş vermeden önce bu sözleşmeyi, ön bilgilendirme koşullarını (hizmetin temel nitelikleri, toplam bedel, ödeme ve teslim şekli, cayma hakkı ve kullanım şartları), <L to={routes.refund}>İptal ve İade Koşulları</L>’nı ve <L to={routes.kvkk}>KVKK Aydınlatma Metni</L>’ni okuyup anladığını ve elektronik ortamda onayladığını kabul eder. Onay zamanı ve sürüm bilgisi sipariş kaydında saklanır.</P>) },
    { id: 'uyusmazlik', title: 'Uyuşmazlıkların çözümü', content: (<P>Bu sözleşmeden doğan uyuşmazlıklarda, her yıl Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar dahilinde Alıcı’nın yerleşim yerindeki veya işlemin yapıldığı yerdeki tüketici hakem heyetleri, bu sınırları aşan değerlerde tüketici mahkemeleri yetkilidir.</P>) },
  ]
  return <LegalDoc path={routes.distance} sections={sections} />
}

// ───────────────────────── İptal ve İade ─────────────────────────
export function Refund() {
  const { email } = useIdentity()
  const sections = [
    { id: 'genel', title: 'Genel bilgi', content: (<P>Vexstar hizmetleri, Alıcı’nın isteklerine göre hazırlanan dijital hizmetlerdir. Bu sayfa, siparişinizi hangi aşamada nasıl iptal edebileceğinizi ve ücret iadesinin nasıl yapıldığını özetler. Tüketici sıfatındaki Alıcı’nın 6502 sayılı Kanun’dan doğan hakları her zaman saklıdır. Ayrıntılar için <L to={routes.distance}>Mesafeli Satış Sözleşmesi</L>’ne bakın.</P>) },
    { id: 'baslamadan', title: 'Çalışma başlamadan önce', content: (<P>Siparişiniz “Sipariş alındı” veya “Onaylandı” aşamasındaysa, <b className="text-white">Hesabım → Siparişlerim</b> bölümündeki “Siparişi iptal et” butonuyla kendiniz iptal edebilirsiniz. İş başlamadığı için ödenen bedelin tamamı iade edilir.</P>) },
    { id: 'baslayinca', title: 'Çalışma başladıktan sonra', content: (<P>Sipariş “Hazırlanıyor” aşamasına geçtikten sonra iptal talebinizi destek talebi olarak iletin. Cayma hakkı kapsamında talep geçerliyse, iptal bildirimine kadar yapılan çalışmanın bedeli düşülerek kalan tutar iade edilir. Alıcı’nın isteklerine göre özel olarak hazırlanan ve teslim edilen çalışmalarda yasal istisnalar nedeniyle cayma hakkı kullanılamayabilir.</P>) },
    { id: 'teslim', title: 'Teslimden sonra', content: (<P>Teslim edilen hizmette sözleşmeye aykırılık veya ayıp varsa bize bildirin: önce ücretsiz düzeltme/yeniden ifa sağlanır. Düzeltme mümkün değilse veya makul sürede yapılmazsa, kanundan doğan haklarınız (bedel indirimi, sözleşmeden dönme) saklıdır.</P>) },
    { id: 'odeme', title: 'Ücret iadesi', content: (<P>İade onaylandığında bedel, en geç 14 gün içinde ödemenin yapıldığı yöntemle iade edilir. Bankanızın işlem süresi bu süreye dahil değildir.</P>) },
    { id: 'basvuru', title: 'Nasıl başvurulur?', content: (<Ul items={['Hesabım → Siparişlerim → “Siparişi iptal et” (uygun aşamalarda)', 'Hesabım → Siparişlerim → “Bu sipariş için destek al” ile destek talebi', `E-posta: ${email || 'iletişim sayfasındaki adres'}`]} />) },
    { id: 'itiraz', title: 'Uyuşmazlık', content: (<P>Çözemediğimiz uyuşmazlıklarda, her yıl ilan edilen parasal sınırlar dahilinde tüketici hakem heyetlerine veya tüketici mahkemelerine başvurabilirsiniz.</P>) },
  ]
  return <LegalDoc path={routes.refund} sections={sections} />
}
