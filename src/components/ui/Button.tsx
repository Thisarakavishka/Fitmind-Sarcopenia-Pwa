interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const baseStyles =
    "px-6 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-primary hover:bg-primary-hover text-black shadow-[0_0_20px_rgba(45,212,191,0.2)]", // Neon glow effect
    secondary: "bg-white/10 hover:bg-white/20 text-white",
    ghost: "bg-transparent hover:bg-white/5 text-muted hover:text-white",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
