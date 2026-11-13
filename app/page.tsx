import { projects } from "@/data";
import { size } from "@/lib/size";
import { webp } from "@/lib/work";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Projects from "@/components/Projects";
import Approach from "@/components/Approach";
import Footer from "@/components/Footer";
import Space from "@/components/Space";
import { Header } from "@/components/ui/Header";

const Home = async () => {
  // Every screenshot's own size, so its card is cut to exactly that shape.
  const shots = Object.fromEntries(await Promise.all(projects.filter((p) => p.img).map(async (p) => [p.slug, await size(webp(p.img))] as const)));
  return (
    <main id="main" className="relative overflow-x-clip">
      <Header />
      {/* What I offer, who I am, the work, how I build it, then say hi (Q72, Q73, Q82). */}
      <Hero />
      <Intro />
      <Projects shots={shots} />
      <Approach />
      {/* The close: the space scene, then the contact sheet rises over it. The scene
          says the footer's line itself, so the footer drops its heading here. */}
      <Space>
        <Footer heading={false} />
      </Space>
    </main>
  );
};

export default Home;
