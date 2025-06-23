"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, ChevronRight, ChevronDown, Sparkles } from "lucide-react"
import type { Audience } from "@/types/audience"

interface AudienceCardProps {
  audience: Audience
  onConfigure: (audience: Audience) => void
  onDelete: (audienceId: string) => void
  onSelect: (audienceId: string, checked: boolean) => void
  isSelected: boolean
}

export function AudienceCard({ audience, onConfigure, onDelete, onSelect, isSelected }: AudienceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [editedAudience, setEditedAudience] = useState(audience)

  const conversionRate = Math.round(audience.estimated_conversion_rate * 100)
  const liftRate = Math.round(Math.random() * 20 + 5) // Mock lift data
  const cohortScore = audience.cohort_score || Math.round(Math.random() * 30 + 70)

  // Determine cohort score color based on value
  const getCohortScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800"
    if (score >= 75) return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  const getTopFeatures = () => {
    if (audience.top_features && audience.top_features.length > 0) {
      return audience.top_features
        .slice(0, 2)
        .map((feature) => feature.substring(0, 3))
        .join("  ")
    }
    return "ltv  age"
  }

  const handleEdit = () => {
    setIsExpanded(!isExpanded)
  }

  const handleSave = () => {
    onConfigure(editedAudience)
    setIsExpanded(false)
  }

  const updateField = (field: string, value: any) => {
    setEditedAudience((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <TooltipProvider>
      <Card
        className={`transition-all duration-200 ${
          isSelected
            ? "bg-blue-50 border-2 border-blue-300 shadow-md"
            : "bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
        }`}
      >
        <CardContent className="p-4">
          {/* Header with icon, title, and cohort score */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">{audience.name}</h3>
                <p className="text-sm text-gray-500">{audience.estimated_size?.toLocaleString() || "1,576"} people</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">AI</span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`px-2 py-1 rounded-full text-sm font-semibold cursor-help ${getCohortScoreColor(cohortScore)}`}
                  >
                    {cohortScore}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">
                    Cohort score is a composite metric (0–100) that ranks how promising an audience segment is for
                    marketing campaigns.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{conversionRate}.0%</div>
              <div className="text-xs text-gray-500">Conv. Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">+{liftRate}.0%</div>
              <div className="text-xs text-gray-500">Lift</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">{getTopFeatures()}</div>
              <div className="text-xs text-gray-500">Features</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onSelect(audience.id, !isSelected)}
              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 h-9 text-sm"
            >
              {isSelected ? "Unselect" : "Select"}
            </Button>
            <Button
              onClick={handleEdit}
              variant="outline"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-4 h-9 text-sm"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
              Edit
            </Button>
          </div>

          {/* Accordion Content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 animate-in slide-in-from-top-2 duration-200">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="audience-name" className="text-xs font-medium">
                    Name
                  </Label>
                  <Input
                    id="audience-name"
                    value={editedAudience.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="estimated-size" className="text-xs font-medium">
                    Size
                  </Label>
                  <Input
                    id="estimated-size"
                    type="number"
                    min="0"
                    value={editedAudience.estimated_size || ""}
                    onChange={(e) =>
                      updateField("estimated_size", e.target.value ? Number.parseInt(e.target.value) : null)
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="conversion-rate" className="text-xs font-medium">
                    Conversion Rate
                  </Label>
                  <Input
                    id="conversion-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={editedAudience.estimated_conversion_rate}
                    onChange={(e) => updateField("estimated_conversion_rate", Number.parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cohort-score" className="text-xs font-medium">
                    Cohort Score
                  </Label>
                  <Input
                    id="cohort-score"
                    type="number"
                    min="0"
                    max="100"
                    value={editedAudience.cohort_score}
                    onChange={(e) => updateField("cohort_score", Number.parseInt(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Rationale */}
              <div className="space-y-1">
                <Label htmlFor="rationale" className="text-xs font-medium">
                  Rationale
                </Label>
                <Textarea
                  id="rationale"
                  value={editedAudience.rationale}
                  onChange={(e) => updateField("rationale", e.target.value)}
                  className="min-h-[60px] resize-none text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setIsExpanded(false)} className="h-8 px-3 text-xs">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
