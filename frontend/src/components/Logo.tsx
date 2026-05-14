import { Brain } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        InterviewAI
      </span>
    </div>
  )
}