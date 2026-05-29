import React, { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation'
import { dashboardAPI } from '../services/api'
import { AlertCircle, Loader, TrendingUp, Wind, BookOpen, ChevronRight, BarChart2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const weeklyBarData = [40, 55, 45, 70, 60, 80, 75]
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardAPI.getDashboard()
        setDashboardData(response.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const userName = user?.email?.split('@')[0] || 'there'

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#eef2ff]">
        <Navigation />
        <div className="flex-1 flex items-center justify-center ml-56">
          <Loader className="animate-spin text-primary" size={36} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#eef2ff]">
      <Navigation />

      {/* Main content area */}
      <div className="flex-1 ml-56 flex overflow-hidden">
        {/* Center panel */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}</h1>
            <p className="text-gray-400 text-sm mt-1">Your personal assistant for emotional wellbeing is ready.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Weekly Insight Card */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Weekly Insight</h2>
              <button className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-primary hover:bg-indigo-100">
                <BarChart2 size={14} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              {dashboardData?.insight?.message || 'Your stress level decreased compared to last week.'}
            </p>

            {/* Bar chart */}
            <div className="flex items-end gap-2 h-24">
              {weeklyBarData.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      i === 6 ? 'bg-primary' : i === 5 ? 'bg-indigo-400' : 'bg-indigo-100'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-xs text-gray-400">{weekDays[i]}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-200 inline-block" />
              AI recommendation based on your profile data this week
            </p>
          </div>

          {/* Recommended for you */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Recommended for you</h2>
            <div className="space-y-3">
              <RecommendCard
                icon="💨"
                iconBg="bg-cyan-50"
                title="5 min breathing break"
                subtitle="Mindfulness · Calm"
                href="/cbt"
              />
              <RecommendCard
                icon="✍️"
                iconBg="bg-purple-50"
                title="Short reflection"
                subtitle="Journaling · Personal"
                href="/journal"
              />
            </div>
          </div>
        </div>

        {/* Right panel — Monthly Reflection */}
        <div className="w-72 p-8 pl-0 flex flex-col gap-6">
          {/* Monthly Reflection */}
          <div className="bg-white rounded-2xl shadow-card p-6 flex-1">
            <h2 className="font-bold text-gray-900 mb-4">Monthly Reflection</h2>
            <div className="flex items-start gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">💭</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Over the past month, how do you feel your stress level has changed?
              </p>
            </div>

            <div className="space-y-2">
              <Link to="/reflection">
                <button className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition">
                  Improved
                </button>
              </Link>
              <Link to="/reflection">
                <button className="w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition">
                  No Change
                </button>
              </Link>
              <Link to="/reflection">
                <button className="w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition">
                  Worse
                </button>
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Streak</span>
              <span className="text-xs text-orange-500 font-bold">
                🔥 {dashboardData?.progress?.streakDays || 0} days
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Tasks Today</span>
              <span className="text-xs text-green-600 font-bold">
                ✅ {dashboardData?.progress?.todayCompleted || 0}/{dashboardData?.progress?.todayTotal || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecommendCard({ icon, iconBg, title, subtitle, href }) {
  return (
    <Link to={href}>
      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group cursor-pointer">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-xl flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <button className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition">
          Start
        </button>
      </div>
    </Link>
  )
}
