import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeedPreview from "@/components/FeedPreview";
import FeaturedBusinesses from "@/components/FeaturedBusinesses";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

const Index = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">
      <HeroSection />
      <FeedPreview />
      <FeaturedBusinesses />
      <AboutSection />
      <ContactSection />
    </main>
    <Footer />
  </div>
);

export default Index;
