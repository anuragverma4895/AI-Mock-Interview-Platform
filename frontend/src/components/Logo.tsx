import { Target } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 border border-emerald-300 dark:border-slate-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 dark:shadow-slate-900/40 hover:scale-105 transition-transform duration-300">
        <Target className="h-6 w-6 text-white dark:text-slate-200" />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700 dark:from-slate-200 dark:via-slate-300 dark:to-white bg-clip-text text-transparent tracking-tight">
        InterviewAI
      </span>
    </div>
  )
}