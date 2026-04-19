import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Debug API called')
    
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    }

    return NextResponse.json({ 
      message: 'Debug API working',
      environment: envVars,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Debug API error:', error)
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
