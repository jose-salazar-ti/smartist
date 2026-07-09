"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-400" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-400" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-400" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-rose-400" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-indigo-400" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-950/90 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-slate-100 group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:p-3.5 group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3 group-[.toaster]:font-sans",
          description: "group-[.toast]:text-slate-400 group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-indigo-650 group-[.toast]:text-white group-[.toast]:font-semibold group-[.toast]:hover:bg-indigo-600",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-300 group-[.toast]:hover:bg-slate-700",
          success: "group-[.toaster]:border-emerald-500/20 group-[.toaster]:text-emerald-400",
          error: "group-[.toaster]:border-rose-500/20 group-[.toaster]:text-rose-400",
          warning: "group-[.toaster]:border-amber-500/20 group-[.toaster]:text-amber-400",
          info: "group-[.toaster]:border-blue-500/20 group-[.toaster]:text-blue-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
