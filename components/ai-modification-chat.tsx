"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Send, Loader2, Bot, Users } from "lucide-react"
import type { Audience } from "@/types/audience"

interface AIModificationChatProps {
  audience: Audience | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (prompt: string) => void
  isModifying: boolean
}

export function AIModificationChat({ audience, isOpen, onClose, onSubmit, isModifying }: AIModificationChatProps) {
  const [prompt, setPrompt] = useState("")
  const [progress, setProgress] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Simulate progress during modification
  React.useEffect(() => {
    if (isModifying) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + Math.random() * 10 + 5
        })
      }, 300)

      return () => clearInterval(interval)
    } else if (isSubmitted && !isModifying) {
      // Complete the progress when modification is done
      setProgress(100)
      setTimeout(() => {
        setProgress(0)
        setIsSubmitted(false)
      }, 1000)
    }
  }, [isModifying, isSubmitted])

  const handleSubmit = () => {
    if (!prompt.trim()) return
    setIsSubmitted(true)
    onSubmit(prompt)
    setPrompt("")
  }

  // Add this after the handleSubmit function
  const handleTestModification = () => {
    const testPrompt = "Make this audience more targeted and increase conversion rate"
    setPrompt(testPrompt)
    handleSubmit()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

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

  if (!audience) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-purple-600" />
            <span>Modify Audience with AI</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Audience Display */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{getDescriptiveTitle(audience)}</h4>
                  <p className="text-sm text-gray-600">
                    Estimated Size: {audience.estimated_size?.toLocaleString() || "1,576"} people
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modification Progress */}
          {isModifying && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      AI is analyzing and modifying your audience...
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs text-blue-600">
                    {progress < 30 && "Analyzing current audience parameters..."}
                    {progress >= 30 && progress < 60 && "Applying AI modifications..."}
                    {progress >= 60 && progress < 90 && "Optimizing audience targeting..."}
                    {progress >= 90 && "Finalizing changes..."}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {isSubmitted && !isModifying && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      AI has finished modifying your audience...
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs text-green-600">Finalizing changes...</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Interface */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Bot className="w-6 h-6 text-purple-600 mt-1" />
                  <div className="bg-white rounded-lg p-3 shadow-sm border">
                    <p className="text-sm text-gray-700">
                      Hi! I'm here to help you modify your audience segment. You can ask me to:
                    </p>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Make the audience more specific or broader</li>
                      <li>• Adjust demographic or behavioral criteria</li>
                      <li>• Optimize for better conversion rates</li>
                      <li>• Change targeting parameters</li>
                    </ul>
                    <p className="text-sm text-gray-700 mt-2">What would you like me to modify about this audience?</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Describe how you want to modify this audience..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isModifying}
                className="flex-1"
              />
              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isModifying}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4"
              >
                {isModifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            {/* Quick Actions */}
            {!isModifying && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Make this audience more specific",
                    "Expand to include similar users",
                    "Optimize for higher conversion",
                    "Focus on high-value customers",
                  ].map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(action)}
                      className="text-xs h-7"
                    >
                      {action}
                    </Button>
                  ))}
                  {/* Add this button in the Quick Actions section, right after the existing buttons: */}
                  <Button
                    key="test-modification"
                    variant="outline"
                    size="sm"
                    onClick={handleTestModification}
                    className="text-xs h-7 bg-yellow-50 border-yellow-200 text-yellow-800"
                  >
                    🧪 Test Modification
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
