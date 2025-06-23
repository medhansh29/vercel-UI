"use client"

import { Separator } from "@/components/ui/separator"
import { Users, Target, Zap } from "lucide-react"
import type { Audience } from "@/types/audience"
import { ModificationChat } from "./modification-chat"

interface ProgressSidebarProps {
  currentStep: number
  audiences: Audience[]
  selectedAudiencesForModification: Audience[]
  onStepClick: (stepId: number) => void
  onModificationSubmit: (selectedAudienceIds: string[], prompt: string) => void
  onRemoveAudienceFromModification: (audienceId: string) => void
  isModifying: boolean
}

export function ProgressSidebar({
  currentStep,
  audiences,
  selectedAudiencesForModification,
  onStepClick,
  onModificationSubmit,
  onRemoveAudienceFromModification,
  isModifying,
}: ProgressSidebarProps) {
  const steps = [
    {
      id: 0,
      name: "Audience Selection",
      stepNumber: "Step 1",
      icon: Users,
      count: `${audiences.length} audiences available`,
      active: true,
    },
    {
      id: 1,
      name: "Lever Selection",
      stepNumber: "Step 2",
      icon: Target,
      count: "5 levers available",
      active: false,
    },
    {
      id: 2,
      name: "Campaign Generation",
      stepNumber: "Step 3",
      icon: Zap,
      count: "0 campaigns available",
      active: false,
    },
  ]

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Campaign Steps */}
          <div className="mb-4">
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2 leading-tight">
                I need to showcase one of the features in my app which is not being used by people. Please provide the
                way to showcase the feature
              </p>
            </div>

            <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">CAMPAIGN STEPS</h2>
            <p className="text-xs text-gray-600 mb-3">
              Follow these steps to create your campaign. Complete each step to proceed to the next.
            </p>

            <div className="space-y-1">
              {steps.map((step) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id

                return (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-2 p-1.5 rounded-md cursor-pointer transition-colors ${
                      isActive ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                    } ${!step.active && !isCompleted ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => (step.active || isCompleted ? onStepClick(step.id) : null)}
                  >
                    <div
                      className={`p-1 rounded-full ${isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}
                    >
                      <Icon className="h-2.5 w-2.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-medium truncate ${isActive ? "text-blue-900" : "text-gray-700"}`}>
                          {step.name}
                        </p>
                        <span className="text-xs text-gray-500 ml-1">{step.stepNumber}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{step.count}</p>
                    </div>
                    {isActive && <div className="w-1 h-1 bg-blue-600 rounded-full flex-shrink-0" />}
                  </div>
                )
              })}
            </div>
          </div>

          <Separator className="my-3" />
        </div>
      </div>

      {/* Fixed chat at bottom */}
      <div className="border-t border-gray-200 p-4">
        <ModificationChat
          selectedAudiences={selectedAudiencesForModification}
          onSubmit={onModificationSubmit}
          onRemoveAudience={onRemoveAudienceFromModification}
          isModifying={isModifying}
          disabled={audiences.length === 0}
        />
      </div>
    </div>
  )
}
