// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the whole application.
// Links, brand colours, contact details, prices, FAQ and page content live here.
// The backend seed script (backend/seed.js) also reads `catalog` from this file.
//
// This file must stay plain data: no imports, no JSX, no browser APIs.
//
// !! Values marked PLACEHOLDER (prices, contact details, guarantees, portfolio)
// !! are examples. Everything here can also be edited live from the admin panel (/admin).
// !! Reviews and satisfaction figures are NEVER stored here: they come from real customer reviews.
// !! Replace every PLACEHOLDER with your real information before going live.
// ─────────────────────────────────────────────────────────────────────────────
export const siteConfig = {
  // SEO: used by the server (meta tags, sitemap, structured data) and by the client on page changes.
  seo: {
    siteUrl: 'https://vexstar.com.tr',
    siteName: 'Vexstar',
    legalName: 'Vexstar Development',
    locale: 'tr_TR',
    image: '/og-image.jpg',
    imageAlt: 'Vexstar: Discord botu ve web sitesi yaptırma',
    pages: {
      '/': {
        title: 'Vexstar | Discord Bot Yaptırma ve Web Sitesi Tasarımı',
        description: 'Discord botu ve web sitesi yaptırın. Moderasyon, ekonomi, müzik, ticket botları ile kurumsal ve e-ticaret siteleri. Net fiyat, hızlı teslimat, 7/24 destek.',
        h1: 'Sunucunuz ve markanız için Discord botu ve web sitesi.',
        changefreq: 'weekly',
        priority: '1.0',
      },
      '/discord-botlari': {
        title: 'Discord Bot Yaptırma | Moderasyon, Müzik, Ekonomi Botu – Vexstar',
        description: 'Sunucunuza özel Discord botları: moderasyon, ticket, müzik, ekonomi ve özel komutlar. Hazır paketler, net fiyat, hızlı teslimat ve teslim sonrası ücretsiz hata düzeltme.',
        h1: 'Discord Bot Yaptırma: Hazır Bot Paketleri',
        changefreq: 'weekly',
        priority: '0.9',
      },
      '/web-gelistirme': {
        title: 'Web Sitesi Yaptırma | Kurumsal ve E-Ticaret Web Tasarım – Vexstar',
        description: 'Mobil uyumlu, hızlı ve SEO’ya hazır kurumsal tanıtım siteleri ile e-ticaret web siteleri. Hazır paketler, net fiyat ve profesyonel teslimat.',
        h1: 'Web Sitesi Yaptırma: Kurumsal ve E-Ticaret Paketleri',
        changefreq: 'weekly',
        priority: '0.9',
      },
      '/portfoy': {
        title: 'Projeler ve Referanslar | Discord Bot & Web Siteleri – Vexstar',
        description: 'Vexstar’ın tamamladığı Discord botu, web sitesi ve sunucu projelerinden seçmeler.',
        h1: 'Projeler ve Referanslar',
        changefreq: 'monthly',
        priority: '0.6',
      },
      '/iletisim': {
        title: 'İletişim ve Destek | Ücretsiz Teklif Al – Vexstar',
        description: 'Discord botu veya web sitesi için ücretsiz teklif alın, sipariş ve teknik destek taleplerinizi iletin. Taleplere 24 saat içinde dönüş yapılır.',
        h1: 'İletişim ve Destek',
        changefreq: 'monthly',
        priority: '0.7',
      },
    },
  },

  brand: {
    name: 'Vexstar Development',
    // Applied as CSS variables at start-up (see src/lib/brand.js) and used by Tailwind (`bg-vx-card`, ...).
    colors: {
      bg: '#08090f',
      bgEnd: '#0f101a',
      surface: '#0c0d14',
      card: '#131422',
      line: '#201b3a',
      accent: '#4f46e5',
      accentHover: '#4338ca',
      accentSoft: '#a5b4fc',
      accentText: '#818cf8',
      muted: '#94a3b8',
    },
  },

  // PLACEHOLDER contact details
  contact: {
    email: 'destek@vexstardevelopment.com',
    discord: 'Vexstar Development Discord sunucusu',
    hours: 'Destek kanalı 7/24 açıktır. Sipariş ve teklif yanıtları 09:00 – 24:00 arası verilir.',
    location: 'Türkiye',
  },

  links: {
    discord: 'https://discord.gg', // PLACEHOLDER: community invite
    support: 'https://discord.gg', // PLACEHOLDER: support channel
    payment: '', // PLACEHOLDER: payment / invoice link shown after an order (leave empty to hide)
    github: 'https://github.com',
    youtube: 'https://youtube.com',
    x: 'https://x.com',
  },

  currency: { code: 'TRY', symbol: '₺', locale: 'tr-TR' },

  // Client-side routes
  routes: {
    home: '/',
    bots: '/discord-botlari',
    web: '/web-gelistirme',
    portfolio: '/portfoy',
    contact: '/iletisim',
    panel: '/panel',
    account: '/hesap',
    orders: '/hesap/siparislerim',
    tickets: '/hesap/destek',
    settings: '/hesap/ayarlar',
    admin: '/admin',
  },

  // In-page anchors on the home page
  sections: {
    home: '#home',
    services: '#services',
  },

  // Cards on the home page
  serviceCards: [
    { title: 'Discord Botları', icon: 'discord', to: '/discord-botlari', desc: 'Sunucunuz için gelişmiş, güvenli ve özelleştirilebilir botlar.' },
    { title: 'Web Geliştirme', icon: 'code', to: '/web-gelistirme', desc: 'Modern ve performanslı web siteleri ile projelerinizi büyütün.' },
    { title: 'Sunucu Çözümleri', icon: 'server', to: '/iletisim?konu=Sunucu%20Çözümleri', desc: 'Sunucu, hosting ve altyapı desteği ile kesintisiz hizmet.' },
    { title: 'Özel Yazılım', icon: 'settings', to: '/iletisim?konu=Özel%20Yazılım', desc: 'İhtiyacınıza özel yazılım çözümleri geliştiriyoruz.' },
  ],

  botCategories: ['Moderasyon', 'Müzik', 'Ekonomi', 'Kayıt'],

  // PLACEHOLDER prices (TRY). `price: null` means "get a quote".
  catalog: [
    {
      slug: 'vexstar-guard',
      category: 'discord-bot',
      subCategory: 'Moderasyon',
      name: 'Vexstar Guard',
      tagline: 'Gelişmiş moderasyon ve otomatik koruma',
      description: 'Spam, reklam ve küfür filtresiyle sunucunuzu 7/24 koruyan, detaylı log tutan moderasyon botu.',
      features: ['Spam, link ve küfür filtresi', 'Ban, mute ve uyarı sistemi', 'Detaylı log kanalları', 'Slash komut desteği', 'Özel bot adı ve avatar'],
      tags: ['ban', 'mute', 'log', 'koruma'],
      price: 1490,
      currency: 'TRY',
      period: 'tek seferlik',
      deliveryDays: 2,
      popular: false,
    },
    {
      slug: 'vexstar-shield',
      category: 'discord-bot',
      subCategory: 'Moderasyon',
      name: 'Vexstar Shield',
      tagline: 'Raid ve yetki kötüye kullanımına karşı koruma',
      description: 'Toplu giriş (raid), kanal silme ve yetki değişikliği girişimlerini algılayıp otomatik önlem alan koruma botu.',
      features: ['Raid algılama ve otomatik kilit', 'Kanal ve rol silme koruması', 'Güvenilir üye listesi', 'Anlık yönetici bildirimi', 'Özel bot adı ve avatar'],
      tags: ['raid', 'anti-nuke', 'güvenlik'],
      price: 2290,
      currency: 'TRY',
      period: 'tek seferlik',
      deliveryDays: 3,
      popular: true,
    },
    {
      slug: 'vexstar-music',
      category: 'discord-bot',
      subCategory: 'Müzik',
      name: 'Vexstar Music',
      tagline: 'Kesintisiz, yüksek kaliteli müzik botu',
      description: 'Sıra yönetimi, ses efektleri ve çalma listesi desteğiyle sesli kanallarınız için müzik botu.',
      features: ['YouTube ve Spotify bağlantı desteği', 'Sıra, döngü ve karıştırma', 'Ses efektleri ve ekolayzır', 'Sunucuya özel çalma listeleri', 'Slash komut desteği'],
      tags: ['müzik', 'şarkı', 'ses'],
      price: 1190,
      currency: 'TRY',
      period: 'tek seferlik',
      deliveryDays: 2,
      popular: false,
    },
    {
      slug: 'vexstar-economy',
      category: 'discord-bot',
      subCategory: 'Ekonomi',
      name: 'Vexstar Economy',
      tagline: 'Sunucunuza özel sanal ekonomi sistemi',
      description: 'Günlük ödül, çalışma, bahis ve sıralama komutlarıyla üyeleri aktif tutan ekonomi botu.',
      features: ['Günlük ödül ve çalışma komutları', 'Sunucuya özel para birimi', 'Sıralama tablosu', 'Yönetici ekonomi araçları', 'Özel bot adı ve avatar'],
      tags: ['ekonomi', 'para', 'oyun'],
      price: 1690,
      currency: 'TRY',
      period: 'tek seferlik',
      deliveryDays: 3,
      popular: false,
    },
    {
      slug: 'vexstar-market',
      category: 'discord-bot',
      subCategory: 'Ekonomi',
      name: 'Vexstar Market',
      tagline: 'Rol marketi ve envanter sistemi',
      description: 'Üyelerin sanal para ile rol ve ödül satın alabildiği, yönetilebilir mağaza ve envanter botu.',
      features: ['Rol ve ödül marketi', 'Üye envanteri ve hediye gönderme', 'Stok ve süreli ürünler', 'Satın alma logları', 'Vexstar Economy ile entegrasyon'],
      tags: ['market', 'rol', 'mağaza'],
      price: 1990,
      currency: 'TRY',
      period: 'tek seferlik',
      deliveryDays: 4,
      popular: false,
    },
    {
      slug: 'vexstar-register',
      category: 'discord-bot',
      subCategory: 'Kayıt',
      name: 'Vexstar Register',
      tagline: 'Otomatik kayıt ve doğrulama sistemi',
      description: 'Yeni üyeleri karşılayan, kayıt formunu alıp rolleri otomatik veren kayıt ve doğrulama botu.',
      features: ['Butonlu kayıt ve doğrulama', 'Otomatik rol verme', 'Karşılama ve ayrılma mesajları', 'Kayıt yetkilisi istatistikleri', 'Özel bot adı ve avatar'],
      tags: ['kayıt', 'doğrulama', 'hoşgeldin'],
      price: 990,
      currency: 'TRY',
      period: 'tek seferlik',
      deliveryDays: 2,
      popular: false,
    },

    {
      slug: 'web-kurumsal',
      category: 'web',
      subCategory: 'Kurumsal',
      name: 'Kurumsal Web Sitesi',
      tagline: 'Markanızı güvenle temsil eden profesyonel site',
      description: 'Şirketiniz için özel tasarlanmış, hızlı ve mobil uyumlu kurumsal web sitesi.',
      features: ['5 sayfaya kadar özel tasarım', 'Mobil uyumlu (responsive) arayüz', 'Temel SEO kurulumu', 'İletişim formu', 'SSL sertifikası kurulumu'],
      tags: ['kurumsal', 'web sitesi', 'şirket'],
      price: 12900,
      currency: 'TRY',
      period: 'tek seferlik',
      deliveryDays: 10,
      popular: false,
    },
    {
      slug: 'web-eticaret',
      category: 'web',
      subCategory: 'E-Ticaret',
      name: 'E-Ticaret Sitesi',
      tagline: 'Satışa hazır, yönetilebilir online mağaza',
      description: 'Ürün yönetimi, sepet ve sipariş takibi ile satışa hazır e-ticaret altyapısı.',
      features: ['Sınırsız ürün ve kategori', 'Sepet ve sipariş yönetimi', 'Yönetim paneli', 'Ödeme sağlayıcı entegrasyonu', 'Mobil uyumlu arayüz'],
      tags: ['e-ticaret', 'mağaza', 'satış'],
      price: 34900,
      currency: 'TRY',
      period: 'tek seferlik',
      deliveryDays: 21,
      popular: true,
    },
    {
      slug: 'web-ozel-script',
      category: 'web',
      subCategory: 'Özel Script',
      name: 'Özel Script & Entegrasyon',
      tagline: 'İhtiyacınıza göre yazılan özel bileşenler',
      description: 'Mevcut sitenize veya sisteminize özel script, API entegrasyonu ve otomasyon geliştirme.',
      features: ['İhtiyaca özel geliştirme', 'API ve üçüncü taraf entegrasyonu', 'Kod belgelendirmesi', 'Test ve teslim desteği'],
      tags: ['script', 'api', 'entegrasyon', 'otomasyon'],
      price: 4900,
      priceFrom: true,
      currency: 'TRY',
      period: 'tek seferlik',
      deliveryDays: 5,
      popular: false,
    },

    {
      slug: 'sunucu-kurulum',
      category: 'server',
      subCategory: 'Sunucu',
      name: 'Sunucu Kurulum & Yönetim',
      tagline: 'Kesintisiz çalışan altyapı',
      description: 'VPS ve hosting kurulumu, güvenlik yapılandırması, yedekleme ve izleme.',
      features: ['Sunucu kurulumu ve güvenlik ayarları', 'Yedekleme ve izleme', 'Uygulama dağıtımı', 'Aylık bakım seçeneği'],
      tags: ['sunucu', 'vps', 'hosting', 'altyapı'],
      price: null,
      currency: 'TRY',
      period: 'teklife göre',
      deliveryDays: null,
      popular: false,
    },
    {
      slug: 'ozel-yazilim',
      category: 'software',
      subCategory: 'Özel Yazılım',
      name: 'Özel Yazılım Geliştirme',
      tagline: 'İş süreçlerinize özel yazılım çözümleri',
      description: 'Masaüstü, web ve otomasyon projeleri için ihtiyaç analizi ile başlayan özel yazılım geliştirme.',
      features: ['İhtiyaç analizi ve planlama', 'Özel yazılım geliştirme', 'Test ve teslim', 'Teslim sonrası destek'],
      tags: ['yazılım', 'özel', 'otomasyon'],
      price: null,
      currency: 'TRY',
      period: 'teklife göre',
      deliveryDays: null,
      popular: false,
    },
  ],

  // Comparison table on the Discord bots page. `slugs` = bots that include the feature.
  botComparison: [
    { label: 'Özel bot adı ve avatar', slugs: ['vexstar-guard', 'vexstar-shield', 'vexstar-economy', 'vexstar-register'] },
    { label: 'Slash komut desteği', slugs: ['vexstar-guard', 'vexstar-shield', 'vexstar-music', 'vexstar-economy', 'vexstar-market', 'vexstar-register'] },
    { label: 'Detaylı log kanalları', slugs: ['vexstar-guard', 'vexstar-shield', 'vexstar-market', 'vexstar-register'] },
    { label: 'Yönetici kontrol komutları', slugs: ['vexstar-guard', 'vexstar-shield', 'vexstar-economy', 'vexstar-market', 'vexstar-register'] },
    { label: 'Ücretsiz güncellemeler', slugs: ['vexstar-guard', 'vexstar-shield', 'vexstar-music', 'vexstar-economy', 'vexstar-market', 'vexstar-register'] },
    { label: '7/24 teknik destek', slugs: ['vexstar-guard', 'vexstar-shield', 'vexstar-music', 'vexstar-economy', 'vexstar-market', 'vexstar-register'] },
  ],

  // PLACEHOLDER business commitments: confirm each one before publishing.
  guarantees: [
    { icon: 'refresh', title: '7 Gün Memnuniyet Garantisi', text: 'Teslimattan sonraki 7 gün içinde, belirtilen özelliklerin eksik çalışması halinde ücretsiz düzeltme yapılır.' },
    { icon: 'shield', title: '30 Gün Hata Düzeltme', text: 'Teslim sonrası 30 gün boyunca ortaya çıkan hatalar ücretsiz giderilir.' },
    { icon: 'clock', title: 'SLA: 24 Saat Yanıt', text: 'Destek taleplerine en geç 24 saat içinde dönüş yapılır.' },
  ],

  // Short trust row used inside checkout / auth modals
  trust: [
    { icon: 'lock', title: 'SSL ile şifreli bağlantı' },
    { icon: 'shield', title: 'Bilgileriniz üçüncü kişilerle paylaşılmaz' },
    { icon: 'clock', title: '24 saat içinde yanıt' },
  ],

  steps: [
    { title: 'Talebinizi iletin', desc: 'Sipariş veya teklif formunu doldurun. İhtiyacınızı birlikte netleştirelim.' },
    { title: 'Planlama ve onay', desc: 'Kapsam, teslim süresi ve fiyat yazılı olarak size iletilir; onayınızla başlarız.' },
    { title: 'Geliştirme ve ara bildirim', desc: 'Çalışma sürecinde ilerleme paylaşılır, geri bildirimleriniz doğrudan uygulanır.' },
    { title: 'Teslim ve destek', desc: 'Kurulum yapılır, kullanım anlatılır ve garanti süresince destek devam eder.' },
  ],

  faq: [
    { q: 'Sipariş verdikten sonra süreç nasıl ilerliyor?', a: 'Sipariş formunuz bize ulaştığında en geç 24 saat içinde sizinle iletişime geçeriz. Kapsam ve teslim süresi netleştikten sonra çalışmaya başlanır.' },
    { q: 'Ödeme nasıl yapılıyor?', a: 'Sipariş formu ödeme almaz. Talebiniz onaylandıktan sonra ödeme bilgileri size iletilir; ödeme yapılmadan geliştirmeye başlanmaz.' },
    { q: 'Teslim süreleri nelerdir?', a: 'Her paketin kartında tahmini teslim süresi yazar. Özel istekler için süre, planlama aşamasında yazılı olarak bildirilir.' },
    { q: 'Teslimattan sonra destek alabilir miyim?', a: 'Evet. Garanti süresi boyunca hatalar ücretsiz düzeltilir. Sonrasında bakım ve destek için ayrı bir plan sunulabilir.' },
    { q: 'Özel bir bot veya yazılım yaptırabilir miyim?', a: 'Evet. İletişim formundan ihtiyacınızı anlatın, size kapsam ve fiyat teklifi hazırlayalım.' },
  ],

  // SAMPLE portfolio entries: replace with real projects. Remove `sample: true` once real.
  portfolio: [
    { id: 'p1', title: 'Topluluk Moderasyon Sistemi', category: 'Discord Bot', client: 'Oyun topluluğu', result: 'Moderatör iş yükünde belirgin azalma', tags: ['Moderasyon', 'Slash komutlar'], sample: true },
    { id: 'p2', title: 'Kurumsal Tanıtım Sitesi', category: 'Web', client: 'Danışmanlık firması', result: 'Mobil uyumlu yeni site, hızlı yükleme', tags: ['Kurumsal', 'SEO'], sample: true },
    { id: 'p3', title: 'Online Mağaza Altyapısı', category: 'Web', client: 'Butik giyim markası', result: 'Sipariş yönetimi tek panelde toplandı', tags: ['E-Ticaret', 'Yönetim paneli'], sample: true },
    { id: 'p4', title: 'Müzik ve Ekonomi Botu', category: 'Discord Bot', client: 'Sosyal topluluk', result: 'Üye etkileşiminde artış', tags: ['Müzik', 'Ekonomi'], sample: true },
    { id: 'p5', title: 'Oyun Sunucusu Altyapısı', category: 'Sunucu', client: 'Oyun sunucusu', result: 'Yedekleme ve izleme ile kesintisiz çalışma', tags: ['VPS', 'Yedekleme'], sample: true },
    { id: 'p6', title: 'Sipariş Takip Otomasyonu', category: 'Yazılım', client: 'Lojistik firması', result: 'Manuel veri girişi otomatikleşti', tags: ['Otomasyon', 'API'], sample: true },
  ],
  portfolioCategories: ['Discord Bot', 'Web', 'Sunucu', 'Yazılım'],

}
