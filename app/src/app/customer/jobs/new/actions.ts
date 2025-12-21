'use server'

import { redirect } from 'next/navigation'
import { requireCustomer } from '@/lib/requireCustomer'

export async function createJob(formData: FormData) {
  const { supabase, user } = await requireCustomer()

  const pickup = String(formData.get('pickup_postcode'))
  const dropoff = String(formData.get('dropoff_postcode'))

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      customer_id: user.id,
      pickup_postcode: pickup,
      dropoff_postcode: dropoff,
      status: 'open',
      vehicle_type: 'small_van',
    })
    .select('id')
    .single()

  if (error) throw error

  redirect(`/customer/jobs/${data.id}`)
}
