import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'

interface AppLayoutProps {
  children: ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const cookieStore = cookies()
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/signin')
  }

  return <MainLayout>{children}</MainLayout>
} 