"use client";

import React, { useState } from "react";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from 'emailjs-com';
import { MdOutlineClose } from "react-icons/md";


interface FormProps {
    onClose: () => void;
  }

export function Form({ onClose }: FormProps) {

    const [name, setname] = useState<string>('');
    const [mail, setmail] = useState<string>('');
    const [message, setmessage] = useState<string>('');

    const notify = () => toast.success('Submitted Successfully!', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce

    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const templateParams = {
            from_name: name,
            from_mail: mail,
            message: message,
            subject: "New Portfolio Message"
        };

        emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
            templateParams,
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!)
            .then((response) => {
                console.log('SUCCESS!', response.status, response.text);
                notify();
                setname('');
                setmail('');
                setmessage('');
            }, (err) => {
                console.log('FAILED...', err);
                toast.error('Failed to send message. Please try again later.', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce
                });
            });
    };

    return (
        <CardContainer className="inter-var">
             
                <CardBody className="relative group/card xl:mt-[-40px] mt-[-60px] mb-[-100px] dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] bg-transparent dark:border-white/[0.2] border-black/[0.1] xl:w-[480px] w-[23rem] h-auto rounded-xl p-6 border flex justify-center">
                    <CardItem
                        translateZ="50"
                        className="xl:text-3xl text-2xl flex flex-col items-center justify-center font-bold text-neutral-600 dark:text-white"
                    >
                        <MdOutlineClose onClick={onClose}  className="xl:mt-[-15px] xl:ml-[440px] xl:mb-1 xl:size-7 mt-[-15px] ml-[330px] mb-1 size-5"/>

                        <h1>Let&apos;s work together
                        </h1>

                        <form onSubmit={handleSubmit} className="flex flex-col p-1">
                            <input onChange={(e) => setname(e.target.value)} value={name} type="text" name="name" placeholder="Name" className="bg-transparent border text-xl border-white/50 mt-5 rounded-xl p-3 sm:p-[-30px] w-[340px] xl:w-[450px] " required />
                            <input onChange={(e) => setmail(e.target.value)} value={mail} type="email" name="email" placeholder="Email" className="bg-transparent border text-xl border-white/50 mt-5 rounded-xl p-3 sm:p-[-30px] w-[340px]  xl:w-[450px] " required />
                            <textarea onChange={(e) => setmessage(e.target.value)} value={message} name="text" placeholder="Message" className="bg-transparent border text-xl border-white/50 mt-5 rounded-xl p-3 sm:p-[-30px] w-[340px]  xl:w-[450px] h-[200px]" required />
                            <button type="submit" className="bg-transparent border text-xl border-white/50 mt-3 rounded-full p-3 sm:p-[-30px] w-[340px]  xl:w-[450px] hover:bg-white hover:text-black">Submit</button>
                        </form>
                    </CardItem>
                   
                </CardBody>
            
        </CardContainer>
    );
};
export default Form;


