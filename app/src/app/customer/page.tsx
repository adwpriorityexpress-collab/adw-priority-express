import Link from 'next/link'
import { requireCustomer } from '@/lib/requireCustomer'

export default async function CustomerDashboard() {
  const { supabase, user } = await requireCustomer()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: 24 }}>
      <h1>Customer Dashboard</h1>

      <Link href="/customer/jobs/new">Create Job</Link>

      <ul>
        {(jobs ?? []).map(job => (
          <li key={job.id}>
            <Link href={`/customer/jobs/${job.id}`}>
              {job.pickup_postcode} → {job.dropoff_postcode} ({job.status})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
