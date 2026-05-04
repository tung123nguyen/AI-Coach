import { Message } from '@/lib/types'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user'

  const time = new Date(message.created_at).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap wrap-break-word ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-white/6 text-zinc-100 rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-zinc-600 px-1">{time}</span>
      </div>
    </div>
  )
}
