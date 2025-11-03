import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  Warehouse,
  ShoppingCart,
  FileText,
  Users,
  Route,
  Building2
} from 'lucide-react'

export default async function Home() {
  const t = await getTranslations('home')
  const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || 'MediSupply'

  const technologies = [
    {
      category: t('technologies.frontend'),
      items: ['Next.js 15', 'React 19', 'TypeScript', 'TanStack Query']
    },
    {
      category: t('technologies.styling'),
      items: ['Tailwind CSS 4', 'Shadcn/ui']
    },
    {
      category: t('technologies.testing'),
      items: ['Vitest', 'Testing Library']
    },
    {
      category: t('technologies.infrastructure'),
      items: ['Vercel']
    }
  ]

  const features = [
    {
      icon: Users,
      title: t('features.providers'),
      color: 'text-blue-500'
    },
    {
      icon: Package,
      title: t('features.products'),
      color: 'text-green-500'
    },
    {
      icon: Warehouse,
      title: t('features.inventory'),
      color: 'text-purple-500'
    },
    {
      icon: Building2,
      title: t('features.warehouses'),
      color: 'text-orange-500'
    },
    {
      icon: ShoppingCart,
      title: t('features.vendors'),
      color: 'text-pink-500'
    },
    {
      icon: FileText,
      title: t('features.reports'),
      color: 'text-indigo-500'
    },
    {
      icon: Route,
      title: t('features.routes'),
      color: 'text-teal-500'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            {t('welcome')} {siteTitle}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* About Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{t('about.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{t('about.description')}</p>
          <p className="text-muted-foreground font-medium">
            {t('about.purpose')}
          </p>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{t('features.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 rounded-lg bg-card hover:shadow-md transition-shadow"
                >
                  <Icon className={`w-8 h-8 mb-2 ${feature.color}`} />
                  <span className="text-sm font-medium text-center">
                    {feature.title}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Technologies Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('technologies.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-semibold text-lg">{tech.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {tech.items.map((item, idx) => (
                    <Badge key={idx} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Made with ❤️ by the MediSupply Team 05 • Uniandes Final Project 2025
        </p>
      </div>
    </div>
  )
}
