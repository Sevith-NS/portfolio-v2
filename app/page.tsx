import { navItems } from "@/data";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Projects from "@/components/Projects";
import Approach from "@/components/Approach";
import Footer from "@/components/Footer";
import { FloatingNav } from "@/components/ui/FloatingNav";

const Home = () => {
  return (
    <main id="main" className="relative">
      <FloatingNav navItems={navItems} />
      {/* What I offer, who I am, the work, how I build it, then say hi (Q72, Q73, Q82).
          Experience and Off the clock move to /story. */}
      <Hero />
      <Intro />
      <Projects />
      <Approach />
      <Footer />
    </main>
  );
};

export default Home;
