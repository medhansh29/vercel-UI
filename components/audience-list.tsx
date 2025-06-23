"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import type { Audience } from "@/types/audience"
import { AudienceCard } from "./audience-card"

interface AudienceListProps {
  audiences: Audience[]
  onConfigure: (audience: Audience) => void
  onDelete: (audienceId: string) => void
  onFinalize: (selectedAudienceIds: string[]) => void
  selectedAudiencesForModification: Audience[]
  onSelectForModification: (audienceId: string, checked: boolean) => void
  isFinalizing: boolean
}

export function AudienceList({
  audiences,
  onConfigure,
  onDelete,
  onFinalize,
  selectedAudiencesForModification,
  onSelectForModification,
  isFinalizing,
}: AudienceListProps) {
  const [selectedAudienceIds, setSelectedAudienceIds] = useState<string[]>([])

  const handleSelectAudience = (audienceId: string, checked: boolean) => {
    if (checked) {
      setSelectedAudienceIds((prev) => [...prev, audienceId])
    } else {
      setSelectedAudienceIds((prev) => prev.filter((id) => id !== audienceId))
    }

    onSelectForModification(audienceId, checked)
  }

  const handleFinalize = () => {
    if (selectedAudienceIds.length === 0) return
    onFinalize(selectedAudienceIds)
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-screen">
      {/* Compact Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Audience Selection</h1>
            <p className="text-sm text-gray-600">Select and configure your target audiences</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm h-8">
            <Plus className="w-3 h-3 mr-1" />
            New Cohort
          </Button>
        </div>
      </div>

      {/* Scrollable audience list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="max-w-5xl mx-auto space-y-3">
            {audiences.map((audience) => (
              <AudienceCard
                key={audience.id}
                audience={audience}
                onConfigure={onConfigure}
                onDelete={onDelete}
                onSelect={handleSelectAudience}
                isSelected={selectedAudienceIds.includes(audience.id)}
              />
            ))}

            {audiences.length === 0 && (
              <Card className="text-center py-12 bg-white border border-gray-200">
                <CardContent>
                  <div className="text-gray-400 mb-4">
                    <Plus className="h-8 w-8 mx-auto mb-3" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">No Audiences Generated</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Use the chat interface on the left to generate your first audience segments.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Compact finalize button */}
      {selectedAudienceIds.length > 0 && (
        <div className="border-t border-gray-200 bg-white px-6 py-2">
          <div className="max-w-5xl mx-auto flex justify-end">
            <Button
              onClick={handleFinalize}
              disabled={isFinalizing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm h-8"
            >
              {isFinalizing ? "Finalizing..." : `Save Configuration (${selectedAudienceIds.length})`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
