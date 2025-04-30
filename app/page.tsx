import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features"
import WhyChooseSection from "@/components/why-choose-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <WhyChooseSection />
      <Footer />
    </div>
  )
}
