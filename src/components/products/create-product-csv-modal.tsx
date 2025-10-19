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
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Upload, Download } from 'lucide-react'
import { useUploadProductsCSV } from '@/services/hooks/use-products'

type CreateProductCSVModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProductCSVModal({
  open,
  onOpenChange
}: CreateProductCSVModalProps) {
  const t = useTranslations('products')

  // form state
  const [file, setFile] = useState<File | null>(null)

  // mutation to create products from CSV
  const { mutate: uploadCSVMutation, isPending } = useUploadProductsCSV()

  // form handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error(t('csvModal.noFileError'))
      return
    }
    uploadCSVMutation(file, {
      onSuccess: () => {
        onOpenChange(false)
        setFile(null)
        toast.success(t('csvModal.toastSuccess'))
      },
      onError: () => {
        toast.error(t('csvModal.toastError'))
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error(t('csvModal.invalidFileType'))
        return
      }
      setFile(selectedFile)
    }
  }

  const handleDownloadTemplate = () => {
    const link = document.createElement('a')
    link.href = '/bash-upload.csv'
    link.download = 'products-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg ">
        <DialogHeader>
          <DialogTitle>{t('csvModal.title')}</DialogTitle>
          <DialogDescription>{t('csvModal.description')}</DialogDescription>
        </DialogHeader>
        <form data-testid="csv-form" onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="file">{t('csvModal.fields.file')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('csvModal.buttons.downloadTemplate')}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  data-testid="csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  required
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Upload className="h-4 w-4" />
                    <span>{file.name}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('csvModal.fields.fileDescription')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onOpenChange(false)
                setFile(null)
              }}
              disabled={isPending}
            >
              {t('csvModal.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={isPending || !file}>
              {isPending
                ? t('csvModal.buttons.uploading')
                : t('csvModal.buttons.upload')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
