import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  // Initialize the Supabase client with the environment variables
  const supabase = createMiddlewareClient(
    { 
      req: request, 
      res 
    },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }
  )

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // PostHog analytics header commented out until needed
  /*
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    res.headers.set('x-posthog-key', process.env.NEXT_PUBLIC_POSTHOG_KEY)
  }
  */

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 