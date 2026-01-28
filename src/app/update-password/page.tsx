import { Suspense } from 'react'
import UpdatePasswordClient from './UpdatePasswordClient'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>}>
      <UpdatePasswordClient />
    </Suspense>
  )
}
