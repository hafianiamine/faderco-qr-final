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
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
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
        const maxLogoSize = size * (logoSize / 100)
        const logoAspectRatio = logoImage.width / logoImage.height

        let logoWidth = maxLogoSize
        let logoHeight = maxLogoSize

        if (logoAspectRatio > 1) {
          // Wider than tall
          logoHeight = maxLogoSize / logoAspectRatio
        } else {
          // Taller than wide
          logoWidth = maxLogoSize * logoAspectRatio
        }

        const logoX = (size - logoWidth) / 2
        const logoY = (size - logoHeight) / 2

        const outlineWidth = Math.max(3, logoWidth * 0.08) // 8% of logo width, minimum 3px

        // Draw white background for better QR code readability
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(
          logoX - outlineWidth * 1.5,
          logoY - outlineWidth * 1.5,
          logoWidth + outlineWidth * 3,
          logoHeight + outlineWidth * 3,
        )

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight)

        ctx.strokeStyle = outlineColor
        ctx.lineWidth = outlineWidth
        ctx.lineJoin = "round"
        ctx.strokeRect(logoX, logoY, logoWidth, logoHeight)

        resolve(canvas.toDataURL("image/png", 1.0))
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
