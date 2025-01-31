-- Create organizations table
CREATE TABLE organizations (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create profiles table (extends Supabase auth.users)
DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(255),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create organization_members table (joins users and organizations)
CREATE TABLE organization_members (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE (organization_id, user_id)
);

-- Create RLS (Row Level Security) policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Organizations policies
DROP POLICY IF EXISTS "Organization members can view their organizations" ON organizations;
CREATE POLICY "Organization members can view their organizations"
    ON organizations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Only organization owners and admins can update organizations" ON organizations;
CREATE POLICY "Only organization owners and admins can update organizations"
    ON organizations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "Users can create organizations"
    ON organizations 
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Organization members policies
DROP POLICY IF EXISTS "Organization members can view other members" ON organization_members;
CREATE POLICY "Organization members can view other members"
    ON organization_members FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can create organization memberships" ON organization_members;
CREATE POLICY "Users can create organization memberships"
    ON organization_members
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Temporarily disable RLS for debugging
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;

-- Create functions and triggers

-- Function to handle updating timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Function to create a profile after user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    _full_name text;
BEGIN
    -- Log the incoming data
    RAISE LOG 'handle_new_user() called with user_id: %, email: %, metadata: %', 
        NEW.id, 
        NEW.email,
        NEW.raw_user_meta_data;

    -- Get the full name from metadata or use email
    _full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    -- Log the full name we're going to use
    RAISE LOG 'Using full_name: %', _full_name;

    -- Simple insert without extra checks
    INSERT INTO public.profiles (
        id,
        full_name,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        _full_name,
        now(),
        now()
    );

    -- Log success
    RAISE LOG 'Profile created successfully for user_id: %', NEW.id;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    RAISE LOG 'Error in handle_new_user(): % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

-- Recreate the trigger
CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user(); 