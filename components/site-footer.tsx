import { createClient } from "@/lib/supabase/server"

export async function SiteFooter() {
  const supabase = await createClient()

  let footerText = "© 2025 FADERCO QR. All rights reserved."

  try {
    const { data: footerSetting, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "footer_text")
      .maybeSingle()

    if (!error && footerSetting?.value) {
      footerText = footerSetting.value
    }
  } catch (error) {
    // Silently use default footer text if fetch fails
  }

  return (
    <footer className="relative z-10 border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6 md:px-6">
        <p className="text-center text-sm text-muted-foreground">{footerText}</p>
      </div>
    </footer>
  )
}
