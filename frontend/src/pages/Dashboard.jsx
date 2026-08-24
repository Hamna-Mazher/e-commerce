import DashboardLayout from "../components/layouts/DashboardLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsCard from "../components/dashboard/StatsCard";
import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import {
  Package,
  Users,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";
import RecentProducts from "../components/dashboard/RecentProducts";
function Dashboard() {
  const [products, setProducts] = useState([]);
const [stats, setStats] = useState({
  totalProducts: 0,
  totalCategories: 0,
});
useEffect(() => {
  loadDashboard();
}, []);

const loadDashboard = async () => {
  try {
    const res = await getProducts(1);

    const productList = res.data.products;

    setProducts(productList);

    const uniqueCategories = [
      ...new Set(productList.map((p) => p.category)),
    ];

    setStats({
      totalProducts: res.data.totalProducts,
      totalCategories: uniqueCategories.length,
    });

  } catch (err) {
    console.log(err);
  }
};
  return (
    <DashboardLayout>

      <DashboardHeader />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package className="text-white" />}
          color="bg-blue-600"
        />

        <StatsCard
          title="Users"
          value="5"
          icon={<Users className="text-white" />}
          color="bg-green-600"
        />

        <StatsCard
          title="Categories"
         value={stats.totalCategories}
          icon={<LayoutGrid className="text-white" />}
          color="bg-purple-600"
        />

        <StatsCard
          title="Admins"
          value="1"
          icon={<ShieldCheck className="text-white" />}
          color="bg-red-600"
        />
     
      </div>
 <RecentProducts products={products} />
    </DashboardLayout>
  );
}

export default Dashboard;