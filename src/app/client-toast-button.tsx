'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function ClientToastButton() {
  return <Button onClick={() => toast.success('Ola ke Ase')}>Ola ke Ase</Button>
}
// Test comment
