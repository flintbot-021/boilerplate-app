import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface AuthLayoutProps {
  children: ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is already authenticated and tries to access auth pages,
  // redirect them to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          {process.env.NEXT_PUBLIC_APP_NAME}
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This boilerplate has saved me countless hours of work and
              helped me deliver stunning products to my clients faster than
              ever before.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
    </div>
  )
} 