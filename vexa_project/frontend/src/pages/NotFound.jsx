import Button from '../components/Button.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { siteConfig } from '../config/siteConfig.js'

export default function NotFound() {
  return (
    <div className="space-y-6">
      <PageHeader title="Sayfa bulunamadı" description="Aradığınız sayfa taşınmış veya kaldırılmış olabilir." />
      <Button to={siteConfig.routes.home}>Ana Sayfaya Dön</Button>
    </div>
  )
}
