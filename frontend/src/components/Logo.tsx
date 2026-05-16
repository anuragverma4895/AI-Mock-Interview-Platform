import { Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const isSmall = size === "sm"

  return (
    <div className={cn("flex items-center", isSmall ? "space-x-2" : "space-x-3", className)}>
      <div
        className={cn(
          "rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 border border-emerald-300 dark:border-slate-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 dark:shadow-slate-900/40 hover:scale-105 transition-transform duration-300",
          isSmall ? "h-8 w-8" : "h-10 w-10"
        )}
      >
        <Target className={cn("text-white dark:text-slate-200", isSmall ? "h-5 w-5" : "h-6 w-6")} />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700 dark:from-slate-200 dark:via-slate-300 dark:to-white bg-clip-text text-transparent tracking-tight",
            isSmall ? "text-lg" : "text-2xl"
          )}
        >
          InterviewAI
        </span>
      )}
    </div>
  )
}
