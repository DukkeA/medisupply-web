'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/utils/classNames'
import testData from './vendors-mock-data.json'

interface Vendor {
  id: number
  name: string
}

interface VendorPlanFormData {
  vendor_id: number
  period: string
  goal: number
  actual: number
  status: string
}

export function CreateVendorPlanModal() {
  const t = useTranslations('vendorPlans')
  const [open, setOpen] = useState(false)
  const [openVendorSelect, setOpenVendorSelect] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null)
  const [formData, setFormData] = useState<VendorPlanFormData>({
    vendor_id: 0,
    period: '',
    goal: 0,
    actual: 0,
    status: 'On Track'
  })

  const queryClient = useQueryClient()

  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await fetch('/api/vendors')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    ...(process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && {
      initialData: testData
    })
  })

  const mutation = useMutation({
    mutationKey: ['create-vendor-plan'],
    mutationFn: async (newPlan: VendorPlanFormData) => {
      const response = await fetch('/api/vendor-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newPlan)
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorPlans'] })
      toast.success(t('createSuccess'))
      setOpen(false)
      resetForm()
    },
    onError: () => {
      toast.error(t('createError'))
    }
  })

  const resetForm = () => {
    setFormData({
      vendor_id: 0,
      period: '',
      goal: 0,
      actual: 0,
      status: 'On Track'
    })
    setSelectedVendorId(null)
  }

  const handleChange = (
    field: keyof VendorPlanFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVendorId) {
      toast.error(t('selectVendor'))
      return
    }
    mutation.mutate({ ...formData, vendor_id: selectedVendorId })
  }

  const selectedVendor = vendors?.find((v) => v.id === selectedVendorId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t('create')}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('createTitle')}</DialogTitle>
          <DialogDescription>{t('createDescription')}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Vendor Select */}
              <div className="grid gap-2">
                <Label htmlFor="vendor">{t('vendor')}</Label>
                <Popover
                  open={openVendorSelect}
                  onOpenChange={setOpenVendorSelect}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openVendorSelect}
                      className="justify-between"
                    >
                      {selectedVendor ? selectedVendor.name : t('selectVendor')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder={t('searchVendor')} />
                      <CommandList>
                        <CommandEmpty>{t('noVendorFound')}</CommandEmpty>
                        <CommandGroup>
                          {vendors?.map((vendor) => (
                            <CommandItem
                              key={vendor.id}
                              value={`${vendor.id} ${vendor.name}`}
                              onSelect={() => {
                                setSelectedVendorId(vendor.id)
                                setOpenVendorSelect(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedVendorId === vendor.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {vendor.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Period */}
              <div className="grid gap-2">
                <Label htmlFor="period">{t('period')}</Label>
                <Input
                  id="period"
                  placeholder="Q1 2024"
                  value={formData.period}
                  onChange={(e) => handleChange('period', e.target.value)}
                  required
                />
              </div>

              {/* Goal */}
              <div className="grid gap-2">
                <Label htmlFor="goal">{t('goal')}</Label>
                <Input
                  id="goal"
                  type="number"
                  placeholder="50000"
                  value={formData.goal || ''}
                  onChange={(e) => handleChange('goal', Number(e.target.value))}
                  required
                />
              </div>

              {/* Actual */}
              <div className="grid gap-2">
                <Label htmlFor="actual">{t('actual')}</Label>
                <Input
                  id="actual"
                  type="number"
                  placeholder="45000"
                  value={formData.actual || ''}
                  onChange={(e) =>
                    handleChange('actual', Number(e.target.value))
                  }
                  required
                />
              </div>

              {/* Status */}
              <div className="grid gap-2">
                <Label htmlFor="status">{t('status')}</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  required
                >
                  <option value="On Track">{t('onTrack')}</option>
                  <option value="Exceeded">{t('exceeded')}</option>
                  <option value="Below Target">{t('belowTarget')}</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t('creating') : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
