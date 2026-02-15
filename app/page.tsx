import { LandingHeroSections } from "@/components/landing-hero-sections"
import { getLandingSections } from "@/app/actions/landing-sections-actions"

export default async function HomePage() {
  const { data: heroSections } = await getLandingSections()

  return (
    <LandingHeroSections sections={heroSections} />
  )
}
