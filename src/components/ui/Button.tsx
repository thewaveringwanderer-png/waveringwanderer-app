type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className = "", ...props }: Props) {
  return (
    <button
      className={`bg-ww-violet hover:bg-ww-violetLite text-white font-semibold px-6 py-3 rounded-pill shadow-ww transition ${className}`}
      {...props}
    />
  );
}


