import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'

export default async function DashboardTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('🔒 Checking session in dashboard template...')
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('❌ Error checking session:', {
      message: error.message,
      status: error.status,
      code: error.code
    })
    redirect('/auth/signin')
  }

  if (!session) {
    console.log('❌ No session found in dashboard template, redirecting to signin')
    redirect('/auth/signin')
  }

  console.log('✅ Session valid in dashboard template:', {
    user: session.user.id,
    email: session.user.email,
    expires: session.expires_at
  })

  return <>{children}</>
} 