import { requireCustomer } from '@/lib/requireCustomer'

export default async function JobDetail({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireCustomer()

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.id)
    .eq('customer_id', user.id)
    .single()

  if (!job) return <div>Job not found</div>

  return (
    <div style={{ padding: 24 }}>
      <h1>{job.pickup_postcode} → {job.dropoff_postcode}</h1>
      <p>Status: {job.status}</p>
    </div>
  )
}
