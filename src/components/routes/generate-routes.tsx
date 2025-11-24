'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { CalendarIcon, Check } from 'lucide-react'
import { format } from 'date-fns'
import { z } from 'zod'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '../ui/command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calendar'
import { cn } from '@/utils/classNames'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  useGetVehiclesBffWebDeliveryVehiclesGet,
  useGenerateRoutesBffWebDeliveryRoutesGeneratePost,
  getGetRoutesBffWebDeliveryRoutesGetQueryKey
} from '@/generated'

const generateRoutesSchema = z.object({
  vehicle_ids: z.array(z.string()).min(1, 'At least one vehicle is required'),
  fecha_entrega_estimada: z.date({
    message: 'Delivery date is required'
  })
})

type GenerateRoutesFormData = z.infer<typeof generateRoutesSchema>

export const GenerateRoutes = () => {
  const t = useTranslations('routes.generate')
  const queryClient = useQueryClient()
  const [openVehicleSelect, setOpenVehicleSelect] = useState(false)
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])

  // Fetch vehicles
  const { data: vehiclesData, isLoading: isLoadingVehicles } =
    useGetVehiclesBffWebDeliveryVehiclesGet()

  // Generate routes mutation
  const { mutate: generateRoutes, isPending } =
    useGenerateRoutesBffWebDeliveryRoutesGeneratePost()

  // Initialize form
  const form = useForm<GenerateRoutesFormData>({
    resolver: zodResolver(generateRoutesSchema),
    mode: 'onChange',
    defaultValues: {
      vehicle_ids: [],
      fecha_entrega_estimada: undefined
    }
  })

  const handleSubmit = (data: GenerateRoutesFormData) => {
    generateRoutes(
      {
        data: {
          vehicle_ids: data.vehicle_ids,
          fecha_entrega_estimada: format(
            data.fecha_entrega_estimada,
            'yyyy-MM-dd'
          )
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetRoutesBffWebDeliveryRoutesGetQueryKey()
          })
          toast.success(t('toastSuccess'))
          form.reset()
          setSelectedVehicles([])
        },
        onError: () => {
          toast.error(t('toastError'))
        }
      }
    )
  }

  const toggleVehicle = (vehicleId: string) => {
    const newSelection = selectedVehicles.includes(vehicleId)
      ? selectedVehicles.filter((id) => id !== vehicleId)
      : [...selectedVehicles, vehicleId]

    setSelectedVehicles(newSelection)
    form.setValue('vehicle_ids', newSelection, { shouldValidate: true })
  }

  const vehicleItems = vehiclesData?.items || []
  const selectedPlates = vehicleItems
    .filter((v: { id: string }) => selectedVehicles.includes(v.id))
    .map((v: { placa: string }) => v.placa)
    .join(', ')

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vehicle Selection */}
            <FormField
              control={form.control}
              name="vehicle_ids"
              render={() => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('fields.vehicles')}</FormLabel>
                  <Popover
                    open={openVehicleSelect}
                    onOpenChange={setOpenVehicleSelect}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-full justify-between',
                            !selectedVehicles.length && 'text-muted-foreground'
                          )}
                        >
                          {selectedVehicles.length > 0
                            ? selectedPlates
                            : t('placeholders.selectVehicles')}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder={t('placeholders.searchVehicle')}
                        />
                        <CommandList>
                          <CommandEmpty>{t('noVehicleFound')}</CommandEmpty>
                          <CommandGroup>
                            {isLoadingVehicles ? (
                              <CommandItem disabled>
                                {t('loadingVehicles')}
                              </CommandItem>
                            ) : (
                              vehicleItems.map(
                                (vehicle: { id: string; placa: string }) => (
                                  <CommandItem
                                    key={vehicle.id}
                                    value={`${vehicle.id} ${vehicle.placa}`}
                                    onSelect={() => toggleVehicle(vehicle.id)}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        selectedVehicles.includes(vehicle.id)
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    {vehicle.placa}
                                  </CommandItem>
                                )
                              )
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Selection */}
            <FormField
              control={form.control}
              name="fecha_entrega_estimada"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('fields.deliveryDate')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>{t('placeholders.pickDate')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex flex-col justify-end">
              <Button
                type="submit"
                className="w-full"
                disabled={isPending || !form.formState.isValid}
              >
                {isPending ? t('buttons.generating') : t('buttons.generate')}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
