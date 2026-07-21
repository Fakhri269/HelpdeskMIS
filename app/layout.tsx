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
    "Aplikasi Helpdesk", "Portal Teknologi Informasi"
  ],
  icons: {
    icon: "/PdamLogo.svg",
    shortcut: "/PdamLogo.svg",
    apple: "/PdamLogo.svg",
  },
  verification: {
    google: "IkQGuo0FTJ0Y2Kqm9lN5XK6vJydSEOKHA_5FNeYWHHY",
  },
  openGraph: {
    title: "Helpdesk MIS | PDAM Tirta Kahuripan Kabupaten Bogor",
    description: "Portal resmi layanan teknologi informasi Perumda Air Minum Tirta Kahuripan Kabupaten Bogor. Laporkan gangguan IT, buat tiket, dan pantau progres penanganan secara online.",
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
