import { redirect } from 'next/navigation'
import { supabaseServer } from './supabase/server'

export async function requireCustomer() {
  const supabase = supabaseServer()

  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', auth.user.id)
    .single()

  if (!profile || profile.role !== 'customer') redirect('/app')

  return { supabase, user: auth.user }
}
