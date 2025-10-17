'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/utils/classNames'
import { format } from 'date-fns'
import productsMockData from './products-mock-data.json'
import warehousesMockData from './warehouses-mock-data.json'

type AddToInventoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Product = {
  id: string
  name: string
}

type Warehouse = {
  id: number
  name: string
}

export function AddToInventoryModal({
  open,
  onOpenChange
}: AddToInventoryModalProps) {
  // query client instance
  const queryClient = useQueryClient()
  const t = useTranslations('inventory')

  // form state
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    total_quantity: '',
    reserved_quantity: '',
    batch_number: '',
    expiration_date: ''
  })

  const [date, setDate] = useState<Date>()
  const [openProductSelect, setOpenProductSelect] = useState(false)
  const [openWarehouseSelect, setOpenWarehouseSelect] = useState(false)

  // fetch products
  const { data: products } = useQuery<Product[]>({
    queryKey: ['products-for-inventory'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    ...(process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && {
      initialData: productsMockData
    })
  })

  // fetch warehouses
  const { data: warehouses } = useQuery<Warehouse[]>({
    queryKey: ['warehouses-for-inventory'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/warehouses`
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    ...(process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && {
      initialData: warehousesMockData
    })
  })

  // mutation to add to inventory
  const { mutate: addToInventoryMutation, isPending } = useMutation({
    mutationKey: ['add-to-inventory'],
    mutationFn: async (newItem: typeof formData) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/inventory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(newItem)
        }
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    onSuccess: () => {
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(t('modal.toastSuccess'))
      // Reset form
      setFormData({
        product_id: '',
        warehouse_id: '',
        total_quantity: '',
        reserved_quantity: '',
        batch_number: '',
        expiration_date: ''
      })
      setDate(undefined)
    },
    onError: () => {
      toast.error(t('modal.toastError'))
    }
  })

  // form handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addToInventoryMutation(formData)
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedProduct = products?.find((p) => p.id === formData.product_id)
  const selectedWarehouse = warehouses?.find(
    (w) => w.id.toString() === formData.warehouse_id
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('modal.title')}</DialogTitle>
          <DialogDescription>{t('modal.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Product Select */}
            <div className="grid gap-2">
              <Label>{t('modal.fields.product')}</Label>
              <Popover
                open={openProductSelect}
                onOpenChange={setOpenProductSelect}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProductSelect}
                    className="w-full justify-between"
                  >
                    {selectedProduct ? (
                      <span>
                        {selectedProduct.id} - {selectedProduct.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {t('modal.placeholders.selectProduct')}
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder={t('modal.placeholders.searchProduct')}
                    />
                    <CommandList>
                      <CommandEmpty>{t('modal.noResults')}</CommandEmpty>
                      <CommandGroup>
                        {products?.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={`${product.id} ${product.name}`}
                            onSelect={() => {
                              handleChange('product_id', product.id)
                              setOpenProductSelect(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.product_id === product.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {product.id} - {product.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Warehouse Select */}
            <div className="grid gap-2">
              <Label>{t('modal.fields.warehouse')}</Label>
              <Popover
                open={openWarehouseSelect}
                onOpenChange={setOpenWarehouseSelect}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openWarehouseSelect}
                    className="w-full justify-between"
                  >
                    {selectedWarehouse ? (
                      <span>{selectedWarehouse.name}</span>
                    ) : (
                      <span className="text-muted-foreground">
                        {t('modal.placeholders.selectWarehouse')}
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder={t('modal.placeholders.searchWarehouse')}
                    />
                    <CommandList>
                      <CommandEmpty>{t('modal.noResults')}</CommandEmpty>
                      <CommandGroup>
                        {warehouses?.map((warehouse) => (
                          <CommandItem
                            key={warehouse.id}
                            value={warehouse.name}
                            onSelect={() => {
                              handleChange(
                                'warehouse_id',
                                warehouse.id.toString()
                              )
                              setOpenWarehouseSelect(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.warehouse_id ===
                                  warehouse.id.toString()
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {warehouse.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Total Quantity */}
            <div className="grid gap-2">
              <Label htmlFor="total_quantity">
                {t('modal.fields.totalQuantity')}
              </Label>
              <Input
                id="total_quantity"
                type="number"
                min="0"
                value={formData.total_quantity}
                onChange={(e) => handleChange('total_quantity', e.target.value)}
                placeholder="100"
                required
              />
            </div>

            {/* Reserved Quantity */}
            <div className="grid gap-2">
              <Label htmlFor="reserved_quantity">
                {t('modal.fields.reservedQuantity')}
              </Label>
              <Input
                id="reserved_quantity"
                type="number"
                min="0"
                value={formData.reserved_quantity}
                onChange={(e) =>
                  handleChange('reserved_quantity', e.target.value)
                }
                placeholder="0"
                required
              />
            </div>

            {/* Batch Number */}
            <div className="grid gap-2">
              <Label htmlFor="batch_number">
                {t('modal.fields.batchNumber')}
              </Label>
              <Input
                id="batch_number"
                value={formData.batch_number}
                onChange={(e) => handleChange('batch_number', e.target.value)}
                placeholder="BATCH001"
                required
              />
            </div>

            {/* Expiration Date */}
            <div className="grid gap-2">
              <Label>{t('modal.fields.expirationDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, 'PPP')
                    ) : (
                      <span>{t('modal.placeholders.pickDate')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate)
                      if (selectedDate) {
                        handleChange(
                          'expiration_date',
                          format(selectedDate, 'yyyy-MM-dd')
                        )
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t('modal.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? t('modal.buttons.creating')
                : t('modal.buttons.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
