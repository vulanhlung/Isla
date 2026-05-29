import React, { useState, useEffect, useRef } from 'react'
import { Navigation } from '../components/Navigation'
import { chatAPI } from '../services/api'
import { Send, AlertCircle, Loader, ShieldAlert, Smile, Image, Mic, Bookmark } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const RECOMMENDATIONS = [
  { icon: '💨', bg: 'bg-cyan-50', title: '5 min breathing break', subtitle: 'Mindfulness · Calm', href: '/cbt' },
  { icon: '✍️', bg: 'bg-purple-50', title: 'Short reflection', subtitle: 'Journaling · Personal', href: '/journal' },
  { icon: '🏃', bg: 'bg-green-50', title: 'Physical exercise', subtitle: 'Yoga · Personal', href: '/tasks' },
  { icon: '🎮', bg: 'bg-orange-50', title: '#Minigame', subtitle: 'Game · Personal', href: '/tasks' },
]

export const ChatPage = () => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastMetadata, setLastMetadata] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const { user } = useAuth()

  const userName = user?.email?.split('@')[0] || 'there'

  useEffect(() => {
    fetchChatHistory()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchChatHistory = async () => {
    try {
      const response = await chatAPI.getChatHistory({ limit: 50 })
      setMessages(response.data.messages || [])
    } catch {
      setError('Failed to load chat history')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    if (newMessage.length > 1000) {
      setError('Message too long (max 1000 characters).')
      return
    }

    const userMessage = {
      id: Date.now().toString(),
      message: newMessage,
      role: 'user',
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage('')
    setLoading(true)
    setError('')

    try {
      const response = await chatAPI.sendMessage({ message: newMessage })
      if (response.data.assistantMessage) {
        setLastMetadata(response.data.metadata || null)
        setMessages((prev) => [
          ...prev,
          { ...response.data.assistantMessage, metadata: response.data.metadata || null },
        ])
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message.')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#eef2ff]">
      <Navigation />

      {/* Main chat area */}
      <div className="flex-1 ml-56 flex overflow-hidden h-screen">
        {/* Chat panel */}
        <div className="flex-1 flex flex-col bg-[#dbeafe] relative">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-6 py-4 bg-white/60 backdrop-blur-sm border-b border-white/40">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">IS</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">ISLA.AI</p>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>

          {/* Safety banner */}
          {lastMetadata?.needsHumanSupport && (
            <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <ShieldAlert className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <div className="flex-1">
                <p className="text-red-800 text-xs font-semibold">{lastMetadata.riskLabel}</p>
                <div className="mt-2 flex gap-2">
                  <a href="tel:1800599920" className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg">
                    📞 1800 599 920
                  </a>
                  <a href="tel:115" className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-lg">
                    🚑 115
                  </a>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
              <p className="text-red-700 text-xs">{error}</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Giraffe mascot background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <span className="text-9xl">🦒</span>
            </div>

            {initialLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="animate-spin text-primary" size={32} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center relative z-10">
                <span className="text-6xl mb-4">🦒</span>
                <p className="text-gray-600 font-medium">Hi! I'm ISLA, your mental wellness companion.</p>
                <p className="text-gray-400 text-sm mt-1">Share how you're feeling today.</p>
              </div>
            ) : (
              <div className="relative z-10 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role !== 'user' && (
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center flex-shrink-0 text-lg">
                        🦒
                      </div>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white/90 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.message}</p>
                      <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {format(new Date(message.createdAt), 'HH:mm')}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                        {userName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-end gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-lg">🦒</div>
                    <div className="bg-white/90 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="px-6 py-4 bg-white/60 backdrop-blur-sm border-t border-white/40">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-sm border border-gray-100">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask your AI companion..."
                  disabled={loading}
                  maxLength={1000}
                  className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400 text-gray-800"
                />
                <div className="flex items-center gap-2 text-gray-300">
                  <button type="button" className="hover:text-gray-500 transition"><Smile size={18} /></button>
                  <button type="button" className="hover:text-gray-500 transition"><Image size={18} /></button>
                  <button type="button" className="hover:text-gray-500 transition"><Mic size={18} /></button>
                  <button type="button" className="hover:text-gray-500 transition"><Bookmark size={18} /></button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Send size={16} />
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-2">Powered by AI · ISLA companion</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-72 bg-white p-6 overflow-y-auto border-l border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back, {userName}</h2>
          <p className="text-xs text-gray-400 mb-6">Your personalized mental health assistant is ready.</p>

          <h3 className="text-sm font-bold text-gray-700 mb-3">Recommended for you</h3>
          <div className="space-y-3">
            {RECOMMENDATIONS.map((rec, i) => (
              <Link to={rec.href} key={i}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl ${rec.bg} flex items-center justify-center text-xl flex-shrink-0`}>
                    {rec.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{rec.title}</p>
                    <p className="text-xs text-gray-400">{rec.subtitle}</p>
                  </div>
                  <button className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition flex-shrink-0">
                    Start
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
