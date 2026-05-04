import Link from "next/link";
import { MessageCircle, BarChart3, Repeat2, Fingerprint, Sparkles, ArrowRight } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "AI Persona thật",
    desc: "Đồng nghiệp mới, sếp thang máy, người date — mỗi AI có background, tính cách và cảm xúc riêng.",
  },
  {
    icon: BarChart3,
    title: "Feedback cụ thể",
    desc: "Coach AI trích dẫn đúng câu bạn nói, giải thích tại sao tốt hay cần cải thiện — không nói chung chung.",
  },
  {
    icon: Repeat2,
    title: "Luyện mỗi ngày",
    desc: "5 tình huống từ dễ đến khó. Mỗi session 5 phút. Luyện đều đặn, phản xạ tự khắc tốt lên.",
  },
];

const preview = [
  {
    sender: "ai",
    text: "Chào anh! Em là Hằng, mới chuyển team từ tuần trước. Anh làm bên Engineering nhỉ?",
  },
  {
    sender: "user",
    text: "Ừ đúng rồi, mình làm backend. Hằng chuyển từ team nào vậy?",
  },
  {
    sender: "ai",
    text: "Em từ Marketing ạ 😊 Anh hay dùng ngôn ngữ gì? Em tò mò lắm!",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span>ConvGym</span>
            <span className="w-3.5 h-3.5 bg-blue-600 rounded-sm inline-block" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <a href="#how" className="hover:text-white transition-colors">Cách dùng</a>
            <a href="#pricing" className="hover:text-white transition-colors">Giá</a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2"
          >
            Đăng nhập
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium border border-white/15 hover:border-white/30 text-white px-4 py-2 rounded-lg transition-colors bg-white/2 hover:bg-white/6"
          >
            Request Demo
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Bắt đầu
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white/4 border border-white/10 text-zinc-300 text-xs font-medium px-3 py-1.5 rounded-full mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
          Kỷ nguyên giao tiếp với AI đã bắt đầu
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-8">
          <span className="text-zinc-500 block">Tương lai của giao tiếp</span>
          <span className="inline-flex items-center gap-3 sm:gap-5 flex-wrap justify-center">
            <span className="text-zinc-500">là</span>
            <Fingerprint className="w-10 h-10 sm:w-14 sm:h-14 text-blue-500 shrink-0" strokeWidth={1.75} />
            <span className="text-white">con người</span>
            <span className="text-zinc-500">+</span>
            <Sparkles className="w-10 h-10 sm:w-14 sm:h-14 text-blue-500 shrink-0" strokeWidth={1.75} />
            <span className="text-white">AI personas</span>
          </span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Phòng tập giao tiếp với AI personas thật — chat tự nhiên, nhận feedback từng câu,
          và biến &ldquo;không biết nói gì&rdquo; thành phản xạ tự nhiên trong 5 phút mỗi ngày.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
          >
            Bắt đầu miễn phí
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#demo"
            className="inline-flex items-center justify-center px-6 py-3.5 bg-white/3 hover:bg-white/8 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-colors"
          >
            Xem demo
          </a>
        </div>
      </section>

      {/* Demo / chat preview */}
      <section id="demo" className="relative z-10 max-w-3xl mx-auto px-6 pb-28">
        <div className="text-center mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-500 mb-3">Live preview</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Chat thật. Feedback thật.
          </h2>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-blue-950/20">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/2">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
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
          <div className="p-5 space-y-3">
            {preview.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] px-4 py-2.5 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-white/6 text-zinc-100 rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Feedback */}
          <div className="mx-5 mb-5 p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-xs font-semibold text-blue-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Feedback từ Coach AI
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Tin số 2: &lsquo;Hằng chuyển từ team nào vậy?&rsquo; — Hỏi lại ngay, rất tự nhiên. Tiếp tục giữ nhịp này!
            </p>
          </div>

          {/* Input */}
          <div className="px-5 pb-5">
            <div className="flex items-center gap-2 bg-white/4 border border-white/10 rounded-xl px-4 py-2.5">
              <span className="text-sm text-zinc-500 flex-1 select-none">Nhập tin nhắn...</span>
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-500 mb-3">Tại sao ConvGym</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl mx-auto">
            Luyện giao tiếp như đi gym — đều đặn, có feedback, tiến bộ thật.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-white/2 hover:bg-white/4 border border-white/10 hover:border-white/20 rounded-2xl p-7 transition-all"
            >
              <div className="w-11 h-11 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-xl flex items-center justify-center mb-5 transition-colors">
                <f.icon className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-base">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <div className="bg-linear-to-br from-blue-600/15 via-blue-600/5 to-transparent border border-blue-500/20 rounded-3xl p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Sẵn sàng cho buổi tập đầu tiên?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Miễn phí. 5 phút. Không cần thẻ tín dụng.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
          >
            Bắt đầu miễn phí
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">ConvGym</span>
            <span className="w-2 h-2 bg-blue-600 rounded-sm inline-block" />
          </div>
          <span>Conversation Gym · 2026</span>
        </div>
      </footer>
    </div>
  );
}
