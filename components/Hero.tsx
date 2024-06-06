import React from 'react'
import { Spotlight } from './ui/Spotlight'
import { TextGenerateEffect } from './ui/TextGenerateEffect';
import MagicButton from './ui/MagicButton';
import { FaCloudDownloadAlt, FaLocationArrow } from 'react-icons/fa';
import { IoCloudDownloadOutline } from 'react-icons/io5';
import { socialMedia } from '@/data';
import Stats from './ui/Stats';
import { AuroraBackground } from './ui/Aurora';
import { motion } from 'framer-motion';


const Hero = () => {
    return (

        <div className='pb=20 pt-[50px]'>
            <div>
                    <Spotlight className='-top-40 -left-10 md:-left-32 md:-top-20 h-screen' fill="white" />
                    <Spotlight className='top-10 left-full h-[80vh] w-[50vw]' fill="purple" />
                    <Spotlight className='top-28 left-80 h-[80vh] w-[50vw]' fill="blue" />
            </div>
            <div className="h-screen w-full dark:bg-black-100 bg-white dark:bg-grid-white/[0.03] bg-grid-black-100/[0.2] absolute top-0 left-0 flex items-center justify-center"
            >                {/* Radial gradient for the container to give a faded look */}
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black-100 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            </div>

            <div className='flex justify-center relative my-20 z-10'>
                <div className='max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center'>
                   

                    <TextGenerateEffect className="text-center text-[40px] md:text:5xl lg:text-6xl" words="Hi, I am Sevith, Full Stack Developer Based in Bangalore" />
                    <p className='text-center md:tracking-wider mb-4 text-sm md:text:text-lg lg:text-2xl xl:mt-10 mt-4'>
                        Transforming Ideas into seamless User Experiences
                    </p>
                    <div className='flex flex-row lg:flex-row items-center gap-8 xl:mt-1 mt-[8px]'>
                        <a href="https://drive.google.com/file/d/1glmAqBRlE2iAGhgC6LaLvtYkAxWTtdQT/view?usp=sharing">
                            <MagicButton

                                title="Download Resume"
                                icon={<IoCloudDownloadOutline className='w-5 h-5 ml-2' />}
                                position='right'

                            />
                        </a>
                        <div className='flex gap-4 xl:mt-[40px] sm:mt-[50px]'>
                            {socialMedia.map((info) => (
                                <div
                                    key={info.id}
                                    className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75"
                                >
                                    <a href={info.link} target="_blank" rel="noopener noreferrer">
                                        <img src={info.img} alt="icons" width={35} height={35} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Stats />
                </div>
            </div>
        </div>

    );
};

export default Hero;
