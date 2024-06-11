"use client"
import { navItems } from "@/data";
import Hero from "@/components/Hero";
import dynamic from "next/dynamic";
import Grid from "@/components/Grid";
import Footer from "@/components/Footer";
import RecentProjects from "@/components/RecentProjects";
import Approach from "@/components/Approach";
import { FloatingNav } from "@/components/ui/FloatingNav";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { useEffect } from "react";


const Home = () => {
  
  return (
    <main className="relative bg-black-100 flex justify-center overflow-x-hidden overflow-y-hidden items-center flex-col mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        
        <FloatingNav
          navItems={navItems}

        />
        <Hero />
        <Grid />
        <RecentProjects />
        <Approach />
        <Footer />
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
