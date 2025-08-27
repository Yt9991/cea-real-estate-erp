import React from 'react'

const CEAFooter = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-cea-white border-t border-gray-200 mt-8">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-cea-medium hover:text-cea-dark text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-cea-medium hover:text-cea-dark text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-cea-medium hover:text-cea-dark text-sm">
              CEA Compliance
            </a>
            <a href="#" className="text-cea-medium hover:text-cea-dark text-sm">
              Support
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-sm text-cea-medium">
              © {currentYear} CEA Real Estate ERP. All rights reserved.
            </p>
            <p className="text-center text-xs text-cea-medium mt-1">
              Licensed under Singapore Council for Estate Agencies (CEA) regulations.
              Data retention: 5 years as per PDPA requirements.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default CEAFooter