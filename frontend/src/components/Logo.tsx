import { Target, CheckCircle } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-xl shadow-emerald-500/40 hover:scale-105 transition-transform duration-300">
          <Target className="h-6 w-6 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 border-2 border-white flex items-center justify-center">
          <CheckCircle className="h-2.5 w-2.5 text-white" />
        </div>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
        InterviewAI
      </span>
    </div>
  )
}