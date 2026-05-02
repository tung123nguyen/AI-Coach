import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Conversation Gym — Luyện giao tiếp với AI',
  description: 'Từ "không biết nói gì" đến phản xạ tự nhiên. Chat với AI personas thật, nhận feedback cụ thể từng câu.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geist.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 text-white">{children}</body>
    </html>
  )
}
