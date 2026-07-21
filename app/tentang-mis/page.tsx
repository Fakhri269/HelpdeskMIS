import Link from "next/link";
import Image from "next/image";

export default function TentangMISPage() {
  return (
    <main className="relative min-h-screen font-sans bg-[#0e7fb0]">
      {/* ── FIXED BACKGROUND GRADIENT ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "linear-gradient(160deg, #0e7fb0 0%, #1aa3c8 40%, #e8f7fc 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-[100dvh]">
        {/* NAVBAR */}
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/PdamLogo.svg" alt="Logo PDAM Tirta Kahuripan" width={44} height={44} />
            <div>
              <p className="text-white font-bold text-sm leading-tight">Perumda Air Minum</p>
              <p className="text-blue-100 text-xs leading-tight">Tirta Kahuripan</p>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-white border border-white/40 px-5 py-2 rounded-full hover:bg-white hover:text-[#0e7fb0] transition-all duration-300"
          >
            Kembali
          </Link>
        </nav>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 py-12">
          <div className="max-w-3xl w-full bg-white/15 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 text-white shadow-xl">
            <h1 className="text-3xl font-bold mb-6 border-b border-white/20 pb-4">Tentang MIS</h1>
            
            <div className="space-y-4 text-blue-50 leading-relaxed text-sm">
              <p>
                Management Information System (MIS) Perumda Air Minum Tirta Kahuripan adalah divisi yang berdedikasi untuk mendukung operasional perusahaan melalui pemanfaatan teknologi informasi secara optimal.
              </p>
              <p>
                Tugas utama divisi MIS meliputi pengembangan perangkat lunak (software), pengelolaan infrastruktur jaringan dan server, perancangan database, serta memberikan dukungan teknis (IT Support) untuk seluruh pegawai dan manajemen Perumda Air Minum Tirta Kahuripan Kabupaten Bogor.
              </p>
              <p>
                Melalui Portal Helpdesk MIS ini, kami berkomitmen untuk memberikan layanan bantuan IT yang transparan, terukur, dan responsif guna memastikan seluruh kegiatan operasional perusahaan berjalan dengan lancar tanpa hambatan teknis.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="text-center py-6 border-t border-white/10 text-cyan-100/50 text-xs mt-auto">
          <p>© {new Date().getFullYear()} Perumda Air Minum Tirta Kahuripan Kabupaten Bogor — Divisi MIS</p>
        </footer>
      </div>
    </main>
  );
}
