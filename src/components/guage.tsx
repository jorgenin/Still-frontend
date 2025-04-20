"use client"

import { useEffect, useRef } from "react"

interface GaugeProps {
  value: number
  max: number
  label: string
  units: string
}

export function Gauge({ value, max, label, units }: GaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Calculate dimensions
    const centerX = rect.width / 2
    const centerY = rect.height * 0.6
    const radius = Math.min(centerX, centerY) * 0.8

    // Draw background arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false)
    ctx.lineWidth = 10
    ctx.strokeStyle = "#e5e7eb"
    ctx.stroke()

    // Draw value arc
    const percentage = Math.min(1, value / max)
    const startAngle = Math.PI
    const endAngle = startAngle + percentage * Math.PI

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false)
    ctx.lineWidth = 10

    // Gradient color based on value
    let color
    if (percentage < 0.3) {
      color = "#22c55e" // Green for low values
    } else if (percentage < 0.7) {
      color = "#eab308" // Yellow for medium values
    } else {
      color = "#ef4444" // Red for high values
    }

    ctx.strokeStyle = color
    ctx.stroke()

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI, false)
    ctx.fillStyle = "#9ca3af"
    ctx.fill()

    // Draw tick marks
    for (let i = 0; i <= 10; i++) {
      const angle = Math.PI + (i / 10) * Math.PI
      const innerRadius = radius * 0.8
      const outerRadius = radius * 1.05

      const startX = centerX + innerRadius * Math.cos(angle)
      const startY = centerY + innerRadius * Math.sin(angle)
      const endX = centerX + outerRadius * Math.cos(angle)
      const endY = centerY + outerRadius * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.lineWidth = i % 5 === 0 ? 3 : 1
      ctx.strokeStyle = "#9ca3af"
      ctx.stroke()

      // Add labels for major ticks
      if (i % 5 === 0) {
        const labelRadius = radius * 1.15
        const labelX = centerX + labelRadius * Math.cos(angle)
        const labelY = centerY + labelRadius * Math.sin(angle)

        ctx.font = "10px sans-serif"
        ctx.fillStyle = "#6b7280"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${Math.round((i / 10) * max)}`, labelX, labelY)
      }
    }

    // Draw value text
    ctx.font = "bold 24px sans-serif"
    ctx.fillStyle = "#1f2937"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${value.toFixed(1)}${units}`, centerX, centerY * 1.5)
  }, [value, max, units])

  return (
    <div className="flex w-full flex-col items-center">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="relative h-40 w-full">
        <canvas ref={canvasRef} className="h-full w-full"></canvas>
      </div>
    </div>
  )
}
