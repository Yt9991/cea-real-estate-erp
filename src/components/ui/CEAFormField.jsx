import React from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'

const CEAFormField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  inputClassName = '',
  options = [], // For select fields
  rows = 3, // For textarea
  ...props
}) => {
  const fieldId = `field-${name}`
  
  const baseInputClasses = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cea-light focus:ring-cea-light sm:text-sm transition-colors duration-200'
  const errorInputClasses = 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
  
  const inputClasses = `${baseInputClasses} ${error ? errorInputClasses : ''} ${disabled ? 'bg-gray-50 text-gray-500' : ''} ${inputClassName}`
  
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={fieldId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={inputClasses}
            {...props}
          />
        )
      
      case 'select':
        return (
          <select
            id={fieldId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
            className={inputClasses}
            {...props}
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={fieldId}
              name={name}
              type="checkbox"
              checked={value}
              onChange={onChange}
              onBlur={onBlur}
              required={required}
              disabled={disabled}
              className="h-4 w-4 rounded border-gray-300 text-cea-light focus:ring-cea-light"
              {...props}
            />
            {label && (
              <label htmlFor={fieldId} className="ml-2 block text-sm text-cea-dark">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
          </div>
        )
      
      default:
        return (
          <input
            id={fieldId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={inputClasses}
            {...props}
          />
        )
    }
  }
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && type !== 'checkbox' && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-cea-dark mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <ExclamationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-cea-medium">{helperText}</p>
      )}
    </div>
  )
}

export default CEAFormField