import React from 'react'
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

const NavigationHeader = ({ currentPage = 'dashboard' }) => {
  const handleLogout = () => {
    localStorage.removeItem('cea_auth_token')
    localStorage.removeItem('user_role') 
    localStorage.removeItem('user_data')
    window.location.href = '/login'
  }

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
  const userRole = localStorage.getItem('user_role') || 'user'

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', active: currentPage === 'dashboard' },
    { name: 'Generate Forms', path: '/forms', active: currentPage === 'forms' },
    { name: 'Profiles', path: '/profiles', active: currentPage === 'profiles', disabled: true },
    { name: 'Compliance', path: '/compliance', active: currentPage === 'compliance', disabled: true }
  ]

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left - Company Logo & Navigation */}
          <div className="flex items-center space-x-8">
            {/* Company Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cea-gold rounded-lg flex items-center justify-center text-white font-bold text-sm">
                ML
              </div>
              <div>
                <h1 className="text-lg font-bold text-cea-dark">CEA ERP</h1>
                <p className="text-xs text-gray-600">Real Estate Management</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex space-x-6">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => !item.disabled && (window.location.href = item.path)}
                  className={`text-sm font-medium transition-colors ${
                    item.active 
                      ? 'text-cea-gold border-b-2 border-cea-gold pb-1' 
                      : item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:text-cea-gold'
                  }`}
                  disabled={item.disabled}
                >
                  {item.name}
                  {item.disabled && <span className="ml-1 text-xs">(Soon)</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* Right - User Profile & Actions */}
          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <UserCircleIcon className="h-7 w-7 text-gray-400" />
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{userData.name || 'User'}</p>
                <p className="text-xs text-gray-600">{userRole.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
              title="Sign Out"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavigationHeader
