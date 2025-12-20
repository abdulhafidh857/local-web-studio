import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import GoalsSection from "@/components/GoalsSection";
import MembershipSection from "@/components/MembershipSection";
import CTASection from "@/components/CTASection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>PPSWZ - Private Practice in Social Work Zanzibar</title>
        <meta
          name="description"
          content="Private Practice in Social Work Zanzibar (PPSWZ) brings together professional social workers dedicated to providing quality, ethical, and professional services in Zanzibar."
        />
        <meta
          name="keywords"
          content="social work, Zanzibar, private practice, counselling, community development, social services, Tanzania"
        />
        <meta property="og:title" content="PPSWZ - Private Practice in Social Work Zanzibar" />
        <meta
          property="og:description"
          content="Professional social work services for individuals, families, and communities across Zanzibar."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://ppswz.or.tz" />
      </Helmet>

      <div className="min-h-screen">
        <Header />
        <main>
          <HeroSection />
          <AboutSection />
          <ServicesSection />
          <GoalsSection />
          <MembershipSection />
          <CTASection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
