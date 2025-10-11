"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"
import { generateQRCodeSVG, addLogoToQRClient } from "@/lib/utils/qr-generator"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface QRDownloadButtonsProps {
  qrCode: {
    id: string
    title: string
    short_url: string
    qr_image_url: string | null
    qr_color_dark?: string
    qr_color_light?: string
    qr_logo_url?: string | null
    logo_size?: number
    logo_outline_color?: string
  }
}

export function QRDownloadButtons({ qrCode }: QRDownloadButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const downloadFile = (dataUrl: string, filename: string) => {
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadPNG = async () => {
    try {
      setIsGenerating(true)
      toast.loading("Preparing PNG download...", { id: "download-png" })

      let finalQRUrl = qrCode.qr_image_url || ""

      if (qrCode.qr_logo_url && qrCode.qr_image_url) {
        finalQRUrl = await addLogoToQRClient(
          qrCode.qr_image_url,
          qrCode.qr_logo_url,
          512,
          qrCode.logo_size || 12,
          qrCode.logo_outline_color || "#FFFFFF",
        )
      }

      downloadFile(finalQRUrl, `${qrCode.title}.png`)
      toast.dismiss("download-png")
      toast.success("Download Ready!", { description: "Your PNG QR code is downloading" })
    } catch (error) {
      console.error("Error downloading PNG:", error)
      toast.dismiss("download-png")
      toast.error("Failed to download PNG")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadSVG = async () => {
    try {
      setIsGenerating(true)
      toast.loading("Generating SVG...", { id: "download-svg" })

      const svgString = await generateQRCodeSVG(qrCode.short_url, {
        color: {
          dark: qrCode.qr_color_dark || "#000000",
          light: qrCode.qr_color_light || "#FFFFFF",
        },
      })

      const blob = new Blob([svgString], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      downloadFile(url, `${qrCode.title}.svg`)
      URL.revokeObjectURL(url)

      toast.dismiss("download-svg")
      toast.success("Download Ready!", { description: "Your SVG QR code is downloading" })
    } catch (error) {
      console.error("Error downloading SVG:", error)
      toast.dismiss("download-svg")
      toast.error("Failed to download SVG")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadAI = async () => {
    try {
      setIsGenerating(true)
      toast.loading("Generating vector file...", { id: "download-ai" })

      // AI format is essentially SVG with .ai extension
      const svgString = await generateQRCodeSVG(qrCode.short_url, {
        color: {
          dark: qrCode.qr_color_dark || "#000000",
          light: qrCode.qr_color_light || "#FFFFFF",
        },
      })

      const blob = new Blob([svgString], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      downloadFile(url, `${qrCode.title}.ai`)
      URL.revokeObjectURL(url)

      toast.dismiss("download-ai")
      toast.success("Download Ready!", { description: "Your AI vector file is downloading" })
    } catch (error) {
      console.error("Error downloading AI:", error)
      toast.dismiss("download-ai")
      toast.error("Failed to download AI file")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full" disabled={isGenerating}>
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Download QR Code"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleDownloadPNG}>
          <Download className="mr-2 h-4 w-4" />
          Download as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadSVG}>
          <Download className="mr-2 h-4 w-4" />
          Download as SVG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadAI}>
          <Download className="mr-2 h-4 w-4" />
          Download as AI (Vector)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
