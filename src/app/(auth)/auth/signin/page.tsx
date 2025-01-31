import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { SignInForm } from '@/features/auth/components/sign-in-form'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
}

export default async function SignInPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  // If user is already authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return <SignInForm />
} 