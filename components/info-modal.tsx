'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface InfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  content: React.ReactNode
}

export function InfoModal({ open, onOpenChange, title, description, content }: InfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  )
}
