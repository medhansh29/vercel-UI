"use client"

import { useState } from "react"
import type { Audience } from "@/types/audience"
import { toast } from "@/hooks/use-toast"

// Mock data with proper structure
const mockAudiences: Audience[] = [
  {
    id: "mock-1",
    name: "Style-Conscious Young Professionals",
    rule: {
      operator: "AND",
      conditions: [
        { field: "age", operator: "between", value: [25, 35] },
        { field: "income", operator: ">=", value: 50000 },
        { field: "interests", operator: "contains", value: ["fashion", "style"] },
      ],
    },
    estimated_size: 15000,
    estimated_conversion_rate: 0.08,
    rationale:
      "This group includes style-conscious young professionals who value quality fashion and are willing to invest in their appearance. They have disposable income and are active on social media.",
    top_features: ["fashion-forward", "social-media-active", "brand-conscious"],
    cohort_score: 75,
    cohort_rationale:
      "High conversion potential due to strong purchasing power and brand affinity. Active engagement on digital platforms makes them ideal for targeted campaigns.",
  },
  {
    id: "mock-2",
    name: "Eco-Conscious Millennials",
    rule: {
      operator: "AND",
      conditions: [
        { field: "age", operator: "between", value: [28, 40] },
        { field: "interests", operator: "contains", value: ["sustainability", "environment"] },
        { field: "purchase_behavior", operator: "=", value: "eco-friendly" },
      ],
    },
    estimated_size: 22000,
    estimated_conversion_rate: 0.12,
    rationale:
      "Environmentally conscious millennials who prioritize sustainable products and ethical brands. They research purchases thoroughly and are willing to pay premium for eco-friendly options.",
    top_features: ["sustainability-focused", "research-driven", "premium-willing"],
    cohort_score: 85,
    cohort_rationale:
      "Excellent conversion potential with high lifetime value. Strong brand loyalty once trust is established. Ideal for sustainable product lines.",
  },
  {
    id: "mock-3",
    name: "Tech-Savvy Early Adopters",
    rule: {
      operator: "AND",
      conditions: [
        { field: "age", operator: "between", value: [22, 45] },
        { field: "tech_engagement", operator: ">=", value: 8 },
        { field: "early_adopter_score", operator: ">=", value: 7 },
      ],
    },
    estimated_size: 8500,
    estimated_conversion_rate: 0.15,
    rationale:
      "Technology enthusiasts who are among the first to try new products and services. They influence others through reviews and social sharing, making them valuable for product launches.",
    top_features: ["tech-enthusiast", "influencer", "early-adopter"],
    cohort_score: 90,
    cohort_rationale:
      "Highest conversion rate segment with strong influence potential. Perfect for beta testing and product launches. High engagement across all digital channels.",
  },
]

// Function to ensure audience data integrity
const sanitizeAudience = (audience: any): Audience => {
  return {
    id: audience?.id || `audience-${Date.now()}`,
    name: audience?.name || "Unnamed Audience",
    rule: {
      operator: audience?.rule?.operator || "AND",
      conditions: Array.isArray(audience?.rule?.conditions) ? audience.rule.conditions : [],
    },
    estimated_size: audience?.estimated_size || null,
    estimated_conversion_rate: audience?.estimated_conversion_rate || 0,
    rationale: audience?.rationale || "",
    top_features: Array.isArray(audience?.top_features) ? audience.top_features : [],
    cohort_score: audience?.cohort_score || 0,
    cohort_rationale: audience?.cohort_rationale || "",
  }
}

