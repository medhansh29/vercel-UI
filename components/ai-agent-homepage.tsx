"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Users, Sparkles, Target, DollarSign } from "lucide-react"

interface AIAgent {
  id: string
  name: string
  icon: any
  color: string
  bgColor: string
  description: string
  isPopular?: boolean
}

interface AIAgentHomepageProps {
  onStartWithAgent: (agentId: string | null, prompt: string) => void
}

const aiAgents: AIAgent[] = [
  {
    id: "retain-iq",
    name: "Retain IQ",
    icon: Users,
    color: "text-pink-600",
    bgColor: "bg-pink-500",
    description:
      "Analyze customer behavior patterns and create targeted retention strategies to reduce churn and increase lifetime value.",
  },
  {
    id: "recommend-iq",
    name: "Recommend IQ",
    icon: Sparkles,
    color: "text-blue-600",
    bgColor: "bg-blue-500",
    description:
      "Generate personalized recommendation engines using AI to boost engagement and drive conversions effortlessly.",
    isPopular: true,
  },
  {
    id: "user-iq",
    name: "User IQ",
    icon: Target,
    color: "text-purple-600",
    bgColor: "bg-purple-500",
    description:
      "Deep dive into user behavior analytics and insights to understand your audience and optimize user experience.",
  },
  {
    id: "income-assessment-iq",
    name: "Income Assessment IQ",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-500",
    description:
      "Evaluate and optimize your revenue streams with AI-powered financial analysis and growth recommendations.",
  },
]

export function AIAgentHomepage({ onStartWithAgent }: AIAgentHomepageProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [businessDescription, setBusinessDescription] = useState("")

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(selectedAgent === agentId ? null : agentId)
  }

  const handleGenerateStrategy = () => {
    if (!businessDescription.trim()) return
    onStartWithAgent(selectedAgent, businessDescription)
  }

  const selectedAgentData = selectedAgent ? aiAgents.find((agent) => agent.id === selectedAgent) : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create with AI</h1>
          <p className="text-lg text-gray-600">How would you like to get started?</p>
        </div>

        {/* AI Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {aiAgents.map((agent) => {
            const Icon = agent.icon
            const isSelected = selectedAgent === agent.id

            return (
              <Card
                key={agent.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
                }`}
                onClick={() => handleAgentSelect(agent.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${agent.bgColor} rounded-xl flex items-center justify-center relative`}>
                      <Icon className="w-6 h-6 text-white" />
                      {agent.isPopular && (
                        <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{agent.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium">✓ {agent.name} agent selected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Business Description Input */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your business to generate growth strategies
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="e.g., I'm launching a fitness app for busy professionals who want to work out at home..."
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    className="min-h-[120px] resize-none pr-4"
                  />
                </div>
              </div>

              {selectedAgentData && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className={`w-4 h-4 ${selectedAgentData.bgColor} rounded`}></div>
                  <span>
                    Using <strong>{selectedAgentData.name}</strong> for specialized insights
                  </span>
                </div>
              )}

              <Button
                onClick={handleGenerateStrategy}
                disabled={!businessDescription.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-base font-medium"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Strategy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Select an AI agent above or describe your business to get started with growth strategies.
          </p>
        </div>
      </div>
    </div>
  )
}
