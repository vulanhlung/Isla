import React, { useState } from 'react'
import { Navigation } from '../components/Navigation'
import { insightAPI, recommendationAPI, patternAPI } from '../services/api'
import { AlertCircle, Loader, Lightbulb, Target, Search, RefreshCw } from 'lucide-react'

const PERIOD_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
]

const INSIGHT_TYPE_CONFIG = {
  WARNING: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', emoji: '⚠️' },
  PATTERN: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', emoji: '🔍' },
  IMPROVEMENT: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', emoji: '📈' },
}

const PATTERN_CONFIG = {
  REPEATED_STRESS: { emoji: '😰', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  DECLINING_MOOD: { emoji: '📉', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  NIGHT_SADNESS: { emoji: '🌙', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  WEEKDAY_STRESS: { emoji: '📅', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  NO_PATTERN: { emoji: '✅', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
}

const REC_ACTION_CONFIG = {
  'Breathing exercise': { emoji: '🌬️', color: 'from-blue-400 to-cyan-400' },
  'CBT practice': { emoji: '🧠', color: 'from-purple-400 to-pink-400' },
  'Gratitude journal': { emoji: '📝', color: 'from-yellow-400 to-orange-400' },
  'Self-care': { emoji: '💚', color: 'from-green-400 to-teal-400' },
}

export const InsightsPage = () => {
  const [period, setPeriod] = useState(14)
  const [insight, setInsight] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [patterns, setPatterns] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analyzed, setAnalyzed] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    setInsight(null)
    setRecommendation(null)
    setPatterns(null)

    try {
      const [insightRes, recRes, patternRes] = await Promise.allSettled([
        insightAPI.generateInsight({ period }),
        recommendationAPI.generateRecommendation({ period }),
        patternAPI.detectPatterns({ period }),
      ])

      if (insightRes.status === 'fulfilled') setInsight(insightRes.value.data)
      if (recRes.status === 'fulfilled') setRecommendation(recRes.value.data)
      if (patternRes.status === 'fulfilled') setPatterns(patternRes.value.data)

      // If all failed, show error
      if (insightRes.status === 'rejected' && recRes.status === 'rejected' && patternRes.status === 'rejected') {
        setError(insightRes.reason?.response?.data?.error || 'Chưa có đủ dữ liệu mood để phân tích. Hãy ghi nhận mood trước!')
      }

      setAnalyzed(true)
    } catch (err) {
      setError('Failed to analyze data')
    } finally {
      setLoading(false)
    }
  }

  const insightCfg = insight ? (INSIGHT_TYPE_CONFIG[insight.type] || INSIGHT_TYPE_CONFIG.PATTERN) : null
  const recActionCfg = recommendation ? (REC_ACTION_CONFIG[recommendation.recommendation?.action] || REC_ACTION_CONFIG['Self-care']) : null

  return (
    <div className="flex min-h-screen bg-[#eef2ff]">
      <Navigation />
      <div className="flex-1 ml-56 max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600 mt-2">Phân tích mood, pattern và gợi ý cá nhân hóa từ dữ liệu của bạn</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phân tích trong</label>
              <div className="flex space-x-2">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPeriod(opt.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition ${
                      period === opt.value
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 text-gray-600 hover:border-primary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="sm:ml-auto flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <RefreshCw size={18} />
              )}
              <span>{analyzed ? 'Re-analyze' : 'Analyze Now'}</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader className="animate-spin text-primary mb-4" size={48} />
            <p className="text-gray-600">Đang phân tích dữ liệu của bạn...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !analyzed && (
          <div className="text-center py-16">
            <Lightbulb className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">Nhấn "Analyze Now" để xem insight từ dữ liệu mood của bạn</p>
          </div>
        )}

        {/* Results */}
        {!loading && analyzed && (
          <div className="space-y-6">

            {/* UC-09: Insight */}
            {insight && insightCfg && (
              <div className={`rounded-xl border-2 p-6 ${insightCfg.bg} ${insightCfg.border}`}>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl">{insightCfg.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">AI Insight · UC-09</p>
                    <h2 className={`text-xl font-bold ${insightCfg.color}`}>Mood Analysis</h2>
                  </div>
                </div>
                <p className="text-gray-800 text-lg leading-relaxed mb-4">"{insight.message}"</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-800">{insight.totalEntries}</p>
                    <p className="text-gray-500 text-xs">Mood entries</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-800">{insight.averageIntensity}</p>
                    <p className="text-gray-500 text-xs">Avg intensity</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-800">{insight.stressRate}%</p>
                    <p className="text-gray-500 text-xs">Stress rate</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className={`text-lg font-bold ${insight.trend === 'improving' ? 'text-green-600' : insight.trend === 'declining' ? 'text-red-600' : 'text-gray-600'}`}>
                      {insight.trend === 'improving' ? '📈' : insight.trend === 'declining' ? '📉' : '➡️'} {insight.trend}
                    </p>
                    <p className="text-gray-500 text-xs">Trend</p>
                  </div>
                </div>
                {/* Mood breakdown */}
                {insight.moodCounts && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(insight.moodCounts).map(([mood, count]) => count > 0 && (
                      <span key={mood} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200">
                        {mood === 'HAPPY' ? '😊' : mood === 'NEUTRAL' ? '😐' : mood === 'SAD' ? '😢' : '😰'} {mood}: {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* UC-10: Recommendation */}
            {recommendation && recActionCfg && (
              <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="text-primary" size={24} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Recommendation · UC-10</p>
                    <h2 className="text-xl font-bold text-gray-900">Gợi ý cho bạn</h2>
                  </div>
                </div>
                <div className={`bg-gradient-to-r ${recActionCfg.color} rounded-xl p-5 text-white mb-4`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-3xl">{recActionCfg.emoji}</span>
                    <div>
                      <p className="font-bold text-lg">{recommendation.recommendation?.title}</p>
                      <p className="text-sm opacity-90">{recommendation.recommendation?.action}</p>
                    </div>
                  </div>
                  <p className="text-sm opacity-90 mt-2">{recommendation.recommendation?.details}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">💬 Personalized message:</p>
                  <p className="text-gray-800 italic">"{recommendation.aiText}"</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-bold text-gray-800">{recommendation.stressRate}%</p>
                    <p className="text-gray-500 text-xs">Stress rate</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-bold text-gray-800">{recommendation.timePattern}</p>
                    <p className="text-gray-500 text-xs">Peak time</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className={`font-bold ${recommendation.trend === 'improving' ? 'text-green-600' : recommendation.trend === 'declining' ? 'text-red-600' : 'text-gray-600'}`}>
                      {recommendation.trend}
                    </p>
                    <p className="text-gray-500 text-xs">Trend</p>
                  </div>
                </div>
              </div>
            )}

            {/* UC-11: Pattern Detection */}
            {patterns && (
              <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <Search className="text-primary" size={24} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pattern Detection · UC-11</p>
                    <h2 className="text-xl font-bold text-gray-900">Patterns phát hiện được</h2>
                  </div>
                </div>

                {patterns.aiInsight && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-purple-700 mb-1">🤖 AI Analysis:</p>
                    <p className="text-purple-800 text-sm">{patterns.aiInsight}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {patterns.patterns?.map((p, i) => {
                    const cfg = PATTERN_CONFIG[p.pattern] || PATTERN_CONFIG.NO_PATTERN
                    return (
                      <div key={i} className={`p-4 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{cfg.emoji}</span>
                          <div>
                            <p className={`font-semibold ${cfg.color}`}>{p.pattern.replace(/_/g, ' ')}</p>
                            <p className="text-gray-700 text-sm mt-1">{p.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-bold text-gray-800">{patterns.totalEntries}</p>
                    <p className="text-gray-500 text-xs">Total entries</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-bold text-red-600">{patterns.stressCount}</p>
                    <p className="text-gray-500 text-xs">Stress entries</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-bold text-blue-600">{patterns.nightSadCount}</p>
                    <p className="text-gray-500 text-xs">Night sadness</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-bold text-purple-600">{patterns.monTueStressCount}</p>
                    <p className="text-gray-500 text-xs">Mon/Tue stress</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
