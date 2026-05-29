import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '../components/Navigation'
import { taskAPI } from '../services/api'
import { CheckCircle, Circle, AlertCircle, Loader, Plus, Clock, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

export const TasksPage = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [taskErrors, setTaskErrors] = useState({}) // per-task error messages
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      // First try to generate daily tasks
      await taskAPI.generateDailyTasks()
      // Then fetch today's tasks
      const response = await taskAPI.getTodayTasks()
      setTasks(response.data.tasks || response.data)
    } catch (err) {
      // If generate fails, just fetch existing tasks
      try {
        const response = await taskAPI.getTodayTasks()
        setTasks(response.data.tasks || response.data)
      } catch {
        setError('Failed to load tasks')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTaskStatusChange = async (taskId, newStatus) => {
    // Clear previous error for this task
    setTaskErrors((prev) => ({ ...prev, [taskId]: null }))
    try {
      await taskAPI.updateTaskStatus(taskId, newStatus)
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      )
    } catch (err) {
      const data = err.response?.data
      if (data?.requiresAction) {
        setTaskErrors((prev) => ({
          ...prev,
          [taskId]: { message: data.error, action: data.requiresAction }
        }))
      } else {
        setError('Failed to update task status')
      }
    }
  }

  const getActionLink = (action) => {
    if (action === 'JOURNAL') return '/journal'
    if (action === 'CBT') return '/cbt'
    return null
  }

  const getActionLabel = (action) => {
    if (action === 'JOURNAL') return 'Đi đến Gratitude Journal'
    if (action === 'CBT') return 'Đi đến CBT Practice'
    return null
  }

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'BREATHING':
        return '🌬️'
      case 'CBT':
        return '🧠'
      case 'JOURNAL':
        return '📝'
      default:
        return '✨'
    }
  }

  const getTaskTypeLabel = (type) => {
    switch (type) {
      case 'BREATHING':
        return 'Breathing Exercise'
      case 'CBT':
        return 'CBT Practice'
      case 'JOURNAL':
        return 'Gratitude Journal'
      default:
        return type
    }
  }

  const completedCount = tasks.filter((t) => t.status === 'DONE').length
  const totalCount = tasks.length

  return (
    <div className="flex min-h-screen bg-[#eef2ff]">
      <Navigation />
      <div className="flex-1 ml-56 max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Today's Wellness Tasks</h1>
          <p className="text-gray-500 mt-1">Complete your daily tasks to maintain your wellness journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Progress Overview */}
        {!loading && tasks.length > 0 && (
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg shadow p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Today's Progress</p>
                <p className="text-3xl font-bold mt-1">
                  {completedCount} of {totalCount} completed
                </p>
              </div>
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <p className="text-2xl font-bold">
                  {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-primary" size={40} />
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Plus className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No tasks for today yet</p>
              <p className="text-gray-400 text-sm mt-2">Check back later or generate new tasks</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-lg shadow p-6 transition ${
                  task.status === 'DONE' ? 'border-l-4 border-success' : 'border-l-4 border-primary'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <button
                      onClick={() =>
                        handleTaskStatusChange(
                          task.id,
                          task.status === 'DONE' ? 'PENDING' : 'DONE'
                        )
                      }
                      className="mt-1 text-gray-400 hover:text-primary transition"
                    >
                      {task.status === 'DONE' ? (
                        <CheckCircle className="text-success" size={24} />
                      ) : (
                        <Circle size={24} />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`text-lg font-medium ${
                          task.status === 'DONE'
                            ? 'text-gray-400 line-through'
                            : 'text-gray-900'
                        }`}
                      >
                        {getTaskTypeIcon(task.task?.type)} {getTaskTypeLabel(task.task?.type)}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{task.task?.duration || 0} minutes</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'DONE'
                            ? 'bg-success bg-opacity-10 text-success'
                            : task.status === 'PENDING'
                            ? 'bg-primary bg-opacity-10 text-primary'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {task.status}
                        </span>
                      </div>

                      {/* Per-task error: requires completing the activity first */}
                      {taskErrors[task.id] && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
                          <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-amber-800 text-sm">{taskErrors[task.id].message}</p>
                            {getActionLink(taskErrors[task.id].action) && (
                              <button
                                onClick={() => navigate(getActionLink(taskErrors[task.id].action))}
                                className="mt-1 flex items-center space-x-1 text-primary text-sm font-medium hover:underline"
                              >
                                <ExternalLink size={14} />
                                <span>{getActionLabel(taskErrors[task.id].action)}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Tips for Success</h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li>• Complete breathing exercises in the morning for a fresh start</li>
            <li>• Practice CBT techniques when facing challenging thoughts</li>
            <li>• Journal about your day to reflect and track patterns</li>
            <li>• Consistency is key - try to complete all tasks daily</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
