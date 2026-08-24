function AuthCard({ children }) {
  return (
    <div
      className="
      animate-fadeUp
      relative
      w-full
      max-w-md
      rounded-[30px]
      border
      border-white/10
      bg-white/10
      backdrop-blur-3xl
      shadow-[0_25px_70px_rgba(0,0,0,0.5)]
      p-8
      transition-all
duration-500
hover:-translate-y-1
hover:shadow-[0_40px_80px_rgba(0,0,0,.65)]
      "
    >
      {children}
    </div>
  );
}

export default AuthCard;