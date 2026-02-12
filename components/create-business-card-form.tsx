"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { createBusinessCardQR } from "@/app/actions/qr-actions"

interface CreateBusinessCardFormProps {
  onSuccess?: () => void
  forOtherPerson?: boolean
}

export function CreateBusinessCardForm({ onSuccess, forOtherPerson = false }: CreateBusinessCardFormProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [website, setWebsite] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [twitter, setTwitter] = useState("")
  const [facebook, setFacebook] = useState("")
  const [instagram, setInstagram] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string)
      setPhotoFile(file)
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (photoRef.current) {
      photoRef.current.value = ""
    }
  }

  const generateVCard = (): string => {
    let vCard = "BEGIN:VCARD\nVERSION:3.0\n"
    vCard += `FN:${firstName} ${lastName}\n`
    vCard += `N:${lastName};${firstName};;;\n`

    if (email) vCard += `EMAIL:${email}\n`
    if (phone) vCard += `TEL:${phone}\n`
    if (company) vCard += `ORG:${company}\n`
    if (jobTitle) vCard += `TITLE:${jobTitle}\n`
    if (website) vCard += `URL:${website}\n`

    if (linkedin) vCard += `X-SOCIALPROFILE;TYPE=LinkedIn:${linkedin}\n`
    if (twitter) vCard += `X-SOCIALPROFILE;TYPE=Twitter:${twitter}\n`
    if (facebook) vCard += `X-SOCIALPROFILE;TYPE=Facebook:${facebook}\n`
    if (instagram) vCard += `X-SOCIALPROFILE;TYPE=Instagram:${instagram}\n`

    if (photoPreview) {
      const photoBase64 = photoPreview.split(",")[1]
      vCard += `PHOTO;ENCODING=BASE64;TYPE=JPEG:${photoBase64}\n`
    }

    vCard += "END:VCARD"
    return vCard
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required")
      return
    }

    try {
      setIsLoading(true)
      const vCardData = generateVCard()
      const title = `${firstName} ${lastName}`

      const result = await createBusinessCardQR(title, vCardData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Business card created successfully!")
      
      // Reset form
      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setCompany("")
      setJobTitle("")
      setWebsite("")
      setLinkedin("")
      setTwitter("")
      setFacebook("")
      setInstagram("")
      removePhoto()

      onSuccess?.()
    } catch (error) {
      console.error("Error creating business card:", error)
      toast.error("Failed to create business card")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {forOtherPerson ? "Create Business Card for Someone" : "Create Your Business Card"}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {forOtherPerson 
            ? "Create a virtual business card for another person and generate a QR code"
            : "Create your digital business card with all your contact information"}
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Company Name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Social Profiles (Optional)</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/johndoe"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/johndoe"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/johndoe"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/johndoe"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Photo (Optional)</h3>
            {photoPreview ? (
              <div className="relative w-40 h-40">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <label className="cursor-pointer text-sm text-primary hover:underline">
                  Click to upload photo
                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Business Card"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
