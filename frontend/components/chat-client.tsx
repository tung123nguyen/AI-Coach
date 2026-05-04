'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { Message, Persona } from '@/lib/types'
import ChatMessage from '@/components/chat-message'

interface ChatClientProps {
  sessionId: string
  initialMessages: Message[]
  persona: Persona
  sessionStatus?: 'active' | 'ended'
}

export default function ChatClient({ sessionId, initialMessages, persona, sessionStatus }: ChatClientProps) {
  const router = useRouter()
  const isEnded = sessionStatus === 'ended'
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function autoResizeTextarea() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const lineHeight = 24
    const maxHeight = lineHeight * 3 + 24
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
  }

  async function handleSend() {
    const content = input.trim()
    if (!content || isLoading) return

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      content,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, optimisticMsg])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsLoading(true)
    setError('')

    try {
      const data = await api.sendMessage(sessionId, content)
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: data.ai_message,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      setError(err instanceof Error ? err.message : 'Gửi tin thất bại. Thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleEnd() {
    if (!window.confirm('Bạn chắc chắn muốn kết thúc?')) return
    setIsEnding(true)
    try {
      await api.endSession(sessionId)
      router.push(`/feedback/${sessionId}`)
    } catch {
      setError('Không thể kết thúc session. Thử lại.')
      setIsEnding(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Top bar */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-white/10 z-10 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {persona?.name?.charAt(0) || '?'}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{persona?.name || 'AI'}</div>
              <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isEnded ? 'bg-zinc-500' : 'bg-green-400'}`} />
                {isEnded ? 'Đã kết thúc' : 'Đang chat'}
              </div>
            </div>
          </div>
          {isEnded ? (
            <Link
              href={`/feedback/${sessionId}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg px-3.5 py-2 transition-colors"
            >
              Xem feedback
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={handleEnd}
              disabled={isEnding}
              className="text-sm text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/6 rounded-lg px-3.5 py-2 transition-colors disabled:opacity-50"
            >
              {isEnding ? 'Đang kết thúc...' : 'Kết thúc'}
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-1">
              <div className="bg-white/6 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[75%]">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center py-2">
              <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
                ⚠ {error}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 bg-black/80 backdrop-blur-sm border-t border-white/10 px-4 py-4">
        {isEnded ? (
          <div className="max-w-3xl mx-auto text-center text-sm text-zinc-500 py-2">
            Chat đã kết thúc — đây là bản xem lại
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 items-end bg-white/4 border border-white/10 rounded-2xl px-3 py-2 focus-within:border-blue-500/50 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  autoResizeTextarea()
                }}
                onKeyDown={handleKeyDown}
                disabled={isLoading || isEnding}
                placeholder="Nhập tin nhắn... (Enter để gửi)"
                maxLength={500}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder:text-zinc-600 px-2 py-2 text-sm resize-none focus:outline-none disabled:opacity-50"
                style={{ minHeight: '36px', maxHeight: '96px' }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || isEnding || !input.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg w-9 h-9 flex items-center justify-center transition-colors shrink-0"
                aria-label="Gửi"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right text-xs text-zinc-600 mt-1.5 pr-1">
              {input.length}/500
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
