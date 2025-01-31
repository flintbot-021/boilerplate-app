import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function tryParseJson(str: string) {
  try {
    // First try parsing directly
    return JSON.parse(str)
  } catch (e) {
    try {
      // If that fails, try handling double-quoted string
      if (str.startsWith('"') && str.endsWith('"')) {
        // Remove outer quotes and unescape inner quotes
        const unquoted = str.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
        return JSON.parse(unquoted)
      }
      // If still no success, try URI decoding
      return JSON.parse(decodeURIComponent(str))
    } catch (error) {
      console.error('Error parsing JSON in middleware:', error)
      return null
    }
  }
}

export async function middleware(req: NextRequest) {
  try {
    console.log('🔒 Middleware processing request:', req.nextUrl.pathname)
    
    // Create a response object that we can modify
    const res = NextResponse.next()

    // Create the Supabase client
    const supabase = createMiddlewareClient({ req, res })

    // Debug cookie values before session check
    const allCookies = req.cookies.getAll()
    console.log('🍪 Incoming Cookies:', allCookies.map(c => ({
      name: c.name,
      value: c.value.substring(0, 50) + '...'
    })))

    // Refresh the session if needed - this will update the cookie if needed
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('❌ Middleware session error:', {
        message: error.message,
        status: error.status,
        code: error.code
      })
      throw error
    }

    // Get the current path
    const path = req.nextUrl.pathname

    console.log('📍 Current path:', path, 'Session:', session ? 'exists' : 'none')

    // Allow access to auth callback without redirection
    if (path === '/auth/callback') {
      console.log('✅ Allowing auth callback access')
      return res
    }

    // Handle auth pages
    if (path.startsWith('/auth')) {
      if (session) {
        console.log('🔄 User already authenticated, redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      console.log('✅ Allowing access to auth page')
      return res
    }

    // Handle protected routes
    if (!session && !path.startsWith('/auth')) {
      console.log('🔒 Protected route accessed without session, redirecting to signin')
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('redirectTo', path)
      return NextResponse.redirect(redirectUrl)
    }

    // Return the response with the session
    console.log('✅ Request authorized, proceeding')
    return res
  } catch (e) {
    console.error('❌ Middleware error:', e)
    // On error, redirect to sign in
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }
}

// Specify which routes this middleware should run for
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
} 