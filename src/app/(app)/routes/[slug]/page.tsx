'use client'
import { use } from 'react'
import { RouteDetail } from '@/components/routes/route-detail'

export default function RouteIDPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <RouteDetail routeId={slug} />
    </div>
  )
}
