import { Bot, Sparkles } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white flex items-center justify-center">
          <Sparkles className="h-2 w-2 text-white" />
        </div>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
        InterviewAI
      </span>
    </div>
  )
}