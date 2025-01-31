import { Metadata } from 'next'
import { SignUpForm } from '@/features/auth/components/sign-up-form'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new account',
}

export default function SignUpPage() {
  return <SignUpForm />
} 