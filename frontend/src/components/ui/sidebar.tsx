import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"
import { ScrollArea } from "@/components/ui/scroll-area"

const SidebarState = React.createContext(false)

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean
  onToggle?: () => void
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, isCollapsed = false, onToggle, children, ...props }, ref) => {
    const [localCollapsed, setLocalCollapsed] = React.useState(false)
    const collapsed = onToggle ? isCollapsed : localCollapsed
    const toggle = onToggle || (() => setLocalCollapsed(value => !value))
    return (
      <SidebarState.Provider value={collapsed}>
      <div
        ref={ref}
        className={cn(
          "flex h-full w-16 sm:w-64 shrink-0 flex-col border-r bg-background/50 backdrop-blur-sm transition-all duration-300",
          collapsed && "sm:w-16",
          className
        )}
        {...props}
      >
        <div className={cn("flex h-16 items-center border-b px-2 sm:px-4", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && <span className="hidden sm:block"><Logo size="sm" /></span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="h-8 w-8 shrink-0 hidden sm:inline-flex"
          >
            <MenuIcon className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {children}
          </nav>
        </ScrollArea>
      </div>
      </SidebarState.Provider>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isActive?: boolean
    icon?: React.ReactNode
  }
>(({ className, isActive, icon, children, ...props }, ref) => {
  const collapsed = React.useContext(SidebarState)
  return (
    <Button
      ref={ref}
      aria-label={typeof children === 'string' ? children : undefined}
      title={typeof children === 'string' ? children : undefined}
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start h-10 px-2 sm:px-3 text-left font-normal",
        isActive && "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100",
        className
      )}
      {...props}
    >
      {icon && <span className={cn("h-4 w-4 shrink-0", !collapsed && "sm:mr-3")}>{icon}</span>}
      {!collapsed && <span className="hidden sm:inline truncate">{children}</span>}
    </Button>
  )
})
SidebarItem.displayName = "SidebarItem"

export { Sidebar, SidebarItem }

// Simple icon component for the menu button
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  )
}
