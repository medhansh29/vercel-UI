export interface GrowthLever {
  id: string
  name: string
  description: string
  lever_type: string
  target_audience_id: string
  target_audience_name: string
  estimated_impact: number
  implementation_difficulty: number
  time_to_implement: string
  cost_estimate: string
  success_metrics: string[]
  implementation_steps: string[]
  rationale: string
  priority_score: number
}

export interface GrowthLeverResponse {
  prompt_interpretation: string
  generated_on: string
  suggested_growth_levers: GrowthLever[]
}
