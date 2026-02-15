import { LandingHeroSections } from "@/components/landing-hero-sections"
import { LandingCarousel } from "@/components/landing-carousel"
import { getLandingSections } from "@/app/actions/landing-sections-actions"
import { getCarouselSlides } from "@/app/actions/carousel-actions"

export default async function HomePage() {
  const { data: heroSections } = await getLandingSections()
  const carouselSlides = await getCarouselSlides()

  return (
    <>
      <LandingHeroSections sections={heroSections} />
      <LandingCarousel slides={carouselSlides} notificationText="Check out our latest tools & features!" />
    </>
  )
}
