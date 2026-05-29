import React, { useState, useEffect } from 'react'
import { Navigation } from '../components/Navigation'
import { journalAPI } from '../services/api'
import { BookOpen, AlertCircle, Loader, Plus } from 'lucide-react'
import { format } from 'date-fns'

export const JournalPage = () => {
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchJournals()
  }, [])

  const fetchJournals = async () => {
    setLoading(true)
    try {
      const response = await journalAPI.getJournals({ limit: 50 })
      setJournals(response.data)
    } catch (err) {
      setError('Failed to load journal entries')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) return

    setSubmitting(true)
    setError('')

    try {
      const response = await journalAPI.createJournal({ content: content.trim() })
      setJournals([response.data, ...journals])
      setContent('')
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save journal entry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#eef2ff]">
      <Navigation />
      <div className="flex-1 ml-56 max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Journal</h1>
          <p className="text-gray-500 mt-1">Express your thoughts and track your emotional journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Write Entry Form */}
        {showForm ? (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Write a New Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Today's Entry</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind today? Write freely about your thoughts, feelings, and experiences..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                  rows="8"
                  disabled={submitting}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Entry'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setContent('')
                    setError('')
                  }}
                  className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full mb-8 border-2 border-dashed border-primary rounded-lg p-8 text-center hover:bg-primary hover:bg-opacity-5 transition"
          >
            <Plus className="mx-auto text-primary mb-2" size={32} />
            <p className="text-primary font-medium">Write a new journal entry</p>
          </button>
        )}

        {/* Journal Entries */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Entries</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-primary" size={40} />
            </div>
          ) : journals.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No journal entries yet</p>
              <p className="text-gray-400 text-sm mt-2">Start by writing your first entry to begin tracking your journey</p>
            </div>
          ) : (
            journals.map((journal) => (
              <div key={journal.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-primary">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-gray-500">
                    {format(new Date(journal.createdAt), 'PPPP')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(journal.createdAt), 'HH:mm')}
                  </p>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{journal.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Journaling Tips */}
        <div className="mt-12 bg-purple-50 border border-purple-200 rounded-2xl p-6">
          <h3 className="font-bold text-purple-900 mb-3">📝 Journaling Tips</h3>
          <ul className="text-purple-800 text-sm space-y-2">
            <li>• Write freely without worrying about grammar or structure</li>
            <li>• Be honest about your feelings and experiences</li>
            <li>• Journal regularly to build consistency and self-awareness</li>
            <li>• Use prompts: What happened today? How do I feel? What did I learn?</li>
            <li>• Review past entries to spot patterns and growth</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
