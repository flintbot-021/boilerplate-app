'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
}

interface Organization {
  id: string
  name: string
  slug: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('User fetch error:', userError)
          throw userError
        }
        
        if (!user) {
          console.error('No user found')
          router.replace('/auth/signin')
          return
        }

        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          throw profileError
        }
        
        if (!profileData) {
          // Create profile if it doesn't exist
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata.full_name || user.email?.split('@')[0],
            })
          
          if (createProfileError) {
            throw createProfileError
          }
          
          // Fetch the newly created profile
          const { data: newProfile, error: newProfileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            
          if (newProfileError) throw newProfileError
          setProfile(newProfile)
        } else {
          setProfile(profileData)
        }

        // Get organization where user is a member
        const { data: orgMemberData, error: orgMemberError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single()

        if (orgMemberError) {
          console.error('Organization member fetch error:', orgMemberError)
          throw orgMemberError
        }

        // Get organization details
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgMemberData.organization_id)
          .single()

        if (orgError) {
          console.error('Organization fetch error:', orgError)
          throw orgError
        }
        
        setOrganization(orgData)
      } catch (error: any) {
        console.error('Error loading dashboard data:', error)
        toast({
          title: 'Error',
          description: error?.message || 'Failed to load dashboard data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase, router, toast])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Loading...</h1>
        <p className="text-muted-foreground">Please wait while we fetch your dashboard</p>
      </div>
    )
  }

  if (!profile || !organization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-muted-foreground">Unable to load dashboard data</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Welcome, {profile.full_name}</h1>
          <p className="text-muted-foreground text-lg">
            Organization: {organization.name}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.full_name}</div>
              <p className="text-xs text-muted-foreground mt-1">
                User Profile
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organization.name}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {organization.slug}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Owner</div>
              <p className="text-xs text-muted-foreground mt-1">
                Organization Role
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground mt-1">
                Account Status
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 