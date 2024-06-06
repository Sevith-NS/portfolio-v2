"use client"

import { FaHtml5, FaCss3, FaReact, FaNodeJs, FaJava } from "react-icons/fa";
import { SiTailwindcss, SiNextdotjs, SiMongodb, SiJavascript, SiMysql } from "react-icons/si";
import { SiMicrosoftexcel, SiStripe, SiPython, SiPowerbi } from "react-icons/si";

//About data




function calculateExperience(startDate: string | Date) {
    const start = new Date(startDate);
    const today = new Date();

    let years = today.getFullYear() - start.getFullYear();
    const months = today.getMonth() - start.getMonth();

    // Adjust if the current month is earlier than the start month
    if (months < 0 || (months === 0 && today.getDate() < start.getDate())) {
        years--;
    }

    return `${years}+ Years`;
}

const startDate = '2022-08-17';
const experienceFieldValue = calculateExperience(startDate);

const about = [
    {
        title: "About Me",
        description: "Description",
        info: [
            {
                fieldName: "Name",
                fieldValue: "Sevith",
            },
            {
                fieldName: "Phone",
                fieldValue: "(+91) 9945147373",
            },
            {
                fieldName: "Experience",
                fieldValue: experienceFieldValue,
            },
            {
                fieldName: "LinkedIn",
                fieldValue: <a href="https://www.linkedin.com/in/sevith-n-s-079063273/">Sevith NS</a>,
            },
            {
                fieldName: "Email",
                fieldValue: "sevithns@gmail.com",
            },
            {
                fieldName: "Languages",
                fieldValue: "English, Kannada, Hindi, Spanish, French, Japanese ",
            },
        ]
    },
];

//Experience Data
const experience = {
    title: "My Experience",
    description: "My experience",
    items: [
        {
            company: "Tradeshala",
            position: "Market Analyst",
            duration: "June 2023 - August 2023",
        },
        {
            company: "MC Leading Edge",
            position: "HR Intern",
            duration: "June 2023 - July 2023",
        },
        {
            company: "Christ University",
            position: "Student Council Representative",
            duration: "Sept 2022 - August 2023",
        }
    ]
};

//Education Data
const education = {
    title: "My Education",
    description: "My Education",
    items: [
        {
            icon: "",
            institution: "Christ University",
            course: "Bachelors of Computer Applications",
            duration: "Aug 2022 - Present",
        },
        {
            icon: "",
            institution: "YouTube",
            course: "Full Stack MERN Development",
            duration: "Present",
        },
        {
            icon: "",
            institution: "Atlassian",
            course: "Agile With Atlassian Jira",
            duration: "Jun 2023",
        },
        {
            icon: "",
            institution: "JP Morgan",
            course: "Software Engineering",
            duration: "Jul 2023",
        },
        {
            icon: "",
            institution: "Tata Consultancy Services",
            course: "TCS Ion Career Edge",
            duration: "Jul 2023",
        },
        {
            icon: "",
            institution: "Google",
            course: "Digital marketing fundamentals by Google",
            duration: "Jul 2022",
        },
        {
            icon: "",
            institution: "Harvard CS50",
            course: "CS50: Introduction to Computer Science",
            duration: "June 2021",
        },
    ]
};

const skills = {
    title: "My Skills",
    description: "My skills",

    skillList: [
        {
            icon: <FaHtml5 />,
            name: "HTML 5",
        },
        {
            icon: <FaCss3 />,
            name: "CSS",
        },
        {
            icon: <FaReact />,
            name: "React.JS",
        },
        {
            icon: <SiJavascript />,
            name: "Javascript",
        },
        {
            icon: <FaJava />,
            name: "Java",
        },
        {
            icon: <FaNodeJs />,
            name: "Node.JS",
        },
        {
            icon: <SiPython />,
            name: "Python",
        },
        {
            icon: <SiTailwindcss />,
            name: "Tailwind.CSS",
        },
        {
            icon: <SiMongodb />,
            name: "Mongodb",
        },
        {
            icon: <SiNextdotjs />,
            name: "Next.JS",
        },
        {
            icon: <SiMysql />,
            name: "SQL",
        },
        {
            icon: <SiMicrosoftexcel />,
            name: "Excel",
        },
        {
            icon: <SiStripe />,
            name: "Stripe",
        },
        {
            icon: <SiPowerbi />,
            name: "PowerBi",
        },

    ]
};

import { motion } from "framer-motion";

const Resume = () => {
    return <motion.div
        initial={{ opacity: 0 }}
        animate={{
            opacity: 1,
            transition: { delay: 2.4, duration: 0.4, ease: "easeIn" },
        }}
        className="min-h-[80vh flex items-center justify-center py-12 xl:py-0"
    >
        <div className="container.mx-auto">
            

                <div className="min-h-[70vh] w-full">
                  
                </div>
          
        </div>
    </motion.div>
};

export default Resume;