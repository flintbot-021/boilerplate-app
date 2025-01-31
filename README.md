# Next.js Boilerplate with Supabase, Tailwind, and Essential SaaS Tools

A production-ready Next.js boilerplate featuring authentication, organization structure, and essential SaaS integrations.

## Features

- 🔐 Authentication with Supabase (Sign up, Sign in, Reset password)
- 👥 Organization and role-based structure
- 🎨 UI Components with Tailwind CSS and shadcn/ui
- 📧 Email integration with Resend
- 📊 Analytics with PostHog
- 🤖 OpenAI integration ready
- 🚀 Deployment-ready for Vercel

## Tech Stack

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Resend](https://resend.com)
- [PostHog](https://posthog.com)
- [OpenAI](https://openai.com)
- [Vercel](https://vercel.com)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account
- A Resend account
- A PostHog account
- An OpenAI account (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nextjs-boilerplate.git
   cd nextjs-boilerplate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update the environment variables in `.env.local` with your own values

5. Set up the database:
   - Create a new Supabase project
   - Go to the SQL editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Run the SQL queries to create the database schema

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                   # App router pages
├── components/           
│   ├── layout/           # Layout components
│   ├── shared/           # Shared components
│   └── ui/               # UI components (shadcn)
├── features/             
│   ├── auth/             # Authentication
│   ├── dashboard/        # Dashboard
│   ├── organization/     # Organization management
│   └── settings/         # User/org settings
├── lib/                  
│   ├── supabase/         # Supabase client & utilities
│   ├── email/            # Email utilities
│   └── analytics/        # Analytics utilities
└── types/                # TypeScript types
```

## Database Schema

### Tables

1. `organizations`
   - `id`: UUID (Primary Key)
   - `name`: VARCHAR(255)
   - `slug`: VARCHAR(255) UNIQUE
   - `created_at`: TIMESTAMP
   - `updated_at`: TIMESTAMP

2. `profiles` (extends Supabase auth.users)
   - `id`: UUID (Primary Key, references auth.users)
   - `full_name`: VARCHAR(255)
   - `avatar_url`: VARCHAR(255)
   - `created_at`: TIMESTAMP
   - `updated_at`: TIMESTAMP

3. `organization_members`
   - `id`: UUID (Primary Key)
   - `organization_id`: UUID (references organizations)
   - `user_id`: UUID (references auth.users)
   - `role`: VARCHAR(50) ('owner', 'admin', 'user')
   - `created_at`: TIMESTAMP
   - `updated_at`: TIMESTAMP

### Security Features

- Row Level Security (RLS) enabled on all tables
- Policies for:
  - Profile access and updates
  - Organization visibility and management
  - Organization member management
- Automatic timestamps for created_at/updated_at
- Automatic profile creation on user signup

### Relationships

- One-to-Many: User -> Organizations (through organization_members)
- One-to-Many: Organization -> Users (through organization_members)
- One-to-One: User -> Profile

## Supabase Setup

### Database Setup

1. Create a new Supabase project
2. Copy your project URL and anon key to your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Database Schema

The application requires several tables and functions to be set up in Supabase. To set these up:

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the entire contents of `supabase/schema.sql`
3. Run the SQL script

The schema will create:
- `profiles` table (extends Supabase auth.users)
- `organizations` table
- `organization_members` table
- Row Level Security (RLS) policies
- Necessary triggers and functions

### Important Notes

1. **Initial Setup**: Make sure to run the schema SQL before attempting to sign up users. The schema creates:
   - Required tables
   - RLS policies
   - The `handle_new_user` trigger for automatic profile creation

2. **Troubleshooting**:
   - If you encounter "Database error saving new user" during signup, ensure you've run the complete schema SQL
   - If tables appear "Not accessible" in tests but exist, this is normal when not authenticated
   - The schema includes error handling to prevent signup failures even if profile creation encounters issues
   - If you encounter cookie-related authentication issues:
     - Ensure the cookie name in `src/lib/supabase/client.ts` matches your Supabase project reference: `sb-[reference]-auth-token`
     - Cookie settings should include: `path: '/'`, `domain: 'localhost'` (in development), and `sameSite: 'lax'`
     - For Next.js server components, use `cookies()` from `next/headers` with `createServerComponentClient({ cookies: () => cookieStore })`
     - Clear browser cookies and local storage when testing authentication changes

3. **Testing the Setup**:
   - Visit `/test` to check connection status
   - Visit `/api/test-supabase` for raw connection details
   - Both endpoints will show table accessibility and current session status

4. **Security**:
   - RLS is enabled by default on all tables
   - Users can only access their own profiles
   - Organization access is restricted to members
   - Organization management is restricted to owners/admins

## Authentication Flow

1. **Sign Up**:
   - User fills out the sign-up form with email, password, name, and organization
   - System creates user account and sends confirmation email
   - User is redirected to verification page

2. **Email Confirmation**:
   - User clicks confirmation link in email
   - System verifies email and creates session
   - User is automatically redirected to dashboard
   - Organization is created during first dashboard access

3. **Sign In**:
   - User signs in with email and password
   - System creates session
   - User is redirected to dashboard

4. **Password Reset**:
   - User requests password reset
   - System sends reset email
   - User clicks reset link
   - User sets new password
   - User is redirected to sign in

### Important URLs

- `/auth/signup`: Sign up page
- `/auth/signin`: Sign in page
- `/auth/reset-password`: Password reset request
- `/auth/verify`: Email verification pending page
- `/(app)/dashboard`: Main dashboard (protected route)
- `/auth/error`: Error page for auth issues

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
