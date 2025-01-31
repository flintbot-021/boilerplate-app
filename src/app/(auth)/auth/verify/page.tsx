import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your email address',
}

export default function VerifyPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent you a verification link. Please check your email.
        </p>
      </div>
      <Button asChild>
        <Link href="/auth/signin">Back to sign in</Link>
      </Button>
    </div>
  )
} 