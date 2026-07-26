import { createClient } from '@supabase/supabase-js'

/**
 * Create an administrative user from explicit environment variables.
 *
 * Required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - CLAR1TY_ADMIN_EMAIL
 * - CLAR1TY_ADMIN_PASSWORD
 *
 * Usage: npx tsx scripts/create-admin.ts
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmail = process.env.CLAR1TY_ADMIN_EMAIL
const adminPassword = process.env.CLAR1TY_ADMIN_PASSWORD
const adminName = process.env.CLAR1TY_ADMIN_NAME ?? 'Clar1ty Admin'

const missing = [
  ['NEXT_PUBLIC_SUPABASE_URL', supabaseUrl],
  ['SUPABASE_SERVICE_ROLE_KEY', supabaseServiceKey],
  ['CLAR1TY_ADMIN_EMAIL', adminEmail],
  ['CLAR1TY_ADMIN_PASSWORD', adminPassword],
]
  .filter(([, value]) => !value)
  .map(([name]) => name)

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
}

if (adminPassword!.length < 14) {
  throw new Error('CLAR1TY_ADMIN_PASSWORD must contain at least 14 characters')
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  console.log(`[Admin Setup] Creating administrative user: ${adminEmail}`)

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail!,
    password: adminPassword!,
    user_metadata: {
      full_name: adminName,
      role: 'admin',
    },
    email_confirm: true,
  })

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      console.log('[Admin Setup] User already exists')
      return
    }
    throw error
  }

  console.log('[Admin Setup] Administrative user created successfully')
  console.log('[Admin Setup] User ID:', data.user?.id)
}

createAdminUser().catch((error: unknown) => {
  console.error(
    '[Admin Setup] Failed:',
    error instanceof Error ? error.message : 'Unknown error',
  )
  process.exit(1)
})
