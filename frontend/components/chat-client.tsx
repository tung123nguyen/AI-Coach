'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Message, Persona } from '@/lib/types'
import ChatMessage from '@/components/chat-message'

interface ChatClientProps {
  sessionId: string
  initialMessages: Message[]
  persona: Persona
}

export default function ChatClient({ sessionId, initialMessages, persona }: ChatClientProps) {
  const router = useRouter()
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
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Top bar */}
      <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-xl">
            {persona?.name?.charAt(0) || '?'}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{persona?.name || 'AI'}</div>
            <div className="text-xs text-zinc-500">Đang chat</div>
          </div>
        </div>
        <button
          onClick={handleEnd}
          disabled={isEnding}
          className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
        >
          {isEnding ? 'Đang kết thúc...' : 'Kết thúc'}
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-1">
            <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[75%]">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:300ms]" />
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

      {/* Input bar */}
      <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-4">
        <div className="flex gap-3 items-end max-w-3xl mx-auto">
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
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50 transition-colors"
            style={{ minHeight: '48px', maxHeight: '96px' }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || isEnding || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 text-sm font-medium transition-colors shrink-0"
          >
            Gửi
          </button>
        </div>
        <div className="text-right text-xs text-zinc-600 mt-1 max-w-3xl mx-auto pr-[72px]">
          {input.length}/500
        </div>
      </div>
    </div>
  )
}
