import React from 'react'
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/solid'

const CEAStatusBadge = ({ status, text, size = 'md', showIcon = true }) => {
  const statusConfig = {
    compliant: {
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircleIcon,
      defaultText: 'Compliant'
    },
    completed: {
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircleIcon,
      defaultText: 'Completed'
    },
    pending: {
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: ClockIcon,
      defaultText: 'Pending'
    },
    warning: {
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: ExclamationTriangleIcon,
      defaultText: 'Warning'
    },
    error: {
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircleIcon,
      defaultText: 'Error'
    },
    non_compliant: {
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: ExclamationTriangleIcon,
      defaultText: 'Non-Compliant'
    },
    expired: {
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircleIcon,
      defaultText: 'Expired'
    },
    draft: {
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: ClockIcon,
      defaultText: 'Draft'
    }
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4'
  }
  
  const config = statusConfig[status] || statusConfig.draft
  const Icon = config.icon
  const displayText = text || config.defaultText
  
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizeClasses[size]}`}>
      {showIcon && (
        <Icon className={`mr-1 ${iconSizes[size]}`} />
      )}
      {displayText}
    </span>
  )
}

export default CEAStatusBadge