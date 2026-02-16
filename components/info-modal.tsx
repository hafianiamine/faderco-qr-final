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
      <DialogContent className="w-full h-full md:h-auto md:max-w-2xl md:max-h-[80vh] max-w-full p-0 md:p-6 rounded-none md:rounded-lg overflow-y-auto md:overflow-auto">
        <DialogHeader className="p-6 md:p-0">
          <DialogTitle className="text-2xl md:text-xl">{title}</DialogTitle>
          <DialogDescription className="text-base md:text-sm">{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-6 px-6 pb-6 md:mt-4 md:px-0 md:pb-0">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  )
}
