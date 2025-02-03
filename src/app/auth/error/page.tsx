'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
      <p className="text-muted-foreground text-center max-w-md">
        There was a problem with the authentication process. This could be due to an expired or invalid link.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  )
} 