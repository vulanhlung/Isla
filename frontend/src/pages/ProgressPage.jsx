import React, { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation'
import { progressAPI } from '../services/api'
import { AlertCircle, Loader, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

const STREAK_DAYS = 7

export const ProgressPage = () => {
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await progressAPI.getProgress()
      setProgressData(response.data)
    } catch {
      setError('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  const streakDays = progressData?.stats?.streakDays || 0
  const totalTasks = progressData?.stats?.totalTasksDone || 0
  const completionRate = Math.min(100, Math.round((totalTasks / Math.max(1, streakDays * 3)) * 100))

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#eef2ff]">
        <Navigation />
        <div className="flex-1 ml-56 flex items-center justify-center">
          <Loader className="animate-spin text-primary" size={36} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#eef2ff]">
      <Navigation />
      <div className="flex-1 ml-56 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
            <p className="text-gray-400 text-sm mt-1">Small steps lead to real change.</p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-card">
            <span className="text-lg">🦒</span>
            <div>
              <p className="text-xs font-semibold text-gray-700">You're doing great!</p>
              <p className="text-xs text-gray-400">Keep up the consistency.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Left column */}
          <div className="col-span-2 space-y-6">
            {/* 7-Day Streak */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900">7 Day Streak</h2>
                <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                  🔥 Completed
                </span>
              </div>
              <div className="flex items-center gap-3">
                {Array.from({ length: STREAK_DAYS }, (_, i) => {
                  const done = i < streakDays
                  const isToday = i === Math.min(streakDays, STREAK_DAYS - 1)
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                          done
                            ? 'bg-primary border-primary text-white'
                            : isToday
                            ? 'border-primary border-dashed text-primary'
                            : 'border-gray-200 text-gray-300'
                        }`}
                      >
                        {done ? '✓' : i + 1}
                      </div>
                      <span className="text-xs text-gray-400">{i + 1}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tasks + Health Trend row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Tasks Completed */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-bold text-gray-900 mb-1">{totalTasks} Tasks Completed</h2>
                <p className="text-xs text-gray-400 mb-4">Every Day</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mb-4">{completionRate}%</p>
                <p className="text-xs text-gray-400 mb-3">A streak completed at time</p>
                <div className="flex gap-2">
                  {['🧘', '💬', '📝'].map((e, i) => (
                    <span key={i} className="text-xl">{e}</span>
                  ))}
                </div>
                <div className="flex gap-2 mt-1">
                  {['Breathing', 'Journaling', 'Meditation'].map((l) => (
                    <span key={l} className="text-xs text-gray-400">{l}</span>
                  ))}
                </div>
              </div>

              {/* Health Trend */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-bold text-gray-900">Health Trend</h2>
                  <span className="text-xs text-green-500 font-semibold">↑ Better Level ↑</span>
                </div>
                <p className="text-xs text-gray-400 mb-4">Your stress level improved compared to last week.</p>
                <div className="flex items-end gap-1 h-20">
                  {[80, 65, 55, 45, 40, 35, 30].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-lg"
                      style={{
                        height: `${h}%`,
                        background: `rgba(99,102,241,${0.2 + i * 0.1})`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Mon</span>
                  <span className="text-xs text-gray-400">Sun</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Achievements</h2>
              <div className="space-y-4">
                <AchievementItem
                  icon="🏆"
                  iconBg="bg-yellow-50"
                  title="7-Day Streak"
                  subtitle="Maintained consistency"
                />
                <AchievementItem
                  icon="🎯"
                  iconBg="bg-blue-50"
                  title="First Milestone"
                  subtitle="Completed first journey"
                />
                <AchievementItem
                  icon="💜"
                  iconBg="bg-purple-50"
                  title="3 Calm Sessions"
                  subtitle="After crisis moment"
                />
              </div>
              <button className="w-full mt-4 text-xs text-primary font-semibold hover:underline">
                View All Badges
              </button>
            </div>

            {/* Ready for more CTA */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
                <MessageCircle size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Ready for more?</h3>
              <p className="text-indigo-200 text-xs mb-4 leading-relaxed">
                Small steps in journey helps you to build better habits of your wellness journey.
              </p>
              <Link to="/chat">
                <button className="w-full py-2.5 bg-white text-primary font-semibold rounded-xl text-sm hover:bg-indigo-50 transition">
                  Continue Today's Check-in →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AchievementItem({ icon, iconBg, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  )
}
