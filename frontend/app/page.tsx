import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Phòng tập giao tiếp với AI
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mb-10">
          Từ &ldquo;không biết nói gì&rdquo; đến phản xạ tự nhiên — luyện 5 phút mỗi ngày
        </p>
        <div className="flex gap-4">
          <Link
            href="/signup"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Bắt đầu miễn phí
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-4xl mx-auto px-4 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-4xl mb-3">🎭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Persona thật</h3>
          <p className="text-gray-500 text-sm">
            Đồng nghiệp mới, sếp thang máy, người date — mỗi AI có background, tính cách và mục tiêu riêng.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback cụ thể</h3>
          <p className="text-gray-500 text-sm">
            Coach AI đọc từng tin nhắn, trích dẫn đúng câu bạn nói và giải thích tại sao tốt hoặc cần cải thiện.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-4xl mb-3">🌱</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice mỗi ngày</h3>
          <p className="text-gray-500 text-sm">
            5 tình huống từ dễ đến khó. Mỗi session chỉ 5 phút. Luyện đều đặn, phản xạ tự khắc hình thành.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center pb-8 text-sm text-gray-400">
        Conversation Gym · 2026
      </footer>
    </div>
  )
}
