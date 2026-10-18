import Title from "@/components/home/Title";
import Who from "@/components/home/Who";
import Tapes from "@/components/home/Tapes";
import Process from "@/components/home/Process";
import Contact from "@/components/Contact";
import { Reel } from "@/components/edit/Reel";

// Home, cut like an edit: the title card, the trailer, who I am (a bone
// negative), the tapes, the process triptych, then the end card.
export default function Home() {
  return (
    <main id="main" className="relative">
      <Title />
      <Reel />
      <Who />
      <Tapes />
      <Process />
      <Contact />
    </main>
  );
}
