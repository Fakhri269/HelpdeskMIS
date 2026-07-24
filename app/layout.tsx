import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "./hand-loader.css";
import NextAuthSessionProvider from "@/components/providers/session-provider";
import WelcomeToast from "@/components/WelcomeToast";
import LunaAI from "@/components/user/LunaAI";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});


export const metadata: Metadata = {
  title: "Helpdesk MIS | PDAM Tirta Kahuripan Kabupaten Bogor | Portal Perumda Air Minum",
  description: "Helpdesk MIS PDAM Tirta Kahuripan Kabupaten Bogor adalah portal resmi Perumda Air Minum Tirta Kahuripan untuk layanan teknologi informasi, pelaporan gangguan aplikasi, jaringan, komputer, email, website, sistem informasi, dan dukungan IT bagi seluruh pegawai.",
  keywords: [
    "Helpdesk MIS", "MIS", "MIS PDAM", "MIS Tirta Kahuripan", "Helpdesk PDAM",
    "Helpdesk Tirta Kahuripan", "PDAM Tirta Kahuripan", "Perumda Air Minum Tirta Kahuripan",
    "Perumda Air Minum Kabupaten Bogor", "PDAM Kabupaten Bogor", "Kabupaten Bogor", "Bogor",
    "Portal Perumda Air Minum", "Portal PDAM", "Portal MIS", "Portal Internal",
    "Portal Pegawai", "Portal Karyawan", "Sistem Informasi", "Sistem Informasi Manajemen",
    "IT Support", "Helpdesk IT", "Ticketing", "Layanan TI", "Layanan Teknologi Informasi",
    "Aplikasi Internal", "Website Internal", "Jaringan Komputer", "Email Perusahaan",
    "Server", "Database", "Digitalisasi", "Transformasi Digital", "Perumda Air Minum",
    "Tirta Kahuripan", "PDAM Bogor", "Portal Helpdesk", "Helpdesk Online",
    "Service Desk", "IT Service Management", "ITSM", "Ticketing System",
    "Aplikasi Helpdesk", "Portal Teknologi Informasi",
    "Cara melaporkan gangguan IT di PDAM Tirta Kahuripan",
    "Sistem Helpdesk untuk Pegawai PDAM Kabupaten Bogor",
    "Portal Layanan Teknologi Informasi Perumda Air Minum",
    "Bantuan IT dan Jaringan PDAM Tirta Kahuripan Bogor",
    "Cara membuat tiket bantuan IT di aplikasi MIS",
    "Sistem Manajemen Informasi Perumda Air Minum Kabupaten Bogor",
    "Aplikasi Pelaporan Gangguan IT PDAM Tirta Kahuripan",
    "Layanan Pengaduan Komputer dan Jaringan Pegawai PDAM",
    "Portal Resmi MIS Perumda Air Minum Tirta Kahuripan Kabupaten Bogor"
  ],
  icons: {
    icon: "/PdamLogo.svg",
    shortcut: "/PdamLogo.svg",
    apple: "/PdamLogo.svg",
  },
  verification: {
    google: "IkQGuo0FTJ0Y2Kqm9lN5XK6vJydSEOKHA_5FNeYWHHY",
  },
  applicationName: "Helpdesk MIS PDAM Tirta Kahuripan",
  authors: [{ name: "Divisi MIS PDAM Tirta Kahuripan" }],
  openGraph: {
    title: "Helpdesk MIS | PDAM Tirta Kahuripan Kabupaten Bogor",
    description: "Portal resmi layanan teknologi informasi Perumda Air Minum Tirta Kahuripan Kabupaten Bogor. Laporkan gangguan IT, buat tiket, dan pantau progres penanganan secara online.",
    siteName: "Helpdesk MIS PDAM Tirta Kahuripan",
    type: "website",
    locale: "id_ID",
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
      className={`${fontSans.variable} min-h-full antialiased smooth-scroll`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <NextAuthSessionProvider>
          {children}
          <WelcomeToast />
          <LunaAI />
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
