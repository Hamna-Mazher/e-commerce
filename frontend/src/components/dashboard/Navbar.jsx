import { Search } from "lucide-react";

function Navbar({
    search,
    setSearch,
    showSearch,
}) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-8 py-5 backdrop-blur-md">

     <div className="relative w-80">
  <Search
    size={18}
    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
  />
{showSearch && (
  <input
    type="text"
    placeholder="Search products..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="
      w-full
      rounded-xl
      border
      border-slate-700
      bg-slate-800
      py-3
      pl-11
      pr-4
      text-white
      placeholder:text-slate-400
      outline-none
      transition
      duration-200
      focus:border-blue-500
      focus:ring-2
      focus:ring-blue-500/20
    "
  />
)}
</div>

      <div className="text-right">

        <h2 className="font-semibold">
          {user?.name}
        </h2>

        <p className="text-sm text-gray-400">
          {user?.role}
        </p>

      </div>

    </header>
  );
}

export default Navbar;