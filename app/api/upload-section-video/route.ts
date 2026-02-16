import { put, del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Only admins can upload section videos" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const sectionNumber = formData.get("sectionNumber") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!sectionNumber) {
      return NextResponse.json({ error: "Section number required" }, { status: 400 })
    }

    // Validate file type - only video files
    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "File must be a video (MP4, WebM, etc.)" }, { status: 400 })
    }

    // Validate file size (max 500MB for videos)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 500MB" }, { status: 400 })
    }

    // Get current video URL to delete old video
    const { data: section } = await supabase
      .from("landing_sections")
      .select("video_url")
      .eq("section_number", parseInt(sectionNumber))
      .single()

    // Delete old video if exists and is from Blob
    if (section?.video_url && section.video_url.includes("blob.vercelusercontent.com")) {
      try {
        await del(section.video_url)
      } catch (error) {
        console.error("Failed to delete old video:", error)
      }
    }

    // Upload new video to Vercel Blob
    const blob = await put(`landing-sections/section-${sectionNumber}-${Date.now()}`, file, {
      access: "public",
      contentType: file.type,
    })

    // Update landing_sections with new video URL
    const { error: updateError } = await supabase
      .from("landing_sections")
      .update({ 
        video_url: blob.url,
        youtube_url: null // Clear old YouTube URL
      })
      .eq("section_number", parseInt(sectionNumber))

    if (updateError) {
      // If database update fails, delete the uploaded blob
      await del(blob.url)
      throw updateError
    }

    return NextResponse.json({
      url: blob.url,
      success: true,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
