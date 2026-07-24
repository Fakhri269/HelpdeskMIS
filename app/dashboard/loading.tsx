import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-in fade-in duration-300">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-[#1e7fa8] blur-xl opacity-20 rounded-full animate-pulse"></div>
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center relative z-10">
            <Loader2 className="w-8 h-8 text-[#1e7fa8] animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800">Memuat Data...</h3>
          <p className="text-sm text-slate-500 mt-1">Mengambil informasi terbaru dari server.</p>
        </div>
      </div>
    </div>
  )
}
