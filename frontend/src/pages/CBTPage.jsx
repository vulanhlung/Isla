import React, { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation'
import { cbtAPI } from '../services/api'
import { AlertCircle, Loader, CheckCircle, ArrowRight } from 'lucide-react'

export const CBTPage = () => {
  const [session, setSession] = useState(null)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    startCBTSession()
  }, [])

  const startCBTSession = async () => {
    try {
      const res = await cbtAPI.startSession()
      setSession(res.data.session)
    } catch (err) {
      setError('Failed to start CBT session')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = async (e) => {
    e.preventDefault()

    if (!response.trim()) return

    setSubmitting(true)
    setError('')

    try {
      const res = await cbtAPI.continueSession({
        response: response.trim(),
        sessionId: session.id,
      })

      setSession(res.data.session)
      setResponse('')

      if (res.data.session.status === 'completed') {
        setCompleted(true)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to continue session')
    } finally {
      setSubmitting(false)
    }
  }

  const getStepTitle = (step) => {
    switch (step) {
      case 1:
        return 'Identify the Stressor'
      case 2:
        return 'Check the Evidence'
      case 3:
        return 'Find Alternative Perspective'
      case 4:
        return 'Create an Action Plan'
      default:
        return 'CBT Session'
    }
  }

  const getStepDescription = (step) => {
    switch (step) {
      case 1:
        return 'Tell me what is currently stressing you or causing you worry. What situation triggered these feelings?'
      case 2:
        return 'What evidence do you have that supports your stress? What evidence suggests it might not be as bad as you think?'
      case 3:
        return "Let's look at this from a different angle. What's another way to view this situation? What advice would you give a friend?"
      case 4:
        return 'Based on what we discussed, what concrete steps can you take to address this situation? What actions feel manageable?'
      default:
        return 'Tell me more about what you are experiencing.'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#eef2ff]">
        <Navigation />
        <div className="flex-1 ml-56 flex items-center justify-center">
          <Loader className="animate-spin text-primary" size={40} />
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="flex min-h-screen bg-[#eef2ff]">
        <Navigation />
        <div className="flex-1 ml-56 flex items-center justify-center px-8">
          <div className="bg-white rounded-2xl shadow-card p-12 text-center max-w-lg w-full">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Session Complete!</h1>
            <p className="text-gray-500 mb-8">
              Great work working through these challenges. Feel free to start a new session whenever you need support.
            </p>
            <button
              onClick={startCBTSession}
              className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Start New Session
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#eef2ff]">
      <Navigation />
      <div className="flex-1 ml-56 max-w-3xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cognitive Behavioral Therapy</h1>
          <p className="text-gray-500 mt-1">Work through challenging thoughts with guided exercises</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Session Progress */}
        {session && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-700">Step {session.step} of 4</h2>
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      step < session.step
                        ? 'bg-success text-white'
                        : step === session.step
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(session.step / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Session Content */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {getStepTitle(session?.step)}
          </h2>
          <p className="text-gray-700 text-lg mb-6">{getStepDescription(session?.step)}</p>

          {/* Display Previous Responses */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
            {session?.stressor && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Stressor identified:</p>
                <p className="text-gray-900">{session.stressor}</p>
              </div>
            )}
            {session?.evidence && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Evidence checked:</p>
                <p className="text-gray-900">{session.evidence}</p>
              </div>
            )}
            {session?.alternative && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Alternative perspective:</p>
                <p className="text-gray-900">{session.alternative}</p>
              </div>
            )}
          </div>

          {/* Response Form */}
          <form onSubmit={handleContinue} className="space-y-4">
            <div>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Share your thoughts here..."
                disabled={submitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none disabled:opacity-50"
                rows="6"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting || !response.trim()}
                className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{submitting ? 'Processing...' : 'Continue'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">💡 CBT Tips</h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li>• Be honest and detailed in your responses</li>
            <li>• Take your time - there's no rush</li>
            <li>• Remember, thoughts are not facts</li>
            <li>• Look for evidence rather than assumptions</li>
            <li>• Think of practical, achievable actions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
