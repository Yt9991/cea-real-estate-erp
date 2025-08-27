import React, { useState } from 'react'
import { supabase, authHelpers } from '../../lib/supabase'
import { toast } from 'react-hot-toast'

const CEAAuthSystem = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await authHelpers.signInWithEmail(
        formData.email,
        formData.password
      )

      if (error) throw error

      const { data: license } = await supabase
        .from('cea_licenses')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('status', 'Active')
        .single()

      if (!license) {
        await supabase.auth.signOut()
        throw new Error('No valid CEA license found. Please contact administrator.')
      }

      localStorage.setItem('cea_auth_token', data.session.access_token)
      toast.success('Login successful!')
      window.location.href = '/dashboard'

    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-amber-900 text-center mb-8">CEA Real Estate ERP</h1>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-amber-900 text-white rounded-md hover:bg-amber-800"
          >
            {loading ? 'Processing...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CEAAuthSystem
