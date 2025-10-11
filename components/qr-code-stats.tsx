import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export async function QRCodeStats({ qrCodeId }: { qrCodeId: string }) {
  const supabase = await createClient()

  // Get recent scans
  const { data: recentScans } = await supabase
    .from("scans")
    .select("*")
    .eq("qr_code_id", qrCodeId)
    .order("scanned_at", { ascending: false })
    .limit(10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Scans</CardTitle>
        <CardDescription>Latest scan activity for this QR code</CardDescription>
      </CardHeader>
      <CardContent>
        {recentScans && recentScans.length > 0 ? (
          <div className="space-y-3">
            {recentScans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {scan.city && scan.country ? `${scan.city}, ${scan.country}` : "Unknown Location"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {scan.device_type || "Unknown"} • {scan.browser || "Unknown"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(scan.scanned_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">No scans yet</p>
        )}
      </CardContent>
    </Card>
  )
}
