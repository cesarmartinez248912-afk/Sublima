import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Gallery from "@/components/ProductGallery";
import QuoteForm from "@/components/QuoteForm";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <Hero />
      <Gallery />
      <QuoteForm />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}