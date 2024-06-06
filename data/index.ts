import { FaHtml5, FaCss3, FaReact, FaNodeJs, FaJava} from "react-icons/fa";
import { SiTailwindcss, SiNextdotjs, SiMongodb, SiJavascript, SiMysql} from "react-icons/si";
import { SiMicrosoftexcel, SiStripe, SiPython, SiPowerbi, SiPhp} from "react-icons/si";

export const navItems = [
    { name: "About", link: "#about" },
    { name: "Projects", link: "#projects" },
    // { name: "Resume", link: "#resume" },
    { name: "Contact", link: "#contact" },
  ];
  
  export const gridItems = [
    {
      id: 1,
      title: "Bachelor's of Computer Application Student",
      description: "",
      className: "lg:col-span-3 md:col-span-6 md:row-span-4 lg:min-h-[60vh]",
      imgClassName: "w-full h-full",
      titleClassName: "justify-end",
      img: "/b1.svg",
      spareImg: "",
    },
    {
      id: 2,
      title: "I'm very flexible with time zone communications",
      description: "",
      className: "lg:col-span-2 md:col-span-3 md:row-span-2",
      imgClassName: "",
      titleClassName: "justify-start",
      img: "",
      spareImg: "",
    },
    {
      id: 3,
      title: "My tech stack",
      description: "Constantly improving",
      className: "lg:col-span-2 md:col-span-3 md:row-span-2",
      imgClassName: "",
      titleClassName: "justify-center",
      img: "",
      spareImg: "",
    },
    {
      id: 4,
      title: "Tech and Finance enthusiast with a passion for development.",
      description: "",
      className: "lg:col-span-2 md:col-span-3 md:row-span-1",
      imgClassName: "",
      titleClassName: "justify-start",
      img: "/grid.svg",
      spareImg: "/b4.svg",
    },
  
    {
      id: 5,
      title: "Currently building a Vercel Clone",
      // description: "LinkedIn",
      className: "md:col-span-3 md:row-span-2",
      imgClassName: "absolute right-0 bottom-0 md:w-96 w-60",
      titleClassName: "justify-center md:justify-start lg:justify-center",
      img: "/b5.svg",
      spareImg: "/grid.svg",
    },
    {
      id: 6,
      title: "Let's get down to business if you are Impressed?",
      description: "",
      className: "lg:col-span-2 md:col-span-3 md:row-span-1",
      imgClassName: "",
      titleClassName: "justify-center md:max-w-full max-w-60 text-center",
      img: "",
      spareImg: "",
    },
  ];
  
  export const projects = [
    {
      id: 1,
      title: "Vercel Clone",
      des: "Vercel's Frontend Cloud provides the developer experience and infrastructure to build, scale, and secure a faster, more personalized web.",
      img: "/Vercel.png",
      iconLists: ["/re.svg", "/tail.svg", "/ts.svg", "nodejs.svg", "aws.svg"],
      link: "https://github.com/Sevith-NS/vercel-clone",
    },
    {
      id: 1,
      title: "Zenfinance",
      des: "Dive into the future of finance with this dynamic MERN dashboard, blending machine learning predictions with real-time data visualization. Empower your financial insights with cutting-edge technology and intuitive design.",
      img: "/1.png",
      iconLists: ["/re.svg", "/tail.svg", "/javascript.svg", "nodejs.svg", "mongodb.svg"],
      link: "https://zenfinance-five.vercel.app/",
    },
    {
      id: 2,
      title: "Ochi",
      des: "Ochi is an amazing design website which brings together the full power of Web Designing",
      img: "/Ochi.png",
      iconLists: [ "/tail.svg", "/javascript.svg", "/re.svg", "/fm.svg"],
      link: "https://github.com/Sevith-NS/ochi-front",
    },
    {
      id: 3,
      title: "Learn2Lead",
      des: "Transform your career with LEARN2LEAD, an advanced e-learning platform designed for comprehensive interview preparation. Dive into courses, videos, and study materials, and enhance your skills with interactive quizzes and mock interviews. rack your progress through personalized dashboards and easily manage updated content. Explore internship opportunities and present your entrepreneurial ideas with the PitchIt module. ",
      img: "/3.png",
      iconLists: ["html5.svg", "css.svg", "javascript.svg", "php.svg"],
      link: "https://github.com/Sevith-NS/learn2lead",
    },
    {
      id: 4,
      title: "Spotify",
      des: "Embark on a sonic journey with Spotify, where every beat becomes a thread in the tapestry of your life. Dive into a kaleidoscope of melodies, curated just for you, as you discover new rhythms that resonate with your soul. Let Spotify be your symphony, painting your world in the colors of music.",
      img: "/4.png",
      iconLists: ["/next.svg", "/tail.svg", "/ts.svg", "/re.svg", "/stripe.svg"],
      link: "https://spotify-clone-sooty-mu.vercel.app/",
    },
  ];
    
  export const workExperience = [
    {
      id: 1,
      title: "Market Analyst Intern",
      desc: "Assisted in the development of a web-based platform using React.js, enhancing interactivity.",
      className: "md:col-span-2",
      thumbnail: "/exp1.svg",
    },
    {
      id: 2,
      title: "HR Intern",
      desc: "Designed and developed mobile app for both iOS & Android platforms using React Native.",
      className: "md:col-span-2", 
      thumbnail: "/exp2.svg",
    },
    
  ];
  
  export const socialMedia = [
    {
      id: 1,
      img: "/git.svg",
      link:"https://github.com/Sevith-NS",
    },
    // {
    //   id: 2,
    //   img: "/insta.svg",
    // },
    {
      id: 3,
      img: "/link.svg",
      link: "https://www.linkedin.com/in/sevith-n-s-079063273/",
    },
    // {
    //   id: 4,
    //   img: "/twit.svg",
    //   link: "https://www.linkedin.com/in/sevith-n-s-079063273/",
    // },
  ];