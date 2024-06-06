"use client"

import { navItems } from "@/data";

import Hero from "@/components/Hero";
import Grid from "@/components/Grid";
import Footer from "@/components/Footer";
import RecentProjects from "@/components/RecentProjects";
import Experience from "@/components/Experience";
import Approach from "@/components/Approach";
import Skills from "@/components/Skills";
import { FloatingNav } from "@/components/ui/FloatingNav";
import Resume from "@/components/Resume";

import LocomotiveScroll from 'locomotive-scroll';
import { Card } from "@/components/Card";
import Form from "@/components/ui/Form";
import { Bounce, ToastContainer, toast } from 'react-toastify';




const Home = () => {
  const locomotiveScroll = new LocomotiveScroll();
  return (
    <main className="relative bg-black-100 flex justify-center overflow-x-hidden items-center flex-col mx-auto sm:px-10 px-5">

      <div className="max-w-7xl w-full">
        <FloatingNav
          navItems={navItems}
        />
        <Hero />

        <Grid />
        {/* <Card/> */}
        <RecentProjects />
        {/* <Skills /> */}
        {/* <Resume /> */}
        <Approach />
        <Footer />
        {/* <Form /> */}
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition={Bounce}
/>
      </div>
    </main>
  );
};

export default Home;