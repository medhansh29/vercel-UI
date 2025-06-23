"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, Sparkles, Zap, Users } from "lucide-react"
import { useEffect, useState } from "react"
import type { Audience } from "@/types/audience"

interface GrowthLeverLoadingProps {
  selectedAudiences: Audience[]
}

export function GrowthLeverLoading({ selectedAudiences }: GrowthLeverLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    "Analyzing selected audiences...",
    "Identifying growth opportunities...",
    "Generating targeted strategies...",
    "Optimizing lever recommendations...",
    "Finalizing growth levers...",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return 95
        }
        return prev + Math.random() * 8 + 2
      })
    }, 300)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 1500)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Generating Growth Levers</h2>
              <p className="text-gray-600">
                Creating personalized growth strategies for your {selectedAudiences.length} selected audiences
              </p>
            </div>

            {/* Selected Audiences */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Analyzing Audiences:</h3>
              <div className="grid grid-cols-1 gap-2">
                {selectedAudiences.map((audience, index) => (
                  <div
                    key={audience.id}
                    className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 text-sm">{audience.name}</p>
                      <p className="text-xs text-gray-600">
                        {audience.estimated_size?.toLocaleString() || "1,576"} people
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-xs text-purple-600 font-medium">AI</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-4">
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-sm text-gray-700 font-medium">{steps[currentStep]}</span>
              </div>
              <p className="text-xs text-gray-500">{Math.round(progress)}% complete</p>
            </div>

            {/* Expected Output */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Expected Output</span>
              </div>
              <p className="text-xs text-green-700">
                {selectedAudiences.length * 2}-{selectedAudiences.length * 4} personalized growth levers tailored to
                each audience segment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
