"use client"
import CountUp from "react-countup";
import { Source_Code_Pro } from "next/font/google";

const font = Source_Code_Pro({ subsets: ["latin"] });
const stats = [
    {
        num: 2,
        text: "Years of Experience",
    },
    {
        num: 5,
        text: "Projects Completed",
    },
    {
        num: 7,
        text: "Technologies mastered",
    },
    {
        num: 27,
        text: "Github Commits",
    },
]
    

const Stats = () => {
    return <section className={font.className}>
        
        <div className="container mx-auto">
            <div className="flex flex-wrap gap-4 xl:max-w-none mt-20 xl:mb-[-70px] mb-[-100px] xl:ml-4 ml-0">
                {stats.map((item, index)=>{
                    return <div className="flex-1 flex gap-4 sm:gap-2  items-center justify-start" key={index}>
                        <CountUp end={item.num} duration={5} delay={2} className="text-5xl xl:text-6xl font-extrabold xl:ml-4 ml-auto"/>
                        <p className={`${item.text.length < 30 ? "max-w-[100px]" : "max-w-[1080px]"} leading-snug text-white/80`}>{item.text}</p>
                    </div>
                })}
            </div>
        </div>
    </section>;
};

export default Stats;