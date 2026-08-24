import { Eye } from "lucide-react";
import { useState } from "react";

function InputField({
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  name,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="relative mb-5">

      {/* Left Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>

      <input
        type={
          isPassword
            ? showPassword
              ? "text"
              : "password"
            : type
        }
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
      className="
w-full
rounded-2xl
border
border-white/15
bg-white/[0.07]
py-4
pl-12
pr-12
text-white
placeholder:text-gray-500
outline-none
backdrop-blur-lg
transition-all
duration-300
hover:bg-white/10
focus:bg-white/10
focus:border-blue-500
focus:ring-4
focus:ring-blue-500/20
"
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          {showPassword ? <Eye size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
}

export default InputField;