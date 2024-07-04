"use client";
import { useEffect, useState } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";
import ColorPicker, { useColorPicker } from 'react-best-gradient-color-picker'

export const TextGenerateEffect = ({
    words,
    className,
}: {
    words: string;
    className?: string;
}) => {
    const [scope, animate] = useAnimate();
    let wordsArray = words.split(" ");
    useEffect(() => {
        animate(
            "span",
            {
                opacity: 1,
            },
            {
                duration: 2,
                delay: stagger(0.2),
            }
        );
    }, [scope.current]);

    const renderWords = () => {

        return (
            <motion.div ref={scope}>
                {wordsArray.map((word, idx) => {
                    return (
                        <motion.span
                            key={word + idx}
                            className={`${idx > 3 ? 'text-rgba(145,232,25,13)' : 'dark:text-white text-black'} opacity-0`}
                        >
                            {word}{" "}
                        </motion.span>
                    );
                })}
            </motion.div>
        );
    };

    
        return (
            <div className={cn("font-bold", className)}>
                <div className="my-4">
                    <div className="text-[#AC55FA]  leading-snug tracking-widest lg:tracking-wide ">
                    {/* bg-clip-text text-transparent bg-gradient-to-r from-[#ef71e7] via-[#000000] to-[#e40a0a] */}
                        {renderWords()}
                    </div>
                </div>
            </div>
        );

    };
