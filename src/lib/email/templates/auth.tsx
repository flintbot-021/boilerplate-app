interface EmailTemplateProps {
  firstName: string
  actionUrl: string
}

export function WelcomeEmailTemplate({
  firstName,
  actionUrl,
}: EmailTemplateProps) {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}!</h1>
        <p>Hi ${firstName},</p>
        <p>Thanks for signing up. Please verify your email address by clicking the button below:</p>
        <a href="${actionUrl}" style="
          background-color: #000;
          border-radius: 4px;
          color: #fff;
          display: inline-block;
          padding: 12px 24px;
          text-decoration: none;
          text-align: center;
        ">
          Verify Email Address
        </a>
      </body>
    </html>
  `
}

export function ResetPasswordEmailTemplate({
  firstName,
  actionUrl,
}: EmailTemplateProps) {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Reset Your Password</h1>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
        <a href="${actionUrl}" style="
          background-color: #000;
          border-radius: 4px;
          color: #fff;
          display: inline-block;
          padding: 12px 24px;
          text-decoration: none;
          text-align: center;
        ">
          Reset Password
        </a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </body>
    </html>
  `
} 