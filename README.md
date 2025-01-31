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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
