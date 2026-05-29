import React, { useState } from 'react'
import { Navigation } from '../components/Navigation'
import { useAuth } from '../context/AuthContext'
import { Settings, LogOut, Shield, Bell, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const SettingsPage = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    dataRetention: true,
    privacyMode: false,
  })

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  const handleSettingChange = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  return (
    <div className="flex min-h-screen bg-[#eef2ff]">
      <Navigation />
      <div className="flex-1 ml-56 max-w-2xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full"></div>
            <span>Profile</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900 font-medium mt-1">{user?.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Account Created</label>
              <p className="text-gray-900 font-medium mt-1">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Bell size={24} className="text-primary" />
            <span>Notifications</span>
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600 mt-1">
                  Receive updates about your wellness progress
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleSettingChange('emailNotifications')}
                className="w-5 h-5 text-primary rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600 mt-1">
                  Get reminders for your daily tasks
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={() => handleSettingChange('pushNotifications')}
                className="w-5 h-5 text-primary rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Shield size={24} className="text-primary" />
            <span>Privacy & Data</span>
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Data Retention</p>
                <p className="text-sm text-gray-600 mt-1">
                  Keep my data stored for future analysis
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.dataRetention}
                onChange={() => handleSettingChange('dataRetention')}
                className="w-5 h-5 text-primary rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Privacy Mode</p>
                <p className="text-sm text-gray-600 mt-1">
                  Hide sensitive information from view
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacyMode}
                onChange={() => handleSettingChange('privacyMode')}
                className="w-5 h-5 text-primary rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Privacy Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🔒 Your privacy is important to us. All your data is encrypted and handled according to our privacy policy. You can review your consent preferences at any time.
            </p>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Eye size={24} className="text-primary" />
            <span>Security</span>
          </h2>

          <button className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition text-left">
            <p className="font-medium text-gray-900">Change Password</p>
            <p className="text-sm text-gray-600 mt-1">Update your account password</p>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow p-8 border-l-4 border-danger">
          <h2 className="text-2xl font-bold text-danger mb-6">Danger Zone</h2>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-danger text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>

          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ⚠️ More options like account deletion will be available in a future update.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>ISLA © 2024 - Your Mental Wellness Companion</p>
          <p className="mt-2">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            {' • '}
            <a href="#" className="hover:text-primary">Terms of Service</a>
            {' • '}
            <a href="#" className="hover:text-primary">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  )
}
