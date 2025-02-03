import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    const { data: tables, error: tablesError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('*')
      .eq('schemaname', 'public')
    if (tablesError) throw tablesError

    return NextResponse.json({
      status: 'success',
      user: user || null,
      tables: tables || [],
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
    }, { status: 500 })
  }
} 