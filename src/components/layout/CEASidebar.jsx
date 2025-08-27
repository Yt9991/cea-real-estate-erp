import React from 'react'
import { 
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import CEAStatusBadge from '../ui/CEAStatusBadge'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
  { 
    name: 'Profiles', 
    icon: UserGroupIcon, 
    children: [
      { name: 'Agent Profiles', href: '/profiles/agents' },
      { name: 'Client Profiles', href: '/profiles/clients' },
      { name: 'Property Profiles', href: '/profiles/properties' }
    ]
  },
  { 
    name: 'Forms & Documents', 
    icon: DocumentTextIcon, 
    children: [
      { name: 'Generate Forms', href: '/forms/generate' },
      { name: 'Pending Signatures', href: '/forms/pending', badge: { status: 'warning', count: 3 } },
      { name: 'Completed Forms', href: '/forms/completed' },
      { name: 'Form Templates', href: '/forms/templates' }
    ]
  },
  { 
    name: 'Compliance', 
    icon: ShieldCheckIcon,
    badge: { status: 'compliant' },
    children: [
      { name: 'AML/CFT Checks', href: '/compliance/aml' },
      { name: 'CDD Verification', href: '/compliance/cdd' },
      { name: 'STR Reports', href: '/compliance/str' },
      { name: 'Audit Trail', href: '/compliance/audit' }
    ]
  },
  { 
    name: 'CPD Management', 
    icon: AcademicCapIcon,
    badge: { status: 'warning', text: '8/16 Credits' },
    children: [
      { name: 'My CPD Status', href: '/cpd/status' },
      { name: 'Course Catalog', href: '/cpd/courses' },
      { name: 'Enrollments', href: '/cpd/enrollments' },
      { name: 'Certificates', href: '/cpd/certificates' }
    ]
  },
  { name: 'Reports & Analytics', href: '/reports', icon: ChartBarIcon }
]

const adminNavigation = [
  { name: 'User Management', href: '/admin/users', icon: UserIcon },
  { name: 'Agency Settings', href: '/admin/agency', icon: BuildingOfficeIcon },
  { name: 'System Settings', href: '/admin/settings', icon: CogIcon }
]

const CEASidebar = ({ open, setOpen }) => {
  const currentPath = window.location.pathname
  
  const NavigationItem = ({ item, isChild = false }) => {
    const isActive = item.href === currentPath || 
      (item.children && item.children.some(child => child.href === currentPath))
    
    const baseClasses = isChild 
      ? 'group flex gap-x-3 rounded-md p-2 pl-8 text-sm leading-6 font-medium'
      : 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium'
    
    const activeClasses = isActive
      ? 'bg-cea-light text-cea-white'
      : 'text-cea-medium hover:text-cea-dark hover:bg-gray-50'
    
    return (
      <li>
        <a
          href={item.href || '#'}
          className={`${baseClasses} ${activeClasses}`}
        >
          {item.icon && (
            <item.icon
              className={`h-6 w-6 shrink-0 ${isActive ? 'text-cea-white' : 'text-cea-medium group-hover:text-cea-dark'}`}
              aria-hidden="true"
            />
          )}
          {item.name}
          {item.badge && (
            <CEAStatusBadge 
              status={item.badge.status} 
              text={item.badge.text || item.badge.count}
              size="sm" 
              className="ml-auto"
            />
          )}
        </a>
        {item.children && (
          <ul className="mt-1 space-y-1">
            {item.children.map((child) => (
              <NavigationItem key={child.name} item={child} isChild />
            ))}
          </ul>
        )}
      </li>
    )
  }
  
  return (
    <>
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${open ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setOpen(false)} />
        
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button type="button" className="-m-2.5 p-2.5" onClick={() => setOpen(false)}>
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  )
  
  function SidebarContent() {
    return (
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-cea-white px-6 pb-4 shadow-sm border-r border-gray-200">
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cea-light">
              <BuildingOfficeIcon className="h-5 w-5 text-cea-white" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-cea-dark">CEA ERP</h2>
              <p className="text-xs text-cea-medium">Real Estate Management</p>
            </div>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <NavigationItem key={item.name} item={item} />
                ))}
              </ul>
            </li>
            
            <li>
              <div className="text-xs font-semibold leading-6 text-cea-medium uppercase tracking-wide">
                Administration
              </div>
              <ul className="-mx-2 mt-2 space-y-1">
                {adminNavigation.map((item) => (
                  <NavigationItem key={item.name} item={item} />
                ))}
              </ul>
            </li>
            
            <li className="mt-auto">
              <div className="rounded-lg bg-cea-bg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-cea-dark">Compliance Status</span>
                  <CEAStatusBadge status="compliant" size="sm" />
                </div>
                <p className="text-xs text-cea-medium">
                  All systems operational. Last audit: Jan 2025
                </p>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    )
  }
}

export default CEASidebar