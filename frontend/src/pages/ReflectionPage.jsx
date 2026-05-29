import React, { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation'
import { reflectionAPI } from '../services/api'
import { AlertCircle, Loader, Heart, Sparkles } from 'lucide-react'
import { format } from 'date-fns'

const EMOTION_PRESETS = [
  { label: '😰 Stressed', value: 'stressed' },
  { label: '😢 Sad', value: 'sad' },
  { label: '😠 Angry', value: 'angry' },
  { label: '😟 Anxious', value: 'anxious' },
  { label: '😔 Lonely', value: 'lonely' },
  { label: '😕 Confused', value: 'confused' },
  { label: '😊 Happy', value: 'happy' },
  { label: '😌 Calm', value: 'calm' },
]

export const ReflectionPage = () => {
  const [formData, setFormData] = useState({
    emotion: '',
    trigger: '',
    intensity: 5,
    context: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await reflectionAPI.getReflections({ limit: 10 })
      setHistory(res.data.reflections || [])
    } catch {
      // non-critical
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.emotion.trim()) return

    setSubmitting(true)
    setError('')
    setResult(null)

    try {
      const res = await reflectionAPI.createReflection(formData)
      setResult(res.data.reflection)
      setHistory((prev) => [res.data.reflection, ...prev])
      setFormData({ emotion: '', trigger: '', intensity: 5, context: '' })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create reflection')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#eef2ff]">
      <Navigation />
      <div className="flex-1 ml-56 max-w-3xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Emotion Reflection</h1>
          <p className="text-gray-500 mt-1">Chia sẻ cảm xúc — AI sẽ phản chiếu và giúp bạn hiểu rõ hơn về bản thân</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* AI Response */}
        {result && (
          <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="text-purple-500" size={24} />
              <h2 className="text-lg font-bold text-purple-900">Isla's Reflection</h2>
            </div>
            <p className="text-gray-800 leading-relaxed text-lg">"{result.reflection}"</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="bg-white px-3 py-1 rounded-full border border-purple-200 text-purple-700">
                💭 {result.emotion}
              </span>
              {result.trigger && (
                <span className="bg-white px-3 py-1 rounded-full border border-purple-200 text-purple-700">
                  ⚡ {result.trigger}
                </span>
              )}
              {result.intensity && (
                <span className="bg-white px-3 py-1 rounded-full border border-purple-200 text-purple-700">
                  🌡️ Intensity: {result.intensity}/10
                </span>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Bạn đang cảm thấy thế nào?</h2>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Emotion presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Chọn nhanh</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {EMOTION_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, emotion: preset.value }))}
                    className={`px-3 py-2 rounded-full text-sm border-2 transition ${
                      formData.emotion === preset.value
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 text-gray-600 hover:border-primary'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formData.emotion}
                onChange={(e) => setFormData((p) => ({ ...p, emotion: e.target.value }))}
                placeholder="Hoặc nhập cảm xúc của bạn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
            </div>

            {/* Trigger */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Điều gì gây ra cảm xúc này? <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.trigger}
                onChange={(e) => setFormData((p) => ({ ...p, trigger: e.target.value }))}
                placeholder="Ví dụ: công việc, mối quan hệ, sức khỏe..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Mức độ cảm xúc: <span className="font-bold text-primary">{formData.intensity}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.intensity}
                onChange={(e) => setFormData((p) => ({ ...p, intensity: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Rất nhẹ</span>
                <span>Rất mạnh</span>
              </div>
            </div>

            {/* Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bối cảnh thêm <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={formData.context}
                onChange={(e) => setFormData((p) => ({ ...p, context: e.target.value }))}
                placeholder="Chia sẻ thêm về tình huống hoặc suy nghĩ của bạn..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !formData.emotion.trim()}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Get AI Reflection</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Reflection History</h2>
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader className="animate-spin text-primary" size={32} />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500">Chưa có reflection nào. Hãy chia sẻ cảm xúc đầu tiên!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                        💭 {item.emotion}
                      </span>
                      {item.trigger && (
                        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                          ⚡ {item.trigger}
                        </span>
                      )}
                      {item.intensity && (
                        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                          🌡️ {item.intensity}/10
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {format(new Date(item.createdAt), 'MMM d, HH:mm')}
                    </p>
                  </div>
                  <p className="text-gray-700 text-sm italic">"{item.reflection}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
