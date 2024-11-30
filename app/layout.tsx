import type { Metadata } from "next";
// import { Raleway } from "next/font/google";
import localfont from "next/font/local"
import "./globals.css";
import { ThemeProvider } from "./provider";


// const font = Raleway({ subsets: ["latin"] });
const neue = localfont({
  src: [{
    path: "../public/fonts/NeueMontreal-Regular.ttf",
    weight: "300"
  }],
});

export const metadata: Metadata = {
  title: "Sevith's Portfolio",
  icons: ["/1.svg"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"  suppressHydrationWarning>
      <body className={neue.className}> 
      <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider></body>
    </html>
  );
}
