"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, AlertTriangle, WifiOff } from "lucide-react"

export default function HeaterControl() {
  const [power, setPower] = useState<number>(0)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const maxPower = 7.2
  const dangerThreshold = 5
  const isDangerZone = power > dangerThreshold

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('//heater.local/heater/current')
        setIsConnected(response.ok)
      } catch (error) {
        console.error('Error checking connection:', error)
        setIsConnected(false)
      }
    }

    // Initial check
    void checkConnection()

    // Set up polling interval
    const interval = setInterval(() => {
      void checkConnection()
    }, 1000)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [])

  // Calculate percentage for visual indicators
  const powerPercentage = (power / maxPower) * 100

  // Format power display
  const formattedPower = power.toFixed(1)

  const updateHeaterPower = async (newPower: number | 'off') => {
    if (!isConnected) return

    try {
      const p = newPower === 'off' ? 'off' : (newPower / maxPower).toString()
      const response = await fetch(`//heater.local/heater/power?p=${p}`)
      if (!response.ok) {
        console.error('Failed to update heater power')
      }
    } catch (error) {
      console.error('Error updating heater power:', error)
    }
  }

  const handlePowerChange = (values: number[]) => {
    const newPower = values[0] ?? 0
    setPower(newPower)
    void updateHeaterPower(newPower)
  }

  const handleTurnOff = () => {
    setPower(0)
    void updateHeaterPower('off')
  }

  return (
    <main className="flex  flex-col items-center justify-center bg-gray-50 p-4">
      <Card className={`w-full max-w-md ${!isConnected ? 'opacity-50' : ''}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Heater Control</CardTitle>
          {!isConnected && (
            <div className="flex items-center justify-center gap-2 text-red-500 mt-2">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">No device detected</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Power display */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center gap-2">
              <Flame
                className={`h-6 w-6 ${isDangerZone ? "text-red-500" : "text-orange-400"}`}
                fill={isDangerZone ? "#ef4444" : "#fb923c"}
              />
              <span className="text-4xl font-bold">
                {formattedPower}
                <span className="text-2xl font-normal">KW</span>
              </span>
            </div>

            {isDangerZone && (
              <div className="flex items-center gap-1 text-red-500 animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Danger Zone</span>
              </div>
            )}
          </div>

          {/* Power bar visualization */}
          <div className="h-4 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full rounded-full ${isDangerZone ? "bg-red-500" : "bg-orange-400"}`}
              style={{ width: `${powerPercentage}%` }}
            />
          </div>

          {/* Slider control */}
          <div className="pt-6 pb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>0KW</span>
              <span className="text-red-500 font-medium">Danger Zone</span>
              <span>7.2KW</span>
            </div>
            <div className="relative">
              {/* Danger zone indicator */}
              <div
                className="absolute h-1 bg-red-100 rounded-r-full top-[9px] right-0 z-0"
                style={{ width: `${(1 - dangerThreshold / maxPower) * 100}%` }}
              />

              <Slider
                defaultValue={[0]}
                max={maxPower}
                step={0.1}
                value={[power]}
                onValueChange={handlePowerChange}
                className={`${isDangerZone ? "slider-danger" : ""}`}
                disabled={!isConnected}
              />
            </div>
          </div>

          {/* Power status */}
          <div className="text-center text-sm font-medium">
            {!isConnected ? (
              <span className="text-gray-500">Waiting for device connection...</span>
            ) : power === 0 ? (
              <span className="text-gray-500">Heater is off</span>
            ) : isDangerZone ? (
              <span className="text-red-500">High power consumption!</span>
            ) : (
              <span className="text-green-600">Heater is running efficiently</span>
            )}
          </div>

          {/* Off button */}
          <div className="pt-4 flex justify-center">
            <Button
              variant="destructive"
              size="lg"
              className="w-full max-w-[200px] gap-2 font-medium"
              onClick={handleTurnOff}
              disabled={power === 0 || !isConnected}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                <line x1="12" y1="2" x2="12" y2="12"></line>
              </svg>
              Turn Off
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
