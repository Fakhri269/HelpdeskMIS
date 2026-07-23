<div align="center">
  <h1><img src="public/PdamLogo.svg" alt="PDAM Logo" width="32" height="32" style="vertical-align: middle; margin-right: 8px;" /> Helpdesk MIS</h1>
  <p><strong>Perumda Air Minum Tirta Kahuripan</strong></p>
  <p>Sistem Informasi Manajemen Layanan IT (IT Service Management) yang dirancang khusus untuk memfasilitasi komunikasi dan pelaporan masalah teknis antara karyawan dan tim IT di Perumda Air Minum Tirta Kahuripan Kabupaten Bogor.</p>
</div>

<hr />

## Deskripsi Sistem

Helpdesk MIS hadir sebagai solusi digital untuk menyederhanakan proses pelaporan gangguan (ticketing system). Dengan arsitektur yang modern, sistem ini memungkinkan staf IT untuk memberikan dukungan yang responsif, terstruktur, dan terukur secara instan.

## Fitur Utama

- **Sistem Real-Time:** Pelaporan tiket dan komunikasi pesan terjadi secara instan menggunakan protokol WebSocket, tanpa perlu memuat ulang halaman.
- **Desain Responsif:** Antarmuka (User Interface) dirancang sangat bersih dan modern, mendukung penggunaan lintas perangkat (Desktop, Tablet, dan Smartphone).
- **Manajemen Tiket Terpusat:** Pengguna dapat melaporkan kendala pada Jaringan, Komputer, Printer, Software, hingga Sistem GIS dengan tingkat prioritas yang jelas.
- **Integrasi Live Chat:** Komunikasi dua arah secara langsung antara pelapor dan tim IT di dalam detail tiket yang sedang ditangani.
- **Dashboard Analitik:** Panel khusus bagi tim IT dan Administrator untuk memantau metrik beban kerja, status tiket (Open, Pending, Resolved), dan performa penanganan.
- **Role-Based Access Control (RBAC):** Sistem keamanan berlapis yang membatasi hak akses berdasarkan peran pengguna (User, Staff IT, Administrator).

## Filosofi Desain

Tampilan antarmuka Helpdesk MIS dibangun dengan konsep ***Fluid Design***. Elemen visual dan latar belakang aplikasi didominasi oleh bentuk lekuk yang mengalir bebas (ombak/gelombang) dipadukan dengan gradasi warna *cyan*, *teal*, dan biru cerah. 

Filosofi ini secara langsung merepresentasikan identitas perusahaan air minum (PDAM) — melambangkan kejernihan, kesegaran, aliran komunikasi yang lancar, serta pelayanan IT yang transparan dan selalu mengalir tanpa henti untuk menyelesaikan setiap kendala teknis.

## Arsitektur Teknologi

Sistem ini dibangun dengan stack teknologi modern untuk menjamin kecepatan, keamanan, dan skalabilitas jangka panjang:

**Frontend & Backend (Fullstack)**
- Next.js (React)
- Tailwind CSS (Styling)
- Framer Motion (Animasi UI)
- Radix UI & Lucide React (Komponen)

**Data & Infrastruktur**
- Supabase (PostgreSQL Database)
- Prisma (Object-Relational Mapping)
- NextAuth.js v5 (Autentikasi & Sesi)
- Pusher (Real-time WebSockets)
- Vercel (Deployment & Hosting)

<hr />

<div align="center">
  <p>Dikembangkan secara khusus oleh <strong>Fakhri Sidqi</strong> untuk Perumda Air Minum Tirta Kahuripan.</p>
</div>
