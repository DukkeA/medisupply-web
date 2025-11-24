'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
  useGetRouteBffWebDeliveryRoutesRouteIdGet,
  useGetVehiclesBffWebDeliveryVehiclesGet
} from '@/generated'

interface RouteDetailProps {
  routeId: string
}

export const RouteDetail = ({ routeId }: RouteDetailProps) => {
  const t = useTranslations('routes.detail')
  const router = useRouter()

  // Fetch route detail
  const { data: routeData, isLoading: isLoadingRoute } =
    useGetRouteBffWebDeliveryRoutesRouteIdGet(routeId)

  // Fetch vehicles (cached)
  const { data: vehiclesData } = useGetVehiclesBffWebDeliveryVehiclesGet()

  // Create a map of vehicle_id -> placa for quick lookup
  const vehicleMap = useMemo(() => {
    if (!vehiclesData?.items) return new Map()
    return new Map(vehiclesData.items.map((v) => [v.id, v.placa]))
  }, [vehiclesData])

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

  const getShipmentStatusLabel = (status: string) => {
    const statusKey = status.toLowerCase()
    return t(`shipmentStatuses.${statusKey}`, { defaultValue: status })
  }

  const getShipmentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'entregado':
        return 'default'
      case 'in_transit':
      case 'en_transito':
        return 'secondary'
      case 'assigned_to_route':
      case 'asignado_a_ruta':
        return 'outline'
      case 'failed':
      case 'fallido':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (isLoadingRoute) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }

  if (!routeData) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('notFound')}</p>
      </div>
    )
  }

  // El API devuelve sequence_in_route pero el tipado dice delivery_sequence
  // Necesitamos acceder al campo real del API
  const shipments = (routeData.shipments || []) as unknown as Array<{
    id: string
    order_id: string
    shipment_status: string
    sequence_in_route: number
  }>
  const vehiclePlate =
    vehicleMap.get(routeData.vehicle_id) || t('unknownVehicle')

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/routes')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('backToRoutes')}
      </Button>

      {/* Route header */}
      <div className="space-y-2">
        <div className="flex items-center gap-8">
          <h3 className="text-2xl font-bold">{t('title')}</h3>
          <Badge variant={getStatusColor(routeData.estado_ruta)}>
            {getStatusLabel(routeData.estado_ruta)}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">
              {t('fields.vehicle')}:{' '}
            </span>
            <span className="font-medium">{vehiclePlate}</span>
          </div>
          <div>
            <span className="text-muted-foreground">
              {t('fields.routeDate')}:{' '}
            </span>
            <span className="font-medium">
              {format(new Date(routeData.fecha_ruta), 'PPP')}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">
              {t('fields.routeId')}:{' '}
            </span>
            <span className="font-mono text-xs">{routeData.id}</span>
          </div>
        </div>
      </div>

      {/* Shipments table */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">{t('shipmentsTitle')}</h4>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t('columns.sequence')}</TableHead>
                <TableHead>{t('columns.orderId')}</TableHead>
                <TableHead>{t('columns.shipmentStatus')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    {t('noShipments')}
                  </TableCell>
                </TableRow>
              ) : (
                shipments
                  .sort((a, b) => a.sequence_in_route - b.sequence_in_route)
                  .map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">
                        {shipment.sequence_in_route}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {shipment.order_id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getShipmentStatusColor(
                            shipment.shipment_status
                          )}
                        >
                          {getShipmentStatusLabel(shipment.shipment_status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
