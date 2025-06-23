"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Audience } from "@/types/audience"

interface AudienceConfigureDialogProps {
  audience: Audience | null
  isOpen: boolean
  onClose: () => void
  onSave: (audience: Audience) => void
}

export function AudienceConfigureDialog({ audience, isOpen, onClose, onSave }: AudienceConfigureDialogProps) {
  const [editedAudience, setEditedAudience] = useState<Audience | null>(null)

  useEffect(() => {
    if (audience) {
      const safeAudience: Audience = {
        id: audience.id || "",
        name: audience.name || "",
        rule: {
          operator: audience.rule?.operator || "AND",
          conditions: audience.rule?.conditions || [],
        },
        estimated_size: audience.estimated_size || null,
        estimated_conversion_rate: audience.estimated_conversion_rate || 0,
        rationale: audience.rationale || "",
        top_features: audience.top_features || [],
        cohort_score: audience.cohort_score || 0,
        cohort_rationale: audience.cohort_rationale || "",
      }
      setEditedAudience(safeAudience)
    } else {
      setEditedAudience(null)
    }
  }, [audience])

  const updateField = (field: string, value: any) => {
    if (!editedAudience) return
    setEditedAudience({ ...editedAudience, [field]: value })
  }

  const handleSave = () => {
    if (editedAudience) {
      onSave(editedAudience)
    }
    onClose()
  }

  const formatConditionValue = (condition: any) => {
    if (!condition || condition.value === undefined || condition.value === null) {
      return "N/A"
    }

    if (Array.isArray(condition.value)) {
      return condition.value.join(" - ")
    }
    return condition.value.toString()
  }

  if (!editedAudience) return null

  const conditions = editedAudience.rule?.conditions || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg">Configure Audience</DialogTitle>
          <DialogDescription className="text-sm">Modify audience parameters and targeting rules</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                onChange={(e) => updateField("estimated_size", e.target.value ? Number.parseInt(e.target.value) : null)}
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
              className="min-h-[60px] text-sm resize-none"
            />
          </div>

          {/* Targeting Conditions */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Targeting Conditions</Label>
            <div className="border rounded-md p-2 bg-gray-50 max-h-20 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {conditions.length > 0 ? (
                  conditions.map((condition, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs h-5">
                      {condition?.field || "unknown"} {condition?.operator || "="} {formatConditionValue(condition)}
                    </Badge>
                  ))
                ) : (
                  <div className="text-xs text-gray-500">No conditions defined</div>
                )}
              </div>
            </div>
          </div>

          {/* Cohort Rationale */}
          <div className="space-y-1">
            <Label htmlFor="cohort-rationale" className="text-xs font-medium">
              Cohort Rationale
            </Label>
            <Textarea
              id="cohort-rationale"
              value={editedAudience.cohort_rationale}
              onChange={(e) => updateField("cohort_rationale", e.target.value)}
              className="min-h-[50px] text-sm resize-none"
            />
          </div>
        </div>

        <DialogFooter className="pt-4 gap-2">
          <Button variant="outline" onClick={onClose} className="h-8 px-3 text-sm">
            Cancel
          </Button>
          <Button onClick={handleSave} className="h-8 px-3 text-sm">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
