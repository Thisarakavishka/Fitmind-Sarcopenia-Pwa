export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface rounded-2xl border border-white/5 shadow-lg p-5 ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
}
