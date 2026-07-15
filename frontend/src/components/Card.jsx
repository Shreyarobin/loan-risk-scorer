export default function Card({ children, className = "", light = false, ...props }) {
  return (
    <div
      className={`rounded-card border ${
        light
          ? "bg-white border-line-light"
          : "bg-ink-2 border-line shadow-panel"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
