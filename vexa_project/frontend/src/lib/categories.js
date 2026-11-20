import { Bot, Code2, Server, Package, Sparkles, ShieldCheck, Cpu, Gamepad2 } from 'lucide-react'
import { DiscordIcon } from '../components/Icons.jsx'

// icon choices for shop categories (admin picks one by key)
export const CATEGORY_ICONS = {
  discord: DiscordIcon,
  code: Code2,
  server: Server,
  package: Package,
  sparkles: Sparkles,
  shield: ShieldCheck,
  cpu: Cpu,
  gamepad: Gamepad2,
  bot: Bot,
}
export const ICON_OPTIONS = [['discord', 'Discord'], ['code', 'Kod / Web'], ['server', 'Sunucu'], ['package', 'Paket'], ['sparkles', 'Yıldız'], ['shield', 'Kalkan'], ['cpu', 'İşlemci'], ['gamepad', 'Oyun']]
export const iconFor = (key) => CATEGORY_ICONS[key] || Package

// Turkish-friendly slug for a new category id
export function slugify(s) {
  const map = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'c', Ğ: 'g', İ: 'i', Ö: 'o', Ş: 's', Ü: 'u' }
  return String(s).replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => map[c]).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}
