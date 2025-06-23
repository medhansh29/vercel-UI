"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Loader2, AlertCircle } from "lucide-react"

interface InitialPromptScreenProps {
  onGenerate: (prompt: string) => void
  onTestConnection: () => Promise<boolean>
  isGenerating: boolean
}

export function InitialPromptScreen({ onGenerate, onTestConnection, isGenerating }: InitialPromptScreenProps) {
  const [prompt, setPrompt] = useState("")

  const handleTestConnection = async () => {
    const isConnected = await onTestConnection()
    // Connection test feedback is handled in the hook
  }

  const handleGenerateWithSample = () => {
    onGenerate("Generate sample audiences for an e-commerce fashion brand")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Generate Your Audiences</CardTitle>
          <CardDescription>
            Describe your target audience requirements and let AI generate optimized audience segments for your
            campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              If the API is unavailable, the system will use sample data for development and testing.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="prompt">Audience Generation Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., Generate audiences for a fashion e-commerce brand targeting young professionals who are interested in sustainable clothing..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTestConnection} className="flex-1">
              Test API Connection
            </Button>
            <Button onClick={() => onGenerate(prompt)} disabled={!prompt.trim() || isGenerating} className="flex-2">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Audiences...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Generate Audiences
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <Button variant="link" onClick={handleGenerateWithSample} disabled={isGenerating}>
              Or try with sample prompt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
