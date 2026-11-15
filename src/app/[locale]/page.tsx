import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ProblemSection } from "@/components/home/ProblemSection";
import { DataSection } from "@/components/home/DataSection";
import { MethodSection } from "@/components/home/MethodSection";
import { LiveDemoSection } from "@/components/home/LiveDemoSection";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-offWhite text-ink font-body">
      <Navbar />
      <main id="main-content" className="flex-1 w-full">
        <Hero />
        <ProblemSection />
        <DataSection />
        <MethodSection />
        <LiveDemoSection />
      </main>
      <Footer />
    </div>
  );
}
