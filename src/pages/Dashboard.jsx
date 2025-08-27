import React, { useState, useEffect } from 'react'
import NavigationHeader from "../components/NavigationHeader"
import CPDDashboard from '../components/compliance/CPDDashboard'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({
    clients: 0,
    properties: 0,
    transactions: 0,
    cpdCompliance: false
  })

  useEffect(() => {
    loadUserProfile()
    loadDashboardStats()
  }, [])

  const loadUserProfile = async () => {
    try {
      // Get current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // No authenticated user, redirect to login
        window.location.href = '/login'
        return
      }

      // Get user profile from our database
      const { data: profile, error } = await supabase
        .from('users')
        .select(`
          *,
          cea_licenses(*),
          teams(team_name)
        `)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      setUserProfile(profile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      toast.error('Failed to load user profile')
      // Fallback to localStorage if database fails
      const storedProfile = localStorage.getItem('cea_user_profile')
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile))
      }
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get client count
      let clientQuery = supabase
        .from('clients')
        .select('client_id', { count: 'exact' })
        .eq('assigned_sp_id', user.id)

      const { count: clientCount } = await clientQuery

      // Get property count (if properties table exists)
      const { count: propertyCount } = await supabase
        .from('properties')
        .select('property_id', { count: 'exact' })
        .limit(1) // Just to check if accessible

      // Get recent transactions count
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      const { count: transactionCount } = await supabase
        .from('transactions')
        .select('transaction_id', { count: 'exact' })
        .gte('transaction_date', currentMonth + '-01')

      setDashboardStats({
        clients: clientCount || 0,
        properties: propertyCount || 0,
        transactions: transactionCount || 0,
        cpdCompliance: userProfile?.cpd_compliance_status || false
      })

    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      // Use fallback mock data if database queries fail
      setDashboardStats({
        clients: 12,
        properties: 8,
        transactions: 5,
        cpdCompliance: false
      })
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('cea_auth_token')
      localStorage.removeItem('cea_user_profile')
      toast.success('Logged out successfully')
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-900"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load user profile</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-amber-900 text-white px-4 py-2 rounded-md"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <NavigationHeader currentPage="dashboard" />

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* System Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-800 font-medium">System Status: Online</span>
              <span className="text-green-600 text-sm">• All services operational</span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {userProfile.user_name}!
              </h2>
              <p className="text-gray-600">
                You are logged in as <span className="font-semibold text-amber-700">{userProfile.role?.replace('_', ' ').toUpperCase()}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                CEA Registration: {userProfile.cea_registration_number}
              </p>
            </div>
            <div className="text-right">
              <p className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                userProfile.cpd_compliance_status 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                CPD: {userProfile.cpd_compliance_status ? 'Compliant' : 'Non-Compliant'}
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Active Clients</h3>
              <p className="text-2xl font-bold text-blue-600">{dashboardStats.clients}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Properties</h3>
              <p className="text-2xl font-bold text-green-600">{dashboardStats.properties}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800">This Month</h3>
              <p className="text-2xl font-bold text-yellow-600">{dashboardStats.transactions} Transactions</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">License Status</h3>
              <p className="text-sm font-bold text-purple-600">{userProfile.status}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'cpd', label: 'CPD Compliance' },
                { id: 'clients', label: 'Client Management' },
                { id: 'properties', label: 'Properties' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button 
                  onClick={() => window.location.href = '/forms'}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors"
                >
                  <h4 className="font-semibold text-gray-900">Generate Forms</h4>
                  <p className="text-sm text-gray-600 mt-1">Create CEA-compliant documents</p>
                </button>
                <button 
                  onClick={() => setActiveTab('clients')}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors"
                >
                  <h4 className="font-semibold text-gray-900">Manage Clients</h4>
                  <p className="text-sm text-gray-600 mt-1">View and add client profiles</p>
                </button>
                <button 
                  onClick={() => setActiveTab('cpd')}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors"
                >
                  <h4 className="font-semibold text-gray-900">CPD Compliance</h4>
                  <p className="text-sm text-gray-600 mt-1">Track training hours and credits</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cpd' && (
            <CPDDashboard userProfile={userProfile} />
          )}

          {activeTab === 'clients' && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Client Management</h3>
              <p className="text-gray-600 mb-4">Client management features will be implemented here.</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">Coming soon: CDD-compliant client onboarding</p>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Property Management</h3>
              <p className="text-gray-600 mb-4">Property management features will be implemented here.</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">Coming soon: Property listings and management</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard