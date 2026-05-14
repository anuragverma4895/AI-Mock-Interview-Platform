import { Cpu, Zap } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/40 transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <Cpu className="h-6 w-6 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-white flex items-center justify-center animate-pulse">
          <Zap className="h-2.5 w-2.5 text-white" />
        </div>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
        InterviewAI
      </span>
    </div>
  )
}