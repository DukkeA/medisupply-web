'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Eye } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useGetRoutesBffWebDeliveryRoutesGet,
  useGetVehiclesBffWebDeliveryVehiclesGet
} from '@/generated'

export const RouteCard = () => {
  const t = useTranslations('routes.list')
  const router = useRouter()

  // Fetch routes and vehicles (vehicles will be cached from GenerateRoutes)
  const { data: routesData, isLoading: isLoadingRoutes } =
    useGetRoutesBffWebDeliveryRoutesGet()
  const { data: vehiclesData } = useGetVehiclesBffWebDeliveryVehiclesGet()

  // Create a map of vehicle_id -> placa for quick lookup
  const vehicleMap = useMemo(() => {
    if (!vehiclesData?.items) return new Map()
    return new Map(vehiclesData.items.map((v) => [v.id, v.placa]))
  }, [vehiclesData])

  const routes = routesData?.items || []

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completada':
      case 'completed':
        return 'default'
      case 'en_ruta':
      case 'on_route':
      case 'en_progreso':
      case 'in_progress':
        return 'secondary'
      case 'planeada':
      case 'planned':
      case 'pendiente':
      case 'pending':
        return 'outline'
      case 'cancelada':
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    const statusKey = status.toLowerCase()
    return t(`statuses.${statusKey}`, { defaultValue: status })
  }

  if (isLoadingRoutes) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('title')}</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('columns.vehicle')}</TableHead>
              <TableHead>{t('columns.routeDate')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead className="text-right">
                {t('columns.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t('noData')}
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">
                    {vehicleMap.get(route.vehicle_id) || t('unknownVehicle')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(route.fecha_ruta), 'PPP')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(route.estado_ruta)}>
                      {getStatusLabel(route.estado_ruta)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/routes/${route.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t('viewRoute')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
