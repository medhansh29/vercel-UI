"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Users, ChevronDown, Bot, Sparkles, Zap } from "lucide-react"
import type { Audience } from "@/types/audience"
import { AIModificationChat } from "./ai-modification-chat"

interface AudienceSelectionProps {
  audiences: Audience[]
  onConfigure: (audience: Audience) => void
  onDelete: (audienceId: string) => void
  onFinalize: (selectedAudienceIds: string[]) => void
  selectedAudiencesForModification: Audience[]
  onSelectForModification: (audienceId: string, checked: boolean) => void
  onModifyWithAI: (audience: Audience) => void
  selectedAudienceForAI?: Audience | null
  recentlyModifiedAudienceId?: string | null
  isFinalizing: boolean
  isModifying: boolean
  onAIModificationSubmit: (audienceId: string, prompt: string) => void
}

export function AudienceSelection({
  audiences,
  onConfigure,
  onDelete,
  onFinalize,
  selectedAudiencesForModification,
  onSelectForModification,
  onModifyWithAI,
  selectedAudienceForAI,
  recentlyModifiedAudienceId,
  isFinalizing,
  isModifying,
  onAIModificationSubmit,
}: AudienceSelectionProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [expandedCards, setExpandedCards] = useState<string[]>([])
  const [editedAudiences, setEditedAudiences] = useState<{ [key: string]: Audience }>({})
  const [showAIChat, setShowAIChat] = useState(false)

  // Pre-select all audiences when they change
  useEffect(() => {
    setSelectedCards(audiences.map((audience) => audience.id))
  }, [audiences])

  // Create stable metrics that never change - using useMemo with empty dependency array
  const stableMetrics = useMemo(() => {
    const metrics: { [key: string]: { convRate: number; liftRate: number; cohortScore: number } } = {}
    audiences.forEach((audience) => {
      // Create a simple hash from audience ID to ensure consistent values
      const hash = audience.id.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)

      const seedValue = Math.abs(hash)

      metrics[audience.id] = {
        convRate: Math.round(audience.estimated_conversion_rate * 100),
        liftRate: 5 + (seedValue % 20), // Consistent lift between 5-24%
        cohortScore: audience.cohort_score || (70 + (seedValue % 30)) / 100, // Convert to 0-1 range: 0.70-0.99
      }
    })
    return metrics
  }, [audiences.map((a) => a.id).join(",")]) // Only recalculate if audience IDs change

  const handleCheckboxChange = (audienceId: string, checked: boolean) => {
    if (checked) {
      setSelectedCards((prev) => [...prev, audienceId])
    } else {
      setSelectedCards((prev) => prev.filter((id) => id !== audienceId))
    }
  }

  const handleEditToggle = (audienceId: string) => {
    setExpandedCards((prev) => {
      if (prev.includes(audienceId)) {
        return prev.filter((id) => id !== audienceId)
      } else {
        // Initialize edited audience if not already done
        const audience = audiences.find((aud) => aud.id === audienceId)
        if (audience && !editedAudiences[audienceId]) {
          setEditedAudiences((prevEdited) => ({
            ...prevEdited,
            [audienceId]: { ...audience },
          }))
        }
        return [...prev, audienceId]
      }
    })
  }

  const handleSaveEdit = (audienceId: string) => {
    const editedAudience = editedAudiences[audienceId]
    if (editedAudience) {
      onConfigure(editedAudience)
    }
    setExpandedCards((prev) => prev.filter((id) => id !== audienceId))
  }

  const updateEditedField = (audienceId: string, field: string, value: any) => {
    setEditedAudiences((prev) => ({
      ...prev,
      [audienceId]: {
        ...prev[audienceId],
        [field]: value,
      },
    }))
  }

  const handleModifyWithAI = (audience: Audience) => {
    onModifyWithAI(audience)
    setShowAIChat(true)
  }

  const handleAIModificationSubmit = (prompt: string) => {
    if (selectedAudienceForAI) {
      onAIModificationSubmit(selectedAudienceForAI.id, prompt)
    }
  }

  const handleCloseAIChat = () => {
    setShowAIChat(false)
  }

  const getCohortScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800"
    if (score >= 75) return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  const getDescriptiveTitle = (audience: Audience) => {
    // If the audience was AI modified, show a more prominent modified title
    if (audience.name.includes("(AI Modified)")) {
      const baseTitles = [
        "AI-Optimized High-Value Customer Segment",
        "Enhanced Premium Feature Adoption Audience",
        "AI-Refined Growth-Oriented Professional Segment",
        "Optimized High-Engagement Community Members",
        "AI-Enhanced Strategic Decision Maker Cohort",
      ]

      const hash = audience.id.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)

      return baseTitles[Math.abs(hash) % baseTitles.length]
    }

    // Original titles for unmodified audiences
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
    <TooltipProvider>
      <div className="flex-1 bg-gray-50 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Audience Selection</h1>
              <p className="text-gray-600">Select and configure your target audiences</p>
            </div>
          </div>
        </div>

        {/* Audience Cards */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {audiences.map((audience, index) => {
              const isSelected = selectedCards.includes(audience.id)
              const isExpanded = expandedCards.includes(audience.id)
              const isBeingModifiedWithAI = selectedAudienceForAI?.id === audience.id
              const isRecentlyModified = recentlyModifiedAudienceId === audience.id
              const isAIModified = audience.name.includes("(AI Modified)")
              const editedAudience = editedAudiences[audience.id] || audience

              // Use stable metrics that never change
              const metrics = stableMetrics[audience.id] || {
                convRate: Math.round(audience.estimated_conversion_rate * 100),
                liftRate: 15,
                cohortScore: audience.cohort_score || 80,
              }

              // Get the card styling based on state
              const getCardStyling = () => {
                if (isBeingModifiedWithAI) {
                  return "bg-purple-50 border-2 border-purple-300 shadow-lg"
                } else if (isRecentlyModified) {
                  return "bg-green-50 border-2 border-green-300 shadow-lg animate-pulse"
                } else if (isAIModified) {
                  return "bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 shadow-md"
                } else if (isSelected) {
                  return "bg-blue-50 border-2 border-blue-300"
                } else {
                  return "bg-white border border-gray-200 hover:border-gray-300"
                }
              }

              return (
                <Card
                  key={`${audience.id}-${audience.name}-${index}`}
                  className={`transition-all duration-200 ${getCardStyling()}`}
                >
                  <CardContent className="p-6">
                    {/* Status Indicators */}
                    {(isBeingModifiedWithAI || isRecentlyModified || isAIModified) && (
                      <div className="mb-4">
                        {isBeingModifiedWithAI && (
                          <div className="p-3 bg-purple-100 border border-purple-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Bot className="w-5 h-5 text-purple-600 animate-pulse" />
                              <span className="text-sm font-medium text-purple-800">
                                🤖 AI is currently modifying this audience...
                              </span>
                            </div>
                          </div>
                        )}
                        {isRecentlyModified && !isBeingModifiedWithAI && (
                          <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Sparkles className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                ✨ Just modified by AI! Check out the improvements below.
                              </span>
                            </div>
                          </div>
                        )}
                        {isAIModified && !isRecentlyModified && !isBeingModifiedWithAI && (
                          <div className="p-3 bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Zap className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                🚀 AI-Enhanced Audience - Optimized for better performance
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Header with Checkbox */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`checkbox-${audience.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleCheckboxChange(audience.id, checked as boolean)}
                            className="w-5 h-5"
                          />
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              isBeingModifiedWithAI
                                ? "bg-purple-500"
                                : isRecentlyModified || isAIModified
                                  ? "bg-gradient-to-r from-green-500 to-blue-500"
                                  : "bg-blue-500"
                            }`}
                          >
                            {isAIModified ? (
                              <Zap className="w-6 h-6 text-white" />
                            ) : (
                              <Users className="w-6 h-6 text-white" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-xl font-semibold text-gray-900">{getDescriptiveTitle(audience)}</h3>
                            {isAIModified && (
                              <div className="px-2 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-bold rounded-full">
                                AI ENHANCED
                              </div>
                            )}
                          </div>
                          <p className="text-gray-500">
                            <span className="font-medium">Estimated Size:</span>{" "}
                            {audience.estimated_size?.toLocaleString() || "1,576"} people
                            {isAIModified && (
                              <span className="ml-2 text-green-600 font-medium">
                                (+{Math.round((((audience.estimated_size || 1576) - 1576) / 1576) * 100)}% optimized)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`px-3 py-1.5 rounded-full text-sm font-semibold cursor-help ${
                                isAIModified
                                  ? "bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border border-green-300"
                                  : getCohortScoreColor(metrics.cohortScore * 100)
                              }`}
                            >
                              Cohort Score: {metrics.cohortScore.toFixed(2)}
                              {isAIModified && <span className="ml-1">⚡</span>}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-xs">
                              <p className="text-sm font-medium mb-1">
                                Cohort score is a composite metric (0-1) that ranks how promising an audience segment is
                                for marketing campaigns.
                              </p>
                              {isAIModified && (
                                <p className="text-xs text-green-600 mt-2 font-medium">
                                  ⚡ This score has been optimized by AI for better performance!
                                </p>
                              )}
                              {audience.cohort_rationale && (
                                <p className="text-xs text-gray-600 mt-2 italic">"{audience.cohort_rationale}"</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-center">
                        <div
                          className={`text-3xl font-bold mb-1 ${isAIModified ? "text-green-600" : "text-green-600"}`}
                        >
                          {metrics.convRate}.0%
                          {isAIModified && <span className="text-lg ml-1">↗️</span>}
                        </div>
                        <div className="text-sm text-gray-500">
                          Conv. Rate {isAIModified && <span className="text-green-600 font-medium">(Enhanced)</span>}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-3xl font-bold mb-1 ${isAIModified ? "text-blue-600" : "text-blue-600"}`}>
                          +{metrics.liftRate}.0%
                          {isAIModified && <span className="text-lg ml-1">🚀</span>}
                        </div>
                        <div className="text-sm text-gray-500">
                          Lift {isAIModified && <span className="text-blue-600 font-medium">(Optimized)</span>}
                        </div>
                      </div>
                    </div>

                    {/* AI Modification Summary */}
                    {isAIModified && (
                      <div className="mb-6 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                          <Sparkles className="w-4 h-4 mr-2 text-green-600" />
                          AI Modifications Applied
                        </h4>
                        <div className="text-xs text-gray-700 space-y-1">
                          {/* Show actual changes from cohort_rationale */}
                          {audience.cohort_rationale && audience.cohort_rationale.includes("[Changes Applied]:") ? (
                            <div className="space-y-1">
                              {audience.cohort_rationale
                                .split("[Changes Applied]:")[1]
                                ?.split(",")
                                .map((change, idx) => (
                                  <div key={idx}>• {change.trim()}</div>
                                ))}
                            </div>
                          ) : (
                            <div>
                              <div>• Conversion rate optimized for better performance</div>
                              <div>• Audience targeting refined for higher engagement</div>
                              <div>• Cohort scoring enhanced with AI insights</div>
                            </div>
                          )}

                          {/* Show the specific user request */}
                          {audience.rationale.includes("[AI Modification") && (
                            <div className="mt-2 p-2 bg-white rounded border-l-2 border-green-400">
                              <span className="font-medium">Your Request:</span>
                              <span className="ml-1">
                                {audience.rationale.split("]: ")[audience.rationale.split("]: ").length - 1] ||
                                  "Custom optimization"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center space-x-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => handleEditToggle(audience.id)}
                            className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 h-12"
                          >
                            <ChevronDown
                              className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                            Edit
                          </Button>
                        </DropdownMenuTrigger>
                      </DropdownMenu>

                      <Button
                        onClick={() => handleModifyWithAI(audience)}
                        disabled={isModifying}
                        className={`px-4 h-12 ${
                          isBeingModifiedWithAI
                            ? "bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-400"
                            : isAIModified
                              ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                              : "bg-purple-500 hover:bg-purple-600 text-white"
                        }`}
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        {isBeingModifiedWithAI ? "Modifying..." : isAIModified ? "Modify Again" : "Modify with AI"}
                      </Button>
                    </div>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`audience-name-${audience.id}`} className="text-sm font-medium">
                              Name
                            </Label>
                            <Input
                              id={`audience-name-${audience.id}`}
                              value={editedAudience.name}
                              onChange={(e) => updateEditedField(audience.id, "name", e.target.value)}
                              className="h-10 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`estimated-size-${audience.id}`} className="text-sm font-medium">
                              Estimated Size
                            </Label>
                            <Input
                              id={`estimated-size-${audience.id}`}
                              type="number"
                              min="0"
                              value={editedAudience.estimated_size || ""}
                              onChange={(e) =>
                                updateEditedField(
                                  audience.id,
                                  "estimated_size",
                                  e.target.value ? Number.parseInt(e.target.value) : null,
                                )
                              }
                              className="h-10 text-sm"
                            />
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`conversion-rate-${audience.id}`} className="text-sm font-medium">
                              Conversion Rate
                            </Label>
                            <Input
                              id={`conversion-rate-${audience.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={editedAudience.estimated_conversion_rate}
                              onChange={(e) =>
                                updateEditedField(
                                  audience.id,
                                  "estimated_conversion_rate",
                                  Number.parseFloat(e.target.value) || 0,
                                )
                              }
                              className="h-10 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`cohort-score-${audience.id}`} className="text-sm font-medium">
                              Cohort Score (0-100)
                            </Label>
                            <Input
                              id={`cohort-score-${audience.id}`}
                              type="number"
                              min="0"
                              max="100"
                              value={editedAudience.cohort_score || metrics.cohortScore * 100}
                              onChange={(e) =>
                                updateEditedField(audience.id, "cohort_score", Number.parseInt(e.target.value) || 0)
                              }
                              className="h-10 text-sm"
                            />
                          </div>
                        </div>

                        {/* Rationale */}
                        <div className="space-y-2">
                          <Label htmlFor={`rationale-${audience.id}`} className="text-sm font-medium">
                            Rationale
                          </Label>
                          <Textarea
                            id={`rationale-${audience.id}`}
                            value={editedAudience.rationale}
                            onChange={(e) => updateEditedField(audience.id, "rationale", e.target.value)}
                            className="min-h-[80px] resize-none text-sm"
                          />
                        </div>

                        {/* Cohort Rationale */}
                        <div className="space-y-2">
                          <Label htmlFor={`cohort-rationale-${audience.id}`} className="text-sm font-medium">
                            Cohort Score Rationale
                          </Label>
                          <Textarea
                            id={`cohort-rationale-${audience.id}`}
                            value={editedAudience.cohort_rationale || ""}
                            onChange={(e) => updateEditedField(audience.id, "cohort_rationale", e.target.value)}
                            className="min-h-[60px] resize-none text-sm"
                            placeholder="Explain why this cohort score was assigned..."
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => handleEditToggle(audience.id)}
                            className="h-10 px-4 text-sm"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleSaveEdit(audience.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 text-sm"
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {audiences.length === 0 && (
              <Card className="text-center py-16 bg-white border border-gray-200">
                <CardContent>
                  <div className="text-gray-400 mb-4">
                    <Plus className="h-12 w-12 mx-auto mb-4" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Audiences Generated</h3>
                  <p className="text-gray-600 mb-6">
                    Use the chat interface on the left to generate your first audience segments.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Finalize Button */}
        {selectedCards.length > 0 && (
          <div className="border-t border-gray-200 bg-white px-8 py-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedCards.length} of {audiences.length} audiences selected for finalization
              </div>
              <Button
                onClick={() => onFinalize(selectedCards)}
                disabled={isFinalizing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                {isFinalizing ? "Finalizing..." : `Finalize Selection (${selectedCards.length})`}
              </Button>
            </div>
          </div>
        )}

        {/* AI Modification Chat */}
        <AIModificationChat
          audience={selectedAudienceForAI}
          isOpen={showAIChat}
          onClose={handleCloseAIChat}
          onSubmit={handleAIModificationSubmit}
          isModifying={isModifying}
        />
      </div>
    </TooltipProvider>
  )
}
