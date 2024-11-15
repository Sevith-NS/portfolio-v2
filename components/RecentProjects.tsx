"use client"
import React from 'react'
import { projects } from '@/data'
import { PinContainer } from './ui/3d-pin'
import { FaLocationArrow } from 'react-icons/fa'
import { BoxesCore } from './ui/Background-boxes'

const RecentProjects = () => {
    return (
        <div className='py-15 -mt-30 text-5xl text-center relative' id="projects">
            <h1 className='heading '>
                A selection of {""}
                <span className='text-purple'>Recent Projects</span>

            </h1>
            <div className='flex flex-wrap items-center justify-center p-4 gap-16 mt-10 '>
                {projects.map(({ id, title, des, img, iconLists, link }) =>
                    <div key={id} className="lg:min-h-[32.5rem] h-[25rem] flex items-center justify-center sm:w-[500px] w-[80vw]">
                        <PinContainer title={title} href={link} >
                       
                            <div className='relative flex items-center justify-center sm:w-[500px] w-[80vw] sm:h-[40vh] overflow-hidden h-[30vh] mb-10 '>
                                {/* <div className='relative w-full h-full overflow-hidden lg:rounded-3xl bg-[#13162d]'>
                                    <img src="/bg.png" alt="bg-img" />
                                </div> */}
                                <img
                                    src={img}
                                    alt={title}
                                    className='z-10 absolute bottom-0'
                                />
                            </div>
                            <h1 className='font-bold lg:text-2xl md:text-xl text-base line-clamp-1 mt-10'>
                                {title}
                            </h1>
                            {/* Line clamp constricts the line usage for content and restricts it to specified amount here 2 and above 1 line */}
                            <p className='lg:text-xl lg:font-normal font-light text-sm line-clamp-2'>
                                {des}
                            </p>

                            <div className='flex items-center justify-between mt-7 mb-3'>
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
                        </PinContainer>
                    </div>
                )}
            </div>

        </div>
    )
}

export default RecentProjects;
