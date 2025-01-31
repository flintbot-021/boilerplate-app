import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a client that uses cookies by default
export const supabase = createClientComponentClient({
  cookieOptions: {
    name: 'sb-auth-token',
    path: '/',
    domain: 'localhost',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}) 