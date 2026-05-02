import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatClient from '@/components/chat-client'

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

  const [{ data: messages }, { data: situation }] = await Promise.all([
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
  ])

  return (
    <ChatClient
      sessionId={id}
      initialMessages={messages || []}
      persona={situation?.persona_data || {}}
      sessionStatus={session.status}
    />
  )
}
