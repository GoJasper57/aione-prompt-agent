"use client"

import { cn } from "@/lib/utils"

interface ShimmerProps {
  className?: string
  lines?: number
}

export function Shimmer({ className, lines = 3 }: ShimmerProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-lg animate-shimmer"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  )
}

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4", className)}>
      <div className="h-5 w-2/3 rounded-lg animate-shimmer" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded animate-shimmer" />
        <div className="h-3 w-4/5 rounded animate-shimmer" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full animate-shimmer" />
        <div className="h-6 w-20 rounded-full animate-shimmer" />
      </div>
    </div>
  )
}
