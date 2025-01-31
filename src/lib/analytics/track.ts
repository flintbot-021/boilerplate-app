'use client'

import posthog from 'posthog-js'

type EventName =
  | 'user_signed_up'
  | 'user_signed_in'
  | 'user_signed_out'
  | 'password_reset_requested'
  | 'organization_created'
  | 'user_invited'
  | 'user_role_updated'

interface TrackOptions {
  properties?: Record<string, any>
}

export function track(event: EventName, options: TrackOptions = {}) {
  if (typeof window === 'undefined') return

  try {
    posthog.capture(event, options.properties)
  } catch (error) {
    console.error('Error tracking event:', error)
  }
}

export function identify(userId: string, properties: Record<string, any> = {}) {
  if (typeof window === 'undefined') return

  try {
    posthog.identify(userId, properties)
  } catch (error) {
    console.error('Error identifying user:', error)
  }
}

export function reset() {
  if (typeof window === 'undefined') return

  try {
    posthog.reset()
  } catch (error) {
    console.error('Error resetting analytics:', error)
  }
} 