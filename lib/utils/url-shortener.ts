export function generateShortCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function createShortUrl(shortCode: string): string {
  // Priority: VERCEL_URL (for deployed Vercel apps), then fallback to localhost
  let baseUrl = "http://localhost:3000"
  
  if (process.env.VERCEL_URL) {
    // Use the Vercel URL with https
    baseUrl = `https://${process.env.VERCEL_URL}`
  }
  
  // Ensure no trailing slash to avoid double slashes
  const cleanUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  return `${cleanUrl}/api/redirect/${shortCode}`
}
