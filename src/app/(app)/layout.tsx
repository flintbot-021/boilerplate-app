import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'

interface AppLayoutProps {
  children: ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  console.log('🔒 Checking session in app layout...')
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('❌ Error checking session in app layout:', {
      message: error.message,
      status: error.status,
      code: error.code
    })
    redirect('/auth/signin')
  }

  if (!session) {
    console.log('❌ No session found in app layout, redirecting to signin')
    redirect('/auth/signin')
  }

  console.log('✅ Session valid in app layout:', {
    user: session.user.id,
    email: session.user.email,
    expires: session.expires_at
  })

  return <MainLayout>{children}</MainLayout>
} 