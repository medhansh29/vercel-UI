"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, ChevronDown, Zap, Clock, DollarSign, TrendingUp, Users } from "lucide-react"
import type { GrowthLever } from "@/types/growth-lever"
import type { Audience } from "@/types/audience"

interface GrowthLeverSelectionProps {
  growthLevers: GrowthLever[]
  selectedAudiences: Audience[]
  onConfigure: (growthLever: GrowthLever) => void
  onDelete: (growthLeverId: string) => void
  onFinalize: (selectedGrowthLeverIds: string[]) => void
  isFinalizing: boolean
}

export function GrowthLeverSelection({
  growthLevers,
  selectedAudiences,
  onConfigure,
  onDelete,
  onFinalize,
  isFinalizing,
}: GrowthLeverSelectionProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [expandedCards, setExpandedCards] = useState<string[]>([])
  const [editedGrowthLevers, setEditedGrowthLevers] = useState<{ [key: string]: GrowthLever }>({})

  // Pre-select all growth levers when they change
  useEffect(() => {
    setSelectedCards(growthLevers.map((lever) => lever.id))
  }, [growthLevers])

  // Group growth levers by audience
  const leversByAudience = useMemo(() => {
    const grouped: { [audienceId: string]: GrowthLever[] } = {}

    selectedAudiences.forEach((audience) => {
      grouped[audience.id] = growthLevers.filter((lever) => lever.target_audience_id === audience.id)
    })

    return grouped
  }, [growthLevers, selectedAudiences])

  // Create stable metrics that never change
  const stableMetrics = useMemo(() => {
    const metrics: { [key: string]: { impactScore: number; difficultyScore: number; priorityScore: number } } = {}
    growthLevers.forEach((lever) => {
      const hash = lever.id.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)

      const seedValue = Math.abs(hash)

      metrics[lever.id] = {
        impactScore: lever.estimated_impact || 70 + (seedValue % 30),
        difficultyScore: lever.implementation_difficulty || 30 + (seedValue % 40),
        priorityScore: lever.priority_score || 75 + (seedValue % 25),
      }
    })
    return metrics
  }, [growthLevers.map((l) => l.id).join(",")])

  const handleCheckboxChange = (growthLeverId: string, checked: boolean) => {
    if (checked) {
      setSelectedCards((prev) => [...prev, growthLeverId])
    } else {
      setSelectedCards((prev) => prev.filter((id) => id !== growthLeverId))
    }
  }

  const handleEditToggle = (growthLeverId: string) => {
    setExpandedCards((prev) => {
      if (prev.includes(growthLeverId)) {
        return prev.filter((id) => id !== growthLeverId)
      } else {
        const growthLever = growthLevers.find((lever) => lever.id === growthLeverId)
        if (growthLever && !editedGrowthLevers[growthLeverId]) {
          setEditedGrowthLevers((prevEdited) => ({
            ...prevEdited,
            [growthLeverId]: { ...growthLever },
          }))
        }
        return [...prev, growthLeverId]
      }
    })
  }

  const handleSaveEdit = (growthLeverId: string) => {
    const editedGrowthLever = editedGrowthLevers[growthLeverId]
    if (editedGrowthLever) {
      onConfigure(editedGrowthLever)
    }
    setExpandedCards((prev) => prev.filter((id) => id !== growthLeverId))
  }

  const updateEditedField = (growthLeverId: string, field: string, value: any) => {
    setEditedGrowthLevers((prev) => ({
      ...prev,
      [growthLeverId]: {
        ...prev[growthLeverId],
        [field]: value,
      },
    }))
  }

  const getPriorityScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  const getDifficultyColor = (score: number) => {
    if (score <= 30) return "bg-green-100 text-green-800"
    if (score <= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <TooltipProvider>
      <div className="flex-1 bg-gray-50 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Growth Lever Selection</h1>
              <p className="text-gray-600">
                Personalized growth strategies for your {selectedAudiences.length} selected audiences
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedAudiences.map((audience) => {
                  const leverCount = leversByAudience[audience.id]?.length || 0
                  return (
                    <Badge key={audience.id} variant="secondary" className="bg-blue-100 text-blue-800">
                      {audience.name} ({leverCount} levers)
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Growth Lever Cards - Grouped by Audience */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {selectedAudiences.map((audience) => {
              const audienceLevers = leversByAudience[audience.id] || []

              if (audienceLevers.length === 0) {
                return null
              }

              return (
                <div key={audience.id} className="space-y-4">
                  {/* Audience Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{audience.name}</h2>
                      <p className="text-sm text-gray-600">
                        {audienceLevers.length} personalized growth levers •{" "}
                        {audience.estimated_size?.toLocaleString() || "1,576"} people
                      </p>
                    </div>
                  </div>

                  {/* Levers for this audience */}
                  <div className="space-y-4 ml-6">
                    {audienceLevers.map((lever, index) => {
                      const isSelected = selectedCards.includes(lever.id)
                      const isExpanded = expandedCards.includes(lever.id)
                      const editedLever = editedGrowthLevers[lever.id] || lever

                      const metrics = stableMetrics[lever.id] || {
                        impactScore: lever.estimated_impact || 80,
                        difficultyScore: lever.implementation_difficulty || 40,
                        priorityScore: lever.priority_score || 85,
                      }

                      const getCardStyling = () => {
                        if (isSelected) {
                          return "bg-blue-50 border-2 border-blue-300"
                        } else {
                          return "bg-white border border-gray-200 hover:border-gray-300"
                        }
                      }

                      return (
                        <Card
                          key={`${lever.id}-${lever.name}-${index}`}
                          className={`transition-all duration-200 ${getCardStyling()}`}
                        >
                          <CardContent className="p-6">
                            {/* Header with Checkbox */}
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-start space-x-4">
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id={`checkbox-${lever.id}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => handleCheckboxChange(lever.id, checked as boolean)}
                                    className="w-5 h-5"
                                  />
                                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="text-xl font-semibold text-gray-900">{lever.name}</h3>
                                    <Badge variant="outline" className="text-xs">
                                      {lever.lever_type || "Growth Strategy"}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-600 text-sm">{lever.description}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={`px-3 py-1.5 rounded-full text-sm font-semibold cursor-help ${getPriorityScoreColor(metrics.priorityScore)}`}
                                    >
                                      Priority: {metrics.priorityScore}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="max-w-xs">
                                      <p className="text-sm font-medium mb-1">
                                        Priority score (0-100) for {audience.name} specifically
                                      </p>
                                      {lever.rationale && (
                                        <p className="text-xs text-gray-600 mt-2 italic">"{lever.rationale}"</p>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>

                            {/* Metrics */}
                            <div className="flex items-center justify-between mb-6">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-1">{metrics.impactScore}%</div>
                                <div className="text-sm text-gray-500 flex items-center justify-center">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Impact
                                </div>
                              </div>
                              <div className="text-center">
                                <div
                                  className={`text-3xl font-bold mb-1 ${
                                    metrics.difficultyScore <= 30
                                      ? "text-green-600"
                                      : metrics.difficultyScore <= 60
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                >
                                  {metrics.difficultyScore}%
                                </div>
                                <div className="text-sm text-gray-500 flex items-center justify-center">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Difficulty
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                  {lever.time_to_implement || "2-4 weeks"}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center justify-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Timeline
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600 mb-1">
                                  {lever.cost_estimate || "$5-10K"}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center justify-center">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Cost
                                </div>
                              </div>
                            </div>

                            {/* Success Metrics */}
                            {lever.success_metrics && lever.success_metrics.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  Success Metrics for {audience.name}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {lever.success_metrics.slice(0, 3).map((metric, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {metric}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="outline"
                                onClick={() => handleEditToggle(lever.id)}
                                className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 h-12"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                />
                                Edit
                              </Button>
                            </div>

                            {/* Accordion Content */}
                            {isExpanded && (
                              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`lever-name-${lever.id}`} className="text-sm font-medium">
                                      Name
                                    </Label>
                                    <Input
                                      id={`lever-name-${lever.id}`}
                                      value={editedLever.name}
                                      onChange={(e) => updateEditedField(lever.id, "name", e.target.value)}
                                      className="h-10 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`lever-type-${lever.id}`} className="text-sm font-medium">
                                      Lever Type
                                    </Label>
                                    <Input
                                      id={`lever-type-${lever.id}`}
                                      value={editedLever.lever_type}
                                      onChange={(e) => updateEditedField(lever.id, "lever_type", e.target.value)}
                                      className="h-10 text-sm"
                                    />
                                  </div>
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`impact-${lever.id}`} className="text-sm font-medium">
                                      Impact (0-100)
                                    </Label>
                                    <Input
                                      id={`impact-${lever.id}`}
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={editedLever.estimated_impact || metrics.impactScore}
                                      onChange={(e) =>
                                        updateEditedField(
                                          lever.id,
                                          "estimated_impact",
                                          Number.parseInt(e.target.value) || 0,
                                        )
                                      }
                                      className="h-10 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`difficulty-${lever.id}`} className="text-sm font-medium">
                                      Difficulty (0-100)
                                    </Label>
                                    <Input
                                      id={`difficulty-${lever.id}`}
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={editedLever.implementation_difficulty || metrics.difficultyScore}
                                      onChange={(e) =>
                                        updateEditedField(
                                          lever.id,
                                          "implementation_difficulty",
                                          Number.parseInt(e.target.value) || 0,
                                        )
                                      }
                                      className="h-10 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`priority-${lever.id}`} className="text-sm font-medium">
                                      Priority (0-100)
                                    </Label>
                                    <Input
                                      id={`priority-${lever.id}`}
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={editedLever.priority_score || metrics.priorityScore}
                                      onChange={(e) =>
                                        updateEditedField(
                                          lever.id,
                                          "priority_score",
                                          Number.parseInt(e.target.value) || 0,
                                        )
                                      }
                                      className="h-10 text-sm"
                                    />
                                  </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                  <Label htmlFor={`description-${lever.id}`} className="text-sm font-medium">
                                    Description
                                  </Label>
                                  <Textarea
                                    id={`description-${lever.id}`}
                                    value={editedLever.description}
                                    onChange={(e) => updateEditedField(lever.id, "description", e.target.value)}
                                    className="min-h-[80px] resize-none text-sm"
                                  />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end space-x-3 pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleEditToggle(lever.id)}
                                    className="h-10 px-4 text-sm"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleSaveEdit(lever.id)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white h-10 px-4 text-sm"
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
                  </div>
                </div>
              )
            })}

            {growthLevers.length === 0 && (
              <Card className="text-center py-16 bg-white border border-gray-200">
                <CardContent>
                  <div className="text-gray-400 mb-4">
                    <Plus className="h-12 w-12 mx-auto mb-4" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Growth Levers Generated</h3>
                  <p className="text-gray-600 mb-6">
                    Growth levers will be generated based on your selected audiences.
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
                {selectedCards.length} of {growthLevers.length} growth levers selected for finalization
              </div>
              <Button
                onClick={() => onFinalize(selectedCards)}
                disabled={isFinalizing}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
              >
                {isFinalizing ? "Finalizing..." : `Finalize Growth Levers (${selectedCards.length})`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
