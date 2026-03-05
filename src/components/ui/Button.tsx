import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline"; // Added 'outline'
  size?: "default" | "sm" | "icon"; // Added 'size' to control height
}

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "default",
  ...props
}: ButtonProps) {
  // Base styles: Flex, rounded corners, font
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  // Color Variants
  const variants = {
    primary: "bg-primary text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(45,212,191,0.2)]", 
    secondary: "bg-white/10 text-white hover:bg-white/20",
    ghost: "bg-transparent text-muted hover:text-white hover:bg-white/5",
    outline: "border border-white/20 bg-transparent text-white hover:bg-white/10", // New for Admin
  };

  // Size Variants (The key to making it look "Pro")
  const sizes = {
    default: "h-10 px-4 py-2 text-sm", // Smaller than your old h-12
    sm: "h-8 px-3 text-xs",           // Very small (for lists/tables)
    icon: "h-10 w-10 p-0",            // For square icon buttons
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}