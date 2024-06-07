import React from 'react'

const MagicButton = ({
    title, icon, position, handleClick, otherClasses
}: {
    title: string;
    icon: React.ReactNode,
    position: string;
    handleClick?: () => void;
    otherClasses?: string;

}) => {

    return (

        <button onClick={handleClick} className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none md:w-[200px] md:mt-10">
            <span className="absolute inset-[-2000%] z-0 animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]"  style={{zIndex: 0}} />
            <span className={`relative z-10 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black px-3 py-1 text-md font-medium text-white backdrop-blur-3xl ${otherClasses}`}>
                {position === 'left' && icon}
                {title}
                {position === 'right' && icon}
            </span>
        </button>
    )
}


export default MagicButton;
