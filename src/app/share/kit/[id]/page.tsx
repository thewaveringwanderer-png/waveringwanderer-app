import { createClient } from '@supabase/supabase-js'

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from('identity_kits')
    .select('*')
    .eq('public', true)
    .eq('public_id', params.id)
    .single()

  if (error || !data) {
    return <main className="min-h-screen bg-black text-white p-10">Not found or not public.</main>
  }

  const r = typeof data.result === 'string' ? JSON.parse(data.result) : data.result
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold text-ww-violet">Artist Identity Kit — {data.inputs?.artistName || 'Untitled'}</h1>
      <pre className="mt-6 whitespace-pre-wrap text-white/80">{JSON.stringify(r, null, 2)}</pre>
    </main>
  )
}
