import { createJob } from './actions'

export default function NewJobPage() {
  return (
    <form action={createJob} style={{ padding: 24 }}>
      <h1>Create Job</h1>

      <input name="pickup_postcode" placeholder="Pickup postcode" required />
      <br />
      <input name="dropoff_postcode" placeholder="Dropoff postcode" required />
      <br />

      <button type="submit">Create</button>
    </form>
  )
}
