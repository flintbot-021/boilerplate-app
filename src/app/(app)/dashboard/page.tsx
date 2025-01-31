'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadData() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No user found')

        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        // Get organization where user is a member
        const { data: orgMemberData, error: orgMemberError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single()

        if (orgMemberError) throw orgMemberError

        // Get organization details
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgMemberData.organization_id)
          .single()

        if (orgError) throw orgError
        setOrganization(orgData)

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-4 mb-8">
        <h1 className="text-2xl font-bold">Welcome, {profile?.full_name}</h1>
        {organization && (
          <p className="text-muted-foreground">
            Organization: {organization.name}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.full_name}</div>
            <p className="text-xs text-muted-foreground">
              User Profile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization?.name}</div>
            <p className="text-xs text-muted-foreground">
              {organization?.slug}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Owner</div>
            <p className="text-xs text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
              Account Status
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 