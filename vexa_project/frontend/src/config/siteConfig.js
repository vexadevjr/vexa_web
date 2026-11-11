// Single source of truth for links, section anchors and key numbers.
// Change a URL or label here and every component picks it up.
export const siteConfig = {
  links: {
    login: 'https://vexadevelopment.com', // placeholder: replace with the real login/panel URL
    discord: 'https://discord.gg', // placeholder: replace with your invite link
    github: 'https://github.com',
    youtube: 'https://youtube.com',
    x: 'https://x.com',
    support: 'https://discord.gg', // "Destek Al" button
  },

  // Internal anchors. The matching element ids are set in the components.
  sections: {
    home: '#home',
    services: '#services', // target of "Hizmetleri İncele"
    discordBots: '#discord-bots',
    webDevelopment: '#web-dev',
    portfolio: '#portfolio', // statistics block
    contact: '#contact', // Discord community banner
  },

  // Statistics shown in the lower section (icons are assigned in the component).
  stats: [
    { value: '500+', label: 'Tamamlanan projeler' },
    { value: '1K+', label: 'Müşteri Sayısı' },
    { value: '%99.9', label: 'Müşteri Memnuniyeti' },
  ],
}
