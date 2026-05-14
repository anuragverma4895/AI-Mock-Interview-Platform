import { Target, CheckCircle } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 border-2 border-emerald-200 dark:border-slate-600 flex items-center justify-center shadow-xl shadow-emerald-500/40 dark:shadow-slate-900/50 hover:scale-105 transition-transform duration-300">
          <Target className="h-6 w-6 text-white dark:text-emerald-400" />
        </div>
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 dark:from-yellow-400 dark:to-orange-500 border-2 border-white dark:border-slate-800 flex items-center justify-center">
          <CheckCircle className="h-2.5 w-2.5 text-white dark:text-slate-900" />
        </div>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 dark:from-slate-200 dark:via-slate-100 dark:to-white bg-clip-text text-transparent tracking-tight drop-shadow-sm dark:drop-shadow-none">
        InterviewAI
      </span>
    </div>
  )
}