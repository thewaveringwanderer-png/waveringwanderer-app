'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

// --- dashboard page begins here ---
export default function DashboardPage() {
  const [form, setForm] = useState({
    artistName: '',
    genre: '',
    influences: '',
    brandWords: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Request failed')
      setResult(data.result)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="space-y-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Artist Identity Generator</h1>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <Input name="artistName" placeholder="Artist name" onChange={onChange} className="md:col-span-2" />
          <Input name="genre" placeholder="Genre (e.g., Alt R&B)" onChange={onChange} />
          <Input name="influences" placeholder="Influences (comma-separated)" onChange={onChange} />
          <Input name="brandWords" placeholder="Brand keywords (comma-separated)" onChange={onChange} className="md:col-span-2" />

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              disabled={submitting}
              className="px-6 h-11 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-semibold transition"
            >
              {submitting ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-lg px-4 py-3 border border-red-800 bg-red-900/30 text-red-200">
            {error}
          </div>
        )}
      </Card>

      {result && (
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">✨ Artist Identity Kit</h2>

          {result.brand_essence && (
            <section>
              <h3 className="font-semibold mb-1">Brand Essence</h3>
              <p className="text-white/80">{result.brand_essence}</p>
            </section>
          )}
        </Card>
      )}
    </main>
  )
}







