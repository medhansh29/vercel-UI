"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tag, Paperclip, Send, Loader2, X } from "lucide-react"
import type { Audience } from "@/types/audience"

interface ModificationChatProps {
  selectedAudiences: Audience[]
  onSubmit: (selectedAudienceIds: string[], prompt: string) => void
  onRemoveAudience: (audienceId: string) => void
  isModifying: boolean
  disabled: boolean
}

const quickActions = [
  {
    title: "Refine Selection",
    description: "Make audiences more specific",
    prompt: "Make these audiences more specific and targeted",
  },
  {
    title: "Expand Selection",
    description: "Include similar user groups",
    prompt: "Expand these audiences to include similar user groups",
  },
  {
    title: "Find Alternatives",
    description: "Suggest better options",
    prompt: "Suggest better alternative audiences based on these selections",
  },
]

export function ModificationChat({
  selectedAudiences,
  onSubmit,
  onRemoveAudience,
  isModifying,
  disabled,
}: ModificationChatProps) {
  const [prompt, setPrompt] = useState("")
  const [showQuickActions, setShowQuickActions] = useState(false)

  const handleSubmit = () => {
    if (!prompt.trim() || selectedAudiences.length === 0) return

    const selectedIds = selectedAudiences.map((aud) => aud.id)
    console.log("Submitting modification for audience IDs:", selectedIds)
    console.log("Selected audiences:", selectedAudiences)
    console.log("Modification prompt:", prompt)

    onSubmit(selectedIds, prompt)
    setPrompt("")
    setShowQuickActions(false)
  }

  const handleQuickAction = (actionPrompt: string) => {
    if (selectedAudiences.length === 0) return

    const selectedIds = selectedAudiences.map((aud) => aud.id)
    onSubmit(selectedIds, actionPrompt)
    setShowQuickActions(false)
  }

  const handleClearAll = () => {
    selectedAudiences.forEach((audience) => {
      onRemoveAudience(audience.id)
    })
    setPrompt("")
    setShowQuickActions(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Selected Audiences Tags and Modify Button */}
      {selectedAudiences.length > 0 && (
        <div className="mb-3 space-y-1.5">
          <div className="flex flex-wrap gap-1">
            {selectedAudiences.map((audience) => (
              <Badge
                key={audience.id}
                variant="secondary"
                className="bg-blue-100 text-blue-800 border-blue-200 pr-1 max-w-[120px] h-5 text-xs"
              >
                <div className="flex items-center space-x-1">
                  <span className="truncate font-medium">{audience.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveAudience(audience.id)}
                    className="h-3 w-3 p-0 ml-1 hover:bg-blue-200 rounded-full"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              </Badge>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="h-5 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Modify
            </Button>
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-gray-700">Quick Actions</h4>
              <div className="grid grid-cols-1 gap-1">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isModifying}
                    className="h-auto p-1.5 text-left justify-start hover:bg-gray-50 text-xs"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="h-auto p-1.5 text-left justify-start hover:bg-red-50 text-red-600 border-red-200 text-xs"
                >
                  <div>
                    <div className="font-medium">Clear All</div>
                    <div className="text-xs text-red-500">Start fresh</div>
                  </div>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Input - Fixed positioning */}
      <div className="mt-auto">
        <div className="bg-white rounded-xl border border-gray-200 h-32 flex flex-col">
          {/* Selected Agent/Audiences Tag */}
          {selectedAudiences.length > 0 && (
            <div className="p-2 pb-1 border-b border-gray-100">
              <div className="flex items-center space-x-1.5 text-gray-600">
                <Tag className="w-3 h-3" />
                <span className="text-xs">
                  {selectedAudiences.length} audience{selectedAudiences.length > 1 ? "s" : ""} selected
                </span>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-2 flex-1 flex flex-col min-h-0">
            <div className="relative flex-1 flex flex-col min-h-0">
              <Textarea
                placeholder={
                  selectedAudiences.length === 0 ? "Select audiences to start..." : "Message to slothpilot..."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 min-h-0 h-full resize-none border-0 bg-transparent text-xs placeholder:text-gray-400 focus:ring-0 focus:border-0 pr-16 p-0"
                disabled={disabled || selectedAudiences.length === 0}
              />

              {/* Action Buttons - Fixed to bottom right */}
              <div className="absolute bottom-1 right-1 flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <Paperclip className="w-2.5 h-2.5" />
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isModifying || disabled || selectedAudiences.length === 0}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-2 py-1 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs h-6"
                >
                  {isModifying ? (
                    <>
                      <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                      <span>Sending</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-1">Send</span>
                      <Send className="w-2.5 h-2.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Helper text */}
        {selectedAudiences.length === 0 && (
          <p className="text-xs text-gray-500 mt-1.5 text-center">
            Select audiences from the right to start modifying them with AI.
          </p>
        )}
      </div>
    </div>
  )
}
