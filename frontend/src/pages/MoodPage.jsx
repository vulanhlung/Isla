import React, { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation'
import { moodAPI } from '../services/api'
import { AlertCircle, Loader, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, subDays, addDays } from 'date-fns'

const MOOD_OPTIONS = [
  { value: 'HAPPY', emoji: '😊', label: 'Happy', color: 'text-yellow-500', bg: 'bg-yellow-50', activeBg: 'bg-yellow-100 border-yellow-400' },
  { value: 'EXCITED', emoji: '😄', label: 'Excited', color: 'text-orange-500', bg: 'bg-orange-50', activeBg: 'bg-orange-100 border-orange-400' },
  { value: 'NEUTRAL', emoji: '😐', label: 'Neutral', color: 'text-gray-500', bg: 'bg-gray-50', activeBg: 'bg-gray-100 border-gray-400' },
  { value: 'SAD', emoji: '😢', label: 'Sad', color: 'text-blue-500', bg: 'bg-blue-50', activeBg: 'bg-blue-100 border-blue-400' },
  { value: 'OVERWHELMED', emoji: '😰', label: 'Overwhelmed', color: 'text-red-500', bg: 'bg-red-50', activeBg: 'bg-red-100 border-red-400' },
]

const MOOD_EMOJI_MAP = {
  HAPPY: '😊', EXCITED: '😄', NEUTRAL: '😐', SAD: '😢', OVERWHELMED: '😰',
  happy: '😊', excited: '😄', neutral: '😐', sad: '😢', overwhelmed: '😰',
}

// Generate week days centered on today
function getWeekDays(centerDate = new Date()) {
  return Array.from({ length: 5 }, (_, i) => {
    const d = subDays(centerDate, 2 - i)
    return { date: d, label: format(d, 'EEE'), day: format(d, 'd'), isToday: i === 2 }
  })
}

// Monthly bar chart mock data
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_HEIGHTS = [30, 45, 35, 50, 40, 55, 70, 80, 60, 45, 35, 40]

export const MoodPage = () => {
  const [moods, setMoods] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedMood, setSelectedMood] = useState('NEUTRAL')
  const [weekDays] = useState(getWeekDays())
  const [selectedDay, setSelectedDay] = useState(2) // today

  useEffect(() => {
    fetchMoodHistory()
  }, [])

  const fetchMoodHistory = async () => {
    setLoading(true)
    try {
      const response = await moodAPI.getMoodHistory({ limit: 30 })
      setMoods(response.data)
    } catch {
      setError('Failed to load mood history')
    } finally {
      setLoading(false)
    }
  }

  const handleMoodSelect = async (moodValue) => {
    setSelectedMood(moodValue)
    try {
      const response = await moodAPI.createMood({ mood: moodValue, intensity: 3, note: '' })
      setMoods((prev) => [response.data, ...prev])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save mood')
    }
  }

  const currentMoodOption = MOOD_OPTIONS.find((m) => m.value === selectedMood) || MOOD_OPTIONS[2]

  return (
    <div className="flex min-h-screen bg-[#eef2ff]">
      <Navigation />
      <div className="flex-1 ml-56 overflow-y-auto px-8 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-primary font-semibold text-sm mb-1">Mood Tracking</p>
          <h1 className="text-3xl font-bold text-gray-900">How Are You Today?</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 max-w-2xl mx-auto">
            <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
            <p className="text-red-700 text-xs">{error}</p>
          </div>
        )}

        {/* Week selector */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center gap-2">
            {weekDays.map((day, i) => {
              const dayMood = moods.find((m) => format(new Date(m.createdAt), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd'))
              const isSelected = selectedDay === i
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  className={`flex-1 flex flex-col items-center py-3 px-2 rounded-2xl border-2 transition ${
                    isSelected
                      ? 'bg-primary border-primary text-white shadow-md'
                      : 'bg-white border-transparent hover:border-indigo-200'
                  }`}
                >
                  <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {day.label}
                  </span>
                  <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                    {day.day}
                  </span>
                  {dayMood ? (
                    <span className="text-lg mt-1">{MOOD_EMOJI_MAP[dayMood.mood] || '😐'}</span>
                  ) : (
                    <span className="text-xs mt-1 text-gray-300">{isSelected ? currentMoodOption.label : '—'}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Mood selector row */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-card p-4">
            <div className="flex items-center justify-center gap-4 mb-3">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleMoodSelect(opt.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
                    selectedMood === opt.value ? 'scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-sm font-medium text-gray-600">{currentMoodOption.label}</p>
          </div>
        </div>

        {/* Monthly Tracking Chart */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900">Monthly Tracking</h2>
              <button className="px-3 py-1 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                Month
              </button>
            </div>

            {/* Emoji legend */}
            <div className="flex flex-col gap-1 mb-4">
              {MOOD_OPTIONS.slice(0, 4).map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <span className="text-sm">{opt.emoji}</span>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-1 h-32 mt-2">
              {MONTHS.map((month, i) => {
                const isCurrentMonth = i === new Date().getMonth()
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isCurrentMonth ? 'bg-primary' : 'bg-yellow-200'
                      }`}
                      style={{ height: `${MONTH_HEIGHTS[i]}%` }}
                    />
                    <span className="text-xs text-gray-400" style={{ fontSize: '9px' }}>{month}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Daily Mental Health Journey */}
        <div className="max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Daily Mental Health Journey</h2>

          {/* Week tabs */}
          <div className="flex gap-2 mb-6">
            {['Week 1 → overwhelmed', 'Week 2 → exhausted', 'Week 3 → more balanced'].map((w, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                  i === 1
                    ? 'bg-primary text-white shadow'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          {/* Sleep quality chart */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Sleep quality</h3>
              <span className="text-xs text-gray-400">Week 2 ↗</span>
            </div>
            <div className="flex items-end gap-2 h-24">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const heights = [60, 40, 70, 50, 80, 45, 65]
                const colors = ['bg-blue-400', 'bg-red-400', 'bg-blue-400', 'bg-orange-400', 'bg-blue-400', 'bg-red-400', 'bg-blue-400']
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-3 rounded-t-sm ${colors[i]}`} style={{ height: `${heights[i]}%` }} />
                    <span className="text-xs text-gray-400" style={{ fontSize: '9px' }}>{day}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 mt-3">
              {[['bg-red-400', 'Bad'], ['bg-orange-400', 'Medium'], ['bg-blue-400', 'Good']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${c}`} />
                  <span className="text-xs text-gray-500">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom cards row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Daily Insight Widget */}
            <div className="bg-white rounded-2xl shadow-card p-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">This Week</p>
              <p className="text-sm font-bold text-gray-900 mb-1">Your mood improved by 12%</p>
              <div className="h-12 flex items-end gap-0.5">
                {[20, 35, 30, 50, 45, 60, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-indigo-200 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">You've been more positive and consistent this week. Keep going! 🌱</p>
              <p className="text-xs text-primary font-medium mt-2">A. Daily Insight Widget</p>
            </div>

            {/* AI Recommendation Card */}
            <div className="bg-indigo-900 rounded-2xl shadow-card p-4 text-white">
              <p className="text-xs text-indigo-300 mb-1">Recommended for you</p>
              <p className="text-sm font-bold mb-3">Suggested for tonight</p>
              <p className="text-xs text-indigo-200 mb-3">Based on your recent mood and activity</p>
              <div className="bg-indigo-800 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold">🌬️ 2-minutes calming exercise</p>
                <p className="text-xs text-indigo-300">Tracking · Neutral · Sad</p>
              </div>
              <button className="w-full py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-indigo-600 transition">
                Start Exercise ▶
              </button>
              <p className="text-xs text-primary font-medium mt-2">B. AI Recommendation Card</p>
            </div>

            {/* Emotional Trend */}
            <div className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex gap-1 mb-2">
                {['Week', 'Month', '3 Months'].map((t, i) => (
                  <button key={t} className={`px-2 py-0.5 rounded text-xs ${i === 0 ? 'bg-primary text-white' : 'text-gray-400'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Your Emotional Trend</p>
              <div className="h-16 flex items-end gap-0.5 mb-2">
                {[40, 55, 45, 65, 60, 70, 65].map((h, i) => (
                  <div key={i} className="flex-1 bg-green-200 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-xs text-green-600 font-medium">Stress reduction +15%</p>
              <p className="text-xs text-gray-400 mt-1">Great job! Your sleep routine is improving constantly.</p>
              <p className="text-xs text-primary font-medium mt-2">C. Emotional Trend</p>
            </div>
          </div>
        </div>

        {/* Breathing Exercise CTA */}
        <div className="max-w-2xl mx-auto text-center pb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Try a Breathing Exercise</h2>
          <p className="text-gray-500 text-sm mb-6">Explore simple, science-backed tools to calm your mind and uplift your mood.</p>
          <button className="px-8 py-3 bg-primary/10 text-primary font-semibold rounded-full border border-primary/20 hover:bg-primary hover:text-white transition text-sm">
            Want to build a routine?
          </button>
        </div>
      </div>
    </div>
  )
}
