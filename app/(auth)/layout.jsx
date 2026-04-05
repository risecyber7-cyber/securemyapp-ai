export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(234,88,12,0.14),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.12),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,249,241,0.92),rgba(247,245,238,0.96))]" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
