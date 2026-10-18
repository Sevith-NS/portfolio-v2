"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { email } from "@/data";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";
type Fields = { name: string; mail: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const validate = (f: Fields): Errors => {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Add your name so I know who to reply to.";
  if (!f.mail.trim()) e.mail = "Add an email so I can reply.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.mail)) e.mail = "That email doesn't look complete. Check for typos.";
  if (f.message.trim().length < 10) e.message = "Write a sentence or two about what you have in mind.";
  return e;
};

const inputClass =
  "w-full border-2 bg-transparent px-4 py-3 text-[0.9375rem] text-fg placeholder:text-mute outline-none focus:border-blood focus-visible:outline-none";

export function Form() {
  const [fields, setFields] = useState<Fields>({ name: "", mail: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate(fields);
    setErrors(found);
    const first = (Object.keys(found) as (keyof Fields)[])[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { from_name: fields.name, from_mail: fields.mail, message: fields.message, subject: "New Portfolio Message" },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      setStatus("sent");
      setFields({ name: "", mail: "", message: "" });
    } catch (err) {
      console.error("EmailJS send failed", err);
      setStatus("error");
    }
  };

  const field = (k: keyof Fields, label: string, input: React.ReactNode) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={`f-${k}`} className="hud text-fg">
        {label}
      </label>
      {input}
      {errors[k] && (
        <p id={`f-${k}-err`} role="alert" className="flex items-center gap-2 text-[0.8125rem] text-fg">
          <span aria-hidden className="size-2 shrink-0 bg-blood" />
          {errors[k]}
        </p>
      )}
    </div>
  );

  const aria = (k: keyof Fields) => ({
    id: `f-${k}`,
    name: k,
    value: fields[k],
    onChange: set(k),
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `f-${k}-err` : undefined,
    className: cn(inputClass, errors[k] ? "border-blood" : "border-line"),
  });

  return (
    // The call sheet: a bone page pinned into the black.
    <div className="tone-bone relative p-5 md:p-8">
      <p className="hud mb-6 border-b-2 border-fg pb-2 text-fg">call_sheet.txt</p>
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[22rem] flex-col items-start justify-center gap-4"
          >
            <p className="title text-[3rem] text-fg">That&apos;s a wrap.</p>
            <p className="max-w-[40ch] text-mute">Message received. I&apos;ll get back to you soon.</p>
            <button type="button" onClick={() => setStatus("idle")} className="btn mt-2">
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {field("name", "Name", <input type="text" autoComplete="name" placeholder="Your name" {...aria("name")} />)}
              {field("mail", "Email", <input type="email" autoComplete="email" placeholder="you@company.com" {...aria("mail")} />)}
            </div>
            {field(
              "message",
              "Message",
              <textarea rows={5} placeholder="A role, a project, or a question" {...aria("message")} className={cn(aria("message").className, "resize-y")} />
            )}

            {status === "error" && (
              <p role="alert" className="flex items-start gap-2 border-2 border-blood p-3 text-[0.8125rem] text-fg">
                <span aria-hidden className="mt-1.5 size-2 shrink-0 bg-blood" />
                The message didn&apos;t send. Try again, or email me directly at {email}.
              </p>
            )}

            <button type="submit" disabled={status === "sending"} className="btn btn-solid self-start">
              {status === "sending" ? "Sending" : "Send message"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Form;
