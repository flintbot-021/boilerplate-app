'use client'

import { ReactNode } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as Provider } from 'posthog-js/react'

// Commented out PostHog initialization until it's needed
/*
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    },
  })
}
*/

export function PostHogProvider({ children }: { children: ReactNode }) {
  // Just render children without PostHog for now
  return <>{children}</>
} 