import { FaLocationArrow } from "react-icons/fa6";

import { socialMedia } from "@/data";
import MagicButton from "../components/ui/MagicButton";
import Form from "../components/ui/Form";
import { useState } from "react";

const Footer = () => {

  return (
    <footer className="relative w-full pt-20 pb-10 mt-[-150px]" id="contact">
      {/* background grid */}
      

      <div className="flex flex-col items-center">
        <h1 className="heading lg:max-w-[45vw] text-6xl text-center">
          Let&apos;s<span className="text-purple"> Connect!</span>

        </h1>
        <p className="text-white-200 md:mt-10 my-5 text-2xl text-center">
          Reach out today to discuss how I can help you
          achieve your goals.
        </p>
        
          <a href="sevithns@gmail.com" className="sm:mt:2 lg:mt-1">
            <MagicButton
              title="Get in touch"
              icon={<FaLocationArrow className="ml-2" />}
              position="right"
             
             
            />
          </a>
         
      </div>

      <div className="flex items-center justify-center md:gap-3 gap-6 mt-10">

        {socialMedia.map((info) => (
          <div
            key={info.id}
            className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75"
          >
            <a href={info.link} target="_blank" rel="noopener noreferrer">
              <img src={info.img} alt="icons" width={30} height={30} />
            </a>
          </div>
        ))}
      </div>

    </footer>
  );
};

export default Footer;