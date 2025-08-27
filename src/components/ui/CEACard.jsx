import React from 'react'
import CEAStatusBadge from './CEAStatusBadge'

const CEACard = ({ 
  children, 
  title, 
  subtitle,
  status,
  statusText,
  className = '',
  headerActions,
  padding = 'normal',
  shadow = 'sm',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    normal: 'p-6',
    lg: 'p-8'
  }
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }
  
  const baseClasses = `bg-cea-white rounded-lg border border-gray-200 ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`
  
  return (
    <div className={baseClasses} {...props}>
      {(title || status || headerActions) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {title && (
              <div>
                <h3 className="text-lg font-semibold text-cea-dark">{title}</h3>
                {subtitle && (
                  <p className="text-sm text-cea-medium mt-1">{subtitle}</p>
                )}
              </div>
            )}
            {status && (
              <CEAStatusBadge status={status} text={statusText} />
            )}
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export default CEACard