'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
})

const isDevelopment = process.env.NODE_ENV === 'development'

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      organizationName: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      console.log('Starting sign up process with values:', {
        email: values.email,
        fullName: values.fullName,
        organizationName: values.organizationName
      })
      
      // Store organization name in localStorage for after verification
      localStorage.setItem('pendingOrgName', values.organizationName)
      
      if (isDevelopment) {
        // In development, use sign in with email (no verification needed)
        const { error: signInError, data } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        })

        if (signInError) {
          // If sign in fails, it means user doesn't exist, so create them
          const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
              data: {
                full_name: values.fullName,
              },
              emailRedirectTo: undefined, // Disable email verification
            },
          })

          if (signUpError) {
            throw signUpError
          }

          if (!signUpData.user) {
            throw new Error('No user data returned')
          }

          // Create profile manually since trigger might not fire without email verification
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              full_name: values.fullName,
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
          }

          // Create organization
          const { error: orgError, data: orgData } = await supabase
            .from('organizations')
            .insert({
              name: values.organizationName,
              slug: values.organizationName.toLowerCase().replace(/\s+/g, '-'),
            })
            .select()
            .single()

          if (orgError) {
            console.error('Error creating organization:', orgError)
          } else if (orgData) {
            // Create organization membership
            await supabase
              .from('organization_members')
              .insert({
                organization_id: orgData.id,
                user_id: signUpData.user.id,
                role: 'owner',
              })
          }
        }

        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        // In production, use normal signup flow with email verification
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: values.fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (signUpError) {
          throw signUpError
        }

        if (!data.user) {
          throw new Error('No user data returned')
        }

        toast({
          title: 'Success',
          description: 'Please check your email to verify your account.',
        })
        router.push('/auth/verify')
      }
      
    } catch (error: any) {
      console.error('Sign up process failed:', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      })
      toast({
        title: 'Error',
        description: error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to create your account
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
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/auth/signin" className="hover:text-brand underline">
          Sign in
        </Link>
      </div>
    </div>
  )
} 