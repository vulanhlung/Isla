import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigation } from '../components/Navigation'
import { assessmentAPI, journeyAPI } from '../services/api'
import { AlertCircle, Loader, CheckCircle, MapPin } from 'lucide-react'
import { format } from 'date-fns'

const PHQ9_QUESTIONS = [
  'Have you lost interest in or no longer find joy in things you used to enjoy?',
  'Do you feel sad, depressed, or hopeless?',
  'Do you often feel tired or lacking energy?',
  'Do you have trouble falling asleep, experience restless sleep, or sleep too much?',
  'Are you eating less or more than usual?',
  'Do you feel useless, like a failure, or like you\'re letting others down?',
  'Do you have trouble concentrating when working, studying, or reading?',
  'Do you find yourself moving more slowly than usual, or conversely, feeling overly restless and unable to sit still?',
  'Have you ever thought that you would be better off disappearing or harming yourself?',
  'What is your current stress level in your life?',
]

const SCORE_OPTIONS = [
  { value: 0, label: 'Not at all', color: 'bg-green-100 border-green-200 hover:border-green-400', activeColor: 'bg-green-400 border-green-400' },
  { value: 1, label: 'A few days', color: 'bg-gray-100 border-gray-200 hover:border-gray-400', activeColor: 'bg-gray-400 border-gray-400' },
  { value: 2, label: 'More than half the days', color: 'bg-orange-100 border-orange-200 hover:border-orange-400', activeColor: 'bg-orange-400 border-orange-400' },
  { value: 3, label: 'Almost every day', color: 'bg-red-100 border-red-200 hover:border-red-400', activeColor: 'bg-red-400 border-red-400' },
]

const LEVEL_CONFIG = {
  Normal: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', emoji: '😊' },
  Mild: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', emoji: '😐' },
  Moderate: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', emoji: '😟' },
  Severe: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', emoji: '😰' },
}

