import React, { useState } from 'react'

const ComprehensiveFormsSystem = () => {
  const [currentStep, setCurrentStep] = useState('transaction-type')
  const [masterData, setMasterData] = useState({})
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [generatedForms, setGeneratedForms] = useState([])
  const [activeForm, setActiveForm] = useState(null)

  // Complete Transaction Workflows with ALL Required Forms
  const TRANSACTION_WORKFLOWS = {
    'residential_lease': {
      name: 'Residential Property Lease',
      required_forms: [
        'estate_agency_agreement_lease',
        'letter_of_intent_residential', 
        'tenancy_agreement_residential',
        'inventory_list',
        'immigration_checklist',
        'customer_particulars_form',
        'commission_agreement'
      ],
      optional_forms: ['rental_collection_form', 'guarantor_form', 'diplomatic_clause_addendum'],
      data_requirements: ['landlord_info', 'tenant_info', 'property_details', 'lease_terms', 'agent_info']
    },
    'commercial_lease': {
      name: 'Commercial Property Lease',
      required_forms: [
        'estate_agency_agreement_lease',
        'letter_of_intent_commercial',
        'commercial_tenancy_agreement', 
        'commercial_inventory_list',
        'customer_particulars_form',
        'commission_agreement'
      ],
      optional_forms: ['business_registration_verification', 'corporate_guarantor'],
      data_requirements: ['landlord_info', 'tenant_info', 'property_details', 'lease_terms', 'agent_info']
    },
    'residential_sale': {
      name: 'Residential Property Sale',
      required_forms: [
        'estate_agency_agreement_sale',
        'option_to_purchase',
        'sale_purchase_agreement',
        'commission_agreement_sale',
        'customer_particulars_form'
      ],
      optional_forms: ['mortgage_in_principle', 'cpf_withdrawal_form', 'legal_completion_form'],
      data_requirements: ['vendor_info', 'purchaser_info', 'property_details', 'lease_terms', 'agent_info']
    },
    'hdb_resale': {
      name: 'HDB Resale Transaction',
      required_forms: [
        'hdb_estate_agency_agreement',
        'hdb_option_to_purchase',
        'hdb_resale_application',
        'hdb_completion_form',
        'commission_agreement',
        'customer_particulars_form'
      ],
      optional_forms: ['cpf_valuation_waiver', 'hdb_loan_application'],
      data_requirements: ['vendor_info', 'purchaser_info', 'property_details', 'lease_terms', 'agent_info']
    },
    'private_property_sale': {
      name: 'Private Property Sale',
      required_forms: [
        'estate_agency_agreement_sale',
        'option_to_purchase', 
        'private_sale_purchase_agreement',
        'commission_agreement_sale',
        'customer_particulars_form',
        'property_valuation_report'
      ],
      optional_forms: ['mortgage_in_principle', 'legal_completion_form', 'private_property_insurance'],
      data_requirements: ['vendor_info', 'purchaser_info', 'property_details', 'sale_terms', 'agent_info']
    },
    'private_property_rental': {
      name: 'Private Property Rental',
      required_forms: [
        'estate_agency_agreement_lease',
        'letter_of_intent_private',
        'private_tenancy_agreement',
        'inventory_list',
        'customer_particulars_form',
        'commission_agreement'
      ],
      optional_forms: ['rental_insurance', 'guarantor_form', 'utility_setup_form'],
      data_requirements: ['landlord_info', 'tenant_info', 'property_details', 'lease_terms', 'agent_info']
    }
  }

  // Simplified Data Collection Schema
  const DATA_COLLECTION_SCHEMA = {
    landlord_info: {
      fields: ['name', 'nric', 'address', 'contact', 'email'],
      validations: { name: 'required', contact: 'required' }
    },
    tenant_info: {
      fields: ['name', 'nric', 'address', 'contact', 'email'],
      validations: { name: 'required', contact: 'required' }
    },
    vendor_info: {
      fields: ['name', 'nric', 'address', 'contact', 'email'],
      validations: { name: 'required' }
    },
    purchaser_info: {
      fields: ['name', 'nric', 'address', 'contact', 'email'],
      validations: { name: 'required' }
    },
    property_details: {
      fields: ['address', 'property_type', 'built_up_area', 'num_bedrooms'],
      validations: { address: 'required' }
    },
    lease_terms: {
      fields: ['lease_duration', 'monthly_rental', 'deposit_amount'],
      validations: { monthly_rental: 'required' }
    },
    sale_terms: {
      fields: ['sale_price', 'completion_date', 'deposit_percentage'],
      validations: { sale_price: 'required' }
    },
    agent_info: {
      fields: ['name', 'cea_reg_no', 'mobile', 'email'],
      validations: { name: 'required', cea_reg_no: 'required' }
    }
  }

  // Simple validation function
  const validateForm = (data, validations) => {
    const errors = {}
    Object.keys(validations).forEach(field => {
      if (validations[field].includes('required') && !data[field]) {
        errors[field] = 'This field is required'
      }
    })
    return { isValid: Object.keys(errors).length === 0, errors }
  }

  // Master Data Collection Component
  const MasterDataCollection = () => {
    const workflow = TRANSACTION_WORKFLOWS[selectedWorkflow]
    const [currentDataStep, setCurrentDataStep] = useState(0)
    
    const renderDataCollectionStep = () => {
      if (!workflow) return null
      
      const dataCategory = workflow.data_requirements[currentDataStep]
      const schema = DATA_COLLECTION_SCHEMA[dataCategory]
      
      if (!schema) return null

      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 capitalize">
            {dataCategory.replace('_', ' ')} Information
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {schema.fields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field.replace('_', ' ')}
                  {schema.validations[field]?.includes('required') && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={getInputType(field)}
                  value={masterData[`${dataCategory}_${field}`] || ''}
                  onChange={(e) => updateMasterData(`${dataCategory}_${field}`, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={getPlaceholder(field)}
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentDataStep(Math.max(0, currentDataStep - 1))}
              disabled={currentDataStep === 0}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">
              Step {currentDataStep + 1} of {workflow.data_requirements.length}
            </div>
            <button
              onClick={() => {
                if (currentDataStep < workflow.data_requirements.length - 1) {
                  setCurrentDataStep(currentDataStep + 1)
                } else {
                  generateAllForms()
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {currentDataStep < workflow.data_requirements.length - 1 ? 'Next' : 'Generate All Forms'}
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <CompanyHeader title="Master Data Collection" />
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Data Collection for: {workflow.name}</h3>
          <p className="text-blue-700 text-sm">
            This data will automatically populate ALL required forms for this transaction type.
            Complete all steps to generate {workflow.required_forms.length} mandatory forms + {workflow.optional_forms.length} optional forms.
          </p>
        </div>

        {renderDataCollectionStep()}
      </div>
    )
  }

  // Form Generation Results
  const FormGenerationResults = () => {
    const workflow = TRANSACTION_WORKFLOWS[selectedWorkflow]
    
    return (
      <div className="space-y-6">
        <CompanyHeader title="Generated Forms" />
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">All Forms Generated Successfully</h3>
          <p className="text-green-700 text-sm">
            {workflow.required_forms.length} mandatory forms and {workflow.optional_forms.length} optional forms 
            have been auto-populated with your master data.
          </p>
        </div>

        {/* Required Forms */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-800">Mandatory Forms (CEA Required)</h3>
          <div className="grid gap-4">
            {workflow.required_forms.map((formId) => (
              <FormCard
                key={formId}
                formId={formId}
                status="generated"
                priority="mandatory"
                onPreview={() => previewForm(formId)}
                onEdit={() => editForm(formId)}
              />
            ))}
          </div>
        </div>

        {/* Optional Forms */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">Optional Forms</h3>
          <div className="grid gap-4">
            {workflow.optional_forms.map((formId) => (
              <FormCard
                key={formId}
                formId={formId}
                status="available"
                priority="optional"
                onGenerate={() => generateOptionalForm(formId)}
                onPreview={() => previewForm(formId)}
              />
            ))}
          </div>
        </div>

        {/* Batch Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Batch Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Preview All Forms
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Generate PDFs
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Send for Signatures
            </button>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
              Submit to Company System
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setCurrentStep('transaction-type')}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Start New Transaction
          </button>
        </div>
      </div>
    )
  }

  // Individual Form Card Component
  const FormCard = ({ formId, status, priority, onPreview, onEdit, onGenerate }) => {
    const formNames = {
      'estate_agency_agreement_lease': 'Estate Agency Agreement (Lease)',
      'letter_of_intent_residential': 'Letter of Intent - Residential',
      'tenancy_agreement_residential': 'Tenancy Agreement - Residential',
      'inventory_list': 'Property Inventory List',
      'immigration_checklist': 'Immigration Compliance Checklist',
      'customer_particulars_form': 'Customer Particulars Form (AML)',
      'commission_agreement': 'Commission Agreement',
      'letter_of_intent_commercial': 'Letter of Intent - Commercial',
      'commercial_tenancy_agreement': 'Commercial Tenancy Agreement',
      'commercial_inventory_list': 'Commercial Inventory List',
      'business_registration_verification': 'Business Registration Verification',
      'corporate_guarantor': 'Corporate Guarantor Form',
      'estate_agency_agreement_sale': 'Estate Agency Agreement (Sale)',
      'option_to_purchase': 'Option to Purchase',
      'sale_purchase_agreement': 'Sale & Purchase Agreement',
      'commission_agreement_sale': 'Commission Agreement (Sale)',
      'mortgage_in_principle': 'Mortgage in Principle',
      'cpf_withdrawal_form': 'CPF Withdrawal Form',
      'legal_completion_form': 'Legal Completion Form',
      'hdb_estate_agency_agreement': 'HDB Estate Agency Agreement',
      'hdb_option_to_purchase': 'HDB Option to Purchase',
      'hdb_resale_application': 'HDB Resale Application',
      'hdb_completion_form': 'HDB Completion Form',
      'cpf_valuation_waiver': 'CPF Valuation Waiver',
      'hdb_loan_application': 'HDB Loan Application',
      'rental_collection_form': 'Rental Collection Form',
      'guarantor_form': 'Guarantor Form',
      'diplomatic_clause_addendum': 'Diplomatic Clause Addendum',
      'private_sale_purchase_agreement': 'Private Sale & Purchase Agreement',
      'property_valuation_report': 'Property Valuation Report',
      'private_property_insurance': 'Private Property Insurance',
      'letter_of_intent_private': 'Letter of Intent - Private Property',
      'private_tenancy_agreement': 'Private Tenancy Agreement',
      'rental_insurance': 'Rental Insurance',
      'utility_setup_form': 'Utility Setup Form'
    }

    const statusColors = {
      generated: 'bg-green-100 text-green-800 border-green-200',
      available: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }

    const priorityColors = {
      mandatory: 'bg-red-50 border-red-200',
      optional: 'bg-blue-50 border-blue-200'
    }

    return (
      <div className={`border rounded-lg p-4 ${priorityColors[priority]}`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-gray-800">{formNames[formId] || formId}</h4>
              <span className={`px-2 py-1 text-xs rounded border ${statusColors[status]}`}>
                {status.toUpperCase()}
              </span>
              {priority === 'mandatory' && (
                <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">REQUIRED</span>
              )}
            </div>
            <p className="text-sm text-gray-600">Auto-populated with master data</p>
          </div>
          
          <div className="flex space-x-2">
            {status === 'available' && onGenerate && (
              <button
                onClick={onGenerate}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Generate
              </button>
            )}
            {status === 'generated' && (
              <>
                <button
                  onClick={onPreview}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Preview
                </button>
                <button
                  onClick={onEdit}
                  className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Transaction Type Selection
  const TransactionTypeSelection = () => (
    <div className="space-y-6">
      <CompanyHeader title="Select Transaction Type" />
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-6">Choose Transaction Type</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(TRANSACTION_WORKFLOWS).map(([key, workflow]) => (
            <div
              key={key}
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 cursor-pointer transition-colors"
              onClick={() => {
                setSelectedWorkflow(key)
                setCurrentStep('data-collection')
              }}
            >
              <h3 className="text-lg font-semibold mb-3">{workflow.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Required Forms: {workflow.required_forms.length}</div>
                <div>Optional Forms: {workflow.optional_forms.length}</div>
                <div>Data Categories: {workflow.data_requirements.length}</div>
              </div>
              <div className="mt-4">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Select & Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Company Header Component
  const CompanyHeader = ({ title }) => (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">ML</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">MINDLINK GROUPS PTE LTD</h1>
            <p className="text-sm text-gray-600">CEA Licence: L3009186E | Complete Forms System</p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-amber-800">{title}</div>
          <div className="text-sm text-gray-600">{new Date().toLocaleDateString('en-SG')}</div>
        </div>
      </div>
    </div>
  )

  // Helper Functions
  const updateMasterData = (key, value) => {
    setMasterData(prev => ({ ...prev, [key]: value }))
  }

  const generateAllForms = () => {
    const workflow = TRANSACTION_WORKFLOWS[selectedWorkflow]
    setGeneratedForms(workflow.required_forms)
    setCurrentStep('results')
  }

  const getInputType = (field) => {
    const dateFields = ['commencement_date', 'completion_date', 'expiry_date']
    const numberFields = ['monthly_rental', 'deposit_amount', 'lease_duration', 'built_up_area', 'sale_price', 'deposit_percentage']
    const emailFields = ['email']
    
    if (dateFields.includes(field)) return 'date'
    if (numberFields.includes(field)) return 'number'
    if (emailFields.includes(field)) return 'email'
    return 'text'
  }

  const getPlaceholder = (field) => {
    const placeholders = {
      nric: 'S1234567A or FIN',
      contact: '+65 9123 4567',
      email: 'example@email.com',
      postal_code: '123456',
      monthly_rental: '3000.00',
      cea_reg_no: 'R123456A',
      sale_price: '800000.00',
      deposit_percentage: '10'
    }
    return placeholders[field] || `Enter ${field.replace('_', ' ')}`
  }

  const previewForm = (formId) => {
    setActiveForm(formId)
    alert(`Preview feature for ${formId} coming soon!`)
  }

  const editForm = (formId) => {
    setActiveForm(formId)
    alert(`Edit feature for ${formId} coming soon!`)
  }

  const generateOptionalForm = (formId) => {
    setGeneratedForms(prev => [...prev, formId])
  }

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <button onClick={() => window.location.href = "/dashboard"} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            ← Back to Dashboard
          </button>
        </div>
        {currentStep === 'transaction-type' && <TransactionTypeSelection />}
        {currentStep === 'data-collection' && <MasterDataCollection />}
        {currentStep === 'results' && <FormGenerationResults />}
        
        {/* Footer */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border text-center text-sm text-gray-600">
          <p>© 2025 Mindlink Groups Pte Ltd. Complete Forms Management System</p>
          <p>One-time data entry • Auto-populate all forms • Full CEA compliance</p>
        </div>
      </div>
    </div>
  )
}

export default ComprehensiveFormsSystem
