import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen font-sans bg-[#0e7fb0]">
      {/* ── FIXED BACKGROUND GRADIENT ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
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



      {/* ── FLOATING CIRCLES ── */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10 z-0"
        style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }} />
      <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full opacity-10 z-0"
        style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }} />

      {/* ── CONTENT ── */}
      <div className="relative z-10 flex flex-col min-h-[100dvh]">

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

        {/* ── ABOUT & INFO SECTION ── */}
        <section className="relative z-10 px-6 pb-20">
          <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image side */}
              <div className="relative h-56 md:h-auto">
                <Image 
                  src="/gedung-pdam.jpg" 
                  alt="Gedung PDAM Tirta Kahuripan" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e7fb0]/90 via-[#0e7fb0]/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0e7fb0]" />
              </div>
              
              {/* Content side */}
              <div className="p-8 md:p-10 text-white bg-[#0e7fb0]/60 md:bg-transparent">
                <h2 className="text-2xl font-bold mb-4 drop-shadow-sm">Tentang MIS</h2>
                <p className="text-blue-50 text-sm leading-relaxed mb-6">
                  Management Information System (MIS) Perumda Air Minum Tirta Kahuripan adalah divisi yang bertanggung jawab atas pengelolaan, pengembangan, dan pemeliharaan infrastruktur teknologi informasi. Portal Helpdesk ini dirancang untuk mempermudah pegawai dalam melaporkan kendala IT dan mempercepat proses penanganan oleh tim support.
                </p>
                

              </div>
            </div>
          </div>
        </section>

        {/* FOOTER WAVE */}
        <footer className="relative z-10 mt-auto">
          {/* Wave SVG top of footer */}
          <div className="w-full overflow-hidden leading-none">
            <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-20 block">
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
                  <a href="https://www.youtube.com/@perumdaairminumtirtakahuri1494" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#ff0000] hover:text-white transition-colors cursor-pointer text-cyan-100">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4s-6.254,0-7.814,0.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/perumdaairminumtirtakahuripan/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#E1306C] hover:text-white transition-colors cursor-pointer text-cyan-100">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2.163c3.204,0,3.584,0.012,4.85,0.07c1.366,0.062,2.633,0.342,3.608,1.317c0.975,0.975,1.255,2.242,1.317,3.608 c0.058,1.266,0.07,1.646,0.07,4.85s-0.012,3.584-0.07,4.85c-0.062,1.366-0.342,2.633-1.317,3.608 c-0.975,0.975-2.242,1.255-3.608,1.317c-1.266,0.058-1.646,0.07-4.85,0.07s-3.584-0.012-4.85-0.07 c-1.366-0.062-2.633-0.342-3.608-1.317C2.505,19.467,2.225,18.2,2.163,16.834C2.105,15.568,2.093,15.188,2.093,11.984 s0.012-3.584,0.07-4.85C2.225,5.768,2.505,4.501,3.48,3.526C4.455,2.551,5.722,2.271,7.088,2.209 C8.354,2.151,8.734,2.139,11.94,2.139L12,2.163 M12,0C8.741,0,8.333,0.014,7.053,0.072C2.695,0.272,0.272,2.69,0.073,7.053 C0.014,8.333,0,8.741,0,12c0,3.259,0.014,3.667,0.072,4.947c0.199,4.358,2.618,6.78,6.98,6.98C8.333,23.986,8.741,24,12,24 c3.259,0,3.667-0.014,4.947-0.072c4.358-0.199,6.78-2.618,6.98-6.98C23.986,15.667,24,15.259,24,12 c0-3.259-0.014-3.667-0.072-4.947c-0.199-4.358-2.618-6.78-6.98-6.98C15.667,0.014,15.259,0,12,0z"/><path d="M12,5.838c-3.403,0-6.162,2.759-6.162,6.162S8.597,18.162,12,18.162s6.162-2.759,6.162-6.162S15.403,5.838,12,5.838z M12,16C9.791,16,8,14.209,8,12s1.791-4,4-4s4,1.791,4,4S14.209,16,12,16z"/><circle cx="18.406" cy="5.594" r="1.44"/></svg>
                  </a>
                  <a href="https://api.whatsapp.com/send/?phone=%2B6282119969008&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-colors cursor-pointer text-cyan-100">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472,14.382c-0.297-0.149-1.758-0.867-2.03-0.967c-0.273-0.099-0.471-0.148-0.67,0.15 c-0.197,0.297-0.767,0.966-0.94,1.164c-0.173,0.199-0.347,0.223-0.644,0.075c-0.297-0.15-1.255-0.463-2.39-1.475 c-0.883-0.788-1.48-1.761-1.653-2.059c-0.173-0.297-0.018-0.458,0.13-0.606c0.134-0.133,0.298-0.347,0.446-0.52 c0.149-0.174,0.198-0.298,0.298-0.497c0.099-0.198,0.05-0.371-0.025-0.52C10.197,8.882,9.6,7.408,9.353,6.81 C9.112,6.223,8.868,6.305,8.683,6.294C8.508,6.284,8.31,6.282,8.112,6.282c-0.198,0-0.521,0.074-0.793,0.372 C7.046,6.951,6.204,7.744,6.204,9.354C6.204,10.964,7.269,12.5,7.418,12.7c0.149,0.198,2.274,3.473,5.511,4.869 c0.771,0.332,1.373,0.53,1.841,0.678c0.774,0.246,1.478,0.211,2.031,0.128c0.617-0.094,1.895-0.774,2.163-1.523 c0.268-0.748,0.268-1.39,0.188-1.524C18.97,14.654,18.772,14.555,17.472,14.382 M12,21.579c-1.616,0-3.199-0.434-4.587-1.256 l-0.329-0.195l-3.41,0.894l0.912-3.324l-0.214-0.34C3.477,15.938,3,14.004,3,12c0-4.963,4.038-9,9-9c2.406,0,4.667,0.938,6.368,2.639 S21,10.339,21,12.75C21,17.712,16.962,21.75,12.001,21.75H12 M12.002,2C6.478,2,1.996,6.482,1.996,12.006 c0,1.764,0.461,3.487,1.337,5.002L2,22l5.127-1.345c1.464,0.796,3.109,1.216,4.872,1.216C17.522,21.871,22.004,17.389,22,11.865 C22.001,6.342,17.525,2,12.002,2"/></svg>
                  </a>
                  <a href="tel:1500862" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-colors cursor-pointer text-cyan-100" title="Call Center: 1500862">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5C20.55,15.5 21,15.95 21,16.5V20C21,20.55 20.55,21 20,21C10.61,21 3,13.39 3,4C3,3.45 3.45,3 4,3H7.5C8.05,3 8.5,3.45 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/></svg>
                  </a>
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
                  {[
                    { label: "Tentang MIS", href: "/tentang-mis" },
                    { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
                    { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" }
                  ].map(item => (
                    <li key={item.label}>
                      <Link href={item.href} className="text-cyan-100/70 text-xs hover:text-white transition-colors cursor-pointer">
                        {item.label}
                      </Link>
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