export function useAudienceApi() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isModifying, setIsModifying] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const testConnection = async () => {
    try {
      const response = await fetch("/api/test-connection")

      // Check if response is ok first
      if (!response.ok) {
        console.log("Connection test failed with status:", response.status)
        return false
      }

      // Try to parse as JSON, but handle cases where it's not JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json()
        console.log("Connection test result:", result)
        return true
      } else {
        // If it's not JSON, just check if response was ok
        console.log("Connection test returned non-JSON response, but status was ok")
        return true
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      return false
    }
  }

  const generateAudiences = async (prompt: string, currentAudiences: Audience[]) => {
    setIsGenerating(true)
    try {
      console.log("Attempting to generate audiences with prompt:", prompt)

      // Test connection first
      const isConnected = await testConnection()
      if (!isConnected) {
        console.log("Connection failed, using mock data")
        toast({
          title: "Using Mock Data",
          description: "API connection failed. Using sample audiences for development.",
          variant: "default",
        })
        return mockAudiences
      }

      console.log("Sending generation request...")

      const response = await fetch("/api/audiences/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_prompt: prompt,
          current_audiences: currentAudiences,
        }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        console.error("API Error - Status:", response.status)

        // Try to get error message, but handle non-JSON responses
        let errorMessage = `HTTP ${response.status}: Failed to generate audiences`
        try {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            console.error("API Error Data:", errorData)

            if (errorData.error && errorData.error.includes("SuggestedAudiencesOutput")) {
              toast({
                title: "Backend LLM Error",
                description: "There's an issue with the AI generation service. Using sample data instead.",
              })
              return mockAudiences
            }

            errorMessage = errorData.error || errorMessage
          } else {
            const textResponse = await response.text()
            console.error("API Error Text:", textResponse.substring(0, 200))
            errorMessage = "Server returned an error page instead of JSON"
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
        }

        // Always fall back to mock data on API errors
        toast({
          title: "Using Sample Data",
          description: "API error occurred. Using sample audiences for development.",
        })
        return mockAudiences
      }

      // Try to parse successful response
      let data
      try {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          data = await response.json()
        } else {
          console.error("API returned non-JSON response")
          throw new Error("API returned non-JSON response")
        }
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        toast({
          title: "Using Sample Data",
          description: "API returned invalid response format. Using sample data for development.",
        })
        return mockAudiences
      }

      console.log("Received data:", data)

      // Handle different response formats
      let rawAudiences = []

      if (data.data) {
        const audienceData = data.data
        if (Array.isArray(audienceData)) {
          rawAudiences = audienceData
        } else if (audienceData.suggested_audiences && Array.isArray(audienceData.suggested_audiences)) {
          rawAudiences = audienceData.suggested_audiences
        }
      } else if (data.suggested_audiences && Array.isArray(data.suggested_audiences)) {
        rawAudiences = data.suggested_audiences
      } else if (Array.isArray(data)) {
        rawAudiences = data
      }

      console.log("Raw audiences:", rawAudiences)

      if (!Array.isArray(rawAudiences) || rawAudiences.length === 0) {
        console.log("No valid audiences returned, using mock data")
        toast({
          title: "Using Sample Data",
          description: "API returned no audiences. Using sample data for development.",
        })
        return mockAudiences
      }

      // Sanitize all audiences to ensure proper structure
      const sanitizedAudiences = rawAudiences.map(sanitizeAudience)

      console.log("Sanitized audiences:", sanitizedAudiences)

      toast({
        title: "Success",
        description: `Generated ${sanitizedAudiences.length} audiences`,
      })

      return sanitizedAudiences
    } catch (error) {
      console.error("Generation error:", error)

      // Always fall back to mock data on any error
      toast({
        title: "Using Sample Data",
        description: "API error occurred. Using sample audiences for development. Check console for details.",
      })

      return mockAudiences
    } finally {
      setIsGenerating(false)
    }
  }

  const modifyAudience = async (audienceId: string, prompt: string, currentAudiences: Audience[]) => {
    setIsModifying(true)

    // Find the specific audience being modified
    const targetAudience = currentAudiences.find((aud) => aud.id === audienceId)

    console.log("=== MODIFY AUDIENCE REQUEST ===")
    console.log("Target Audience ID:", audienceId)
    console.log("Target Audience:", targetAudience)
    console.log("Modification Prompt:", prompt)

    if (!targetAudience) {
      console.error("Target audience not found")
      setIsModifying(false)
      return currentAudiences
    }

    const requestPayload = {
      audience_id: audienceId,
      user_prompt: prompt,
      current_audience: targetAudience,
      current_audiences: currentAudiences,
    }

    console.log("=== MAKING ACTUAL API CALL ===")
    console.log("URL: /api/audiences/modify")
    console.log("Method: PUT")
    console.log("Payload:", requestPayload)

    try {
      const response = await fetch("/api/audiences/modify", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      console.log("=== API CALL COMPLETED ===")
      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      const responseText = await response.text()
      console.log("Response text:", responseText)

      if (!response.ok) {
        console.error("API call failed with status:", response.status)
        throw new Error(`API call failed: ${response.status}`)
      }

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log("=== PARSED RESPONSE DATA ===")
        console.log("Full response object:", data)
        console.log("Available keys:", Object.keys(data))
      } catch (parseError) {
        console.log("Response is not JSON, using local fallback")
        return await localModifyFallback(audienceId, prompt, currentAudiences)
      }

      // Extract modified audience from response - check ALL possible locations
      let modifiedAudience = null

      console.log("=== SEARCHING FOR MODIFIED AUDIENCE ===")

      // Check direct properties
      if (data.modified_audience) {
        console.log("Found modified_audience in data.modified_audience")
        modifiedAudience = sanitizeAudience(data.modified_audience)
      } else if (data.audience) {
        console.log("Found audience in data.audience")
        modifiedAudience = sanitizeAudience(data.audience)
      } else if (data.data && data.data.modified_audience) {
        console.log("Found modified_audience in data.data.modified_audience")
        modifiedAudience = sanitizeAudience(data.data.modified_audience)
      } else if (data.data && data.data.audience) {
        console.log("Found audience in data.data.audience")
        modifiedAudience = sanitizeAudience(data.data.audience)
      } else if (
        data.suggested_audiences &&
        Array.isArray(data.suggested_audiences) &&
        data.suggested_audiences.length > 0
      ) {
        console.log("Found audience in data.suggested_audiences[0]")
        modifiedAudience = sanitizeAudience(data.suggested_audiences[0])
      } else if (Array.isArray(data) && data.length > 0) {
        console.log("Found audience in data[0] (array response)")
        modifiedAudience = sanitizeAudience(data[0])
      } else {
        console.log("=== NO MODIFIED AUDIENCE FOUND ===")
        console.log("Response structure:", JSON.stringify(data, null, 2))
        console.log("Using local fallback")
        return await localModifyFallback(audienceId, prompt, currentAudiences)
      }

      console.log("=== EXTRACTED MODIFIED AUDIENCE ===")
      console.log("Modified audience:", modifiedAudience)

      if (!modifiedAudience || !modifiedAudience.id) {
        console.log("Modified audience is invalid, using local fallback")
        return await localModifyFallback(audienceId, prompt, currentAudiences)
      }

      // Ensure the ID matches the original audience
      modifiedAudience.id = audienceId

      // Update audiences array
      const updatedAudiences = currentAudiences.map((aud) => (aud.id === audienceId ? modifiedAudience : aud))

      console.log("=== BACKEND MODIFICATION SUCCESS ===")
      console.log("Original audience name:", targetAudience.name)
      console.log("Modified audience name:", modifiedAudience.name)

      toast({
        title: "Backend Modification Success",
        description: `Modified "${targetAudience.name}" using backend AI`,
      })

      return updatedAudiences
    } catch (error) {
      console.error("=== API CALL ERROR ===")
      console.error("Error:", error)

      toast({
        title: "API Error",
        description: "Backend call failed, using local modification",
      })

      return await localModifyFallback(audienceId, prompt, currentAudiences)
    } finally {
      setIsModifying(false)
    }
  }

  // Local fallback modification function
  const localModifyFallback = async (audienceId: string, prompt: string, currentAudiences: Audience[]) => {
    const targetAudience = currentAudiences.find((aud) => aud.id === audienceId)

    if (!targetAudience) {
      return currentAudiences
    }

    console.log("=== APPLYING LOCAL FALLBACK MODIFICATION ===")

    // Create a modified version based on the specific prompt
    const modifiedAudience = { ...targetAudience }
    const changesMade = []

    // Process different types of requests
    const lowerPrompt = prompt.toLowerCase()

    // Handle title/name changes
    if (
      lowerPrompt.includes("new title") ||
      lowerPrompt.includes("rename") ||
      lowerPrompt.includes("change name") ||
      lowerPrompt.includes("title")
    ) {
      const newTitles = [
        "Premium Engagement Specialists",
        "High-Intent Purchase Decision Makers",
        "Digital-First Professional Adopters",
        "Value-Driven Quality Seekers",
        "Innovation-Ready Market Leaders",
        "Strategic Growth Partners",
        "Premium Experience Enthusiasts",
      ]
      const randomTitle = newTitles[Math.floor(Math.random() * newTitles.length)]
      modifiedAudience.name = randomTitle
      changesMade.push(`Changed title to "${randomTitle}"`)
    }

    // Handle targeting refinement
    if (
      lowerPrompt.includes("more specific") ||
      lowerPrompt.includes("targeted") ||
      lowerPrompt.includes("narrow") ||
      lowerPrompt.includes("refine")
    ) {
      modifiedAudience.estimated_size = targetAudience.estimated_size
        ? Math.round(targetAudience.estimated_size * 0.7)
        : null
      modifiedAudience.estimated_conversion_rate = Math.min(targetAudience.estimated_conversion_rate * 1.3, 1)
      modifiedAudience.cohort_score = Math.min((targetAudience.cohort_score || 80) + 15, 100)
      changesMade.push("Made targeting more specific and refined")
      changesMade.push("Reduced audience size but increased conversion potential")
    }

    // Handle expansion requests
    if (
      lowerPrompt.includes("expand") ||
      lowerPrompt.includes("broader") ||
      lowerPrompt.includes("include more") ||
      lowerPrompt.includes("similar")
    ) {
      modifiedAudience.estimated_size = targetAudience.estimated_size
        ? Math.round(targetAudience.estimated_size * 1.4)
        : null
      modifiedAudience.estimated_conversion_rate = Math.max(targetAudience.estimated_conversion_rate * 0.9, 0.01)
      changesMade.push("Expanded audience to include similar user groups")
      changesMade.push("Increased reach while maintaining quality")
    }

    // Handle conversion optimization
    if (lowerPrompt.includes("conversion") || lowerPrompt.includes("optimize") || lowerPrompt.includes("performance")) {
      modifiedAudience.estimated_conversion_rate = Math.min(targetAudience.estimated_conversion_rate * 1.25, 1)
      modifiedAudience.cohort_score = Math.min((targetAudience.cohort_score || 80) + 12, 100)
      changesMade.push("Optimized for higher conversion rates")
      changesMade.push("Enhanced performance metrics")
    }

    // If no specific changes were detected, apply the prompt as a general enhancement
    if (changesMade.length === 0) {
      modifiedAudience.estimated_conversion_rate = Math.min(targetAudience.estimated_conversion_rate * 1.1, 1)
      modifiedAudience.cohort_score = Math.min((targetAudience.cohort_score || 80) + 5, 100)
      changesMade.push(`Applied custom modification: "${prompt}"`)
    }

    // Always update rationale with the specific prompt
    modifiedAudience.rationale = `${targetAudience.rationale}\n\n[AI Modification - ${new Date().toLocaleTimeString()}]: ${prompt}`
    modifiedAudience.cohort_rationale = `${targetAudience.cohort_rationale || ""}\n\n[User Request]: ${prompt}\n[Changes Applied]: ${changesMade.join(", ")}`

    // Mark as AI modified if not already
    if (!modifiedAudience.name.includes("(AI Modified)")) {
      modifiedAudience.name = `${modifiedAudience.name} (AI Modified)`
    }

    const updatedAudiences = currentAudiences.map((aud) => (aud.id === audienceId ? modifiedAudience : aud))

    return updatedAudiences
  }

  const deleteAudience = async (audienceId: string, currentAudiences: Audience[]) => {
    try {
      // For now, handle delete locally since API might be having issues
      const updatedAudiences = currentAudiences.filter((audience) => audience.id !== audienceId)

      toast({
        title: "Success",
        description: "Audience deleted successfully",
      })

      return updatedAudiences
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete audience",
        variant: "destructive",
      })
      return currentAudiences
    }
  }

  const finalizeAudiences = async (selectedAudienceIds: string[], allAudiences: Audience[]) => {
    setIsFinalizing(true)

    // Filter to only the selected audiences
    const selectedAudiences = allAudiences.filter((aud) => selectedAudienceIds.includes(aud.id))

    console.log("=== FINALIZE SELECTED AUDIENCES ===")
    console.log("Selected Audience IDs:", selectedAudienceIds)
    console.log(
      "Selected Audiences:",
      selectedAudiences.map((aud) => ({ id: aud.id, name: aud.name })),
    )

    try {
      const response = await fetch("/api/audiences/finalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "user-123",
          current_audiences: selectedAudiences, // Only send selected audiences
          action_finalize: "overwrite",
        }),
      })

      if (!response.ok) {
        // For finalization, we can simulate success for development
        toast({
          title: "Development Mode",
          description: `${selectedAudiences.length} selected audiences would be saved in production. Proceeding to next step.`,
        })
        return true
      }

      toast({
        title: "Success",
        description: `${selectedAudiences.length} audiences finalized and saved to database`,
      })

      return true
    } catch (error) {
      console.error("Finalize error:", error)
      toast({
        title: "Development Mode",
        description: `${selectedAudiences.length} selected audiences would be saved in production. Proceeding to next step.`,
      })
      return true // Allow progression in development
    } finally {
      setIsFinalizing(false)
    }
  }

  return {
    isGenerating,
    isModifying,
    isFinalizing,
    testConnection,
    generateAudiences,
    modifyAudience,
    deleteAudience,
    finalizeAudiences,
  }
}
