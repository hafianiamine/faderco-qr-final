export function generateShortCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function createShortUrl(shortCode: string): string {
  // Priority: NEXT_PUBLIC_APP_URL (environment variable for custom domain)
  // Then: VERCEL_URL (for deployed Vercel apps)
  // Then: NEXT_PUBLIC_SITE_URL (fallback env var)
  // Then: localhost (development only)
  let baseUrl = "http://localhost:3000"
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL
  } else if (process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`
  } else if (process.env.NEXT_PUBLIC_SITE_URL) {
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Ensure no trailing slash to avoid double slashes
  const cleanUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  console.log("[v0] QR redirect URL base:", cleanUrl)
  return `${cleanUrl}/api/redirect/${shortCode}`
}
