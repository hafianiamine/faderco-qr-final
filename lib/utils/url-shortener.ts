export function generateShortCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function createShortUrl(shortCode: string): string {
  // Use NEXT_PUBLIC_APP_URL (available in both client and server)
  // Fallback to VERCEL_URL for deployed environments, then localhost
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL
  
  if (!baseUrl && process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`
  }
  
  if (!baseUrl) {
    baseUrl = "http://localhost:3000"
  }
  
  // Ensure no trailing slash to avoid double slashes
  const cleanUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  return `${cleanUrl}/api/redirect/${shortCode}`
}
