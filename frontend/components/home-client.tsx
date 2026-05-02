'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
    <div className="min-h-screen bg-zinc-950">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-sm text-zinc-500 font-medium mb-1">
              <span className="text-blue-400">Conv</span>Gym
            </div>
            <h1 className="text-2xl font-bold text-white">
              Chào {userName}! 👋
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-2 transition-colors"
          >
            Đăng xuất
          </button>
        </div>

        {/* Section heading */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Practice hôm nay</h2>
          <p className="text-sm text-zinc-500 mt-1">Chọn tình huống phù hợp với bạn</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
            <span className="shrink-0 mt-px">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Situations grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 h-44 animate-pulse" />
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
