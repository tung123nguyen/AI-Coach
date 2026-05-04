'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/api'
import { Situation } from '@/lib/types'
import SituationCard from '@/components/situation-card'

interface HomeClientProps {
  userName: string
}

export default function HomeClient({ userName }: HomeClientProps) {
  const router = useRouter()
  const [situations, setSituations] = useState<Situation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getSituations()
      .then((data: Situation[]) => setSituations(data))
      .catch(() => setError('Không thể tải danh sách tình huống'))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleStartSituation(situationId: string) {
    if (isCreatingSession) return
    setIsCreatingSession(true)
    try {
      const data = await api.createSession(situationId)
      router.push(`/chat/${data.session_id}`)
    } catch {
      setError('Không thể tạo session. Vui lòng thử lại.')
      setIsCreatingSession(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top nav */}
      <nav className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span>ConvGym</span>
            <span className="w-3.5 h-3.5 bg-blue-600 rounded-sm inline-block" />
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/6 rounded-lg px-3 py-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-500 mb-3">
            Practice hôm nay
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="text-zinc-500">Chào </span>
            <span className="text-white">{userName}.</span>
          </h1>
          <p className="text-zinc-400 text-base max-w-xl">
            Chọn một tình huống dưới đây và luyện 5 phút để giữ nhịp giao tiếp của bạn.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
            <span className="shrink-0 mt-px">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Situations grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/2 border border-white/10 rounded-2xl p-5 h-44 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {situations.map((situation) => (
              <SituationCard
                key={situation.id}
                situation={situation}
                onStart={() => handleStartSituation(situation.id)}
                isLoading={isCreatingSession}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
