export default function Button({
  children,
  variant = "primary",
  size = "default",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-card focus-visible:outline-2 focus-visible:outline-signal disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-signal text-ink hover:bg-signal-dim hover:-translate-y-[1px] active:translate-y-0",
    secondary: "bg-transparent text-paper border border-line hover:border-ink-muted",
    ghost: "bg-transparent text-ink-muted hover:text-paper",
    light: "bg-ink text-paper hover:bg-ink-2",
  };

  const sizes = {
    default: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
    sm: "px-3.5 py-1.5 text-xs",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
