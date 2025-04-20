"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gauge } from "@/components/guage"
import { AlertCircle, Power, Thermometer } from "lucide-react"

export default function DistillationControl() {
  // State for mode selection
  const [mode, setMode] = useState<"temperature" | "power">("temperature")

  // State for setpoint values
  const [temperatureSetpoint, setTemperatureSetpoint] = useState(75)
  const [powerSetpoint, setPowerSetpoint] = useState(50)

  // State for current readings (simulated)
  const [currentTemperature, setCurrentTemperature] = useState(22)
  const [currentPower, setCurrentPower] = useState(0)

  // State for system status
  const [isRunning, setIsRunning] = useState(true)

  // Simulate temperature and power changes
  useEffect(() => {
    if (!isRunning) {
      // If system is off, gradually decrease temperature and set power to 0
      const cooldownInterval = setInterval(() => {
        setCurrentTemperature((prev) => {
          const newTemp = Math.max(22, prev - 0.5)
          if (newTemp === 22) clearInterval(cooldownInterval)
          return newTemp
        })
        setCurrentPower(0)
      }, 1000)

      return () => clearInterval(cooldownInterval)
    }

    const interval = setInterval(() => {
      if (mode === "temperature") {
        // Simulate temperature control
        const diff = temperatureSetpoint - currentTemperature
        const newPower = Math.min(100, Math.max(0, currentPower + (diff > 0 ? 2 : -2)))
        setCurrentPower(newPower)

        // Temperature changes based on power
        setCurrentTemperature((prev) => {
          const change = (newPower / 100) * 0.5 - 0.1
          return Math.max(22, Math.min(150, prev + change))
        })
      } else {
        // Direct power control
        setCurrentPower(powerSetpoint)

        // Temperature changes based on power
        setCurrentTemperature((prev) => {
          const change = (powerSetpoint / 100) * 0.5 - 0.1
          return Math.max(22, Math.min(150, prev + change))
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, mode, temperatureSetpoint, powerSetpoint, currentTemperature, currentPower])

  // Handle emergency shutdown
  const handleEmergencyOff = () => {
    setIsRunning(false)
  }

  // Handle system restart
  const handleRestart = () => {
    setIsRunning(true)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">System Status</CardTitle>
          <CardDescription>{isRunning ? "System is operational" : "System is currently offline"}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-gray-50 p-4">
              <Thermometer className="h-8 w-8 text-red-500" />
              <div className="text-sm font-medium text-gray-500">Current Temperature</div>
              <div className="text-3xl font-bold">{currentTemperature.toFixed(1)}°C</div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-gray-50 p-4">
              <Power className="h-8 w-8 text-yellow-500" />
              <div className="text-sm font-medium text-gray-500">Current Power</div>
              <div className="text-3xl font-bold">{currentPower.toFixed(0)}%</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {isRunning ? (
            <Button variant="destructive" size="lg" onClick={handleEmergencyOff}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Emergency Off
            </Button>
          ) : (
            <Button variant="outline" size="lg" onClick={handleRestart}>
              <Power className="mr-2 h-4 w-4" />
              Restart System
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Control Mode</CardTitle>
          <CardDescription>Select operation mode for the distillation apparatus</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as "temperature" | "power")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="temperature">Temperature Set Mode</TabsTrigger>
              <TabsTrigger value="power">Power Set Mode</TabsTrigger>
            </TabsList>
            <TabsContent value="temperature" className="mt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature">Temperature Setpoint (°C)</Label>
                  <span className="text-sm font-medium">{temperatureSetpoint}°C</span>
                </div>
                <Slider
                  id="temperature"
                  min={25}
                  max={150}
                  step={1}
                  value={[temperatureSetpoint]}
                  onValueChange={(value) => setTemperatureSetpoint(value[0])}
                  disabled={!isRunning}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>25°C</span>
                  <span>150°C</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temp-input">Precise Temperature</Label>
                <Input
                  id="temp-input"
                  type="number"
                  min={25}
                  max={150}
                  value={temperatureSetpoint}
                  onChange={(e) => setTemperatureSetpoint(Number(e.target.value))}
                  disabled={!isRunning}
                />
              </div>
            </TabsContent>
            <TabsContent value="power" className="mt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="power">Power Setpoint (%)</Label>
                  <span className="text-sm font-medium">{powerSetpoint}%</span>
                </div>
                <Slider
                  id="power"
                  min={0}
                  max={100}
                  step={1}
                  value={[powerSetpoint]}
                  onValueChange={(value) => setPowerSetpoint(value[0])}
                  disabled={!isRunning}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="power-input">Precise Power</Label>
                <Input
                  id="power-input"
                  type="number"
                  min={0}
                  max={100}
                  value={powerSetpoint}
                  onChange={(e) => setPowerSetpoint(Number(e.target.value))}
                  disabled={!isRunning}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Monitoring</CardTitle>
          <CardDescription>Real-time visualization of system parameters</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-6">
          <Gauge value={currentTemperature} max={150} label="Temperature" units="°C" />
          <Gauge value={currentPower} max={100} label="Power" units="%" />
        </CardContent>
      </Card>
    </div>
  )
}
