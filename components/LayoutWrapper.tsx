'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar-fixed'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // No mostrar sidebar en login
  const showSidebar = pathname !== '/login'
  
  if (showSidebar) {
    return <Sidebar>{children}</Sidebar>
  }
  
  return <>{children}</>
}
