import React, { useState } from 'react'
import CEAHeader from './CEAHeader'
import CEASidebar from './CEASidebar'
import CEAFooter from './CEAFooter'

const CEALayout = ({ children, title, showSidebar = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  return (
    <div className="min-h-screen bg-cea-bg">
      {showSidebar && (
        <CEASidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen} 
        />
      )}
      
      <div className={showSidebar ? 'lg:pl-72' : ''}>
        <CEAHeader 
          title={title}
          showMenuButton={showSidebar}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        
        <CEAFooter />
      </div>
    </div>
  )
}

export default CEALayout