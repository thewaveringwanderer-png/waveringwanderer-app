export default function Card({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl bg-[#222] border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm ${className}`}
      {...props}
    />
  )
}
