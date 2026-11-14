import PageHeader from '../components/PageHeader.jsx'
import Button from '../components/Button.jsx'
import { openConsentSettings } from '../lib/consent.js'
import { useSite } from '../context/SiteContext.jsx'
import { siteConfig } from '../config/siteConfig.js'

const rows = [
  { name: 'vx_consent', type: 'Çerez (ilk taraf)', purpose: 'Çerez tercihinizi hatırlar.', kind: 'Zorunlu', time: '180 gün' },
  { name: 'vexstar_token, vexstar_user', type: 'Tarayıcı depolaması', purpose: 'Giriş yaptıysanız oturumunuzu açık tutar ve sayfa yenilendiğinde hesabınızı anında gösterir.', kind: 'Zorunlu', time: 'Çıkış yapana kadar' },
  { name: 'vx_oauth', type: 'Çerez (ilk taraf)', purpose: 'Google veya Discord ile giriş sırasında güvenliği (sahte istek koruması) sağlar.', kind: 'Zorunlu', time: '10 dakika' },
  { name: 'vx_site_cache', type: 'Tarayıcı depolaması', purpose: 'Site içeriğini ve ürünleri saklayarak sayfanın bir sonraki ziyarette anında açılmasını sağlar.', kind: 'İşlevsel', time: 'Yeni veri gelene kadar' },
  { name: 'Ziyaret kaydı', type: 'Sunucu kaydı', purpose: 'Ziyaret edilen sayfa, IP adresi ve tarayıcı bilgisini kaydeder; hangi sayfaların ilgi gördüğünü ölçer. Reklam için kullanılmaz.', kind: 'Analitik', time: '400 gün' },
]

const Section = ({ title, children }) => (
  <section className="rounded-2xl bg-vx-card border border-vx-line p-6 sm:p-8">
    <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
    <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-vx-muted">{children}</div>
  </section>
)

export default function CookiePolicy() {
  const { contact } = useSite()
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title={siteConfig.seo.pages[siteConfig.routes.cookies].h1} description="Son güncelleme: 14 Kasım 2026" />

      <Section title="Çerez nedir?">
        <p>Çerezler ve benzeri tarayıcı depolama teknolojileri, bir web sitesini ziyaret ettiğinizde cihazınıza kaydedilen küçük veri parçalarıdır. Siteyi çalıştırmak, tercihlerinizi hatırlamak ve siteyi geliştirmek için kullanılır.</p>
      </Section>

      <Section title="Hangi çerezleri ve neden kullanıyoruz?">
        <div className="overflow-x-auto -mx-2">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead>
              <tr className="text-white border-b border-vx-line">
                <th className="py-2 px-2 font-semibold">Ad</th>
                <th className="py-2 px-2 font-semibold">Tür</th>
                <th className="py-2 px-2 font-semibold">Amaç</th>
                <th className="py-2 px-2 font-semibold">Kategori</th>
                <th className="py-2 px-2 font-semibold">Süre</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-vx-line/60 last:border-0 align-top">
                  <td className="py-3 px-2 text-white font-mono text-[13px]">{r.name}</td>
                  <td className="py-3 px-2">{r.type}</td>
                  <td className="py-3 px-2">{r.purpose}</td>
                  <td className="py-3 px-2 whitespace-nowrap">{r.kind}</td>
                  <td className="py-3 px-2 whitespace-nowrap">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Çerez kategorileri">
        <p><b className="text-white">Zorunlu:</b> Sitenin çalışması için gereklidir ve kapatılamaz. Oturum, güvenlik ve tercihinizin hatırlanmasını sağlar.</p>
        <p><b className="text-white">İşlevsel:</b> Siteyi hızlandırır. Kapatırsanız site yine çalışır, yalnızca her ziyarette içerik yeniden yüklenir.</p>
        <p><b className="text-white">Analitik:</b> Ziyaret istatistikleri içindir. Kapatırsanız ziyaretiniz kaydedilmez.</p>
        <p>Pazarlama veya reklam çerezi kullanmıyoruz.</p>
      </Section>

      <Section title="Üçüncü taraflar">
        <p>Yazı tipleri Google Fonts üzerinden yüklenir; bu nedenle tarayıcınız Google sunucularına istek gönderir. Google veya Discord ile giriş yapmayı seçerseniz ilgili hizmetin kendi gizlilik ve çerez kuralları geçerli olur.</p>
      </Section>

      <Section title="Tercihlerinizi yönetme">
        <p>Seçimlerinizi istediğiniz zaman değiştirebilirsiniz. Ayrıca tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz; zorunlu çerezleri engellerseniz giriş gibi bazı özellikler çalışmayabilir.</p>
        <Button size="sm" onClick={openConsentSettings}>Çerez Tercihlerini Aç</Button>
      </Section>

      <Section title="İletişim">
        <p>Bu politika hakkındaki sorularınız için {contact.email ? <a className="text-vx-accent-text hover:text-white" href={`mailto:${contact.email}`}>{contact.email}</a> : 'iletişim sayfamız'} üzerinden bize ulaşabilirsiniz. Kişisel verilerinizle ilgili talepleriniz için de aynı kanalı kullanabilirsiniz.</p>
      </Section>
    </div>
  )
}
