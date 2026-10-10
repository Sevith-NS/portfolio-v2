# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Primary:** hiring managers and recruiters for **product engineer** roles — and the design-led and product-led teams where one person is expected to design, define and ship. They skim fast, usually from a LinkedIn or resume link, and decide whether Sevith is worth an interview.
- **Secondary:** freelance clients who might hire Sevith to scope and build a product.

Success for both: they download the resume, copy the email, or send a message through the contact form.

## Product Purpose
Personal portfolio of Sevith Sadashiva (Bangalore). It positions Sevith as a **product engineer**: one person who designs the interface, defines the product and ships the code, rather than a specialist in any one of the three. Today a technical writer at Digital.ai who owns documentation as a product, and who designs and ships AI products solo.

## Positioning
One person covering design, product definition and engineering, with evidence on both sides: enterprise GenAI launch work (Ask Release GA at Digital.ai) plus independently built full-stack AI products (Flint OS, Tesseract AI). Most product engineers have never had to make an enterprise GenAI product understandable to a paying customer; most people who have cannot ship a Flask quant API.

## Operating Context
Visitors arrive from resume and LinkedIn links on desktop and phone. Single-page Next.js 14 site (App Router, Tailwind v3, Framer Motion), deployed on Vercel. The contact form sends mail through EmailJS (env vars `NEXT_PUBLIC_EMAILJS_*`).

## Capabilities and Constraints
- Home section order stays: Hero, About, Experience, Projects, Approach ("how I work"), then Off the clock, Contact.
- Routes: `/`, `/work/[slug]` case studies (drafted from repos, unverified parts marked TODO), `/studio` 3D rooms.
- Keep the existing data: all 7 projects, both roles, and the resume link.
- Removed: 3D GitHub globe, time-zone card, tech-stack card, Instagram link.
- Aceternity-style components are welcome where they earn their place.
- Some interactive components should stay for visitors.

## Personality (confirmed 2026-09-29)
- Three words a visitor should leave with: **curious, precise, warm**.
- A self-described frontend and design geek and type nerd (loves Coolvetica; Helvetica/Futura/Caslon-style classics).
- Off the clock: sports, video editing, cinema, fonts and type, marketing and personal brand, finance and stocks, cooking, and (honestly) sometimes panicking about the future.
- The site should show this side: an "off the clock" strip, a type specimen, an editable "now playing / watching" line, and a 3D rooms page (/studio) that cycles scenes of Sevith every 5 minutes.

## Brand Commitments
- Palette pinned by the user: **oat and lapis**, professional, in the spirit of sanvithi.com. Light oat is the default; dark mode is deep lapis-navy.
- Wants cinematic page transitions between pages, 3D elements (hero type object and a film-reel project carousel), and case-study pages per project.
- No phone number on the site; email only (clickable).
- Name: Sevith Sadashiva ("Sevith"). Title: Product engineer — designs, defines and ships. Technical Writer at Digital.ai by title.
- Contact: sevithns@gmail.com (clickable mailto and copy), GitHub Sevith-NS, LinkedIn.

## Evidence on Hand
- Resume facts: 260+ user stories, 25+ Agile sprints, 4 major release cycles (25.1–26.3), 30+ customer-reported defects resolved, 3 enterprise products (Deploy, Release, TeamForge), Ask Release GA launch; Ceyone internship, 30% engagement lift and 10% dev-time cut.
- Project screenshots in `public/` (tesseract.png, Vercel.png, 1.png, Ochi.png, 3.png, 4.png). **No Flint OS screenshot yet**; it uses a placeholder until the user adds one.
- No testimonials, logos of clients, or metrics beyond the resume. Do not invent them.

## Product Principles
1. Lead with product judgment, back it with shipping proof.
2. Every number on the page comes from the resume.
3. Fast to skim: a recruiter gets the story in one viewport and one scroll.
4. Interactive moments should show how Sevith works, not decorate.
