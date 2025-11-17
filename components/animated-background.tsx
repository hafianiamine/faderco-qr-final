"use client"

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] animate-blob rounded-full bg-blue-200/30 opacity-60 blur-3xl" />
      <div className="animation-delay-2000 absolute -right-1/4 top-1/3 h-[600px] w-[600px] animate-blob rounded-full bg-blue-300/20 opacity-60 blur-3xl" />
      <div className="animation-delay-4000 absolute bottom-0 left-1/3 h-[550px] w-[550px] animate-blob rounded-full bg-blue-100/40 opacity-60 blur-3xl" />
    </div>
  )
}
