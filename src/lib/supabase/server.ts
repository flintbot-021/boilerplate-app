import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        async setAll(cookiesToSet) {
          try {
            const resolvedCookiesStore = await cookieStore
            cookiesToSet.forEach(({ name, value, options }) =>
              resolvedCookiesStore.set(name, value, options)
            )
          } catch (error) {
            // Handle cookie setting error
            console.error('Error setting cookies:', error)
          }
        }
      }
    }
  )
} 