"use client";

import Image from "next/image";
import React from "react";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";
import Link from "next/link";
import { projects } from "@/data";
import { FaLocationArrow } from "react-icons/fa";

export function Card() {
  return (

    <div className='py-15 -mt-30 text-5xl text-center' id="projects">
      <h1 className='heading '>
        A selection of {""}
        <span className='text-purple'>Recent Projects</span>
      </h1>
      <div className="flex flex-wrap items-center justify-center p-2 gap-10" >
        {projects.map(({ id, title, des, img, iconLists, link }) =>
          <div key={id} className="lg:min-h-full h-full flex items-center justify-center sm:w-[500px] w-[80vw]">
            <CardContainer href={link} >
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-transparent border-white/[0.2]  w-auto sm:w-full lg:h-[500px] sm:h-10 xl:mb-[-110px] sm:mb-[-50px] rounded-xl p-6 border gap-x-[100px]">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-white dark:text-white"

                >

                  <h1 className='text-center font-bold lg:text-2xl md:text-xl text-base line-clamp-1 mt-1'>{title}</h1>
                  <p className="text-center lg:text-xl lg:font-normal font-light text-sm line-clamp-2">{des}</p>
                  <div className="relative flex items-center justify-center overflow-hidden mt-10 mb-10 rounded-lg">
                    <img
                      src={img}
                      alt={title}
                      className='rounded-lg'
                    />
                  </div>

                  <div className='flex items-center justify-between mt-[-10px]'>
                    <div className="flex items-center">
                      {iconLists.map((icon, index) => (
                        <div key={icon} className='border bg-black rounded-full lg:w-10 lg:h-10 w-8 h-8 flex justify-center items-center' style={{ transform: `translateX(-${5 * index * 2}px)` }}>
                          <img src={icon} alt={icon} className='p-2' />
                        </div>
                      ))}
                    </div>

                    <div className='flex justify-center items-center'>
                      <p className='flex lg:text-xl md:text-xs text-sm text-red'>Visit</p>
                      <FaLocationArrow className="ms-3 ml-1.5 size-4" color="white" />
                    </div>
                  </div>

                </CardItem>
              </CardBody>
            </CardContainer>
          </div>
        )}
      </div>
    </div>
  );
}
