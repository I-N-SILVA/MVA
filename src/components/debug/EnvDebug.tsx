'use client'

/**
 * Debug component to check environment variables
 * Remove this component after fixing the redirect issue
 */

export function EnvDebug() {
  const envVars = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs font-mono max-w-md overflow-auto z-50">
      <h3 className="font-bold mb-2 text-yellow-300">🔍 ENV DEBUG (Remove after fix)</h3>
      <div className="space-y-1">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key}>
            <span className="text-blue-300">{key}:</span>{' '}
            <span className={value?.includes('localhost') ? 'text-red-300' : 'text-green-300'}>
              {value || 'undefined'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="text-yellow-300">Current URL:</div>
        <div className="text-green-300">{typeof window !== 'undefined' ? window.location.origin : 'server'}</div>
      </div>
    </div>
  )
}