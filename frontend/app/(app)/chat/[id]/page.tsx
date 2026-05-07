import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatClient from '@/components/chat-client'
import { CoachCard, Message } from '@/lib/types'

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) notFound()

  const [{ data: messages }, { data: situation }, { data: coachLogs }] = await Promise.all([
    supabase
      .from('messages')
      .select('id, sender, content, created_at')
      .eq('session_id', id)
      .order('created_at'),
    supabase
      .from('situations')
      .select('persona_data')
      .eq('id', session.situation_id)
      .single(),
    supabase
      .from('coach_logs')
      .select('message_id, severity, issue, suggestions, explanation')
      .eq('session_id', id),
  ])

  // Map message_id → coach card so each user message gets its card when replaying.
  const coachByMsgId: Record<string, CoachCard> = {}
  for (const log of coachLogs || []) {
    coachByMsgId[log.message_id] = {
      severity: log.severity,
      issue: log.issue,
      suggestions: log.suggestions || [],
      explanation: log.explanation,
    }
  }

  const messagesWithCoach: Message[] = (messages || []).map(m => ({
    ...m,
    coach_card: coachByMsgId[m.id] ?? null,
  }))

  return (
    <ChatClient
      sessionId={id}
      initialMessages={messagesWithCoach}
      persona={situation?.persona_data || {}}
      sessionStatus={session.status}
    />
  )
}
