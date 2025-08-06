import HeroSection from "../components/Landing/HeroSection";
import ServicesOverview from "../components/Landing/ServicesOverview";
import Footer from "../components/Shared/Footer"; // Optional footer if available

export default function HomePage() {
    return (
        <div className="bg-gray-900 text-white">
            {/* Hero Section with mechanic-banner image */}
            <HeroSection />

            {/* Services Overview (optional section after hero) */}
            <section className="py-16 px-6 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-yellow-400 text-center mb-10">
                    What We Offer
                </h2>
                <ServicesOverview />
            </section>

            {/* Optional future section: Testimonials, Pricing, etc. */}
            {/* <TestimonialsSection /> */}
            {/* <PricingSection /> */}

            {/* Footer */}
            <Footer />
        </div>
    );
}
