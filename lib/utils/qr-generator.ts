import QRCode from "qrcode"

export interface QROptions {
  color?: {
    dark: string
    light: string
  }
  logo?: string
  width?: number
}

export async function generateQRCode(url: string, options?: QROptions): Promise<string> {
  try {
    const width = options?.width || 512
    const dark = options?.color?.dark || "#000000"
    const light = options?.color?.light || "#FFFFFF"

    const qrDataUrl = await QRCode.toDataURL(url, {
      width,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark,
        light,
      },
    })

    return qrDataUrl
  } catch (error) {
    throw new Error("Failed to generate QR code")
  }
}

export async function generateQRCodeSVG(url: string, options?: QROptions): Promise<string> {
  try {
    const dark = options?.color?.dark || "#000000"
    const light = options?.color?.light || "#FFFFFF"

    const svgString = await QRCode.toString(url, {
      type: "svg",
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark,
        light,
      },
    })

    return svgString
  } catch (error) {
    throw new Error("Failed to generate SVG QR code")
  }
}

export function addLogoToQRClient(
  qrDataUrl: string,
  logoDataUrl: string,
  size = 512,
  logoSize = 12,
  outlineColor = "#FFFFFF",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      reject(new Error("Failed to get canvas context"))
      return
    }

    canvas.width = size
    canvas.height = size

    const qrImage = new Image()
    qrImage.crossOrigin = "anonymous"
    qrImage.onload = () => {
      ctx.drawImage(qrImage, 0, 0, size, size)

      const logoImage = new Image()
      logoImage.crossOrigin = "anonymous"
      logoImage.onload = () => {
        const logoSizePixels = size * (logoSize / 100)
        const logoX = (size - logoSizePixels) / 2
        const logoY = (size - logoSizePixels) / 2

        const padding = logoSizePixels * 0.15
        ctx.fillStyle = outlineColor
        ctx.fillRect(logoX - padding, logoY - padding, logoSizePixels + padding * 2, logoSizePixels + padding * 2)

        ctx.drawImage(logoImage, logoX, logoY, logoSizePixels, logoSizePixels)

        resolve(canvas.toDataURL("image/png"))
      }
      logoImage.onerror = () => {
        resolve(qrDataUrl)
      }
      logoImage.src = logoDataUrl
    }
    qrImage.onerror = () => reject(new Error("Failed to load QR code"))
    qrImage.src = qrDataUrl
  })
}
