"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Send, Loader2, Plus, Users, Target, Zap, CheckCircle } from "lucide-react"
import type { Audience } from "@/types/audience"

interface ChatInterfaceProps {
  selectedAudiencesForModification: Audience[]
  onModificationSubmit: (selectedAudienceIds: string[], prompt: string) => void
  onRemoveAudienceFromModification: (audienceId: string) => void
  onGenerate: (prompt: string) => void
  isModifying: boolean
  isGenerating: boolean
  audiences: Audience[]
  selectedAudienceForAI?: Audience | null
}

export function ChatInterface({
  selectedAudiencesForModification,
  onModificationSubmit,
  onRemoveAudienceFromModification,
  onGenerate,
  isModifying,
  isGenerating,
  audiences,
  selectedAudienceForAI,
}: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState("")

  const steps = [
    {
      id: 1,
      name: "Audience Generation",
      icon: Users,
      status: audiences.length > 0 ? "completed" : "active",
      description: `${audiences.length} audiences generated`,
    },
    {
      id: 2,
      name: "Growth Lever Configuration",
      icon: Target,
      status: "inactive",
      description: "Configure growth strategies",
    },
    {
      id: 3,
      name: "Campaign Generation",
      icon: Zap,
      status: "inactive",
      description: "Generate marketing campaigns",
    },
  ]

  const handleSubmit = () => {
    if (!prompt.trim()) return

    if (selectedAudienceForAI) {
      onModificationSubmit([selectedAudienceForAI.id], prompt)
    } else {
      onGenerate(prompt)
    }
    setPrompt("")
  }

  const handleSampleGeneration = () => {
    onGenerate("Generate sample audiences for an e-commerce fashion brand targeting young professionals")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100"
      case "active":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-400 bg-gray-100"
    }
  }

  const progressPercentage = (audiences.length > 0 ? 1 : 0) * 33.33

  // Helper function to get descriptive title (same logic as in audience-selection)
  const getDescriptiveTitle = (audience: Audience) => {
    const titles = [
      "High-Value Customer Segment with Strong Purchase Intent",
      "Engaged Users Ready for Premium Feature Adoption",
      "Growth-Oriented Professionals Seeking Advanced Solutions",
      "Active Community Members with High Engagement Rates",
      "Strategic Decision Makers in Target Demographics",
    ]

    const hash = audience.id.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    return titles[Math.abs(hash) % titles.length] || audience.name
  }

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Progress Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Campaign Creation</h2>
          <Progress value={progressPercentage} className="h-2 mb-4" />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = step.status === "active"
            const isCompleted = step.status === "completed"
            const isInactive = step.status === "inactive"

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-50 border border-blue-200"
                    : isCompleted
                      ? "bg-green-50 border border-green-200"
                      : "bg-gray-50 border border-gray-200 opacity-50"
                }`}
              >
                <div className={`p-2 rounded-full ${getStepColor(step.status)}`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${isInactive ? "text-gray-400" : "text-gray-900"}`}>
                    Step {step.id}: {step.name}
                  </h3>
                  <p className={`text-sm ${isInactive ? "text-gray-400" : "text-gray-600"}`}>{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Generation Status */}
        {isGenerating && (
          <div className="flex items-center space-x-2 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-800">Generating audiences...</span>
          </div>
        )}

        {/* Sample Generation Button */}
        {audiences.length === 0 && !isGenerating && (
          <div className="mt-4">
            <Button
              onClick={handleSampleGeneration}
              disabled={isGenerating}
              variant="outline"
              className="w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Sample Audiences
            </Button>
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Selected Audience for AI Modification */}
        {selectedAudienceForAI && (
          <div className="p-4 border-b border-gray-100 bg-purple-50">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Modifying with AI</h4>
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <h5 className="font-medium text-gray-900 text-sm mb-1">{getDescriptiveTitle(selectedAudienceForAI)}</h5>
              <p className="text-xs text-gray-600">
                Estimated Size: {selectedAudienceForAI.estimated_size?.toLocaleString() || "1,576"} people
              </p>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="mt-auto p-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Input
              placeholder={
                selectedAudienceForAI
                  ? "Modify selected audience..."
                  : audiences.length > 0
                    ? "Generate more audiences..."
                    : "Describe your target audience..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={isModifying || isGenerating}
            />
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isModifying || isGenerating}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
            >
              {isModifying || isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
