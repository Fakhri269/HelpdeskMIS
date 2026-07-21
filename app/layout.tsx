import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "./hand-loader.css";
import NextAuthSessionProvider from "@/components/providers/session-provider";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});


export const metadata: Metadata = {
  title: "Helpdesk MIS",
  description: "Helpdesk MIS Perumda Tirta Kahuripan, Management Information System, Tirta Kahuripan, Helpdesk, MIS, Perumda Tirta Kahuripan, ",
  icons: {
    icon: "/PdamLogo.svg",
    shortcut: "/PdamLogo.svg",
    apple: "/PdamLogo.svg",
  },
  verification: {
    google: "IkQGuo0FTJ0Y2Kqm9lN5XK6vJydSEOKHA_5FNeYWHHY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${fontSans.variable} h-full antialiased smooth-scroll`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
