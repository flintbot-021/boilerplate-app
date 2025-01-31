'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      console.log('🚀 Starting sign in process...', { email: values.email })

      // Attempt to sign in
      console.log('📝 Attempting to sign in with Supabase...')
      const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (signInError) {
        console.log('❌ Sign in error:', {
          message: signInError.message,
          status: signInError.status,
          code: signInError.code
        })
        throw signInError
      }

      if (!signInData.user) {
        console.log('❌ No user data returned')
        throw new Error('No user data returned')
      }

      console.log('✅ Sign in successful:', {
        user: signInData.user.id,
        email: signInData.user.email,
        emailConfirmed: signInData.user.email_confirmed_at,
        lastSignIn: signInData.user.last_sign_in_at
      })

      // Wait a moment for the session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500))

      // Verify session
      console.log('📝 Getting current session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.log('❌ Session error:', {
          message: sessionError.message,
          status: sessionError.status,
          code: sessionError.code
        })
        throw sessionError
      }

      if (!session) {
        console.log('❌ No session found after sign in')
        throw new Error('No session found after sign in')
      }

      console.log('✅ Session confirmed:', {
        user: session.user.id,
        expires: session.expires_at,
        provider: session.user.app_metadata.provider
      })

      // Show success message
      toast({
        title: 'Success',
        description: 'Signed in successfully.',
      })

      // Get the redirect URL from search params or default to dashboard
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      console.log('🚀 Redirecting to:', redirectTo)

      // Wait a moment for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Use window.location for a full page reload to ensure cookies are properly set
      console.log('📝 Performing full page reload to:', redirectTo)
      window.location.href = redirectTo
    } catch (error: any) {
      console.log('❌ SIGNIN PROCESS FAILED:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        status: error?.status,
        name: error?.name,
        stack: error?.stack
      })
      
      toast({
        title: 'Error',
        description: error?.message || 'Invalid email or password',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to sign in to your account
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        <Link href="/auth/reset-password" className="hover:text-brand underline">
          Forgot password?
        </Link>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="hover:text-brand underline">
          Sign up
        </Link>
      </div>
    </div>
  )
} 