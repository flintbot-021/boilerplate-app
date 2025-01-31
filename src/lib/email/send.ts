import { resend } from './client'
import { WelcomeEmailTemplate, ResetPasswordEmailTemplate } from './templates/auth'

interface SendEmailOptions {
  to: string
  firstName: string
  actionUrl: string
}

export async function sendWelcomeEmail({ to, firstName, actionUrl }: SendEmailOptions) {
  try {
    await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_APP_NAME} <noreply@${process.env.NEXT_PUBLIC_APP_URL}>`,
      to,
      subject: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}`,
      html: WelcomeEmailTemplate({ firstName, actionUrl }),
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw error
  }
}

export async function sendPasswordResetEmail({ to, firstName, actionUrl }: SendEmailOptions) {
  try {
    await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_APP_NAME} <noreply@${process.env.NEXT_PUBLIC_APP_URL}>`,
      to,
      subject: 'Reset your password',
      html: ResetPasswordEmailTemplate({ firstName, actionUrl }),
    })
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw error
  }
} 