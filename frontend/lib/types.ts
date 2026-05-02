export type Persona = {
  name: string
  age: number
  background: string
  personality: string
  goal?: string
}

export type Situation = {
  id: string
  name: string
  description: string
  difficulty: number
  category: string
  emoji: string
  persona_data: Persona
  opening_line: string
  objectives?: Record<string, string>
}

export type Message = {
  id: string
  sender: 'user' | 'ai'
  content: string
  created_at: string
}

export type Session = {
  id: string
  status: 'active' | 'ended'
  started_at: string
  ended_at?: string
  situation_id: string
}

export type FeedbackCard = {
  title: string
  content: string
  better_version?: string
}

export type Feedback = {
  good: FeedbackCard
  improve: FeedbackCard
  tip: FeedbackCard
}
