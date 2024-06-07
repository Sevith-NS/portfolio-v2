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
        <button onClick={handleClick} className={`relative inline-flex h-auto overflow-hidden rounded-full p-[1px] focus:outline-none w-full md:w-[200px] md:mt-10 ${otherClasses}`}>
            <span className="absolute inset-0 animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-md font-medium text-white backdrop-blur-3xl`}>
                {position === 'left' && icon}
                {title}
                {position === 'right' && icon}
            </span>
        </button>
    )
}

export default MagicButton;
