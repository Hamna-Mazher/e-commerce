function Button({ children, type = "button" }) {
  return (
    <button
      type={type}
      className="
relative
overflow-hidden
w-full
rounded-xl
bg-gradient-to-r
from-blue-600
to-indigo-600
py-4
font-semibold
text-white
transition-all
duration-300
hover:scale-[1.02]
hover:shadow-xl
active:scale-95
"
    >
      {children}
    </button>
  );
}

export default Button;