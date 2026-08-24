import { ArrowRight } from "lucide-react";

function LoginButton({
  children = "Login",
  type = "submit",
}) {
  return (
    <button
      type={type}
      className="
      group
      relative
      overflow-hidden
      flex
      w-full
      items-center
      justify-center
      gap-2
      rounded-2xl
      bg-gradient-to-r
      from-blue-600
      via-indigo-600
      to-violet-600
      py-4
      font-semibold
      text-white
      transition-all
      duration-500
      hover:-translate-y-1
      hover:shadow-[0_0_40px_rgba(99,102,241,.55)]
      active:scale-95
      "
    >
      <span
        className="
        absolute
        left-[-120%]
        top-0
        h-full
        w-24
        rotate-12
        bg-white/20
        blur-md
        transition-all
        duration-700
        group-hover:left-[120%]
        "
      />

      <span className="relative z-10 flex items-center gap-2">
        {children}
        <ArrowRight size={18} />
      </span>
    </button>
  );
}

export default LoginButton;