'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/hooks/use-toast'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback handler...')
        
        // Check for code first (OAuth, magic link, etc.)
        const code = searchParams.get('code')
        console.log('Auth code:', code ? 'Present' : 'Not present')

        if (code) {
          console.log('Handling code-based auth...')
          // Handle code-based auth
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError)
            throw exchangeError
          }
        } else {
          console.log('Checking for hash-based auth...')
          // Check for hash-based auth (email confirmation)
          const hash = window.location.hash
          if (!hash) {
            console.error('No hash found in URL')
            throw new Error('No authentication parameters found')
          }

          // Parse the hash fragment
          const hashParams = new URLSearchParams(hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          console.log('Tokens present:', {
            accessToken: !!accessToken,
            refreshToken: !!refreshToken
          })

          if (!accessToken || !refreshToken) {
            throw new Error('Missing authentication tokens')
          }

          console.log('Setting session with tokens...')
          // Set the session
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            console.error('Session error:', sessionError)
            throw sessionError
          }
        }

        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error('User fetch error:', userError)
          throw userError
        }
        if (!user) {
          console.error('No user found after authentication')
          throw new Error('No user found')
        }

        console.log('User authenticated:', {
          id: user.id,
          email: user.email,
          emailConfirmed: user.email_confirmed_at
        })

        // Check if profile exists, create if it doesn't
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.log('Profile not found, creating...')
          // Create profile
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata.full_name || user.email?.split('@')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (createProfileError) {
            console.error('Error creating profile:', createProfileError)
            throw createProfileError
          }
          console.log('Profile created successfully')
        } else {
          console.log('Existing profile found:', existingProfile)
        }

        // Create organization
        const pendingOrgName = localStorage.getItem('pendingOrgName')
        console.log('Pending organization:', pendingOrgName)
        
        if (pendingOrgName) {
          console.log('Creating organization...')
          try {
            // First create the organization
            const { error: orgError, data: orgData } = await supabase
              .from('organizations')
              .insert({
                name: pendingOrgName,
                slug: pendingOrgName.toLowerCase().replace(/\s+/g, '-'),
              })
              .select()
              .single()

            if (orgError) {
              console.error('Organization creation error:', {
                message: orgError.message,
                details: orgError.details,
                hint: orgError.hint,
                code: orgError.code
              })
              throw orgError
            }

            if (!orgData) {
              console.error('No organization data returned')
              throw new Error('Failed to create organization')
            }

            console.log('Organization created:', orgData)

            // Then create the owner membership
            const { error: memberError } = await supabase
              .from('organization_members')
              .insert({
                organization_id: orgData.id,
                user_id: user.id,
                role: 'owner',
              })
              .select()

            if (memberError) {
              console.error('Member creation error:', {
                message: memberError.message,
                details: memberError.details,
                hint: memberError.hint,
                code: memberError.code
              })
              throw memberError
            }

            console.log('Organization membership created')
            localStorage.removeItem('pendingOrgName')
          } catch (orgError: any) {
            console.error('Organization setup failed:', {
              message: orgError.message,
              details: orgError.details,
              hint: orgError.hint,
              code: orgError.code,
              status: orgError.status
            })
            throw new Error(`Failed to set up organization: ${orgError.message || 'Unknown error'}`)
          }
        }

        // Show success message
        toast({
          title: 'Success',
          description: 'Authentication successful.',
        })

        // Wait for session to be fully set
        console.log('Waiting for session to settle...')
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Use window.location for a full page reload
        console.log('Redirecting to dashboard...')
        window.location.href = '/dashboard'
      } catch (error) {
        console.error('Auth callback error:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          details: error instanceof Object ? JSON.stringify(error) : undefined
        })
        
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Authentication failed',
          variant: 'destructive',
        })
        router.push('/auth/error')
      }
    }

    handleCallback()
  }, [searchParams, router, toast, supabase])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verifying your authentication...
          </h1>
          <p className="text-sm text-muted-foreground">
            Please wait while we complete the process.
          </p>
        </div>
      </div>
    </div>
  )
} 