"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Users, Target, Zap, Tag, Paperclip, Send, Loader2, X, Plus } from "lucide-react"
import type { Audience } from "@/types/audience"

interface ChatSidebarProps {
  currentStep: number
  audiences: Audience[]
  selectedAudiencesForModification: Audience[]
  onStepClick: (stepId: number) => void
  onModificationSubmit: (selectedAudienceIds: string[], prompt: string) => void
  onRemoveAudienceFromModification: (audienceId: string) => void
  onGenerate: (prompt: string) => void
  isModifying: boolean
  isGenerating: boolean
}

export function ChatSidebar({
  currentStep,
  audiences,
  selectedAudiencesForModification,
  onStepClick,
  onModificationSubmit,
  onRemoveAudienceFromModification,
  onGenerate,
  isModifying,
  isGenerating,
}: ChatSidebarProps) {
  const [prompt, setPrompt] = useState("")
  const [showQuickActions, setShowQuickActions] = useState(false)

  const steps = [
    {
      id: 0,
      name: "Audience Selection",
      stepNumber: "1",
      icon: Users,
      count: `${audiences.length} audiences`,
      active: true,
    },
    {
      id: 1,
      name: "Lever Selection",
      stepNumber: "2",
      icon: Target,
      count: "5 levers",
      active: false,
    },
    {
      id: 2,
      name: "Campaign Generation",
      stepNumber: "3",
      icon: Zap,
      count: "0 campaigns",
      active: false,
    },
  ]

  const quickActions = [
    {
      title: "Refine",
      prompt: "Make these audiences more specific and targeted",
    },
    {
      title: "Expand",
      prompt: "Expand these audiences to include similar user groups",
    },
    {
      title: "Alternatives",
      prompt: "Suggest better alternative audiences",
    },
  ]

  const handleSubmit = () => {
    if (!prompt.trim()) return

    if (selectedAudiencesForModification.length > 0) {
      const selectedIds = selectedAudiencesForModification.map((aud) => aud.id)
      onModificationSubmit(selectedIds, prompt)
    } else {
      onGenerate(prompt)
    }
    setPrompt("")
    setShowQuickActions(false)
  }

  const handleQuickAction = (actionPrompt: string) => {
    if (selectedAudiencesForModification.length === 0) return
    const selectedIds = selectedAudiencesForModification.map((aud) => aud.id)
    onModificationSubmit(selectedIds, actionPrompt)
    setShowQuickActions(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-3 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">CAMPAIGN STEPS</h2>
        <div className="space-y-1">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = currentStep === step.id

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-2 p-1 rounded cursor-pointer transition-colors ${
                  isActive ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-600"
                }`}
                onClick={() => (step.active ? onStepClick(step.id) : null)}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                    isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {step.stepNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{step.name}</p>
                  <p className="text-xs text-gray-400 truncate">{step.count}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Audiences */}
      {selectedAudiencesForModification.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center space-x-1 mb-2">
            <Tag className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">Selected for modification</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedAudiencesForModification.map((audience) => (
              <Badge
                key={audience.id}
                variant="secondary"
                className="bg-blue-100 text-blue-800 border-blue-200 pr-1 max-w-[100px] h-4 text-xs"
              >
                <div className="flex items-center space-x-1">
                  <span className="truncate font-medium">{audience.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveAudienceFromModification(audience.id)}
                    className="h-3 w-3 p-0 hover:bg-blue-200 rounded-full"
                  >
                    <X className="h-1.5 w-1.5" />
                  </Button>
                </div>
              </Badge>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="h-5 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 w-full"
            >
              Quick Actions
            </Button>
            {showQuickActions && (
              <div className="mt-1 space-y-1">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isModifying}
                    className="h-5 px-2 text-xs text-left justify-start hover:bg-gray-50 w-full"
                  >
                    {action.title}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="flex-1 flex flex-col p-3">
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-50 rounded-lg border border-gray-200 h-24 flex flex-col">
            <div className="p-2 flex-1 flex flex-col">
              <div className="relative flex-1">
                <Textarea
                  placeholder={
                    selectedAudiencesForModification.length === 0
                      ? "Generate new audiences..."
                      : "Modify selected audiences..."
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-full resize-none border-0 bg-transparent text-xs placeholder:text-gray-400 focus:ring-0 focus:border-0 pr-12 p-0"
                />

                {/* Action Buttons */}
                <div className="absolute bottom-0 right-0 flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-4 h-4 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Paperclip className="w-2 h-2" />
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || isModifying || isGenerating}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-1.5 py-0.5 rounded text-xs h-4"
                  >
                    {isModifying || isGenerating ? (
                      <Loader2 className="w-2 h-2 animate-spin" />
                    ) : (
                      <Send className="w-2 h-2" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        {audiences.length === 0 && (
          <Button
            onClick={() => onGenerate("Generate sample audiences for an e-commerce fashion brand")}
            disabled={isGenerating}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white h-6 text-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 mr-1" />
                Generate Sample
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
