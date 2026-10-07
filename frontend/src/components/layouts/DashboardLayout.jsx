import Sidebar from "../dashboard/Sidebar";
import Navbar from  "../dashboard/Navbar";

function DashboardLayout({
  children,
  search,
  setSearch,
  showSearch = false,
  
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      <Sidebar />

      <div className="flex-1 ml-64">

     <Navbar
    search={search}
    setSearch={setSearch}
    showSearch={showSearch}
/>

        <main className="p-8">

          {children}

        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;