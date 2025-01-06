'use client'

import React, { useEffect } from 'react'
import Navbar from './includes/Navbar'
import SideNav from './includes/SideNav'
import { usePathname, useSearchParams } from 'next/navigation'
import { SidebarProvider } from '@/context/SidebarContext'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname()
  const paths = [
    '/',
    '/live',
    '/schedule',
    '/schedule/details/:id',
    '/uploads',
    '/profile/:id',
    '/posts/:id',
    '/courses',
    '/courses/:id',
    '/course/:id',
    '/streaming/:id',
    '/video-conferencing',
    '/video-conferencing/waiting-room',
    '/video-conferencing/waiting-room/:channelName',
    '/video-conferencing/schedule',
    '/video-conferencing/live',
    '/market-place',
    '/classroom/overview',
    '/classroom/courses',
    '/classroom/trainee',
    '/classroom/messaging',
    '/classroom/communities',
    '/classroom/analytics',
    '/classroom/my-learning'
  ]

  const isPathIncluded = paths.some(path => {
    const regex = new RegExp(
      `^${path.replace(/:[^/]+/g, '[^/]+').replace(/\*/g, '.*')}$`
    )
    return regex.test(pathname || '')
  })

  return (
    <SidebarProvider>
      {isPathIncluded ? (
        <div className="flex h-screen bg-gray-50 pb-14 overflow-hidden">
          <aside className="fixed left-0 top-0 h-full z-50">
            <SideNav />
          </aside>

          <div className="flex-1 lg:ml-64">
            <header className="fixed top-0 right-0 left-0 lg:left-64 z-30">
              <Navbar />
            </header>
            <main className="relative h-full mt-16 overflow-y-auto">
              <div className="p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </SidebarProvider>
  )
}