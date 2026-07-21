import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-white font-sans">

      {/* ── BACKGROUND GRADIENT ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(160deg, #0e7fb0 0%, #1aa3c8 40%, #e8f7fc 100%)",
        }}
      />

      {/* ── WAVE SVG TOP-RIGHT ── */}
      <svg
        className="absolute top-0 right-0 z-0 opacity-30"
        viewBox="0 0 600 800"
        width="600"
        height="800"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M600,0 C500,120 380,80 420,280 C460,480 560,460 540,640 C520,780 460,800 600,800 Z"
          fill="white"
        />
      </svg>

      {/* ── WAVE SVG BOTTOM-LEFT ── */}
      <svg
        className="absolute bottom-0 left-0 z-0 opacity-20"
        viewBox="0 0 500 400"
        width="500"
        height="400"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,400 C80,300 60,200 180,180 C300,160 340,260 420,220 C500,180 500,400 500,400 Z"
          fill="white"
        />
      </svg>

      {/* ── WAVE DIVIDER BOTTOM ── */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
            fill="white"
            fillOpacity="0.15"
          />
          <path
            d="M0,80 C360,20 720,120 1080,60 C1260,30 1380,80 1440,90 L1440,120 L0,120 Z"
            fill="white"
            fillOpacity="0.1"
          />
        </svg>
      </div>

      {/* ── FLOATING CIRCLES ── */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10 z-0"
        style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }} />
      <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full opacity-10 z-0"
        style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }} />

      {/* ── CONTENT ── */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* NAVBAR */}
        <nav className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <Image src="/PdamLogo.svg" alt="Logo PDAM Tirta Kahuripan" width={44} height={44} />
            <div>
              <p className="text-white font-bold text-sm leading-tight">Perumda Air Minum</p>
              <p className="text-blue-100 text-xs leading-tight">Tirta Kahuripan</p>
            </div>
          </div>
          <Link
            href="/login"
            className="text-sm font-semibold text-white border border-white/40 px-5 py-2 rounded-full hover:bg-white hover:text-[#0e7fb0] transition-all duration-300"
          >
            Masuk
          </Link>
        </nav>

        {/* HERO */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-md">
            Helpdesk{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #d0f0fc, #ffffff)" }}
            >
              MIS
            </span>
          </h1>

          <p className="text-blue-50 text-lg md:text-xl max-w-xl mb-4 leading-relaxed">
            Portal Resmi Layanan Teknologi Informasi
          </p>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl mb-12 leading-relaxed opacity-90">
            Perumda Air Minum Tirta Kahuripan Kabupaten Bogor. Laporkan gangguan IT, buat tiket,
            dan pantau progres penanganan secara cepat, transparan, dan terintegrasi.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/login"
              id="cta-masuk"
              className="group flex items-center gap-2 bg-white text-[#0e7fb0] font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm"
            >
              Masuk ke Portal
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section className="relative z-10 px-6 pb-20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">

            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                  </svg>
                ),
                title: "Sistem Tiket",
                desc: "Buat dan pantau tiket gangguan IT secara real-time.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                ),
                title: "Aman & Terenkripsi",
                desc: "Data pegawai terlindungi dengan autentikasi berlapis.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                  </svg>
                ),
                title: "Laporan & Analitik",
                desc: "Dashboard monitoring dan statistik layanan IT.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-6 text-white hover:bg-white/25 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-1">{f.title}</h3>
                <p className="text-blue-100 text-sm opacity-90">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER WAVE */}
        <footer className="relative z-10 mt-auto">
          {/* Wave SVG top of footer */}
          <div className="w-full overflow-hidden leading-none">
            <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-20">
              <path d="M0,40 C180,90 360,0 540,45 C720,90 900,10 1080,50 C1260,85 1380,20 1440,40 L1440,90 L0,90 Z" fill="#0a4f6e" />
              <path d="M0,60 C200,20 400,80 600,55 C800,30 1000,75 1200,50 C1320,35 1400,65 1440,60 L1440,90 L0,90 Z" fill="#0d6b8f" opacity="0.6" />
            </svg>
          </div>

          {/* Footer body */}
          <div className="bg-[#0a4f6e] px-8 pb-10">
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">

              {/* Col 1: Brand */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Image src="/PdamLogo.svg" alt="Logo PDAM" width={36} height={36} />
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">Perumda Air Minum</p>
                    <p className="text-cyan-200 text-xs">Tirta Kahuripan</p>
                  </div>
                </div>
                <p className="text-cyan-100/70 text-xs leading-relaxed max-w-[220px]">
                  Portal resmi layanan teknologi informasi bagi seluruh pegawai Perumda Air Minum Tirta Kahuripan Kabupaten Bogor.
                </p>
                {/* Social icons */}
                <div className="flex gap-3 mt-1">
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.7-8 5.334L4 8.7V6.297l8 5.333 8-5.333V8.7z"/></svg>
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  </span>
                </div>
              </div>

              {/* Col 2: Layanan */}
              <div>
                <h4 className="text-white font-semibold text-sm mb-4">Layanan</h4>
                <ul className="space-y-2">
                  {["Buat Tiket", "Pantau Progres", "FAQ & Panduan", "IT Support"].map(item => (
                    <li key={item}>
                      <Link href="/login" className="text-cyan-100/70 text-xs hover:text-white transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3: Informasi */}
              <div>
                <h4 className="text-white font-semibold text-sm mb-4">Informasi</h4>
                <ul className="space-y-2">
                  {["Tentang MIS", "Kebijakan Privasi", "Syarat & Ketentuan"].map(item => (
                    <li key={item}>
                      <span className="text-cyan-100/70 text-xs hover:text-white transition-colors cursor-pointer">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-cyan-100/50 text-xs">
                © {new Date().getFullYear()} Perumda Air Minum Tirta Kahuripan Kabupaten Bogor
              </p>
              <p className="text-cyan-100/40 text-xs">Divisi Management Information System</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
