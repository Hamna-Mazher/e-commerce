function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] flex items-center justify-center">

      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/25 blur-[150px] animate-pulse"></div>

<div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/25 blur-[150px] animate-pulse"></div>

<div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px] animate-pulse"></div>
<div className="absolute top-20 left-32 h-2 w-2 rounded-full bg-white/40"></div>

<div className="absolute top-60 right-40 h-1.5 w-1.5 rounded-full bg-blue-400"></div>

<div className="absolute bottom-24 left-72 h-2 w-2 rounded-full bg-cyan-400"></div>

<div className="absolute bottom-40 right-72 h-1.5 w-1.5 rounded-full bg-purple-400"></div>

<div className="absolute top-1/2 left-16 h-1 w-1 rounded-full bg-white"></div>

<div className="absolute right-20 top-1/3 h-2 w-2 rounded-full bg-blue-300"></div>
      {/* Grid */}

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      {children}

    </div>
  );
}

export default AuthLayout;