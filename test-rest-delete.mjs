import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

async function testDelete() {
  const { error } = await supabase.from('orders').delete().eq('customer_email', 'test@test.com')
  if (error) {
    console.error('REST DELETE ERROR:', error)
  } else {
    console.log('REST DELETE SUCCESS')
  }
}
testDelete()
