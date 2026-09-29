import { navItems } from "@/data";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Approach from "@/components/Approach";
import OffTheClock from "@/components/OffTheClock";
import Footer from "@/components/Footer";
import { FloatingNav } from "@/components/ui/FloatingNav";

const Home = () => {
  return (
    <main id="main" className="relative">
      <FloatingNav navItems={navItems} />
      <Hero />
      <Projects />
      <About />
      <Experience />
      <Approach />
      <OffTheClock />
      <Footer />
    </main>
  );
};

export default Home;
