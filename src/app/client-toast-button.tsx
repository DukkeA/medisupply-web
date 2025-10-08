'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function ClientToastButton() {
  const t = useTranslations('common')

  return <Button onClick={() => toast.success(t('hello'))}>{t('hello')}</Button>
}
// Test comment
