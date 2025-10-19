'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
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
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/utils/classNames'
import { format } from 'date-fns'
import { useProducts, useWarehouses, useAddToInventory } from '@/services'
import {
  createInventorySchema,
  type InventoryFormData
} from '@/lib/validations/inventory-schema'
import type { InventoryCreateRequest } from '@/generated/models'

type AddToInventoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddToInventoryModal({
  open,
  onOpenChange
}: AddToInventoryModalProps) {
  const t = useTranslations('inventory')
  const tValidation = useTranslations()

  const [date, setDate] = useState<Date>()
  const [openProductSelect, setOpenProductSelect] = useState(false)
  const [openWarehouseSelect, setOpenWarehouseSelect] = useState(false)

  // Initialize form with validation (using translation)
  const form = useForm<InventoryFormData>({
    resolver: zodResolver(createInventorySchema(tValidation)),
    mode: 'onChange',
    defaultValues: {
      product_id: '',
      warehouse_id: '',
      total_quantity: 0,
      batch_number: '',
      expiration_date: ''
    }
  })

  // mutation to add to inventory
  const { mutate: addToInventoryMutation, isPending } = useAddToInventory()

  // query products to populate product select
  const { data: products } = useProducts()

  // query warehouses to populate warehouse select
  const { data: warehouses } = useWarehouses()

  // form handlers
  const resetForm = () => {
    form.reset()
    setDate(undefined)
  }

  const handleSubmit = (data: InventoryFormData) => {
    // Get selected product to populate denormalized fields
    const selectedProduct = products?.items.find(
      (p) => p.id === data.product_id
    )

    if (!selectedProduct) {
      toast.error(t('modal.toastError'))
      return
    }

    // Build payload - backend will populate denormalized fields
    const inventoryPayload: InventoryCreateRequest = {
      product_id: data.product_id,
      warehouse_id: data.warehouse_id,
      total_quantity: data.total_quantity,
      batch_number: data.batch_number,
      expiration_date: data.expiration_date
    }

    addToInventoryMutation(inventoryPayload, {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(t('modal.toastSuccess'))
        resetForm()
      },
      onError: () => {
        toast.error(t('modal.toastError'))
      }
    })
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  const selectedProduct = products?.items.find(
    (p) => p.id === form.watch('product_id')
  )
  const selectedWarehouse = warehouses?.items.find(
    (w) => w.id.toString() === form.watch('warehouse_id')
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('modal.title')}</DialogTitle>
          <DialogDescription>{t('modal.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Product Select */}
              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.product')}</FormLabel>
                    <FormControl>
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
                                {selectedProduct.sku} - {selectedProduct.name}
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
                              placeholder={t(
                                'modal.placeholders.searchProduct'
                              )}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {t('modal.noResults')}
                              </CommandEmpty>
                              <CommandGroup>
                                {products?.items?.map((product) => (
                                  <CommandItem
                                    key={product.id}
                                    value={`${product.sku} ${product.name}`}
                                    onSelect={() => {
                                      field.onChange(product.id)
                                      setOpenProductSelect(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === product.id
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    {product.sku} - {product.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Warehouse Select */}
              <FormField
                control={form.control}
                name="warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.warehouse')}</FormLabel>
                    <FormControl>
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
                              placeholder={t(
                                'modal.placeholders.searchWarehouse'
                              )}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {t('modal.noResults')}
                              </CommandEmpty>
                              <CommandGroup>
                                {warehouses?.items?.map((warehouse) => (
                                  <CommandItem
                                    key={warehouse.id}
                                    value={warehouse.name}
                                    onSelect={() => {
                                      field.onChange(warehouse.id.toString())
                                      setOpenWarehouseSelect(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === warehouse.id.toString()
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total Quantity */}
              <FormField
                control={form.control}
                name="total_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.totalQuantity')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Batch Number */}
              <FormField
                control={form.control}
                name="batch_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.batchNumber')}</FormLabel>
                    <FormControl>
                      <Input placeholder="BATCH001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiration Date */}
              <FormField
                control={form.control}
                name="expiration_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.expirationDate')}</FormLabel>
                    <FormControl>
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
                                field.onChange(
                                  format(selectedDate, 'yyyy-MM-dd')
                                )
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
              >
                {isPending
                  ? t('modal.buttons.creating')
                  : t('modal.buttons.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
