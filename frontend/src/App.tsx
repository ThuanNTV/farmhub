import { Routes, Route } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users/Users";
import Products from "@/pages/products/Products";
import Customers from "@/pages/Customer/Customers";
import Categories from "@/pages/Categories/categories";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="customers" element={<Customers />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        {/* Thêm các route khác */}
      </Route>
    </Routes>
  );
}
