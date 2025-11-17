import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-muted-foreground" />
                <CardTitle className="text-2xl">Pending Approval</CardTitle>
              </div>
              <CardDescription>Your account is awaiting administrator approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your registration is currently being reviewed by a FADERCO administrator. You will be notified via email
                once your account is approved.
              </p>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/">Return to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
