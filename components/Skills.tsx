"use client";

import Image from 'next/image';
import React, { useState } from "react";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";
import { FaHtml5, FaCss3, FaReact, FaNodeJs, FaJava, FaAws } from "react-icons/fa";
import { SiTailwindcss, SiNextdotjs, SiMongodb, SiJavascript, SiMysql,  SiAdobe } from "react-icons/si";
import { SiMicrosoftexcel, SiStripe, SiPython, SiPowerbi, SiPhp, SiDotenv} from "react-icons/si";


export function Skills() {

    return (
        <CardContainer className="inter-var relative">
            <CardBody className="overflow-hidden relative group/card xl:mt-[10px] mt-[80px] dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] bg-transparent dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl -p-2 border flex justify-center mb-[-90px] ">
                <CardItem
                    translateZ="50"
                    className="overflow-hidden xl:text-3xl text-2xl flex flex-col items-center relative justify-center font-bold text-neutral-600 dark:text-white"
                >
                    <div className="flex flex-col">
                        <h1 className="text-5xl justify-center items-center text-center p-5">Worked With these <span className='text-purple'> Technologies</span></h1>
                        <div className="xl:flex xl:flex-row flex flex-col justify-center items-center mt-5">
                            

                            <Image src="/html5.svg" alt="Technology Logo" width={100} height={100} className='m-5 ' />
                            <Image src="/css.svg" alt="Technology Logo" width={100} height={100} className='m-5 ' />
                            <Image src="/javascript.svg" alt="Technology Logo" width={100} height={100} className='m-5 ' />
                            <Image src="/re.svg" alt="Technology Logo" width={100} height={100}  className='m-5  '/>
                            <Image src="/fm.svg" alt="Technology Logo" width={100} height={100} className='m-5 ' />
                            <Image src="/java.svg" alt="Technology Logo" width={100} height={100} className='m-5  ' />
                            
                        </div>

                        <div  className="xl:flex xl:flex-row flex flex-col  justify-center items-center mt-5">
                            <Image src="/python.svg" alt="Technology Logo" width={100} height={100} className='m-5' />
                            <Image src="/git.svg" alt="Technology Logo" width={100} height={100} className='m-5  ' />
                            <Image src="/tail.svg" alt="Technology Logo" width={100} height={100} className='m-5  ' />
                            <Image src="/mysql.svg" alt="Technology Logo" width={100} height={100} className='m-5  ' />
                            <Image src="/mongodb.svg" alt="Technology Logo" width={100} height={100} className='m-5  ' />
                            <Image src="/stripe.svg" alt="Technology Logo" width={100} height={100} className='m-5 ' />

                        </div>

                        <div  className="xl:flex xl:flex-row flex flex-col justify-center items-center mt-5">
                        <Image src="/aws.svg" alt="Technology Logo" width={100} height={100} className='m-5  ' />
                        <Image src="/nodejs.svg" alt="Technology Logo" width={100} height={100} className='m-5  ' />
                        <Image src="/php.svg" alt="Technology Logo" width={100} height={100} className='m-5  ' />

                            
                        </div>

                    </div>
                </CardItem>
            </CardBody>
        </CardContainer>
    );
};
export default Skills;
