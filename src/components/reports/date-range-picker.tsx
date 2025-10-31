'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { cn } from '@/utils/classNames'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useTranslations } from 'next-intl'

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  setDateRange: (dateRange: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({
  dateRange,
  setDateRange,
  className
}: DateRangePickerProps) {
  const t = useTranslations('reports')

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div
      className={cn('grid gap-2', className)}
      data-testid="date-range-picker"
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground'
            )}
            data-testid="date-range-trigger"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <span data-testid="date-range-display">
                  {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                </span>
              ) : (
                <span data-testid="date-range-display">
                  {formatDate(dateRange.from)}
                </span>
              )
            ) : (
              <span data-testid="date-range-placeholder">
                {t('generateForm.selectDateRange')}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          data-testid="date-range-popover"
        >
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            data-testid="date-range-calendar"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
