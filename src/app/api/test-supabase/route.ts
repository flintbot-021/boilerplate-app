import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Test each table individually
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    const { error: orgsError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)

    const { error: membersError } = await supabase
      .from('organization_members')
      .select('id')
      .limit(1)

    const tableStatus = {
      profiles: !profilesError,
      organizations: !orgsError,
      organization_members: !membersError
    }

    // Test auth connection
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Auth connection error',
        details: sessionError 
      }, { status: 500 })
    }

    // Test environment variables
    const config = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    }

    // Check for any inaccessible tables
    const inaccessibleTables = Object.entries(tableStatus)
      .filter(([_, isAccessible]) => !isAccessible)
      .map(([tableName]) => tableName)

    return NextResponse.json({
      success: inaccessibleTables.length === 0,
      message: inaccessibleTables.length === 0 
        ? 'Supabase connection successful' 
        : 'Some tables are not accessible',
      tableStatus,
      inaccessibleTables,
      session: session ? 'Active' : 'None',
      config
    })
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Connection test failed',
      details: error
    }, { status: 500 })
  }
} 