import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InteractiveClient from "@/components/InteractiveClient";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <InteractiveClient />
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
