"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Navbar";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalMilk: 0,
    monthlyRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= FETCH DASHBOARD DATA =================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      // ================= API CALLS =================
      const [customersRes, reportsRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/customers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("http://127.0.0.1:8000/reports", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const customersData = await customersRes.json();
      const reportsData = await reportsRes.json();

      // ================= SAFE DATA EXTRACTION =================
      const customers = Array.isArray(customersData)
        ? customersData
        : customersData.data || [];

      const reports = Array.isArray(reportsData)
        ? reportsData
        : reportsData.data || [];

      // ================= CALCULATIONS =================
      const totalCustomers = customers.length;

      const totalMilk = reports.reduce(
        (sum, report) => sum + Number(report.total_liters || 0),
        0
      );

      const monthlyRevenue = reports.reduce(
        (sum, report) => sum + Number(report.total_amount || 0),
        0
      );

      // ================= UPDATE STATE =================
      setStats({
        totalCustomers,
        totalMilk,
        monthlyRevenue,
      });

    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-100">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="p-10 flex-1">

          <h1 className="text-3xl font-bold mb-8">
            Dashboard
          </h1>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-100 text-red-600 p-3 mb-5 rounded">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <p className="text-gray-600">Loading dashboard...</p>
          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* TOTAL CUSTOMERS */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-gray-500 text-sm mb-2">
                  Total Customers
                </h2>

                <p className="text-4xl font-bold text-blue-600">
                  {stats.totalCustomers}
                </p>
              </div>

              {/* TOTAL MILK */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-gray-500 text-sm mb-2">
                  Milk Collected
                </h2>

                <p className="text-4xl font-bold text-green-600">
                  {stats.totalMilk.toFixed(2)} L
                </p>
              </div>

              {/* MONTHLY REVENUE */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-gray-500 text-sm mb-2">
                  Monthly Revenue
                </h2>

                <p className="text-4xl font-bold text-purple-600">
                  ₹{stats.monthlyRevenue.toFixed(2)}
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}