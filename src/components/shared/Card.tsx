import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      {...props} // 🌟 This spreads onClick and other props to the div
      className={`bg-surface rounded-2xl border border-white/5 shadow-lg p-5 transition-all ${
        props.onClick ? "cursor-pointer active:scale-[0.98]" : ""
      } ${className || ""}`}
    >
      {children}
    </div>
  );
}