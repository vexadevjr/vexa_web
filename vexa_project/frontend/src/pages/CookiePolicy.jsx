import LegalDoc, { P } from '../components/LegalDoc.jsx'
import Button from '../components/Button.jsx'
import { openConsentSettings } from '../lib/consent.js'
import { useSite } from '../context/SiteContext.jsx'
import { siteConfig } from '../config/siteConfig.js'

const { routes } = siteConfig

const rows = [
  { name: 'vx_consent', type: 'Çerez (ilk taraf)', purpose: 'Çerez tercihinizi hatırlar.', kind: 'Zorunlu', time: '180 gün' },
  { name: 'vexstar_token, vexstar_user', type: 'Tarayıcı depolaması', purpose: 'Giriş yaptıysanız oturumunuzu açık tutar ve sayfa yenilendiğinde hesabınızı anında gösterir.', kind: 'Zorunlu', time: 'Çıkış yapana kadar' },
  { name: 'vx_oauth', type: 'Çerez (ilk taraf)', purpose: 'Google veya Discord ile giriş sırasında güvenliği (sahte istek koruması) sağlar.', kind: 'Zorunlu', time: '10 dakika' },
  { name: 'vx_site_cache', type: 'Tarayıcı depolaması', purpose: 'Site içeriğini ve ürünleri saklayarak sayfanın bir sonraki ziyarette anında açılmasını sağlar.', kind: 'İşlevsel', time: 'Yeni veri gelene kadar' },
  { name: 'Ziyaret kaydı', type: 'Sunucu kaydı', purpose: 'Ziyaret edilen sayfa, IP adresi ve tarayıcı bilgisini kaydeder; hangi sayfaların ilgi gördüğünü ölçer. Reklam için kullanılmaz.', kind: 'Analitik', time: '400 gün' },
]

export default function CookiePolicy() {
  const { contact } = useSite()
  const sections = [
    { id: 'nedir', title: 'Çerez nedir?', content: <P>Çerezler ve benzeri tarayıcı depolama teknolojileri, bir web sitesini ziyaret ettiğinizde cihazınıza kaydedilen küçük veri parçalarıdır. Siteyi çalıştırmak, tercihlerinizi hatırlamak ve siteyi geliştirmek için kullanılır.</P> },
    { id: 'liste', title: 'Kullandığımız çerezler', content: (
      <div className="overflow-x-auto -mx-2">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead>
            <tr className="text-white border-b border-vx-line">
              {['Ad', 'Tür', 'Amaç', 'Kategori', 'Süre'].map((h) => <th key={h} className="py-2 px-2 font-semibold">{h}</th>)}
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
    ) },
    { id: 'kategoriler', title: 'Çerez kategorileri', content: (
      <>
        <P><b className="text-white">Zorunlu:</b> Sitenin çalışması için gereklidir ve kapatılamaz. Oturum, güvenlik ve tercihinizin hatırlanmasını sağlar.</P>
        <P><b className="text-white">İşlevsel:</b> Siteyi hızlandırır. Kapatırsanız site yine çalışır, yalnızca her ziyarette içerik yeniden yüklenir.</P>
        <P><b className="text-white">Analitik:</b> Ziyaret istatistikleri içindir. Kapatırsanız ziyaretiniz kaydedilmez.</P>
        <P>Pazarlama veya reklam çerezi kullanmıyoruz.</P>
      </>
    ) },
    { id: 'ucuncu', title: 'Üçüncü taraflar', content: <P>Yazı tipleri Google Fonts üzerinden yüklenir; bu nedenle tarayıcınız Google sunucularına istek gönderir. Google veya Discord ile giriş yapmayı seçerseniz ilgili hizmetin kendi gizlilik ve çerez kuralları geçerli olur. Kişisel verilerin işlenmesi için <a className="font-semibold text-vx-accent-text hover:text-white" href={routes.privacy}>Gizlilik Politikası</a>’na bakın.</P> },
    { id: 'yonetim', title: 'Tercihlerinizi yönetme', content: (
      <>
        <P>Seçimlerinizi istediğiniz zaman değiştirebilirsiniz. Ayrıca tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz; zorunlu çerezleri engellerseniz giriş gibi bazı özellikler çalışmayabilir.</P>
        <Button size="sm" onClick={openConsentSettings}>Çerez Tercihlerini Aç</Button>
      </>
    ) },
    { id: 'iletisim', title: 'İletişim', content: <P>Bu politika hakkındaki sorularınız için {contact.email ? <a className="font-semibold text-vx-accent-text hover:text-white" href={`mailto:${contact.email}`}>{contact.email}</a> : 'iletişim sayfamız'} üzerinden bize ulaşabilirsiniz.</P> },
  ]
  return <LegalDoc path={routes.cookies} sections={sections} />
}
