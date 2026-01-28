export default function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full h-11 px-4 rounded-full bg-[#222] border border-white/10 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-violet-600 transition ${className}`}
      {...props}
    />
  )
}
