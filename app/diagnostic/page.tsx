import { createClient } from "@/lib/supabase/server"

export default async function DiagnosticPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4 rounded-lg border p-6">
          <h1 className="text-2xl font-bold">Diagnostic Page</h1>
          <div className="space-y-2">
            <p className="text-red-600 font-semibold">No user logged in</p>
            <p>Please login first at /auth/login</p>
          </div>
        </div>
      </div>
    )
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4 rounded-lg border p-6">
        <h1 className="text-2xl font-bold">Diagnostic Page</h1>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h2 className="font-semibold mb-2">User Info:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(
                {
                  id: user.id,
                  email: user.email,
                  email_confirmed_at: user.email_confirmed_at,
                  created_at: user.created_at,
                },
                null,
                2,
              )}
            </pre>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h2 className="font-semibold mb-2">Profile Info:</h2>
            {profileError ? (
              <div className="text-red-600">
                <p className="font-semibold">Error fetching profile:</p>
                <pre className="text-sm overflow-auto">{JSON.stringify(profileError, null, 2)}</pre>
              </div>
            ) : profile ? (
              <pre className="text-sm overflow-auto">{JSON.stringify(profile, null, 2)}</pre>
            ) : (
              <p className="text-yellow-600 font-semibold">Profile not found (null)</p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h2 className="font-semibold mb-2">Admin Check:</h2>
            <p>
              Is admin email:{" "}
              <span
                className={
                  user.email === "admin@fadercoqr.com" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
                }
              >
                {user.email === "admin@fadercoqr.com" ? "YES" : "NO"}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">Email: {user.email}</p>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h2 className="font-semibold mb-2">Approval Status:</h2>
            {profile ? (
              <>
                <p>
                  Status:{" "}
                  <span
                    className={
                      profile.status === "approved" ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"
                    }
                  >
                    {profile.status}
                  </span>
                </p>
                <p>
                  Role: <span className="font-semibold">{profile.role}</span>
                </p>
              </>
            ) : (
              <p className="text-yellow-600">No profile found</p>
            )}
          </div>

          <div className="flex gap-2">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try Dashboard
            </a>
            <a
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
