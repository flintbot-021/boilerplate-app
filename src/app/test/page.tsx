'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

export default function TestPage() {
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    try {
      // Log Supabase config
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

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
        throw new Error('Auth connection error: ' + sessionError.message)
      }

      // Check for any inaccessible tables
      const inaccessibleTables = Object.entries(tableStatus)
        .filter(([_, isAccessible]) => !isAccessible)
        .map(([tableName]) => tableName)

      setResults({
        success: inaccessibleTables.length === 0,
        message: inaccessibleTables.length === 0 
          ? 'Supabase connection successful' 
          : 'Some tables are not accessible',
        tableStatus,
        inaccessibleTables,
        session: session ? 'Active' : 'None',
        config: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        }
      })
    } catch (err) {
      console.error('Test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <Button onClick={testConnection} disabled={loading}>
        {loading ? 'Testing...' : 'Test Connection'}
      </Button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {results && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          <div className={`p-4 rounded ${results.success ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <p className="font-medium">{results.message}</p>
            
            <h3 className="font-semibold mt-4 mb-2">Table Status:</h3>
            {Object.entries(results.tableStatus).map(([table, isAccessible]) => (
              <div key={table} className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full ${isAccessible ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{table}: {isAccessible ? 'Accessible' : 'Not accessible'}</span>
              </div>
            ))}

            <h3 className="font-semibold mt-4 mb-2">Session Status:</h3>
            <p>{results.session}</p>

            <h3 className="font-semibold mt-4 mb-2">Configuration:</h3>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(results.config, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
} 