import React from 'react'

const CEAButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-cea-light hover:bg-cea-gold text-cea-white focus:ring-cea-light shadow-sm',
    secondary: 'bg-cea-white hover:bg-gray-50 text-cea-medium border border-cea-light focus:ring-cea-light shadow-sm',
    danger: 'bg-cea-burgundy hover:bg-red-700 text-white focus:ring-red-500 shadow-sm',
    ghost: 'text-cea-medium hover:text-cea-dark hover:bg-gray-100 focus:ring-cea-light',
    outline: 'border border-cea-light text-cea-medium hover:bg-cea-light hover:text-cea-white focus:ring-cea-light'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg 
          className="w-4 h-4 mr-2 animate-spin" 
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

export default CEAButton