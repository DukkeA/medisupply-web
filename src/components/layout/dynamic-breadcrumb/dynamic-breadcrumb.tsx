'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { getRouteLabel, shouldShowInBreadcrumb } from '@/lib/route-config'

export function DynamicBreadcrumb() {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return null
  }

  const breadcrumbItems = []
  let currentPath = ''

  breadcrumbItems.push(
    <BreadcrumbItem key="home" className="hidden md:block">
      <BreadcrumbLink asChild>
        <Link href="/">Home</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
  )

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1
    const segmentLabel = getRouteLabel(currentPath)

    if (shouldShowInBreadcrumb(currentPath)) {
      if (!isLast) {
        breadcrumbItems.push(
          <BreadcrumbSeparator
            key={`separator-${index}`}
            className="hidden md:block"
          />
        )
        breadcrumbItems.push(
          <BreadcrumbItem key={currentPath} className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href={currentPath}>{segmentLabel}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )
      } else {
        breadcrumbItems.push(
          <BreadcrumbSeparator
            key={`separator-${index}`}
            className="hidden md:block"
          />
        )
        breadcrumbItems.push(
          <BreadcrumbItem key={currentPath}>
            <BreadcrumbPage>{segmentLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        )
      }
    }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
    </Breadcrumb>
  )
}
