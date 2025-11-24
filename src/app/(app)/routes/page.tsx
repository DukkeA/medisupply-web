import { useTranslations } from 'next-intl'
import { GenerateRoutes } from '@/components/routes/generate-routes'
import { RouteCard } from '@/components/routes/route-card'

export default function RoutesPage() {
  const t = useTranslations('routes.page')

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>
      <div className="space-y-6">
        <GenerateRoutes />
        <RouteCard />
      </div>
    </div>
  )
}
