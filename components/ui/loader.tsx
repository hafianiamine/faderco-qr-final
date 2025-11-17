"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  delay?: number
  showText?: boolean
  fullScreen?: boolean // Add this property
}

export function PageLoader({
  size = "md",
  className,
  delay = 800, // Increased delay before showing loader
  showText = false,
  fullScreen = false, // Default to false
  ...props
}: LoaderProps) {
  const [showLoader, setShowLoader] = useState(delay === 0)
  const [progress, setProgress] = useState(0)

  // Simulate progress for better UX
  useEffect(() => {
    if (!showLoader) return

    // Start with quick progress that slows down
    const initialInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) return prev + 2
        if (prev < 50) return prev + 1
        if (prev < 70) return prev + 0.5
        if (prev < 85) return prev + 0.2
        return prev
      })
    }, 100)

    return () => clearInterval(initialInterval)
  }, [showLoader])

  // Show loader after delay
  useEffect(() => {
    if (delay === 0) return

    const timer = setTimeout(() => {
      setShowLoader(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!showLoader) return null

  return (
    <div
      className={cn(
        fullScreen
          ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-background/80 to-background/95 backdrop-blur-sm"
          : "relative flex flex-col items-center justify-center py-8",
        className,
      )}
      {...props}
    >
      <div className="w-full max-w-md px-4">
        <div className="space-y-4">
          {/* Animated logo */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.5,
              }}
              className="relative"
            >
              <div className="relative h-16 w-16 flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-primary/40"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  D
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/80 via-primary to-primary/80 rounded-full"
              initial={{ width: "5%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Progress percentage */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {showText && "Loading your dashboard"}
            </motion.span>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {Math.round(progress)}%
            </motion.span>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center">
            <div className="flex space-x-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  animate={{
                    y: ["0%", "-50%", "0%"],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Inline loader for smaller UI elements
export function InlineLoader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center space-x-1.5", className)} {...props}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary"
          animate={{
            y: ["0%", "-50%", "0%"],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// Export both loaders
export const Loader = PageLoader
