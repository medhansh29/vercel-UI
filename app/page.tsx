"use client"

import { useState } from "react"
import type { Audience } from "@/types/audience"
import type { GrowthLever } from "@/types/growth-lever"
import { useAudienceApi } from "@/hooks/use-audience-api"
import { useGrowthLeverApi } from "@/hooks/use-growth-lever-api"
import { AIAgentHomepage } from "@/components/ai-agent-homepage"
import { InitialPromptScreen } from "@/components/initial-prompt-screen"
import { ChatInterface } from "@/components/chat-interface"
import { AudienceSelection } from "@/components/audience-selection"
import { GrowthLeverSelection } from "@/components/growth-lever-selection"
import { GrowthLeverLoading } from "@/components/growth-lever-loading"
import { AudienceConfigureDialog } from "@/components/audience-configure-dialog"

export default function AudienceGenerator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [growthLevers, setGrowthLevers] = useState<GrowthLever[]>([])
  const [selectedAudiences, setSelectedAudiences] = useState<Audience[]>([])
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null)
  const [selectedAudiencesForModification, setSelectedAudiencesForModification] = useState<Audience[]>([])
  const [selectedAudienceForAI, setSelectedAudienceForAI] = useState<Audience | null>(null)
  const [recentlyModifiedAudienceId, setRecentlyModifiedAudienceId] = useState<string | null>(null)
  const [isConfigureOpen, setIsConfigureOpen] = useState(false)
  const [showHomepage, setShowHomepage] = useState(true)
  const [showInitialPrompt, setShowInitialPrompt] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const {
    isGenerating,
    isModifying,
    isFinalizing,
    testConnection,
    generateAudiences,
    modifyAudience,
    deleteAudience,
    finalizeAudiences,
  } = useAudienceApi()

  const { isGeneratingGrowthLevers, isFinalizingGrowthLevers, generateGrowthLevers, finalizeGrowthLevers } =
    useGrowthLeverApi()

  const handleStartWithAgent = (agentId: string | null, prompt: string) => {
    setSelectedAgent(agentId)
    setShowHomepage(false)

    if (agentId) {
      handleGenerate(prompt)
    } else {
      setShowInitialPrompt(true)
    }
  }

  const handleGenerate = async (prompt: string) => {
    let enhancedPrompt = prompt
    if (selectedAgent) {
      const agentContext = getAgentContext(selectedAgent)
      enhancedPrompt = `${agentContext}\n\n${prompt}`
    }

    const newAudiences = await generateAudiences(enhancedPrompt, audiences)
    if (newAudiences) {
      setAudiences(newAudiences)
      setShowInitialPrompt(false)
    }
  }

  const getAgentContext = (agentId: string): string => {
    const contexts = {
      "retain-iq":
        "Focus on customer retention and churn reduction strategies. Generate audiences optimized for retention campaigns and lifetime value improvement.",
      "recommend-iq":
        "Focus on personalization and recommendation strategies. Generate audiences optimized for engagement and conversion through personalized experiences.",
      "user-iq":
        "Focus on user behavior analysis and experience optimization. Generate audiences based on deep behavioral insights and user journey optimization.",
      "income-assessment-iq":
        "Focus on revenue optimization and financial growth. Generate audiences optimized for revenue generation and monetization strategies.",
    }
    return contexts[agentId as keyof typeof contexts] || ""
  }

  const handleModification = async (selectedAudienceIds: string[], prompt: string) => {
    if (selectedAudienceIds.length > 0) {
      const updatedAudiences = await modifyAudience(selectedAudienceIds[0], prompt, audiences)
      if (updatedAudiences) {
        setAudiences(updatedAudiences)
        setSelectedAudiencesForModification([])
        setSelectedAudienceForAI(null)
        setRecentlyModifiedAudienceId(selectedAudienceIds[0])

        setTimeout(() => {
          setRecentlyModifiedAudienceId(null)
        }, 5000)
      }
    }
  }

  const handleAIModificationSubmit = async (audienceId: string, prompt: string) => {
    console.log("=== AI MODIFICATION SUBMIT ===")
    console.log("Audience ID:", audienceId)
    console.log("Prompt:", prompt)

    const updatedAudiences = await modifyAudience(audienceId, prompt, audiences)

    if (updatedAudiences && updatedAudiences.length > 0) {
      setAudiences([...updatedAudiences])
      setSelectedAudienceForAI(null)
      setRecentlyModifiedAudienceId(audienceId)

      setTimeout(() => {
        setRecentlyModifiedAudienceId(null)
      }, 8000)
    }
  }

  const handleSelectForModification = (audienceId: string, checked: boolean) => {
    const audience = audiences.find((aud) => aud.id === audienceId)
    if (!audience) return

    if (checked) {
      setSelectedAudiencesForModification((prev) => {
        const isAlreadySelected = prev.some((aud) => aud.id === audienceId)
        if (!isAlreadySelected) {
          return [...prev, audience]
        }
        return prev
      })
    } else {
      setSelectedAudiencesForModification((prev) => prev.filter((aud) => aud.id !== audienceId))
    }
  }

  const handleRemoveAudienceFromModification = (audienceId: string) => {
    setSelectedAudiencesForModification((prev) => prev.filter((aud) => aud.id !== audienceId))
  }

  const handleModifyWithAI = (audience: Audience) => {
    setSelectedAudienceForAI(audience)
    setSelectedAudiencesForModification([])
  }

  const handleDelete = async (audienceId: string) => {
    const updatedAudiences = await deleteAudience(audienceId, audiences)
    if (updatedAudiences) {
      setAudiences(updatedAudiences)
      setSelectedAudiencesForModification((prev) => prev.filter((aud) => aud.id !== audienceId))
    }
  }

  const handleFinalize = async (selectedAudienceIds: string[]) => {
    // Get the selected audiences
    const finalizedAudiences = audiences.filter((aud) => selectedAudienceIds.includes(aud.id))

    console.log("=== FINALIZING AUDIENCES AND GENERATING GROWTH LEVERS ===")
    console.log("Finalized audiences:", finalizedAudiences)

    // Call both finalize audiences and generate growth levers
    const [audienceSuccess, newGrowthLevers] = await Promise.all([
      finalizeAudiences(selectedAudienceIds, audiences),
      generateGrowthLevers(finalizedAudiences),
    ])

    if (audienceSuccess && newGrowthLevers) {
      setSelectedAudiences(finalizedAudiences)
      setGrowthLevers(newGrowthLevers)
      setCurrentStep(1) // Move to growth levers step
    }
  }

  const handleConfigure = (audience: Audience) => {
    setSelectedAudience(audience)
    setIsConfigureOpen(true)
  }

  const handleSaveConfiguration = (updatedAudience: Audience) => {
    setAudiences((prev) => prev.map((aud) => (aud.id === updatedAudience.id ? updatedAudience : aud)))
  }

  const handleConfigureGrowthLever = (growthLever: GrowthLever) => {
    setGrowthLevers((prev) => prev.map((lever) => (lever.id === growthLever.id ? growthLever : lever)))
  }

  const handleDeleteGrowthLever = (growthLeverId: string) => {
    setGrowthLevers((prev) => prev.filter((lever) => lever.id !== growthLeverId))
  }

  const handleFinalizeGrowthLevers = async (selectedGrowthLeverIds: string[]) => {
    const success = await finalizeGrowthLevers(selectedGrowthLeverIds, growthLevers)
    if (success) {
      setCurrentStep(2) // Move to campaign generation step
    }
  }

  if (showHomepage) {
    return <AIAgentHomepage onStartWithAgent={handleStartWithAgent} />
  }

  if (showInitialPrompt) {
    return (
      <InitialPromptScreen onGenerate={handleGenerate} onTestConnection={testConnection} isGenerating={isGenerating} />
    )
  }

  // Show loading screen when generating growth levers
  if (isGeneratingGrowthLevers) {
    return <GrowthLeverLoading selectedAudiences={selectedAudiences} />
  }

  // Show growth levers page
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ChatInterface
          selectedAudiencesForModification={selectedAudiencesForModification}
          onModificationSubmit={handleModification}
          onRemoveAudienceFromModification={handleRemoveAudienceFromModification}
          onGenerate={handleGenerate}
          isModifying={isModifying}
          isGenerating={isGeneratingGrowthLevers}
          audiences={audiences}
          selectedAudienceForAI={selectedAudienceForAI}
        />

        <GrowthLeverSelection
          growthLevers={growthLevers}
          selectedAudiences={selectedAudiences}
          onConfigure={handleConfigureGrowthLever}
          onDelete={handleDeleteGrowthLever}
          onFinalize={handleFinalizeGrowthLevers}
          isFinalizing={isFinalizingGrowthLevers}
        />
      </div>
    )
  }

  // Show audiences page (step 0)
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ChatInterface
        selectedAudiencesForModification={selectedAudiencesForModification}
        onModificationSubmit={handleModification}
        onRemoveAudienceFromModification={handleRemoveAudienceFromModification}
        onGenerate={handleGenerate}
        isModifying={isModifying}
        isGenerating={isGenerating}
        audiences={audiences}
        selectedAudienceForAI={selectedAudienceForAI}
      />

      <AudienceSelection
        audiences={audiences}
        onConfigure={handleConfigure}
        onDelete={handleDelete}
        onFinalize={handleFinalize}
        selectedAudiencesForModification={selectedAudiencesForModification}
        onSelectForModification={handleSelectForModification}
        onModifyWithAI={handleModifyWithAI}
        selectedAudienceForAI={selectedAudienceForAI}
        recentlyModifiedAudienceId={recentlyModifiedAudienceId}
        isFinalizing={isFinalizing}
        isModifying={isModifying}
        onAIModificationSubmit={handleAIModificationSubmit}
      />

      <AudienceConfigureDialog
        audience={selectedAudience}
        isOpen={isConfigureOpen}
        onClose={() => setIsConfigureOpen(false)}
        onSave={handleSaveConfiguration}
      />
    </div>
  )
}
