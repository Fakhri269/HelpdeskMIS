export default function HandLoader({ text = "Memuat data..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full gap-8">
      <div className="🤚">
        <div className="👉"></div>
        <div className="👉"></div>
        <div className="👉"></div>
        <div className="👉"></div>
        <div className="🌴"></div>
        <div className="👍"></div>
      </div>
      <p className="text-slate-500 font-medium animate-pulse">{text}</p>
    </div>
  )
}
