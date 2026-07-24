"use client"

import { useState, useEffect, useMemo } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, ArrowDownRight, ArrowUpRight, Loader2, RefreshCw } from "lucide-react"
import { getTicketTrends } from "@/app/actions/dashboard"

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

export function TicketTrendsChart({ initialData, initialMonth, initialYear }: { 
  initialData: any, 
  initialMonth: number, 
  initialYear: number 
}) {
  const [data, setData] = useState(initialData)
  const [selectedMonth, setSelectedMonth] = useState(initialMonth.toString())
  const [selectedYear, setSelectedYear] = useState(initialYear.toString())
  const [isLoading, setIsLoading] = useState(false)

  // Generate last 5 years for the dropdown
  const years = useMemo(() => {
    const currentY = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => currentY - i)
  }, [])

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      // Don't fetch if it's the initial load
      if (parseInt(selectedMonth) === initialMonth && parseInt(selectedYear) === initialYear && !isLoading) return

      setIsLoading(true)
      try {
        const newData = await getTicketTrends(parseInt(selectedMonth), parseInt(selectedYear))
        if (isMounted) setData(newData)
      } catch (error) {
        console.error("Failed to fetch trends", error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    // Only run if month/year changed from initial
    if (parseInt(selectedMonth) !== initialMonth || parseInt(selectedYear) !== initialYear) {
      fetchData()
    }
    
    return () => { isMounted = false }
  }, [selectedMonth, selectedYear, initialMonth, initialYear])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl shadow-black/5">
          <p className="font-semibold text-slate-800 mb-2">Tanggal {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-slate-600">{entry.name}:</span>
              <span className="font-bold text-slate-800">{entry.value || 0} Tiket</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#1e7fa8]" />
            Tren Tiket Harian
          </h2>
          <p className="text-sm text-slate-500 mt-1">Perbandingan jumlah tiket masuk per hari</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={isLoading}>
            <SelectTrigger className="w-[130px] h-9 text-xs bg-slate-50">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear} disabled={isLoading}>
            <SelectTrigger className="w-[90px] h-9 text-xs bg-slate-50">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button 
            onClick={() => {
              if (!isLoading) {
                setIsLoading(true)
                getTicketTrends(parseInt(selectedMonth), parseInt(selectedYear))
                  .then(setData)
                  .finally(() => setIsLoading(false))
              }
            }}
            className="h-9 w-9 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#1e7fa8]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center gap-6 mb-6 px-1">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">{MONTHS[parseInt(selectedMonth)-1]} {selectedYear}</p>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{data.totalCurrent}</span>
            <div className={`flex items-center text-xs font-medium pb-1 ${data.percentageChange > 0 ? 'text-red-500' : data.percentageChange < 0 ? 'text-green-500' : 'text-slate-400'}`}>
              {data.percentageChange > 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : data.percentageChange < 0 ? <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> : null}
              {Math.abs(data.percentageChange)}% vs bln lalu
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[250px] relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-[1px] rounded-lg">
            <Loader2 className="w-8 h-8 text-[#1e7fa8] animate-spin" />
          </div>
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e7fa8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#1e7fa8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickMargin={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            {/* Previous Month (Dashed, gray) */}
            <Area 
              type="monotone" 
              dataKey="previous" 
              name="Bulan Lalu" 
              stroke="#94a3b8" 
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="transparent" 
              activeDot={{ r: 4, fill: '#94a3b8', stroke: '#fff', strokeWidth: 2 }}
            />
            
            {/* Current Month (Solid, primary color) */}
            <Area 
              type="monotone" 
              dataKey="current" 
              name="Bulan Ini" 
              stroke="#1e7fa8" 
              strokeWidth={3}
              fill="url(#colorCurrent)" 
              activeDot={{ r: 6, fill: '#1e7fa8', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
