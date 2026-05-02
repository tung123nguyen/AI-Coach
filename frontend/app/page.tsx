import Link from 'next/link'
import { MessageCircle, BarChart3, Repeat2 } from 'lucide-react'

const features = [
  {
    icon: MessageCircle,
    title: 'AI Persona thật',
    desc: 'Đồng nghiệp mới, sếp thang máy, người date — mỗi AI có background, tính cách và cảm xúc riêng.',
  },
  {
    icon: BarChart3,
    title: 'Feedback cụ thể',
    desc: 'Coach AI trích dẫn đúng câu bạn nói, giải thích tại sao tốt hay cần cải thiện — không nói chung chung.',
  },
  {
    icon: Repeat2,
    title: 'Luyện mỗi ngày',
    desc: '5 tình huống từ dễ đến khó. Mỗi session 5 phút. Luyện đều đặn, phản xạ tự khắc tốt lên.',
  },
]

const preview = [
  { sender: 'ai', text: 'Chào anh! Em là Hằng, mới chuyển team từ tuần trước. Anh làm bên Engineering nhỉ?' },
  { sender: 'user', text: 'Ừ đúng rồi, mình làm backend. Hằng chuyển từ team nào vậy?' },
  { sender: 'ai', text: 'Em từ Marketing ạ 😊 Anh hay dùng ngôn ngữ gì? Em tò mò lắm!' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 right-0 w-175 h-175 bg-blue-600/7 rounded-full blur-3xl" />
        <div className="absolute top-120 -left-40 w-125 h-125 bg-violet-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-100 h-100 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <span className="font-bold text-lg tracking-tight">
          <span className="text-blue-400">Conv</span>Gym
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            Đăng nhập
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-white text-zinc-900 font-semibold px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            Bắt đầu miễn phí
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
              Miễn phí · 5 phút mỗi ngày
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Phòng tập{' '}
              <span className="bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                giao tiếp
              </span>
              <br />với AI
            </h1>

            <p className="text-lg text-zinc-400 max-w-md mb-10 leading-relaxed">
              Từ &ldquo;không biết nói gì&rdquo; đến phản xạ tự nhiên —
              chat với AI personas thật, nhận feedback cụ thể từng câu.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
              >
                Bắt đầu miễn phí →
              </Link>
              <Link
                href="/login"
                className="px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-colors"
              >
                Đăng nhập
              </Link>
            </div>
          </div>

          {/* Chat preview mockup */}
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-pink-400 to-orange-400 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  H
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Hằng</p>
                  <p className="text-xs text-zinc-500">Đồng nghiệp mới · Marketing</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-zinc-500">Live</span>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3">
                {preview.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[82%] px-4 py-2.5 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                          : 'bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback preview */}
              <div className="mx-4 mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-xs font-medium text-emerald-400 mb-1">✦ Feedback từ Coach AI</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tin số 2: &lsquo;Hằng chuyển từ team nào vậy?&rsquo; — Hỏi lại ngay, rất tự nhiên. Tiếp tục giữ nhịp này!
                </p>
              </div>

              {/* Input */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-zinc-600 flex-1 select-none">Nhập tin nhắn...</span>
                  <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M1 6h10M6 1l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-all"
            >
              <div className="w-10 h-10 bg-blue-500/10 group-hover:bg-blue-500/15 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <f.icon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-10 text-sm text-zinc-700">
        Conversation Gym · 2026
      </footer>
    </div>
  )
}
