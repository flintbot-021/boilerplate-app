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

## Dependencies

### Core Dependencies
```bash
npm install next@latest react@latest react-dom@latest
```

### Authentication & Database
```bash
npm install @supabase/ssr @supabase/supabase-js
```

### UI & Components
```bash
npm install @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-toast
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate
npm install lucide-react
```

### Forms & Validation
```bash
npm install @hookform/resolvers react-hook-form zod
```

### Styling
```bash
npm install tailwindcss postcss autoprefixer
npm install @tailwindcss/typography
```

### Development Dependencies
```bash
npm install -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next
npm install -D prettier prettier-plugin-tailwindcss
```

### Optional Integrations
```bash
npm install @resend/node resend # For email functionality
npm install posthog-js # For analytics
npm install openai # For AI integration
```

### Complete Installation Command
```bash
npm install next@latest react@latest react-dom@latest @supabase/ssr @supabase/supabase-js @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-toast class-variance-authority clsx tailwind-merge tailwindcss-animate lucide-react @hookform/resolvers react-hook-form zod tailwindcss postcss autoprefixer @tailwindcss/typography @resend/node resend posthog-js openai && npm install -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next prettier prettier-plugin-tailwindcss
```

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
   - System verifies email through the `/auth/callback` route
   - User is automatically redirected to dashboard
   - Organization is created during first dashboard access

3. **Sign In**:
   - User signs in with email and password
   - System creates session using the new Supabase SSR package
   - Cookies are automatically handled by the middleware
   - User is redirected to dashboard

4. **Password Reset**:
   - User requests password reset
   - System sends reset email
   - User clicks reset link
   - User sets new password
   - User is redirected to sign in

### Important Notes

- The authentication system uses the new `@supabase/ssr` package for better integration with Next.js App Router
- Session management is handled automatically by middleware
- Cookie management is implemented in both client and server environments
- Auth state is checked in middleware, layouts, and protected routes
- Email verification and password reset use the `/auth/callback` route handler

### Important URLs

- `/auth/signup`: Sign up page
- `/auth/signin`: Sign in page
- `/auth/reset-password`: Password reset request
- `/auth/verify`: Email verification pending page
- `/auth/callback`: Auth callback handler for email verification and OAuth
- `/auth/error`: Error page for auth issues
- `/(app)/dashboard`: Main dashboard (protected route)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Important Notes

### Supabase Client Implementation

This project uses a custom Supabase client implementation that's compatible with Next.js 15's asynchronous cookies API. The implementation can be found in `src/lib/supabase/server.ts` and uses the following pattern:

```typescript
// Server-side Supabase client
export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        async setAll(cookiesToSet) {
          const resolvedCookiesStore = await cookieStore
          cookiesToSet.forEach(({ name, value, options }) =>
            resolvedCookiesStore.set(name, value, options)
          )
        }
      }
    }
  )
}
```

### Usage in Components

The Supabase client can be used in both server and client components:

#### Server Components
```typescript
// In server components
const supabase = createClient()
const { data } = await supabase.from('your_table').select()
```

#### Client Components
```typescript
// In client components
'use client'
import { useSupabase } from '@/app/supabase-provider'

export default function ClientComponent() {
  const supabase = useSupabase()
  // Use supabase client here
}
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```
