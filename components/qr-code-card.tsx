"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Download, Eye, FileType } from "lucide-react" // Added FileType icon for SVG download
import Image from "next/image"
import { toast } from "sonner"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { generateQRCodeSVG } from "@/lib/utils/qr-generator" // Added SVG generator import

interface QRCodeCardProps {
  qrCode: {
    id: string
    title: string
    destination_url: string
    short_url: string
    qr_image_url: string | null
    is_active: boolean
    created_at: string
  }
}

export function QRCodeCard({ qrCode }: QRCodeCardProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [downloadingSVG, setDownloadingSVG] = useState(false) // Added SVG download state

  const handleDownload = () => {
    if (!qrCode.qr_image_url) {
      toast.error("QR code image not available")
      return
    }

    const link = document.createElement("a")
    link.download = `${qrCode.title.replace(/\s+/g, "-").toLowerCase()}.png`
    link.href = qrCode.qr_image_url
    link.click()
    toast.success("QR code downloaded!")
  }

  const handleDownloadSVG = async () => {
    setDownloadingSVG(true)
    try {
      const svgString = await generateQRCodeSVG(qrCode.short_url, {
        width: 1000,
        height: 1000,
        margin: 2,
      })

      const blob = new Blob([svgString], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = `${qrCode.title.replace(/\s+/g, "-").toLowerCase()}.svg`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)

      toast.success("SVG QR code downloaded!")
    } catch (error) {
      toast.error("Failed to download SVG")
    } finally {
      setDownloadingSVG(false)
    }
  }

  return (
    <>
      <Card className="bg-white/10 border-gray-200 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="line-clamp-1 text-gray-900">{qrCode.title}</CardTitle>
          <CardDescription className="line-clamp-1 text-gray-600">{qrCode.destination_url}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCode.qr_image_url && (
            <div className="flex justify-center bg-white p-4 rounded-lg">
              <Image
                src={qrCode.qr_image_url || "/placeholder.svg"}
                alt={qrCode.title}
                width={150}
                height={150}
                className="rounded-lg"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-white/30 border-gray-200"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button variant="outline" size="sm" className="bg-white/30 border-gray-200" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/30 border-gray-200"
              onClick={handleDownloadSVG}
              disabled={downloadingSVG}
            >
              <FileType className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{qrCode.title}</DialogTitle>
            <DialogDescription>{qrCode.destination_url}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {qrCode.qr_image_url && (
              <div className="flex justify-center bg-white p-8 rounded-lg">
                <Image
                  src={qrCode.qr_image_url || "/placeholder.svg"}
                  alt={qrCode.title}
                  width={300}
                  height={300}
                  className="rounded-lg"
                />
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Short URL:</strong> {qrCode.short_url}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Created:</strong> {new Date(qrCode.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                PNG
              </Button>
              <Button
                className="flex-1 bg-transparent"
                variant="outline"
                onClick={handleDownloadSVG}
                disabled={downloadingSVG}
              >
                <FileType className="mr-2 h-4 w-4" />
                SVG
              </Button>
              <Button variant="outline" asChild>
                <a href={qrCode.short_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Test
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
