import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-24 space-y-8">
      <h1 className="text-5xl font-bold">Wavering Wanderers</h1>
      <p className="text-white/70 text-lg">
        Your AI music marketing platform starts here.
      </p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-semibold transition"
        >
          Log in / Sign up
        </Link>
        <Link
  href="/home"
  className="px-6 py-3 rounded-full border border-violet-600 hover:bg-violet-600 hover:text-white font-semibold transition"
>
  Creator Hub
</Link>

      </div>
    </main>
  )
}

