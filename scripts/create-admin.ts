import { createClient } from '@supabase/supabase-js'

/**
 * Create admin user for Clar1ty AI
 * Usage: npx ts-node scripts/create-admin.ts
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uikvqvqkwgtwiyzttxgv.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  console.log('[Admin Setup] Creating admin user: admn@clar1ty.art')

  try {
    // Create user with admin API (service role key)
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admn@clar1ty.art',
      password: 'c4rlit0s',
      user_metadata: {
        full_name: 'Clar1ty Admin',
      },
      email_confirm: true, // Mark email as confirmed (no confirmation needed)
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('[Admin Setup] User already exists ✓')
        return
      }
      throw error
    }

    console.log('[Admin Setup] Admin user created successfully ✓')
    console.log('[Admin Setup] Email: admn@clar1ty.art')
    console.log('[Admin Setup] Password: c4rlit0s')
    console.log('[Admin Setup] User ID:', data.user?.id)
  } catch (error) {
    console.error('[Admin Setup] Error creating admin user:', error)
    process.exit(1)
  }
}

createAdminUser()
