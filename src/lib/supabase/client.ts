import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl as string,
    supabaseAnonKey as string,
    {
      cookies: {
        get(name: string) {
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
          return cookie ? cookie.split('=')[1] : ''
        },
        set(name: string, value: string, options: any) {
          document.cookie = `${name}=${value}; path=${options.path ?? '/'
            }; max-age=${options.maxAge ?? 315360000
            }; SameSite=${options.sameSite ?? 'Lax'
            }${options.secure ? '; Secure' : ''
            }${options.domain ? `; domain=${options.domain}` : ''}`
        },
        remove(name: string, options: any) {
          document.cookie = `${name}=; path=${options.path ?? '/'
            }; expires=Thu, 01 Jan 1970 00:00:00 GMT${options.domain ? `; domain=${options.domain}` : ''
            }`
        },
      },
    }
  )
}

// Create a singleton instance for use in client components
export const supabase = createClient() 