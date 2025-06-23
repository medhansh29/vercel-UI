export interface Condition {
  field: string
  operator: string
  value: number | number[]
}

export interface Rule {
  operator: string
  conditions: Condition[]
}

export interface Audience {
  id: string
  name: string
  rule: Rule
  estimated_size: number | null
  estimated_conversion_rate: number
  rationale: string
  top_features: string[]
  cohort_score: number
  cohort_rationale: string
}

export interface AudienceResponse {
  prompt_interpretation: string
  generated_on: string
  suggested_audiences: Audience[]
}

export interface Step {
  id: number
  name: string
  icon: any
  completed: boolean
  active: boolean
}
