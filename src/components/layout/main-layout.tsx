import { ReactNode } from 'react'
import { MainNav } from './main-nav'
import { UserNav } from './user-nav'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full flex h-16 items-center px-4 sm:px-8">
          <MainNav />
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="w-full px-4 sm:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
} 