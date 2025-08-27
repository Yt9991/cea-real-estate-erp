import React, { useState } from 'react'
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import CEAStatusBadge from '../ui/CEAStatusBadge'

const CEAHeader = ({ title, showMenuButton = true, onMenuClick, user }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  // Mock user data - replace with actual user context
  const currentUser = user || {
    name: 'John Tan',
    email: 'john.tan@realestate.sg',
    role: 'agent',
    ceaRegNo: 'R123456A',
    avatar: null
  }
  
  const roleDisplay = {
    admin: 'Administrator',
    keo: 'Key Executive Officer',
    team_leader: 'Team Leader',
    agent: 'Licensed Agent'
  }
  
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-cea-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {showMenuButton && (
        <button
          type="button"
          className="-m-2.5 p-2.5 text-cea-medium lg:hidden"
          onClick={onMenuClick}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
      
      {/* Separator */}
      {showMenuButton && (
        <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />
      )}
      
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          {title && (
            <h1 className="text-lg font-semibold text-cea-dark">{title}</h1>
          )}
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-cea-medium hover:text-cea-dark"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
          
          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-md"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className="sr-only">Open user menu</span>
              {currentUser.avatar ? (
                <img
                  className="h-8 w-8 rounded-full bg-gray-50"
                  src={currentUser.avatar}
                  alt=""
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-cea-medium" />
              )}
              <span className="hidden lg:flex lg:items-center ml-3">
                <span className="text-sm font-semibold leading-6 text-cea-dark">
                  {currentUser.name}
                </span>
                <span className="ml-2 text-xs text-cea-medium">
                  {currentUser.ceaRegNo}
                </span>
                <CEAStatusBadge status="compliant" size="sm" className="ml-2" />
                <ChevronDownIcon className="ml-2 h-5 w-5 text-cea-medium" />
              </span>
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 z-10 mt-2.5 w-80 origin-top-right rounded-md bg-cea-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-cea-dark">{currentUser.name}</p>
                  <p className="text-sm text-cea-medium">{currentUser.email}</p>
                  <p className="text-xs text-cea-medium mt-1">
                    {roleDisplay[currentUser.role]} • {currentUser.ceaRegNo}
                  </p>
                  <div className="mt-2">
                    <CEAStatusBadge status="compliant" text="License Valid" size="sm" />
                  </div>
                </div>
                
                <div className="py-1">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-cea-dark hover:bg-gray-50">
                    <UserCircleIcon className="mr-3 h-4 w-4" />
                    Profile Settings
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-cea-dark hover:bg-gray-50">
                    <CogIcon className="mr-3 h-4 w-4" />
                    Preferences
                  </button>
                  <div className="border-t border-gray-200 mt-1 pt-1">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-cea-dark hover:bg-gray-50">
                      <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CEAHeader