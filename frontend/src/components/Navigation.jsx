import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Home, Brain, Heart, MessageCircle, BookOpen, TrendingUp,
  Settings, ClipboardList, Lightbulb, Sparkles, LogOut,
  ChevronLeft, ChevronRight, Zap, User
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Navigation = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Assessment', href: '/assessment', icon: ClipboardList },
    { label: 'Mood', href: '/mood', icon: Heart },
    { label: 'Tasks', href: '/tasks', icon: Zap },
    { label: 'Insights', href: '/insights', icon: Lightbulb },
    { label: 'Chat', href: '/chat', icon: MessageCircle },
    { label: 'CBT', href: '/cbt', icon: Brain },
    { label: 'Journal', href: '/journal', icon: BookOpen },
    { label: 'Reflection', href: '/reflection', icon: Sparkles },
    { label: 'Progress', href: '/progress', icon: TrendingUp },
  ]

  const isActive = (href) => location.pathname === href

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white shadow-card flex flex-col z-50 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow">
              <span className="text-white font-bold text-sm">IS</span>
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">ISLA.AI</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard" className="mx-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow">
              <span className="text-white font-bold text-sm">IS</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-gray-400 hover:text-primary p-1 rounded-lg hover:bg-indigo-50"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                active
                  ? 'bg-indigo-50 text-primary'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <item.icon size={18} className={active ? 'text-primary' : 'text-gray-400'} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-100 px-2 py-3 space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={18} className="text-gray-400" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">Premium Member</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Log Out' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut size={18} className="text-gray-400" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  )
}

/* Top navigation bar for public pages (login/register) */
export const TopNav = ({ showLogin = true }) => {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-6 text-sm text-gray-500">
        <a href="#" className="hover:text-gray-800">Home</a>
        <a href="#" className="hover:text-gray-800">About Us</a>
        <a href="#" className="hover:text-gray-800">How to use</a>
        <a href="#" className="hover:text-gray-800">Q&A</a>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">English</span>
        {showLogin ? (
          <>
            <Link to="/login" className="text-sm text-primary font-medium underline underline-offset-2">Sign in</Link>
            <Link
              to="/register"
              className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-indigo-700 transition"
            >
              Register
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition"
          >
            Log In
          </Link>
        )}
      </div>
    </nav>
  )
}
