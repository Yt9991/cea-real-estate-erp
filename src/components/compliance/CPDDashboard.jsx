// File: src/components/compliance/CPDDashboard.jsx
// CPD Compliance Dashboard with 2026 Framework Support

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  DocumentTextIcon,
  PlusIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

const CPDDashboard = ({ userProfile }) => {
  const [cpdData, setCpdData] = useState({
    currentYear: new Date().getFullYear(),
    totalCompleted: 0,
    required: 0,
    framework: 'legacy',
    breakdown: {},
    records: [],
    complianceStatus: false
  })
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRecord, setNewRecord] = useState({
    course_name: '',
    course_provider: '',
    completion_date: '',
    cpd_category: 'Structured_Learning_PC',
    training_hours: '',
    cpd_credits: '',
    certificate_number: '',
    certificate_url: '',
    prescribed_essential_topic: ''
  })

  // Load CPD data for user
  useEffect(() => {
    loadCPDData()
  }, [userProfile?.user_id])

  const loadCPDData = async () => {
    if (!userProfile?.user_id) return

    setLoading(true)
    try {
      const currentYear = new Date().getFullYear()
      
      // Get CPD records for current year
      const { data: records, error } = await supabase
        .from('cpd_records')
        .select('*')
        .eq('user_id', userProfile.user_id)
        .eq('compliance_year', currentYear)
        .eq('status', 'Completed')
        .order('completion_date', { ascending: false })

      if (error) throw error

      // Calculate compliance based on framework
      let complianceData = {
        currentYear,
        records: records || [],
        framework: currentYear >= 2026 ? '2026' : 'legacy',
        complianceStatus: false
      }

      if (currentYear >= 2026) {
        // 2026 Framework: 16 training hours with components
        const peHours = records?.filter(r => r.cpd_category === 'Structured_Learning_PE')
          .reduce((sum, r) => sum + (parseFloat(r.training_hours) || 0), 0) || 0
        const pcHours = records?.filter(r => r.cpd_category === 'Structured_Learning_PC')
          .reduce((sum, r) => sum + (parseFloat(r.training_hours) || 0), 0) || 0
        const sdlHours = records?.filter(r => r.cpd_category === 'Self_Directed_Learning_GC_Plus')
          .reduce((sum, r) => sum + (parseFloat(r.training_hours) || 0), 0) || 0

        complianceData = {
          ...complianceData,
          totalCompleted: peHours + pcHours + sdlHours,
          required: 16,
          breakdown: {
            pe: { completed: peHours, required: 4, label: 'Prescribed Essentials' },
            pc: { completed: pcHours, required: 8, label: 'Professional Competencies' },
            sdl: { completed: sdlHours, required: 4, label: 'Self-Directed Learning' }
          },
          complianceStatus: peHours >= 4 && pcHours >= 8 && sdlHours >= 4 && (peHours + pcHours + sdlHours) >= 16
        }
      } else {
        // Legacy Framework: 6 CPD credits
        const totalCredits = records?.reduce((sum, r) => sum + (parseFloat(r.cpd_credits) || 0), 0) || 0
        
        complianceData = {
          ...complianceData,
          totalCompleted: totalCredits,
          required: 6,
          breakdown: {
            professional: { completed: records?.filter(r => r.cpd_category?.includes('Professional')).length || 0, required: 4 },
            generic: { completed: records?.filter(r => r.cpd_category?.includes('Generic')).length || 0, required: 2 }
          },
          complianceStatus: totalCredits >= 6
        }
      }

      setCpdData(complianceData)

      // Update user's compliance status if changed
      if (userProfile.cpd_compliance_status !== complianceData.complianceStatus) {
        await supabase
          .from('users')
          .update({ cpd_compliance_status: complianceData.complianceStatus })
          .eq('user_id', userProfile.user_id)
      }

    } catch (error) {
      console.error('Error loading CPD data:', error)
      toast.error('Failed to load CPD data')
    } finally {
      setLoading(false)
    }
  }

  // Add new CPD record
  const handleAddRecord = async (e) => {
    e.preventDefault()
    
    try {
      const recordData = {
        user_id: userProfile.user_id,
        course_name: newRecord.course_name,
        course_provider: newRecord.course_provider,
        completion_date: newRecord.completion_date,
        compliance_year: new Date(newRecord.completion_date).getFullYear(),
        status: 'Completed',
        certificate_number: newRecord.certificate_number,
        certificate_url: newRecord.certificate_url
      }

      // Add framework-specific fields
      if (cpdData.framework === '2026') {
        recordData.training_hours = parseFloat(newRecord.training_hours)
        recordData.cpd_category = newRecord.cpd_category
        if (newRecord.cpd_category === 'Structured_Learning_PE') {
          recordData.prescribed_essential_topic = newRecord.prescribed_essential_topic
        }
        if (newRecord.cpd_category === 'Self_Directed_Learning_GC_Plus') {
          recordData.keo_approved = false // Will need KEO approval
        }
      } else {
        recordData.cpd_credits = parseFloat(newRecord.cpd_credits)
      }

      const { error } = await supabase
        .from('cpd_records')
        .insert(recordData)

      if (error) throw error

      toast.success('CPD record added successfully!')
      setShowAddModal(false)
      setNewRecord({
        course_name: '',
        course_provider: '',
        completion_date: '',
        cpd_category: 'Structured_Learning_PC',
        training_hours: '',
        cpd_credits: '',
        certificate_number: '',
        certificate_url: '',
        prescribed_essential_topic: ''
      })
      loadCPDData() // Refresh data

    } catch (error) {
      console.error('Error adding CPD record:', error)
      toast.error('Failed to add CPD record')
    }
  }

  const getComplianceStatusColor = (status) => {
    return status ? 'text-green-600' : 'text-red-600'
  }

  const getProgressColor = (completed, required) => {
    if (completed >= required) return 'bg-green-500'
    if (completed >= required * 0.7) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-20 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">CPD Compliance Dashboard</h2>
            <p className="text-gray-600">
              {cpdData.framework === '2026' ? '2026 Framework' : 'Legacy Framework'} - {cpdData.currentYear}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {cpdData.complianceStatus ? (
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            )}
            <span className={`font-semibold ${getComplianceStatusColor(cpdData.complianceStatus)}`}>
              {cpdData.complianceStatus ? 'Compliant' : 'Non-Compliant'}
            </span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress: {cpdData.totalCompleted} / {cpdData.required} {cpdData.framework === '2026' ? 'hours' : 'credits'}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((cpdData.totalCompleted / cpdData.required) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(cpdData.totalCompleted, cpdData.required)}`}
              style={{ width: `${Math.min((cpdData.totalCompleted / cpdData.required) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Component Breakdown */}
        {cpdData.framework === '2026' ? (
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {Object.entries(cpdData.breakdown).map(([key, component]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{component.label}</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {component.completed} / {component.required} hours
                  </span>
                  <span className={`text-sm font-medium ${component.completed >= component.required ? 'text-green-600' : 'text-red-600'}`}>
                    {component.completed >= component.required ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(component.completed, component.required)}`}
                    style={{ width: `${Math.min((component.completed / component.required) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Professional Competencies</h4>
              <p className="text-sm text-gray-600">{cpdData.breakdown.professional?.completed || 0} / 4 courses</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Generic Competencies</h4>
              <p className="text-sm text-gray-600">{cpdData.breakdown.generic?.completed || 0} / 2 courses</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-amber-900 text-white rounded-md hover:bg-amber-800 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add CPD Record
        </button>
      </div>

      {/* CPD Records */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CPD Records ({cpdData.currentYear})</h3>
        
        {cpdData.records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No CPD records found for {cpdData.currentYear}</p>
            <p className="text-sm">Add your completed courses to track compliance</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cpdData.records.map((record) => (
              <div key={record.cpd_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{record.course_name}</h4>
                    <p className="text-sm text-gray-600">Provider: {record.course_provider}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(record.completion_date).toLocaleDateString()}
                      </span>
                      {cpdData.framework === '2026' ? (
                        <>
                          <span>{record.training_hours} hours</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {record.cpd_category?.replace('_', ' ')}
                          </span>
                        </>
                      ) : (
                        <span>{record.cpd_credits} credits</span>
                      )}
                    </div>
                    {record.certificate_number && (
                      <p className="text-xs text-gray-500 mt-1">
                        Certificate: {record.certificate_number}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {record.status === 'Completed' && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                    {record.cpd_category === 'Self_Directed_Learning_GC_Plus' && !record.keo_approved && (
                      <ClockIcon className="h-5 w-5 text-yellow-500" title="Pending KEO Approval" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add CPD Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add CPD Record</h3>
              
              <form onSubmit={handleAddRecord} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
                  <input
                    type="text"
                    value={newRecord.course_name}
                    onChange={(e) => setNewRecord({...newRecord, course_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Provider *</label>
                  <input
                    type="text"
                    value={newRecord.course_provider}
                    onChange={(e) => setNewRecord({...newRecord, course_provider: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date *</label>
                  <input
                    type="date"
                    value={newRecord.completion_date}
                    onChange={(e) => setNewRecord({...newRecord, completion_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                {cpdData.framework === '2026' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        value={newRecord.cpd_category}
                        onChange={(e) => setNewRecord({...newRecord, cpd_category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Structured_Learning_PE">Prescribed Essentials (PE)</option>
                        <option value="Structured_Learning_PC">Professional Competencies (PC)</option>
                        <option value="Self_Directed_Learning_GC_Plus">Self-Directed Learning (GC Plus)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Training Hours *</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={newRecord.training_hours}
                        onChange={(e) => setNewRecord({...newRecord, training_hours: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>

                    {newRecord.cpd_category === 'Structured_Learning_PE' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed Essential Topic</label>
                        <select
                          value={newRecord.prescribed_essential_topic}
                          onChange={(e) => setNewRecord({...newRecord, prescribed_essential_topic: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="PMLPFTF">Prevention of Money Laundering, Proliferation Financing and Terrorism Financing</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPD Credits *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={newRecord.cpd_credits}
                      onChange={(e) => setNewRecord({...newRecord, cpd_credits: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                  <input
                    type="text"
                    value={newRecord.certificate_number}
                    onChange={(e) => setNewRecord({...newRecord, certificate_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate URL</label>
                  <input
                    type="url"
                    value={newRecord.certificate_url}
                    onChange={(e) => setNewRecord({...newRecord, certificate_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-amber-900 text-white py-2 px-4 rounded-md hover:bg-amber-800 transition-colors"
                  >
                    Add Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CPDDashboard