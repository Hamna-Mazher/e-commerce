import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  CalendarDays,
  Sparkles,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
   <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-900 p-6">
      <h1 className="mb-10 text-2xl font-bold">
        Dashboard
      </h1>

     <nav className="flex-1 space-y-3 overflow-y-auto">

        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          end
          className={linkClasses}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        {/* Products */}
        <NavLink
          to="/products"
          className={linkClasses}
        >
          <Package size={20} />
          Products
        </NavLink>

<NavLink
  to="/orders"
  className={linkClasses}
>
  <ShoppingCart size={20} />
  Orders
</NavLink>
        {/* Users - Admin Only */}
        {user?.role === "Admin" && (
          <NavLink
            to="/users"
            className={linkClasses}
          >
            <Users size={20} />
            Users
          </NavLink>
        )}
<NavLink
  to="/meetings"
  className={linkClasses}
>
  <CalendarDays size={20} />
  Meetings
</NavLink>
<NavLink
  to="/chat"
  className={linkClasses}
>
  <Sparkles size={20} />
  AI Assistant
</NavLink>
      </nav>

      <button
        onClick={logout}
        className="absolute bottom-8 left-6 flex items-center gap-3 rounded-xl bg-red-600 px-4 py-3 hover:bg-red-700"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;