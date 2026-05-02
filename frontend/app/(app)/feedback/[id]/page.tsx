import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FeedbackContent from '@/components/feedback-content'
import FeedbackProcessing from '@/components/feedback-processing'

interface FeedbackPageProps {
  params: Promise<{ id: string }>
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
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

  const [{ data: feedback }, { data: messages }, { data: situation }] = await Promise.all([
    supabase
      .from('feedbacks')
      .select('*')
      .eq('session_id', id)
      .single(),
    supabase
      .from('messages')
      .select('id, sender, content, created_at')
      .eq('session_id', id)
      .order('created_at'),
    supabase
      .from('situations')
      .select('name, emoji, persona_data')
      .eq('id', session.situation_id)
      .single(),
  ])

  if (!feedback) {
    return <FeedbackProcessing sessionId={id} />
  }

  const minutesDiff = session.ended_at
    ? Math.max(1, Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000))
    : 0
  const userMessageCount = (messages || []).filter((m: { sender: string }) => m.sender === 'user').length

  return (
    <FeedbackContent
      sessionId={id}
      feedback={{
        good: { title: 'Bạn làm tốt', content: feedback.good_text },
        improve: {
          title: 'Có thể cải thiện',
          content: feedback.improve_text,
          better_version: feedback.improve_better_version || undefined,
        },
        tip: { title: 'Tip cho lần tới', content: feedback.tip_text },
      }}
      situationName={situation?.name || ''}
      situationEmoji={situation?.emoji || '💬'}
      personaName={situation?.persona_data?.name || 'AI'}
      minutesDiff={minutesDiff}
      userMessageCount={userMessageCount}
    />
  )
}
