import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import ScarcityTimer from '@/components/ScarcityTimer';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-950">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <Pricing />
      <ScarcityTimer />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
