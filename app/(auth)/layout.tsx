export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-5 bg-primary rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
