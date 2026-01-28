import { createClient } from '@supabase/supabase-js'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
    const { id } = await params

  const { data, error } = await supabase
    .from('campaign_concepts')
    .select('*')
    .eq('public', true)
        .eq('public_id', id)

    .single()

  if (error || !data) {
    return <main className="min-h-screen bg-black text-white p-10">Not found or not public.</main>
  }

  const parsed = typeof data.concepts === 'string' ? JSON.parse(data.concepts) : data.concepts
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold text-ww-violet">Campaign Kit — {data.inputs?.artistName || 'Untitled'}</h1>
      <pre className="mt-6 whitespace-pre-wrap text-white/80">{JSON.stringify(parsed, null, 2)}</pre>
    </main>
  )
}