export const AssessmentPage = () => {
  const { markAssessmentComplete } = useAuth()
  const [phase, setPhase] = useState('intro') // intro | test | result
  const [answers, setAnswers] = useState(Array(10).fill(null))
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [journey, setJourney] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await assessmentAPI.getAssessmentHistory({ limit: 10 })
      setHistory(response.data)
    } catch {
      // optional
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleAnswer = (questionIndex, value) => {
    const updated = [...answers]
    updated[questionIndex] = value
    setAnswers(updated)
  }

  const allAnswered = answers.every((a) => a !== null)
  const answeredCount = answers.filter((a) => a !== null).length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!allAnswered) return
    setSubmitting(true)
    setError('')
    try {
      // Use only first 9 answers for PHQ-9
      const response = await assessmentAPI.createAssessment({ answers: answers.slice(0, 9) })
      setResult(response.data)
      setPhase('result')
      markAssessmentComplete()
      setHistory((prev) => [
        { id: response.data.id, score: response.data.totalScore, level: response.data.level, createdAt: response.data.createdAt },
        ...prev,
      ])
      try {
        const journeyRes = await journeyAPI.generateJourney()
        setJourney(journeyRes.data)
      } catch { /* non-critical */ }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit assessment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartNew = () => {
    setAnswers(Array(10).fill(null))
    setResult(null)
    setError('')
    setPhase('test')
  }

  return (
    <div className="flex min-h-screen bg-[#eef2ff]">
      <Navigation />
      <div className="flex-1 ml-56 overflow-y-auto">

        {/* INTRO PHASE */}
        {phase === 'intro' && (
          <div
            className="min-h-screen flex flex-col items-center justify-center px-8 py-12"
            style={{ background: 'linear-gradient(135deg, #cffafe 0%, #bfdbfe 50%, #c7d2fe 100%)' }}
          >
            <h1 className="text-4xl font-bold text-[#4a5e3a] mb-4 text-center">Test guidelines</h1>
            <p className="text-gray-700 text-center max-w-md mb-8 leading-relaxed">
              Answer each statement based on your personal opinion<br />
              you can not skip question but you can return to them later
            </p>
            <div className="w-20 h-20 rounded-full border-2 border-gray-400 flex items-center justify-center mb-8">
              <CheckCircle size={40} className="text-gray-500" strokeWidth={1.5} />
            </div>
            <button
              onClick={() => setPhase('test')}
              className="px-16 py-3 bg-[#a8d8ea]/80 text-gray-700 font-semibold rounded-2xl hover:bg-[#7ec8e3] transition text-sm shadow"
            >
              Start test
            </button>

            {/* History below */}
            {history.length > 0 && (
              <div className="mt-12 w-full max-w-lg">
                <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">Previous Results</h2>
                <div className="space-y-2">
                  {history.slice(0, 3).map((item) => {
                    const cfg = LEVEL_CONFIG[item.level] || LEVEL_CONFIG.Normal
                    return (
                      <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border bg-white/70 ${cfg.border}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cfg.emoji}</span>
                          <div>
                            <p className={`font-bold text-sm ${cfg.color}`}>{item.level}</p>
                            <p className="text-xs text-gray-400">{format(new Date(item.createdAt), 'PPP')}</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-gray-700">{item.score}<span className="text-xs text-gray-400">/27</span></p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TEST PHASE */}
        {phase === 'test' && (
          <div className="max-w-2xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-8">
              <p className="text-primary font-semibold text-sm mb-1">Over the past two weeks,</p>
              <h1 className="text-xl font-bold text-gray-900 leading-snug">
                how frequently have you experienced the following problems?<br />
                <span className="text-gray-500 font-normal text-base">(There are {PHQ9_QUESTIONS.length} question)</span>
              </h1>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
                <p className="text-red-700 text-xs">{error}</p>
              </div>
            )}

            {/* Score legend */}
            <div className="grid grid-cols-4 gap-2 mb-8">
              {SCORE_OPTIONS.map((opt) => (
                <div key={opt.value} className="text-center">
                  <div className={`w-8 h-8 rounded-full border-2 mx-auto mb-1 ${opt.activeColor}`} />
                  <p className="text-xs text-gray-500 leading-tight">{opt.label}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {PHQ9_QUESTIONS.map((question, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-sm text-gray-700 text-center mb-4 leading-relaxed">{question}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {SCORE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleAnswer(idx, opt.value)}
                        className={`w-10 h-10 rounded-full border-2 mx-auto transition-all ${
                          answers[idx] === opt.value
                            ? opt.activeColor + ' scale-110'
                            : opt.color
                        }`}
                        aria-label={opt.label}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Progress */}
              <div className="text-center text-sm text-gray-400 py-2">
                {answeredCount}/{PHQ9_QUESTIONS.length} answered
              </div>

              <button
                type="submit"
                disabled={!allAnswered || submitting}
                className="w-full py-3 bg-[#a8d8ea]/80 text-gray-700 font-semibold rounded-2xl hover:bg-[#7ec8e3] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow flex items-center justify-center gap-2"
              >
                {submitting ? <Loader className="animate-spin" size={18} /> : 'Finish'}
              </button>
            </form>
          </div>
        )}

        {/* RESULT PHASE */}
        {phase === 'result' && result && (() => {
          const cfg = LEVEL_CONFIG[result.level] || LEVEL_CONFIG.Normal
          return (
            <div className="max-w-2xl mx-auto px-6 py-10">
              <div className={`rounded-3xl border-2 p-8 mb-6 ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{cfg.emoji}</span>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Your Result</p>
                    <p className={`text-3xl font-bold ${cfg.color}`}>{result.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mb-4">
                  <div>
                    <p className="text-4xl font-bold text-gray-900">{result.totalScore}</p>
                    <p className="text-xs text-gray-500">Total Score / 27</p>
                  </div>
                </div>
                <button
                  onClick={handleStartNew}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 transition text-sm"
                >
                  Take Another Assessment
                </button>
              </div>

              {journey && (
                <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="text-secondary" size={20} />
                    <h2 className="font-bold text-gray-900">Your Wellness Journey</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{journey.guidelines}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(Array.isArray(journey.recommendedTasks)
                      ? journey.recommendedTasks
                      : JSON.parse(journey.recommendedTasks || '[]')
                    ).map((task, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl">
                        <span className="text-lg">
                          {task.type === 'BREATHING' ? '🌬️' : task.type === 'CBT' ? '🧠' : '📝'}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{task.title}</p>
                          <p className="text-xs text-gray-400">{task.duration} min</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setPhase('intro')}
                className="w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Back to Overview
              </button>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
